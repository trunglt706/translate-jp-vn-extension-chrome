# Changelog

Tất cả các thay đổi đáng chú ý của extension sẽ được ghi lại tại đây.  
Định dạng theo [Keep a Changelog](https://keepachangelog.com/vi/1.0/).

---

## [1.3] - 2026-03-20

### Thêm mới
- Chỉ kích hoạt dịch khi nhấn tổ hợp **Alt + Click** — các click thông thường không bị ảnh hưởng (`preventDefault` chỉ áp dụng khi có Alt).
- Nếu người dùng **bôi chọn (select) văn bản** trước khi Alt + Click, chỉ dịch đúng đoạn đã chọn thay vì toàn bộ text của element; giới hạn 200 ký tự không áp dụng cho đoạn được chọn thủ công.
- Lưu `Selection` và `Range` tại `mousedown` để tránh mất selection khi trình duyệt xử lý click.
- Hiệu ứng highlight thông minh: nếu có selection thì tô màu nền (`#e8f0fe`) đúng trên **đoạn text đã chọn** bằng thẻ `<mark>` tạm thời; nếu không thì tô nền element như cũ.

---

## [1.2] - 2026-03-20

### Sửa lỗi
- Ngăn không cho trình duyệt tải xuống hoặc mở trang khi nhấn tổ hợp **Alt + Click** vào thẻ `a[href]`, đảm bảo thao tác chỉ dùng để dịch.

---

## [1.1] - 2026-03-19

### Thêm mới
- Hỗ trợ dịch qua **ChatGPT** (OpenAI) bên cạnh Gemini — có thể chuyển đổi trong popup.
- Lưu API key riêng biệt cho từng nhà cung cấp (Gemini / ChatGPT).
- Trích xuất văn bản thông minh từ Google Docs và Google Sheets (ô lưới, `aria-label`).
- Giới hạn **200 ký tự** gửi đi để tránh tốn quota, tự động cắt bớt và thông báo.
- Chặn **click liên tục**: cooldown 1.5 giây sau mỗi lần dịch.
- Icon extension chuyển sang định dạng **PNG** (16/32/48/128px) — Chrome hiển thị đúng.
- Font **Be Vietnam Pro** trong popup để hiển thị tiếng Việt sắc nét hơn.
- Ghi chú hướng dẫn sử dụng `Alt + Click` ngay trong popup.
- Icon ⚙️ trước tiêu đề và 💾 trên nút Lưu Key.
- Bỏ gạch chân mặc định trên các link "Lấy key", chỉ hiện khi hover.

### Thay đổi
- Fallback tự động qua các model Gemini: `gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-2.0-flash-lite`.
- Hiệu ứng đổi màu nền phần tử đang dịch (`#e8f0fe`) để người dùng biết đang xử lý.

---

## [1.0] - 2026-03-01

### Phát hành lần đầu
- Dịch tiếng Nhật sang tiếng Việt bằng **Gemini API** (Alt + Click).
- Popup cấu hình API Key.
- Hỗ trợ Manifest V3.
