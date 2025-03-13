// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import {
  Container,
  Paper,
  Avatar,
  Button,
  TextField,
  Link,
  Grid,
  Box,
  Typography,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { LockOutlined as LockOutlinedIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/SystemsPage');
    } catch (err) {
      // Error is handled by the context
      console.error('Login error:', err);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={3}
        sx={{
          mt: 8,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }} onClose={clearError}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button
              variant="text"
              color="primary"
              onClick={() => setForgotPasswordOpen(true)}
              sx={{ textTransform: 'none' }}
            >
              Forgot Password?
            </Button>
          </Box>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
          
          <Grid container justifyContent="center">
            <Grid item>
              <Link 
                component="button" 
                variant="body2" 
                onClick={() => navigate('/register')}
              >
                Don't have an account? Sign Up
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />
    </Container>
  );
};

export default LoginPage;