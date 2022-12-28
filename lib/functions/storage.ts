import * as path from 'path';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { NestedStack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

// import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-go';

import { env } from '../../env/cdk';
import { ApplicationProps } from '../interfaces/application';

export class StorageStack extends NestedStack {
    public constructor(scope: Construct, id: string, props: ApplicationProps) {
        super(scope, id, props);

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
