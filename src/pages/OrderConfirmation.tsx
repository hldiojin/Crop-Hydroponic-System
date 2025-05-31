import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  CircularProgress,
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
import {
  checkTransactionStatus,
  getCODBilling,
  getOrderById,
  OrderDetail,
  OrderDetailPayment,
} from "../services/orderSevice";
import { useAuth } from "../context/AuthContext";

// Wrapper components với motion
const MotionPaper = motion(Paper);
const MotionBox = motion(Box);
const MotionButton = motion(Button);

const OrderConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [paymentStatus, setPaymentStatus] = useState<
    "success" | "failed" | "pending"
  >("pending");
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [orderTotal, setOrderTotal] = useState<string>("0");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [shippingMethod, setShippingMethod] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [orderDetails, setOrderDetails] = useState<OrderDetailPayment | null>(null);

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
        damping: 10,
      },
    },
  };

  // Function to format price with commas
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Function to display proper payment method label
  const getPaymentMethodLabel = (method: string) => {
    if (method === "payos" || method === "BANK") {
      return "Thanh toán qua PayOS";
    } else if (method === "cashOnDelivery" || method === "CASH") {
      return "Thanh toán khi nhận hàng (COD)";
    }
    return "Chưa xác định";
  };

  useEffect(() => {
    console.log("OrderConfirmation - Auth status:", { isAuthenticated });
    try {
      // Check URL parameters for PayOS callback
      const urlParams = new URLSearchParams(location.search);
      const payosStatus = urlParams.get("status");
      const payosCode = urlParams.get("code");
      const payosCancel = urlParams.get("cancel");
      const transactionIdFromUrl = urlParams.get("id");

      console.log("URL PayOS params:", {
        payosStatus,
        payosCode,
        payosCancel,
        transactionIdFromUrl,
      });

      // Retrieve data from localStorage
      const storedPaymentStatus = localStorage.getItem("paymentStatus");
      const orderId =
        localStorage.getItem("completedOrderId") ||
        localStorage.getItem("orderId");
      const totalAmount =
        localStorage.getItem("totalAmount") ||
        localStorage.getItem("orderTotal");
      const storedPaymentMethod = localStorage.getItem("paymentMethod");
      const transactionId =
        transactionIdFromUrl;

      console.log("OrderConfirmation - Retrieved data:", {
        paymentStatus: storedPaymentStatus,
        orderId,
        totalAmount,
        paymentMethod: storedPaymentMethod,
        transactionId,
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

      // Determine payment status based on URL params first (direct callback)
      let finalStatus: "success" | "failed" | "pending" = "pending";

      // First check: Direct URL parameters (highest priority)
      if (
        payosStatus === "PAID" &&
        payosCode === "00" &&
        payosCancel === "false"
      ) {
        finalStatus = "success";
        // Store success in localStorage to persist through page refreshes
        localStorage.setItem("paymentStatus", "success");
        console.log("Setting success from URL params");
      } else if (payosCancel === "true" || payosStatus === "CANCELLED") {
        finalStatus = "failed";
        localStorage.setItem("paymentStatus", "failed");
        console.log("Setting failed from URL params (cancelled)");
      }
      // Second check: localStorage status
      else if (storedPaymentStatus === "success") {
        finalStatus = "success";
        console.log("Setting success from localStorage");
      } else if (storedPaymentStatus === "failed") {
        finalStatus = "failed";
        console.log("Setting failed from localStorage");
      }
      // Third check: Payment method specific logic
      else if (storedPaymentMethod === "cashOnDelivery") {
        // With COD, we consider it successful as payment will occur on delivery
        finalStatus = "success";
        console.log("Setting success for COD payment");
      }

      setPaymentStatus(finalStatus);
      console.log(
        "OrderConfirmation - Final payment status from initial check:",
        finalStatus
      );

      // For successful payments, fetch the order details from API
      const fetchOrderDetails = async () => {

        // if (orderId && finalStatus === "success") {
        //   try {
        //     console.log("Fetching order details from API for order:", orderId);
        //     var response = await getOrderById(orderId);

        //     if (
        //       response &&
        //       response.statusCodes === 200 &&
        //       response.response?.data
        //     ) {
        //       const orderData = response.response.data;
        //       console.log("Order details fetched successfully:", orderData);

        //       setOrderDetails(orderData);

        //       // Update UI with order data
        //       if (orderData.totalPrice) {
        //         setOrderTotal(orderData.totalPrice.toString());
        //       }

        //       if (orderData.userAddress) {
        //         setShippingAddress({
        //           name: orderData.userAddress.name,
        //           phone: orderData.userAddress.phone,
        //           address: orderData.userAddress.address,
        //         });
        //       }

        //       // Set shipping method from localStorage - API doesn't provide this
        //       const storedShippingMethod =
        //         localStorage.getItem("shippingMethod");
        //       if (storedShippingMethod) {
        //         setShippingMethod(storedShippingMethod);
        //       }

        //       // Keep the payment method from localStorage for proper display
        //       // We don't use the transaction paymentMethod as it may be coded differently
        //       const storedMethod = localStorage.getItem("paymentMethod");
        //       if (storedMethod) {
        //         setPaymentMethod(storedMethod);
        //       }
        //     } else {
        //       console.warn(
        //         "Could not get order details or invalid format",
        //         response
        //       );
        //     }
        //   } catch (error) {
        //     console.error("Error fetching order details:", error);
        //   } finally {
        //     setLoading(false);
        //   }
        // } else {
        //   setLoading(false);
        // }

        if (orderId && storedPaymentMethod == "cashOnDelivery") {
          var response = await getCODBilling(orderId);
          if (response && response.statusCodes === 200) {
            const orderData = response.response.data;
            console.log("COD billing details fetched successfully:", response);
            setOrderDetails(orderData);
            if (orderData.totalPrice) {
              setOrderTotal(orderData.totalPrice.toString());
            }
            if (orderData.userAddress) {
              setShippingAddress({
                name: orderData.userAddress.name,
                phone: orderData.userAddress.phone,
                address: orderData.userAddress.address,
              });
            }
            const storedMethod = localStorage.getItem("paymentMethod");
            if (storedMethod) {
              setPaymentMethod(storedMethod);
            }
            setLoading(false);
          } else {
            console.warn(
              "Could not get COD billing details or invalid format",
              response
            );
            setLoading(false);
          }
        } else if (transactionId) {
          var response = await checkTransactionStatus(transactionId)
          if (response && response.statusCodes === 200) {
            const orderData = response.response.data;
            console.log("COD billing details fetched successfully:", response);
            setOrderDetails(orderData);
            if (orderData.totalPrice) {
              setOrderTotal(orderData.totalPrice.toString());
            }
            if (orderData.userAddress) {
              setShippingAddress({
                name: orderData.userAddress.name,
                phone: orderData.userAddress.phone,
                address: orderData.userAddress.address,
              });
            }
            const storedMethod = localStorage.getItem("paymentMethod");
            if (storedMethod) {
              setPaymentMethod(storedMethod);
            }
            setLoading(false);
          } else {
            console.warn(
              "Could not get COD billing details or invalid format",
              response
            );
            setLoading(false);
          }
        }
      };

      fetchOrderDetails();

      // Only check transaction status if we don't already have a definitive success/failure status
      // and we have a transaction ID
      // if (transactionId) {
      //   console.log("Checking transaction status for:", transactionId);
      //   var response = await checkTransactionStatus(transactionId)
      //     .then(
      //       (result: {
      //         statusCodes: number;
      //         response: { success: boolean };
      //       }) => {
      //         console.log("Transaction status check result:", result);
      //         if (
      //           result &&
      //           result.statusCodes === 200 &&
      //           result.response.success
      //         ) {
      //           setPaymentStatus("success");
      //           localStorage.setItem("paymentStatus", "success");

      //           // Fetch order details after confirming successful payment
      //           // fetchOrderDetails();
      //           const orderData = result.response.data;
      //           console.log("COD billing details fetched successfully:", response);
      //           setOrderDetails(orderData);
      //           if (orderData.totalPrice) {
      //             setOrderTotal(orderData.totalPrice.toString());
      //           }
      //           if (orderData.userAddress) {
      //             setShippingAddress({
      //               name: orderData.userAddress.name,
      //               phone: orderData.userAddress.phone,
      //               address: orderData.userAddress.address,
      //             });
      //           }
      //           const storedMethod = localStorage.getItem("paymentMethod");
      //           if (storedMethod) {
      //             setPaymentMethod(storedMethod);
      //           }
      //           setLoading(false);
      //         } else {
      //           // Only set failed if we don't have a success status from other methods
      //           setPaymentStatus("failed");
      //           localStorage.setItem("paymentStatus", "failed");
      //           setLoading(false);
      //         }
      //       }
      //     )
      //     .catch((error: Error) => {
      //       console.error("Error checking transaction status:", error);
      //       // Only set failed if we don't have a success status from other methods
      //       setPaymentStatus("failed");
      //       localStorage.setItem("paymentStatus", "failed");
      //       setLoading(false);
      //     });
      // } else {

      // }

      if (address) {
        setShippingAddress(JSON.parse(address));
      }

      if (shipping) {
        setShippingMethod(shipping);
      }

      // Clear payment status from localStorage to avoid confusion on reload
      if (storedPaymentStatus !== "pending") {
        localStorage.removeItem("paymentStatus");
      }
    } catch (error) {
      console.error("Error in OrderConfirmation:", error);
      setPaymentStatus("failed");
      setLoading(false);
    }
  }, [isAuthenticated, location.search]);

  // Show loading state while fetching order details
  if (loading) {
    return (
      <Container
        maxWidth="md"
        sx={{
          py: 8,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress size={60} color="primary" sx={{ mb: 3 }} />
        <Typography variant="h6" color="text.secondary">
          Đang tải thông tin đơn hàng...
        </Typography>
      </Container>
    );
  }

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
          background: `linear-gradient(to bottom, ${alpha(
            theme.palette.background.paper,
            0.9
          )}, ${alpha(theme.palette.background.paper, 0.95)})`,
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
              bgcolor:
                paymentStatus === "success"
                  ? alpha(theme.palette.success.main, 0.15)
                  : alpha(theme.palette.error.main, 0.15),
              mb: 2,
            }}
          >
            {paymentStatus === "success" ? (
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
              color:
                paymentStatus === "success"
                  ? theme.palette.success.main
                  : theme.palette.error.main,
              textAlign: "center",
            }}
          >
            {paymentStatus === "success"
              ? "Đặt hàng thành công!"
              : "Thanh toán không thành công!"}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 1, textAlign: "center" }}
          >
            {paymentStatus === "success"
              ? "Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận."
              : "Đơn hàng của bạn chưa được thanh toán. Vui lòng thử lại sau."}
          </Typography>

          {orderNumber && (
            <Chip
              label={`Mã đơn hàng: ${orderNumber}`}
              sx={{
                mt: 2,
                bgcolor:
                  paymentStatus === "success"
                    ? alpha(theme.palette.success.main, 0.1)
                    : alpha(theme.palette.error.main, 0.1),
                color:
                  paymentStatus === "success"
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

        {paymentStatus === "success" && (
          <MotionBox variants={itemVariants}>
            <Grid container spacing={4}>
              {/* Thông tin giao hàng */}
              <Grid item xs={12} md={6}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: "medium",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <LocalShipping fontSize="small" color="primary" /> Thông tin
                  giao hàng
                </Typography>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    height: "100%",
                  }}
                >
                  {shippingAddress ? (
                    <>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        gutterBottom
                      >
                        Địa chỉ giao hàng:
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        {shippingAddress.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {shippingAddress.phone}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        {shippingAddress.address}
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        gutterBottom
                      >
                        Phương thức vận chuyển:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {/* {shippingMethod === "standard"
                          ? "Giao hàng tiêu chuẩn (2-5 ngày)"
                          : shippingMethod === "express"
                            ? "Giao hàng nhanh (1-2 ngày)"
                            : "Giao hàng hỏa tốc (24 giờ)"} */}
                        GHN
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
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: "medium",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Payment fontSize="small" color="primary" /> Thông tin thanh
                  toán
                </Typography>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    height: "100%",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Phương thức thanh toán:
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {getPaymentMethodLabel(paymentMethod)}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Tạm tính:
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="primary.main"
                  >
                    {orderDetails?.orderPrice ? `₫${formatPrice(Number(orderDetails?.orderPrice))}` : "₫0"}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Phí vận chuyển:
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="primary.main"
                  >
                    {orderDetails?.shippingPrice ? `₫${formatPrice(Number(orderDetails?.shippingPrice))}` : "₫0"}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Tổng thanh toán:
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="primary.main"
                  >
                    {orderDetails?.totalPrice ? `₫${formatPrice(Number(orderDetails?.totalPrice))}` : "₫0"}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Trạng thái thanh toán:
                  </Typography>
                  <Chip
                    label={
                      orderDetails?.statusPayment && orderDetails?.statusPayment == "Delivering" && paymentMethod == "cashOnDelivery" ? "Đang vận chuyển" : orderDetails?.statusPayment == "IsWaiting" ? "Đang chờ xác thực" : "Đã thanh toán"
                    }
                    color={paymentStatus === "success" ? "success" : "error"}
                    size="small"
                  />
                </Paper>
              </Grid>
            </Grid>

            {/* Hiển thị các mặt hàng đã đặt */}
            {orderDetails &&
              orderDetails.orderProductItem &&
              orderDetails.orderProductItem.length > 0 && (
                <Box sx={{ mt: 8 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontWeight: "medium",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <ShoppingBag fontSize="small" color="primary" /> Sản phẩm đã
                    đặt
                  </Typography>

                  <Paper
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <List disablePadding>
                      {orderDetails.orderProductItem.map((item, index) => (
                        <React.Fragment key={index}>
                          <ListItem
                            sx={{
                              py: 2,
                              px: 3,
                              display: "flex",
                              alignItems: "flex-start",
                              bgcolor:
                                index % 2 === 0
                                  ? "transparent"
                                  : alpha(
                                    theme.palette.background.default,
                                    0.5
                                  ),
                            }}
                          >
                            <Box
                              component="img"
                              src={item.attachment}
                              alt={item.productName}
                              sx={{
                                width: 60,
                                height: 60,
                                objectFit: "cover",
                                borderRadius: 1,
                                mr: 2,
                                border: `1px solid ${alpha(
                                  theme.palette.divider,
                                  0.1
                                )}`,
                              }}
                            />
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {item.productName}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                ₫{formatPrice(item.unitPrice)} x {item.quantity}
                              </Typography>
                              {item.serial && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Serial: {item.serial}
                                </Typography>
                              )}
                            </Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              ₫{formatPrice(item.unitPrice)} x {item.quantity}
                            </Typography>
                          </ListItem>
                          {index <
                            orderDetails.orderProductItem.length - 1 && (
                              <Divider />
                            )}
                        </React.Fragment>
                      ))}
                    </List>

                    <Box
                      sx={{
                        py: 2,
                        px: 3,
                        display: "flex",
                        justifyContent: "space-between",
                        bgcolor: alpha(theme.palette.primary.light, 0.05),
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        Tổng ({orderDetails.orderProductItem.length} sản phẩm):
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="primary.main"
                      >
                        ₫{formatPrice(orderDetails.orderPrice)}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              )}
          </MotionBox>
        )}

        <MotionBox
          variants={itemVariants}
          sx={{
            mt: 4,
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 2,
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

          {/* {paymentStatus === "success" && (
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
          )} */}

          {paymentStatus !== "success" && (
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

        {paymentStatus === "success" && (
          <MotionBox
            variants={itemVariants}
            sx={{ textAlign: "center", mt: 3 }}
          >
            {/* <Typography variant="body2" color="text.secondary">
              Email xác nhận đã được gửi đến địa chỉ email của bạn.
            </Typography> */}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Bạn có thể theo dõi trạng thái đơn hàng trong mục "Đơn hàng
              của tôi" trên trang cá nhân.
            </Typography>
          </MotionBox>
        )}
      </MotionPaper>
    </Container>
  );
};

export default OrderConfirmation;