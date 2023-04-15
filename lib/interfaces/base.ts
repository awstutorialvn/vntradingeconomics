import { Configuration } from "./application";

export interface BaseResourcesProps {
  configuration: Configuration
}

export interface DynamoDBResourceProps extends BaseResourcesProps {
  
}

export interface S3ResourceProps extends BaseResourcesProps {
  
}

export interface DependencyResourceProps extends BaseResourcesProps {
  
}

export interface SQSResourceProps extends BaseResourcesProps {
  
}