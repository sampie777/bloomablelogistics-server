import {Orders} from "../../src/orders/orders";
import {Order, Recipient} from "../../src/bloomable/models";
import {formatDateToWords} from "../../src/utils";

describe("orders check", () => {
    const today = new Date();

    const order1Day1 = new Order();
    order1Day1.number = 110;
    order1Day1.deliverAtDate = today;
    order1Day1.recipient = new Recipient();
    order1Day1.recipient.name = "T. Oday";

    const order2Day1 = new Order();
    order2Day1.number = 111;
    order2Day1.deliverAtDate = today;
    order2Day1.recipient = new Recipient();
    order2Day1.recipient.name = "T. Oday 2";

    const order1Day2 = new Order();
    order1Day2.number = 112;
    order1Day2.deliverAtDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    order1Day2.recipient = new Recipient();
    order1Day2.recipient.name = "T. Omorrow 1";

    const order1Day3 = new Order();
    order1Day3.number = 113;
    order1Day3.deliverAtDate = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
    order1Day3.recipient = new Recipient();
    order1Day3.recipient.name = "T. Omorrow 1";

    it("no orders", () => {
        expect(Orders.createNewOrdersMessage([])).toBe("No new orders received.");
    })

    it("one order for today", () => {
        expect(Orders.createNewOrdersMessage([order1Day1])).toBe("1 new order received for today.\nOrder: 110.");
    })

    it("one order for tomorrow", () => {
        expect(Orders.createNewOrdersMessage([order1Day2])).toBe("1 new order received for tomorrow.\nOrder: 112.");
    })

    it("one order for later", () => {
        const date = formatDateToWords(order1Day3.deliverAtDate, "%dddd (%dd-%mm-%YYYY)");
        expect(Orders.createNewOrdersMessage([order1Day3])).toBe(`1 new order received for ${date}.\nOrder: 113.`);
    })

    it("two orders for today", () => {
        expect(Orders.createNewOrdersMessage([order1Day1, order2Day1])).toBe("2 new orders received for today.\nOrders: 110, 111.");
    })

    it("two orders for later", () => {
        expect(Orders.createNewOrdersMessage([order1Day2, order1Day3])).toBe("2 new orders received for tomorrow and later.\nOrders: 112, 113.");
    })

    it("two orders for later in reversed order", () => {
        expect(Orders.createNewOrdersMessage([order1Day3, order1Day2])).toBe("2 new orders received for tomorrow and later.\nOrders: 112, 113.");
    })

    it("three orders for today and tomorrow", () => {
        expect(Orders.createNewOrdersMessage([order1Day1, order2Day1, order1Day2])).toBe("3 new orders received for today and later.\nOrders: 110, 111, 112.");
    })
})
