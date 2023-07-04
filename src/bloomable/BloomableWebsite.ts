import fetch, {Response} from "node-fetch";
import {HttpCode} from "../http";
import {Auth} from "../auth";

export namespace BloomableWebsite {

    interface Session {
        xsrfToken?: string
        sessionToken?: string
    }

    interface OrdersResponse {
        data: [],
        links: {
            first: string,
            last: string,
            prev: string,
            next: string
        },
        meta: {
            current_page: number,
            from: unknown,
            last_page: number,
            links: Array<{
                url: string,
                label: string,
                active: boolean
            }>,
            path: string,
            per_page: number,
            to: unknown,
            total: number
        }
    }

    const obtainResponseContent = (response: Response): Promise<string> => {
        const contentType = response.headers.get("content-type");
        if (contentType === "application/json") return response.json().catch(e => {
            console.error("Could not convert response to json", e)
            return ""
        })
        return response.text().catch(e => {
            console.error("Could not convert response to text", e)
            return ""
        })
    }

    export const getCookieValue = (cookies: string, key: string): string | undefined => {
        const cookie = cookies.split(",")
            .flatMap(cookie => cookie.split(";"))
            .find(it => it.trim().startsWith(`${key}=`));

        if (!cookie) return undefined;

        const part = cookie.trim();
        return part.substring(`${key}=`.length, part.length);
    }

    const getNewSession = (response: Response) => {
        const cookies = response.headers.get('Set-Cookie')
        if (cookies == null) {
            throw new Error("Didn't receive XSRF cookies")
        }

        return {
            xsrfToken: getCookieValue(cookies, "XSRF-TOKEN"),
            sessionToken: getCookieValue(cookies, "bloomable_session")
        };
    }

    const verifySession = (session: Session) => {
        if (session.xsrfToken == null) throw new Error("Didn't receive XSRF-TOKEN cookie")
        if (session.sessionToken == null) throw new Error("Didn't receive bloomable_session cookie")
    }

    const sessionToHeader = (session: Session) => {
        return {
            "X-XSRF-TOKEN": `${session.xsrfToken?.replace("%3D", "=")}`,
            cookie: `XSRF-TOKEN: ${session.xsrfToken}; bloomable_session=${session.sessionToken}`
        }
    }

    export const getXSRFCookies = (): Promise<Session> => {
        console.log("Getting XSRF cookies")
        return fetch("https://dashboard.bloomable.com/sanctum/csrf-cookie")
            .then(response => {
                const session = getNewSession(response);
                verifySession(session);

                return session
            })
            .catch(e => {
                console.error("Could not get XSRF tokens", e)
                throw e
            })
    }

    export const login = (credentials: Auth.Credentials): Promise<Session> =>
        getXSRFCookies()
            .then(session => {
                console.log(`Logging in for ${credentials.username}`)
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
                console.log(...response.headers)

                if (response.status === HttpCode.OK) {
                    const session = getNewSession(response);
                    verifySession(session);

                    console.log("Logged in!", session)
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
                console.error("Could not log in", e)
                throw e
            })


    export const orders = (credentials: Auth.Credentials): Promise<OrdersResponse> =>
        login(credentials)
            .then(session => {
                console.log("Getting orders")
                return fetch("https://dashboard.bloomable.com/api/orders",
                    {
                        headers: {
                            "Accept": "application/json",
                            "Referer": "https://dashboard.bloomable.com/dashboard",
                            ...sessionToHeader(session)
                        }
                    })
            })
            .then(response => {
                const session = getNewSession(response);
                console.log("Orders status", response.status, session)
                return response.json()
            })
            .then(d => {
                console.log("Orders data", d)
                return d
            })
            .catch(e => {
                console.error("Could not get orders", e)
                throw e
            })
}
