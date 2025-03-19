import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Checkbox,
  FormControlLabel,
  Paper,
  Stack,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActionArea
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Product } from '../types/types';
import productService from '../services/productService';

interface LocationState {
  product: Product;
}

interface CheckoutForm {
  fullName: string;
  quantity: string;
  phone: string;
  address: string;
  notes: string;
}

const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Kiểm tra và lấy product từ location state
  const product = location.state && (location.state as LocationState).product 
    ? (location.state as LocationState).product 
    : null;
    
  const [verified, setVerified] = useState(false);
  const [formData, setFormData] = useState<CheckoutForm>({
    fullName: '',
    quantity: '',
    phone: '',
    address: '',
    notes: ''
  });

  // Fetch recommended products when component mounts
  React.useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        const products = await productService.getAll();
        // Filter out current product and limit to 3 items
        const filtered = product 
          ? products.filter(p => p.id !== product.id).slice(0, 3)
          : products.slice(0, 3);
        setRecommendedProducts(filtered);
      } catch (error) {
        console.error("Error fetching recommended products:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendedProducts();
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verified) return;
    console.log('Form submitted:', formData);
    // Add API call for checkout here
  };

  if (!product) {
    return (
      <Container sx={{ marginTop: '100px', textAlign: 'center' }}>
        <Typography variant="h5">
          No product selected for checkout. Please select a product first.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Return to Shop
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 8, marginTop: '80px' }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
              You May Also Like
            </Typography>
            {loading ? (
              <Typography>Loading recommendations...</Typography>
            ) : (
              <Stack spacing={3}>
                {recommendedProducts.map((prod) => (
                  <Card key={prod.id} sx={{ display: 'flex', mb: 2 }}>
                    <CardActionArea 
                      sx={{ display: 'flex', alignItems: 'flex-start' }}
                      onClick={() => navigate(`/product/${prod.id}`)}
                    >
                      <CardMedia
                        component="img"
                        sx={{ width: 100, height: 100, objectFit: 'cover' }}
                        image={prod.mainImage || '/placeholder-image.jpg'}
                        alt={prod.name}
                      />
                      <CardContent sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" component="div">
                          {prod.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ${prod.price.toLocaleString()}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
              Checkout
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Selected Product
              </Typography>
              <Typography variant="body1">
                {product.name} - ${product.price.toLocaleString()}
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField required fullWidth label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} />
                <TextField required fullWidth label="Quantity" name="quantity" type="number" value={formData.quantity} onChange={handleChange} />
                <TextField required fullWidth label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
                <TextField required fullWidth label="Address" name="address" multiline rows={3} value={formData.address} onChange={handleChange} />
                <TextField fullWidth label="Notes" name="notes" multiline rows={4} value={formData.notes} onChange={handleChange} />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={verified}
                      onChange={(e) => setVerified(e.target.checked)}
                      sx={{ color: '#4caf50', '&.Mui-checked': { color: '#4caf50' } }}
                    />
                  }
                  label="I verify that my information is correct"
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button variant="outlined" onClick={handleCancel}>Cancel</Button>
                  <Button type="submit" variant="contained" disabled={!verified}>Continue</Button>
                </Box>
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage;
