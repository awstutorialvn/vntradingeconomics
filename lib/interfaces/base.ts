import { Configuration } from './application';

export interface BaseResourcesProps {
  configuration: Configuration;
}

export type DynamoDBResourceProps = BaseResourcesProps;

export type S3ResourceProps = BaseResourcesProps;

export type DependencyResourceProps = BaseResourcesProps;

export type SQSResourceProps = BaseResourcesProps;
