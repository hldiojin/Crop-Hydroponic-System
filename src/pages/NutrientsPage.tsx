// src/pages/NutrientsPage.tsx
import React from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  Box,
  Chip
} from '@mui/material';
import ProductCard from '../components/ProductCard';
import { Product, NutrientProduct } from '../types/types';
import { Science, Spa, WaterDrop } from '@mui/icons-material';

interface Props {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const isNutrientProduct = (product: Product): product is NutrientProduct => {
  return product.type === 'nutrient';
};

const NutrientsPage: React.FC<Props> = ({ products, onAddToCart }) => {
  const nutrientProducts = products.filter(isNutrientProduct);

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Science sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          Hydroponic Nutrients
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Premium nutrients and supplements for optimal plant growth
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Chip label="Balanced Formula" icon={<Science />} color="primary" />
          <Chip label="Plant Growth" icon={<Spa />} color="success" />
          <Chip label="pH Balanced" icon={<WaterDrop />} color="secondary" />
        </Box>
      </Box>
      
      <Grid container spacing={4}>
        {nutrientProducts.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <ProductCard product={product} onAddToCart={onAddToCart} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default NutrientsPage;