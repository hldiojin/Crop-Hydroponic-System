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
  Science,
  ShoppingCart,
} from '@mui/icons-material';
import { Product } from '../types/types';

// Thay đổi kiểu dữ liệu của favorites từ number[] sang string[]
interface Props {
  products: Product[];
  favorites: string[];
  onRemoveFavorite: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

const FavoritePage: React.FC<Props> = ({ products, favorites, onRemoveFavorite, onAddToCart }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Không cần chuyển đổi id vì giờ favorites đã là string[]
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
                '&:hover': { transform: 'scale(1.05)' },
                position: 'relative',
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={product.mainImage || '/placeholder-image.jpg'} // Thay đổi image thành mainImage
                alt={product.name}
                onClick={() => handleProductClick(product)}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {product.name}
                </Typography>
                <Typography variant="h6" color="primary">
                  ${product.price.toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<ShoppingCart />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product);
                    }}
                    sx={{ flex: 1, mr: 1 }}
                  >
                    Add to Cart
                  </Button>
                  <IconButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFavorite(product);
                    }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
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
                    src={selectedProduct.mainImage || '/placeholder-image.jpg'} // Thay đổi image thành mainImage
                    alt={selectedProduct.name}
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    ${selectedProduct.price.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedProduct.description || `Product in ${selectedProduct.categoryName} category`}
                  </Typography>
                  
                  {/* Hiển thị thông tin tiêu chuẩn từ API thay vì các trường cụ thể của từng loại */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip icon={<Science />} label={selectedProduct.categoryName} />
                    <Chip icon={<Science />} label={selectedProduct.status} />
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button 
                variant="contained" 
                startIcon={<ShoppingCart />}
                onClick={() => {
                  onAddToCart(selectedProduct);
                  handleCloseDialog();
                }}
              >
                Add to Cart
              </Button>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default FavoritePage;