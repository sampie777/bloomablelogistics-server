import {rollbar} from "../rollbar";
import {api, throwErrorsIfNotOk} from "../api";
import {Auth} from "../auth";
import {ServerHtml} from "./html";

class Server {
    getOrdersPage(credentials: Auth.Credentials, page: number) {
        return api.bloomable.orders(credentials.token, page)
            .then(throwErrorsIfNotOk)
            .then(response => response.text())
            .then(ServerHtml.checkForAuthenticationError)
            .catch(error => {
                rollbar.error(`Error fetching orders data: ${error}`, {
                    error: error,
                    username: credentials.username,
                    tokenLength: credentials.token.length,
                });
                throw error;
            });
    }

    getOrderDetailsPage(credentials: Auth.Credentials, id: string) {
        return api.bloomable.orderDetail(credentials.token, id)
            .then(throwErrorsIfNotOk)
            .then(response => response.text())
            .then(ServerHtml.checkForAuthenticationError)
            .catch(error => {
                rollbar.error(`Error fetching order details data: ${error}`, {
                    error: error,
                    username: credentials.username,
                    tokenLength: credentials.token.length,
                });
                throw error;
            });
    }
}

const server = new Server();
export default server;
