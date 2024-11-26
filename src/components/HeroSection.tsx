// src/components/HeroSection.tsx
import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { keyframes } from '@mui/system';
import { styled } from '@mui/material/styles';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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

const HeroBox = styled(Box)({
  position: 'relative',
  height: '80vh',
  overflow: 'hidden',
});

const CarouselOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 2,
});

const AnimatedTypography = styled(Typography)`
  animation: ${fadeIn} 1s ease-out;
`;

const HeroContent = styled(Container)`
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  height: 80vh;
  justify-content: center;
`;

const StyledSlider = styled(Slider)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  .slick-slide div {
    height: 80vh;
  }

  .slick-dots {
    bottom: 20px;
    z-index: 3;
    
    li button:before {
      color: white;
    }
    
    li.slick-active button:before {
      color: white;
    }
  }
`;

const CarouselImage = styled('div')<{ image: string }>`
  height: 100%;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
`;

const HeroSection: React.FC = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
  };

  const carouselImages = [
    'https://i.pinimg.com/originals/74/6b/27/746b27c541347a6d4b62be2f8f735115.jpg',  // Add your image paths here
    'https://i.pinimg.com/originals/1a/8e/e2/1a8ee26f35f8d29477c28d4431a9bfbf.jpg',
    'https://png.pngtree.com/background/20230401/original/pngtree-the-highlands-are-dense-with-forests-and-mountains-picture-image_2250103.jpg',
  ];

  return (
    <HeroBox>
      <StyledSlider {...settings}>
        {carouselImages.map((image, index) => (
          <CarouselImage key={index} image={image} />
        ))}
      </StyledSlider>
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
            color: 'white',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
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