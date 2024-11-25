// src/components/HeroSection.tsx
import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { keyframes } from '@mui/system';
import { styled } from '@mui/material/styles';

// Create animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

// Styled components
const HeroBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, #8B4513 0%, #A0522D 100%)`, // Brown background
  color: 'white',
  padding: '120px 0',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("/images/hero-pattern.png")', // Add a subtle pattern
    opacity: 0.1,
    zIndex: 1,
  },
}));

const AnimatedTypography = styled(Typography)`
  animation: ${fadeIn} 1s ease-out;
`;

const StyledButton = styled(Button)`
  animation: ${fadeIn} 1s ease-out 0.5s backwards;
  padding: 12px 36px;
  font-size: 1.1rem;
  text-transform: none;
  border-radius: 30px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  color: #8B4513;

  &:hover {
    background: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }
`;

const HeroContent = styled(Container)`
  position: relative;
  z-index: 2;
`;

const HeroSection: React.FC = () => {
  return (
    <HeroBox>
      <HeroContent>
        <AnimatedTypography
          variant="h1"
          gutterBottom
          sx={{
            fontSize: { xs: '2.5rem', md: '4rem' },
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            marginBottom: 4,
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            color: '#4caf50', // Green text
          }}
        >
          Welcome to{' '}
          <Box
            component="span"
            sx={{
              color: '#4caf50', // Green text
              animation: `${pulse} 2s infinite ease-in-out`,
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
            color: 'white', // White text
          }}
        >
          Discover the future of sustainable growing with our innovative hydroponic systems and supplies
        </AnimatedTypography>

        <Button
          variant="contained"
          component={Link}
          to="/plants"
          sx={{
            animation: `${fadeIn} 1s ease-out 0.5s backwards`,
            padding: '12px 36px',
            fontSize: '1.1rem',
            textTransform: 'none',
            borderRadius: '30px',
            transition: 'all 0.3s ease',
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#8B4513',
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