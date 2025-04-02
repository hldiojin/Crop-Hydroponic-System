import api from "../context/AuthContext";

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderData {
  items: OrderItem[];
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
  };
  shippingMethod: string;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

export const submitOrder = async (orderData: OrderData): Promise<any> => {
  try {
    const response = await api.post("/order", orderData);
    return response.data;
  } catch (error) {
    console.error("Error submitting order:", error);
    throw error;
  }
};

export const processTransaction = async (transactionId: string): Promise<any> => {
  try {
    const response = await api.post("/transaction", transactionId);
    return response.data;
  } catch (error) {
    console.error("Error processing transaction:", error);
    throw error;
  }
};
