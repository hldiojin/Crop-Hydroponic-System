// src/components/ProductCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Button, 
  CardActions,
  Chip,
  Box
} from '@mui/material';
import { WaterDrop, Timer, Science, ShoppingCart, Info, Memory, Power } from '@mui/icons-material';
import { Product } from '../types/types';

interface Props {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<Props> = ({ product, onAddToCart }) => {
  const renderProductSpecifics = () => {
    switch (product.type) {
      case 'plant':
        return (
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<Timer />}
              label={product.growthTime}
              size="small"
              color="primary"
            />
            <Chip
              icon={<WaterDrop />}
              label={`pH ${product.phRange}`}
              size="small"
              color="secondary"
            />
            <Chip
              icon={<Science />}
              label={product.difficulty}
              size="small"
              color={product.difficulty === 'Easy' ? 'success' : 'warning'}
            />
          </Box>
        );
      case 'system':
        return (
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<Memory />}
              label={product.capacity}
              size="small"
              color="primary"
            />
            <Chip
              icon={<Power />}
              label={product.powerConsumption}
              size="small"
              color="secondary"
            />
          </Box>
        );
      case 'nutrient':
        return (
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<Science />}
              label={product.usage}
              size="small"
              color="primary"
            />
            <Chip
              icon={<Science />}
              label={product.concentration}
              size="small"
              color="secondary"
            />
          </Box>
        );
    }
  };

  return (
    <Card 
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardMedia
        component="img"
        height="250"
        image={product.image}
        alt={product.name}
        sx={{
          objectFit: 'cover',
        }}
      />
      <CardContent 
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Typography 
          gutterBottom 
          variant="h5" 
          component="div"
          sx={{
            height: '64px',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {product.name}
        </Typography>
        {'scientificName' in product && (
          <Typography 
            variant="subtitle2" 
            color="text.secondary" 
            gutterBottom
            sx={{
              height: '24px',
              overflow: 'hidden',
            }}
          >
            {product.scientificName}
          </Typography>
        )}
        <Typography variant="h6" color="primary" gutterBottom>
          ${product.price}
        </Typography>
        {renderProductSpecifics()}
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{
            height: '80px',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {product.description}
        </Typography>
      </CardContent>
      <CardActions sx={{ padding: 2, gap: 1 }}>
        <Button 
          size="small" 
          variant="outlined"
          component={Link}
          to={`/product/${product.id}`}
          startIcon={<Info />}
          sx={{ flex: 1 }}
        >
          Details
        </Button>
        <Button 
          size="small" 
          variant="contained"
          onClick={() => onAddToCart(product)}
          startIcon={<ShoppingCart />}
          sx={{ flex: 1 }}
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;