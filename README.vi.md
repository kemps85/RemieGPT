# RemieGPT

[English README](README.md)

RemieGPT là Remi nổi riêng trên màn hình Windows. Remi vẫn ở đó khi bạn chuyển
giữa Chrome, Word, Codex hoặc ứng dụng khác, và đổi GIF theo lúc bạn gõ, lúc AI
suy nghĩ, lúc AI trả lời và lúc AI hoàn thành.

![Remi đang viết](assets/source/writing.gif)

App dùng trực tiếp các GIF gốc trong repo, không tạo, vẽ lại hoặc thay thế ảnh.
Đây là app Windows độc lập, không còn phụ thuộc vào Codex Pet.

## Cài nhanh cho người dùng bình thường

1. Mở trang [Releases](https://github.com/kemps85/RemieGPT/releases/latest).
2. Tải `RemieGPT-Setup-...-x64.exe`.
3. Nhấp đúp file vừa tải, chọn **Next → Install → Finish**.
4. Remi sẽ xuất hiện ở góc màn hình. Lần sau mở bằng shortcut **RemieGPT** ở
   Desktop hoặc Start Menu.

Nếu chỉ muốn thử mà không cài, tải `RemieGPT-Portable-...-x64.exe` rồi mở trực
tiếp. Bản Portable không tự tạo shortcut.

Nếu trang Releases chưa có file EXE thì bản đó chưa được phát hành công khai.
Bạn có thể chờ bản phát hành hoặc tự build bằng hướng dẫn bên dưới.

### Windows hiện “Windows protected your PC” thì sao?

RemieGPT là dự án cộng đồng chưa mua chứng thư ký phần mềm nên Windows có thể
cảnh báo. Cảnh báo này không tự chứng minh file có virus, nhưng cũng không nên
bấm bỏ qua một cách mù quáng.

Ba cách an toàn hơn:

1. Chỉ tải từ đúng repo `kemps85/RemieGPT`, sau đó kiểm tra mã SHA256.
2. Quét file bằng Windows Security.
3. Nếu vẫn không tin file dựng sẵn, tải mã nguồn, tự xem và tự build trên máy.

Các bước kiểm tra và tự build được viết ở mục **Tự kiểm tra mã nguồn và tự tạo
EXE** bên dưới.

## Cách sử dụng

- **Di chuyển:** giữ chuột trái trên Remi rồi kéo tới vị trí muốn đặt. Có thể
  kéo qua màn hình khác.
- **Đổi kích thước:** nhấp phải biểu tượng Remi cạnh đồng hồ, chọn lớn hơn hoặc
  nhỏ hơn.
- **Cho phép bấm xuyên qua Remi:** bật **Cho chuột xuyên qua Remi** trong menu
  cạnh đồng hồ. Muốn kéo lại thì chọn **Cho phép kéo Remi**. Chế độ xuyên chuột
  tự tắt khi mở lại app nên Remi không bị kẹt.
- **Mở cùng Windows:** bật **Mở cùng Windows** trong menu cạnh đồng hồ.
- **Ẩn hoặc thoát:** dùng menu cạnh đồng hồ. Nút đóng không hiện trên Remi vì
  cửa sổ của Remi trong suốt.
- **Đưa về vị trí cũ:** chọn **Đưa Remi về góc phải**.

## Dùng với AI

### Codex và Claude Code

Không cần cài thêm gì. RemieGPT tự nhận trạng thái từ tiến trình cục bộ của:

- Codex desktop và Codex CLI;
- Claude Code.

### ChatGPT, Claude, Gemini và AI trên web

Trình duyệt không cho app bên ngoài tự biết trang AI đang trả lời, nên cần cài
phần hỗ trợ web một lần:

1. Nhấp phải biểu tượng Remi cạnh đồng hồ.
2. Chọn **Mở phần hỗ trợ AI trên web**. Một thư mục sẽ mở ra.
3. Trong Chrome mở `chrome://extensions`. Trong Edge mở `edge://extensions`.
4. Bật **Developer mode / Chế độ dành cho nhà phát triển**.
5. Bấm **Load unpacked / Tải tiện ích đã giải nén**.
6. Chọn đúng thư mục vừa được RemieGPT mở.
7. Tải lại tab ChatGPT/Claude/Gemini đang mở.

Phần hỗ trợ web nhận ChatGPT, Claude, Gemini, Microsoft Copilot, Perplexity,
DeepSeek và Grok. ChatGPT, Claude và Gemini có thêm dấu hiệu nhận biết riêng;
các trang còn lại dùng cách nhận biết chung.

## Ý nghĩa animation

| Trường hợp | GIF dùng |
| --- | --- |
| Không có hoạt động | `idle.gif` |
| Bạn gõ trong bất kỳ ứng dụng Windows nào | `writing.gif` |
| AI được hỗ trợ đang suy nghĩ | `thinking.gif` |
| AI đang hiện câu trả lời | `writing.gif` |
| AI thật sự cần bạn trả lời hoặc xác nhận | `waiting-input.gif` |
| AI vừa hoàn thành | `result.gif` |

`waiting-input.gif` không phải trạng thái đứng yên. Nó chỉ xuất hiện khi AI
thực sự hỏi lại hoặc yêu cầu xác nhận.

## Quyền riêng tư: app nhìn thấy gì?

- Bộ nhận bàn phím chỉ biết **vừa có một phím được bấm**. Code không lấy ký tự,
  không lưu nội dung bạn gõ và không đọc clipboard.
- Với Codex/Claude, app đọc loại sự kiện mới được ghi vào file tiến trình cục
  bộ để phân biệt thinking, writing, waiting và complete. App không gửi cuộc
  trò chuyện đi đâu.
- Khi cần nhận AI đang đổ chữ trong cửa sổ Codex/Claude, app lấy một ảnh thu nhỏ
  của đúng cửa sổ đó, so sánh thay đổi trong RAM rồi bỏ đi. Ảnh không được lưu.
- Phần hỗ trợ web chỉ gửi trạng thái `thinking/writing/finished` về
  `127.0.0.1` trên chính máy. Nó không gửi prompt hoặc câu trả lời ra Internet.
- App không có quảng cáo, telemetry hoặc tài khoản đăng nhập riêng.

## Tự kiểm tra mã nguồn và tự tạo EXE

Phần này dành cho người không muốn tin file EXE dựng sẵn.

### Cách dễ nhất, không cần biết Git

1. Cài [Node.js](https://nodejs.org/) bản 22.12 trở lên cho Windows x64.
2. Ở trang Release muốn dùng, tải **Source code (zip)**.
3. Giải nén ZIP ra một thư mục bình thường, ví dụ `Documents\RemieGPT`.
4. Mở thư mục vừa giải nén và nhấp đúp `build-windows.cmd`.
5. Cửa sổ màu đen sẽ tự:
   - cài đúng phiên bản thư viện đã khóa trong `package-lock.json`;
   - chạy toàn bộ test;
   - kiểm tra thư viện chạy thật có cảnh báo bảo mật hay không;
   - tạo installer, bản Portable, phần hỗ trợ trình duyệt và mã SHA256.
6. Khi hoàn thành, thư mục `dist` tự mở. Dùng một trong hai file:

```text
dist\RemieGPT-Setup-<version>-x64.exe
dist\RemieGPT-Portable-<version>-x64.exe
```

Không cần cài Git nếu dùng Source code ZIP. Lần build đầu cần Internet để npm
tải Electron và các thư viện ghi trong lockfile.

### Nên xem những file nào trước khi build?

| File/thư mục | Chức năng |
| --- | --- |
| `package.json` | Danh sách thư viện và lệnh đóng gói |
| `package-lock.json` | Khóa chính xác phiên bản và mã toàn vẹn của thư viện |
| `desktop/main.js` | Tạo cửa sổ Remi, menu và khởi động các bộ nhận biết |
| `desktop/global-input.js` | Chỉ nhận sự kiện có thao tác bàn phím/chuột |
| `desktop/ai-monitor.js` | Nhận loại sự kiện Codex/Claude từ file cục bộ |
| `desktop/visual-writing-monitor.js` | So sánh ảnh thu nhỏ trong RAM, không lưu ảnh |
| `desktop/web-ai-server.js` | Chỉ nhận kết nối từ máy local |
| `browser-extension/` | Toàn bộ code của phần hỗ trợ AI trên web |
| `.github/workflows/` | Lệnh GitHub dùng để test, build và phát hành |

Toàn bộ code chạy chính nằm trong các file JavaScript/PowerShell đọc được bằng
Notepad hoặc VS Code; không có file thực thi bí mật được cất trong source.

### Tự chạy từng lệnh

Người quen Command Prompt có thể chạy:

```bat
npm ci
npm test
npm audit --omit=dev
npm run build:win
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\package-release.ps1
```

### Kiểm tra SHA256 của file tải từ Release

Release có file `SHA256SUMS.txt`. Mở PowerShell trong thư mục tải xuống rồi chạy:

```powershell
Get-FileHash .\RemieGPT-Setup-0.2.0-x64.exe -Algorithm SHA256
```

Chuỗi `Hash` phải giống dòng cùng tên trong `SHA256SUMS.txt`. SHA256 chỉ xác
nhận file bạn tải giống file được repo phát hành; nó không tự chứng minh chương
trình hoàn toàn an toàn. Build lại từ mã nguồn là cách kiểm tra độc lập hơn.

File tự build có thể không có SHA256 giống hệt file Release vì thời gian đóng
gói và metadata có thể khác, dù dùng cùng mã nguồn.

## Build bằng Git

```bat
git clone https://github.com/kemps85/RemieGPT.git
cd RemieGPT
build-windows.cmd
```

## Giới hạn

- Remi nổi trên cửa sổ thường và cửa sổ phóng to.
- Màn hình khóa, cửa sổ xin quyền quản trị của Windows và một số game dùng chế
  độ toàn màn hình riêng có thể che Remi.
- Gõ phím trong mọi app đều nhận được animation viết, nhưng trạng thái thinking
  của AI chỉ chính xác với các AI đã được hỗ trợ.
- Bản phát hành hiện chỉ nhắm Windows x64 vì đây là nền tảng được kiểm tra thật.

## Asset, nguồn tham khảo và giấy phép

App chỉ dùng GIF trong `assets/source`. Icon app là một khung lấy từ `idle.gif`;
không dùng hình do AI tạo.

Cách nhận tín hiệu web được tham khảo từ
[Gemielle](https://github.com/Rainan1010/Gemielle) và
[Remielle-Widget](https://github.com/qantrung-art/Remielle-Widget). Chi tiết ở
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Không sao chép asset từ hai
repo đó.

Code và tài liệu tuân theo [LICENSE-CODE](LICENSE-CODE). Quyền sử dụng hình nhân
vật không tự động được cấp theo giấy phép code nếu chủ sở hữu hình chưa cấp phép
riêng.
