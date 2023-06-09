import {Secrets} from "./secrets";

const config = {
    server: {
        port: process.env.NODE_ENV == "production" ? 80 : 3000,
    },
    bloomable: {
        client1: {
            username: Secrets.read("BLOOMABLE_CLIENT1_USERNAME") ?? "demo",
            cookie: Secrets.read("BLOOMABLE_CLIENT1_COOKIE") ?? "demo",
        },
        maxOrderPagesToFetch: 3,
    },
    fcm: {
        key: Secrets.read("BLOOMABLE_FCM_API_KEY") ?? "",
    }
};

export default config;
