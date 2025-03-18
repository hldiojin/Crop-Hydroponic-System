// src/pages/ProductList.tsx
import React from 'react';
import { Grid, Container, Typography } from '@mui/material';
import ProductCard from '../components/ProductCard';
import { Product } from '../types/types';
import NoProductsFound from './NoProductsFound';
interface Props {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onEdit: (product: Product) => void;
  onFavorite: (product: Product) => void;
  favorites: number[]; // Add favorites prop
}

const ProductList: React.FC<Props> = ({ products, onAddToCart, onEdit, onFavorite, favorites }) => {
  return (
    <Container className='container' sx={{ py: 4 }}>
      <Typography className='tittle' variant="h4" component="h1" gutterBottom align="center">
        Smart Hydroponic Solutions
      </Typography>
      
      {products.length > 0 ? (
        <Grid container spacing={4}>
          {products.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4}>
              <ProductCard
                product={product} 
                onAddToCart={onAddToCart} 
                onEdit={onEdit} 
                onFavorite={onFavorite} 
                favorites={favorites} // Pass favorites prop
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <NoProductsFound />
      )}
    </Container>
  );
};

export default ProductList;