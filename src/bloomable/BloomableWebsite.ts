import fetch, {Response} from "node-fetch";
import {HttpCode} from "../http";
import {Auth} from "../auth";
import {Order, Product, Recipient} from "./models";
import {emptyPromise} from "../utils";

export namespace BloomableWebsite {

    type OrderStatus = "open" | "accepted" | "fulfilled" | "delivered" | "cancelled";

    interface Session {
        xsrfToken?: string
        sessionToken?: string
    }

    interface BloomableProduct {
        id: number,
        title: string,
        product: {
            id: number,
            title: string,
            slug: string,
            description: string,
            images: Array<{
                id: number,
                altText: null,
                height: number,
                width: number,
                url: string
            }>,
            variants: Array<{
                id: number,
                title: string,
                sku: string,
            }>
        },
        component_rates: Array<{
            id: number,
            quantity: number,
            component_rate: {
                id: number,
                component: {
                    id: number,
                    name: string,
                    slug: string,
                    container: boolean,
                    exclude_auto_calculations: boolean,
                    show_on_menu: boolean,
                    unit: {
                        id: number,
                        name: string,
                    },
                    colour: {
                        id: number,
                        name: string,
                    },
                    hasImage: boolean
                }
            }
        }>
    }

    interface ProductResponse {
        data: BloomableProduct
    }

    interface BloomableOrder {
        id: string,
        name: string,
        firstName: string,
        lastName: string,
        phone: string,
        address1: string,
        address2: string | null,
        city: string,
        country: string,
        latitude: number,
        longitude: number,
        created_at: string,
        deliveryDate: string,
        lines: Array<{
            id: number,
            title: string,
            status: OrderStatus,
            quantity: number,
            giftMessage: string,
            productVariantId: number,
            value: number,
            returns: []
        }>,
        adjustments: [],
        status: OrderStatus,
        totalValue: number,
        deliveryFee: string,
        notes: string | null,
        onPay: number,
    }

    interface OrdersResponse {
        data: BloomableOrder[],
        links: {
            first: string,
            last: string,
            prev: string | null,
            next: string | null
        },
        meta: {
            current_page: number,
            from: number | null,
            last_page: number,
            links: Array<{
                url: string | null,
                label: string,
                active: boolean
            }>,
            path: string,
            per_page: number,
            to: number | null,
            total: number
        }
    }

    interface MeResponseCity {
        id: number,
        name: string,
    }

    interface MeResponse {
        data: {
            id: number,
            name: string,
            email: string,
            partner: {
                id: number,
                name: string,
                radius: number,
                address1: string,
                address2: null,
                address3: null,
                suburb: {
                    id: number,
                    name: string,
                    city: MeResponseCity
                },
                city: MeResponseCity,
                province: {
                    id: number,
                    name: string,
                },
                country: string,
                postalCode: string,
                latitude: number,
                longitude: number,
                enabled: boolean,
                vatNumber: string,
                partnerType: "Florist" | string,
                ownerName: string,
                ownerEmail: string,
                ownerPhone: string,
                businessEmail: string,
                businessPhone: string,
                rating: number,
                bankName: null,
                branchCode: null,
                accountName: null,
                accountNumber: null,
                accountType: null,
                avbobSalesChannel: boolean,
                b2bSalesChannel: boolean,
                inStoreSalesChannel: boolean,
                webSalesSalesChannel: boolean,
            },
            phoneNumber: string,
            role: {
                id: number,
                name: "Partner" | string,
                slug: "partner" | string,
            },
            isAdmin: boolean,
            enabled: boolean,
        }
    }

    const obtainResponseContent = (response: Response): Promise<string> => {
        const contentType = response.headers.get("content-type");
        if (contentType === "application/json") return response.json().catch(e => {
            console.error("Could not convert response to json", e)
            return ""
        })
        return response.text().catch(e => {
            console.error("Could not convert response to text", e)
            return ""
        })
    }

    export const getCookieValue = (cookies: string, key: string): string | undefined => {
        const cookie = cookies.split(",")
            .flatMap(cookie => cookie.split(";"))
            .find(it => it.trim().startsWith(`${key}=`));

        if (!cookie) return undefined;

        const part = cookie.trim();
        return part.substring(`${key}=`.length, part.length);
    }

    const getNewSession = (response: Response) => {
        const cookies = response.headers.get('Set-Cookie')
        if (cookies == null) {
            throw new Error("Didn't receive XSRF cookies")
        }

        return {
            xsrfToken: getCookieValue(cookies, "XSRF-TOKEN"),
            sessionToken: getCookieValue(cookies, "bloomable_session")
        };
    }

    const verifySession = (session: Session) => {
        if (session.xsrfToken == null) throw new Error("Didn't receive XSRF-TOKEN cookie")
        if (session.sessionToken == null) throw new Error("Didn't receive bloomable_session cookie")
    }

    const sessionToHeader = (session: Session) => {
        return {
            "X-XSRF-TOKEN": `${session.xsrfToken?.replace("%3D", "=")}`,
            cookie: `XSRF-TOKEN: ${session.xsrfToken}; bloomable_session=${session.sessionToken}`
        }
    }

    export const getXSRFCookies = (): Promise<Session> => {
        console.log("Getting XSRF cookies")
        return fetch("https://dashboard.bloomable.com/sanctum/csrf-cookie")
            .then(response => {
                const session = getNewSession(response);
                verifySession(session);

                return session
            })
            .catch(e => {
                console.error("Could not get XSRF tokens", e)
                throw e
            })
    }

    export const login = (credentials: Auth.Credentials): Promise<Session> =>
        getXSRFCookies()
            .then(session => {
                console.log(`Logging in for ${credentials.username}`)
                return fetch("https://dashboard.bloomable.com/api/login", {
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        ...sessionToHeader(session)
                    },
                    body: `{"email":"${credentials.username}","password":"${credentials.password}"}`,
                    method: "POST",
                })
            })
            .then(response => {
                console.log(...response.headers)

                if (response.status === HttpCode.OK) {
                    const session = getNewSession(response);
                    verifySession(session);

                    console.log("Logged in!", session)
                    return session
                }

                return obtainResponseContent(response).then(content => {
                    if (response.status === HttpCode.NoContent) {
                        throw new Error(`Logged in with no content. Payload: ${content}`)
                    } else if (response.status === HttpCode.UnprocessableContent) {
                        throw new Error(`Auth error. Payload: ${JSON.stringify(content)}`)
                    } else if (response.status === HttpCode.PageExpired) {
                        throw new Error(`XSRF failed. Payload: ${content}`)
                    }
                    throw new Error(`No idea whats going on (status=${response.status}). Payload: ${content}`)
                })
            })
            .catch(e => {
                console.error("Could not log in", e)
                throw e
            })

    export const orders = (credentials: Auth.Credentials): Promise<Order[]> =>
        login(credentials)
            .then(session => {
                console.log("Getting orders")
                return fetch("https://dashboard.bloomable.com/api/orders?page=1&s=created_at&d=desc",
                    {
                        headers: {
                            "Accept": "application/json",
                            "Referer": "https://dashboard.bloomable.com/dashboard",
                            ...sessionToHeader(session)
                        }
                    })
            })
            .then(response => {
                const session = getNewSession(response);
                console.log("Orders status", response.status, session)
                return response.json() as Promise<OrdersResponse>
            })
            .then(d => {
                console.log("Orders data", d)
                return convertToLocalOrder(d.data)
            })
            .catch(e => {
                console.error("Could not get orders", e)
                throw e
            })

    export const getProduct = (credentials: Auth.Credentials, product: { id: number }): Promise<Product> =>
        login(credentials)
            .then(session => {
                console.log("Getting product")
                return fetch(`https://dashboard.bloomable.com/api/product-variants/${product.id}`,
                    {
                        headers: {
                            "Accept": "application/json",
                            "Referer": "https://dashboard.bloomable.com/dashboard",
                            ...sessionToHeader(session)
                        }
                    })
            })
            .then(response => {
                const session = getNewSession(response);
                console.log("Product status", response.status, session)
                return response.json() as Promise<ProductResponse>
            })
            .then(d => {
                console.log("Product data", d)
                return convertToLocalProduct(d.data)
            })
            .catch(e => {
                console.error("Could not get product", e)
                throw e
            })

    export const acceptOrder = (credentials: Auth.Credentials, order: { id: number }): Promise<any> =>
        login(credentials)
            .then(session => {
                console.log("Accepting order")
                return fetch(`https://dashboard.bloomable.com/api/orders/${order.id}/accept`,
                    {
                        headers: {
                            "Accept": "application/json",
                            "Referer": "https://dashboard.bloomable.com/dashboard",
                            ...sessionToHeader(session)
                        },
                        method: "POST"
                    })
            })
            .then(response => {
                const session = getNewSession(response);
                console.log("Order accept status", response.status, session)
                if (response.status != 200) {
                    throw new Error("Failed to accept order")
                }
            })
            .catch(e => {
                console.error("Could not accept order", e)
                throw e
            })

    export const me = (credentials: Auth.Credentials): Promise<MeResponse> =>
        login(credentials)
            .then(session => {
                console.log("Getting me details")
                return fetch("https://dashboard.bloomable.com/api/me",
                    {
                        headers: {
                            "Accept": "application/json",
                            "Referer": "https://dashboard.bloomable.com/dashboard",
                            ...sessionToHeader(session)
                        }
                    })
            })
            .then(response => {
                const session = getNewSession(response);
                console.log("Me status", response.status, session)
                return response.json()
            })
            .then(d => {
                console.log("Me data", d)
                return d
            })
            .catch(e => {
                console.error("Could not get me details", e)
                throw e
            })

    const convertToLocalOrder = (orders: BloomableOrder[]): Order[] =>
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

    const convertToLocalProduct = (onlineProduct: BloomableProduct): Product => {
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

    const loadOrderProducts = (credentials: Auth.Credentials, order: Order): Promise<any> => {
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
