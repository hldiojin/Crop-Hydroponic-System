import React from 'react';
import { Container, Typography, Box, Link } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box sx={{ backgroundColor: '#2e7d32', color: 'white', py: 4, mt: 8 }}>
      <Container>
        <Typography variant="body1" align="center">
          &copy; {new Date().getFullYear()} HydroPonic Garden. All rights reserved.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Link href="#" color="inherit" sx={{ mx: 2 }}>
            Privacy Policy
          </Link>
          <Link href="#" color="inherit" sx={{ mx: 2 }}>
            Terms of Service
          </Link>
          <Link href="#" color="inherit" sx={{ mx: 2 }}>
            Contact Us
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;