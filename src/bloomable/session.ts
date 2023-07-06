import {Auth} from "../auth";
import {Response} from "node-fetch";
import {getCookieValue} from "./utils";

export interface Session {
    xsrfToken?: string
    sessionToken?: string
}

const activeSessions: Map<string, Session> = new Map();

export const getSession = (credentials: Auth.Credentials): Session => {
    const session = activeSessions.get(credentials.username)
    return {
        xsrfToken: session?.xsrfToken,
        sessionToken: session?.sessionToken,
    }
};

export const storeSession = (credentials: Auth.Credentials, session: Session) => {
    activeSessions.set(credentials.username, session)
};

export const getNewSession = (response: Response) => {
    const cookies = response.headers.get('Set-Cookie')
    if (cookies == null) {
        throw new Error("Didn't receive XSRF cookies")
    }

    return {
        xsrfToken: getCookieValue(cookies, "XSRF-TOKEN"),
        sessionToken: getCookieValue(cookies, "bloomable_session")
    };
}

export const verifySession = (session: Session) => {
    if (session.xsrfToken == null) throw new Error("Didn't receive XSRF-TOKEN cookie")
    if (session.sessionToken == null) throw new Error("Didn't receive bloomable_session cookie")
}

export const sessionToHeader = (session: Session) => {
    return {
        "X-XSRF-TOKEN": `${session.xsrfToken?.replace("%3D", "=")}`,
        cookie: `XSRF-TOKEN: ${session.xsrfToken}; bloomable_session=${session.sessionToken}`
    }
}
