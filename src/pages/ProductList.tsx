// src/pages/ProductList.tsx
import React from 'react';
import { Grid, Container, Typography } from '@mui/material';
import ProductCard from '../components/ProductCard';
import { Product } from '../types/types';
import './ProductList.css';
interface Props {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onEdit: (product: Product) => void;
  onFavorite: (product: Product) => void;
}

const ProductList: React.FC<Props> = ({ products, onAddToCart, onEdit, onFavorite }) => {
  return (
    <Container className='container' sx={{ py: 4 }}>
      <Typography className='tittle' variant="h4" gutterBottom>
        OUR PRODUCTS
      </Typography>
      <Grid container spacing={4}>
        {products.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <ProductCard
              product={product} 
              onAddToCart={onAddToCart} 
              onEdit={onEdit} 
              onFavorite={onFavorite} 
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ProductList;