//function will look for ec2 instance information
//then it will fetch the data from a table in dynamodb
// and from a able inside an html document in an s3 bucket
//it will compare each object and confirm if they have any changes between them
//if there are no difference between them then take the information from the dynamodb
//and compare it to the information inside the html table and if it is the same then make no changes
// if there is a difference between the current ec2 instances info and the dynamo them take the current information
//and the table inside the html document and add the current information to the table and update the s3 document

import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";


const REGION = process.env.REGION;
const ec2Client = new EC2Client({ region: REGION });
const lambdaClient = new LambdaClient({ region: REGION });
const s3 = new S3Client({ region: REGION });

const sesClient = new SESClient({ region: REGION });
const SENDER_EMAIL = process.env.FROM;
const RECIPIENTS = process.env.TO.split(',').map(email => email.trim()); // comma-separated in env

const dynamoClient = new DynamoDBClient({ region: REGION });
const tableName = process.env.INSTANCE_TABLE;
const LAMBDA_NAME = process.env.GET_INSTANCES;
const HISTORY_BUCKET = process.env.BUCKET;

const date = new Date();
const options = {
  timeZone: 'America/Puerto_Rico', // AST (Atlantic Standard Time)
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true
};

const format = new Intl.DateTimeFormat('en-US', options);
const day = format.format(date)
const HISTORY_KEY = `logs/status.minominapr.com-${date.getMonth() + 1}-${date.getDate() > 9 ? date.getDate() : '0' + date.getDate()}-${date.getFullYear()}.html`;

export const handler = async (event, context) => {
    console.log(SENDER_EMAIL)
    console.log(RECIPIENTS)
    console.log('ecotto@')
    await handleComparison();
};

async function handleComparison() {
  
  // await SendEmail()
    try {

    //   //get from ec2
        const command = new DescribeInstancesCommand({});
        const ec2Data = await ec2Client.send(command);
        
        const instances = [];
        for (const reservation of ec2Data.Reservations) {
            for (const instance of reservation.Instances) {
                let instanceName = '';
                const nameTag = instance.Tags.find(tag => tag.Key === 'Name');
                if (nameTag) {
                    instanceName = nameTag.Value;
                }

                const instanceDetails = {
                    InstanceId: instance.InstanceId,
                    InstanceType: instance.InstanceType,
                    InstanceName: instanceName,
                    Status: instance.State.Name,
                    LastChecked: day
                };
                instances.push(instanceDetails);
            }
        }
        
        //comparing the arrays
        const ec2Sorted = instances.sort(sortArrayOfObj('InstanceName'))
        const dynamoSorted = (await retrieveFromTable()).sort(sortArrayOfObj("InstanceName"));
        
         const htmlExists = await objectExists(HISTORY_BUCKET, HISTORY_KEY);

    if (!htmlExists) {
      console.log('📄 HTML file does not exist. Creating new file with EC2 data.');

      // Build a fresh HTML document and append data
      let newHtml = createNewHtmlDocument();
      const newSection = buildNewTableSection(ec2Sorted);
      const updatedHtml = insertNewSection(newHtml, newSection);

      // Upload the new file to S3
      const uploadParams = {
        Bucket: HISTORY_BUCKET,
        Key: HISTORY_KEY,
        Body: updatedHtml,
        ContentType: 'text/html'
      };
      await s3.send(new PutObjectCommand(uploadParams));
      console.log(`✅ New HTML file created at s3://${HISTORY_BUCKET}/${HISTORY_KEY}`);

      // Update DynamoDB and send email
      await invokeTableUpdate();
    } else {
      // 3. If HTML exists, compare and decide
      if (compareArraysOfObj(ec2Sorted, dynamoSorted, 'Status')) {
        console.log('✅ EC2 and DynamoDB match. Sending email.');
      } else {
        console.log('📝 EC2 and DynamoDB differ. Appending update and syncing.');

        await appendToEC2HistoryLog(HISTORY_BUCKET, HISTORY_KEY, ec2Sorted);
        await invokeTableUpdate();
      }
    }
        

        return{
            statusCode: 200,
            body: console.log('done')
        };
    } catch (err) {
        console.error('Error fetching EC2 instances:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Failed to fetch EC2 instances: ${err.message}` })
        };
    }
}

async function objectExists(bucket, key) {
  try {
    await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (err) {
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw err; // Unexpected error
  }
}

function getTwoDigitNumber(num) {
    return ('0' + num).slice(-2);
}

function sortArrayOfObj(property) {
    let sortOrder = 1;
    if (property[0] === '-') {
        sortOrder = -1;
        property = property.substring(1);
    }
    return (a, b) => (a[property] instanceof String ? (a, b) => a[property].localeCompare(b[property], 'es') : ((a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0)) * sortOrder;
}

async function retrieveFromTable() {
    try {
        const results = [];
            const params = {
                TableName: tableName,
                ScanIndexForward: false // Sort descending by default
            };

            const data = await dynamoClient.send(new ScanCommand(params));

            if (data.Items && data.Items.length > 0) {
                for (const item of data.Items) {
                    results.push({
                        InstanceId: item.InstanceId.S,
                        InstanceName: item.InstanceName.S,
                        Status: item.Status.S,
                        LastChecked: item.LastChecked.S
                    });
                }
            } else {
                console.log(`No entries found`);
            }

      return results
      
    } catch (err) {
        console.error(err);
        throw err; // Propagate error for proper error handling at higher levels
    }
};

function compareArraysOfObj(arr1, arr2, ...props) {
  if (arr1.length !== arr2.length) return false;
  
  return arr1.every((obj1, index) => {
    const obj2 = arr2[index];
    return props.every(prop => obj1[prop] === obj2[prop]);
  });
}

async function invokeTableUpdate() {
    try {
        const params = {
            FunctionName: LAMBDA_NAME,
            InvocationType: 'Event'
        };
        const command = new InvokeCommand(params);
        await lambdaClient.send(command);
    } catch (err) {
        console.error('Error invoking session initiator:', err);
        throw err;
    }
}

async function appendToEC2HistoryLog(bucket, key, instances) {
  let html;
  try {
    html = await getObjectText(bucket, key);
    console.log('✅ Existing HTML found. Appending section...');
  } catch (err) {
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
      console.warn('📄 Document not found. Creating a new one...');
      html = createNewHtmlDocument();
    } else {
      console.error('❌ Error fetching HTML:', err);
      throw err;
    }
  }


  const newSection = buildNewTableSection(instances);

  const updatedHtml = insertNewSection(html, newSection);

  const uploadParams = {
    Bucket: bucket,
    Key: key,
    Body: updatedHtml,
    ContentType: 'text/html'
  };

  await s3.send(new PutObjectCommand(uploadParams));
  console.log(`📦 Log updated at s3://${bucket}/${key}`);
}

async function getObjectText(bucket, key) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const { Body } = await s3.send(command);
  return streamToString(Body);
}

function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", chunk => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
}

function buildNewTableSection(instances) {

  let rows = instances.map(instance => `
    <tr>
      <td>${instance.InstanceId}</td>
      <td>${instance.InstanceName}</td>
      <td>${instance.Status}</td>
      <td>${instance.LastChecked}</td>
    </tr>`).join('\n');

  return `
    <h3>Snapshot from ${day}</h3>
    <table>
      <thead>
        <tr>
          <th>Instance ID</th>
          <th>Name</th>
          <th>Status</th>
          <th>Last Status Change</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    <br/>
  `;
}

function insertNewSection(html, sectionHtml) {
  if (html.includes('</body>')) {
    return html.replace('</body>', `${sectionHtml}\n</body>`);
  } else {
    return html + sectionHtml;
  }
}

function createNewHtmlDocument() {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>EC2 Instance History</title>
      <style>
        table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; }
        h3 { font-family: Arial, sans-serif; margin-top: 40px; }
      </style>
    </head>
    <body>
      <h1>EC2 Instance History Log</h1>
    </body>
    </html>
  `;
}