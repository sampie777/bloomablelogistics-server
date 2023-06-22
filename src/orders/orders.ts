import {BloomableScraper} from "../bloomable/scraper";
import {Order} from "../bloomable/models";
import {AppClient} from "../appClient";
import {formatDateToWords, plural, unique} from "../utils";
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
                console.debug(`${orders.length} orders found for ${credentials.username}`);
                if (orders.length === 0) return [];

                const newLatestOrder = orders[0];

                if (!latestOrder.has(credentials.username)) {
                    console.info(`Latest order for '${credentials.username}' not set. Will be set to`, newLatestOrder);
                    latestOrder.set(credentials.username, newLatestOrder);
                    console.info(`Currently tracking latest order for ${latestOrder.size} usernames:`, Array.from(latestOrder.keys()))
                    return [];
                }

                const newerOrders = orders.filter(it => it.number! > latestOrder.get(credentials.username)!.number!);

                if (markAsRead && newerOrders.length > 0) {
                    latestOrder.set(credentials.username, newLatestOrder);
                    console.info(`Latest order for '${credentials.username}' will be set to`, newLatestOrder);
                }

                return newerOrders;
            })
    }

    export const check = (credentials: Auth.Credentials, markAsRead = true, sendNotification = true): Promise<Order[]> => {
        return newerOrders(credentials, markAsRead)
            .then(orders => orders.filter(it => !it.accepted))  // Only get non-accepted orders
            .then(orders => {
                if (orders.length === 0) return orders;
                console.debug(`New non accepted orders for ${credentials.username}:`, orders)

                if (!sendNotification) return orders;

                return AppClient.sendNotification(credentials.username,
                    `New ${plural("order", orders.length)}`,
                    createNewOrdersMessage(orders))
                    .then(() => orders)
            })
    }

    export const createNewOrdersMessage = (orders: Order[]): string => {
        if (orders.length === 0) {
            return "No new orders received.";
        }

        const orderDates = orders
            .sort((a, b) => {
                if (a.deliverAtDate && b.deliverAtDate) {
                    return a.deliverAtDate.getTime() - b.deliverAtDate.getTime();
                } else if (a.deliverAtDate) {
                    return 1;
                } else if (b.deliverAtDate) {
                    return -1;
                } else {
                    return (a.number || 0) - (b.number || 0);
                }
            })
            .map(it => formatDateToWords(it.deliverAtDate, "%dddd (%dd-%mm-%YYYY)"))
            .filter(unique)
        let ordersDate = orderDates[0];
        if (orderDates.length > 1) {
            ordersDate += " and later"
        }

        return `${orders.length} new ${plural("order", orders.length)} received ` +
            `for ${ordersDate}.\n` +
            `${plural("Order", orders.length)}: ${orders.map(it => it.number).join(", ")}.`;
    }
}
