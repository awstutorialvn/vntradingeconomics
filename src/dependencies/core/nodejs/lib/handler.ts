/*eslint @typescript-eslint/no-explicit-any: ["off", { "ignoreRestArgs": true }]*/
/*eslint @typescript-eslint/no-unsafe-assignment: "off" */
import middy from '@middy/core';
import warmup from '@middy/warmup';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpResponseSerializer from '@middy/http-response-serializer';
import isString from 'lodash/isString';

import { Class } from 'type-fest';
import { validate } from 'fastest-validator-decorators';
import { HandlerOptions } from '../interface/handler';
import { StatusCodes } from 'http-status-codes';
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent } from 'aws-lambda';
import { Response } from './response';
import { injectLambdaContext } from '@aws-lambda-powertools/logger';
import { logger } from './logger';

const httpResSerializer = () =>
    httpResponseSerializer({
        serializers: [
            {
                regex: /^application\/xml$/,
                serializer: ({ body }: { body: string }) => `<message>${body}</message>`,
            },
            {
                regex: /^application\/json$/,
                serializer: ({ body }: { body: object | string }) => (isString(body) ? body : JSON.stringify(body)),
            },
            {
                regex: /^text\/plain$/,
                serializer: ({ body }: { body: string }) => body,
            },
        ],
        defaultContentType: 'application/json',
    });

const normalizeEvent = (): middy.MiddlewareObj<APIGatewayProxyWithCognitoAuthorizerEvent, APIGatewayProxyResult> => {
    return {
        before: async ({ event }) => {
            const { authorizer } = event.requestContext;
            const { claims } = authorizer;
            const body = event.body ?? '{}';
            event.user = claims;
            event.params = {
                ...(event.pathParameters ?? {}),
                ...(event.queryStringParameters ?? {}),
                ...((isString(body) ? JSON.stringify(body) : body) as unknown as object),
            };

            return;
        },
    };
};

const normalizeContext = (): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
    return {
        before: async ({ context }) => {
            context.res = new Response();

            return;
        },
    };
};

const validateParams = (
    entityClass: Class<any>,
): middy.MiddlewareObj<APIGatewayProxyEvent & { params: Class<any> }, APIGatewayProxyResult> => {
    return {
        before: async ({ event, context }) => {
            const entity: InstanceType<any> = new entityClass();
            Object.assign(entity, event.params);
            const result = validate(entity);

            if (result === true) {
                return;
            }
            return context.res.status(StatusCodes.BAD_REQUEST).json({
                errors: result,
            });
        },
    };
};

export const apiHandler = <P = unknown>(options: HandlerOptions<P>) => {
    const handler = middy(options.handler)
        .use(injectLambdaContext(logger, { logEvent: true }))
        .use(warmup())
        .use(jsonBodyParser())
        .use(normalizeContext())
        .use(normalizeEvent())
        .use(httpResSerializer());

    if (options.params) {
        const entity = options.params as Class<any>;
        handler.use(validateParams(entity));
    }

    if (options.middlewares && options.middlewares.length) {
        options.middlewares.forEach((middleware) => handler.use(middleware));
    }

    return handler;
};
