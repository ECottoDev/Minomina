import { EC2Client, StopInstancesCommand } from "@aws-sdk/client-ec2";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const ec2Client = new EC2Client({ region: process.env.REGION }); // Specify your AWS region from cloud9
const snsClient = new SNSClient({ region: process.env.REGION }); // SNS client
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN; 

export const stopInstanceHandler = async (event, context) => {
    const instance = JSON.parse(event.body);
    const instanceId = instance.Instance.InstanceId
    const instanceName = instance.Instance.InstanceName
    return await handleStopInstance(instanceId, instanceName);
};
async function handleStopInstance(instanceId, instanceName) {
    try {
        const commandParams = {
            InstanceIds: [instanceId] // InstanceIds must be an array of instance IDs
        };
        const command = new StopInstancesCommand(commandParams);
        const data = await ec2Client.send(command);
        const snsMessage = instanceName !== '' && instanceName !== null && instanceName !== '<empty>' ? `This is a message for instance ${instanceId} / ${instanceName}. The instanace has been successfully queued for the stop process.` : `This is a message for instance ${instanceId}. The instanace has been successfully queued for the stop process.` ;
        const snsParams = {
            Message: JSON.stringify(snsMessage),
            TopicArn: SNS_TOPIC_ARN, // ARN of the SNS topic to publish to
            Subject: instanceName !== '' && instanceName !== null && instanceName !== '<empty>' ? `Instance ${instanceId} / ${instanceName} - Stop Notification` : `Instance ${instanceId} - Stop Notification`
        };
        await snsClient.send(new PublishCommand(snsParams));
        return {
            statusCode: 200
        };
    } catch (err) {
        console.error(`Error stopping instance ${instanceId}:`, err);
        const snsMessage = instanceName !== '' && instanceName !== null && instanceName !== '<empty>' ? `This is a message for instance ${instanceId} / ${instanceName}. Sorry, the instanace could not be successfully queued for the stop process.` : `This is a message for instance ${instanceId}. Sorry, the instanace could not be successfully queued for the stop process.` ;
        const snsParams = {
            Message: JSON.stringify(snsMessage),
            TopicArn: SNS_TOPIC_ARN, // ARN of the SNS topic to publish to
            Subject: instanceName !== '' && instanceName !== null && instanceName !== '<empty>' ? `Instance ${instanceId} / ${instanceName} - Stop Notification` : `Instance ${instanceId} - Stop Notification`
        };
        await snsClient.send(new PublishCommand(snsParams));
        return {
            statusCode: 500
        };
    }}
