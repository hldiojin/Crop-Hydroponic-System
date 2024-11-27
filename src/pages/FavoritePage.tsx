// src/pages/FavoritePage.tsx
import React, { useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Timer,
  Science,
  WaterDrop,
  LocalFlorist,
  Memory,
  Power,
} from '@mui/icons-material';
import { Product } from '../types/types';

interface Props {
  products: Product[];
  favorites: number[];
  onRemoveFavorite: (product: Product) => void;
}

const FavoritePage: React.FC<Props> = ({ products, favorites, onRemoveFavorite }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const favoriteProducts = products.filter(product => favorites.includes(product.id));

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseDialog = () => {
    setSelectedProduct(null);
  };

  return (
    <Container sx={{ py: 4, marginTop: '100px' }}>
      <Typography variant="h4" gutterBottom>
        My Favorites
      </Typography>
      <Grid container spacing={4}>
        {favoriteProducts.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'scale(1.05)' }
              }}
              onClick={() => handleProductClick(product)}
            >
              <CardMedia
                component="img"
                height="200"
                image={product.image}
                alt={product.name}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {product.name}
                </Typography>
                <Typography variant="h6" color="primary">
                  ${product.price}
                </Typography>
                <IconButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFavorite(product);
                  }}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                  <DeleteIcon />
                </IconButton>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={!!selectedProduct}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedProduct && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {selectedProduct.name}
              <IconButton onClick={handleCloseDialog}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    ${selectedProduct.price}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedProduct.description}
                  </Typography>
                  {selectedProduct.type === 'plant' && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Chip icon={<Timer />} label={selectedProduct.growthTime} />
                      <Chip icon={<WaterDrop />} label={`pH ${selectedProduct.phRange}`} />
                      <Chip icon={<Science />} label={selectedProduct.difficulty} />
                    </Box>
                  )}
                  {selectedProduct.type === 'system' && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Chip icon={<Memory />} label={selectedProduct.capacity} />
                      <Chip icon={<Power />} label={selectedProduct.powerConsumption} />
                    </Box>
                  )}
                  {selectedProduct.type === 'nutrient' && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Chip icon={<Science />} label={selectedProduct.usage} />
                      <Chip icon={<Science />} label={selectedProduct.concentration} />
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default FavoritePage;