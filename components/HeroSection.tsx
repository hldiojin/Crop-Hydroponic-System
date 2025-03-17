'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';
import { styled } from '@mui/material/styles';

const HeroBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '80vh',
  overflow: 'hidden',
}));

const CarouselOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 2,
}));

const BackgroundImage = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  transition: 'opacity 1s ease-in-out',
  zIndex: 1,
}));

const carouselImages = [
  'https://i.pinimg.com/originals/74/6b/27/746b27c541347a6d4b62be2f8f735115.jpg',  
  'https://i.pinimg.com/originals/1a/8e/e2/1a8ee26f35f8d29477c28d4431a9bfbf.jpg',
  'https://png.pngtree.com/background/20230401/original/pngtree-the-highlands-are-dense-with-forests-and-mountains-picture-image_2250103.jpg',
];

const AnimatedTypography = styled(Typography)(({ theme }) => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
      transform: 'translateY(20px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  animation: 'fadeIn 1s ease-out',
}));

const HeroContent = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 3,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  height: '80vh',
  justifyContent: 'center',
}));

const HeroSection: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
    }, 5000); // Change image every 5 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <HeroBox>
      {carouselImages.map((image, index) => (
        <BackgroundImage
          key={index}
          sx={{
            backgroundImage: `url(${image})`,
            opacity: index === currentImageIndex ? 1 : 0,
          }}
        />
      ))}
      <CarouselOverlay />
      <HeroContent>
        <AnimatedTypography
          variant="h1"
          gutterBottom
          sx={{
            fontSize: { xs: '3.5rem', md: '6rem' },
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            marginBottom: 4,
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            color: 'white',
          }}
        >
          Welcome to{' '}
          <Box
            component="span"
            sx={{
              color: '#4caf50',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' },
                '100%': { transform: 'scale(1)' },
              },
              animation: 'pulse 2s infinite ease-in-out',
              display: 'inline-block',
            }}
          >
            HydroPonic Garden
          </Box>
        </AnimatedTypography>

        <AnimatedTypography
          variant="h5"
          sx={{
            fontWeight: 300,
            marginBottom: 6,
            opacity: 0.9,
            maxWidth: '800px',
            margin: '0 auto 40px',
            lineHeight: 1.6,
            color: 'white',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
          }}
        >
          Discover the future of sustainable growing with our innovative hydroponic systems and supplies
        </AnimatedTypography>

        <Button
          variant="contained"
          component={Link}
          href="/systems"
          sx={{
            '@keyframes fadeIn': {
              from: {
                opacity: 0,
                transform: 'translateY(20px)',
              },
              to: {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
            animation: 'fadeIn 1s ease-out 0.5s backwards',
            padding: '12px 36px',
            fontSize: '1.1rem',
            textTransform: 'none',
            borderRadius: '30px',
            transition: 'all 0.3s ease',
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#2e7d32',
            '&:hover': {
              background: 'white',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
            },
          }}
        >
          Explore Our Products
        </Button>
      </HeroContent>
    </HeroBox>
  );
};

export default HeroSection;