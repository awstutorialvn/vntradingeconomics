import * as cdk from 'aws-cdk-lib';
import { AppResources, BaseResources } from '../resources';

export interface Configuration {
    stackName: string;
    removalPolicy: cdk.RemovalPolicy;
    environment: { [key: string]: string };
}

export interface NestedResourcesProps extends cdk.NestedStackProps {
    configuration: Configuration;
}

export interface ApplicationResourcesProps extends NestedResourcesProps {
    baseResources: BaseResources;
}

export interface ApplicationProps extends ApplicationResourcesProps {
    appResources: AppResources;
}

// TODO
// export interface FunctionProps {
//     name: string;
//     handler: string;
//     path: string;
//     router: string;
//     method: string;
//     resourcePermissions: ((identity: IGrantable, objectsKeyPattern?: any) => Grant)[];
//     runtime: Runtime;
//     environment: {
//         [key: string]: string;
//     };
//     bundling: {
//         minify: boolean;
//         externalModules: string[];
//     };
//     authorizerRequired: boolean;
// }
