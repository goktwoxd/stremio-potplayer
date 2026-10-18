# Build a release zip with the extension, installer, docs, tools, and project docs.
[CmdletBinding()]
param(
    [string]$Version
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $root "extension\manifest.json"
$manifest = Get-Content -Path $manifestPath -Raw | ConvertFrom-Json
if (-not $Version) {
    $Version = $manifest.version
}
if (-not $Version) {
    throw "No version found. Set 'version' in extension\manifest.json."
}

$dist = Join-Path $root "dist"
$stage = Join-Path $dist "stage"
$zip = Join-Path $dist "stremio-potplayer-$Version.zip"

if (Test-Path $stage) {
    Remove-Item -Path $stage -Recurse -Force
}
New-Item -ItemType Directory -Path $stage -Force | Out-Null

Copy-Item -Path (Join-Path $root "extension") -Destination (Join-Path $stage "extension") -Recurse
Copy-Item -Path (Join-Path $root "install") -Destination (Join-Path $stage "install") -Recurse
Copy-Item -Path (Join-Path $root "docs") -Destination (Join-Path $stage "docs") -Recurse
Copy-Item -Path (Join-Path $root "tools") -Destination (Join-Path $stage "tools") -Recurse
Copy-Item -Path (Join-Path $root "README.md") -Destination $stage
Copy-Item -Path (Join-Path $root "LICENSE") -Destination $stage
Copy-Item -Path (Join-Path $root "PRIVACY.md") -Destination $stage
Copy-Item -Path (Join-Path $root "CONTRIBUTING.md") -Destination $stage
Copy-Item -Path (Join-Path $root "CHANGELOG.md") -Destination $stage

if (Test-Path $zip) {
    Remove-Item -Path $zip -Force
}
Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $zip -CompressionLevel Optimal
Remove-Item -Path $stage -Recurse -Force

Write-Host "Wrote $zip" -ForegroundColor Green
