import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, Chip, CircularProgress } from '@mui/material';
import ProductCard from '../components/ProductCard';
import { Product } from '../types/types';
import { Memory } from '@mui/icons-material';
import productService from '../services/productService';
import NoProductsFound from '../components/NoProductsFound';

interface Props {
  onAddToCart: (product: Product) => void;
  onEdit: (product: Product) => void;
  onFavorite: (product: Product) => void;
  favorites: string[];
}

const SystemsPage: React.FC<Props> = ({ onAddToCart, onEdit, onFavorite, favorites }) => {
  const [systems, setSystems] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSystems = async () => {
      try {
        setLoading(true);
        const systemProducts = await productService.getSystems();
        setSystems(systemProducts);
      } catch (err) {
        console.error('Error fetching systems:', err);
        setError('Failed to load system products.');
      } finally {
        setLoading(false);
      }
    };

    fetchSystems();
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
        <Memory sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          Hệ thống thủy canh
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Hệ thống tối ưu cho sự phát triển của cây trồng
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Chip label="Kiểm soát thông minh" color="primary" />
          <Chip label="Tiết kiệm năng lượng" color="success" />
          <Chip label="Kết nối IoT" color="secondary" />
        </Box>
      </Box>
      
      {systems.length > 0 ? (
        <Grid container spacing={4}>
          {systems.map((product) => (
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

export default SystemsPage;