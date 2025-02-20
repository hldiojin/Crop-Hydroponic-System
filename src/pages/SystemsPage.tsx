import React from 'react';
import { Container, Typography, Box, Button, Grid, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ArrowForward } from '@mui/icons-material';
import { Product } from '../types/types'; // Add this import
import { useNavigate } from 'react-router-dom';
import { WaterDrop, Timer, Science, Speed, PowerSettingsNew, } from '@mui/icons-material';


interface SystemsPageProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onEdit: (product: Product) => void;
  onFavorite: (product: Product) => void;
  favorites: number[];
}

const HeroContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: '#fff',
  color: '#FFF',
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

const SystemsPage: React.FC<SystemsPageProps> = ({ 
  products, 
  onAddToCart, 
  onEdit, 
  onFavorite, 
  favorites 
}) => {
  const navigate = useNavigate();
  const featuredSystem = products[0];

  const handleBuyNow = () => {
    navigate('/checkout', { state: { product: featuredSystem } });
  };

  return (
    <Box sx={{ background: '#ffffff' }}>
      {/* Hero Section */}
      <HeroContainer>
        <ContentWrapper>
          <Typography
            variant="overline"
            sx={{
              fontSize: '1.2rem',
              letterSpacing: '0.2em',
              mb: 2,
              display: 'block',
              color: '#86868b',
            }}
          >
            New
          </Typography>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '40px', md: '56px' },
              fontWeight: 600,
              mb: 2,
            }}
          >
            {featuredSystem?.name || 'HydroSmart Pro'}
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '24px', md: '32px' },
              fontWeight: 400,
              color: '#86868b',
              mb: 4,
            }}
          >
            Intelligence meets nature.
          </Typography>
          <Box sx={{ mb: 4 }}>
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
          </Box>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 8 }}>
            <Button
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
            >
              Buy Now
            </Button>
            <Button
              endIcon={<ArrowForward />}
              sx={{
                color: '#4caf50',
                '&:hover': {
                  color: '#45a049',
                },
              }}
            >
              Learn more
            </Button>
          </Box>
        </ContentWrapper>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '60vh',
            overflow: 'hidden',
          }}
        >
          <ProductImage
            src={featuredSystem?.image || ""}
            alt={featuredSystem?.name || "HydroSmart Pro System"}
          />
        </Box>
      </HeroContainer>

      {/* Features Section */}
      <FeatureSection>
        <Container maxWidth="lg">
          <Grid container spacing={8}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                  Smart Monitoring
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.2rem', color: '#86868b', lineHeight: 1.8 }}>
                  Advanced sensors and AI technology monitor your plants 24/7, ensuring optimal growing conditions at all times.
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <WaterDrop sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>Water Control</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Precise water management system
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Timer sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>Growth Tracking</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Real-time growth monitoring
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src={featuredSystem?.image || "https://example.com/feature-image.jpg"}
                sx={{
                  width: '100%',
                  borderRadius: '20px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </FeatureSection>

      {/* Technical Specs Section */}
      <FeatureSection>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom sx={{ mb: 8 }}>
            Technical Specifications
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Speed sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
                <Typography variant="h6" gutterBottom>Processing Power</Typography>
                <Typography variant="body2" color="text.secondary">
                  Dual-core processor for real-time monitoring
                </Typography>
              </Box>
            </Grid>
            {}
          </Grid>
        </Container>
      </FeatureSection>

      {}
      <FeatureSection>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom sx={{ mb: 8 }}>
            Environmental Impact
          </Typography>
          {}
        </Container>
      </FeatureSection>
    </Box>
  );
};

export default SystemsPage;