import * as dotenv from 'dotenv'
dotenv.config()

import {Server} from "./server";
Server.setup();
Server.start();
