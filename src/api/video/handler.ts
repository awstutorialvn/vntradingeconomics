import { randomUUID } from 'crypto';
import { s3Client } from '/opt/core/aws';
import { s3BucketName, s3MainPrefix } from '/opt/core/configuration';
import { HandlerOptions } from '/opt/core/interface/handler';
import { PresignedPutUrlEntity } from './validator';

export const presignedPutUrlHandler: HandlerOptions<PresignedPutUrlEntity> = {
    params: PresignedPutUrlEntity,
    handler: async (event, context) => {
        try {
            const user = event.user;
            const { tail } = event.params;
            const presignedPutUrl = s3Client.getSignedUrl('putObject', {
                Bucket: s3BucketName,
                Key: `${s3MainPrefix}/${user.sub}/${randomUUID()}.${tail}`,
                Expires: 60 * 100,
            });

            return context.res.json({ presignedPutUrl: presignedPutUrl });
        } catch (error) {
            return context.res.error(error);
        }
    },
};

// async (event: APIGatewayProxyWithCognitoAuthorizerEvent, context: Context): Promise<APIGatewayProxyResult> => {
//     const { authorizer } = event.requestContext;
//     const { claims } = authorizer;
//     const query = event.queryStringParameters;
//     const tail = query?.tail ?? '';

//     if (!tail) {
//         return {
//             statusCode: 400,
//             body: JSON.stringify({
//                 message: 'Missing tail'
//             })
//         }
//     }
//     const presignedPutUrl = s3Client.getSignedUrl('putObject', {
//         Bucket: s3BucketName,
//         Key: `${s3MainPrefix}/${claims.sub}/${randomUUID()}.${tail}`,
//         Expires: 60*100,
//     });
//     const result = {
//         presignedPutUrl: presignedPutUrl,
//     };

//     return {
//         statusCode: 200,
//         body: JSON.stringify(result),
//     };
// };
