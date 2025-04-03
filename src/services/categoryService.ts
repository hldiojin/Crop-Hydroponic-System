import axios from 'axios';

const API_BASE_URL = 'https://api.hmes.site/api';

export interface Category {
  id: string;
  name: string;
  description: string;
  parentCategoryId: string | null;
  attachment: string;
  status: string;
  children: Category[];
}

export interface CategoryResponse {
  statusCodes: number;
  response: {
    data: Category[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    lastPage: boolean;
  };
}

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    try {
      const response = await axios.get<CategoryResponse>(`${API_BASE_URL}/category`);
      return response.data.response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Helper function to flatten category hierarchy for easier selection
  getAllFlattened: async (): Promise<Category[]> => {
    try {
      const categories = await categoryService.getAll();
      return flattenCategories(categories);
    } catch (error) {
      console.error('Error fetching flattened categories:', error);
      return [];
    }
  }
};

// Helper function to flatten nested categories
const flattenCategories = (categories: Category[]): Category[] => {
  let result: Category[] = [];
  
  for (const category of categories) {
    result.push(category);
    
    if (category.children && category.children.length > 0) {
      result = [...result, ...flattenCategories(category.children)];
    }
  }
  
  return result;
};

export default categoryService;