// src/components/Navbar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
  Container,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
} from '@mui/material';
import { 
  ShoppingCart, 
  Logout,
  Person,
  AccountCircle,
} from '@mui/icons-material';
import authService from '../app/services/authService';
import axiosInstance from '../app/api/AxiosInstance';

const Navbar: React.FC = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const isAuth = authService.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        // Get user data from localStorage first for immediate UI update
        const userData = authService.getCurrentUser();
        setUser(userData);
        
        // Then fetch fresh user data from API
        fetchUserProfile();
      }
    };
    
    checkAuth();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axiosInstance.get('/user/me');
      if (response.data) {
        setUser(response.data);
        // Update local storage with fresh user data
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // If API call fails, we still have the data from localStorage
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
      authService.logout(); // Clear localStorage
      setIsAuthenticated(false);
      setUser(null);
      handleClose();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, we still clear local data
      authService.logout();
      setIsAuthenticated(false);
      setUser(null);
      handleClose();
      router.push('/');
    }
  };

  const handleProfileClick = () => {
    handleClose();
    router.push('/profile');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ py: 1 }}>
          {/* Logo */}
          <Box
            component={Link}
            href="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              mr: 4,
            }}
          >
            <img
              src="https://cdn.openart.ai/uploads/image_A5tQhwj0_1732589401346_512.webp"
              alt="Hydroponic Store"
              style={{
                height: '40px',
                marginRight: '12px',
              }}
            />
            <Typography
              variant="h6"
              sx={{
                color: '#2e7d32',
                fontWeight: 700,
                display: { xs: 'none', md: 'block' },
              }}
            >
              Hydroponic Store
            </Typography>
          </Box>

          {/* Navigation Links */}
          <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
            <Button
              component={Link}
              href="/plants"
              sx={{
                color: '#2e7d32',
                px: 2,
                '&:hover': {
                  backgroundColor: 'rgba(46, 125, 50, 0.08)',
                },
              }}
            >
              Plants
            </Button>
            <Button
              component={Link}
              href="/systems"
              sx={{
                color: '#2e7d32',
                px: 2,
                '&:hover': {
                  backgroundColor: 'rgba(46, 125, 50, 0.08)',
                },
              }}
            >
              Systems
            </Button>
            <Button
              component={Link}
              href="/nutrients"
              sx={{
                color: '#2e7d32',
                px: 2,
                '&:hover': {
                  backgroundColor: 'rgba(46, 125, 50, 0.08)',
                },
              }}
            >
              Nutrients
            </Button>
          </Box>

          {/* Auth & Cart */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isAuthenticated ? (
              <>
                <IconButton
                  onClick={handleClick}
                  aria-controls={open ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                  sx={{ color: '#2e7d32' }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: '#2e7d32',
                      '&:hover': {
                        bgcolor: '#1b5e20',
                      },
                    }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : <AccountCircle />}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  id="account-menu"
                  open={open}
                  onClose={handleClose}
                  onClick={handleClose}
                  PaperProps={{
                    elevation: 4,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                      mt: 1.5,
                      minWidth: 180,
                      '& .MuiAvatar-root': {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {user?.name || 'User'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, wordBreak: 'break-word' }}>
                      {user?.email || ''}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={handleProfileClick}>
                    <ListItemIcon>
                      <Person fontSize="small" sx={{ color: '#2e7d32' }} />
                    </ListItemIcon>
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <Logout fontSize="small" sx={{ color: '#d32f2f' }} />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  component={Link}
                  href="/signin"
                  variant="outlined"
                  sx={{
                    color: '#2e7d32',
                    borderColor: '#2e7d32',
                    '&:hover': {
                      borderColor: '#2e7d32',
                      backgroundColor: 'rgba(46, 125, 50, 0.08)',
                    },
                  }}
                >
                  Login
                </Button>

                <Button
                  component={Link}
                  href="/signup"
                  variant="contained"
                  sx={{
                    backgroundColor: '#2e7d32',
                    '&:hover': {
                      backgroundColor: '#1b5e20',
                    },
                  }}
                >
                  Register
                </Button>
              </>
            )}

            <IconButton
              component={Link}
              href="/cart"
              sx={{
                color: '#2e7d32',
              }}
            >
              <Badge
                badgeContent={0}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#2e7d32',
                    color: 'white',
                  },
                }}
              >
                <ShoppingCart />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;