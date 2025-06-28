export interface OrderItemInput {
  productId: number;
  quantity: number;
  price: number;
}

export interface OrderInput {
  userId: number;
  items: OrderItemInput[];
  totalAmount: number;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}