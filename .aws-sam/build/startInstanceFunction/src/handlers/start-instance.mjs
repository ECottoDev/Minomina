import { EC2Client, StartInstancesCommand } from "@aws-sdk/client-ec2";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const ec2Client = new EC2Client({ region: process.env.REGION }); // Specify your AWS region from cloud9
const snsClient = new SNSClient({ region: process.env.REGION }); // SNS client
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN; 

export const startInstanceHandler = async (event, context) => {
    const instance = JSON.parse(event.body);
    const instanceId = instance.Instance.InstanceId
    const instanceName = instance.Instance.InstanceName
    return await handleStartInstance(instanceId, instanceName);
};

async function handleStartInstance(instanceId, instanceName) {
    try {
        const commandParams = {
            InstanceIds: [instanceId] // InstanceIds must be an array of instance IDs
        };
        const command = new StartInstancesCommand(commandParams);
        const data = await ec2Client.send(command);
        const snsMessage = instanceName !== '' && instanceName !== null && instanceName !== '<empty>' ? `This is a message for instance ${instanceId} / ${instanceName}. The instanace has been successfully queued for the start process.` : `This is a message for instance ${instanceId}. The instanace has been successfully queued for the start process.` ;
        const snsParams = {
            Message: JSON.stringify(snsMessage),
            TopicArn: SNS_TOPIC_ARN, // ARN of the SNS topic to publish to
            Subject: instanceName !== '' && instanceName !== null && instanceName !== '<empty>' ? `Instance ${instanceId} / ${instanceName} - Start Notification` : `Instance ${instanceId} - Start Notification`
        };
        await snsClient.send(new PublishCommand(snsParams));
        console.log(`SNS notification sent for instance ${instanceId}`);
        return {
            statusCode: 200
        };
    } catch (err) {
        console.error(`Error Starting instance ${instanceId}:`, err);
        const snsMessage = instanceName !== '' && instanceName !== null && instanceName !== '<empty>' ? `This is a message for instance ${instanceId} / ${instanceName}. Sorry, the instanace could not be successfully queued for the start process.` : `This is a message for instance ${instanceId}. Sorry, the instanace could not be successfully queued for the start process.` ;
        const snsParams = {
            Message: JSON.stringify(snsMessage),
            TopicArn: SNS_TOPIC_ARN,
            Subject: instanceName !== '' && instanceName !== null && instanceName !== '<empty>' ? `Instance ${instanceId} / ${instanceName} - Start Notification` : `Instance ${instanceId} - Start Notification`
        };
        await snsClient.send(new PublishCommand(snsParams));
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Error starting instance ${instanceId}: ${err.message}` })
        };
    }}
    