export interface Product {
  id: number;
  name: string;
  price: number;
}

export interface ProductInput {
  name: string;
  price: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
}
