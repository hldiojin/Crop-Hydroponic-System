// src/pages/CartPage.tsx
import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Button,
  Box,
  CardMedia,
} from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import { CartItem } from '../types/types';

interface CartPageProps {
  cart: CartItem[];
  updateQuantity: (id: number, change: number) => void;
  removeFromCart: (id: number) => void;
}

const CartPage: React.FC<CartPageProps> = ({ cart, updateQuantity, removeFromCart }) => {
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h5" gutterBottom>
          Your cart is empty
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Shopping Cart
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {cart.map((item) => (
            <Card key={item.product.id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={3}>
                    <CardMedia
                      component="img"
                      height="100"
                      image={item.product.image}
                      alt={item.product.name}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="h6">{item.product.name}</Typography>
                    <Typography color="text.secondary">
                      ${item.product.price.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Box display="flex" alignItems="center">
                      <IconButton onClick={() => updateQuantity(item.product.id, -1)}>
                        <Remove />
                      </IconButton>
                      <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                      <IconButton onClick={() => updateQuantity(item.product.id, 1)}>
                        <Add />
                      </IconButton>
                    </Box>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="subtitle1">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </Typography>
                    <IconButton 
                      color="error"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Typography variant="h4" color="primary">
                Total: ${total.toFixed(2)}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
              >
                Checkout
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;