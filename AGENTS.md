# Project instructions

For a cloud-to-Mac handoff or first local setup, read `docs/local-agent-handoff.md` before acting. Verify the actual execution environment; opening a cloud conversation on a Mac does not move its shell.

Use the existing checkout and preserve local changes. Current commands and delivered scope are in README.md; architecture-plan commands for future backend phases are not implemented yet. Use Node 24 and npm with package-lock.json. Validate changes with `npm run check`; for mobile bundle changes also run the documented iOS export. Do not claim physical iPhone or notification behavior from mocked tests or JavaScript bundle export.

Keep secrets out of source and logs. The app currently works without cloud accounts. Do not add paid services or deploy externally as part of local setup without authorization.
