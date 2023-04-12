import * as cdk from 'aws-cdk-lib';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { InstanceClass, InstanceSize, InstanceType, IVpc, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { DatabaseInstance, DatabaseInstanceEngine, PostgresEngineVersion } from 'aws-cdk-lib/aws-rds';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { env } from '../env/cdk';

export class VntradingeconomicsRDSStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const stackName = props.stackName ?? 'vntradingeconomics';
    const rdsVpcName = `${props.tags?.applicationName ?? stackName}-vpc-rds`;
    const rdsVpc: IVpc = Vpc.fromLookup(this, rdsVpcName, {
      vpcName: rdsVpcName,
      // isDefault: true
    });

    const secretDatabaseCredentialName = `${stackName}-database-credential`;
    const databaseCredentialsSecret = new Secret(this, secretDatabaseCredentialName, {
      secretName: secretDatabaseCredentialName,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'postgres',
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password',
      },
    });

    const databaseName = `${stackName}-${env.NODE_ENV}`.replace(/[-\._\+]/g, '_').toLocaleLowerCase();
    // const dbEngine = DatabaseClusterEngine.auroraPostgres({ version: AuroraPostgresEngineVersion.VER_14_6 });
    // const parameterGroupForInstance = new ParameterGroup(
    //     this,
    //     `${stackName}-${dbEngine.engineVersion?.fullVersion}`,
    //     {
    // 		engine: dbEngine,
    // 		description: `Aurora RDS Instance Parameter Group for database ${stackName}`,
    // 		parameters: {
    // 			shared_preload_libraries: 'pglogical',
    // 		},
    //     },
    // );
    // const clusterName = `${stackName}-database-cluster`;
    // const databaseCluster = new DatabaseCluster(this, clusterName, {
    //     engine: dbEngine,
    //     instances: 1,
    //     instanceProps: {
    // 		instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.MEDIUM),
    // 		vpc: rdsVpc,
    // 		vpcSubnets: { subnetType: SubnetType.PUBLIC, },
    // 		parameterGroup: parameterGroupForInstance,
    //     },
    //     parameterGroup:  new ParameterGroup(this, `${stackName}-cluster-parameter-group`, {
    //         engine: dbEngine,
    //         description: `${stackName} cluster parameter group`,
    //         parameters: {
    //             'rds.logical_replication': '1',
    //             shared_preload_libraries: 'pglogical',
    //         },
    //     }),
    //     backup: {
    // 		retention: Duration.days(RetentionDays.ONE_WEEK),
    // 		preferredWindow: '00:00-07:00',
    //     },
    //     credentials: {
    // 		username: 'postgres',
    // 		password: databaseCredentialsSecret.secretValueFromJson('password'),
    //     },
    //     cloudwatchLogsRetention: RetentionDays.ONE_WEEK,
    //     defaultDatabaseName: `${stackName}-${env.NODE_ENV}`.replace(/[-\._\+]/g, '_').toLocaleLowerCase(),
    //     iamAuthentication: false,
    //     clusterIdentifier: clusterName,
    //     subnetGroup: new SubnetGroup(this, `${stackName}-subnet-group`, {
    //         description: `Aurora RDS Subnet Group for database ${stackName}`,
    //         subnetGroupName: `${stackName}-subnet-group`,
    //         vpc: rdsVpc,
    //         removalPolicy: RemovalPolicy.DESTROY,
    //         vpcSubnets: { subnetType: SubnetType.PUBLIC, },
    //     })
    // });

    // const { defaultPort } = databaseCluster.connections;
    // if (defaultPort) {
    // 	databaseCluster.connections.allowFromAnyIpv4(defaultPort);
    // }

    // console.log(databaseCluster.instanceIdentifiers)

    const databaseInstanceEngine = DatabaseInstanceEngine.postgres({
      version: PostgresEngineVersion.VER_14_6,
    });
    // 👇 create RDS instance
    const dbInstance = new DatabaseInstance(this, 'db-instance', {
      vpc: rdsVpc,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
      engine: databaseInstanceEngine,
      instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.MICRO),
      credentials: {
        username: 'postgres',
        password: databaseCredentialsSecret.secretValueFromJson('password'),
      },
      multiAz: false,
      allocatedStorage: 20,
      maxAllocatedStorage: 20,
      allowMajorVersionUpgrade: false,
      autoMinorVersionUpgrade: true,
      backupRetention: Duration.days(0),
      deleteAutomatedBackups: true,
      removalPolicy: RemovalPolicy.DESTROY,
      deletionProtection: false,
      databaseName: databaseName,
      publiclyAccessible: true,
    });

    const { defaultPort } = dbInstance.connections;
    if (defaultPort) {
      dbInstance.connections.allowFromAnyIpv4(defaultPort);
    }
  }
}
