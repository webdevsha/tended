# Scorecard → Faculty → CXO Mapping

*Maps `scorecard-velocity.md`'s weekly scorecard onto Sha's 4 faculties (`.hermes-context/cxo-mvp-systems.md`) and all 11 CXO rows. Last updated: 2026-07-18.*

---

## Governing rule: count over judgment

Matt Gray's original scorecard leans on subjective 0–10 "Growth Now" scores (Team Health, Customer NPS). This mapping deliberately does **not** generalize that pattern — subjective self-scoring is what Sha is trying to move away from, not replicate across 11 rows.

Instead: **every metric that can be logged as a count, is** — posts published, engagements, touchpoints logged, evidence entries, tasks completed. This also keeps the system inside the boundary `nature-of-man.md` already sets for Hermes: it may perceive, retain, and count (animal tier), it may never decide what a number *means* or assign a judgment score (rational tier) — regardless of trust level. The one place a genuine judgment persists (VALUES ALIGNMENT) is logged as a dated yes/no checklist entry, not a floating score.

This is a deliberate departure from Matt Gray's /70 subjective-scoring ceiling — nothing here sums to a single weekly score, and that's intentional.

---

## Table 1 — Scorecard → 4 Faculties

| Metric | Faculty | What's actually logged (no subjective score) | Why |
|---|---|---|---|
| RIZQ, PROFIT, CASH | Nafs | RM actual vs. goal — auto-summed from `transactions` | Execution/money — Body Ledger |
| SYSTEMS HEALTH *(new)* | Nafs | Count of tasks logged/completed + energy check-ins done this week | COO's Body Rhythm |
| CONTENT | Qalb | Count of assets published (worksheets/posts) | CPO produces, CMO distributes |
| AUDIENCE | Qalb | Count of posts published + count of engagements (likes/comments/shares) — two numbers, no score | CMO, CSO |
| **BOARD OF DIRECTORS** *(new, replaces PARTNER HEALTH)* | Qalb | Count of touchpoints logged this week per role, plus a 0–7 coverage count | CSO — Gallup's 7-role framework, dedicated-time tracking |
| PRODUCT SPRINT *(new)* | Aqal | Count of sprint deliverables/files touched or shipped | CPO output |
| STACK HEALTH *(new)* | Aqal | Count of build/checkout errors logged, uptime checks passed | CTO — sovereign stack |
| HYPOTHESIS SCORE | Aqal | Count of SQ1–4 evidence-log entries added this week (0–4) | CEO — thesis evidence accumulation |
| VALUES ALIGNMENT *(new)* | Ruh | Dated yes/no checklist entry against the Values Lock doc | CLO — legal/values drift |
| REFLECTION DEPTH *(new)* | Ruh | Count of AQL Log entries added + Soul checklist items checked this week | Soul System — closes the previously-flagged Ruh gap |
| *(no metric)* | All 4 | N/A — CHRO | Per `cxo-mvp-systems.md`: not relevant until RM10k/mo stable — correctly absent, not a gap |

---

## Table 2 — Scorecard → CXO (all 11 rows)

| Metric | CXO Owner(s) | Note |
|---|---|---|
| RIZQ, PROFIT, CASH | CFO / Body Ledger | Sourced from `transactions` table |
| SYSTEMS HEALTH | COO | Task log + energy check-in counts |
| CONTENT | CPO (produces) + CMO (distributes) | Split ownership |
| AUDIENCE | CMO, CSO | Posts + engagement counts |
| BOARD OF DIRECTORS | CSO | 7-role touchpoint log — see below for the role list |
| PRODUCT SPRINT | CPO | Sprint file/output count |
| STACK HEALTH | CTO | Error/uptime log count |
| HYPOTHESIS SCORE | CEO (Decision Forge) | SQ evidence-entry count, 0–4/week |
| VALUES ALIGNMENT | CLO | Dated checklist log, tied to Values Lock doc |
| REFLECTION DEPTH | Soul System (Ruh) | AQL Log entries + Soul checklist count |
| — | CHRO | Deliberately unscored — dormant until RM10k/mo trigger |

11 metrics total: 7 original (reworked to be count-based) + 4 new (SYSTEMS HEALTH, PRODUCT SPRINT, STACK HEALTH, VALUES ALIGNMENT), plus BOARD OF DIRECTORS replacing PARTNER HEALTH and REFLECTION DEPTH closing the Ruh gap.

---

## Board of Directors — the 7 Gallup roles being logged

| Role | What a "touchpoint" looks like | Example from Sha's stack |
|---|---|---|
| Coach | A conversation focused on improving a specific skill | Session with Daniel/Krystal (AI Safety) |
| Mentor | Guidance from someone further along a path she's on | Sinar Fellowship advisory sync |
| Role Model | Observing/studying someone whose way of operating she wants to emulate | Content consumed + noted (could link to AQL Log tag) |
| Expert | Domain-specific advice sought for a specific problem | A one-off consult (legal, technical, financial) |
| Accountability Partner | Someone she's committed a specific outcome to, who checks in | Weekly partner sync (Sinar, TintaBudi) |
| Complementary Partner | Someone whose strengths cover her gaps on a shared project | Co-builders (Abas, Aimran, Razlan) |
| Person with Shared Interest | Connection with no work agenda, just mutual interest | Family time, WhatsApp Parent Group |

Logging captures: role, person, minutes (optional), one-line note. The scorecard card shows a touchpoint count for the week and a 0–7 coverage bar (how many distinct roles got at least one touchpoint) — both counts, no judgment score.

---

## The Ruh gap, named

Mind (Aqal — journal) and Body (Nafs — bookkeeping) are Tended's most developed faculties; Soul (Ruh) and Heart (Qalb) currently exist as static, unpersisted checklists in `index.html` (`#soul`, `#heart`) — real UI, no data behind it. REFLECTION DEPTH and the Soul/Heart persistence work in `product-roadmap.md` exist specifically to close this — turning Ruh and Qalb from decoration into data Hermes can carry forward, without ever scoring what it means. See `nature-of-man.md` Part III.B: "supply the two known things, not the third" — Hermes surfaces the pattern (AQL entries, checklist history), the *ma'rifah* stays Sha's.
