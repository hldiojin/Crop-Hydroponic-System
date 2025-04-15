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
  Pagination,
} from "@mui/material";
import {
  ShoppingCart,
  ExpandMore as ExpandMoreIcon,
  CheckCircle,
  ArrowForward,
  Remove,
  Add,
  AddShoppingCart,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { deviceService, Device } from "../services/deviceService";
import { Product } from "../types/types";
import productService from "../services/productService";
import cartService, { CartItemRequest } from "../services/cartService";

import {
  MotionBox,
  MotionTypography,
  MotionButton,
  containerVariants,
  itemVariants,
  buttonVariants,
} from "../utils/motion";
import { submitOrder } from "../services/orderSevice";

// Định nghĩa thêm MotionCard và MotionContainer vì chúng không có trong file utils/motion.tsx
const MotionCard = motion(Card);
const MotionContainer = motion(Container);

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
        bgcolor: alpha(theme.palette.primary.main, 0.05),
        "&:hover": {
          bgcolor: alpha(theme.palette.primary.main, 0.1),
        },
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
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<
    Record<string, boolean>
  >({});
  const [expandedDevice, setExpandedDevice] = useState<string | null>(null);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Pagination state
  const [page, setPage] = useState(1);
  const [productsPerPage] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  // Loading states for add to cart
  const [addingToCart, setAddingToCart] = useState<Record<string, boolean>>({});

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

  // Fetch all products when component mounts
  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoadingProducts(true);
      try {
        const fetchedProducts = await productService.getAll();
        setAllProducts(fetchedProducts);
        setTotalPages(Math.ceil(fetchedProducts.length / productsPerPage));
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchAllProducts();
  }, [productsPerPage]);

  // Update displayed products when page changes or when allProducts changes
  useEffect(() => {
    const startIndex = (page - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    setProducts(allProducts.slice(startIndex, endIndex));
  }, [page, allProducts, productsPerPage]);

  // Handle device selection
  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
    setExpandedDevice(device.id);

    // Initialize quantity if not already set
    setQuantities((prev) => ({
      ...prev,
      [device.id]: prev[device.id] || 1,
    }));

    // Clear previously selected products when selecting a new device
    setSelectedProducts({});
  };

  // Handle product selection
  const handleProductSelect = (productId: string) => {
    setSelectedProducts((prev) => {
      const newState = {
        ...prev,
        [productId]: !prev[productId],
      };

      // Initialize quantity if product is selected and quantity not set
      if (newState[productId] && !quantities[productId]) {
        setQuantities((prevQuantities) => ({
          ...prevQuantities,
          [productId]: 1,
        }));
      }

      return newState;
    });
  };

  // Handle add to cart for products
  const handleAddToCart = async (product: Product) => {
    setAddingToCart((prev) => ({ ...prev, [product.id]: true }));

    try {
      const quantity = quantities[product.id] || 1;
      const cartItem: CartItemRequest = {
        productId: product.id,
        unitPrice: product.price,
        quantity: quantity,
      };

      await cartService.addToCart(cartItem);

      // Mark product as selected after adding to cart
      setSelectedProducts((prev) => ({
        ...prev,
        [product.id]: true,
      }));
    } catch (error) {
      console.error("Failed to add product to cart:", error);
    } finally {
      setAddingToCart((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  // Handle quantity change
  const handleQuantityChange = (id: string, change: number) => {
    setQuantities((prev) => {
      const newQuantity = Math.max(1, (prev[id] || 1) + change);
      return {
        ...prev,
        [id]: newQuantity,
      };
    });
  };

  // Handle expand panel for a device
  const handleExpandDevice = (deviceId: string) => {
    setExpandedDevice(expandedDevice === deviceId ? null : deviceId);
  };

  // Handle pagination change
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  // Process checkout
  const handleCheckout = async () => {
    if (!selectedDevice) return;

    try {
      // Store selected device information in localStorage
      const deviceData = {
        id: selectedDevice.id,
        name: selectedDevice.name,
        price: selectedDevice.price,
        quantity: quantities[selectedDevice.id] || 1,
        attachment: selectedDevice.attachment,
      };

      localStorage.setItem(
        "selectedDevices",
        JSON.stringify({
          [selectedDevice.id]: quantities[selectedDevice.id] || 1,
        })
      );

      localStorage.setItem("deviceData", JSON.stringify(deviceData));

      // Navigate to cart page to review the order
      navigate("/cart");
    } catch (error) {
      console.error("Failed to process checkout:", error);
    }
  };

  // Loading state
  if (loadingDevices) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          paddingTop: "84px", // Tăng padding-top để tránh bị navbar che
          background: `linear-gradient(to bottom, ${alpha(
            theme.palette.primary.light,
            0.05
          )}, ${alpha(theme.palette.background.default, 1)})`,
        }}
      >
        <CircularProgress color="primary" size={40} thickness={4} />
        <Typography
          variant="h6"
          sx={{ ml: 2, color: theme.palette.text.secondary }}
        >
          Loading devices...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        paddingTop: { xs: "76px", sm: "84px", md: "88px" }, // Tăng padding-top để tránh bị navbar che
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.light,
          0.05
        )} 0%, ${theme.palette.background.default} 100%)`,
        minHeight: "100vh",
        paddingBottom: "2rem",
      }}
    >
      <MotionContainer
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        maxWidth="lg"
        sx={{ py: { xs: 3, md: 5 } }}
      >
        <MotionTypography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          variants={itemVariants}
          sx={{
            fontWeight: 700,
            mb: 2,
            color: theme.palette.primary.main,
            letterSpacing: "0.5px",
            textShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          Select Your Hydroponic Device
        </MotionTypography>

        <MotionTypography
          variant="subtitle1"
          align="center"
          variants={itemVariants}
          sx={{
            mb: 5,
            color: alpha(theme.palette.text.primary, 0.7),
            maxWidth: "700px",
            mx: "auto",
            lineHeight: 1.6,
          }}
        >
          First select a device, then you can choose compatible products to
          enhance your system
        </MotionTypography>

        <Grid container spacing={4}>
          {devices.map((device, index) => (
            <Grid item key={device.id} xs={12} md={6}>
              <MotionCard
                variants={itemVariants}
                whileHover={{
                  y: -8,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                }}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow:
                    selectedDevice?.id === device.id
                      ? `0 0 0 2px ${theme.palette.primary.main}, 0 8px 20px rgba(0,0,0,0.12)`
                      : "0 8px 20px rgba(0,0,0,0.1)",
                  position: "relative",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor:
                    selectedDevice?.id === device.id
                      ? alpha(theme.palette.primary.light, 0.05)
                      : theme.palette.background.paper,
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
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                  />
                )}

                <CardMedia
                  component="img"
                  height="240"
                  image={device.attachment || "/placeholder-device.jpg"}
                  alt={device.name}
                  sx={{
                    objectFit: "cover",
                    transition: "transform 0.5s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                />

                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography
                    variant="h5"
                    component="h2"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                      color: theme.palette.primary.dark,
                      mb: 1.5,
                    }}
                  >
                    {device.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    paragraph
                    sx={{
                      lineHeight: 1.7,
                      mb: 2.5,
                      minHeight: "4.2em", // Giữ khoảng 2-3 dòng text
                    }}
                  >
                    {device.description ||
                      "A premium hydroponic system designed for efficient plant growth with smart monitoring."}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{
                        color: theme.palette.primary.main,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {device.price?.toLocaleString() || "0"} VND
                    </Typography>

                    <Chip
                      label={device.quantity > 0 ? "In Stock" : "Out of Stock"}
                      color={device.quantity > 0 ? "success" : "error"}
                      size="small"
                      sx={{ ml: 2, fontWeight: 500 }}
                    />
                  </Box>
                </CardContent>

                <CardActions
                  sx={{ justifyContent: "space-between", p: 2, pt: 0 }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <MotionButton
                      variant={
                        selectedDevice?.id === device.id
                          ? "contained"
                          : "outlined"
                      }
                      color="primary"
                      onClick={() => handleDeviceSelect(device)}
                      disabled={device.quantity <= 0}
                      startIcon={<ShoppingCart />}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      sx={{
                        px: 2.5,
                        py: 1,
                        borderRadius: 2,
                        fontWeight: 500,
                        boxShadow:
                          selectedDevice?.id === device.id
                            ? "0 4px 10px rgba(76, 175, 80, 0.25)"
                            : "none",
                      }}
                    >
                      {selectedDevice?.id === device.id
                        ? "Selected"
                        : "Select Device"}
                    </MotionButton>

                    {selectedDevice?.id === device.id && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          ml: 2,
                          border: `1px solid ${alpha(
                            theme.palette.primary.main,
                            0.3
                          )}`,
                          borderRadius: 1,
                          px: 1,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(device.id, -1)}
                          disabled={(quantities[device.id] || 1) <= 1}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        <Typography
                          sx={{ mx: 1, minWidth: "24px", textAlign: "center" }}
                        >
                          {quantities[device.id] || 1}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(device.id, 1)}
                          disabled={
                            (quantities[device.id] || 1) >= device.quantity
                          }
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>

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
                  <Divider sx={{ mx: 2 }} />
                  <CardContent
                    sx={{ bgcolor: alpha(theme.palette.primary.light, 0.03) }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      color="primary.dark"
                      gutterBottom
                    >
                      Device Details:
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                        ml: 1,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight="medium"
                        >
                          Size:{" "}
                          <Box
                            component="span"
                            sx={{ color: "text.primary", fontWeight: "normal" }}
                          >
                            {device.size || "Standard size for home use"}
                          </Box>
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight="medium"
                        >
                          Capacity:{" "}
                          <Box
                            component="span"
                            sx={{ color: "text.primary", fontWeight: "normal" }}
                          >
                            {device.capacity || "6-8 medium-sized plants"}
                          </Box>
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight="medium"
                        >
                          Features:{" "}
                          <Box
                            component="span"
                            sx={{ color: "text.primary", fontWeight: "normal" }}
                          >
                            {device.features ||
                              "Automatic water circulation, LED growth lights, nutrient monitoring"}
                          </Box>
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight="medium"
                        >
                          Warranty:{" "}
                          <Box
                            component="span"
                            sx={{ color: "text.primary", fontWeight: "normal" }}
                          >
                            {device.warranty ||
                              "2 years limited manufacturer warranty"}
                          </Box>
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Collapse>
              </MotionCard>
            </Grid>
          ))}
        </Grid>

        {/* Product selection section - only visible when a device is selected */}
        {selectedDevice && (
          <Fade in={!!selectedDevice} timeout={800}>
            <Box sx={{ mt: 6 }}>
              <Paper
                elevation={2}
                sx={{
                  p: { xs: 2.5, md: 4 },
                  borderRadius: 4,
                  bgcolor: alpha(theme.palette.background.paper, 0.9),
                  backdropFilter: "blur(8px)",
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  mb: 4,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decorative element */}
                <Box
                  sx={{
                    position: "absolute",
                    top: -30,
                    right: -30,
                    width: 150,
                    height: 150,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )} 0%, transparent 70%)`,
                    zIndex: 0,
                  }}
                />

                <Box sx={{ position: "relative", zIndex: 1 }}>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    gutterBottom
                    color="primary"
                    sx={{
                      borderBottom: `2px solid ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )}`,
                      pb: 1,
                      mb: 2.5,
                    }}
                  >
                    Compatible Products
                  </Typography>

                  <Typography
                    variant="body1"
                    color="text.secondary"
                    paragraph
                    sx={{ mb: 3.5 }}
                  >
                    Enhance your{" "}
                    <Box
                      component="span"
                      sx={{ fontWeight: "bold", color: "primary.main" }}
                    >
                      {selectedDevice.name}
                    </Box>{" "}
                    with these compatible products. Add to cart any products
                    you'd like to purchase.
                  </Typography>

                  {loadingProducts ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", p: 4 }}
                    >
                      <CircularProgress
                        size={36}
                        color="primary"
                        thickness={4}
                      />
                    </Box>
                  ) : (
                    <>
                      <Grid container spacing={3} sx={{ mt: 0.5 }}>
                        {products.map((product, index) => (
                          <Grid item key={product.id} xs={12} sm={6} md={3}>
                            <Zoom
                              in={true}
                              style={{ transitionDelay: `${index * 100}ms` }}
                            >
                              <Card
                                sx={{
                                  borderRadius: 2,
                                  border: selectedProducts[product.id]
                                    ? `2px solid ${theme.palette.primary.main}`
                                    : "1px solid rgba(0,0,0,0.05)",
                                  boxShadow: selectedProducts[product.id]
                                    ? `0 6px 16px ${alpha(
                                        theme.palette.primary.main,
                                        0.25
                                      )}`
                                    : "0 3px 10px rgba(0,0,0,0.08)",
                                  transition: "all 0.2s ease",
                                  height: "100%",
                                  display: "flex",
                                  flexDirection: "column",
                                  transform: selectedProducts[product.id]
                                    ? "translateY(-4px)"
                                    : "none",
                                  background: selectedProducts[product.id]
                                    ? `linear-gradient(to bottom, ${alpha(
                                        theme.palette.primary.light,
                                        0.1
                                      )}, transparent)`
                                    : theme.palette.background.paper,
                                }}
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
                                      width: 28,
                                      height: 28,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      zIndex: 2,
                                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                    }}
                                  >
                                    <CheckCircle fontSize="small" />
                                  </Box>
                                )}

                                <CardMedia
                                  component="img"
                                  height="140"
                                  image={
                                    product.mainImage ||
                                    "/placeholder-product.jpg"
                                  }
                                  alt={product.name}
                                  sx={{
                                    objectFit: "contain",
                                    bgcolor: alpha(
                                      theme.palette.grey[100],
                                      0.5
                                    ),
                                    p: 1,
                                  }}
                                />

                                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight="medium"
                                    gutterBottom
                                    sx={{
                                      minHeight: "42px",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      display: "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical",
                                    }}
                                  >
                                    {product.name}
                                  </Typography>

                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      mt: 1,
                                      mb: 2,
                                      minHeight: "60px",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      display: "-webkit-box",
                                      WebkitLineClamp: 3,
                                      WebkitBoxOrient: "vertical",
                                    }}
                                  >
                                    {product.description
                                      ? product.description.length > 60
                                        ? `${product.description.substring(
                                            0,
                                            60
                                          )}...`
                                        : product.description
                                      : "Compatible accessory for your hydroponic system."}
                                  </Typography>

                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Typography
                                      variant="h6"
                                      color="primary"
                                      fontWeight="bold"
                                    >
                                      {product.price?.toLocaleString() || "0"}{" "}
                                      VND
                                    </Typography>

                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      {selectedProducts[product.id] && (
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            mr: 1,
                                            border: `1px solid ${alpha(
                                              theme.palette.primary.main,
                                              0.3
                                            )}`,
                                            borderRadius: 1,
                                            px: 1,
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <IconButton
                                            size="small"
                                            onClick={() => {
                                              handleQuantityChange(
                                                product.id,
                                                -1
                                              );
                                            }}
                                            disabled={
                                              (quantities[product.id] || 1) <= 1
                                            }
                                          >
                                            <Remove fontSize="small" />
                                          </IconButton>
                                          <Typography
                                            sx={{
                                              mx: 1,
                                              minWidth: "24px",
                                              textAlign: "center",
                                            }}
                                          >
                                            {quantities[product.id] || 1}
                                          </Typography>
                                          <IconButton
                                            size="small"
                                            onClick={() => {
                                              handleQuantityChange(
                                                product.id,
                                                1
                                              );
                                            }}
                                          >
                                            <Add fontSize="small" />
                                          </IconButton>
                                        </Box>
                                      )}
                                    </Box>
                                  </Box>
                                </CardContent>

                                <CardActions sx={{ p: 2, pt: 0 }}>
                                  <Button
                                    variant={
                                      selectedProducts[product.id]
                                        ? "contained"
                                        : "outlined"
                                    }
                                    color="primary"
                                    startIcon={
                                      selectedProducts[product.id] ? (
                                        <CheckCircle />
                                      ) : (
                                        <AddShoppingCart />
                                      )
                                    }
                                    onClick={() =>
                                      !selectedProducts[product.id] &&
                                      handleAddToCart(product)
                                    }
                                    disabled={addingToCart[product.id]}
                                    fullWidth
                                    sx={{
                                      borderRadius: 2,
                                      py: 1,
                                    }}
                                  >
                                    {addingToCart[product.id] ? (
                                      <CircularProgress
                                        size={24}
                                        color="inherit"
                                      />
                                    ) : selectedProducts[product.id] ? (
                                      "Added to Cart"
                                    ) : (
                                      "Add to Cart"
                                    )}
                                  </Button>
                                </CardActions>
                              </Card>
                            </Zoom>
                          </Grid>
                        ))}
                      </Grid>

                      {totalPages > 1 && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 4,
                          }}
                        >
                          <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                            shape="rounded"
                          />
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              </Paper>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 5,
                }}
              >
                <MotionButton
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleCheckout}
                  endIcon={<ArrowForward />}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  sx={{
                    py: 1.5,
                    px: 5,
                    borderRadius: 3,
                    fontWeight: "bold",
                    boxShadow: "0 8px 20px rgba(76, 175, 80, 0.25)",
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    fontSize: "1.05rem",
                    textTransform: "none",
                    letterSpacing: "0.5px",
                  }}
                >
                  Proceed to Checkout
                </MotionButton>
              </Box>
            </Box>
          </Fade>
        )}
      </MotionContainer>
    </Box>
  );
};

export default DeviceSelectionPage;
