---
target: AiMY Knowledge settings surface
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 1
timestamp: 2026-09-01T11-27-13Z
slug: assets-settings-js
---
Method: dual-agent (A: design review, browser-verified · B: deterministic evidence, isolated)
Surface mode: Operate. Reviewed at 1536x900, both themes, five views.

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 2 | Spine notes stale after in-place edits; Retention consequence never recalculated; no aria-live |
| 2 | Match system / real world | 4 | Strongest dimension. "It deletes nothing — that is Sync" |
| 3 | User control and freedom | 1 | Discard destroyed all unsaved edits, no confirm, no undo |
| 4 | Consistency and standards | 3 | "Delete now" styled as "Test sync"; "Rotate" as "Copy" |
| 5 | Error prevention | 2 | Exemplary delete modal fed by a count the page computed wrong |
| 6 | Recognition rather than recall | 3 | One FreshDesk 401 shown as two unlinked facts in two modules |
| 7 | Flexibility and efficiency | 3 | URL-as-state, bulk select strong; no shortcuts, no saved scopes |
| 8 | Aesthetic and minimalist design | 3 | Five type sizes in a 3px band |
| 9 | Diagnose and recover from errors | 4 | Failures section best-in-class |
| 10 | Help and documentation | 3 | Inline help everywhere; no first-run orientation |
| Total | | 28/40 | Good, with one dangerous hole |

## Design specificity

Writing and data model deeply specific; composition category-default, executed well.
Authored: section order is the record's lifecycle; wouldDelete() computes blast radius;
FIXES picks repair from cause; delete cascade names second-order casualties by name.
Category-default: numbered sticky spine (docs-site pattern), person cards, roles matrix,
filter bar. Strip the copy and nothing identifies this as a CRM-sync console.

## Deterministic scan caveat

Impeccable detector returned [] — a BLIND SPOT, not a clean bill. Proven by controlled
A/B: identical CSS inline in <style> fires two rules; linked, it fires zero. All 614KB
of CSS here is external, so the scan saw HTML structure only.

## Priority issues

[P0] FIXED — Retention consequence line lied about a destructive act.
settings.js:3792 targeted .set2-row/.set2-row-d; secRetention renders .set2-set-row/
.set2-set-d. $ falls back to document when root is null, found nothing, threw — after
r.days = v had already mutated the model. Row said 2,105; modal said 3,976. Directional:
always understated damage as the threshold got more destructive.
Fix: single retentionSays(r) used by both renderer and handler.

[P1] FIXED — Inverted friction gradient. Discard destroyed all unsaved work on one click
on an 11px link; Rotate had no handler at all. Both now confirm, naming what is lost.
No typed gate — that toll is for unrecoverable record deletion.

[P2] FIXED — Spine indexed every state except the one the user created. is-dirty ring +
recomputed note + unified unsaved count (was two code paths, showed "1" for 2 changes).

[P2] Retention scope ambiguity — stage note picked one CRM's threshold while the section
lists several. Now summarises the section: total records the whole section would delete.

[P3] FIXED — "Window" renamed "Lookback". Nobody's model contains a noun called Window.

## Code health (Assessment B)

- 33 top-level duplicate selectors; 27 collapsed, 3 excluded as unsafe (moving them
  flipped equal-specificity winners, proven by render diff).
- 43 dead classes / 82 dead rules removed — five orphaned components.
- settings.css 104,679 -> 81,666 bytes (-22%), rendering byte-identical across 1,458
  elements x 26 properties x 2 themes x 5 views.

## Open (not fixed)

- Two textareas in knowledge.js (.xm-text, .rp-what) have no visible focus indicator.
  WCAG 2.4.7 failure, outside settings.css.
- .aimy-float-wrap / .aimy-overlay z-index declared twice in knowledge.css.
- No z-index scale: 31 ad hoc values, -1 to 9999, zero tokens.
- 18 font-sizes off the type scale (14 pre-existing in shipped chrome).
- One incident, two modules: FreshDesk 401 appears on Enablement and in Failures with
  no link between them.
- Roles matrix: 72 cells that look interactive. Copy now says it is a reference.
- Person card fixed height (15.5rem) hides content on the densest record.
- The spine's 01-06 numerals promise a sequence the task does not have.
