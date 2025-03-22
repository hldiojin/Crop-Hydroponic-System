import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  Box,
  GlobalStyles,
  CircularProgress,
} from "@mui/material";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import Footer from "./components/Footer";
import ProductList from "./pages/ProductList";
import CartPage from "./pages/CartPage";
import { CartItem, Product } from "./types/types";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProductDetail from "./pages/ProductDetail";
import PlantsPage from "./pages/PlantsPage";
import SystemsPage from "./pages/SystemsPage";
import NutrientsPage from "./pages/NutrientsPage";
import ProfilePage from "./pages/ProfilePage";
import FavoritePage from "./pages/FavoritePage";
import AdminDashboard from "./pages/AdminDashboard";
import { AdminRoute } from "./components/AdminRoute";
import CheckoutPage from "./pages/CheckoutPage";
import { productService } from "./services/productService";
import { config } from "./config";
import cartService from "./services/cartService";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2e7d32",
      light: "#60ad5e",
      dark: "#005005",
    },
    secondary: {
      main: "#81c784",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
    h1: {
      color: "#2e7d32",
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
        console.error("Failed to fetch products:", err);
        setError("Failed to load products.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    // Update local cart state
    setCart((prevCart) => {
      // Check if product already exists in cart
      const existingItemIndex = prevCart.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingItemIndex >= 0) {
        // If product exists, increase quantity
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + 1,
        };
        return updatedCart;
      } else {
        // If product doesn't exist, add it with quantity 1
        return [...prevCart, { product, quantity: 1 }];
      }
    });

    // Call the cart service API
    cartService
      .addProduct(product)
      .then((cartItem) => {
        console.log("Product added to cart:", cartItem);
      })
      .catch((error) => {
        console.error("Failed to add product to cart:", error);
      });
  };

  const handleUpdateQuantity = (id: string, change: number) => {
    setCart((prevCart) => {
      const updatedCart = prevCart
        .map((item) => {
          if (item.product.id === id) {
            const newQuantity = item.quantity + change;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0);

      // Find the item that was updated to call the API
      const updatedItem = updatedCart.find((item) => item.product.id === id);
      if (updatedItem) {
        // Call the cart service API to update the quantity using productId
        cartService
          .updateCartQuantity(id, updatedItem.quantity)
          .then(() => {
            console.log("Cart quantity updated successfully");
          })
          .catch((error) => {
            console.error("Failed to update cart quantity:", error);
          });
      } else if (change < 0) {
        // If the item was removed (not in the updated cart), call removeFromCart
        cartService
          .removeFromCart(id)
          .then(() => {
            console.log("Item removed from cart successfully");
          })
          .catch((error) => {
            console.error("Failed to remove item from cart:", error);
          });
      }

      return updatedCart;
    });
  };

  // Also update the handleRemoveFromCart method to call the API
  const handleRemoveFromCart = (id: string) => {
    // Update local state first for immediate feedback
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== id));

    // Then call the API to remove the item
    cartService
      .removeFromCart(id)
      .then(() => {
        console.log("Item removed from cart successfully");
      })
      .catch((error) => {
        console.error("Failed to remove item from cart:", error);
      });
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
      console.error("Failed to update product:", error);
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
          <GlobalStyles styles={{ ".css-j4unr3": { marginTop: "100px" } }} />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
          >
            <Navbar
              cartItemsCount={cart.reduce(
                (sum, item) => sum + item.quantity,
                0
              )}
              onLogout={handleLogout}
            />
            <Box sx={{ flex: "1 0 auto" }}>
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
      {location.pathname === "/" && <HeroSection />}
      <Routes>
        <Route
          path="/"
          element={
            loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
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
