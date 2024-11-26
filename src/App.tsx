import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, Box, GlobalStyles } from '@mui/material';
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
import ProfilePage from './pages/ProfilePage';
import { products as initialProducts } from './data/products'; 

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
  const [products, setProducts] = useState<Product[]>(initialProducts);

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

  const handleEditProduct = (updatedProduct: Product) => {
    setProducts((prevProducts: Product[]) =>
      prevProducts.map((product: Product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  const handleFavoriteProduct = (product: Product) => {
    console.log('Favorite product:', product);
    // Implement favorite functionality here
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <GlobalStyles styles={{ '.css-j4unr3': { marginTop: '100px' } }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar cartItemsCount={cart.reduce((sum, item) => sum + item.quantity, 0)} />
            <Box sx={{ flex: '1 0 auto' }}>
              <MainContent 
                handleAddToCart={handleAddToCart}
                handleUpdateQuantity={handleUpdateQuantity}
                handleRemoveFromCart={handleRemoveFromCart}
                handleEditProduct={handleEditProduct}
                handleFavoriteProduct={handleFavoriteProduct}
                cart={cart}
                products={products}
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
  handleEditProduct: (product: Product) => void;
  handleFavoriteProduct: (product: Product) => void;
  cart: CartItem[];
  products: Product[];
}> = ({ handleAddToCart, handleUpdateQuantity, handleRemoveFromCart, handleEditProduct, handleFavoriteProduct, cart, products }) => {
  const location = useLocation();

  return (
    <>
      {location.pathname === '/' && <HeroSection />}
      <Routes>
        <Route path="/" element={<ProductList products={products} onAddToCart={handleAddToCart} onEdit={handleEditProduct} onFavorite={handleFavoriteProduct} />} />
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
            onEdit={handleEditProduct}
            onFavorite={handleFavoriteProduct}
          />} 
        />
        <Route 
          path="/systems" 
          element={<SystemsPage 
            products={products.filter(p => p.type === 'system')} 
            onAddToCart={handleAddToCart} 
            onEdit={handleEditProduct}
            onFavorite={handleFavoriteProduct}
          />} 
        />
        <Route 
          path="/nutrients" 
          element={<NutrientsPage 
            products={products.filter(p => p.type === 'nutrient')} 
            onAddToCart={handleAddToCart} 
            onEdit={handleEditProduct}
            onFavorite={handleFavoriteProduct}
          />} 
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;