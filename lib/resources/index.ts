import { Construct } from 'constructs';
import { ApplicationResourcesProps } from '../interfaces/application';
import { ApiGatewayResource } from './app/apiGateway';
import { DependencyResource } from './base/dependency';
import { DynamoDBResource } from './base/dynamoDB';
import { S3Resource } from './base/s3';
import { SQSResource } from './base/sqs';
import { BaseResourcesProps } from '../interfaces/base';

export class BaseResources extends Construct {
  public s3: S3Resource;

  public sqs: SQSResource;

  public dynamoDB: DynamoDBResource;

  public dependency: DependencyResource;

  public constructor(scope: Construct, id: string, props: BaseResourcesProps) {
    super(scope, id);

    const { configuration } = props;

    this.dynamoDB = new DynamoDBResource(this, 'DynamoDB', { configuration });
    this.s3 = new S3Resource(this, 'S3Bucket', { configuration });
    this.dependency = new DependencyResource(this, 'Dependency', { configuration });
    // this.sqs = new SQSResource(this, 'SQS', { configuration });
  }
}

export class AppResources extends Construct {
  public apiGateway: ApiGatewayResource;

  constructor(scope: Construct, id: string, props: ApplicationResourcesProps) {
    super(scope, id);

    this.apiGateway = new ApiGatewayResource(this, 'ApiGateway', props);
  }
}
