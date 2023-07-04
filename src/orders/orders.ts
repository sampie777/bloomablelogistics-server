import {Order} from "../bloomable/models";
import {AppClient} from "../appClient";
import {formatDateToWords, plural, unique} from "../utils";
import {Auth} from "../auth";
import {BloomableWebsite} from "../bloomable/BloomableWebsite";

export namespace Orders {
    let knownOrderNumbers: Map<string, number[]> = new Map();

    export const resetKnownOrders = (username: string) => knownOrderNumbers.delete(username);

    export const sort = (orders: Order[]): Order[] =>
        orders
            .sort((a, b) => (a.number || 0) - (b.number || 0))
            .reverse();

    export const list = (credentials: Auth.Credentials): Promise<Order[]> => {
        return BloomableWebsite.orders(credentials)
            .then(orders => sort(orders))
    }

    export const newerOrders = (credentials: Auth.Credentials, markAsRead = true): Promise<Order[]> => {
        return list(credentials)
            .then(orders => orders.filter(it => it.number !== undefined && !it.deleted))
            .then(orders => {
                console.debug(`${orders.length} orders found for ${credentials.username}`);
                if (orders.length === 0) return [];

                const newLatestOrderNumbers = orders.map(it => it.number!);

                if (!knownOrderNumbers.has(credentials.username)) {
                    console.info(`Latest order numbers for '${credentials.username}' not set. Will be set to`, newLatestOrderNumbers);
                    knownOrderNumbers.set(credentials.username, newLatestOrderNumbers);
                    console.info(`Currently tracking latest order for ${knownOrderNumbers.size} usernames:`, Array.from(knownOrderNumbers.keys()))
                    return [];
                }

                const knownOrderNumbersForUser = knownOrderNumbers.get(credentials.username)!;
                const oldestKnownOrderNumber = knownOrderNumbersForUser.length === 0 ? 0 : knownOrderNumbersForUser[knownOrderNumbersForUser.length - 1];
                // Search for orders that aren't in our known list, and also are newer than the oldest order we know of.
                // This last because if a known order is deleted, the new orders list will contain an old order number which
                // comes from the second order page.
                const newOrders = orders.filter(it => it.number! > oldestKnownOrderNumber && !knownOrderNumbersForUser.includes(it.number!));

                if (markAsRead && newOrders.length > 0) {
                    knownOrderNumbers.set(credentials.username, newLatestOrderNumbers);
                    console.info(`Latest order numbers for '${credentials.username}' will be set to`, newLatestOrderNumbers);
                }

                return newOrders;
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
