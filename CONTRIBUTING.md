# Contributing

Thanks for taking a look. This is a small, dependency-free project: a Manifest V3
content script and a PowerShell installer. There is no build step for the
extension itself.

## Project scope

- The extension runs only on `https://web.stremio.com/*`.
- It turns the **Copy Stream Link** action into a `stremio-potplayer:`
  navigation.
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

## Testing checklist

- [ ] Click **Copy Stream Link** in Stremio Web.
- [ ] Chrome shows the **Open PotPlayer?** prompt the first time.
- [ ] PotPlayer opens a new window and plays the stream.
- [ ] The extension shows its toast and logs `[Stremio->PotPlayer]` lines.
- [ ] No errors on the extension card at `chrome://extensions`.
- [ ] `node --check extension/content.js` passes.
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

Use the issue templates. Include Windows/Chrome/PotPlayer versions, steps,
expected vs. actual behavior, and any console output. Redact personal
information.
