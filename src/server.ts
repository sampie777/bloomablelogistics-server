import express, {NextFunction, Request, Response} from "express";
import config from "./config";
import * as path from "path";
import cookieParser from "cookie-parser";
import {sanitizeQueryParameter} from "./utils";

export namespace Server {
    export const app = express();

    export class HttpError extends Error {
    }

    export const getQueryParameterAsString = <T = string>(request: Request, name: string, fallback: T): T => {
        const rawValue = request.query[name];
        if (rawValue == undefined || typeof (rawValue) != "string") return fallback;
        return sanitizeQueryParameter(String(rawValue)) as T;
    }

    export const getQueryParameterAsNumber = <T = number>(request: Request, name: string, fallback: T): T => {
        const rawValue = request.query[name];
        if (rawValue == undefined) return fallback;
        if (isNaN(+String(rawValue))) return fallback;
        return +sanitizeQueryParameter(String(rawValue)) as T;
    }

    function servePublicFile(response: Response, fileName: string) {
        response.sendFile(path.join(__dirname, `../../static/public/${fileName}`))
    }

    const errorHandler = (error: Error, request: Request, response: Response, next: NextFunction) => {
        console.error("We got an error!", error);
        next(error)
    };

    export const setup = () => {
        // Middleware
        app.use((request, response, next) => {
            console.log(`${(new Date()).toISOString()} - [REQUEST] ${request.method} - ${request.ip} -> ${request.hostname}${request.url}`)
            next();
        })
        app.use(express.json()) // for parsing application/json
        app.use(express.urlencoded({extended: true})) // for parsing application/x-www-form-urlencoded
        app.use(cookieParser())

        // Routing
        app.get("/api/v1/health", (request, response) => {
            response.send("OK");
        })

        app.use(errorHandler)
        app.listen(config.server.port, () => {
            console.log(`Server running on :${config.server.port}`);
        })
    }
}
