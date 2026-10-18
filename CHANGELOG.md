# Changelog

All notable changes to this project are documented here.

## [1.0.2] - 2026-10-18

### Fixed

- Added six historical translation labels (French, Italian, Portuguese, Danish,
  Vietnamese, Hungarian) so Stremio Web snapshots that still use the 29 Sep
  translations keep working.
- `tools/update-labels.py` now preserves existing and historical labels, skips
  a bad remote locale file instead of aborting, and supports `--check`.
- Added a weekly `labels` workflow that fails when Stremio changes a label.
- Documented the protocol/clipboard security model and the Windows Clipboard
  History / cross-device sync caveat.
- Corrected the README's stream-menu instructions: the stream row menu opens
  with right-click, Ctrl+click, or long-press, not a `···` button.
- Added download/extract and SmartScreen guidance to the install steps.

### Changed

- CI uses `actions/checkout@v7`, `actions/setup-node@v7`, and
  `actions/upload-artifact@v7`; Dependabot now groups future action bumps into
  one PR.
- CI runs once per pull request instead of twice, and runs the new behaviour
  tests.
- Shift-click or Alt-click now copies the link without launching PotPlayer.
- `isCopyItem` no longer reads text from container elements; it only checks leaf
  nodes with short text. The temporary label global is deleted after reading.
- The installer no longer probes the 32-bit `Program Files (x86)` location,
  since the project supports 64-bit PotPlayer only.
- Updated `package.ps1` header, issue-template version placeholder, and the
  changelog's rename note.

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
- Renamed the extension from "Stremio to PotPlayer" to
  "PotPlayer launcher for Stremio".

## [1.0.0] - 2026-10-18

### Added

- Manifest V3 Chrome extension that hooks Stremio Web's **Copy Stream Link**
  action.
- `stremio-potplayer:` protocol installer (per-user, no admin).
- PotPlayer launch via `/clipboard /new`.
- Clipboard confirmation with a toast and console logging.
- README, MIT license, SVG diagram, icon generator, and release packaging
  script.
