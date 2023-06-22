import {Orders} from "../../src/orders/orders";
import {Order, Recipient} from "../../src/bloomable/models";

describe("orders check", () => {
    const order1Day1 = new Order();
    order1Day1.number = 110;
    order1Day1.deliverAtDate = new Date(1687417215824);
    order1Day1.recipient = new Recipient();
    order1Day1.recipient.name = "T. Oday";

    const order2Day1 = new Order();
    order2Day1.number = 111;
    order2Day1.deliverAtDate = new Date(1687417215824);
    order2Day1.recipient = new Recipient();
    order2Day1.recipient.name = "T. Oday 2";

    const order1Day2 = new Order();
    order1Day2.number = 112;
    order1Day2.deliverAtDate = new Date(1687417215824 + 24 * 60 * 60 * 1000);
    order1Day2.recipient = new Recipient();
    order1Day2.recipient.name = "T. Omorrow 1";

    it("no orders", () => {
        expect(Orders.createNewOrdersMessage([])).toBe("No new orders received.");
    })

    it("one order", () => {
        expect(Orders.createNewOrdersMessage([order1Day1])).toBe("1 new order received.\nOrder: 110");
    })

    it("two orders", () => {
        expect(Orders.createNewOrdersMessage([order1Day1, order2Day1])).toBe("2 new orders received.\nOrders: 110, 111");
    })

    it("three orders", () => {
        expect(Orders.createNewOrdersMessage([order1Day1, order2Day1, order1Day2])).toBe("3 new orders received.\nOrders: 110, 111, 112");
    })
})
