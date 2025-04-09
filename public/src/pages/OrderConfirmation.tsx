import React, { useState, useEffect } from "react";
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
  useTheme,
  alpha,
} from "@mui/material";
import {
  CheckCircle,
  ShoppingBag,
  ErrorOutline,
  Home,
  Receipt,
  LocalShipping,
  Payment,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { checkTransactionStatus } from "../services/orderSevice";
import { useAuth } from "../context/AuthContext";

// Wrapper components với motion
const MotionPaper = motion(Paper);
const MotionBox = motion(Box);
const MotionButton = motion(Button);

const OrderConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [orderTotal, setOrderTotal] = useState<string>("0");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [shippingMethod, setShippingMethod] = useState<string>("");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const iconVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { 
        duration: 0.5, 
        type: "spring", 
        stiffness: 200, 
        damping: 10 
      },
    },
  };

  useEffect(() => {
    console.log("OrderConfirmation - Auth status:", { isAuthenticated });
    try {
      // Retrieve data from localStorage
      const storedPaymentStatus = localStorage.getItem('paymentStatus');
      const orderId = localStorage.getItem('completedOrderId') || localStorage.getItem('orderId');
      const totalAmount = localStorage.getItem('totalAmount') || localStorage.getItem('orderTotal');
      const storedPaymentMethod = localStorage.getItem('paymentMethod');
      const transactionId = localStorage.getItem('transactionId');
      
      console.log("OrderConfirmation - Retrieved data:", { 
        paymentStatus: storedPaymentStatus, 
        orderId, 
        totalAmount, 
        paymentMethod: storedPaymentMethod, 
        transactionId 
      });

      if (orderId) {
        setOrderNumber(orderId);
      } else {
        console.warn("No order ID found in localStorage");
      }

      if (totalAmount) {
        setOrderTotal(totalAmount);
      } else {
        console.warn("No total amount found in localStorage");
      }

      if (storedPaymentMethod) {
        setPaymentMethod(storedPaymentMethod);
      } else {
        console.warn("No payment method found in localStorage");
      }

      // Đọc địa chỉ giao hàng và phương thức vận chuyển
      const address = localStorage.getItem("shippingAddress");
      const shipping = localStorage.getItem("shippingMethod");

      // Determine final payment status
      let finalStatus: 'success' | 'failed' | 'pending' = 'pending';
      if (storedPaymentStatus === 'success') {
        finalStatus = 'success';
      } else if (storedPaymentStatus === 'failed') {
        finalStatus = 'failed';
      } else if (storedPaymentMethod === 'cashOnDelivery') {
        // Với COD, chúng ta coi như thành công vì thanh toán sẽ diễn ra khi giao hàng
        finalStatus = 'success';
      }

      setPaymentStatus(finalStatus);
      console.log("OrderConfirmation - Final payment status:", finalStatus);

      // Check transaction status if we have a transaction ID and payment is not successful
      if (transactionId && finalStatus !== 'success') {
        console.log("Checking transaction status for:", transactionId);
        checkTransactionStatus(transactionId)
          .then((result: { statusCodes: number; response: { success: boolean } }) => {
            console.log("Transaction status check result:", result);
            if (result && result.statusCodes === 200 && result.response.success) {
              setPaymentStatus('success');
            } else {
              setPaymentStatus('failed');
            }
          })
          .catch((error: Error) => {
            console.error('Error checking transaction status:', error);
            setPaymentStatus('failed');
          });
      }
      
      if (address) {
        setShippingAddress(JSON.parse(address));
      }
      
      if (shipping) {
        setShippingMethod(shipping);
      }
      
      // Clear payment status from localStorage to avoid confusion on reload
      if (storedPaymentStatus !== 'pending') {
        localStorage.removeItem("paymentStatus");
      }
    } catch (error) {
      console.error("Error in OrderConfirmation:", error);
      setPaymentStatus('failed');
    }
  }, [isAuthenticated]);

  return (
    <Container 
      component={motion.div}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      maxWidth="md" 
      sx={{ 
        py: 8,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <MotionPaper
        variants={itemVariants}
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          background: `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)})`,
          backdropFilter: "blur(10px)",
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <Box
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: alpha(theme.palette.primary.light, 0.1),
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: alpha(theme.palette.secondary.light, 0.08),
            zIndex: 0,
          }}
        />

        <MotionBox
          variants={itemVariants}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 4,
            position: "relative",
            zIndex: 1,
          }}
        >
          <MotionBox
            variants={iconVariants}
            sx={{ 
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: 100,
              height: 100,
              borderRadius: "50%",
              bgcolor: paymentStatus === 'success' 
                ? alpha(theme.palette.success.main, 0.15) 
                : alpha(theme.palette.error.main, 0.15),
              mb: 2
            }}
          >
            {paymentStatus === 'success' ? (
              <CheckCircle
                sx={{ 
                  fontSize: 60, 
                  color: theme.palette.success.main,
                }}
              />
            ) : (
              <ErrorOutline
                sx={{ 
                  fontSize: 60, 
                  color: theme.palette.error.main,
                }}
              />
            )}
          </MotionBox>

          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: paymentStatus === 'success' 
                ? theme.palette.success.main 
                : theme.palette.error.main,
              textAlign: "center",
            }}
          >
            {paymentStatus === 'success' 
              ? 'Đặt hàng thành công!' 
              : 'Thanh toán không thành công!'}
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ mt: 1, textAlign: "center" }}
          >
            {paymentStatus === 'success' 
              ? 'Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận.' 
              : 'Đơn hàng của bạn chưa được thanh toán. Vui lòng thử lại sau.'}
          </Typography>
          
          {orderNumber && (
            <Chip
              label={`Mã đơn hàng: ${orderNumber}`}
              sx={{
                mt: 2,
                bgcolor: paymentStatus === 'success' 
                  ? alpha(theme.palette.success.main, 0.1) 
                  : alpha(theme.palette.error.main, 0.1),
                color: paymentStatus === 'success' 
                  ? theme.palette.success.main 
                  : theme.palette.error.main,
                fontWeight: "medium",
                px: 1,
                py: 2,
                fontSize: "1rem",
              }}
            />
          )}
        </MotionBox>

        <Divider sx={{ my: 3 }} />

        {paymentStatus === 'success' && (
          <MotionBox variants={itemVariants}>
            <Grid container spacing={4}>
              {/* Thông tin giao hàng */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium", display: "flex", alignItems: "center", gap: 1 }}>
                  <LocalShipping fontSize="small" color="primary" /> Thông tin giao hàng
                </Typography>
                
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    height: "100%"
                  }}
                >
                  {shippingAddress ? (
                    <>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Địa chỉ giao hàng:
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        {shippingAddress.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {shippingAddress.phone}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {shippingAddress.address}
                      </Typography>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Phương thức vận chuyển:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {shippingMethod === "standard" 
                          ? "Giao hàng tiêu chuẩn (2-5 ngày)" 
                          : shippingMethod === "express" 
                            ? "Giao hàng nhanh (1-2 ngày)" 
                            : "Giao hàng hỏa tốc (24 giờ)"}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Không có thông tin giao hàng
                    </Typography>
                  )}
                </Paper>
              </Grid>
              
              {/* Thông tin thanh toán */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium", display: "flex", alignItems: "center", gap: 1 }}>
                  <Payment fontSize="small" color="primary" /> Thông tin thanh toán
                </Typography>
                
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    height: "100%"
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Phương thức thanh toán:
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {paymentMethod === "payos" 
                      ? "Thanh toán qua PayOS" 
                      : paymentMethod === "cashOnDelivery" 
                        ? "Thanh toán khi nhận hàng (COD)" 
                        : "Chưa xác định"}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Tổng thanh toán:
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    {orderTotal ? `$${parseFloat(orderTotal).toLocaleString()}` : "$0.00"}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Trạng thái thanh toán:
                  </Typography>
                  <Chip 
                    label={paymentStatus === 'success' ? "Đã thanh toán" : "Chưa thanh toán"} 
                    color={paymentStatus === 'success' ? "success" : "error"}
                    size="small"
                  />
                </Paper>
              </Grid>
            </Grid>
          </MotionBox>
        )}

        <MotionBox 
          variants={itemVariants}
          sx={{ 
            mt: 4, 
            display: "flex", 
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 2
          }}
        >
          <MotionButton
            variant="contained"
            size="large"
            startIcon={<Home />}
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            sx={{
              bgcolor: theme.palette.primary.main,
              "&:hover": {
                bgcolor: theme.palette.primary.dark,
              },
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            Về trang chủ
          </MotionButton>
          
          {paymentStatus === 'success' && (
            <MotionButton
              variant="outlined"
              size="large"
              startIcon={<Receipt />}
              onClick={() => navigate("/profile/orders")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              sx={{
                color: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
                "&:hover": {
                  borderColor: theme.palette.primary.dark,
                },
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              Xem đơn hàng
            </MotionButton>
          )}
          
          {paymentStatus !== 'success' && (
            <MotionButton
              variant="outlined"
              size="large"
              startIcon={<ShoppingBag />}
              onClick={() => navigate("/cart")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              sx={{
                color: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
                "&:hover": {
                  borderColor: theme.palette.primary.dark,
                },
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              Quay lại giỏ hàng
            </MotionButton>
          )}
        </MotionBox>

        {paymentStatus === 'success' && (
          <MotionBox 
            variants={itemVariants}
            sx={{ textAlign: "center", mt: 3 }}
          >
            <Typography variant="body2" color="text.secondary">
              Email xác nhận đã được gửi đến địa chỉ email của bạn.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Bạn cũng có thể theo dõi trạng thái đơn hàng trong mục "Đơn hàng của tôi" trên trang cá nhân.
            </Typography>
          </MotionBox>
        )}
      </MotionPaper>
    </Container>
  );
};

export default OrderConfirmation;
