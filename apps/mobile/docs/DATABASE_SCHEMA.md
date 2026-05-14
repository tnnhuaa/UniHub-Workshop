# Sơ đồ thực thể (Database Schema)

## Các thực thể chính 

Ứng dụng sẽ có 3 bảng chính: `workshops` (thông tin sự kiện), `registrations` (dữ liệu tải về để check-in offline) và `checkins` (hàng đợi đẩy lên server).

### Bảng `workshops`
Lưu thông tin workshop hiện tại mà nhân sự đang phụ trách.
```sql
CREATE TABLE workshops (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    status TEXT,           -- Thêm: draft, published, completed...
    is_active INTEGER DEFAULT 0
);
```

### Bảng `registrations`
Lưu danh sách sinh viên đã đăng ký (tải về từ `GET /checkins/workshop/:id`). Dùng để tra cứu MSSV -> `registrationId` khi offline.
```sql
CREATE TABLE registrations (
    id TEXT PRIMARY KEY,        -- registrationId
    workshop_id TEXT,
    mssv TEXT,
    full_name TEXT,
    email TEXT,                 -- Mới: Để đối soát
    faculty TEXT,               -- Mới: Khoa
    class_name TEXT,            -- Mới: Lớp
    registration_status TEXT,   -- confirmed, pending...
    payment_status TEXT,        -- paid, pending...
    server_checked_in_at TEXT,  -- Mới: Để biết SV này đã check-in ở máy khác chưa (API trả về checkedInAt)
    FOREIGN KEY(workshop_id) REFERENCES workshops(id)
);
CREATE INDEX idx_reg_mssv ON registrations(mssv);
```

### Bảng `checkins` (Quan trọng nhất)
Đây là hàng đợi (Queue). Mỗi lần quét sẽ tạo 1 dòng ở đây với `sync_status = 'pending'`.
```sql
CREATE TABLE checkins (
    device_event_id TEXT PRIMARY KEY, -- UUID sinh ra ở client (tx_id)
    workshop_id TEXT,
    mssv TEXT,
    registration_id TEXT,             -- Có thể NULL nếu quét QR chưa biết reg_id
    qr_code TEXT,                     -- Lưu lại mã QR đã quét
    scanned_at TEXT,                  -- ISO Date lúc quét
    sync_status TEXT DEFAULT 'pending', -- 'pending', 'synced', 'error'
    error_code TEXT,                  -- Lưu mã lỗi từ server (QR_INVALID, v.v.)
    error_message TEXT,
    server_checkin_id TEXT,           -- ID server trả về sau khi sync thành công
    
    FOREIGN KEY(workshop_id) REFERENCES workshops(id)
);
-- Index để lấy nhanh các bản ghi chưa sync
CREATE INDEX idx_checkin_pending ON checkins(sync_status) WHERE sync_status = 'pending';
```

## Chiến lược xử lý dữ liệu (Logic)

### A. Khi tải danh sách (Sync Down)
Khi gọi `GET /checkins/workshop/:id`:
1. Dùng `BEGIN TRANSACTION`.
2. Xóa dữ liệu `registrations` cũ của workshop đó.
3. Insert danh sách mới vào `registrations`.
4. `COMMIT`.

### B. Khi quét mã (Action)
*   **Nếu quét QR:** Lưu vào SQLite với `qrCode`, để `registrationId` là NULL.
*   **Nếu nhập MSSV:** Truy vấn bảng `registrations` local để lấy `registrationId` tương ứng, sau đó lưu vào SQLite.

### C. Khi đồng bộ (Sync Up - `POST /checkins/sync`)
Ứng dụng sẽ lấy các bản ghi có `sync_status = 'pending'`.
*   **Nếu Server trả về `accepted` hoặc `duplicate`:** Cập nhật `sync_status = 'synced'`.
*   **Nếu Server trả về `rejected`:** Cập nhật `sync_status = 'error'` và lưu `reason` vào `error_code`.


## SQLite Rules

```markdown
## SQLite Rules for UniHub
1. **Durable Writes**: Every QR scan must perform an INSERT into the `checkins` table before attempting any Network request.
2. **UUIDs**: Generate a new UUID v4 for `deviceEventId` for every unique scan.
3. **Transaction Safety**: Use `db.transaction()` for bulk inserts when syncing down registration lists.
4. **Consistency**: When updating sync status, always match by `deviceEventId`.
5. **Offline Lookup**: When a user enters MSSV manually, query the `registrations` table locally to find the `registrationId`. If not found, still allow check-in but mark for server-side validation.
```


## Tác dụng chính

1.  **Deduplication:** Sử dụng `device_event_id` (UUID) làm Primary Key đảm bảo nếu app bị crash và gửi lại cùng một bản ghi, server sẽ nhận diện được dựa trên ID này (tránh tạo 2 bản ghi cho 1 lần quét).
2.  **Trải nghiệm người dùng:** Việc lưu `error_code` vào SQLite giúp bạn có thể xây dựng màn hình "Lịch sử lỗi", nơi nhân sự có thể thấy sinh viên nào bị từ chối (VD: `REGISTRATION_NOT_CONFIRMED`) để xử lý thủ công.
3.  **Hiệu năng:** Việc đánh `INDEX` trên `sync_status` giúp app truy vấn cực nhanh các bản ghi cần đẩy lên mạng, ngay cả khi database có hàng nghìn dòng.