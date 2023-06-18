import * as cdk from 'aws-cdk-lib';
import { IVpc, Vpc, IpAddresses, SubnetType } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { ResourcesProps } from '../interfaces/resource';

export class VPCResource extends Construct {
  public vpc: IVpc;

  public constructor(scope: Construct, id: string, props: ResourcesProps) {
    super(scope, id);

    const stackName = props.configuration.stackName ?? 'vntradingeconomics';
    const vpcName = `${stackName}-vpc`;
    this.vpc = new Vpc(this, vpcName, {
      ipAddresses: IpAddresses.cidr('192.168.0.0/16'),
      vpcName: vpcName,
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
