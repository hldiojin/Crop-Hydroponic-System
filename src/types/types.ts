
export interface BaseProduct {
    id: number;
    name: string;
    price: number;
    description: string;
    image: string;
  
  type: 'plant' | 'system' | 'nutrient';
}
  // Product type specific interfaces
  export interface PlantProduct extends BaseProduct {
    type: 'plant';
    scientificName: string;
    growthTime: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    nutrientNeeds: string[];
    phRange: string;
  }
  
  export interface SystemProduct extends BaseProduct {
    type: 'system';
    capacity: string;
    powerConsumption: string;
    dimensions: string;
    features: string[];
  }
  
  export interface NutrientProduct extends BaseProduct {
    type: 'nutrient';
    usage: string;
    concentration: string;
    benefits: string[];
    suitableFor: string[];
  }
  
  export type Product = PlantProduct | SystemProduct | NutrientProduct;
  
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
    userName: string;
    subject: string;
    description: string;
    status: 'open' | 'in-progress' | 'resolved';
    createdAt: Date;
    updatedAt: Date;
  }