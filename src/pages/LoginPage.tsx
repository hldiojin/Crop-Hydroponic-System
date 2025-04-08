// src/pages/LoginPage.tsx
import React, { useState, useEffect } from "react";
import {
  Typography,
  Link,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
  Button,
} from "@mui/material";
import {
  LockOutlined as LockOutlinedIcon,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import { motion } from "framer-motion";
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
import hydroponicImage from '../assets/image1 (2).png';


const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  // Enhanced toast state to include severity
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "error" as "error" | "success" | "info" | "warning",
  });
  
  const { login, loading, error, clearError, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
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

  // Show success toast and redirect after successful login
  useEffect(() => {
    if (isAuthenticated && user) {
      // Show success toast
      setToast({
        open: true,
        message: `Welcome back, ${user.name || "User"}!`,
        severity: "success"
      });
      
      // Redirect after a short delay to allow the toast to be visible
      const redirectTimer = setTimeout(() => {
        navigate("/devices");
      }, 1500);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, navigate, user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login({ email, password });
      // Don't navigate here - do it in the useEffect above when isAuthenticated changes
    } catch (err: any) {
      console.error("Login error:", err);
      
      // Extract error message from API response or error object
      let errorMessage = "Failed to login. Please try again.";
      
      // Handle API error response formats
      if (err?.response?.data) {
        const data = err.response.data;
        if (data.message) {
          errorMessage = data.message;
        } else if (typeof data === 'string') {
          try {
            // Try to parse error if it's a JSON string
            const parsedError = JSON.parse(data);
            errorMessage = parsedError.message || errorMessage;
          } catch {
            errorMessage = data;
          }
        }
      } 
      // Handle errors thrown as plain objects with message property
      else if (err?.message) {
        errorMessage = err.message;
      }
      
      // If we have the exact format from your example
      else if (err?.statusCodes && err?.message) {
        errorMessage = err.message;
      }
      
      // Display the extracted error message
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

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
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
              Monitor and control your hydroponic system with ease
            </MotionTypography>
            
            {/* Use motion.img directly instead of MotionBox with component prop */}
            <motion.img 
  src={hydroponicImage} 
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

      {/* Right Side - Login Form */}
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
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <MotionAvatar 
              variants={logoVariants}
              sx={{ 
                m: '0 auto', 
                bgcolor: 'primary.main',
                width: 64,
                height: 64
              }}
            >
              <LockOutlinedIcon fontSize="large" />
            </MotionAvatar>
            <MotionTypography 
              component="h1" 
              variant="h4" 
              sx={{ mt: 2, fontWeight: 'bold' }}
              variants={itemVariants}
            >
              Sign In
            </MotionTypography>
            <MotionTypography 
              variant="body1" 
              color="text.secondary" 
              sx={{ mt: 1 }}
              variants={itemVariants}
            >
              Enter your credentials to access your account
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
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={handleInputChange(setEmail)}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <MotionTextField
              variants={itemVariants}
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={handleInputChange(setPassword)}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <MotionBox 
              variants={itemVariants}
              sx={{ display: 'flex', justifyContent: 'flex-end' }}
            >
              <Button
                variant="text"
                color="primary"
                onClick={() => setForgotPasswordOpen(true)}
                sx={{ textTransform: 'none', fontSize: '0.875rem' }}
              >
                Forgot Password?
              </Button>
            </MotionBox>

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
              {loading ? <CircularProgress size={24} /> : "Sign In"}
            </MotionButton>

            <MotionBox 
              variants={itemVariants}
              sx={{ textAlign: 'center', mt: 3 }}
            >
              <Typography variant="body1" color="text.secondary" display="inline">
                Don't have an account?{' '}
              </Typography>
              {/* Use motion.button directly for Link */}
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
                onClick={() => navigate("/register")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Up
              </motion.button>
            </MotionBox>
          </Box>
        </MotionBox>
      </MotionBox>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />
      
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

export default LoginPage;
