import { NestedStack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NestedResourcesProps } from '../../interfaces/application';
import { IVpc, Vpc } from 'aws-cdk-lib/aws-ec2';

export class VPCResource extends NestedStack {
  public mainVpc: IVpc;

  public constructor(scope: Construct, id: string, props: NestedResourcesProps) {
    super(scope, id, props);

    const stackName = props.configuration.stackName;
    const mainVpcName = `${stackName}-main-vpc`;
    this.mainVpc = new Vpc(this, mainVpcName, {
      cidr: '10.0.0.0/16',
      vpcName: mainVpcName,
      maxAzs: 1,
    });
  }
}
