import React from "react";
import { Container, Typography, Box, Paper, Divider } from "@mui/material";

const TermsOfServicePage: React.FC = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ py: 5, flex: 1 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ color: "#2e7d32", fontWeight: 700 }}
          >
            Điều khoản dịch vụ
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ mb: 4, color: "text.secondary" }}
          >
            Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
          </Typography>
          <Divider sx={{ mb: 4 }} />

          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#2e7d32", fontWeight: 600 }}
          >
            1. Điều khoản sử dụng
          </Typography>
          <Typography paragraph>
            Bằng việc truy cập và sử dụng HMES, bạn đồng ý tuân thủ và chịu ràng
            buộc bởi các điều khoản và điều kiện này. Nếu bạn không đồng ý với
            bất kỳ phần nào trong các điều khoản này, bạn không được phép sử
            dụng dịch vụ của chúng tôi.
          </Typography>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#2e7d32", fontWeight: 600, mt: 3 }}
          >
            2. Tài khoản người dùng
          </Typography>
          <Typography paragraph>
            Khi bạn tạo tài khoản với chúng tôi, bạn phải cung cấp thông tin
            chính xác, đầy đủ và cập nhật. Bạn hoàn toàn chịu trách nhiệm về
            việc bảo mật tài khoản của mình, bao gồm mật khẩu, và cho tất cả các
            hoạt động xảy ra dưới tài khoản của bạn.
          </Typography>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#2e7d32", fontWeight: 600, mt: 3 }}
          >
            3. Sử dụng dịch vụ
          </Typography>
          <Typography paragraph>
            Bạn đồng ý sử dụng dịch vụ chỉ cho các mục đích hợp pháp và theo
            cách không vi phạm quyền của bất kỳ bên thứ ba nào. Bạn đồng ý không
            sử dụng dịch vụ của chúng tôi để:
          </Typography>
          <ul>
            <li>
              <Typography>
                Vi phạm bất kỳ luật hoặc quy định hiện hành nào
              </Typography>
            </li>
            <li>
              <Typography>
                Gửi nội dung bất hợp pháp, xúc phạm, đe dọa hoặc độc hại
              </Typography>
            </li>
            <li>
              <Typography>Phân phối virus hoặc mã độc hại khác</Typography>
            </li>
            <li>
              <Typography>
                Thu thập thông tin cá nhân của người dùng khác
              </Typography>
            </li>
          </ul>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#2e7d32", fontWeight: 600, mt: 3 }}
          >
            4. Thanh toán và hoàn tiền
          </Typography>
          <Typography paragraph>
            Khi bạn mua sản phẩm hoặc đăng ký dịch vụ, bạn đồng ý thanh toán đầy
            đủ các khoản phí được niêm yết. Tất cả các khoản thanh toán là không
            hoàn lại trừ khi có quy định khác trong chính sách hoàn tiền của
            chúng tôi.
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, mb: 2, mt: 2, color: "#2e7d32" }}
          >
            Chính sách hoàn tiền và hủy đơn hàng:
          </Typography>
          <ul>
            <li>
              <Typography>
                Hoàn tiền cho đơn hàng bị hủy sẽ được xử lý trong vòng 7 ngày
                làm việc.
              </Typography>
            </li>
            <li>
              <Typography>
                Nếu khách hàng muốn hủy đơn hàng đã thanh toán, vui lòng gửi
                ticket hỗ trợ đến hệ thống.
              </Typography>
            </li>
            <li>
              <Typography>
                Hoàn tiền cho các sản phẩm trả về đã thanh toán qua PayOs sẽ chỉ
                được xử lý sau khi HMES đã nhận và kiểm tra hàng hóa trả về.
              </Typography>
            </li>
            <li>
              <Typography>
                Hoàn tiền chỉ áp dụng cho giá sản phẩm. Phí vận chuyển không
                được hoàn lại trong bất kỳ trường hợp nào.
              </Typography>
            </li>
            <li>
              <Typography>
                Nếu khách hàng từ chối nhận hoặc không chấp nhận đơn hàng khi
                giao, họ vẫn phải chịu trách nhiệm về phí vận chuyển.
              </Typography>
            </li>
          </ul>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#2e7d32", fontWeight: 600, mt: 3 }}
          >
            5. Bảo hành và trách nhiệm pháp lý
          </Typography>
          <Typography paragraph>
            Dịch vụ của chúng tôi được cung cấp "nguyên trạng" và "có sẵn" mà
            không có bất kỳ bảo đảm nào, rõ ràng hay ngụ ý. Trong mọi trường
            hợp, HMES sẽ không chịu trách nhiệm về bất kỳ thiệt hại trực tiếp,
            gián tiếp, ngẫu nhiên, đặc biệt hoặc hậu quả nào phát sinh từ việc
            sử dụng dịch vụ của chúng tôi.
          </Typography>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#2e7d32", fontWeight: 600, mt: 3 }}
          >
            6. Quyền sở hữu trí tuệ
          </Typography>
          <Typography paragraph>
            Dịch vụ và nội dung của nó, bao gồm nhưng không giới hạn ở văn bản,
            đồ họa, logo, biểu tượng, hình ảnh, âm thanh và phần mềm, đều thuộc
            sở hữu của HMES hoặc các nhà cung cấp nội dung và được bảo vệ bởi
            luật sở hữu trí tuệ.
          </Typography>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#2e7d32", fontWeight: 600, mt: 3 }}
          >
            7. Sửa đổi điều khoản
          </Typography>
          <Typography paragraph>
            Chúng tôi có thể sửa đổi các điều khoản này theo thời gian. Chúng
            tôi sẽ thông báo cho bạn về các thay đổi quan trọng bằng cách gửi
            thông báo đến địa chỉ email được liên kết với tài khoản của bạn hoặc
            bằng cách đăng thông báo nổi bật trên trang web của chúng tôi.
          </Typography>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#2e7d32", fontWeight: 600, mt: 3 }}
          >
            8. Luật áp dụng
          </Typography>
          <Typography paragraph>
            Các điều khoản này sẽ được điều chỉnh và giải thích theo luật pháp
            Việt Nam, mà không liên quan đến xung đột các nguyên tắc pháp luật.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default TermsOfServicePage;
