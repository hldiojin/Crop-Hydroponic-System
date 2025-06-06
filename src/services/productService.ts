import axios from "axios";
import { Product, ApiResponse, BaseProduct } from "../types/types";

const API_BASE_URL = "https://api.hmes.site/api";

// Interface for detailed product response
interface DetailedProductResponse {
  statusCodes: number;
  response: {
    data: {
      id: string;
      name: string;
      description: string;
      mainImage: string;
      categoryId: string;
      categoryName: string;
      amount: number;
      price: number;
      images: string[];
      status: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

// Interface for search parameters
export interface SearchParams {
  keyword?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  pageIndex?: number;
  pageSize?: number;
}

// Interface for search response
export interface SearchProductsResponse {
  statusCodes: number;
  response: {
    data: BaseProduct[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    lastPage: boolean;
  };
}

// Helper function để đơn giản hóa xử lý response từ API
const mapToDomainModel = (apiProduct: BaseProduct): Product => {
  return {
    ...apiProduct,
  };
};

export const productService = {
  // Get all products
  getAll: async (): Promise<Product[]> => {
    try {
      const response = await axios.get<ApiResponse<BaseProduct>>(
        `${API_BASE_URL}/product`
      );
      return response.data.response.data.map(mapToDomainModel);
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  },

  // Get detailed product information by ID
  getDetailById: async (
    id: string
  ): Promise<DetailedProductResponse["response"]["data"] | null> => {
    try {
      const response = await axios.get<DetailedProductResponse>(
        `${API_BASE_URL}/product/${id}`
      );
      if (response.data.statusCodes === 200) {
        return response.data.response.data;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching detailed product ${id}:`, error);
      return null;
    }
  },

  // New server-side search products method with pagination
  searchProductsServer: async (
    params: SearchParams
  ): Promise<SearchProductsResponse> => {
    try {
      const queryParams = new URLSearchParams();

      if (params.keyword?.trim()) {
        queryParams.append("keyword", params.keyword.trim());
      }
      if (params.categoryId) {
        queryParams.append("categoryId", params.categoryId);
      }
      if (params.minPrice !== undefined) {
        queryParams.append("minPrice", params.minPrice.toString());
      }
      if (params.maxPrice !== undefined) {
        queryParams.append("maxPrice", params.maxPrice.toString());
      }
      if (params.pageIndex !== undefined) {
        queryParams.append("pageIndex", params.pageIndex.toString());
      }
      if (params.pageSize !== undefined) {
        queryParams.append("pageSize", params.pageSize.toString());
      }

      const response = await axios.get<SearchProductsResponse>(
        `${API_BASE_URL}/product/search?${queryParams.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error("Error searching products:", error);
      // Return empty result structure on error
      return {
        statusCodes: 500,
        response: {
          data: [],
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          pageSize: 10,
          lastPage: true,
        },
      };
    }
  },

  // Get products by category ID using the search endpoint
  getByCategory: async (categoryId: string): Promise<Product[]> => {
    try {
      const searchResult = await productService.searchProductsServer({
        categoryId,
        pageIndex: 1,
        pageSize: 100, // Get more products for category filtering
      });
      return searchResult.response.data.map(mapToDomainModel);
    } catch (error) {
      console.error(
        `Error fetching products for category ${categoryId}:`,
        error
      );
      return [];
    }
  },

  // Legacy search products by name or ID (deprecated - use searchProductsServer instead)
  searchProducts: async (searchText: string): Promise<Product[]> => {
    try {
      const searchResult = await productService.searchProductsServer({
        keyword: searchText,
        pageIndex: 1,
        pageSize: 100, // Get more products for search
      });
      return searchResult.response.data.map(mapToDomainModel);
    } catch (error) {
      console.error(
        `Error searching products with term "${searchText}":`,
        error
      );
      return [];
    }
  },

  // Search products locally (không gọi API)
  searchProductsLocally: (
    products: Product[],
    searchText: string
  ): Product[] => {
    if (!searchText.trim()) return products;

    const lowerCaseSearch = searchText.toLowerCase().trim();

    return products.filter(
      (product) =>
        product.id.toLowerCase().includes(lowerCaseSearch) ||
        product.name.toLowerCase().includes(lowerCaseSearch)
    );
  },

  getById: async (id: string): Promise<Product | null> => {
    try {
      const response = await axios.get<ApiResponse<BaseProduct>>(
        `${API_BASE_URL}/product/${id}`
      );
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
      const response = await axios.get<ApiResponse<BaseProduct>>(
        `${API_BASE_URL}/product?category=plant`
      );
      return response.data.response.data.map(mapToDomainModel);
    } catch (error) {
      console.error("Error fetching plant products:", error);
      return [];
    }
  },

  getSystems: async (): Promise<Product[]> => {
    try {
      const response = await axios.get<ApiResponse<BaseProduct>>(
        `${API_BASE_URL}/product?category=system`
      );
      return response.data.response.data.map(mapToDomainModel);
    } catch (error) {
      console.error("Error fetching system products:", error);
      return [];
    }
  },

  getNutrients: async (): Promise<Product[]> => {
    try {
      const response = await axios.get<ApiResponse<BaseProduct>>(
        `${API_BASE_URL}/product?category=nutrient`
      );
      return response.data.response.data.map(mapToDomainModel);
    } catch (error) {
      console.error("Error fetching nutrient products:", error);
      return [];
    }
  },

  // Add a new product (admin only)
  create: async (product: Omit<Product, "id">): Promise<Product> => {
    try {
      const response = await axios.post<Product>(
        `${API_BASE_URL}/product`,
        product
      );
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  // Update an existing product (admin only)
  // Thay đổi kiểu của id từ number sang string
  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    try {
      const response = await axios.put<Product>(
        `${API_BASE_URL}/product/${id}`,
        product
      );
      return response.data;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  // Delete a product (admin only)
  // Thay đổi kiểu của id từ number sang string
  delete: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/product/${id}`);
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },
};

export default productService;
