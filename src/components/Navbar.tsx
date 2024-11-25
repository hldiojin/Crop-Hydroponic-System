// src/components/Navbar.tsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  cartItemsCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ cartItemsCount }) => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <AppBar position="static">
      <Toolbar>
        <LocalFloristIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}>
          HydroPonic Garden
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button color="inherit" component={Link} to="/plants">
            Plants
          </Button>
          <Button color="inherit" component={Link} to="/systems">
            Systems
          </Button>
          <Button color="inherit" component={Link} to="/nutrients">
            Nutrients
          </Button>
          {isAuthenticated ? (
            <>
              <Typography variant="body2" sx={{ color: 'white' }}>
                Welcome, {user?.name}
              </Typography>
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
              <IconButton component={Link} to="/cart" color="inherit">
                <ShoppingCartIcon />
                <span>{cartItemsCount}</span>
              </IconButton>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
              <IconButton component={Link} to="/cart" color="inherit">
                <ShoppingCartIcon />
                <span>{cartItemsCount}</span>
              </IconButton>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;