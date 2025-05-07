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
  Remove,
  Add,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { deviceService, Device } from "../services/deviceService";
import { Product } from "../types/types";
import productService from "../services/productService";

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

// Thêm utility function để xử lý rich text từ draft.js
const parseRichText = (content: string): JSX.Element | string => {
  try {
    // Kiểm tra xem chuỗi có phải là JSON từ rich text editor
    if (!content.startsWith("{")) {
      return content;
    }

    const data = JSON.parse(content);

    // Kiểm tra xem dữ liệu có cấu trúc chuẩn của draft.js không
    if (!data.blocks || !Array.isArray(data.blocks)) {
      return content;
    }

    // Render từng khối văn bản
    return (
      <>
        {data.blocks.map((block: any, blockIndex: number) => {
          // Lấy text của block
          let text = block.text || "";

          // Tạo bản sao text để thêm định dạng
          const textSegments: {
            text: string;
            bold?: boolean;
            italic?: boolean;
            underline?: boolean;
            start: number;
            end: number;
          }[] = [{ text, start: 0, end: text.length }];

          // Xử lý style inline
          if (
            block.inlineStyleRanges &&
            Array.isArray(block.inlineStyleRanges)
          ) {
            // Sắp xếp theo vị trí bắt đầu
            const ranges = [...block.inlineStyleRanges].sort(
              (a, b) => a.offset - b.offset
            );

            // Xử lý từng style range
            for (const range of ranges) {
              const { offset, length, style } = range;
              const end = offset + length;

              // Tìm tất cả các phân đoạn bị ảnh hưởng
              for (let i = 0; i < textSegments.length; i++) {
                const segment = textSegments[i];

                // Nếu phân đoạn nằm ngoài phạm vi style, bỏ qua
                if (segment.end <= offset || segment.start >= end) continue;

                // Nếu phân đoạn nằm hoàn toàn trong phạm vi style
                if (segment.start >= offset && segment.end <= end) {
                  // Áp dụng style cho phân đoạn này
                  if (style === "BOLD") segment.bold = true;
                  if (style === "ITALIC") segment.italic = true;
                  if (style === "UNDERLINE") segment.underline = true;
                  continue;
                }

                // Trường hợp phân đoạn bị cắt bởi style
                const newSegments = [];

                // Phần trước style
                if (segment.start < offset) {
                  newSegments.push({
                    ...segment,
                    end: offset,
                  });
                }

                // Phần trong style
                const styledSegment = {
                  ...segment,
                  start: Math.max(offset, segment.start),
                  end: Math.min(end, segment.end),
                };

                if (style === "BOLD") styledSegment.bold = true;
                if (style === "ITALIC") styledSegment.italic = true;
                if (style === "UNDERLINE") styledSegment.underline = true;

                newSegments.push(styledSegment);

                // Phần sau style
                if (segment.end > end) {
                  newSegments.push({
                    ...segment,
                    start: end,
                  });
                }

                // Thay thế phân đoạn gốc bằng các phân đoạn mới
                textSegments.splice(i, 1, ...newSegments);
                i += newSegments.length - 1;
              }
            }
          }

          // Render block theo loại
          let blockElement;
          const blockType = block.type || "unstyled";

          // Render từng phân đoạn với style
          const renderedSegments = textSegments.map((segment, idx) => {
            const style: React.CSSProperties = {};
            if (segment.bold) style.fontWeight = "bold";
            if (segment.italic) style.fontStyle = "italic";
            if (segment.underline) style.textDecoration = "underline";

            const segmentText = text.substring(segment.start, segment.end);

            return (
              <Box component="span" key={idx} sx={style}>
                {segmentText}
              </Box>
            );
          });

          switch (blockType) {
            case "header-one":
              blockElement = (
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: "bold" }}
                >
                  {renderedSegments}
                </Typography>
              );
              break;
            case "header-two":
              blockElement = (
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: "bold" }}
                >
                  {renderedSegments}
                </Typography>
              );
              break;
            case "header-three":
              blockElement = (
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ fontWeight: "bold" }}
                >
                  {renderedSegments}
                </Typography>
              );
              break;
            case "blockquote":
              blockElement = (
                <Typography
                  variant="body2"
                  sx={{
                    pl: 2,
                    borderLeft: "3px solid",
                    borderColor: "primary.main",
                    fontStyle: "italic",
                    my: 1.5,
                    py: 0.5,
                    px: 1,
                    bgcolor: "rgba(0,0,0,0.03)",
                  }}
                >
                  {renderedSegments}
                </Typography>
              );
              break;
            case "unordered-list-item":
              blockElement = (
                <Box sx={{ display: "flex", pl: 2, mb: 1 }}>
                  <Typography variant="body2" sx={{ pr: 1 }}>
                    •
                  </Typography>
                  <Typography variant="body2">{renderedSegments}</Typography>
                </Box>
              );
              break;
            case "ordered-list-item":
              blockElement = (
                <Box sx={{ display: "flex", pl: 2, mb: 1 }}>
                  <Typography variant="body2" sx={{ pr: 1 }}>
                    {blockIndex + 1}.
                  </Typography>
                  <Typography variant="body2">{renderedSegments}</Typography>
                </Box>
              );
              break;
            case "code-block":
              blockElement = (
                <Box
                  sx={{
                    bgcolor: "rgba(0,0,0,0.05)",
                    p: 1.5,
                    borderRadius: 1,
                    my: 1.5,
                    fontFamily: "monospace",
                  }}
                >
                  <Typography variant="body2" component="code">
                    {renderedSegments}
                  </Typography>
                </Box>
              );
              break;
            case "unstyled":
            default:
              blockElement = (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {renderedSegments}
                </Typography>
              );
          }

          return <Box key={blockIndex}>{blockElement}</Box>;
        })}
      </>
    );
  } catch (error) {
    console.error("Error parsing rich text:", error);
    return content;
  }
};

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
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<
    Record<string, boolean>
  >({});
  const [expandedDevice, setExpandedDevice] = useState<string | null>(null);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [deviceQuantities, setDeviceQuantities] = useState<
    Record<string, number>
  >({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Fetch devices on component mount
  useEffect(() => {
    const fetchDevices = async () => {
      setLoadingDevices(true);
      try {
        const fetchedDevices = await deviceService.getAll();
        setDevices(fetchedDevices);

        fetchedDevices.forEach((device) => {
          setDeviceQuantities((prev) => ({
            ...prev,
            [device.id]: 1, // Initialize quantity for each device
          }));
        });
      } catch (error) {
        console.error("Failed to fetch devices:", error);
      } finally {
        setLoadingDevices(false);
      }
    };
    localStorage.removeItem("backLocation"); // Clear current order ID on page load
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
          fetchedProducts.forEach((product: Product) => {
            setQuantities((prev) => ({
              ...prev,
              [product.id]: 1, // Initialize quantity for each product
            }));
          });
        } catch (error) {
          console.error("Failed to fetch products:", error);
        } finally {
          setLoadingProducts(false);
        }
      };

      fetchProducts();
    }
  }, [selectedDevice]);

  const handleDeviceQuantityChange = (deviceId: string, change: number) => {
    setDeviceQuantities((prev) => {
      const currentQuantity = prev[deviceId] || 1;
      const newQuantity = Math.max(1, currentQuantity + change); // Ensure quantity is at least 1
      return { ...prev, [deviceId]: newQuantity };
    });
  };

  const handleProductQuantityChange = (productId: string, change: number) => {
    setQuantities((prev) => {
      const currentQuantity = prev[productId] || 1;
      const newQuantity = Math.max(1, currentQuantity + change); // Ensure quantity is at least 1
      return { ...prev, [productId]: newQuantity };
    });
  };

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
  const handleCheckout = async () => {
    if (!selectedDevice) return;

    const selectedDevicesObj: Record<string, number> = {
      [selectedDevice.id]: 1,
    };

    const selectedProductsList = products
      .filter((product) => selectedProducts[product.id])
      .map((product) => ({
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: 1,
        productImage: product.mainImage,
      }));

    const orderData = {
      products: selectedProductsList.map((product) => ({
        id: product.productId,
        unitPrice: product.unitPrice,
        quantity: quantities[product.productId] || 1,
      })),
      devices: [
        {
          id: selectedDevice.id,
          unitPrice: selectedDevice.price,
          quantity: deviceQuantities[selectedDevice.id] || 1,
        },
      ],
    };

    const orderResponse = await submitOrder(orderData);
    if (orderResponse.statusCodes != 200) {
      console.error("Failed to submit order:", orderResponse);
      return;
    }
    localStorage.setItem("backLocation", "/devices");
    localStorage.setItem("currentOrderId", orderResponse.response.data);
    // Redirect to cart page after successful order submission
    navigate(`/checkout/${orderResponse.response.data}/shipping`);
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
          Chọn thiết bị thủy canh của bạn
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
          Chọn thiết bị trước, sau đó bạn có thể chọn sản phẩm tương thích để
          nâng cao hệ thống của bạn
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
                      {device.price?.toLocaleString() || "0"}VND
                    </Typography>

                    <Chip
                      label={device.quantity > 0 ? "Còn hàng" : "Hết hàng"}
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
                        ? "Đã chọn"
                        : "Chọn thiết bị"}
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
                          onClick={() =>
                            handleDeviceQuantityChange(device.id, -1)
                          }
                          disabled={(deviceQuantities[device.id] || 1) <= 1}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        <Typography
                          sx={{ mx: 1, minWidth: "24px", textAlign: "center" }}
                        >
                          {deviceQuantities[device.id] || 1}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleDeviceQuantityChange(device.id, 1)
                          }
                          disabled={
                            (deviceQuantities[device.id] || 1) >=
                            device.quantity
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
                      Chi tiết thiết bị
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                        ml: 1,
                      }}
                    >
                      {device.description ? (
                        <Box sx={{ color: "text.primary" }}>
                          {typeof device.description === "string" ? (
                            parseRichText(device.description)
                          ) : (
                            <Typography variant="body2">
                              {String(device.description)}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Không có thông tin chi tiết cho thiết bị này.
                        </Typography>
                      )}
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
                    Tùy chọn: Thêm sản phẩm tương thích
                  </Typography>

                  <Typography
                    variant="body1"
                    color="text.secondary"
                    paragraph
                    sx={{ mb: 3.5 }}
                  >
                    Nâng cao{" "}
                    <Box
                      component="span"
                      sx={{ fontWeight: "bold", color: "primary.main" }}
                    >
                      {selectedDevice.name}
                    </Box>{" "}
                    với các sản phẩm tương thích. Đây là tùy chọn và có thể được
                    thay đổi sau.
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
                    <Grid container spacing={3} sx={{ mt: 0.5 }}>
                      {products.slice(0, 4).map((product, index) => (
                        <Grid item key={product.id} xs={12} sm={6} md={3}>
                          <Zoom
                            in={true}
                            style={{ transitionDelay: `${index * 100}ms` }}
                          >
                            <Card
                              sx={{
                                borderRadius: 2,
                                cursor: "pointer",
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
                                  bgcolor: alpha(theme.palette.grey[100], 0.5),
                                  p: 1,
                                }}
                              />

                              <CardContent
                                sx={{
                                  flexGrow: 1,
                                  p: 2,
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="medium"
                                  gutterBottom
                                  sx={{
                                    height: "42px",
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
                                    height: "60px",
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

                                <Box sx={{ mt: "auto", pt: 2 }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      mb: 2,
                                    }}
                                  >
                                    <Typography
                                      variant="h6"
                                      color="primary"
                                      fontWeight="bold"
                                    >
                                      {product.price || 0} VND
                                    </Typography>

                                    <Chip
                                      size="small"
                                      label={
                                        selectedProducts[product.id]
                                          ? "Đã chọn"
                                          : "Tùy chọn"
                                      }
                                      color={
                                        selectedProducts[product.id]
                                          ? "primary"
                                          : "default"
                                      }
                                      sx={{ fontWeight: "medium" }}
                                    />
                                  </Box>

                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      gap: 1,
                                    }}
                                  >
                                    <MotionButton
                                      fullWidth
                                      variant={
                                        selectedProducts[product.id]
                                          ? "contained"
                                          : "outlined"
                                      }
                                      color="primary"
                                      onClick={() =>
                                        handleProductSelect(product.id)
                                      }
                                      disabled={product.amount <= 0}
                                      startIcon={
                                        selectedProducts[product.id] ? (
                                          <CheckCircle />
                                        ) : (
                                          <ShoppingCart />
                                        )
                                      }
                                      variants={buttonVariants}
                                      whileHover="hover"
                                      whileTap="tap"
                                      sx={{
                                        py: 0.75,
                                        borderRadius: 2,
                                        fontWeight: 500,
                                        boxShadow: selectedProducts[product.id]
                                          ? "0 4px 10px rgba(76, 175, 80, 0.2)"
                                          : "none",
                                        textTransform: "none",
                                      }}
                                    >
                                      {product.amount <= 0
                                        ? "Hết hàng"
                                        : selectedProducts[product.id]
                                        ? "Đã chọn"
                                        : "Thêm vào"}
                                    </MotionButton>

                                    {selectedProducts[product.id] && (
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          border: `1px solid ${alpha(
                                            theme.palette.primary.main,
                                            0.3
                                          )}`,
                                          borderRadius: 2,
                                          minWidth: "100px",
                                          justifyContent: "space-between",
                                        }}
                                      >
                                        <IconButton
                                          size="small"
                                          onClick={() =>
                                            handleProductQuantityChange(
                                              product.id,
                                              -1
                                            )
                                          }
                                          disabled={
                                            (quantities[product.id] || 1) <= 1
                                          }
                                          sx={{
                                            color: theme.palette.primary.main,
                                          }}
                                        >
                                          <Remove fontSize="small" />
                                        </IconButton>
                                        <Typography
                                          sx={{
                                            fontWeight: "medium",
                                            color: theme.palette.primary.main,
                                          }}
                                        >
                                          {quantities[product.id] || 1}
                                        </Typography>
                                        <IconButton
                                          size="small"
                                          onClick={() =>
                                            handleProductQuantityChange(
                                              product.id,
                                              1
                                            )
                                          }
                                          disabled={
                                            (quantities[product.id] || 1) >=
                                            product.amount
                                          }
                                          sx={{
                                            color: theme.palette.primary.main,
                                          }}
                                        >
                                          <Add fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    )}
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          </Zoom>
                        </Grid>
                      ))}
                    </Grid>
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
                  Tiếp tục thanh toán
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
