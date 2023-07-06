import {Orders} from "../../src/orders/orders";
import {BloomableScraper} from "../../src/bloomable/scraper";
import {Order} from "../../src/orders/models";

jest.mock("bloomablelogistics-server/src/bloomable/scraper");

describe("orders list", () => {
    BloomableScraper.sort.mockImplementation((orders) => orders)
    BloomableScraper.fetchPage.mockImplementation(() => Promise.resolve([new Order()]))

    it("lists orders", () => {
        return Orders.list({username: "username", password: "password"})
            .then((orders) => {
                expect(orders.length).toBe(1)
            })
    })
})
