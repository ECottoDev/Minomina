import { DynamoDBClient, GetItemCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';

const dynamoClient = new DynamoDBClient({ region: process.env.REGION });
const USERS_TABLE = process.env.USER_TABLE || 'YourUsersTableName';
const SESSION_TABLE = process.env.SESSION_TABLE || 'YourSessionsTableName';

export async function logoutHandler(event) {
    try {
        // const { username } = JSON.parse(event.body);
        const username = event.Use.username;
        // Validate input
        if (!username) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Username is required.' }),
            };
        }
        // Step 1: Retrieve the user from the Users table
        const userResult = await dynamoClient.send(new GetItemCommand({
            TableName: USERS_TABLE,
            Key: { username: { S: username } } // DynamoDB expects keys as objects with a type indicator
        }));
        // Check if the user exists
        if (!userResult.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'User not found.' }),
            };
        }
        // Step 2: Get the authToken from the user
        const authToken = userResult.Item.token.S;
        // Step 3: Verify if the session exists in the Sessions table
        const sessionResult = await dynamoClient.send(new GetItemCommand({
            TableName: SESSION_TABLE,
            Key: { authToken: { S: authToken } }
        }));
        // Check if the session exists
        if (!sessionResult.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Session not found.' }),
            };
        }

        // Step 4: Delete the session from the Sessions table
        await dynamoClient.send(new DeleteItemCommand({
            TableName: SESSION_TABLE,
            Key: { authToken: { S: authToken } }
        }));
        // Return a successful response
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Session destroyed successfully.' }),
        };
    } catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    }
}


