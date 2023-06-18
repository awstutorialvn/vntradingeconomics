#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { env } from '../env/cdk';
import { VntradingeconomicsStack } from '../lib/vntradingeconomics-stack';
import { VntradingeconomicsVPCStack } from '../lib/stacks/vntradingeconomics-vpc-stack';
import { VntradingeconomicsRDSStack } from '../lib/stacks/vntradingeconomics-rds-stack';
import { VntradingeconomicsScheduleStack } from '../lib/vntradingeconomics-schedule-stack';
import { VntradingeconomicsResourceStack } from '../lib/stacks/vntradingeconomics-resource-stack';

const app = new cdk.App();
// const vpcStack = new VntradingeconomicsVPCStack(app, 'VntradingeconomicsVPCStack', {
//   env: { account: env.CDK_DEFAULT_ACCOUNT, region: env.CDK_DEFAULT_REGION },
//   stackName: env.isProd ? `${env.STACK_NAME}-vpc` : `${env.STAGE_NAME}-${env.STACK_NAME}-vpc`,
//   tags: {
//     applicationName: env.isProd ? env.STACK_NAME : `${env.STAGE_NAME}-${env.STACK_NAME}`,
//   },
// });
const resourceStack = new VntradingeconomicsResourceStack(app, 'VntradingeconomicsResourceStack', {
  env: { account: env.CDK_DEFAULT_ACCOUNT, region: env.CDK_DEFAULT_REGION },
  stackName: env.isProd ? `${env.STACK_NAME}-resource` : `${env.STAGE_NAME}-${env.STACK_NAME}-resource`,
  tags: {
    applicationName: env.isProd ? env.STACK_NAME : `${env.STAGE_NAME}-${env.STACK_NAME}`,
  },
});

const rdsStack = new VntradingeconomicsRDSStack(app, 'VntradingeconomicsRDSStack', {
  env: { account: env.CDK_DEFAULT_ACCOUNT, region: env.CDK_DEFAULT_REGION },
  stackName: env.isProd ? `${env.STACK_NAME}-rds` : `${env.STAGE_NAME}-${env.STACK_NAME}-rds`,
  tags: {
    applicationName: env.isProd ? env.STACK_NAME : `${env.STAGE_NAME}-${env.STACK_NAME}`,
  },
});



// const appStack = new VntradingeconomicsStack(app, 'VntradingeconomicsStack', {
//   /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
//   env: { account: env.CDK_DEFAULT_ACCOUNT, region: env.CDK_DEFAULT_REGION },
//   stackName: env.isProd ? env.STACK_NAME : `${env.STAGE_NAME}-${env.STACK_NAME}`,
//   tags: {
//     applicationName: env.isProd ? env.STACK_NAME : `${env.STAGE_NAME}-${env.STACK_NAME}`,
//   },
// });

// const scheduleStack = new VntradingeconomicsScheduleStack(app, 'VntradingeconomicsScheduleStack', {
//   env: { account: env.CDK_DEFAULT_ACCOUNT, region: env.CDK_DEFAULT_REGION },
//   stackName: env.isProd ? `${env.STACK_NAME}-schedule` : `${env.STAGE_NAME}-${env.STACK_NAME}-schedule`,
//   tags: {
//     applicationName: env.isProd ? env.STACK_NAME : `${env.STAGE_NAME}-${env.STACK_NAME}`,
//   },
// });

// rdsStack.addDependency(vpcStack);
// appStack.addDependency(rdsStack);
// scheduleStack.addDependency(appStack);
