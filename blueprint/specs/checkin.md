# Specs: Check-in Offline

## 1. Luồng thực hiện
1. Nhân sự quét mã QR của sinh viên bằng mobile app.
2. Khi online: app gửi request lên server để xác thực và ghi nhận ngay.
3. Khi offline:
   - App kiểm tra thông tin trong local cache (danh sách sinh viên đã đăng ký tải về trước đó).
   - Lưu lịch sử check-in vào hàng chờ nội bộ trên thiết bị.

## 2. Đồng bộ lại khi có mạng
- App tự động đẩy dữ liệu từ hàng chờ lên server.
- Nếu một mã QR được quét trên 2 thiết bị trong trạng thái offline, hệ thống xử lý xung đột bằng cách giữ lại bản ghi check-in sớm nhất.

## 3. Tiêu chí chấp nhận
- Dữ liệu check-in offline không bị mất sau khi ứng dụng khởi động lại.
- Dữ liệu check-in offline không bị mất khi mạng trở lại ổn định.
