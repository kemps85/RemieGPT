# RemieGPT

[English README](README.md)

RemieGPT là Remi nổi ở góc màn hình Windows. Remi đi theo bạn khi đổi giữa
Chrome, Word, Codex hay app khác. Remi đổi ảnh khi bạn gõ, AI đang nghĩ, AI
đang trả lời hoặc vừa xong việc.

![Remi đang viết](assets/source/writing.gif)

App chỉ dùng GIF có sẵn trong repo. Không tạo ảnh mới và không phải Codex Pet.

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

RemieGPT chưa có chứng chỉ phần mềm trả phí nên Windows có thể hiện cảnh báo.
Điều đó không tự động có nghĩa là có virus, nhưng cũng đừng bỏ qua cảnh báo nếu
bạn không biết file đến từ đâu.

Ba cách an toàn hơn:

1. Chỉ tải từ đúng repo `kemps85/RemieGPT`, sau đó kiểm tra mã SHA256.
2. Quét file bằng Windows Security.
3. Nếu vẫn không tin file dựng sẵn, tải mã nguồn, tự xem và tự build trên máy.

Các bước kiểm tra và tự build được viết ở mục **Tự kiểm tra mã nguồn và tự tạo
EXE** bên dưới.

## Cách sử dụng

- **Di chuyển:** giữ chuột trái trên Remi rồi kéo tới vị trí muốn đặt. Có thể
  kéo qua màn hình khác.
- **Kích thước cố định:** Remi không có chức năng phóng/thu, nên kéo chỉ thay
  đổi vị trí và không thể làm Remi to hoặc nhỏ đi.
- **Cho phép bấm xuyên qua Remi:** bật **Cho chuột xuyên qua Remi** trong menu
  cạnh đồng hồ. Muốn kéo lại thì chọn **Cho phép kéo Remi**. Chế độ xuyên chuột
  tự tắt khi mở lại app nên Remi không bị kẹt.
- **Mở cùng Windows:** bật **Mở cùng Windows** trong menu cạnh đồng hồ.
- **Ẩn hoặc thoát:** dùng menu cạnh đồng hồ. Nút đóng không hiện trên Remi vì
  cửa sổ của Remi trong suốt.
- **Đưa về vị trí cũ:** chọn **Đưa Remi về góc phải**.

### Remi ưu tiên việc bạn đang làm

Chỉ app hoặc tab đang mở trước mặt mới điều khiển Remi. Ví dụ Codex đang chạy
ở Terminal A mà bạn chuyển sang Word hoặc Terminal B thì Remi bỏ trạng thái của
Terminal A. Quay lại Terminal A thì Remi mới theo nó tiếp.

Nói ngắn gọn: AI chạy nền không được làm Remi nhảy ảnh khi bạn đang làm việc
khác.

Nếu một cửa sổ Codex/Claude có nhiều đoạn chat, bấm sang đoạn chat khác sẽ bỏ
trạng thái của đoạn chat cũ. Sau khi bạn gửi tin ở đoạn chat mới, Remi chỉ theo
đoạn chat đó.

## Dùng với AI

### Codex và Claude Code

Không cần cài thêm gì. RemieGPT tự nhận trạng thái từ tiến trình cục bộ của:

- Codex desktop và Codex CLI;
- Claude Code.

### ChatGPT, Claude, Gemini và AI trên web

Để Remi biết ChatGPT, Claude hay Gemini trên web đang nghĩ/trả lời, bạn cần cài
thêm phần hỗ trợ web một lần:

1. Nhấp phải biểu tượng Remi cạnh đồng hồ.
2. Chọn **Mở phần hỗ trợ AI trên web**. Một thư mục sẽ mở ra.
3. Trong Chrome mở `chrome://extensions`. Trong Edge mở `edge://extensions`.
4. Bật **Developer mode / Chế độ dành cho nhà phát triển**.
5. Bấm **Load unpacked / Tải tiện ích đã giải nén**.
6. Chọn đúng thư mục vừa được RemieGPT mở.
7. Tải lại tab ChatGPT/Claude/Gemini đang mở.

Phần hỗ trợ web nhận ChatGPT, Claude, Gemini, Microsoft Copilot, Perplexity,
DeepSeek và Grok. ChatGPT, Claude và Gemini được nhận biết tốt nhất. Chỉ tab
AI đang mở trước mặt mới điều khiển Remi. Chuyển sang YouTube, Word hoặc tab
khác thì Remi bỏ qua AI chạy nền.

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

## Nếu trông có vẻ không đúng

- **Remi không thấy trên màn hình:** nhấp phải icon cạnh đồng hồ và chọn
  **Đưa Remi về góc phải**. Nếu vừa rút màn hình phụ, lần mở tiếp theo Remi sẽ
  tự trở về màn hình chính.
- **AI chạy nền nhưng Remi không phản ứng:** đúng thiết kế. Hãy chuyển về đúng
  cửa sổ/tab AI đó.
- **Web AI không phản ứng:** kiểm tra RemieGPT vẫn đang mở, rồi tải lại tab AI
  sau khi cài hoặc cập nhật phần hỗ trợ trình duyệt.
- **Lỡ mở app hai lần:** bản mở sau chỉ đưa Remi đang chạy lên trước, không tạo
  thêm một Remi khác.

Người muốn kiểm tra trước khi dùng có thể theo [bảng test Windows](TESTING.vi.md).

## App biết gì về bạn?

- App chỉ biết là bạn vừa bấm phím hoặc chuột, không biết bạn đã bấm phím nào.
  App không lưu chữ bạn gõ và không đọc clipboard.
- Với Codex/Claude, app chỉ đọc dấu hiệu kiểu “đang nghĩ”, “đang viết”, “đang
  chờ” từ file trên chính máy. App không gửi đoạn chat của bạn đi đâu.
- Phần hỗ trợ web chỉ báo cho Remi biết AI đang nghĩ/viết/xong qua kết nối nội
  bộ của chính máy. Nó không gửi prompt hay câu trả lời ra Internet.
- App không có quảng cáo, tài khoản riêng hay theo dõi bạn dùng app thế nào.

## Tự kiểm tra mã nguồn và tự tạo EXE

Phần này dành cho ai không muốn chạy file EXE dựng sẵn.

### Cách dễ nhất, không cần biết Git

1. Cài [Node.js](https://nodejs.org/) bản 22.12 trở lên cho Windows x64.
2. Ở trang Release muốn dùng, tải **Source code (zip)**.
3. Giải nén ZIP ra một thư mục bình thường, ví dụ `Documents\RemieGPT`.
4. Mở thư mục vừa giải nén và nhấp đúp `build-windows.cmd`.
5. Cửa sổ màu đen sẽ tự cài những thứ cần thiết, tự kiểm tra rồi tạo bản Setup,
   bản Portable, phần hỗ trợ trình duyệt và file kiểm tra SHA256.
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
| `package-lock.json` | Ghi đúng phiên bản thư viện cần dùng |
| `desktop/main.js` | Tạo cửa sổ Remi và menu |
| `desktop/global-input.js` | Nhận biết bạn vừa bấm phím/chuột |
| `desktop/ai-monitor.js` | Nhận biết trạng thái Codex/Claude |
| `desktop/web-ai-server.js` | Nhận trạng thái từ phần hỗ trợ web trên máy |
| `browser-extension/` | Code của phần hỗ trợ AI trên web |

Code chính đều là file JavaScript/PowerShell, mở bằng Notepad hoặc VS Code là
đọc được. Không có file EXE lạ bị giấu trong source.

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
