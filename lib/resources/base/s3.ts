import * as cdk from 'aws-cdk-lib';
import { Bucket, ObjectOwnership, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { NestedStack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NestedResourcesProps } from '../../interfaces/application';

export class S3Resource extends NestedStack {
    public s3Bucket: Bucket;

    public constructor(scope: Construct, id: string, props: NestedResourcesProps) {
        super(scope, id, props);

        const stackName = props.configuration.stackName;
        const bucketName = `${stackName}-storage`;
        const removalPolicy = props.configuration.removalPolicy;

        this.s3Bucket = new Bucket(this, bucketName, {
            bucketName: bucketName,
            removalPolicy: removalPolicy,
            autoDeleteObjects: false,
            enforceSSL: true,
            encryption: BucketEncryption.S3_MANAGED,
            objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
        });

        new cdk.CfnOutput(this, 's3Bucket', { value: this.s3Bucket.bucketName });
    }
}
