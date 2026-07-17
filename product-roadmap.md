# Product Roadmap — Tended

*Criticality-ordered, ≤1 hour per build. Structured as one roadmap per faculty, then an overall merged build order. Last updated: 2026-07-18.*

---

## Conventions used throughout

**Ghost-feature convention.** Every unbuilt metric or feature ships as a greyed card with a 🔒 "Coming soon" label, reusing the existing disabled-`enterBtn` visual pattern in `index.html`. Sha always sees the full 4-faculty, 11-metric shape even mid-build — nothing is hidden until it's finished, it's just locked.

**Onboarding-popup convention.** Every feature that asks Sha to fill something in gets a first-time onboarding popup on first open — 2–3 sentences on *why this exists* (tied to the faculty/CXO it maps to) plus a short seed form, dismissible, reusing the existing `.overlay`/`#onboardOverlay` pattern in `index.html`. A `localStorage` flag (`tended_onboarded_{feature}`) means it only auto-shows once per device; a small "?" icon re-opens it on demand. Applies to every row below that introduces a new log table.

**Count-over-judgment convention.** No new metric is a subjective 0–10 score. Everything is a count, a sum, or a dated yes/no log — see `scorecard-faculty-cxo-mapping.md` for why.

---

## Starting point: why Ruh and Qalb carry the most rows

Mind (Aqal — journal) and Body (Nafs — bookkeeping) are fully live with DB persistence. Soul (`#soul`, `index.html` line 305) and Heart (`#heart`, line 396) are both static, unpersisted checklists — checkboxes with no `db.insert` call, no history, nothing Hermes can read or the scorecard can pull from. "Ruh and Qalb are underdeveloped" doesn't mean the tiers are missing conceptually — they have UI — it means they were never wired to data. The roadmap below closes that gap first.

---

## Faculty roadmap — Nafs (Body/Money — already most developed)

| # | Product | CXO | Ghost→Live | Why now |
|---|---|---|---|---|
| N1 | Scorecard tab: RIZQ live (others ghosted) | CFO | Live | `transactions` table already has the data; cheapest fully-real slice, and `scorecard-velocity.md` flags RIZQ as the most urgent unfilled row |
| N2 | PROFIT + CASH live | CFO | Live | Same table, just expense-subtracted/buffer-tracked; near-zero marginal cost once N1 exists |
| N3 | SYSTEMS HEALTH count (tasks/energy check-ins) | COO | Ghost→Live | COO's Body Rhythm already described in `cxo-mvp-systems.md`, never counted |

## Faculty roadmap — Qalb (Heart — currently a static checklist)

| # | Product | CXO | Ghost→Live | Why now |
|---|---|---|---|---|
| Q1 | Heart checklist → persisted (`heart_log` table) | CSO/CMO | Live | Turns Qalb from decoration into data Hermes can carry forward (`ḥāfiẕa`), without ever scoring it |
| Q2 | BOARD OF DIRECTORS log (7 Gallup roles) | CSO | Live | Ensures dedicated relationship-building time is tracked as counts, not a vague "partner health" gut score |
| Q3 | CONTENT count (assets published) | CPO+CMO | Live | Simple counter, no new infra |
| Q4 | AUDIENCE count (posts + engagement) | CMO, CSO | Ghost | Blocked on Sha picking a manual-entry cadence for Irori/LinkedIn numbers — stays ghost until she does |

## Faculty roadmap — Ruh (Soul — currently a static checklist)

| # | Product | CXO | Ghost→Live | Why now |
|---|---|---|---|---|
| R1 | Soul checklist → persisted (`soul_log` table) | Soul System | Live | Same fix as Q1, for Ruh — turns checkboxes into carry-forward data |
| R2 | AQL Log + Quran Log views (read-only) | Soul System (secondary Aqal) | Live | Built 2026-07-18 — feeds R3 |
| R3 | REFLECTION DEPTH count (AQL/Quran entries + Soul checklist items this week) | Soul System | Live | Once R1+R2 exist, this is a count query — closes the Ruh gap without inventing a subjective score |
| R4 | VALUES ALIGNMENT log (dated yes/no vs. Values Lock doc) | CLO | Ghost→Live | Waits on the Values Lock / legal docs existing to check against |

## Faculty roadmap — Aqal (Mind — already most developed)

| # | Product | CXO | Ghost→Live | Why now |
|---|---|---|---|---|
| A1 | PRODUCT SPRINT count (sprint files/deliverables) | CPO | Ghost→Live | Straightforward counter once a sprint-file convention is picked |
| A2 | STACK HEALTH count (build/checkout errors, uptime checks) | CTO | Ghost→Live | Same pattern, no automation risk |
| A3 | HYPOTHESIS SCORE as evidence-entry count (0–4 SQs touched/week) | CEO | Live | Replaces the old subjective /10; just a count of this week's SQ evidence log entries |

---

## Overall merged roadmap (build order across all faculties)

| Priority | Product | Faculty | Status | Depends on |
|---|---|---|---|---|
| 1 | N1 — Scorecard tab, RIZQ live (+ Dashboard summary) | Nafs | **Built 2026-07-18** | — |
| 2 | R2 — AQL Log + Quran Log views | Ruh/Aqal | **Built 2026-07-18** | — |
| 3 | R1 — Soul checklist persisted | Ruh | Next | — |
| 4 | Q1 — Heart checklist persisted | Qalb | Next | — |
| 5 | R3 — REFLECTION DEPTH count | Ruh | Planned | R1, R2 |
| 6 | Q2 — Board of Directors log | Qalb | Planned | — |
| 7 | R4 — Values Alignment log | Ruh | Planned | Values Lock doc existing |
| 8 | N2 — Profit + Cash live | Nafs | Planned | N1 |
| 9 | N3, A1, A2 — Systems/Sprint/Stack counts | Nafs, Aqal | Planned | — |
| 10 | Q3, Q4 — Content + Audience counts | Qalb | Planned | Q4 needs cadence decision |
| 11 | A3 — Hypothesis evidence count | Aqal | Planned | — |
| 12 | Velocity Meeting Sunday brief (Hannachan-drafted) | All | Planned | 1–11 all live |

---

## Personal profile inputs (separate track, not scorecard-tied)

Gallup StrengthsFinder, Myers-Briggs, and Synastry live in **Settings** as a "Personal Profile" section (not a new tab — Settings is already the one place holding Sha-specific config both the webapp and Hermes MCP read from). Each profile has an independent on/off toggle: switching one off tells Hermes to stop flavoring its drafts/suggestions through that lens, without deleting the underlying data. None of the three are tied to a scorecard metric — they're context/flavor inputs, not tracked numbers. Not built this session; next sitting.
