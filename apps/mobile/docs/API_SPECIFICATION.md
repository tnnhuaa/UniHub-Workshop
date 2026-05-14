# API Check-in — Input/Output Documentation

## 1. `POST /checkins/scan`
**Mục đích:** Quét mã QR sinh viên, ghi nhận check-in (online).

### Input (body)
```json
{
  "deviceId": "string",         // ID thiết bị
  "deviceEventId": "uuid",      // UUID duy nhất cho mỗi lần quét
  "scannedAt": "ISODate",       // (optional) Thời gian quét trên client
  "qrCode": "string"            // Mã QR của sinh viên
}
```

### Output

#### Thành công
```json
{
  "status": "created" | "duplicate",
  "checkin": {
    "id": "string (uuid)",
    "mssv": "string",
    "workshopId": "string (uuid)",
    "checkinStaffId": "string (uuid) | null",
    "registrationId": "string (uuid) | null",
    "deviceEventId": "string (uuid) | null",
    "checkedInAt": "ISODateTime",
    "syncedAt": "ISODateTime | null",
    "syncStatus": "pending" | "synced" | "rejected",
    "createdAt": "ISODateTime",
    "student": {
      "mssv": "string",
      "fullName": "string | null",
      "email": "string | null",
      "phone": "string | null",
      "faculty": "string | null",
      "className": "string | null"
    },
    "registration": {
      "id": "string (uuid)",
      "status": "pending" | "confirmed" | "cancelled" | "expired",
      "paymentStatus": "pending" | "paid" | "failed" | "refunded"
    } | null,
    "checkinStaff": {
      "id": "string (uuid)",
      "name": "string | null",
      "email": "string"
    } | null
  }
}
```

#### Lỗi
```json
// 400 Bad Request
{ "code": "QR_INVALID", "message": "QR code is not recognized" }
{ "code": "REGISTRATION_NOT_CONFIRMED", "message": "Registration is not confirmed" }
{ "code": "REGISTRATION_NOT_FOUND", "message": "Registration not found" }

// 403 Forbidden
{ "code": "CHECKIN_STAFF_REQUIRED", "message": "Check-in staff identity is required" }
{ "code": "CHECKIN_NOT_ASSIGNED", "message": "Check-in staff is not assigned to this workshop" }
```

---

## 2. `POST /checkins/confirm`
**Mục đích:** Xác nhận check-in dựa trên registrationId (thường dùng cho các trường hợp đặc biệt).

### Input (body)
```json
{
  "deviceId": "string",
  "deviceEventId": "uuid",
  "scannedAt": "ISODate",         // (optional)
  "registrationId": "uuid"
}
```

### Output

#### Thành công
```json
{
  "status": "created" | "duplicate",
  "checkin": {
    "id": "string (uuid)",
    "mssv": "string",
    "workshopId": "string (uuid)",
    "checkinStaffId": "string (uuid) | null",
    "registrationId": "string (uuid) | null",
    "deviceEventId": "string (uuid) | null",
    "checkedInAt": "ISODateTime",
    "syncedAt": "ISODateTime | null",
    "syncStatus": "pending" | "synced" | "rejected",
    "createdAt": "ISODateTime",
    "student": {
      "mssv": "string",
      "fullName": "string | null",
      "email": "string | null",
      "phone": "string | null",
      "faculty": "string | null",
      "className": "string | null"
    },
    "registration": {
      "id": "string (uuid)",
      "status": "pending" | "confirmed" | "cancelled" | "expired",
      "paymentStatus": "pending" | "paid" | "failed" | "refunded"
    } | null,
    "checkinStaff": {
      "id": "string (uuid)",
      "name": "string | null",
      "email": "string"
    } | null
  }
}
```

#### Lỗi
```json
// 400 Bad Request
{ "code": "REGISTRATION_NOT_FOUND", "message": "Registration not found" }
{ "code": "REGISTRATION_NOT_CONFIRMED", "message": "Registration is not confirmed" }

// 403 Forbidden
{ "code": "CHECKIN_STAFF_REQUIRED", "message": "Check-in staff identity is required" }
{ "code": "CHECKIN_NOT_ASSIGNED", "message": "Check-in staff is not assigned to this workshop" }
```

---

## 3. `POST /checkins/sync`
**Mục đích:** Đồng bộ các bản ghi check-in offline từ client lên server.

### Input (body)
```json
{
  "deviceId": "string",
  "records": [
    {
      "deviceEventId": "uuid",
      "mssv": "string",
      "workshopId": "uuid",
      "scannedAt": "ISODate"      // (optional)
    }
    // ... tối đa 200 bản ghi/lần
  ]
}
```

### Output
```json
{
  "deviceId": "string",
  "results": [
    {
      "deviceEventId": "uuid",
      "status": "pending" | "synced" | "rejected",
      "checkinId": "string (uuid)",      // nếu accepted
      "reason": "REGISTRATION_NOT_FOUND" | "REGISTRATION_NOT_CONFIRMED" | "STAFF_NOT_ASSIGNED" // nếu rejected
    }
  ]
}
```

#### Lỗi (toàn bộ batch bị lỗi xác thực hoặc phân quyền)
```json
{ "code": "CHECKIN_STAFF_REQUIRED", "message": "Check-in staff identity is required" }
{ "code": "CHECKIN_NOT_ASSIGNED", "message": "Check-in staff is not assigned to this workshop" }
```

---

## 4. `GET /checkins/workshop/:id`
**Mục đích:** Lấy danh sách check-in của một workshop.

### Input (params)
- `id`: UUID của workshop

### Output
- Mảng các bản ghi checkin và thông tin workshop có cấu trúc như sau:
```json
{
  "workshopId": "string (uuid)",
  "title": "string",
  "description": "string | null",
  "status": "string", // draft, cancelled, published, completed --- isNotActive = completed | cancelled | draft
  "registrations": [
    {
      "id": "string (uuid)", // registrationId
      "registrationStatus": "pending" | "confirmed" | "cancelled" | "expired",
      "paymentStatus": "pending" | "paid" | "failed" | "refunded",
      "checkedInAt": "ISODateTime | null",
      "syncedAt": "ISODateTime | null",
      "syncStatus": "pending" | "synced" | "rejected",
      "student": {
        "mssv": "string",
        "fullName": "string | null",
        "email": "string | null",
        "phone": "string | null",
        "faculty": "string | null",
        "className": "string | null"
      },
      "checkinStaff": {
        "id": "string (uuid)",
        "name": "string | null",
        "email": "string"
      } | null
    }
  ]
}
```

#### Lỗi
```json
{ "code": "CHECKIN_STAFF_REQUIRED", "message": "Check-in staff identity is required" }
{ "code": "CHECKIN_NOT_ASSIGNED", "message": "Check-in staff is not assigned to this workshop" }
```

---

**Lưu ý:**
- Tất cả endpoint yêu cầu xác thực và role `checkin_staff`.
- Input đều được validate bằng Zod schema, trả về lỗi chi tiết nếu sai định dạng.
- Tham khảo chi tiết logic và các mã lỗi trong file `blueprint/specs/checkin.md` và `checkin.service.ts`.