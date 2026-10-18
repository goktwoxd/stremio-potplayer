# Stremio Web → PotPlayer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Platform: Windows](https://img.shields.io/badge/platform-Windows-0078D6)
![Manifest V3](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4)

A tiny Chrome extension that hands Stremio Web's **Copy Stream Link** action to
PotPlayer on Windows. One click, Chrome's **"Open PotPlayer?"** prompt, and the
stream opens in a new PotPlayer window.

No helper executable, no native messaging, no admin rights.

![How it works](docs/how-it-works.svg)

## Features

- One click from Stremio's stream menu — no copy/paste dance.
- Chrome's familiar external-protocol prompt; tick **Always allow** once and it
  won't ask again.
- PotPlayer reads the link from the clipboard itself (`/clipboard`), so the URL
  never passes through Chrome's URL parser.
- Per-user install (`HKCU`), no administrator rights.
- Minimal permissions: `clipboardRead` + access to `web.stremio.com` only.
- No network requests, telemetry, or remote code.

## How it works

1. You click **Copy Stream Link** in Stremio Web. Stremio writes the stream URL
   to the clipboard.
2. The extension waits for the write, checks that the clipboard contains an
   `http(s)` URL, then opens `stremio-potplayer:go`.
3. Chrome shows **"Open PotPlayer?"**. After you allow it the first time, it
   launches the registered handler directly.
4. Windows runs:

   ```
   "…\PotPlayerMini64.exe" /clipboard /new
   ```

5. PotPlayer reads the URL from the clipboard and opens it in a new window.

The URL never leaves your machine. The extension does not download or proxy
anything; it only reads the clipboard to confirm Stremio copied a URL.

## Install

**Requirements:** Windows 10/11, Google Chrome (or another Chromium browser with
MV3 + external-protocol support), and 64-bit PotPlayer.

### 1. Register the protocol

Double-click [`install\install.cmd`](install/install.cmd). It finds PotPlayer
and writes a per-user `stremio-potplayer:` handler.

To preview the command without changing the registry:

```powershell
powershell -ExecutionPolicy Bypass -File install\install.ps1 -DryRun
```

### 2. Load the extension

1. Open `chrome://extensions`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked** and select the [`extension`](extension) folder.

### 3. Restart Chrome

Open `chrome://restart` (or quit Chrome completely and reopen). Chrome reads
external-protocol registrations at launch.

## Use

1. Open <https://web.stremio.com> and choose a title.
2. Open the stream menu (`···` or right-click) and click **Copy Stream Link**.
3. Chrome shows **"Open PotPlayer?"** — tick **Always allow …** and click **Open**.
4. PotPlayer opens a new window and plays the stream.

After the first **Always allow**, the prompt is skipped.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Nothing happens when clicking Copy Stream Link | Is the extension loaded at `chrome://extensions`? Any errors on its card? Did you restart Chrome after installing the protocol? |
| Chrome never shows the "Open PotPlayer?" prompt | Run `install\install.cmd` again and confirm it ends with **Registered**. Verify the key with `reg query HKCU\Software\Classes\stremio-potplayer\shell\open\command`. |
| The prompt appears every time | Tick **Always allow** in the prompt. The choice is per Chrome profile; incognito won't remember it. |
| PotPlayer opens but plays the previous/incorrect video | Stremio's copy may not have reached the clipboard. The extension waits up to ~2 s and shows a toast if it can't read a URL. Try again, or test `Ctrl+V` into PotPlayer manually. |
| PotPlayer opens its Open URL dialog instead of playing | This build relies on PotPlayer's `/clipboard` switch. If your build doesn't auto-play, use the launcher variant (the extension passes the URL explicitly). |
| Every stream reuses the same PotPlayer window | `/new` may not combine with `/clipboard` on your build. In PotPlayer, open `F5` → **General** → **Multiple instances** and allow multiple instances, or use the launcher variant. |
| "PotPlayer was not found" in the installer | Install 64-bit PotPlayer, or edit `$potPlayer` in [`install\install.ps1`](install/install.ps1). |

The extension logs to the page console with the `[Stremio->PotPlayer]` prefix
(`F12` → Console).

## Privacy & permissions

| Permission | Why |
| --- | --- |
| `clipboardRead` | Confirms Stremio actually copied an `http(s)` URL before launching PotPlayer. |
| `https://web.stremio.com/*` | The content script runs only on Stremio Web. |

There are no network requests, analytics, or remote scripts. The protocol
handler and the extension both run locally.

## Uninstall

1. Run [`install\uninstall.cmd`](install/uninstall.cmd) to remove
   `HKCU\Software\Classes\stremio-potplayer`.
2. Remove the extension from `chrome://extensions`.

## FAQ

### Why not use PotPlayer's built-in `potplayer:` protocol?

PotPlayer already registers `potplayer:`, but Chrome 130+ parses
`potplayer://http://…` as `potplayer://http//…`, which makes PotPlayer report
"file not found" ([Chromium issue 373928202](https://issues.chromium.org/issues/373928202)).
This project sends a constant URL (`stremio-potplayer:go`) and lets PotPlayer
read the real URL from the clipboard, sidestepping the parser entirely.

### Does it work in Edge or Brave?

It should. The protocol is registered per Windows user, and the extension is
standard Manifest V3. Load it from `edge://extensions` (or the browser's
equivalent) and allow the prompt once.

### Does it support subtitles, titles, or resume position?

Not yet. PotPlayer reads only the URL from the clipboard. Passing extra
`/sub`, `/title`, or `/seek` switches would require the launcher variant.

### Why does the extension need clipboard access?

Stremio exposes the link through the clipboard. The extension reads it only to
confirm the copy succeeded; if the clipboard doesn't contain an `http(s)` URL,
it shows a toast and does not launch PotPlayer.

## Disclaimer

This is an unofficial community project. It is **not affiliated with, endorsed
by, or sponsored by** Stremio or PotPlayer. Stremio and PotPlayer are trademarks
of their respective owners.

This project does not provide, host, download, or distribute any media. It only
hands a URL that is already on your clipboard to a local media player. You are
responsible for using it only with content you are legally allowed to access,
and for complying with copyright law and the terms of service of any service you
use.

The software is provided "as is", without warranty of any kind.

## License

[MIT](LICENSE)
