import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { DynamoDBClient, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";

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

                const instanceDetails = {
                    InstanceId: instance.InstanceId,
                    InstanceType: instance.InstanceType,
                    InstanceName: instanceName,
                    Status: instance.State.Name,
                };
                if (instanceDetails.Status !== "Terminated" && instanceDetails.Status !== "terminated")
                    await putStatus(instanceDetails);
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
            }
    console.log(instance);
    const params = {
        TableName: tableName,
        Item: {
            InstanceId: { S: instance.InstanceId },
            InstanceName: { S: instance.InstanceName },
            Status: { S: instance.Status},
        }
    };
    try {
        const data = await dynamo.send(new PutItemCommand(params));
        console.log("Success", data);
    } catch (err) {
        console.log("Error", err);
    }
};


async function retrieveFromTable() {
    try {
        const results = [];
            const params = {
                TableName: process.env.INSTANCE_TABLE,
                ScanIndexForward: false // Sort descending by default
            };

            const data = await dynamoClient.send(new ScanCommand(params));
            
            // console.log(data.Items)

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
