import api from "../context/AuthContext";

export interface Device {
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

export const deviceService = {
  getAll: async (): Promise<Device[]> => {
    try {
      const response = await api.get<DeviceResponse>("/device");
      return response.data.response.data;
    } catch (error) {
      console.error("Error fetching devices:", error);
      return [];
    }
  },
}; 