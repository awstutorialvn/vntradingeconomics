import * as cdk from 'aws-cdk-lib';

export interface Configuration {
  stackName: string;
  removalPolicy: cdk.RemovalPolicy;
  environment: { [key: string]: string };
}

export interface ResourcesProps {
  configuration: Configuration;
}
