// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Footer from './components/Footer';
import ProductList from './pages/ProductList';
import CartPage from './pages/CartPage';
import { CartItem, Product } from './types/types';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductDetail from './pages/ProductDetail';
import PlantsPage from './pages/PlantsPage';
import SystemsPage from './pages/SystemsPage';
import NutrientsPage from './pages/NutrientsPage';
import { products } from './data/products'; 

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32',
      light: '#60ad5e',
      dark: '#005005',
    },
    secondary: {
      main: '#81c784',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      color: '#2e7d32',
    }
  },
});

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const handleAddToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id: number, change: number) => {
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.product.id === id) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const handleRemoveFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== id));
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar cartItemsCount={cart.reduce((sum, item) => sum + item.quantity, 0)} />
            <Box sx={{ flex: '1 0 auto' }}>
              <MainContent 
                handleAddToCart={handleAddToCart}
                handleUpdateQuantity={handleUpdateQuantity}
                handleRemoveFromCart={handleRemoveFromCart}
                cart={cart}
              />
            </Box>
            <Footer />
          </Box>
        </ThemeProvider>
      </BrowserRouter>
    </AuthProvider>
  );
};

const MainContent: React.FC<{
  handleAddToCart: (product: Product) => void;
  handleUpdateQuantity: (id: number, change: number) => void;
  handleRemoveFromCart: (id: number) => void;
  cart: CartItem[];
}> = ({ handleAddToCart, handleUpdateQuantity, handleRemoveFromCart, cart }) => {
  const location = useLocation();

  return (
    <>
      {location.pathname === '/' && <HeroSection />}
      <Routes>
        <Route path="/" element={<ProductList products={products} onAddToCart={handleAddToCart} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/product/:id"
          element={<ProductDetail products={products} onAddToCart={handleAddToCart} />}
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage
                cart={cart}
                updateQuantity={handleUpdateQuantity}
                removeFromCart={handleRemoveFromCart}
              />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/plants" 
          element={<PlantsPage 
            products={products.filter(p => p.type === 'plant')} 
            onAddToCart={handleAddToCart} 
          />} 
        />
        <Route 
          path="/systems" 
          element={<SystemsPage 
            products={products.filter(p => p.type === 'system')} 
            onAddToCart={handleAddToCart} 
          />} 
        />
        <Route 
          path="/nutrients" 
          element={<NutrientsPage 
            products={products.filter(p => p.type === 'nutrient')} 
            onAddToCart={handleAddToCart} 
          />} 
        />
      </Routes>
    </>
  );
};

export default App;