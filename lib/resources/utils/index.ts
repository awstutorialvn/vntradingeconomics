import * as cdk from 'aws-cdk-lib';
import { Configuration } from '../../interfaces/resource';
import { env } from '../../../env/cdk';

export const getConfiguration = (props: cdk.StackProps): Configuration => {
  const stackName = props.stackName ?? 'vntradingeconomics';
  const configuration: Configuration = {
    stackName: stackName,
    stageName: props.tags?.stageName ?? env.STAGE_NAME,
    resourceStackName: props.tags?.resourceStackName ?? env.RESOURCE_STACK_NAME,
    removalPolicy: env.isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    environment: {
      STACK_NAME: stackName,
      NODE_ENV: env.NODE_ENV,
      REGION: env.REGION,
      S3_MAIN_PREFIX: env.S3_MAIN_PREFIX,
    },
  };

  return configuration;
};
