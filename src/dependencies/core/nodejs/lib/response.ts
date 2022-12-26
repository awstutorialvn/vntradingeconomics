import { StatusCodes } from 'http-status-codes';
import { APIGatewayProxyResult } from 'aws-lambda';
import { HttpError } from 'http-errors';

import isString from 'lodash/isString';

export class Response {
    private statusCode: StatusCodes = StatusCodes.OK;

    public json(data: { [key: string]: string | number | boolean | object }): APIGatewayProxyResult {
        return {
            statusCode: this.statusCode,
            body: JSON.stringify(data),
        };
    }

    public send(data: { [key: string]: string | number | boolean | object } | string): APIGatewayProxyResult {
        return {
            statusCode: this.statusCode,
            body: isString(data) ? data : JSON.stringify(data),
        };
    }

    public status(statusCode: StatusCodes): Response {
        this.statusCode = statusCode;
        return this;
    }

    public error(err: unknown): APIGatewayProxyResult {
        const error = err as HttpError & Error;
        const statusCode = error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR;
        const message = error.message ?? 'internal server error';
        this.statusCode = statusCode;

        return this.send(message);
    }
}
