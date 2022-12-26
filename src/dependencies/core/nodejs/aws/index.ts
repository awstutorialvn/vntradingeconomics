import { config, DynamoDB, S3 } from 'aws-sdk';
import { region } from '../configuration';

config.update({ region });

const dynamoDocClient = new DynamoDB.DocumentClient();
const s3Client = new S3({ signatureVersion: 'v4' });

export { dynamoDocClient, s3Client };
