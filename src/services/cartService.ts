import api from "../context/AuthContext";
import { Product } from "../types/types";

export interface CartItem {
  id: string;
  productId: string;
  unitPrice: number;
  quantity: number;
  product?: Product;
}

export interface CartItemRequest {
  productId: string;
  unitPrice: number;
  quantity: number;
}

export interface CartResponse {
  statusCodes: number;
  response: {
    data: CartItem[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    lastPage: boolean;
  };
}

export interface SingleCartItemResponse {
  statusCodes: number;
  response: {
    data: CartItem[];
  };
}

export interface CartDetailItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
}

export interface CartDetailsResponse {
  statusCodes: number;
  response: {
    data: CartDetailItem[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    lastPage: boolean;
  };
}

// Cart service with CRUD operations
export const cartService = {
  // Get all cart items for the current user
  getAll: async (): Promise<CartItem[]> => {
    try {
      const response = await api.get<CartResponse>(`/cart`, {
        withCredentials: true, // Send cookies for authentication
      });
      return response.data.response.data;
    } catch (error) {
      console.error("Error fetching cart items:", error);
      return [];
    }
  },

  getCartDetails: async (
    pageIndex: number = 1,
    pageSize: number = 10
  ): Promise<CartDetailItem[]> => {
    try {
      const response = await api.get<CartDetailsResponse>(
        `/cart/details?pageIndex=${pageIndex}&pageSize=${pageSize}`,
        { withCredentials: true }
      );
      return response.data.response.data;
    } catch (error) {
      console.error("Error fetching cart details:", error);
      return [];
    }
  },

  // Add a new item to the cart
  addToCart: async (cartItem: CartItemRequest): Promise<CartItem | null> => {
    try {
      const response = await api.post<SingleCartItemResponse>(
        `/cart`,
        cartItem,
        { withCredentials: true }
      );

      // Assuming the API returns the created cart item
      if (response.data.response.data.length > 0) {
        return response.data.response.data[0];
      }
      return null;
    } catch (error) {
      console.error("Error adding item to cart:", error);
      throw error;
    }
  },

  // Update an existing cart item (e.g., change quantity)
  updateCartItem: async (
    id: string,
    cartItem: CartItemRequest
  ): Promise<CartItem | null> => {
    try {
      const response = await api.put<SingleCartItemResponse>(
        `/cart/${id}`,
        cartItem,
        { withCredentials: true }
      );

      if (response.data.response.data.length > 0) {
        return response.data.response.data[0];
      }
      return null;
    } catch (error) {
      console.error(`Error updating cart item ${id}:`, error);
      throw error;
    }
  },

  // Update cart quantity - directly using the /cart endpoint with PUT
  updateCartQuantity: async (
    productId: string,
    quantity: number
  ): Promise<boolean> => {
    try {
      // Use the PUT /cart endpoint with productId and quantity in body
      await api.put(
        `/cart`,
        {
          productId,
          quantity,
        },
        {
          withCredentials: true,
        }
      );
      return true;
    } catch (error) {
      console.error(`Error updating quantity for product ${productId}:`, error);
      return false;
    }
  },

  // Remove an item from the cart
  removeFromCart: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/cart/${id}`, {
        withCredentials: true,
      });
      return true;
    } catch (error) {
      console.error(`Error removing cart item ${id}:`, error);
      return false;
    }
  },

  // Get a specific cart item by ID
  getById: async (id: string): Promise<CartItem | null> => {
    try {
      const response = await api.get<SingleCartItemResponse>(`/cart/${id}`, {
        withCredentials: true,
      });

      if (response.data.response.data.length > 0) {
        return response.data.response.data[0];
      }
      return null;
    } catch (error) {
      console.error(`Error fetching cart item ${id}:`, error);
      return null;
    }
  },

  // Clear the entire cart - use DELETE /cart to clear all items
  clearCart: async (): Promise<boolean> => {
    try {
      await api.delete(`/cart`, {
        withCredentials: true,
      });
      return true;
    } catch (error) {
      console.error("Error clearing cart:", error);
      return false;
    }
  },

  // Add product to cart (helper method that creates CartItemRequest from Product)
  addProduct: async (
    product: Product,
    quantity: number = 1
  ): Promise<CartItem | null> => {
    const cartItem: CartItemRequest = {
      productId: product.id,
      unitPrice: product.price,
      quantity: quantity,
    };

    return await cartService.addToCart(cartItem);
  },

  // Update quantity of a product in cart (helper method)
  updateQuantity: async (
    id: string,
    productId: string,
    unitPrice: number,
    newQuantity: number
  ): Promise<CartItem | null> => {
    // Always use updateCartQuantity, even for 0 quantity (which will delete the item)
    const success = await cartService.updateCartQuantity(
      productId,
      newQuantity
    );

    if (success) {
      if (newQuantity <= 0) {
        return null; // Item deleted
      }

      // Return a mock CartItem since the API doesn't directly return the updated item
      return {
        id,
        productId,
        unitPrice,
        quantity: newQuantity,
      };
    }

    return null;
  },
};

export default cartService;
