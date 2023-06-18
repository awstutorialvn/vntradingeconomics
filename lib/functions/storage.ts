import * as path from 'path';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { env } from '../../env/cdk';
import { StorageStackProps } from '../interfaces/application';

export class StorageStack extends Construct {
  public constructor(scope: Construct, id: string, props: StorageStackProps) {
    super(scope, id);

    const { baseResources, appResources, configuration } = props;
    const { s3, dependency } = baseResources;
    const { apiGateway } = appResources;
    const { environment, stackName } = configuration;
    const api = apiGateway.api;

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
      environment: { ...environment, S3_BUCKET_NAME: s3.s3Bucket.bucketName },
      layers: [dependency.coreLayer],
      timeout: Duration.seconds(60),
    });

    s3.s3Bucket.grantPut(presignedPutUrlFunction);

    const storage = api.root.getResource('storage') ?? api.root.addResource('storage');
    const presignedUrl = storage.getResource('presigned-url') ?? storage.addResource('presigned-url');
    const presignedPutUrl = presignedUrl.getResource('put-object') ?? presignedUrl.addResource('put-object');

    // 👇 integrate GET /health-check with healthCheckFunc
    presignedPutUrl.addMethod('GET', new apigateway.LambdaIntegration(presignedPutUrlFunction, { proxy: true }), {
      authorizer: apiGateway.cognitoAuthorizer,
    });
  }
}
