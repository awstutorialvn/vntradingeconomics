import * as cdk from 'aws-cdk-lib';
import { IVpc, Vpc, IpAddresses, SubnetType } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class VntradingeconomicsVPCStack extends cdk.Stack {
  public rdsVpc: IVpc;

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const stackName = props.stackName ?? 'vntradingeconomics';
    const rdsVpcName = `${stackName}-rds`;
    this.rdsVpc = new Vpc(this, rdsVpcName, {
      ipAddresses: IpAddresses.cidr('192.168.0.0/16'),
      vpcName: rdsVpcName,
      maxAzs: 2,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      natGateways: 0,
      subnetConfiguration: [
        {
          name: 'public-subnet-1',
          subnetType: SubnetType.PUBLIC,
          cidrMask: 20,
        },
        {
          name: 'isolated-subnet-1',
          subnetType: SubnetType.PRIVATE_ISOLATED,
          cidrMask: 18,
        },
      ],
    });
  }
}
