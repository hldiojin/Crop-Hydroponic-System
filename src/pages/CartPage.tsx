import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Button,
  Box,
  CardMedia,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Chip,
  useTheme,
  alpha,
  TextField,
  InputAdornment,
  Stack,
  Badge,
  Alert,
  useMediaQuery
} from "@mui/material";
import { 
  Add, 
  Remove, 
  Delete, 
  ShoppingCart, 
  ArrowBack, 
  LocalShipping, 
  Payment, 
  ReceiptLong, 
  ShoppingBag, 
  LocalOffer,
  CheckCircleOutline,
  CreditCard,
  LocalMall
} from "@mui/icons-material";
import { CartItem } from "../types/types";
import { cartService, CartDetailItem } from "../services/cartService";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MotionBox, 
  MotionButton, 
  itemVariants, 
  containerVariants,
  buttonVariants 
} from "../utils/motion";

// Create properly typed motion components to fix TypeScript errors
const MotionCard = motion(Card);
const MotionContainer = motion(Container);
const MotionPaper = motion(Paper);

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
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  const [cartDetails, setCartDetails] = useState<CartDetailItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState<string>("");
  const [couponApplied, setCouponApplied] = useState<boolean>(false);
  const [discount, setDiscount] = useState<number>(0);
  const [activeStep, setActiveStep] = useState<number>(0);

  // Calculate total based on cart details from API
  const subtotal = cartDetails.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  
  const shipping = subtotal > 100 ? 0 : 15;
  const total = subtotal + shipping - discount;

  useEffect(() => {
    const fetchCartDetails = async () => {
      try {
        setLoading(true);
        const details = await cartService.getCartDetails();
        setCartDetails(details);
  
        // Lưu dữ liệu giỏ hàng vào localStorage
        localStorage.setItem("cartDetails", JSON.stringify(details));
      } catch (err) {
        console.error("Failed to fetch cart details:", err);
        setError("Failed to load cart items.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchCartDetails();
  }, []);

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
        await cartService.updateCartQuantity(productId, newQuantity);
      }

      // Refresh cart details after any change
      const details = await cartService.getCartDetails();
      setCartDetails(details);

      // Lưu dữ liệu giỏ hàng mới nhất vào localStorage
      localStorage.setItem("cartDetails", JSON.stringify(details));
    } catch (error) {
      console.error("Failed to update cart item:", error);
    }
  };

  const handleRemoveFromCart = async (id: string, productId: string) => {
    // First update UI optimistically
    removeFromCart(productId);

    // Then use updateCartQuantity to set quantity to 0 on the server
    try {
      await cartService.updateCartQuantity(productId, 0);

      // Refresh cart details after removing
      const details = await cartService.getCartDetails();
      setCartDetails(details);

      // Lưu dữ liệu giỏ hàng mới nhất vào localStorage
      localStorage.setItem("cartDetails", JSON.stringify(details));
    } catch (error) {
      console.error("Failed to remove cart item:", error);
    }
  };

  const handleApplyCoupon = () => {
    if (couponCode.toLowerCase() === "hydro25") {
      setDiscount(subtotal * 0.25);
      setCouponApplied(true);
    } else if (couponCode.toLowerCase() === "eco10") {
      setDiscount(subtotal * 0.1);
      setCouponApplied(true);
    } else {
      setDiscount(0);
      setCouponApplied(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "linear-gradient(to bottom, #f9f9f9, #e8f5e9)"
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            rotate: [0, 0, 270, 270, 0],
          }}
          transition={{ 
            duration: 3,
            ease: "easeInOut",
            times: [0, 0.2, 0.5, 0.8, 1],
            repeat: Infinity,
            repeatDelay: 1
          }}
        >
          <ShoppingCart sx={{ fontSize: 80, color: theme.palette.primary.main }} />
        </motion.div>
        <Typography variant="h6" color="textSecondary" sx={{ mt: 3 }}>
          Loading your cart...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <MotionContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        sx={{ 
          py: 8, 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center",
          minHeight: "100vh",
          background: "linear-gradient(to bottom, #f9f9f9, #e8f5e9)"
        }}
      >
        <MotionPaper
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
          elevation={3}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 4,
            maxWidth: 600,
            boxShadow: "0 8px 40px rgba(0,0,0,0.12)"
          }}
        >
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: 28
              }
            }}
            icon={<Delete fontSize="inherit" />}
          >
            {error}
          </Alert>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            We couldn't load your cart
          </Typography>
          <Typography color="textSecondary" paragraph>
            There was a problem connecting to our services. Please try again later.
          </Typography>
          <MotionButton
            variant="contained" 
            color="primary" 
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Return to Shop
          </MotionButton>
        </MotionPaper>
      </MotionContainer>
    );
  }

  // Empty cart state
  if (cartDetails.length === 0) {
    return (
      <MotionContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        sx={{ 
          py: 8, 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center",
          minHeight: "100vh",
          background: "linear-gradient(to bottom, #f9f9f9, #e8f5e9)"
        }}
      >
        <MotionPaper
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
          elevation={3}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 4,
            maxWidth: 600,
            boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
            overflow: "hidden",
            position: "relative"
          }}
        >
          {/* Decorative elements */}
          <Box
            sx={{
              position: "absolute",
              top: -40,
              left: -40,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: alpha(theme.palette.primary.light, 0.2),
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -30,
              right: -30,
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: alpha(theme.palette.secondary.light, 0.15),
            }}
          />
          
          <MotionBox
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 100,
              delay: 0.2
            }}
            sx={{ mb: 4 }}
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{ 
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut"
              }}
            >
              <ShoppingCart 
                sx={{ 
                  fontSize: 100, 
                  color: alpha(theme.palette.primary.main, 0.7),
                  filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
                }} 
              />
            </motion.div>
          </MotionBox>
          
          <Typography 
            variant="h4" 
            gutterBottom 
            fontWeight="bold"
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2
            }}
          >
            Your cart is empty
          </Typography>
          
          <Typography 
            color="textSecondary" 
            paragraph 
            sx={{ 
              mb: 4,
              maxWidth: 400,
              mx: "auto",
              lineHeight: 1.6
            }}
          >
            Looks like you haven't added any items to your cart yet.
            Browse our products and discover the best hydroponic solutions for your garden!
          </Typography>
          
          <MotionButton
  variant="contained"
  color="primary"
  size="large"
  startIcon={<ShoppingBag />}
  onClick={() => navigate('/products')}  
  whileHover={{ scale: 1.05, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
  whileTap={{ scale: 0.95 }}
  sx={{ 
    py: 1.5, 
    px: 4,
    borderRadius: 2,
    fontWeight: "bold"
  }}
>
  Explore Products
</MotionButton>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="textSecondary">
              Need help? <Button size="small" color="primary">Contact Support</Button>
            </Typography>
          </Box>
        </MotionPaper>
      </MotionContainer>
    );
  }

  // Main cart view
  return (
    <MotionContainer 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      maxWidth="lg"
      sx={{ 
        py: 6, 
        minHeight: "100vh",
        background: `linear-gradient(to bottom, #f9f9f9, #e8f5e9)`,
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Decorative shapes */}
      <Box
        sx={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: alpha(theme.palette.primary.light, 0.1),
          zIndex: 0
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -50,
          left: -50,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: alpha(theme.palette.secondary.light, 0.08),
          zIndex: 0
        }}
      />
      
      {/* Header section */}
      <MotionBox 
        variants={itemVariants} 
        sx={{ 
          mb: 5, 
          display: "flex", 
          alignItems: "center",
          position: "relative",
          zIndex: 1
        }}
      >
        <IconButton 
          onClick={() => navigate(-1)}
          sx={{ 
            mr: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            "&:hover": { 
              bgcolor: alpha(theme.palette.primary.main, 0.2),
              transform: "scale(1.1)"
            },
            transition: "all 0.3s ease",
            boxShadow: "0 4px 8px rgba(0,0,0,0.05)"
          }}
        >
          <ArrowBack />
        </IconButton>
        
        <Typography 
          variant="h4" 
          component="h1"
          fontWeight="bold"
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "0.5px"
          }}
        >
          Your Shopping Cart
        </Typography>
        
        <Badge 
          badgeContent={cartDetails.reduce((sum, item) => sum + item.quantity, 0)} 
          color="secondary"
          sx={{ ml: "auto" }}
        >
          <ShoppingCart sx={{ fontSize: 28, color: theme.palette.primary.main }} />
        </Badge>
      </MotionBox>

      {/* Steps indicator for checkout process */}
      <MotionBox 
        variants={itemVariants} 
        sx={{ 
          mb: 5,
          display: { xs: "none", md: "flex" },
          justifyContent: "center",
          position: "relative",
          zIndex: 1
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "80%",
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: "blur(8px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
          }}
        >
          {[
            { label: "Cart", icon: <ShoppingCart /> },
            { label: "Shipping", icon: <LocalShipping /> },
            { label: "Payment", icon: <CreditCard /> },
            { label: "Confirmation", icon: <CheckCircleOutline /> }
          ].map((step, index) => (
            <Box 
              key={step.label} 
              sx={{ 
                display: "flex", 
                flexDirection: "column",
                alignItems: "center",
                width: "25%",
                position: "relative"
              }}
            >
              <Box 
                sx={{ 
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  bgcolor: index === activeStep ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.1),
                  color: index === activeStep ? "white" : theme.palette.primary.main,
                  mb: 1,
                  transition: "all 0.3s ease"
                }}
              >
                {step.icon}
              </Box>
              <Typography 
                variant="body2" 
                fontWeight={index === activeStep ? "bold" : "normal"}
                color={index === activeStep ? "primary" : "text.secondary"}
              >
                {step.label}
              </Typography>
              
              {/* Connector line */}
              {index < 3 && (
                <Box 
                  sx={{ 
                    position: "absolute",
                    top: 25,
                    right: "-50%",
                    width: "100%",
                    height: 3,
                    bgcolor: index < activeStep ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.1),
                    zIndex: -1
                  }}
                />
              )}
            </Box>
          ))}
        </Paper>
      </MotionBox>

      {/* Main content */}
      <Grid container spacing={4}>
        {/* Cart items */}
        <Grid item xs={12} md={8}>
          <MotionBox variants={itemVariants}>
            <Paper 
              elevation={0}
              sx={{ 
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                mb: 2,
                p: 2,
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                backdropFilter: "blur(8px)"
              }}
            >
              <Grid container alignItems="center">
                <Grid item xs={5} sm={6}>
                  <Typography variant="subtitle1" fontWeight="bold">Product</Typography>
                </Grid>
                <Grid item xs={3} sm={2} sx={{ textAlign: "center" }}>
                  <Typography variant="subtitle1" fontWeight="bold">Quantity</Typography>
                </Grid>
                <Grid item xs={4} sm={4} sx={{ textAlign: "right" }}>
                  <Typography variant="subtitle1" fontWeight="bold">Subtotal</Typography>
                </Grid>
              </Grid>
            </Paper>
          </MotionBox>

          <AnimatePresence>
            {cartDetails.map((item, index) => (
              <MotionCard
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }}
                exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }}
                whileHover={{ 
                  scale: 1.02, 
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  transition: { duration: 0.2 }
                }}
                sx={{ 
                  mb: 2,
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                  bgcolor: "white",
                  position: "relative",
                  p: 0,
                  transition: "all 0.3s ease"
                }}
              >
                {item.quantity >= 5 && (
                  <Chip
                    label="Bulk Purchase"
                    color="secondary"
                    size="small"
                    sx={{ 
                      position: "absolute", 
                      top: 12, 
                      left: 12, 
                      zIndex: 2,
                      fontWeight: "bold",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                    }}
                  />
                )}
                
                <Grid container alignItems="center" spacing={0}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", p: 2 }}>
                      <Box
                        sx={{
                          position: "relative",
                          width: 100,
                          height: 100,
                          marginRight: 2,
                          overflow: "hidden",
                          borderRadius: 2
                        }}
                      >
                        <CardMedia
                          component="img"
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "all 0.5s ease",
                            "&:hover": {
                              transform: "scale(1.1)"
                            }
                          }}
                          image={item.productImage || "/placeholder-image.jpg"}
                          alt={item.productName}
                        />
                      </Box>
                      
                      <Box>
                        <Typography 
                          variant="h6" 
                          fontWeight="bold" 
                          gutterBottom
                          sx={{ 
                            color: theme.palette.primary.dark,
                            lineHeight: 1.2
                          }}
                        >
                          {item.productName}
                        </Typography>
                        
                        <Chip 
                          label={`$${item.unitPrice.toLocaleString()}`} 
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: "medium" }}
                        />
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          SKU: {item.productId.substring(0, 8)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} sm={2} sx={{ textAlign: "center" }}>
                    <Stack 
                      direction="row" 
                      alignItems="center" 
                      justifyContent="center"
                      sx={{
                        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        borderRadius: 2,
                        width: "fit-content",
                        mx: "auto",
                        overflow: "hidden",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleUpdateQuantity(
                            item.id,
                            item.productId,
                            item.unitPrice,
                            item.quantity,
                            -1
                          )
                        }
                        sx={{ 
                          color: theme.palette.primary.main,
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          borderRadius: 0,
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.1)
                          }
                        }}
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                      
                      <Typography 
                        sx={{ 
                          mx: 2, 
                          minWidth: 24, 
                          textAlign: "center",
                          fontWeight: "bold" 
                        }}
                      >
                        {item.quantity}
                      </Typography>
                      
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleUpdateQuantity(
                            item.id,
                            item.productId,
                            item.unitPrice,
                            item.quantity,
                            1
                          )
                        }
                        sx={{ 
                          color: theme.palette.primary.main,
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          borderRadius: 0,
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.1)
                          }
                        }}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Grid>
                  
                  <Grid item xs={6} sm={4} sx={{ textAlign: "right", pr: 3 }}>
                    <Typography 
                      variant="h6" 
                      color="primary.dark" 
                      fontWeight="bold"
                      sx={{ 
                        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent" 
                      }}
                    >
                      ${(item.unitPrice * item.quantity).toLocaleString()}
                    </Typography>
                    
                    <Button
                      color="error"
                      size="small"
                      onClick={() => handleRemoveFromCart(item.id, item.productId)}
                      startIcon={<Delete fontSize="small" />}
                      sx={{ 
                        mt: 1, 
                        fontWeight: "medium",
                        '&:hover': {
                          bgcolor: alpha(theme.palette.error.main, 0.1)
                        }
                      }}
                    >
                      Remove
                    </Button>
                  </Grid>
                </Grid>
              </MotionCard>
            ))}
          </AnimatePresence>
          
          <MotionBox variants={itemVariants} sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
            <MotionButton
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              startIcon={<ArrowBack />}
              variant="outlined"
              onClick={() => navigate('/')}
              sx={{ 
                fontWeight: "medium",
                borderRadius: 2,
                px: 3
              }}
            >
              Continue Shopping
            </MotionButton>
            
            <MotionButton
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              color="error"
              variant="text"
              startIcon={<Delete />}
              sx={{ fontWeight: "medium" }}
            >
              Clear Cart
            </MotionButton>
          </MotionBox>
        </Grid>
        
        {/* Order summary */}
        <Grid item xs={12} md={4}>
          <MotionCard
            variants={itemVariants}
            sx={{ 
              borderRadius: 3, 
              overflow: "hidden",
              boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
              position: "sticky",
              top: 100,
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: "blur(10px)"
            }}
          >
            <Box sx={{ 
              p: 3, 
              background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              color: "white",
              position: "relative",
              overflow: "hidden"
            }}>
              <Box
                sx={{
                  position: "absolute",
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.1)",
                }}
              />
              
              <Typography variant="h6" fontWeight="bold" sx={{ position: "relative", zIndex: 1 }}>
                Order Summary
              </Typography>
              
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8, position: "relative", zIndex: 1 }}>
                {cartDetails.reduce((sum, item) => sum + item.quantity, 0)} items in your cart
              </Typography>
            </Box>
            
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body1" color="text.secondary">
                    Subtotal
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    ${subtotal.toLocaleString()}
                  </Typography>
                </Box>
                
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body1" color="text.secondary">
                    Shipping
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {shipping === 0 ? (
                      <Chip 
                        label="FREE" 
                        color="success" 
                        size="small"
                        sx={{ fontWeight: "bold" }} 
                      />
                    ) : (
                      `$${shipping.toLocaleString()}`
                    )}
                  </Typography>
                </Box>
                
                {discount > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body1" color="error.main" sx={{ display: "flex", alignItems: "center" }}>
                      <LocalOffer fontSize="small" sx={{ mr: 1 }} /> Discount
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" color="error.main">
                      -${discount.toLocaleString()}
                    </Typography>
                  </Box>
                )}
                
                <Divider />
                
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="h6" fontWeight="bold">
                    Total
                  </Typography>
                  <Typography 
                    variant="h5" 
                    fontWeight="bold" 
                    color="primary.dark"
                    sx={{ 
                      background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent"
                    }}
                  >
                    ${total.toLocaleString()}
                  </Typography>
                </Box>
                
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: alpha(theme.palette.primary.light, 0.1),
                    borderRadius: 2,
                    border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: "medium" }}>
                    Apply Coupon
                  </Typography>
                  
                  <TextField
                    fullWidth
                    placeholder="Enter code"
                    size="small"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalOffer fontSize="small" color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button 
                            size="small" 
                            onClick={handleApplyCoupon}
                            disabled={!couponCode.trim()}
                            variant="contained"
                            color="primary"
                            sx={{ 
                              borderRadius: 1,
                              minWidth: "auto",
                              px: 2
                            }}
                          >
                            Apply
                          </Button>
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 1.5
                      }
                    }}
                    sx={{ mb: 1 }}
                  />
                  
                  {couponApplied && (
                    <Alert 
                      icon={<CheckCircleOutline />}
                      severity="success" 
                      sx={{ 
                        mt: 1,
                        borderRadius: 1.5,
                        '& .MuiAlert-icon': {
                          color: theme.palette.success.main
                        }
                      }}
                    >
                      <Typography variant="body2" fontWeight="medium">
                        Coupon applied successfully!
                      </Typography>
                    </Alert>
                  )}
                </Paper>
                
                <MotionButton
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  startIcon={<Payment />}
                  onClick={() => navigate('/checkout/shipping')}
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  sx={{ 
                    py: 1.5,
                    fontWeight: "bold",
                    borderRadius: 2,
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                    boxShadow: "0 8px 16px rgba(0,0,0,0.1)"
                  }}
                >
                  Proceed to Checkout
                </MotionButton>
                
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1
                }}>
                  <LocalShipping sx={{ color: theme.palette.success.main }} />
                  <Typography variant="body2" color="success.dark" fontWeight="medium">
                    Free shipping on orders over $100
                  </Typography>
                </Box>
                
                {/* Payment methods */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    We Accept:
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    {['visa', 'mastercard', 'paypal', 'apple-pay'].map(method => (
                      <Box 
                        key={method}
                        component="img"
                        src={`/assets/payment/${method}.svg`}
                        alt={method}
                        sx={{ 
                          height: 24,
                          opacity: 0.7,
                          filter: "grayscale(100%)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            opacity: 1,
                            filter: "grayscale(0%)"
                          }
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </MotionCard>
          
          {/* Additional recommendation card */}
          <MotionCard
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
            sx={{ 
              mt: 3,
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 8px 16px rgba(0,0,0,0.06)",
              transition: "all 0.3s ease"
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2, bgcolor: alpha(theme.palette.secondary.light, 0.1) }}>
                <Typography variant="subtitle1" fontWeight="bold" color="secondary.dark">
                  Recommended for You
                </Typography>
              </Box>
              
              <Box sx={{ display: "flex", p: 2 }}>
                <CardMedia
                  component="img"
                  sx={{ 
                    width: 70, 
                    height: 70, 
                    borderRadius: 1,
                    mr: 2,
                    objectFit: "cover"
                  }}
                  image="/assets/products/hydroponic-starter.jpg"
                  alt="Hydroponic Starter Kit"
                />
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight="medium">
                    Hydroponic Starter Kit
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Complete setup for beginners
                  </Typography>
                  
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="subtitle2" color="primary.main" fontWeight="bold">
                      $49.99
                    </Typography>
                    
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="primary"
                      startIcon={<Add fontSize="small" />}
                      sx={{ borderRadius: 1 }}
                    >
                      Add
                    </Button>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>
    </MotionContainer>
  );
};

export default CartPage;
