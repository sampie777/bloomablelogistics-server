import {Auth} from "../auth";
import {Order, Product} from "../orders/models";
import {emptyPromise} from "../utils";
import {MeResponse, OrderResponse, OrdersResponse, OrderStatus, ProductResponse} from "./serverModels";
import {convertToLocalOrder, convertToLocalOrders, convertToLocalProduct} from "./converter";
import {BloomableAuth} from "./auth";

export namespace BloomableApi {

    export const getOrders = (credentials: Auth.Credentials, withStatus: OrderStatus | "all" = "all"): Promise<Order[]> => {
        console.log("Getting orders")
        return BloomableAuth.authenticatedFetch(credentials,
            `https://dashboard.bloomable.com/api/orders?page=1&s=created_at&d=desc${withStatus === "all" ? "" : `&filter=${withStatus}`}`,
            {
                headers: {
                    "Accept": "application/json",
                    "Referer": "https://dashboard.bloomable.com/dashboard",
                },
            })
            .then(response => response.json() as Promise<OrdersResponse | undefined>)
            .then(json => {
                if (json === undefined || json.data === undefined || !Array.isArray(json.data)) {
                    throw new Error(`Response for getOrders is not the expected array but '${JSON.stringify(json)}'`)
                }
                return convertToLocalOrders(json.data)
            })
            .catch(e => {
                console.error("Could not get orders", {error: e});
                throw e;
            })
    }

    export const getOrder = (credentials: Auth.Credentials, order: { id: string }): Promise<Order> => {
        return BloomableAuth.authenticatedFetch(credentials,
            `https://dashboard.bloomable.com/api/orders/${order.id}`,
            {
                headers: {
                    "Accept": "application/json",
                    "Referer": "https://dashboard.bloomable.com/dashboard",
                },
            })
            .then(response => response.json() as Promise<OrderResponse>)
            .then(json => convertToLocalOrder(json.data))
            .catch(e => {
                console.error("Could not get order", {
                    error: e,
                    order: order,
                });
                throw e;
            });
    };

    export const getProduct = (credentials: Auth.Credentials, product: { id: number }): Promise<Product> => {
        console.log("Getting product", {product: product})
        return BloomableAuth.authenticatedFetch(credentials,
            `https://dashboard.bloomable.com/api/product-variants/${product.id}`,
            {
                headers: {
                    "Accept": "application/json",
                    "Referer": "https://dashboard.bloomable.com/dashboard",
                },
            })
            .then(response => response.json() as Promise<ProductResponse>)
            .then(json => convertToLocalProduct(json.data))
            .catch(e => {
                console.error("Could not get product", {error: e, product: product});
                throw e;
            })
    }

    export const acceptOrder = (credentials: Auth.Credentials, order: { id: number }): Promise<any> => {
        console.log("Accepting order", {order: order})
        return BloomableAuth.authenticatedFetch(credentials,
            `https://dashboard.bloomable.com/api/orders/${order.id}/accept`,
            {
                headers: {
                    "Accept": "application/json",
                    "Referer": "https://dashboard.bloomable.com/dashboard",
                },
                method: "POST",
            })
            .then(response => {
                if (response.status !== 200) {
                    throw new Error(`Failed to accept order (status=${response.status})`);
                }
            })
            .catch(e => {
                console.error("Could not accept order", {error: e, order: order});
                throw e;
            })
    }

    export const getProfile = (credentials: Auth.Credentials): Promise<MeResponse> => {
        console.log("Getting me details")
        return BloomableAuth.authenticatedFetch(credentials,
            "https://dashboard.bloomable.com/api/me",
            {
                headers: {
                    "Accept": "application/json",
                    "Referer": "https://dashboard.bloomable.com/dashboard",
                }
            })
            .then(response => response.json())
            .catch(e => {
                console.error("Could not get me details", {error: e});
                throw e;
            })
    }

    export const loadOrderProducts = (credentials: Auth.Credentials, order: Order): Promise<any> => {
        if (order.products == null) return emptyPromise()
        return Promise.all(order.products?.map(product =>
            getProduct(credentials, product)
                .then(it => {
                    product.name = it.name;
                    product.size = it.size;
                    product.description = it.description;
                    product.guidelines = it.guidelines;
                    product.image = it.image;
                    product.extras = it.extras;
                    product._detailsLoaded = true;
                })
        ))
    }
}
