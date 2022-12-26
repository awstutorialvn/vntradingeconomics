import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { NestedStack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AuthorizationType, CfnAuthorizer } from 'aws-cdk-lib/aws-apigateway';

import { env } from '../../../env/cdk';
import { CognitoResource } from './cognito';
import { ApplicationResourcesProps } from '../../interfaces/application';

export class ApiGatewayResource extends NestedStack {
    private cognito: CognitoResource;

    public api: apigateway.RestApi;

    public cognitoAuthorizer: { authorizerId: string; authorizationType: AuthorizationType };

    public constructor(scope: Construct, id: string, props: ApplicationResourcesProps) {
        super(scope, id, props);

        const stackName = props.configuration.stackName;
        this.api = new apigateway.RestApi(this, `${stackName}-api`, {
            description: 'video linked api gateway',
            deployOptions: {
                stageName: env.STAGE_NAME,
            },
            // 👇 enable CORS
            defaultCorsPreflightOptions: {
                allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
                allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                allowCredentials: true,
                allowOrigins: ['*'],
            },
        });
        this.cognito = new CognitoResource(this, 'Cognito', props);

        // 👇 create an Output for the API URL
        new cdk.CfnOutput(this, 'apiUrl', { value: this.api.url });

        const cognitoAuthorizerName = `${stackName}-cognito-authorizer`;
        const cognitoCfnAuthorizer = new CfnAuthorizer(this, cognitoAuthorizerName, {
            restApiId: this.api.restApiId,
            name: cognitoAuthorizerName,
            type: 'COGNITO_USER_POOLS',
            identitySource: 'method.request.header.Authorization',
            providerArns: [this.cognito.userPool.userPoolArn],
        });

        new cdk.CfnOutput(this, 'cognitoAuthorizerName', { value: cognitoCfnAuthorizer.name });

        this.cognitoAuthorizer = {
            authorizerId: cognitoCfnAuthorizer.ref,
            authorizationType: AuthorizationType.COGNITO,
        };
    }
}
