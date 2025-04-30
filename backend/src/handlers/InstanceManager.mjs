import { EC2Client, StartInstancesCommand, StopInstancesCommand, RebootInstancesCommand } from "@aws-sdk/client-ec2";
import {minominaCode} from "/opt/nodejs/node_modules/minomina-layer/index.mjs";

const REGION = process.env.REGION;
const ec2Client = new EC2Client({ region: REGION });
const SENDER_EMAIL = process.env.FROM;
const retryURL = process.env.SQS

export const InstanceHandler = async (event, context) => {
    const instance = event.Use.Instance;
    const RECIPIENTS = event.Use.email; 
    const instanceId = instance.InstanceId;
    const instanceName = instance.InstanceName;
    const action = event.Use.action;
    
    if (action === 'Start') {
        return await handleStartInstance(instanceId, instanceName, RECIPIENTS, event);
    } else if (action === 'Stop') {
        return await handleStopInstance(instanceId, instanceName,RECIPIENTS, event);
    } else if (action === 'Reboot') {
        return await handleRebootInstance(instanceId, instanceName,RECIPIENTS, event);
    }
};

async function handleStartInstance(instanceId, instanceName, RECIPIENTS, event) {
    try {
        const commandParams = {
            InstanceIds: [instanceId]
        };
        const command = new StartInstancesCommand(commandParams);
        await ec2Client.send(command);

        const emailParam ={
            SENDER_EMAIL: SENDER_EMAIL, 
            RECIPIENTS: RECIPIENTS,
            subject: `AWS EC2 Instances Manual State Change - ${instanceName !== '' && instanceName !== null && instanceName !== '<empty>' ? `Instance ${instanceId} / ${instanceName} - Start Notification` : `Instance ${instanceId} - Start Notification`}`, 
            body: instanceName !== '' && instanceName !== null && instanceName !== '<empty>' ? `This is a message for instance ${instanceId} / ${instanceName}. The instance has been successfully queued for the Start process.` : `This is a message for instance ${instanceId}. The instance has been successfully queued for the Start process.`
        };
        await minominaCode.sendEmail(emailParam);
        
    } catch (err) {
        if(!event.Retry){
            event.Retry = true;
           const retryParams = {
              QueueUrl: retryURL,
              MessageBody: JSON.stringify({
                source: "Instance Manager Function Error",
                payload: event,
                reason: `Error Starting EC2: ${err.message}`
                })
            }
    await minominaCode.retryFunction(retryParams);
        }else{
        const emailParam ={
            SENDER_EMAIL: SENDER_EMAIL, 
            RECIPIENTS: RECIPIENTS,
            subject: `AWS EC2 Instances Manual State Change - ${ instanceName !== '' && instanceName !== null && instanceName !== '<empty>' ? `Instance ${instanceId} / ${instanceName} - Start Notification` : `Instance ${instanceId} - Start Notification`}`, 
            body: instanceName !== '' && instanceName !== null && instanceName !== '<empty>' ? `This is a message for instance ${instanceId} / ${instanceName}. Sorry, the instance could not be successfully queued for the Start process.` : `This is a message for instance ${instanceId}. Sorry, the instance could not be successfully queued for the Start process.`
        };
        await minominaCode.sendEmail(emailParam);
        }
    }}
    
    async function handleStopInstance(instanceId, instanceName, RECIPIENTS, event) {
    try {
        const commandParams = {
            InstanceIds: [instanceId] // InstanceIds must be an array of instance IDs
        };
        const command = new StopInstancesCommand(commandParams);
        await ec2Client.send(command);
        const emailParam ={
            SENDER_EMAIL: SENDER_EMAIL, 
            RECIPIENTS: RECIPIENTS,
          subject: `AWS EC2 Instances Manual State Change - ${instanceName !== '' && instanceName !== null && instanceName !== '<empty>' ? `Instance ${instanceId} / ${instanceName} - Stop Notification` : `Instance ${instanceId} - Stop Notification`}`, 
          body: instanceName !== '' && instanceName !== null && instanceName !== '<empty>' ? `This is a message for instance ${instanceId} / ${instanceName}. The instance has been successfully queued for the stop process.` : `This is a message for instance ${instanceId}. The instance has been successfully queued for the stop process.`
      };
      await minominaCode.sendEmail(emailParam);
               
    } catch (err) {
                if(!event.Retry){
            event.Retry = true;
           const retryParams = {
              QueueUrl: retryURL,
              MessageBody: JSON.stringify({
                source: "Instance Manager Function Error",
                payload: event,
                reason: `Error Stopping EC2: ${err.message}`
                })
            }
    await minominaCode.retryFunction(retryParams);
        }else{
      const emailParam ={
            SENDER_EMAIL: SENDER_EMAIL, 
            RECIPIENTS: RECIPIENTS,
        subject: `AWS EC2 Instances Manual State Change - ${ instanceName !== '' && instanceName !== null && instanceName !== '<empty>' ? `Instance ${instanceId} / ${instanceName} - Stop Notification` : `Instance ${instanceId} - Stop Notification`}`, 
        body: instanceName !== '' && instanceName !== null && instanceName !== '<empty>' ? `This is a message for instance ${instanceId} / ${instanceName}. Sorry, the instance could not be successfully queued for the stop process.` : `This is a message for instance ${instanceId}. Sorry, the instance could not be successfully queued for the stop process.`
    };
    await minominaCode.sendEmail(emailParam);
    }
    }
  }
    
    async function handleRebootInstance(instanceId, instanceName, RECIPIENTS, event) { 
    try {
        const commandParams = {
            InstanceIds: [instanceId] // InstanceIds must be an array of instance IDs
        };
        const command = new RebootInstancesCommand(commandParams);
        await ec2Client.send(command);

        const emailParam ={
            SENDER_EMAIL: SENDER_EMAIL, 
            RECIPIENTS: RECIPIENTS,
          subject: `AWS EC2 Instances Manual State Change - ${instanceName !== '' && instanceName !== null && instanceName !== '<empty>' ? `Instance ${instanceId} / ${instanceName} - Reboot Notification` : `Instance ${instanceId} - Reboot Notification`}`, 
          body: instanceName !== '' && instanceName !== null && instanceName !== '<empty>' ? `This is a message for instance ${instanceId} / ${instanceName}. The instance has been successfully queued for the Reboot process.` : `This is a message for instance ${instanceId}. The instance has been successfully queued for the Reboot process.`
      };
      await minominaCode.sendEmail(emailParam);
    } catch (err) {
            if(!event.Retry){
            event.Retry = true;
           const retryParams = {
              QueueUrl: retryURL,
              MessageBody: JSON.stringify({
                source: "Instance Manager Function Error",
                payload: event,
                reason: `Error Rebooting EC2: ${err.message}`
                })
            }
    await minominaCode.retryFunction(retryParams);
        }else{
      const emailParam ={
            SENDER_EMAIL: SENDER_EMAIL, 
            RECIPIENTS: RECIPIENTS,
        subject: `AWS EC2 Instances Manual State Change - ${ instanceName !== '' && instanceName !== null && instanceName !== '<empty>' ? `Instance ${instanceId} / ${instanceName} - Reboot Notification` : `Instance ${instanceId} - Reboot Notification`}`, 
        body: instanceName !== '' && instanceName !== null && instanceName !== '<empty>' ? `This is a message for instance ${instanceId} / ${instanceName}. Sorry, the instance could not be successfully queued for the Reboot process.` : `This is a message for instance ${instanceId}. Sorry, the instance could not be successfully queued for the Reboot process.`
    };
    await minominaCode.sendEmail(emailParam);
    }
    }
  }