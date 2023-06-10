import fetch, {Response} from "node-fetch";
import config from "./config";
import {rollbar} from "./rollbar";
import {HttpCode, HttpError} from "./http";

export const throwErrorsIfNotOk = (response: Response) => {
    if (response.ok) {
        return response;
    }

    rollbar.error(`API request to '${response.url}' failed: (${response.status}) ${response.statusText}`);
    switch (response.status) {
        case HttpCode.NotFound:
            throw new HttpError(`Could not find the requested data: (${response.status}) ${response.statusText}`, response);
        case HttpCode.Unauthorized:
            throw new HttpError(`Could not retrieve the requested data: (${response.status}) Not authorized.`, response);
        case HttpCode.Forbidden:
            throw new HttpError(`Could not retrieve the requested data: (${response.status}) Not authorized.`, response);
        case HttpCode.Gone:
            throw new HttpError(`Server says resource is gone (${response.status})..`, response);
        case HttpCode.TooManyRequests:
            throw new HttpError(`Too many request (${response.status}).`, response);
        case HttpCode.InternalServerError:
            throw new HttpError(`Could not connect to server: (${response.status}) Internal server error`, response);
        default:
            throw new HttpError(`Request failed: (${response.status}) ${response.statusText}`, response);
    }
};

export const api = {
    bloomable: {
        orders: (token: string, page: number) => fetch(`https://www.bloomable.co.za/Code/Orders/Dashboard?SortByField=DeliveryDate&SortByDirection=DESC&page=${page}`, {
            headers: {
                "Cookie": `SAFlorist=${token}`
            }
        }),
        orderDetail: (token: string, id: string) => fetch(`https://www.bloomable.co.za/Code/Orders/Summary?orderId=${id}`, {
            headers: {
                "Cookie": `SAFlorist=${token}`
            }
        }),
    },
    fcm: {  // Firebase Cloud Messaging
        notification: {
            send: (data: {
                to: string,
                notification: { title: string, body: string }
            }) => fetch(`https://fcm.googleapis.com/fcm/send`, {
                method: "POST",
                headers: {
                    "Authorization": `key=${config.fcm.key}`,
                    "content-Type": "application/json",
                },
                body: JSON.stringify(data)
            })
        }
    }
}
