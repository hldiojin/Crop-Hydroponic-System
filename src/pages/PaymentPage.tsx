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
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  ShoppingCart,
  ArrowBack,
  LocalShipping,
  Payment,
  CheckCircleOutline,
  CreditCard,
  AccountBalance,
  NavigateNext,
  LockOutlined,
  ErrorOutline,
  AttachMoney,
  CreditCardOutlined,
  VerifiedUser,
  LocalAtm,
} from "@mui/icons-material";
import { CartDetailItem } from "../services/cartService";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MotionBox,
  MotionButton,
  itemVariants,
  containerVariants,
  buttonVariants,
} from "../utils/motion";
import { useAuth } from "../context/AuthContext";
import { submitOrder, processTransaction } from "../services/orderSevice";
import { deviceService, Device } from "../services/deviceService";

// Create properly typed motion components to fix TypeScript errors
const MotionCard = motion(Card);
const MotionContainer = motion(Container);
const MotionPaper = motion(Paper);

interface PaymentFormData {
  paymentMethod: string;
  cardholderName: string;
  cardNumber: string;
  expirationDate: string;
  cvv: string;
  saveCard: boolean;
}

const PaymentPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { isAuthenticated, token } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Partial<PaymentFormData>>({});
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [shippingMethod, setShippingMethod] = useState<string>("");
  const [formData, setFormData] = useState<PaymentFormData>({
    paymentMethod: "payos",
    cardholderName: "",
    cardNumber: "",
    expirationDate: "",
    cvv: "",
    saveCard: false,
  });
  const [cartDetails, setCartDetails] = useState<CartDetailItem[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<
    Record<string, number>
  >({});
  const [devices, setDevices] = useState<Device[]>([]);

  const subtotal = 129.99;
  const shipping =
    shippingMethod === "standard"
      ? 0
      : shippingMethod === "express"
      ? 12.99
      : 24.99;
  const discount = 0;
  const total = subtotal + shipping - discount;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/checkout/payment" } });
    }
  }, [isAuthenticated, navigate]);

  // Fetch shipping info from localStorage
  useEffect(() => {
    const address = localStorage.getItem("shippingAddress");
    const method = localStorage.getItem("shippingMethod");
    const devices = localStorage.getItem("selectedDevices");

    if (!address || !method) {
      navigate("/checkout/shipping");
    } else {
      setShippingAddress(JSON.parse(address));
      setShippingMethod(method);
      if (devices) {
        setSelectedDevices(JSON.parse(devices));
      }
    }
  }, [navigate]);

  useEffect(() => {
    const syncCartDetails = () => {
      const cartData = localStorage.getItem("cartDetails");
      if (cartData) {
        setCartDetails(JSON.parse(cartData));
      }
    };

    // Lấy dữ liệu giỏ hàng khi trang được tải
    syncCartDetails();

    // Lắng nghe sự thay đổi của localStorage
    window.addEventListener("storage", syncCartDetails);

    // Cleanup listener khi component bị unmount
    return () => {
      window.removeEventListener("storage", syncCartDetails);
    };
  }, []);

  // Add new useEffect for fetching devices
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const deviceData = await deviceService.getAll();
        setDevices(deviceData);
      } catch (error) {
        console.error("Failed to fetch devices:", error);
      }
    };

    if (isAuthenticated) {
      fetchDevices();
    }
  }, [isAuthenticated]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear validation error when field is changed
    if (formErrors[name as keyof PaymentFormData]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  // Format expiration date
  const formatExpirationDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");

    if (v.length > 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }

    return value;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formattedValue = formatCardNumber(value);

    setFormData((prev) => ({ ...prev, cardNumber: formattedValue }));

    if (formErrors.cardNumber) {
      setFormErrors((prev) => ({ ...prev, cardNumber: undefined }));
    }
  };

  const handleExpirationDateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    const formattedValue = formatExpirationDate(value);

    setFormData((prev) => ({ ...prev, expirationDate: formattedValue }));

    if (formErrors.expirationDate) {
      setFormErrors((prev) => ({ ...prev, expirationDate: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<PaymentFormData> = {};

    // No validation required for PayOS or Cash on Delivery

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setProcessingPayment(true);

      // Get selected cart items
      const selectedCartData = localStorage.getItem("selectedCartDetails");
      const selectedItems = selectedCartData
        ? JSON.parse(selectedCartData)
        : [];

      // Calculate totals
      const productsTotal = selectedItems.reduce(
        (sum: number, item: CartDetailItem) =>
          sum + item.unitPrice * item.quantity,
        0
      );
      const devicesTotal = Object.entries(selectedDevices)
        .filter(([_, quantity]) => quantity > 0)
        .reduce((sum: number, [deviceId, quantity]) => {
          const device = devices.find((d) => d.id === deviceId);
          return sum + (device?.price || 0) * quantity;
        }, 0);
      const subtotal = productsTotal + devicesTotal;
      const total = subtotal + shipping - discount;

      // Prepare order data with new structure
      const orderData = {
        products: selectedItems.map((item: CartDetailItem) => ({
          id: item.productId,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
        })),
        devices: Object.entries(selectedDevices)
          .filter(([_, quantity]) => quantity > 0)
          .map(([deviceId, quantity]) => {
            const device = devices.find((d) => d.id === deviceId);
            return {
              id: deviceId,
              unitPrice: device?.price || 0,
              quantity: quantity,
            };
          }),
      };

      if (formData.paymentMethod === "cashOnDelivery") {
        try {
          const orderResponse = await submitOrder(orderData);

          if (
            orderResponse &&
            orderResponse.statusCodes === 200 &&
            orderResponse.response?.data
          ) {
            const orderId = orderResponse.response.data;

            localStorage.setItem("paymentMethod", formData.paymentMethod);
            localStorage.setItem("orderId", orderId);
            localStorage.setItem("orderTotal", total.toString());

            localStorage.removeItem("cartDetails");
            localStorage.removeItem("selectedCartDetails");
            localStorage.removeItem("selectedDevices");

            navigate("/checkout/confirmation");
          } else {
            throw new Error("Failed to create order");
          }
        } catch (error) {
          console.error("Order creation failed:", error);
          throw error;
        }
      }
      // For PayOS payment method
      else if (formData.paymentMethod === "payos") {
        const orderResponse = await submitOrder(orderData);

        if (
          orderResponse &&
          orderResponse.statusCodes === 200 &&
          orderResponse.response?.data
        ) {
          const transactionId = orderResponse.response.data;

          // Add returnUrl to the transaction request
          const returnUrl = `${window.location.origin}/payos-callback`;
          const transactionResponse = await processTransaction(transactionId);

          // Store payment info and order ID
          localStorage.setItem("paymentMethod", formData.paymentMethod);
          localStorage.setItem("orderId", transactionId);
          localStorage.setItem("orderTotal", total.toString());

          // Store cart data for later use after payment
          localStorage.setItem(
            "pendingOrder",
            JSON.stringify({
              cartDetails: selectedItems,
              selectedDevices,
              shippingAddress,
              shippingMethod,
              total,
            })
          );

          // Navigate to PayOS payment page with returnUrl
          window.location.href = `${transactionResponse}?returnUrl=${encodeURIComponent(
            returnUrl
          )}`;
        } else {
          throw new Error("Failed to create order");
        }
      }
    } catch (error) {
      console.error("Payment processing failed:", error);
      setFormErrors({
        paymentMethod: "Payment processing failed. Please try again.",
      });
    } finally {
      setProcessingPayment(false);
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
          background: "linear-gradient(to bottom, #f9f9f9, #e8f5e9)",
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
            repeatDelay: 1,
          }}
        >
          <Payment sx={{ fontSize: 80, color: theme.palette.primary.main }} />
        </motion.div>
        <Typography variant="h6" color="textSecondary" sx={{ mt: 3 }}>
          Loading payment options...
        </Typography>
      </Box>
    );
  }

  // Main payment view
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
        overflow: "hidden",
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
          zIndex: 0,
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
          zIndex: 0,
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
          zIndex: 1,
        }}
      >
        <IconButton
          onClick={() => navigate("/checkout/shipping")}
          sx={{
            mr: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.2),
              transform: "scale(1.1)",
            },
            transition: "all 0.3s ease",
            boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
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
            letterSpacing: "0.5px",
          }}
        >
          Payment Method
        </Typography>

        <Badge badgeContent={3} color="secondary" sx={{ ml: "auto" }}>
          <ShoppingCart
            sx={{ fontSize: 28, color: theme.palette.primary.main }}
          />
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
          zIndex: 1,
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
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          }}
        >
          {[
            { label: "Cart", icon: <ShoppingCart /> },
            { label: "Shipping", icon: <LocalShipping /> },
            { label: "Payment", icon: <CreditCard /> },
            { label: "Confirmation", icon: <CheckCircleOutline /> },
          ].map((step, index) => (
            <Box
              key={step.label}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "25%",
                position: "relative",
                cursor: index < 2 ? "pointer" : "default",
              }}
              onClick={
                index === 0
                  ? () => navigate("/cart")
                  : index === 1
                  ? () => navigate("/checkout/shipping")
                  : undefined
              }
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  bgcolor:
                    index <= 2
                      ? theme.palette.primary.main
                      : alpha(theme.palette.primary.main, 0.1),
                  color: index <= 2 ? "white" : theme.palette.primary.main,
                  mb: 1,
                  transition: "all 0.3s ease",
                }}
              >
                {step.icon}
              </Box>
              <Typography
                variant="body2"
                fontWeight={index === 2 ? "bold" : "normal"}
                color={index <= 2 ? "primary" : "text.secondary"}
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
                    bgcolor:
                      index < 2
                        ? theme.palette.primary.main
                        : alpha(theme.palette.primary.main, 0.1),
                    zIndex: -1,
                  }}
                />
              )}
            </Box>
          ))}
        </Paper>
      </MotionBox>

      {/* Main content */}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          {/* Payment form */}
          <Grid item xs={12} md={8}>
            <MotionPaper
              variants={itemVariants}
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                mb: 3,
                position: "relative",
                overflow: "hidden",
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
                  zIndex: 0,
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
                  zIndex: 1,
                }}
              >
                <Payment fontSize="small" color="primary" /> Payment Method
              </Typography>

              <FormControl
                component="fieldset"
                error={!!formErrors.paymentMethod}
                sx={{ width: "100%" }}
              >
                <RadioGroup
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleFormChange}
                >
                  {[
                    {
                      id: "payos",
                      name: "PayOS",
                      description: "Pay securely with PayOS gateway",
                      icon: <CreditCardOutlined />,
                    },
                    {
                      id: "cashOnDelivery",
                      name: "Cash on Delivery",
                      description: "Pay with cash when you receive your order",
                      icon: <LocalAtm />,
                    },
                  ].map((method) => (
                    <MotionCard
                      key={method.id}
                      whileHover={{ scale: 1.01 }}
                      sx={{
                        mb: 2,
                        borderRadius: 2,
                        border:
                          formData.paymentMethod === method.id
                            ? `2px solid ${theme.palette.primary.main}`
                            : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        boxShadow:
                          formData.paymentMethod === method.id
                            ? `0 4px 12px ${alpha(
                                theme.palette.primary.main,
                                0.2
                              )}`
                            : "0 2px 8px rgba(0,0,0,0.05)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <FormControlLabel
                        value={method.id}
                        control={<Radio color="primary" />}
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              py: 1,
                            }}
                          >
                            <Box
                              sx={{
                                mr: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                              }}
                            >
                              {method.icon}
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {method.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {method.description}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{
                          width: "100%",
                          m: 0,
                          "& .MuiFormControlLabel-label": { width: "100%" },
                        }}
                      />
                    </MotionCard>
                  ))}
                </RadioGroup>
                {formErrors.paymentMethod && (
                  <FormHelperText>{formErrors.paymentMethod}</FormHelperText>
                )}
              </FormControl>

              {formData.paymentMethod === "payos" && (
                <Alert
                  severity="info"
                  sx={{ mt: 3, borderRadius: 2 }}
                  icon={<CreditCardOutlined />}
                >
                  <Typography variant="body2">
                    Click "Complete Order" to proceed with PayOS payment
                    gateway. You will be redirected to a secure payment page.
                  </Typography>
                </Alert>
              )}

              {formData.paymentMethod === "cashOnDelivery" && (
                <Alert
                  severity="info"
                  sx={{ mt: 3, borderRadius: 2 }}
                  icon={<LocalAtm />}
                >
                  <Typography variant="body2">
                    Please have the exact amount ready when your order arrives.
                    Our delivery personnel do not carry change.
                  </Typography>
                </Alert>
              )}
            </MotionPaper>

            {/* Shipping info summary */}
            <MotionPaper
              variants={itemVariants}
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                mb: 3,
                position: "relative",
                overflow: "hidden",
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
                  zIndex: 0,
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
                  zIndex: 1,
                }}
              >
                <LocalShipping fontSize="small" color="primary" /> Shipping
                Details
              </Typography>

              {shippingAddress && (
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.background.default, 0.7),
                          border: `1px solid ${alpha(
                            theme.palette.primary.main,
                            0.2
                          )}`,
                          height: "100%",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Shipping Address
                        </Typography>
                        <Typography
                          variant="body1"
                          gutterBottom
                          fontWeight="medium"
                        >
                          {shippingAddress.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          {shippingAddress.phone}
                        </Typography>
                        <Typography variant="body2">
                          {shippingAddress.address}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.background.default, 0.7),
                          border: `1px solid ${alpha(
                            theme.palette.primary.main,
                            0.2
                          )}`,
                          height: "100%",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Shipping Method
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <LocalShipping
                            color="primary"
                            sx={{ mr: 1, fontSize: 20 }}
                          />
                          <Typography variant="body1" fontWeight="medium">
                            {shippingMethod === "standard"
                              ? "Standard Shipping"
                              : shippingMethod === "express"
                              ? "Express Shipping"
                              : "Overnight Shipping"}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          {shippingMethod === "standard"
                            ? "Delivery in 5-7 business days"
                            : shippingMethod === "express"
                            ? "Delivery in 2-3 business days"
                            : "Next day delivery (order before 2pm)"}
                        </Typography>
                        <Chip
                          label={
                            shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`
                          }
                          size="small"
                          color={shipping === 0 ? "success" : "default"}
                          sx={{ mt: 1, fontWeight: "bold" }}
                        />
                      </Paper>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2, textAlign: "right" }}>
                    <Button
                      size="small"
                      onClick={() => navigate("/checkout/shipping")}
                      startIcon={<ArrowBack fontSize="small" />}
                    >
                      Edit Shipping Details
                    </Button>
                  </Box>
                </Box>
              )}
            </MotionPaper>

            <MotionBox
              variants={itemVariants}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 3,
              }}
            >
              <MotionButton
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                startIcon={<ArrowBack />}
                variant="outlined"
                onClick={() => navigate("/checkout/shipping")}
                sx={{
                  fontWeight: "medium",
                  borderRadius: 2,
                  px: 3,
                }}
              >
                Back to Shipping
              </MotionButton>

              <MotionButton
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                type="submit"
                variant="contained"
                color="primary"
                disabled={processingPayment}
                endIcon={
                  processingPayment ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <NavigateNext />
                  )
                }
                sx={{
                  fontWeight: "bold",
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                {processingPayment ? "Processing..." : "Complete Order"}
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
                backdropFilter: "blur(10px)",
              }}
            >
              <Box
                sx={{
                  p: 3,
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  color: "white",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
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

                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ position: "relative", zIndex: 1 }}
                >
                  Order Summary
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ mt: 1, opacity: 0.8, position: "relative", zIndex: 1 }}
                >
                  {cartDetails.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                  items in your cart
                </Typography>
              </Box>

              <CardContent sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      sx={{ mb: 2 }}
                    >
                      Order Items
                    </Typography>

                    <Stack spacing={2}>
                      {cartDetails.map((item, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2">
                            {item.productName}{" "}
                            <Typography component="span" color="text.secondary">
                              x{item.quantity}
                            </Typography>
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            ${item.unitPrice.toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>

                    <Button
                      size="small"
                      startIcon={<ArrowBack fontSize="small" />}
                      sx={{ mt: 2 }}
                      onClick={() => navigate("/cart")}
                    >
                      Edit Cart
                    </Button>
                  </Paper>

                  {/* Add selected devices section */}
                  {Object.entries(selectedDevices).some(
                    ([_, quantity]) => quantity > 0
                  ) && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.background.default, 0.5),
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ mb: 2 }}
                      >
                        Selected Devices
                      </Typography>

                      <Stack spacing={2}>
                        {Object.entries(selectedDevices)
                          .filter(([_, quantity]) => quantity > 0)
                          .map(([deviceId, quantity]) => {
                            const device = devices.find(
                              (d) => d.id === deviceId
                            );
                            return (
                              <Box
                                key={deviceId}
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Typography variant="body2">
                                  {device?.name}{" "}
                                  <Typography
                                    component="span"
                                    color="text.secondary"
                                  >
                                    x{quantity}
                                  </Typography>
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  ${(device?.price || 0) * quantity}
                                </Typography>
                              </Box>
                            );
                          })}
                      </Stack>
                    </Paper>
                  )}

                  <Divider />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      Subtotal
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      $
                      {cartDetails
                        .reduce(
                          (sum, item) => sum + item.unitPrice * item.quantity,
                          0
                        )
                        .toFixed(2)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
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

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
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
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      $
                      {(
                        cartDetails.reduce(
                          (sum, item) => sum + item.unitPrice * item.quantity,
                          0
                        ) + shipping
                      ).toFixed(2)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>
      </form>
    </MotionContainer>
  );
};

export default PaymentPage;
