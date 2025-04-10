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

export interface OrderDetailItem {
  orderDetailsId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface UserAddress {
  addressId: string;
  name: string;
  phone: string;
  address: string;
  status: string;
  longitude: number;
  latitude: number;
}

export interface Transaction {
  transactionId: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

export interface OrderDetail {
  orderId: string;
  price: number;
  shippingFee: number;
  totalPrice: number;
  status: string;
  orderDetailsItems: OrderDetailItem[];
  userAddress: UserAddress;
  transactions: Transaction[];
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

export const getOrderById = async (orderId: string): Promise<any> => {
  try {
    const response = await api.get(`/order/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    throw error;
  }
};

export const processTransaction = async (orderId: string): Promise<any> => {
  try {
    const response = await api.post("/transaction", orderId);
    return response.data;
  } catch (error) {
    console.error("Error processing transaction:", error);
    throw error;
  }
};

export const processCodTransaction = async (orderId: string): Promise<any> => {
  try {
    const response = await api.post("/transaction/cod", orderId);
    return response.data;
  } catch (error) {
    console.error("Error processing COD transaction:", error);
    throw error;
  }
};

export const checkTransactionStatus = async (orderId: string): Promise<any> => {
  try {
    // Extract transaction ID from PayOS URL if it's a URL
    let transactionId = orderId;
    if (orderId.includes("pay.payos.vn/web/")) {
      const urlParts = orderId.split("/");
      transactionId = urlParts[urlParts.length - 1];
    }

    // If the transaction ID is empty or invalid, return error
    if (!transactionId || transactionId.length < 5) {
      console.error("Invalid transaction ID:", transactionId);
      return {
        statusCodes: 400,
        response: { success: false, message: "Invalid transaction ID" }
      };
    }

    console.log(`Checking transaction status for transaction ${transactionId}`);
    const response = await api.post(`/transaction/check`, transactionId);
    return response.data;
  } catch (error) {
    console.error("Error checking transaction status:", error);
    throw error;
  }
};
