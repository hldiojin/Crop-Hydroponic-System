// src/pages/FavoritePage.tsx
import React, { useState, useEffect } from 'react';
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
  useTheme,
  alpha,
  Avatar,
  Divider,
  Rating,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Science,
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  Info as InfoIcon,
  ArrowBack,
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
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Props {
  products: Product[];
  favorites: string[];
  onRemoveFavorite: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

const FavoritePage: React.FC<Props> = ({ products, favorites, onRemoveFavorite, onAddToCart }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const favoriteProducts = products.filter(product => favorites.includes(product.id));

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseDialog = () => {
    setSelectedProduct(null);
  };

  // Background gradient animation
  const gradientAnimation = {
    backgroundSize: "400% 400%",
    animation: "gradient 15s ease infinite",
    "@keyframes gradient": {
      "0%": {
        backgroundPosition: "0% 50%",
      },
      "50%": {
        backgroundPosition: "100% 50%",
      },
      "100%": {
        backgroundPosition: "0% 50%",
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ 
        width: '100%',
        minHeight: '100vh',
        background: `linear-gradient(-20deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${alpha(theme.palette.background.default, 1)} 40%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
        paddingTop: '90px',
        paddingBottom: '50px',
      }}
    >
      {/* Decorative Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 120,
          right: '5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0)} 70%)`,
          zIndex: 0,
          display: { xs: 'none', md: 'block' }
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.06)} 0%, ${alpha(theme.palette.secondary.main, 0)} 70%)`,
          zIndex: 0,
          display: { xs: 'none', md: 'block' }
        }}
      />

      <Container 
        maxWidth="xl" 
        sx={{ 
          position: 'relative',
          zIndex: 1,
          px: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <MotionBox
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          sx={{
            mb: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 0 } }}>
            <IconButton 
              color="primary" 
              onClick={() => navigate('/')} 
              sx={{ 
                mr: 2, 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                },
                width: 45,
                height: 45,
              }}
            >
              <ArrowBack />
            </IconButton>
            
            <MotionTypography 
              variant="h4" 
              component="h1"
              variants={itemVariants}
              sx={{ 
                fontWeight: 'bold',
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: theme.palette.primary.main,
                fontSize: { xs: '1.8rem', md: '2.2rem' }
              }}
            >
              <Favorite sx={{ color: theme.palette.error.main }} />
              My Favorites
            </MotionTypography>
          </Box>

          <MotionBox
            variants={itemVariants}
            sx={{ display: { xs: 'none', md: 'block' } }}
          >
            <Chip
              label={`${favoriteProducts.length} items`}
              color="primary"
              variant="outlined"
              icon={<Favorite fontSize="small" />}
              sx={{ 
                fontWeight: 'medium', 
                px: 1,
                borderRadius: '20px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              }}
            />
          </MotionBox>
        </MotionBox>
        
        {favoriteProducts.length === 0 ? (
          <MotionBox 
            variants={itemVariants}
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              minHeight: '400px',
              textAlign: 'center',
              p: 4,
              borderRadius: 4,
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <FavoriteBorder 
              sx={{ 
                fontSize: 80, 
                color: alpha(theme.palette.error.main, 0.2),
                mb: 2
              }}
            />
            <MotionTypography 
              variant="h5" 
              color="text.primary" 
              gutterBottom
              fontWeight="medium"
              sx={{ mb: 2 }}
            >
              Your favorites list is empty
            </MotionTypography>
            <MotionTypography 
              variant="body1" 
              color="text.secondary" 
              paragraph
              sx={{ maxWidth: 500, mb: 4 }}
            >
              Start adding products you love to your favorites list. You can add them while browsing our catalog.
            </MotionTypography>
            <MotionButton
              variant="contained"
              color="primary"
              component="a"
              href="/"
              size="large"
              sx={{ 
                mt: 2,
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 'bold',
                boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
              }}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              startIcon={<ShoppingCart />}
            >
              Browse Products
            </MotionButton>
          </MotionBox>
        ) : (
          <Grid container spacing={4}>
            {favoriteProducts.map((product, index) => (
              <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                <MotionBox
                  variants={itemVariants}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  transition={{ delay: index * 0.1 }}
                  sx={{ height: '100%' }}
                >
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      position: 'relative',
                      borderRadius: 4,
                      overflow: 'hidden',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="220"
                        image={product.mainImage || '/placeholder-image.jpg'}
                        alt={product.name}
                        onClick={() => handleProductClick(product)}
                        sx={{ 
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          }
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          zIndex: 1,
                        }}
                      >
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFavorite(product);
                          }}
                          sx={{
                            bgcolor: alpha(theme.palette.background.paper, 0.9),
                            '&:hover': {
                              bgcolor: alpha(theme.palette.background.paper, 1),
                              transform: 'scale(1.1)',
                            },
                            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Box>
                      
                      {/* Category badge */}
                      <Chip
                        label={product.categoryName}
                        size="small"
                        color="primary"
                        sx={{
                          position: 'absolute',
                          bottom: 10,
                          left: 10,
                          backgroundColor: alpha(theme.palette.primary.main, 0.9),
                          color: '#fff',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        }}
                      />
                      
                      {/* Info button */}
                      <IconButton
                        onClick={() => handleProductClick(product)}
                        sx={{
                          position: 'absolute',
                          bottom: 10,
                          right: 10,
                          bgcolor: alpha(theme.palette.background.paper, 0.9),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.background.paper, 1),
                          },
                          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                        }}
                      >
                        <InfoIcon color="primary" />
                      </IconButton>
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: '1.1rem',
                          mb: 1,
                          minHeight: '3.3rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {product.name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Rating name="read-only" value={4.5} precision={0.5} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          (4.5)
                        </Typography>
                      </Box>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          mb: 2, 
                          flexGrow: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {product.description || `High-quality product in ${product.categoryName} category`}
                      </Typography>
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          ${product.price.toLocaleString()}
                        </Typography>
                        
                        <MotionButton
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<ShoppingCart />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(product);
                          }}
                          sx={{ 
                            borderRadius: 8,
                            px: 2,
                            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
                          }}
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          Add
                        </MotionButton>
                      </Box>
                    </CardContent>
                  </Card>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Enhanced Product Dialog */}
      <Dialog
        open={!!selectedProduct}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 24px 50px rgba(0,0,0,0.25)',
          }
        }}
        TransitionProps={{
          timeout: 400
        }}
      >
        {selectedProduct && (
          <>
            <Box sx={{ 
              position: 'relative',
              bgcolor: theme.palette.background.paper,
            }}>
              <DialogTitle 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  py: 2
                }}
              >
                <MotionTypography
                  variant="h5"
                  fontWeight="bold"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {selectedProduct.name}
                </MotionTypography>
                <IconButton 
                  onClick={handleCloseDialog}
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              
              <DialogContent sx={{ p: 0 }}>
                <Grid container>
                  <Grid item xs={12} md={6} sx={{ p: 0 }}>
                    <MotionBox
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      sx={{
                        position: 'relative',
                        height: '100%',
                        minHeight: { xs: '300px', md: '400px' },
                      }}
                    >
                      <Box
                        component="img"
                        src={selectedProduct.mainImage || '/placeholder-image.jpg'}
                        alt={selectedProduct.name}
                        sx={{ 
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                      
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          width: '100%',
                          p: 2,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                        }}
                      >
                        <Typography variant="h5" color="white" fontWeight="bold">
                          ${selectedProduct.price.toLocaleString()}
                        </Typography>
                      </Box>
                    </MotionBox>
                  </Grid>
                  
                  <Grid item xs={12} md={6} sx={{ p: 0 }}>
                    <Box sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <MotionBox
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        sx={{ mb: 3 }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: theme.palette.primary.main,
                              width: 56,
                              height: 56,
                              mr: 2,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }}
                          >
                            <Science />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Category
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                              {selectedProduct.categoryName}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <MotionTypography 
                          variant="body1" 
                          paragraph
                          variants={itemVariants}
                          sx={{ 
                            fontSize: '1rem',
                            lineHeight: 1.7,
                            mb: 4 
                          }}
                        >
                          {selectedProduct.description || 
                            `This premium quality product belongs to our ${selectedProduct.categoryName} collection. 
                            Designed for optimal performance and reliability, it's a perfect choice for your hydroponic system needs.`
                          }
                        </MotionTypography>
                        
                        <Divider sx={{ my: 3 }} />
                        
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Status
                          </Typography>
                          <Chip 
                            label={selectedProduct.status} 
                            color={selectedProduct.status === 'In Stock' ? 'success' : 'warning'}
                            sx={{ fontWeight: 'medium' }}
                          />
                        </Box>
                        
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Rating
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Rating value={4.5} precision={0.5} readOnly />
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                              (4.5/5)
                            </Typography>
                          </Box>
                        </Box>
                      </MotionBox>
                      
                      <Box sx={{ mt: 'auto', display: 'flex', gap: 2 }}>
                        <MotionButton 
                          fullWidth
                          variant="contained" 
                          startIcon={<ShoppingCart />}
                          onClick={() => {
                            onAddToCart(selectedProduct);
                            handleCloseDialog();
                          }}
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                          sx={{ 
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 'bold',
                            boxShadow: '0 4px 15px rgba(76, 175, 80, 0.25)',
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
                          }}
                        >
                          Add to Cart
                        </MotionButton>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </DialogContent>
            </Box>
          </>
        )}
      </Dialog>
    </motion.div>
  );
};

export default FavoritePage;