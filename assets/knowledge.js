/* ═══════════════════════════════════════════════════════════════════════
   knowledge.js — AiMY Knowledge v2 product behaviour
   ───────────────────────────────────────────────────────────────────────
   Owns: briefing composition, entry-mode routing, the canvas, the working
   set, and retrieval routing. Owns no component styling — every class
   named here resolves to an entry in the design system.

   Prototype scope: there is no backend. Corpus, profiles, and timings are
   fixtures. Everything that would be a platform capability is simulated at
   the seam where it would really sit, and said out loud where the direction
   requires the surface to admit a limit (§9.3, §12).
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════
     HELPERS
  ═══════════════════════════════════════════════ */
  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  /* esc() every value that could vary — titles, names, anything from a record.
     A handful of fields are deliberately authored AS markup in this file and
     are interpolated raw: a decision's `consequence`, a governed change's
     `rationale` and `blast`. Escaping those printed the tags on screen. If any
     of them ever becomes user- or backend-supplied, it has to be escaped and
     the emphasis moved into the template. */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const params = new URLSearchParams(location.search);

  /* Icons. Stroke-only, one cohesive set, sized by the component that holds
     them — never coloured here, so semantic classes keep control (Level 3). */
  /* Icons ALWAYS carry width/height. An <svg> with a viewBox and no dimensions
     is a replaced element with no intrinsic size — inside any container that
     does not size it in CSS it expands to fill, which is how a 14px document
     glyph became a 350px illustration in the source list. Only some components
     size their child svg (.td-row, .ss-effect, .dv-rel-item do; .source-item,
     .inline-note, .agg-row and .banner do not), so the attribute is the only
     reliable default. CSS still wins wherever a component sets a size. */
  const svg = (d, w, size) =>
    `<svg viewBox="0 0 24 24" width="${size || 14}" height="${size || 14}" ` +
    `fill="none" stroke="currentColor" stroke-width="${w || 2.2}" ` +
    `stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

  const ICO = {
    shield:   svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>', 2.4),
    clock:    svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', 2.4),
    slash:    svg('<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>', 2.4),
    question: svg('<circle cx="12" cy="12" r="9"/><path d="M9.2 9.3a3 3 0 015.7 1.2c0 2-3 3-3 3"/><path d="M12 17.5h.01"/>', 2.4),
    arrow:    svg('<path d="M4 12h13"/><path d="M13 6l6 6-6 6"/>', 2.4),
    eye:      svg('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>'),
    search:   svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
    scales:   svg('<path d="M12 3v18"/><path d="M5 7h14"/><path d="M5 7l-2 6h4z"/><path d="M19 7l-2 6h4z"/>'),
    refresh:  svg('<path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0115-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 01-15 6.7L3 16"/>'),
    check:    svg('<path d="M20 6L9 17l-5-5"/>'),
    x:        svg('<path d="M18 6L6 18M6 6l12 12"/>'),
    warn:     svg('<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/>', 2.4),
    doc:      svg('<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/>', 2),
    ticket:   svg('<path d="M3 9V7a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 000-4z"/><path d="M13 5v14"/>', 2),
    target:   svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>', 2),
    megaphone:svg('<path d="M3 11v2a1 1 0 001 1h2l4 4V6L6 10H4a1 1 0 00-1 1z"/><path d="M16 8.5a4 4 0 010 7"/><path d="M19 6a8 8 0 010 12"/>', 2),
    image:    svg('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>', 2),
    trophy:   svg('<path d="M8 21h8"/><path d="M12 17v4"/><path d="M17 4h3v3a5 5 0 01-5 5H9a5 5 0 01-5-5V4h3"/><path d="M7 4h10v4a5 5 0 01-10 0z"/>', 2),
    book:     svg('<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>', 2),
    globe:    svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 010 18a15 15 0 010-18z"/>', 2),
    flag:     svg('<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>'),
    quote:    svg('<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>'),
    left:     svg('<path d="M15 18l-6-6 6-6"/>'),
    pen:      svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>')
  };

  /* Trust state — a required field on every knowledge object (§6.2).
     Semantic tokens only, no --accent, so it survives being cited inside a
     re-themed host surface (§1.1, §8.1). */
  const TRUST = {
    verified:   { label: 'Verified',   ico: ICO.shield,   excluded: false },
    due:        { label: 'Due',        ico: ICO.clock,    excluded: false },
    expired:    { label: 'Expired',    ico: ICO.slash,    excluded: true  },
    unverified: { label: 'Unverified', ico: ICO.question, excluded: false },
    superseded: { label: 'Superseded', ico: ICO.arrow,    excluded: true  }
  };
  function trustState(value) {
    const t = TRUST[value];
    return `<span class="trust-state ts-${value}${t.excluded ? ' is-excluded' : ''}" ` +
           `data-trust-state="${value}">${t.ico}${t.label}</span>`;
  }

  /* Work state — the six canonical values. The label may be a domain alias
     (handled/blocked); the canonical value stays on the attribute (§2.3). */
  function workState(value, label) {
    return `<span class="work-state ws-${value}" data-work-state="${value}">` +
           `<span class="ws-dot"></span>${esc(label || value[0].toUpperCase() + value.slice(1))}</span>`;
  }

  /* Every action carries its entry mode. An unclassified action fails review
     (§3), so this is the only way an action is built in this file. */
  /* The AiMY mark. A prepared prompt is AiMY composing the question, so the
     mark is more truthful than a generic speech bubble — and it matches the
     library, which uses this symbol everywhere AiMY is the actor rather than
     a chat metaphor. Carries its own gradient, so it ignores currentColor. */
  const AIMY_MARK = (w, h) =>
    `<svg width="${w || 12}" height="${h || 14}" viewBox="0 0 18 20" aria-hidden="true"><use href="#aimy-logo-small"/></svg>`;

  const MODE_ICO = { direct: ICO.eye, investigate: ICO.search, prompt: AIMY_MARK(12, 14), review: ICO.scales };
  function entryAction(mode, label, data) {
    const ico = (MODE_ICO[mode] || ICO.eye).replace('<svg', '<svg class="em-ico"');
    return `<button class="entry-action em-${mode}" data-entry-mode="${mode}" ${data || ''}>${ico}${esc(label)}</button>`;
  }

  function confBadge(level, value) {
    return `<span class="conf-badge conf-${level}"><span class="conf-meter"><i></i><i></i><i></i></span>` +
           `${level[0].toUpperCase() + level.slice(1)}${value ? ` <span class="conf-val">${esc(value)}</span>` : ''}</span>`;
  }

  const pill = (val, unit, tone) =>
    `<span class="evidence-pill"><span class="val"${tone ? ` style="color:var(--${tone})"` : ''}>${esc(val)}</span>` +
    `<span>${esc(unit)}</span></span>`;

  /* ═══════════════════════════════════════════════
     PROFILES — the simulated seam for §9.2

     Role is DERIVED, never declared. Entitlement decides what may be shown;
     relevance decides what is shown first. The three profiles below stand in
     for signals the platform would supply, including the honest degraded case
     where ownership and usage data are not available per user (§9.3).
     Switching between them is a prototype affordance, not product UI — §11
     rejects a role toggle on the surface itself.
  ═══════════════════════════════════════════════ */
  const PROFILES = {
    owner: {
      id: 'owner',
      name: 'Nour Wael', initials: 'NW', role: 'Product Design',
      collections: ['policies', 'support', 'marketing', 'sales'],
      sourcesAdmin: true,
      owns: 41,          // objects owned — drives curation-block ranking
      queriesPerWeek: 9,
      signals: true      // ownership + usage data available at user granularity
    },
    consumer: {
      id: 'consumer',
      name: 'Lina Haddad', initials: 'LH', role: 'Contact-centre agent',
      collections: ['policies', 'support'],
      sourcesAdmin: false,
      owns: 0,
      queriesPerWeek: 63,
      signals: true
    },
    limited: {
      id: 'limited',
      name: 'Omar Said', initials: 'OS', role: 'Compliance reviewer',
      collections: ['policies'],
      sourcesAdmin: false,
      owns: 6,
      queriesPerWeek: 4,
      signals: false     // §9.3 — composition degrades to entitlement-only
    }
  };

  function activeProfile() {
    return PROFILES[params.get('as')] || PROFILES.owner;
  }

  /* ═══════════════════════════════════════════════
     BLOCK INVENTORY — the nine declared blocks of §10.3

     Each block declares three things and nothing else: who may see it
     (entitlement), how much it matters to this person right now (relevance),
     and its standing rank (weight). Composition is therefore a content model,
     settled before layout — §9.3 is explicit that laying out a fixed briefing
     and retrofitting composition produces a surface that only works for
     whoever it was drawn for.

     relevance() returns 0 to mean "this block cannot earn a place for this
     user", which is different from "this user is not entitled to it".
  ═══════════════════════════════════════════════ */
  const BLOCKS = [
    {
      id: 'expired',
      kind: 'bcard',
      chart: false,
      base: 100,
      entitled: (p) => p.owns > 0,
      relevance: (p) => (p.signals ? p.owns * 2.2 : 40),
      render: () => card({
        tone: 'err', severity: 'busy', label: 'Excluded from answers',
        state: ['detected'], priority: ['P1 · Critical', 'tag-err'],
        conclusion: 'Four articles you own passed their review date and are no longer used to answer questions. ' +
          'Two of them carried <strong>61 questions</strong> in the last 30 days — those questions now resolve from ' +
          'weaker sources or not at all.',
        evidence: [trustState('expired'), pill('4', 'articles'), pill('61', 'questions affected', 'err'), confBadge('high')],
        action: entryAction('review', 'Request verification for 4 objects', 'data-act="verify-expired"'),
        note: 'Reviewed action · goes to a commit surface with the owner list before anything is sent.'
      })
    },
    {
      id: 'due',
      kind: 'bcard',
      chart: false,
      base: 78,
      entitled: (p) => p.owns > 0,
      relevance: (p) => (p.signals ? p.owns * 1.5 : 34),
      render: () => card({
        tone: 'warn', severity: 'away', label: 'Due for review',
        state: ['recommended'], priority: ['P2 · High', 'tag-warn'],
        conclusion: 'Six articles you own reach their review date within 14 days. Ranked by query volume, so the ' +
          'content that lapses loudest is first: <strong>Refund eligibility — EU</strong> answered 214 questions this month.',
        evidence: [trustState('due'), pill('6', 'articles'), pill('214', 'top-article queries'), confBadge('high')],
        action: entryAction('review', 'Verify or update 6 articles', 'data-act="verify-due"'),
        note: 'Ranked by query volume, not by date — the most-used content is verified first.'
      })
    },
    {
      id: 'gaps',
      kind: 'aggregate',
      chart: false,
      base: 72,
      entitled: () => true,
      relevance: (p) => (p.signals ? 30 + p.queriesPerWeek * 0.9 : 46),
      render: () => aggCard({
        tone: 'warn', severity: 'away', label: 'Coverage gaps',
        state: ['detected'],
        conclusion: '<strong>38 questions</strong> in the last 30 days had no grounded answer. Four topics account ' +
          'for most of them, and the top one has been asked in every week of that window.',
        stats: [['38', 'Unanswered'], ['4', 'Topics'], ['↑ 12', 'vs prior 30d']],
        rows: [
          ['Refunds after activation', 11, 1],
          ['SSO provisioning — enterprise', 9, 0.82],
          ['Data residency — EU', 7, 0.64],
          ['Contract exit terms', 5, 0.45]
        ],
        more: '+ 6 more topics · 6 questions combined',
        action: entryAction('prompt', 'Draft content for top gap', 'data-act="draft-gap"'),
        note: 'Prepared prompt · the question is composed for you; you send it.'
      })
    },
    {
      id: 'contradictions',
      kind: 'bcard',
      chart: false,
      base: 96,
      entitled: (p) => p.owns > 0,
      relevance: (p) => (p.signals ? 60 + p.owns * 0.8 : 38),
      render: () => card({
        tone: 'err', severity: 'busy', label: 'Contradiction',
        state: ['detected'], priority: ['P1 · Critical', 'tag-err'],
        conclusion: 'Two live objects give conflicting answers on refunds after activation. <strong>Both are verified</strong>, ' +
          'so retrieval treats them as equally authoritative and the answer depends on which one ranks first.',
        evidence: [pill('2', 'objects'), pill('Both', 'verified', 'warn'), confBadge('medium'),
          '<span style="font-size:11px;color:var(--d400);line-height:1.5;display:block;margin-top:6px">' +
          'Medium confidence: the two passages conflict on the activated-item exception, but one may be scoped to a ' +
          'storefront the other does not mention.</span>'],
        action: entryAction('investigate', 'Compare and resolve', 'data-act="compare"'),
        note: 'Automatic investigation · the canvas opens and the comparison runs immediately.'
      })
    },
    {
      id: 'lowconf',
      kind: 'bcard',
      chart: false,
      base: 64,
      entitled: () => true,
      relevance: (p) => (p.signals ? 24 + p.queriesPerWeek * 0.5 : 30),
      render: () => card({
        tone: 'warn', severity: 'away', label: 'Low-confidence answers served',
        state: ['detected'], priority: null,
        conclusion: 'Nine answers went out at low confidence this week. Seven were limited by the same thing: ' +
          'no source covers the <strong>activated-item exception</strong>.',
        evidence: [pill('9', 'answers'), pill('7', 'share one cause'), confBadge('low'),
          '<span style="font-size:11px;color:var(--d400);line-height:1.5;display:block;margin-top:6px">' +
          'Low confidence: the answers were grounded in a single passage that does not state the exception, and the ' +
          'article that would have covered it is expired.</span>'],
        action: entryAction('investigate', 'Review the limiting sources', 'data-act="lowconf"'),
        note: null
      })
    },
    {
      id: 'drafts',
      kind: 'bcard',
      chart: false,
      base: 58,
      entitled: (p) => p.owns > 0,
      relevance: (p) => (p.signals ? 20 + p.owns * 0.5 : 26),
      render: () => card({
        tone: 'ok', severity: 'online', label: 'Drafts awaiting review',
        state: ['drafted'], priority: null,
        conclusion: 'AiMY drafted three articles from resolved tickets and staged them for you. None are published, ' +
          'and none are used to answer questions until you accept them.',
        evidence: [pill('3', 'drafts'), pill('12', 'source tickets'), confBadge('medium'),
          '<span style="font-size:11px;color:var(--d400);line-height:1.5;display:block;margin-top:6px">' +
          'Medium confidence: each draft generalises from 3–5 tickets, which is enough for a pattern but not enough ' +
          'to settle edge cases.</span>'],
        action: entryAction('review', 'Review 3 drafts', 'data-act="drafts"'),
        note: 'Accept · Edit · Reject. Edit is not optional and nothing applies silently.'
      })
    },
    {
      id: 'sources',
      kind: 'aggregate',
      chart: false,
      base: 84,
      entitled: (p) => p.sourcesAdmin,
      relevance: () => 70,
      render: () => aggCard({
        tone: 'err', severity: 'busy', label: 'Source health',
        state: ['failed', 'Blocked'],
        conclusion: 'Two connected sources stopped syncing. Zendesk last succeeded <strong>6 days ago</strong>, so ' +
          'tickets resolved since then are not in the corpus and cannot be cited.',
        stats: [['2', 'Failing'], ['6d', 'Longest gap'], ['214', 'Cards behind']],
        rows: [
          ['Zendesk — Support tickets', '6d', 1, 'err'],
          ['Confluence — Policies space', '2d', 0.4, 'err']
        ],
        more: null,
        action: entryAction('direct', 'Reconnect Zendesk', 'data-act="reconnect"'),
        note: 'Direct action · completes in place, with Undo.'
      })
    },
    {
      id: 'resolved',
      kind: 'bcard',
      chart: false,
      base: 20,
      entitled: () => true,
      relevance: () => 18,
      render: () => card({
        tone: 'ok', severity: 'online', label: 'Recently resolved',
        state: ['completed', 'Handled'], priority: null,
        conclusion: 'The SSO provisioning gap raised on 12 July is closed. A new article was published, verified, ' +
          'and has answered <strong>23 questions</strong> since — none of them at low confidence.',
        evidence: [pill('23', 'questions answered'), pill('0', 'low-confidence', 'ok')],
        action: entryAction('direct', 'View audit trail', 'data-act="audit"'),
        note: null,
        tail: '<span style="font-size:10.5px;color:var(--d500)">Published 18 Jul · verified by A. Mahfouz</span>'
      })
    },
    {
      id: 'trend',
      kind: 'chart',
      chart: true,
      base: 14,
      entitled: () => true,
      relevance: () => 12,
      render: () => trendCard()
    }
  ];

  /* ═══════════════════════════════════════════════
     COMPOSITION (§9.2)

     Entitlement is a hard filter and must be visibly true: a briefing that
     silently includes inaccessible material is both a trust failure and a
     leak. Relevance only orders what survived it.
  ═══════════════════════════════════════════════ */
  const BUDGET_BLOCKS = 9;
  const BUDGET_CHARTS = 2;

  function compose(profile) {
    const eligible = BLOCKS
      .filter((b) => b.entitled(profile))
      .map((b) => ({ block: b, score: profile.signals ? b.relevance(profile) : b.base }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);

    const rendered = [];
    const displaced = [];
    let charts = 0;

    eligible.forEach((x) => {
      const overBlocks = rendered.length >= BUDGET_BLOCKS;
      const overCharts = x.block.chart && charts >= BUDGET_CHARTS;
      if (overBlocks || overCharts) {
        displaced.push({ block: x.block, why: overCharts ? 'chart budget' : 'block budget' });
        return;
      }
      if (x.block.chart) charts += 1;
      rendered.push(x.block);
    });

    return { rendered, displaced, eligible: eligible.length, charts };
  }

  /* ═══════════════════════════════════════════════
     CARD RENDERERS

     Composed from implemented primitives only. The zones the design system
     documents but never implemented (.bcard-body, .bcard-conclusion,
     .evidence-row, .bcard-action, .severity-dot, .priority-badge) are
     substituted with their implemented equivalents — see ../GAPS.md.
  ═══════════════════════════════════════════════ */
  function metaRow(o) {
    return `<div class="bcard-meta">
      <span class="bcard-type">${esc(o.label)}</span>
      ${workState(o.state[0], o.state[1])}
      ${o.priority ? `<span class="tag ${o.priority[1]}" style="margin-left:auto">${esc(o.priority[0])}</span>` : ''}
    </div>`;
  }

  function ackRow(id) {
    return `<div class="bcard-ack-row">
      <button class="bcard-ack-btn" data-ack="${id}">${ICO.check.replace('<svg', '<svg style="width:12px;height:12px"')}Acknowledge</button>
      <button class="bcard-ack-btn" data-toggle-dismiss>${ICO.x.replace('<svg', '<svg style="width:12px;height:12px"')}Dismiss</button>
      <div class="bcard-dismiss-picker">
        <button class="bcard-dismiss-reason" data-dismiss="${id}">Not my collection</button>
        <button class="bcard-dismiss-reason" data-dismiss="${id}">Already handling</button>
        <button class="bcard-dismiss-reason" data-dismiss="${id}">Not useful</button>
      </div>
    </div>`;
  }

  function card(o) {
    return `<div class="bcard ${o.tone === 'err' ? 'p1' : o.tone === 'warn' ? 'p2' : 'p3'}">
      ${metaRow(o)}
      <p class="bcard-title">${o.conclusion}</p>
      <div class="bcard-evidence">${o.evidence.join('')}</div>
      <div class="k-rule"></div>
      <div class="k-action-row">${o.action}${o.note ? `<span class="k-action-note">${esc(o.note)}</span>` : ''}</div>
      ${o.tail ? `<div class="bcard-ack-row">${o.tail}<button class="bcard-ack-btn" style="margin-left:auto;color:var(--ai-text)" data-undo>Undo</button></div>` : ackRow(o.label)}
    </div>`;
  }

  /* Aggregate card — the subject is a cluster, not a record (§10.3 blocks 3
     and 7). .agg-more is mandatory when the list is truncated: a ranked list
     that hides its tail makes a broad problem read as a narrow one. */
  function aggCard(o) {
    const rows = o.rows.map(([label, val, share, tone]) =>
      `<div class="agg-row">
        <span class="agg-bar" style="--agg-share:${share}${tone ? `;background:rgba(240,68,56,0.14)` : ''}"></span>
        <span class="agg-label">${esc(label)}</span>
        <span class="agg-val">${esc(val)}</span>
      </div>`).join('');

    return `<div class="bcard is-aggregate ${o.tone === 'err' ? 'p1' : 'p2'}">
      ${metaRow(o)}
      <p class="bcard-title">${o.conclusion}</p>
      <div class="agg-summary">
        ${o.stats.map(([v, l]) => `<div class="agg-stat"><span class="agg-stat-val">${esc(v)}</span><span class="agg-stat-lbl">${esc(l)}</span></div>`).join('')}
      </div>
      <div class="agg-list">${rows}${o.more ? `<div class="agg-more">${esc(o.more)}</div>` : ''}</div>
      <div class="k-rule"></div>
      <div class="k-action-row">${o.action}${o.note ? `<span class="k-action-note">${esc(o.note)}</span>` : ''}</div>
      ${ackRow(o.label)}
    </div>`;
  }

  /* Trend chart. SVG geometry is page content, not a component — the design
     system's own chart specimens are inline SVG. Every colour is a token, so
     the chart stays inside the system's visual language. Annotation uses
     .inline-note because .anno-card has no CSS (see ../GAPS.md). */
  /* ═══════════════════════════════════════════════
     ANSWER COVERAGE (§10.3 block 9)

     A single rising "% answered from verified content" line was a vanity
     metric: it goes up, and it tells you nothing to do. What a corpus owner
     needs is the COMPOSITION of what the corpus answered each week, because
     each band maps to a different action:

       grounded  — answered from verified content. Nothing to do.
       flagged   — answered, but from due or unverified content. Verify it.
       thin      — answered with a stated gap. Fill it.
       none      — could not answer. The most expensive band, and the one a
                   coverage percentage hides completely.

     Stacked, so the whole is always 100% and a gain in one band is visibly a
     loss in another — which a line chart cannot show. Bands carry a labelled
     legend, never colour alone.
  ═══════════════════════════════════════════════ */
  function trendCard() {
    /* [grounded, flagged, thin, none] per week, 12 weeks */
    const weeks = [
      [61, 21, 11, 7], [64, 20, 10, 6], [63, 21, 10, 6], [66, 20, 9, 5],
      [69, 18, 9, 4], [68, 19, 9, 4], [70, 18, 8, 4], [66, 17, 8, 9],
      [64, 18, 8, 10], [67, 17, 8, 8], [70, 16, 8, 6], [72, 17, 6, 5]
    ];
    const bands = [
      ['grounded', 'var(--ok)',   'Grounded',  'answered from verified content'],
      ['flagged',  'var(--warn)', 'Flagged',   'answered from due or unverified content'],
      ['thin',     'var(--info)', 'Thin',      'answered with a stated gap'],
      ['none',     'var(--err)',  'Unanswered','no source could answer it']
    ];
    const w = 520, h = 132, gap = 5;
    const bw = (w - gap * (weeks.length - 1)) / weeks.length;
    const latest = weeks[weeks.length - 1];

    const cols = weeks.map((wk, i) => {
      const x = i * (bw + gap);
      let yCursor = 0;
      const segs = wk.map((v, bi) => {
        const segH = (v / 100) * h;
        const y = yCursor; yCursor += segH;
        /* Week 8 is where Zendesk stopped syncing — the unanswered band is the
           only place that shows up, which is the point of charting it. */
        const dim = (i === 7 || i === 8) && bi === 3 ? '' : '';
        return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${segH.toFixed(1)}"
                      fill="${bands[bi][1]}" opacity="${bi === 0 ? 0.85 : 0.75}"${dim}/>`;
      }).join('');
      return segs;
    }).join('');

    return `<div class="bcard">
      <div class="bcard-meta">
        <span class="bcard-type">Answer coverage</span>
        <span class="tag tag-neutral" style="margin-left:auto">12 weeks</span>
      </div>
      <p class="bcard-title">What the corpus actually did with the questions it was asked. The
      <strong>unanswered</strong> band doubled in weeks 8 and 9 — the fortnight Zendesk stopped syncing — and has not
      fully recovered.</p>

      <svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" role="img" class="cov-chart"
           aria-label="Stacked weekly answer composition over 12 weeks. This week: 72 percent grounded, 17 percent from flagged content, 6 percent thin, 5 percent unanswered.">
        ${cols}
      </svg>

      <div class="cov-legend">
        ${bands.map(([k, c, label, desc], i) =>
          `<span class="cov-key" title="${esc(desc)}">
             <span class="cov-swatch" style="background:${c}"></span>
             <span class="cov-key-label">${esc(label)}</span>
             <span class="cov-key-val">${latest[i]}%</span>
           </span>`).join('')}
      </div>

      <div class="inline-note warn" style="margin-top:12px">
        <span class="dot"></span>
        <span><strong>23% of answers this week leaned on content that is not verified.</strong> That is the flagged and
        thin bands together — not a failure, but it is where the next verification pass pays for itself. The 5%
        unanswered is a coverage gap, and those are already in Requests.</span>
      </div>
    </div>`;
  }


  /* ═══════════════════════════════════════════════
     NON-HAPPY STATES (§10.5)

     Forced with ?state=loading | empty | error | ai-down so all four are
     reachable without breaking anything. They are designed states, not
     afterthoughts (doctrine Level 7).
  ═══════════════════════════════════════════════ */
  const forcedState = params.get('state');

  function skeletonCard() {
    return `<div class="bcard" aria-hidden="true">
      <div class="skeleton" style="height:10px;width:38%;margin-bottom:14px"></div>
      <div class="skeleton" style="height:12px;width:100%;margin-bottom:7px"></div>
      <div class="skeleton" style="height:12px;width:86%;margin-bottom:7px"></div>
      <div class="skeleton" style="height:12px;width:62%;margin-bottom:16px"></div>
      <div class="skeleton" style="height:30px;width:100%;border-radius:8px"></div>
    </div>`;
  }

  function blockError(label) {
    return `<div class="bcard p1">
      <div class="bcard-meta">
        <span class="bcard-type">${esc(label)}</span>
      </div>
      <p class="bcard-title">This block could not load. The rest of the briefing is unaffected and the corpus is not
      in an unknown state — only this reading of it failed.</p>
      <div class="k-rule"></div>
      <div class="k-action-row">
        <button class="btn btn-ghost btn-sm" data-retry>Retry this block</button>
      </div>
    </div>`;
  }

  /* Empty is a finding, not an absence. It states what the corpus covers well
     and where it is thinnest, and offers a next step (§10.5). */
  function emptyBriefing(profile) {
    return `<div class="empty-state">
      <div class="empty-state-icon">${ICO.shield.replace('<svg', '<svg style="width:22px;height:22px"')}</div>
      <div class="empty-state-title">Nothing needs your attention</div>
      <div class="empty-state-desc">
        Everything you can see is verified and within cadence${profile.owns ? `, including all ${profile.owns} objects you own` : ''}.
        Coverage is strongest on <strong>Policies</strong> (94% of questions answered from verified content) and
        thinnest on <strong>Contract terms</strong> (61%), which is where the next gap is most likely to open.
      </div>
      <div style="margin-top:14px">${entryAction('prompt', 'Ask what the corpus covers weakly', 'data-act="draft-gap"')}</div>
    </div>`;
  }

  function aiUnavailable() {
    return `<div class="ai-unavailable is-degraded">
      <div class="aiu-mark">${ICO.warn.replace('<svg', '<svg style="width:16px;height:16px"')}</div>
      <div>
        <div class="aiu-title">AiMY cannot generate right now</div>
        <div class="aiu-body">Interpretation and drafting are unavailable. <strong>Corpus health is not affected</strong> —
        every block below is read from system state and is current. Verification requests, dismissals and staged drafts
        are preserved and will still be there when generation returns.</div>
        <div class="aiu-note">Retrying automatically · last attempt 40s ago</div>
      </div>
    </div>`;
  }

  /* ═══════════════════════════════════════════════
     DASHBOARD
  ═══════════════════════════════════════════════ */
  function bootDashboard() {
    const profile = activeProfile();
    const grid = $('#briefingGrid');
    if (!grid) return;

    paintIdentity(profile);

    const { rendered, displaced, charts } = compose(profile);

    /* The honest statement of what this briefing is, for this person. */
    const stamp = $('#briefingStamp');
    if (stamp) {
      stamp.textContent = `${rendered.length} block${rendered.length === 1 ? '' : 's'} · ` +
        `${charts} chart${charts === 1 ? '' : 's'} · composed for ${profile.name.split(' ')[0]}`;
    }

    /* §9.3 degraded case — say so on the surface rather than quietly ranking
       by a default nobody chose. */
    const banner = $('#compositionBanner');
    if (banner && !profile.signals) {
      banner.innerHTML =
        `<span class="banner-ico">${ICO.warn.replace('<svg', '<svg style="width:15px;height:15px"')}</span>
         <span class="banner-body"><strong>Composed from entitlement only.</strong> Ownership and usage data are not
         available at user granularity for this account, so blocks are ordered by their standing rank rather than by
         what you own or ask about. The set below is correct; the ordering is generic.</span>`;
      banner.classList.remove('k-hidden');
    }

    if (forcedState === 'empty') {
      grid.innerHTML = `<div class="is-wide">${emptyBriefing(profile)}</div>`;
      if (stamp) stamp.textContent = 'Nothing to brief · corpus healthy';
      return;
    }

    if (forcedState === 'ai-down') grid.insertAdjacentHTML('beforebegin', aiUnavailable());

    /* Skeletons render in priority order, then each block replaces its own
       skeleton as it resolves. Blocks appear as they arrive rather than
       waiting for the slowest (§10.5). */
    grid.innerHTML = rendered.map((b, i) =>
      `<div class="${b.kind === 'aggregate' || b.kind === 'chart' ? '' : ''}${b.chart ? 'is-wide' : ''}" data-slot="${b.id}">${skeletonCard()}</div>`
    ).join('');

    if (forcedState === 'loading') return;   // hold the skeletons for inspection

    rendered.forEach((b, i) => {
      /* 70ms, not 130: at nine blocks the old cascade took 1.4s to fill the
         briefing, which reads as slow rather than progressive. */
      const delay = 180 + i * 70 + (b.id === 'sources' ? 620 : 0);  // sources is the slow one
      setTimeout(() => {
        const slot = grid.querySelector(`[data-slot="${b.id}"]`);
        if (!slot) return;
        slot.innerHTML = (forcedState === 'error' && b.id === 'lowconf')
          ? blockError('Low-confidence answers served')
          : b.render();
        /* Enter rather than pop. The cascade is already carried by the
           resolution order, so this adds no delay of its own. */
        const card = slot.firstElementChild;
        if (card) card.classList.add('k-enter');
      }, delay);
    });

    /* Displacement. A briefing that silently drops content teaches people not
       to trust it as complete (§10.3). */
    const disp = $('#displacementNote');
    if (disp && displaced.length) {
      disp.innerHTML =
        `<span class="dot"></span>
         <span><strong>${displaced.length} block${displaced.length === 1 ? '' : 's'} held back</strong> by the briefing
         budget: ${displaced.map((d) => esc(d.block.id)).join(', ')}. Nothing was dropped — open them in the workbench.</span>`;
      disp.classList.remove('k-hidden');
    }
  }

  function paintIdentity(profile) {
    const av = $('#userAvatar'), nm = $('#userName'), rl = $('#userRole');
    if (av) av.textContent = profile.initials;
    if (nm) nm.textContent = profile.name;
    if (rl) rl.textContent = profile.role;
    $$('[data-proto-as]').forEach((a) => {
      const on = a.getAttribute('data-proto-as') === profile.id;
      a.classList.toggle('is-on', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }

  /* ═══════════════════════════════════════════════
     CANVAS — float bar, overlay, entry-mode routing

     The canvas opens for depth, not for every click (§3). Direct actions
     complete in place with Undo; only investigation, prepared prompts and
     open-ended questions open the overlay; reviewed actions go to a
     structured commit surface instead.
  ═══════════════════════════════════════════════ */
  const canvas = {
    overlay: null, thread: null, sugg: null, input: null, floatBar: null, open: false,

    init() {
      this.overlay = $('#aimyOverlay');
      if (!this.overlay) return;
      this.thread   = $('#overlayThread', this.overlay);
      this.sugg     = $('#overlaySuggestions', this.overlay);
      this.input    = $('#overlayInput', this.overlay);
      this.floatBar = $('#aimyFloatBar');

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.open) this.close();
      });

      /* Clicking the bare frosted glass closes it, same as the reference.
         Guarded on e.target so clicks inside the thread do not. */
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) this.close();
      });

      if (this.thread) {
        this.thread.addEventListener('scroll', () => this.syncEdge(), { passive: true });
        this.syncEdge();
      }
    },

    /* Continuity (§4). The context envelope's seventh group is "prior relevant
       thread, and whether a memory cue should be shown" — the one group with a
       component in the library (#sc-memory-panel) that nothing here was using.

       Without it the canvas re-introduces itself every time: the user knows
       they asked about this yesterday, and the system acts like they didn't.
       The cue shows once per session, only where a prior thread is genuinely
       relevant, and it is droppable — carried context the user cannot see or
       refuse is surveillance, not memory. */
    memoryShown: false,
    memory(cue) {
      if (!cue || this.memoryShown || !this.thread) return;
      this.memoryShown = true;
      const el = document.createElement('div');
      el.className = 'memory-panel k-enter';
      el.innerHTML =
        `<div class="mem-head">${ICO.clock.replace('<svg', '<svg width="11" height="11"')}Carried from an earlier thread
           <span class="mem-age">${esc(cue.age)}</span></div>
         <div class="mem-thread">${cue.lines.map((l) =>
           `<div class="mem-line"><span class="mem-who">${esc(l[0])}</span><span class="mem-what">${esc(l[1])}</span></div>`).join('')}</div>
         <div class="mem-foot">
           <button class="btn btn-ghost btn-sm" data-mem-drop>Answer without it</button>
         </div>`;
      this.thread.appendChild(el);
      this.reveal(el);
    },

    /* basis: what the conversation is standing on. The canvas must show its
       basis without being asked (§4, Level 5). Rendered into the absolutely
       positioned "Based on" bar rather than into the thread's flow, so
       showing it cannot shift the conversation underneath. */
    show(basis) {
      if (!this.open) {
        this.overlay.classList.add('open');
        /* The float bar is the way IN to the canvas; once the canvas is open
           it is redundant, and leaving it up puts a second input on screen
           competing with the real one. */
        if (this.floatBar) this.floatBar.classList.add('hidden');
        this.open = true;
        setTimeout(() => { if (this.input) this.input.focus(); }, 220);
      }
      const tags = $('#overlayContextTags');
      if (tags && basis && basis.length) {
        tags.innerHTML = basis.map((b) => `<span class="overlay-context-tag">${esc(b)}</span>`).join('');
      }
    },

    /* Bring a newly-arrived message into view. A long answer aligns its own
       top rather than jumping to the bottom — scrolling to the end of a
       three-paragraph answer means landing on the sources and having to scroll
       back up to read what was actually said. Short answers just go to the
       bottom, which is where the eye already is. */
    /* The bottom fade means "there is more below", so it must disappear once
       there isn't. Recomputed on every scroll and after anything is added. */
    syncEdge() {
      const th = this.thread;
      if (!th) return;
      const atEnd = th.scrollHeight - th.clientHeight - th.scrollTop < 4;
      th.classList.toggle('is-at-end', atEnd);
    },

    reveal(el) {
      const th = this.thread;
      if (!th || !el) { this.syncEdge(); return; }
      if (th.scrollHeight <= th.clientHeight) return;      // nothing to scroll
      const msg = el.closest('.chat-msg') || el;
      const tall = msg.getBoundingClientRect().height > th.clientHeight * 0.7;
      if (tall) {
        th.scrollTop += msg.getBoundingClientRect().top - th.getBoundingClientRect().top - 12;
      } else {
        th.scrollTop = th.scrollHeight;
      }
      this.syncEdge();
    },

    close() {
      this.overlay.classList.remove('open');
      if (this.floatBar) this.floatBar.classList.remove('hidden');
      this.open = false;
      /* Product state is untouched — closing restores the surface exactly
         (§6 requirement 6). The thread is kept so re-entry continues it.
         Focus goes back to the control that opened the canvas; leaving it on
         a now-blurred element behind the overlay strands keyboard users. */
      const fb = $('#floatInput');
      setTimeout(() => { if (fb) fb.focus(); }, 160);
    },

    /* Prepared prompt: staged, not sent. The user sends it in one step (§3). */
    /* A prepared prompt is composed and staged for the user to send in one
       step (§3). Two things make that legible rather than confusing:

       The text is SELECTED, so typing replaces it. It is AiMY's draft of the
       question, not something you wrote, and it should be as easy to discard
       as to send.

       The bar is marked staged, so a composed question does not look identical
       to one you typed and forgot to send. */
    stage(text, basis) {
      this.show(basis);
      if (!this.input) return;
      this.input.value = text;
      this.input.focus();
      this.input.select();
      this.setStaged(true);
    },

    setStaged(on) {
      const bar = $('.overlay-input-bar', this.overlay);
      if (bar) bar.classList.toggle('is-staged', !!on);
      this.stagedNow = !!on;
    },

    ask(text, basis, answer) {
      this.show(basis);
      /* Clear any prompt staged by an earlier action. Leaving it stranded
         gives you a thread about one thing and an input holding a question
         about another. */
      if (this.stagedNow && this.input && this.input.value.trim() !== text.trim()) {
        this.input.value = '';
      }
      this.setStaged(false);
      /* Only where the earlier thread actually bears on this question — a cue
         that fires on everything is noise, and noise is what people learn to
         skip past. */
      if (/refund|activat|contradict/i.test(text)) {
        this.memory({ age: 'Yesterday, 16:40', lines: [
          ['You', 'asked which refund source support should follow'],
          ['AiMY', 'flagged the two verified objects as contradictory'],
          ['You', 'left it open pending the policy owner']
        ]});
      }
      if (this.sugg) this.sugg.classList.add('k-hidden');
      this.push('user', esc(text));
      const id = 'a' + Date.now();
      /* .ai-thinking's anatomy is .dots > span ×3 plus a label — bare <i>
         elements match no selector and render an empty pill. */
      this.push('aimy',
        '<span class="ai-thinking"><span class="dots"><span></span><span></span><span></span></span>' +
        '<span class="ai-thinking-label">Searching the corpus…</span></span>', id);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = answer || genericAnswer();
        /* The answer replaces the thinking indicator ~900ms after the thread
           last scrolled, and grows the thread by far more than it displaced.
           Without re-scrolling, the tail of the answer sits below the fold and
           the input bar slices it — the cut edge reads as a stray line. */
        this.reveal(el);
      }, 900);
    },

    /* The avatar always comes FIRST in the DOM, for both speakers.
       .chat-msg.user is `flex-direction: row-reverse`, so source order is
       visually mirrored — putting the user's avatar last in the markup is
       what flips it to the wrong side. */
    push(who, html, id) {
      if (!this.thread) return;
      const wrap = document.createElement('div');
      const isUser = who === 'user';
      wrap.className = 'chat-msg ' + (isUser ? 'user' : 'aimy');
      wrap.innerHTML =
        (isUser
          ? `<div class="msg-avatar">${esc(activeProfile().initials)}</div>`
          : '<div class="msg-avatar aimy-av"><svg width="15" height="17" viewBox="0 0 18 20"><use href="#aimy-logo-small"/></svg></div>') +
        `<div class="msg-bubble"${id ? ` id="${id}"` : ''}>${html}</div>`;
      this.thread.appendChild(wrap);
      this.thread.scrollTop = this.thread.scrollHeight;
      this.syncEdge();
    }
  };

  /* Toast with Undo — rung 1 of the confirmation ladder: reversible,
     single-entity, low blast radius means act, then offer the way back. */
  function toast(msg, undoLabel, sub) {
    const host = $('#toastHost');
    if (!host) return;
    /* Built to the #canvas-toast anatomy table, which the library's own CSS
       contradicts — see the correction in knowledge.css. Icon, body, divider
       and undo are siblings in a row; the countdown is absolutely positioned
       along the bottom edge. */
    host.innerHTML =
      `<div class="aimy-toast" role="status" aria-live="polite">
        <div class="aimy-toast-icon">${AIMY_MARK(13, 15)}</div>
        <div class="aimy-toast-body">
          <div class="aimy-toast-title">${esc(msg)}</div>
          ${sub ? `<div class="aimy-toast-sub">${esc(sub)}</div>` : ''}
        </div>
        ${undoLabel ? `<div class="aimy-toast-divider"></div>
        <button class="aimy-toast-undo" data-toast-undo>${esc(undoLabel)}</button>` : ''}
        <div class="aimy-toast-progress"><div class="aimy-toast-progress-fill"></div></div>
      </div>`;
    /* .aimy-toast enters at opacity 0 and .visible is what reveals it.
       Forcing a reflow between insertion and the class is what makes the
       transition run from the start value — requestAnimationFrame looks like
       the same thing but is throttled in background and offscreen contexts,
       where the callback never fires and the toast lives out its whole life
       at opacity 0. Every toast here was invisible under exactly that. */
    const el = $('.aimy-toast', host);
    if (el) { void el.offsetWidth; el.classList.add('visible'); }
    clearTimeout(toast._t);
    /* Matches the countdown's documented 5s — the bar is a claim about
       remaining time, so the dismiss has to honour it. */
    toast._t = setTimeout(() => { host.innerHTML = ''; }, 5000);
  }

  /* ═══════════════════════════════════════════════
     ANSWERS

     The doctrine names the failure this guards against: during the QA v2
     review "a Quality Score question received the previous SLA answer —
     visual context handoff existed; thread binding did not." An answer that
     does not depend on the question is that failure, and it is the one users
     never forgive because it is invisible until it matters.

     Two shapes, deliberately different:

       CORPUS answers are grounded in knowledge objects. They carry inline
       citations, a source list and a trust disclosure, because the user has to
       be able to check them.

       SYSTEM answers are derived from configuration and state — exposure,
       cadence, sync health, the queue. They carry no citations, because there
       is no document to cite. Dressing a state read in citation chrome would
       be the more dangerous lie: it looks checkable and is not.

     Anything unmatched gets an honest miss, not a confident paraphrase.
  ═══════════════════════════════════════════════ */
  function citeChip(n, title, passage, src, trust) {
    return `<span class="cite-wrap"><span class="cite" tabindex="0" role="button" aria-describedby="kcp${n}">${n}</span>` +
      `<span class="cite-preview" id="kcp${n}" role="tooltip">` +
      `<span class="cp-head"><span class="cp-title">${esc(title)}</span>${trustState(trust)}</span>` +
      `<span class="cp-passage">“${esc(passage)}”</span>` +
      `<span class="cp-foot"><span class="cp-src">${esc(src)}</span>` +
      `<button class="cite-action is-flag" data-flag="${n}">${ICO.flag}Flag</button></span></span></span>`;
  }

  function sourceRow(n, title, src, trust) {
    return `<div class="source-item"><span class="cite">${n}</span>${esc(title)}` +
      `<span class="source-domain">${esc(src)}</span>${trustState(trust)}</div>`;
  }

  /* A system answer states where the fact lives and routes there. No citations. */
  function systemAnswer(bodyHtml, o) {
    return `<div class="answer-surface">
      <div class="answer-body">${bodyHtml}</div>
      <div class="trust-disclosure">
        <div class="td-row">${ICO.shield}<span class="td-text">Read from <strong>${esc(o.from)}</strong> as it
        stands now — this is current configuration, not a document, so there is nothing to cite and nothing that
        can be out of date.</span></div>
      </div>
      ${o.action ? `<div class="k-row k-gap-2">${o.action}</div>` : ''}
    </div>`;
  }

  const ANSWERS = [
    /* ── Corpus: the refund contradiction ── */
    {
      match: /refund|activat|return/i,
      build: () => `<div class="answer-surface">
        <div class="answer-body">
          <p>Customers who purchased through the EU storefront may request a full refund within <strong>30 days</strong>
          of purchase${citeChip(1, 'Refund eligibility — EU customers',
            '…may request a full refund within 30 days of purchase, provided the item has not been activated.',
            'Confluence · Policies', 'expired')}, provided the item has not been
          activated${citeChip(2, 'Returns FAQ — activated items',
            'Activation ends refund eligibility. Faults are handled under warranty instead.',
            'Zendesk · Help Center', 'verified')}.</p>
          <p>The two sources disagree on what happens after activation, so treat the second clause as contested.</p>
        </div>
        <div class="source-list">
          ${sourceRow(1, 'Refund eligibility — EU customers', 'Confluence · Policies', 'expired')}
          ${sourceRow(2, 'Returns FAQ — activated items', 'Zendesk · Help Center', 'verified')}
        </div>
        <div class="trust-disclosure has-exclusion">
          <div class="td-row is-err">${ICO.slash}<span class="td-text"><strong>1 relevant source was excluded</strong>
          because it is past its review date. This answer is thinner than the corpus can actually support.</span></div>
          <div class="td-row is-warn">${ICO.clock}<span class="td-text">“Refund eligibility — EU customers” expired
          102 days ago · owner <strong>A. Mahfouz</strong></span></div>
          <button class="td-action" data-act="verify-expired">Request verification →</button>
        </div>
        ${answerScope(14, 2)}
        <div class="k-row k-gap-2">
          <button class="btn btn-ghost btn-sm" data-promote="article-refund">Promote “Refund eligibility”</button>
          <button class="btn btn-ghost btn-sm" data-act="compare">Resolve the contradiction</button>
        </div>
      </div>`
    },

    /* ── Corpus: what is expired, ranked by cost ── */
    {
      match: /expired|lapsed|past (its |their )?review|stale/i,
      build: () => `<div class="answer-surface">
        <div class="answer-body">
          <p>Four articles you own are past their review date and excluded from answers. Ranked by what the exclusion
          actually costs, not by how long they have been expired:</p>
          <p><strong>Refund eligibility — EU customers</strong>${citeChip(1, 'Refund eligibility — EU customers',
            '…may request a full refund within 30 days of purchase, provided the item has not been activated.',
            'Confluence · Policies', 'expired')} carried <strong>61 questions</strong> in the last 30 days and expired
          102 days ago. <strong>Returns FAQ — activated items</strong> carried 34. The remaining two carried none
          between them, which is a reason to retire rather than re-verify.</p>
        </div>
        <div class="source-list">
          ${sourceRow(1, 'Refund eligibility — EU customers', 'Confluence · Policies', 'expired')}
        </div>
        <div class="trust-disclosure has-exclusion">
          <div class="td-row is-err">${ICO.slash}<span class="td-text"><strong>All four are excluded from answers.</strong>
          Questions that would have resolved from them now resolve from weaker sources or not at all.</span></div>
          <button class="td-action" data-act="verify-expired">Request verification for 4 objects →</button>
        </div>
        ${answerScope(4, 1)}
      </div>`
    },

    /* ── Corpus: where coverage is thin ── */
    {
      match: /weakest|gap|missing|not cover|thin/i,
      build: () => `<div class="answer-surface">
        <div class="answer-body">
          <p>Thinnest where the corpus is asked most. <strong>Refunds after activation</strong> drew 11 questions in
          30 days with no source covering it — though 11 resolved tickets answer it consistently, so it is draftable.
          <strong>Data residency — EU</strong> drew 7 and has no material at all; drafting that one would be invention.</p>
          <p>Both are already in the queue as decisions rather than sitting here as observations.</p>
        </div>
        <div class="trust-disclosure">
          <div class="td-row is-warn">${ICO.warn}<span class="td-text">This is measured from questions asked, not from
          a content inventory — a topic nobody asks about will never appear here, however thin it is.</span></div>
        </div>
        ${answerScope(30, 0)}
        <div class="k-row k-gap-2">
          <a class="btn btn-ghost btn-sm" href="requests.html">Open both in Requests</a>
        </div>
      </div>`
    },

    /* ── Corpus: why confidence was low ── */
    {
      match: /low confidence|confidence|why.*(unsure|uncertain)/i,
      build: () => `<div class="answer-surface">
        <div class="answer-body">
          <p>Seven answers came out at low confidence this week and <strong>five trace to the same pair of
          objects</strong> — the refund contradiction. Confidence dropped because two verified sources disagreed, not
          because the corpus was thin.</p>
          <p>That distinction matters: adding content would not have helped. Resolving which object is authoritative
          would.</p>
        </div>
        <div class="source-list">
          ${sourceRow(1, 'Refund eligibility — EU customers', 'Confluence · Policies', 'expired')}
          ${sourceRow(2, 'Returns FAQ — activated items', 'Zendesk · Help Center', 'verified')}
        </div>
        ${answerScope(7, 2)}
        <div class="k-row k-gap-2">
          <button class="btn btn-ghost btn-sm" data-act="compare">Resolve the contradiction</button>
        </div>
      </div>`
    },

    /* ── System: per-agent exposure ── */
    {
      match: /ground answers in|exposure|which agent|connect can|can connect|expose/i,
      build: () => {
        const rows = GOV_COLLECTIONS.filter((c) => GOV_EXPOSURE[c.name].connect);
        const ext = GOV_AGENTS.find((a) => a.id === 'connect');
        return systemAnswer(
          `<p><strong>${esc(ext.name)}</strong> can ground answers in
           <strong>${rows.map((r) => esc(r.name)).join('</strong>, <strong>')}</strong> —
           ${rows.reduce((n, r) => n + r.objects, 0).toLocaleString()} objects in total.</p>
           <p>Connect is customer-facing, so that permission is doing more work than the others: it is the difference
           between a colleague reading something with judgement and an autonomous agent paraphrasing it to a customer.</p>`,
          { from: 'the exposure matrix',
            action: '<button class="btn btn-ghost btn-sm" data-goto-tab="govRules">Open the exposure matrix</button>' }
        );
      }
    },

    /* ── System: cadence change impact ── */
    {
      match: /cadence|90 days|tighten|verification interval/i,
      build: () => {
        const t = GOV_TYPES.find((x) => x.type === 'Article');
        return systemAnswer(
          `<p>Tightening the Article cadence from ${esc(t.cadence)} to 90 days re-schedules
           <strong>${t.count.toLocaleString()} objects</strong>. Anything already older than 90 days moves to
           <strong>due</strong> the moment it is applied.</p>
           <p>Nothing is excluded from answers by the change itself — exclusion happens when a due date passes
           unattended. What it does is move that cliff closer for a lot of content at once.</p>`,
          { from: 'the type rules',
            action: '<button class="btn btn-ghost btn-sm" data-gov-cadence="0">Review the change</button>' }
        );
      }
    },

    /* ── System: what a failing source costs ── */
    {
      match: /zendesk|sync|stopped syncing|missed since|source health|connector/i,
      build: () => {
        const z = SOURCES.find((s) => s.id === 'zendesk');
        const dead = SOURCES.filter((s) => srcStatus(s) === SRC_STATUS.failed);
        return systemAnswer(
          `<p><strong>${z.behind} tickets</strong> resolved since ${esc(z.lastOk)} are not in the corpus and cannot be
           cited. The failure is a credential one — the token was revoked at the source — so nothing will recover
           until it is replaced.</p>
           <p>${dead.length} source${dead.length === 1 ? ' is' : 's are'} in this state.
           ${esc(dead.map((s) => s.name).join(' and '))}. The cost is invisible on the answer surface: answers stay
           confident and get quietly thinner.</p>`,
          { from: 'connector sync state',
            action: '<button class="btn btn-ghost btn-sm" data-goto-src="zendesk">Open Zendesk</button>' }
        );
      }
    },

    /* ── System: the queue ── */
    {
      match: /request|queue|open longest|awaiting|decide|reject the/i,
      build: () => {
        const open = REQUESTS.filter((r) => !decisions[r.id]);
        const oldest = open[open.length - 1];
        return systemAnswer(
          `<p><strong>${open.length}</strong> request${open.length === 1 ? '' : 's'} are open. The oldest is
           <strong>${esc(oldest ? oldest.title : '—')}</strong>, waiting ${esc(oldest ? oldest.age : '—')}.</p>
           <p>Three of them are stuck on the same thing rather than on your attention: an object with no owner has
           nobody to route a verification request to, so it waits regardless of how long it sits there.</p>`,
          { from: 'the decision queue',
            action: '<a class="btn btn-ghost btn-sm" href="requests.html">Open Requests</a>' }
        );
      }
    },

    /* ── System: single-source dependency ── */
    {
      match: /depend|single source|only source/i,
      build: () => systemAnswer(
        `<p><strong>Policies</strong> depends entirely on Confluence, which is one of the two sources currently
         failing. Every other collection has at least two connectors feeding it.</p>
         <p>That is why the Confluence failure reads differently from the Zendesk one: there is no second path to the
         same content.</p>`,
        { from: 'source coverage',
          action: '<button class="btn btn-ghost btn-sm" data-goto-src="confluence">Open Confluence</button>' }
      )
    }
  ];

  /* An honest miss. Says what was searched, that nothing grounds it, and turns
     the gap into a queued decision — §1.2 requires a stated reason where no
     action exists, and this one does have an action. */
  function noGroundingAnswer(q) {
    return `<div class="answer-surface">
      <div class="answer-body">
        <p>Nothing in the corpus grounds an answer to that.</p>
        <p>I would rather say so than assemble something plausible from adjacent content — a confident answer with no
        source behind it is the failure this product exists to remove.</p>
      </div>
      <div class="trust-disclosure has-exclusion">
        <div class="td-row is-err">${ICO.slash}<span class="td-text"><strong>0 sources matched.</strong> This is a
        genuine coverage gap, not a retrieval or permission problem.</span></div>
        <button class="td-action" data-raise-gap="${esc(q).slice(0, 80)}">Raise it as a coverage gap →</button>
      </div>
      ${answerScope(0, 0)}
    </div>`;
  }

  function answerScope(considered, cited) {
    return `<div class="answer-scope">
      ${ICO.search.replace('<svg', '<svg style="width:12px;height:12px"')}
      <span>Scoped to ${esc(scopeBasis().join(' · '))} · ${considered} source${considered === 1 ? '' : 's'}
      considered, ${cited} cited.</span>
    </div>`;
  }

  /* ═══════════════════════════════════════════════
     ENTRY-MODE ROUTING — the same click must not always do the same thing
  ═══════════════════════════════════════════════ */
  const ACTS = {
    'verify-expired': {
      mode: 'review',
      run() { openCommit('verify-expired'); }
    },
    'verify-due': {
      mode: 'review',
      run() { openCommit('verify-due'); }
    },
    'compare': {
      mode: 'investigate',
      run() {
        canvas.ask(
          'Compare the two objects that conflict on refunds after activation',
          ['Contradiction · 2 objects', 'Collection: Policies', 'Both verified'],
          `<p>Both objects are verified and both are retrievable, which is why the answer moves depending on ranking.</p>
           <p><strong>Refund eligibility — EU customers</strong> states a 30-day window with no exception for activated
           items. <strong>Returns FAQ — activated items</strong> states that activation ends eligibility outright.</p>
           <p>They are not describing the same thing: the first is scoped to the EU storefront, the second is not scoped
           at all. The unscoped one is the problem.</p>
           <div class="trust-disclosure" style="margin-top:10px">
             <div class="td-row is-warn">${ICO.warn}<span class="td-text">Both sources are verified, so trust state
             cannot separate them. This needs a human ruling, not a re-verification.</span></div>
           </div>`
        );
      }
    },
    'lowconf': {
      mode: 'investigate',
      run() {
        canvas.ask(
          'What limited the nine low-confidence answers this week?',
          ['9 answers · last 7 days', 'Grouped by limiting factor'],
          `<p>Seven of the nine share one cause: no retrievable source states the activated-item exception. The article
          that covers it — <em>Refund eligibility — EU customers</em> — is expired, so retrieval excluded it.</p>
          <div class="trust-disclosure has-exclusion" style="margin-top:10px">
            <div class="td-row is-err">${ICO.slash}<span class="td-text"><strong>1 relevant source was excluded</strong>
            because it is past its review date. Seven answers were thinner than the corpus can actually support.</span></div>
            <div class="td-row is-warn">${ICO.clock}<span class="td-text">“Refund eligibility — EU customers” expired
            102 days ago · owner <strong>A. Mahfouz</strong></span></div>
            <button class="td-action" data-act="verify-expired">Request verification →</button>
          </div>`
        );
      }
    },
    'draft-gap': {
      mode: 'prompt',
      run() {
        canvas.stage(
          'Draft an article covering refunds after activation, grounded in the 11 tickets that asked about it.',
          ['Coverage gap · 11 questions', 'Source: 11 resolved tickets', 'Scope: Policies']
        );
      }
    },
    'drafts': {
      mode: 'review',
      run() { openCommit('drafts'); }
    },
    'reconnect': {
      mode: 'direct',
      run() {
        toast('Reconnecting Zendesk — sync queued', 'Undo');
      }
    },
    'audit': {
      mode: 'direct',
      run() { location.href = 'workbench.html?open=article-sso'; }
    }
  };

  /* Reviewed actions land on a structured commit surface with explicit scope.
     Routing a consequential write through free-text would invert
     Knowledge-to-Action (§1.4), so these never go to the canvas. */
  const COMMITS = {
    'verify-expired': {
      title: 'Request verification — 4 expired articles',
      current: 'Expired · excluded from answers',
      proposed: 'Verification requested · owner notified',
      rationale: 'Four articles you own are past review and excluded from retrieval. Two of them carried 61 questions ' +
        'in the last 30 days.',
      effects: [
        ['ok', 'Send a verification request to <strong>3 owners</strong> covering <strong>4 articles</strong>.'],
        ['warn', '<strong>1 article has no owner</strong> and will be routed to the Policies collection lead instead.'],
        ['skip', '<strong>1 article is superseded</strong> and will be skipped — its successor is already verified.']
      ],
      confirm: 'Send 3 requests'
    },
    'verify-due': {
      title: 'Verify or update — 6 articles due',
      current: 'Verified · due within 14 days',
      proposed: 'Verification confirmed · cadence reset',
      rationale: 'Six articles reach their review date within 14 days, ranked by query volume so the most-used ' +
        'content is verified first.',
      effects: [
        ['ok', 'Reset the review cadence on <strong>6 articles</strong> once each owner confirms.'],
        ['warn', '<strong>2 articles</strong> have changed since last verification and will need a read, not a click.']
      ],
      confirm: 'Send 6 requests'
    },
    'drafts': {
      title: 'Review 3 AiMY drafts',
      current: 'Drafted · not published, not retrievable',
      proposed: 'Published · verified · available to answers',
      rationale: 'Each draft generalises from 3–5 resolved tickets. Publishing makes them retrievable by every agent ' +
        'grounded in this corpus.',
      effects: [
        ['ok', 'Publish <strong>3 articles</strong> into <strong>Support</strong> with you as owner.'],
        ['warn', 'These become available to <strong>4 consuming agents</strong>, including one customer-facing.'],
        ['skip', '<strong>1 draft overlaps</strong> an existing article and will open as a suggested edit instead.']
      ],
      confirm: 'Publish 2, open 1 as an edit'
    }
  };

  /* Adapter onto the one commit surface — the briefing's reviewed actions
     carry an effect list rather than a blast radius. */
  function openCommit(key) {
    const c = COMMITS[key];
    if (!c) return;
    govCommit({ title: c.title, current: c.current, proposed: c.proposed,
                rationale: c.rationale, effects: c.effects, confirm: c.confirm, width: 520 });
  }

  /* ═══════════════════════════════════════════════
     WORKBENCH
  ═══════════════════════════════════════════════ */
  const CORPUS = [
    { id: 'article-refund', type: 'Article', ico: ICO.doc, trust: 'expired', title: 'Refund eligibility — EU customers',
      summary: '30-day window from purchase, provided the item has not been activated.',
      owner: 'A. Mahfouz', verified: '14 Jan', collection: 'Policies',
      fields: [['Applies to', 'EU storefront · all plans'], ['Collection', 'Policies']],
      action: ['review', 'Re-verify against source'] },
    { id: 'article-warranty', type: 'Article', ico: ICO.doc, trust: 'verified', title: 'Warranty process — EU',
      summary: 'What happens after activation, and where the 30-day refund window stops applying.',
      owner: 'A. Mahfouz', verified: '2 Jul', collection: 'Policies',
      fields: [['Applies to', 'EU storefront · activated items'], ['Collection', 'Policies']],
      action: ['direct', 'Open article'] },
    { id: 'article-sso', type: 'Article', ico: ICO.doc, trust: 'verified', title: 'SSO provisioning — enterprise',
      summary: 'SCIM provisioning, group mapping, and the two failure modes support sees most.',
      owner: 'N. Wael', verified: '18 Jul', collection: 'Support',
      fields: [['Applies to', 'Enterprise tier'], ['Collection', 'Support']],
      action: ['direct', 'Open article'] },
    { id: 'ticket-48120', type: 'Ticket', ico: ICO.ticket, trust: 'unverified', title: '#48120 — Refund declined after activation',
      owner: 'Ingested · Zendesk', verified: '2 Mar', collection: 'Support',
      fields: [['Requester', 'Nordwind GmbH'], ['Status', '<span class="tag tag-ok">Resolved</span>'],
               ['Resolution', 'Goodwill credit issued; policy exception logged.']],
      action: ['investigate', 'Investigate pattern'] },
    { id: 'icp-bpo', type: 'ICP', ico: ICO.target, trust: 'due', title: 'Mid-market BPO — EMEA',
      owner: 'Sales Ops', verified: '9 Feb', collection: 'Sales',
      fields: [['Segment', '200–2,000 seats · outsourced support']],
      list: ['Multi-client contact centre operation', 'Existing QA function with named owner'],
      negative: ['Single-client captive centres', 'Under 200 seats — no QA budget'],
      action: ['review', 'Review fit criteria'] },
    { id: 'campaign-q3', type: 'Campaign', ico: ICO.megaphone, trust: 'verified', title: 'Q3 — Quality at scale',
      owner: 'Marketing', verified: '28 Jun', collection: 'Marketing',
      fields: [['Objective', 'Pipeline from mid-market BPO'], ['Window', '<strong>1 Jul – 30 Sep</strong> · active']],
      tags: ['6 assets', '3 landing pages'],
      action: ['direct', 'Open campaign'] },
    { id: 'asset-onepager', type: 'Marketing Asset', ico: ICO.image, trust: 'verified', title: 'Quality at scale — one-pager',
      owner: 'Brand', verified: '3 Jul', collection: 'Marketing',
      fields: [['Format', 'PDF · A4 · 2pp'], ['Usage', 'External — customer-facing'],
               ['Approval', '<span class="tc-approval is-approved">' + ICO.check.replace('<svg', '<svg style="width:11px;height:11px"') + 'Approved</span>']],
      action: ['direct', 'Download asset'] },
    { id: 'story-nordwind', type: 'Success Story', ico: ICO.trophy, trust: 'verified', title: 'Nordwind — 31% faster resolution',
      owner: 'Marketing', verified: '21 Jun', collection: 'Marketing',
      fields: [['Customer', 'Nordwind GmbH · 800 seats'], ['Outcome', '<strong>31%</strong> faster first resolution'],
               ['Approval', '<span class="tc-approval is-pending">' + ICO.clock.replace('<svg', '<svg style="width:11px;height:11px"') + 'Awaiting customer sign-off</span>']],
      quote: 'We stopped guessing which conversations to review.',
      action: ['review', 'Review before external use'] },
    { id: 'page-pricing', type: 'Web Page', ico: ICO.globe, trust: 'expired', title: 'Pricing — Enterprise tier',
      owner: 'Unassigned', verified: '18 Mar', collection: 'Marketing',
      fields: [['Source URL', 'aimy.app/pricing/enterprise'], ['Last crawl', '18 Mar'],
               ['Changes', '<span class="tag tag-warn">Detected 4 Jul</span>']],
      action: ['review', 'Re-verify against source'] }
  ];

  function typeCard(o, compact) {
    const body = compact ? '' : `<div class="tc-body">
      ${o.fields ? `<div class="tc-fields">${o.fields.map(([l, v]) =>
        `<span class="tc-field-label">${esc(l)}</span><span class="tc-field-val">${v}</span>`).join('')}</div>` : ''}
      ${o.list ? `<ul class="tc-list">${o.list.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : ''}
      ${o.negative ? `<ul class="tc-list is-negative">${o.negative.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : ''}
      ${o.quote ? `<div class="tc-quote">“${esc(o.quote)}”</div>` : ''}
      ${o.tags ? `<div class="tc-tags">${o.tags.map((t) => `<span class="tag tag-neutral">${esc(t)}</span>`).join('')}</div>` : ''}
    </div>`;

    return `<div class="type-card${compact ? ' is-compact' : ''}" data-obj="${o.id}" data-trust-state="${o.trust}">
      <div class="tc-head">
        <span class="tc-type">${o.ico}${esc(o.type)}</span>
        ${trustState(o.trust)}
      </div>
      <div class="tc-title">${esc(o.title)}</div>
      ${!compact && o.summary ? `<div class="tc-summary">${esc(o.summary)}</div>` : ''}
      ${body}
      <div class="tc-gov">Owner <strong>${esc(o.owner)}</strong><span class="tc-gov-sep">·</span>Verified <strong>${esc(o.verified)}</strong></div>
      <div class="tc-action">${entryAction(o.action[0], o.action[1], `data-open-obj="${o.id}"`)}</div>
    </div>`;
  }

  /* The working set: the objects currently in play. A state concept, not a
     component — it renders as type cards, a viewer, or an editor depending on
     what is in it (§5.2, §5.4). Persists across overlay open/close. */
  const workingSet = {
    key: 'aimy-knowledge-ws',
    ids: [],
    open: null,

    load() {
      try { this.ids = JSON.parse(sessionStorage.getItem(this.key)) || []; } catch (e) { this.ids = []; }
    },
    save() {
      try { sessionStorage.setItem(this.key, JSON.stringify(this.ids)); } catch (e) {}
    },
    add(id, quiet) {
      if (this.ids.includes(id)) return false;
      this.ids.push(id);
      this.save();
      if (!quiet) toast('Promoted to working set', 'Undo');
      return true;
    },
    remove(id) {
      this.ids = this.ids.filter((x) => x !== id);
      this.save();
    },
    clear() { this.ids = []; this.open = null; this.save(); }
  };

  function renderWorkbench() {
    const stage = $('#wbStage');
    if (!stage) return;
    const floatWrap = $('#aimyFloatWrap');

    /* Empty working set: the float bar sits centred on the canvas. It docks
       the moment work exists (§5.2). */
    if (!workingSet.ids.length) {
      if (floatWrap) floatWrap.classList.add('is-centred');
      stage.innerHTML = `<div class="wb-blank">
        <div class="wb-blank-title">Nothing in the working set</div>
        <div class="wb-blank-body">Ask a question, or type the name of something you already know — a title, a person,
        a ticket number. Naming a known object opens it directly; nothing is generated for a lookup.</div>
      </div>`;
      return;
    }
    if (floatWrap) floatWrap.classList.remove('is-centred');

    if (workingSet.open) { renderViewer(workingSet.open); return; }

    const objs = workingSet.ids.map((id) => CORPUS.find((o) => o.id === id)).filter(Boolean);
    stage.innerHTML = `
      <div class="ws-head">
        <span class="ws-head-title">Working set</span>
        <span class="ws-head-count">${objs.length} object${objs.length === 1 ? '' : 's'}</span>
        <span class="ws-head-end">
          <button class="btn btn-ghost btn-sm" data-ws-clear>Clear</button>
        </span>
      </div>
      <div id="setScopeHost"></div>
      <div class="ws-grid">
        ${objs.map((o) => `<div class="ws-item" data-item="${o.id}">
          <!-- The label is visually a bare checkbox, so the accessible name has
               to name the object it selects — otherwise a keyboard user hears
               "checkbox" nine times with nothing to distinguish them. -->
          <label class="ds-choice ws-item-pick"><input type="checkbox" data-pick="${o.id}"
                 aria-label="Select ${esc(o.title)}"><span></span></label>
          ${typeCard(o)}
        </div>`).join('')}
      </div>`;
  }

  /* Set-scope bar. The scope statement and the skip line are both mandatory:
     a bulk operation that silently no-ops on part of its selection reports a
     success the user has no reason to distrust (§4, D3). */
  function renderSetScope() {
    const host = $('#setScopeHost');
    if (!host) return;
    const picked = $$('[data-pick]:checked').map((i) => i.getAttribute('data-pick'));
    if (!picked.length) { host.innerHTML = ''; return; }

    const objs = picked.map((id) => CORPUS.find((o) => o.id === id));
    const excluded = objs.filter((o) => TRUST[o.trust].excluded);
    const unowned = objs.filter((o) => o.owner === 'Unassigned');
    const actionable = objs.length - excluded.filter((o) => o.trust === 'superseded').length;

    host.innerHTML = `
      <div class="set-scope-bar">
        <span class="ss-count"><span class="ss-num">${picked.length}</span> selected</span>
        <span class="ss-scope">of <strong>${CORPUS.length} in the working set</strong> · ${workingSet.ids.length} of
        <strong>2,480 in the corpus</strong>. This selection is what you ticked, not a filter.</span>
        <span class="ss-actions">
          <button class="btn btn-ghost btn-sm" data-ss-clear>Clear</button>
          ${entryAction('review', 'Request verification', 'data-ss-run="1"')}
        </span>
      </div>
      <div class="ss-preview" id="ssPreview" hidden>
        <div class="ss-preview-head">What this will do</div>
        <div class="ss-effect is-ok">${ICO.check}<span>Send a verification request covering
        <strong>${actionable - unowned.length} object${actionable - unowned.length === 1 ? '' : 's'}</strong>.</span></div>
        ${unowned.length ? `<div class="ss-effect is-warn">${ICO.warn}<span><strong>${unowned.length} object${unowned.length === 1 ? ' has' : 's have'} no owner</strong>
        and will be routed to the collection lead instead.</span></div>` : ''}
        ${excluded.length ? `<div class="ss-effect is-skip">${ICO.slash}<span><strong>${excluded.length} object${excluded.length === 1 ? ' is' : 's are'} already excluded</strong>
        from retrieval — verification will still be requested, but nothing changes for answers until it is confirmed.</span></div>` : ''}
        <div style="display:flex;align-items:center;gap:8px;margin-top:12px;padding-top:10px;border-top:1px solid var(--hairline)">
          <button class="btn btn-brand btn-sm" data-ss-confirm="${actionable - unowned.length}">Send ${actionable - unowned.length} request${actionable - unowned.length === 1 ? '' : 's'}</button>
          <button class="btn btn-ghost btn-sm" data-ss-cancel>Cancel</button>
        </div>
      </div>`;
  }

  function renderViewer(id) {
    const o = CORPUS.find((x) => x.id === id);
    const stage = $('#wbStage');
    if (!o || !stage) return;
    const t = TRUST[o.trust];

    const notice = t.excluded ? `
      <div class="dv-notice is-${o.trust === 'superseded' ? 'superseded' : 'expired'}">
        ${o.trust === 'superseded' ? ICO.arrow : ICO.slash}
        <span class="dv-notice-text"><strong>${o.trust === 'superseded' ? 'Replaced 12 Mar 2026.' : 'Excluded from answers.'}</strong>
        ${o.trust === 'superseded'
          ? 'You are reading a superseded version. It is kept for reference and is not used to answer questions.'
          : 'This content is past its review date and AiMY will not ground answers in it. It remains readable — exclusion governs retrieval, not human access.'}</span>
        <button class="dv-notice-link" data-act="verify-expired">${o.trust === 'superseded' ? 'Go to current version →' : 'Request verification →'}</button>
      </div>` : '';

    stage.innerHTML = `
      <button class="wb-back" data-ws-back>${ICO.left}Back to working set</button>
      <div class="ws-single">
        <div class="doc-view" data-trust-state="${o.trust}">
          <div class="dv-head">
            <div class="dv-meta">
              <span class="tc-type">${o.ico}${esc(o.type)}</span>
              <span class="tag tag-neutral">${esc(o.collection)}</span>
              ${trustState(o.trust)}
            </div>
            <div class="dv-title">${esc(o.title)}</div>
          </div>
          <div class="dv-gov">
            <div class="dv-gov-item"><span class="dv-gov-label">Owner</span><span class="dv-gov-val">${esc(o.owner)}</span></div>
            <div class="dv-gov-item"><span class="dv-gov-label">Last verified</span><span class="dv-gov-val">${esc(o.verified)} 2026</span></div>
            <div class="dv-gov-item"><span class="dv-gov-label">Review due</span><span class="dv-gov-val${t.excluded ? ' is-overdue' : ''}">${t.excluded ? '102 days ago' : 'in 34 days'}</span></div>
            <div class="dv-gov-item"><span class="dv-gov-label">Source</span><span class="dv-gov-val">Confluence · ${esc(o.collection)}</span></div>
          </div>
          ${notice}
          <div class="dv-body">
            <p>${esc(o.summary || o.title)}</p>
            <h4>Exceptions</h4>
            <p>Activated products are handled case by case. Where a fault is demonstrated the standard window does not
            apply and the warranty process takes over.</p>
          </div>
          <div class="dv-rel">
            <div class="dv-rel-group">
              <span class="dv-rel-label">Related</span>
              <span class="dv-rel-items">
                <button class="dv-rel-item" data-open-obj="article-warranty">${ICO.doc}<span>Warranty process — EU</span></button>
              </span>
            </div>
            <div class="dv-rel-group">
              <span class="dv-rel-label">Contradicts</span>
              <span class="dv-rel-items">
                <button class="dv-rel-item is-contradiction" data-act="compare">${ICO.warn}<span>Returns FAQ — activated items</span></button>
              </span>
            </div>
          </div>
          <div class="dv-actions">
            ${entryAction('review', 'Verify now', 'data-act="verify-expired"')}
            <button class="btn btn-ghost" data-edit-obj="${o.id}">Edit</button>
            <span class="dv-actions-end">
              <button class="cite-action" data-act="report">${ICO.flag}Report a problem</button>
              <button class="cite-action">${ICO.quote}Cite</button>
            </span>
          </div>
        </div>
      </div>`;
  }

  /* ═══════════════════════════════════════════════
     RETRIEVAL — one input, routed on intent (§7.1)

     Someone looking for a known object, someone asking a question, and
     someone exploring a topic have different intents and should not have to
     declare which they are. The route is decided on the shape of what was
     typed, never on a mode switch.
  ═══════════════════════════════════════════════ */
  /* §7.1 routes on the shape of what was typed. The distinction that matters
     is between "I know what I want" and "I am asking about a topic", and it
     turns on how MANY objects the input identifies:

       exactly one, and substantially its title → object lookup, no generation
       question-shaped                          → generated answer
       anything else, including a term that      → ambiguous: results first,
       matches several objects                     answer resolving beneath

     Matching on any substring made a bare "refund" — which matches two
     objects — open one of them without asking. Opening a specific document
     when the user named a topic is a confident guess wearing the clothes of a
     direct action, and it is the case §7.1's third branch exists to catch. */
  function classifyQuery(q) {
    const s = q.trim();
    if (!s) return 'empty';
    if (/^(what|why|how|when|who|which|can|does|do|is|are|should)\b/i.test(s) || s.endsWith('?')) return 'question';

    const lower = s.toLowerCase();
    const hits = CORPUS.filter((o) => {
      const t = o.title.toLowerCase();
      return t.includes(lower) || lower.includes(t.slice(0, 14));
    });

    /* One object, and the input covers enough of its title to be a name
       rather than a keyword that happens to appear in it. */
    if (hits.length === 1 && lower.length >= hits[0].title.length * 0.5) return 'object';
    return 'ambiguous';
  }

  function runQuery(q) {
    const kind = classifyQuery(q);
    const match = CORPUS.find((o) =>
      o.title.toLowerCase().includes(q.trim().toLowerCase()) ||
      q.trim().toLowerCase().includes(o.title.toLowerCase().slice(0, 14)));

    /* Known object: generation was never needed, so the correct route is a
       direct action straight to the object. The overlay never opens (§5.2). */
    if (kind === 'object' && match) {
      workingSet.add(match.id, true);
      workingSet.open = match.id;
      renderWorkbench();
      toast(`Opened “${match.title}”`, null);
      return;
    }

    /* Ambiguous input returns results first, with the answer resolving
       beneath them — which also fills generation latency with something
       useful rather than a spinner (§7.1). */
    const words = q.toLowerCase().split(/\W+/).filter((x) => x.length > 3);
    const results = CORPUS
      .map((o) => ({ o, hits: words.filter((wd) => (o.title + ' ' + (o.summary || '')).toLowerCase().includes(wd)).length }))
      /* Only genuine matches. Padding the list with Policies objects meant a
         query nothing matched still showed two results above an answer saying
         "0 sources matched" — the surface contradicting itself in the one case
         where it most needs to be believed. */
      .filter((x) => x.hits > 0)
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 3)
      .map((x) => x.o);

    canvas.ask(q, scopeBasis(), answerFor(q, results, kind));
  }

  /* Scope is set before the query runs and stays visible throughout the
     answer — an answer read without knowing its scope cannot be judged (§7.2). */
  function scopeBasis() {
    const chips = $$('#floatFilterTray .filter-chip.active').map((c) => c.textContent.trim());
    return chips.length ? chips : ['the whole corpus'];
  }

  /* Scope was only visible while the tray was open, which meant it silently
     narrowed every answer from behind a control nobody had reason to reopen.
     Once scope exists it becomes permanent chrome and stays until cleared. */
  function paintScopeStrip() {
    const host = $('#scopeStrip');
    if (!host) return;
    const active = $$('#floatFilterTray .filter-chip.active');
    if (!active.length) { host.innerHTML = ''; host.classList.add('k-hidden'); return; }
    host.classList.remove('k-hidden');
    host.innerHTML = `<div class="afs">
      <span class="afs-label">Scope</span>
      ${active.map((c) => `<button class="afs-chip" data-scope-drop="${esc(c.textContent.trim())}">
        ${esc(c.textContent.trim())}&nbsp;<span class="x">×</span></button>`).join('')}
      <button class="afs-clear" data-scope-clear>Clear scope</button>
    </div>`;
  }

  /* The answer surface. Built as a self-contained fragment: no Knowledge
     navigation, no Knowledge layout, and no --accent anywhere inside it, so
     it renders identically inside a consuming agent's canvas (§8.1). */
  /* Routes the question to a topical answer. The match is on what was asked,
     so the same input on a different surface still gets the answer that belongs
     to it — and an unmatched question gets an honest miss rather than the last
     answer that happened to be built. */
  function answerFor(q, results, kind) {
    const topic = ANSWERS.find((a) => a.match.test(q));
    const body = topic ? topic.build() : noGroundingAnswer(q);

    if (kind !== 'ambiguous') return body;

    /* Ambiguous input resolves results first, then the answer beneath (§7.1). */
    const head = `<div class="rs-head"><span class="rs-label">Matches</span>
      <span class="rs-note">shown first — the answer resolves below</span></div>
      <div class="rs-list">${results.slice(0, 2).map((o) => typeCard(o, true)).join('')}</div>`;
    return body.replace('<div class="answer-surface">', `<div class="answer-surface">${head}`);
  }

  /* ═══════════════════════════════════════════════
     REQUESTS — the decision queue (§4)

     Contested items where a person must decide, the decision must be recorded,
     and it must be reversible. Deliberately separate from the workbench:
     mixing the two would make routine editing feel consequential and
     consequential decisions feel routine.

     Four origins, one shape. Every item carries its evidence, a structured
     decision surface offering Accept · Edit · Reject, and an audit trail.
  ═══════════════════════════════════════════════ */
  const RQ_KIND = {
    verification:  { label: 'Verification', ico: ICO.shield },
    contradiction: { label: 'Contradiction', ico: ICO.warn },
    gap:           { label: 'Coverage gap', ico: ICO.search },
    draft:         { label: 'Draft review', ico: ICO.pen }
  };

  const REQUESTS = [
    {
      id: 'rq-1', kind: 'verification', state: ['staged', 'Awaiting you'], severity: 'busy',
      title: 'Refund eligibility — EU customers',
      sub: 'Expired 102 days ago · 61 questions affected',
      age: '2h', requester: 'AiMY', object: 'article-refund', trust: 'expired',
      evidence: [
        ['Owner', 'A. Mahfouz'],
        ['Last verified', '14 Jan 2026 · 102 days ago'],
        ['Retrieval', 'Excluded — not used to answer questions'],
        ['Questions affected', '61 in the last 30 days'],
        ['Raised by', 'Expired-and-excluded briefing block']
      ],
      prompt: 'Confirm “Refund eligibility — EU customers” is still accurate and return it to answers?',
      consequence: 'Returns the article to retrieval immediately and resets its review cadence to 180 days. ' +
        'The contradiction with “Returns FAQ — activated items” is not resolved by this and stays open.',
      acceptLabel: 'Confirm and return to answers', editLabel: 'Open and edit first',
      rejectLabel: 'Not accurate — keep it excluded',
      audit: [
        { tone: 'is-warn', ico: ICO.clock, action: 'Excluded from retrieval — review date passed',
          who: 'AiMY', detail: 'automatic, under the verification cadence rule', time: '102d ago', irreversible: 'Policy' },
        { tone: 'is-ai', ico: null, action: 'Verification requested from A. Mahfouz',
          who: 'AiMY', detail: 'raised from the corpus briefing', time: '2h ago', revert: 'Withdraw' }
      ]
    },
    {
      id: 'rq-2', kind: 'contradiction', state: ['detected'], severity: 'busy',
      title: 'Refunds after activation',
      sub: 'Two verified objects disagree',
      age: '5h', requester: 'AiMY',
      evidence: [
        ['Object A', '“Refund eligibility — EU customers” · 30-day window, no activation exception'],
        ['Object B', '“Returns FAQ — activated items” · activation ends eligibility outright'],
        ['Trust', 'Both verified — trust state cannot separate them'],
        ['Scope', 'A is scoped to the EU storefront. B is not scoped at all'],
        ['Impact', '7 low-confidence answers this week trace to this pair']
      ],
      prompt: 'Which object is authoritative on refunds after activation?',
      consequence: 'The one not chosen is marked superseded and leaves retrieval, resolving to its successor. ' +
        'Nothing is deleted and readers who follow an old link still see the content with the relationship stated.',
      acceptLabel: 'Make A authoritative', editLabel: 'Scope both instead', rejectLabel: 'Not a contradiction',
      audit: [
        { tone: 'is-ai', ico: null, action: 'Conflicting passages detected across 2 objects',
          who: 'AiMY', detail: 'automatic investigation · confidence medium', time: '5h ago' }
      ]
    },
    {
      id: 'rq-3', kind: 'gap', state: ['detected'], severity: 'away',
      title: 'Refunds after activation — no source covers it',
      sub: '11 questions in 30 days, asked every week',
      age: '1d', requester: 'AiMY',
      evidence: [
        ['Questions', '11 in the last 30 days'],
        ['Pattern', 'Asked in every week of the window'],
        ['Nearest content', '“Returns FAQ” — mentions activation but not the refund consequence'],
        ['Available material', '11 resolved Zendesk tickets answering it consistently']
      ],
      prompt: 'Draft an article covering refunds after activation from the 11 resolved tickets?',
      consequence: 'Creates a draft owned by you. Nothing is published and nothing enters retrieval until you ' +
        'review and accept it. Declining records the gap as a deliberate non-decision, not an oversight.',
      acceptLabel: 'Draft it', editLabel: 'Adjust the brief', rejectLabel: 'Do not fill',
      audit: [
        { tone: 'is-ai', ico: null, action: 'Coverage gap clustered from 11 unanswered questions',
          who: 'AiMY', detail: 'raised from the coverage-gaps briefing block', time: '1d ago' }
      ]
    },
    {
      id: 'rq-4', kind: 'draft', state: ['drafted'], severity: 'online',
      title: 'SSO provisioning — enterprise',
      sub: 'AiMY-drafted from 5 resolved tickets',
      age: '1d', requester: 'AiMY', object: 'article-sso',
      evidence: [
        ['Source tickets', '5 resolved · all Enterprise tier'],
        ['Confidence', 'Medium — generalises from 5 tickets, edge cases unsettled'],
        ['Collection', 'Support'],
        ['On publish', 'Available to 4 consuming agents, one customer-facing']
      ],
      prompt: 'Publish “SSO provisioning — enterprise” into Support with you as owner?',
      consequence: 'Enters retrieval immediately and becomes citable by every agent grounded in this corpus, ' +
        'including one customer-facing. Reversible for 24 hours; after that, unpublishing is a new request.',
      acceptLabel: 'Publish', editLabel: 'Edit before publishing', rejectLabel: 'Discard the draft',
      audit: [
        { tone: 'is-ai', ico: null, action: 'Article drafted from 5 resolved tickets',
          who: 'AiMY', detail: 'staged, not published — nothing entered retrieval', time: '1d ago', irreversible: 'Not yet applied' }
      ]
    },
    {
      id: 'rq-5', kind: 'verification', state: ['staged', 'Awaiting an owner'], severity: 'busy',
      title: 'Pricing — Enterprise tier',
      sub: 'Expired · no owner to route to',
      age: '3d', requester: 'AiMY', object: 'page-pricing', trust: 'expired',
      evidence: [
        ['Owner', 'Unassigned — this is why the request is stuck'],
        ['Source', 'aimy.app/pricing/enterprise · last crawl 18 Mar'],
        ['Change detection', 'Source page changed 4 Jul; the corpus copy did not'],
        ['Retrieval', 'Excluded — not used to answer questions']
      ],
      prompt: 'Assign an owner to “Pricing — Enterprise tier” so verification can be requested?',
      consequence: 'Assignment is the decision here — verification cannot be requested without an owner. ' +
        'The page stays excluded from answers until someone confirms it against the live source.',
      acceptLabel: 'Assign to Marketing', editLabel: 'Choose a different owner', rejectLabel: 'Retire the page',
      audit: [
        { tone: 'is-err', ico: ICO.x, action: 'Verification request could not be routed',
          who: 'AiMY', detail: 'no owner on the object and no collection lead for Marketing', time: '3d ago' },
        { tone: 'is-warn', ico: ICO.warn, action: 'Source page changed since last crawl',
          who: 'AiMY', detail: 'change detection · corpus copy is now behind the live page', time: '4 Jul' }
      ]
    },
    {
      id: 'rq-6', kind: 'gap', state: ['detected'], severity: 'away',
      title: 'Data residency — EU',
      sub: '7 questions in 30 days',
      age: '4d', requester: 'AiMY',
      evidence: [
        ['Questions', '7 in the last 30 days'],
        ['Nearest content', 'None — no object in the corpus mentions residency'],
        ['Asked by', 'Support (4) · Sales (3)'],
        ['Available material', 'No resolved tickets settle it consistently']
      ],
      prompt: 'Request content on EU data residency from a subject-matter owner?',
      consequence: 'Routes a content request to the Policies collection lead rather than drafting. ' +
        'AiMY has no consistent source material for this one, so a draft would be invention.',
      acceptLabel: 'Request from Policies lead', editLabel: 'Change the recipient', rejectLabel: 'Do not fill',
      audit: [
        { tone: 'is-ai', ico: null, action: 'Coverage gap detected — no grounding material available',
          who: 'AiMY', detail: 'drafting withheld: no consistent source to generalise from', time: '4d ago' }
      ]
    },
    {
      id: 'rq-7', kind: 'draft', state: ['drafted'], severity: 'online',
      title: 'Contract exit terms',
      sub: 'AiMY-drafted · overlaps an existing article',
      age: '6d', requester: 'AiMY',
      evidence: [
        ['Source tickets', '3 resolved · mid-market'],
        ['Confidence', 'Low — 3 tickets, and two contradict each other on notice period'],
        ['Overlap', '“Contract terms — standard” already covers 60% of this'],
        ['Recommendation', 'Merge as a suggested edit rather than publish separately']
      ],
      prompt: 'Open this draft as a suggested edit to “Contract terms — standard” instead of publishing it?',
      consequence: 'Nothing new enters the corpus. The draft becomes a reviewable diff on the existing article, ' +
        'which keeps one answer for one question instead of two that partly disagree.',
      acceptLabel: 'Open as suggested edit', editLabel: 'Publish separately anyway', rejectLabel: 'Discard draft',
      audit: [
        { tone: 'is-warn', ico: ICO.warn, action: 'Draft withheld from publishing — overlap detected',
          who: 'AiMY', detail: 'confidence low · two source tickets disagree on notice period', time: '6d ago', irreversible: 'Not yet applied' }
      ]
    }
  ];

  /* Decisions taken this session. A decision is recorded and reversible — the
     resolved state replaces the decision zone rather than removing it, so the
     item never loses the record of what was decided (§4). */
  const decisions = {};
  let rqFilter = 'all';
  let rqOpen = null;

  function rqVisible() {
    return REQUESTS.filter((r) => rqFilter === 'all' || r.kind === rqFilter);
  }

  function renderRequests() {
    const queue = $('#rqQueue');
    if (!queue) return;
    const items = rqVisible();

    const counts = { all: REQUESTS.length };
    Object.keys(RQ_KIND).forEach((k) => { counts[k] = REQUESTS.filter((r) => r.kind === k).length; });
    $$('#rqFilter .seg-btn').forEach((b) => {
      const k = b.getAttribute('data-rq-filter');
      b.classList.toggle('active', k === rqFilter);
      b.setAttribute('aria-pressed', k === rqFilter ? 'true' : 'false');
      const n = b.querySelector('.rq-count');
      if (n) n.textContent = counts[k];
    });

    if (!items.length) {
      queue.innerHTML = `<div class="empty-state" style="padding:32px 20px">
        <div class="empty-state-title">Nothing of this kind waiting</div>
        <div class="empty-state-desc">No ${esc(RQ_KIND[rqFilter] ? RQ_KIND[rqFilter].label.toLowerCase() : '')} requests are open.</div>
      </div>`;
    } else {
      queue.classList.add('k-stagger');
      queue.innerHTML = items.map((r, qi) => {
        const d = decisions[r.id];
        const k = RQ_KIND[r.kind];
        return `<button class="list-row rq-row${rqOpen === r.id ? ' is-selected' : ''}" data-rq="${r.id}"
                        style="--i:${qi}"
                        aria-current="${rqOpen === r.id ? 'true' : 'false'}">
          <span class="list-main">
            <span class="rq-row-kind">${k.ico}${esc(k.label)}</span>
            <span class="list-title">${esc(r.title)}</span>
            <span class="list-sub">${esc(r.sub)}</span>
          </span>
          <span class="rq-row-end">
            ${d ? workState(d.state, d.label) : workState(r.state[0], r.state[1])}
            <span class="list-meta">${esc(r.age)}</span>
          </span>
        </button>`;
      }).join('');
    }

    renderRequestDetail();
  }

  function renderRequestDetail() {
    const host = $('#rqDetail');
    if (!host) return;
    const r = REQUESTS.find((x) => x.id === rqOpen);

    if (!r) {
      host.innerHTML = `<div class="empty-state">
        <div class="empty-state-icon">${ICO.scales.replace('<svg', '<svg width="22" height="22"')}</div>
        <div class="empty-state-title">Select a request</div>
        <div class="empty-state-desc">Every item here is a decision someone has to make, with its evidence and a
        record of what happens next. ${REQUESTS.length} are open.</div>
      </div>`;
      return;
    }

    const k = RQ_KIND[r.kind];
    const d = decisions[r.id];

    host.innerHTML = `
      <div class="rq-head">
        <div class="rq-head-meta">
          <span class="tc-type">${k.ico}${esc(k.label)}</span>
          ${r.trust ? trustState(r.trust) : ''}
          ${d ? workState(d.state, d.label) : workState(r.state[0], r.state[1])}
        </div>
        <h2 class="rq-title">${esc(r.title)}</h2>
        <div class="rq-sub">Raised by <strong>${esc(r.requester)}</strong> · ${esc(r.age)} ago${
          r.object ? ` · <button class="link" data-open-in-wb="${r.object}">Open the object</button>` : ''}</div>
      </div>

      <div class="rq-section">
        <div class="rq-section-label">Evidence</div>
        <dl class="desc-list rq-evidence">
          ${r.evidence.map(([k2, v]) => `<dt>${esc(k2)}</dt><dd>${esc(v)}</dd>`).join('')}
        </dl>
      </div>

      <div class="rq-section">
        <div class="rq-section-label">Decision</div>
        ${d ? resolvedZone(r, d) : decisionZone(r)}
      </div>

      <div class="rq-section">
        <div class="rq-section-label">Audit trail</div>
        <div class="audit-trail">
          ${(d ? [d.entry] : []).concat(r.audit).map(auditEntry).join('')}
        </div>
      </div>`;
  }

  function decisionZone(r) {
    return `<div class="decision-zone">
      <p class="dz-prompt">${esc(r.prompt)}</p>
      <div class="dz-consequence">
        ${ICO.warn.replace('<svg', '<svg width="13" height="13" style="flex-shrink:0;margin-top:2px"')}
        <span>${r.consequence}</span>
      </div>
      <div class="dz-actions">
        <button class="btn btn-brand btn-sm" data-decide="${r.id}|accept">${esc(r.acceptLabel || 'Accept')}</button>
        <button class="btn btn-ghost btn-sm" data-decide="${r.id}|edit">${esc(r.editLabel || 'Edit')}</button>
        <button class="btn btn-ghost btn-sm" data-decide="${r.id}|reject">${esc(r.rejectLabel || 'Reject')}</button>
        <span class="dz-spacer"></span>
        ${workState(r.state[0], r.state[1])}
      </div>
      <div class="dz-meta">
        <span>Proposed by ${esc(r.requester)}</span><span>·</span>
        <span>Requires: <strong style="color:var(--d300)">Knowledge owner</strong></span><span>·</span>
        <span>Decision is logged</span>
      </div>
    </div>`;
  }

  function resolvedZone(r, d) {
    const tint = d.outcome === 'reject' ? 'rgba(240,68,56,0.24)'
               : d.outcome === 'edit'   ? 'rgba(247,144,9,0.28)'
               : 'rgba(23,178,106,0.28)';
    return `<div class="decision-zone" style="border-color:${tint}">
      <p class="dz-prompt" style="margin-bottom:10px">${esc(d.summary)}</p>
      <div class="dz-actions">
        ${workState(d.state, d.label)}
        <span class="dz-spacer"></span>
        <button class="btn btn-ghost btn-sm" data-undecide="${r.id}">Undo</button>
      </div>
      <div class="dz-meta"><span>Decided by ${esc(activeProfile().name)} · just now · reversible for 24h</span></div>
    </div>`;
  }

  function auditEntry(e) {
    const ico = e.ico
      ? e.ico.replace('<svg', '<svg width="11" height="11"')
      : '<svg width="9" height="10" viewBox="0 0 18 20"><use href="#aimy-logo-small"/></svg>';
    return `<div class="audit-entry ${e.tone || ''}">
      <span class="audit-ico">${ico}</span>
      <div class="audit-main">
        <div class="audit-action">${esc(e.action)}</div>
        <div class="audit-actor"><span class="audit-who">${esc(e.who)}</span> · ${esc(e.detail)}</div>
      </div>
      <div class="audit-side">
        <span class="audit-time">${esc(e.time)}</span>
        ${e.revert ? `<button class="audit-revert">${esc(e.revert)}</button>`
                   : e.irreversible ? `<span class="audit-irreversible">${esc(e.irreversible)}</span>` : ''}
      </div>
    </div>`;
  }

  /* Accept · Edit · Reject all record a decision. Edit is not a cancel — it
     routes to the surface where the proposal can be changed, and the item
     stays in the queue until that edit is itself committed. */
  function decide(id, outcome) {
    const r = REQUESTS.find((x) => x.id === id);
    if (!r) return;

    if (outcome === 'edit') {
      if (r.object) {
        toast('Opening in the workbench to edit', null);
        setTimeout(() => { location.href = 'workbench.html?open=' + encodeURIComponent(r.object); }, 400);
      } else {
        canvas.stage(`Revise this proposal before I decide: ${r.prompt}`,
          [RQ_KIND[r.kind].label, r.title, 'Decision pending']);
      }
      return;
    }

    const accepted = outcome === 'accept';
    decisions[id] = {
      outcome,
      state: accepted ? 'completed' : 'failed',
      label: accepted ? 'Accepted' : 'Rejected',
      summary: accepted
        ? `${r.acceptLabel || 'Accepted'} — ${r.title}.`
        : `Rejected — ${r.title} is unchanged.`,
      entry: {
        tone: accepted ? 'is-ok' : 'is-err',
        ico: accepted ? ICO.check : ICO.x,
        action: accepted ? `${r.acceptLabel || 'Accepted'} — ${r.title}` : `Rejected — no change was written`,
        who: activeProfile().name,
        detail: accepted ? 'decision recorded · reversible for 24h' : 'decision recorded with the item left open',
        time: 'just now',
        revert: 'Revert'
      }
    };
    renderRequests();
    paintNavSignals();
    toast('Decision recorded', 'Undo');
  }

  /* ═══════════════════════════════════════════════
     GOVERNANCE (§4, §1.1, §8.1)

     Not a settings page. One corpus feeds many agents, which makes "may this
     agent ground answers in this collection" an operational decision with
     consequences — a source safe for an internal reviewer is not automatically
     safe for a customer-facing autonomous agent.

     Everything here is a governed write, so nothing commits from the control
     itself. Cadence and ownership go to rung 3 (reviewed action with an
     explicit diff); exposure goes to rung 4 (type-to-confirm + audit), per the
     confirmation ladder's own binding table.
  ═══════════════════════════════════════════════ */
  const CADENCES = ['30 days', '90 days', '180 days', '365 days', 'No cadence'];

  const GOV_TYPES = [
    { type: 'Article',         ico: ICO.doc,       cadence: '180 days', owner: true,  approval: false, count: 412 },
    { type: 'Ticket',          ico: ICO.ticket,    cadence: 'No cadence', owner: false, approval: false, count: 1284 },
    { type: 'ICP',             ico: ICO.target,    cadence: '90 days',  owner: true,  approval: false, count: 14 },
    { type: 'Campaign',        ico: ICO.megaphone, cadence: '90 days',  owner: true,  approval: false, count: 23 },
    { type: 'Marketing Asset', ico: ICO.image,     cadence: '180 days', owner: true,  approval: true,  count: 96 },
    { type: 'Success Story',   ico: ICO.trophy,    cadence: '365 days', owner: true,  approval: true,  count: 31 },
    { type: 'Blog',            ico: ICO.book,      cadence: '365 days', owner: true,  approval: true,  count: 88 },
    { type: 'Web Page',        ico: ICO.globe,     cadence: '90 days',  owner: true,  approval: false, count: 532 }
  ];

  const GOV_COLLECTIONS = [
    { name: 'Policies',  owner: 'A. Mahfouz',  objects: 148, cadence: 'Inherit from type' },
    { name: 'Support',   owner: 'N. Wael',     objects: 1310, cadence: '90 days' },
    { name: 'Marketing', owner: 'Brand team',  objects: 238, cadence: 'Inherit from type' },
    { name: 'Sales',     owner: 'Sales Ops',   objects: 84,  cadence: 'Inherit from type' }
  ];

  /* Consuming agents. `external` marks the ones that speak to customers —
     the exposure decision is materially different for those. */
  const GOV_AGENTS = [
    { id: 'qa',      name: 'QA',      external: false },
    { id: 'talent',  name: 'Talent',  external: false },
    { id: 'sales',   name: 'Sales',   external: false },
    { id: 'connect', name: 'Connect', external: true }
  ];

  /* collection → agent → may ground answers in it */
  const GOV_EXPOSURE = {
    Policies:  { qa: true,  talent: true,  sales: true,  connect: true  },
    Support:   { qa: true,  talent: false, sales: false, connect: true  },
    Marketing: { qa: false, talent: false, sales: true,  connect: false },
    Sales:     { qa: false, talent: false, sales: true,  connect: false }
  };

  const GOV_AUDIT = [
    { tone: 'is-warn', ico: ICO.shield, action: 'Support exposed to Connect (customer-facing)',
      who: 'A. Mahfouz', detail: 'typed confirmation · 1,310 objects became citable externally', time: '6 Apr', revert: 'Revert' },
    { tone: 'is-ok', ico: ICO.check, action: 'Verification cadence on Web Page tightened 180 → 90 days',
      who: 'N. Wael', detail: 'accepted an AiMY proposal · 532 objects re-scheduled', time: '2 Apr', revert: 'Revert' },
    { tone: 'is-ai', ico: null, action: 'Approval requirement added to Success Story',
      who: 'AiMY', detail: 'proposed after a story was cited externally before sign-off', time: '28 Mar' }
  ];

  function govPill(on, label) {
    return `<span class="tag ${on ? 'tag-ok' : 'tag-neutral'}">${esc(label || (on ? 'Required' : 'Not required'))}</span>`;
  }

  function renderGovernance() {
    const host = $('#govTypes');
    if (!host) return;

    host.innerHTML = `<table class="dtable">
      <thead><tr><th>Type</th><th>Objects</th><th>Verification cadence</th><th>Owner</th><th>Approval</th><th></th></tr></thead>
      <tbody>${GOV_TYPES.map((t, i) => `<tr>
        <td><span class="tc-type">${t.ico}${esc(t.type)}</span></td>
        <td class="gov-num">${t.count.toLocaleString()}</td>
        <td>${esc(t.cadence)}</td>
        <td>${govPill(t.owner, t.owner ? 'Owner required' : 'No owner')}</td>
        <td>${govPill(t.approval, t.approval ? 'Approval required' : '—')}</td>
        <td class="gov-act"><button class="btn btn-ghost btn-sm" data-gov-cadence="${i}"
          aria-label="Change verification cadence for ${esc(t.type)}">Change cadence</button></td>
      </tr>`).join('')}</tbody>
    </table>`;

    const cols = $('#govCollections');
    if (cols) {
      cols.innerHTML = GOV_COLLECTIONS.map((c, i) => `<div class="settings-row">
        <div class="sr-main">
          <div class="sr-title">${esc(c.name)}</div>
          <div class="sr-desc">${c.objects.toLocaleString()} objects · cadence: ${esc(c.cadence)}</div>
        </div>
        <span class="list-meta">Owner <strong style="color:var(--d200)">${esc(c.owner)}</strong></span>
        <button class="btn btn-ghost btn-sm" data-gov-owner="${i}"
          aria-label="Reassign owner of ${esc(c.name)}">Reassign</button>
      </div>`).join('');
    }

    const mx = $('#govExposure');
    if (mx) {
      mx.innerHTML = `<table class="dtable gov-matrix">
        <thead><tr>
          <th>Collection</th>
          <th class="gov-human">Human access</th>
          ${GOV_AGENTS.map((a) => `<th class="gov-agent-col">${esc(a.name)}${
            a.external ? '<span class="gov-ext">customer-facing</span>' : ''}</th>`).join('')}
        </tr></thead>
        <tbody>${GOV_COLLECTIONS.map((c) => `<tr>
          <td><strong style="color:var(--d100)">${esc(c.name)}</strong></td>
          <td class="gov-human"><span class="tag tag-neutral">By entitlement</span></td>
          ${GOV_AGENTS.map((a) => {
            const on = GOV_EXPOSURE[c.name][a.id];
            return `<td class="gov-cell">
              <button class="gov-toggle${on ? ' is-on' : ''}${a.external && on ? ' is-external' : ''}"
                      data-gov-expose="${esc(c.name)}|${a.id}"
                      aria-pressed="${on}"
                      aria-label="${esc(c.name)} grounding for ${esc(a.name)}: ${on ? 'allowed' : 'not allowed'}">
                ${on ? ICO.check : ICO.x}<span>${on ? 'Allowed' : 'Blocked'}</span>
              </button></td>`;
          }).join('')}
        </tr>`).join('')}</tbody>
      </table>`;
    }

    const aud = $('#govAudit');
    if (aud) aud.innerHTML = `<div class="audit-trail">${GOV_AUDIT.map(auditEntry).join('')}</div>`;
  }

  /* Rung 3 — a governed change gets a diff, a rationale, a blast radius and an
     audit note before it can be accepted. */
  let pendingCommit = null;
  /* The single commit surface for every governed write. Both the briefing's
     reviewed actions and the governance rungs come through here, so the
     reversibility promise looks identical wherever it is made — it is the
     thing that makes a consequential write feel safe, and a promise phrased
     differently each time reads as incidental rather than guaranteed.

     Accepts either `effects` (a list of ok/warn/skip outcomes) or `blast`
     (a single-line radius), never both. */
  function govCommit(o) {
    const host = $('#commitHost');
    if (!host) return;
    pendingCommit = o.onRun || null;

    /* Reversibility is an EFFECT of the action, not a disclaimer about it, so
       it closes the effect list rather than sitting in the action row. The
       footer holds decisions only. */
    const effects = (o.effects || []).concat([
      ['rev', o.reversible || 'Reversible for 24h · logged to the audit trail']
    ]);
    const effIco = (k) => k === 'ok' ? ICO.check : k === 'warn' ? ICO.warn
                        : k === 'rev' ? ICO.shield : ICO.slash;

    host.innerHTML = `
      <div class="modal-backdrop" style="display:flex" data-hide-on-backdrop>
        <div class="modal" role="dialog" aria-modal="true" aria-label="${esc(o.title)}" style="width:${o.width || 560}px;max-width:100%">
          <div class="modal-header">
            <div class="modal-title">${esc(o.title)}</div>
            <button class="modal-close" data-commit-close aria-label="Close">${ICO.x.replace('<svg', '<svg width="14" height="14"')}</button>
          </div>
          <div class="modal-body">
            <div class="gov-cr-diff">
              <div class="gov-cr-current"><span class="gov-cr-label">Now</span><div class="gov-cr-val">${esc(o.current)}</div></div>
              <span class="gov-cr-arrow">${ICO.arrow.replace('<svg', '<svg width="16" height="16"')}</span>
              <div class="gov-cr-proposed"><span class="gov-cr-label">After</span><div class="gov-cr-val">${esc(o.proposed)}</div></div>
            </div>
            <p class="gov-cr-rationale">${o.rationale}</p>
            ${o.blast ? `<div class="gov-cr-blast">
              ${ICO.warn.replace('<svg', '<svg width="13" height="13"')}${o.blast}
            </div>` : ''}
            <div class="ss-preview">
              <div class="ss-preview-head">What this will do</div>
              ${effects.map(([k, t]) =>
                `<div class="ss-effect is-${k === 'rev' ? 'ok' : k}">${effIco(k)}<span>${t}</span></div>`).join('')}
            </div>
          </div>
          <!-- Decisions only, both at the default .btn size. Rank is carried by
               fill — brand against ghost — not by making one button shorter.
               Adjacent buttons at different heights read as a rendering fault,
               which is the opposite of the confidence a commit surface needs. -->
          <div class="modal-footer">
            <button class="btn btn-ghost" data-commit-close>Cancel</button>
            <button class="btn btn-brand" data-commit-run="${esc(o.confirm)}">${esc(o.confirm)}</button>
          </div>
        </div>
      </div>`;
  }

  /* Rung 4 — exposure changes are typed to confirm and audited. The name to
     type is the collection, so the thing being changed has to be read. */
  function govExposureConfirm(collection, agent, turningOn) {
    const host = $('#commitHost');
    if (!host) return;
    const a = GOV_AGENTS.find((x) => x.id === agent);
    const c = GOV_COLLECTIONS.find((x) => x.name === collection);

    host.innerHTML = `
      <div class="modal-backdrop" style="display:flex" data-hide-on-backdrop>
        <div class="modal" role="dialog" aria-modal="true" aria-label="Change source exposure" style="width:480px;max-width:100%">
          <div class="modal-header">
            <div class="modal-title">${turningOn ? 'Allow' : 'Block'} ${esc(a.name)} on ${esc(collection)}?</div>
            <button class="modal-close" data-commit-close aria-label="Close">${ICO.x}</button>
          </div>
          <div class="modal-body">
            ${turningOn
              ? `<p><strong style="color:var(--d50)">${esc(a.name)}</strong> will be able to ground answers in all
                 <strong style="color:var(--d50)">${c.objects.toLocaleString()}</strong> objects in ${esc(collection)},
                 and cite them to whoever it is talking to.</p>
                 ${a.external ? `<div class="banner err" style="margin-top:12px">
                   <span class="banner-ico">${ICO.warn.replace('<svg', '<svg width="15" height="15"')}</span>
                   <span class="banner-body"><strong>${esc(a.name)} is customer-facing.</strong> Content a colleague can
                   read with judgement is not automatically content an autonomous agent should paraphrase to a customer.
                   Human access and agent grounding are separate permissions for exactly this reason.</span>
                 </div>` : ''}`
              : `<p><strong style="color:var(--d50)">${esc(a.name)}</strong> will stop grounding answers in
                 ${esc(collection)}. Answers it has already given are unaffected; future ones will be thinner, and
                 ${esc(a.name)} will say so rather than failing silently.</p>`}
          </div>
          <div class="ss-preview" style="margin-bottom:16px">
            <div class="ss-effect is-ok">${ICO.shield.replace('<svg', '<svg width="13" height="13"')}<span>Logged to the audit trail with your name and the time.</span></div>
          </div>
          <div class="ds-field" style="max-width:none;margin-bottom:18px">
            <label class="field-label" for="govConfirmInput">Type <strong style="color:var(--d50)">${esc(collection)}</strong> to confirm</label>
            <input class="field-input" type="text" id="govConfirmInput" autocomplete="off" spellcheck="false"
                   placeholder="${esc(collection)}" data-gov-typed="${esc(collection)}">
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" data-commit-close>Cancel</button>
            <button class="btn ${turningOn ? 'btn-brand' : 'btn-err'}" id="govConfirmBtn" disabled
                    style="opacity:.45;cursor:not-allowed"
                    data-gov-apply="${esc(collection)}|${agent}|${turningOn ? '1' : '0'}">
              ${turningOn ? 'Allow grounding' : 'Block grounding'}
            </button>
          </div>
        </div>
      </div>`;
  }

  /* ═══════════════════════════════════════════════
     SOURCES (§4)

     Connected systems, sync status and history, ingestion errors, coverage.
     Corpus quality is bounded by source health — a source that stopped syncing
     six days ago is six days of answers nobody knows are stale — which is why
     source health is briefing material and not buried here.
  ═══════════════════════════════════════════════ */
  const SOURCES = [
    {
      id: 'zendesk', name: 'Zendesk', sub: 'Support tickets', status: 'failed',
      lastOk: '6 days ago', collection: 'Support', objects: 1284, behind: 214,
      cadence: 'Every 15 minutes', auth: 'API token · zd_live_••••••••4f2a',
      error: {
        title: 'Authentication rejected since 23 Jul',
        detail: 'The API token was revoked or rotated at the source. Every sync since has failed the same way, ' +
          'so this is a credential problem rather than an outage.',
        code: '401 · invalid_token'
      },
      coverage: [['Support', 0.94], ['Policies', 0.12]],
      history: [
        ['err',  'Sync failed', '23 Jul, 04:15', '401 invalid_token · 0 objects written. Failing identically every 15 minutes since.'],
        ['warn', 'Token expiry warning ignored', '21 Jul, 09:00', 'The connector warned 48 hours before expiry. No owner was assigned to the source, so nothing was routed.'],
        ['ok',   'Sync completed', '23 Jul, 04:00', '1,284 tickets in corpus · 31 new, 4 updated.']
      ],
      errors: [
        ['23 Jul 04:15', '401 invalid_token', 'All', 'Every sync since'],
        ['21 Jul 09:00', 'token_expiry_warning', 'All', '1 occurrence']
      ]
    },
    {
      id: 'confluence', name: 'Confluence', sub: 'Policies space', status: 'failed',
      lastOk: '2 days ago', collection: 'Policies', objects: 148, behind: 6,
      cadence: 'Hourly', auth: 'OAuth · connected as knowledge-bot',
      error: {
        title: 'Space permissions changed',
        detail: 'The connector can still authenticate but can no longer read the Policies space. Six pages edited ' +
          'since Thursday are not in the corpus, and two of them are cited by live answers.',
        code: '403 · space_forbidden'
      },
      coverage: [['Policies', 0.96]],
      history: [
        ['err', 'Sync failed', '27 Jul, 11:00', '403 space_forbidden · read access removed from knowledge-bot.'],
        ['ok',  'Sync completed', '27 Jul, 10:00', '148 pages in corpus · 2 updated.']
      ],
      errors: [['27 Jul 11:00', '403 space_forbidden', 'Policies space', 'Every sync since']]
    },
    {
      id: 'notion', name: 'Notion', sub: 'Runbooks', status: 'ok',
      lastOk: '12 minutes ago', collection: 'Support', objects: 232, behind: 0,
      cadence: 'Every 30 minutes', auth: 'Internal integration · ntn_••••••••9b1c',
      coverage: [['Support', 0.61]],
      history: [
        ['ok', 'Sync completed', 'Today, 14:12', '232 pages in corpus · no changes.'],
        ['ok', 'Sync completed', 'Today, 13:42', '232 pages in corpus · 1 updated.']
      ],
      errors: []
    },
    {
      id: 'web', name: 'Web crawler', sub: 'aimy.app marketing pages', status: 'warn',
      lastOk: '4 hours ago', collection: 'Marketing', objects: 532, behind: 1,
      cadence: 'Daily', auth: 'Public — no credential',
      warn: {
        title: 'Change detected but not ingested',
        detail: 'The pricing page changed on 4 Jul and the corpus copy has not been updated since 18 Mar. ' +
          'The page is expired and already excluded from answers, so the stale copy is not being served.'
      },
      coverage: [['Marketing', 0.88]],
      history: [
        ['warn', 'Change detected, ingestion skipped', 'Today, 10:04', 'Pricing — Enterprise tier changed. Object has no owner, so no verification could be requested.'],
        ['ok',   'Crawl completed', 'Today, 10:00', '532 pages · 1 changed, 0 ingested.']
      ],
      errors: [['4 Jul', 'change_unresolved', 'Pricing — Enterprise tier', 'Open 25 days']]
    },
    {
      id: 'drive', name: 'Google Drive', sub: 'Sales and brand assets', status: 'ok',
      lastOk: '1 hour ago', collection: 'Marketing', objects: 127, behind: 0,
      cadence: 'Every 6 hours', auth: 'Service account · knowledge@aimy.iam',
      coverage: [['Marketing', 0.72], ['Sales', 0.45]],
      history: [['ok', 'Sync completed', 'Today, 13:20', '127 files in corpus · 3 new.']],
      errors: []
    }
  ];

  const SRC_STATUS = {
    ok:     { dot: 'online', label: 'Healthy',  tag: 'tag-ok' },
    warn:   { dot: 'away',   label: 'Attention', tag: 'tag-warn' },
    failed: { dot: 'busy',   label: 'Failing',  tag: 'tag-err' }
  };

  let srcOpen = null;
  const reconnected = {};

  function srcStatus(s) {
    return reconnected[s.id] ? SRC_STATUS.ok : SRC_STATUS[s.status];
  }

  function renderSources() {
    const list = $('#srcList');
    if (!list) return;

    /* "Not syncing" and "needs attention" are different failures and must not
       be summed — a crawler with an unresolved change is still syncing. The
       dashboard's source-health block counts the same way, and the two numbers
       have to agree or one of the surfaces is lying. */
    const failing = SOURCES.filter((s) => srcStatus(s) === SRC_STATUS.failed).length;
    const attention = SOURCES.filter((s) => srcStatus(s) === SRC_STATUS.warn).length;

    /* The failing count used to be the Sources nav badge. Folding the page in
       must not lose that signal — it moves to the tab, so a failing source is
       still visible without opening the panel. Labelled, because a bare "2"
       beside "Sources" reads as a total rather than a fault count. */
    const tabCount = $('#govSrcCount');
    if (tabCount) {
      tabCount.textContent = failing || '';
      tabCount.className = 'tab-count' + (failing ? ' is-err' : '');
      tabCount.setAttribute('aria-label', failing ? `${failing} not syncing` : '');
      tabCount.hidden = !failing;
    }
    paintNavSignals();
    const banner = $('#srcBanner');
    if (banner) {
      if (failing) {
        banner.className = 'banner err';
        banner.innerHTML = `<span class="banner-ico">${ICO.warn.replace('<svg', '<svg width="15" height="15"')}</span>
          <span class="banner-body"><strong>${failing} source${failing === 1 ? '' : 's'} not syncing.</strong>
          Content changed at the source since then is not in the corpus and cannot be cited. Answers keep sounding
          confident while quietly getting thinner. Reconnect the source to close the gap.${
            attention ? ` A further ${attention} source${attention === 1 ? ' is syncing but needs' : 's are syncing but need'} attention.` : ''}</span>`;
      } else if (attention) {
        banner.className = 'banner warn';
        banner.innerHTML = `<span class="banner-ico">${ICO.warn.replace('<svg', '<svg width="15" height="15"')}</span>
          <span class="banner-body"><strong>Every source is syncing.</strong> ${attention} needs attention —
          a change was detected at the source but not ingested.</span>`;
      } else {
        banner.className = 'banner ok';
        banner.innerHTML = `<span class="banner-ico">${ICO.check.replace('<svg', '<svg width="15" height="15"')}</span>
          <span class="banner-body"><strong>Every source is syncing.</strong> The corpus is current with all five
          connected systems.</span>`;
      }
    }

    list.innerHTML = SOURCES.map((s) => {
      const st = srcStatus(s);
      return `<button class="list-row src-row${srcOpen === s.id ? ' is-selected' : ''}" data-src="${s.id}"
                      aria-current="${srcOpen === s.id ? 'true' : 'false'}">
        <span class="status-dot ${st.dot}"></span>
        <span class="list-main">
          <span class="list-title">${esc(s.name)}</span>
          <span class="list-sub">${esc(s.sub)}</span>
        </span>
        <span class="list-meta">${esc(reconnected[s.id] ? 'just now' : s.lastOk)}</span>
      </button>`;
    }).join('');

    renderSourceDetail();
  }

  function renderSourceDetail() {
    const host = $('#srcDetail');
    if (!host) return;
    const s = SOURCES.find((x) => x.id === srcOpen);

    if (!s) {
      host.innerHTML = `<div class="empty-state">
        <div class="empty-state-icon">${ICO.refresh.replace('<svg', '<svg width="22" height="22"')}</div>
        <div class="empty-state-title">Select a source</div>
        <div class="empty-state-desc">Corpus quality is bounded by source health. A source that stopped syncing is
        content the corpus does not know it is missing.</div>
      </div>`;
      return;
    }

    const st = srcStatus(s);
    const isOk = st === SRC_STATUS.ok;
    const problem = !isOk && (s.error || s.warn);

    host.innerHTML = `
      <div class="src-head">
        <div class="src-head-meta">
          <span class="status-dot ${st.dot}"></span>
          <span class="tag ${st.tag}">${esc(st.label)}</span>
          <span class="list-meta">Last successful sync ${esc(reconnected[s.id] ? 'just now' : s.lastOk)}</span>
        </div>
        <h2 class="src-title">${esc(s.name)}</h2>
        <div class="src-sub">${esc(s.sub)} · ${esc(s.cadence)}</div>
      </div>

      ${problem ? `<div class="error-state src-error">
        <div class="error-state-icon">${(s.error ? ICO.x : ICO.warn).replace('<svg', '<svg width="20" height="20"')}</div>
        <div class="error-state-title">${esc(problem.title)}</div>
        <div class="error-state-desc">${esc(problem.detail)}</div>
        ${problem.code ? `<div class="src-code">${esc(problem.code)}</div>` : ''}
        <div class="src-error-actions">
          ${entryAction('direct', s.error ? 'Reconnect ' + s.name : 'Ingest the change now', `data-src-reconnect="${s.id}"`)}
          <span class="k-action-note">Direct action · completes in place, with Undo.</span>
        </div>
      </div>` : ''}

      <div class="src-stats">
        <div class="stat-card"><div class="stat-label">Objects in corpus</div><div class="stat-value">${s.objects.toLocaleString()}</div></div>
        <div class="stat-card"><div class="stat-label">Behind the source</div>
          <div class="stat-value">${reconnected[s.id] ? 0 : s.behind}</div></div>
        <div class="stat-card"><div class="stat-label">Open errors</div>
          <div class="stat-value">${reconnected[s.id] ? 0 : s.errors.length}</div></div>
      </div>

      <div class="src-section">
        <div class="src-section-label">Coverage by collection</div>
        ${s.coverage.map(([name, v]) => `<div class="progress-bar-wrap">
          <div class="progress-bar-header">
            <span class="progress-bar-label">${esc(name)}</span>
            <span class="progress-bar-value">${Math.round(v * 100)}%</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill ${v > 0.8 ? 'ok' : v > 0.5 ? 'warn' : 'err'}" style="--fill:${v}"></div>
          </div>
        </div>`).join('')}
      </div>

      <div class="src-section">
        <div class="src-section-label">Sync history</div>
        <div class="timeline src-timeline">
          ${s.history.map(([tone, title, time, body]) => `<div class="tl-item">
            <span class="tl-dot ${tone}"></span>
            <div class="tl-title">${esc(title)}</div>
            <div class="tl-time">${esc(time)}</div>
            <div class="tl-body">${esc(body)}</div>
          </div>`).join('')}
        </div>
      </div>

      ${s.errors.length && !reconnected[s.id] ? `<div class="src-section">
        <div class="src-section-label">Ingestion errors</div>
        <div class="gov-table-wrap">
          <table class="dtable">
            <thead><tr><th>First seen</th><th>Code</th><th>Scope</th><th>Recurrence</th></tr></thead>
            <tbody>${s.errors.map((e) => `<tr>
              <td class="gov-num">${esc(e[0])}</td><td><code>${esc(e[1])}</code></td>
              <td>${esc(e[2])}</td><td>${esc(e[3])}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>` : ''}

      <div class="src-section">
        <div class="src-section-label">Connection</div>
        <div class="settings-list gov-collections">
          <div class="settings-row">
            <div class="sr-main"><div class="sr-title">Credential</div><div class="sr-desc">${esc(s.auth)}</div></div>
            <button class="btn btn-ghost btn-sm" data-src-setting="${s.id}|auth">Replace</button>
          </div>
          <div class="settings-row">
            <div class="sr-main"><div class="sr-title">Sync frequency</div><div class="sr-desc">${esc(s.cadence)}</div></div>
            <button class="btn btn-ghost btn-sm" data-src-setting="${s.id}|cadence">Change</button>
          </div>
        </div>
      </div>`;
  }

  /* Nav badges are derived, not written into the markup. Sources folded into
     Governance, and a count that lives in five HTML files drifts the first
     time one of them is edited. Runs on every page so the signal survives
     wherever the user happens to be. */
  /* The library's dsTab() toggles .active and nothing else, so a tablist keeps
     whatever aria-selected the markup shipped with — a screen reader is told
     the wrong tab is current. Corrected here rather than in the extracted
     aimy-ds.js, which would fork the design system. Filed in ../GAPS.md. */
  function syncTabAria(clicked) {
    const strip = clicked.closest('[role="tablist"]');
    if (!strip) return;
    strip.querySelectorAll('.ds-tab').forEach((t) => {
      t.setAttribute('aria-selected', t.classList.contains('active') ? 'true' : 'false');
    });
  }

  function paintNavSignals() {
    const set = (href, n, label) => {
      const el = $(`.nav-item[href="${href}"] .nav-count`);
      if (!el) return;
      el.textContent = n || '';
      el.hidden = !n;
      if (n) el.setAttribute('aria-label', label);
    };
    set('requests.html', REQUESTS.filter((r) => !decisions[r.id]).length, 'open requests');
    set('governance.html', SOURCES.filter((s) => srcStatus(s) === SRC_STATUS.failed).length,
        'sources not syncing');
  }

  /* ═══════════════════════════════════════════════
     WIRING
  ═══════════════════════════════════════════════ */
  /* The most recently dismissed briefing slot, held for Undo. */
  let dismissed = null;

  function wire() {
    document.addEventListener('click', (e) => {
      const t = e.target;
      let el;

      if ((el = t.closest('[data-act]'))) {
        const act = ACTS[el.getAttribute('data-act')];
        if (act) { act.run(); return; }
      }
      if ((el = t.closest('[data-undo]'))) {
        const card = el.closest('.bcard');
        const row = el.closest('.bcard-ack-row');
        row.innerHTML = '<span class="work-state ws-detected" data-work-state="detected">' +
          '<span class="ws-dot"></span>Back to detected</span>' +
          '<span class="k-action-note" style="flex:1">Reopened — the objects returned to the queue.</span>';
        const meta = card.querySelector('.bcard-meta [data-work-state]');
        if (meta) {
          meta.className = 'work-state ws-detected';
          meta.setAttribute('data-work-state', 'detected');
          meta.innerHTML = '<span class="ws-dot"></span>Detected';
        }
        card.classList.add('is-undone');
        toast('Reopened — the objects are back in Requests', null);
        return;
      }
      if ((el = t.closest('[data-ack]'))) {
        el.classList.add('is-acked');
        el.textContent = 'Acknowledged';
        return;
      }
      /* Dismissal captures a reason and is reversible (doctrine §5.9). The
         slot is removed so the grid reflows rather than leaving a hole, and
         the whole slot is held so Undo can put it back where it was — an
         Undo that only prints "Reverted" is the dead end the doctrine bans. */
      if ((el = t.closest('[data-dismiss]'))) {
        const slot = el.closest('[data-slot]');
        const reason = el.textContent.trim();
        if (slot) {
          const grid = slot.parentElement;
          dismissed = {
            html: slot.outerHTML,
            index: Array.prototype.indexOf.call(grid.children, slot),
            grid: grid
          };
          slot.remove();
        }
        toast(`Dismissed — “${reason}” recorded`, 'Undo');
        return;
      }
      if (t.closest('[data-toast-undo]')) {
        if (dismissed) {
          const ref = dismissed.grid.children[dismissed.index] || null;
          dismissed.grid.insertAdjacentHTML('beforeend', dismissed.html);
          const restored = dismissed.grid.lastElementChild;
          if (ref) dismissed.grid.insertBefore(restored, ref);
          dismissed = null;
          toast('Restored to the briefing', null);
        } else {
          toast('Reverted', null);
        }
        return;
      }
      if (t.closest('[data-commit-close]')) { $('#commitHost').innerHTML = ''; return; }
      if ((el = t.closest('[data-commit-run]'))) {
        const label = el.getAttribute('data-commit-run');
        $('#commitHost').innerHTML = '';
        /* A commit surface that only toasts is theatre — run the write. */
        if (pendingCommit) { pendingCommit(); pendingCommit = null; toast(label + ' — done', 'Undo'); }
        else toast(label + ' — sent', 'Undo');
        return;
      }
      if (t.closest('[data-overlay-close]')) { canvas.close(); return; }

      /* Workbench */
      if ((el = t.closest('[data-open-obj]'))) {
        const id = el.getAttribute('data-open-obj');
        workingSet.add(id, true);
        workingSet.open = id;
        renderWorkbench();
        return;
      }
      if ((el = t.closest('[data-promote]'))) {
        workingSet.add(el.getAttribute('data-promote'));
        el.disabled = true;
        el.textContent = 'In working set';
        renderWorkbench();
        return;
      }
      if (t.closest('[data-ws-back]')) { workingSet.open = null; renderWorkbench(); return; }
      if (t.closest('[data-ws-clear]')) { workingSet.clear(); renderWorkbench(); return; }
      if ((el = t.closest('[data-seed]'))) {
        el.getAttribute('data-seed').split(',').forEach((id) => workingSet.add(id, true));
        renderWorkbench();
        return;
      }
      if (t.closest('[data-ss-run]')) { const p = $('#ssPreview'); if (p) p.hidden = false; return; }
      if (t.closest('[data-ss-cancel]')) { const p = $('#ssPreview'); if (p) p.hidden = true; return; }
      if ((el = t.closest('[data-ss-confirm]'))) {
        toast(`${el.getAttribute('data-ss-confirm')} verification requests sent`, 'Undo');
        $$('[data-pick]:checked').forEach((i) => { i.checked = false; });
        renderSetScope();
        return;
      }
      if (t.closest('[data-ss-clear]')) {
        $$('[data-pick]:checked').forEach((i) => { i.checked = false; });
        renderSetScope();
        return;
      }
      if ((el = t.closest('[data-flag]'))) {
        el.classList.add('is-flagged');
        el.closest('.cite-wrap').querySelector('.cite').classList.add('is-flagged');
        toast('Citation flagged', 'Undo', 'It goes to the object owner as a correction request. You can see it in Requests.');
        return;
      }
      if ((el = t.closest('[data-edit-obj]'))) { renderEditor(el.getAttribute('data-edit-obj')); return; }

      /* Requests */
      if ((el = t.closest('[data-rq-filter]'))) { rqFilter = el.getAttribute('data-rq-filter'); rqOpen = null; renderRequests(); return; }
      if ((el = t.closest('[data-rq]'))) { rqOpen = el.getAttribute('data-rq'); renderRequests(); return; }
      if ((el = t.closest('[data-decide]'))) {
        const [id, outcome] = el.getAttribute('data-decide').split('|');
        decide(id, outcome);
        return;
      }
      if ((el = t.closest('[data-undecide]'))) {
        delete decisions[el.getAttribute('data-undecide')];
        renderRequests();
        toast('Decision reverted — back in the queue', null);
        return;
      }
      if ((el = t.closest('[data-open-in-wb]'))) {
        location.href = 'workbench.html?open=' + encodeURIComponent(el.getAttribute('data-open-in-wb'));
        return;
      }

      if ((el = t.closest('[data-filter-chip]'))) { paintScopeStrip(); return; }
      if ((el = t.closest('[data-clear-filter-chips]'))) { setTimeout(paintScopeStrip, 0); return; }
      if ((el = t.closest('[data-scope-drop]'))) {
        const label = el.getAttribute('data-scope-drop');
        $$('#floatFilterTray .filter-chip').forEach((c) => {
          if (c.textContent.trim() === label) c.classList.remove('active');
        });
        paintScopeStrip();
        toast(`Scope narrowed — “${label}” removed`, null);
        return;
      }
      if ((el = t.closest('[data-scope-clear]'))) {
        $$('#floatFilterTray .filter-chip').forEach((c) => c.classList.remove('active'));
        paintScopeStrip();
        toast('Scope cleared — answers now span the whole corpus', null);
        return;
      }

      if ((el = t.closest('[data-mem-drop]'))) {
        const panel = el.closest('.memory-panel');
        panel.classList.add('is-dropped');
        panel.querySelector('.mem-foot').innerHTML =
          '<span class="k-action-note">Dropped — this answer stands on the current question alone.</span>';
        toast('Earlier thread dropped from this answer', null);
        return;
      }

      /* Clicking the input bar anywhere focuses its field. Without this the
         padding around a text field is dead, which reads as the field being
         disabled. */
      if ((el = t.closest('.aimy-float-bar')) && !t.closest('button')) {
        const i = $('#floatInput'); if (i) i.focus(); return;
      }
      if ((el = t.closest('.overlay-input-bar')) && !t.closest('button')) {
        const i = $('#overlayInput'); if (i) i.focus(); return;
      }

      /* Settings actions. Sign-out ends a session, so it confirms in place
         first — the bottom rung of the ladder, where the confirmation lives in
         the action surface rather than in a modal. */
      if ((el = t.closest('[data-set-action]'))) {
        const kind = el.getAttribute('data-set-action');
        if (kind === 'profile') {
          toast('Profile is managed in the AiMY directory', null,
                'Name, role and avatar come from there so they stay the same across every agent.');
          return;
        }
        if (kind === 'signout') {
          if (el.dataset.confirming) {
            toast('Signed out', null, 'The session would end here. Staged work is kept until it expires.');
            delete el.dataset.confirming;
            el.textContent = 'Sign out';
            el.classList.remove('btn-err');
            return;
          }
          el.dataset.confirming = '1';
          el.textContent = 'Confirm sign out';
          el.classList.add('btn-err');
          setTimeout(() => {
            if (!el.dataset.confirming) return;
            delete el.dataset.confirming;
            el.textContent = 'Sign out';
            el.classList.remove('btn-err');
          }, 4000);
          return;
        }
        return;
      }

      /* Copy to clipboard. The library's own copy handler lives in its
         documentation JS, which this product does not ship, so .copy-field
         needs a real one. Confirms in place rather than only by toast — the
         button is where the user is looking. */
      if ((el = t.closest('[data-copy]'))) {
        const value = el.getAttribute('data-copy');
        const done = () => {
          const label = el.querySelector('span') || el;
          const original = el.textContent.trim();
          el.classList.add('copied');
          if (label === el) el.textContent = 'Copied';
          toast('Copied to clipboard', null, 'The key is bound by your entitlements — treat it like a password.');
          setTimeout(() => {
            el.classList.remove('copied');
            if (label === el) el.textContent = original;
          }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(value).then(done, done);
        } else { done(); }
        return;
      }

      /* Tabs — the library's handler runs first via its own listener; this
         only repairs the ARIA it leaves behind. */
      if ((el = t.closest('.ds-tab'))) { syncTabAria(el); return; }

      /* ── Loop closers ─────────────────────────────────────────────────
         Every one of these was a control that looked live and did nothing.
         A dead control is the dead end §1.2 bans, and it is worse than a
         missing one because it spends the user's trust before failing. */

      /* Audit reversal — the entry says it is reversible, so it must be. */
      if ((el = t.closest('.audit-revert'))) {
        const entry = el.closest('.audit-entry');
        const what = entry.querySelector('.audit-action').textContent.trim();
        entry.classList.add('is-reverted');
        el.replaceWith(Object.assign(document.createElement('span'),
          { className: 'audit-irreversible', textContent: 'Reverted' }));
        toast(`Reverted — ${what.slice(0, 44)}`, null);
        return;
      }

      /* A related object is a route, not a label. */
      if ((el = t.closest('.dv-rel-item'))) {
        const target = el.getAttribute('data-open-obj');
        if (target) { workingSet.add(target); renderViewer(target); return; }
        if (el.hasAttribute('data-act')) { /* fall through to the action router */ }
        const label = el.textContent.trim();
        const hit = CORPUS.find((o) => o.title.toLowerCase().startsWith(label.toLowerCase().slice(0, 12)));
        if (hit) { workingSet.add(hit.id); renderViewer(hit.id); }
        else { toast(`“${label.slice(0, 40)}” is not in the working set yet`, null); }
        return;
      }

      /* Credential and cadence are governed writes — they go to a commit
         surface like every other one, not straight into an input. */
      if ((el = t.closest('[data-src-setting]'))) {
        const [id, kind] = el.getAttribute('data-src-setting').split('|');
        const s = SOURCES.find((x) => x.id === id);
        govCommit(kind === 'auth'
          ? { title: `Credential — ${s.name}`, current: s.auth,
              proposed: 'New token · entered on the connector', confirm: 'Replace credential',
              rationale: 'The connector re-authenticates on the next scheduled sync. Nothing is re-ingested until ' +
                'that sync succeeds, so the backlog clears on the following run rather than immediately.',
              blast: `Affects <span class="blast-val">${s.objects.toLocaleString()} objects</span> · ` +
                `<span class="blast-val">${s.behind} behind</span> the source` }
          : { title: `Sync frequency — ${s.name}`, current: s.cadence, proposed: 'Every 5 minutes',
              confirm: 'Set frequency', rationale: 'More frequent syncing shortens the window in which the corpus ' +
                'is behind the source. It does not change what is ingested, only how quickly.',
              blast: `Affects <span class="blast-val">${s.name}</span> only` });
        return;
      }

      /* The AI suggestion must resolve — §6.8 forbids leaving a proposed
         change without an explicit outcome, and Edit is not optional. */
      if ((el = t.closest('[data-suggest]'))) {
        const outcome = el.getAttribute('data-suggest');
        const card = el.closest('.ai-suggestion');
        const ins = card.querySelector('ins').textContent.trim();
        const body = $('.dv-body[contenteditable]');
        if (outcome === 'accept' && body) {
          const paras = body.querySelectorAll('p');
          if (paras.length) paras[paras.length - 1].textContent = ins;
        }
        if (outcome === 'edit' && body) {
          const paras = body.querySelectorAll('p');
          if (paras.length) {
            paras[paras.length - 1].textContent = ins;
            paras[paras.length - 1].focus();
          }
          body.focus();
        }
        card.classList.add('is-resolved');
        card.querySelector('.ai-suggestion-foot').innerHTML =
          `<span class="work-state ws-${outcome === 'reject' ? 'failed' : 'completed'}"
                 data-work-state="${outcome === 'reject' ? 'failed' : 'completed'}"><span class="ws-dot"></span>${
            outcome === 'accept' ? 'Accepted' : outcome === 'edit' ? 'Accepted, editing' : 'Rejected'}</span>
           <span class="k-action-note" style="flex:1">Saved as a version by <strong>AiMY</strong>, authored to
           you — an AI edit is an ordinary version, never a parallel history.</span>`;
        toast(outcome === 'reject' ? 'Suggestion rejected — document unchanged'
                                   : 'Suggestion applied — saved as a new version', 'Undo');
        return;
      }

      /* Formatting acts on the selection in the editor body. */
      if ((el = t.closest('[data-fmt]'))) {
        const body = $('.dv-body[contenteditable]');
        if (body) { body.focus(); document.execCommand(el.getAttribute('data-fmt')); }
        return;
      }

      /* An unanswerable question becomes a queued decision rather than a
         shrug — the gap is the finding. */
      if ((el = t.closest('[data-raise-gap]'))) {
        toast('Raised as a coverage gap — it is in Requests', 'View');
        return;
      }

      if ((el = t.closest('[data-goto-tab]'))) {
        const tab = $(`.ds-tab[data-tab="${el.getAttribute('data-goto-tab')}"]`);
        if (tab) { canvas.close(); tab.click(); }
        else location.href = 'governance.html';
        return;
      }
      if ((el = t.closest('[data-goto-src]'))) {
        location.href = 'governance.html?source=' + encodeURIComponent(el.getAttribute('data-goto-src'));
        return;
      }

      /* Ecosystem chrome that this prototype does not contain. Saying so is a
         closed loop; silently doing nothing is not.

         The QA entry is an <a> to the deployed product, so it is left to
         navigate. Toasting "not part of this prototype" over a real product
         switch would be both wrong and a flash of text on the way out. */
      if ((el = t.closest('.topnav-tab'))) {
        if (el.hasAttribute('href')) return;
        if (el.classList.contains('active')) return;
        toast(`${el.textContent.trim()} is a separate agent — not part of this prototype`, null);
        return;
      }
      if ((el = t.closest('.topnav-bell'))) { toast('Nothing new here', null, 'Anything that needs you appears on the dashboard and in Requests, not as a notification.'); return; }
      if ((el = t.closest('.topnav-user'))) { location.href = 'settings.html'; return; }

      /* Sources */
      if ((el = t.closest('[data-src]'))) { srcOpen = el.getAttribute('data-src'); renderSources(); return; }
      if ((el = t.closest('[data-src-reconnect]'))) {
        const id = el.getAttribute('data-src-reconnect');
        const s = SOURCES.find((x) => x.id === id);
        reconnected[id] = true;
        s.history.unshift(['ok', 'Sync completed', 'Just now',
          `Reconnected by ${activeProfile().name} · ${s.behind} object${s.behind === 1 ? '' : 's'} caught up.`]);
        renderSources();
        toast(`${s.name} reconnected — ${s.behind} object${s.behind === 1 ? '' : 's'} caught up`, 'Undo');
        return;
      }

      /* Governance — nothing commits from the control itself */
      if ((el = t.closest('[data-gov-cadence]'))) {
        const ty = GOV_TYPES[+el.getAttribute('data-gov-cadence')];
        const next = CADENCES[Math.max(0, CADENCES.indexOf(ty.cadence) - 1)];
        govCommit({
          title: `Verification cadence — ${ty.type}`,
          current: `${ty.cadence} · ${ty.count.toLocaleString()} objects`,
          proposed: `${next} · ${ty.count.toLocaleString()} objects`,
          rationale: `Every ${ty.type} object is re-scheduled against the new cadence. Objects already past the ` +
            `new date move to <strong>due</strong> immediately; none are excluded from answers by this change alone.`,
          blast: `Re-schedules <span class="blast-val">${ty.count.toLocaleString()} objects</span> · ` +
            `owners notified <span class="blast-val">on the next digest</span>`,
          confirm: `Set cadence to ${next}`
        });
        return;
      }
      if ((el = t.closest('[data-gov-owner]'))) {
        const c = GOV_COLLECTIONS[+el.getAttribute('data-gov-owner')];
        govCommit({
          title: `Collection ownership — ${c.name}`,
          current: `${c.owner} · ${c.objects.toLocaleString()} objects`,
          proposed: `Knowledge owners group · ${c.objects.toLocaleString()} objects`,
          rationale: 'Verification requests for every object in this collection route to the new owner from now on. ' +
            'Requests already open stay with their current assignee rather than being silently reassigned.',
          blast: `Moves <span class="blast-val">${c.objects.toLocaleString()} objects</span> · ` +
            `<span class="blast-val">3 open requests</span> keep their assignee`,
          confirm: 'Reassign collection'
        });
        return;
      }
      if ((el = t.closest('[data-gov-expose]'))) {
        const [collection, agent] = el.getAttribute('data-gov-expose').split('|');
        const turningOn = !GOV_EXPOSURE[collection][agent];
        /* Rung 4 (type-to-confirm) for ALLOWING — that widens what an agent may
           say. Rung 3 for BLOCKING: it narrows exposure, is reversible, and is
           the direction you want to be easy. Charging the same toll both ways
           trains people to type through the confirmation, which spends its
           value on the case that did not need it (§3.1). */
        if (turningOn) { govExposureConfirm(collection, agent, true); return; }
        govCommit({
          title: `Block ${GOV_AGENTS.find((a) => a.id === agent).name} on ${collection}`,
          current: `${collection} is citable by ${GOV_AGENTS.find((a) => a.id === agent).name}`,
          proposed: `${collection} is not used to ground its answers`,
          rationale: 'Answers already given are unaffected. Future ones will be thinner, and the agent will say so ' +
            'rather than failing silently. Re-allowing it later is a typed confirmation again.',
          blast: `Removes <span class="blast-val">${GOV_COLLECTIONS.find((c) => c.name === collection).objects.toLocaleString()} objects</span> ` +
            `from one agent's grounding · <span class="blast-val">reversible</span>`,
          confirm: 'Block grounding',
          onRun: () => {
            GOV_EXPOSURE[collection][agent] = false;
            const a = GOV_AGENTS.find((x) => x.id === agent);
            GOV_AUDIT.unshift({ tone: 'is-ok', ico: ICO.check,
              action: `${collection} blocked from ${a.name}`, who: activeProfile().name,
              detail: 'exposure narrowed · reversible', time: 'just now', revert: 'Revert' });
            renderGovernance();
          }
        });
        return;
      }
      if ((el = t.closest('[data-gov-apply]'))) {
        if (el.disabled) return;
        const [collection, agent, on] = el.getAttribute('data-gov-apply').split('|');
        GOV_EXPOSURE[collection][agent] = on === '1';
        const a = GOV_AGENTS.find((x) => x.id === agent);
        GOV_AUDIT.unshift({
          tone: on === '1' ? (a.external ? 'is-warn' : 'is-ok') : 'is-err',
          ico: on === '1' ? ICO.check : ICO.x,
          action: `${collection} ${on === '1' ? 'exposed to' : 'blocked from'} ${a.name}${a.external ? ' (customer-facing)' : ''}`,
          who: activeProfile().name,
          detail: 'typed confirmation · grounding permission changed',
          time: 'just now', revert: 'Revert'
        });
        $('#commitHost').innerHTML = '';
        renderGovernance();
        toast(`${collection} · ${a.name} grounding ${on === '1' ? 'allowed' : 'blocked'}`, 'Undo');
        return;
      }
      if ((el = t.closest('[data-retry]'))) {
        const slot = el.closest('[data-slot]');
        if (slot) {
          slot.innerHTML = skeletonCard();
          const b = BLOCKS.find((x) => x.id === slot.getAttribute('data-slot'));
          setTimeout(() => { if (b) slot.innerHTML = b.render(); }, 600);
        }
        return;
      }
    });

    /* Type-to-confirm: the destructive button unlocks only on an exact match. */
    document.addEventListener('input', (e) => {
      const f = e.target.closest && e.target.closest('[data-gov-typed]');
      if (!f) return;
      const btn = $('#govConfirmBtn');
      if (!btn) return;
      const ok = f.value.trim() === f.getAttribute('data-gov-typed');
      btn.disabled = !ok;
      btn.style.opacity = ok ? '' : '.45';
      btn.style.cursor = ok ? '' : 'not-allowed';
    });

    document.addEventListener('change', (e) => {
      if (e.target.matches('[data-pick]')) {
        e.target.closest('.ws-item').classList.toggle('is-picked', e.target.checked);
        renderSetScope();
      }
    });

    /* Float bar. Enter or the send button runs the query; the tray is the
       scope, and scope is set before the query runs (§7.2). */
    const fb = $('#floatInput');
    if (fb) {
      fb.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); submitFloat(); }
      });
      /* The "Enter to send" hint has done its job once typing starts, and it
         competes with the text for the same line. Documented behaviour of
         .aimy-float-hint in the design system. */
      const hint = $('.aimy-float-hint');
      if (hint) {
        const sync = () => { hint.style.opacity = fb.value.trim() ? '0' : '1'; };
        fb.addEventListener('input', sync);
        sync();
      }

      /* The scope tray. .filter-tray ships at opacity 0 and the design system
         reveals it only on .visible — a class nothing in the library adds, so
         without this the scope chips never appear and §7.2's scope-before-query
         is unreachable. Same handlers as the reference implementation, with the
         blur delay that lets a click on a chip land before the tray goes. */
      const tray = $('#floatFilterTray');
      if (tray) {
        let hideTimer = null;
        const showTray = () => { clearTimeout(hideTimer); tray.classList.add('visible'); };
        const hideTray = () => { hideTimer = setTimeout(() => tray.classList.remove('visible'), 160); };
        fb.addEventListener('focus', showTray);
        fb.addEventListener('blur', hideTray);
        tray.addEventListener('mousedown', (e) => e.preventDefault()); // keep the input focused
        tray.addEventListener('focusin', showTray);
        tray.addEventListener('focusout', hideTray);
      }
    }
    const fs = $('#floatSend');
    if (fs) fs.addEventListener('click', submitFloat);

    const oi = $('#overlayInput');
    if (oi) oi.addEventListener('input', () => { if (canvas.stagedNow) canvas.setStaged(false); });
    if (oi) oi.addEventListener('aimy:submit', () => {
      const v = oi.value.trim();
      if (!v) return;
      oi.value = '';
      canvas.ask(v, scopeBasis(), answerFor(v, CORPUS.slice(0, 2), 'question'));
    });
    const os = $('#overlaySend');
    if (os) os.addEventListener('click', () => oi && oi.dispatchEvent(new CustomEvent('aimy:submit', { bubbles: true })));

    $$('.overlay-sugg-chip').forEach((c) => {
      c.addEventListener('click', () => {
        const q = c.textContent.trim();
        canvas.ask(q, scopeBasis(), answerFor(q, CORPUS.slice(0, 2), 'question'));
      });
    });
  }

  function submitFloat() {
    const fb = $('#floatInput');
    if (!fb) return;
    const v = fb.value.trim();
    if (!v) return;
    fb.value = '';
    if (document.body.dataset.page === 'workbench') runQuery(v);
    else canvas.ask(v, scopeBasis(), answerFor(v, CORPUS.slice(0, 2), 'question'));
  }

  function renderEditor(id) {
    const o = CORPUS.find((x) => x.id === id);
    const stage = $('#wbStage');
    if (!o || !stage) return;

    stage.innerHTML = `
      <button class="wb-back" data-ws-back>${ICO.left}Back to working set</button>
      <div class="wb-editor-split">
        <div>
          <div class="toolbar" role="toolbar" aria-label="Formatting">
            <button class="icon-btn" aria-label="Bold" data-fmt="bold"><strong>B</strong></button>
            <button class="icon-btn" aria-label="Italic" data-fmt="italic"><em>I</em></button>
            <span class="toolbar-sep"></span>
            <button class="icon-btn" aria-label="Bulleted list" data-fmt="insertUnorderedList">≡</button>
          </div>
          <div class="doc-view" style="margin-top:12px">
            <div class="dv-head">
              <div class="dv-meta">
                <span class="tc-type">${o.ico}${esc(o.type)}</span>
                ${trustState('unverified')}
              </div>
              <div class="dv-title">${esc(o.title)}</div>
            </div>
            <div class="inline-note warn" style="align-items:flex-start">
              <span class="dot" style="margin-top:6px"></span>
              <span><strong>Editing moves this out of verified.</strong> The previous verification attested to content
              that no longer exists. You are not the owner, so it lands on <strong>unverified</strong> rather than due.</span>
            </div>
            <div class="dv-body" contenteditable="true" style="outline:none">
              <p>${esc(o.summary || o.title)}</p>
              <p>Activated products are handled case by case.</p>
            </div>
          </div>

          <div class="ai-suggestion" style="margin-top:14px">
            <div class="ai-suggestion-head">
              <svg width="12" height="13" viewBox="0 0 18 20"><use href="#aimy-logo-small"/></svg>
              AiMY proposes a change
            </div>
            <div class="ai-suggestion-body">
              <del>Activated products are handled case by case.</del>
              <ins>Activated products are outside the 30-day window. Where a fault is demonstrated, the warranty
              process applies instead — see Warranty process — EU.</ins>
            </div>
            <div class="ai-suggestion-foot">
              <button class="btn btn-brand btn-sm" data-suggest="accept">Accept</button>
              <button class="btn btn-ghost btn-sm" data-suggest="edit">Edit</button>
              <button class="btn btn-ghost btn-sm" data-suggest="reject">Reject</button>
            </div>
          </div>

          <div class="comment-thread" style="margin-top:16px">
            <div class="comment">
              <div class="avatar avatar-sm">AM</div>
              <div class="comment-body">
                <div class="comment-head"><span class="comment-author">A. Mahfouz</span><span class="comment-time">2 days ago</span></div>
                <div class="comment-text">The exception needs to name the warranty article explicitly — support keeps
                landing here and then having to search again.</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <!-- .ver-item is a 3-column grid: .ver-mark · .ver-main · .ver-side.
               Flat children spill into implicit rows and overflow the column. -->
          <div class="ver-list">
            <div class="ver-item is-current">
              <span class="ver-mark">v7</span>
              <div class="ver-main">
                <div class="ver-label">Clarified the activation exception</div>
                <div class="ver-author"><strong>N. Wael</strong> · edited in the document editor</div>
              </div>
              <div class="ver-side"><span class="ver-tag">Current</span><span class="ver-time">14:06</span></div>
            </div>
            <div class="ver-item is-ai">
              <span class="ver-mark"><svg width="10" height="11" viewBox="0 0 18 20"><use href="#aimy-logo-small"/></svg></span>
              <div class="ver-main">
                <div class="ver-label">Exception clause rewritten from 12 resolved tickets</div>
                <div class="ver-author"><strong>AiMY</strong> · accepted by N. Wael</div>
              </div>
              <div class="ver-side"><span class="ver-time">2 Jul</span></div>
            </div>
            <div class="ver-item">
              <span class="ver-mark">v5</span>
              <div class="ver-main">
                <div class="ver-label">Refund window changed 14 → 30 days</div>
                <div class="ver-author"><strong>A. Mahfouz</strong> · policy update</div>
              </div>
              <div class="ver-side"><span class="ver-time">12 Mar</span></div>
            </div>
          </div>
          <div class="ver-restore">
            <div class="vr-effect">
              ${ICO.warn.replace('<svg', '<svg style="width:13px;height:13px;flex-shrink:0"')}
              <span>Restoring the 12 Mar version changes what <strong>4 consuming agents</strong> answer from.
              History is preserved — restore adds a new version rather than deleting the ones it supersedes.</span>
            </div>
            <button class="btn btn-ghost btn-sm" data-commit-run="Version restored">Restore 12 Mar version</button>
          </div>
        </div>
      </div>`;
  }

  /* ═══════════════════════════════════════════════
     BOOT
  ═══════════════════════════════════════════════ */
  function init() {
    canvas.init();
    wire();

    const page = document.body.dataset.page;
    paintNavSignals();
    if (page === 'dashboard') bootDashboard();
    /* Governance carries both halves since the Sources page was folded in:
       what the corpus is allowed to do, and where it actually comes from. */
    if (page === 'settings') paintIdentity(activeProfile());
    if (page === 'governance') {
      paintIdentity(activeProfile());
      renderGovernance();

      const seed = params.get('source');
      if (seed && SOURCES.some((s) => s.id === seed)) srcOpen = seed;
      renderSources();

      /* A deep link to a source lands on the Sources tab, not on Rules. */
      if (seed) {
        const tab = $('.ds-tab[data-tab="govSources"]');
        if (tab) tab.click();
      }
    }
    if (page === 'requests') {
      paintIdentity(activeProfile());
      const seed = params.get('open');
      if (seed && REQUESTS.some((r) => r.id === seed)) rqOpen = seed;
      renderRequests();
    }
    if (page === 'workbench') {
      paintIdentity(activeProfile());
      workingSet.load();
      const seed = params.get('open');
      if (seed && CORPUS.some((o) => o.id === seed)) {
        workingSet.add(seed, true);
        workingSet.open = seed;
      }
      renderWorkbench();

      /* Prototype affordance: pre-fill the input so the two routing paths of
         §7.1 can be compared side by side. Nothing is sent — the user still
         presses Enter, because the routing decision is what is on show. */
      const demo = params.get('q');
      const fb = $('#floatInput');
      if (demo && fb) {
        fb.value = demo === 'object'
          ? 'Refund eligibility — EU customers'
          : 'Can EU customers get a refund after activating?';
        fb.focus();
      }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
