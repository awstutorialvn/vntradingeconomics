import * as path from 'path';
import * as targets from 'aws-cdk-lib/aws-events-targets';

import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Architecture } from 'aws-cdk-lib/aws-lambda';
import { GoFunction } from '@aws-cdk/aws-lambda-go-alpha';

import { ScheduleStackProps } from '../interfaces/application';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

export class ScheduleStack extends Construct {
  public constructor(scope: Construct, id: string, props: ScheduleStackProps) {
    super(scope, id);

    const { configuration, queues } = props;
    const { stackName, environment } = configuration;
    const { stockPriceQueue } = queues;

    const stockPriceScheduleFunctionName = `${stackName}-stock-price-schedule`;
    const stockPriceScheduleFunction = new GoFunction(this, stockPriceScheduleFunctionName, {
      functionName: stockPriceScheduleFunctionName,
      entry: path.join(__dirname, `../../src/schedule/stockPrice/main.go`),
      timeout: Duration.seconds(600),
      architecture: Architecture.ARM_64,
      environment: {
        ...environment,
        STOCK_PRICE_QUEUE_NAME: stockPriceQueue.queueName,
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
      events: [new SqsEventSource(stockPriceQueue)],
    });

    const stockPriceScheduleRuleName = `${stackName}-stock-price-schedule-rule`;
    const rule = new Rule(this, stockPriceScheduleRuleName, {
      ruleName: stockPriceScheduleRuleName,
      schedule: Schedule.expression('cron(0 18 ? * MON-FRI *)'),
      // schedule: Schedule.expression('cron(0/1 * ? * MON-SUN *)'),
    });

    rule.addTarget(new targets.LambdaFunction(stockPriceScheduleFunction));
    stockPriceQueue.grantSendMessages(stockPriceScheduleFunction);
    stockPriceQueue.grantConsumeMessages(stockPriceCrawlerFunction);
  }
}
