import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Paper,
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import { useAuth } from "../context/AuthContext";

const PayOSCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, token } = useAuth();

  // Lấy các tham số từ URL PayOS callback
  const payosStatus = searchParams.get("status");
  const payosCode = searchParams.get("code");
  const payosId = searchParams.get("id");
  const payosCancel = searchParams.get("cancel");
  const payosOrderCode = searchParams.get("orderCode");

  // Coi là thành công nếu status=PAID và cancel=false và code=00
  const isSuccess =
    payosStatus === "PAID" && payosCancel === "false" && payosCode === "00";
  const isCancelled = payosCancel === "true" || payosStatus === "CANCELLED";

  useEffect(() => {
    console.log("PayOS Callback received with params:", {
      status: payosStatus,
      code: payosCode,
      id: payosId,
      cancel: payosCancel,
      orderCode: payosOrderCode,
    });

    console.log("Auth status:", { isAuthenticated, hasToken: !!token });

    const handleCallback = async () => {
      try {
        // Lấy orderId từ localStorage
        const orderId = localStorage.getItem("completedOrderId");
        console.log("Retrieved orderId from localStorage:", orderId);

        if (!orderId) {
          console.warn(
            "Order ID not found in localStorage, trying to proceed anyway"
          );
        }

        // Lưu thông tin đơn hàng để hiển thị trong trang xác nhận
        if (orderId) {
          localStorage.setItem("orderId", orderId);
        }
        localStorage.setItem("paymentMethod", "payos");

        if (payosId) {
          localStorage.setItem("transactionId", payosId);
          console.log("Saved transactionId to localStorage:", payosId);
        }

        // Xác định trạng thái thanh toán
        if (isCancelled) {
          localStorage.setItem("paymentStatus", "failed");
          console.log("Payment was cancelled, setting status to failed");
        } else if (isSuccess) {
          localStorage.setItem("paymentStatus", "success");
          console.log("Payment was successful");

          // Xóa dữ liệu giỏ hàng khi thanh toán thành công
          localStorage.removeItem("cartDetails");
          localStorage.removeItem("selectedCartDetails");
          localStorage.removeItem("selectedDevices");
        } else {
          localStorage.setItem("paymentStatus", "failed");
          console.log("Payment failed (neither success nor cancelled)");
        }

        // Đợi một chút trước khi điều hướng
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Kết thúc loading
        setLoading(false);

        // Chuyển hướng đến trang xác nhận đơn hàng
        console.log("Navigating to /checkout/confirmation");
        navigate("/checkout/confirmation", { replace: true });
      } catch (error) {
        console.error("Error handling PayOS callback:", error);
        localStorage.setItem("paymentStatus", "failed");
        setLoading(false);

        // Đợi một chút trước khi điều hướng
        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log("Navigating to /checkout/confirmation after error");
        navigate("/checkout/confirmation", { replace: true });
      }
    };

    // Đợi một khoảng thời gian để đảm bảo auth state đã được khởi tạo
    const timer = setTimeout(() => {
      handleCallback();
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    isSuccess,
    isCancelled,
    navigate,
    payosCancel,
    payosCode,
    payosId,
    payosOrderCode,
    payosStatus,
    isAuthenticated,
    token,
  ]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: 3,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: 3,
            width: "100%",
            bgcolor: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: "blur(10px)",
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 1, fontWeight: "medium" }}>
                Đang xử lý thanh toán
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center">
                Vui lòng đợi trong khi chúng tôi cập nhật trạng thái đơn hàng
                của bạn...
              </Typography>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle
                sx={{ fontSize: 70, color: "success.main", mb: 2 }}
              />
              <Typography
                variant="h4"
                color="success.main"
                sx={{ mb: 1, fontWeight: "bold" }}
              >
                Thanh toán thành công!
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center">
                Đơn hàng của bạn đã được xác nhận. Đang chuyển đến trang xác
                nhận đơn hàng...
              </Typography>
            </>
          ) : (
            <>
              <Cancel sx={{ fontSize: 70, color: "error.main", mb: 2 }} />
              <Typography
                variant="h4"
                color="error.main"
                sx={{ mb: 1, fontWeight: "bold" }}
              >
                {isCancelled
                  ? "Thanh toán đã bị hủy"
                  : "Thanh toán không thành công"}
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center">
                {isCancelled
                  ? "Bạn đã hủy giao dịch thanh toán."
                  : "Đã có lỗi xảy ra trong quá trình thanh toán."}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mt: 1 }}
              >
                Đang chuyển đến trang xác nhận đơn hàng...
              </Typography>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default PayOSCallback;
