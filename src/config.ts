import {Secrets} from "./secrets";

const config = {
    server: {
        port: process.env.NODE_ENV == "production" ? 80 : 3000,
    },
};

export default config;
