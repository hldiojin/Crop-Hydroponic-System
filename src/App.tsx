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
import { AuthProvider, useAuth } from "./context/AuthContext";
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
import ShippingPage from "./pages/ShippingPage";
import PaymentPage from "./pages/PaymentPage";
import DeviceSelectionPage from "./pages/DeviceSelectionPage";
import { productService } from "./services/productService";
import { config } from "./config";
import cartService from "./services/cartService";
import OrderConfirmation from "./pages/OrderConfirmation";
import PayOSCallback from "./pages/PayOSCallback";
import NotFoundPage from "./pages/NotFoundPage";
import LandingPage from "./pages/LandingPage";

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

// Helper component to determine if layout elements should be shown
const AppLayout = ({
  children,
  cartItemsCount,
  onLogout,
}: {
  children: React.ReactNode;
  cartItemsCount: number;
  onLogout: () => void;
}) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Define paths where Navbar and Footer should be hidden
  const noLayoutPaths = [
    "/login",
    "/register",
    "/cart",
    "/checkout",
    "/profile",
    "/admin",
    "/favorites",
  ];

  // Check if current path is in the noLayoutPaths list or user is not authenticated
  const hideLayout =
    noLayoutPaths.some(
      (path) =>
        location.pathname === path || location.pathname.startsWith(path + "/")
    ) ||
    (!isAuthenticated &&
      (location.pathname === "/login" || location.pathname === "/register"));

  // Only show Navbar and Footer for main pages when user is authenticated
  return hideLayout ? (
    <>{children}</>
  ) : (
    <>
      <Navbar cartItemsCount={cartItemsCount} onLogout={onLogout} />
      <Box sx={{ flex: "1 0 auto" }}>{children}</Box>
      <Footer />
    </>
  );
};

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
          .removeFromCart()
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
      .removeFromCart()
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
            <AppLayout
              cartItemsCount={cart.reduce(
                (sum, item) => sum + item.quantity,
                0
              )}
              onLogout={handleLogout}
            >
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
                onLogout={handleLogout}
                cartItemsCount={cart.reduce(
                  (sum, item) => sum + item.quantity,
                  0
                )}
              />
            </AppLayout>
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
  onLogout: () => void;
  cartItemsCount: number;
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
  onLogout,
  cartItemsCount,
}) => {
  const location = useLocation();

  // Define paths where Navbar and Footer should be hidden
  const noLayoutPaths = [
    "/login",
    "/register",
    "/cart",
    "/checkout",
    "/profile",
    "/admin",
    "/favorites",
  ];

  // Check if current path is in the noLayoutPaths list
  const hideLayout = noLayoutPaths.some(
    (path) =>
      location.pathname === path || location.pathname.startsWith(path + "/")
  );

  // Only show HeroSection on homepage
  const showHeroSection = location.pathname === "/";

  return (
    <>
      {showHeroSection && <HeroSection />}
      <Routes>
        <Route
          path="/"
          element={
            loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <LandingPage />
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
          path="/devices"
          element={
            <ProtectedRoute>
              <DeviceSelectionPage />
            </ProtectedRoute>
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
          path="/checkout/shipping"
          element={
            <ProtectedRoute>
              <ShippingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/payment"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route path="/checkout/confirmation" element={<OrderConfirmation />} />
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
              <Box sx={{ p: 3 }}>
                <Navbar cartItemsCount={cartItemsCount} onLogout={onLogout} />
                <ProfilePage />
              </Box>
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Box sx={{ p: 3 }}>
                <Navbar cartItemsCount={cartItemsCount} onLogout={onLogout} />
                <FavoritePage
                  products={products}
                  favorites={favorites}
                  onRemoveFavorite={handleFavoriteProduct}
                  onAddToCart={handleAddToCart}
                />
              </Box>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Box sx={{ p: 3 }}>
                <Navbar cartItemsCount={cartItemsCount} onLogout={onLogout} />
                <AdminDashboard />
              </Box>
            </AdminRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Box sx={{ p: 3 }}>
                <Navbar cartItemsCount={cartItemsCount} onLogout={onLogout} />
                <CheckoutPage />
              </Box>
            </ProtectedRoute>
          }
        />
        <Route path="/payos-callback" element={<PayOSCallback />} />
        <Route path="/payment" element={<PayOSCallback />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};

export default App;
