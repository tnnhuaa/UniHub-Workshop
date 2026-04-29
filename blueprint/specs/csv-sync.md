# Đặc tả: Đồng bộ CSV Sinh viên (CSV Sync)

## Mô tả
Job chạy theo lịch để nhập dữ liệu sinh viên từ file CSV export của hệ thống cũ vào bảng `students`. Tiến trình dùng chunked streaming, ghi log chi tiết cho mỗi lô và áp dụng chiến lược Last-Write-Wins khi có xung đột.

## Luồng chính
1. Scheduler kiểm tra thư mục drop (filesystem/SFTP) vào 01:00 và 04:00, nếu có file mới thì tạo job `CSV import`.
2. `CSVWorker` đọc file và xử lý theo chunk (gợi ý chunk = 1000 hàng):
   - Parse và validate mỗi row (bắt buộc: `mssv`; kiểm tra định dạng email, phone nếu có).
   - Với row hợp lệ: upsert vào `students` trong transaction ở cấp chunk.
   - Với row không hợp lệ: skip row và ghi lỗi (row number, lỗi) vào log batch.
3. Sau khi hoàn tất file, worker ghi một bản tóm tắt vào `csv_sync_logs` (total, successful, failed, conflicts).

## Kịch bản lỗi
- Row lỗi định dạng: row bị bỏ qua, ghi log chi tiết; tiến trình tiếp tục với row tiếp theo.
- Chunk transaction thất bại (ví dụ: lỗi DB): worker retry chunk theo backoff; sau nhiều lần thất bại, job đánh dấu `failed` và gửi alert.
- File quá lớn/timeout: job có thể bị chia nhỏ hoặc bị đánh dấu `needs manual split` để xử lý thủ công.
- Dữ liệu trùng lặp MSSV: theo policy Last-Write-Wins, bản ghi từ CSV hiện tại sẽ ghi đè các trường có trong row.

## Ràng buộc
- Lịch chạy cố định: `01:00` và `04:00` (timezone server).
- Phải dùng chunked streaming để giới hạn bộ nhớ và cho phép resume.
- Không chặn thread chính của API; worker chạy trong pool riêng và giới hạn throughput tới DB.

## Tiêu chí chấp nhận
- Khi có file trong drop location tại lịch chạy, `csv_sync_logs` được tạo với `total_records > 0`.
- Các row hợp lệ được áp dụng (kiểm tra `students.csv_synced_at` cập nhật với timestamp batch).
- Các row lỗi được bỏ qua nhưng có log chi tiết (row index + lỗi) để kiểm tra sau.
- Số lượng conflict (ghi đè) được ghi vào `csv_sync_logs` và có thể truy vấn qua admin UI.
