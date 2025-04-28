import { EC2Client, RebootInstancesCommand } from "@aws-sdk/client-ec2";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";


const REGION = process.env.REGION;
const ec2Client = new EC2Client({ region: REGION }); // Specify your AWS region from cloud9
const sesClient = new SESClient({ region: REGION });
const SENDER_EMAIL = process.env.FROM;
const RECIPIENTS = null; 

export const rebootInstanceHandler = async (event, context) => {
    RECIPIENTS = event.Use.email;   
    const instance = event.Use.Instance;
    const instanceId = instance.InstanceId
    const instanceName = instance.InstanceName
   
    return await handleRebootInstance(instanceId, instanceName);
};

async function handleRebootInstance(instanceId, instanceName) { 
    try {
        const commandParams = {
            InstanceIds: [instanceId] // InstanceIds must be an array of instance IDs
        };
        const command = new RebootInstancesCommand(commandParams);
        const data = await ec2Client.send(command);
           const params = {
            Source: SENDER_EMAIL,
            Destination: {
              ToAddresses: RECIPIENTS
            },
            Message: {
              Subject: {
                Data: `AWS EC2 Instances Manual State Change - ${instanceName !== '' && instanceName !== null && instanceName !== '<empty>' ? `Instance ${instanceId} / ${instanceName} - Reboot Notification` : `Instance ${instanceId} - Reboot Notification`}`
              },
              Body: {
                Html: {
                  Data: instanceName !== '' && instanceName !== null && instanceName !== '<empty>' ? `This is a message for instance ${instanceId} / ${instanceName}. The instanace has been successfully queued for the Reboot process.` : `This is a message for instance ${instanceId}. The instanace has been successfully queued for the Reboot process.` 
                }
              }
            }
        }
        
        try {
            const result = await sesClient.send(new SendEmailCommand(params));
            return {
              statusCode: 200,
              body: `Email sent! Message ID: ${result.MessageId}`
            };
          } catch (err) {
            console.error("Error sending email:", err);
            return {
              statusCode: 500,
              body: `Failed to send email: ${err.message}`
            };
          }
    } catch (err) {
        const params = {
            Source: SENDER_EMAIL,
            Destination: {
              ToAddresses: RECIPIENTS
            },
            Message: {
              Subject: {
                Data: `AWS EC2 Instances Manual State Change - ${ instanceName !== '' && instanceName !== null && instanceName !== '<empty>' ? `Instance ${instanceId} / ${instanceName} - Reboot Notification` : `Instance ${instanceId} - Reboot Notification`
     }`
              },
              Body: {
                Html: {
                  Data: instanceName !== '' && instanceName !== null && instanceName !== '<empty>' ? `This is a message for instance ${instanceId} / ${instanceName}. Sorry, the instanace could not be successfully queued for the Reboot process.` : `This is a message for instance ${instanceId}. Sorry, the instanace could not be successfully queued for the Reboot process.`

                }
              }
            }
        }
        
        try {
            const result = await sesClient.send(new SendEmailCommand(params));
            return {
              statusCode: 200,
              body: `Email sent! Message ID: ${result.MessageId}`
            };
          } catch (err) {
            console.error("Error sending email:", err);
            return {
              statusCode: 500,
              body: `Failed to send email: ${err.message}`
            };
          }
    }}