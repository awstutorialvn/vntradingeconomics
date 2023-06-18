import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ScheduleStack } from './functions/schedule';
import { HealthCheck } from './functions/health-check';
import { StorageStack } from './functions/storage';
import { ApplicationProps, ApplicationResourcesProps } from './interfaces/application';
import { AppResources, BaseResources } from './resources';
import { getConfiguration } from './resources/utils';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class VntradingeconomicsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const configuration = getConfiguration(props);

    // init base resource
    const baseResources = new BaseResources(this, 'baseResources', { configuration });

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
  }
}
