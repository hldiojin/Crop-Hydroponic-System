import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Typography, useTheme, alpha } from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MotionBox, MotionButton, itemVariants, containerVariants } from '../utils/motion';

const NotFoundPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  // Automatically redirect to home after countdown
  useEffect(() => {
    if (countdown <= 0) {
      navigate('/');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <Container
      component={motion.div}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      maxWidth="md"
      sx={{
        py: 8,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        background: `linear-gradient(to bottom, #f9f9f9, #e8f5e9)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: alpha(theme.palette.primary.light, 0.1),
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: alpha(theme.palette.secondary.light, 0.08),
          zIndex: 0,
        }}
      />

      <MotionBox 
        variants={itemVariants}
        sx={{ 
          position: 'relative',
          zIndex: 1,
          mb: 4 
        }}
      >
        <Typography 
          variant="h1" 
          component="h1" 
          color="primary"
          sx={{ 
            fontSize: { xs: '8rem', md: '12rem' },
            fontWeight: 'bold',
            textShadow: `2px 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
            lineHeight: 1,
          }}
        >
          404
        </Typography>
      </MotionBox>

      <MotionBox 
        variants={itemVariants}
        sx={{ mb: 6, position: 'relative', zIndex: 1 }}
      >
        <Typography 
          variant="h4" 
          component="h2" 
          sx={{ 
            mb: 2,
            fontWeight: 'bold',
            color: theme.palette.text.primary
          }}
        >
          Page Not Found
        </Typography>
        <Typography 
          variant="body1" 
          color="textSecondary"
          sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}
        >
          The page you are looking for might have been removed, 
          had its name changed, or is temporarily unavailable.
        </Typography>
        <Typography 
          variant="body2" 
          color="primary"
          sx={{ fontWeight: 'medium' }}
        >
          Redirecting to home page in {countdown} seconds...
        </Typography>
      </MotionBox>

      <MotionBox 
        variants={itemVariants}
        sx={{ 
          display: 'flex', 
          gap: 2,
          flexWrap: 'wrap',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1 
        }}
      >
        <MotionButton
          variant="contained"
          color="primary"
          size="large"
          startIcon={<Home />}
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 'bold',
          }}
        >
          Go to Home
        </MotionButton>

        <MotionButton
          variant="outlined"
          color="primary"
          size="large"
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 'bold',
          }}
        >
          Go Back
        </MotionButton>
      </MotionBox>
    </Container>
  );
};

export default NotFoundPage;