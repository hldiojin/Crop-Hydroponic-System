import React from "react";
import { Container, Typography, Box, Link, Grid } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <Box sx={{ backgroundColor: "#2e7d32", color: "white", py: 4, mt: "auto" }}>
      <Container>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body1" align="center">
              &copy; {new Date().getFullYear()} HMES. Tất cả quyền được bảo lưu.
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" align="center" sx={{ mb: 2 }}>
              117 Xô Viết Nghệ Tĩnh, Phường 17, Quận Bình Thạnh, Tp. Hồ Chí Minh
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Link
                component={RouterLink}
                to="/privacy-policy"
                color="inherit"
                sx={{ mx: 2 }}
              >
                Chính sách bảo mật
              </Link>
              <Link
                component={RouterLink}
                to="/terms-of-service"
                color="inherit"
                sx={{ mx: 2 }}
              >
                Điều khoản dịch vụ
              </Link>
              <Link
                component={RouterLink}
                to="/contact"
                color="inherit"
                sx={{ mx: 2 }}
              >
                Liên hệ chúng tôi
              </Link>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
