import {Secrets} from "./secrets";

const config = {
    server: {
        port: process.env.NODE_ENV == "production" ? 80 : 3000,
    },
    auth: {
        usernameCookieName: "username",
    },
    bloomable: {
        auth: {
            tokenCookieName: "SAFlorist",
        },
        maxOrderPagesToFetch: 3,
    },
    fcm: {
        key: Secrets.read("BLOOMABLE_FCM_API_KEY") ?? "",
    }
};

export default config;
