import api from "../context/AuthContext";
import { TicketRequest, TicketResponse } from "../types/types";

export const ticketService = {
  createTicket: async (
    ticketData: TicketRequest,
    attachments: File[] = []
  ): Promise<TicketResponse> => {
    try {
      const formData = new FormData();

      // Add required fields
      formData.append("Type", ticketData.Type);
      formData.append("Description", ticketData.Description);

      // Add DeviceItemId only if it has a value
      if (ticketData.DeviceItemId) {
        formData.append("DeviceItemId", ticketData.DeviceItemId);
      }

      // Add attachments only if they exist
      if (attachments && attachments.length > 0) {
        attachments.forEach((file) => {
          formData.append("Attachments", file);
        });
      }

      const response = await api.post<TicketResponse>("/ticket", formData, {
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      console.error("Error creating ticket:", error);
      throw error;
    }
  },

  getAllTickets: async (pageIndex: number = 1, pageSize: number = 10): Promise<TicketResponse> => {
    try {
      const response = await api.get<TicketResponse>(`/ticket?status&pageIndex=${pageIndex}&pageSize=${pageSize}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching tickets:", error);
      throw error;
    }
  },

  getTicketById: async (ticketId: string): Promise<any> => {
    try {
      const response = await api.get(`/ticket/${ticketId}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ticket details for ID ${ticketId}:`, error);
      throw error;
    }
  },
};

export default ticketService;
