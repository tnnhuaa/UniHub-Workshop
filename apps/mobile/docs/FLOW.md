# Đặc tả: UniHub - Student QR Check-in App

## Mô tả

Tính năng cho phép nhân sự check-in bằng mobile app khi có hoặc không có kết nối mạng. Ứng dụng lưu trữ check-in cục bộ bằng SQLite và thực hiện đẩy (push) từng bản ghi ngay sau khi quét (push-per-scan). Server là nguồn dữ liệu chính (server-canonical) để giải quyết xung đột. Khi không có kết nối mạng, ứng dụng thực hiện lưu trữ bản ghi vào queue của SQLite và đẩy bản ghi khi có mạng. Nếu đẩy thất bại, giữ trong queue và retry theo chính sách giới hạn.

## Luồng chính

1. Client thực hiện đăng nhập bằng email và password.
2. Mobile app tải trước danh sách sinh viên đăng ký cho workshop tương ứng (background sync). Client chọn quét QR (được admin cung cấp) và giải mã, nhận được `workshopId`, tải tất cả danh sách sinh viên đăng ký bằng GET `/checkins/workshop/[:workshopId]` rồi lưu lại. 
3. Nhân sự chọn sự kiện và màn hình hiện ra khung quét mã QR của sinh viên và nhập mã số sinh viên.
   - Client quét mã QR, giải mã và nhận được `qrCode`, tạo bản ghi checkin và ghi vào SQLite (durable).
   - Client nhập mã số sinh viên, quét và tìm được `registrationId`, tạo bản ghi checkin và ghi vào SQLite.
4. Nếu thiết bị online tại thời điểm quét:
   - Client gọi `POST /checkins/scan` (với `qrCode`) hoặc `POST /checkins/confirm` (với `registrationId`) với payload và token; server xác thực, ghi check-in vào PostgreSQL trong transaction và trả về bản ghi canonical.
5. Nếu thiết bị offline:
   - Client lưu bản ghi vào queue SQLite và ngay lập tức cố gắng đẩy bản ghi lên `POST /checkins/sync` khi có mạng hoặc sau mỗi lần quét (push-per-scan). Nếu đẩy thất bại, giữ trong queue và retry theo chính sách giới hạn.

## Kịch bản lỗi

- Mất mạng tại thời điểm quét: bản ghi lưu vào SQLite; khi mạng trở lại client tự động đẩy.
- Crash ứng dụng trước khi đẩy: SQLite bảo đảm dữ liệu tồn tại sau khởi động lại.
- Đồng thời quét cùng một mã trên hai thiết bị offline: khi cả hai đẩy, server xử lý dedupe; server-canonical wins—server trả về bản ghi đã lưu trước đó và từ chối duplicate dựa trên `tx_id` hoặc ràng buộc `UNIQUE(mssv, workshop_id, date)`.
- Bản ghi không hợp lệ (không có registration): server trả lỗi, client đánh dấu bản ghi `error` để nhân viên xử lý thủ công.


## Ràng buộc

- Lưu trữ cục bộ phải dùng SQLite (ACID) để bảo đảm không mất dữ liệu.
- Push-per-scan có thể tạo burst khi nhiều thiết bị online cùng lúc; server áp dụng rate limit theo `device_id` để bảo vệ.
- Server là nguồn xác thực thời gian (server timestamps override client times) để tránh lệch đồng hồ.

## Tiêu chí chấp nhận

- Scan offline → khởi động lại app → bản ghi vẫn tồn tại trong queue SQLite.
- Khi mạng trở lại, client đẩy bản ghi và server đánh dấu `synced_at` (kiểm tra bằng API `GET /checkins/workshop/{id}`).
- Hai thiết bị quét cùng mã offline rồi đẩy → server chỉ tạo một bản ghi canonical (kiểm tra bằng query trên DB và log `checkins.duplicates`).
- Bản ghi bị server từ chối được đánh dấu `error` trên client và có cơ chế cho nhân viên sửa/ghi chú.

## Công nghệ

- Framework: React Native Expo
- Authentication: Better Auth
- Local Database: SQLite