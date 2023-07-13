export type OrderStatus = "open" | "accepted" | "fulfilled" | "delivered" | "cancelled";

export interface BloomableProduct {
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

export interface ProductResponse {
    data: BloomableProduct;
}

export interface BloomableOrder {
    id: string,
    name: string,
    firstName: string,
    lastName: string,
    company: string | null,
    phone: string | null,
    address1: string,
    address2: string | null,
    postalCode: string | null,
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
    notes: string | null,
    totalValue: number,
    onPay: number,
    deliveryFee: string,
}

export interface OrdersResponse {
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

export interface OrderResponse {
    data: BloomableOrder;
}

export interface MeResponseCity {
    id: number,
    name: string,
}

export interface MeResponse {
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
    };
}
