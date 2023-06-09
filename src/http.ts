import {Response} from "node-fetch";

export const HttpCode = {
    OK: 200,
    Created: 201,
    NotFound: 404,
    Unauthorized: 401,
    Forbidden: 403,
    Gone: 410,
    FailedDependency: 424,
    TooManyRequests: 429,
    InternalServerError: 500,
}

export class HttpError extends Error {
    name = "HttpError"
    response?: Response;

    constructor(message?: string, response?: Response) {
        super(message);
        this.response = response;
    }
}
