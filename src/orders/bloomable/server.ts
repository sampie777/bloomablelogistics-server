import {rollbar} from "../../rollbar";
import {api, throwErrorsIfNotOk} from "../../api";

class Server {
    getOrdersPage(page: number) {
        return api.bloomable.orders(page)
            .then(throwErrorsIfNotOk)
            .then(response => response.text())
            .catch(error => {
                rollbar.error(`Error fetching orders data: ${error}`, error);
                throw error;
            });
    }

    getOrderDetailsPage(id: string) {
        return api.bloomable.orderDetail(id)
            .then(throwErrorsIfNotOk)
            .then(response => response.text())
            .catch(error => {
                rollbar.error(`Error fetching order details data: ${error}`, error);
                throw error;
            });
    }
}

const server = new Server();
export default server;
