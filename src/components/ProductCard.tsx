import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  TextField
} from '@mui/material';
import { 
  ShoppingCart, 
  Info, 
  Edit, 
  Star,
  Science
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types/types';

interface Props {
  product: Product;
  onAddToCart: (product: Product) => void;
  onEdit: (product: Product) => void;
  onFavorite: (product: Product) => void;
  favorites: string[]; 
}

const ProductCard: React.FC<Props> = ({ product, onAddToCart, onEdit, onFavorite, favorites }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isFavorite, setIsFavorite] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(product);

  useEffect(() => {
    // Không cần convert vì id và favorites đều là string
    setIsFavorite(favorites.includes(product.id));
  }, [favorites, product.id]);

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: location,
          action: 'favorite',
          productId: product.id 
        } 
      });
      return;
    }
    onFavorite(product);
  };

  const handleEditOpen = () => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: location,
          action: 'edit',
          productId: product.id 
        } 
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
    if (name === 'price') {
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
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Chip 
          label={product.categoryName || 'Uncategorized'} 
          size="small" 
          color="primary" 
        />
        <Chip 
          icon={<Science />}
          label={product.status} 
          size="small" 
          color={product.status === 'Active' ? 'success' : 'default'} 
        />
      </Box>
    );
  };

  return (
    <>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
          }
        }} 
        elevation={6}
      >
        <CardMedia
          component="img"
          height="200"
          image={product.mainImage || '/placeholder-image.jpg'}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography gutterBottom variant="h6" component="div" sx={{ height: '3em', overflow: 'hidden' }}>
            {product.name}
          </Typography>
          <Typography variant="h6" color="primary">
            ${product.price.toLocaleString()}
          </Typography>
          {renderProductSpecifics()}
          <Typography variant="body2" color="text.secondary" sx={{ height: '4.5em', overflow: 'hidden' }}>
            {product.description || product.categoryName}
          </Typography>
        </CardContent>
        <CardActions sx={{ flexDirection: 'column', alignItems: 'stretch', padding: 2, gap: 1.5 }}>
          <Box sx={{ display: 'flex', width: '100%', gap: 1 }}>
            <Button 
              variant="outlined" 
              startIcon={<Info />} 
              component={Link} 
              to={`/product/${product.id}`}
              size="small"
              sx={{ flex: 1, height: 40 }}
            >
              Details
            </Button>
            <Button 
              variant="outlined"
              startIcon={<Edit />}
              onClick={handleEditOpen}
              size="small"
              sx={{ flex: 1, height: 40 }}
            >
              Edit
            </Button>
          </Box>
          <Button 
            variant="contained"
            onClick={() => onAddToCart(product)}
            startIcon={<ShoppingCart />}
            size="large"
            sx={{ width: '100%', marginLeft: '0px !important' }}
          >
            Add to Cart
          </Button>
          <Tooltip title="Favorite">
            <IconButton 
              color={isFavorite ? "secondary" : "default"} 
              onClick={handleFavoriteClick}
              sx={{ alignSelf: 'center' }}
            >
              <Star />
            </IconButton>
          </Tooltip>
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
            value={(editProduct as any).description || ''}
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