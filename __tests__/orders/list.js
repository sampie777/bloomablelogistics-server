import {Orders} from "../../src/orders/orders";
import {Order} from "../../src/orders/models";
import {BloomableApi} from "../../src/bloomable/BloomableApi";

jest.mock("bloomablelogistics-server/src/bloomable/BloomableWebsite");

describe("orders list", () => {
    BloomableApi.getOrders.mockImplementation(() => Promise.resolve([new Order()]))

    it("lists orders", () => {
        return Orders.list({username: "username", password: "password"})
            .then((orders) => {
                expect(orders.length).toBe(1)
            })
    })
})
