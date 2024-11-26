// src/components/Navbar.tsx
import React, { useState } from 'react';
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
  Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  cartItemsCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ cartItemsCount }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
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
              mr: 4
            }}
          >
            <img 
              src="https://cdn.openart.ai/uploads/image_A5tQhwj0_1732589401346_raw.jpg" 
              alt="HydroPonic Garden" 
              style={{ 
                height: '40px',
                marginRight: '12px'
              }} 
            />
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#2e7d32',
                fontWeight: 700,
                display: { xs: 'none', md: 'block' }
              }}
            >
              HydroPonic Garden
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
                  backgroundColor: 'rgba(46, 125, 50, 0.08)'
                }
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
                  backgroundColor: 'rgba(46, 125, 50, 0.08)'
                }
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
                  backgroundColor: 'rgba(46, 125, 50, 0.08)'
                }
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
                  onClick={handleProfileMenuOpen}
                  sx={{
                    color: '#2e7d32',
                    '&:hover': {
                      backgroundColor: 'rgba(46, 125, 50, 0.08)'
                    }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: '#2e7d32',
                      '&:hover': {
                        bgcolor: '#1b5e20'
                      }
                    }}
                  >
                    <AccountCircleIcon />
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleProfileMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                      mt: 1.5,
                      '& .MuiAvatar-root': {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                      },
                    },
                  }}
                >
                  <MenuItem component={Link} to="/profile" onClick={handleProfileMenuClose}>
                    <Typography sx={{ color: '#2e7d32' }}>Profile</Typography>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <Typography color="error">Logout</Typography>
                  </MenuItem>
                </Menu>
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
                      backgroundColor: 'rgba(46, 125, 50, 0.08)'
                    }
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
                      backgroundColor: '#1b5e20'
                    }
                  }}
                >
                  Register
                </Button>
              </>
            )}
            
            <IconButton 
              component={Link} 
              to="/cart"
              sx={{
                color: '#2e7d32',
                '&:hover': {
                  backgroundColor: 'rgba(46, 125, 50, 0.08)'
                }
              }}
            >
              <Badge 
                badgeContent={cartItemsCount} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#2e7d32',
                    color: 'white'
                  }
                }}
              >
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;