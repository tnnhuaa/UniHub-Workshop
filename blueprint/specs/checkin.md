# Đặc tả: Check-in Offline

## Mô tả

Tính năng cho phép nhân sự check-in bằng mobile app khi có hoặc không có kết nối mạng. Ứng dụng lưu trữ check-in cục bộ bằng SQLite và thực hiện đẩy (push) từng bản ghi ngay sau khi quét (push-per-scan). Server là nguồn dữ liệu chính (server-canonical) để giải quyết xung đột.

## Luồng chính

1. Mobile app tải trước danh sách đăng ký cho workshop tương ứng (background sync).
2. Nhân sự quét mã QR của sinh viên.
   - Client tạo bản ghi checkin: `{ tx_id (UUID), mssv, workshop_id, device_id, scanned_at (client time), metadata }` và ghi vào SQLite (durable).
3. Nếu thiết bị online tại thời điểm quét:
   - Client gọi `POST /checkins/scan` với payload và token; server xác thực, ghi check-in vào PostgreSQL trong transaction và trả về bản ghi canonical.
4. Nếu thiết bị offline:
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
