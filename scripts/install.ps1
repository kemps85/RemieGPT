[CmdletBinding()]
param(
    [string]$CodexHome
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($CodexHome)) {
    if (-not [string]::IsNullOrWhiteSpace($env:CODEX_HOME)) {
        $CodexHome = $env:CODEX_HOME
    }
    else {
        $CodexHome = Join-Path $env:USERPROFILE ".codex"
    }
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$packageDir = Join-Path $repoRoot "pet\remi"
$manifest = Join-Path $packageDir "pet.json"
$spritesheet = Join-Path $packageDir "spritesheet.webp"

if (-not (Test-Path -LiteralPath $manifest -PathType Leaf)) {
    throw "Missing package file: $manifest"
}

if (-not (Test-Path -LiteralPath $spritesheet -PathType Leaf)) {
    throw "Missing package file: $spritesheet"
}

$petConfig = Get-Content -LiteralPath $manifest -Raw | ConvertFrom-Json

$destination = Join-Path (Join-Path $CodexHome "pets") $petConfig.id
New-Item -ItemType Directory -Path $destination -Force | Out-Null

Copy-Item -LiteralPath $manifest -Destination (Join-Path $destination "pet.json") -Force
Copy-Item -LiteralPath $spritesheet -Destination (Join-Path $destination "spritesheet.webp") -Force

Write-Host ""
Write-Host "Remi installed to:"
Write-Host "  $destination"
Write-Host ""
Write-Host "Open Codex, go to Settings > Pets, select Refresh, then choose Remi."
Write-Host "Use /pet to wake or tuck away the pet."
