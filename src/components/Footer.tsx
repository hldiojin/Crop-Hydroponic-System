import React from "react";
import { Container, Typography, Box, Link } from "@mui/material";

const Footer: React.FC = () => {
  return (
    <Box sx={{ backgroundColor: "#2e7d32", color: "white", py: 4, mt: "auto" }}>
      <Container>
        <Typography variant="body1" align="center">
          &copy; {new Date().getFullYear()} HMES. Tất cả quyền được bảo lưu.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Link href="#" color="inherit" sx={{ mx: 2 }}>
            Chính sách bảo mật
          </Link>
          <Link href="#" color="inherit" sx={{ mx: 2 }}>
            Điều khoản dịch vụ
          </Link>
          <Link href="#" color="inherit" sx={{ mx: 2 }}>
            Liên hệ chúng tôi
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
