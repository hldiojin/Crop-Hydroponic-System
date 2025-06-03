import axios from "axios";

const API_BASE_URL = "https://api.hmes.site/api";

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
      const response = await axios.get<CategoryResponse>(
        `${API_BASE_URL}/category`
      );
      if (response.data.statusCodes === 200) {
        return response.data.response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },

  // Get only child categories (categories that can be selected)
  getChildCategories: async (): Promise<Category[]> => {
    try {
      const categories = await categoryService.getAll();
      return extractChildCategories(categories);
    } catch (error) {
      console.error("Error fetching child categories:", error);
      return [];
    }
  },

  // Helper function to flatten category hierarchy and get only leaf categories
  getAllFlattened: async (): Promise<Category[]> => {
    try {
      const categories = await categoryService.getAll();
      return extractChildCategories(categories);
    } catch (error) {
      console.error("Error fetching flattened categories:", error);
      return [];
    }
  },
};

// Helper function to extract only child categories (leaf nodes)
const extractChildCategories = (categories: Category[]): Category[] => {
  let childCategories: Category[] = [];

  for (const category of categories) {
    // If this category has children, extract them
    if (category.children && category.children.length > 0) {
      // Recursively get children from nested structure
      childCategories = [
        ...childCategories,
        ...extractChildCategories(category.children),
      ];
    } else {
      // This is a leaf category (no children), add it to the list
      childCategories.push(category);
    }
  }

  return childCategories;
};

export default categoryService;
