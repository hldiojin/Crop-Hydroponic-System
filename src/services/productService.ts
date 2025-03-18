import axios from 'axios';
import { Product } from '../types/types';

const API_BASE_URL = 'https://api.hmes.buubuu.id.vn/api';

// Define the API response type
interface ApiResponse {
  data: Product[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  lastPage: boolean;
}

export const productService = {
  // Get all products
  getAll: async (): Promise<ApiResponse> => {
    try {
      const response = await axios.get<ApiResponse>(`${API_BASE_URL}/product`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        data: [],
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        pageSize: 10,
        lastPage: true
      };
    }
  },
  
  getById: async (id: number): Promise<Product> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/product/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },
  
  // Get products by type
  getByType: async (type: 'plant' | 'system' | 'nutrient'): Promise<Product[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/product?type=${type}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${type} products:`, error);
      throw error;
    }
  },
  
  // Get products by type with proper typing
  getPlants: async (): Promise<Product[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/product?type=plant`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching plant products:', error);
      return [];
    }
  },
  
  getSystems: async (): Promise<Product[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/product?type=system`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching system products:', error);
      return [];
    }
  },
  
  getNutrients: async (): Promise<Product[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/product?type=nutrient`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching nutrient products:', error);
      return [];
    }
  },
  
  // Add a new product (admin only)
  create: async (product: Omit<Product, 'id'>): Promise<Product> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/product`, product);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },
  
  // Update an existing product (admin only)
  update: async (id: number, product: Partial<Product>): Promise<Product> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/product/${id}`, product);
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a product (admin only)
  delete: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/product/${id}`);
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  }
};

export default productService;