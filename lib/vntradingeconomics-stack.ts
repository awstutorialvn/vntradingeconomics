import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { env } from '../env/cdk';
import { ScheduleStack } from './functions/schedule';
import { HealthCheck } from './functions/health-check';
import { StorageStack } from './functions/storage';
import { ApplicationProps, ApplicationResourcesProps, Configuration } from './interfaces/application';
import { AppResources, BaseResources } from './resources';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

const getConfiguration = (props: cdk.StackProps): Configuration => {
  const stackName = props.stackName ?? 'video-linked';
  const configuration: Configuration = {
    stackName: props.stackName ?? 'video-linked',
    removalPolicy: env.isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    environment: {
      STACK_NAME: stackName,
      NODE_ENV: env.NODE_ENV,
      REGION: env.REGION,
      S3_MAIN_PREFIX: env.S3_MAIN_PREFIX,
    },
  };

  return configuration;
}

export class VntradingeconomicsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const configuration = getConfiguration(props);

    // init base resource
    const baseResources = new BaseResources(this, 'baseResources', { configuration });
    configuration.environment.S3_BUCKET_NAME = baseResources.s3.s3Bucket.bucketName;

    const applicationResourcesProps: ApplicationResourcesProps = {
      configuration,
      baseResources,
    };

    // init app resource
    const appResources = new AppResources(this, 'appResources', applicationResourcesProps);
    const applicationProps: ApplicationProps = {
      configuration,
      baseResources,
      appResources,
    };

    // init Function Lambda
    new HealthCheck(this, 'healthCheck', applicationProps);
    new StorageStack(this, 'storageStack', applicationProps);
    new ScheduleStack(this, 'scheduleStack', applicationProps);
  }
}
