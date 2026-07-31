# RemieGPT

[English README](README.md)

Remi là một Codex Pet tùy chỉnh dựa trên Remielle. Cô bé sẽ đổi hoạt ảnh khi
Codex đang làm việc, chờ người dùng, đã có kết quả hoặc gặp lỗi.

Spritesheet phát hành chỉ được ghép từ sáu GIF nguồn có sẵn trong repo. Không
dùng frame AI, không vẽ lại nhân vật và không thêm chi tiết mới.

![Remi đang làm việc trong Codex](qa/previews/running.gif)

## Yêu cầu

- ChatGPT desktop có mục **Pets**, hoặc Codex CLI tương thích
- Windows, macOS hoặc Linux
- Không cần API key và không cần build project

## Cài trên Windows

Clone hoặc tải ZIP của repo, mở PowerShell tại thư mục vừa tải rồi chạy:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1
```

Script sẽ cài Remi vào:

```text
%USERPROFILE%\.codex\pets\remi
```

Nếu máy có biến `CODEX_HOME`, script sẽ dùng thư mục đó.

## Cài trên macOS hoặc Linux

Clone hoặc tải ZIP của repo, mở terminal tại thư mục vừa tải rồi chạy:

```bash
sh ./scripts/install.sh
```

Pet sẽ được cài vào:

```text
~/.codex/pets/remi
```

Nếu máy có biến `CODEX_HOME`, script sẽ dùng thư mục đó.

## Cài thủ công

Chép nguyên thư mục [`pet/remi`](pet/remi) vào:

```text
<CODEX_HOME>/pets/remi
```

Nếu không đặt `CODEX_HOME`, dùng:

- Windows: `%USERPROFILE%\.codex\pets\remi`
- macOS/Linux: `~/.codex/pets/remi`

Thư mục sau khi cài phải có đủ:

```text
remi/
├── pet.json
└── spritesheet.webp
```

## Bật Remi

1. Mở ứng dụng Codex desktop.
2. Vào **Settings > Pets**.
3. Chọn **Refresh**.
4. Chọn **Remi**.
5. Nhập `/pet`, hoặc mở command menu và chọn **Wake Pet**.

Nhập `/pet` lần nữa để ẩn pet.

Trong Codex CLI tương tác, nhập `/pets` hoặc `/pet` để mở danh sách pet. Pet
trong terminal cần terminal hỗ trợ hiển thị hình ảnh.

## Remi phản ứng thế nào

| Trạng thái Codex | Hoạt ảnh Remi |
| --- | --- |
| Nghỉ | Thở nhẹ và chớp mắt |
| Đang chạy task | Tập trung làm việc trên tablet |
| Cần input | Chờ người dùng duyệt hoặc trả lời |
| Đã xong | Xem lại kết quả |
| Bị chặn/lỗi | Phản ứng khi gặp lỗi |
| Kéo sang trái/phải | Di chuyển theo pet nổi |

Bộ GIF gốc không có pose riêng cho kéo trái/phải, vẫy tay, nhảy hoặc nhìn theo
con trỏ. Các hàng đó dùng lại loop gốc gần nhất thay vì tự chế thêm frame.

## Khắc phục lỗi

### Không thấy Remi trong danh sách pet

- Kiểm tra `pet.json` và `spritesheet.webp` nằm cùng thư mục `remi`.
- Trong **Settings > Pets**, bấm **Refresh**.
- Nếu cửa sổ chọn pet đã mở từ trước khi cài, hãy khởi động lại Codex.
- Kiểm tra script đã dùng đúng `CODEX_HOME`.

### Pet hiện nhưng không chuyển động

Pets tôn trọng cài đặt giảm chuyển động của hệ điều hành. Khi reduced motion
đang bật, Codex dùng một frame tĩnh.

### Không thấy pet trong Codex IDE extension

IDE extension không có pet nổi. Hãy dùng ChatGPT desktop hoặc Codex CLI tương
thích.

## Kiểm tra package

Build lại pet từ đúng GIF nguồn:

```bash
python scripts/build_pet.py
```

Chạy checker:

```bash
python -m pip install -r requirements-dev.txt
python scripts/validate_package.py
```

GitHub Actions cũng chạy checker này mỗi lần push hoặc mở pull request.

## Giấy phép

Script cài đặt và tài liệu dùng [`LICENSE-CODE`](LICENSE-CODE). Hình nhân vật
và spritesheet phát sinh không nằm trong giấy phép này nếu chủ sở hữu quyền
không cấp phép riêng.
