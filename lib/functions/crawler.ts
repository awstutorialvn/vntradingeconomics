import * as path from 'path';
import * as targets from 'aws-cdk-lib/aws-events-targets';

import { Duration, NestedStack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Architecture } from 'aws-cdk-lib/aws-lambda';
import { GoFunction } from '@aws-cdk/aws-lambda-go-alpha';

import { ApplicationProps } from '../interfaces/application';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';

export class CrawlerStack extends NestedStack {
    public constructor(scope: Construct, id: string, props: ApplicationProps) {
        super(scope, id, props);

        const stackName = props.configuration.stackName;

        const stockPriceCrawlerFunctionName = `${stackName}-stock-price-crawler`;
        const stockPriceCrawlerFunction = new GoFunction(this, stockPriceCrawlerFunctionName, {
            functionName: stockPriceCrawlerFunctionName,
            entry: path.join(__dirname, `../../src/job/crawler/stock_price/main.go`),
            timeout: Duration.seconds(10),
            architecture: Architecture.ARM_64,
        });

        const stockPriceCrawlerRuleName = `${stackName}-stock-price-crawler-rule`;
        const rule = new Rule(this, stockPriceCrawlerRuleName, {
            ruleName: stockPriceCrawlerRuleName,
            schedule: Schedule.expression('cron(0 18 ? * MON-FRI *)'),
        });
        rule.addTarget(new targets.LambdaFunction(stockPriceCrawlerFunction));
    }
}
