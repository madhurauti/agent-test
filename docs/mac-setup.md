# Continue on a Mac and test on iPhone

This cloud chat cannot run commands on your Mac. Use the steps below in macOS Terminal, or open the cloned folder in a Codex session that explicitly uses a local environment. Never paste credentials into chat.

## 1. Install the minimum tools

1. Open **Terminal** using Spotlight (Command–Space, type Terminal, Return).
2. Run `git --version`. If macOS prompts to install Command Line Tools, accept and let installation finish. If Git is unavailable without a prompt, run `xcode-select --install`, finish the installer, then retry `git --version`.
3. Install **Node.js 24 LTS** from https://nodejs.org using its macOS installer. Reopen Terminal, then run `node --version` and `npm --version`. This project was validated on Node 24.19.0; use that version when practical. Do not choose a different major merely because it is newer. If Node 24 is already installed, reuse it.
4. Install **Expo Go** on the iPhone from the App Store. No global Expo CLI is needed: the repository includes its CLI.

You do not need Xcode's full app, Homebrew, Docker, Supabase, an AI API key or an Apple Developer membership for the current local-only Expo Go test. Dedicated iOS builds and push notifications are a later setup.

## 2. Download the code

In Terminal:

```sh
mkdir -p ~/Developer
cd ~/Developer
git clone https://github.com/madhurauti/agent-test.git
cd agent-test
npm ci
npm run check
npm start
```

If `agent-test` already exists, do not overwrite it. Open it and check its Git status before updating. If cloning reports an authentication error, verify access to the repository in your browser. For a private repository use GitHub's supported HTTPS authentication or existing Git tooling; do not use your account password or share tokens in chat.

## 3. Open on the iPhone

1. Keep the Mac's terminal running and connect both devices to the same trusted Wi-Fi.
2. Scan the QR code with the iPhone Camera and tap to open Expo Go.
3. Allow local-network access if prompted. If an SDK mismatch is reported, capture the exact message: the project currently targets Expo SDK 58, and the installed Expo Go must support it. Do not randomly upgrade dependencies to bypass a mismatch.
4. If a firewall/VPN blocks the connection, inspect those settings and the Wi-Fi network. The initial test uses LAN; no tunnel has been verified.
5. Save “Explore food planning,” log a run, inspect Dashboard and Search, then close/reopen and confirm saved data remains. Follow the full checklist in validation.md.

Expo Go is a development host, not a standalone app installation. The Mac serves its JavaScript bundle. Reminders, cloud sync and signed standalone iPhone builds are not part of this increment.

## 4. If continuing with local Codex

Open `~/Developer/agent-test` as the project directory in a supported local Codex app/CLI workflow. Verify the session reports this Mac path rather than `/workspace/agent-test`. Ask it to read README.md, docs/mac-setup.md and docs/validation.md, then run `npm ci` and `npm run check` and help start Expo. A new local session may not inherit this cloud conversation; these documents preserve the handoff.
