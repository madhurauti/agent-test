# Validation record and iPhone checklist

## Automated checks

The current increment has TypeScript checks; Vitest domain, app-interaction and real SQLite tests; and an Expo iOS bundle export. Native UI components and OS APIs are mocked in interaction tests. Database integration tests use actual SQLite statements and a temporary disk file to verify persistence across close/reopen. They do not prove the expo-sqlite native bridge on iOS.

Test scenarios: blank/long input, invalid dates, future run, conservative intent suggestions, repeat mutation identity, invalid stored schema, local date/DST week boundaries, keyword/type/date search, deletion affecting progress, SQL-like input storage, invalid-write preservation, corrupt-read failure, disk-full failure, capture/search/Undo, run capture/dashboard, failed-save retry with retained input, blocked load preserving stored data, blank form rejection, editing without duplicate records, and double Save while storage is pending.

`npm run check` and `CI=1 EXPO_OFFLINE=1 npm run export:ios` are the repeatable validation commands. SDK compatibility is checked with `CI=1 EXPO_OFFLINE=1 npm exec -w @pocket/mobile -- expo install --check`, using Expo's bundled map. Online React Native Directory metadata was unavailable due to the environment's network policy; no verification settings were disabled.

## Manual iPhone acceptance — pending

Use synthetic data and record iOS version, Expo Go version, device and date when executed:

- Open through the laptop's Metro QR code. Check keyboard handling, screen scrolling, readable text and VoiceOver button/input labels.
- Capture “Explore food planning”; search FOOD and verify type filters. Search is literal keyword search, not semantic matching.
- Capture “Did a run today”; verify it suggests run, save once, see 1 / 1 for this week and its dashboard record.
- Tap Save twice quickly; verify a single record. Edit the run date to an earlier valid day and verify weekly totals.
- Add a task, complete it, reopen it, delete and Undo. Verify each action affects the intended entry.
- Close/reopen the app, then reload the JS bundle, and verify saved data remains. In airplane mode with the development bundle already loaded, capture and browse; stop/relaunch behavior may still require Metro in Expo Go.
- Try blank text, invalid calendar dates and a future run. Confirm a useful error and no extra record.
- Test large text/Dynamic Type and a small iPhone display. Verify full access to Save and navigation.

Do not mark phone acceptance or notification feasibility complete based on automated tests. Closed-app push, Apple signing, account authorization, real RLS and synchronization remain separate future gates.

## Current execution results

- TypeScript: passed.
- Vitest: 18 tests across 3 suites passed.
- Expo iOS Metro/Hermes export: passed (754 modules).
- Native dependency compatibility: bundled SDK map reports up to date; online metadata unavailable.
- Clean dependency reinstall: `npm ci --offline --ignore-scripts` passed using the lockfile/cache. Lifecycle scripts were intentionally not executed in this reinstall check.
- Physical iPhone/Expo Go interaction and native SQLite bridge: not yet tested.
- GitHub Actions execution, native signed builds, cloud sync, reminders and AI: not yet tested or implemented.
