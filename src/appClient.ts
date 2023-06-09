import {api, throwErrorsIfNotOk} from "./api";
import {rollbar} from "./rollbar";
import {emptyPromise} from "./utils";

export namespace AppClient {

    export class FCMError extends Error {
        name = "FCMError"

        constructor(message?: string) {
            super(message);
        }
    }

    export const sendNotification = (toUsername: string, title: string, message: string) => {
        const notification = {
            to: `/topics/${toUsername}`,
            notification: {
                title: title,
                body: message,
            }
        };

        console.info("Sending notification", notification)

        if (toUsername == "demo") {
            console.log("Not sending notification to demo users.");
            return emptyPromise()
        }
        return api.fcm.notification.send(notification)
            .then(throwErrorsIfNotOk)
            .then(r => r.json())
            .then((r: { message_id: number } | { error: string }) => {
                if (r.hasOwnProperty("error")) {
                    throw new FCMError((r as { error: string }).error)
                }
            })
            .catch(e => rollbar.error("Failed to send notification", {
                error: e,
                payload: notification
            }))
    }
}
