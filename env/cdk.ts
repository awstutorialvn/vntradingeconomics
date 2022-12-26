// see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import * as dotenv from 'dotenv' 
import { cleanEnv, str } from 'envalid';
dotenv.config();

export const env = cleanEnv(process.env, {
    STACK_NAME: str({ default: 'video-linked' }),
    NODE_ENV: str({
        choices: ['local', 'development', 'production', 'staging'],
        default: 'local',
    }),
    CDK_DEFAULT_ACCOUNT: str({}),
    CDK_DEFAULT_REGION: str({}),
    STAGE_NAME: str({
        choices: ['dev', 'prd', 'stg'],
        default: 'dev',
    }),
    REGION: str({}),
    S3_MAIN_PREFIX: str({}),
});
