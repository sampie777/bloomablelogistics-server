import {BloomableScraper} from "./bloomable/scraper";
import {Order} from "./bloomable/models";
import {AppClient} from "../appClient";
import config from "../config";
import {emptyPromiseWithValue, plural} from "../utils";

export namespace Orders {
    let latestOrder: Order | undefined = undefined;

    export const list = (username: string = config.bloomable.client1.username): Promise<Order[]> => {
        return BloomableScraper.fetchPage()
            .then(orders => BloomableScraper.sort(orders))
    }

    export const newOrders = (username: string = config.bloomable.client1.username, markAsRead = true): Promise<Order[]> => {
        return list(username).then(orders => {
            if (latestOrder === undefined) {
                latestOrder = orders.find(it => it.number !== undefined);
                console.info("Latest order not set. Will be set to", latestOrder);
                return [];
            }

            const newerOrders = orders.filter(it => it.number !== undefined && it.number > latestOrder!.number!);

            if (markAsRead) {
                latestOrder = orders.find(it => it.number !== undefined);
            }

            return newerOrders;
        })
    }

    export const check = (username: string = config.bloomable.client1.username, markAsRead = true): Promise<Order[]> => {
        return newOrders(username, markAsRead).then(orders => {
            if (orders.length === 0) return emptyPromiseWithValue([]);

            return AppClient.sendNotification(username,
                `New ${plural("order", orders.length)}`,
                `${orders.length} new ${plural("order", orders.length)} received.`)
                .then(() => orders)
        })
    }
}
