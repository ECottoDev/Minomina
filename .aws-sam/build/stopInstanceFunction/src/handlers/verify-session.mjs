import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const dynamoClient = new DynamoDBClient({ region: process.env.REGION });
const USER_TABLE = process.env.USER_TABLE || 'YOURDYNAMO';
const TABLE_NAME = process.env.SESSION_TABLE || 'YourDynamoDBTableName';

export async function verifySessionHandler(event) {
    try {
        const { username } = JSON.parse(event.body);
        const getUserParams ={
            TableName: USER_TABLE,
            Key: {
                username: { S: username }
            }};

        const getUserCommand = new GetItemCommand(getUserParams);
        const getUserResult = await dynamoClient.send(getUserCommand);
        const authToken = getUserResult.Item.token.S;
        const getItemParams = {
            TableName: TABLE_NAME,
            Key: {
                authToken: { S: authToken },
            }};
        const getItemCommand = new GetItemCommand(getItemParams);
        const getItemResult = await dynamoClient.send(getItemCommand);

        if (!getItemResult.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Session not found.' }),
            };
        }
        const sessionTime = new Date(getItemResult.Item.sessionTime.S);
        const currentTime = new Date();
        const sessionLife = (currentTime - sessionTime) / (1000 * 60 * 60); // Convert to hours

        if (sessionLife >= 1) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Session has expired.' }),
            };
        }
        const updateItemParams = {
            TableName: TABLE_NAME,
            Key: {
                authToken: { S: authToken },
            },
            UpdateExpression: "SET sessionTime = :sessionTime",
            ExpressionAttributeValues: {
                ":sessionTime": { S: new Date().toISOString() },
            },
            ReturnValues: "UPDATED_NEW",
        };
        const updateItemCommand = new UpdateItemCommand(updateItemParams);
        const updateItemResult = await dynamoClient.send(updateItemCommand);
        // Return a successful response
        return {
            statusCode: 200,
            body: JSON.stringify({success: true}),
        };
    } catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    }
}