import { BaseProduct, Product } from '../types/types';

/**
 * Maps a product's category to a product type for the frontend
 */
export const mapCategoryToType = (product: BaseProduct): Product => {
  const { categoryName, categoryId } = product;
  
  // Map based on categoryName (case insensitive)
  const lowerCaseName = categoryName.toLowerCase();
  
  if (lowerCaseName.includes('plant') || 
      lowerCaseName.includes('seed') || 
      lowerCaseName.includes('herb')) {
    return { ...product, type: 'plant' };
  }
  
  if (lowerCaseName.includes('system') || 
      lowerCaseName.includes('kit') || 
      lowerCaseName.includes('container')) {
    return { ...product, type: 'system' };
  }
  
  if (lowerCaseName.includes('nutrient') || 
      lowerCaseName.includes('solution') || 
      lowerCaseName.includes('fertilizer')) {
    return { ...product, type: 'nutrient' };
  }
  
  // Nếu không match với các điều kiện trên, có thể thêm mapping based on categoryId
  // Map một số categoryId cụ thể nếu bạn biết trước
  const knownCategoryMapping: {[key: string]: 'plant' | 'system' | 'nutrient'} = {
    'e8ae386b-1055-4725-b430-42adebf75e37': 'nutrient',  // Liquid Nutrients
    // Thêm các categoryId khác khi bạn biết
  };
  
  if (categoryId in knownCategoryMapping) {
    return { ...product, type: knownCategoryMapping[categoryId] };
  }
  
  // Default type nếu không thể xác định
  return { ...product, type: 'nutrient' }; // Hoặc type nào bạn muốn làm default
};

/**
 * Process an array of products to add type information
 */
export const processProductsWithType = (products: BaseProduct[]): Product[] => {
  return products.map(mapCategoryToType);
};