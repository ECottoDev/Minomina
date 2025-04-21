import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const REGION = process.env.REGION;
const lambdaClient = new LambdaClient({ region: REGION });
const GET_INSTANCES = process.env.GET_INSTANCES;
const START_INSTANCES = process.env.START_INSTANCES;
const STOP_INSTANCES = process.env.STOP_INSTANCES;
const REBOOT_INSTANCES = process.env.REBOOT_INSTANCES;
const LOGIN = process.env.LOGIN;
const LOGOUT = process.env.LOGOUT;
const VERIFY = process.env.VERIFY;
const DATA_EVAL = process.env.DATA_EVAL;
const TEST = process.env.TEST_SES;

export const apiHandler = async (event, context) => {
    try {
        const method = event.requestContext.http.method;
        const { Use, Key } = JSON.parse(event.body);

        if (Key === 'update')
            return await getInstanceStates();
        else if (Key === 'start')
            return await startInstance(Use);
        else if (Key === 'stop')
            return await stopInstance(Use);
        else if (Key === 'reboot')
            return await rebootInstance(Use);
        else if (Key === 'login')
            return await login(Use);
        else if (Key === 'logout')
            return await logout(Use);
        else if (Key === 'verify')
            return await verifySession(Use);


    } catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    }
};

async function evaluate() {
    try {
        const params = {
            FunctionName: DATA_EVAL,
            InvocationType: 'Event'
        };
        const command = new InvokeCommand(params);
        const result = await lambdaClient.send(command);
    } catch (err) {
        console.error('Error invoking session initiator:', err);
        throw err;
    }
}
async function getInstanceStates() {
    try {
        await evaluate()
        const params = {
            FunctionName: GET_INSTANCES,
            InvocationType: 'RequestResponse',
            Payload: JSON.stringify({}),
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

async function startInstance(Use) {
    try {
        const params = {
            FunctionName: START_INSTANCES,
            InvocationType: 'Event',
            Payload: JSON.stringify({ Use }),
        };
        const command = new InvokeCommand(params);
        const result = await lambdaClient.send(command);
    } catch (err) {
        console.error('Error invoking session initiator:', err);
        throw err;
    }
}

async function stopInstance(Use) {
    try {
        const params = {
            FunctionName: STOP_INSTANCES,
            InvocationType: 'Event',
            Payload: JSON.stringify({ Use }),
        };
        const command = new InvokeCommand(params);
        const result = await lambdaClient.send(command);
    } catch (err) {
        console.error('Error invoking session initiator:', err);
        throw err;
    }
}

async function rebootInstance(Use) {
    try {
        const params = {
            FunctionName: REBOOT_INSTANCES,
            InvocationType: 'Event',
            Payload: JSON.stringify({ Use }),
        };
        const command = new InvokeCommand(params);
        const result = await lambdaClient.send(command);
    } catch (err) {
        console.error('Error invoking session initiator:', err);
        throw err;
    }
}

async function login(Use) {
    try {
        
        const params = {
            FunctionName: LOGIN,
            InvocationType: 'RequestResponse',
            Payload: JSON.stringify({ Use }),
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

async function logout(Use){
    try {
        
        const params = {
            FunctionName: LOGOUT,
            InvocationType: 'RequestResponse',
            Payload: JSON.stringify({ Use }),
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

async function verifySession(Use) {
    try {
        const params = {
            FunctionName: VERIFY,
            InvocationType: 'RequestResponse',
            Payload: JSON.stringify({ Use }),
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