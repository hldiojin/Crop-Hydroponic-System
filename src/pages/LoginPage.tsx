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
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "error" as "error" | "success" | "info" | "warning",
  });
  
  const { login, loading, error, clearError, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (error) {
      setToast({
        open: true,
        message: error,
        severity: "error"
      });
      clearError();
    }
  }, [error, clearError]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setToast({
        open: true,
        message: `Welcome back, ${user.name || "User"}!`,
        severity: "success"
      });
      
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
    } catch (err: any) {
      console.error("Login error:", err);
      
      let errorMessage = "Failed to login. Please try again.";
      
      if (err?.response?.data) {
        const data = err.response.data;
        if (data.message) {
          errorMessage = data.message;
        } else if (typeof data === 'string') {
          try {
            const parsedError = JSON.parse(data);
            errorMessage = parsedError.message || errorMessage;
          } catch {
            errorMessage = data;
          }
        }
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.statusCodes && err?.message) {
        errorMessage = err.message;
      }
      
      setToast({
        open: true,
        message: errorMessage,
        severity: "error"
      });
    }
  };

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
      {/* Left Side - Login Form (changed from right side) */}
      <MotionBox
        initial={{ x: isMobile ? 0 : -100, opacity: 0 }}
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

      {/* Right Side - Illustration (changed from left side, hidden on mobile) */}
      {!isMobile && (
        <MotionBox
          initial={{ x: 100, opacity: 0 }}
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
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 2px, transparent 2px)',
            backgroundSize: '30px 30px',
            opacity: 0.4,
          }} />

          <MotionBox 
            sx={{ textAlign: 'center', maxWidth: '500px', position: 'relative', zIndex: 1 }}
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
              Smart farming for the future
            </MotionTypography>
            
            <motion.img 
              src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAMAAgADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD5UooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKWgBKKXFLigBtFOxRigBtFOxRigBKSnYpcUAMop+KTFADaKdijFADaKdijFADaKXFGKAEopcUUAJRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFF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" 
              alt="Hydroponic System"
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6, type: "spring" }}
              style={{ 
                width: '90%', 
                maxWidth: '450px',
                display: 'block',
                margin: '0 auto',
                borderRadius: '12px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                border: '4px solid rgba(255,255,255,0.2)'
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              style={{ 
                marginTop: '40px',
                display: 'flex',
                justifyContent: 'space-around',
                flexWrap: 'wrap'
              }}
            >
              <Box sx={{ 
                m: 1, 
                p: 2, 
                bgcolor: 'rgba(255,255,255,0.15)', 
                borderRadius: '10px',
                backdropFilter: 'blur(5px)',
                width: '140px'
              }}>
                <Typography variant="subtitle2" fontWeight="bold">Smart Monitoring</Typography>
              </Box>
              <Box sx={{ 
                m: 1, 
                p: 2, 
                bgcolor: 'rgba(255,255,255,0.15)', 
                borderRadius: '10px',
                backdropFilter: 'blur(5px)',
                width: '140px'
              }}>
                <Typography variant="subtitle2" fontWeight="bold">Water Saving</Typography>
              </Box>
              <Box sx={{ 
                m: 1, 
                p: 2, 
                bgcolor: 'rgba(255,255,255,0.15)', 
                borderRadius: '10px',
                backdropFilter: 'blur(5px)',
                width: '140px'
              }}>
                <Typography variant="subtitle2" fontWeight="bold">High Yield</Typography>
              </Box>
            </motion.div>
          </MotionBox>
        </MotionBox>
      )}

      <ForgotPasswordModal
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />
      
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
