"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import { CheckCircle, ShoppingBag } from "@mui/icons-material";

export default function OrderConfirmation() {
  const router = useNavigate();
  const [orderNumber] = useState("ORD-" + Math.floor(Math.random() * 10000));

  // Sample order data - in a real app, this would come from your state management or API
  const orderDetails = {
    date: new Date().toLocaleDateString(),
    items: [
      { id: 1, name: "Green T-shirt", price: 29.99, quantity: 2 },
      { id: 2, name: "White Sneakers", price: 89.99, quantity: 1 },
      { id: 3, name: "Denim Jeans", price: 59.99, quantity: 1 },
    ],
    shipping: {
      method: "Standard Shipping",
      cost: 4.99,
      address: "123 Main St, Anytown, AN 12345",
    },
    payment: {
      method: "Credit Card",
      last4: "4242",
    },
  };

  // Calculate totals
  const subtotal = orderDetails.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal + orderDetails.shipping.cost;

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          border: "1px solid #e0e0e0",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 4,
          }}
        >
          <CheckCircle
            color="success"
            sx={{ fontSize: 64, strokeWidth: 1.5 }}
          />
          <Typography
            variant="h4"
            sx={{
              mt: 2,
              color: "#2e7d32",
              fontWeight: "bold",
            }}
          >
            Order Confirmed!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Thank you for your purchase
          </Typography>
          <Chip
            label={`Order #${orderNumber}`}
            sx={{
              mt: 2,
              bgcolor: "#e8f5e9",
              color: "#2e7d32",
              fontWeight: "medium",
              px: 1,
            }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium" }}>
              Order Summary
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: "#fafafa" }}>
              <List disablePadding>
                {orderDetails.items.map((item) => (
                  <ListItem key={item.id} sx={{ py: 1, px: 0 }}>
                    <ListItemText
                      primary={item.name}
                      secondary={`Qty: ${item.quantity}`}
                    />
                    <Typography variant="body2">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
                <Divider sx={{ my: 1 }} />
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Subtotal" />
                  <Typography variant="body2">
                    ${subtotal.toFixed(2)}
                  </Typography>
                </ListItem>
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary={orderDetails.shipping.method} />
                  <Typography variant="body2">
                    ${orderDetails.shipping.cost.toFixed(2)}
                  </Typography>
                </ListItem>
                <Divider sx={{ my: 1 }} />
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Total" />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#2e7d32" }}
                  >
                    ${total.toFixed(2)}
                  </Typography>
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium" }}>
              Shipping Details
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "#fafafa" }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: "medium" }}>
                Delivery Address:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {orderDetails.shipping.address}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" sx={{ mb: 1, fontWeight: "medium" }}>
                Shipping Method:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {orderDetails.shipping.method}
              </Typography>
            </Paper>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium" }}>
              Payment Information
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: "#fafafa" }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: "medium" }}>
                Payment Method:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {orderDetails.payment.method} ending in{" "}
                {orderDetails.payment.last4}
              </Typography>
            </Paper>
          </Grid>
        </Grid> */}

        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<ShoppingBag />}
            onClick={() => router("/")}
            sx={{
              bgcolor: "#2e7d32",
              "&:hover": {
                bgcolor: "#1b5e20",
              },
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            Return to Home
          </Button>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            A confirmation email has been sent to your email address.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
