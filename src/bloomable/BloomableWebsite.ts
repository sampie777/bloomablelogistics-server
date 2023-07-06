import {Auth} from "../auth";
import {Order, Product} from "../orders/models";
import {emptyPromise} from "../utils";
import {MeResponse, OrdersResponse, ProductResponse} from "./serverModels";
import {authenticatedFetch} from "./auth";
import {convertToLocalOrder, convertToLocalProduct} from "./converter";

export namespace BloomableWebsite {

    export const getOrders = (credentials: Auth.Credentials): Promise<Order[]> => {
        console.log("Getting orders")
        return authenticatedFetch(credentials,
            "https://dashboard.bloomable.com/api/orders?page=1&s=created_at&d=desc",
            {
                headers: {
                    "Accept": "application/json",
                    "Referer": "https://dashboard.bloomable.com/dashboard",
                }
            })
            .then(response => response.json() as Promise<OrdersResponse>)
            .then(json => convertToLocalOrder(json.data))
            .catch(e => {
                console.error("Could not get orders", {error: e})
                throw e
            })
    }

    export const getProduct = (credentials: Auth.Credentials, product: { id: number }): Promise<Product> => {
        console.log("Getting product", {product: product})
        return authenticatedFetch(credentials,
            `https://dashboard.bloomable.com/api/product-variants/${product.id}`,
            {
                headers: {
                    "Accept": "application/json",
                    "Referer": "https://dashboard.bloomable.com/dashboard",
                }
            })
            .then(response => response.json() as Promise<ProductResponse>)
            .then(json => convertToLocalProduct(json.data))
            .catch(e => {
                console.error("Could not get product", {error: e, product: product})
                throw e
            })
    }

    export const acceptOrder = (credentials: Auth.Credentials, order: { id: number }): Promise<any> => {
        console.log("Accepting order", {order: order})
        return authenticatedFetch(credentials,
            `https://dashboard.bloomable.com/api/orders/${order.id}/accept`,
            {
                headers: {
                    "Accept": "application/json",
                    "Referer": "https://dashboard.bloomable.com/dashboard",
                },
                method: "POST"
            })
            .then(response => {
                if (response.status != 200) {
                    console.log("Order accept status", response.status)
                    throw new Error("Failed to accept order")
                }
            })
            .catch(e => {
                console.error("Could not accept order", {error: e, order: order})
                throw e
            })
    }

    export const getProfile = (credentials: Auth.Credentials): Promise<MeResponse> => {
        console.log("Getting me details")
        return authenticatedFetch(credentials,
            "https://dashboard.bloomable.com/api/me",
            {
                headers: {
                    "Accept": "application/json",
                    "Referer": "https://dashboard.bloomable.com/dashboard",
                }
            })
            .then(response => response.json())
            .catch(e => {
                console.error("Could not get me details", {error: e})
                throw e
            })
    }

    export const loadOrderProducts = (credentials: Auth.Credentials, order: Order): Promise<any> => {
        if (order.products == null) return emptyPromise()
        return Promise.all(order.products?.map(product =>
            getProduct(credentials, product)
                .then(it => {
                    product.name = it.name
                    product.size = it.size
                    product.description = it.description
                    product.guidelines = it.guidelines
                    product.image = it.image
                })
        ))
    }
}
