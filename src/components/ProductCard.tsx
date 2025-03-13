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
  WaterDrop,
  Timer,
  Science,
  ShoppingCart,
  Info,
  Memory,
  Power,
  Edit,
  Star
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types/types';

interface Props {
  product: Product;
  onAddToCart: (product: Product) => void;
  onEdit: (product: Product) => void;
  onFavorite: (product: Product) => void;
  favorites: number[];
}

const ProductCard: React.FC<Props> = ({ product, onAddToCart, onEdit, onFavorite, favorites }) => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isFavorite, setIsFavorite] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(product);

  useEffect(() => {
    setIsFavorite(favorites.includes(product.id));
  }, [favorites, product.id]);

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      // navigate('/login', {
      //   state: {
      //     from: location,
      //     action: 'favorite',
      //     productId: product.id
      //   }
      // });
      // return;
      return logout();
    }
    onFavorite(product);
  };

  const handleEditOpen = () => {
    if (!isAuthenticated) {
      // navigate('/login', {
      //   state: {
      //     from: location,
      //     action: 'edit',
      //     productId: product.id
      //   }
      // });
      // return;
      return logout();
    }
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditProduct({ ...editProduct, [e.target.name]: e.target.value });
  };

  const handleEditSave = () => {
    onEdit(editProduct);
    setEditOpen(false);
  };

  const renderProductSpecifics = () => {
    switch (product.type) {
      case 'plant':
        return (
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip icon={<Timer />} label={product.growthTime} size="small" color="primary" />
            <Chip icon={<WaterDrop />} label={`pH ${product.phRange}`} size="small" color="secondary" />
            <Chip
              icon={<Science />}
              label={product.difficulty}
              size="small"
              color={product.difficulty === 'Easy' ? 'success' : 'warning'}
            />
          </Box>
        );
      case 'system':
        return (
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip icon={<Memory />} label={product.capacity} size="small" color="primary" />
            <Chip icon={<Power />} label={product.powerConsumption} size="small" color="secondary" />
          </Box>
        );
      case 'nutrient':
        return (
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip icon={<Science />} label={product.usage} size="small" color="primary" />
            <Chip icon={<Science />} label={product.concentration} size="small" color="secondary" />
          </Box>
        );
    }
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
          image={product.image}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography gutterBottom variant="h6" component="div" sx={{ height: '3em', overflow: 'hidden' }}>
            {product.name}
          </Typography>
          {'scientificName' in product && (
            <Typography variant="body2" color="text.secondary" sx={{ height: '1.5em', overflow: 'hidden' }}>
              {product.scientificName}
            </Typography>
          )}
          <Typography variant="h6" color="primary">
            ${product.price}
          </Typography>
          {renderProductSpecifics()}
          <Typography variant="body2" color="text.secondary" sx={{ height: '4.5em', overflow: 'hidden' }}>
            {product.description}
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
            value={editProduct.price}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Description"
            name="description"
            value={editProduct.description}
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