# Tended — project conventions

Tended is Sha's Company of One OS: a single-file `index.html` (vanilla JS, inline CSS, Supabase REST) plus `hermes-mcp/` (Hermes' MCP server with a Trust Ladder — it can log and draft, never decide, send, or approve on Sha's behalf).

## Read this first for strategy/scorecard/CXO work

Before touching anything involving the scorecard, CXO roles, faculties, or portfolio priorities, read:
- `.hermes-context/consolidated-portfolio.md` — Sha's project portfolio, hypothesis progress, Pareto capacity
- `.hermes-context/cxo-mvp-systems.md` — the CXO-role-to-4-faculty (Aqal/Ruh/Qalb/Nafs) mapping this app is built around
- `nature-of-man.md` (repo root) — the soul-tier boundary (`vegetative → animal → rational`) that governs what Hermes may automate vs. what stays Sha-only, regardless of trust level

`.hermes-context/` is a symlink to `~/.hermes/projects/portfolio` — gitignored, personal, not part of the repo's own content.

## Governing rule for any new automated feature

Hermes/Tended may perceive, retain, count, and draft (animal tier). It may never decide, score a judgment, or interpret meaning on Sha's behalf (rational tier) — see `nature-of-man.md` Part III.A. Concretely: prefer objective counts/logs over subjective 0–10 scores wherever the underlying activity is countable.

## Docs

- `scorecard-velocity.md` — Matt Gray's Founder Velocity scorecard, adapted
- `scorecard-faculty-cxo-mapping.md` — scorecard metrics mapped to the 4 faculties and to all CXO roles
- `product-roadmap.md` — per-faculty and overall build roadmap, ≤1hr per sitting, ghost-feature convention
- `plans/` — versioned planning docs (`Plan-v{N}-{date}.md`)
