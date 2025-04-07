import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Container, Paper, Alert } from '@mui/material';
import { CheckCircle, Cancel, Info } from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import { checkTransactionStatus } from '../services/orderSevice';

const PayOSCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy các tham số từ URL PayOS callback
  const payosStatus = searchParams.get('status');
  const payosCode = searchParams.get('code');
  const payosId = searchParams.get('id');
  const payosCancel = searchParams.get('cancel');
  const payosOrderCode = searchParams.get('orderCode');

  // Coi là thành công nếu status=PAID và cancel=false và code=00
  const isSuccess = payosStatus === 'PAID' && payosCancel === 'false' && payosCode === '00';

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('PayOS callback params:', {
          status: payosStatus,
          code: payosCode,
          id: payosId,
          cancel: payosCancel,
          orderCode: payosOrderCode
        });

        // Lấy orderId từ localStorage (đã lưu khi tạo đơn hàng)
        const orderId = localStorage.getItem('orderId');
        
        if (!orderId) {
          throw new Error('Order ID not found in localStorage');
        }

        console.log(`Using order ID: ${orderId}`);

        // Đợi 1 giây để không quá nhanh
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Gọi API để cập nhật trạng thái đơn hàng trong database
        try {
          console.log(`Calling API to update order status for ${orderId}`);
          const result = await checkTransactionStatus(orderId);
          console.log('API response for transaction check:', result);
          
          // Xác định trạng thái thanh toán dựa trên kết quả API và URL params
          let finalPaymentStatus: 'success' | 'failed' | 'pending';
          
          if (result && result.statusCodes === 200) {
            // Sử dụng kết quả từ API nếu có
            if (result.response && result.response.success === true) {
              finalPaymentStatus = 'success';
            } else {
              finalPaymentStatus = 'failed';
            }
          } else {
            // Nếu API không trả về kết quả rõ ràng, sử dụng dữ liệu từ URL
            finalPaymentStatus = isSuccess ? 'success' : 'failed';
          }
          
          // Lưu trạng thái thanh toán vào localStorage
          localStorage.setItem('paymentStatus', finalPaymentStatus);
          
        } catch (apiError: any) {
          console.error('Error updating order status:', apiError);
          // Nếu API lỗi, vẫn tiếp tục dựa vào URL params
          localStorage.setItem('paymentStatus', isSuccess ? 'success' : 'failed');
          setError(`Không thể cập nhật trạng thái đơn hàng: ${apiError.message}`);
        }

        // Kết thúc loading
        setLoading(false);
        
        // Xử lý dọn dẹp và chuyển hướng
        if (isSuccess) {
          // Thanh toán thành công
          console.log('Payment successful');
          
          // Xóa dữ liệu giỏ hàng
          localStorage.removeItem('pendingOrder');
          localStorage.removeItem('selectedCartDetails');
          localStorage.removeItem('selectedDevices');
          localStorage.removeItem('cartDetails');
        } else {
          // Thanh toán không thành công
          console.log('Payment failed or cancelled');
          
          // Xóa dữ liệu đơn hàng tạm thời
          localStorage.removeItem('pendingOrder');
        }
        
        // Đợi thêm 2 giây trước khi chuyển hướng để người dùng có thể xem thông báo
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Chuyển hướng đến trang xác nhận đơn hàng
        navigate('/checkout/confirmation');
      } catch (error: any) {
        console.error('Error handling PayOS callback:', error);
        localStorage.setItem('paymentStatus', 'error');
        setError(`Lỗi xử lý giao dịch: ${error.message}`);
        setLoading(false);
        
        // Đợi 3 giây rồi chuyển hướng nếu có lỗi
        setTimeout(() => {
          navigate('/checkout/confirmation');
        }, 3000);
      }
    };

    handleCallback();
  }, [isSuccess, navigate, payosCancel, payosCode, payosId, payosOrderCode, payosStatus]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 3,
        }}
      >
        <Paper 
          elevation={3}
          sx={{
            p: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 3,
            width: '100%',
            bgcolor: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 1, fontWeight: 'medium' }}>
                Đang xử lý thanh toán
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center">
                Vui lòng đợi trong khi chúng tôi cập nhật trạng thái đơn hàng của bạn...
              </Typography>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle sx={{ fontSize: 70, color: 'success.main', mb: 2 }} />
              <Typography variant="h4" color="success.main" sx={{ mb: 1, fontWeight: 'bold' }}>
                Thanh toán thành công!
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center">
                Đơn hàng của bạn đã được xác nhận. Đang chuyển đến trang xác nhận đơn hàng...
              </Typography>
              
              {error && (
                <Alert 
                  severity="warning" 
                  icon={<Info />}
                  sx={{ mt: 2, width: '100%' }}
                >
                  {error}
                </Alert>
              )}
              
              <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 2, width: '100%' }}>
                <Typography variant="body2" color="text.secondary">
                  Mã giao dịch: <strong>{payosId}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Mã đơn hàng: <strong>{payosOrderCode}</strong>
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <Cancel sx={{ fontSize: 70, color: 'error.main', mb: 2 }} />
              <Typography variant="h4" color="error.main" sx={{ mb: 1, fontWeight: 'bold' }}>
                {payosCancel === 'true' ? 'Thanh toán đã bị hủy' : 'Thanh toán không thành công'}
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center">
                {payosCancel === 'true' 
                  ? 'Bạn đã hủy giao dịch thanh toán.' 
                  : 'Đã có lỗi xảy ra trong quá trình thanh toán.'}
              </Typography>
              
              {error && (
                <Alert 
                  severity="warning" 
                  icon={<Info />}
                  sx={{ mt: 2, width: '100%' }}
                >
                  {error}
                </Alert>
              )}
              
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
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