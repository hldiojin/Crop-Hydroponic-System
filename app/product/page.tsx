'use client';

import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/AxiosInstance';
import Image from 'next/image';

// Define interfaces for type safety
interface Product {
  id: string;
  name: string;
  mainImage: string;
  categoryId: string;
  categoryName: string;
  price: number;
  status: string;
}

interface ProductResponse {
  statusCodes: number;
  response: {
    data: Product[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    lastPage: boolean;
  };
}

function Product() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch products when component mounts
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get<ProductResponse>('/product');
        setProducts(response.data.response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Format price to VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 p-4 rounded-md text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Our Products</h1>
      
      {products.length === 0 ? (
        <div className="text-center text-gray-500">No products available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="relative h-64 w-full">
                <Image 
                  src={product.mainImage} 
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    {product.categoryName}
                  </span>
                </div>
                <p className="text-lg font-bold text-green-600 mt-2">
                  {formatPrice(product.price)}
                </p>
                <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Product;