import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  InputAdornment,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  HowToReg,
  Phone,
  Home,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  MotionBox,
  MotionAvatar,
  MotionTypography,
  MotionTextField,
  MotionButton,
  containerVariants,
  itemVariants,
  logoVariants,
  buttonVariants
} from "../utils/motion";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  
  // Add toast state similar to LoginPage
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "error" as "error" | "success" | "info" | "warning",
  });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Show toast when error changes
  useEffect(() => {
    if (error) {
      setToast({
        open: true,
        message: error,
        severity: "error"
      });
      // Clear the error after showing it in toast
      clearError();
    }
  }, [error, clearError]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      if (clearError) clearError();
    };
  }, [clearError]);

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: '',
      email: '',
      password: '',
      phone: '',
      address: ''
    };
    
    // Validate name
    if (!formData.name) {
      newErrors.name = 'Full name is required';
      valid = false;
    }
    
    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }
    
    // Validate phone
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
      valid = false;
    } else if (!/^\d{10,12}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
      valid = false;
    }
    
    // Validate address
    if (!formData.address) {
      newErrors.address = 'Address is required';
      valid = false;
    }
    
    setFormErrors(newErrors);
    return valid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (error && clearError) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) return;
    
    try {
      await register(formData);
      // Show success toast
      setToast({
        open: true,
        message: "Account created successfully! You can now log in.",
        severity: "success"
      });
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Extract error message
      let errorMessage = "Registration failed. Please try again.";
      if (err?.message) {
        errorMessage = err.message;
      }
      
      setToast({
        open: true,
        message: errorMessage,
        severity: "error"
      });
    }
  };
  
  // Enhanced toast close handler
  const handleCloseToast = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setToast({...toast, open: false});
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        bgcolor: '#f5f5f5',
      }}
    >
      {/* Left Side - Illustration (hidden on mobile) */}
      {!isMobile && (
        <MotionBox
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          sx={{
            flex: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
            color: 'white',
            p: 4,
          }}
        >
          <MotionBox 
            sx={{ textAlign: 'center', maxWidth: '500px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <MotionTypography 
              variant="h3" 
              component="h1" 
              gutterBottom 
              fontWeight="bold"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Hydroponic System
            </MotionTypography>
            <MotionTypography 
              variant="h6" 
              sx={{ mb: 6, opacity: 0.9 }}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              Join our community of hydroponic enthusiasts
            </MotionTypography>
            
            {/* Use motion.img directly instead of MotionBox with component prop */}
            <motion.img 
              src="/assets/illustrations/hydroponic-illustration.svg" 
              alt="Hydroponic System"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6, type: "spring" }}
              style={{ 
                width: '80%', 
                maxWidth: '400px',
                display: 'block',
                margin: '0 auto'
              }}
            />
          </MotionBox>
        </MotionBox>
      )}

      {/* Right Side - Register Form */}
      <MotionBox
        initial={{ x: isMobile ? 0 : 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        sx={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          overflow: 'auto',
          backgroundColor: 'white',
        }}
      >
        <MotionBox 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          sx={{ 
            width: '100%', 
            maxWidth: '450px',
            px: { xs: 2, sm: 4 },
            py: { xs: 3, sm: 5 },
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <MotionAvatar 
              variants={logoVariants}
              sx={{ 
                m: '0 auto', 
                bgcolor: 'primary.main',
                width: 64,
                height: 64
              }}
            >
              <HowToReg fontSize="large" />
            </MotionAvatar>
            <MotionTypography 
              component="h1" 
              variant="h4" 
              sx={{ mt: 2, fontWeight: 'bold' }}
              variants={itemVariants}
            >
              Create Account
            </MotionTypography>
            <MotionTypography 
              variant="body1" 
              color="text.secondary" 
              sx={{ mt: 1 }}
              variants={itemVariants}
            >
              Join HydroPonic today
            </MotionTypography>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ width: '100%' }}
          >
            <MotionTextField
              variants={itemVariants}
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <MotionTextField
              variants={itemVariants}
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <MotionTextField
              variants={itemVariants}
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            
            <MotionTextField
              variants={itemVariants}
              margin="normal"
              required
              fullWidth
              name="phone"
              label="Phone Number"
              id="phone"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
              error={!!formErrors.phone}
              helperText={formErrors.phone}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <MotionTextField
              variants={itemVariants}
              margin="normal"
              required
              fullWidth
              name="address"
              label="Address"
              id="address"
              autoComplete="street-address"
              value={formData.address}
              onChange={handleChange}
              error={!!formErrors.address}
              helperText={formErrors.address}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Home color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <MotionButton
              component={motion.button}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 3, 
                py: 1.5,
                borderRadius: 2,
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Sign Up"}
            </MotionButton>

            {/* Use motion.div for divider */}
            <motion.div
              variants={itemVariants}
              style={{ 
                margin: '16px 0',
                position: 'relative',
                textAlign: 'center'
              }}
            >
              <Divider>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>
            </motion.div>

            <MotionBox 
              variants={itemVariants}
              sx={{ textAlign: 'center', mt: 2 }}
            >
              <Typography variant="body1" color="text.secondary" display="inline">
                Already have an account?{' '}
              </Typography>
              {/* Use motion.button directly for better type compatibility */}
              <motion.button
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.palette.primary.main,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: 0,
                  marginLeft: '8px',
                  fontFamily: 'inherit'
                }}
                onClick={() => navigate("/login")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
              </motion.button>
            </MotionBox>
          </Box>
        </MotionBox>
      </MotionBox>

      {/* Enhanced Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toast.severity}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegisterPage;