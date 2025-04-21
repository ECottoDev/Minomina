import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { DynamoDBClient, PutItemCommand, ScanCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";

const REGION = process.env.REGION;
const ec2Client = new EC2Client({ region: REGION });
const lambdaClient = new LambdaClient({ region: REGION}); // Specify Lambda region

const dynamoClient = new DynamoDBClient({ region: REGION });
const dynamo = new DynamoDBClient({region: REGION});
const tableName = process.env.INSTANCE_TABLE;

const headers = {
   "Access-Control-Allow-Headers" : "Content-Type",
      "Access-Control-Allow-Origin": "*", //DO NOT USE THIS VALUE IN PRODUCTION - https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-cors.html
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
};
export const handler = async (event, context) => {
    await handleDescribeInstances();
    return retrieveFromTable();
};
function getTwoDigitNumber(num) {
    return ('0' + num).slice(-2);
}

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
const day = format.format(date)

async function handleDescribeInstances() {
    try {
        const command = new DescribeInstancesCommand({});
        const data = await ec2Client.send(command);
        
        for (const reservation of data.Reservations) {
            for (const instance of reservation.Instances) {
                let instanceName = '';
                const nameTag = instance.Tags.find(tag => tag.Key === 'Name');
                if (nameTag) {
                    instanceName = nameTag.Value;
                }
                
                let status = instance.State.Name;
                if (status === "pending" || status === "initiating") {
                    status = "Running";
                }
        
                const instanceDetails = {
                    InstanceId: instance.InstanceId,
                    InstanceType: instance.InstanceType,
                    InstanceName: instanceName,
                    Status: status,
                    LastChecked: day
                };
                
                await clearTable();
                
                if (status !== "Terminated" && status !== "terminated") {
                    await putStatus(instanceDetails);
                }
            }
        }


        return{
            statusCode: 200,
            headers: headers,
            body: console.log('done')
        };
    } catch (err) {
        console.error('Error fetching EC2 instances:', err);
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
            }
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
    }
};


async function clearTable() {
    try {
        const scanParams = {
            TableName: tableName,
            ProjectionExpression: "InstanceId"  // Only need the key for deletion
        };

        const data = await dynamo.send(new ScanCommand(scanParams));

        if (data.Items.length === 0) {
            console.log("Table already empty.");
            return;
        }

        for (const item of data.Items) {
            const deleteParams = {
                TableName: tableName,
                Key: {
                    InstanceId: item.InstanceId
                }
            };
            await dynamo.send(new DeleteItemCommand(deleteParams));
        }

        console.log("All items deleted from table.");
    } catch (err) {
        console.error("Error clearing table:", err);
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
                    });
                }
            } else {
                console.log(`No entries found`);
            }

      return {
          statusCode: 200,
            headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*", //DO NOT USE THIS VALUE IN PRODUCTION - https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-cors.html
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        body: JSON.stringify(results)
      }
    } catch (err) {
        console.error(err);
        throw err; // Propagate error for proper error handling at higher levels
    }
};
