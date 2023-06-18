import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { env } from '../env/cdk';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { getConfiguration } from './resources/utils';
import { ScheduleApplicationProps } from './interfaces/application';
import { CfnQueue, Queue } from 'aws-cdk-lib/aws-sqs';
import { Duration } from 'aws-cdk-lib';
import { ScheduleStack } from './functions/schedule';

export class VntradingeconomicsScheduleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const configuration = getConfiguration(props);
    const stackName = configuration.stackName;
    const bucketName = `${stackName}-storage`;
    const s3Bucket = Bucket.fromBucketName(this, bucketName, bucketName);
    const stockPriceQueueName = `${stackName}-stock-price.fifo`;
    const removalPolicy = configuration.removalPolicy;

    const stockPriceQueue = new Queue(this, stockPriceQueueName, {
      queueName: stockPriceQueueName,
      fifo: true,
      visibilityTimeout: Duration.seconds(60),
      removalPolicy,
    });
    (stockPriceQueue.node.defaultChild as unknown as CfnQueue).overrideLogicalId(
      stockPriceQueueName.replace(/[+._-]/g, ''),
    );

    const scheduleApplicationProps: ScheduleApplicationProps = {
      configuration,
      s3Bucket,
      queues: {
        stockPriceQueue,
      },
    };

    new ScheduleStack(this, 'scheduleStack', scheduleApplicationProps);
  }
}
