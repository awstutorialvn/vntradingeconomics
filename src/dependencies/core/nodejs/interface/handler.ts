/*eslint @typescript-eslint/no-explicit-any: ["off", { "ignoreRestArgs": true }]*/
import middy from '@middy/core';
import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    APIGatewayProxyWithCognitoAuthorizerEvent,
    Context,
} from 'aws-lambda';

type MiddlewareEvent = APIGatewayProxyEvent | APIGatewayProxyWithCognitoAuthorizerEvent;
type APIGatewayProxy<P> = MiddlewareEvent & { params: P };

export interface HandlerOptions<P> {
    name?: string;
    params?: any;
    middlewares?: Array<middy.MiddlewareObj<MiddlewareEvent, APIGatewayProxyResult>>;
    handler: (event: APIGatewayProxy<P>, context: Context) => Promise<APIGatewayProxyResult>;
}
