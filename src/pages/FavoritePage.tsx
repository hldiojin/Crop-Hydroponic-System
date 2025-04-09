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
  Favorite,
} from '@mui/icons-material';
import { Product } from '../types/types';
import { 
  MotionBox, 
  MotionTypography, 
  MotionButton, 
  containerVariants, 
  itemVariants, 
  buttonVariants 
} from '../utils/motion';

// Thay đổi kiểu dữ liệu của favorites từ number[] sang string[]
interface Props {
  products: Product[];
  favorites: string[];
  onRemoveFavorite: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

const FavoritePage: React.FC<Props> = ({ products, favorites, onRemoveFavorite, onAddToCart }) => {
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
      <MotionBox
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <MotionTypography 
          variant="h4" 
          gutterBottom
          variants={itemVariants}
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <Favorite color="error" />
          My Favorites
        </MotionTypography>
        
        {favoriteProducts.length === 0 ? (
          <MotionBox 
            variants={itemVariants}
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              minHeight: '300px',
              textAlign: 'center',
              p: 4
            }}
          >
            <MotionTypography variant="h6" color="text.secondary" gutterBottom>
              You haven't added any favorites yet.
            </MotionTypography>
            <MotionButton
              variant="contained"
              color="primary"
              component="a"
              href="/"
              sx={{ mt: 2 }}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Browse Products
            </MotionButton>
          </MotionBox>
        ) : (
          <Grid container spacing={4}>
            {favoriteProducts.map((product, index) => (
              <Grid item key={product.id} xs={12} sm={6} md={4}>
                <MotionBox
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition-delay={index * 0.1}
                >
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      position: 'relative',
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={product.mainImage || '/placeholder-image.jpg'}
                      alt={product.name}
                      onClick={() => handleProductClick(product)}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {product.name}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ${product.price.toLocaleString()}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <MotionButton
                          variant="contained"
                          startIcon={<ShoppingCart />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(product);
                          }}
                          sx={{ flex: 1, mr: 1 }}
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          Add to Cart
                        </MotionButton>
                        <MotionBox
                          component={IconButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFavorite(product);
                          }}
                          color="error"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <DeleteIcon />
                        </MotionBox>
                      </Box>
                    </CardContent>
                  </Card>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        )}
      </MotionBox>

      <Dialog
        open={!!selectedProduct}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        TransitionProps={{
          timeout: 400
        }}
      >
        {selectedProduct && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <MotionTypography
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {selectedProduct.name}
              </MotionTypography>
              <IconButton onClick={handleCloseDialog}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <MotionBox
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <img
                      src={selectedProduct.mainImage || '/placeholder-image.jpg'}
                      alt={selectedProduct.name}
                      style={{ width: '100%', borderRadius: '8px' }}
                    />
                  </MotionBox>
                </Grid>
                <Grid item xs={12} md={6}>
                  <MotionBox
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                  >
                    <MotionTypography 
                      variant="h6" 
                      color="primary" 
                      gutterBottom
                      variants={itemVariants}
                    >
                      ${selectedProduct.price.toLocaleString()}
                    </MotionTypography>
                    <MotionTypography 
                      variant="body1" 
                      paragraph
                      variants={itemVariants}
                    >
                      {selectedProduct.description || `Product in ${selectedProduct.categoryName} category`}
                    </MotionTypography>
                    
                    <MotionBox 
                      sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}
                      variants={itemVariants}
                    >
                      <Chip icon={<Science />} label={selectedProduct.categoryName} />
                      <Chip icon={<Science />} label={selectedProduct.status} />
                    </MotionBox>
                  </MotionBox>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <MotionButton 
                variant="contained" 
                startIcon={<ShoppingCart />}
                onClick={() => {
                  onAddToCart(selectedProduct);
                  handleCloseDialog();
                }}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Add to Cart
              </MotionButton>
              <MotionButton 
                onClick={handleCloseDialog}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Close
              </MotionButton>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default FavoritePage;