# Local Codex handoff: Pocket Memory

## Mission and working style

Continue the existing project on the user's Mac, not in a cloud execution environment. The user is new to developer tools and wants the agent to perform setup and troubleshooting, with minimal manual involvement. Explain outcomes in simple language. Execute authorized, reversible work instead of returning a list of commands for the user. Ask only when access, a system permission, a physical phone interaction, or an actual product choice blocks progress. Do not claim Mac access until shell evidence confirms it.

Immediate goal: establish a working Mac development environment, run validation, start the app, and help the user open and test it on their iPhone with Expo Go. Do not expand into cloud deployment while local testing is pending.

## Context carried from cloud

- User: wants to remember spontaneous ideas; complete recurring chores such as trash every Thursday night; say “did a run today”; aim for at least one run weekly; receive sensible reminders; view all data in an intelligent searchable dashboard.
- Phone: iPhone. Computer: Mac. User initially used ChatGPT's Codex cloud section, which does not give that agent Mac shell access.
- The design was prepared with a separate architect and independent critic. See implementation-plan.md and design-review.md for decisions and resolved findings.
- Repository: https://github.com/madhurauti/agent-test.git, branch main. Initial app commit: 018cac0. Later handoff documentation commits may follow; use current main without resetting existing local work.
- No cloud accounts, credentials, Apple signing or hosted services have been configured. No need to obtain them for the current increment.

## Delivered and verified

TypeScript npm workspace:

- apps/mobile: Expo SDK 58 / React Native app, SQLite storage, four screens (Today, Capture, Search, Dashboard).
- packages/domain: Zod schemas, input/date validation, conservative run-intent suggestion, keyword search, weekly aggregation and idempotent upsert.
- tests: domain, React interaction with mocked native APIs, and real SQLite tests using Node's SQLite engine.
- package-lock.json, .nvmrc and GitHub Actions validation workflow.

Implemented: idea/task/run capture, edit, task complete/reopen, deletion with confirmation, one-step session Undo, keyword/type/date search, weekly run target one, dashboard, persistent SQLite and explicit load/save errors. No accounts or API keys needed. Capture type/date are visible and editable; no model silently creates a commitment.

Cloud results: strict app TypeScript checking passed; 18 tests across 3 files passed; Metro/Hermes iOS export passed (754 modules). Expo bundled compatibility map reported dependencies up to date; online React Native Directory endpoint was blocked by cloud network policy. Lockfile reinstall with `npm ci --offline --ignore-scripts` succeeded. These are cloud results, not local results: rerun on Mac. No physical iPhone test, signed native build or remote GitHub Actions result has been confirmed.

Not implemented: reminders, recurring chore rules, cloud sync/auth, export/restore, semantic search/AI, stable user-editable home timezone and dedicated signed iPhone builds. Local SQLite is not claimed encrypted or backed up. Unsaved capture text and Undo do not survive process termination. Use synthetic data first. Do not represent this milestone as the full planned app.

## Read first

Read README.md, docs/mac-setup.md and docs/validation.md. Refer to docs/implementation-plan.md for future scope. Today's actual commands are in README.md, not the provisional pnpm/backend commands in the architecture plan. Current implementation uses npm workspaces and the Expo blank entry rather than Expo Router; these are documented simplifications.

## Local execution checklist

1. Confirm `pwd`, `uname -s`, `uname -m`, `sw_vers` and current tool availability. Expected OS is Darwin; repository should be under a Mac path such as ~/Developer/agent-test. If execution still reports Linux or /workspace, stop local setup and explain that the session is still remote. Do not install Mac tools into cloud.
2. Inspect Git status and any applicable AGENTS.md. Preserve all user changes. If no checkout exists, clone main into ~/Developer/agent-test after checking the destination does not already exist. Never overwrite, reset or delete an existing checkout to simplify setup.
3. Check `git --version`, `node --version`, `npm --version`, `command -v brew` and available version managers without printing secret values. Reuse working tools. Node is pinned to 24.19.0 in .nvmrc; package engines permit Node 24. Use the pin where available.
4. If Git needs Apple Command Line Tools, trigger the supported installer and explain that the user must accept its macOS UI. For Node, prefer an existing version manager or package manager; otherwise use the official Node.js macOS installer with signature verification preserved. Do not execute an unverified shell installer, disable TLS, use sudo unnecessarily or change the user's unrelated global defaults. Installation approval follows the local execution tool's permission policy. The user has asked for setup; don't ask repeatedly about routine project dependencies.
5. If GitHub read fails, inspect the operation and reuse existing authenticated tooling. Do not request secret values in chat. Browser sign-in or a system credential prompt may require the user's interaction. Do not assume a token is missing because GH_TOKEN is unset.
6. Run `npm ci` at repository root, then `npm run check`. Expect 18 existing tests unless implementation changes intentionally add tests. Preserve command exit statuses. Diagnose failures rather than hiding them or modifying assertions to pass.
7. Run `CI=1 EXPO_OFFLINE=1 npm run export:ios` for the existing bundle smoke check. This is an iOS JavaScript export, not an Xcode app build. Normal Mac network access may allow additional official compatibility checks; report what was actually verified.
8. Start `npm start` in a persistent terminal/session from repository root. Inspect Metro output, keep the process alive while the user tests, and report the actual connection instructions/QR output. Do not invent a QR code, address or phone-accessible link.
9. The user must install Expo Go on their iPhone, allow local-network access if asked, and scan Metro's QR code while both devices are on the same trusted Wi-Fi. A Mac shell cannot do the physical phone actions. Collect exact errors if connection fails.
10. Verify current Expo Go's supported SDK against the project (58). It has not been tested on this user's device. If incompatible, consult current official Expo guidance before a deliberate SDK migration or development-build alternative. Do not promise that any App Store Expo Go version will run this SDK.
11. Work through docs/validation.md with the user. Check persistence after actual app reload, interaction/accessibility/keyboard behavior, and database bridge behavior. Expo Go may need Metro to reopen a project; distinguish bundle availability from saved data. Record device/iOS/Expo versions and passed/failed/unrun results without claiming delivery of notifications.
12. Finish with precise local validation results, any remaining blocker and the next milestone. Update documentation with newly observed facts. Ask before paid services, public deployment, Apple membership purchases or unrelated machine-wide changes. Do not push additional changes unless requested.

## Troubleshooting boundaries

- Mac localhost and cloud localhost are different; the phone cannot reach a cloud container's private Metro address.
- LAN is the initial path. Diagnose Wi-Fi isolation, permission and firewall before proposing a tunnel. Don't disable system security to force connectivity. A tunnel may add a dependency/expose Metro; explain before enabling it.
- Xcode's full app, Homebrew, Docker, Supabase and an Apple Developer membership are not prerequisites for this Expo Go increment. Only install what the actual workflow requires.
- Expo Go is a development host, not a standalone app. A closed-app reminder feasibility test remains a later physical-device gate requiring proper native build/signing configuration.
- Cloud execution used proxy settings; do not copy cloud-specific proxy configuration or credentials to the Mac.

## Later architecture guardrails

Use one reminder authority per mode and one primary notification device initially. Push is best effort; an offline completion cannot cancel a server notification until synced. Keep IANA timezone policies explicit and stable habit-date attribution. Sync requires idempotent mutation IDs, revisions, and commit-safe feed allocation, not merely a PostgreSQL sequence. AI is optional and schema-validated; deterministic code owns dates and goal counts. All account data/search needs ownership enforcement. These features are not needed to finish the current local handoff.
