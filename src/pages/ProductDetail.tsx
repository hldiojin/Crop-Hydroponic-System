// src/pages/ProductDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  Paper,
  Divider,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Science,
  ShoppingCart,
  Star,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types/types';
import productService from '../services/productService';

interface ProductDetailProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onFavorite: (product: Product) => void;
  favorites: string[];
}

const ProductDetail: React.FC<ProductDetailProps> = ({ products, onAddToCart, onFavorite, favorites }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const fetchedProduct = await productService.getById(id);
        setProduct(fetchedProduct);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product && favorites) {
      setIsFavorite(favorites.includes(product.id));
    }
  }, [product, favorites]);

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: location,
          action: 'favorite',
          productId: product?.id 
        } 
      });
      return;
    }
    setIsFavorite(!isFavorite);
    if (product) {
      onFavorite(product);
    }
  };

  if (loading) {
    return (
      <Container sx={{ marginTop: '100px', textAlign: 'center' }}>
        <Typography>Loading product details...</Typography>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container sx={{ marginTop: '100px' }}>
        <Typography variant="h5" sx={{ mt: 4 }}>
          {error || 'Product not found'}
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4, marginTop: '100px' }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardMedia
              component="img"
              height="400"
              image={product.mainImage || '/placeholder-image.jpg'}
              alt={product.name}
              sx={{ objectFit: 'cover' }}
            />
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" gutterBottom>
              {product.name}
            </Typography>
            <Tooltip title="Favorite">
              <IconButton 
                onClick={handleFavoriteClick}
                color={isFavorite ? "secondary" : "default"}
                sx={{ 
                  width: 50, 
                  height: 50,
                  '&:hover': {
                    transform: 'scale(1.1)',
                  }
                }}
              >
                <Star sx={{ fontSize: 30 }} />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Box sx={{ my: 3 }}>
            <Grid container spacing={1}>
              <Grid item>
                <Chip
                  icon={<Science />}
                  label={`Category: ${product.categoryName}`}
                  color="primary"
                />
              </Grid>
              <Grid item>
                <Chip
                  label={`Status: ${product.status}`}
                  color={product.status === 'Active' ? 'success' : 'default'}
                />
              </Grid>
            </Grid>
          </Box>
          
          <Typography variant="h5" color="primary" sx={{ my: 2 }}>
            ${product.price.toLocaleString()}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1" paragraph>
            {product.description || `${product.name} - ${product.categoryName}`}
          </Typography>

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCart />}
              onClick={() => {
                onAddToCart(product);
                navigate('/cart');
              }}
            >
              Thêm vào giỏ hàng
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetail;