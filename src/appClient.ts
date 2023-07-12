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

    // See https://firebase.google.com/docs/cloud-messaging/send-message#send-messages-to-topics-legacy
    export const convertUsernameToTopicName = (value: string): string => {
        return value
            .replace(/[\s\n\r]*/g, "")
            .replace(/[^a-zA-Z0-9-_.~%]+/g, "-")
            .toLowerCase();
    };

    export const sendNotification = (toUsername: string, title: string, message: string) => {
        const topic = convertUsernameToTopicName(toUsername)
        const notification = {
            to: `/topics/${topic}`,
            notification: {
                title: title,
                body: message,
            }
        };

        console.info("Sending notification", notification)

        if (toUsername == "demo" || process.env.NODE_ENV === "develop") {
            console.log("Not sending notification to demo users or in develop environment.");
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
