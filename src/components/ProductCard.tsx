import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CardActions,
  Chip,
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  alpha,
  Grid,
  Divider,
  ImageList,
  ImageListItem,
  Paper,
  Stack,
  CircularProgress,
} from "@mui/material";
import {
  ShoppingCart,
  Info,
  Edit,
  Science,
  Close,
  ArrowBack,
  ArrowForward,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { Product } from "../types/types";
import productService from "../services/productService";

interface Props {
  product: Product;
  onAddToCart: (product: Product) => void;
  onEdit: (product: Product) => void;
}

interface DetailedProduct {
  id: string;
  name: string;
  description: string;
  mainImage: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  price: number;
  images: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

const ProductCard: React.FC<Props> = ({ product, onAddToCart, onEdit }) => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [editOpen, setEditOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(product);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailedProduct, setDetailedProduct] =
    useState<DetailedProduct | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleCardClick = async (e: React.MouseEvent) => {
    // Prevent triggering on button clicks
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }

    setLoadingDetails(true);
    setDetailsOpen(true);

    try {
      const details = await productService.getDetailById(product.id);
      if (details) {
        setDetailedProduct(details);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setDetailedProduct(null);
    setSelectedImageIndex(0);
  };

  const handleImageChange = (direction: "prev" | "next") => {
    if (!detailedProduct?.images) return;

    const totalImages = detailedProduct.images.length;
    if (direction === "next") {
      setSelectedImageIndex((prev) => (prev + 1) % totalImages);
    } else {
      setSelectedImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
    }
  };

  const handleAddToCart = () => {
    // Check if product is out of stock
    if (product.amount <= 0) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: location,
          action: "cart",
          productId: product.id,
        },
      });
      return;
    }
    onAddToCart(product);
  };

  const handleEditOpen = () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: location,
          action: "edit",
          productId: product.id,
        },
      });
      return;
    }
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Handle price as a number
    if (name === "price") {
      setEditProduct({ ...editProduct, [name]: Number(value) });
    } else {
      setEditProduct({ ...editProduct, [name]: value });
    }
  };

  const handleEditSave = () => {
    onEdit(editProduct);
    setEditOpen(false);
  };

  // Đơn giản hóa renderProductSpecifics để chỉ hiển thị thông tin có sẵn từ API
  const renderProductSpecifics = () => {
    return (
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <Chip
          label={product.categoryName || "Uncategorized"}
          size="small"
          color="primary"
        />
        <Chip
          icon={<Science />}
          label={product.status}
          size="small"
          color={product.status === "Active" ? "success" : "default"}
        />
      </Box>
    );
  };

  return (
    <>
      <Card
        onClick={handleCardClick}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s ease",
          borderRadius: 2,
          position: "relative",
          overflow: "visible",
          cursor: "pointer",
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: "0 12px 20px rgba(0,0,0,0.15)",
          },
        }}
        elevation={3}
      >
        {/* Status Chip */}
        <Chip
          label={product.status}
          size="small"
          color={product.status === "Active" ? "success" : "default"}
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 1,
            fontWeight: "bold",
          }}
        />

        {/* Product Image with gradient overlay */}
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            height="220"
            image={product.mainImage || "/placeholder-image.jpg"}
            alt={product.name}
            sx={{ objectFit: "cover" }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "40%",
              background:
                "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))",
              display: "flex",
              alignItems: "flex-end",
              p: 2,
            }}
          >
            <Chip
              label={product.categoryName || "Uncategorized"}
              size="small"
              color="primary"
              sx={{ fontWeight: "medium" }}
            />
          </Box>
        </Box>

        <CardContent
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            p: 3,
          }}
        >
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            sx={{
              height: "3em",
              overflow: "hidden",
              fontWeight: 600,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              textOverflow: "ellipsis",
            }}
          >
            {product.name}
          </Typography>

          <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
            {product.price.toLocaleString()} VND
          </Typography>

          {/* Stock Status */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={product.amount > 0 ? "Còn hàng" : "Hết hàng"}
              color={product.amount > 0 ? "success" : "error"}
              size="small"
              sx={{ fontWeight: "medium" }}
            />
            {product.amount > 0 && (
              <Typography variant="body2" color="text.secondary">
                {product.amount} sản phẩm
              </Typography>
            )}
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              height: "4.5em",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              textOverflow: "ellipsis",
              mb: 1,
            }}
          >
            {product.description || product.categoryName}
          </Typography>
        </CardContent>

        <CardActions
          sx={{
            flexDirection: "column",
            alignItems: "stretch",
            padding: 2,
            gap: 1.5,
            pt: 0,
          }}
        >
          <Button
            variant="contained"
            onClick={handleAddToCart}
            startIcon={<ShoppingCart />}
            size="large"
            disabled={product.amount <= 0}
            sx={{
              width: "100%",
              marginLeft: "0px !important",
              borderRadius: 1,
              fontWeight: "bold",
              boxShadow: 2,
              height: 48,
              "&:hover": {
                boxShadow: 4,
                transform: "scale(1.02)",
              },
              transition: "all 0.2s",
              ...(product.amount <= 0 && {
                bgcolor: "grey.300",
                color: "text.disabled",
                "&:hover": {
                  bgcolor: "grey.300",
                  transform: "none",
                  boxShadow: 2,
                },
              }),
            }}
          >
            {product.amount > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
          </Button>
        </CardActions>
      </Card>

      {/* Product Details Modal */}
      <Dialog
        open={detailsOpen}
        onClose={handleDetailsClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: theme.palette.primary.main,
            color: "white",
            fontWeight: "bold",
            fontSize: "1.25rem",
          }}
        >
          Chi tiết sản phẩm
          <IconButton onClick={handleDetailsClose} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {loadingDetails ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 400,
                flexDirection: "column",
                gap: 2,
              }}
            >
              <CircularProgress size={50} />
              <Typography variant="body1" color="text.secondary">
                Đang tải chi tiết sản phẩm...
              </Typography>
            </Box>
          ) : detailedProduct ? (
            <Grid container>
              {/* Image Section */}
              <Grid item xs={12} md={6}>
                <Box sx={{ position: "relative", height: "100%" }}>
                  {/* Main Image */}
                  <Box
                    component="img"
                    src={
                      detailedProduct.images &&
                      detailedProduct.images.length > 0
                        ? detailedProduct.images[selectedImageIndex]
                        : detailedProduct.mainImage
                    }
                    alt={detailedProduct.name}
                    sx={{
                      width: "100%",
                      height: { xs: 300, md: 400 },
                      objectFit: "cover",
                    }}
                  />

                  {/* Image Navigation */}
                  {detailedProduct.images &&
                    detailedProduct.images.length > 1 && (
                      <>
                        <IconButton
                          onClick={() => handleImageChange("prev")}
                          sx={{
                            position: "absolute",
                            left: 8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            bgcolor: alpha(theme.palette.common.black, 0.5),
                            color: "white",
                            "&:hover": {
                              bgcolor: alpha(theme.palette.common.black, 0.7),
                            },
                          }}
                        >
                          <ArrowBack />
                        </IconButton>
                        <IconButton
                          onClick={() => handleImageChange("next")}
                          sx={{
                            position: "absolute",
                            right: 8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            bgcolor: alpha(theme.palette.common.black, 0.5),
                            color: "white",
                            "&:hover": {
                              bgcolor: alpha(theme.palette.common.black, 0.7),
                            },
                          }}
                        >
                          <ArrowForward />
                        </IconButton>

                        {/* Image Indicators */}
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 16,
                            left: "50%",
                            transform: "translateX(-50%)",
                            display: "flex",
                            gap: 1,
                          }}
                        >
                          {detailedProduct.images.map((_, index) => (
                            <Box
                              key={index}
                              onClick={() => setSelectedImageIndex(index)}
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor:
                                  index === selectedImageIndex
                                    ? "white"
                                    : alpha(theme.palette.common.white, 0.5),
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                            />
                          ))}
                        </Box>
                      </>
                    )}
                </Box>
              </Grid>

              {/* Product Info Section */}
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 3, height: "100%" }}>
                  <Stack spacing={2} sx={{ height: "100%" }}>
                    {/* Product Name */}
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {detailedProduct.name}
                    </Typography>

                    {/* Category and Status */}
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Chip
                        label={detailedProduct.categoryName}
                        color="primary"
                        size="small"
                      />
                      <Chip
                        label={detailedProduct.status}
                        color={
                          detailedProduct.status === "Active"
                            ? "success"
                            : "default"
                        }
                        size="small"
                      />
                    </Box>

                    {/* Price */}
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {detailedProduct.price.toLocaleString()} VND
                    </Typography>

                    {/* Availability */}
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Số lượng có sẵn:
                      </Typography>
                      <Typography
                        variant="h6"
                        color={
                          detailedProduct.amount > 0
                            ? "success.main"
                            : "error.main"
                        }
                      >
                        {detailedProduct.amount > 0
                          ? `${detailedProduct.amount} sản phẩm`
                          : "Hết hàng"}
                      </Typography>
                    </Box>

                    <Divider />

                    {/* Description */}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom fontWeight="medium">
                        Mô tả sản phẩm
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.6,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {detailedProduct.description ||
                          "Không có mô tả chi tiết."}
                      </Typography>
                    </Box>

                    <Divider />

                    {/* Add to Cart Button */}
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<ShoppingCart />}
                      onClick={() => {
                        handleAddToCart();
                        handleDetailsClose();
                      }}
                      disabled={detailedProduct.amount <= 0}
                      sx={{
                        py: 1.5,
                        fontSize: "1.1rem",
                        fontWeight: "bold",
                        borderRadius: 2,
                      }}
                    >
                      {detailedProduct.amount > 0
                        ? "Thêm vào giỏ hàng"
                        : "Hết hàng"}
                    </Button>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 400,
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Typography variant="h6" color="error">
                Không thể tải thông tin sản phẩm
              </Typography>
              <Button variant="outlined" onClick={handleDetailsClose}>
                Đóng
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            name="name"
            value={editProduct.name}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Price"
            name="price"
            type="number"
            value={editProduct.price}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Description"
            name="description"
            value={(editProduct as any).description || ""}
            onChange={handleEditChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleEditSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductCard;
