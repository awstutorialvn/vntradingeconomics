import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { NestedStack } from 'aws-cdk-lib';
import { AccountRecovery, UserPool, UserPoolClient, UserPoolClientIdentityProvider } from 'aws-cdk-lib/aws-cognito';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

import { env } from '../../../env/cdk';
import { ApplicationResourcesProps } from '../../interfaces/application';

export class CognitoResource extends NestedStack {
    public userPool: UserPool;

    public userPoolClient: UserPoolClient;

    public constructor(scope: Construct, id: string, props: ApplicationResourcesProps) {
        super(scope, id, props);

        const stackName = props.configuration.stackName;
        const removalPolicy = props.configuration.removalPolicy;
        const dynamoDBTables = props.baseResources.dynamoDB.tables;

        // User Pool
        const postConfirmationFunName = `${stackName}-post-confirmation`;
        const postConfirmationFunc = new NodejsFunction(this, postConfirmationFunName, {
            functionName: postConfirmationFunName,
            runtime: Runtime.NODEJS_16_X,
            handler: 'handler',
            entry: path.join(__dirname, `../../../src/auth/postConfirmation.ts`),
            bundling: {
                minify: env.isProduction,
                externalModules: [],
            },
            environment: props.configuration.environment,
        });

        dynamoDBTables.User.grantReadWriteData(postConfirmationFunc);
        const userPoolName = `${stackName}-userPool`;
        this.userPool = new UserPool(this, userPoolName, {
            userPoolName: userPoolName,
            selfSignUpEnabled: true,
            standardAttributes: {
                email: { required: true, mutable: true },
                phoneNumber: { required: false },
            },
            signInCaseSensitive: false,
            autoVerify: { email: true },
            signInAliases: { email: true },
            accountRecovery: AccountRecovery.EMAIL_ONLY,
            removalPolicy: removalPolicy,
            passwordPolicy: {
                minLength: 6,
                requireLowercase: true,
                requireDigits: true,
                requireUppercase: true,
                requireSymbols: true,
            },
            lambdaTriggers: {
                postConfirmation: postConfirmationFunc,
            },
        });

        // User Pool Client
        const userPoolClientName = `${stackName}-userPool-client`;
        this.userPoolClient = new UserPoolClient(this, userPoolClientName, {
            userPoolClientName: userPoolClientName,
            userPool: this.userPool,
            authFlows: {
                adminUserPassword: true,
                custom: true,
                userSrp: true,
            },
            supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO],
        });

        // 👇 Outputs
        new cdk.CfnOutput(this, 'userPoolId', {
            value: this.userPool.userPoolId,
        });
        new cdk.CfnOutput(this, 'userPoolClientId', {
            value: this.userPoolClient.userPoolClientId,
        });
    }
}
