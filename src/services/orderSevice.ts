import api from "../context/AuthContext";

export interface OrderProduct {
  id: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderDevice {
  id: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderData {
  products: OrderProduct[];
  devices: OrderDevice[];
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

// Thêm hàm mới để kiểm tra trạng thái thanh toán và cập nhật đơn hàng
export const checkTransactionStatus = async (orderId: string): Promise<any> => {
  try {
    console.log(`Checking transaction status for order ${orderId}`);
    const response = await api.post("/transaction/check", { orderId });
    return response.data;
  } catch (error) {
    console.error("Error checking transaction status:", error);
    throw error;
  }
};
