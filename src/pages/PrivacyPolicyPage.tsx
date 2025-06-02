import React from "react";
import { Container, Typography, Box, Paper, Divider } from "@mui/material";

const PrivacyPolicyPage: React.FC = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ py: 5, flex: 1 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: "#2e7d32", fontWeight: 700 }}>
            Chính sách bảo mật
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 4, color: "text.secondary" }}>
            Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
          </Typography>
          <Divider sx={{ mb: 4 }} />

          <Typography variant="h6" gutterBottom sx={{ color: "#2e7d32", fontWeight: 600 }}>
            1. Thông tin chúng tôi thu thập
          </Typography>
          <Typography paragraph>
            HMES thu thập một số thông tin cá nhân khi bạn đăng ký và sử dụng dịch vụ của chúng tôi, bao gồm: tên, địa chỉ email, số điện thoại, và thông tin thanh toán. Chúng tôi cũng thu thập dữ liệu về cách bạn sử dụng dịch vụ của chúng tôi và dữ liệu từ hệ thống thủy canh của bạn.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ color: "#2e7d32", fontWeight: 600, mt: 3 }}>
            2. Cách chúng tôi sử dụng thông tin của bạn
          </Typography>
          <Typography paragraph>
            Chúng tôi sử dụng thông tin của bạn để:
          </Typography>
          <ul>
            <li>
              <Typography>Cung cấp, duy trì và cải thiện dịch vụ của chúng tôi</Typography>
            </li>
            <li>
              <Typography>Phát triển các tính năng và sản phẩm mới</Typography>
            </li>
            <li>
              <Typography>Gửi thông báo về trạng thái hệ thống và cảnh báo</Typography>
            </li>
            <li>
              <Typography>Liên lạc với bạn về cập nhật, khuyến mãi hoặc sự kiện</Typography>
            </li>
          </ul>

          <Typography variant="h6" gutterBottom sx={{ color: "#2e7d32", fontWeight: 600, mt: 3 }}>
            3. Chia sẻ và tiết lộ thông tin
          </Typography>
          <Typography paragraph>
            HMES không bán thông tin cá nhân của bạn cho bên thứ ba. Chúng tôi có thể chia sẻ thông tin của bạn trong các trường hợp sau:
          </Typography>
          <ul>
            <li>
              <Typography>Với các nhà cung cấp dịch vụ giúp chúng tôi vận hành dịch vụ</Typography>
            </li>
            <li>
              <Typography>Để tuân thủ pháp luật, quy định, hoặc yêu cầu hợp pháp</Typography>
            </li>
            <li>
              <Typography>Trong trường hợp sáp nhập, mua lại, hoặc bán tài sản</Typography>
            </li>
          </ul>

          <Typography variant="h6" gutterBottom sx={{ color: "#2e7d32", fontWeight: 600, mt: 3 }}>
            4. Bảo mật dữ liệu
          </Typography>
          <Typography paragraph>
            Chúng tôi thực hiện các biện pháp bảo mật hợp lý để bảo vệ thông tin của bạn khỏi mất mát, truy cập trái phép, tiết lộ, thay đổi và phá hủy. Các biện pháp này bao gồm mã hóa dữ liệu, kiểm soát truy cập, và các biện pháp bảo mật vật lý.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ color: "#2e7d32", fontWeight: 600, mt: 3 }}>
            5. Quyền của bạn
          </Typography>
          <Typography paragraph>
            Bạn có quyền truy cập, sửa đổi, xóa và giới hạn việc xử lý thông tin cá nhân của mình. Bạn cũng có thể yêu cầu xuất dữ liệu của mình hoặc rút lại sự đồng ý đã cung cấp trước đó.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ color: "#2e7d32", fontWeight: 600, mt: 3 }}>
            6. Thay đổi chính sách bảo mật
          </Typography>
          <Typography paragraph>
            Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Chúng tôi sẽ thông báo cho bạn về các thay đổi quan trọng bằng cách gửi thông báo đến địa chỉ email được liên kết với tài khoản của bạn hoặc bằng cách đăng thông báo nổi bật trên trang web của chúng tôi.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ color: "#2e7d32", fontWeight: 600, mt: 3 }}>
            7. Liên hệ chúng tôi
          </Typography>
          <Typography paragraph>
            Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này, vui lòng liên hệ với chúng tôi tại: privacy@hmes.com
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default PrivacyPolicyPage; 