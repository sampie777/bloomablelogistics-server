import {Request} from "express";
import config from "./config";
import {Validation} from "./validation";

export namespace Auth {

    export class AuthError extends Error {
    }

    export interface Credentials {
        token: string
        username: string
    }

    export const getTokenAndUsername = (request: Request): Credentials => {
        const token = request.cookies[config.auth.tokenCookieName]?.trim()
        if (!token) {
            console.error(`Missing authentication cookie '${config.auth.tokenCookieName}'`)
            throw new AuthError(`Missing authentication cookie '${config.auth.tokenCookieName}'`);
        }

        const username = request.cookies[config.auth.usernameCookieName]?.trim()
        if (!username) {
            console.error(`Missing authentication cookie '${config.auth.usernameCookieName}'`)
            throw new AuthError(`Missing authentication cookie '${config.auth.usernameCookieName}'`);
        }

        try {
            verifyToken(token)
        } catch (e) {
            console.error("Token is not valid", token)
            throw e;
        }

        try {
            verifyUsername(username)
        } catch (e) {
            console.error("Username is not valid", token)
            throw e;
        }

        return {
            token: token,
            username: username
        }
    }

    const verifyToken = (value: string) => {
        Validation.validate(value != null, "Token cannot be null")
        Validation.validate(value.length > 0, "Token cannot be empty")
        Validation.validate(value.length > 3, "Token is too short")
    }

    const verifyUsername = (value: string) => {
        Validation.validate(value != null, "Username cannot be null")
        Validation.validate(value.length > 0, "Username cannot be empty")
    }
}
