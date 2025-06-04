import api from "../context/AuthContext";

export interface Device {
  warranty: string;
  features: string;
  capacity: string;
  size: string;
  id: string;
  name: string;
  description: string;
  attachment: string;
  price: number;
  quantity: number;
}

export interface DeviceResponse {
  statusCodes: number;
  response: {
    data: Device[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    lastPage: boolean;
  };
}

export interface DeviceItemResponse {
  statusCodes: number;
  response: {
    data: DeviceItem[];
  };
}

export interface DeviceItem {
  id: string;
  name: string;
  serial: string;
  isActive: boolean;
  isOnline: boolean;
  status: string;
}

export const deviceService = {
  getAll: async (): Promise<Device[]> => {
    try {
      const response = await api.get<DeviceResponse>("/device");
      var newToken = response.headers["new-access-token"];
      if (newToken != null) {
        const newToken = response.headers["new-access-token"];
        localStorage.setItem("authToken", newToken);
      }
      return response.data.response.data;
    } catch (error) {
      console.error("Error fetching devices:", error);
      return [];
    }
  },
  getMyDevices: async (): Promise<DeviceItemResponse> => {
    try {
      const response = await api.get<DeviceItemResponse>("/device/me", {
        withCredentials: true,
      });
      var newToken = response.headers["new-access-token"];
      if (newToken != null) {
        const newToken = response.headers["new-access-token"];
        localStorage.setItem("authToken", newToken);
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching devices:", error);
      throw error;
    }
  },
};
