import {BloomableOrder, BloomableProduct} from "./serverModels";
import {Order, Product, Recipient} from "../orders/models";

export const convertToLocalOrder = (orders: BloomableOrder[]): Order[] =>
    orders.map(it => {
        const order = new Order()
        order.id = it.id
        order.number = +it.name.replace(/\D*/gi, "")
        order.createdAt = new Date(it.created_at);
        order.deliverAtDate = new Date(it.deliveryDate);
        order.orderValue = it.totalValue
        order.orderCosts = it.onPay
        order.accepted = it.status != "open" && it.status != "cancelled";
        order.delivered = it.status == "fulfilled" || it.status == "delivered";
        order.deleted = it.status == "cancelled";

        order.recipient = new Recipient()
        order.recipient.name = (it.firstName + " " + it.lastName).trim()
        order.recipient.phones = [it.phone]
        order.recipient.address = [it.address1, it.address2, it.city].filter(it => it).join(", ")
        order.recipient.coordinates = {
            latitude: it.latitude,
            longitude: it.longitude
        }
        order.recipient.specialInstructions = it.notes ?? undefined
        order.recipient.message = it.lines.map(product => product.giftMessage)
            .filter(it => it)
            .join("\n\n   ---\n\n")

        if (it.adjustments && it.adjustments.length > 0) {
            console.warn("I don't know what to do with this field: BloomableOrder.adjustments", it.adjustments)
        }

        order.products = it.lines.map(p => {
            const product = new Product()
            product.id = p.productVariantId
            product.name = p.title
            product.quantity = p.quantity
            product.retailPrice = p.value
            return product
        })

        return order
    })

export const convertToLocalProduct = (onlineProduct: BloomableProduct): Product => {
    const product = new Product()
    product.id = onlineProduct.id
    product.name = onlineProduct.product.title
    product.size = onlineProduct.title
    product.description = onlineProduct.product.description
    product.guidelines = onlineProduct.component_rates
        .map(it => `${it.quantity} x ${it.component_rate.component.name} - ${it.component_rate.component.unit.name} (${it.component_rate.component.colour.name})`)
        .join("\n").trim()
    if (onlineProduct.product.images.length > 0) {
        product.image = onlineProduct.product.images[0].url
    }

    return product
}
