# Specs: CSV Sync Flow

## 1. Luồng chính
1. Định kỳ vào ban đêm, hệ thống quét thư mục chứa file CSV được export từ hệ thống cũ.
2. Hệ thống đọc file, validate định dạng, sau đó bắt đầu import.

## 2. Xử lý lỗi và ràng buộc
- Nếu gặp dòng dữ liệu lỗi hoặc sai định dạng:
  - Bỏ qua dòng lỗi.
  - Ghi log chi tiết.
  - Không dừng toàn bộ tiến trình import.
- Xử lý dữ liệu trùng lặp (dựa trên MSSV) để tránh ghi đè hoặc tạo user ảo.
- Tiến trình import phải chạy ở background (worker/job) để không ảnh hưởng hiệu năng API đang phục vụ người dùng.
