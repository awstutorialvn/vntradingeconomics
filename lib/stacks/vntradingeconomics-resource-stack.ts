import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { getConfiguration } from '../resources/utils';
import { S3Resource } from '../resources/s3';
import { CognitoResource } from '../resources/cognito';
import { VPCResource } from '../resources/vpc';

export class VntradingeconomicsResourceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const configuration = getConfiguration(props);
    const resourceProps = { configuration };

    const vcpResource = new VPCResource(this, 'VPCResource', resourceProps);
    const s3Resource = new S3Resource(this, 'S3Resource', resourceProps);
    const cognitoResource = new CognitoResource(this, 'CognitoResource', resourceProps);
  }
}
