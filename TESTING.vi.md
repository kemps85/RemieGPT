# Bảng test RemieGPT trên Windows

Bảng này dành cho bản phát hành trước khi chia cho người khác. Mỗi dòng chỉ
cần đánh dấu **Pass**, **Fail** hoặc ghi ngắn điều bất thường nhìn thấy.

| # | Cách test | Kết quả mong đợi | Pass/Fail |
| --- | --- | --- | --- |
| 1 | Mở RemieGPT | Remi hiện ở góc phải, không có cửa sổ khung đen và không chiếm taskbar. | |
| 2 | Mở RemieGPT thêm một lần | Không có Remi thứ hai; Remi cũ được đưa lên trước. | |
| 3 | Kéo Remi sang chỗ khác, tắt rồi mở lại | Vị trí vẫn được nhớ. | |
| 4 | Rút màn hình phụ, hoặc thử đổi độ phân giải rồi mở lại Remi | Remi không mất; nếu vị trí cũ không còn hợp lệ thì về góc phải màn hình chính. | |
| 5 | Gõ trong Word/Notepad/Chrome | Remi đổi sang `writing` gần như ngay, rồi về idle khi ngừng gõ. | |
| 6 | Mở Codex/Claude ở cửa sổ đang dùng, gửi một tác vụ | Thinking hiện nhanh sau khi tác vụ bắt đầu. | |
| 7 | Khi Codex/Claude bắt đầu hiện câu trả lời | Remi chuyển sang writing, không phải đợi lâu rồi mới nhảy state. | |
| 8 | Một session Codex đang trả lời, nhấp sang session khác rồi gửi tin nhắn mới | Remi bỏ trạng thái session cũ; chỉ session vừa gửi mới điều khiển Remi. | |
| 9 | Khi AI hỏi xác nhận hoặc cần nhập thêm | Remi hiện waiting-input. | |
| 10 | Khi AI hoàn thành | Remi hiện result ngắn rồi trở về idle. | |
| 11 | Đang để Codex/Claude suy nghĩ, Alt+Tab sang Word/Terminal khác | Remi bỏ ngay thinking/writing của cửa sổ cũ; AI nền không được điều khiển Remi. | |
| 12 | Quay lại đúng cửa sổ Codex/Claude đang chạy | Remi nhận lại trạng thái của cửa sổ đó. | |
| 13 | Cài browser helper, mở ChatGPT đang trả lời rồi chuyển sang tab YouTube | Khi ở YouTube, Remi không còn hiện trạng thái ChatGPT. | |
| 14 | Quay lại tab ChatGPT vẫn đang trả lời | Remi nhận lại thinking/writing của ChatGPT. | |
| 15 | Có hai tab AI cùng chạy, chỉ xem một tab | Chỉ tab đang xem điều khiển Remi. | |
| 16 | Nhấp phải icon Remi cạnh đồng hồ | Menu có click-through, startup, đưa về góc phải, ẩn và thoát; không có chức năng phóng/thu. | |
| 17 | Bật click-through rồi bấm vào vùng Remi | Chuột bấm được app phía dưới. Chọn **Cho phép kéo Remi** để kéo lại. | |
| 18 | Bật **Mở cùng Windows**, restart máy | Remi tự xuất hiện sau khi đăng nhập Windows. | |
| 19 | Thử bản Portable trên máy chưa cài app | Portable mở được; không cần cài đặt. | |

## Khi báo lỗi

Gửi kèm ảnh màn hình và ghi ngắn bốn điều: dùng bản Setup hay Portable, app AI
đang mở, app nào đang ở trước mặt, và Remi đang hiện GIF nào. Không gửi prompt,
API key hay nội dung riêng tư.
