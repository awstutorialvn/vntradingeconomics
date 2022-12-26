import { env } from '../../../../../env';

const stackName = env.STACK_NAME;
const region = env.REGION;
const s3BucketName = env.S3_BUCKET_NAME;
const s3MainPrefix = env.S3_MAIN_PREFIX;

export { region, stackName, s3BucketName, s3MainPrefix };
