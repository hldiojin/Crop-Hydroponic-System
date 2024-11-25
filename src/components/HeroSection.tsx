// src/components/HeroSection.tsx
import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <Box sx={{ backgroundColor: '#2e7d32', color: 'white', py: 8, textAlign: 'center' }}>
      <Container>
        <Typography variant="h2" gutterBottom>
          Welcome to HydroPonic Garden
        </Typography>
        <Typography variant="h5" gutterBottom>
          Discover the best hydroponic systems and supplies
        </Typography>
        <Button variant="contained" color="secondary" component={Link} to="/plants" sx={{ mt: 3 }}>
          Shop Now
        </Button>
      </Container>
    </Box>
  );
};

export default HeroSection;