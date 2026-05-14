# UniHub - Student QR Check-in App

UniHub là ứng dụng di động dành cho nhân sự sự kiện, hỗ trợ quét mã QR và điểm danh sinh viên theo cơ chế **Offline-first**. Ứng dụng đảm bảo dữ liệu không bị mất ngay cả khi không có kết nối internet và tự động đồng bộ khi mạng được phục hồi.

## Tech Stack
- **Framework:** React Native Expo (Managed Workflow)
- **Authentication:** Better Auth
- **Local Database:** SQLite (`expo-sqlite`) - Đảm bảo tính ACID.
- **Networking:** Axios & `@react-native-community/netinfo`.
- **UI Components:** React Native Paper / Tailwind CSS (NativeWind).

## Cấu trúc thư mục
```text
├── src/
│   ├── api/            # Cấu hình Axios và các định nghĩa API endpoint
│   ├── components/     # UI Components dùng chung (Camera Scanner, Button, Card)
│   ├── database/       # SQLite schema, migrations và database provider
│   ├── hooks/          # useNetInfo, useCheckin, useSync
│   ├── screens/        # Login, WorkshopList, Scanner, History
│   ├── services/       # Sync Engine, Auth Service, QR Logic
│   ├── store/          # Global state (Zustand hoặc Context API)
│   └── utils/          # Helpers (Format date, UUID generator)
```

## Luồng hoạt động (Flow)

### 1. Đồng bộ xuôi (Sync Down)
- Nhân sự đăng nhập và chọn sự kiện (Workshop).
- App gọi `GET /checkins/workshop/:id` để tải danh sách SV đã đăng ký.
- Dữ liệu được lưu vào bảng `registrations` trong SQLite để tra cứu offline.

### 2. Ghi nhận Check-in (Action)
- **Quét QR:** Lấy `qrCode` -> Tạo bản ghi check-in với trạng thái `pending` -> Lưu vào SQLite.
- **Nhập MSSV:** Tra cứu trong bảng `registrations` local -> Lấy `registrationId` -> Lưu bản ghi `pending` vào SQLite.
- *Lưu ý:* Luôn ghi vào SQLite trước khi thực hiện bất kỳ yêu cầu mạng nào (Durable).

### 3. Đồng bộ ngược (Sync Up)
- **Online:** Sau khi ghi SQLite, app thực hiện `POST /checkins/scan` hoặc `confirm` ngay lập tức (Push-per-scan).
- **Offline:** Bản ghi nằm trong Queue của SQLite. Khi `NetInfo` phát hiện có mạng, app tự động gọi `POST /checkins/sync` để đẩy toàn bộ bản ghi `pending`.
- **Xử lý xung đột:** Server là nguồn xác thực cuối cùng. Nếu Server trả về lỗi `duplicate`, app cập nhật trạng thái local thành `synced`. Nếu lỗi nghiệp vụ, chuyển thành `error`.

## SQLite Schema Summary
- **workshops:** Lưu thông tin workshop đang thực hiện.
- **registrations:** Danh sách SV đăng ký để validate offline.
- **checkins:** Hàng đợi check-in (Queue) chứa: `deviceEventId` (Primary Key), `mssv`, `status` (pending/synced/error), `scannedAt`.

## Get started

### 1. Cài đặt môi trường
Đảm bảo bạn đã có Node.js và Expo CLI.
```bash
npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.env` ở thư mục gốc:
```env
EXPO_PUBLIC_API_URL=https://api.unihub.com
```

### 3. Chạy ứng dụng
```bash
npx expo start
```
- Nhấn `a` để mở Android Emulator.
- Nhấn `i` để mở iOS Simulator.
- Quét mã QR bằng ứng dụng **Expo Go** để chạy trên thiết bị thật.

## Tiêu chí chấp nhận (Acceptance Criteria)
- [x] Quét offline: Dữ liệu phải tồn tại trong SQLite kể cả khi app bị tắt/mở lại.
- [x] Tự động sync: Dữ liệu tự đẩy lên server ngay khi có mạng mà không cần user nhấn nút.
- [x] Chống trùng lặp: Một SV quét 2 máy khác nhau, server chỉ nhận bản ghi đầu tiên, bản ghi thứ 2 trên máy kia phải báo lỗi/trùng.
- [x] Minh bạch: Nhân sự có thể xem danh sách các bản ghi chưa đồng bộ hoặc bị lỗi.

© 2026 ??? Team - Student QR Check-in System.