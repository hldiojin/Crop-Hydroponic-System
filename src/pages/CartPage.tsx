import React, { useEffect, useState } from "react";
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
  CircularProgress,
} from "@mui/material";
import { Add, Remove, Delete } from "@mui/icons-material";
import { CartItem } from "../types/types";
import { cartService, CartDetailItem } from "../services/cartService";

interface CartPageProps {
  cart: CartItem[];
  updateQuantity: (id: string, change: number) => void;
  removeFromCart: (id: string) => void;
}

const CartPage: React.FC<CartPageProps> = ({
  cart,
  updateQuantity,
  removeFromCart,
}) => {
  const [cartDetails, setCartDetails] = useState<CartDetailItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate total based on cart details from API
  const total = cartDetails.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  useEffect(() => {
    const fetchCartDetails = async () => {
      try {
        setLoading(true);
        const details = await cartService.getCartDetails();
        setCartDetails(details);
      } catch (err) {
        console.error("Failed to fetch cart details:", err);
        setError("Failed to load cart items.");
      } finally {
        setLoading(false);
      }
    };

    fetchCartDetails();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          p: 4,
          marginTop: "100px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Container sx={{ py: 4, flexGrow: 1 }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error}
          </Typography>
        </Container>
      </Box>
    );
  }

  if (cartDetails.length === 0) {
    return (
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Container sx={{ py: 4, flexGrow: 1 }}>
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
        </Container>
      </Box>
    );
  }

  // Handle quantity update with the API
  const handleUpdateQuantity = async (
    id: string,
    productId: string,
    unitPrice: number,
    currentQuantity: number,
    change: number
  ) => {
    const newQuantity = currentQuantity + change;

    // First update UI optimistically
    updateQuantity(productId, change);

    // Then update on the server
    try {
      if (newQuantity <= 0) {
        await cartService.removeFromCart(id);
      } else {
        // Use updateCartQuantity directly since it matches the API format
        await cartService.updateCartQuantity(productId, newQuantity);
      }

      // Refresh cart details after any change
      const details = await cartService.getCartDetails();
      setCartDetails(details);
    } catch (error) {
      console.error("Failed to update cart item:", error);
    }
  };

  // Handle remove from cart with the API
  const handleRemoveFromCart = async (id: string, productId: string) => {
    // First update UI optimistically
    removeFromCart(productId);

    // Then use updateCartQuantity to set quantity to 0 on the server
    try {
      await cartService.updateCartQuantity(productId, 0);

      // Refresh cart details after removing
      const details = await cartService.getCartDetails();
      setCartDetails(details);
    } catch (error) {
      console.error("Failed to remove cart item:", error);
    }
  };

  return (
    <Container sx={{ py: 4, marginTop: "100px" }}>
      <Typography variant="h4" gutterBottom>
        Shopping Cart
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {cartDetails.map((item) => (
            <Card key={item.id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={3}>
                    <CardMedia
                      component="img"
                      height="100"
                      image={item.productImage || "/placeholder-image.jpg"}
                      alt={item.productName}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="h6">{item.productName}</Typography>
                    <Typography color="text.secondary">
                      ${item.unitPrice.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Box display="flex" alignItems="center">
                      <IconButton
                        onClick={() =>
                          handleUpdateQuantity(
                            item.id,
                            item.productId,
                            item.unitPrice,
                            item.quantity,
                            -1
                          )
                        }
                      >
                        <Remove />
                      </IconButton>
                      <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                      <IconButton
                        onClick={() =>
                          handleUpdateQuantity(
                            item.id,
                            item.productId,
                            item.unitPrice,
                            item.quantity,
                            1
                          )
                        }
                      >
                        <Add />
                      </IconButton>
                    </Box>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="subtitle1">
                      ${(item.unitPrice * item.quantity).toLocaleString()}
                    </Typography>
                    <IconButton
                      color="error"
                      onClick={() =>
                        handleRemoveFromCart(item.id, item.productId)
                      }
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
                Total: ${total.toLocaleString()}
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
