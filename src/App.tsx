import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { 
  CssBaseline, 
  ThemeProvider, 
  createTheme, 
  Box, 
  GlobalStyles,
  CircularProgress 
} from '@mui/material';
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
import FavoritePage from './pages/FavoritePage';
import AdminDashboard from './pages/AdminDashboard';
import { AdminRoute } from './components/AdminRoute';
import CheckoutPage from './pages/CheckoutPage';
import { productService } from './services/productService';
import { config } from './config';

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
    },
  },
});

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsData = await productService.getAll();
        setProducts(productsData || []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id: string, change: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.id === id) {
            const newQuantity = item.quantity + change;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== id));
  };

  const handleEditProduct = async (updatedProduct: Product) => {
    try {
      if (!config.useLocalData) {
        await productService.update(updatedProduct.id, updatedProduct);
      }
      
      setProducts((prevProducts: Product[]) =>
        prevProducts.map((product: Product) =>
          product.id === updatedProduct.id ? updatedProduct : product
        )
      );
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const handleFavoriteProduct = (product: Product) => {
    setFavorites((prevFavorites) => {
      if (prevFavorites.includes(product.id)) {
        return prevFavorites.filter((id) => id !== product.id);
      } else {
        return [...prevFavorites, product.id];
      }
    });
  };

  const handleLogout = () => {
    setFavorites([]);
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <GlobalStyles styles={{ '.css-j4unr3': { marginTop: '100px' } }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar
              cartItemsCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
              onLogout={handleLogout}
            />
            <Box sx={{ flex: '1 0 auto' }}>
              <MainContent
                handleAddToCart={handleAddToCart}
                handleUpdateQuantity={handleUpdateQuantity}
                handleRemoveFromCart={handleRemoveFromCart}
                handleEditProduct={handleEditProduct}
                handleFavoriteProduct={handleFavoriteProduct}
                cart={cart}
                products={products}
                favorites={favorites}
                loading={loading}
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
  handleUpdateQuantity: (id: string, change: number) => void;
  handleRemoveFromCart: (id: string) => void;
  handleEditProduct: (product: Product) => void;
  handleFavoriteProduct: (product: Product) => void;
  cart: CartItem[];
  products: Product[];
  favorites: string[];
  loading: boolean;
}> = ({
  handleAddToCart,
  handleUpdateQuantity,
  handleRemoveFromCart,
  handleEditProduct,
  handleFavoriteProduct,
  cart,
  products,
  favorites,
  loading,
}) => {
  const location = useLocation();

  return (
    <>
      {location.pathname === '/' && <HeroSection />}
      <Routes>
        <Route
          path="/"
          element={
            loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <ProductList
                products={products}
                onAddToCart={handleAddToCart}
                onEdit={handleEditProduct}
                onFavorite={handleFavoriteProduct}
                favorites={favorites}
              />
            )
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/product/:id"
          element={
            <ProductDetail
              products={products}
              onAddToCart={handleAddToCart}
              onFavorite={handleFavoriteProduct}
              favorites={favorites}
            />
          }
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
          element={
            <PlantsPage
              onAddToCart={handleAddToCart}
              onEdit={handleEditProduct}
              onFavorite={handleFavoriteProduct}
              favorites={favorites}
            />
          }
        />
        <Route
          path="/systems"
          element={
            <SystemsPage
              onAddToCart={handleAddToCart}
              onEdit={handleEditProduct}
              onFavorite={handleFavoriteProduct}
              favorites={favorites}
            />
          }
        />
        <Route
          path="/nutrients"
          element={
            <NutrientsPage
              onAddToCart={handleAddToCart}
              onEdit={handleEditProduct}
              onFavorite={handleFavoriteProduct}
              favorites={favorites}
            />
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <FavoritePage
                products={products}
                favorites={favorites}
                onRemoveFavorite={handleFavoriteProduct}
                onAddToCart={handleAddToCart}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;