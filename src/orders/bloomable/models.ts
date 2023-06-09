export class Order {
  id: string | undefined;
  number: number | undefined;
  createdAt: Date | undefined;
  partner: string = "";
  clientName: string = "";
  clientEmail: string | undefined;
  clientPhones: string[] = [];
  deliverAtDate: Date | undefined;
  paymentType: string | undefined;
  florist: string | undefined;
  orderValue: number | undefined;
  orderCosts: number | undefined;
  accepted: boolean = false;
  delivered: boolean = false;
  deleted: boolean = false;
  recipient: Recipient | null | undefined;  // null when recipient not available, undefined when recipient not yet fetched
  products: Product[] | undefined;

  static clone(from: Order): Order {
    const to = new Order();
    to.id = from.id;
    to.number = from.number;
    to.createdAt = from.createdAt;
    to.partner = from.partner;
    to.clientName = from.clientName;
    to.clientEmail = from.clientEmail;
    to.clientPhones = from.clientPhones;
    to.deliverAtDate = from.deliverAtDate;
    to.paymentType = from.paymentType;
    to.florist = from.florist;
    to.orderValue = from.orderValue;
    to.orderCosts = from.orderCosts;
    to.accepted = from.accepted;
    to.delivered = from.delivered;
    to.deleted = from.deleted;
    to.recipient = from.recipient ? Recipient.clone(from.recipient) : from.recipient;
    to.products = from.products?.map(it => Product.clone(it));
    return to;
  }
}

export class Recipient {
  name: string = "";
  phones: string[] = [];
  company: string = "";
  unit: string = "";
  address: string = "";
  message: string | undefined;
  specialInstructions: string | undefined;

  static clone(from: Recipient): Recipient {
    const to = new Recipient();
    to.name = from.name;
    to.phones = from.phones;
    to.company = from.company;
    to.unit = from.unit;
    to.address = from.address;
    to.message = from.message;
    to.specialInstructions = from.specialInstructions;
    return to;
  }
}

export class ProductExtra {
  name: string | undefined;
  description: string | undefined;
  image: string | undefined;

  static clone(from: ProductExtra): ProductExtra {
    const to = new ProductExtra();
    to.name = from.name;
    to.description = from.description;
    to.image = from.image;
    return to;
  }
}

export class Product {
  name: string | undefined;
  size: string | undefined;
  quantity: string | undefined;
  retailPrice: number | undefined;
  guidelines: string | undefined;
  description: string | undefined;
  image: string | undefined;
  extras: ProductExtra[] | undefined;

  static clone(from: Product): Product {
    const to = new Product();
    to.name = from.name;
    to.size = from.size;
    to.quantity = from.quantity;
    to.retailPrice = from.retailPrice;
    to.guidelines = from.guidelines;
    to.description = from.description;
    to.image = from.image;
    to.extras = from.extras?.map(it => ProductExtra.clone(it));
    return to;
  }
}
