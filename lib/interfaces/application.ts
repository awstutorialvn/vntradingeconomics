import * as cdk from 'aws-cdk-lib';
import { AppResources, BaseResources } from '../resources';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Queue } from 'aws-cdk-lib/aws-sqs';

export interface Configuration {
  stackName: string;
  stageName: string;
  removalPolicy: cdk.RemovalPolicy;
  environment: { [key: string]: string };
}

export interface ApplicationResourcesProps {
  baseResources: BaseResources;
  configuration: Configuration;
}

export type ApiGatewayResourceProps = ApplicationResourcesProps;

export type CognitoResourceProps = ApplicationResourcesProps;

export interface ApplicationProps extends ApplicationResourcesProps {
  appResources: AppResources;
}

export type HealthCheckProps = ApplicationProps;

export type StorageStackProps = ApplicationProps;

export interface ScheduleApplicationProps {
  configuration: Configuration;
  s3Bucket: IBucket;
  queues: {
    stockPriceQueue: Queue;
  };
}

export type ScheduleStackProps = ScheduleApplicationProps;
