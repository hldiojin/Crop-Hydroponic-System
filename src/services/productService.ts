import axios from 'axios';
import { Product, ApiResponse, BaseProduct } from '../types/types';

const API_BASE_URL = 'https://api.hmes.buubuu.id.vn/api';

// Helper function để đơn giản hóa xử lý response từ API
const mapToDomainModel = (apiProduct: BaseProduct): Product => {
  return {
    ...apiProduct
  };
};

export const productService = {
  // Get all products
  getAll: async (): Promise<Product[]> => {
    try {
      const response = await axios.get<ApiResponse<BaseProduct>>(`${API_BASE_URL}/product`);
      return response.data.response.data.map(mapToDomainModel);
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  // Get products by category ID
  getByCategory: async (categoryId: string): Promise<Product[]> => {
    try {
      // Dựa vào API của bạn, có thể cần điều chỉnh endpoint hoặc tham số
      const response = await axios.get<ApiResponse<BaseProduct>>(
        `${API_BASE_URL}/product?categoryId=${categoryId}`
      );
      return response.data.response.data.map(mapToDomainModel);
    } catch (error) {
      console.error(`Error fetching products for category ${categoryId}:`, error);
      return [];
    }
  },
  
  // Search products by name or ID
  searchProducts: async (searchText: string): Promise<Product[]> => {
    try {
      // Đây là endpoint giả định, bạn cần điều chỉnh theo API thực tế
      const response = await axios.get<ApiResponse<BaseProduct>>(
        `${API_BASE_URL}/product?search=${encodeURIComponent(searchText)}`
      );
      return response.data.response.data.map(mapToDomainModel);
    } catch (error) {
      console.error(`Error searching products with term "${searchText}":`, error);
      return [];
    }
  },
  
  // Search products locally (không gọi API)
  searchProductsLocally: (products: Product[], searchText: string): Product[] => {
    if (!searchText.trim()) return products;
    
    const lowerCaseSearch = searchText.toLowerCase().trim();
    
    return products.filter(product => 
      product.id.toLowerCase().includes(lowerCaseSearch) || 
      product.name.toLowerCase().includes(lowerCaseSearch)
    );
  },
  
  getById: async (id: string): Promise<Product | null> => {
    try {
      const response = await axios.get<ApiResponse<BaseProduct>>(`${API_BASE_URL}/product/${id}`);
      if (response.data.response.data.length > 0) {
        return mapToDomainModel(response.data.response.data[0]);
      }
      return null;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      return null;
    }
  },
  
  // Get products filtered by category
  getPlants: async (): Promise<Product[]> => {
    try {
      const response = await axios.get<ApiResponse<BaseProduct>>(`${API_BASE_URL}/product?category=plant`);
      return response.data.response.data.map(mapToDomainModel);
    } catch (error) {
      console.error('Error fetching plant products:', error);
      return [];
    }
  },
  
  getSystems: async (): Promise<Product[]> => {
    try {
      const response = await axios.get<ApiResponse<BaseProduct>>(`${API_BASE_URL}/product?category=system`);
      return response.data.response.data.map(mapToDomainModel);
    } catch (error) {
      console.error('Error fetching system products:', error);
      return [];
    }
  },
  
  getNutrients: async (): Promise<Product[]> => {
    try {
      const response = await axios.get<ApiResponse<BaseProduct>>(`${API_BASE_URL}/product?category=nutrient`);
      return response.data.response.data.map(mapToDomainModel);
    } catch (error) {
      console.error('Error fetching nutrient products:', error);
      return [];
    }
  },
  
  // Add a new product (admin only)
  create: async (product: Omit<Product, 'id'>): Promise<Product> => {
    try {
      const response = await axios.post<Product>(`${API_BASE_URL}/product`, product);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },
  
  // Update an existing product (admin only)
  // Thay đổi kiểu của id từ number sang string
  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    try {
      const response = await axios.put<Product>(`${API_BASE_URL}/product/${id}`, product);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },
  
  // Delete a product (admin only)
  // Thay đổi kiểu của id từ number sang string
  delete: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/product/${id}`);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
};

export default productService;