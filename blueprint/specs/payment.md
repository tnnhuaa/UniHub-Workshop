# Đặc tả: Luồng Đăng ký Có phí (Hold-then-Pay)

## Mô tả

Luồng đăng ký dành cho workshop có thu phí theo chiến lược giữ chỗ (hold) rồi thanh toán (pay). Khi người dùng bắt đầu đăng ký, hệ thống tạo `registration` ở trạng thái `pending` với `held_until = NOW + 10 minutes`, sau đó gọi Payment Gateway. Dùng `Idempotency-Key` (lưu trên Redis, TTL 24h) để tránh trừ tiền hai lần và circuit breaker để bảo vệ hệ thống khi gateway lỗi.

## Luồng chính

1. Client gửi `POST /registrations` với payload `{ mssv, workshop_id, ... }` và header `Idempotency-Key`.
2. Server trong transaction kiểm tra capacity (bao gồm paid + held), tạo `registration` với `payment_status='pending'` và `held_until = NOW + INTERVAL '10 minutes'`.
3. Server gọi Payment Gateway thông qua lớp có circuit breaker.
4. Nếu thanh toán thành công:
   - Server cập nhật `registration.payment_status='paid'`, đặt `payment_completed_at`, tăng `workshops.registered_count` atomically, lưu kết quả trả về Redis dưới `idempotency:{key}` (TTL 24h) và trả success cho client kèm mã QR.
5. Nếu thanh toán thất bại hoặc timeout:
   - Server giữ `registration` ở trạng thái `pending` để chờ webhook hoặc retry; client nhận thông báo lỗi thân thiện.
6. Webhook từ gateway: verify signature → lookup `Idempotency-Key` hoặc payment id → idempotent update `registration` nếu cần.

## Kịch bản lỗi

- Payment timeout / gateway unavailable:
  - Circuit breaker (Failure Threshold=5 hoặc 50% error rate; Timeout=5s; Open Duration=60s) có thể mở; server trả lỗi cho client.
  - Held seat vẫn tồn tại cho tới `held_until` và sẽ được cleanup nếu không thanh toán.
- Client retry nhiều lần với cùng `Idempotency-Key`: server trả kết quả đã lưu từ Redis, không xử lý thanh toán lại.
- Webhook duplicate: được bỏ qua nhờ idempotency store.
- Held seat hết hạn (không có thanh toán): background job chạy mỗi 5 phút sẽ mark `registration` là `expired/cancelled` và giải phóng chỗ.

## Ràng buộc

- Reservation TTL: `held_until = NOW + 10 minutes`.
- Idempotency keys lưu trên Redis với TTL = 24 hours.
- Circuit Breaker mặc định: failure threshold = 5 (hoặc 50% error rate), request timeout = 5s, open duration = 60s.
- Tất cả thay đổi ảnh hưởng `workshops.registered_count` phải thực hiện atomically trong transaction.

## Tiêu chí chấp nhận

- Không xảy ra double charge khi thử nghiệm với duplicate request và duplicate webhook (kiểm tra bằng kịch bản test).
- Held seat được giải phóng sau 10 phút khi không có thanh toán (xác minh job cleanup hoạt động).
- Dưới tải đồng thời, `workshops.registered_count` khớp với số `registration` có `payment_status='paid'` (kiểm tra bằng test tải mô phỏng).
