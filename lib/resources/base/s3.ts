import * as cdk from 'aws-cdk-lib';
import { Bucket, ObjectOwnership, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { S3ResourceProps } from '../../interfaces/base';

export class S3Resource extends Construct {
  public s3Bucket: Bucket;

  public constructor(scope: Construct, id: string, props: S3ResourceProps) {
    super(scope, id);

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
