// src/pages/ProductDetail.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import {
  Timer,
  Science,
  WaterDrop,
  LocalFlorist,
  ShoppingCart,
  Memory,
  Power,
} from '@mui/icons-material';
import { Product, PlantProduct, SystemProduct, NutrientProduct } from '../types/types';

interface ProductDetailProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

// Type guards
const isPlantProduct = (product: Product): product is PlantProduct => {
  return product.type === 'plant';
};

const isSystemProduct = (product: Product): product is SystemProduct => {
  return product.type === 'system';
};

const isNutrientProduct = (product: Product): product is NutrientProduct => {
  return product.type === 'nutrient';
};

const ProductDetail: React.FC<ProductDetailProps> = ({ products, onAddToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id === Number(id));

  if (!product) {
    return (
      <Container>
        <Typography variant="h5" sx={{ mt: 4 }}>Product not found</Typography>
      </Container>
    );
  }

  const renderSpecifications = () => {
    if (isPlantProduct(product)) {
      return (
        <>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {product.scientificName}
          </Typography>
          <Box sx={{ my: 3 }}>
            <Grid container spacing={1}>
              <Grid item>
                <Chip
                  icon={<Timer />}
                  label={`Growth Time: ${product.growthTime}`}
                  color="primary"
                />
              </Grid>
              <Grid item>
                <Chip
                  icon={<Science />}
                  label={`Difficulty: ${product.difficulty}`}
                  color={product.difficulty === 'Easy' ? 'success' : 'warning'}
                />
              </Grid>
              <Grid item>
                <Chip
                  icon={<WaterDrop />}
                  label={`pH Range: ${product.phRange}`}
                  color="secondary"
                />
              </Grid>
            </Grid>
            <Paper elevation={2} sx={{ p: 2, my: 3, bgcolor: 'background.default' }}>
              <Typography variant="h6" gutterBottom>
                <LocalFlorist sx={{ mr: 1, verticalAlign: 'middle' }} />
                Nutrient Requirements
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {product.nutrientNeeds.map((nutrient: string, index: number) => (
                  <Chip
                    key={index}
                    label={nutrient}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Paper>
          </Box>
        </>
      );
    }

    if (isSystemProduct(product)) {
      return (
        <Box sx={{ my: 3 }}>
          <Grid container spacing={1}>
            <Grid item>
              <Chip
                icon={<Memory />}
                label={`Capacity: ${product.capacity}`}
                color="primary"
              />
            </Grid>
            <Grid item>
              <Chip
                icon={<Power />}
                label={`Power: ${product.powerConsumption}`}
                color="secondary"
              />
            </Grid>
          </Grid>
          <Paper elevation={2} sx={{ p: 2, my: 3, bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom>Features</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {product.features.map((feature: string, index: number) => (
                <Chip
                  key={index}
                  label={feature}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Paper>
        </Box>
      );
    }

    if (isNutrientProduct(product)) {
      return (
        <Box sx={{ my: 3 }}>
          <Grid container spacing={1}>
            <Grid item>
              <Chip
                icon={<Science />}
                label={`Usage: ${product.usage}`}
                color="primary"
              />
            </Grid>
            <Grid item>
              <Chip
                icon={<Science />}
                label={`Concentration: ${product.concentration}`}
                color="secondary"
              />
            </Grid>
          </Grid>
          <Paper elevation={2} sx={{ p: 2, my: 3, bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom>Benefits</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {product.benefits.map((benefit: string, index: number) => (
                <Chip
                  key={index}
                  label={benefit}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              ))}
            </Box>
          </Paper>
        </Box>
      );
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardMedia
              component="img"
              height="400"
              image={product.image}
              alt={product.name}
              sx={{ objectFit: 'cover' }}
            />
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {product.name}
            </Typography>
            
            {renderSpecifications()}
            
            <Typography variant="h5" color="primary" sx={{ my: 2 }}>
              ${product.price}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {product.description}
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
                Add to Cart
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/')}
              >
                Continue Shopping
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetail;