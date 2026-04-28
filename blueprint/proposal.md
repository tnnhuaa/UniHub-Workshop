
# Proposal: Hệ thống Quản lý Workshop Sự kiện

## 1. Vấn đề
- Phương thức quản lý qua Google Form và thông báo email thủ công không còn đáp ứng được khi quy mô sự kiện tăng.
- Việc tổ chức 8-12 workshop song song mỗi ngày gây khó khăn trong điều phối đăng ký, thông báo và check-in tập trung.

## 2. Mục tiêu
- Số hóa toàn bộ quy trình từ đăng ký đến check-in tại sự kiện.
- Hỗ trợ 12.000 sinh viên truy cập đăng ký trong 10 phút đầu khi mở cổng.
- Đảm bảo hệ thống hoạt động ổn định ngay cả khi cổng thanh toán gặp sự cố hoặc mạng tại khu vực sự kiện không ổn định.

## 3. Người dùng và nhu cầu

### Sinh viên
- Xem lịch workshop.
- Đăng ký nhanh chóng.
- Nhận mã QR và thông báo xác nhận.

### Ban tổ chức
- Tạo và quản lý workshop.
- Theo dõi chính xác số lượng đăng ký.

### Nhân sự check-in
- Quét mã QR nhanh tại cửa phòng.
- Hỗ trợ làm việc khi mất mạng.

## 4. Phạm vi

### Trong phạm vi
- Quản lý workshop.
- Đăng ký chỗ.
- Hệ thống QR.
- Trang admin.
- Check-in offline.
- AI Summary.
- Đồng bộ CSV ban đêm.

### Ngoài phạm vi
- Không triển khai cổng thanh toán thật (chỉ giả lập luồng).
- Không bao gồm hạ tầng production thực tế.

## 5. Rủi ro và ràng buộc
- Tranh chấp chỗ ngồi: nhiều sinh viên cùng đăng ký suất cuối.
- Tải đột biến: lưu lượng truy cập tăng mạnh khi mở cổng đăng ký.
- Thanh toán và kết nối: timeout thanh toán, mạng check-in chập chờn.
- Dữ liệu cũ: chỉ tích hợp một chiều qua file CSV export định kỳ.

## 6. Trạng thái hoàn thành
Thành viên 1 - Hùng đã hoàn thành các tài liệu:
- proposal.md
- specs/payment.md
- specs/checkin.md
- specs/csv-sync.md

## 7. Tài liệu liên quan
- specs/payment.md
- specs/checkin.md
- specs/csv-sync.md
