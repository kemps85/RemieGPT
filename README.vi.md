# RemieGPT

[English README](README.md)

RemieGPT là bạn đồng hành nổi riêng trên Windows, được làm từ đúng các GIF Remi
gốc trong repo. Remi xuất hiện phía trên cửa sổ thường lẫn cửa sổ phóng to,
phản ứng với bàn phím/chuột trên toàn máy và đổi animation theo trạng thái của
những AI được hỗ trợ.

![Remi đang viết](assets/source/writing.gif)

Đây là app Windows độc lập, không còn là Codex Pet. App phát thẳng toàn bộ GIF
gốc nên không bị giới hạn còn vài khung hình như spritesheet của Codex Pet.

## Tải và chạy

Vào mục **Releases** của repo rồi tải một trong hai file:

- `RemieGPT-Setup-*-x64.exe`: bản cài đặt, tự tạo shortcut ngoài Desktop và
  Start Menu.
- `RemieGPT-Portable-*-x64.exe`: mở lên chạy ngay, không cần cài.

Windows có thể hiện cảnh báo SmartScreen vì bản cộng đồng chưa có chứng thư ký
phần mềm. Chỉ tải file phát hành từ đúng repo này.

Lần sau muốn bật Remi:

- mở shortcut **RemieGPT** ngoài Desktop hoặc Start Menu nếu dùng bản cài;
- mở lại file Portable nếu dùng bản chạy thẳng;
- hoặc bật **Mở cùng Windows** trong biểu tượng Remi cạnh đồng hồ.

## Điều khiển

- Giữ chuột trái lên Remi rồi kéo để di chuyển.
- Nhấp phải biểu tượng Remi cạnh đồng hồ để đổi kích thước, đưa về góc phải,
  ẩn hoặc thoát.
- Bật **Cho chuột xuyên qua Remi** nếu muốn bấm vào ứng dụng nằm dưới Remi.
  Muốn kéo lại thì tắt mục này từ biểu tượng cạnh đồng hồ.

## Khi nào dùng animation nào

| Trường hợp | GIF nguồn |
| --- | --- |
| Không có hoạt động | `idle.gif` |
| M gõ trong bất kỳ ứng dụng Windows nào | `writing.gif` |
| M bấm hoặc cuộn chuột | `waiting-input.gif` |
| AI được hỗ trợ đang suy nghĩ | `thinking.gif` |
| AI bắt đầu hiện câu trả lời | `writing.gif` |
| AI cần m trả lời hoặc xác nhận | `waiting-input.gif` |
| AI hoàn thành | `result.gif` |

Phần nhận bàn phím chỉ biết rằng vừa có một phím được bấm. RemieGPT không lưu
mã phím, nội dung m gõ, mật khẩu, clipboard, ảnh màn hình hoặc tọa độ chuột.

## Hỗ trợ AI

Codex và Claude Code hoạt động ngay, không cần cài thêm vào trình duyệt:

- Codex desktop và Codex CLI
- Claude Code

Muốn nhận trạng thái của AI trên web:

1. Nhấp phải biểu tượng Remi cạnh đồng hồ, chọn **Mở phần hỗ trợ AI trên web**.
2. Mở `chrome://extensions` hoặc `edge://extensions`.
3. Bật **Developer mode / Chế độ dành cho nhà phát triển**.
4. Chọn **Load unpacked / Tải tiện ích đã giải nén**, rồi chọn thư mục vừa mở.

Phần đi kèm hiện nhận ChatGPT, Claude, Gemini, Microsoft Copilot, Perplexity,
DeepSeek và Grok. Nó chỉ kiểm tra trang có đang hiện dấu hiệu suy nghĩ/trả lời
hay không rồi gửi trạng thái có/không cho RemieGPT trên cùng máy; không gửi nội
dung câu hỏi hoặc câu trả lời.

Không có một dấu hiệu “AI đang suy nghĩ” dùng chung cho mọi phần mềm. AI chưa
được hỗ trợ cần thêm cách nhận diện riêng thì Remi mới phân biệt chính xác được.

## Clone repo và build EXE

Yêu cầu:

- Windows 10 hoặc Windows 11 bản x64
- Node.js 22.12 trở lên
- Git

Clone repo xong, nhấp đúp:

```text
build-windows.cmd
```

Hoặc chạy trong Command Prompt:

```bat
git clone https://github.com/kemps85/RemieGPT.git
cd RemieGPT
build-windows.cmd
```

Sau khi kiểm tra xong, hai file EXE nằm trong `dist`:

```text
dist\RemieGPT-Setup-<version>-x64.exe
dist\RemieGPT-Portable-<version>-x64.exe
```

Các lệnh tương đương:

```bat
npm ci
npm test
npm run build:win
```

## Giới hạn trên Windows

- Remi nổi trên cửa sổ thường và cửa sổ phóng to.
- Màn hình khóa, màn hình xin quyền quản trị của Windows và một số game dùng
  chế độ toàn màn hình riêng có thể che overlay.
- Bản này chỉ nhắm Windows x64 vì đây là nền tảng đã được kiểm tra thật.

## Asset và giấy phép

App chỉ dùng các GIF Remi trong `assets/source`. Icon app là một khung được lấy
từ `idle.gif`; không dùng hình AI.

Code của app dùng [LICENSE-CODE](LICENSE-CODE). Hình nhân vật và file phát hành
phát sinh không tự động nằm trong giấy phép code nếu chủ sở hữu quyền chưa cấp
phép riêng.
