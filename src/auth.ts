import {Request} from "express";
import {Validation} from "./validation";

export namespace Auth {

    export class AuthError extends Error {
    }

    export interface Credentials {
        username: string
        password: string
    }

    export const getBasicAuth = (request: Request, validate = true): Credentials => {
        const b64auth = (request.headers.authorization || '').split(' ')[1] || undefined
        if (!b64auth) {
            if (!validate) return {username: "", password: ""}

            console.error("Missing authentication header")
            throw new AuthError("Missing authentication header");
        }

        const [username, password] = Buffer.from(b64auth, 'base64').toString().split(':')

        if (validate) {
            try {
                verifyUsername(username)
            } catch (e) {
                console.error("Username is not valid", username)
                throw e;
            }

            try {
                verifyPassword(password)
            } catch (e) {
                console.error("Password is not valid", password)
                throw e;
            }
        }

        return {
            username: username,
            password: password,
        }
    }

    const verifyUsername = (value: string) => {
        Validation.validate(value != null, "Username cannot be null")
        Validation.validate(value.length > 0, "Username cannot be empty")
    }

    const verifyPassword = (value: string) => {
        Validation.validate(value != null, "Password cannot be null")
        Validation.validate(value.length > 0, "Password cannot be empty")
    }
}
