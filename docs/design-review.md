# Independent design review

Status: reviewed and revised; suitable to begin phased implementation. This is design review, not proof of a working application.

## Review process

The primary author prepared the written plan. A separate senior-architect agent proposed architecture and delivery choices; an independent critic reviewed both the requirements and the actual implementation-plan.md artifact. The primary author reconciled findings into the plan. No application tests, dependency installation, device builds or provider compatibility checks have occurred in this planning task.

## Findings and disposition

| Finding | Severity | Resolution in implementation plan |
| --- | --- | --- |
| Local notifications plus server push can duplicate/stale-alert | Blocking architecture issue | One authority per mode; synced accounts use server push. Mode handoff cancels local schedules. Offline cloud reminders remain pending sync. |
| Multiple devices make job-level delivery dedupe ambiguous | Blocking ambiguity | One primary notification device in v1; other devices can sync; switching revokes old targeting. |
| A monotonic sequence alone is not a safe sync cursor | Blocking correctness issue | Per-user transactional lock serializes feed allocation through commit; consistent snapshot recovery and delayed-transaction regression test required. |
| Habit timezone and traveling-device log dates could disagree | Blocking ambiguity | Persist habit-policy-based attribution date/timezone; shared dashboard/reminder semantics; explicit historical edits only. |
| Push feasibility was tested too late | High risk | Phase 0 physical-device development-build push spike before full reminder work; unavailable hardware keeps the gate pending. |
| Push cannot promise exactly-once or exact-time display | High risk | Best-effort delivery documented; leases, attempts, receipts, expiry and final eligibility check; late/racing alerts remain a stated limitation. |
| Cron-triggered privileged worker needs authentication | High risk | Backend-stored scheduler credential and authenticated invocation required; no anonymous privileged dispatcher. |
| AI could become required or silently alter intent | High risk | Raw capture first, optional AI, schema validation, editable preview, deterministic date/goal rules, no-key fallback. |
| Search/embeddings could leak another account's records | High risk | Database ownership enforcement and cross-account tests on tables and all RPC/search paths. |
| Full offline sync and local-only alerts expand scope | Scope risk | Narrow mutation protocol and incremental phases; bounded local schedule horizon; semantic search and external calendar deferred. |

## Accepted tradeoffs

- Native Expo app instead of a PWA to support the reminder-oriented phone workflow. A separate browser dashboard is deferred; dashboard is included in the phone app.
- Small Supabase backend instead of several services. Hosting and signing costs are not yet priced or authorized.
- Lexical search and transparent rules ship before embeddings or AI suggestions. Intelligence must improve measured usefulness.
- SQLite is app-private, not claimed encrypted. Sensitive-data encryption can be added with an explicit threat model.
- Server scheduling requires connectivity to learn about offline completions. The UI must make pending sync visible.

## Verification performed for this plan

Inspected the empty repository and checked documentation coverage for stack/architecture, local setup, phone installation, required use cases, reminder reliability, privacy, delivery phases and acceptance gates. Checked Markdown fence balance and local document links. These are document checks, not product validation.

## Remaining implementation gates

Pin mutually compatible dependency versions using current official documentation; prove closed-app push on the user's phone; implement and test RLS, commit-safe sync, DST and habit attribution; verify clean local setup; then test backup recovery and signed installation. Provider availability, SDK APIs, quotas and costs remain to be verified during implementation. Do not present planned commands as working until the scripts exist and have been exercised.

No additional product input is needed to begin implementation with the documented defaults. Phone OS/signing access and hosted deployment authorization become necessary at the corresponding device/deployment gates.
