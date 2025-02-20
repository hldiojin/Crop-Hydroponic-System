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
import { products as allProducts } from '../data/products';

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
  const { product } = location.state as LocationState;
  const [verified, setVerified] = useState(false);
  const [formData, setFormData] = useState<CheckoutForm>({
    fullName: '',
    quantity: '',
    phone: '',
    address: '',
    notes: ''
  });

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
  };

 const recommendedProducts = allProducts
    .filter(p => p.id !== product.id)
    .map(p => ({
      ...p,
      typeLabel: p.type === 'system' ? 'System' : p.type === 'plant' ? 'Plant' : 'Nutrient'
    }));

  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
              You May Also Like
            </Typography>
            <Stack spacing={3}>
              {recommendedProducts.map((prod) => (
                <Card key={prod.id} sx={{ display: 'flex', mb: 2 }}>
                  <CardActionArea sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CardMedia
                      component="img"
                      sx={{ width: 100, height: 100, objectFit: 'cover' }}
                      image={prod.image}
                      alt={prod.name}
                    />
                    <CardContent sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" component="div">
                        {prod.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${prod.price}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Stack>
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
                {product.name} - ${product.price}
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
                  <Button variant="outlined" onClick={handleCancel} sx={{ borderColor: '#4caf50', color: '#4caf50', '&:hover': { borderColor: '#45a049', backgroundColor: 'rgba(76, 175, 80, 0.04)' } }}>Cancel</Button>
                  <Button type="submit" variant="contained" disabled={!verified} sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' }, '&.Mui-disabled': { backgroundColor: '#cccccc' } }}>Continue</Button>
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
