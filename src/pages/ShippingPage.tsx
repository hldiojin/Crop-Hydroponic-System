import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Button,
  Box,
  Container,
  Divider,
  Paper,
  Chip,
  useTheme,
  alpha,
  TextField,
  Stack,
  Badge,
  Alert,
  useMediaQuery,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormHelperText,
  Checkbox
} from "@mui/material";
import { 
  ShoppingCart, 
  ArrowBack, 
  LocalShipping, 
  Payment, 
  CheckCircleOutline,
  CreditCard,
  Home,
  LocationOn,
  NavigateNext,
  ErrorOutline,
  AccessTime,
  BusinessCenter,
  Info
} from "@mui/icons-material";
import { CartDetailItem } from "../services/cartService";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MotionBox, 
  MotionButton, 
  itemVariants, 
  containerVariants,
  buttonVariants 
} from "../utils/motion";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

// Create properly typed motion components to fix TypeScript errors
const MotionCard = motion(Card);
const MotionContainer = motion(Container);
const MotionPaper = motion(Paper);

interface UserAddress {
  name: string;
  phone: string;
  address: string;
}

interface ShippingFormData {
  name: string;
  phone: string;
  address: string;
  shippingMethod: string;
  saveAddress: boolean;
}

const ShippingPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { isAuthenticated, token } = useAuth();
  
  const [cartDetails, setCartDetails] = useState<CartDetailItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [formErrors, setFormErrors] = useState<Partial<ShippingFormData>>({});
  const [userAddress, setUserAddress] = useState<UserAddress | null>(null);
  const [addressLoading, setAddressLoading] = useState<boolean>(true);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [useExistingAddress, setUseExistingAddress] = useState<boolean>(true);
  const [formData, setFormData] = useState<ShippingFormData>({
    name: "",
    phone: "",
    address: "",
    shippingMethod: "standard",
    saveAddress: true
  });

  // Mock cart summary data similar to CartPage
  const subtotal = 129.99;
  const shipping = formData.shippingMethod === "standard" ? 0 : 
                 formData.shippingMethod === "express" ? 12.99 : 24.99;
  const discount = 0;
  const total = subtotal + shipping - discount;
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout/shipping' } });
    }
  }, [isAuthenticated, navigate]);
  
  // Fetch user address from API
  useEffect(() => {
    const fetchUserAddress = async () => {
      try {
        setAddressLoading(true);
        
        // Get auth token from localStorage or context
        const authToken = token || localStorage.getItem('accessToken');
        
        if (!authToken) {
          throw new Error("No authentication token found");
        }
        
        const response = await axios.get<UserAddress>("https://api.hmes.buubuu.id.vn/api/useraddress", {
          headers: {
            Authorization: `Bearer ${authToken}`
          },
          withCredentials: true  // Important: send cookies with the request
        });
        
        setUserAddress(response.data);
        
        // Pre-fill form with existing address
        setFormData(prev => ({
          ...prev,
          name: response.data.name,
          phone: response.data.phone,
          address: response.data.address
        }));
      } catch (err: any) {
        console.error("Failed to fetch user address:", err);
        
        if (err.response?.status === 401 || err.response?.data?.message?.includes("RefreshToken")) {
          // Auth issue - redirect to login
          navigate('/login', { state: { from: '/checkout/shipping' } });
        } else {
          // Other error - continue with form
          setAddressError("Failed to load saved address. You can enter a new one.");
          setLoading(false);
        }
      } finally {
        setAddressLoading(false);
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserAddress();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, token, navigate]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error when field is changed
    if (formErrors[name as keyof ShippingFormData]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<ShippingFormData> = {};
    
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    }
    
    if (!formData.address.trim()) {
      errors.address = "Address is required";
    }
    
    if (!formData.shippingMethod) {
      errors.shippingMethod = "Please select a shipping method";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // If user wants to save the address and it's different from existing one,
    // or if they're creating a new address
    if (formData.saveAddress && 
        (!userAddress || 
         formData.name !== userAddress.name || 
         formData.phone !== userAddress.phone || 
         formData.address !== userAddress.address)) {
      try {
        // Get auth token from localStorage or context
        const authToken = token || localStorage.getItem('accessToken');
        
        if (!authToken) {
          throw new Error("No authentication token found");
        }
        
        await axios.post("https://api.hmes.buubuu.id.vn/api/useraddress", {
          name: formData.name,
          phone: formData.phone,
          address: formData.address
        }, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true  // Important: send cookies with the request
        });
      } catch (err: any) {
        console.error("Failed to save address:", err);
        
        if (err.response?.status === 401 || err.response?.data?.message?.includes("RefreshToken")) {
          // Auth issue - redirect to login
          navigate('/login', { state: { from: '/checkout/shipping' } });
          return;
        }
        // Continue anyway for other errors, as this is not a critical error
      }
    }
    
    // Save shipping method to session/local storage for later use
    localStorage.setItem("shippingMethod", formData.shippingMethod);
    localStorage.setItem("shippingAddress", JSON.stringify({
      name: formData.name,
      phone: formData.phone,
      address: formData.address
    }));
    
    // Navigate to payment page
    navigate('/checkout/payment');
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
          <LocalShipping sx={{ fontSize: 80, color: theme.palette.primary.main }} />
        </motion.div>
        <Typography variant="h6" color="textSecondary" sx={{ mt: 3 }}>
          Loading shipping information...
        </Typography>
      </Box>
    );
  }

  // Main shipping view
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
          onClick={() => navigate('/cart')}
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
          Shipping Information
        </Typography>
        
        <Badge 
          badgeContent={3} 
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
                position: "relative",
                cursor: index < 1 ? "pointer" : "default",
              }}
              onClick={index < 1 ? () => navigate('/cart') : undefined}
            >
              <Box 
                sx={{ 
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  bgcolor: index <= 1 ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.1),
                  color: index <= 1 ? "white" : theme.palette.primary.main,
                  mb: 1,
                  transition: "all 0.3s ease"
                }}
              >
                {step.icon}
              </Box>
              <Typography 
                variant="body2" 
                fontWeight={index === 1 ? "bold" : "normal"}
                color={index <= 1 ? "primary" : "text.secondary"}
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
                    bgcolor: index < 1 ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.1),
                    zIndex: -1
                  }}
                />
              )}
            </Box>
          ))}
        </Paper>
      </MotionBox>

      {addressError && (
        <Alert 
          severity="info" 
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {addressError}
        </Alert>
      )}

      {/* Main content */}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          {/* Shipping form */}
          <Grid item xs={12} md={8}>
            {userAddress && (
              <MotionPaper
                variants={itemVariants}
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                  mb: 3,
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -30,
                    right: -30,
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: alpha(theme.palette.primary.light, 0.1),
                    zIndex: 0
                  }}
                />
                
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  sx={{ 
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    position: "relative",
                    zIndex: 1 
                  }}
                >
                  <LocationOn fontSize="small" color="primary" /> Saved Address
                </Typography>
                
                <FormControlLabel
                  control={
                    <Radio
                      checked={useExistingAddress}
                      onChange={() => setUseExistingAddress(true)}
                      name="useExistingAddress"
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        Use my existing address
                      </Typography>
                      
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          mt: 1,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.background.default, 0.7),
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          maxWidth: 500
                        }}
                      >
                        <Typography variant="body1" gutterBottom fontWeight="medium">
                          {userAddress.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {userAddress.phone}
                        </Typography>
                        <Typography variant="body2">
                          {userAddress.address}
                        </Typography>
                      </Paper>
                    </Box>
                  }
                  sx={{
                    alignItems: "flex-start",
                    m: 0
                  }}
                />
                
                <FormControlLabel
                  control={<Radio
                    checked={!useExistingAddress}
                    onChange={() => setUseExistingAddress(false)}
                    name="useNewAddress"
                    color="primary"
                  />}
                  label={<Typography variant="body1">Use a different address</Typography>}
                  sx={{ mt: 2 }}
                />
              </MotionPaper>
            )}
            
            {(!userAddress || !useExistingAddress) && (
              <MotionPaper
                variants={itemVariants}
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                  mb: 3,
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -30,
                    right: -30,
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: alpha(theme.palette.secondary.light, 0.1),
                    zIndex: 0
                  }}
                />
                
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  sx={{ 
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    position: "relative",
                    zIndex: 1 
                  }}
                >
                  <Home fontSize="small" color="primary" /> Shipping Address
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="name"
                      name="name"
                      label="Full Name"
                      value={formData.name}
                      onChange={handleFormChange}
                      error={!!formErrors.name}
                      helperText={formErrors.name}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="phone"
                      name="phone"
                      label="Phone Number"
                      value={formData.phone}
                      onChange={handleFormChange}
                      error={!!formErrors.phone}
                      helperText={formErrors.phone}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="address"
                      name="address"
                      label="Full Address"
                      multiline
                      rows={3}
                      value={formData.address}
                      onChange={handleFormChange}
                      error={!!formErrors.address}
                      helperText={formErrors.address}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.saveAddress}
                          onChange={handleFormChange}
                          name="saveAddress"
                          color="primary"
                        />
                      }
                      label="Save this address for future orders"
                    />
                  </Grid>
                </Grid>
              </MotionPaper>
            )}
            
            <MotionPaper
              variants={itemVariants}
              sx={{ 
                p: 3, 
                borderRadius: 3,
                boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                mb: 3,
                position: "relative",
                overflow: "hidden"
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: -30,
                  right: -30,
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: alpha(theme.palette.info.light, 0.1),
                  zIndex: 0
                }}
              />
              
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                sx={{ 
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  position: "relative",
                  zIndex: 1 
                }}
              >
                <LocalShipping fontSize="small" color="primary" /> Shipping Method
              </Typography>
              
              <FormControl 
                component="fieldset" 
                error={!!formErrors.shippingMethod}
                sx={{ width: "100%" }}
              >
                <RadioGroup
                  name="shippingMethod"
                  value={formData.shippingMethod}
                  onChange={handleFormChange}
                >
                  {[
                    {
                      id: "standard",
                      name: "Standard Shipping",
                      description: "Delivery in 5-7 business days",
                      price: 0,
                      icon: <LocalShipping />
                    },
                    {
                      id: "express",
                      name: "Express Shipping",
                      description: "Delivery in 2-3 business days",
                      price: 12.99,
                      icon: <AccessTime />
                    },
                    {
                      id: "overnight",
                      name: "Overnight Shipping",
                      description: "Next day delivery (order before 2pm)",
                      price: 24.99,
                      icon: <BusinessCenter />
                    }
                  ].map((method) => (
                    <MotionCard
                      key={method.id}
                      whileHover={{ scale: 1.01 }}
                      sx={{ 
                        mb: 2,
                        borderRadius: 2,
                        border: formData.shippingMethod === method.id ? 
                          `2px solid ${theme.palette.primary.main}` : 
                          `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        boxShadow: formData.shippingMethod === method.id ?
                          `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}` :
                          "0 2px 8px rgba(0,0,0,0.05)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <FormControlLabel
                        value={method.id}
                        control={<Radio color="primary" />}
                        label={
                          <Box sx={{ display: "flex", alignItems: "center", py: 1 }}>
                            <Box sx={{ 
                              mr: 2,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              bgcolor: alpha(theme.palette.primary.main, 0.1)
                            }}>
                              {method.icon}
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {method.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {method.description}
                              </Typography>
                            </Box>
                            <Typography 
                              variant="subtitle2" 
                              fontWeight="bold" 
                              sx={{ ml: "auto", pr: 2 }}
                            >
                              {method.price === 0 ? (
                                <Chip 
                                  label="FREE" 
                                  size="small" 
                                  color="success"
                                  sx={{ fontWeight: "bold" }}
                                />
                              ) : (
                                `$${method.price.toFixed(2)}`
                              )}
                            </Typography>
                          </Box>
                        }
                        sx={{ 
                          width: "100%", 
                          m: 0,
                          "& .MuiFormControlLabel-label": { width: "100%" }
                        }}
                      />
                    </MotionCard>
                  ))}
                </RadioGroup>
                {formErrors.shippingMethod && (
                  <FormHelperText>{formErrors.shippingMethod}</FormHelperText>
                )}
              </FormControl>

              <Alert 
                severity="info" 
                icon={<Info />}
                sx={{ mt: 2, borderRadius: 2 }}
              >
                <Typography variant="body2">
                  Order will be delivered within the estimated timeframe shown for each shipping method. 
                  All orders are processed Monday through Friday, excluding holidays.
                </Typography>
              </Alert>
            </MotionPaper>
            
            <MotionBox 
              variants={itemVariants} 
              sx={{ 
                display: "flex", 
                justifyContent: "space-between", 
                mt: 3
              }}
            >
              <MotionButton
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                startIcon={<ArrowBack />}
                variant="outlined"
                onClick={() => navigate('/cart')}
                sx={{ 
                  fontWeight: "medium",
                  borderRadius: 2,
                  px: 3
                }}
              >
                Back to Cart
              </MotionButton>
              
              <MotionButton
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                type="submit"
                variant="contained"
                color="primary"
                endIcon={<NavigateNext />}
                sx={{ 
                  fontWeight: "bold",
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                }}
              >
                Continue to Payment
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
                  3 items in your cart
                </Typography>
              </Box>
              
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={3}>
                  {/* Order items summary */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.background.default, 0.5)
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                      Order Items
                    </Typography>
                    
                    <Stack spacing={2}>
                      {[
                        { name: "Hydroponic Nutrient Solution", quantity: 1, price: 29.99 },
                        { name: "LED Grow Light Panel", quantity: 1, price: 79.99 },
                        { name: "Seedling Starter Kit", quantity: 1, price: 19.99 }
                      ].map((item, index) => (
                        <Box key={index} sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="body2">
                            {item.name} <Typography component="span" color="text.secondary">x{item.quantity}</Typography>
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            ${item.price.toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                    
                    <Button 
                      size="small" 
                      startIcon={<ArrowBack fontSize="small" />}
                      sx={{ mt: 2 }}
                      onClick={() => navigate('/cart')}
                    >
                      Edit Cart
                    </Button>
                  </Paper>

                  <Divider />
                  
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body1" color="text.secondary">
                      Subtotal
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      ${subtotal.toFixed(2)}
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
                        `$${shipping.toFixed(2)}`
                      )}
                    </Typography>
                  </Box>
                  
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
                      ${total.toFixed(2)}
                    </Typography>
                  </Box>
                  
                  <Alert 
                    severity="success"
                    icon={<CheckCircleOutline />}
                    sx={{ 
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      '& .MuiAlert-icon': {
                        color: theme.palette.success.main
                      }
                    }}
                  >
                    <Typography variant="body2" fontWeight="medium">
                      {subtotal > 100 ? "You qualify for free shipping!" : `Add $${(100 - subtotal).toFixed(2)} more to get free shipping`}
                    </Typography>
                  </Alert>
                </Stack>
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>
      </form>
    </MotionContainer>
  );
};

export default ShippingPage;