# Specs: Luồng Đăng ký Có phí

## 1. Luồng chính
1. Sinh viên chọn workshop có phí và nhấn "Đăng ký".
2. Hệ thống kiểm tra chỗ trống và tạo giao dịch tạm thời.
3. Chuyển hướng sinh viên sang cổng thanh toán (giả lập).
4. Sau khi thanh toán thành công, hệ thống cập nhật trạng thái, trừ số lượng chỗ và gửi mã QR qua app/email.

## 2. Kịch bản lỗi

### Thanh toán timeout
- Hệ thống giữ chỗ trong một khoảng thời gian ngắn (TTL).
- Nếu quá hạn mà chưa có xác nhận, chỗ ngồi được giải phóng.

### Retry giao dịch
- Sử dụng Idempotency Key để đảm bảo nếu sinh viên nhấn retry hoặc cổng thanh toán gửi webhook nhiều lần, hệ thống chỉ xử lý thành công một lần duy nhất.

## 3. Tiêu chí chấp nhận
- Không xảy ra tình trạng "Double Charge" (trừ tiền 2 lần).
- Số lượng chỗ trống thực tế phải khớp với số lượng đăng ký thành công.
