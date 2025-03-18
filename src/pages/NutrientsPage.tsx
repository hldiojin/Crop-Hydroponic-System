// src/pages/NutrientsPage.tsx
import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, Chip, CircularProgress } from '@mui/material';
import ProductCard from '../components/ProductCard';
import { Product } from '../types/types';
import { Science, Spa, WaterDrop } from '@mui/icons-material';
import productService from '../services/productService';
import NoProductsFound from '../components/NoProductsFound';

interface Props {
  onAddToCart: (product: Product) => void;
  onEdit: (product: Product) => void;
  onFavorite: (product: Product) => void;
  favorites: number[];
}

const NutrientsPage: React.FC<Props> = ({ onAddToCart, onEdit, onFavorite, favorites }) => {
  const [nutrients, setNutrients] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNutrients = async () => {
      try {
        setLoading(true);
        const nutrientsData = await productService.getNutrients();
        setNutrients(nutrientsData);
      } catch (err) {
        console.error('Error fetching nutrients:', err);
        setError('Failed to load nutrient products.');
      } finally {
        setLoading(false);
      }
    };

    fetchNutrients();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

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
      
      {nutrients.length > 0 ? (
        <Grid container spacing={4}>
          {nutrients.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4}>
              <ProductCard 
                product={product} 
                onAddToCart={onAddToCart} 
                onEdit={onEdit} 
                onFavorite={onFavorite} 
                favorites={favorites}
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

export default NutrientsPage;