import {BloomableApi} from "../../../src/bloomable/api";
import {Product} from "../../../src/orders/models";
import {BloomableAuth} from "../../../src/bloomable/auth";
import {Secrets} from "../../../src/secrets";

describe.skip("BloomableWebsite", () => {
    const validUser = {
        username: Secrets.read("BLOOMABLE_CLIENT1_USERNAME") ?? "",
        password: Secrets.read("BLOOMABLE_CLIENT1_PASSWORD") ?? "",
    };

    it("loads secrets from .env", () => {
        expect(validUser.username.length).toBeGreaterThan(0)
        expect(validUser.password.length).toBeGreaterThan(0)
    })

    it("getXSRFCookies", () => {
        return BloomableAuth.getXSRFCookies().then(session => {
            expect(session.xsrfToken.length).toBeGreaterThan(300)
            expect(session.sessionToken.length).toBeGreaterThan(300)
        })
    })

    it("login", () => {
        return BloomableAuth.login({username: "test@gmail.com", password: "test"})
    }, 60000)

    it("orders", () => {
        return BloomableApi.getOrders(validUser, "open")
            .then(obj => {
                expect(obj).toStrictEqual([])
            })
    }, 60000)

    it("product", () => {
        const product = new Product()
        product.id = 347
        product.name = "Pure Bouquet"
        product.size = "Small \/ No"
        product.description = "<meta charset=\"utf-8\">\n<p><strong>A pure white and green bouquet perfect for sympathy occasions or for someone in your life that loves classic white flowers. \u00a0<\/strong><\/p>\n<p>Flowers included in this beautiful creation may differ subject to seasonal and flower market availability. Our team will inform you if there are any major changes but we will do our best to ensure that it looks like what you see on our website.<\/p>\n<p><span>Thank you for supporting local South African florists. #SupportLocal<\/span><\/p>"
        product.guidelines = "1 x Additional Delivery fee - 1 Single (Clear)\n" +
            "4 x White Chrysanthemums - 1 Single (White)\n" +
            "1 x Kraft Paper - 1 Stem (Single Bud) (Brown)\n" +
            "4 x White Gerbera - 1 Stem (Single Bud) (White)\n" +
            "6 x Greenery - 1 Stem (Single Bud) (Green)\n" +
            "1 x Twyne - 1 Stem (Single Bud) (Brown)\n" +
            "5 x White Roses - 1 Stem (Single Bud) (White)\n" +
            "2 x Wax White - 1 Stem (Single Bud) (White)"
        product.image = "https:\/\/cdn.shopify.com\/s\/files\/1\/0686\/5315\/4621\/products\/f6ff736f-ae29-406b-ba0e-1d1406a0fd42.jpg?v=1687248191"

        return BloomableApi.getProduct(validUser, {id: 347})
            .then(() => BloomableApi.getProduct(validUser, {id: 347}))
            .then(obj => {
                expect(obj).toStrictEqual(product)
            })
    }, 60000)

    it("me details", () => {
        return BloomableApi.getProfile(validUser)
            .then(obj => {
                expect(obj).toStrictEqual({
                        "data": {
                            "id": 53,
                            "name": "Elmarie De Kok",
                            "email": "elmonicab@gmail.com",
                            "partner": {
                                "id": 49,
                                "name": "Elmonica Florist",
                                "radius": 50,
                                "address1": "Plot 133 Kameeldrif-wes Pretoria",
                                "address2": null,
                                "address3": null,
                                "suburb": {
                                    "id": 2544,
                                    "name": "Kameeldrift West",
                                    "city": {"id": 2446, "name": "Pretoria (Tshwane)"}
                                },
                                "city": {"id": 2446, "name": "Pretoria (Tshwane)"},
                                "province": {"id": 2177, "name": "Pretoria (Tshwane) and surrounds"},
                                "country": "South Africa",
                                "postalCode": "0068",
                                "latitude": -25.7118625,
                                "longitude": 28.0020052,
                                "enabled": true,
                                "vatNumber": "4350173490",
                                "partnerType": "Florist",
                                "ownerName": "Elmarie De Kock",
                                "ownerEmail": "elmonicab@gmail.com",
                                "ownerPhone": "082 318 2136 083 457 7321",
                                "businessEmail": "elmonicab@gmail.com",
                                "businessPhone": "0823182136",
                                "rating": 5,
                                "bankName": null,
                                "branchCode": null,
                                "accountName": null,
                                "accountNumber": null,
                                "accountType": null,
                                "avbobSalesChannel": true,
                                "b2bSalesChannel": false,
                                "inStoreSalesChannel": true,
                                "webSalesSalesChannel": true
                            },
                            "phoneNumber": "0823182136",
                            "role": {"id": 1, "name": "Partner", "slug": "partner"},
                            "isAdmin": false,
                            "enabled": true
                        }
                    }
                )
            })
    }, 60000)
})
