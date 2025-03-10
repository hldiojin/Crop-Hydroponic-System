// src/components/Navbar.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  cartItemsCount: number;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ cartItemsCount, onLogout }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    logout(); // Call the logout function from AuthContext
    handleMenuClose(); // Close the menu
    onLogout(); // Call the onLogout prop function (this might update cart state in parent component)
    navigate('Login'); // Navigate to homepage
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
            to="/"
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
              to="/plants"
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
              to="/systems"
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
              to="/nutrients"
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
                  onClick={handleMenuOpen}
                  sx={{
                    color: '#2e7d32',
                  }}
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
                    {user?.name?.charAt(0) || <AccountCircleIcon />}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                    <Typography sx={{ color: '#2e7d32' }}>Profile</Typography>
                  </MenuItem>
                  <MenuItem component={Link} to="/favorites" onClick={handleMenuClose}>
                    <Typography sx={{ color: '#2e7d32' }}>Favorites</Typography>
                  </MenuItem>
                  {isAdmin && (
                    <MenuItem component={Link} to="/admin" onClick={handleMenuClose}>
                      <Typography sx={{ color: '#2e7d32' }}>Admin Dashboard</Typography>
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem onClick={handleLogoutClick}>
                    <Typography color="error">Logout</Typography>
                  </MenuItem>
                </Menu>
                <IconButton
                  component={Link}
                  to="/cart"
                  sx={{
                    color: '#2e7d32',
                  }}
                >
                  <Badge
                    badgeContent={cartItemsCount}
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
              </>
            ) : (
              <>
                <Button
                  component={Link}
                  to="/login"
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
                  to="/register"
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
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;