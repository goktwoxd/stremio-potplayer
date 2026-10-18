#Requires -Version 5.1
[CmdletBinding()]
param(
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$protocolKey = "HKCU:\Software\Classes\stremio-potplayer"

Write-Host ""
Write-Host "PotPlayer launcher for Stremio - protocol uninstaller" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $protocolKey)) {
    Write-Host "Nothing to remove: $protocolKey does not exist."
    exit 0
}

if ($DryRun) {
    Write-Host "Dry run: would remove $protocolKey" -ForegroundColor Yellow
    exit 0
}

Remove-Item -Path $protocolKey -Recurse -Force
Write-Host "Removed $protocolKey" -ForegroundColor Green
Write-Host ""
Write-Host "The extension can now be removed from chrome://extensions."
