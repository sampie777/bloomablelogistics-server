import {getNewSession, getSession, Session, sessionToHeader, storeSession, verifySession} from "./session";
import fetch, {RequestInfo, RequestInit, Response} from "node-fetch";
import {Auth} from "../auth";
import {HttpCode} from "../http";
import {obtainResponseContent} from "./utils";

export const getXSRFCookies = (): Promise<Session> => {
    console.log("Getting XSRF cookies")
    return fetch("https://dashboard.bloomable.com/sanctum/csrf-cookie")
        .then(response => {
            const session = getNewSession(response);
            verifySession(session);
            return session
        })
        .catch(e => {
            console.error("Could not get XSRF tokens", {error: e})
            throw e
        })
}

export const login = (credentials: Auth.Credentials): Promise<Session> =>
    getXSRFCookies()
        .then(session => {
            console.debug(`Logging in for ${credentials.username}`)
            return fetch("https://dashboard.bloomable.com/api/login", {
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    ...sessionToHeader(session)
                },
                body: `{"email":"${credentials.username}","password":"${credentials.password}"}`,
                method: "POST",
            })
        })
        .then(response => {
            console.debug(...response.headers)

            if (response.status === HttpCode.OK) {
                const session = getNewSession(response);
                verifySession(session);

                console.log("Logging in successful")
                return session
            }

            return obtainResponseContent(response).then(content => {
                if (response.status === HttpCode.NoContent) {
                    throw new Error(`Logged in with no content. Payload: ${content}`)
                } else if (response.status === HttpCode.UnprocessableContent) {
                    throw new Error(`Auth error. Payload: ${JSON.stringify(content)}`)
                } else if (response.status === HttpCode.PageExpired) {
                    throw new Error(`XSRF failed. Payload: ${content}`)
                }
                throw new Error(`No idea whats going on (status=${response.status}). Payload: ${content}`)
            })
        })
        .catch(e => {
            console.error("Could not log in", {error: e})
            throw e
        })

export const authenticatedFetch = (credentials: Auth.Credentials, url: RequestInfo, init: RequestInit = {}): Promise<Response> => {
    const call = () => {
        const session: Session = getSession(credentials);
        init.headers = {
            ...init.headers,
            ...sessionToHeader(session),
        }
        return fetch(url, init)
    }

    return call()
        .then(response => {
            if (response.status === HttpCode.Unauthorized) {
                console.log("Not logged in. Retrying call with logging in.")
                return login(credentials)
                    .then(session => storeSession(credentials, session))
                    .then(call)
            }
            return response
        })
        .then(response => {
            storeSession(credentials, getNewSession(response));
            return response;
        })
}
