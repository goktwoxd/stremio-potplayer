# Privacy Policy

Last updated: 2026-10-18

**Stremio Web → PotPlayer** is a local browser extension. It does not collect,
store, transmit, or sell personal data.

## What the extension accesses

- **`clipboardRead`** — after you click **Copy Stream Link** in Stremio Web, the
  content script reads the clipboard once to confirm it contains an `http(s)`
  URL. The URL is used locally to decide whether to launch PotPlayer; it is not
  sent anywhere.
- **`https://web.stremio.com/*`** — the content script runs only on that origin
  to detect the menu click.

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
