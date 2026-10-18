# Privacy Policy

Last updated: 2026-10-18

**PotPlayer launcher for Stremio** is a local browser extension. It does not
collect, store, transmit, or sell personal data.

## What the extension accesses

- **`https://web.stremio.com/*`** — the content script runs only on that origin.
- **Stremio's own `Clipboard.prototype.writeText()` call** — the content script
  runs in the page's MAIN world and wraps that method so it can tell when
  Stremio itself copies a stream link after you click **Copy stream link**. It
  inspects the string argument, uses it locally to decide whether to launch
  PotPlayer, and never sends it anywhere.

The extension does **not** call `navigator.clipboard.readText()`, does not read
the operating-system clipboard, and does not keep clipboard history.

## Permissions

The extension requests **no `chrome.*` API permissions** and no
`clipboardRead` permission. Its only host access is `https://web.stremio.com/*`,
where the content script runs.

## What the extension does not do

- No analytics, telemetry, tracking, or advertising.
- No network requests.
- No remote code or dynamically loaded scripts.
- No collection of browsing history, credentials, or personal information.

## Local data

The installer writes one per-user registry key,
`HKCU\Software\Classes\stremio-potplayer`, containing the path to PotPlayer.
No other data is stored.

## Contact

Open an issue in this repository.
