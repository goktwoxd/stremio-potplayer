#Requires -Version 5.1
[CmdletBinding()]
param(
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$scheme = "stremio-potplayer"
$protocolKey = "HKCU:\Software\Classes\$scheme"
$extensionPath = Join-Path (Split-Path -Parent $PSScriptRoot) "extension"

function Find-PotPlayer {
    $candidates = New-Object System.Collections.Generic.List[string]

    $registryKeys = @(
        "HKCU:\Software\DAUM\PotPlayer64",
        "HKLM:\SOFTWARE\DAUM\PotPlayer64",
        "HKLM:\SOFTWARE\WOW6432Node\DAUM\PotPlayer64",
        "HKCU:\Software\DAUM\PotPlayerMini64",
        "HKLM:\SOFTWARE\DAUM\PotPlayerMini64",
        "HKLM:\SOFTWARE\WOW6432Node\DAUM\PotPlayerMini64"
    )

    foreach ($key in $registryKeys) {
        try {
            $value = (Get-ItemProperty -Path $key -Name "ProgramPath" -ErrorAction Stop).ProgramPath
            if ($value) { $candidates.Add($value) }
        } catch {
            # Key/value not present; try the next one.
        }
    }

    if ($env:ProgramFiles) {
        $candidates.Add((Join-Path $env:ProgramFiles "DAUM\PotPlayer\PotPlayerMini64.exe"))
    }
    if (${env:ProgramFiles(x86)}) {
        $candidates.Add((Join-Path ${env:ProgramFiles(x86)} "DAUM\PotPlayer\PotPlayerMini64.exe"))
    }

    foreach ($candidate in $candidates) {
        if ($candidate -and (Test-Path -LiteralPath $candidate -PathType Leaf)) {
            return (Resolve-Path -LiteralPath $candidate).Path
        }
    }

    return $null
}

Write-Host ""
Write-Host "Stremio -> PotPlayer protocol installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$potPlayer = Find-PotPlayer
if (-not $potPlayer) {
    Write-Host "PotPlayer was not found." -ForegroundColor Red
    Write-Host "Install the 64-bit PotPlayer first, then run this again."
    Write-Host "If PotPlayer is in a custom folder, set `$potPlayer manually in this script."
    exit 1
}

# /clipboard makes PotPlayer read the stream URL Stremio just copied.
# /new asks for a fresh PotPlayer window for every launch.
$command = "`"$potPlayer`" /clipboard /new"

Write-Host "PotPlayer: $potPlayer" -ForegroundColor Green
Write-Host "Protocol:  $scheme"
Write-Host "Command:   $command"
Write-Host ""

if ($DryRun) {
    Write-Host "Dry run: no registry changes were made." -ForegroundColor Yellow
    Write-Host "The real run would create: $protocolKey"
    exit 0
}

New-Item -Path $protocolKey -Force | Out-Null
Set-ItemProperty -Path $protocolKey -Name "(default)" -Value "URL:PotPlayer Protocol"
New-ItemProperty -Path $protocolKey -Name "URL Protocol" -Value "" -PropertyType String -Force | Out-Null

New-Item -Path "$protocolKey\DefaultIcon" -Force | Out-Null
Set-ItemProperty -Path "$protocolKey\DefaultIcon" -Name "(default)" -Value "`"$potPlayer`",0"

New-Item -Path "$protocolKey\shell\open\command" -Force | Out-Null
Set-ItemProperty -Path "$protocolKey\shell\open\command" -Name "(default)" -Value $command

Write-Host "Registered '$scheme' for the current user (no admin needed)." -ForegroundColor Green
Write-Host ""
Write-Host "Next:" -ForegroundColor Cyan
Write-Host "  1. Open chrome://extensions and turn on Developer mode."
Write-Host "  2. Click 'Load unpacked' and select:"
Write-Host "     $extensionPath"
Write-Host "  3. Restart Chrome (open chrome://restart) so it picks up the new protocol."
Write-Host "  4. In Stremio, click 'Copy Stream Link' and tick 'Always allow'."
Write-Host ""
Write-Host "To undo, run uninstall.cmd (or uninstall.ps1)."
