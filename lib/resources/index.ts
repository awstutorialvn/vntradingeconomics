import { NestedStack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApplicationResourcesProps, NestedResourcesProps } from '../interfaces/application';
import { ApiGatewayResource } from './app/apiGateway';
import { DependencyResource } from './base/dependency';
import { DynamoDBResource } from './base/dynamoDB';
import { S3Resource } from './base/s3';
import { SQSResource } from './base/sqs';

export class BaseResources extends NestedStack {
  public s3: S3Resource;

  public sqs: SQSResource;

  public dynamoDB: DynamoDBResource;

  public dependency: DependencyResource;

  public constructor(scope: Construct, id: string, props: NestedResourcesProps) {
    super(scope, id, props);

    this.dynamoDB = new DynamoDBResource(this, 'DynamoDB', props);
    this.s3 = new S3Resource(this, 'S3Bucket', props);
    this.dependency = new DependencyResource(this, 'Dependency', props);
    this.sqs = new SQSResource(this, 'SQS', props);
  }
}

export class AppResources extends NestedStack {
  public apiGateway: ApiGatewayResource;

  constructor(scope: Construct, id: string, props: ApplicationResourcesProps) {
    super(scope, id, props);

    this.apiGateway = new ApiGatewayResource(this, 'DynamoDB', props);
  }
}
