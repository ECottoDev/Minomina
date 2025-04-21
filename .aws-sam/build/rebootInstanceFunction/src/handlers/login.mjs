import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const REGION = process.env.REGION;
const dynamoClient = new DynamoDBClient({ region: REGION });
const lambdaClient = new LambdaClient({ region: REGION });

const TABLE_NAME = process.env.USER_TABLE || 'YourDynamoDBTableName';
const LAMBDA_NAME = process.env.LAMBDA_NAME || 'YourLambdaName';

export const loginHandler = async (event, context) => {
    try {
        
        const username = event.Use.username;
        const password = event.Use.password;
        
        // Validate inputs
        if (!username || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Username and password are required.' }),
            };
        }
        
        const pass = simpleDecrypt(password)
       
        // Verify the user exists in the table
        const userVerificationResult = await verifyUser(username);
        if (userVerificationResult === "Invalid user") {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Invalid user.', valid: false }),
            };
        }
       
        // Retrieve the item from DynamoDB by username
        const data = await getUserData(username);
        if (pass !== data.password.S) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Invalid password.', valid: false  }),
            };
        }
        // Generate a new token and update session life
        const token = await tokenGenerator();
         // Prepare the item to match the required DynamoDB format
       
       
        const params = {
            TableName: TABLE_NAME,
            Key: {
                username: { S: username }, // Primary key
            },
            UpdateExpression: "SET #token = :token",
            ExpressionAttributeNames: {
                "#token": "token",
            },
            ExpressionAttributeValues: {
                ":token": { S: token },
            },
            ReturnValues: "UPDATED_NEW",
        };
        
        const command = new UpdateItemCommand(params);
        const result = await dynamoClient.send(command);

        const sessionLife = new Date();
        sessionLife.setHours(sessionLife.getHours() + 1);

        const sessionDetails = {
            authToken: token,
            sessionTime: sessionLife.toISOString(),
        };

        await invokeSessionInitiator(sessionDetails);
        // Return a successful response with the token
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true }),
        };
    } catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error', valid: false  }),
        };
    }
};

async function verifyUser(username) {
    try {
        const getItemCommand = new GetItemCommand({
            TableName: TABLE_NAME,
            Key: {
                username: { S: username },
            },
        });

        const data = await dynamoClient.send(getItemCommand);

        if (!data.Item) {
            return "Invalid user";
        }

        // Return the username if the user exists
        return data.Item.username.S;
    } catch (error) {
        console.error('Error verifying user:', error);
        throw error;
    }
}

async function getUserData(username) {
    try {
        const getItemCommand = new GetItemCommand({
            TableName: TABLE_NAME,
            Key: {
                username: { S: username },
            },
        });

        const data = await dynamoClient.send(getItemCommand);

        if (!data.Item) {
            throw new Error('User not found');
        }

        return data.Item;
    } catch (error) {
        console.error('Error retrieving user data:', error);
        throw error;
    }
}


async function tokenGenerator(length = 64) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{};:,.<>?/~';
    let token = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        token += characters[randomIndex];
    }
    return token;
}

async function invokeSessionInitiator(sessionDetails) {
    try {
        const params = {
            FunctionName: LAMBDA_NAME,
            InvocationType: 'Event',
            Payload: JSON.stringify({ session: sessionDetails }),
        };
        const command = new InvokeCommand(params);
        await lambdaClient.send(command);
    } catch (err) {
        console.error('Error invoking session initiator:', err);
        throw err;
    }
}

// Simple Caesar Cipher Encryption/Decryption (Insecure)
function simpleEncrypt(text) {
    const shift = 7; // Shift each character by 3
    return text.split('')
        .map(char => String.fromCharCode(char.charCodeAt(0) + shift))
        .join('');
}

function simpleDecrypt(encryptedText) {
    const shift = 7; // Reverse the shift by 3
    return encryptedText.split('')
        .map(char => String.fromCharCode(char.charCodeAt(0) - shift))
        .join('');
}