@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [RemieGPT] Chua tim thay Node.js.
  echo Hay cai Node.js 22.12 tro len roi chay lai file nay.
  pause
  exit /b 1
)

echo [RemieGPT] Dang cai thu vien...
call npm ci
if errorlevel 1 goto :failed

echo [RemieGPT] Dang kiem tra...
call npm test
if errorlevel 1 goto :failed

echo [RemieGPT] Dang kiem tra thu vien co loi bao mat khong...
call npm audit --omit=dev
if errorlevel 1 goto :failed

echo [RemieGPT] Dang tao file EXE cho Windows...
call npm run build:win
if errorlevel 1 goto :failed

echo [RemieGPT] Dang dong goi phan ho tro trinh duyet va ma SHA256...
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\package-release.ps1"
if errorlevel 1 goto :failed

echo.
echo [RemieGPT] Da xong. Mo thu muc dist de lay:
echo   RemieGPT-Setup-*-x64.exe
echo   RemieGPT-Portable-*-x64.exe
echo   RemieGPT-Browser-Helper.zip
echo   SHA256SUMS.txt
start "" "%~dp0dist"
pause
exit /b 0

:failed
echo.
echo [RemieGPT] Build that bai. Cuon len de xem loi.
pause
exit /b 1
