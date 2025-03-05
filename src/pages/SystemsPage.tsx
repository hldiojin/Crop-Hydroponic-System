import React, { useEffect } from 'react';
import { Container, Typography, Box, Button, Grid, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ArrowForward } from '@mui/icons-material';
import { Product } from '../types/types';
import { useNavigate } from 'react-router-dom';
import { WaterDrop, Timer, Science, Speed, PowerSettingsNew } from '@mui/icons-material';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Define styled components first
const HeroContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: '#fff',
  color: '#000',
  position: 'relative',
  overflow: 'hidden',
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  padding: theme.spacing(4),
  textAlign: 'center',
  maxWidth: '800px',
  margin: '0 auto',
}));

const FeatureSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(15, 0),
  backgroundColor: '#fff',
  borderBottom: '1px solid #e5e5e5',
}));

const ProductImage = styled('img')({
  width: '100%',
  maxWidth: '1200px',
  height: 'auto',
  margin: '0 auto',
  display: 'block',
  transform: 'scale(1.1)',
  transition: 'transform 1s ease-in-out',
});

// Wrap MUI components with motion
const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionButton = motion(Button);
const MotionProductImage = motion(ProductImage);
const MotionGrid = motion(Grid);

// For ContentWrapper with motion
const MotionContentWrapper = motion(ContentWrapper);

interface SystemsPageProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onEdit: (product: Product) => void;
  onFavorite: (product: Product) => void;
  favorites: number[];
}

const SystemsPage: React.FC<SystemsPageProps> = ({
  products,
  onAddToCart,
  onEdit,
  onFavorite,
  favorites
}) => {
  const navigate = useNavigate();
  const featuredSystem = products[0];

  // Animation controls for different sections
  const heroControls = useAnimation();
  const featureControls = useAnimation();
  const techSpecsControls = useAnimation();
  const environmentalControls = useAnimation();
  
  // Set up intersection observers for different sections
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [featureRef, featureInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [techSpecsRef, techSpecsInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [environmentalRef, environmentalInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  // Trigger animations when sections come into view
  useEffect(() => {
    if (heroInView) {
      heroControls.start('visible');
    }
    if (featureInView) {
      featureControls.start('visible');
    }
    if (techSpecsInView) {
      techSpecsControls.start('visible');
    }
    if (environmentalInView) {
      environmentalControls.start('visible');
    }
  }, [heroInView, featureInView, techSpecsInView, environmentalInView, 
      heroControls, featureControls, techSpecsControls, environmentalControls]);

  const handleBuyNow = () => {
    navigate('/checkout', { state: { product: featuredSystem } });
  };

  // Shared animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { 
        duration: 0.6, 
        ease: [0.215, 0.61, 0.355, 1] 
      } 
    }
  };

  const slideInFromLeft = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }
  };

  const slideInFromRight = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }
  };

  return (
    <Box sx={{ background: '#ffffff' }}>
      {/* Hero Section with animations */}
      <HeroContainer ref={heroRef}>
        <MotionBox
          sx={{
            position: 'relative',
            zIndex: 2,
            padding: 4,
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto',
          }}
          variants={staggerChildren}
          initial="hidden"
          animate={heroControls}
        >
          <MotionTypography
            variant="overline"
            sx={{
              fontSize: '1.2rem',
              letterSpacing: '0.2em',
              mb: 2,
              display: 'block',
              color: '#86868b',
            }}
            variants={fadeInUp}
          >
            New
          </MotionTypography>
          <MotionTypography
            variant="h1"
            sx={{
              fontSize: { xs: '40px', md: '56px' },
              fontWeight: 600,
              mb: 2,
            }}
            variants={fadeInUp}
          >
            {featuredSystem?.name || 'HydroSmart Pro'}
          </MotionTypography>
          <MotionTypography
            variant="h2"
            sx={{
              fontSize: { xs: '24px', md: '32px' },
              fontWeight: 400,
              color: '#86868b',
              mb: 4,
            }}
            variants={fadeInUp}
          >
            Intelligence meets nature.
          </MotionTypography>
          <MotionBox sx={{ mb: 4 }} variants={fadeInUp}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '40px', md: '56px' },
                fontWeight: 600,
                color: '#4caf50',
              }}
            >
              ${featuredSystem?.price || '999'}
            </Typography>
          </MotionBox>
          <MotionBox 
            sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 8 }}
            variants={fadeInUp}
          >
            <MotionButton
              variant="contained"
              size="large"
              onClick={handleBuyNow}
              sx={{
                borderRadius: '30px',
                padding: '12px 32px',
                fontSize: '1.1rem',
                backgroundColor: '#4caf50',
                '&:hover': {
                  backgroundColor: '#45a049',
                },
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Buy Now
            </MotionButton>
            <MotionButton
              endIcon={<ArrowForward />}
              sx={{
                color: '#4caf50',
                '&:hover': {
                  color: '#45a049',
                },
              }}
              whileHover={{ x: 5 }}
            >
              Learn more
            </MotionButton>
          </MotionBox>
        </MotionBox>
        <MotionBox
          sx={{
            position: 'relative',
            width: '100%',
            height: '60vh',
            overflow: 'hidden',
          }}
          variants={scaleIn}
          initial="hidden"
          animate={heroControls}
        >
          <MotionProductImage
            src={featuredSystem?.image || ""}
            alt={featuredSystem?.name || "HydroSmart Pro System"}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
          />
        </MotionBox>
      </HeroContainer>

      {/* Features Section with animations */}
      <FeatureSection ref={featureRef}>
        <Container maxWidth="lg">
          <MotionGrid 
            container 
            spacing={8}
            variants={staggerChildren}
            initial="hidden"
            animate={featureControls}
          >
            <MotionGrid 
              item 
              xs={12} 
              md={6}
              variants={slideInFromLeft}
            >
              <Box sx={{ mb: 4 }}>
                <MotionTypography 
                  variant="h4" 
                  gutterBottom 
                  sx={{ fontWeight: 600 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  Smart Monitoring
                </MotionTypography>
                <MotionTypography 
                  variant="body1" 
                  sx={{ fontSize: '1.2rem', color: '#86868b', lineHeight: 1.8 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  Advanced sensors and AI technology monitor your plants 24/7, ensuring optimal growing conditions at all times.
                </MotionTypography>
              </Box>
              <MotionGrid 
                container 
                spacing={3}
                variants={staggerChildren}
                initial="hidden"
                animate={featureControls}
              >
                <MotionGrid 
                  item 
                  xs={6}
                  variants={fadeInUp}
                >
                  <MotionBox
                    whileHover={{ scale: 1.1, color: '#45a049' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    <WaterDrop sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                    <Typography variant="h6" gutterBottom>Water Control</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Precise water management system
                    </Typography>
                  </MotionBox>
                </MotionGrid>
                <MotionGrid 
                  item 
                  xs={6}
                  variants={fadeInUp}
                >
                  <MotionBox
                    whileHover={{ scale: 1.1, color: '#45a049' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    <Timer sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                    <Typography variant="h6" gutterBottom>Growth Tracking</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Real-time growth monitoring
                    </Typography>
                  </MotionBox>
                </MotionGrid>
              </MotionGrid>
            </MotionGrid>
            <MotionGrid 
              item 
              xs={12} 
              md={6}
              variants={slideInFromRight}
            >
              <MotionBox
                sx={{
                  width: '100%',
                  borderRadius: '20px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  overflow: 'hidden'
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
                }}
                transition={{ duration: 0.5 }}
              >
                <img 
                  src={featuredSystem?.image || "https://example.com/feature-image.jpg"}
                  alt="Feature"
                  style={{ width: '100%', display: 'block' }}
                />
              </MotionBox>
            </MotionGrid>
          </MotionGrid>
        </Container>
      </FeatureSection>

      {/* Technical Specs Section with animations */}
      <FeatureSection ref={techSpecsRef}>
        <Container maxWidth="lg">
          <MotionTypography 
            variant="h3" 
            align="center" 
            gutterBottom 
            sx={{ mb: 8 }}
            variants={fadeInUp}
            initial="hidden"
            animate={techSpecsControls}
          >
            Technical Specifications
          </MotionTypography>
          <MotionGrid 
            container 
            spacing={4}
            variants={staggerChildren}
            initial="hidden"
            animate={techSpecsControls}
          >
            <MotionGrid 
              item 
              xs={12} 
              md={4}
              variants={scaleIn}
            >
              <MotionBox 
                textAlign="center"
                whileHover={{ y: -10 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Speed sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
                <Typography variant="h6" gutterBottom>Processing Power</Typography>
                <Typography variant="body2" color="text.secondary">
                  Dual-core processor for real-time monitoring
                </Typography>
              </MotionBox>
            </MotionGrid>
            <MotionGrid 
              item 
              xs={12} 
              md={4}
              variants={scaleIn}
            >
              <MotionBox 
                textAlign="center"
                whileHover={{ y: -10 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <PowerSettingsNew sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
                <Typography variant="h6" gutterBottom>Power Efficiency</Typography>
                <Typography variant="body2" color="text.secondary">
                  Low energy consumption with solar backup option
                </Typography>
              </MotionBox>
            </MotionGrid>
            <MotionGrid 
              item 
              xs={12} 
              md={4}
              variants={scaleIn}
            >
              <MotionBox 
                textAlign="center"
                whileHover={{ y: -10 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Science sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
                <Typography variant="h6" gutterBottom>Advanced Sensors</Typography>
                <Typography variant="body2" color="text.secondary">
                  Multi-parameter sensing for optimal growth conditions
                </Typography>
              </MotionBox>
            </MotionGrid>
          </MotionGrid>
        </Container>
      </FeatureSection>

      {/* Environmental Impact Section with animations */}
      <FeatureSection ref={environmentalRef}>
        <Container maxWidth="lg">
          <MotionTypography 
            variant="h3" 
            align="center" 
            gutterBottom 
            sx={{ mb: 8 }}
            variants={fadeInUp}
            initial="hidden"
            animate={environmentalControls}
          >
            Environmental Impact
          </MotionTypography>
          <MotionGrid 
            container 
            spacing={4}
            justifyContent="center"
            variants={staggerChildren}
            initial="hidden"
            animate={environmentalControls}
          >
            <MotionGrid 
              item 
              xs={12} 
              md={4}
              variants={fadeInUp}
            >
              <MotionBox 
                textAlign="center"
                p={3}
                sx={{ 
                  backgroundColor: 'rgba(76, 175, 80, 0.1)', 
                  borderRadius: '16px',
                  height: '100%'
                }}
                whileHover={{ 
                  backgroundColor: 'rgba(76, 175, 80, 0.2)',
                  boxShadow: '0 10px 30px rgba(76, 175, 80, 0.2)'
                }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#4caf50' }}>
                  90% Less Water
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Our hydroponic systems use up to 90% less water than traditional farming methods,
                  making them ideal for sustainable agriculture.
                </Typography>
              </MotionBox>
            </MotionGrid>
            <MotionGrid 
              item 
              xs={12} 
              md={4}
              variants={fadeInUp}
            >
              <MotionBox 
                textAlign="center"
                p={3}
                sx={{ 
                  backgroundColor: 'rgba(76, 175, 80, 0.1)', 
                  borderRadius: '16px',
                  height: '100%'
                }}
                whileHover={{ 
                  backgroundColor: 'rgba(76, 175, 80, 0.2)',
                  boxShadow: '0 10px 30px rgba(76, 175, 80, 0.2)'
                }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#4caf50' }}>
                  Energy Efficient
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Designed with energy efficiency in mind, our systems can run on renewable energy 
                  sources like solar power for minimal environmental impact.
                </Typography>
              </MotionBox>
            </MotionGrid>
          </MotionGrid>
        </Container>
      </FeatureSection>
      
      {/* Call to Action with animation */}
      <Box py={10} textAlign="center">
        <MotionBox
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Typography variant="h3" gutterBottom>
            Ready to revolutionize your growing experience?
          </Typography>
          <MotionButton
            variant="contained"
            size="large"
            onClick={handleBuyNow}
            sx={{
              mt: 4,
              borderRadius: '30px',
              padding: '12px 36px',
              fontSize: '1.2rem',
              backgroundColor: '#4caf50',
              '&:hover': {
                backgroundColor: '#45a049',
              },
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Now
          </MotionButton>
        </MotionBox>
      </Box>
    </Box>
  );
};

export default SystemsPage;