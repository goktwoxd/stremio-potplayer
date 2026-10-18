# Contributing

Thanks for taking a look. This is a small, dependency-free project: a Manifest V3
content script and a PowerShell installer. There is no build step for the
extension itself.

## Project scope

- The extension runs only on `https://web.stremio.com/*`, in the page's MAIN
  world (Chrome 111+).
- It wraps `Clipboard.prototype.writeText` and turns a successful
  **Copy stream link** write into a `stremio-potplayer:` navigation.
- The installer registers a per-user protocol handler that launches PotPlayer
  with `/clipboard /new`.
- Keep changes focused. Avoid adding frameworks or a bundler unless there is a
  strong reason.

## Development setup

1. Clone the repository.
2. Run `install\install.cmd` (or `install\install.ps1 -DryRun` to preview the
   command without changing the registry).
3. Load `extension/` from `chrome://extensions` → **Developer mode** →
   **Load unpacked**.
4. Restart Chrome with `chrome://restart`.
5. Test with content you are allowed to access.

## Localized labels

`extension/labels.js` is generated from the `CTX_COPY_STREAM_LINK` key in
[Stremio/stremio-translations](https://github.com/Stremio/stremio-translations).
Do not edit it by hand. It keeps current labels plus historical labels (see
`LEGACY_LABELS` in the generator), because Stremio Web can run against an older
translation snapshot.

To regenerate:

```powershell
git clone https://github.com/Stremio/stremio-translations.git ..\stremio-translations
python tools/update-labels.py --source ..\stremio-translations
```

Without `--source`, the script fetches the locale files through the GitHub API.
To verify the committed file is current without changing it:

```powershell
python tools/update-labels.py --check
```

The weekly `labels` workflow runs that check.

## Testing checklist

- [ ] Click **Copy stream link** in Stremio Web, with the UI in English and in
      at least one other language.
- [ ] Chrome shows the **Open PotPlayer?** prompt the first time.
- [ ] PotPlayer opens a new window and plays the stream.
- [ ] Shift-click and Alt-click copy the link **without** launching PotPlayer.
- [ ] Cancelling Chrome's prompt and clicking again still works.
- [ ] The in-player menu (`#/player`) does **not** launch PotPlayer.
- [ ] The extension shows its toast and logs `[PotPlayer launcher]` lines.
- [ ] No errors on the extension card at `chrome://extensions`.
- [ ] `node --check extension/labels.js` and
      `node --check extension/content.js` pass.
- [ ] `node tests/labels.test.js` and `node tests/content.test.js` pass.
- [ ] `powershell -ExecutionPolicy Bypass -File install/install.ps1 -DryRun`
      finds PotPlayer.

## Pull requests

- Keep PRs small and describe the behavior change.
- Update `README.md` and `CHANGELOG.md` when user-facing behavior changes.
- Do not include copyrighted posters, torrent/debrid screenshots, or addon
  names in screenshots, issues, or docs. Use public-domain or Creative Commons
  content.
- By contributing, you agree that your contribution is licensed under the
  project's [MIT license](LICENSE).

## Reporting bugs

Use the issue templates. Include Windows/Chrome/PotPlayer versions, the Stremio
UI language, steps, expected vs. actual behavior, and any console output.
**Redact stream URLs and API tokens** before pasting logs.
