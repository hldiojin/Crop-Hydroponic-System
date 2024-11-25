// src/pages/SystemsPage.tsx
import React from 'react';
import { Container, Grid, Typography, Box, Chip } from '@mui/material';
import ProductCard from '../components/ProductCard';
import { Product, SystemProduct } from '../types/types';
import { Memory, Power, Settings } from '@mui/icons-material';

interface Props {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onEdit: (product: Product) => void;
  onFavorite: (product: Product) => void;
}

const isSystemProduct = (product: Product): product is SystemProduct => {
  return product.type === 'system';
};

const SystemsPage: React.FC<Props> = ({ products, onAddToCart, onEdit, onFavorite }) => {
  const systemProducts = products.filter(isSystemProduct);

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Settings sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          Smart Hydroponic Systems
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Professional IoT-enabled growing systems for your home
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Chip label="Smart Monitoring" icon={<Memory />} color="primary" />
          <Chip label="Energy Efficient" icon={<Power />} color="success" />
          <Chip label="Automated Control" color="secondary" />
        </Box>
      </Box>
      
      <Grid container spacing={4}>
        {systemProducts.map((product) => (
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

export default SystemsPage;