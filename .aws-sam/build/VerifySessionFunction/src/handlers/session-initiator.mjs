import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const REGION = process.env.REGION;
const dynamoClient = new DynamoDBClient({ region: REGION });

const TABLE_NAME = process.env.SESSION_TABLE || 'YourDynamoDBTableName';

export async function handler(event) {
    try {
        const { session } = event;

        if (!session || !session.authToken) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Session data with authToken is required.' }),
            };
        }

        const params = {
            TableName: TABLE_NAME,
            Key: {
                authToken: { S: session.authToken },  // Use authToken as the primary key
            },
            UpdateExpression: "SET sessionTime = :sessionTime",
            ExpressionAttributeValues: {
                ":sessionTime": { S: session.sessionTime },
            },
            ReturnValues: "UPDATED_NEW",
        };

        const command = new UpdateItemCommand(params);
        const result = await dynamoClient.send(command);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Session updated successfully.', updatedAttributes: result.Attributes }),
        };
    } catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    }
}