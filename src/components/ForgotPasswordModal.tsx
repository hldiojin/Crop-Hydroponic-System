import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Step,
  StepLabel,
  Stepper,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Divider
} from '@mui/material';
import { Visibility, VisibilityOff, Email as EmailIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ open, onClose }) => {
  const { resetPassword, verifyOtp, resetPasswordWithToken, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(120); // 2 minutes in seconds
  const [successMessage, setSuccessMessage] = useState('');
  const [hasResetToken, setHasResetToken] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if we already have a reset token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('passwordResetToken');
    if (savedToken && open) {
      setHasResetToken(true);
      setActiveStep(2); // Skip to password reset step
      setSuccessMessage('Your identity has been verified. Please set your new password.');
    }
  }, [open]);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Handle countdown timer for OTP resend
  useEffect(() => {
    if (resendDisabled && countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    } else if (countdown === 0) {
      setResendDisabled(false);
      setCountdown(120);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [resendDisabled, countdown]);

  // Reset the form when modal is closed
  useEffect(() => {
    if (!open) {
      // Only reset if not using a saved token
      if (!hasResetToken) {
        setActiveStep(0);
        setEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setEmailError('');
        setOtpError('');
        setNewPasswordError('');
        setConfirmPasswordError('');
        setSuccessMessage('');
        setResendDisabled(false);
        setCountdown(120);
      }
      clearError();
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [open, clearError, hasResetToken]);

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validateOtp = () => {
    if (!otp) {
      setOtpError('OTP is required');
      return false;
    }
    setOtpError('');
    return true;
  };

  const validatePasswords = () => {
    let isValid = true;
    
    if (!newPassword) {
      setNewPasswordError('New password is required');
      isValid = false;
    } else if (newPassword.length < 8) {
      setNewPasswordError('Password must be at least 8 characters');
      isValid = false;
    } else {
      setNewPasswordError('');
    }
    
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }
    
    return isValid;
  };

  const handleSendOtp = async () => {
    if (!validateEmail()) {
      return;
    }
    
    try {
      clearError();
      await resetPassword(email);
      setActiveStep(1);
      setResendDisabled(true);
      setSuccessMessage('OTP sent to your email address');
    } catch (err) {
      console.error('Error sending OTP:', err);
      // Error is already set in context
    }
  };

  const handleResendOtp = async () => {
    try {
      clearError();
      await resetPassword(email);
      setResendDisabled(true);
      setSuccessMessage('OTP resent to your email address');
    } catch (err) {
      console.error('Error resending OTP:', err);
      // Error is already set in context
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateOtp()) {
      return;
    }
    
    try {
      clearError();
      
      // This will verify the OTP and store the token in localStorage
      await verifyOtp({
        email,
        otp
      });
      
      setActiveStep(2);
      setHasResetToken(true);
      setSuccessMessage('OTP verified successfully. Please set your new password.');
    } catch (err) {
      console.error('Error verifying OTP:', err);
      // Error is already set in context
    }
  };

  const handleResetPassword = async () => {
    if (!validatePasswords()) {
      return;
    }
    
    try {
      clearError();
      
      // Reset password using the token stored in localStorage
      await resetPasswordWithToken({
        newPassword,
        confirmPassword
      });
      
      setActiveStep(3); // Final success step
      setHasResetToken(false);
      setSuccessMessage('Password reset successfully');
      
      // Close the modal and redirect to login after success
      setTimeout(() => {
        onClose();
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Error resetting password:', err);
      
      // If token expired (401), redirect to login after showing error
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setTimeout(() => {
          onClose();
          navigate('/login');
        }, 3000);
      }
      // Error is already set in context
    }
  };

  const handleClose = () => {
    // If we have a reset token and we're canceling, we should clean it up
    if (hasResetToken && activeStep < 3) {
      // Ask for confirmation before discarding the token
      if (window.confirm('Are you sure you want to cancel? You will need to verify your identity again.')) {
        localStorage.removeItem('passwordResetToken');
        setHasResetToken(false);
      } else {
        return; // Don't close if user cancels
      }
    }
    
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>Reset Password</DialogTitle>
      
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 2 }}>
          <Step>
            <StepLabel>Request OTP</StepLabel>
          </Step>
          <Step>
            <StepLabel>Verify OTP</StepLabel>
          </Step>
          <Step>
            <StepLabel>New Password</StepLabel>
          </Step>
          <Step>
            <StepLabel>Complete</StepLabel>
          </Step>
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {error}
          </Alert>
        )}
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}
        
        {activeStep === 0 && (
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Enter your email address and we'll send you a one-time password (OTP) to reset your password.
            </Typography>
            
            <TextField
              fullWidth
              margin="normal"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              error={!!emailError}
              helperText={emailError}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        )}
        
        {activeStep === 1 && (
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              We've sent a verification code to your email address. Please enter the OTP below to verify your identity.
            </Typography>
            
            <TextField
              fullWidth
              margin="normal"
              label="OTP Code"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                if (otpError) setOtpError('');
              }}
              error={!!otpError}
              helperText={otpError}
              disabled={loading}
            />
            
            <Box sx={{ mt: 2, mb: 3 }}>
              <Button
                variant="text"
                disabled={resendDisabled}
                onClick={handleResendOtp}
                sx={{ textTransform: 'none' }}
              >
                {resendDisabled
                  ? `Resend OTP in ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`
                  : 'Resend OTP'
                }
              </Button>
            </Box>
          </Box>
        )}
        
        {activeStep === 2 && (
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Your identity has been verified. Please set your new password.
            </Typography>
            
            <TextField
              fullWidth
              margin="normal"
              label="New Password"
              type={showPasswords ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (newPasswordError) setNewPasswordError('');
              }}
              error={!!newPasswordError}
              helperText={newPasswordError}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPasswords(!showPasswords)}
                      edge="end"
                    >
                      {showPasswords ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Confirm New Password"
              type={showPasswords ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmPasswordError) setConfirmPasswordError('');
              }}
              error={!!confirmPasswordError}
              helperText={confirmPasswordError}
              disabled={loading}
            />
          </Box>
        )}
        
        {activeStep === 3 && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'success.main' }}>
              Password Reset Successful!
            </Typography>
            <Typography variant="body1">
              Your password has been reset successfully. You will be redirected to the login page to sign in with your new password.
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        {activeStep < 3 && (
          <Button onClick={handleClose} color="inherit" disabled={loading}>
            Cancel
          </Button>
        )}
        
        {activeStep === 0 && (
          <Button 
            variant="contained" 
            onClick={handleSendOtp} 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </Button>
        )}
        
        {activeStep === 1 && (
          <Button 
            variant="contained" 
            onClick={handleVerifyOtp} 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        )}
        
        {activeStep === 2 && (
          <Button 
            variant="contained" 
            onClick={handleResetPassword} 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        )}
        
        {activeStep === 3 && (
          <Button variant="contained" onClick={() => {
            onClose();
            navigate('/login');
          }}>
            Go to Login
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ForgotPasswordModal;