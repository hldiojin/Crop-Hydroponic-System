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
  useMediaQuery,
  Checkbox,
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
  CheckCircleOutline,
  CreditCard,
  LocalMall,
  MonetizationOn,
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
  buttonVariants,
} from "../utils/motion";
import { deviceService, Device } from "../services/deviceService";
import { submitOrder } from "../services/orderSevice";

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
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedDevices, setSelectedDevices] = useState<
    Record<string, number>
  >({});
  const [devices, setDevices] = useState<Device[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Thêm state để theo dõi các sản phẩm được chọn
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>(
    {}
  );
  const [selectAll, setSelectAll] = useState<boolean>(false);

  // Tính toán tổng tiền dựa trên các sản phẩm được chọn
  const selectedSubtotal = cartDetails
    .filter((item) => selectedItems[item.id])
    .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // const selectedShipping = selectedSubtotal > 100 ? 0 : 15;
  const selectedTotal = selectedSubtotal;

  // Số lượng sản phẩm được chọn
  const selectedCount = Object.values(selectedItems).filter(Boolean).length;

  // Hàm xử lý khi chọn/bỏ chọn tất cả
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    const newSelectedItems = { ...selectedItems };
    cartDetails.forEach((item) => {
      newSelectedItems[item.id] = newSelectAll;
    });

    setSelectedItems(newSelectedItems);
  };

  // Hàm xử lý khi chọn/bỏ chọn một sản phẩm
  const handleSelectItem = (id: string) => {
    const newSelectedItems = {
      ...selectedItems,
      [id]: !selectedItems[id],
    };

    setSelectedItems(newSelectedItems);

    // Kiểm tra xem tất cả đã được chọn chưa
    const allSelected = cartDetails.every((item) => newSelectedItems[item.id]);
    setSelectAll(allSelected);
  };

  // Calculate total based on cart details from API
  const subtotal = cartDetails.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const shipping = subtotal > 100 ? 0 : 15;
  const total = subtotal + shipping;

  useEffect(() => {
    const fetchCartDetails = async () => {
      try {
        setLoading(true);

        // Load cart details from API
        const details = await cartService.getCartDetails();

        // Check if we have selected products from the device selection page
        //const selectedCartData = localStorage.getItem("selectedCartDetails");
        // if (selectedCartData) {
        //   const selectedProducts = JSON.parse(selectedCartData);
        //   // Combine existing cart details with selected products
        //   setCartDetails([...details, ...selectedProducts]);
        // } else {
        setCartDetails(details);
        // }

        // Check if we have selected devices from the device selection page
        // const devicesData = localStorage.getItem("selectedDevices");
        // if (devicesData) {
        //   setSelectedDevices(JSON.parse(devicesData));

        //   // Load device details to display them
        //   try {
        //     const devicesList = await deviceService.getAll();
        //     setDevices(devicesList);
        //   } catch (err) {
        //     console.error("Failed to fetch devices:", err);
        //   }
        // }

        // Lưu dữ liệu giỏ hàng vào localStorage
        // localStorage.setItem("cartDetails", JSON.stringify(details));
      } catch (err) {
        console.error("Failed to fetch cart details:", err);
        setError("Failed to load cart items.");
      } finally {
        setLoading(false);
      }
    };

    fetchCartDetails();
  }, []);

  // Cập nhật useEffect để khởi tạo selectedItems khi cartDetails thay đổi
  useEffect(() => {
    if (cartDetails.length > 0) {
      const initialSelectedItems: Record<string, boolean> = {};
      cartDetails.forEach((item) => {
        // Nếu sản phẩm chưa có trong state, mặc định chọn tất cả
        initialSelectedItems[item.id] =
          selectedItems[item.id] !== undefined ? selectedItems[item.id] : true;
      });

      const initialQuantities: Record<string, number> = {};
      cartDetails.forEach((item) => {
        initialQuantities[item.id] = item.quantity;
      });
      setSelectedItems(initialSelectedItems);

      // Kiểm tra xem tất cả đã được chọn chưa
      const allSelected = cartDetails.every(
        (item) => initialSelectedItems[item.id]
      );
      setSelectAll(allSelected);
    }
  }, [cartDetails]);

  const handleUpdateQuantity = async (
    id: string,
    productId: string,
    unitPrice: number,
    currentQuantity: number,
    change: number
  ) => {
    const newQuantity = currentQuantity + change;

    // First update UI optimistically
    // updateQuantity(productId, change);

    // Then update on the server
    try {
      // updateQuantity(productId, change);
      await cartService.updateCartQuantity(productId, newQuantity);

      // Refresh cart details after any change
      const details = await cartService.getCartDetails();
      setCartDetails(details);
    } catch (error) {
      console.error("Failed to update cart item:", error);
    }
  };

  const handleRemoveFromCart = async (id: string, productId: string) => {
    // First update UI optimistically
    // removeFromCart(productId);

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

  // Hàm xử lý khi nhấn "Proceed to Checkout"
  const handleProceedToCheckout = async () => {
    try {
      // Lọc các sản phẩm được chọn
      const selectedProducts = cartDetails.filter(
        (item) => selectedItems[item.id]
      );

      // Lưu danh sách sản phẩm được chọn vào localStorage
      // localStorage.setItem(
      //   "selectedCartDetails",
      //   JSON.stringify(selectedProducts)
      // );

      // Prepare order data
      const orderData = {
        products: selectedProducts.map((item) => ({
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

      // Call API to create order
      const orderResponse = await submitOrder(orderData);

      if (
        orderResponse &&
        orderResponse.statusCodes === 200 &&
        orderResponse.response?.data
      ) {
        const orderId = orderResponse.response.data;

        // Save order ID to localStorage
        localStorage.setItem("currentOrderId", orderId);

        // Chuyển đến trang shipping
        navigate(`/checkout/${orderId}/shipping`);
      } else {
        throw new Error("Failed to create order");
      }
    } catch (error) {
      console.error("Order creation failed:", error);
      // Show error to user
      alert("Failed to create order. Please try again.");
    }
  };

  const handleClearCart = async () => {
    try {
      await cartService.removeFromCart();

      // Refresh cart details after removing
      const details = await cartService.getCartDetails();
      setCartDetails(details);
    } catch (error) {
      console.error("Failed to remove cart item:", error);
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
          <ShoppingCart
            sx={{ fontSize: 80, color: theme.palette.primary.main }}
          />
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
          background: "linear-gradient(to bottom, #f9f9f9, #e8f5e9)",
        }}
      >
        <MotionPaper
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
          }}
          elevation={3}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 4,
            maxWidth: 600,
            boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
          }}
        >
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
              "& .MuiAlert-icon": {
                fontSize: 28,
              },
            }}
            icon={<Delete fontSize="inherit" />}
          >
            {error}
          </Alert>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Không thể tải giỏ hàng
          </Typography>
          <Typography color="textSecondary" paragraph>
            Có vẻ như có sự cố khi tải giỏ hàng của bạn. Vui lòng thử lại sau.
          </Typography>
          <MotionButton
            variant="contained"
            color="primary"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
            sx={{ mt: 2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Quay lại trang chủ
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
          background: "linear-gradient(to bottom, #f9f9f9, #e8f5e9)",
        }}
      >
        <MotionPaper
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 25,
          }}
          elevation={3}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 4,
            maxWidth: 600,
            boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
            overflow: "hidden",
            position: "relative",
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
              delay: 0.2,
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
                ease: "easeInOut",
              }}
            >
              <ShoppingCart
                sx={{
                  fontSize: 100,
                  color: alpha(theme.palette.primary.main, 0.7),
                  filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))",
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
              mb: 2,
            }}
          >
            Giỏ hàng của bạn đang trống
          </Typography>

          <Typography
            color="textSecondary"
            paragraph
            sx={{
              mb: 4,
              maxWidth: 400,
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Hiện tại không có sản phẩm nào trong giỏ hàng của bạn. Hãy thêm sản
            phẩm để bắt đầu mua sắm!
          </Typography>

          <MotionButton
            variant="contained"
            color="primary"
            size="large"
            startIcon={<ShoppingBag />}
            onClick={() => navigate("/")}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
            }}
            whileTap={{ scale: 0.95 }}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: 2,
              fontWeight: "bold",
            }}
          >
            Bắt đầu mua sắm
          </MotionButton>

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="textSecondary">
              Bạn cần trợ giúp?{" "}
              <Button size="small" color="primary">
                Liên hệ với chúng tôi
              </Button>
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
          onClick={() => navigate("/devices")}
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
          Giỏ hàng
        </Typography>

        <Badge
          badgeContent={cartDetails.reduce(
            (sum, item) => sum + item.quantity,
            0
          )}
          color="secondary"
          sx={{ ml: "auto" }}
        >
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
            { label: "Giỏ hàng", icon: <ShoppingCart /> },
            { label: "Vận chuyển", icon: <LocalShipping /> },
            { label: "Thanh toán", icon: <CreditCard /> },
            { label: "Xác nhận", icon: <CheckCircleOutline /> },
          ].map((step, index) => (
            <Box
              key={step.label}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "25%",
                position: "relative",
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
                  bgcolor:
                    index === activeStep
                      ? theme.palette.primary.main
                      : alpha(theme.palette.primary.main, 0.1),
                  color:
                    index === activeStep ? "white" : theme.palette.primary.main,
                  mb: 1,
                  transition: "all 0.3s ease",
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
                    bgcolor:
                      index < activeStep
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
                backdropFilter: "blur(8px)",
              }}
            >
              <Grid container alignItems="center">
                <Grid item xs={1}>
                  <Checkbox
                    checked={selectAll}
                    onChange={handleSelectAll}
                    color="primary"
                    sx={{ p: 0.5 }}
                  />
                </Grid>
                <Grid item xs={4} sm={5}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Sản phẩm
                  </Typography>
                </Grid>
                <Grid item xs={3} sm={2} sx={{ textAlign: "center" }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Số lượng
                  </Typography>
                </Grid>
                <Grid item xs={4} sm={4} sx={{ textAlign: "right" }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Tổng cộng
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </MotionBox>

          <AnimatePresence>
            {cartDetails.map((item, index) => (
              <MotionCard
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: index * 0.1 },
                }}
                exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  transition: { duration: 0.2 },
                }}
                sx={{
                  mb: 2,
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                  bgcolor: "white",
                  position: "relative",
                  p: 0,
                  transition: "all 0.3s ease",
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
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    }}
                  />
                )}

                <Grid container alignItems="center" spacing={0}>
                  <Grid item xs={1}>
                    <Checkbox
                      checked={selectedItems[item.id] || false}
                      onChange={() => handleSelectItem(item.id)}
                      color="primary"
                      sx={{
                        p: 0.5,
                        color: selectedItems[item.id]
                          ? theme.palette.primary.main
                          : alpha(theme.palette.text.primary, 0.3),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", p: 2 }}>
                      <Box
                        sx={{
                          position: "relative",
                          width: 100,
                          height: 100,
                          marginRight: 2,
                          overflow: "hidden",
                          borderRadius: 2,
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
                              transform: "scale(1.1)",
                            },
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
                            lineHeight: 1.2,
                          }}
                        >
                          {item.productName}
                        </Typography>

                        <Chip
                          label={`${item.unitPrice.toLocaleString()}đ`}
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
                        border: `1px solid ${alpha(
                          theme.palette.divider,
                          0.5
                        )}`,
                        borderRadius: 2,
                        width: "fit-content",
                        mx: "auto",
                        overflow: "hidden",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
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
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                          },
                        }}
                      >
                        <Remove fontSize="small" />
                      </IconButton>

                      <Typography
                        sx={{
                          mx: 2,
                          minWidth: 24,
                          textAlign: "center",
                          fontWeight: "bold",
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
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                          },
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
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {(item.unitPrice * item.quantity).toLocaleString()} VND
                    </Typography>

                    <Button
                      color="error"
                      size="small"
                      onClick={() =>
                        handleRemoveFromCart(item.id, item.productId)
                      }
                      startIcon={<Delete fontSize="small" />}
                      sx={{
                        mt: 1,
                        fontWeight: "medium",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                        },
                      }}
                    >
                      Xóa
                    </Button>
                  </Grid>
                </Grid>
              </MotionCard>
            ))}
          </AnimatePresence>

          <MotionBox
            variants={itemVariants}
            sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}
          >
            <MotionButton
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              startIcon={<ArrowBack />}
              variant="outlined"
              onClick={() => navigate("/")}
              sx={{
                fontWeight: "medium",
                borderRadius: 2,
                px: 3,
              }}
            >
              Tiếp tục mua hàng
            </MotionButton>

            <MotionButton
              variants={buttonVariants}
              onClick={handleClearCart}
              whileHover="hover"
              whileTap="tap"
              color="error"
              variant="text"
              startIcon={<Delete />}
              sx={{ fontWeight: "medium" }}
            >
              Xóa giỏ hàng
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
              height: "fit-content",
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
                Tóm tắt đơn hàng
              </Typography>

              <Typography
                variant="body2"
                sx={{ mt: 1, opacity: 0.8, position: "relative", zIndex: 1 }}
              >
                {cartDetails.reduce((sum, item) => sum + item.quantity, 0)} sản
                phẩm trong giỏ hàng
              </Typography>
            </Box>

            <CardContent sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Tổng sản Phẩm ({selectedCount}{" "}
                    {selectedCount > 1 ? "items" : "item"})
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedSubtotal.toLocaleString()} VND
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
                    Tổng cộng
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
                    {selectedTotal.toLocaleString()} VND
                  </Typography>
                </Box>

                <MotionButton
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  startIcon={<Payment />}
                  onClick={handleProceedToCheckout}
                  disabled={selectedCount === 0}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  sx={{
                    py: 1.5,
                    fontWeight: "bold",
                    borderRadius: 2,
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                  }}
                >
                  {selectedCount > 0
                    ? `Checkout (${selectedCount} sản phẩm)`
                    : "Chọn sản phẩm để thanh toán"}
                </MotionButton>

                {/* Payment methods - Updated */}
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ fontWeight: "medium" }}
                  >
                    Chúng tôi chấp nhận:
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 1.5,
                      px: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 1.5,
                        borderRadius: 2,
                        border: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.2
                        )}`,
                        bgcolor: alpha(theme.palette.primary.light, 0.05),
                        width: "48%",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                          borderColor: theme.palette.primary.main,
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <CreditCard
                        sx={{
                          color: theme.palette.primary.main,
                          mr: 1,
                          fontSize: 22,
                        }}
                      />
                      <Typography variant="body2" fontWeight="medium">
                        PayOS
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 1.5,
                        borderRadius: 2,
                        border: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.2
                        )}`,
                        bgcolor: alpha(theme.palette.primary.light, 0.05),
                        width: "48%",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                          borderColor: theme.palette.primary.main,
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <MonetizationOn
                        sx={{
                          color: theme.palette.primary.main,
                          mr: 1,
                          fontSize: 22,
                        }}
                      />
                      <Typography variant="body2" fontWeight="medium">
                        Thanh toán khi nhận hàng
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>

      {/* Add selected devices section */}
      {Object.entries(selectedDevices).some(([_, quantity]) => quantity > 0) &&
        devices.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: "blur(10px)",
              mb: 3,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Thiết bị đã chọn
            </Typography>

            {Object.entries(selectedDevices)
              .filter(([_, quantity]) => quantity > 0)
              .map(([deviceId, quantity]) => {
                const device = devices.find((d) => d.id === deviceId);
                return (
                  device && (
                    <MotionCard
                      key={deviceId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      sx={{
                        mb: 2,
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      }}
                    >
                      <Grid container alignItems="center">
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: "flex", p: 2 }}>
                            <Box
                              sx={{
                                width: 80,
                                height: 80,
                                borderRadius: 1,
                                overflow: "hidden",
                                mr: 2,
                              }}
                            >
                              <CardMedia
                                component="img"
                                sx={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                image={
                                  device.attachment || "/placeholder-device.jpg"
                                }
                                alt={device.name}
                              />
                            </Box>
                            <Box>
                              <Typography variant="h6" fontWeight="bold">
                                {device.name}
                              </Typography>
                              <Chip
                                label={`$${device.price.toLocaleString()}`}
                                size="small"
                                color="primary"
                                sx={{ mt: 1 }}
                              />
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={2} sx={{ textAlign: "center" }}>
                          <Typography variant="body1" fontWeight="medium">
                            Quantity: {quantity}
                          </Typography>
                        </Grid>
                        <Grid
                          item
                          xs={6}
                          sm={4}
                          sx={{ textAlign: "right", pr: 3 }}
                        >
                          <Typography
                            variant="h6"
                            color="primary"
                            fontWeight="bold"
                          >
                            {(device.price * quantity).toLocaleString()} VND
                          </Typography>
                          <Button
                            color="error"
                            size="small"
                            onClick={() => {
                              const newSelectedDevices = { ...selectedDevices };
                              delete newSelectedDevices[deviceId];
                              setSelectedDevices(newSelectedDevices);
                              localStorage.setItem(
                                "selectedDevices",
                                JSON.stringify(newSelectedDevices)
                              );
                            }}
                            startIcon={<Delete fontSize="small" />}
                            sx={{ mt: 1 }}
                          >
                            Xóa
                          </Button>
                        </Grid>
                      </Grid>
                    </MotionCard>
                  )
                );
              })}
          </Paper>
        )}
    </MotionContainer>
  );
};

export default CartPage;
