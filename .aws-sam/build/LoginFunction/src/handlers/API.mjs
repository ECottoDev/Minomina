import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const REGION = process.env.REGION;
const lambdaClient = new LambdaClient({ region: REGION });
const GET_INSTANCES = process.env.GET_INSTANCES;
const INSTANCE_MANAGER = process.env.INSTANCE_MANAGER;
const LOGIN = process.env.LOGIN;
const LOGOUT = process.env.LOGOUT;
const VERIFY = process.env.VERIFY;

export const apiHandler = async (event, context) => {
    try {
        if (event.Records){
            const e = (JSON.parse(event.Records[0].body)).payload
            return await handleRedirection(e.Use, e.Key, e.Retry)
        }else{
            const { Use, Key, Retry } = JSON.parse(event.body);
            return await handleRedirection(Use, Key, Retry)
        }
    } catch (error) {
        console.error('Error processing request:', error);
        throw new Error('Error processing request:', error);
    }
};

async function handleRedirection(Use, Key, Retry) {
        if (Key === 'update')
            return await getInstanceStates(Use, Key, Retry);
        else if (Key === 'start' || Key === 'stop' || Key === 'reboot')
            return await manageInstance(Use, Key, Retry);
        else if (Key === 'login')
            return await login(Use, Key, Retry);
        else if (Key === 'logout')
            return await logout(Use, Key, Retry);
        else if (Key === 'verify')
            return await verifySession(Use, Key, Retry);
}

async function getInstanceStates(Use, Key, Retry) {
    try {
        const params = {
            FunctionName: GET_INSTANCES,
            InvocationType: 'RequestResponse',
            Payload: JSON.stringify({ Use, Key, Retry }),
        };
        const command = new InvokeCommand(params);
        const result = await lambdaClient.send(command);
        const payload = JSON.parse(new TextDecoder().decode(result.Payload));
        return payload
    } catch (err) {
        console.error('Error invoking session initiator:', err);
        throw err;
    }
}

async function manageInstance(Use, Key, Retry) {
    try {
        const params = {
            FunctionName: INSTANCE_MANAGER,
            InvocationType: 'Event',
            Payload: JSON.stringify({ Use, Key, Retry }),
        };
        const command = new InvokeCommand(params);
        const result = await lambdaClient.send(command);
    } catch (err) {
        console.error('Error invoking session initiator:', err);
        throw err;
    }
}

async function login(Use, Key, Retry) {
    try {
        
        const params = {
            FunctionName: LOGIN,
            InvocationType: 'RequestResponse',
            Payload: JSON.stringify({ Use, Key, Retry }),
        };
        const command = new InvokeCommand(params);
        const result = await lambdaClient.send(command);
        const payload = JSON.parse(new TextDecoder().decode(result.Payload));
        return JSON.parse(payload.body);
    } catch (err) {
        console.error('Error invoking session initiator:', err);
        throw err;
    }
}

async function logout(Use, Key, Retry){
    try {
        
        const params = {
            FunctionName: LOGOUT,
            InvocationType: 'RequestResponse',
            Payload: JSON.stringify({ Use, Key, Retry }),
        };
        const command = new InvokeCommand(params);
        const result = await lambdaClient.send(command);
        const payload = JSON.parse(new TextDecoder().decode(result.Payload));
        return JSON.parse(payload.body);
    } catch (err) {
        console.error('Error invoking session initiator:', err);
        throw err;
    }
}

async function verifySession(Use, Key, Retry) {
    try {
        const params = {
            FunctionName: VERIFY,
            InvocationType: 'RequestResponse',
            Payload: JSON.stringify({ Use, Key, Retry }),
        };
        const command = new InvokeCommand(params);
        const result = await lambdaClient.send(command);
        const payload = JSON.parse(new TextDecoder().decode(result.Payload));
        return JSON.parse(payload.body);
    } catch (err) {
        console.error('Error invoking session initiator:', err);
        throw err;
    }
}