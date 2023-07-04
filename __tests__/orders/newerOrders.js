import {Orders} from "../../src/orders/orders";
import {BloomableScraper} from "../../src/bloomable/scraper";
import {Order} from "../../src/bloomable/models";

jest.mock("bloomablelogistics-server/src/bloomable/scraper");

describe("orders get newest orders", () => {
    const username = "test";

    const createOrder = (number) => {
        const order = new Order();
        order.number = number;
        return order;
    }
    const order1 = createOrder(1);
    const order2 = createOrder(2);
    const order3 = createOrder(3);
    const order4 = createOrder(4);

    BloomableScraper.sort.mockImplementation((orders) => orders
        .sort((a, b) => (a.number || 0) - (b.number || 0))
        .reverse()
    )

    beforeEach(() => {
        Orders.resetKnownOrders(username)
    })

    it("sees newer orders and mark these as read", () => {
        BloomableScraper.fetchPage.mockImplementationOnce(() => Promise.resolve([order1, order2]))
        BloomableScraper.fetchPage.mockImplementationOnce(() => Promise.resolve([order1, order2, order3]))
        BloomableScraper.fetchPage.mockImplementationOnce(() => Promise.resolve([order2, order3]))
        return Orders.newerOrders({username: username, password: ""}, true)
            .then(result => expect(result.length).toBe(0))
            .then(() => Orders.newerOrders({username: username, password: ""}, true))
            .then(result => {
                expect(result.length).toBe(1)
                expect(result[0].number).toBe(3)
            })
            .then(() => Orders.newerOrders({username: username, password: ""}, true))
            .then(result => expect(result.length).toBe(0))
    })

    it("sees newer orders even if order numbers are not greater than previously known numbers", () => {
        BloomableScraper.fetchPage.mockImplementationOnce(() => Promise.resolve([order1, order3]))
        BloomableScraper.fetchPage.mockImplementationOnce(() => Promise.resolve([order1, order2, order3, order4]))
        return Orders.newerOrders({username: username, password: ""}, true)
            .then(result => expect(result.length).toBe(0))
            .then(() => Orders.newerOrders({username: username, password: ""}, true))
            .then(result => {
                console.log(result)
                expect(result.length).toBe(2)
                expect(result[0].number).toBe(4)
                expect(result[1].number).toBe(2)
            })
    })

    it("dismisses new order numbers smaller than smallest known number", () => {
        BloomableScraper.fetchPage.mockImplementationOnce(() => Promise.resolve([order2, order3]))
        BloomableScraper.fetchPage.mockImplementationOnce(() => Promise.resolve([order1, order2, order3, order4]))
        return Orders.newerOrders({username: username, password: ""}, true)
            .then(result => expect(result.length).toBe(0))
            .then(() => Orders.newerOrders({username: username, password: ""}, true))
            .then(result => {
                console.log(result)
                expect(result.length).toBe(1)
                expect(result[0].number).toBe(4)
            })
    })
})
