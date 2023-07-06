import express, {NextFunction, Request, Response} from "express";
import config from "./config";
import * as path from "path";
import cookieParser from "cookie-parser";
import {sanitizeQueryParameter} from "./utils";
import {Orders} from "./orders/orders";
import {Auth} from "./auth";
import {HttpCode} from "./http";
import {Validation} from "./validation";
import {AppClient} from "./appClient";

export namespace Server {
    export const app = express();

    export const getQueryParameterAsString = <T = string>(request: Request, name: string, fallback: T): T => {
        const rawValue = request.query[name];
        if (rawValue == undefined || typeof (rawValue) != "string") return fallback;
        return sanitizeQueryParameter(String(rawValue)) as T;
    }

    export const getQueryParameterAsBoolean = (request: Request, name: string, fallback: boolean = false): boolean => {
        const rawValue = request.query[name];
        if (rawValue == undefined || typeof (rawValue) != "string") return fallback;
        return sanitizeQueryParameter(String(rawValue)).toLowerCase() == "true";
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

        if (error instanceof Auth.AuthError) {
            return response.status(HttpCode.Unauthorized).send("Unauthorized")
        }
        if (error instanceof Validation.ValidationError) {
            return response.status(HttpCode.BadRequest).send("BadRequest")
        }

        next(error)
    };

    export const setup = () => {
        // Middleware
        app.use(express.json()) // for parsing application/json
        app.use(express.urlencoded({extended: true})) // for parsing application/x-www-form-urlencoded
        app.use(cookieParser())
        app.use((request, response, next) => {
            const username = Auth.getBasicAuth(request, false).username
            const from = `${request.ip}${username ? ` (user=${username})` : ''}`;
            const to = `${request.hostname}${request.url}`;

            console.log(`${(new Date()).toISOString()} [REQUEST] ${request.method} - ${from} -> ${to}`)
            next();
        })

        // Routing
        app.get("/api/v1/health", (request, response) => {
            response.send("OK");
        })
        app.all("/api/v1/echo", (request, response) => {
            const credentials = Auth.getBasicAuth(request, false)

            response.json({
                date: new Date(),
                credentials: credentials,
                fcmTopic: AppClient.convertUsernameToTopicName(credentials.username),
                request: {
                    ...request,
                    app: undefined,
                    res: undefined,
                    next: undefined,
                    body: undefined,
                    query: undefined,
                    client: undefined,
                    socket: undefined,
                    _events: undefined,
                    _readableState: undefined,
                },
            });
        })

        app.get("/api/v1/orders", (request, response, next) => {
            const credentials = Auth.getBasicAuth(request)

            Orders.list(credentials)
                .then(orders => response.json(orders))
                .catch(e => next(e))
        })
        app.get("/api/v1/orders/check", (request, response, next) => {
            const credentials = Auth.getBasicAuth(request)
            const markAsRead = getQueryParameterAsBoolean(request, "markAsRead", true)
            const sendNotification = getQueryParameterAsBoolean(request, "sendNotification", true)

            Orders.check(credentials, markAsRead, sendNotification)
                .then(orders => response.json(orders))
                .catch(e => next(e))
        })

        app.use(errorHandler)
    }

    export const start = () => app.listen(config.server.port, () => {
        console.log(`Server running on :${config.server.port}`);
    })
}
