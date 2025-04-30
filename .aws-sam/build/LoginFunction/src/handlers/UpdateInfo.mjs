import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import { DynamoDBClient, PutItemCommand, ScanCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import {minominaCode} from "/opt/nodejs/node_modules/minomina-layer/index.mjs";

const REGION = process.env.REGION;
const ec2Client = new EC2Client({ region: REGION });

const dynamoClient = new DynamoDBClient({ region: REGION });
const dynamo = new DynamoDBClient({region: REGION});
const tableName = process.env.INSTANCE_TABLE;

const s3 = new S3Client({ region: REGION });
const HISTORY_BUCKET = process.env.BUCKET;

const SENDER_EMAIL = process.env.FROM;
// const RECIPIENTS = null;
const retryURL = process.env.SQS

export const handler = async (event, context) => {
    const RECIPIENTS = event.Use.email; 

    await handleDescribeInstances(RECIPIENTS);
    return retrieveFromTable();
};

async function handleDescribeInstances(RECIPIENTS) {
  try {
        const command = new DescribeInstancesCommand({});
        const data = await ec2Client.send(command);
        const date = new Date();
        const options = {
          timeZone: 'America/Puerto_Rico', // AST (Atlantic Standard Time)
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        };

        const format = new Intl.DateTimeFormat('en-US', options);
        const day = format.format(date);
        const HISTORY_KEY = `logs/${HISTORY_BUCKET}-${date.getMonth() + 1}-${date.getDate() > 9 ? date.getDate() : '0' + date.getDate()}-${date.getFullYear()}.html`;

        const dynamoSorted = (await retrieveFromTable()).sort(minominaCode.sortArrayOfObj("InstanceName"));
        
        await clearTable();
        
        const instances = [];
        for (const reservation of data.Reservations) {
            for (const instance of reservation.Instances) {
                let instanceName = '';
                const nameTag = instance.Tags.find(tag => tag.Key === 'Name');
                if (nameTag) {
                    instanceName = nameTag.Value;
                }
                
                let status = instance.State.Name;
                if (status === "pending" || status === "initiating"){
                    status = "running";
                }
                else if(status === 'stopping')
                    status = "stopped"
                
                const instanceDetails = {
                    InstanceId: instance.InstanceId,
                    InstanceType: instance.InstanceType,
                    InstanceName: instanceName,
                    Status: status,
                    LastChecked: day
                };
                if (status !== "Terminated" && status !== "terminated") {
                    await putStatus(instanceDetails);
                    instances.push(instanceDetails);
                }
            }
        }

        const ec2Sorted = instances.sort(minominaCode.sortArrayOfObj('InstanceName'));
        const differenceArray = minominaCode.getDifferingElements(ec2Sorted, dynamoSorted, 'Status');

        const htmlExists = await minominaCode.objectExists(HISTORY_BUCKET, HISTORY_KEY);
        
        if (minominaCode.compareArraysOfObj(ec2Sorted, dynamoSorted, 'Status')) {
            console.log('No changes to EC2 Instances State.');
        }else{
            if (!htmlExists) {
            // Build a fresh HTML document and append data
            let newHtml = minominaCode.createNewHtmlDocument();
            const newSection = minominaCode.buildTableRows(differenceArray);
            const updatedHtml = minominaCode.insertRowsIntoTable(newHtml, newSection);
            
            // // Upload the new file to S3
            const uploadParams = {
              Bucket: HISTORY_BUCKET,
              Key: HISTORY_KEY,
              Body: updatedHtml,
              ContentType: 'text/html'
            };
            await s3.send(new PutObjectCommand(uploadParams));
            console.log(`✅ New HTML file created at s3://${HISTORY_BUCKET}/${HISTORY_KEY}`);
            const updateEmailParam ={
                SENDER_EMAIL:SENDER_EMAIL, 
                RECIPIENTS: [RECIPIENTS] ,
                subject: 'AWS EC2 Instances Sudden State Change', 
                body: await minominaCode.getObjectText(HISTORY_BUCKET, HISTORY_KEY)
            };
            await minominaCode.sendEmail(updateEmailParam);
              
              
            }else{
            await minominaCode.appendToEC2HistoryLog(HISTORY_BUCKET, HISTORY_KEY, differenceArray);
            // await invokeTableUpdate();

            const updateEmailParam ={
              SENDER_EMAIL:SENDER_EMAIL, 
              RECIPIENTS: [RECIPIENTS],
              subject: 'AWS EC2 Instances Sudden State Change', 
              body: await minominaCode.getObjectText(HISTORY_BUCKET, HISTORY_KEY)
            };
            await minominaCode.sendEmail(updateEmailParam);
        
        return{
            statusCode: 200,
            body: console.log('done')
        };
      }
    }
  } catch (err) {
    console.error('Error fetching EC2 instances:', err);
    event.Retry = true;
           const retryParams = {
              QueueUrl: retryURL,
              MessageBody: JSON.stringify({
                source: "Update Function Error",
                payload: event,
                reason: `Error Retrieving from EC2: ${err.message}`
                })
            }
    await minominaCode.retryFunction(retryParams);
    return {
        statusCode: 500,
        body: JSON.stringify({ error: `Failed to fetch EC2 instances: ${err.message}` })
    };
  }
}


async function putStatus(instanceDetails) {
    
    const instance= {
            InstanceId: instanceDetails.InstanceId,
            InstanceName: instanceDetails.InstanceName,
            Status: instanceDetails.Status,
            LastChecked: instanceDetails.LastChecked,
            };
    const params = {
        TableName: tableName,
        Item: {
            InstanceId: { S: instance.InstanceId },
            InstanceName: { S: instance.InstanceName },
            Status: { S: instance.Status},
            LastChecked: { S: instance.LastChecked}
        }
    };
    try {
        const data = await dynamo.send(new PutItemCommand(params));
        console.log("Success", data);
    } catch (err) {
        console.log("Error", err);
        event.Retry = true;
           const retryParams = {
              QueueUrl: retryURL,
              MessageBody: JSON.stringify({
                source: "Update Function Error",
                payload: event,
                reason: `Error Updating the Table: ${err.message}`
                })
            }
        await minominaCode.retryFunction(retryParams);
    }
}


async function clearTable() {
    try {
        const scanParams = {
            TableName: tableName,
            ProjectionExpression: "InstanceId"  // Only need the key for deletion
        };
        const data = await dynamo.send(new ScanCommand(scanParams));
        if (data.Items.length === 0) {
            console.log("Table already empty.");
        }
        else{
           for (const item of data.Items) {
            const deleteParams = {
                TableName: tableName,
                Key: {
                    InstanceId: item.InstanceId
                }
            };
            await dynamo.send(new DeleteItemCommand(deleteParams));
        console.log("All items deleted from table.");
        } 
        }
    } catch (err) {
        console.error("Error clearing table:", err);
        event.Retry = true;
           const retryParams = {
              QueueUrl: retryURL,
              MessageBody: JSON.stringify({
                source: "Update Function Error",
                payload: event,
                reason: `Error Clearing the Table: ${err.message}`
                })
            }
        await minominaCode.retryFunction(retryParams);
    }
}

async function retrieveFromTable() {
    try {
        const results = [];
            const params = {
                TableName: process.env.INSTANCE_TABLE,
                ScanIndexForward: false // Sort descending by default
            };

            const data = await dynamoClient.send(new ScanCommand(params));

            if (data.Items && data.Items.length > 0) {
                for (const item of data.Items) {
                    results.push({
                        InstanceId: item.InstanceId.S,
                        InstanceName: item.InstanceName.S,
                        Status: item.Status.S,
                        LastChecked: item.LastChecked.S
                    });
                }
            } else {
                console.log(`No entries found`);
            }

      return results;
    } catch (err) {
        console.error(err);
        event.Retry = true;
           const retryParams = {
              QueueUrl: retryURL,
              MessageBody: JSON.stringify({
                source: "Update Function Error",
                payload: event,
                reason: `Error Retrieving from Table: ${err.message}`
                })
            }
        await minominaCode.retryFunction(retryParams);
    }
}

