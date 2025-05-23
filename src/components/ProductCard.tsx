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
} from "@mui/material";
import { ShoppingCart, Info, Edit, Science } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { Product } from "../types/types";

interface Props {
  product: Product;
  onAddToCart: (product: Product) => void;
  onEdit: (product: Product) => void;
}

const ProductCard: React.FC<Props> = ({
  product,
  onAddToCart,
  onEdit,
}) => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [editOpen, setEditOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(product);

  const handleAddToCart = () => {
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
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s ease",
          borderRadius: 2,
          position: "relative",
          overflow: "visible",
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
            }}
          >
            Thêm vào giỏ hàng
          </Button>
        </CardActions>
      </Card>
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
