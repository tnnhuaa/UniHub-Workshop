# UniHub Workshop — Project Proposal

## Vấn đề

Trường Đại học A hiện đang vận hành đăng ký workshop bằng Google Form và gửi email thủ công. Cách làm này không còn phù hợp khi sự kiện kéo dài 5 ngày, mỗi ngày có 8-12 workshop chạy song song, số lượng sinh viên lớn và nhu cầu cập nhật trạng thái chỗ ngồi theo thời gian gần thực.

Các vấn đề cốt lõi cần giải quyết:

- Quá tải quy trình đăng ký: lượng truy cập dồn dập khi mở cổng dễ làm hệ thống phản hồi chậm hoặc lỗi.
- Sai lệch dữ liệu chỗ ngồi: có nguy cơ nhiều sinh viên cùng lấy một chỗ cuối nếu không kiểm soát đồng thời tốt.
- Vận hành thủ công tốn nhân lực: xác nhận, check-in và theo dõi thống kê rời rạc, khó đồng bộ.
- Phụ thuộc tích hợp ngoài: cổng thanh toán có thể không ổn định; hệ thống sinh viên cũ chỉ cung cấp CSV ban đêm, không có API.

Nếu không số hóa toàn diện, quy mô sự kiện sẽ tiếp tục làm tăng rủi ro lỗi vận hành, giảm trải nghiệm sinh viên và gây áp lực lớn cho ban tổ chức trong các kỳ tiếp theo.

## Mục tiêu

Mục tiêu của UniHub Workshop là xây dựng một hệ thống thống nhất để quản lý toàn bộ vòng đời workshop, từ đăng ký đến check-in, với tính đúng đắn và khả năng chịu tải rõ ràng.

Mục tiêu định lượng và chất lượng chính:

- Hỗ trợ tải cao khi mở đăng ký: khoảng 12.000 sinh viên trong 10 phút đầu, với đỉnh tải tập trung trong 3 phút đầu.
- Đảm bảo không oversell chỗ ngồi: không có hai sinh viên cùng nhận một chỗ cuối của workshop.
- Duy trì hoạt động cốt lõi khi lỗi thanh toán: luồng xem lịch và thông tin sự kiện vẫn hoạt động bình thường khi cổng thanh toán gặp sự cố.
- Hỗ trợ check-in offline: nhân sự check-in vẫn ghi nhận tham dự khi mất mạng và đồng bộ lại an toàn khi có kết nối.
- Tự động hóa dữ liệu đầu vào và nội dung: nhập CSV sinh viên theo lịch đêm, xử lý lỗi/trùng; tạo tóm tắt workshop từ PDF bằng AI.
- Đảm bảo khả năng mở rộng kênh thông báo: có thể bổ sung kênh mới (ví dụ Telegram) mà không cần thay đổi lớn ở luồng nghiệp vụ cốt lõi.

Định hướng kỹ thuật đã chọn để đạt mục tiêu:

- Kiến trúc modular monolith với worker bất đồng bộ trên NestJS/Fastify.
- PostgreSQL làm nguồn dữ liệu giao dịch chính, Redis cho cache/rate limiting/idempotency, RabbitMQ cho hàng đợi tác vụ.
- BetterAuth theo mô hình hybrid để phục vụ đồng thời web admin và mobile/API.

## Người dùng và nhu cầu

### Sinh viên

- Xem lịch workshop, diễn giả, phòng, sơ đồ phòng và số chỗ còn lại gần thời gian thực.
- Đăng ký workshop miễn phí hoặc có phí.
- Nhận xác nhận và mã QR để check-in nhanh tại cửa phòng.
- Trải nghiệm ổn định, công bằng khi số lượng truy cập tăng đột biến.
- Quyền truy cập giới hạn: chỉ được xem và đăng ký workshop của hệ thống.

### Ban tổ chức

- Tạo mới, cập nhật, đổi phòng, đổi giờ, hủy workshop trên trang admin nội bộ.
- Theo dõi số lượng đăng ký và tình trạng vận hành.
- Tải lên PDF giới thiệu workshop và nhận bản tóm tắt AI hiển thị ở trang chi tiết.
- Quản trị phân quyền chặt chẽ theo vai trò.
- Quyền truy cập mở rộng: tạo/sửa/hủy workshop và xem thống kê toàn hệ thống.

### Nhân sự check-in

- Quét QR bằng ứng dụng mobile tại cửa phòng.
- Ghi nhận check-in ngay cả khi khu vực mất mạng.
- Tự động đồng bộ bản ghi offline khi kết nối được phục hồi, tránh mất dữ liệu hoặc trùng lặp.
- Quyền truy cập tối thiểu: chỉ sử dụng chức năng quét và xác nhận check-in.

## Phạm vi

### Trong phạm vi đồ án

- Xây dựng đầy đủ các chức năng nghiệp vụ đã nêu: xem và đăng ký workshop, thông báo, quản trị, check-in, AI Summary, đồng bộ CSV.
- Cài đặt thực tế các cơ chế kỹ thuật trọng yếu.
- Rate limiting theo token bucket để bảo vệ API.
- Circuit breaker cho tích hợp thanh toán, kết hợp graceful degradation.
- Idempotency key lưu trên Redis (TTL 24 giờ) để chống trừ tiền hai lần khi client retry.
- Transaction ở mức database cho các đoạn xử lý quan trọng như giữ chỗ và xác nhận đăng ký.
- Tổ chức backend theo mô hình modular monolith + workers, dùng RabbitMQ cho các tác vụ bất đồng bộ (thông báo, AI summary, nhập CSV).
- Thiết kế thông báo theo kiến trúc mở rộng bằng adapter hoặc strategy để thêm kênh mới mà không sửa luồng nghiệp vụ chính.
- Luồng đồng bộ CSV chạy 2 lần mỗi đêm (01:00 và 04:00), có cơ chế đối soát kết quả theo lô.
- Cung cấp seed data và hướng dẫn khởi chạy rõ ràng để có thể chạy và kiểm thử ngay.

### Ngoài phạm vi đồ án

- Triển khai hạ tầng production thực tế (HA đa vùng, autoscaling production-grade, quan sát hệ thống đầy đủ ở quy mô thật).
- Tích hợp cổng thanh toán thật trong môi trường vận hành chính thức; đồ án dùng sandbox hoặc mock adapter.
- Cam kết SLA vận hành doanh nghiệp hoặc các yêu cầu tuân thủ pháp lý ở mức production.
- Xây dựng hệ thống tích hợp hai chiều với hệ thống sinh viên cũ (vì hệ thống cũ không có API).

## Rủi ro và ràng buộc

### Tranh chấp chỗ ngồi và nhất quán dữ liệu

Khi nhiều sinh viên đăng ký cùng lúc, hệ thống có thể gặp race condition dẫn đến oversell. Giải pháp là kết hợp transaction, khóa phù hợp ở database và kiểm tra điều kiện idempotent tại backend.

### Tải trọng đột biến đầu giờ mở đăng ký

Lưu lượng tăng vọt có thể gây nghẽn API hoặc bất công giữa người dùng. Hệ thống cần rate limiting theo token bucket, cơ chế xếp hàng/thoái lui hợp lý và cache dữ liệu đọc để giảm áp lực lên backend.

### Cổng thanh toán không ổn định

Timeout hoặc lỗi kéo dài từ payment gateway có thể lan rộng thành lỗi dây chuyền. Cần circuit breaker với trạng thái đóng/mở/bán mở, timeout ngắn, retry có kiểm soát và fallback để các chức năng không liên quan thanh toán vẫn hoạt động.

Ngoài ra, luồng đăng ký có phí phải có cơ chế giữ chỗ tạm thời 10 phút và hết hạn tự động để tránh chiếm chỗ vô thời hạn khi thanh toán không hoàn tất.

### Check-in offline và đồng bộ lại

Mất mạng cục bộ khiến check-in không gửi về server ngay. Ứng dụng mobile cần lưu cục bộ an toàn, gắn dấu thời gian, đồng bộ lại theo lô, và xử lý trùng khi server nhận lại dữ liệu.

### Tích hợp một chiều qua CSV ban đêm

Ràng buộc không có API từ hệ thống cũ làm tăng nguy cơ file lỗi, thiếu cột, trùng bản ghi hoặc sai định dạng. Luồng nhập phải có staging, kiểm tra dữ liệu, dedupe, và cơ chế rollback hoặc bỏ qua bản ghi lỗi mà không làm gián đoạn hệ thống đang chạy.

Quy trình nhập chạy theo lịch 01:00 và 04:00 mỗi đêm, có cơ chế báo cáo kết quả theo lô (tổng số bản ghi, số bản ghi hợp lệ, số bản ghi lỗi) để ban tổ chức theo dõi chất lượng dữ liệu đầu vào. Khi dữ liệu trùng MSSV nhưng khác thông tin, áp dụng chính sách bản ghi đến sau sẽ ghi đè bản ghi trước.

### Phụ thuộc dịch vụ AI bên ngoài

AI Summary dùng API mô hình ngôn ngữ bên ngoài có rủi ro về độ trễ, chi phí và giới hạn quota. Cần tách thành tác vụ bất đồng bộ, có retry, theo dõi lỗi và cho phép hiển thị trạng thái xử lý nếu chưa có kết quả tóm tắt. Khi dịch vụ AI lỗi kéo dài, giao diện vẫn hiển thị mô tả gốc rút gọn kèm trạng thái tóm tắt AI chưa sẵn sàng.