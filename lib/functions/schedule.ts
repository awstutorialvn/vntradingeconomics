import * as path from 'path';
import * as targets from 'aws-cdk-lib/aws-events-targets';

import { Duration, NestedStack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Architecture } from 'aws-cdk-lib/aws-lambda';
import { GoFunction } from '@aws-cdk/aws-lambda-go-alpha';

import { ApplicationProps, ScheduleStackProps } from '../interfaces/application';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

export class ScheduleStack extends Construct {
  public constructor(scope: Construct, id: string, props: ScheduleStackProps) {
    super(scope, id);

    const stackName = props.configuration.stackName;
    const stockPriceCrawlerQueue = props.baseResources.sqs.stockPriceCrawler;

    const stockPriceScheduleFunctionName = `${stackName}-stock-price-schedule`;
    const stockPriceScheduleFunction = new GoFunction(this, stockPriceScheduleFunctionName, {
      functionName: stockPriceScheduleFunctionName,
      entry: path.join(__dirname, `../../src/schedule/stockPrice/main.go`),
      timeout: Duration.seconds(600),
      architecture: Architecture.ARM_64,
      environment: {
        ...props.configuration.environment,
        STOCK_CRAWLER_QUEUE_NAME: stockPriceCrawlerQueue.queueName,
      },
    });

    const stockPriceCrawlerFunctionName = `${stackName}-stock-price-crawler`;
    const stockPriceCrawlerFunction = new GoFunction(this, stockPriceCrawlerFunctionName, {
      functionName: stockPriceCrawlerFunctionName,
      entry: path.join(__dirname, `../../src/schedule/stockPrice/crawler/main.go`),
      timeout: Duration.seconds(60),
      architecture: Architecture.ARM_64,
      environment: {
        ...props.configuration.environment,
      },
      events: [new SqsEventSource(stockPriceCrawlerQueue)],
    });

    const stockPriceScheduleRuleName = `${stackName}-stock-price-schedule-rule`;
    const rule = new Rule(this, stockPriceScheduleRuleName, {
      ruleName: stockPriceScheduleRuleName,
      schedule: Schedule.expression('cron(0 18 ? * MON-FRI *)'),
      // schedule: Schedule.expression('cron(0/1 * ? * MON-SUN *)'),
    });

    rule.addTarget(new targets.LambdaFunction(stockPriceScheduleFunction));
    props.baseResources.sqs.stockPriceCrawler.grantSendMessages(stockPriceScheduleFunction);
    props.baseResources.sqs.stockPriceCrawler.grantConsumeMessages(stockPriceCrawlerFunction);
  }
}
