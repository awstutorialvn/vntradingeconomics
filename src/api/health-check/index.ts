import { APIGatewayProxyResultV2, Context, APIGatewayProxyEventV2 } from 'aws-lambda';

export const handler = async (_event: APIGatewayProxyEventV2, _context: Context): Promise<APIGatewayProxyResultV2> => {
    const result = {
        message: 'Success',
    };
    return {
        statusCode: 200,
        body: JSON.stringify(result),
    };
};
