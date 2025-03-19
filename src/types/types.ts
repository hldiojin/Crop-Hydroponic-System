export interface BaseProduct {
  id: string;
  name: string;
  price: number;
  description?: string;
  mainImage: string;
  categoryId: string;
  categoryName: string;
  status: string;
  // Trường type sẽ được thêm vào từ frontend dựa trên categoryName
  type?: 'plant' | 'system' | 'nutrient';
}

// Vẫn giữ lại các interface cụ thể cho từng loại sản phẩm để TypeScript hiểu được
export interface PlantProduct extends BaseProduct {
  type: 'plant';
  scientificName?: string;
  growthTime?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  nutrientNeeds?: string[];
  phRange?: string;
}

export interface SystemProduct extends BaseProduct {
  type: 'system';
  capacity?: string;
  powerConsumption?: string;
  dimensions?: string;
  features?: string[];
}

export interface NutrientProduct extends BaseProduct {
  type: 'nutrient';
  usage?: string;
  concentration?: string;
  benefits?: string[];
  suitableFor?: string[];
}

export type Product = PlantProduct | SystemProduct | NutrientProduct | BaseProduct;

export interface ApiResponse<T> {
  statusCodes: number;
  response: {
    data: T[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    lastPage: boolean;
  };
}

export interface ProductsResponse {
  data: BaseProduct[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  lastPage: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm extends LoginForm {
  name: string;
  confirmPassword: string;
}

export interface Ticket {
  id: string;
  userId: number;
  email: string;
  issueType: 'bug' | 'feature' | 'other';
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt: Date;
  updateAt: Date;
}