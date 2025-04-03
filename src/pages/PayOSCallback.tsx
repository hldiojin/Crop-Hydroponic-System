import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

const PayOSCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const orderId = localStorage.getItem('orderId');
  const pendingOrder = localStorage.getItem('pendingOrder');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Wait for 2 seconds to show the status
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (status === 'success') {
          // Clear pending order data
          localStorage.removeItem('pendingOrder');
          localStorage.removeItem('selectedCartDetails');
          localStorage.removeItem('selectedDevices');
          
          // Navigate to confirmation page
          navigate('/checkout/confirmation');
        } else {
          // Clear all payment related data
          localStorage.removeItem('pendingOrder');
          localStorage.removeItem('orderId');
          localStorage.removeItem('paymentMethod');
          localStorage.removeItem('orderTotal');
          
          // Navigate back to home page
          navigate('/');
        }
      } catch (error) {
        console.error('Error handling PayOS callback:', error);
        navigate('/');
      }
    };

    handleCallback();
  }, [status, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      {status === 'success' ? (
        <>
          <CheckCircle sx={{ fontSize: 60, color: 'success.main' }} />
          <Typography variant="h5" color="success.main">
            Payment Successful!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Redirecting to order confirmation...
          </Typography>
        </>
      ) : (
        <>
          <Cancel sx={{ fontSize: 60, color: 'error.main' }} />
          <Typography variant="h5" color="error.main">
            Payment Cancelled
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Redirecting to home page...
          </Typography>
        </>
      )}
      <CircularProgress />
    </Box>
  );
};

export default PayOSCallback; 