import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Inventory } from '@mui/icons-material';

const NoProductsFound: React.FC = () => {
  return (
    <Paper 
      elevation={1}
      sx={{ 
        p: 4, 
        textAlign: 'center',
        my: 4,
        mx: 'auto',
        maxWidth: '600px'
      }}
    >
      <Inventory sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h5" component="h2" gutterBottom>
        No Products Available
      </Typography>
      <Typography variant="body1" color="text.secondary">
        There are currently no products to display. Please check back later.
      </Typography>
    </Paper>
  );
};

export default NoProductsFound;