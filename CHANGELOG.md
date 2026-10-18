# Changelog

All notable changes to this project are documented here.

## [1.0.1] - 2026-10-18

### Fixed

- Match the localized **Copy stream link** label in 50+ locales, generated from
  Stremio's translations.
- Launch PotPlayer only after Stremio's own clipboard write succeeds, removing
  clipboard polling and the risk of launching a previously copied URL.
- Removed the `clipboardRead` permission. The extension now runs in the page's
  MAIN world and inspects Stremio's `Clipboard.prototype.writeText` call.
- Removed references to a launcher variant that does not exist, and fixed the
  clipped protocol label in the diagram.
- The in-player menu (`#/player`) no longer launches PotPlayer.

### Changed

- CI uses `actions/checkout@v6`, `actions/setup-node@v6`,
  `actions/upload-artifact@v6`, and Node 24; added Dependabot for
  GitHub Actions.
- The release version now comes from `extension/manifest.json`; CI parses every
  PowerShell file instead of only `install.ps1`.
- The installer gained `-PotPlayerPath` and a fallback that reads PotPlayer's
  own `potplayer:` protocol command.
- Toast is announced via `role="status"` / `aria-live="polite"`; console
  logging no longer includes stream URLs.

## [1.0.0] - 2026-10-18

### Added

- Manifest V3 Chrome extension that hooks Stremio Web's **Copy Stream Link**
  action.
- `stremio-potplayer:` protocol installer (per-user, no admin).
- PotPlayer launch via `/clipboard /new`.
- Clipboard confirmation with a toast and console logging.
- README, MIT license, SVG diagram, icon generator, and release packaging
  script.
