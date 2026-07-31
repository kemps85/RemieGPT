$signature = @'
using System;
using System.Runtime.InteropServices;
using System.Text;

public static class RemieForegroundWindow
{
    [StructLayout(LayoutKind.Sequential)]
    public struct Rect
    {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
    }

    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);

    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);

    [DllImport("user32.dll")]
    public static extern bool GetWindowRect(IntPtr hWnd, out Rect rect);
}
'@

Add-Type -TypeDefinition $signature
$lastHandle = [IntPtr]::Zero

while ($true) {
    $handle = [RemieForegroundWindow]::GetForegroundWindow()
    if ($handle -ne [IntPtr]::Zero -and $handle -ne $lastHandle) {
        $lastHandle = $handle
        $processId = [uint32]0
        [void][RemieForegroundWindow]::GetWindowThreadProcessId($handle, [ref]$processId)
        $titleBuilder = [Text.StringBuilder]::new(1024)
        [void][RemieForegroundWindow]::GetWindowText($handle, $titleBuilder, $titleBuilder.Capacity)
        $rect = [RemieForegroundWindow+Rect]::new()
        [void][RemieForegroundWindow]::GetWindowRect($handle, [ref]$rect)

        $ownerName = ""
        $ownerPath = ""
        try {
            $owner = Get-Process -Id $processId -ErrorAction Stop
            $ownerName = $owner.ProcessName
            $ownerPath = $owner.Path
        } catch {}

        $windowInfo = [ordered]@{
            id = $handle.ToInt64()
            title = $titleBuilder.ToString()
            ownerName = $ownerName
            ownerPath = $ownerPath
            bounds = [ordered]@{
                x = $rect.Left
                y = $rect.Top
                width = [Math]::Max(0, $rect.Right - $rect.Left)
                height = [Math]::Max(0, $rect.Bottom - $rect.Top)
            }
        }
        $json = $windowInfo | ConvertTo-Json -Compress
        [Console]::Out.WriteLine($json)
        [Console]::Out.Flush()
    }
    Start-Sleep -Milliseconds 250
}
