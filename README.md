# Pocket Memory

An iPhone-first personal memory app: capture ideas and tasks, log runs, search saved entries and see weekly progress. This first increment works locally without accounts or API keys.

For a local Codex agent, start with [the complete handoff](docs/local-agent-handoff.md).

For a beginner-friendly Mac walkthrough, see [Mac setup](docs/mac-setup.md).

## Run locally and try on iPhone

1. Install Git and Node **24.19.0** (`nvm install && nvm use` if you have nvm).
2. Clone this repository and open its directory in a terminal. If the changes have not been pushed yet, transfer this working checkout first; a fresh GitHub clone will not contain unpushed work.
3. Run `npm ci` from the repository root.
4. Run `npm run check` to execute TypeScript checking and automated tests.
5. Install **Expo Go** on your iPhone from the App Store. This project uses **Expo SDK 58**; Expo Go must support that SDK. If it reports an SDK mismatch, record the installed Expo Go version before adjusting the project's SDK or using a development build.
6. Connect the phone and laptop to the same trusted Wi-Fi. Run `npm start` from the repository root and scan its QR code with the iPhone Camera. Allow local-network access if iOS asks.
7. Keep Metro running while using this development session. VPN/firewall/client-isolation settings may block LAN access. A tunnel is optional and may require an additional package/service; it has not been tested here.

The cloud workspace's localhost/QR address is not a phone-accessible preview. Start Metro on your laptop for this walkthrough. You do not need Docker, Supabase, an Apple Developer membership or an AI account for this increment. A signed standalone app and cloud-backed reminders are later milestones.

## What works

- Today, Capture, Search and Dashboard screens.
- Ideas, tasks and dated run logs; narrowly recognized “did a run today” suggestions that remain editable.
- SQLite persistence, editing, task completion/reopening, deletion confirmation and one-step Undo.
- Monday–Sunday running progress with target one; dashboard links to underlying run/idea records through displayed lists.
- Case-insensitive keyword AND search with type filters and date search.
- Validation of input and stored snapshots, future-run rejection, serialized saves, explicit load/save errors.

All data stays in app-private SQLite. It is **not claimed encrypted** and has no backup/sync yet. Removing the app or its Expo Go project data may erase it. Undo is session-only. Unsaved text is not persisted. Use non-sensitive test data until export/backup is implemented. Device timezone is used at launch and saved on individual records; editable home-timezone settings and stable per-habit timezone policies are still planned.

## Validation

```sh
npm run check
CI=1 EXPO_OFFLINE=1 npm run export:ios
```

`check` runs TypeScript and Vitest. Tests cover domain boundaries, app interactions with mocked native components, and real SQLite close/reopen persistence using Node's SQLite engine. iOS export compiles the Metro/Hermes bundle; it is not an Xcode build or proof of native-device behavior. GitHub Actions is configured for these checks but has not run remotely yet.

See [validation and device checklist](docs/validation.md), [architecture plan](docs/implementation-plan.md) and [design review](docs/design-review.md).

## Scope still ahead

Recurring chores, scheduled notifications, account login, cloud sync, export/restore, semantic search/AI and signed iPhone installation are not implemented. The core app remains useful without them. The design plan describes future architecture; the commands in this README describe today's implementation.

Implementation choice: npm workspaces and package-lock.json provide a minimal reproducible workspace, replacing the plan's provisional pnpm choice. Expo's blank entry is used rather than Router for the four initial screens; routing can be introduced as navigation grows. No backend has been scaffolded prematurely, so RLS and sync gates remain pending.
