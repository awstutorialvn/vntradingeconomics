#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { env } from '../env/cdk';
import { VntradingeconomicsStack } from '../lib/vntradingeconomics-stack';
import { VntradingeconomicsRDSStack } from '../lib/stacks/vntradingeconomics-rds-stack';
import { VntradingeconomicsScheduleStack } from '../lib/vntradingeconomics-schedule-stack';
import { VntradingeconomicsResourceStack } from '../lib/stacks/vntradingeconomics-resource-stack';

const app = new cdk.App();
const stackName = env.isProd ? `${env.RESOURCE_STACK_NAME}` : `${env.STACK_NAME}-${env.RESOURCE_STACK_NAME}`;
const envApp = { account: env.CDK_DEFAULT_ACCOUNT, region: env.CDK_DEFAULT_REGION };
const tags = {
	stackName,
	stageName: env.STAGE_NAME,
	resourceStackName: env.RESOURCE_STACK_NAME,
};

const resourceStack = new VntradingeconomicsResourceStack(app, 'VntradingeconomicsResourceStack', {
  env: envApp,
  stackName: `${stackName}-resource`,
  tags,
});

const rdsStack = new VntradingeconomicsRDSStack(app, 'VntradingeconomicsRDSStack', {
  env: envApp,
  stackName: `${stackName}-rds`,
  tags,
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
