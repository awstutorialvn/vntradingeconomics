import * as cdk from 'aws-cdk-lib';
import { Configuration } from '../../interfaces/application';
import { env } from '../../../env/cdk';

export const getConfiguration = (props: cdk.StackProps): Configuration => {
  const stackName = props.stackName ?? 'video-linked';
  const configuration: Configuration = {
    stackName: props.stackName ?? 'vntradingeconomics',
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
