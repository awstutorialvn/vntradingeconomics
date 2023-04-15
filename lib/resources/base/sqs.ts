import { CfnQueue, Queue } from 'aws-cdk-lib/aws-sqs';
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SQSResourceProps } from '../../interfaces/base';

export class SQSResource extends Construct {
  public stockPriceCrawler: Queue;

  public constructor(scope: Construct, id: string, props: SQSResourceProps) {
    super(scope, id);

    const stackName = props.configuration.stackName;
    const stockPriceCrawlerQueueName = `${stackName}-stock-price-crawler.fifo`;
    const removalPolicy = props.configuration.removalPolicy;

    this.stockPriceCrawler = new Queue(this, stockPriceCrawlerQueueName, {
      queueName: stockPriceCrawlerQueueName,
      fifo: true,
      visibilityTimeout: Duration.seconds(60),
      removalPolicy,
    });
    (this.stockPriceCrawler.node.defaultChild as unknown as CfnQueue).overrideLogicalId(
      stockPriceCrawlerQueueName.replace(/[+._-]/g, ''),
    );
  }
}
