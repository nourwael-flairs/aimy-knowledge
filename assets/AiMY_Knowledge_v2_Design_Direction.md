# AiMY Knowledge v2 Design Direction

| | |
|---|---|
| **Status** | Proposed direction |
| **Scope** | AiMY Knowledge, full revamp. Standalone product and embedded service. |
| **Depends on** | `00_AiMY_Knowledge_to_Action_Doctrine.md`, `design-system.md`, `design-doc.html` (= `index.html`) |
| **Classification** | Confidential. Internal use. |

---

## 0. Purpose

This document defines what AiMY Knowledge v2 is, how it is structured, and why each structural decision was made. It is a source of record: decisions are stated with the reasoning that produced them, and rejected alternatives are kept in §11 so the reasoning does not have to be reconstructed later.

It is directional, not a build specification. §10 works one screen through to component level to show how the direction resolves into a surface. Every other screen is described at the level of purpose, content, and constraint.

---

## 1. What AiMY Knowledge is

**AiMY Knowledge is the only agent in the ecosystem that is also infrastructure.**

Every other AiMY agent owns a domain and surfaces that domain's data. QA owns evaluations. Talent owns candidates and staffing. Finance owns spend. Each briefs on its own material and acts within its own boundary.

Knowledge operates in two directions at once.

**As an agent,** it owns a corpus, and that corpus has its own operational life. Content decays. Ownership drifts. Gaps open where questions arrive that nothing answers. Contradictions accumulate as content is added faster than it is reconciled. This is real operational work with real state, and it justifies a full product surface.

**As a service,** it is the grounding layer every other agent draws on. When Talent answers a policy question or QA cites an evaluation rubric, the authority behind that answer is Knowledge. Knowledge is consumed inside surfaces it does not own and cannot style.

Nearly every decision below follows from this dual nature.

### 1.1 What follows from being infrastructure

**Trust state must be portable.** If an object is expired, it must read as expired everywhere it is cited: inside Knowledge, inside another agent's canvas, inside an embedded panel. Trust that only renders on its home surface is worse than no trust indicator at all, because it teaches people that the absence of a warning means safety. This is why the trust state primitive uses semantic tokens only and carries no dependency on `--accent`, which consuming agents re-theme.

**The answer surface must be separable from the product shell.** The components that render a grounded answer, meaning the answer body, citations, source list, trust disclosure, and confidence, have to work with no Knowledge navigation, no Knowledge briefing, and no Knowledge context around them. This is a component contract requirement, not a styling preference. See §8.

**Governance is a first-class surface, not a settings page.** When one corpus feeds many agents, the question of which agent may use which source becomes an operational decision with consequences. A source that is safe for an internal quality reviewer is not automatically safe for a customer-facing autonomous agent. This needs a managed surface, not a checkbox buried in configuration.

**Corpus health is an ecosystem concern.** Degraded knowledge does not degrade Knowledge alone, it degrades every agent grounded in it. This raises the priority of the curation briefing above what a standalone knowledge base would warrant.

---

## 2. Direction inherited from AiMY QA v2

QA v2 established what a doctrine-compliant AiMY product looks like. Knowledge v2 inherits it. Each item below is inherited because it holds for Knowledge, and §11 records where QA's specific solution does not transfer.

### 2.1 Inherited without modification

**Briefing before conversation.** The landing surface is a briefing that earns attention before conversation asks for it. Chat is entered from something, never faced blankly. A chat-first homepage with canned prompts puts the burden of knowing what to ask onto the user at the exact moment they know least.

**The canvas as a non-blocking overlay.** Opened over the product surface, underlying state visible as blurred context, product shell interactive, closing restores state exactly. Not a persistent side panel, not a modal, not a separate page. One interaction contract across the ecosystem is worth more than a locally optimal variant. See §5.

**Two-tier navigation at five items.** Primary work and configuration are visually distinct tiers. Five items is a ceiling that forces the inventory question to be answered honestly rather than deferred by adding a nav entry.

**List and detail splits where the content is a list and a detail.** QA v2 runs fixed-width splits on three of its five pages: 280px on Reviews, 360px on Disputes, 300px on Data. That pattern applies to Knowledge wherever a browsable inventory sits beside a selected record. What it is not is a home for the AI conversation.

**Every surfaced item carries work state.** A required field, not a badge applied where convenient.

**Every action is classified at design time** as direct, automatic investigation, prepared prompt, or reviewed action. Unclassified actions do not pass review.

**Writes with consequence go to structured commit surfaces.** Publishing, expiring, reassigning ownership, restoring a version, and bulk operations commit through structured surfaces with explicit scope, never through free-text conversation. Routing a consequential write through chat inverts Knowledge-to-Action: it makes the user do the structured thinking the system should have done.

**Dark mode default. Light verified before ship.**

### 2.2 Inherited in principle, resolved differently

**Role differentiation.** QA v2 serves two roles and uses an explicit toggle. Knowledge is accessed across the organisation by many roles, and a toggle does not scale past a handful. Resolved in §9.

**The decision queue.** QA v2's Disputes module is a queue of contested items with structured decision surfaces and an audit trail. Knowledge has the same shape of work, meaning verification requests, gap resolution, and contradiction reconciliation, but its items originate differently and carry different evidence. Resolved in §4.

**The configuration browser.** QA v2's KPI Hub governs definitions that change how metrics are computed. Knowledge's equivalent governs types, ownership rules, verification cadence, and per-agent source exposure. Resolved in §4.

---

## 3. Design principles specific to Knowledge

Five principles that resolve ambiguity where the doctrine is general.

**P1. Trust state gates retrieval, and the gate is visible.** Content past its review date is excluded from what the AI may use to answer, and when exclusion affects an answer, the answer says so. This converts governance from an ignorable nag into a mechanism with consequences. Marking content stale while continuing to serve it produces a marking people correctly learn to ignore. Visibility is the load-bearing half: a silent exclusion is indistinguishable from a gap in the corpus, and produces a thin answer with no explanation.

**P2. The corpus has a health state, and it is briefing material.** Expiring content, coverage gaps, contradictions, and failing sources are operational events with owners and next steps. They are the primary content of the Knowledge briefing. A knowledge base that only shows content and search has no opinion about its own condition.

**P3. Answering a question and fixing the corpus are one loop.** A wrong or unfounded answer is the highest-signal moment available for improving the corpus, because the gap has just been demonstrated rather than hypothesised. The path from a wrong answer to a corrected and re-verified source is a primary flow, not an administrative afterthought. Feedback that terminates in a rating is a dead end and fails the doctrine.

**P4. Scope is an input, not a complaint.** Which sources an answer may draw on is decided before the query runs, not discovered afterwards from the citations. Someone who needs a policy answer from official documentation only should be able to say so up front rather than reading an answer and then working out what grounded it.

**P5. Retrieval routes on intent, not on a mode switch.** Someone looking for a specific known object, someone asking a question, and someone exploring a topic have different intents and should not have to declare which they are. One input, routed on the shape of what was typed. Making people choose between search and ask pushes an implementation distinction onto them.

---

## 4. Information architecture

Five items, two tiers.

### Primary

**Dashboard.** The briefing. Corpus health, composed per user. What changed, what it means, what to do about it. Worked through in §10.

**Workbench.** The working surface where knowledge is found, read, and written. It holds the working set (§5.2) and contains the retrieval surface (§7), the document viewer (§6.4), the document editor (§6.5), and the type cards (§6.3). *Rationale for the name:* this is an integrated working environment rather than a browsable inventory, and the name should say so. Bulk curation over a filtered collection also lives here.

**Requests.** The decision queue. Verification requests awaiting an owner, gaps awaiting a decision on whether to fill them, contradictions awaiting reconciliation, and proposed drafts awaiting review. Each item carries its evidence, a structured decision surface, and an audit trail. *Rationale for a dedicated page:* these are contested items where a person must decide and the decision must be recorded and reversible. That is a different interaction from editing content. Mixing the two would make routine editing feel consequential and consequential decisions feel routine.

### Configure

**Governance.** Knowledge types and their rules, collection ownership, verification cadence per type or collection, and per-agent source exposure, meaning which consuming agent may ground answers in which sources. *Rationale for placement:* these are settings that change system behaviour broadly rather than per-item work. *Rationale for existing at all:* per §1, one corpus feeding many agents makes exposure an operational decision that needs a home.

**Sources.** Connected systems, sync status and history, ingestion errors, coverage per source. Corpus quality is bounded by source health, which is why source health also appears in the briefing.

**Settings.** Outside the five, consistent with established placement.

### 4.1 Rejected from the inventory

**A separate Search page.** Retrieval is not a destination. Per P5, the input is present on every surface and routes by intent. A dedicated search page would create a second, competing entry point and contradict the single-input principle.

**A separate Analytics page.** Usage and coverage metrics are meaningful as briefing content with an attached action, and meaningless as a wall of charts. Metrics that warrant sustained attention belong in the briefing. The rest belong in the surface they describe.

**A separate Chat or Conversations page.** Conversation is a surface, not a destination. Conversation history is a facet of that surface. Giving it a nav entry reintroduces the chat-first model this revamp exists to remove.

---

## 5. The workbench shell

**The workbench uses the shared canvas overlay. There is no persistent chat panel and no split column.**

> **Amended.** The prohibition stands for the workbench SHELL, and the canvas now
> carries a conversations column inside itself. The distinction is the one this
> section already turns on: a log of conversations is not navigation, so it does
> not belong in the rail or the IA — but it is navigation *inside* a
> conversation, which is a different thing and has to live somewhere.
>
> §5.1's first argument has also reversed. It rejects a chat column because it
> "forks the interaction contract at its most visible layer", and because "the
> value of one contract across the ecosystem exceeds the value of a locally
> optimal variant". AiMY Sales has since shipped this column. Declining it here
> is now what forks the contract, and adopting it is what keeps it — the
> reasoning is unchanged, the ecosystem moved. §5.1's other two arguments are
> untouched: the working set still delivers responsive canvas content, and AI
> still belongs to objects rather than to a region.

### 5.1 Why

A workbench with a chat column beside a content canvas is a plausible design, and it is the wrong one here. Three reasons.

**It forks the interaction contract at its most visible layer.** Someone who learns QA and moves to Knowledge would find the AI somewhere else, behaving differently. The value of one contract across the ecosystem exceeds the value of a locally optimal variant, and an exception granted informally gets copied informally.

**The requirement it appears to serve is met another way.** The real need is that canvas content responds to the conversation. That is delivered by a working set (§5.2), not by a reserved column.

**AI belongs to objects, not to a region.** The interactions that occur most often during knowledge work are scoped to a selection, an object, or a set, and all of them work better in place than in a column. See §5.3.

A persistent column also permanently taxes horizontal space on the one surface that most needs it, since the viewer and editor carry dense content and the working set may hold several objects at once.

### 5.2 The working set

The workbench canvas holds a **working set**: the objects currently in play. Articles, tickets, ICPs, search results, an object open in the viewer, an object open in the editor. The working set persists across overlay open and close, and across navigation within the workbench.

**Entry.** The float input bar is the entry point. It sits centred on the canvas while the working set is empty and docks once work exists. Asking a question opens the canvas overlay above the workbench, which stays visible as blurred context.

**Conversation drives the working set through promotion.** Any object surfaced inside the conversation, whether a search result, a cited source, or a drafted article, can be promoted into the working set with one action. Promotion is explicit rather than automatic, for two reasons:

- Automatically rewriting the canvas mid-conversation destroys whatever the user had open, and they did not ask for it. Content that changes underneath someone is not responsiveness, it is loss of place.
- An explicit promotion is a classified direct action with a visible result, which is what the doctrine requires of every other control on the surface.

**Where intent is unambiguous, promotion is implicit and the overlay never opens.** Autocomplete to a known object opens it into the working set directly, because generation was never needed. Opening an object from a briefing card behaves the same way.

The loop is: ask in the overlay, read the answer with its citations, promote what is worth keeping, close, work with it. Canvas content updates as the conversation develops, without a reserved column.

### 5.3 Where AI appears without opening the overlay

The overlay is for investigation. Routing every AI interaction through it would recreate the chat-first problem in a new shape. Three scopes sit below it and do not open it at all.

**Selection scope.** The inline AI menu on selected text inside the editor. This matters most during authoring: the AI interactions that happen constantly while writing never cover the thing being written.

**Document scope.** Proposed changes render as a reviewable diff in place, with accept, edit, and reject. Edit is not optional and AiMY never applies a change silently.

**Set scope.** Bulk operations over a filtered selection use the set-scope bar with its effect preview, in place on the workbench.

The overlay opens for open-ended questions, for investigation, and for generative work with no obvious anchor.

### 5.4 What this means for build

The workbench needs no new shell component. It is the standard three-zone shell, the float bar, and the canvas overlay, all of which exist. The working set is a state concept rather than a component: it renders as type cards, a viewer, or an editor depending on what is in it. The viewer and editor lay out at full canvas width, since no column is reserved for conversation.

---

## 6. The knowledge object

The object is the unit of knowledge, of governance, and of citation. One object serving three purposes is why its anatomy needs stating precisely.

### 6.1 Anatomy

**Identity.** Title, type, collection.
**Content.** Body, with structure preserved.
**Governance.** Owner, last verified, next review, trust state.
**Provenance.** Origin source, last modified, version history.
**Relationships.** Related objects, superseded-by, contradicts. Carried by `.dv-rel` in the document viewer, where a contradiction reads as a finding rather than as a neighbouring link.

### 6.2 Trust state

Trust state is a required field on every knowledge object, with five values.

| Value | Meaning | Retrieval |
|---|---|---|
| Verified | Owner confirmed within cadence | Available |
| Due | Review date approaching | Available, flagged |
| Expired | Review date passed without confirmation | Excluded |
| Unverified | Never verified, or ingested without an owner | Available, flagged prominently |
| Superseded | Replaced by a newer object | Excluded, resolves to successor |

**Trust state is a distinct axis from work state.** Work state describes what AiMY has done with an item. Trust state describes whether the content itself can be relied on. An object can be simultaneously drafted, meaning AiMY has proposed an update awaiting review, and expired, meaning the published content is past review. Collapsing these into one field loses the distinction exactly where it carries the most weight.

Work state carries a dot, trust state carries an icon, deliberately different shapes so a meta row holding both does not read as one field split in two. Exclusion from retrieval is stated on the badge itself rather than left to a tooltip, because exclusion is a consequence and consequences should not hide.

### 6.3 Document types

Eight types, each rendering as its own card template.

| Type | Primary audience | Distinguishing content |
|---|---|---|
| Article | Support, all | Body, applicability, related articles |
| Ticket | Support | Requester, status, resolution, linked articles |
| ICP | Sales | Segment definition, fit criteria, disqualifiers |
| Campaign | Marketing | Objective, audience, active window, assets |
| Marketing Asset | Marketing, Sales | Format, usage rights, approval state |
| Success Story | Sales, Marketing | Customer, outcome, quotable claims, approval state |
| Blog | Marketing | Publication state, canonical URL, author |
| Web Page | All | Source URL, last crawl, change detection |

**Why per-type templates rather than one card with a type label.** Type changes what a reader needs to see first. A Ticket without its resolution is useless. An ICP without its disqualifiers is misleading. A Success Story without its approval state is a legal exposure. A single template forces every type into the fields of whichever type it was designed around, and the fields that matter most end up in a details drawer.

**What every type shares regardless of template.** Title, type label, trust state, owner, last verified, and one classified action. These are the fields that make an object governable and citable, and they sit in the same position across all eight templates. Someone scanning mixed results should not have to relearn where trust lives per type.

**Type is carried by label and icon together, never by colour alone.** Both for contrast compliance and because a type card may be cited inside a consuming agent whose accent differs.

**One thing this taxonomy raises.** The corpus spans support, sales, and marketing, and three types carry an approval state. Approval is not verification: a Success Story can be verified as accurate and still not be cleared for external use. Whether approval becomes a sixth trust value or a separate field is an open question in §12. Until it is settled, approval renders as `.tc-approval`, deliberately outside `.trust-state`, since folding it in would pre-empt the ruling and change a primitive that ships into other agents' surfaces. If the ruling makes it a trust value, the field folds in and the eight templates are unaffected.

The eight templates are `.type-card` at `#type-cards`.

### 6.4 The document viewer

Reads any of the eight types. Type-appropriate rendering, shared governance chrome.

**Constant across types.** Title, type, trust state, owner, verification dates, source and provenance, and the action row. Trust state sits in a fixed position so it is legible before the body is read, which is the only ordering that helps someone deciding whether to rely on the content.

**Variable by type.** Body rendering and the metadata block, per §6.3.

**A viewer is not a read-only editor.** It is optimised for judging and citing content rather than changing it. It carries citation affordances, the path into the editor for those entitled, and the correction entry point from P3.

**Expired and superseded content remains viewable.** Exclusion governs retrieval, not human access. A superseded object resolves to its successor with the relationship stated, because someone who followed a link to an old version needs to know where the current one is rather than being silently redirected. A silent redirect hides that they were reading something outdated; showing the old content with the relationship stated does not.

The shell is `.doc-view` at `#doc-view`. Exclusion and supersession notices state the retrieval consequence and the route out of it, and are required whenever trust state holds an excluded value.

### 6.5 The document editor

Toolbar, formatting, comments, version panel, AI actions.

**Toolbar and formatting.** The existing toolbar component covers this. No new formatting chrome.

**Comments.** The existing comment thread component covers this. Comments attach to the object, not to the version, so a thread survives an edit. A comment thread that resets on save loses the discussion that motivated the change.

**Version panel.** Version history with restore. This is where P3's correction loop terminates and where AI edits become reversible. Two requirements bear on it.

- **AI edits are ordinary versions with an AI author.** Not a separate history, not a special undo. The audit trail already distinguishes AiMY's actions from the user's and must not disguise one as the other. A parallel AI history would let someone review the human history and believe they had seen everything.
- **Restore is a consequential write.** It changes what the corpus serves and therefore what every consuming agent answers from. It commits through a structured surface stating what is rolled back, how many consuming agents are affected, and that history is preserved. Restore is additive: it creates a new version rather than deleting the ones it supersedes, otherwise restoring is itself irreversible and the audit trail acquires a hole exactly where someone will later need to look.

The panel is `.ver-list` with `.ver-compare` and `.ver-restore` at `#version-history`.

**AI actions.** Two scopes, both in place, neither opening the overlay per §5.3.

- *Selection scope.* The inline AI menu on selected text. Scope is the selection, and no scope restatement is required.
- *Document scope.* Proposed changes render as a reviewable diff with accept, edit, and reject.

**Editing changes trust state.** An edit to verified content moves it out of verified, because the verification attested to content that no longer exists. Whether it lands on due or unverified, and whether that depends on the editor being the owner, is an open question in §12.

---

## 7. Retrieval and the answer surface

### 7.1 One input, routed on intent

A single input, present on every surface, routing on the shape of what was typed.

- **Input resembling a known object,** meaning a title, a person, or a short distinctive phrase, returns a compact ranked result set immediately, above any generated answer, with autocomplete offering direct navigation. When someone already knows the target, generation is waste and the correct route is a direct action straight to the object.
- **Input resembling a question** returns a generated answer with citations.
- **Ambiguous input** returns both, results first, answer resolving beneath them.

Results-first also serves an honest secondary purpose: the result set arrives before generation completes, so latency is filled with something useful rather than a spinner.

### 7.2 Scope before query

Source scope is set before the query runs, by collection, type, trust state, or source. Per P4. The selected scope stays visible throughout the answer, because an answer read without knowing its scope cannot be judged.

### 7.3 Layered citation depth

Verification is layered so that someone skimming and someone auditing can use the same answer without either being taxed.

1. **Inline citation markers** within the answer body.
2. **A source list** rendering as the answer begins streaming, not after. Breadth of evidence should be legible before the prose resolves, since a reader cannot otherwise tell whether an answer rests on one weak source or several strong ones.
3. **Hover preview** showing the cited passage in its surrounding context without navigation. This rung carries the most verification traffic. It opens on hover and on focus, because a preview reachable only by mouse is not a verification affordance.
4. **Full source view** for auditing.

### 7.4 Trust disclosure on every answer

Every generated answer states the trust condition of its grounding: whether all cited sources are verified, whether any flagged source contributed, and whether any relevant content was excluded because it had expired. The exclusion case must never be silent. Without it a governance gap is indistinguishable from a corpus gap, and the user has no way to learn that the answer they need exists but has lapsed.

### 7.5 The correction loop

Per P3, a wrong answer routes into fixing the source: identify the offending citation, open the source object, edit in the document editor, re-verify, and commit reversibly.

Feedback is captured per citation, not only per answer. A single bad citation inside an otherwise sound answer is the most actionable signal available and the most commonly discarded, since a rating on the whole answer throws away which part was wrong. Flagging routes into the correction loop rather than terminating in a rating.

---

## 8. Knowledge as an embedded service

Knowledge answers rendered inside another agent's canvas.

### 8.1 The contract

**Renders without the Knowledge shell.** No navigation, no briefing, no Knowledge chrome. The embedded surface is the answer surface from §7 and nothing else.

**Inherits the host's theme.** It follows the shared token layer and adopts the consuming agent's accent, because it is content within that agent's surface rather than a visiting product.

**Carries trust state unchanged.** An expired or unverified source reads identically wherever it appears. This is why trust state is built accent-free.

**Respects per-agent source exposure.** Governed in the Governance surface. Human-accessible and agent-usable are separate permissions: content appropriate for a person to read with judgement is not automatically appropriate for an autonomous agent to paraphrase to a customer.

**Routes corrections home.** A wrong answer discovered inside another agent still opens the correction loop and creates a request in Knowledge's queue. The loop must not break at the product boundary, since corrections discovered in consuming agents surface at the moment of actual use and are among the highest-value signals available.

**Type cards degrade gracefully.** A cited object may render inside a host with far less width than the Knowledge workbench. Each type template carries a compact form, `.type-card.is-compact`, holding title, type, trust state, and one action. The compact form is a requirement of the template, not a host concern: if it is not designed, the host improvises one, and trust is the field it drops.

### 8.2 Why this is stated as a contract

It constrains component design inside Knowledge. Any answer-surface component assuming Knowledge's navigation, layout, or accent will fail when embedded. The embedded case is the stricter one and therefore the one to design against first. Because both Knowledge and its host agents use the overlay model, the answer surface behaves identically in both places rather than having to work two ways.

---

## 9. Role and composition

### 9.1 The problem

Knowledge is accessed by everyone, and the taxonomy in §6.3 widens that further: support, sales, and marketing all hold content here. A contact-centre agent consuming answers, a team lead reconciling contradictions, a compliance owner tracking verification coverage, a sales lead maintaining ICPs, and a marketing owner managing campaign assets all land on the same URL with materially different needs. The number of distinct needs is not two and will not stay fixed.

An explicit role toggle fails on three counts: it does not scale past a handful of options; it requires a person to know which role they are, which is often ambiguous and sometimes plural; and it makes role a declared attribute requiring its own configuration surface.

### 9.2 Role is derived, not declared

The briefing is composed per user from signals the system already holds, rather than selected from a menu of prepared variants.

**Entitlement determines what may be shown.** Derived from existing permissions. A user never sees corpus health for content they cannot access. This is a hard filter and must be visibly true, since a briefing silently including inaccessible material is both a trust failure and a leak.

**Relevance determines what is shown first.** Derived from ownership records, collection membership, and usage history. Someone owning forty objects sees verification pressure prominently. Someone owning none but querying daily sees answer quality and coverage gaps against the questions they actually ask.

Composition follows one rule: **every user receives consumption blocks; users with ownership additionally receive curation blocks, ranked by their own ownership.** Curation and consumption are not two roles, they are a gradient most people sit somewhere along, and many people occupy both ends depending on the week.

The surface budget is enforced per user, not per design. Seven to nine blocks and at most two charts render for whoever is looking, drawn from the larger declared inventory in §10.3. A block that cannot earn a place for a given user does not render for that user.

### 9.3 What this requires

Each block is declared with an entitlement predicate, a relevance signal, and a priority weight. This is a content model, not a layout decision, and it must be settled before layout. Laying out a fixed briefing and retrofitting composition produces a design that only works for whoever it was drawn for.

If ownership and usage data are unavailable at the required granularity, composition degrades to entitlement-only. That is a weaker but viable position: the briefing renders a shorter set and the empty state covers the honest case. No components change. The degradation should be chosen deliberately rather than discovered during build.

---

## 10. Worked example: the Dashboard

One screen resolved to component level, showing how the direction produces a surface.

### 10.1 Purpose

Answer, for whoever is looking: what changed in the corpus, what does it mean, and what should be done. Nothing more. It is not a search page, not a metrics wall, and not a place to browse content.

### 10.2 Structure

Standard product shell: top bar, two-tier navigation, scrollable main. Below it, the briefing region. The float input bar is persistently available and opens the canvas overlay.

### 10.3 Block inventory

Nine declared blocks. Seven to nine render per user by the composition rules in §9.2. Each renders as a briefing card stating what changed, why it matters, its scope, its confidence where confidence changes interpretation, its work state, and one classified next step.

| # | Block | Audience | Work state | Next step | Entry mode |
|---|---|---|---|---|---|
| 1 | Expired and excluded: content past review and no longer available to answers, with the questions it would have answered | Owners | detected | Request verification | Reviewed action |
| 2 | Due for review, ranked by query volume so the most-used content is verified first | Owners | recommended | Verify or update | Reviewed action |
| 3 | Coverage gaps: questions asked that the corpus could not answer, clustered by topic | All | detected | Draft content | Prepared prompt |
| 4 | Contradictions: live objects giving conflicting answers on one topic | Owners | detected | Compare and resolve | Automatic investigation |
| 5 | Low-confidence answers served, each stating what limited it | All | detected | Review sources | Automatic investigation |
| 6 | Drafts awaiting review: AiMY-proposed content staged for an owner | Owners | drafted | Review draft | Reviewed action |
| 7 | Source health: connected sources stale or failing | Entitled | failed | Reconnect | Direct action |
| 8 | Recently resolved: closed-loop confirmation of corrections and their effect | All | completed | View audit | Direct action |
| 9 | Answer coverage trend: proportion of questions answered from verified content over time (chart) | All | n/a | n/a | n/a |

At most two charts render. Block 9 is the default chart. A verification backlog trend is available as the second where curation load justifies it.

**Blocks 3 and 7 use the aggregate briefing card,** since their subject is a cluster rather than a record. The ranked contributor list is capped at four or five rows, and a truncated list must state its remainder, because a ranked list that hides its tail overstates how concentrated the problem is.

**Ordering.** Blocks 1 and 4 rank highest for owners, since both represent knowledge actively misleading people right now. Block 3 ranks highest for pure consumers, since a gap is what they will hit next. Blocks 8 and 9 rank last: confirmation and trend, valuable but never urgent.

**Displacement.** Where a block is held back by the budget, the surface states what was displaced and provides a route to it. A briefing that silently drops content teaches people not to trust it as complete.

### 10.4 Component bindings

Every binding resolves to an existing component.

| Element | Component | Anchor |
|---|---|---|
| Briefing item | `.bcard` extended, with ack row and dismiss reason | `#bcard-extended` |
| Cluster briefing item | `.bcard.is-aggregate` | `#bcard-aggregate` |
| Work state | `.work-state` with `.ws-*` | `#work-state` |
| Trust state | `.trust-state` with `.ts-*` and `.is-excluded` | `#trust-state` |
| Confidence | `.conf-badge`, limiting factor stated on medium and low | `#sc-conf-badge` |
| Action classification | `.entry-action` with `.em-*` | `#entry-modes` |
| AI interpretation | `.ai-insight-panel` | `#ai-insight-panel` |
| Trend chart | Chart primitives with annotations | `#chart-primitives`, `#anno-card` |
| Source health rows | `.list-group` with `.tag` | `#list-group` |
| Canvas entry | `.aimy-float-bar` | `#canvas-float` |
| Canvas | `.aimy-overlay`, `.chat-msg` | `#canvas-overlay`, `#canvas-messages` |
| Scope selection | `.filter-tray` with `.filter-chip` | `#canvas-filter-tray` |
| Context explanation | Context zone | `#context-zone` |
| Commit surfaces | Confirmation ladder, governance change request | `#confirmation-ladder`, `#kpihub-cr-card` |
| Reversal | `.aimy-toast` with undo | `#canvas-toast` |
| Non-happy states | Empty and loading, AI unavailable | `#states`, `#ai-unavailable` |

### 10.5 States

**Loading.** Block skeletons render in priority order. Blocks appear as they resolve rather than waiting for the slowest.

**Empty.** A healthy corpus with no ownership load. The surface states this as a finding, not an absence, and offers a next step: what the corpus currently covers well, and where coverage is thinnest. An empty briefing is a result and should read as one.

**Error.** Per-block failure degrades that block only. The briefing states which blocks could not load rather than failing whole.

**AI unavailable.** Briefing content sourced from system state still renders. AI-generated interpretation is replaced by the unavailable state, which must say what still works and must not lose staged work. Corpus health does not depend on generation being available and should not disappear when it is not.

---

## 11. Alternatives considered and rejected

**A persistent chat panel beside the canvas.** Rejected. It forks the ecosystem's interaction contract at its most visible layer, permanently taxes horizontal space on the surface that most needs it, and buys nothing: the requirement it appears to serve, canvas content responding to conversation, is delivered by the working set in §5.2. Comparable products point the same way, attaching AI to objects at multiple scopes rather than parking a chat region beside content.

**An explicit role toggle.** Rejected. Works at two roles, fails at many, and the taxonomy in §6.3 makes the number larger still. Requires people to classify themselves, which is often ambiguous and sometimes plural, and adds a configuration surface to maintain. Replaced by derived composition.

**Trust state as a variant of work state.** Rejected. They describe different things, and an object can hold conflicting values on the two axes at once. Collapsing them loses the distinction precisely where it carries the most weight.

**A chat-first landing surface.** Rejected. A prompt grid asks people to know what to ask at the moment they know least, and produces answers that terminate rather than routing to action. This is an architectural failure, and restyling would produce a better-looking violation.

**Marking content stale while continuing to serve it.** Rejected. A marking with no consequence is decorative, and people correctly learn to ignore it. Exclusion with visible disclosure makes the state mean something while keeping the user informed about why an answer is thin.

**Answer feedback as a rating.** Rejected. A rating is a dead end and fails the doctrine's requirement that every finding carry a next step. Feedback routes into the correction loop and is captured per citation, since per-answer feedback discards the most actionable part of the signal.

**One card template with a type label.** Rejected. Type changes what a reader needs to see first, and a single template forces every type into the fields of whichever type it was designed around. The fields that matter most end up in a details drawer. Replaced by eight templates sharing a fixed governance row.

**A separate history for AI edits in the version panel.** Rejected. A parallel AI history lets someone review the human history and believe they have seen everything. AI edits are ordinary versions with an AI author, consistent with how the audit trail already handles AiMY's actions.

**Exposing a model picker.** Rejected. Leaks implementation detail into an operational product and offers a choice most people are not positioned to make. Model routing is a platform decision.

---

## 12. Component coverage and open questions

### 12.1 Coverage

Every component this direction depends on resolves to an entry in the library. Nothing is outstanding.

| Surface | Components |
|---|---|
| Workbench shell | Standard three-zone shell, `.aimy-float-bar` (`#canvas-float`), `.aimy-overlay` (`#canvas-overlay`) |
| Working set | Renders as `.type-card`, `.doc-view`, or the editor depending on contents. A state concept, not a component |
| Type cards | `.type-card` with `.is-compact` (`#type-cards`), eight templates over one fixed governance row |
| Document viewer | `.doc-view` with `.dv-notice` and `.dv-rel` (`#doc-view`) |
| Document editor | `.toolbar` (`#toolbar`), `.comment-thread` (`#comments`), `.ai-menu` (`#ai-menu`), `.ai-suggestion` (`#ai-suggestion`) |
| Version panel | `.ver-list`, `.ver-compare`, `.ver-restore` (`#version-history`) |
| Trust | `.trust-state` (`#trust-state`), `.trust-disclosure` (`#trust-disclosure`) |
| Answer surface | `.cite` with `.cite-preview` (`#cite-preview`), `.source-list` (`#citations`), `.agent-steps` (`#agent-steps`) |
| Scope | `.filter-tray` with `.filter-chip` (`#canvas-filter-tray`), `.set-scope-bar` (`#set-scope`) |
| Briefing | `.bcard` extended (`#bcard-extended`), `.bcard.is-aggregate` (`#bcard-aggregate`) |
| Commit and reversal | `#confirmation-ladder`, `#kpihub-cr-card`, `.aimy-toast` (`#canvas-toast`) |
| Non-happy states | `#states`, `#ai-unavailable` |

Two surfaces compose from existing primitives rather than carrying a dedicated component, which is correct rather than a gap. The retrieval result set in §7.1 is a list of type cards over the existing list primitives. The displacement notice in §10.3 is an inline note. Neither introduces a new visual language, and giving either its own component would duplicate one.

### 12.2 Open questions

| Question | Bears on |
|---|---|
| Is approval state a sixth trust value or a separate field? Three types carry it, and a Success Story can be accurate and still not cleared for external use. | §6.3, trust state |
| When verified content is edited, does it move to due or to unverified, and does that depend on whether the editor is the owner? | §6.5, the editor |
| Is ticket context on the workbench a live integration or an ingested object? A live ticket has no owner and no verification cadence, so it either sits outside trust state or forces a sixth value. | §6.3, §6.4 |
| Are ownership and usage data available per user at the granularity composition needs? | §9.2, §9.3 |
| Can the retrieval layer filter by user permission? | §8.1, §9.2 |

The last two are platform questions rather than design questions. The permission question carries one design obligation regardless of the answer: where the guarantee does not hold, the surface says so, using the existing warning banner and the answer trust disclosure.

---

## 13. Constraints

Applied to all Knowledge v2 work.

- Every component resolves to an entry in the component library, per §12.1. Anything found missing goes to the design-system owner as a request and is not built locally, since a component built inside Knowledge will not travel correctly into consuming agents.
- Dark mode default. Light verified before ship.
- No `transition: all`. No `onclick` string attributes. No decorative left-border stripes. Transform and opacity only, 300ms ceiling, reduced-motion guard on every animation.
- Bar and progress fills animate with `transform: scaleX()` and a left origin, never width.
- The custom dropdown for all selects. No native select elements.
- Colour earns its place through state. No ambient accent decoration, no gradient text, no top-edge accent stripes, no pulsing indicators.
- Type and state are carried by label and icon together, never by colour alone.
- Consequential writes, meaning publish, expire, reassign ownership, restore a version, and bulk operations, go to structured commit surfaces with explicit scope, never through free-text.
- Bulk operations state their scope and their skips. A bulk operation that silently no-ops on part of its selection reports a success the user has no reason to distrust.
- Every action classified before implementation. Unclassified actions do not pass review.

---

## 14. Provenance

- Knowledge-to-Action Doctrine: interaction model, entry modes, work state, surface budgets, adoption rules, seven-level review gate
- `design-system.md`: tokens, typography, theme behaviour, component inventory
- `design-doc.html` / `index.html`: component library, source of truth for class names and anatomy
- AiMY QA v2: reference implementation of the doctrine, source of the inherited direction in §2
- Workbench and chat-copilot pattern benchmarking: basis for §3, §5, §7, §8
- Workbench, document viewer, and document editor specifications: basis for §5, §6.3, §6.4, §6.5
