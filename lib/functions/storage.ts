import * as path from 'path';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Duration, NestedStack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { env } from '../../env/cdk';
import { StorageStackProps } from '../interfaces/application';

export class StorageStack extends Construct {
  public constructor(scope: Construct, id: string, props: StorageStackProps) {
    super(scope, id);

    const appResources = props.appResources;
    const apiGateway = appResources.apiGateway;
    const api = apiGateway.api;
    const stackName = props.configuration.stackName;
    const dependency = props.baseResources.dependency;

    const presignedPutUrlFunctionName = `${stackName}-presigned-put-url`;
    const presignedPutUrlFunction = new NodejsFunction(this, presignedPutUrlFunctionName, {
      functionName: presignedPutUrlFunctionName,
      runtime: Runtime.NODEJS_16_X,
      handler: 'presignedPutUrlHandler',
      entry: path.join(__dirname, `../../src/api/storage/index.ts`),
      bundling: {
        minify: env.isProduction,
        externalModules: [...dependency.coreExternalModules],
      },
      environment: props.configuration.environment,
      layers: [dependency.coreLayer],
      timeout: Duration.seconds(60),
    });

    props.baseResources.s3.s3Bucket.grantPut(presignedPutUrlFunction);
    const storage = api.root.getResource('storage') ?? api.root.addResource('storage');
    const presignedUrl = storage.getResource('presigned-url') ?? storage.addResource('presigned-url');
    const presignedPutUrl = presignedUrl.getResource('put-object') ?? presignedUrl.addResource('put-object');

    // 👇 integrate GET /health-check with healthCheckFunc
    presignedPutUrl.addMethod('GET', new apigateway.LambdaIntegration(presignedPutUrlFunction, { proxy: true }), {
      authorizer: apiGateway.cognitoAuthorizer,
    });
  }
}
