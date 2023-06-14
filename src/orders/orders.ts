import {BloomableScraper} from "./bloomable/scraper";
import {Order} from "./bloomable/models";
import {AppClient} from "../appClient";
import {plural} from "../utils";
import {Auth} from "../auth";

export namespace Orders {
    let latestOrder: Map<string, Order> = new Map();

    export const list = (credentials: Auth.Credentials): Promise<Order[]> => {
        return BloomableScraper.fetchPage(credentials)
            .then(orders => BloomableScraper.sort(orders))
    }

    export const newerOrders = (credentials: Auth.Credentials, markAsRead = true): Promise<Order[]> => {
        return list(credentials)
            .then(orders => orders.filter(it => it.number !== undefined && !it.deleted))
            .then(orders => {
                if (orders.length === 0) return [];

                const newLatestOrder = orders[0];

                if (!latestOrder.has(credentials.username)) {
                    console.info(`Latest order for '${credentials.username}' not set. Will be set to`, newLatestOrder);
                    latestOrder.set(credentials.username, newLatestOrder);
                    console.info(`Currently tracking latest order for ${latestOrder.size} usernames:`, Array.from(latestOrder.keys()))
                    return [];
                }

                const newerOrders = orders.filter(it => it.number! > latestOrder.get(credentials.username)!.number!);

                if (markAsRead) {
                    latestOrder.set(credentials.username, newLatestOrder);
                }

                return newerOrders;
            })
    }

    export const check = (credentials: Auth.Credentials, markAsRead = true, sendNotification = true): Promise<Order[]> => {
        return newerOrders(credentials, markAsRead)
            .then(orders => orders.filter(it => !it.accepted))  // Only get non-accepted orders
            .then(orders => {
                if (orders.length === 0) return orders;
                if (!sendNotification) return orders;

                return AppClient.sendNotification(credentials.username,
                    `New ${plural("order", orders.length)}`,
                    `${orders.length} new ${plural("order", orders.length)} received.`)
                    .then(() => orders)
            })
    }
}
