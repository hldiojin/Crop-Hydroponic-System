import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  Paper,
  Chip,
  CircularProgress,
  Divider,
  useTheme,
  alpha,
  CardActions,
  Collapse,
  Fade,
  Zoom,
  IconButton,
} from "@mui/material";
import {
  ShoppingCart,
  ExpandMore as ExpandMoreIcon,
  CheckCircle,
  ArrowForward,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { deviceService, Device } from "../services/deviceService";
import { Product } from "../types/types";
import productService from "../services/productService";

// Create properly typed motion components
const MotionCard = motion(Card);
const MotionBox = motion(Box);
const MotionContainer = motion(Container);
const MotionButton = motion(Button);

// Styled expand icon component
interface ExpandMoreProps {
  expand: boolean;
  onClick: () => void;
}

const ExpandMore: React.FC<ExpandMoreProps> = ({ expand, onClick }) => {
  const theme = useTheme();

  return (
    <IconButton
      onClick={onClick}
      sx={{
        transform: expand ? "rotate(180deg)" : "rotate(0deg)",
        transition: theme.transitions.create("transform", {
          duration: theme.transitions.duration.shortest,
        }),
      }}
    >
      <ExpandMoreIcon />
    </IconButton>
  );
};

const DeviceSelectionPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [devices, setDevices] = useState<Device[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<
    Record<string, boolean>
  >({});
  const [expandedDevice, setExpandedDevice] = useState<string | null>(null);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Fetch devices on component mount
  useEffect(() => {
    const fetchDevices = async () => {
      setLoadingDevices(true);
      try {
        const fetchedDevices = await deviceService.getAll();
        setDevices(fetchedDevices);
      } catch (error) {
        console.error("Failed to fetch devices:", error);
      } finally {
        setLoadingDevices(false);
      }
    };

    fetchDevices();
  }, []);

  // Fetch products when a device is selected
  useEffect(() => {
    if (selectedDevice) {
      const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
          // In a real app, you might want to fetch products related to the selected device
          // For now, we'll just fetch all products
          const fetchedProducts = await productService.getAll();
          setProducts(fetchedProducts);
        } catch (error) {
          console.error("Failed to fetch products:", error);
        } finally {
          setLoadingProducts(false);
        }
      };

      fetchProducts();
    }
  }, [selectedDevice]);

  // Handle device selection
  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
    setExpandedDevice(device.id);

    // Clear previously selected products when selecting a new device
    setSelectedProducts({});
  };

  // Handle product selection
  const handleProductSelect = (productId: string) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  // Handle expand panel for a device
  const handleExpandDevice = (deviceId: string) => {
    setExpandedDevice(expandedDevice === deviceId ? null : deviceId);
  };

  // Process checkout
  const handleCheckout = () => {
    if (!selectedDevice) return;

    // Create a cart with the selected device
    const selectedDevicesObj: Record<string, number> = {
      [selectedDevice.id]: 1, // We're just selecting one of each for now
    };

    // Save selected device to localStorage for use in checkout flow
    localStorage.setItem("selectedDevices", JSON.stringify(selectedDevicesObj));

    // If any products are selected, add them to the cart
    if (Object.values(selectedProducts).some((selected) => selected)) {
      const selectedProductsList = products
        .filter((product) => selectedProducts[product.id])
        .map((product) => ({
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity: 1,
          productImage: product.mainImage,
        }));

      // Save selected products to localStorage for the cart page
      localStorage.setItem(
        "selectedCartDetails",
        JSON.stringify(selectedProductsList)
      );
    }

    // Navigate to the cart page
    navigate("/cart");
  };

  // Loading state
  if (loadingDevices) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading devices...
        </Typography>
      </Box>
    );
  }

  return (
    <MotionContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      maxWidth="lg"
      sx={{ py: 4 }}
    >
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        align="center"
        sx={{
          fontWeight: 600,
          mb: 3,
          color: theme.palette.primary.main,
        }}
      >
        Select Your Hydroponic Device
      </Typography>

      <Typography
        variant="subtitle1"
        align="center"
        sx={{ mb: 4, color: alpha(theme.palette.text.primary, 0.7) }}
      >
        First select a device, then you can choose compatible products to
        enhance your system
      </Typography>

      <Grid container spacing={4}>
        {devices.map((device) => (
          <Grid item key={device.id} xs={12} md={6}>
            <MotionCard
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                boxShadow:
                  selectedDevice?.id === device.id
                    ? `0 0 0 3px ${theme.palette.primary.main}, 0 8px 20px rgba(0,0,0,0.1)`
                    : "0 8px 20px rgba(0,0,0,0.1)",
                position: "relative",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {selectedDevice?.id === device.id && (
                <Chip
                  icon={<CheckCircle />}
                  label="Selected"
                  color="primary"
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    zIndex: 2,
                    fontWeight: "bold",
                  }}
                />
              )}

              <CardMedia
                component="img"
                height="240"
                image={device.attachment || "/placeholder-device.jpg"}
                alt={device.name}
                sx={{ objectFit: "cover" }}
              />

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h5"
                  component="h2"
                  fontWeight="bold"
                  gutterBottom
                >
                  {device.name}
                </Typography>

                <Typography variant="body2" color="text.secondary" paragraph>
                  {device.description}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="primary.main"
                  >
                    ${device.price.toLocaleString()}
                  </Typography>

                  <Chip
                    label={device.quantity > 0 ? "In Stock" : "Out of Stock"}
                    color={device.quantity > 0 ? "success" : "error"}
                    size="small"
                    sx={{ ml: 2 }}
                  />
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: "space-between", p: 2 }}>
                <Button
                  variant={
                    selectedDevice?.id === device.id ? "contained" : "outlined"
                  }
                  color="primary"
                  onClick={() => handleDeviceSelect(device)}
                  disabled={device.quantity <= 0}
                  startIcon={<ShoppingCart />}
                >
                  {selectedDevice?.id === device.id
                    ? "Selected"
                    : "Select Device"}
                </Button>

                <ExpandMore
                  expand={expandedDevice === device.id}
                  onClick={() => handleExpandDevice(device.id)}
                />
              </CardActions>

              <Collapse
                in={expandedDevice === device.id}
                timeout="auto"
                unmountOnExit
              >
                <Divider />
                <CardContent>
                  <Typography paragraph fontWeight="bold">
                    Device Details:
                  </Typography>
                  <Typography paragraph>
                    This {device.name} is an advanced hydroponic system designed
                    for efficient plant growth. Additional specifications and
                    features would be listed here.
                  </Typography>
                </CardContent>
              </Collapse>
            </MotionCard>
          </Grid>
        ))}
      </Grid>

      {/* Product selection section - only visible when a device is selected */}
      {selectedDevice && (
        <Fade in={!!selectedDevice}>
          <Box sx={{ mt: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                mb: 4,
              }}
            >
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Optional: Add Compatible Products
              </Typography>

              <Typography variant="body2" color="text.secondary" paragraph>
                Enhance your {selectedDevice.name} with these compatible
                products. These are optional and can be changed later.
              </Typography>

              {loadingProducts ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {products.slice(0, 4).map((product) => (
                    <Grid item key={product.id} xs={12} sm={6} md={3}>
                      <Zoom in={true}>
                        <Card
                          sx={{
                            borderRadius: 2,
                            cursor: "pointer",
                            border: selectedProducts[product.id]
                              ? `2px solid ${theme.palette.primary.main}`
                              : "2px solid transparent",
                            boxShadow: selectedProducts[product.id]
                              ? `0 4px 12px ${alpha(
                                  theme.palette.primary.main,
                                  0.3
                                )}`
                              : "0 2px 8px rgba(0,0,0,0.08)",
                            transition: "all 0.2s ease",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                          }}
                          onClick={() => handleProductSelect(product.id)}
                        >
                          {selectedProducts[product.id] && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                bgcolor: theme.palette.primary.main,
                                color: "white",
                                borderRadius: "50%",
                                width: 24,
                                height: 24,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 2,
                              }}
                            >
                              <CheckCircle fontSize="small" />
                            </Box>
                          )}

                          <CardMedia
                            component="img"
                            height="120"
                            image={
                              product.mainImage || "/placeholder-product.jpg"
                            }
                            alt={product.name}
                          />

                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {product.name}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 1 }}
                            >
                              {product.description?.substring(0, 60)}...
                            </Typography>

                            <Typography
                              variant="h6"
                              color="primary"
                              fontWeight="bold"
                              sx={{ mt: 1 }}
                            >
                              ${product.price}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Zoom>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <MotionButton
                variant="contained"
                color="primary"
                size="large"
                onClick={handleCheckout}
                endIcon={<ArrowForward />}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  fontWeight: "bold",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                }}
              >
                Continue to Checkout
              </MotionButton>
            </Box>
          </Box>
        </Fade>
      )}
    </MotionContainer>
  );
};

export default DeviceSelectionPage;
