import React from "react";
import { Container, Typography, Box, Paper, Divider, Grid, Card, CardContent, alpha, useTheme } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const ContactPage: React.FC = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ py: 5, flex: 1 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, md: 5 }, 
            borderRadius: 3,
            background: `linear-gradient(to bottom right, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.background.paper, 1)})`,
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              color: "#2e7d32", 
              fontWeight: 700,
              textAlign: "center",
              mb: 2
            }}
          >
            Liên hệ chúng tôi
          </Typography>
          
          <Typography 
            variant="subtitle1"
            sx={{ 
              textAlign: "center", 
              mb: 4,
              color: "text.secondary"
            }}
          >
            Chúng tôi luôn sẵn sàng hỗ trợ bạn với mọi thắc mắc
          </Typography>
          
          <Divider sx={{ mb: 5 }} />

          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                height: '100%', 
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom sx={{ color: "#2e7d32", fontWeight: 600, mb: 3 }}>
                    Thông tin liên hệ
                  </Typography>
                  
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <LocationOnIcon sx={{ color: "#2e7d32", mr: 2, fontSize: 28 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">Địa chỉ</Typography>
                      <Typography color="text.secondary">
                        117 Xô Viết Nghệ Tĩnh, Phường 17, Quận Bình Thạnh, Tp. Hồ Chí Minh
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <EmailIcon sx={{ color: "#2e7d32", mr: 2, fontSize: 28 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">Email</Typography>
                      <Typography color="text.secondary">contact@hmes.com</Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <PhoneIcon sx={{ color: "#2e7d32", mr: 2, fontSize: 28 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">Điện thoại</Typography>
                      <Typography color="text.secondary">+84 28 1234 5678</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ 
                height: '100%', 
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom sx={{ color: "#2e7d32", fontWeight: 600, mb: 3 }}>
                    Giờ làm việc
                  </Typography>
                  
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <AccessTimeIcon sx={{ color: "#2e7d32", mr: 2, fontSize: 28 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">Thứ hai - Thứ sáu</Typography>
                      <Typography color="text.secondary">8:00 - 17:30</Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <AccessTimeIcon sx={{ color: "#2e7d32", mr: 2, fontSize: 28 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">Thứ bảy</Typography>
                      <Typography color="text.secondary">8:00 - 12:00</Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <AccessTimeIcon sx={{ color: "#2e7d32", mr: 2, fontSize: 28 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">Chủ nhật</Typography>
                      <Typography color="text.secondary">Nghỉ</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Typography color="text.secondary">
              Hãy liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi nào về các sản phẩm hay dịch vụ của HMES.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ContactPage;