import {BloomableOrder, BloomableProduct} from "./serverModels";
import {Order, Product, Recipient} from "../orders/models";

export const convertToLocalOrder = (onlineOrder: BloomableOrder) => {
    const order = new Order();
    order.id = onlineOrder.id;
    order.number = +onlineOrder.name.replace(/\D*/gi, "");
    order.createdAt = new Date(onlineOrder.created_at);
    order.deliverAtDate = new Date(onlineOrder.deliveryDate);
    order.orderValue = onlineOrder.totalValue;
    order.orderCosts = onlineOrder.onPay;
    order.accepted = onlineOrder.status !== "open" && onlineOrder.status !== "cancelled";
    order.delivered = onlineOrder.status === "fulfilled" || onlineOrder.status === "delivered";
    order.deleted = onlineOrder.status === "cancelled";

    order.recipient = new Recipient();
    order.recipient.name = (onlineOrder.firstName + " " + onlineOrder.lastName).trim();
    order.recipient.company = onlineOrder.company ?? "";
    order.recipient.phones = onlineOrder.phone ? [onlineOrder.phone] : [];
    order.recipient.address = [onlineOrder.address1, onlineOrder.address2, onlineOrder.postalCode, onlineOrder.city].filter(it => it).join(", ");
    order.recipient.coordinates = {
        latitude: onlineOrder.latitude,
        longitude: onlineOrder.longitude,
    };
    order.recipient.specialInstructions = onlineOrder.notes ?? undefined;
    order.recipient.message = onlineOrder.lines.map(product => product.giftMessage)
        .filter(it => it)
        .join("\n\n   ---\n\n");

    if (onlineOrder.adjustments && onlineOrder.adjustments.length > 0) {
        console.warn("I don't know what to do with this field: BloomableOrder.adjustments", onlineOrder.adjustments)
    }

    order.products = onlineOrder.lines.map(p => {
        const product = new Product();
        product.id = p.productVariantId;
        product.name = p.title;
        product.quantity = p.quantity;
        product.retailPrice = p.value;
        return product;
    });

    return order;
};

export const convertToLocalOrders = (orders: BloomableOrder[]): Order[] =>
    orders.map(convertToLocalOrder);

export const convertToLocalProduct = (onlineProduct: BloomableProduct): Product => {
    const product = new Product();
    product.id = onlineProduct.id;
    product.name = onlineProduct.product.title;
    product.size = onlineProduct.title;
    product.description = onlineProduct.product.description;
    product.guidelines = onlineProduct.component_rates
        .map(it => `${it.quantity} x ${it.component_rate.component.name} - ${it.component_rate.component.unit.name} (${it.component_rate.component.colour.name})`)
        .join("\n").trim();
    if (onlineProduct.product.images.length > 0) {
        product.image = onlineProduct.product.images[0].url;
    }

    return product;
};
