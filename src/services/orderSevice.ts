import api from "../context/AuthContext";
import { EditShippingFormData } from "../pages/ShippingPage";

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
  paymentLinkId: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

export interface OrderDetail {
  orderId: string;
  orderPrice: number;
  shippingFee: number;
  price: number;
  status: string;
  orderDetailsItems: OrderDetailItem[];
  userAddress: UserAddress;
  transactions: Transaction[];
}

export interface OrderDetailPayment {
  orderId: string;
  orderPrice: number;
  shippingPrice: number;
  totalPrice: number;
  statusPayment: string;
  orderProductItem: OrderDetailItemPayment[];
  userAddress: UserAddress;
  transactions: Transaction[];
}

export interface OrderDetailItemPayment {
  id: string;
  attachment: string;
  productName: string;
  productItemName: number;
  serial?: string | null;
  quantity: number;
  unitPrice: number;
}

export interface OrderSummary {
  id: string;
  userId: string;
  fullName: string;
  userAddressId: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface OrdersResponse {
  statusCodes: number;
  response: {
    data: OrderSummary[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    lastPage: boolean;
  };
}

export const submitOrder = async (orderData: OrderData): Promise<any> => {
  try {
    const response = await api.post("/order", orderData);
    var newToken = response.headers["new-access-token"];
    if (newToken != null) {
      const newToken = response.headers["new-access-token"];
      localStorage.setItem("authToken", newToken);
    }
    return response.data;
  } catch (error: any) {
    console.error("Error submitting order:", error);

    // If the error has a response (meaning the server responded with an error status)
    // return the response data so the component can handle the error message
    if (error.response && error.response.data) {
      return error.response.data;
    }

    // For other types of errors (network issues, etc.), throw the error
    throw error;
  }
};

export const getOrderById = async (orderId: string): Promise<any> => {
  try {
    const response = await api.get(`/order/${orderId}`);
    var newToken = response.headers["new-access-token"];
    if (newToken != null) {
      const newToken = response.headers["new-access-token"];
      localStorage.setItem("authToken", newToken);
    }
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    throw error;
  }
};

export const getCODBilling = async (orderId: string): Promise<any> => {
  try {
    const response = await api.get(`/transaction/cod/${orderId}`);
    var newToken = response.headers["new-access-token"];
    if (newToken != null) {
      const newToken = response.headers["new-access-token"];
      localStorage.setItem("authToken", newToken);
    }
    return response.data;
  } catch (error) {
    console.error(`Error fetching COD billing for order ${orderId}:`, error);
    throw error;
  }
};

export const cancelOrder = async (orderId: string): Promise<any> => {
  try {
    const response = await api.post(`/order/cancel`, orderId);
    var newToken = response.headers["new-access-token"];
    if (newToken != null) {
      const newToken = response.headers["new-access-token"];
      localStorage.setItem("authToken", newToken);
    }
    return response.data;
  } catch (error) {
    console.error(`Error cancelling order ${orderId}:`, error);
    throw error;
  }
};

export const getAllOrders = async (
  pageIndex: number = 1,
  pageSize: number = 10
): Promise<OrdersResponse> => {
  try {
    const response = await api.get(
      `/order/me?pageIndex=${pageIndex}&pageSize=${pageSize}`,
      {
        withCredentials: true,
      }
    );
    var newToken = response.headers["new-access-token"];
    if (newToken != null) {
      const newToken = response.headers["new-access-token"];
      localStorage.setItem("authToken", newToken);
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

export const processTransaction = async (orderId: string): Promise<any> => {
  try {
    const response = await api.post("/transaction", orderId);
    var newToken = response.headers["new-access-token"];
    if (newToken != null) {
      const newToken = response.headers["new-access-token"];
      localStorage.setItem("authToken", newToken);
    }
    return response.data;
  } catch (error) {
    console.error("Error processing transaction:", error);
    throw error;
  }
};

export const updateOrderAddress = async (
  orderId: string,
  userAddressId: string
): Promise<any> => {
  try {
    const response = await api.put(`/order/change-address`, {
      orderId,
      userAddressId,
    });
    var newToken = response.headers["new-access-token"];
    if (newToken != null) {
      const newToken = response.headers["new-access-token"];
      localStorage.setItem("authToken", newToken);
    }
    return response.data;
  } catch (error) {
    console.error("Error updating order address:", error);
    throw error;
  }
};

export const changeDefaultAddress = async (
  userAddressId: string
): Promise<any> => {
  try {
    const response = await api.put(
      `/useraddress/address/default/${userAddressId}`
    );
    var newToken = response.headers["new-access-token"];
    if (newToken != null) {
      localStorage.setItem("authToken", newToken);
    }
    return response.data;
  } catch (error) {
    console.error("Error changing default address:", error);
    throw error;
  }
};

export const deleteAddress = async (id: string): Promise<any> => {
  try {
    const response = await api.put(`/useraddress/soft-delete/${id}`);
    var newToken = response.headers["new-access-token"];
    if (newToken != null) {
      localStorage.setItem("authToken", newToken);
    }
    return response.data;
  } catch (error) {
    console.error("Error changing default address:", error);
    throw error;
  }
};

export const editAddress = async (
  userAddressId: string,
  addressData: EditShippingFormData
): Promise<any> => {
  try {
    const response = await api.put(
      `/useraddress/${userAddressId}`,
      addressData
    );
    var newToken = response.headers["new-access-token"];
    if (newToken != null) {
      localStorage.setItem("authToken", newToken);
    }
    return response.data;
  } catch (error) {
    console.error("Error editing address:", error);
    throw error;
  }
};

export const processCodTransaction = async (orderId: string): Promise<any> => {
  try {
    const response = await api.post("/transaction/cod", orderId);
    var newToken = response.headers["new-access-token"];
    if (newToken != null) {
      const newToken = response.headers["new-access-token"];
      localStorage.setItem("authToken", newToken);
    }
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
        response: { success: false, message: "Invalid transaction ID" },
      };
    }

    console.log(`Checking transaction status for transaction ${transactionId}`);
    const response = await api.post(`/transaction/check`, transactionId);
    var newToken = response.headers["new-access-token"];
    if (newToken != null) {
      localStorage.setItem("authToken", newToken);
    }
    return response.data;
  } catch (error) {
    console.error("Error checking transaction status:", error);
    throw error;
  }
};
