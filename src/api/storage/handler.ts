import { s3Client } from '/opt/core/aws';
import { s3BucketName, s3MainPrefix } from '/opt/core/configuration';
import { HandlerOptions } from '/opt/core/interface/handler';
import { PresignedPutUrlEntity } from './validator';

export const presignedPutUrlHandler: HandlerOptions<PresignedPutUrlEntity> = {
    params: PresignedPutUrlEntity,
    handler: async (event, context) => {
        try {
            const { keyName } = event.params;
            const presignedPutUrl = s3Client.getSignedUrl('putObject', {
                Bucket: s3BucketName,
                Key: `${s3MainPrefix}/${keyName}`,
                Expires: 60 * 100,
            });

            return context.res.json({ presignedPutUrl: presignedPutUrl });
        } catch (error) {
            return context.res.error(error);
        }
    },
};
