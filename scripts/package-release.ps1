$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$distPath = Join-Path $projectRoot "dist"
$browserPath = Join-Path $projectRoot "browser-extension"
$browserZip = Join-Path $distPath "RemieGPT-Browser-Helper.zip"
$checksumsPath = Join-Path $distPath "SHA256SUMS.txt"

New-Item -ItemType Directory -Path $distPath -Force | Out-Null
Compress-Archive -Path (Join-Path $browserPath "*") -DestinationPath $browserZip -Force

$artifacts = Get-ChildItem -LiteralPath $distPath -File | Where-Object {
    $_.Name -like "RemieGPT-*.exe" -or $_.Name -eq "RemieGPT-Browser-Helper.zip"
} | Sort-Object Name

if (-not $artifacts) {
    throw "No RemieGPT release files were found in $distPath"
}

$lines = foreach ($artifact in $artifacts) {
    $hash = (Get-FileHash -LiteralPath $artifact.FullName -Algorithm SHA256).Hash
    "$hash  $($artifact.Name)"
}

Set-Content -LiteralPath $checksumsPath -Value $lines -Encoding ascii
Write-Host "Created browser helper and SHA256SUMS.txt in $distPath"
