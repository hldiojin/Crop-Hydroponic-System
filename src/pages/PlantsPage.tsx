// src/pages/PlantsPage.tsx
import React from 'react';
import { Container, Grid, Typography, Box, Chip } from '@mui/material';
import ProductCard from '../components/ProductCard';
import { Product, PlantProduct } from '../types/types';
import { LocalFlorist } from '@mui/icons-material';

interface Props {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onEdit: (product: Product) => void;
  onFavorite: (product: Product) => void;
}

const isPlantProduct = (product: Product): product is PlantProduct => {
  return product.type === 'plant';
};

const PlantsPage: React.FC<Props> = ({ products, onAddToCart, onEdit, onFavorite }) => {
  const plantProducts = products.filter(isPlantProduct);

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <LocalFlorist sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          Smart Hydroponic Plants
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Discover our selection of IoT-enabled hydroponic plants
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Chip label="Easy to Grow" color="success" />
          <Chip label="App Connected" color="primary" />
          <Chip label="Automated Care" color="secondary" />
        </Box>
      </Box>
      
      <Grid container spacing={4}>
        {plantProducts.map((product) => (
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

export default PlantsPage;