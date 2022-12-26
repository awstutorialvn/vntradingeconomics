import { PostConfirmationConfirmSignUpTriggerEvent } from 'aws-lambda';
import { dynamoDocClient } from '/opt/core/aws';
import { stackName } from '/opt/core/configuration';

export const handler = async (
    event: PostConfirmationConfirmSignUpTriggerEvent,
): Promise<PostConfirmationConfirmSignUpTriggerEvent> => {
    if (event.triggerSource === 'PostConfirmation_ConfirmSignUp') {
        const { userAttributes } = event.request;
        const { email, sub } = userAttributes;
        const createdDate = new Date();

        const params = {
            TableName: `${stackName}_User`,
            Item: {
                sub: sub,
                email: email,
                createdAt: createdDate.toISOString(),
                updatedAt: createdDate.toISOString(),
            },
        };

        await dynamoDocClient.put(params).promise();
    }

    return event;
};
