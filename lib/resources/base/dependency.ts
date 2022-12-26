import path from 'path';
import { NestedStack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Code, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';

import { NestedResourcesProps } from '../../interfaces/application';
import corePackage from '../../../src/dependencies/core/nodejs/package.json';

export class DependencyResource extends NestedStack {
    public coreLayer: LayerVersion;

    public coreExternalModules: string[];

    public constructor(scope: Construct, id: string, props: NestedResourcesProps) {
        super(scope, id, props);

        const stackName = props.configuration.stackName;
        const coreLayerName = `${stackName}-core-layer`;
        this.coreLayer = new LayerVersion(this, coreLayerName, {
            layerVersionName: coreLayerName,
            compatibleRuntimes: [Runtime.NODEJS_16_X],
            code: Code.fromAsset(path.join(__dirname, '../../../src/dependencies/core/nodejs/'), {
                bundling: {
                    user: 'root',
                    image: Runtime.NODEJS_16_X.bundlingImage,
                    command: [
                        'bash',
                        '-xc',
                        [
                            'export npm_config_update_notifier=false',
                            'export npm_config_cache=$(mktemp -d)',
                            'cd $(mktemp -d)',
                            'cp -v /asset-input/package.json .',
                            'npm install yarn -g',
                            'yarn install --production=true',
                            'mkdir -p /asset-output/nodejs',
                            'cp -r ./node_modules /asset-output/nodejs',
                            'cp -v ./yarn.lock /asset-output/nodejs',
                        ].join('&&'),
                    ],
                },
            }),
        });
        this.coreExternalModules = [...Object.keys(corePackage.dependencies), 'aws-sdk'];

        // this.s3Bucket = new Bucket(this, bucketName, {
        //     bucketName: bucketName,
        //     removalPolicy: removalPolicy,
        //     autoDeleteObjects: false,
        //     enforceSSL: true,
        //     encryption: BucketEncryption.S3_MANAGED,
        //     objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
        // });

        // new cdk.CfnOutput(this, 's3Bucket', { value: this.s3Bucket.bucketName });
    }
}
