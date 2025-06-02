"use client";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  minHeight: "80vh",
  display: "flex",
  alignItems: "center",
  background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
  padding: theme.spacing(4, 0),
}));

const GreenButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#2e7d32",
  color: "white",
  padding: theme.spacing(1, 4),
  "&:hover": {
    backgroundColor: "#1b5e20",
  },
  borderRadius: "30px",
  textTransform: "none",
  fontSize: "1rem",
  fontWeight: 600,
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 16px 32px rgba(0, 0, 0, 0.12)",
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: "relative",
  marginBottom: theme.spacing(6),
  "&:after": {
    content: '""',
    position: "absolute",
    bottom: "-16px",
    left: 0,
    width: "80px",
    height: "4px",
    backgroundColor: "#2e7d32",
  },
}));

const ProductShowcase = styled(Box)(({ theme }) => ({
  background: "#f9f9f9",
  padding: theme.spacing(10, 0),
}));

const HowItWorks = styled(Box)(({ theme }) => ({
  padding: theme.spacing(10, 0),
}));

const StepCard = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  padding: theme.spacing(2),
}));

const StepNumber = styled(Box)(({ theme }) => ({
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  backgroundColor: "#2e7d32",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.5rem",
  fontWeight: "bold",
  marginBottom: theme.spacing(2),
}));

const CTASection = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
  padding: theme.spacing(10, 0),
  color: "white",
}));

export default function Home() {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <Box>
      {/* Hero Section */}
      <HeroSection>
        <Container>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <Typography
                  variant="h2"
                  component="h1"
                  gutterBottom
                  sx={{ fontWeight: 700, color: "#1b5e20" }}
                >
                  Giám sát thủy canh thông minh cho nông dân hiện đại
                </Typography>
                <Typography variant="h5" sx={{ mb: 4, color: "#424242" }}>
                  Giám sát hệ thống thủy canh trong thời gian thực với công nghệ
                  IoT thiết kế đặc biệt cho phát triển bền vững agriculture
                </Typography>
                <Link to="/devices">
                  <GreenButton size="large">
                    Khám phá giải pháp của chúng tôi
                  </GreenButton>
                </Link>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1585792180666-f7347c490ee2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"
                  alt="Hydroponic System"
                  sx={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "16px",
                    boxShadow: "0 16px 40px rgba(0, 0, 0, 0.12)",
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      {/* Features Section */}
      <Box sx={{ py: 10 }}>
        <Container>
          <SectionTitle variant="h3">Tại sao chọn HMES?</SectionTitle>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <Grid container spacing={4}>
              {[
                {
                  title: "Giám sát thời gian thực",
                  description:
                    "Theo dõi pH, nhiệt độ, mức dinh dưỡng và nhiều thông số khác trong thời gian thực thông qua ứng dụng di động của chúng tôi",
                  image: "/IOT-Tree.png",
                },
                {
                  title: "Cảnh báo thông minh",
                  description:
                    "Nhận thông báo ngay lập tức khi các thông số nằm ngoài phạm vi tối ưu để ngăn ngừa thất bại cây trồng",
                  image:
                    "https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
                },
                {
                  title: "Phân tích dữ liệu",
                  description:
                    "Thống kê dữ liệu lịch sử để tối ưu hóa điều kiện trồng và cải thiện năng suất",
                  image:
                    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
                },
                {
                  title: "Cài đặt dễ dàng",
                  description:
                    "Thiết bị Plug-and-play tích hợp mượt mà với hệ thống thủy canh của bạn",
                  image:
                    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1558&q=80",
                },
              ].map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div variants={fadeIn}>
                    <FeatureCard>
                      <CardMedia
                        component="img"
                        height="140"
                        image={feature.image}
                        alt={feature.title}
                      />
                      <CardContent>
                        <Typography
                          gutterBottom
                          variant="h5"
                          component="div"
                          sx={{ fontWeight: 600, color: "#2e7d32" }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </FeatureCard>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Product Showcase */}
      <ProductShowcase>
        <Container>
          <SectionTitle variant="h3">
            Thiết bị giám sát thông minh của chúng tôi
          </SectionTitle>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <Grid container spacing={6}>
              {[
                {
                  title: "HMES Core Controller",
                  description:
                    "Trung tâm thông minh kết nối tất cả cảm biến và truyền thông với đám mây",
                  image:
                    "https://images.unsplash.com/photo-1580983218765-f663bec07b37?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80",
                },
                {
                  title: "Mảng cảm biến đa thông số",
                  description:
                    "Giám sát pH, EC, nhiệt độ, độ ẩm và mức nước với độ chính xác của phòng thí nghiệm",
                  image: "/IOT-image.png",
                },
                {
                  title: "Doser dinh dưỡng thông minh",
                  description:
                    "Tự động điều chỉnh mức dinh dưỡng dựa trên đọc thời gian thực cho phát triển cây trồng tối ưu",
                  image: "/IOT-image2.png",
                },
              ].map((product, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <motion.div variants={fadeIn}>
                    <Card
                      sx={{
                        borderRadius: "16px",
                        overflow: "hidden",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="300"
                        image={product.image}
                        alt={product.title}
                      />
                      <CardContent sx={{ p: 3 }}>
                        <Typography
                          gutterBottom
                          variant="h5"
                          component="div"
                          sx={{ fontWeight: 600, color: "#2e7d32" }}
                        >
                          {product.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {product.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </ProductShowcase>

      {/* How It Works */}
      <HowItWorks>
        <Container>
          <SectionTitle variant="h3">Cách HMES hoạt động</SectionTitle>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <Grid container spacing={4}>
              {[
                {
                  step: 1,
                  title: "Cài đặt cảm biến",
                  description:
                    "Đặt cảm biến Plug-and-play của chúng tôi vào hệ thống thủy canh của bạn",
                },
                {
                  step: 2,
                  title: "Kết nối với ứng dụng",
                  description:
                    "Kết nối cảm biến với ứng dụng di động của chúng tôi qua WiFi hoặc Bluetooth",
                },
                {
                  step: 3,
                  title: "Đặt thông số",
                  description:
                    "Định nghĩa điều kiện trồng lý tưởng và ngưỡng cảnh báo",
                },
                {
                  step: 4,
                  title: "Giám sát & Trồng",
                  description:
                    "Thư giãn trong khi HMES giám sát hệ thống của bạn 24/7 và cảnh báo khi cần thiết",
                },
              ].map((step, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div variants={fadeIn}>
                    <StepCard>
                      <StepNumber>{step.step}</StepNumber>
                      <Typography
                        variant="h5"
                        component="h3"
                        gutterBottom
                        sx={{ fontWeight: 600, color: "#2e7d32" }}
                      >
                        {step.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {step.description}
                      </Typography>
                    </StepCard>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </HowItWorks>

      {/* Benefits Section */}
      <Box sx={{ py: 10, background: "#e8f5e9" }}>
        <Container>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
              >
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1558449028-b53a39d100fc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"
                  alt="Healthy Hydroponic Plants"
                  sx={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "16px",
                    boxShadow: "0 16px 40px rgba(0, 0, 0, 0.12)",
                  }}
                />
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
              >
                <SectionTitle variant="h3">
                  Lợi ích của giám sát thông minh
                </SectionTitle>
                <Box sx={{ mb: 4 }}>
                  {[
                    "Tiết kiệm 30-60 phút mỗi ngày trong công việc giám sát thủ công",
                    "Ngăn ngừa thất bại cây trồng với phát hiện sớm vấn đề",
                    "Tăng năng suất bằng cách duy trì điều kiện trồng tối ưu",
                    "Giảm thiểu tiêu thụ nước và dinh dưỡng thông qua việc giám sát chính xác",
                    "Truy cập khuyến nghị trồng chuyên sâu dựa trên dữ liệu của bạn",
                  ].map((benefit, index) => (
                    <Box
                      key={index}
                      sx={{ display: "flex", alignItems: "center", mb: 2 }}
                    >
                      <Box
                        sx={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          backgroundColor: "#2e7d32",
                          mr: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                        }}
                      >
                        ✓
                      </Box>
                      <Typography variant="body1">{benefit}</Typography>
                    </Box>
                  ))}
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <CTASection>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <Box sx={{ textAlign: "center", maxWidth: "800px", mx: "auto" }}>
              <Typography
                variant="h3"
                component="h2"
                gutterBottom
                sx={{ fontWeight: 700 }}
              >
                Sẵn sàng chuyển đổi trải nghiệm trồng thủy canh của bạn?
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Tham gia hộ gia đình hiện đại đã đơn giản hóa việc giám sát thủy
                canh của họ với HMES
              </Typography>
              <Link to="/devices" style={{ textDecoration: 'none' }}>
                <GreenButton
                  size="large"
                  sx={{
                    px: 6,
                    py: 1.5,
                    fontSize: "1.2rem",
                    backgroundColor: "white",
                    color: "#2e7d32",
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                >
                  Bắt đầu ngay hôm nay
                </GreenButton>
              </Link>
            </Box>
          </motion.div>
        </Container>
      </CTASection>
    </Box>
  );
}
