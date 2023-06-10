import {BloomableScraper} from "./bloomable/scraper";
import {Order} from "./bloomable/models";
import {AppClient} from "../appClient";
import {emptyPromiseWithValue, plural} from "../utils";
import {Auth} from "../auth";

export namespace Orders {
    let latestOrder: Order | undefined = undefined;

    export const list = (credentials: Auth.Credentials): Promise<Order[]> => {
        return BloomableScraper.fetchPage(credentials)
            .then(orders => BloomableScraper.sort(orders))
    }

    export const newOrders = (credentials: Auth.Credentials, markAsRead = true): Promise<Order[]> => {
        return list(credentials).then(orders => {
            if (latestOrder === undefined) {
                latestOrder = orders.find(it => it.number !== undefined);
                console.info(`Latest order for '${credentials.username}' not set. Will be set to`, latestOrder);
                return [];
            }

            const newerOrders = orders.filter(it => it.number !== undefined && it.number > latestOrder!.number!);

            if (markAsRead) {
                latestOrder = orders.find(it => it.number !== undefined);
            }

            return newerOrders;
        })
    }

    export const check = (credentials: Auth.Credentials, markAsRead = true): Promise<Order[]> => {
        return newOrders(credentials, markAsRead).then(orders => {
            if (orders.length === 0) return emptyPromiseWithValue([]);

            return AppClient.sendNotification(credentials.username,
                `New ${plural("order", orders.length)}`,
                `${orders.length} new ${plural("order", orders.length)} received.`)
                .then(() => orders)
        })
    }
}
