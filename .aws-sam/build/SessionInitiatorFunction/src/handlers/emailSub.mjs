import { SNSClient, SubscribeCommand } from '@aws-sdk/client-sns';

const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN; // Replace with your custom SNS topic ARN

// Initialize the SNS client
const snsClient = new SNSClient({ region: process.env.REGION });

export const handler = async (event) => {
    try {
        // Parse the email address from the event body
        const { email } = JSON.parse(event.body);
        console.log(email)
        
        // Validate email format using a simple regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid email format.' })
            };
        }

        // Set up the parameters for the SNS Subscribe command
        const params = {
            Protocol: 'EMAIL', // The protocol is email
            Endpoint: email,   // The email address to subscribe
            TopicArn: SNS_TOPIC_ARN // The SNS topic ARN
        };

        // Subscribe the email address to the SNS topic
        const data = await snsClient.send(new SubscribeCommand(params));
        console.log(`Subscription request sent to ${email}. Confirmation pending.`);
        
        // Return a success response
        return {
            statusCode: 200,
            body: JSON.stringify({ message: `A confirmation email has been sent to ${email}. Please confirm your subscription.` })
        };
    } catch (err) {
        console.error('Error subscribing email:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to subscribe email. Please try again later.' })
        };
    }
};
