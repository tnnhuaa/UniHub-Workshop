# Specs: Phân quyền và Kiểm soát truy cập

## 1. Mô tả

Tính năng này đảm bảo mỗi nhóm người dùng chỉ truy cập được đúng chức năng của mình trong UniHub Workshop. Hệ thống áp dụng mô hình `RBAC` để phân biệt ba nhóm chính: `Sinh viên`, `Ban tổ chức` và `Nhân sự check-in`.

Phạm vi của đặc tả này bao gồm:
- Xác thực danh tính người dùng trước khi truy cập tài nguyên.
- Xác định role và phạm vi quyền của từng người dùng.
- Kiểm tra quyền tại `Backend API`, trang admin và mobile app check-in.
- Xử lý các trường hợp đặc biệt như tài khoản bị khóa, dữ liệu sinh viên chưa đồng bộ, nhân sự thao tác ngoài phạm vi được phân công và quyền bị thay đổi trong lúc đang sử dụng hệ thống.

Kỹ thuật bắt buộc để agent triển khai:
- `Web App` dùng `Better Auth` theo cơ chế `session-based authentication`.
- `Mobile App` dùng `Better Auth JWT` để gọi API bằng `Authorization: Bearer <token>`.
- Toàn bộ logic xác thực và lấy session/token phải `thuần call thư viện Better Auth`, không tự viết cơ chế ký token, verify token, refresh token hay quản lý cookie riêng bên ngoài thư viện.
- Backend dùng cùng một `Better Auth server config` cho cả web và mobile để tránh lệch cách xác thực giữa hai kênh.

Chi tiết áp dụng theo kênh:
- `Web`: browser giữ `session cookie` do Better Auth cấp; request đi kèm cookie và backend đọc session bằng API của Better Auth.
- `Mobile`: ứng dụng lấy JWT do Better Auth phát hành, lưu trong secure storage và gửi ở `Authorization header`.
- `Backend`: không tự parse JWT hoặc tự đọc cookie thủ công để quyết định đăng nhập; mọi quyết định xác thực phải đi qua Better Auth.

Plugins và cách dùng bắt buộc:
- Bật cơ chế session mặc định của Better Auth cho web.
- Bật `JWT plugin` để mobile lấy JWT và backend có `JWKS` để verify đúng chuẩn.
- Nếu mobile authenticate request bằng `Authorization: Bearer <token>`, backend phải bật thêm `Bearer plugin` theo đúng cách dùng của Better Auth thay vì tự dựng middleware token riêng.
- Các client gọi hàm/thư viện chính thức của Better Auth; không dùng helper tự chế nếu có thể dùng API sẵn của thư viện.

Ma trận quyền ở mức tổng quát:
- `Sinh viên`: xem workshop, đăng ký workshop, thanh toán, xem lịch cá nhân, xem QR của bản thân.
- `Ban tổ chức`: tạo, sửa, hủy workshop; quản lý lịch/phòng; xem thống kê; upload tài liệu workshop.
- `Nhân sự check-in`: quét QR, xác nhận check-in và đồng bộ check-in offline trong phạm vi workshop được phân công.

Nguyên tắc áp dụng:
- Quyền hiển thị trên giao diện chỉ mang tính hỗ trợ trải nghiệm; quyền thực sự được quyết định tại backend.
- Mỗi request nhạy cảm phải đi qua hai bước: `authentication` rồi mới đến `authorization`.
- Hệ thống ưu tiên `deny by default`: nếu không xác định được quyền rõ ràng, request phải bị từ chối.
- Khi xác thực thất bại ở Better Auth, backend không được tiếp tục chạy bước authorize hay nghiệp vụ.
- Cùng một policy RBAC phải áp dụng nhất quán cho cả request từ web session và mobile JWT.

## 2. Luồng chính

1. Người dùng đăng nhập vào hệ thống bằng tài khoản hợp lệ.
2. Backend xác thực danh tính và nạp danh sách role tương ứng của người dùng.
3. Khi người dùng gọi API hoặc mở màn hình chức năng:
   - Backend kiểm tra token hoặc session.
   - Backend kiểm tra role phù hợp với endpoint hoặc hành động đang yêu cầu.
   - Nếu endpoint có ràng buộc theo ngữ cảnh, backend kiểm tra thêm `resource ownership` hoặc `assignment scope`.
4. Nếu role hợp lệ:
   - `Sinh viên` được xem workshop, đăng ký và nhận QR.
   - `Ban tổ chức` được tạo, sửa, hủy workshop và xem thống kê.
   - `Nhân sự check-in` được dùng mobile app để quét QR và đồng bộ check-in.
5. Nếu role không hợp lệ, hệ thống từ chối truy cập và ghi log phục vụ audit.

### Luồng xác thực cho Web bằng Better Auth Session

1. Người dùng web đăng nhập bằng flow chuẩn của Better Auth.
2. Better Auth tạo session và trả session cookie cho browser.
3. Browser tự gửi cookie ở các request tiếp theo đến backend.
4. Backend gọi API chính thức của Better Auth để lấy session từ `request headers/cookies`.
5. Nếu session hợp lệ, backend lấy `user`, `session` và role tương ứng để authorize.
6. Nếu session không hợp lệ, backend trả lỗi xác thực và không chạy tiếp nghiệp vụ.

### Luồng xác thực cho Mobile bằng Better Auth JWT

1. Người dùng mobile đăng nhập bằng flow được cấu hình qua Better Auth.
2. Mobile lấy JWT do Better Auth phát hành.
3. Mobile lưu JWT trong `secure storage` của thiết bị, không lưu ở nơi đọc được công khai.
4. Mỗi request API từ mobile gửi `Authorization: Bearer <jwt>`.
5. Backend dùng Better Auth để xác minh JWT và nạp session/user tương ứng trước khi authorize.
6. Nếu token hết hạn, không hợp lệ hoặc đã bị revoke, mobile phải bị yêu cầu lấy token mới hoặc đăng nhập lại tùy trạng thái phiên.

### Luồng đồng nhất xác thực giữa Web và Mobile

1. Web và mobile có thể khác loại credential, nhưng phải cùng trỏ về một nguồn sự thật về `user identity`, `role`, `account status`.
2. Policy RBAC được áp dụng sau bước xác thực, không phụ thuộc request đến từ cookie hay JWT.
3. Các endpoint nghiệp vụ không được tách thành hai bộ luật quyền khác nhau chỉ vì khác client.

### Luồng phân quyền cho sinh viên

1. Sinh viên đăng nhập.
2. Backend xác nhận tài khoản đang hoạt động và có `StudentProfile` hợp lệ.
3. Sinh viên truy cập danh sách workshop hoặc tạo đăng ký mới.
4. Backend xác nhận người dùng đang thao tác trên dữ liệu của chính mình, ví dụ chỉ xem QR của bản thân hoặc lịch đăng ký của bản thân.

### Luồng phân quyền cho ban tổ chức

1. Ban tổ chức đăng nhập vào web admin.
2. Backend xác nhận user có role `organizer`.
3. Khi user tạo, sửa hoặc hủy workshop, backend kiểm tra thêm các điều kiện nghiệp vụ như trạng thái workshop hoặc dữ liệu đầu vào.
4. Nếu thao tác hợp lệ, hệ thống ghi audit log cho hành động quản trị.

### Luồng phân quyền cho nhân sự check-in

1. Nhân sự check-in đăng nhập vào mobile app.
2. Backend xác nhận role `checkin_staff`.
3. Hệ thống chỉ đồng bộ về thiết bị dữ liệu tối thiểu cần thiết để xác thực QR và hỗ trợ check-in cho workshop được phân công.
4. Khi quét QR, backend hoặc cơ chế đồng bộ lại sẽ kiểm tra:
   - mã QR có hợp lệ hay không
   - đăng ký có thuộc workshop đang được phân công hay không
   - sinh viên đã check-in trước đó hay chưa

### Luồng khi người dùng có nhiều role

1. Một user có thể mang nhiều role, ví dụ vừa là `student` vừa là `organizer`.
2. Backend nạp toàn bộ role hợp lệ đang hoạt động của user.
3. Mỗi request được đối chiếu với policy của endpoint cụ thể thay vì suy luận từ role ưu tiên duy nhất.
4. Người dùng chỉ nhận quyền là hợp của các role đang được gán hợp lệ, không được vượt quá phạm vi của từng endpoint.

## 3. Kịch bản lỗi

### Token không hợp lệ hoặc đã hết hạn
- Backend trả lỗi xác thực.
- Người dùng phải đăng nhập lại hoặc refresh token theo cơ chế của hệ thống.

### Session cookie không tồn tại, bị sửa hoặc không còn hợp lệ
- Với web, nếu cookie thiếu, sai chữ ký hoặc session không còn tồn tại trong Better Auth, backend phải coi request là chưa đăng nhập.
- Không được cho qua request chỉ vì client vẫn đang ở màn hình đã đăng nhập.

### JWT không hợp lệ, hết hạn hoặc sai issuer/audience
- Với mobile, nếu JWT không qua bước xác minh của Better Auth hoặc không khớp cấu hình phát hành của hệ thống, request bị từ chối.
- Backend không dùng decoder tự viết để “đọc tạm” payload rồi cho qua.

### Người dùng không đủ quyền
- Backend trả lỗi phân quyền.
- Client có thể ẩn chức năng, nhưng quyết định cuối cùng vẫn ở backend.

### Nhân sự check-in thao tác ngoài phạm vi được phân công
- Nếu nhân sự quét QR cho workshop không thuộc danh sách được phép, request bị từ chối.
- Dữ liệu offline đồng bộ lên cũng phải được kiểm tra lại trên server.

### Dữ liệu sinh viên chưa được đồng bộ từ CSV
- Nếu tài khoản không có `StudentProfile` hợp lệ hoặc trạng thái sinh viên không hoạt động, hệ thống không cho đăng ký workshop.

### Tài khoản bị khóa hoặc bị vô hiệu hóa sau khi đã đăng nhập
- Nếu tài khoản bị khóa trong lúc phiên đăng nhập vẫn còn hiệu lực, backend vẫn phải từ chối các request tiếp theo sau thời điểm thay đổi trạng thái.
- Token cũ không được coi là đủ điều kiện để vượt qua bước kiểm tra trạng thái tài khoản.

### Session còn sống nhưng role đã bị thay đổi
- Nếu admin thay đổi role của user sau khi user đã đăng nhập, request tiếp theo phải được đánh giá theo role mới nhất đang còn hiệu lực.
- Không được cache role quá lâu ở client rồi dùng làm nguồn quyết định cuối cùng.

### Quyền bị thay đổi trong khi mobile app đang offline
- Nếu nhân sự check-in đã tải dữ liệu về máy rồi mất quyền trong lúc offline, các bản ghi mới chỉ được xem là tạm thời trên thiết bị.
- Khi đồng bộ lại, backend kiểm tra lại role và assignment hiện tại trước khi chấp nhận dữ liệu.
- Các bản ghi không còn hợp lệ phải bị từ chối và ghi log rõ nguyên nhân.

### User có nhiều role nhưng truy cập sai ngữ cảnh
- Một user có thể đồng thời là `student` và `organizer`, nhưng khi gọi endpoint admin thì vẫn phải có role `organizer`.
- Không được suy ra rằng người có một role mạnh hơn sẽ tự động hợp lệ ở mọi ngữ cảnh nếu policy không cho phép.

### Truy cập trực tiếp API dù giao diện đã ẩn chức năng
- Nếu người dùng tự gọi thẳng endpoint bị cấm bằng công cụ ngoài ứng dụng, backend vẫn phải từ chối như bình thường.
- Không được phụ thuộc vào client-side guard như nguồn bảo vệ duy nhất.

### Dữ liệu offline cũ gây xung đột với dữ liệu hiện tại
- Nếu mobile app dùng cache cũ và gửi lên check-in cho một đăng ký đã bị hủy hoặc workshop đã bị đổi trạng thái, backend phải từ chối bản ghi không còn hợp lệ.
- Nếu cùng một sinh viên đã được check-in trước đó bởi một thiết bị khác, hệ thống chỉ giữ lại bản ghi hợp lệ sớm nhất theo rule của phần check-in.

### Tài khoản nội bộ dùng sai kênh truy cập
- `CheckInStaff` không được dùng mobile token để truy cập endpoint admin.
- `Organizer` không được dùng web admin session để gọi endpoint check-in nếu không có role phù hợp.

### Dữ liệu phân công workshop không tồn tại hoặc bị lệch
- Nếu staff có role `checkin_staff` nhưng chưa được phân công workshop nào, hệ thống cho phép đăng nhập nhưng không cho thực hiện check-in.
- Ứng dụng phải hiển thị rõ trạng thái chưa được phân công thay vì cho thao tác mơ hồ.

### Lỗi hệ thống trong quá trình authorize
- Nếu backend không đọc được role, không truy vấn được policy hoặc không xác minh được trạng thái tài khoản, request phải bị từ chối theo nguyên tắc an toàn.
- Không được mặc định cho qua chỉ vì thiếu dữ liệu kiểm tra quyền.

### Better Auth service/config bị lỗi tạm thời
- Nếu backend không khởi tạo được Better Auth client/server config hoặc không xác minh được credential qua thư viện, request phải bị fail-closed.
- Chỉ các endpoint công khai hoàn toàn mới được tiếp tục hoạt động khi hệ thống auth có vấn đề.

### Thiết bị mobile bị mất token cục bộ
- Nếu mobile không còn giữ JWT trong secure storage, ứng dụng phải coi phiên đăng nhập cục bộ đã mất và yêu cầu xác thực lại.
- Không được cố dựng lại trạng thái đăng nhập chỉ từ cache UI.

## 4. Ràng buộc

- Mọi endpoint nhạy cảm phải kiểm tra quyền ở backend.
- Không dựa vào việc ẩn nút trên giao diện để thay thế phân quyền.
- Quyền phải bám theo nguyên tắc `least privilege` và được kiểm tra theo cả `role` lẫn `scope`.
- Các thao tác quản trị và check-in cần có audit log cơ bản.
- Dữ liệu tải xuống cho mobile check-in chỉ được chứa thông tin tối thiểu cần thiết để xác thực QR và đồng bộ bản ghi offline.
- Khi dữ liệu sinh viên chưa hợp lệ, tài khoản bị khóa hoặc người dùng không còn được phân công, request phải bị từ chối.
- `Web` phải dùng cookie/session do Better Auth quản lý; không thay bằng localStorage token cho browser flow.
- `Mobile` phải dùng JWT do Better Auth phát hành; không tự ký JWT bằng secret riêng ngoài thư viện.
- JWT trên mobile phải được lưu trong secure storage của hệ điều hành; không lưu ở plain text log, clipboard hay storage không an toàn.
- Backend phải dùng API/chức năng chính thức của Better Auth để lấy session hoặc verify token; không tự viết middleware xác thực riêng nếu thư viện đã hỗ trợ.
- Cấu hình JWT cần có `issuer`, `audience` và thời hạn sống rõ ràng để agent có thể cài đặt nhất quán.
- Với web session, cookie phải được cấu hình an toàn như `httpOnly`, `secure` trong production và chính sách `sameSite` phù hợp.
- Nếu credential bị revoke hoặc session bị xóa, request tiếp theo phải thất bại ngay cả khi client chưa kịp cập nhật UI.
- Logic xác thực phải được gom vào một lớp tích hợp Better Auth dùng chung, tránh mỗi module tự gọi auth theo cách khác nhau gây lệch behavior.
- Agent triển khai không được tự phát minh endpoint auth mới nếu Better Auth đã có endpoint chuẩn cho đăng nhập, lấy session, lấy token hoặc sign out.

## 5. Tiêu chí chấp nhận

- Sinh viên không thể truy cập API hoặc màn hình admin.
- Sinh viên chỉ xem được QR và lịch đăng ký của chính mình, không xem được dữ liệu của sinh viên khác.
- Ban tổ chức chỉ dùng được các chức năng quản trị workshop và thống kê theo đúng quyền.
- Nhân sự check-in chỉ thao tác được trên workshop được phân công và chỉ dùng được chức năng quét/xác nhận check-in.
- Ban tổ chức không thể dùng endpoint check-in nếu không có role tương ứng.
- Dữ liệu check-in tạo lúc offline chỉ được chấp nhận khi vẫn còn hợp lệ ở thời điểm đồng bộ.
- Nếu tài khoản bị khóa sau khi đăng nhập, các request tiếp theo của phiên đó bị từ chối.
- Web request với session cookie hợp lệ được backend đọc thành công qua Better Auth mà không cần custom cookie parser để xác thực.
- Mobile request với JWT hợp lệ được backend xác thực qua Better Auth và được authorize theo cùng policy RBAC với web.
- Web request thiếu cookie hoặc cookie hết hạn bị từ chối nhất quán.
- Mobile request với JWT hết hạn, sai chữ ký hoặc sai issuer/audience bị từ chối nhất quán.
- Agent triển khai không cần tự viết cơ chế ký JWT, xoay khóa hay quản lý session store ngoài Better Auth.
- Khi session hoặc token bị revoke, request tiếp theo không được tiếp tục truy cập tài nguyên bảo vệ.
