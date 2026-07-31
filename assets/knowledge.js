/* ═══════════════════════════════════════════════════════════════════════
   knowledge.js — AiMY Knowledge v2

   One surface. The URL is the state, and the only state: every filter, the
   open document, and the view mode live in it, which is what makes the page
   drivable by an agent as well as by a person.

   The input is not a chat box. It routes on the shape of what was typed, into
   one of four classified entry modes:

     filter-like     → mutates the URL, the grid refilters      · direct
     a known title   → opens that document in place             · direct
     a question      → opens the canvas with a grounded answer  · investigate
     a write         → stages a commit surface, changes nothing · review

   Prototype scope: there is no backend. The corpus, the user, the source
   health and the timings are fixtures. Everything that would be a platform
   capability is simulated at the seam where it would really sit.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════
     HELPERS
  ═══════════════════════════════════════════════ */
  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* Icons ALWAYS carry width/height. An <svg> with a viewBox and no dimensions
     is a replaced element with no intrinsic size — inside any container that
     does not size it in CSS it expands to fill. */
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
    folder:   svg('<path d="M3 7a2 2 0 012-2h4l2 2.5h8a2 2 0 012 2V18a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>'),
    grid:     svg('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
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
    pen:      svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>'),
    plus:     svg('<path d="M12 5v14M5 12h14"/>', 2.4),
    tag:      svg('<path d="M20.6 13.4L12 22l-9-9V3h10l7.6 7.6a2 2 0 010 2.8z"/><path d="M7.5 7.5h.01"/>'),
    plug:     svg('<path d="M9 2v6M15 2v6"/><path d="M6 8h12v3a6 6 0 01-12 0z"/><path d="M12 17v5"/>'),
    box:      svg('<path d="M21 8v13H3V8"/><rect x="1" y="3" width="22" height="5" rx="1"/><path d="M10 12h4"/>')
  };

  const AIMY_MARK = (w, h) =>
    `<svg width="${w || 12}" height="${h || 14}" viewBox="0 0 18 20" aria-hidden="true"><use href="#aimy-logo-small"/></svg>`;

  /* ═══════════════════════════════════════════════
     STATUS — computed, never attested

     The previous model was Verified / Due / Expired: a claim that a named
     person confirmed this content on a date. Nobody does that. These are the
     company's knowledge documents, used across the ecosystem — there is no
     author submitting and no reviewer approving, so a badge that implied one
     was describing a ritual the product does not have.

     Every value below is derived from something the system already knows.
     Precedence is top to bottom: the first that applies is the one shown,
     because one badge you can trust beats five you have to reconcile.
  ═══════════════════════════════════════════════ */
  const UNUSED_DAYS = 90;

  /* `tone` maps onto the library's state pill, which carries the colour ramp.
     The class is named for trust; what it actually implements is a tone-bearing
     status pill, and reusing it beats writing a parallel one. See ../GAPS.md. */
  const STATUS = {
    superseded:  { label: 'Superseded',  ico: ICO.arrow,    tone: 'superseded', excluded: true,
                   why: 'A newer document replaced it.' },
    outdated:    { label: 'Out of date', ico: ICO.refresh,  tone: 'expired',    excluded: false,
                   why: 'The source changed after our copy.' },
    conflicting: { label: 'Conflicting', ico: ICO.warn,     tone: 'expired',    excluded: false,
                   why: 'It disagrees with another document.' },
    draft:       { label: 'Draft',       ico: ICO.pen,      tone: 'due',        excluded: false,
                   why: 'Written but not published. The owner says who wrote it.' },
    unowned:     { label: 'Unowned',     ico: ICO.question, tone: 'unverified', excluded: false,   // library tone name; see ../GAPS.md
                   why: 'Nobody is accountable for it.' },
    unused:      { label: 'Unused',      ico: ICO.clock,    tone: 'due',        excluded: false,
                   why: 'Nothing has cited or opened it in three months.' },
    /* Not "Current". That reads as a word about dates, so it sounded like a
       claim about recency — and it is not: it is the one status that means the
       computation found nothing wrong. Naming it after the absence makes the
       whole set read as a list of problems with one clear entry. */
    current:     { label: 'No issues',   ico: ICO.check,    tone: 'verified',   excluded: false,
                   why: 'Owned, in use, matching its source, and nothing disagrees with it.' }
  };

  function statusOf(o) {
    /* A person can overrule the computation, and when they have, that is the
       answer. It is marked wherever it shows: an override you cannot see is
       indistinguishable from a fact, which is the whole failure of the
       attestation model this replaced. */
    if (o.statusSet) return o.statusSet;
    const r = RELATED[o.id];
    if (r && r.supersededBy) return 'superseded';
    /* Only meaningful where there is an upstream to fall behind. */
    if (o.src !== 'upload' && o.xu < o.upd) return 'outdated';
    if (r && r.contradicts && r.contradicts.length) return 'conflicting';
    if (o.work === 'drafted') return 'draft';
    if (o.owner === 'Unassigned') return 'unowned';
    if (o.used > UNUSED_DAYS) return 'unused';
    return 'current';
  }

  function statusBadge(value, byHand) {
    const s = STATUS[value];
    return `<span class="trust-state ts-${s.tone}${s.excluded ? ' is-excluded' : ''}${byHand ? ' is-pinned' : ''}" ` +
           `data-status="${value}" title="${esc(byHand ? 'Set by hand. ' + byHand : s.why)}">${s.ico}${s.label}` +
           `${byHand ? '<span class="pin-dot" aria-label="set by hand"></span>' : ''}</span>`;
  }

  /* Where each status leads. The computation says what is true; this says what
     you can do about it, which is the half that was missing — a draft could
     never become live because nothing offered to publish it. */
  const STATUS_EXIT = {
    draft:       ['review',      'Publish',        'publish'],
    conflicting: ['investigate', 'Compare',        'compare'],
    outdated:    ['review',      'Re-sync',        'resync'],
    unowned:     ['review',      'Set an owner',   'assign'],
    unused:      ['review',      'Archive or keep','triage'],
    superseded:  ['direct',      'Go to successor','successor'],
    current:     ['direct',      'Open',           'open']
  };

  /* Work state stays in the data and on the attribute, because §2.3 requires
     every surfaced item to declare what AiMY has done with it. It stopped being
     a second badge: Draft, Conflicting and Out of date now say the same things
     in the vocabulary a reader actually uses. */
  const WORK_LABEL = {
    detected: 'Flagged', recommended: 'Suggested', drafted: 'Draft',
    completed: 'Up to date', failed: 'Blocked'
  };

  const MODE_ICO = { direct: ICO.eye, investigate: ICO.search, prompt: AIMY_MARK(12, 14), review: ICO.scales };
  /* `ico` overrides the entry mode's default glyph where the mode is right but
     the picture is not — a direct action to create something is still direct,
     but an eye is the wrong thing to draw on it. */
  function entryAction(mode, label, data, ico) {
    const glyph = (ico || MODE_ICO[mode] || ICO.eye).replace('<svg', '<svg class="em-ico"');
    return `<button class="entry-action em-${mode}" data-entry-mode="${mode}" ${data || ''}>${glyph}${esc(label)}</button>`;
  }

  /* ═══════════════════════════════════════════════
     WHO IS LOOKING

     Entitlement decides what may be shown; ownership and recent activity
     decide what is shown first. Both are simulated here at the seam where the
     platform would supply them. Where the guarantee does not hold, the surface
     says so rather than implying a completeness it cannot deliver.
  ═══════════════════════════════════════════════ */
  const USER = {
    name: 'Nour Wael', initials: 'NW', role: 'Knowledge owner · Support Ops',
    owner: 'N. Wael',
    collections: ['policies', 'support', 'marketing', 'sales'],   // legal is not entitled
    recent: ['article-sso', 'ticket-48120', 'story-nordwind']
  };

  /* ═══════════════════════════════════════════════
     TAXONOMY — the mind-map's axes, one vocabulary

     Everything the input can set, the chip bar can show, and the URL can
     carry, is declared once here. A filter that is not in this table cannot
     be typed, cannot be linked to, and cannot be shown — which is the point.
  ═══════════════════════════════════════════════ */
  const TYPES = {
    article:  { label: 'Article',         ico: ICO.doc },
    ticket:   { label: 'Ticket',          ico: ICO.ticket },
    icp:      { label: 'ICP',             ico: ICO.target },
    campaign: { label: 'Campaign',        ico: ICO.megaphone },
    asset:    { label: 'Marketing Asset', ico: ICO.image },
    story:    { label: 'Success Story',   ico: ICO.trophy },
    blog:     { label: 'Blog',            ico: ICO.book },
    webpage:  { label: 'Web Page',        ico: ICO.globe }
  };

  /* Sources carry their own operational state, because there is nowhere else
     for it to live: the mind map's Updates branch — trigger sync for a source,
     trigger sync for one document — is an action on this record, and it is
     reached by filtering to the source rather than by going to a sources page. */
  const SRC = {
    confluence: { label: 'Confluence',    health: 'ok',     note: 'Synced 14 minutes ago',
                  last: 0, cadence: 'Every 15 minutes',
                  history: [[0, 'ok', '14 objects checked, 2 updated'], [1, 'ok', '14 objects checked, none changed'], [2, 'ok', '13 objects checked, 1 added']] },
    zendesk:    { label: 'Zendesk',       health: 'failed', note: 'OAuth token rejected since 26 Jul',
                  last: 4, cadence: 'Every hour', code: 'AUTH_401_TOKEN_EXPIRED',
                  history: [[0, 'failed', 'OAuth token rejected'], [2, 'failed', 'OAuth token rejected'], [4, 'ok', '9 objects checked, 3 updated']] },
    hubspot:    { label: 'HubSpot',       health: 'warn',   note: '3 records skipped — missing owner',
                  last: 0, cadence: 'Every 6 hours',
                  history: [[0, 'warn', '12 checked, 3 skipped — no owner'], [1, 'warn', '12 checked, 3 skipped — no owner'], [3, 'ok', '11 checked, 1 added']] },
    web:        { label: 'Website crawl', health: 'failed', note: 'Crawler blocked by robots.txt since 11 Jul',
                  last: 19, cadence: 'Weekly', code: 'CRAWL_403_ROBOTS',
                  history: [[0, 'failed', 'Blocked by robots.txt'], [7, 'failed', 'Blocked by robots.txt'], [19, 'ok', '5 pages crawled, 2 changed']] },
    upload:     { label: 'Manual upload', health: 'ok',     note: 'No schedule — uploaded by hand',
                  last: 1, cadence: 'On demand',
                  history: [[1, 'ok', '1 document uploaded by N. Wael'], [5, 'ok', '1 document uploaded by N. Wael']] }
  };

  const PRODUCTS    = { copilot: 'Copilot', sales: 'Sales', voice: 'Voice' };
  const CLIENTS     = { nordwind: 'Nordwind GmbH', tavola: 'Tavola Retail', meridian: 'Meridian Health', orbit: 'Orbit BPO' };
  const COLLECTIONS = { policies: 'Policies', support: 'Support', sales: 'Sales', marketing: 'Marketing', legal: 'Legal' };

  /* The mind map's own axes, which the first pass collapsed into generic tags.
     ICP carries Services and Region; Success Story carries Services, Region and
     Client. Audience is the Permission branch — Clients · Admins · Stakeholders. */
  const REGIONS  = { emea: 'EMEA', apac: 'APAC', amer: 'Americas', global: 'Global' };
  const SERVICES = { qa: 'Quality assurance', voice: 'Voice operations', support: 'Support delivery',
                     cx: 'CX consulting', analytics: 'Analytics' };
  const AUDIENCE = { clients: 'Clients', admins: 'Admins', stakeholders: 'Stakeholders' };

  /* Collection-level governance. Ownership, retention and per-agent grounding
     are properties of a collection, so they are stated wherever a collection is
     — on the axis panel when you filter to one, and on every document that
     belongs to it. There is no matrix, because a matrix is only a way of
     looking at one of these rows at a time, and the filter does that.

     No review cadence: nothing here runs on a clock that expects a signature. */
  const AGENTS = [
    { id: 'copilot', name: 'Copilot', external: false },
    { id: 'sales',   name: 'Sales',   external: false },
    { id: 'voice',   name: 'Voice',   external: true  }
  ];
  /* `retain` is the auto-archive rule in days since last update — 0 means never.
     `purge` is how long an archived document is kept before it can be deleted
     for good; nothing is ever deleted automatically, because a rule that
     destroys content without anyone looking is the one rule you cannot undo. */
  const COLLECTION_META = {
    policies:  { owner: 'A. Mahfouz', retain: 0,    purge: 365, grounding: { copilot: true,  sales: false, voice: false } },
    support:   { owner: 'N. Wael',    retain: 730,  purge: 180, grounding: { copilot: true,  sales: false, voice: true  } },
    sales:     { owner: 'Sales Ops',  retain: 540,  purge: 365, grounding: { copilot: false, sales: true,  voice: false } },
    marketing: { owner: 'Marketing',  retain: 730,  purge: 365, grounding: { copilot: false, sales: true,  voice: false } },
    legal:     { owner: 'Legal',      retain: 0,    purge: 2555, grounding: { copilot: false, sales: false, voice: false } }
  };

  const SYNC_SCHEDULES = ['Every 15 minutes', 'Every hour', 'Every 6 hours', 'Daily', 'Weekly', 'On demand'];
  const RETAIN_OPTIONS = [[0, 'Never'], [365, 'After 1 year'], [540, 'After 18 months'], [730, 'After 2 years']];

  /* Today is fixed so the prototype's relative dates do not drift as it ages.
     Every date on an object is stored as days-before-today, which is also what
     the date filters compare against — one representation, no parsing. */
  const TODAY = new Date('2026-07-30T00:00:00Z');
  const dayMs = 86400000;
  const dateOf = (days) => new Date(TODAY.getTime() - days * dayMs);
  const fmtDate = (days) =>
    dateOf(days).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  const fmtShort = (days) =>
    dateOf(days).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  const WINDOWS = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
  const WINDOW_LABEL = { '7d': 'last 7 days', '30d': 'last 30 days', '90d': 'last 90 days', '1y': 'last year' };

  /* ═══════════════════════════════════════════════
     THE CORPUS

     Thirty-six objects across all eight types. Every one carries the full
     mind-map field set — tags, source, client, product, collection, both
     internal dates and both external ones — because a filter that only some
     objects can answer is a filter that lies about its result count.
  ═══════════════════════════════════════════════ */
  const CORPUS = [
    { id:'article-refund', t:'article', work:'detected', owner:'A. Mahfouz',
      title:'Refund eligibility — EU customers', col:'policies', src:'confluence', prod:'copilot', client:'',
      tags:['refunds','eu','policy'], upd:197, ing:410, xc:520, xu:197,
      sum:'30-day window from purchase, provided the item has not been activated.',
      x:{ applies:'EU storefront · all plans' } },

    { id:'article-returns-faq', t:'article', work:'detected', owner:'A. Mahfouz',
      title:'Returns FAQ — activated items', col:'support', src:'zendesk', prod:'copilot', client:'',
      tags:['refunds','warranty','policy'], upd:26, ing:300, xc:480, xu:26,
      sum:'Activation ends refund eligibility. Faults are handled under warranty instead.',
      x:{ applies:'All storefronts — unscoped' } },

    { id:'article-warranty', t:'article', work:'completed', owner:'A. Mahfouz',
      title:'Warranty process — EU', col:'policies', src:'confluence', prod:'copilot', client:'',
      tags:['warranty','eu','policy'], upd:28, ing:400, xc:500, xu:28,
      sum:'What happens after activation, and where the 30-day refund window stops applying.',
      x:{ applies:'EU storefront · activated items' } },

    { id:'article-sso', t:'article', work:'completed', owner:'N. Wael',
      title:'SSO provisioning — enterprise', col:'support', src:'confluence', prod:'copilot', client:'',
      tags:['sso','enterprise','provisioning'], upd:12, ing:220, xc:260, xu:12,
      sum:'SCIM provisioning, group mapping, and the two failure modes support sees most.',
      x:{ applies:'Enterprise tier' } },

    { id:'article-residency', t:'article', work:'recommended', owner:'N. Wael',
      title:'Data residency — EU and APAC', col:'policies', src:'confluence', prod:'copilot', client:'',
      tags:['gdpr','eu','apac','security'], upd:88, ing:390, xc:470, xu:88,
      sum:'Where customer data is stored per region, and what changes on an enterprise contract.',
      x:{ applies:'All tiers · EU and APAC regions' } },

    { id:'article-sla', t:'article', work:'completed', owner:'N. Wael',
      title:'Support SLA — response and resolution', col:'support', src:'confluence', prod:'copilot', client:'',
      tags:['sla','support'], upd:19, ing:300, xc:340, xu:19,
      sum:'First response and resolution targets per tier, and what pauses the clock.',
      x:{ applies:'All support tiers' } },

    { id:'article-billing', t:'article', work:'recommended', owner:'N. Wael',
      title:'Billing cycles and proration', col:'policies', src:'confluence', prod:'sales', client:'',
      tags:['billing','policy'], upd:74, ing:380, xc:450, xu:74,
      sum:'How mid-cycle upgrades are prorated, and when a credit is issued instead.',
      x:{ applies:'Self-serve and enterprise' } },

    { id:'article-onboarding', t:'article', work:'drafted', owner:'Unassigned',
      title:'Onboarding checklist — enterprise', col:'support', src:'upload', prod:'copilot', client:'',
      tags:['onboarding','enterprise'], upd:6, ing:6, xc:6, xu:6,
      sum:'Drafted by AiMY from twelve resolved onboarding tickets. Nobody has published it.',
      x:{ applies:'Enterprise tier · first 30 days' } },

    { id:'article-gdpr-dsr', t:'article', work:'completed', owner:'O. Said',
      title:'Handling a GDPR data subject request', col:'policies', src:'confluence', prod:'copilot', client:'',
      tags:['gdpr','security','policy'], upd:41, ing:360, xc:430, xu:41,
      sum:'The 30-day clock, who signs off, and what support may confirm before legal review.',
      x:{ applies:'EU data subjects' } },

    { id:'article-churn-signals', t:'article', work:'completed', owner:'Sales Ops',
      title:'Churn signals — 2025 model', col:'sales', src:'confluence', prod:'sales', client:'',
      tags:['churn','sales'], upd:240, ing:600, xc:700, xu:240,
      sum:'Replaced by the 2026 churn model. Kept for reference and excluded from answers.',
      x:{ applies:'Superseded 12 Mar 2026' } },

    { id:'article-voice-handoff', t:'article', work:'completed', owner:'Unassigned',
      title:'Voice-to-agent handoff rules', col:'support', src:'upload', prod:'voice', client:'',
      tags:['voice','support','sla'], upd:15, ing:15, xc:15, xu:15,
      sum:'When a voice call escalates to a human, and what context is carried across.',
      x:{ applies:'Voice deployments' } },

    { id:'ticket-48120', t:'ticket', work:'detected', owner:'Ingested · Zendesk',
      title:'#48120 — Refund declined after activation', col:'support', src:'zendesk', prod:'copilot', client:'nordwind',
      tags:['refunds','eu'], upd:150, ing:150, xc:158, xu:150,
      sum:'Customer activated before requesting a refund; policy exception granted on goodwill.',
      x:{ requester:'Nordwind GmbH', status:'Resolved', resolution:'Goodwill credit issued; policy exception logged.' } },

    { id:'ticket-51004', t:'ticket', work:'completed', owner:'Ingested · Zendesk',
      title:'#51004 — SCIM group mapping fails silently', col:'support', src:'zendesk', prod:'copilot', client:'meridian',
      tags:['sso','enterprise','provisioning'], upd:34, ing:34, xc:38, xu:34,
      sum:'Groups synced but roles did not apply. Root cause was a stale mapping cache.',
      x:{ requester:'Meridian Health', status:'Resolved', resolution:'Cache invalidated on mapping change; fix shipped 24 Jun.' } },

    { id:'ticket-51877', t:'ticket', work:'completed', owner:'Ingested · Zendesk',
      title:'#51877 — Data residency question, APAC contract', col:'support', src:'zendesk', prod:'copilot', client:'tavola',
      tags:['gdpr','apac','security'], upd:9, ing:9, xc:11, xu:9,
      sum:'Asked where APAC data is stored under an enterprise contract. Answer could not be grounded.',
      x:{ requester:'Tavola Retail', status:'Awaiting legal', resolution:'Open — routed to the policy owner.' } },

    { id:'ticket-52310', t:'ticket', work:'completed', owner:'Ingested · Zendesk',
      title:'#52310 — Proration disputed on mid-cycle upgrade', col:'support', src:'zendesk', prod:'sales', client:'orbit',
      tags:['billing'], upd:4, ing:4, xc:5, xu:4,
      sum:'Customer expected a credit rather than a prorated charge.',
      x:{ requester:'Orbit BPO', status:'Resolved', resolution:'Credit applied; billing article flagged as unclear.' } },

    { id:'ticket-52488', t:'ticket', work:'failed', owner:'Ingested · Zendesk',
      title:'#52488 — Voice call dropped at handoff', col:'support', src:'zendesk', prod:'voice', client:'orbit',
      tags:['voice','sla'], upd:2, ing:2, xc:2, xu:2,
      sum:'Ingestion incomplete — the transcript attachment could not be fetched.',
      x:{ requester:'Orbit BPO', status:'Open', resolution:'Blocked — Zendesk credentials expired mid-sync.' } },

    { id:'icp-bpo', t:'icp', work:'recommended', owner:'Sales Ops',
      title:'Mid-market BPO — EMEA', col:'sales', src:'hubspot', prod:'sales', client:'',
      tags:['emea','sales','qa'], upd:171, ing:400, xc:430, xu:171,
      sum:'Outsourced contact-centre operators between 200 and 2,000 seats across EMEA.',
      x:{ segment:'200–2,000 seats · outsourced support',
          fit:['Multi-client contact centre operation','Existing QA function with a named owner'],
          dis:['Single-client captive centres','Under 200 seats — no QA budget'] } },

    { id:'icp-bpo-apac', t:'icp', work:'detected', owner:'Sales Ops',
      title:'Mid-market BPO — APAC', col:'sales', src:'hubspot', prod:'sales', client:'',
      tags:['apac','sales','qa'], upd:290, ing:420, xc:450, xu:290,
      sum:'The APAC cut of the BPO segment. Nothing has cited it since February.',
      x:{ segment:'150–1,500 seats · outsourced support',
          fit:['English-language delivery','Regional QA mandate'],
          dis:['Domestic-only operators','No data residency requirement'] } },

    { id:'icp-healthcare', t:'icp', work:'completed', owner:'Sales Ops',
      title:'Regulated healthcare support — EU', col:'sales', src:'hubspot', prod:'sales', client:'',
      tags:['eu','security','sales'], upd:23, ing:200, xc:230, xu:23,
      sum:'In-house support teams inside regulated healthcare providers.',
      x:{ segment:'Regulated providers · in-house support',
          fit:['Named compliance owner','Existing audit obligation'],
          dis:['No residency requirement','Outsourced support only'] } },

    { id:'icp-retail-voice', t:'icp', work:'drafted', owner:'Unassigned',
      title:'Retail voice operations', col:'sales', src:'upload', prod:'voice', client:'',
      tags:['voice','sales'], upd:8, ing:8, xc:8, xu:8,
      sum:'Drafted by AiMY from six won deals. No owner.',
      x:{ segment:'Retail · seasonal voice volume',
          fit:['Seasonal peaks above 3× baseline','Existing IVR'],
          dis:['Flat annual volume','No voice channel'] } },

    { id:'campaign-q3', t:'campaign', work:'completed', owner:'Marketing',
      title:'Q3 — Quality at scale', col:'marketing', src:'hubspot', prod:'sales', client:'',
      tags:['emea','qa','campaign'], upd:32, ing:120, xc:140, xu:32,
      sum:'Pipeline generation against the mid-market BPO segment.',
      x:{ objective:'Pipeline from mid-market BPO', window:'1 Jul – 30 Sep · active', assets:'6 assets · 3 landing pages' } },

    { id:'campaign-q4-voice', t:'campaign', work:'recommended', owner:'Marketing',
      title:'Q4 — Voice that does not drop', col:'marketing', src:'hubspot', prod:'voice', client:'',
      tags:['voice','campaign'], upd:61, ing:100, xc:110, xu:61,
      sum:'Launch campaign for the voice handoff work. Window opens before the next review date.',
      x:{ objective:'Awareness for voice handoff', window:'1 Oct – 31 Dec · not started', assets:'2 assets · 1 landing page' } },

    { id:'campaign-residency', t:'campaign', work:'detected', owner:'Marketing',
      title:'EU residency — compliance push', col:'marketing', src:'hubspot', prod:'copilot', client:'',
      tags:['gdpr','eu','campaign'], upd:210, ing:300, xc:320, xu:210,
      sum:'Ran in Q1 and never closed out.',
      x:{ objective:'Inbound from compliance buyers', window:'1 Jan – 31 Mar · ended', assets:'4 assets' } },

    { id:'asset-onepager', t:'asset', work:'completed', owner:'Brand',
      title:'Quality at scale — one-pager', col:'marketing', src:'upload', prod:'sales', client:'',
      tags:['qa','emea','collateral'], upd:27, ing:27, xc:27, xu:27,
      sum:'Two-page PDF used in outbound to the BPO segment.',
      x:{ format:'PDF · A4 · 2pp', usage:'External — customer-facing', approval:'approved' } },

    { id:'asset-deck-security', t:'asset', work:'recommended', owner:'Brand',
      title:'Security and residency — buyer deck', col:'marketing', src:'upload', prod:'sales', client:'',
      tags:['security','gdpr','collateral'], upd:96, ing:96, xc:96, xu:96,
      sum:'Used in enterprise deals. Cites the residency article, which is itself due.',
      x:{ format:'PDF · 16:9 · 14 slides', usage:'External — under NDA', approval:'approved' } },

    { id:'asset-voice-demo', t:'asset', work:'drafted', owner:'Unassigned',
      title:'Voice handoff — demo script', col:'marketing', src:'upload', prod:'voice', client:'',
      tags:['voice','collateral'], upd:5, ing:5, xc:5, xu:5,
      sum:'Drafted for the Q4 campaign. Not yet cleared for external use.',
      x:{ format:'Doc · 3pp', usage:'Internal only', approval:'pending' } },

    { id:'asset-pricing-sheet', t:'asset', work:'detected', owner:'Brand',
      title:'Enterprise pricing sheet — 2025', col:'marketing', src:'upload', prod:'sales', client:'',
      tags:['pricing','collateral'], upd:230, ing:230, xc:230, xu:230,
      sum:'Superseded pricing still circulating in outbound. Past review and excluded.',
      x:{ format:'PDF · A4 · 1pp', usage:'External — customer-facing', approval:'approved' } },

    { id:'story-nordwind', t:'story', work:'completed', owner:'Marketing',
      title:'Nordwind — 31% faster resolution', col:'marketing', src:'hubspot', prod:'sales', client:'nordwind',
      tags:['qa','emea','proof'], upd:39, ing:120, xc:130, xu:39,
      sum:'Eight hundred seats, three months, measured against their own baseline.',
      x:{ customer:'Nordwind GmbH · 800 seats', outcome:'31% faster first resolution',
          quote:'We stopped guessing which conversations to review.', approval:'pending' } },

    { id:'story-meridian', t:'story', work:'completed', owner:'Marketing',
      title:'Meridian Health — audit-ready in six weeks', col:'marketing', src:'hubspot', prod:'copilot', client:'meridian',
      tags:['security','eu','proof'], upd:54, ing:140, xc:150, xu:54,
      sum:'A regulated provider reaching audit readiness without adding headcount.',
      x:{ customer:'Meridian Health · 240 seats', outcome:'Audit readiness in 6 weeks',
          quote:'The evidence was already there. We just could not find it.', approval:'approved' } },

    { id:'story-tavola', t:'story', work:'recommended', owner:'Marketing',
      title:'Tavola Retail — peak season without extra headcount', col:'marketing', src:'hubspot', prod:'voice', client:'tavola',
      tags:['voice','proof'], upd:104, ing:180, xc:190, xu:104,
      sum:'Seasonal volume absorbed by voice deflection rather than temporary staff.',
      x:{ customer:'Tavola Retail · 410 seats', outcome:'Peak absorbed with 0 temporary hires',
          quote:'December stopped being the month we dread.', approval:'approved' } },

    { id:'story-orbit', t:'story', work:'drafted', owner:'Unassigned',
      title:'Orbit BPO — multi-client QA in one view', col:'marketing', src:'upload', prod:'sales', client:'orbit',
      tags:['qa','proof'], upd:3, ing:3, xc:3, xu:3,
      sum:'Drafted by AiMY from the account notes. No customer sign-off, no owner.',
      x:{ customer:'Orbit BPO · 1,200 seats', outcome:'One QA view across 9 client programmes',
          quote:'Awaiting approval — do not quote externally.', approval:'pending' } },

    { id:'blog-quality-scale', t:'blog', work:'completed', owner:'Marketing',
      title:'Why quality does not scale by hiring reviewers', col:'marketing', src:'web', prod:'sales', client:'',
      tags:['qa','opinion'], upd:47, ing:47, xc:52, xu:47,
      sum:'The argument the Q3 campaign runs on, in long form.',
      x:{ pub:'Published', canonical:'aimy.app/blog/quality-does-not-scale', author:'A. Mahfouz' } },

    { id:'blog-residency', t:'blog', work:'recommended', owner:'Marketing',
      title:'Data residency, plainly', col:'marketing', src:'web', prod:'copilot', client:'',
      tags:['gdpr','eu','apac','opinion'], upd:119, ing:119, xc:124, xu:119,
      sum:'Public-facing explainer. Points at the residency article, which is due.',
      x:{ pub:'Published', canonical:'aimy.app/blog/data-residency', author:'O. Said' } },

    { id:'blog-voice-draft', t:'blog', work:'drafted', owner:'Unassigned',
      title:'What a good voice handoff sounds like', col:'marketing', src:'upload', prod:'voice', client:'',
      tags:['voice','opinion'], upd:1, ing:1, xc:1, xu:1,
      sum:'Drafted for the Q4 campaign. Unpublished.',
      x:{ pub:'Draft — unpublished', canonical:'—', author:'AiMY · awaiting an owner' } },

    { id:'page-pricing', t:'webpage', work:'detected', owner:'Unassigned',
      title:'Pricing — Enterprise tier', col:'marketing', src:'web', prod:'sales', client:'',
      tags:['pricing','enterprise'], upd:134, ing:400, xc:600, xu:26,
      sum:'The live pricing page. Changed at source three weeks after our last crawl.',
      x:{ url:'aimy.app/pricing/enterprise', crawl:'134 days ago', change:'Detected 26 days ago' } },

    { id:'page-security', t:'webpage', work:'completed', owner:'O. Said',
      title:'Security overview', col:'marketing', src:'web', prod:'copilot', client:'',
      tags:['security','gdpr'], upd:21, ing:300, xc:410, xu:21,
      sum:'The public security page. Crawled weekly, no unexplained drift.',
      x:{ url:'aimy.app/security', crawl:'7 days ago', change:'None since last crawl' } },

    { id:'page-status', t:'webpage', work:'failed', owner:'Unassigned',
      title:'Service status and incident history', col:'support', src:'web', prod:'copilot', client:'',
      tags:['sla','support'], upd:19, ing:210, xc:300, xu:19,
      sum:'Crawl blocked since 11 July. What is stored is nineteen days old.',
      x:{ url:'status.aimy.app', crawl:'19 days ago', change:'Unknown — crawler blocked' } },

    /* ── Legal. Not entitled to this user, and therefore never counted, never
       ranked and never cited. The three objects exist so the entitlement
       filter has something real to withhold: a filter that only ever hides
       nothing is not a filter anyone can trust. ── */
    { id:'article-dpa', t:'article', work:'completed', owner:'Legal',
      title:'Data processing addendum — standard terms', col:'legal', src:'confluence', prod:'copilot', client:'',
      tags:['gdpr','security'], upd:16, ing:340, xc:400, xu:16,
      sum:'The standard DPA offered to enterprise customers.',
      x:{ applies:'Enterprise contracts' } },
    { id:'article-retention', t:'article', work:'recommended', owner:'Legal',
      title:'Retention and deletion schedule', col:'legal', src:'confluence', prod:'copilot', client:'',
      tags:['gdpr','policy'], upd:110, ing:350, xc:410, xu:110,
      sum:'How long each class of record is kept, and what triggers deletion.',
      x:{ applies:'All regions' } },
    { id:'ticket-49002', t:'ticket', work:'completed', owner:'Ingested · Zendesk',
      title:'#49002 — Legal hold on an account under dispute', col:'legal', src:'zendesk', prod:'copilot', client:'orbit',
      tags:['security'], upd:70, ing:70, xc:72, xu:70,
      sum:'Account data preserved pending resolution.',
      x:{ requester:'Orbit BPO', status:'On hold', resolution:'Open — legal hold in force.' } }
  ];

  /* Per-object overrides, kept out of the records above so the corpus stays
     readable.

     `used` is days since anything last cited or opened the document and `uses`
     is how many times in the last ninety — the two numbers the retrieval layer
     is already counting, and the ones that say whether a document is doing any
     work. Where they are absent below, `used` falls out of the last update: a
     document written last week has been read this week.

     `xu` lower than `upd` means the source moved on after our copy, which is
     what makes a document out of date. */
  const EXTRA = {
    'article-residency':    { props: { tier: 'all', jurisdiction: 'EU + APAC' }, used: 3, uses: 61 },
    'article-billing':      { used: 122, uses: 2 },
    'article-retention':    { used: 140, uses: 1 },
    'article-dpa':          { props: { tier: 'enterprise', 'legal-review': 'annual' }, used: 21, uses: 9 },
    'article-sso':          { props: { tier: 'enterprise' }, services: ['support'], used: 1, uses: 148 },
    'article-refund':       { xu: 40, used: 2, uses: 210 },
    'article-returns-faq':  { used: 2, uses: 173 },
    'article-churn-signals':{ used: 210, uses: 0 },
    'icp-bpo':              { region: 'emea', services: ['qa', 'support'], props: { 'deal-band': '40–120k' }, used: 6, uses: 34 },
    'icp-bpo-apac':         { region: 'apac', services: ['qa', 'support'], used: 168, uses: 1 },
    'icp-healthcare':       { region: 'emea', services: ['qa', 'cx'], props: { 'deal-band': '80–250k' }, used: 4, uses: 27 },
    'icp-retail-voice':     { region: 'amer', services: ['voice', 'analytics'], used: 8, uses: 3 },
    'campaign-residency':   { used: 196, uses: 0 },
    'asset-deck-security':  { xu: 20, used: 11, uses: 18 },
    'asset-pricing-sheet':  { used: 154, uses: 4 },
    'story-nordwind':       { region: 'emea', services: ['qa'], props: { seats: '800', 'go-live': 'Mar 2026' }, used: 5, uses: 42 },
    'story-meridian':       { region: 'emea', services: ['qa', 'cx'], props: { seats: '240' }, used: 9, uses: 31 },
    'story-tavola':         { region: 'emea', services: ['voice'], props: { seats: '410' }, used: 118, uses: 2 },
    'story-orbit':          { region: 'apac', services: ['qa', 'analytics'], props: { seats: '1,200' }, used: 3, uses: 6 },
    'blog-quality-scale':   { xu: 12, used: 14, uses: 22 },
    'blog-residency':       { used: 131, uses: 3 },
    'page-pricing':         { used: 7, uses: 88 }
  };

  /* Two archived objects. Archive is the mind map's manual-update branch, and it
     is not deletion: archived content stays addressable, stays restorable, and
     is excluded from the surface until you ask for it with `?archived=1`. */
  CORPUS.push(
    { id:'article-refund-2024', t:'article', work:'completed', owner:'A. Mahfouz', arch:true,
      title:'Refund eligibility — EU customers (2024 terms)', col:'policies', src:'confluence', prod:'copilot', client:'',
      tags:['refunds','eu','policy'], upd:520, ing:700, xc:760, xu:520,
      sum:'The 14-day window that preceded the current 30-day policy.',
      x:{ applies:'EU storefront · superseded 12 Mar 2025' } },
    { id:'campaign-q1-launch', t:'campaign', work:'completed', owner:'Marketing', arch:true,
      title:'Q1 — Launch week', col:'marketing', src:'hubspot', prod:'sales', client:'',
      tags:['campaign'], upd:290, ing:320, xc:330, xu:290,
      sum:'Closed out and archived. Kept for the asset list and the outcome numbers.',
      x:{ objective:'Launch awareness', window:'6 Jan – 20 Jan · ended', assets:'9 assets' } }
  );

  /* Defaults, derived once. Region falls out of the tags where the object
     already says which region it is about; audience falls out of the type,
     because what makes a document client-visible is what kind of document it
     is. Both are overridable in EXTRA where the real answer is not derivable. */
  const CLIENT_FACING = ['blog', 'webpage', 'asset', 'story'];
  CORPUS.forEach((o) => {
    Object.assign(o, EXTRA[o.id] || {});
    if (!o.region) {
      o.region = o.tags.indexOf('apac') > -1 ? 'apac'
        : (o.tags.indexOf('eu') > -1 || o.tags.indexOf('emea') > -1) ? 'emea' : 'global';
    }
    o.services = o.services || [];
    o.props = o.props || {};
    o.arch = !!o.arch;
    o.aud = o.aud || (o.col === 'legal' ? ['admins']
      : CLIENT_FACING.indexOf(o.t) > -1 ? ['clients', 'admins', 'stakeholders']
      : ['admins', 'stakeholders']);
    /* A document written last week has been read this week. */
    if (o.used === undefined) o.used = Math.min(o.upd, 30);
    if (o.uses === undefined) o.uses = Math.max(0, 40 - Math.round(o.used / 3));
  });

  const byId = (id) => CORPUS.find((o) => o.id === id);
  const TOTAL = CORPUS.length;

  /* Status is derived, so it is derived again after anything that could change
     it — an edit, an archive, a restore, a re-sync. One call, everywhere. */
  function recompute() { CORPUS.forEach((o) => { o.status = statusOf(o); }); }

  const usedLabel = (o) => {
    if (o.used === 0) return 'Today';
    if (o.used === 1) return 'Yesterday';
    if (o.used < 30) return o.used + ' days ago';
    const m = Math.round(o.used / 30);
    return m + (m === 1 ? ' month ago' : ' months ago');
  };

  /* Relationships. Kept out of the object bodies because they are a graph, and
     a graph half-stored on each node goes out of sync the first time one side
     is edited. */
  const RELATED = {
    'article-refund':     { related: ['article-warranty'], contradicts: ['article-returns-faq'] },
    'article-returns-faq':{ related: ['article-warranty'], contradicts: ['article-refund'] },
    'article-residency':  { related: ['blog-residency', 'article-gdpr-dsr'], contradicts: [] },
    'article-churn-signals': { supersededBy: 'icp-bpo', related: [], contradicts: [] },
    'page-pricing':       { related: ['asset-pricing-sheet'], contradicts: [] },
    'story-nordwind':     { related: ['ticket-48120'], contradicts: [] }
  };

  /* Status reads the relationship graph, so the first derivation waits for it. */
  recompute();

  /* ── Comments belong to the document ──

     They were a fixture in the editor's markup, which meant a document created
     ten seconds ago opened carrying somebody else's remark from two days ago.
     Seeded here on the two documents the fixture was written about; everything
     else — and everything new — starts with none. */
  CORPUS.forEach((o) => { o.comments = []; seedVersions(o); });
  (byId('article-refund') || {}).comments = [
    { who: 'A. Mahfouz', initials: 'AM', when: '2 days ago',
      text: 'The exception needs to name the warranty article explicitly — support keeps landing here and then having to search again.' }
  ];
  (byId('article-residency') || {}).comments = [
    { who: 'O. Said', initials: 'OS', when: 'last week',
      text: 'APAC is the half nobody has written. A ticket came in on it again yesterday.' }
  ];

  function addComment(o, text) {
    o.comments = (o.comments || []).concat([
      { who: USER.name, initials: USER.initials, when: 'just now', text: text }
    ]);
  }

  /* ═══════════════════════════════════════════════
     STATE — the URL, and nothing else

     Every filter, the open document and the view mode live in the query
     string. Nothing filters off a variable the URL does not also hold, which
     is what makes the surface drivable by an agent: to change what a person
     is looking at, write a URL.
  ═══════════════════════════════════════════════ */
  const LIST_KEYS = ['type', 'tag', 'source', 'client', 'product', 'collection', 'status',
                     'region', 'service', 'audience', 'ids'];
  const DATE_KEYS = ['updated', 'ingested', 'extCreated', 'extUpdated'];
  const FLAG_KEYS = ['mine', 'archived'];
  const ALL_KEYS  = LIST_KEYS.concat(DATE_KEYS, FLAG_KEYS, ['q', 'prop']);

  function readURL() {
    const p = new URLSearchParams(location.search);
    const st = { doc: p.get('doc') || '', mode: p.get('mode') || 'view',
                 settings: p.get('settings') || '',
                 view: p.get('view') === 'tree' ? 'tree' : 'grid' };
    LIST_KEYS.forEach((k) => { st[k] = (p.get(k) || '').split(',').filter(Boolean); });
    DATE_KEYS.forEach((k) => { st[k] = p.get(k) || ''; });
    FLAG_KEYS.forEach((k) => { st[k] = p.get(k) === '1'; });
    st.q = p.get('q') || '';
    /* A custom property, as `key:value`. The mind map names custom properties
       alongside tags and types; making them filterable is the only way they are
       worth introducing at all. */
    st.prop = p.get('prop') || '';
    return st;
  }

  /* True when the URL carries no filter at all — the landing case, where the
     surface composes a working set rather than showing the whole corpus. */
  function isComposed(st) {
    return !st.q && !st.mine && !st.archived && !st.prop &&
      LIST_KEYS.every((k) => !st[k].length) && DATE_KEYS.every((k) => !st[k]);
  }

  function writeURL(st, opt) {
    const p = new URLSearchParams();
    if (st.q) p.set('q', st.q);
    LIST_KEYS.forEach((k) => { if (st[k] && st[k].length) p.set(k, st[k].join(',')); });
    DATE_KEYS.forEach((k) => { if (st[k]) p.set(k, st[k]); });
    FLAG_KEYS.forEach((k) => { if (st[k]) p.set(k, '1'); });
    if (st.prop) p.set('prop', st.prop);
    if (st.doc) { p.set('doc', st.doc); if (st.mode === 'edit') p.set('mode', 'edit'); }
    if (st.settings) p.set('settings', st.settings);
    if (st.view === 'tree') p.set('view', 'tree');
    /* Prototype affordance, carried so a forced state survives a filter change
       and the degraded case can actually be driven rather than just looked at. */
    if (forcedState) p.set('state', forcedState);
    /* Commas and colons are left unencoded. A filter URL is meant to be read, pasted and
       written by hand as well as by an agent, and `type=article,ticket` is
       legible in a way `type=article%2Cticket` is not. Both parse identically. */
    const qs = p.toString().replace(/%2C/g, ',').replace(/%3A/g, ':');
    const url = location.pathname + (qs ? '?' + qs : '');
    if (opt && opt.replace) history.replaceState(null, '', url);
    else history.pushState(null, '', url);
    render();
  }

  /* Merge a partial change into the current URL. Everything that mutates the
     surface goes through here, so there is exactly one writer. */
  function patch(changes, opt) {
    const st = readURL();
    Object.keys(changes).forEach((k) => { st[k] = changes[k]; });
    /* Changing a filter drops the open document: you asked to look at the set
       again, and leaving one document open on top of a set you can no longer
       see is the classic lost-place bug. */
    if (Object.keys(changes).some((k) => ALL_KEYS.indexOf(k) > -1)) { st.doc = ''; st.mode = 'view'; }
    writeURL(st, opt);
  }

  /* ═══════════════════════════════════════════════
     FILTERING
  ═══════════════════════════════════════════════ */
  /* Scalar axes — one value per object. */
  const FIELD_OF = { type: 't', source: 'src', client: 'client', product: 'prod', collection: 'col',
                     status: 'status', region: 'region' };
  /* Multi-value axes — a set per object, matched on any overlap. */
  const MULTI_OF = { tag: 'tags', service: 'services', audience: 'aud' };
  const DATE_FIELD = { updated: 'upd', ingested: 'ing', extCreated: 'xc', extUpdated: 'xu' };

  /* Entitlement is a hard filter and must be visibly true: a briefing or a
     result set that silently includes inaccessible material is both a trust
     failure and a leak. Applied before anything the user typed. */
  const ENTITLED = CORPUS.filter((o) => USER.collections.indexOf(o.col) > -1);
  const WITHHELD = CORPUS.length - ENTITLED.length;
  /* What the surface counts and composes from. Archived objects are entitled
     and reachable, but they are not part of the live corpus and must not be
     counted as though they were. */
  const LIVE = ENTITLED.filter((o) => !o.arch);

  function applyFilters(st) {
    /* `ids` is exclusive by design. It is how an answer puts its own sources on
       the surface, and mixing it with the filters that were active beforehand
       would show a set that is neither the answer's nor yours. */
    if (st.ids.length) return st.ids.map(byId).filter(Boolean);

    /* Archived content is out of the way, not gone. It stays addressable and
       restorable, and asking for it is one parameter. */
    let out = ENTITLED.filter((o) => (st.archived ? o.arch : !o.arch));
    if (st.mine) out = out.filter((o) => o.owner === USER.owner);
    Object.keys(FIELD_OF).forEach((k) => {
      if (st[k] && st[k].length) out = out.filter((o) => st[k].indexOf(o[FIELD_OF[k]]) > -1);
    });
    Object.keys(MULTI_OF).forEach((k) => {
      if (st[k] && st[k].length) out = out.filter((o) => st[k].some((v) => o[MULTI_OF[k]].indexOf(v) > -1));
    });
    DATE_KEYS.forEach((k) => {
      const v = st[k];
      if (!v) return;
      if (WINDOWS[v]) { out = out.filter((o) => o[DATE_FIELD[k]] <= WINDOWS[v]); return; }
      const m = RANGE_RE.exec(v);
      if (!m) return;
      /* Stored as days-before-today, so the OLDER end is the larger number. */
      const older = offsetOf(m[1]), newer = offsetOf(m[2]);
      out = out.filter((o) => o[DATE_FIELD[k]] <= older && o[DATE_FIELD[k]] >= newer);
    });
    if (st.prop) {
      const [pk, pv] = st.prop.split(':');
      out = out.filter((o) => o.props[pk] !== undefined && (!pv || String(o.props[pk]).toLowerCase() === pv.toLowerCase()));
    }
    if (st.q) {
      const q = st.q.toLowerCase();
      out = out.filter((o) => (o.title + ' ' + o.sum + ' ' + o.tags.join(' ')).toLowerCase().indexOf(q) > -1);
    }
    return out;
  }

  /* What needs a person, ranked. Used for the composed landing set and for the
     "needs attention" sort — one definition, so the two cannot disagree. */
  const NEED_SCORE = { outdated: 5, conflicting: 5, draft: 3, unowned: 2, unused: 2, superseded: 1, current: 0 };
  const WORK_SCORE = { failed: 4, drafted: 3, detected: 3, recommended: 2, completed: 0 };
  const needScore = (o) =>
    (NEED_SCORE[o.status] || 0) + (WORK_SCORE[o.work] || 0) + (o.owner === USER.owner ? 2 : 0);

  const COMPOSED_CAP = 12;

  function sortSet(list, sort) {
    const s = list.slice();
    if (sort === 'attention') return s.sort((a, b) => needScore(b) - needScore(a) || a.upd - b.upd);
    if (sort === 'title') return s.sort((a, b) => a.title.localeCompare(b.title));
    return s.sort((a, b) => a.upd - b.upd);           // most recently updated first
  }

  /* The landing set: what you own or touched, ranked by what needs you. The
     cap is stated on the surface rather than applied quietly — a list that
     hides its tail overstates how contained the problem is. */
  function composedSet() {
    const mine = LIVE.filter((o) => o.owner === USER.owner || USER.recent.indexOf(o.id) > -1);
    const rest = LIVE.filter((o) => mine.indexOf(o) === -1);
    return sortSet(mine, 'attention').concat(sortSet(rest, 'attention')).slice(0, COMPOSED_CAP);
  }

  /* ═══════════════════════════════════════════════
     THE INPUT — one field, four routes

     Routing is decided on the shape of what was typed, never on a mode
     switch. Each route is a classified entry mode, and three of the four never
     open the canvas — which is the rule the previous build broke.
  ═══════════════════════════════════════════════ */

  /* The lexicon. Everything the input can recognise is declared here, so what
     the parser understands and what the chip bar can show are the same list. */
  const LEX = [
    /* The old vocabulary still arrives — people type what the last build
       taught them — so it is mapped to the nearest thing that now exists
       rather than silently matching nothing. */
    [/\bexpired\b|\bstale\b/i,            { status: 'outdated' }],
    [/\bunverified\b|\bnever verified\b/i,{ status: 'unowned' }],
    [/\bsuperseded\b|\breplaced\b/i,      { status: 'superseded' }],
    [/\bverified\b/i,                     { status: 'current' }],
    // types
    [/\barticles?\b/i,                    { type: 'article' }],
    [/\btickets?\b/i,                     { type: 'ticket' }],
    [/\bicps?\b|\bideal customer\b/i,     { type: 'icp' }],
    [/\bcampaigns?\b/i,                   { type: 'campaign' }],
    [/\b(?:marketing )?assets?\b|\bcollateral\b/i, { type: 'asset' }],
    [/\bsuccess stor(?:y|ies)\b|\bcase stud(?:y|ies)\b/i, { type: 'story' }],
    [/\bblogs?(?: posts?)?\b/i,           { type: 'blog' }],
    [/\bweb ?pages?\b|\bpages?\b/i,       { type: 'webpage' }],
    // sources
    [/\bzendesk\b/i,                      { source: 'zendesk' }],
    [/\bconfluence\b/i,                   { source: 'confluence' }],
    [/\bhubspot\b/i,                      { source: 'hubspot' }],
    [/\bcrawl(?:ed|er)?\b|\bwebsite\b/i,  { source: 'web' }],
    [/\buploaded?\b|\bmanual\b/i,         { source: 'upload' }],
    // products
    [/\bcopilot\b/i,                      { product: 'copilot' }],
    [/\bvoice\b/i,                        { product: 'voice' }],
    [/\bsales\b/i,                        { product: 'sales' }],
    // clients
    [/\bnordwind\b/i,                     { client: 'nordwind' }],
    [/\btavola\b/i,                       { client: 'tavola' }],
    [/\bmeridian\b/i,                     { client: 'meridian' }],
    [/\borbit\b/i,                        { client: 'orbit' }],
    // collections
    [/\bpolic(?:y|ies)\b/i,               { collection: 'policies' }],
    [/\bsupport\b/i,                      { collection: 'support' }],
    [/\bmarketing\b/i,                    { collection: 'marketing' }],
    // tags
    [/\brefunds?\b/i,                     { tag: 'refunds' }],
    [/\bwarrant(?:y|ies)\b/i,             { tag: 'warranty' }],
    [/\bsso\b|\bsingle sign-?on\b/i,      { tag: 'sso' }],
    [/\bgdpr\b|\bresidency\b/i,           { tag: 'gdpr' }],
    [/\bsecurity\b/i,                     { tag: 'security' }],
    [/\bbilling\b|\bproration\b/i,        { tag: 'billing' }],
    [/\bpricing\b/i,                      { tag: 'pricing' }],
    [/\bsla\b/i,                          { tag: 'sla' }],
    [/\bonboarding\b/i,                   { tag: 'onboarding' }],
    [/\benterprise\b/i,                   { tag: 'enterprise' }],
    [/\bchurn\b/i,                        { tag: 'churn' }],
    [/\beu\b|\beurope(?:an)?\b/i,         { tag: 'eu' }],
    // region — the mind map's own axis on ICP and Success Story
    [/\bemea\b/i,                         { region: 'emea' }],
    [/\bapac\b/i,                         { region: 'apac' }],
    [/\bamericas?\b|\bnorth america\b/i,  { region: 'amer' }],
    [/\bglobal\b/i,                       { region: 'global' }],
    /* Services are named in full. The bare words — qa, voice — are already
       tags, and mapping one word onto two axes would AND them together and
       return nothing, which reads as an empty corpus rather than a collision. */
    [/\bquality assurance\b/i,            { service: 'qa' }],
    [/\bvoice operations\b/i,             { service: 'voice' }],
    [/\bsupport delivery\b/i,             { service: 'support' }],
    [/\bcx consulting\b/i,                { service: 'cx' }],
    [/\banalytics service\b/i,            { service: 'analytics' }],
    // audience — the Permission branch
    [/\bclient[- ]facing\b|\bvisible to clients\b|\bfor clients\b/i, { audience: 'clients' }],
    [/\badmins? only\b|\bfor admins?\b/i, { audience: 'admins' }],
    [/\bstakeholders?\b/i,                { audience: 'stakeholders' }],
    // archive
    [/\barchived?\b/i,                    { archived: true }],
    // dates — internal by default, external when the input says so
    [/\b(?:external(?:ly)?|at source|upstream)[^.]{0,16}\b(?:changed|updated)\b/i, { extUpdated: '30d' }],
    [/\bingested\b[^.]{0,16}\b(?:this month|last 30)\b/i, { ingested: '30d' }],
    [/\bingested\b[^.]{0,16}\b(?:this week|last 7)\b/i,   { ingested: '7d' }],
    [/\bingested\b/i,                     { ingested: '90d' }],
    [/\b(?:this|past|last) week\b|\blast 7 days\b/i,      { updated: '7d' }],
    [/\b(?:this|past|last) month\b|\blast 30 days\b/i,    { updated: '30d' }],
    [/\b(?:this|past|last) quarter\b|\blast 90 days\b/i,  { updated: '90d' }],
    [/\b(?:this|past|last) year\b/i,      { updated: '1y' }],
    // ownership
    [/\bmine\b|\bi own\b|\bmy own\b|\bowned by me\b/i,    { mine: true }],
    // status — the one state axis, so the words for it are worth knowing
    [/\bwaiting on (?:me|you)\b|\bnot live\b|\bdrafts?\b/i,  { status: 'draft' }],
    [/\bunused\b|\bnot used\b|\bstale\b|\bforgotten\b/i,      { status: 'unused' }],
    [/\bout of date\b|\boutdated\b|\bbehind\b/i,              { status: 'outdated' }],
    [/\bconflict(?:ing|s)?\b|\bcontradict\w*\b/i,             { status: 'conflicting' }],
    [/\bunowned\b|\bno owner\b|\bownerless\b/i,               { status: 'unowned' }],
    [/\bcurrent\b|\bhealthy\b/i,                              { status: 'current' }]
  ];

  const WRITE_VERB = /^(add|create|new|draft|archive|delete|remove|verify|re-?verify|review|publish|unpublish|expire|reassign|restore|approve|tag|untag|move)\b/i;
  const QUESTION   = /^(what|why|how|when|who|which|can|does|do|is|are|should|where|will)\b|^tell me\b|^explain\b|^summari[sz]e\b/i;

  /* Which route. Order matters: a write is checked first because "archive the
     expired ICPs" also parses as a filter, and running it as one would be a
     write silently reinterpreted as a read. */
  /* ── The fifth route: settings ──

     Settings are part of the surface, so the one input reaches them like it
     reaches everything else. It opens the sheet with the change STAGED rather
     than applied — you see what it will do to the control before it does it,
     which is the same courtesy the commit surfaces pay for bigger changes. */
  const SETTINGS_WORD = /\b(setting|settings|schedule|sync|retention|archiv\w*|grounding|connect|reconnect)\b/i;
  const CADENCE_WORD = [
    [/\bevery 15\b|\bquarter[- ]?hour|\b15 min/i, 'Every 15 minutes'],
    [/\bhourly\b|\bevery hour\b/i, 'Every hour'],
    [/\bevery 6\b|\bsix hours?\b/i, 'Every 6 hours'],
    [/\bdaily\b|\bevery day\b/i, 'Daily'],
    [/\bweekly\b|\bevery week\b/i, 'Weekly'],
    [/\bon demand\b|\bmanual(ly)?\b/i, 'On demand']
  ];

  function parseSettings(s) {
    if (!SETTINGS_WORD.test(s)) return null;
    const lower = s.toLowerCase();

    /* Which thing the sentence is about. A named source or collection wins; the
       word "archiving" or "retention" alone lands on the data sheet. */
    const srcKey = Object.keys(SRC).find((k) => lower.indexOf(SRC[k].label.toLowerCase()) > -1 || lower.indexOf(k) > -1);
    const colKey = Object.keys(COLLECTIONS).find((k) => lower.indexOf(COLLECTIONS[k].toLowerCase()) > -1);

    if (srcKey) {
      const hit = CADENCE_WORD.find(([re]) => re.test(s));
      return { route: 'settings', target: 'source:' + srcKey,
               stage: hit ? { key: 'cadence', value: hit[1] } : null };
    }
    if (colKey) {
      const months = (s.match(/\b(\d+)\s*(month|year)s?\b/i) || [])[0];
      const opt = months && RETAIN_OPTIONS.find(([, l]) => l.toLowerCase().indexOf(months.toLowerCase().replace(/s\b/, '')) > -1);
      return { route: 'settings', target: 'collection:' + colKey,
               stage: opt ? { key: 'retain', value: String(opt[0]) } : null };
    }
    if (/\barchiv|\bretention|\bdelet/i.test(s)) return { route: 'settings', target: 'data', stage: null };
    return null;
  }

  function parseIntent(text) {
    const s = text.trim();
    if (!s) return { route: 'empty' };

    if (WRITE_VERB.test(s)) return { route: 'write', verb: s.match(WRITE_VERB)[1].toLowerCase(), text: s };

    const set = parseSettings(s);
    if (set) return set;

    /* A known object: enough of a title to be a name rather than a keyword
       that happens to appear in one. */
    const lower = s.toLowerCase();
    const hits = LIVE.filter((o) => {
      const t = o.title.toLowerCase();
      return t.indexOf(lower) > -1 || lower.indexOf(t.slice(0, 14)) > -1;
    });
    if (hits.length === 1 && lower.length >= hits[0].title.length * 0.5) {
      return { route: 'object', id: hits[0].id };
    }

    /* Both routes parse filters. A question is not exempt from narrowing the
       surface — that is the whole point of one input serving both. */
    const parsed = parseFilters(s);
    if (QUESTION.test(s) || s.endsWith('?')) {
      /* Free text left over from a question is the question itself, and using
         it as a search term would filter the surface down to whichever
         documents happen to contain the words of the sentence. Drop it; the
         recognised axes are the only part that is a filter. */
      delete parsed.set.q;
      return Object.assign({ route: 'question', text: s }, parsed);
    }
    return Object.assign({ route: 'filter' }, parsed);
  }

  /* Natural language to filter state. Whatever the lexicon does not claim is
     left as free text, so a term the parser has never seen still narrows the
     surface instead of being silently dropped. */
  function parseFilters(s) {
    const set = {};
    let rest = ' ' + s + ' ';
    LEX.forEach(([re, out]) => {
      const m = rest.match(re);
      if (!m) return;
      Object.keys(out).forEach((k) => {
        const v = out[k];
        if (LIST_KEYS.indexOf(k) > -1) { set[k] = set[k] || []; if (set[k].indexOf(v) === -1) set[k].push(v); }
        else set[k] = v;
      });
      rest = rest.replace(re, ' ');
    });
    /* Words the lexicon already consumed the meaning of, plus the connective
       tissue around them. Left in, they become a free-text filter for a word
       nothing contains, and an empty result reads as an empty corpus. */
    const leftover = rest.replace(
      /\b(?:show|find|get|list|give|all|any|every|everything|anything|the|a|an|me|my|our|we|us|from|with|for|in|on|at|to|by|and|or|of|that|about|regarding|concerning|is|are|was|were|be|been|has|have|only|just|please|documents?|docs?|objects?|items?|content|stuff|services?|regions?|audiences?|updated?|changed?|ingested?|created?|modified|edited|synced?|review(?:ed)?|last|past|recent(?:ly)?|since|before|after|days?|weeks?|months?|years?|quarters?)\b/gi, ' ')
                         .replace(/[^\w\s-]/g, ' ').replace(/\s+/g, ' ').trim();
    if (leftover.length > 2) set.q = leftover;
    return { set: set, matched: Object.keys(set).length > 0 };
  }

  /* AiMY's reading of what you typed, in the vocabulary of the filters. Shown
     because a surface that rearranged itself without saying what it understood
     is indistinguishable from one that misunderstood. */
  const READ_LABEL = {
    type: 'Type', tag: 'Tag', source: 'Source', client: 'Client', product: 'Product',
    collection: 'Collection', trust: 'Trust', work: 'Work state', q: 'Text',
    region: 'Region', service: 'Service', audience: 'Audience', prop: 'Property',
    updated: 'Updated', ingested: 'Ingested', extCreated: 'Created at source',
    extUpdated: 'Changed at source', mine: 'Owner', ids: 'Documents',
    archived: 'Archive'
  };
  const VALUE_LABEL = {
    type: (v) => TYPES[v] ? TYPES[v].label : v,
    source: (v) => SRC[v] ? SRC[v].label : v,
    client: (v) => CLIENTS[v] || v,
    product: (v) => PRODUCTS[v] || v,
    collection: (v) => COLLECTIONS[v] || v,
    status: (v) => STATUS[v] ? STATUS[v].label : v,
    work: (v) => WORK_LABEL[v] || v,
    region: (v) => REGIONS[v] || v,
    service: (v) => SERVICES[v] || v,
    audience: (v) => AUDIENCE[v] || v,
    tag: (v) => v,
    mine: () => USER.name,
    archived: () => 'Archived only'
  };
  function valueLabel(key, v) {
    if (DATE_KEYS.indexOf(key) > -1) return rangeLabel(v);
    const f = VALUE_LABEL[key];
    return f ? f(v) : String(v);
  }

  /* ═══════════════════════════════════════════════
     THE CHIP BAR — the URL, made removable

     Filter chips are `.ctx-chip`, the design system's "what the prompt can
     see" primitive. That is exactly what a filter is here: the set AiMY is
     looking at when it answers. One vocabulary for both.
  ═══════════════════════════════════════════════ */
  /* Collections and sources have something to say about themselves, so their
     chip's label opens that conversation. The × still just removes the filter.
     This is what replaced the panel: the entry point costs no chrome. */
  const TALKATIVE = ['collection', 'source'];

  function chip(key, value, label) {
    const talks = TALKATIVE.indexOf(key) > -1;
    return `<span class="ctx-chip${talks ? ' is-talkative' : ''}" data-chip="${esc(key)}" data-chip-val="${esc(value)}">
      <span class="ctx-ico">${ICO.tag.replace('<svg', '<svg width="10" height="10"')}</span>
      ${talks
        ? `<button class="ctx-ask" data-settings="${esc(key)}:${esc(value)}"
             title="Settings for ${esc(label)}"><span class="ctx-key">${esc(READ_LABEL[key] || key)}</span>${esc(label)}</button>`
        : `<span class="ctx-key">${esc(READ_LABEL[key] || key)}</span>${esc(label)}`}
      <button aria-label="Remove ${esc(READ_LABEL[key] || key)} ${esc(label)}" data-chip-drop>&times;</button></span>`;
  }

  /* Chips carry only what a dropdown cannot say. Everything a control can show,
     the control shows — a chip and a dropdown never state the same fact. */
  const DD_KEYS = ['type', 'status', 'source', 'updated', 'collection', 'product',
                   'client', 'region', 'service', 'audience'];

  function activeChips(st) {
    const out = [];
    if (st.ids.length) out.push(chip('ids', '', st.ids.length + ' from an answer'));
    LIST_KEYS.forEach((k) => {
      if (k === 'ids') return;
      /* One value on a dropdown axis is already on screen. Two or more is not —
         the control is single-select and can only show the first. */
      if (DD_KEYS.indexOf(k) > -1 && st[k].length < 2) return;
      (st[k] || []).forEach((v) => out.push(chip(k, v, valueLabel(k, v))));
    });
    /* One date axis is on the control. If a link or an agent set more than one,
       the rest become chips — a control that can only name one must not be the
       reason the others are invisible. */
    const shown = activeDateKey(st);
    DATE_KEYS.forEach((k) => {
      if (st[k] && k !== shown) out.push(chip(k, st[k], valueLabel(k, st[k])));
    });
    if (st.prop) out.push(chip('prop', st.prop, st.prop.replace(':', ' = ')));
    if (st.q) out.push(chip('q', st.q, '“' + st.q + '”'));
    return out;
  }

  function renderChips(st) {
    const host = $('#chipBar');
    if (!host) return;
    const chips = activeChips(st);
    if (!chips.length) { host.innerHTML = ''; return; }
    host.innerHTML = `<div class="chip-bar"><div class="ctx-chips">${chips.join('')}</div></div>`;
  }

  /* ═══════════════════════════════════════════════
     THE FILTER ROW

     The filters are controls, not just an outcome of typing. Someone who does
     not know the vocabulary can still narrow the surface, and someone who does
     can see what the vocabulary contains.

     This is also how AiMY reports what it understood. Typing "expired ICPs in
     emea" lights up Type, Status and Region — a prose restatement underneath
     was only ever needed because the controls were invisible.

     `.v2-dropdown` is the system's only select control and carries the whole
     keyboard model. It is strictly single-select and its change event only
     reports the label, so the machine value rides on `data-slug` and is read
     off the selected option rather than parsed back out of the label.
  ═══════════════════════════════════════════════ */
  const opts = (obj, order) => (order || Object.keys(obj)).map((k) => [k, typeof obj[k] === 'string' ? obj[k] : obj[k].label]);

  /* The order is a hierarchy, not a list: where a document lives, who it is
     for, which product it serves — then what it is and what state it is in.
     Type and Status were leading, which put the system's vocabulary in front of
     the reader's. */
  const PRIMARY_FILTERS = [
    { key: 'collection', label: 'Collection', list: () => opts(COLLECTIONS) },
    { key: 'client',     label: 'Client',     list: () => opts(CLIENTS) },
    { key: 'product',    label: 'Product',    list: () => opts(PRODUCTS) },
    { key: 'type',       label: 'Type',       list: () => opts(TYPES) },
    { key: 'status',     label: 'Status',     list: () => opts(STATUS) }
  ];
  const MORE_FILTERS = [
    { key: 'source',   label: 'Source',     list: () => opts(SRC) },
    { key: 'region',   label: 'Region',     list: () => opts(REGIONS) },
    { key: 'service',  label: 'Service',    list: () => opts(SERVICES) },
    { key: 'audience', label: 'Audience',   list: () => opts(AUDIENCE) },
    { key: 'work',     label: 'Work state', list: () => opts(WORK_LABEL) },
    { key: 'archived', label: 'Archive',    list: () => [['1', 'Archived']] }
  ];

  /* The current value of an axis, whatever shape it is stored in. */
  function filterValue(st, key) {
    if (FLAG_KEYS.indexOf(key) > -1) return st[key] ? '1' : '';
    if (DATE_KEYS.indexOf(key) > -1) return st[key];
    return (st[key] || [])[0] || '';
  }

  /* ═══════════════════════════════════════════════
     DATE RANGE — the design system's .cal, given two ends

     The library ships `.cal` as a single-date month calendar: head with two
     nav buttons, a seven-column grid, and `.muted` / `.today` / `.selected`
     days. Every one of those parts is used here unchanged. What it does not
     ship is a RANGE — there is no start, no end, and nothing to draw the days
     between — so those three states are added as a product extension and
     recorded in GAPS.md rather than quietly forked.

     The trigger is the same `.v2-dropdown-btn` the other filters use. A filter
     row where one control looks foreign is worse than one that is slightly
     less literal about what opens underneath it.

     Both shapes live in the same URL key: `updated=30d` is a rolling window and
     `updated=2026-06-01..2026-07-30` is a fixed range. The tokens stay because
     chat writes them ("updated this year") and because a rolling window is a
     different question from a fixed one — "the last 7 days" keeps meaning the
     last 7 days tomorrow, and a range does not.
  ═══════════════════════════════════════════════ */
  const RANGE_RE = /^(\d{4}-\d{2}-\d{2})\.\.(\d{4}-\d{2}-\d{2})$/;
  const iso = (d) => d.toISOString().slice(0, 10);
  /* Everything on an object is stored as days-before-today, so a date coming
     out of the calendar is converted once, here, and never again. */
  const offsetOf = (isoStr) => Math.round((TODAY.getTime() - new Date(isoStr + 'T00:00:00Z').getTime()) / dayMs);

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const rangeLabel = (v) => {
    const m = RANGE_RE.exec(v || '');
    if (!m) return WINDOW_LABEL[v] || v;
    const a = new Date(m[1] + 'T00:00:00Z'), b = new Date(m[2] + 'T00:00:00Z');
    const opt = { day: 'numeric', month: 'short', timeZone: 'UTC' };
    const sameYear = a.getUTCFullYear() === b.getUTCFullYear();
    return a.toLocaleDateString('en-GB', opt) + ' – ' +
      b.toLocaleDateString('en-GB', sameYear ? opt : Object.assign({ year: 'numeric' }, opt));
  };

  /* Which calendar is open, which month it is showing, and the first end of a
     range that has been started but not finished. View state, so none of it is
     in the URL — a half-picked range is not a thing to link to. */
  let calOpen = null;
  let calMonth = null;
  let calPick = null;

  /* Four axes, one control. Four separate pickers put four pieces of furniture
     on the row to ask one question — WHEN — and only ever answered it about one
     of them at a time anyway. The axis is a choice inside the control now, and
     choosing a different one moves the value rather than adding a second
     filter. All four keys stay in the URL, so a link or an agent can still set
     any of them; if a link sets more than one, the extras show as chips rather
     than disappearing behind a control that can only name one. */
  const DATE_FILTERS = [
    { key: 'updated',    label: 'Updated',    short: 'Updated' },
    { key: 'ingested',   label: 'Ingested',   short: 'Ingested' },
    { key: 'extCreated', label: 'Created at source', short: 'Created' },
    { key: 'extUpdated', label: 'Changed at source', short: 'Changed' }
  ];

  /* Which axis the control is editing. Defaults to whichever one already
     carries a value, so opening it lands on what you can see. */
  let dateField = null;
  const activeDateKey = (st) => (DATE_FILTERS.find((f) => st[f.key]) || DATE_FILTERS[0]).key;

  function calGrid(key, cur) {
    const m = RANGE_RE.exec(cur || '');
    const startOff = m ? offsetOf(m[2]) : null;          // newer end = smaller offset
    const endOff   = m ? offsetOf(m[1]) : null;          // older end = larger offset
    const pickOff  = calPick !== null ? calPick : null;

    const view = calMonth || new Date(Date.UTC(TODAY.getUTCFullYear(), TODAY.getUTCMonth(), 1));
    const y = view.getUTCFullYear(), mo = view.getUTCMonth();
    const first = new Date(Date.UTC(y, mo, 1));
    const lead = first.getUTCDay();
    const days = new Date(Date.UTC(y, mo + 1, 0)).getUTCDate();
    const prevDays = new Date(Date.UTC(y, mo, 0)).getUTCDate();

    const cells = [];
    for (let i = lead - 1; i >= 0; i--) cells.push({ n: prevDays - i, muted: true, d: new Date(Date.UTC(y, mo - 1, prevDays - i)) });
    for (let i = 1; i <= days; i++)     cells.push({ n: i, muted: false, d: new Date(Date.UTC(y, mo, i)) });
    while (cells.length % 7) { const i = cells.length - lead - days + 1; cells.push({ n: i, muted: true, d: new Date(Date.UTC(y, mo + 1, i)) }); }

    return `<div class="cal">
      <div class="cal-head">
        <button class="cal-nav" type="button" data-cal-nav="-1" aria-label="Previous month">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></button>
        <div class="cal-title">${esc(MONTHS[mo])} ${y}</div>
        <button class="cal-nav" type="button" data-cal-nav="1" aria-label="Next month">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></button>
      </div>
      <div class="cal-grid">
        ${DOW.map((d) => `<div class="cal-dow">${d}</div>`).join('')}
        ${cells.map((c) => {
          const off = Math.round((TODAY.getTime() - c.d.getTime()) / dayMs);
          const future = off < 0;
          const isStart = off === startOff, isEnd = off === endOff;
          const between = startOff !== null && off < endOff && off > startOff;
          const isPick = pickOff !== null && off === pickOff;
          const cls = ['cal-day']
            .concat(c.muted ? ['muted'] : [])
            .concat(off === 0 ? ['today'] : [])
            .concat(isStart || isEnd || isPick ? ['selected'] : [])
            .concat(isEnd && startOff !== endOff ? ['range-start'] : [])
            .concat(isStart && startOff !== endOff ? ['range-end'] : [])
            .concat(between ? ['in-range'] : []);
          /* Nothing here has a date in the future, so offering one would be a
             control that can only ever return nothing. */
          return `<button class="${cls.join(' ')}" type="button" ${future ? 'disabled' : ''}
            data-cal-day="${iso(c.d)}" aria-label="${esc(fmtDate(off))}">${c.n}</button>`;
        }).join('')}
      </div>
      <div class="cal-hint">${calPick !== null
        ? 'Pick the second date.'
        : 'Pick two dates for a range.'}</div>
    </div>`;
  }

  function dateFilter(st) {
    const key = dateField || activeDateKey(st);
    const c = DATE_FILTERS.find((f) => f.key === key);
    const cur = st[key] || '';
    const open = calOpen === 'date';
    /* WINDOW_LABEL reads mid-sentence elsewhere ("updated in the last 30 days"),
       so it is sentence-cased here and nowhere else. */
    const raw = cur ? rangeLabel(cur) : '';
    const label = cur
      ? c.short + ' · ' + raw.charAt(0).toUpperCase() + raw.slice(1)
      : 'Any date';
    /* NOT .v2-dropdown-btn. In this design system that class carries behaviour,
       not just looks: aimy-ds.js binds every one of them on the page and then
       calls closest('.v2-dropdown'), which is null for anything that is not a
       listbox — it threw on the first click. The trigger is styled from the
       same tokens instead. Recorded in GAPS.md. */
    return `<div class="k-date${open ? ' is-open' : ''}" data-date-key="${key}">
      <button class="k-date-btn${cur ? ' active-filter' : ''}" type="button"
              aria-haspopup="dialog" aria-expanded="${open}" aria-label="${esc(c.label)}">
        ${ICO.clock.replace('<svg', '<svg class="k-date-ico" width="12" height="12"')}
        <span class="dd-label-text">${esc(label)}</span>
        <svg viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.8"
             stroke-linecap="round" stroke-linejoin="round"><polyline points="1 1 5 5 9 1"/></svg>
      </button>
      ${open ? `<div class="k-date-panel" role="dialog" aria-label="Date range">
        <div class="k-date-field">
          <span class="k-date-field-label">Which date</span>
          <div class="seg">
            ${DATE_FILTERS.map((f) => `<button class="seg-btn${f.key === key ? ' active' : ''}" type="button"
              data-date-field="${f.key}">${esc(f.short)}</button>`).join('')}
          </div>
        </div>
        <div class="k-date-body">
        <div class="k-date-quick">
          ${[['', 'Any time']].concat(Object.keys(WINDOW_LABEL).map((w) => [w, WINDOW_LABEL[w]]))
            .map(([slug, text]) => `<button class="k-date-q${slug === cur ? ' is-on' : ''}" type="button"
              data-date-set="${slug}">${esc(text.charAt(0).toUpperCase() + text.slice(1))}</button>`).join('')}
        </div>
        ${calGrid(key, cur)}
        </div>
      </div>` : ''}
    </div>`;
  }

  function dropdown(c, st) {
    const cur = c.current ? c.current(st) : filterValue(st, c.key);
    const extra = (LIST_KEYS.indexOf(c.key) > -1 ? st[c.key].length : 1) - 1;
    /* With more than one value the control cannot name them — it is
       single-select — so it says how many and lets the chips do the naming.
       Naming the first as well would print the same value twice. */
    const label = !cur ? c.label
      : extra > 0 ? c.label + ' · ' + (extra + 1)
      : (c.valueLabel ? c.valueLabel(cur) : valueLabel(c.key, cur));
    const rows = [['', c.label, c.first || 'All']].concat(c.list().map(([slug, text]) => [slug, text, text]));
    return `<div class="v2-dropdown k-filter" data-filter-key="${c.key}">
      <button class="v2-dropdown-btn${cur ? ' active-filter' : ''}" type="button"
              aria-haspopup="listbox" aria-expanded="false" aria-label="${esc(c.label)}">
        <span class="dd-label-text">${esc(label)}</span>
        <svg viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.8"
             stroke-linecap="round" stroke-linejoin="round"><polyline points="1 1 5 5 9 1"/></svg>
      </button>
      <div class="v2-dropdown-panel" role="listbox">
        ${rows.length > 6 ? `<div class="dd-search">
          ${ICO.search.replace('<svg', '<svg width="12" height="12"')}
          <input type="text" placeholder="Search ${esc(c.label.toLowerCase())}" aria-label="Search ${esc(c.label)}"
                 data-dd-search spellcheck="false" autocomplete="off">
        </div>` : ''}
        ${rows.map(([slug, value, text]) => {
          const on = slug === cur;
          return `<div class="v2-dropdown-option${on ? ' selected' : ''}" role="option"
            aria-selected="${on}" data-value="${esc(value)}" data-slug="${esc(slug)}">${esc(text)}</div>`;
        }).join('')}
        <div class="dd-none" hidden>Nothing matches</div>
      </div>
    </div>`;
  }

  let moreOpen = false;

  function renderFilters(st) {
    const host = $('#filterBar');
    if (!host) return;
    const anyMore = MORE_FILTERS.some((c) => filterValue(st, c.key));
    const open = moreOpen || anyMore;
    const dirty = !isComposed(st);

    host.innerHTML = `
      <div class="filter-row">
        ${PRIMARY_FILTERS.map((c) => dropdown(c, st)).join('')}
        ${dateFilter(st)}
        <button class="k-toggle${st.mine ? ' is-on' : ''}" data-toggle-mine
                aria-pressed="${st.mine ? 'true' : 'false'}">Mine</button>
        <button class="k-more${open ? ' is-open' : ''}" data-more aria-expanded="${open}">
          More${anyMore ? ` <span class="k-more-n">${MORE_FILTERS.filter((c) => filterValue(st, c.key)).length}</span>` : ''}
        </button>
        <span class="filter-row-end">
          ${dirty ? '<button class="k-clear" data-clear-all>Clear</button>' : ''}
        </span>
      </div>
      ${open ? `<div class="filter-row is-more">${MORE_FILTERS.map((c) => dropdown(c, st)).join('')}</div>` : ''}`;
  }

  /* ═══════════════════════════════════════════════
     THE BRIEFING

     What changed since you were last here, in sentences. Not a count of the
     current state — the Status filter shows that, and repeating it in the rail
     would be the same fact twice. Not a timestamped log either: a list of
     events is work to read, and the point of a briefing is that it has already
     been read for you.

     Each entry is one thing that happened and one thing to do about it.
  ═══════════════════════════════════════════════ */
  const LAST_VISIT = 4;                     // days ago; a session fixture
  const VISIT_LABEL = dateOf(LAST_VISIT).toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' });

  function sinceLastVisit() {
    const out = [];
    const since = (o) => o.upd <= LAST_VISIT;

    const failing = Object.keys(SRC).filter((k) => SRC[k].health === 'failed');
    if (failing.length) {
      const stale = LIVE.filter((o) => failing.indexOf(o.src) > -1).length;
      out.push({
        id: 'source', tone: 'err',
        text: `${failing.map((k) => SRC[k].label).join(' and ')} stopped syncing. ${stale} documents have not updated since.`,
        action: 'Show them', mode: 'direct', href: { source: failing }, ask: ['source', failing[0]]
      });
    }

    const outdated = LIVE.filter((o) => o.status === 'outdated');
    if (outdated.length) {
      out.push({
        id: 'outdated', tone: 'err',
        text: `${outdated.length} documents are behind their source. Answers still use them.`,
        action: 'Show them', mode: 'direct', href: { status: ['outdated'] }
      });
    }

    /* The point of the whole model: a document nobody has used in three months
       is either dead weight or a gap in how people find things. Either way it
       is worth a look, and nothing else on the surface would have said so. */
    const unused = LIVE.filter((o) => o.status === 'unused');
    if (unused.length) {
      out.push({
        id: 'unused', tone: 'warn',
        text: `${unused.length} documents have not been used in three months.`,
        action: 'Show them', mode: 'direct', href: { status: ['unused'] }
      });
    }

    const drafted = LIVE.filter((o) => o.status === 'draft');
    if (drafted.length) {
      out.push({
        id: 'drafts', tone: 'warn',
        text: `AiMY drafted ${drafted.length} documents. None of them is live.`,
        action: 'Open them', mode: 'review', href: { status: ['draft'] }
      });
    }

    out.push({
      id: 'gap', tone: 'warn',
      text: 'Three questions came in that nothing here answers. Data residency in APAC leads.',
      /* No filter target: a gap is the absence of a document. */
      action: 'Draft one', mode: 'prompt',
      prompt: 'Draft an article covering data residency for APAC enterprise contracts'
    });

    const last = byId(USER.recent[0]);
    if (last) {
      out.push({
        id: 'resume', tone: 'ok',
        text: `You were last reading ${last.title}.`,
        action: 'Reopen', mode: 'direct', doc: last.id
      });
    }
    return out;
  }

  function renderBrief(st) {
    const host = $('#brief');
    if (!host) return;

    host.innerHTML = `
      <!-- No identity block. Who you are is in the topnav, and the counts are
           what the Status filter is for — the rail is what changed since you
           were last here, and nothing else. -->
      <div class="brief-section-label">Since ${esc(VISIT_LABEL)}</div>
      <!-- Capped. A briefing that lists everything is a log, and a log is work
           to read — which is the thing a briefing exists to have done for you. -->
      <div class="brief-list">${sinceLastVisit().slice(0, 5).map((b) => `
        <div class="brief-entry is-${b.tone}">
          <p class="brief-text">${esc(b.text)}</p>
          <button class="brief-go" data-entry-mode="${b.mode}" ${b.doc
            ? `data-open-doc="${esc(b.doc)}"`
            : b.href ? `data-brief-filter="${esc(b.id)}"` : `data-brief-prompt="${esc(b.prompt)}"`}>${esc(b.action)}</button>
        </div>`).join('')}</div>

      ${lastFilter && isComposed(st)
        ? `<button class="brief-resume" data-resume>Resume your last filter</button>` : ''}

      <!-- Where the settings are. Not a destination: each row opens the
           conversation that already carries the controls, which is what stopped
           schedules, retention, grounding and deletion from being reachable
           only by happening to filter to exactly one collection or source. -->
      <div class="brief-section-label">Sources &amp; data</div>
      <div class="rail-set">
        ${Object.keys(SRC).filter((k) => k !== 'upload').map((k) => {
          const src = SRC[k];
          const ok = src.health === 'ok';
          /* The row states its condition and carries the fix. A source that is
             not syncing is not a fact to go and read about — it is one button,
             and pressing it changes this row. The name still opens the
             conversation, which is where the settings that need a form live. */
          return `<div class="rail-set-row${ok ? '' : ' is-bad'}">
            <span class="status-dot ${ok ? 'sd-ok' : src.health === 'warn' ? 'sd-warn' : 'sd-err'}"></span>
            <button class="rail-set-name" data-settings="source:${k}">${esc(src.label)}</button>
            ${ok
              ? `<span class="rail-set-note">${esc(src.queued ? 'sync queued'
                    : src.last === 0 ? 'synced today' : 'synced ' + src.last + 'd ago')}</span>`
              : `<button class="rail-set-do" data-reconnect="${k}">${src.health === 'warn' ? 'Re-run' : 'Reconnect'}</button>`}
          </div>`;
        }).join('')}
        <div class="rail-set-row">
          <button class="rail-set-name" data-settings="collection:${USER.collections[0]}">Collections</button>
          <span class="rail-set-note">${USER.collections.length}</span>
        </div>
        <div class="rail-set-row">
          <button class="rail-set-name" data-settings="data">Archiving &amp; deleting</button>
          <span class="rail-set-note">${CORPUS.filter((o) => o.arch).length} archived</span>
        </div>
      </div>`;
  }


  /* The last filter the user ran, so the rail can offer it back. Session only:
     a resume cue that survives a machine restart is claiming a memory the
     prototype does not have. */
  let lastFilter = null;
  try { lastFilter = sessionStorage.getItem('aimy-k-last') || null; } catch (e) {}
  function rememberFilter() {
    const s = location.search;
    if (!s) return;
    lastFilter = s;
    try { sessionStorage.setItem('aimy-k-last', s); } catch (e) {}
  }

  /* ═══════════════════════════════════════════════
     TYPE CARDS — eight templates over one fixed governance row

     Type changes what a reader needs to see first, so each type renders its
     own body. What never moves is the row carrying title, type, trust state,
     work state, owner and last verified: someone scanning mixed results should
     not have to relearn where trust lives per type.
  ═══════════════════════════════════════════════ */
  const approvalPill = (state) => state === 'approved'
    ? `<span class="tc-approval is-approved">${ICO.check.replace('<svg', '<svg width="11" height="11"')}Approved</span>`
    : `<span class="tc-approval is-pending">${ICO.clock.replace('<svg', '<svg width="11" height="11"')}Awaiting approval</span>`;

  const fieldRows = (pairs) => `<div class="tc-fields">${pairs
    .map(([l, v]) => `<div class="tc-field"><span class="tc-field-label">${esc(l)}</span><span class="tc-field-val">${v}</span></div>`).join('')}</div>`;

  const TEMPLATE = {
    article:  (o) => fieldRows([['Applies to', esc(o.x.applies)], ['Collection', esc(COLLECTIONS[o.col])]]),
    ticket:   (o) => fieldRows([['Requester', esc(o.x.requester)],
                                ['Status', `<span class="tag ${o.x.status === 'Resolved' ? 'tag-ok' : 'tag-warn'}">${esc(o.x.status)}</span>`],
                                ['Resolution', esc(o.x.resolution)]]),
    icp:      (o) => fieldRows([['Segment', esc(o.x.segment)]]) +
                     `<ul class="tc-list">${o.x.fit.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` +
                     `<ul class="tc-list is-negative">${o.x.dis.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`,
    campaign: (o) => fieldRows([['Objective', esc(o.x.objective)], ['Window', `<strong>${esc(o.x.window)}</strong>`],
                                ['Assets', esc(o.x.assets)]]),
    asset:    (o) => fieldRows([['Format', esc(o.x.format)], ['Usage', esc(o.x.usage)],
                                ['Approval', approvalPill(o.x.approval)]]),
    story:    (o) => fieldRows([['Customer', esc(o.x.customer)], ['Outcome', `<strong>${esc(o.x.outcome)}</strong>`],
                                ['Approval', approvalPill(o.x.approval)]]) +
                     `<div class="tc-quote">“${esc(o.x.quote)}”</div>`,
    blog:     (o) => fieldRows([['State', esc(o.x.pub)], ['Canonical', `<span class="tc-mono">${esc(o.x.canonical)}</span>`],
                                ['Author', esc(o.x.author)]]),
    webpage:  (o) => fieldRows([['Source URL', `<span class="tc-mono">${esc(o.x.url)}</span>`], ['Last crawl', esc(o.x.crawl)],
                                ['Changes', `<span class="tag ${/^None/.test(o.x.change) ? 'tag-ok' : 'tag-warn'}">${esc(o.x.change)}</span>`]])
  };

  /* ── The card ──

     Two labelled facts per type, chosen as the two a reader needs before they
     decide whether to open it. A Ticket without its resolution is useless; an
     ICP without its region and services is not an ICP; a Success Story without
     its client is an anecdote. The full record is one click away in the modal,
     so the card's job is to be scannable, not complete. */
  const CARD_FACTS = {
    article:  (o) => [['Applies to', esc(o.x.applies)]],
    ticket:   (o) => [['Requester', esc(o.x.requester)],
                      ['Status', `<span class="tag ${o.x.status === 'Resolved' ? 'tag-ok' : 'tag-warn'}">${esc(o.x.status)}</span>`]],
    icp:      (o) => [['Region', esc(REGIONS[o.region])],
                      ['Services', esc(o.services.map((s) => SERVICES[s]).join(' · ')) || '—']],
    campaign: (o) => [['Window', esc(o.x.window)], ['Objective', esc(o.x.objective)]],
    asset:    (o) => [['Usage', esc(o.x.usage)], ['Approval', approvalPill(o.x.approval)]],
    story:    (o) => [['Client', esc(CLIENTS[o.client] || '—')], ['Outcome', `<strong>${esc(o.x.outcome)}</strong>`]],
    blog:     (o) => [['State', esc(o.x.pub)], ['Author', esc(o.x.author)]],
    webpage:  (o) => [['Last crawl', esc(o.x.crawl)],
                      ['Changes', `<span class="tag ${/^None/.test(o.x.change) ? 'tag-ok' : 'tag-warn'}">${esc(o.x.change)}</span>`]]
  };

  /* One classified action per card, chosen by what the object actually needs. */
  /* One action per card, and it is the status's exit — so the card offers the
     thing the badge implies rather than a second vocabulary of its own. */
  function cardAction(o) {
    if (o.arch)              return ['review', 'Restore', 'restore'];
    if (o.work === 'failed') return ['direct', 'Check the source', 'source'];
    /* An exit has to lead somewhere. "Go to successor" on a document with no
       replacement recorded went nowhere and said so in a toast, which is the
       button admitting it should not have been offered. */
    if (o.status === 'superseded' && !(RELATED[o.id] || {}).supersededBy)
      return ['investigate', 'Find what replaced it', 'findsuccessor'];
    /* Re-syncing a source that is not connected queues into nothing. The
       remedy for an out-of-date document behind a dead source is the source. */
    if (o.status === 'outdated' && SRC[o.src].health !== 'ok')
      return ['review', 'Reconnect ' + SRC[o.src].label, 'reconnect'];
    return STATUS_EXIT[o.status] || ['direct', 'Open', 'open'];
  }

  /* One footer, not two. The library's card ends with a bordered, tinted
     `.tc-gov` strip followed by a bordered `.tc-action` strip holding a
     full-width button — two rules and a banner where one row does the job. */
  function typeCard(o, compact) {
    const t = TYPES[o.t];
    const act = cardAction(o);
    const facts = CARD_FACTS[o.t](o).concat(compact ? [] : [['Last used', esc(usedLabel(o))]]);
    /* The whole card opens the document. The title stays a real button so the
       keyboard has one focusable target that announces which document it is —
       wrapping the card itself in a button would swallow the action inside it,
       and nested buttons are invalid besides. */
    return `<div class="type-card${compact ? ' is-compact' : ''}" data-obj="${o.id}" data-status="${o.status}"
         data-work-state="${o.work}" data-card-open="${o.id}">
      <div class="tc-head">
        <span class="tc-type">${t.ico}${esc(t.label)}</span>
        ${statusBadge(o.status, o.statusSet ? 'Set by ' + esc(o.statusBy || USER.owner) : '')}
      </div>
      <button class="tc-title-btn" data-open-doc="${o.id}"><span class="tc-title">${esc(o.title)}</span></button>
      ${compact ? '' : `<div class="tc-fields">${facts.map(([l, v]) =>
        `<div class="tc-field"><span class="tc-field-label">${esc(l)}</span><span class="tc-field-val">${v}</span></div>`).join('')}</div>`}
      <div class="tc-foot">
        <span class="tc-foot-who">${esc(o.owner)}</span>
        <span class="tc-foot-act">${entryAction(act[0], act[1], `data-card-act="${o.id}"`)}</span>
      </div>
    </div>`;
  }

  /* ═══════════════════════════════════════════════
     THE GRID

     The result meta line carries the count, the scope it was drawn from, and
     how many of the results are excluded from retrieval. That last number is
     the surface-level equivalent of the answer's trust disclosure: it is the
     difference between "there is nothing on this" and "there is something on
     this and AiMY may not use it".
  ═══════════════════════════════════════════════ */

  /* Collections and sources have something to say about themselves. When the
     filter names exactly one, the result line offers it — a chip would not,
     because a single value on a dropdown axis renders as the lit dropdown and
     no chip at all, which is precisely the case that needs the way in. */
  function talkativeAxis(st) {
    const named = ['collection', 'source'].filter((k) => st[k].length === 1);
    const others = ['type', 'product', 'client', 'region', 'audience', 'status'].some((k) => st[k].length);
    if (named.length !== 1 || others || st.ids.length) return null;
    return { key: named[0], value: st[named[0]][0] };
  }

  function resultMeta(st, list, composed) {
    const excluded = list.filter((o) => STATUS[o.status].excluded).length;
    const unowned  = list.filter((o) => o.owner === 'Unassigned').length;
    const axis = talkativeAxis(st);
    const axisLabel = axis && (axis.key === 'collection' ? COLLECTIONS[axis.value] : SRC[axis.value].label);
    return `<div class="rm">
      <div class="rm-main">
        <span class="rm-count">${list.length}</span>
        <span class="rm-word">document${list.length === 1 ? '' : 's'}</span>
        ${composed
          ? `<span class="rm-note">your work</span>`
          : axis
            ? `<span class="rm-note">in <button class="rm-ask" data-settings="${axis.key}:${axis.value}">${esc(axisLabel)}</button></span>`
            : `<span class="rm-note">of ${LIVE.length}</span>`}
      </div>
      <div class="rm-end">
        <!-- Two readings of one set. The library's segmented control, so it
             reads as a view switch rather than as an action. -->
        <div class="seg rm-views" role="group" aria-label="How to show these">
          ${VIEWS.map(([v, label]) => `<button class="seg-btn${(st.view || 'grid') === v ? ' active' : ''}"
            type="button" data-view="${v}" aria-pressed="${(st.view || 'grid') === v}">
            ${(v === 'tree' ? ICO.folder : ICO.grid).replace('<svg', '<svg width="12" height="12"')}${esc(label)}</button>`).join('')}
        </div>
        ${entryAction('direct', 'New document', 'data-new-doc="1"', ICO.plus)}
      </div>
      ${excluded || unowned ? `<div class="rm-disclosure">
        ${excluded ? `<span class="rm-flag is-err">${ICO.slash.replace('<svg', '<svg width="12" height="12"')}
          <strong>${excluded}</strong> not used in answers</span>` : ''}
        ${unowned ? `<span class="rm-flag is-warn">${ICO.question.replace('<svg', '<svg width="12" height="12"')}
          <strong>${unowned}</strong> unowned</span>` : ''}
      </div>` : ''}
    </div>`;
  }

  /* ═══════════════════════════════════════════════
     THE TREE — the same set, arranged rather than listed

     A second view, not a second product. Whatever the filters say is what the
     tree contains, so switching between grid and tree keeps your place and
     changes only the shape of what you are looking at.

     Collection → Type → document. That order because a collection is a place
     someone owns and a type is what a thing is; the reverse would file the
     same policy under Article in four different collections and lose the one
     fact — who is responsible for this shelf — that a folder view is for.

     Every branch is a filter link. Opening Policies and clicking it narrows the
     surface to Policies; the tree and the grid are two readings of one URL. It
     is built on the library's `.tree`, which is native <details>, so it needs
     no state of its own and survives a re-render open.
  ═══════════════════════════════════════════════ */
  function renderTree(st, list) {
    const byCol = {};
    list.forEach((o) => { (byCol[o.col] = byCol[o.col] || []).push(o); });
    /* The user's own collections first, in their order, then anything else the
       filter dragged in. */
    const cols = USER.collections.filter((c) => byCol[c])
      .concat(Object.keys(byCol).filter((c) => USER.collections.indexOf(c) < 0));

    return `<div class="tree ws-tree">
      ${cols.map((col) => {
        const docs = byCol[col];
        const byType = {};
        docs.forEach((o) => { (byType[o.t] = byType[o.t] || []).push(o); });
        const needs = docs.filter((o) => STATUS[o.status].tone !== 'verified').length;
        return `<details class="ws-tree-col" ${cols.length <= 2 ? 'open' : ''}>
          <summary>
            <svg class="tree-chev" width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>
            ${ICO.folder ? ICO.folder.replace('<svg', '<svg width="13" height="13"') : ''}
            <span class="ws-tree-name">${esc(COLLECTIONS[col])}</span>
            <span class="ws-tree-n">${docs.length}</span>
            ${needs ? `<span class="ws-tree-needs" title="${needs} need a person">${needs}</span>` : ''}
            <button class="ws-tree-only" data-open-axis="collection:${col}"
                    title="Show only ${esc(COLLECTIONS[col])}">Only this</button>
          </summary>
          <div class="tree-children">
            ${Object.keys(byType).map((t) => `<details class="ws-tree-type" open>
              <summary>
                <svg class="tree-chev" width="11" height="11" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>
                ${TYPES[t].ico.replace('<svg', '<svg width="12" height="12"')}
                <span class="ws-tree-name">${esc(TYPES[t].label)}</span>
                <span class="ws-tree-n">${byType[t].length}</span>
              </summary>
              <div class="tree-children">
                ${byType[t].map((o) => `<button class="tree-leaf ws-tree-doc" data-card-open="${o.id}">
                  <span class="ws-tree-doc-title">${esc(o.title)}</span>
                  ${statusBadge(o.status)}
                  <span class="ws-tree-doc-who">${esc(o.owner)}</span>
                </button>`).join('')}
              </div>
            </details>`).join('')}
          </div>
        </details>`;
      }).join('')}
    </div>`;
  }

  const VIEWS = [['grid', 'Cards'], ['tree', 'Folders']];

  function renderGrid(st) {
    const stage = $('#wbStage');
    const composed = isComposed(st);
    /* The composed set arrives already ordered — yours first, then everything
       else, each ranked by what needs a person. Re-sorting it here is what
       silently threw the ownership half of the composition away. */
    /* Ordering, not a control. The grid leads with the most recently updated;
       the composed default leads with what needs a person. Neither was ever
       something to choose, so there is nothing to choose it with. */
    const list = composed ? composedSet() : sortSet(applyFilters(st), 'updated');

    if (!list.length) { stage.innerHTML = emptyResult(st); return; }

    stage.innerHTML = resultMeta(st, list, composed) +
      (st.view === 'tree' ? renderTree(st, list)
                          : `<div class="ws-grid">${list.map((o) => typeCard(o)).join('')}</div>`);
  }

  /* An empty result is a finding about the filter, not an absence. */
  function emptyResult(st) {
    return `<div class="empty-state k-enter">
      <div class="empty-state-icon">${ICO.search.replace('<svg', '<svg width="20" height="20"')}</div>
      <div class="empty-state-title">No matches</div>
      <div class="empty-state-desc">${LIVE.length} documents, none of them matching all of these filters.</div>
      <div class="k-row k-gap-2" style="justify-content:center;margin-top:14px">
        <button class="btn btn-brand btn-sm" data-clear-all>Clear filters</button>
      </div>
    </div>`;
  }

  /* ═══════════════════════════════════════════════
     THE DOCUMENT MODAL — viewer (AIMY-1145) and editor (AIMY-1146)

     A document opens OVER the workbench, never instead of it. Same frame as the
     canvas: absolute inside .app-main, blurred backdrop, the briefing rail and
     the input still live, Escape closes, focus returns to whatever opened it.

     `?doc=` and `&mode=` still drive it. The modal is how it renders; the URL is
     still what it is.
  ═══════════════════════════════════════════════ */
  const BODY_COPY = {
    article: ['This is the stored body — what AiMY answers from, which is not always what the live source says.'],
    icp: ['Fit is assessed on the criteria below, in order. A prospect failing any disqualifier is out regardless of how well it scores elsewhere.'],
    ticket: ['Ingested from the source system. Ticket content is evidence, not policy — it records what was decided once, for one customer.'],
    story: ['Cleared claims only. Anything not listed as an outcome has not been measured and must not be repeated externally.'],
    campaign: ['Campaign records are operational, not promotional. The asset list is the authority on what may be sent.'],
    asset: ['Approval and usage rights travel with the asset. Verified is not the same as cleared for external use.'],
    blog: ['Published content. The canonical URL is what search engines and customers see; this is the copy AiMY grounds on.'],
    webpage: ['Crawled content. Where the live page has changed since the last crawl, what is stored here is what AiMY answers from.']
  };

  /* Grounding, stated on the document rather than in a matrix. This is the fact
     a person actually needs about governance — can an agent answer from this —
     and it belongs where the document is. */
  function groundingRow(o) {
    const g = COLLECTION_META[o.col].grounding;
    return `<div class="dv-grounding">
      <span class="dv-prov-label">Grounding</span>
      <span class="dv-ground-list">${AGENTS.map((a) => `<span class="dv-ground ${g[a.id] ? 'is-on' : 'is-off'}${g[a.id] && a.external ? ' is-external' : ''}">
        ${(g[a.id] ? ICO.check : ICO.slash).replace('<svg', '<svg width="11" height="11"')}${esc(a.name)}${a.external ? ' · customer-facing' : ''}</span>`).join('')}</span>
      <button class="dv-ground-edit" data-open-axis="collection:${o.col}">Set for ${esc(COLLECTIONS[o.col])} →</button>
    </div>`;
  }

  function provenanceRow(o) {
    const s = SRC[o.src];
    return `<div class="dv-prov">
      <div class="dv-prov-item"><span class="dv-prov-label">Source</span>
        <span class="dv-prov-val"><span class="status-dot ${s.health === 'ok' ? 'sd-ok' : s.health === 'warn' ? 'sd-warn' : 'sd-err'}"></span>${esc(s.label)}</span></div>
      <div class="dv-prov-item"><span class="dv-prov-label">Ingested</span><span class="dv-prov-val">${esc(fmtDate(o.ing))}</span></div>
      <div class="dv-prov-item"><span class="dv-prov-label">Created at source</span><span class="dv-prov-val">${esc(fmtDate(o.xc))}</span></div>
      <div class="dv-prov-item"><span class="dv-prov-label">Changed at source</span><span class="dv-prov-val${o.xu < o.upd ? ' is-overdue' : ''}">${esc(fmtDate(o.xu))}</span></div>
      <div class="dv-prov-act">
        ${SRC[o.src].health === 'ok'
          ? entryAction('direct', 'Re-sync from source', `data-act="resync" data-obj="${o.id}"`)
          : entryAction('review', 'Reconnect ' + esc(SRC[o.src].label), `data-act="reconnect" data-obj="${o.id}"`)}
        ${o.xu < o.upd ? `<span class="dv-prov-note">The source changed after our copy.</span>` : ''}
      </div>
    </div>`;
  }

  function propsRow(o) {
    const keys = Object.keys(o.props);
    if (!keys.length) return '';
    return `<div class="dv-props">
      <span class="dv-prov-label">Custom properties</span>
      <div class="dv-prop-list">${keys.map((k) =>
        `<button class="dv-prop" data-prop="${esc(k)}:${esc(o.props[k])}">
          <span class="dv-prop-k">${esc(k)}</span><span class="dv-prop-v">${esc(o.props[k])}</span></button>`).join('')}</div>
    </div>`;
  }

  function relRow(o) {
    const r = RELATED[o.id];
    if (!r) return '';
    const grp = (label, ids, contradiction) => !ids || !ids.length ? '' : `
      <div class="dv-rel-group">
        <span class="dv-rel-label">${esc(label)}</span>
        <span class="dv-rel-items">${ids.map((id) => {
          const x = byId(id);
          /* Opening the other document answers nothing — you would be looking
             at one of the two things that disagree. Comparing is the act. */
          return x ? `<button class="dv-rel-item${contradiction ? ' is-contradiction' : ''}"
            ${contradiction ? `data-compare-with="${o.id}"` : `data-open-doc="${x.id}"`}>
            ${contradiction ? ICO.warn : TYPES[x.t].ico}<span>${esc(x.title)}</span></button>` : '';
        }).join('')}</span>
      </div>`;
    return `<div class="dv-rel">
      ${grp('Related', r.related)}
      ${grp('Contradicts', r.contradicts, true)}
      ${r.supersededBy ? grp('Superseded by', [r.supersededBy]) : ''}
    </div>`;
  }

  /* Versions, fixtures. The mind map lists seeing versions under VIEWING as
     well as editing, so the viewer carries them too — collapsed, because a
     reader deciding whether to trust content needs to know a history exists
     before they need to read it. */
  /* Each version carries the body it held, so opening one shows what the
     document actually said then rather than a label claiming it changed. */
  /* Versions are data, not a computed fixture.

     They used to be derived from the object on every render, which meant
     nothing could ever be added to them: accepting an AiMY rewrite changed the
     body and the history said the same three things it always had. Now each
     version carries the body it held, newest first, and every change that
     alters the text appends one. */
  const VERSIONS = (o) => o.versions || [];

  const VERSION_BODY = (o, i) => (VERSIONS(o)[i] || {}).body || o.sum;

  function seedVersions(o) {
    o.versions = [
      { v: 'v3', label: 'Clarified the ' + TYPES[o.t].label.toLowerCase() + ' scope',
        who: o.owner, how: 'edited in the document editor', at: o.upd, body: o.sum, current: true },
      { v: 'v2', label: 'Rewritten from 12 resolved tickets', who: 'AiMY', how: 'accepted by ' + o.owner,
        at: o.upd + 26, ai: true, body: 'Rewritten from twelve resolved tickets. ' + o.sum },
      { v: 'v1', label: 'Imported from ' + SRC[o.src].label, who: 'A. Mahfouz', how: 'first ingestion',
        at: o.ing, body: 'Imported from ' + SRC[o.src].label + '. ' + (o.sum || '').split('.')[0] + '.' }
    ];
  }

  /* Appends a version and makes it current. `body` is what the document now
     says, so restoring an older one has something real to restore to. */
  function addVersion(o, label, who, how, body, ai) {
    o.versions = o.versions || [];
    o.versions.forEach((v) => { v.current = false; });
    const n = o.versions.length + 1;
    const text = body === undefined ? o.sum : body;
    o.versions.unshift({
      v: 'v' + n, label: label, who: who, how: how, at: 0,
      body: text, ai: !!ai, current: true,
      /* The markup goes with it. A version that only kept plain text meant
         restoring one silently flattened every heading and list in it. */
      html: body === undefined ? o.html : (text === o.sum ? o.html : '')
    });
    previewVer = null;
  }

  /* Rows are buttons in the editor, where opening one has somewhere to go, and
     plain rows in the viewer, where it does not. A row that looks pressable and
     is not is worse than one that never offered. */
  const versionList = (o, pickable) => `<div class="ver-list">${VERSIONS(o).map((x, i) => {
    const inner = `<span class="ver-mark">${x.ai ? AIMY_MARK(10, 11) : esc(x.v)}</span>
      <div class="ver-main">
        <div class="ver-label">${esc(x.label)}</div>
        <div class="ver-author"><strong>${esc(x.who)}</strong> · ${esc(x.how)}</div>
      </div>
      <div class="ver-side">${x.current ? '<span class="ver-tag">Current</span>' : ''}<span class="ver-time">${esc(fmtShort(x.at))}</span></div>`;
    const cls = `ver-item${x.current ? ' is-current' : ''}${x.ai ? ' is-ai' : ''}` +
                (pickable ? ' is-pickable' : '') + (previewVer === i ? ' is-viewing' : '');
    return pickable
      ? `<button class="${cls}" data-open-ver="${i}" aria-pressed="${previewVer === i}">${inner}</button>`
      : `<div class="${cls}">${inner}</div>`;
  }).join('')}</div>`;

  /* ── The overlay itself ── */
  const docModal = {
    el: null, sheet: null, open: false,
    /* The id of the document that was opened, not the element that opened it:
       the grid re-renders while the modal is up, so the original node is gone
       by the time focus needs to go back to it. The id survives, and the card
       for that id is what the user was looking at. */
    openerId: null,

    init() {
      this.el = $('#docOverlay');
      this.sheet = $('#docSheet');
      if (!this.el) return;
      document.addEventListener('keydown', (e) => {
        if (!this.open) return;
        if (e.key === 'Escape' && !canvas.open && !$('#commitHost').innerHTML) { e.preventDefault(); this.close(); }
        if (e.key === 'Tab') this.trap(e);
      });
      this.el.addEventListener('mousedown', (e) => { if (e.target === this.el) this.close(); });
    },

    /* Focus is trapped while a document is open, and handed back to the control
       that opened it on close. Without the hand-back a keyboard user lands at
       the top of the document list every time they close a document. */
    trap(e) {
      const f = $$('a[href],button:not([disabled]),input:not([disabled]),textarea,[contenteditable="true"],[tabindex]:not([tabindex="-1"])', this.sheet)
        .filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    },

    show(html, id) {
      /* Opening a document from inside the canvas used to leave the canvas
         sitting on top of it. The thread survives — the AiMY mark on the input
         reopens it — but only one of the two can be the thing you are reading. */
      if (!this.open && canvas.open) canvas.close({ quiet: true });
      /* Same rule the other way: opening a document from inside the settings
         sheet closes the sheet. Two overlays stacked on each other is two
         things claiming to be what you are looking at. */
      if (!this.open && setModal.open) setModal.close();
      if (id && !this.open) this.openerId = id;
      /* A repaint of the document you are already reading must not move you.
         Resetting the scroll on every render meant that editing a property,
         adding a comment or re-syncing threw you to the top — the change did
         happen, and you were carried away from it. */
      const fresh = !this.open || id !== this.shownId;
      const keep = fresh ? 0 : this.sheet.scrollTop;
      this.shownId = id || null;
      this.sheet.innerHTML = html;
      this.sheet.scrollTop = keep;
      if (!this.open) {
        this.el.hidden = false;
        void this.el.offsetWidth;
        this.el.classList.add('open');
        this.open = true;
      }
      const focusTarget = $('[data-doc-close]', this.sheet);
      if (focusTarget) setTimeout(() => focusTarget.focus(), 60);
    },

    close() {
      if (!this.open) return;
      this.el.classList.remove('open');
      this.open = false;
      setTimeout(() => { this.el.hidden = true; this.sheet.innerHTML = ''; }, 220);
      const id = this.openerId;
      this.openerId = null;
      /* The URL is the state, so closing is a URL change, not a DOM change. */
      const st = readURL();
      if (st.doc) patch({ doc: '', mode: 'view' });
      /* Focus returns to the card for that document, re-found after the grid
         re-rendered. Without it a keyboard user lands back at the top of the
         page every time they close a document. */
      setTimeout(() => {
        const back = id && $(`[data-open-doc="${id}"]`);
        if (back) back.focus();
      }, 60);
    }
  };

  /* ── The settings sheet ──

     The same overlay as a document, because it is the same kind of thing:
     something you open over the work, act on, and close. It replaced a fake
     conversation — clicking a settings row pushed "Tell me about Confluence"
     into the thread as though you had said it, and answered with facts and a
     button per field that each opened its own dialog. None of that was editing
     settings. */
  const setModal = {
    el: null, sheet: null, open: false, openerSel: null,

    init() {
      this.el = $('#setOverlay');
      this.sheet = $('#setSheet');
      if (!this.el) return;
      document.addEventListener('keydown', (e) => {
        if (!this.open) return;
        if (e.key === 'Escape' && !$('#commitHost').innerHTML) { e.preventDefault(); this.close(); }
        if (e.key === 'Tab') this.trap(e);
      });
      this.el.addEventListener('mousedown', (e) => { if (e.target === this.el) this.close(); });
    },

    trap(e) { docModal.trap.call(this, e); },

    show(html, key) {
      /* One thing at a time on top of the work. */
      if (!this.open && canvas.open) canvas.close({ quiet: true });
      if (!this.open && docModal.open) docModal.close();
      const fresh = !this.open || key !== this.shownKey;
      const keep = fresh ? 0 : this.sheet.scrollTop;
      this.shownKey = key || null;
      this.sheet.innerHTML = html;
      this.sheet.scrollTop = keep;
      if (!this.open) {
        this.el.hidden = false;
        void this.el.offsetWidth;
        this.el.classList.add('open');
        this.open = true;
        const f = $('[data-set-close]', this.sheet);
        if (f) setTimeout(() => f.focus(), 60);
      }
    },

    close() {
      if (!this.open) return;
      this.el.classList.remove('open');
      this.open = false;
      setTimeout(() => { this.el.hidden = true; this.sheet.innerHTML = ''; }, 220);
      if (readURL().settings) patch({ settings: '' });
      setTimeout(() => { const back = $('.rail-set-name'); if (back) back.focus(); }, 60);
    }
  };

  /* Version history belongs in the chrome, not at the bottom of the body. The
     mind map puts seeing versions under VIEWING, and a collapsed panel below a
     long document is only found by someone who already knew it was there. */
  /* When each document was last written, this session. A document with nothing
     in it reports nothing — there is no save to report. */
  const savedClock = {};
  function noteSave(o) {
    if (!o || !String(o.sum || '').trim()) return;
    const d = new Date();
    savedClock[o.id] = { at: d.getTime(),
      clock: String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') };
    const el = $('#docSaved');
    if (el) el.innerHTML = ICO.check.replace('<svg', '<svg width="12" height="12"') + 'Saved just now';
  }

  function savedLabel(o) {
    const rec = savedClock[o.id];
    if (!rec) return '';
    const fresh = Date.now() - rec.at < 60000;
    return `<span class="doc-saved" id="docSaved">${ICO.check.replace('<svg', '<svg width="12" height="12"')}` +
           `${fresh ? 'Saved just now' : 'Saved · ' + rec.clock}</span>`;
  }

  const docChrome = (o, mode, blank) => `
    <div class="doc-bar">
      <span class="doc-bar-crumb">${TYPES[o.t].ico}${esc(TYPES[o.t].label)}
        <span class="doc-bar-sep">/</span>${esc(COLLECTIONS[o.col])}</span>
      <span class="doc-bar-end">
        ${mode === 'view'
          ? `<button class="btn btn-ghost btn-sm" data-versions="${o.id}">
               ${ICO.clock.replace('<svg', '<svg width="13" height="13"')}v${VERSIONS(o).length} · History</button>
             <button class="btn btn-ghost btn-sm" data-edit-doc="${o.id}">${ICO.pen.replace('<svg', '<svg width="13" height="13"')}Edit</button>`
          /* Every edit writes through as you type, so Saved is a state rather
             than a button — a control that saves what is already saved teaches
             people not to trust the word. What is left to do is publish.
             It has to MOVE, though: a chip that says Saved from the moment a
             document opens, including one that has never held anything, is
             decoration in the shape of a status. */
          : `${savedLabel(o)}
             ${blank ? `<button class="btn btn-ghost btn-sm" data-discard="${o.id}">Discard</button>` : ''}
             ${o.status === 'draft'
               /* Disabled and stating the reason. A control that looks
                  available and silently does nothing is the thing that teaches
                  people to distrust every other control. */
               ? `<button class="btn btn-brand btn-sm" data-act="publish" data-obj="${o.id}" data-publish
                    ${String(o.sum || '').trim() ? '' : 'disabled title="A document with no content cannot go live"'}
                  >${String(o.sum || '').trim() ? 'Publish' : 'Add some content first'}</button>`
               /* A check, not an eye. It ends the edit; an eye draws "look at
                  this", which is the one thing it does not mean. */
               : `<button class="btn btn-ghost btn-sm" data-view-doc="${o.id}">${ICO.check.replace('<svg', '<svg width="13" height="13"')}Done</button>`}`}
        <button class="doc-close" data-doc-close aria-label="Close document">
          ${ICO.x.replace('<svg', '<svg width="15" height="15"')}</button>
      </span>
    </div>`;

  /* ── Comments ──

     In the viewer, not the editor. Commenting on a document is something you do
     while READING it — you have just found the thing you want to say something
     about. Putting the thread behind Edit meant taking a document out of
     everyone's hands to leave a note on it, and it hid the notes from every
     person who only ever reads.

     A draft still has none: nobody can read it, so there is nobody to discuss
     it with. Publishing is what gives a document readers. */
  function commentThread(o) {
    if (o.status === 'draft') return '';
    const list = o.comments || [];
    return `<div class="comment-thread">
      <div class="comment-thread-head">
        <span class="comment-thread-label">Comments</span>
        ${list.length ? `<span class="comment-thread-n">${list.length}</span>` : ''}
      </div>
      ${list.length
        ? list.map((c) => `<div class="comment">
            <div class="avatar avatar-sm">${esc(c.initials)}</div>
            <div class="comment-body">
              <div class="comment-head"><span class="comment-author">${esc(c.who)}</span><span class="comment-time">${esc(c.when)}</span></div>
              <div class="comment-text">${esc(c.text)}</div>
            </div>
          </div>`).join('')
        : `<p class="comment-empty">Nothing yet. A comment is the way to raise something
           without changing the document.</p>`}
      <div class="comment-compose">
        <input class="field-input" type="text" placeholder="Add a comment…" aria-label="Add a comment"
               data-comment-input>
        <button class="btn btn-ghost btn-sm" data-comment-add>Comment</button>
      </div>
    </div>`;
  }

  function renderViewer(st) {
    const o = byId(st.doc);
    if (!o) { patch({ doc: '' }, { replace: true }); return; }
    const s = STATUS[o.status];

    /* A notice only where there is a consequence to state. Out of date is a
       condition, not an exclusion — it still answers, and the answer says so. */
    const notice = (s.excluded || o.arch || o.status === 'outdated') ? `
      <div class="dv-notice is-${o.arch || o.status === 'superseded' ? 'superseded' : 'expired'}">
        ${o.arch ? ICO.box : o.status === 'superseded' ? ICO.arrow : ICO.refresh}
        <span class="dv-notice-text"><strong>${o.arch ? 'Archived.' : o.status === 'superseded' ? 'Replaced.' : 'Out of date.'}</strong>
        ${o.arch
          ? 'Kept whole and restorable. Not used in answers.'
          : o.status === 'superseded'
            ? 'A newer document replaced it. Not used in answers.'
            : esc(SRC[o.src].label) + ' changed after our copy. Still used in answers, and answers say so.'}</span>
        ${o.arch || o.status === 'superseded'
          ? `<button class="dv-notice-link" data-act="${o.arch ? 'restore' : 'successor'}" data-obj="${o.id}">
               ${o.arch
                 ? 'Restore it →'
                 : (RELATED[o.id] || {}).supersededBy ? 'Go to the current one →' : 'Find what replaced it →'}</button>`
          : ''}
      </div>` : '';

    docModal.show(`
      ${docChrome(o, 'view')}
      <div class="doc-scroll">
        <div class="doc-view" data-status="${o.status}" data-work-state="${o.work}">
          <div class="dv-head">
            <div class="dv-meta">${statusBadge(o.status)}
              ${o.region ? `<button class="tag tag-neutral tc-tag" data-add-region="${o.region}">${esc(REGIONS[o.region])}</button>` : ''}
              ${o.client ? `<button class="tag tag-neutral tc-tag" data-add-client="${o.client}">${esc(CLIENTS[o.client])}</button>` : ''}
            </div>
            <h2 class="dv-title">${esc(o.title)}</h2>
          </div>

          <div class="dv-gov">
            <div class="dv-gov-item"><span class="dv-gov-label">Owner</span><span class="dv-gov-val">${esc(o.owner)}</span></div>
            <div class="dv-gov-item"><span class="dv-gov-label">Last updated</span><span class="dv-gov-val">${esc(fmtDate(o.upd))}</span></div>
            <div class="dv-gov-item"><span class="dv-gov-label">Last used</span><span class="dv-gov-val${o.status === 'unused' ? ' is-overdue' : ''}">${esc(usedLabel(o))} · ${o.uses} times in 90 days</span></div>
            <div class="dv-gov-item"><span class="dv-gov-label">Visible to</span><span class="dv-gov-val">${o.aud.map((a) =>
              `<button class="dv-aud" data-add-audience="${a}">${esc(AUDIENCE[a])}</button>`).join('')}</span></div>
          </div>
          ${groundingRow(o)}
          ${notice}

          <div class="dv-body">
            <p>${esc(o.sum)}</p>
            ${(BODY_COPY[o.t] || []).map((p) => `<p>${esc(p)}</p>`).join('')}
          </div>

          <div class="dv-section">
            <div class="dv-section-label">${esc(TYPES[o.t].label)} detail</div>
            ${TEMPLATE[o.t](o)}
          </div>

          <div class="dv-tags">
            <span class="dv-prov-label">Tags</span>
            ${o.tags.map((tg) => `<button class="tag tag-neutral tc-tag" data-add-tag="${esc(tg)}">${esc(tg)}</button>`).join('')}
            ${o.services.map((sv) => `<button class="tag tag-neutral tc-tag" data-add-service="${esc(sv)}">${esc(SERVICES[sv])}</button>`).join('')}
          </div>
          ${propsRow(o)}
          ${provenanceRow(o)}
          ${relRow(o)}

          <details class="dv-versions" id="docVersions">
            <summary class="dv-versions-head">Versions <span class="dv-versions-n">${VERSIONS(o).length}</span></summary>
            ${versionList(o)}
            <div class="ver-restore">
              <div class="vr-effect">
                ${ICO.warn.replace('<svg', '<svg style="width:13px;height:13px;flex-shrink:0"')}
                <span>Restoring changes what <strong>${AGENTS.filter((a) => COLLECTION_META[o.col].grounding[a.id]).length} consuming agent(s)</strong>
                answer from. History is preserved — restore adds a new version rather than deleting the ones it supersedes.</span>
              </div>
              <button class="btn btn-ghost btn-sm" data-restore="${o.id}">Restore ${esc(fmtShort(o.ing))} version</button>
            </div>
          </details>

          ${commentThread(o)}

          <div class="dv-actions">
            <span class="dv-actions-end">
              <button class="cite-action" data-act="report" data-obj="${o.id}">${ICO.flag}Report a problem</button>
              <button class="cite-action" data-act="${o.arch ? 'restore' : 'archive'}" data-obj="${o.id}">${ICO.box}${o.arch ? 'Restore' : 'Archive'}</button>
              ${o.arch ? `<button class="cite-action is-danger" data-act="delete" data-obj="${o.id}">${ICO.x}Delete</button>` : ''}
            </span>
          </div>
        </div>
      </div>`, o.id);
  }

  /* ── Editor (AIMY-1146): toolbar, formatting, comments, versions, AI ── */
  const TOOLBAR = [
    ['bold', '<strong>B</strong>', 'Bold'], ['italic', '<em>I</em>', 'Italic'],
    ['underline', '<span style="text-decoration:underline">U</span>', 'Underline'], ['|'],
    ['formatBlock:h3', 'H2', 'Heading'], ['formatBlock:h4', 'H3', 'Subheading'], ['|'],
    ['insertUnorderedList', '&#8226;&#8202;&#8212;', 'Bulleted list'],
    ['insertOrderedList', '1.&#8202;&#8212;', 'Numbered list'],
    ['formatBlock:blockquote', '&#8220;', 'Quote'], ['|'],
    ['undo', '&#8630;', 'Undo'], ['redo', '&#8631;', 'Redo']
  ];

  /* ═══════════════════════════════════════════════
     THE EDITOR (AIMY-1146)

     Editor state that is not the document's: which right-hand tab is open, and
     which version is being previewed. Both are view state, so neither belongs
     in the URL — reopening an editor on the Properties tab is not a place
     anyone would want to link to.
  ═══════════════════════════════════════════════ */
  let editorTab = 'props';
  let previewVer = null;

  const OWNERS = ['N. Wael', 'A. Mahfouz', 'O. Said', 'Sales Ops', 'Marketing', 'Brand', 'Legal', 'Unassigned'];

  /* Every property is a control that writes straight through to the object.
     Status is shown and not set: it is derived, and a field you could type into
     would be the attestation model coming back through a side door. */
  const PROP_FIELDS = [
    { key: 't',      label: 'Type',       map: () => opts(TYPES) },
    { key: 'col',    label: 'Collection', map: () => opts(COLLECTIONS) },
    { key: 'owner',  label: 'Owner',      map: () => OWNERS.map((x) => [x, x]) },
    { key: 'prod',   label: 'Product',    map: () => opts(PRODUCTS), blank: 'None' },
    { key: 'client', label: 'Client',     map: () => opts(CLIENTS), blank: 'None' },
    { key: 'region', label: 'Region',     map: () => opts(REGIONS) }
  ];

  function propDropdown(f, o) {
    const cur = o[f.key] || '';
    const rows = [['', f.blank || '—', f.blank || '—']].concat(f.map().map(([v, l]) => [v, l, l]));
    const label = rows.reduce((acc, r) => (r[0] === cur ? r[1] : acc), f.blank || '—');
    return `<div class="v2-dropdown k-prop" data-prop-key="${f.key}">
      <button class="v2-dropdown-btn" type="button" aria-haspopup="listbox" aria-expanded="false"
              aria-label="${esc(f.label)}">
        <span class="dd-label-text">${esc(label)}</span>
        <svg viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.8"
             stroke-linecap="round" stroke-linejoin="round"><polyline points="1 1 5 5 9 1"/></svg>
      </button>
      <div class="v2-dropdown-panel" role="listbox">
        ${rows.map(([v, value, text]) => `<div class="v2-dropdown-option${v === cur ? ' selected' : ''}"
          role="option" aria-selected="${v === cur}" data-value="${esc(value)}" data-slug="${esc(v)}">${esc(text)}</div>`).join('')}
      </div>
    </div>`;
  }

  const tagField = (o, key, label, lookup) => `
    <div class="prop-row">
      <span class="prop-label">${esc(label)}</span>
      <div class="tag-input" data-tag-field="${key}">
        ${(o[key] || []).map((v) => `<span class="tag-token">${esc(lookup ? lookup[v] || v : v)}
          <button type="button" data-tag-drop="${esc(v)}" aria-label="Remove ${esc(v)}">&times;</button></span>`).join('')}
        <input type="text" placeholder="Add…" aria-label="Add ${esc(label)}" data-tag-add="${key}">
      </div>
    </div>`;

  function propsPanel(o) {
    return `<div class="props">
      <div class="prop-row">
        <span class="prop-label">Status</span>
        <div class="prop-status">
          ${propDropdown({ key: 'statusSet', label: 'Status', blank: 'Automatic',
                           map: () => Object.keys(STATUS).map((k) => [k, STATUS[k].label]) }, o)}
          <span class="prop-why">${o.statusSet
            ? 'Set by ' + esc(o.statusBy || USER.owner) + '. Choose Automatic to compute it again.'
            : esc(STATUS[o.status].why)}</span>
        </div>
      </div>
      ${PROP_FIELDS.map((f) => `<div class="prop-row">
        <span class="prop-label">${esc(f.label)}</span>${propDropdown(f, o)}</div>`).join('')}
      ${tagField(o, 'tags', 'Tags')}
      ${tagField(o, 'services', 'Services', SERVICES)}
      <div class="prop-row">
        <span class="prop-label">Visible to</span>
        <div class="prop-checks">${Object.keys(AUDIENCE).map((a) => `
          <label class="ds-choice"><input type="checkbox" data-aud="${a}"${o.aud.indexOf(a) > -1 ? ' checked' : ''}>
            <span></span><span class="prop-check-label">${esc(AUDIENCE[a])}</span></label>`).join('')}</div>
      </div>
      <div class="prop-row is-stack">
        <span class="prop-label">Properties</span>
        <div class="prop-custom">
          ${Object.keys(o.props).map((k) => `<div class="prop-kv">
            <input class="field-input" value="${esc(k)}" data-prop-k="${esc(k)}" aria-label="Property name">
            <input class="field-input" value="${esc(o.props[k])}" data-prop-v="${esc(k)}" aria-label="Property value">
            <button class="prop-kv-x" data-prop-del="${esc(k)}" aria-label="Remove ${esc(k)}">${ICO.x.replace('<svg', '<svg width="12" height="12"')}</button>
          </div>`).join('')}
          <button class="prop-add" data-prop-add>+ Add a property</button>
        </div>
      </div>
    </div>`;
  }

  function renderEditor(st) {
    const o = byId(st.doc);
    if (!o) { patch({ doc: '' }, { replace: true }); return; }
    const owns = o.owner === USER.owner;
    const blank = !o.sum && o.title.indexOf('Untitled') === 0;
    const preview = previewVer !== null ? VERSIONS(o)[previewVer] : null;

    docModal.show(`
      ${docChrome(o, 'edit', blank)}
      <div class="doc-scroll">
        ${preview ? `<div class="ver-preview">
            ${ICO.clock.replace('<svg', '<svg width="14" height="14"')}
            <span>Viewing <strong>${esc(preview.v === 'ai' ? 'the AiMY version' : preview.v)}</strong> ·
              ${esc(fmtShort(preview.at))} — read only.</span>
            <span class="ver-preview-end">
              ${preview.current ? '' : `<button class="btn btn-ghost btn-sm" data-restore="${o.id}">Restore this version</button>`}
              <button class="btn btn-brand btn-sm" data-close-ver>Back to current</button>
            </span>
          </div>`
        : `<div class="toolbar" role="toolbar" aria-label="Formatting">
            ${TOOLBAR.map(([cmd, glyph, label]) => cmd === '|'
              ? '<span class="toolbar-sep"></span>'
              : `<button class="icon-btn" aria-label="${esc(label)}" title="${esc(label)}" data-fmt="${esc(cmd)}">${glyph}</button>`).join('')}
            <span class="toolbar-sep"></span>
            <button class="icon-btn is-ai" aria-label="Ask AiMY to draft" title="Ask AiMY to draft"
                    data-ai-doc aria-haspopup="true" aria-expanded="false">${AIMY_MARK(13, 15)}</button>
          </div>`}

        <div class="wb-editor-split">
          <div>
            <div class="doc-view">
              <div class="dv-head">
                <div class="dv-meta">
                  <span class="tc-type">${TYPES[o.t].ico}${esc(TYPES[o.t].label)}</span>
                  ${statusBadge(o.status)}
                </div>
                <h2 class="dv-title" ${preview ? '' : 'contenteditable="true"'} spellcheck="false"
                    data-edit-title>${esc(preview ? o.title : o.title)}</h2>
              </div>
              ${!preview && !owns ? `<div class="inline-note warn" style="align-items:flex-start">
                <span class="dot" style="margin-top:6px"></span>
                <span>Owned by <strong>${esc(o.owner)}</strong>, not you. Your edit is recorded against your name.</span>
              </div>` : ''}
              <div class="dv-body${!preview && !String(o.sum || '').trim() ? ' is-blank' : ''}" ${preview ? '' : 'contenteditable="true"'}
                   spellcheck="false" id="editBody" data-drop-body
                   data-placeholder="Write here, drop a file, or ask AiMY to draft it.">
                ${preview
                  ? `<p>${esc(VERSION_BODY(o, previewVer))}</p>`
                  : blank
                    /* Empty means empty. The hint is a CSS ::before on the
                       element, so it is never selected, never typed over and
                       never mistaken for something publishable. */
                    ? ''
                    /* The per-type boilerplate belongs to the fixture corpus. A
                       document someone wrote or dropped in has its own words,
                       and appending house copy to them is putting text in
                       their mouth. */
                    /* o.html is what the writing tools produced. Re-rendering
                       the body as one escaped paragraph is what threw every
                       bold and every list away on the next repaint. */
                    : o.html || `<p>${esc(o.sum)}</p>${o.src === 'upload' && /^new-/.test(o.id)
                        ? '' : `<p>${esc((BODY_COPY[o.t] || [''])[0])}</p>`}`}
              </div>
            </div>

            ${aiDraftBlock(o)}
          </div>

          <div class="editor-side">
            <div class="ds-tabs" role="tablist" aria-label="Document panel">
              <button class="ds-tab${editorTab === 'props' ? ' active' : ''}" role="tab"
                      aria-selected="${editorTab === 'props'}" data-etab="props">Properties</button>
              <button class="ds-tab${editorTab === 'vers' ? ' active' : ''}" role="tab"
                      aria-selected="${editorTab === 'vers'}" data-etab="vers">Versions<span class="tab-count">${VERSIONS(o).length}</span></button>
            </div>
            <div class="ds-tabpanel" role="tabpanel"${editorTab === 'props' ? '' : ' style="display:none"'}>
              ${propsPanel(o)}
            </div>
            <div class="ds-tabpanel" role="tabpanel"${editorTab === 'vers' ? '' : ' style="display:none"'}>
              ${versionList(o, true)}
              <p class="ver-hint">Open a version to read it. Only the current one can be edited.</p>
            </div>
          </div>
        </div>
      </div>`, o.id);

    if (!preview) wireSelectionMenu();
    if (blank) { const t = $('[data-edit-title]'); if (t) setTimeout(() => t.focus(), 80); }
  }

  /* ── The AiMY proposal ──

     This used to live in the editor's template with fixture copy inside it,
     hidden by a class, and aiPropose overwrote its innards. Anything that
     repainted the editor — accepting, most of all — rebuilt it from the
     fixture, so accepting made the block come back wearing words nobody had
     proposed.

     It is state now. No draft, no block. */
  let aiDraft = null;

  function aiDraftBlock(o) {
    if (!aiDraft || aiDraft.doc !== o.id) return '';
    /* A blank document has nothing to strike through. What AiMY wrote for it is
       a draft, not a revision of something, and drawing a diff against "(empty)"
       said the opposite. */
    const isNew = !aiDraft.was;
    return `<div class="ai-suggestion" id="aiSuggest">
      <div class="ai-suggestion-head">${AIMY_MARK(12, 13)}${esc(isNew ? 'AiMY drafted this' : aiDraft.label)}</div>
      <div class="ai-suggestion-body">
        ${isNew ? '' : `<del>${esc(aiDraft.was)}</del>`}
        <!-- The proposal is document copy, so it renders as document copy. It is
             also what Edit hands you: paragraphs and headings you can work on,
             rather than one line describing what a rewrite would have done. -->
        <ins${aiDraft.editing ? ' contenteditable="true" class="is-editing"' : ''}>${aiDraft.proposed}</ins>
      </div>
      <div class="ai-suggestion-foot">
        <button class="btn btn-brand btn-sm" data-suggest="accept">Accept</button>
        <button class="btn btn-ghost btn-sm" data-suggest="edit">${aiDraft.editing ? 'Editing…' : 'Edit'}</button>
        <button class="btn btn-ghost btn-sm" data-suggest="reject">Reject</button>
      </div>
    </div>`;
  }

  function aiPropose(label, proposed) {
    const o = byId(readURL().doc);
    if (!o) return;
    const body = $('#editBody');
    const wasText = (body ? body.innerText : String(o.sum || '')).trim().split(/\r?\n/)[0];

    /* The canvas is the record of what AiMY has been asked to do. It is not
       opened — that would cover the document being edited, which is what §5.3
       says selection and document scope must never do. It collects, and the
       badge on the input says how much is waiting. */
    canvas.push('user', esc(label + ' — ' + o.title));
    canvas.push('aimy', `<div class="answer-surface"><div class="answer-body">${proposed}</div>
      <div class="answer-scope">${ICO.pen.replace('<svg', '<svg style="width:12px;height:12px"')}
      <span>Proposed in the document. Not applied.</span></div></div>`, 'ai-' + (++aiSeq));
    bumpCanvasBadge();

    aiDraft = { doc: o.id, label: label, was: wasText || '', proposed: proposed,
                msg: 'ai-' + aiSeq, editing: false };
    renderEditor(readURL());
    markAfter('#aiSuggest', $('#docSheet'));
    const card = $('#aiSuggest');
    if (card) card.scrollIntoView({ block: 'nearest' });
  }

  /* What you did with a proposal is part of the record. Written back into the
     message it belongs to, so the thread reads as request → response → outcome
     rather than a list of things AiMY offered and no sign of what happened. */
  let aiSeq = 0;
  function aiOutcome(msgId, verdict) {
    const el = msgId && document.getElementById(msgId);
    if (!el) return;
    el.insertAdjacentHTML('beforeend',
      `<div class="ai-outcome is-${verdict}">${(verdict === 'accept' ? ICO.check : ICO.x).replace('<svg', '<svg width="12" height="12"')}
       <span>${verdict === 'accept' ? 'Applied to the document.' : 'Rejected. Kept in the trail.'}</span></div>`);
  }

  /* An action has to be visible where you are looking. A toast is a receipt
     from somewhere else; this takes the eye to the thing that actually moved.
     Removed after the animation so a later repaint can fire it again. */
  function markChanged(el) {
    if (!el || !el.classList) return;
    el.classList.remove('just-changed');
    void el.offsetWidth;
    el.classList.add('just-changed');
    setTimeout(() => el.classList.remove('just-changed'), 1500);
  }

  /* Mark by selector after the repaint that produced the element — the node the
     caller was holding is gone by then, which is why this takes a selector. */
  function markAfter(sel, root) {
    setTimeout(() => {
      const el = (root || document).querySelector(sel);
      if (el) markChanged(el);
    }, 30);
  }

  /* The card for a document, wherever it is on the grid. */
  function markCard(id) { markAfter(`#wbStage [data-card-open="${id}"]`); }

  /* One writer for the body. o.sum is the plain-text projection the cards,
     the search, the Publish gate and the version bodies all read; o.html is
     what the document actually says, formatting and all. */
  function writeBody(el) {
    const o = byId(readURL().doc);
    if (!o || !el) return o;
    o.sum = el.innerText.trim();
    o.html = o.sum ? el.innerHTML : '';
    el.classList.toggle('is-blank', !o.sum);
    const b = $('#docSheet [data-publish]');
    if (b) {
      const has = !!o.sum;
      b.disabled = !has;
      b.textContent = has ? 'Publish' : 'Add some content first';
    }
    return o;
  }

  /* A toolbar that never shows what is already on is telling you nothing. */
  function syncToolbar() {
    $$('#docSheet [data-fmt]').forEach((btn) => {
      const [cmd, val] = btn.getAttribute('data-fmt').split(':');
      let on = false;
      try {
        on = cmd === 'formatBlock'
          ? document.queryCommandValue('formatBlock').toLowerCase() === val
          : document.queryCommandState(cmd);
      } catch (e) {}
      btn.classList.toggle('is-on', !!on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function bumpCanvasBadge(n) {
    const b = $('.float-badge');
    if (!b) return;
    const next = Math.max(0, n === undefined ? (+b.textContent || 0) + 1 : n);
    b.textContent = String(next);
    b.hidden = next === 0;
  }

  /* A property changed: write it, re-derive, and repaint both the editor and
     the grid behind it, so the badge on the card moves as you edit. */
  function repaintEditor() {
    noteSave(byId(readURL().doc));
    recompute();
    const st = readURL();
    renderGrid(st);
    renderBrief(st);
    renderEditor(st);
  }



  /* ── AiMY, at document scope ──

     The toolbar's AiMY button used to raise a toast telling you to select
     something first, which is a button explaining why it does nothing. It now
     opens the same `.ai-menu` the selection uses, with the actions that apply
     to a whole document. A blank one leads with the only action that matters
     when there is nothing there yet. */
  const DOC_AI = {
    blank:  ['Write a first draft', 'Draft from a linked ticket', 'Outline it'],
    filled: ['Rewrite for support agents', 'Shorten', 'Expand', 'Fill the gaps', 'Find a source for this']
  };

  /* ── What AiMY actually writes ──

     Every one of these used to be paired with a sentence DESCRIBING what AiMY
     had done — "AiMY drafted this from the twelve most-cited tickets" — and
     that sentence went into <ins> and then into the document. The draft read
     like a prompt because it was one: the prompt describing itself.

     These return copy the document could actually contain, built from what it
     already knows about itself. Prose, in paragraphs, which is also what makes
     Edit worth pressing — there is something real in there to change. */
  const stripTags = (h) => String(h || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const sentences = (t) => String(t || '').split(/(?<=[.!?])\s+/).filter((x) => x.trim());
  const paras = (arr) => arr.filter(Boolean).map((x) => `<p>${esc(x)}</p>`).join('');

  function aiCopy(action, o, selection) {
    /* An untitled document has no name to write about yet, so it is described
       instead. Capitalised because it opens a sentence. */
    const named = !/^Untitled\s/i.test(o.title);
    const what = named ? o.title : 'This ' + TYPES[o.t].label.toLowerCase();
    const col = COLLECTIONS[o.col];
    const body = String(o.sum || '').trim();
    const sent = sentences(body);
    const tags = (o.tags || []).slice(0, 2).join(' and ');

    switch (action) {
      /* ── a blank document ── */
      case 'Write a first draft':
        return paras([
          `${what} applies to every request handled through ${col}, and to the agents that answer from it. Where it and a customer contract disagree, the contract governs.`,
          `The rule is stated first and the exceptions after it, so a reader who stops at the first paragraph has still read something true. Anything not written here is not policy${tags ? ', including the parts of ' + tags + ' that are handled elsewhere' : ''}.`,
          `Raise a change through the owner of ${col} rather than editing in place when the change affects what customers are told.`
        ]);

      case 'Draft from a linked ticket':
        return paras([
          `Ticket #48120 was resolved by treating the customer's case as an exception rather than the rule, and the reasoning was never written down anywhere a second person could find it. This is that reasoning.`,
          `The decision: the request was granted because the fault was demonstrated before the window closed, not because the window was extended. Those are different things and only the first generalises.`,
          `One resolved ticket is evidence, not policy. It says what was decided once, for one customer.`
        ]);

      case 'Outline it':
        /* Real headings, so the writing tools have something to work on. */
        return `<h3>Scope</h3><p>Who this covers and what it does not reach.</p>` +
               `<h3>Rules</h3><p>The rule, stated before its exceptions.</p>` +
               `<h3>Exceptions</h3><p>The cases that do not follow the rule, and why.</p>` +
               `<h3>Related</h3><p>What else in ${esc(col)} a reader needs alongside this.</p>`;

      /* ── a document that already says something ── */
      case 'Shorten':
        return paras(sent.slice(0, Math.max(1, Math.ceil(sent.length / 2))));

      case 'Expand':
        return paras(sent.concat([
          `Two cases come up often enough to state: a request made inside the window but completed outside it, and one made by someone other than the account holder. The first is in scope; the second needs the account holder's confirmation first.`
        ]));

      case 'Rewrite for support agents':
        /* Short sentences, the exception before the rule, no policy voice. */
        return paras(
          [`The exception first: if the item has been activated, this does not apply — use the warranty process instead.`]
            .concat(sent.map((s) => s.replace(/\bshall\b/gi, 'must').replace(/\bmay be\b/gi, 'can be')))
        );

      case 'Fill the gaps':
        return paras(sent.concat([
          `Not currently answered here: what happens when the request arrives through a reseller rather than direct. The linked tickets treat the reseller as the customer of record.`,
          `Also missing: who approves an exception, and how long they have to answer.`
        ]));

      /* ── selection scope: the highlighted words, changed ── */
      case 'Rewrite':
        return paras([`${String(selection || '').trim().replace(/[.,;:\s]+$/, '')} — stated plainly: the rule holds unless the item has been activated, and then the warranty process applies instead.`]);
      case 'Add the missing scope':
        return paras([`${String(selection || '').trim().replace(/[.,;:\s]+$/, '')}, for customers buying through the EU storefront. Resellers and APAC are covered separately.`]);
      default:
        /* Shorten, applied to a selection rather than the whole body. */
        return paras(sentences(selection).slice(0, 1));
    }
  }

  function aiMenu(anchor, items, attr) {
    const host = $('#docSheet');
    const old = $('.ai-menu', host);
    if (old) { old.remove(); if (old.dataset.for === anchor.dataset.k) return; }
    const hr = host.getBoundingClientRect(), ar = anchor.getBoundingClientRect();
    const menu = document.createElement('div');
    menu.className = 'ai-menu is-open k-enter';
    menu.style.left = Math.max(8, ar.left - hr.left) + 'px';
    menu.style.top = (ar.bottom - hr.top + host.scrollTop + 6) + 'px';
    menu.innerHTML = items.map((label, i) =>
      `<button${i === 0 ? ' class="ai-menu-primary"' : ''} ${attr}="${esc(label)}">${esc(label)}</button>`).join('');
    host.appendChild(menu);
    anchor.setAttribute('aria-expanded', 'true');
    return menu;
  }

  /* Selection scope (§5.3). The AI interactions that happen constantly while
     writing must never cover the thing being written, so this opens beside the
     selection and closes the moment it collapses. */
  function wireSelectionMenu() {
    const body = $('#editBody');
    if (!body) return;
    const kill = () => { const m = $('.ai-menu'); if (m) m.remove(); };
    body.addEventListener('mouseup', () => {
      setTimeout(() => {
        const sel = window.getSelection();
        kill();
        if (!sel || sel.isCollapsed || !body.contains(sel.anchorNode)) return;
        const r = sel.getRangeAt(0).getBoundingClientRect();
        const host = $('#docSheet');
        const hr = host.getBoundingClientRect();
        const menu = document.createElement('div');
        menu.className = 'ai-menu is-open k-enter';
        menu.style.left = Math.max(8, r.left - hr.left) + 'px';
        menu.style.top = (r.bottom - hr.top + host.scrollTop + 8) + 'px';
        /* The library's menu is buttons in a row with an optional primary and
           separators. It has no header slot, so the earlier version invented
           `.ai-menu-head` and `.ai-menu-item`, which resolved to nothing. */
        menu.dataset.sel = sel.toString().trim();
        menu.innerHTML = ['Rewrite', 'Shorten', 'Add the missing scope', 'Find a source']
          .map((l, i) => `<button${i === 0 ? ' class="ai-menu-primary"' : ''} data-ai-sel="${esc(l)}">${esc(l)}</button>`)
          .join('<span class="sep"></span>');
        host.appendChild(menu);
      }, 10);
    });
    body.addEventListener('keydown', kill);
    $('#docSheet').addEventListener('scroll', kill, { passive: true });
  }



  /* ═══════════════════════════════════════════════
     THE CANVAS

     Kept, and narrowed. It opens for open-ended questions and generative work.
     It does not open to filter, to open a known document, or to write —
     those three now complete in place, which is what the doctrine asks for and
     what the previous build failed.
  ═══════════════════════════════════════════════ */
  const canvas = {
    overlay: null, thread: null, sugg: null, input: null, floatBar: null, open: false, memoryShown: false,

    init() {
      this.overlay = $('#aimyOverlay');
      if (!this.overlay) return;
      this.thread   = $('#overlayThread', this.overlay);
      this.sugg     = $('#overlaySuggestions', this.overlay);
      this.input    = $('#overlayInput', this.overlay);
      this.floatBar = $('#aimyFloatBar');

      const opener = $('#canvasOpen');
      if (opener) opener.addEventListener('click', () => this.show());

      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (calOpen) { calOpen = null; calPick = null; renderFilters(readURL()); return; }
        if (proto.open) { proto.toggle(false); return; }
        if (this.open) this.close();
      });
      this.overlay.addEventListener('click', (e) => { if (e.target === this.overlay) this.close(); });
      if (this.thread) {
        this.thread.addEventListener('scroll', () => this.syncEdge(), { passive: true });
        this.syncEdge();
      }
    },

    show(basis) {
      if (!this.open) {
        /* Opening the canvas is reading it, so the count goes. */
        bumpCanvasBadge(0);
        this.overlay.classList.add('open');
        if (this.floatBar) this.floatBar.classList.add('hidden');
        this.open = true;
        setTimeout(() => { if (this.input) this.input.focus(); }, 220);
      }
      const tags = $('#overlayContextTags');
      if (tags && basis && basis.length) {
        tags.innerHTML = basis.map((b) => `<span class="overlay-context-tag">${esc(b)}</span>`).join('');
      }
    },

    close(opts) {
      this.overlay.classList.remove('open');
      if (this.floatBar) this.floatBar.classList.remove('hidden');
      this.open = false;
      /* Quiet when something else is taking over the screen, so the focus does
         not get pulled back out of it. */
      if (opts && opts.quiet) return;
      const fb = $('#floatInput');
      setTimeout(() => { if (fb) fb.focus(); }, 160);
    },

    syncEdge() {
      const th = this.thread;
      if (!th) return;
      th.classList.toggle('is-at-end', th.scrollHeight - th.clientHeight - th.scrollTop < 4);
    },

    reveal(el) {
      const th = this.thread;
      if (!th || !el) { this.syncEdge(); return; }
      if (th.scrollHeight <= th.clientHeight) return;
      const msg = el.closest('.chat-msg') || el;
      if (msg.getBoundingClientRect().height > th.clientHeight * 0.7) {
        th.scrollTop += msg.getBoundingClientRect().top - th.getBoundingClientRect().top - 12;
      } else {
        th.scrollTop = th.scrollHeight;
      }
      this.syncEdge();
    },

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
         <div class="mem-foot"><button class="btn btn-ghost btn-sm" data-mem-drop>Answer without it</button></div>`;
      this.thread.appendChild(el);
      this.reveal(el);
    },

    stage(text, basis) {
      this.show(basis);
      if (!this.input) return;
      this.input.value = text;
      this.input.focus();
      this.input.select();
      const bar = $('.overlay-input-bar', this.overlay);
      if (bar) bar.classList.add('is-staged');
    },

    /* opt.autoSurface — put the answer's sources on the workbench as the answer
       resolves, so closing the canvas lands on where the conversation got to.
       Reversal is explicit rather than promotion: the toast's Undo restores the
       filter state exactly, because that state is only ever a URL. */
    /* `answer` may be a string or a FUNCTION returning one. A function makes the
       answer LIVE: the message keeps it, and canvas.repaint() re-runs it after
       anything changes the model. That is what stopped the settings from being
       dead — Sync now, Reconnect, schedule, retention and grounding all wrote
       correctly and left the conversation showing the old numbers. */
    ask(text, basis, answer, opt) {
      this.show(basis);
      const bar = $('.overlay-input-bar', this.overlay);
      if (bar) bar.classList.remove('is-staged');
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
      this.push('aimy',
        '<span class="ai-thinking"><span class="dots"><span></span><span></span><span></span></span>' +
        '<span class="ai-thinking-label">Searching the corpus…</span></span>', id);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (!el) return;
        if (typeof answer === 'function') { el._live = answer; el.dataset.live = '1'; }
        el.innerHTML = typeof answer === 'function' ? answer() : answer;
        this.reveal(el);
        if (opt && opt.autoSurface) {
          const ids = answerIds(text);
          if (ids.length) surfaceIds(ids, 'while you were asking');
        }
      }, 900);
    },

    push(who, html, id) {
      if (!this.thread) return;
      const wrap = document.createElement('div');
      const isUser = who === 'user';
      const live = typeof html === 'function';
      wrap.className = 'chat-msg ' + (isUser ? 'user' : 'aimy');
      wrap.innerHTML =
        (isUser
          ? `<div class="msg-avatar">${esc(USER.initials)}</div>`
          : '<div class="msg-avatar aimy-av"><svg width="15" height="17" viewBox="0 0 18 20"><use href="#aimy-logo-small"/></svg></div>') +
        `<div class="msg-bubble"${id ? ` id="${id}"` : ''}${live ? ' data-live="1"' : ''}>${live ? html() : html}</div>`;
      if (live) { const b = wrap.querySelector('.msg-bubble'); if (b) b._live = html; }
      this.thread.appendChild(wrap);
      this.thread.scrollTop = this.thread.scrollHeight;
      this.syncEdge();
    },

    /* Re-run every live answer in the thread. Called from render(), so a
       conversation you are looking at is never behind the model it describes.
       What changed inside it is marked, so the eye is taken to the number that
       moved rather than left to find it. */
    repaint() {
      if (!this.thread) return;
      $$('.msg-bubble[data-live]', this.thread).forEach((el) => {
        if (typeof el._live !== 'function') return;
        const before = el.innerHTML;
        const after = el._live();
        if (after === before) return;
        el.innerHTML = after;
        markChanged(el);
      });
    }
  };

  /* ═══════════════════════════════════════════════
     ANSWERS

     Grounded in objects, with inline citations, a source list and a trust
     disclosure — and one new action. `Show these on the surface` writes the
     cited ids into the URL, so the conversation and the page stop being two
     products. That is the mind map's "filter by document ids" node.
  ═══════════════════════════════════════════════ */
  function citeChip(n, id, passage) {
    const o = byId(id);
    return `<span class="cite-wrap"><span class="cite" tabindex="0" role="button" aria-describedby="kcp${n}">${n}</span>` +
      `<span class="cite-preview" id="kcp${n}" role="tooltip">` +
      `<span class="cp-head"><span class="cp-title">${esc(o.title)}</span>${statusBadge(o.status)}</span>` +
      `<span class="cp-passage">“${esc(passage)}”</span>` +
      `<span class="cp-foot"><span class="cp-src">${esc(SRC[o.src].label)} · ${esc(COLLECTIONS[o.col])}</span>` +
      `<button class="cite-action is-flag" data-flag="${o.id}">${ICO.flag}Flag</button></span></span></span>`;
  }

  function sourceRow(n, id) {
    const o = byId(id);
    return `<div class="source-item"><span class="cite">${n}</span>${esc(o.title)}` +
      `<span class="source-domain">${esc(SRC[o.src].label)}</span>${statusBadge(o.status)}</div>`;
  }

  /* Every answer keeps this button even though a fresh question surfaces its
     sources automatically: scrolling back to an older message and re-applying
     it is the one case automation cannot serve. */
  const applyBtn = (ids, label) =>
    `<div class="answer-apply">${entryAction('direct', label || `Show these ${ids.length} on the surface`,
      `data-apply-ids="${ids.join(',')}"`)}
      <span class="answer-apply-note">The grid becomes exactly these documents.</span>
    </div>`;

  const ANSWERS = [
    { match: /refund|activat|return/i, weight: 1, ids: ['article-refund', 'article-returns-faq', 'article-warranty'],
      build: () => `<div class="answer-surface">
        <div class="answer-body">
          <p>Customers who bought through the EU storefront may request a full refund within <strong>30 days</strong>
          of purchase${citeChip(1, 'article-refund', 'may request a full refund within 30 days of purchase, provided the item has not been activated.')},
          provided the item has not been activated${citeChip(2, 'article-returns-faq', 'Activation ends refund eligibility. Faults are handled under warranty instead.')}.</p>
          <p>The two sources disagree on what happens after activation, so treat that clause as contested rather than settled.</p>
        </div>
        <div class="source-list">${sourceRow(1, 'article-refund')}${sourceRow(2, 'article-returns-faq')}</div>
        <div class="trust-disclosure has-exclusion">
          <div class="td-row is-err">${ICO.refresh}<span class="td-text"><strong>One cited source is behind
          Confluence</strong> — the source changed after our copy. It is still answering, and this is what that
          looks like.</span></div>
          <div class="td-row is-warn">${ICO.warn}<span class="td-text">The second source is unscoped: it does not say
          which storefront it applies to. That is the actual defect.</span></div>
        </div>
        ${applyBtn(['article-refund', 'article-returns-faq', 'article-warranty'])}
      </div>` },

    { match: /residency|gdpr|data (is )?stored|apac/i, weight: 1, ids: ['article-residency', 'blog-residency', 'article-gdpr-dsr'],
      build: () => `<div class="answer-surface">
        <div class="answer-body">
          <p>EU customer data stays in the EU region${citeChip(1, 'article-residency', 'Where customer data is stored per region, and what changes on an enterprise contract.')}.
          For APAC the corpus is thinner: the article covers the region but is <strong>due for review</strong>, and the
          public explainer restates it rather than adding anything${citeChip(2, 'blog-residency', 'Public-facing explainer. Points at the residency article, which is due.')}.</p>
          <p>A customer asked exactly this nine days ago and the ticket is still open with legal.</p>
        </div>
        <div class="source-list">${sourceRow(1, 'article-residency')}${sourceRow(2, 'blog-residency')}</div>
        <div class="trust-disclosure">
          <div class="td-row is-warn">${ICO.clock}<span class="td-text"><strong>One source has not been cited in
          four months.</strong> Nothing was withheld from this answer — every document in scope was available.</span></div>
        </div>
        ${applyBtn(['article-residency', 'blog-residency', 'article-gdpr-dsr'])}
      </div>` },

    /* Weightier than the topic answers: "which articles contradict each other
       on refunds?" names refunds and asks about the contradiction, and taking
       the first pattern that matched answered the wrong half of it. */
    { match: /contradict|conflict|disagree/i, weight: 2, ids: ['article-refund', 'article-returns-faq'],
      build: () => `<div class="answer-surface">
        <div class="answer-body">
          <p>One live contradiction, on refunds after activation.</p>
          <p><strong>Refund eligibility — EU customers</strong> states a 30-day window with no exception for activated
          items. <strong>Returns FAQ — activated items</strong> states that activation ends eligibility outright.</p>
          <p>They are not describing the same thing: the first is scoped to the EU storefront, the second is not scoped
          at all. The unscoped one is the problem.</p>
        </div>
        <div class="trust-disclosure">
          <div class="td-row is-warn">${ICO.warn}<span class="td-text">Status cannot separate these — both are
          answerable, and the one in better condition is the one that is wrong. This needs a human ruling.</span></div>
        </div>
        ${applyBtn(['article-refund', 'article-returns-faq'], 'Put both on the surface')}
      </div>` }
  ];

  /* A comparison is not a conclusion, so it ends in the choice rather than in
     prose about the choice. Both buttons are the same commit surface with the
     winner swapped. */
  function conflictAnswer(a, b) {
    const row = (o, other) => `<div class="conflict-side">
      <div class="conflict-head">${statusBadge(o.status)}<span class="conflict-title">${esc(o.title)}</span></div>
      <p class="conflict-body">${esc(o.sum)}</p>
      <div class="conflict-meta">${esc(SRC[o.src].label)} · ${esc(o.owner)} · used ${esc(usedLabel(o).toLowerCase())},
        ${o.uses} times in 90 days</div>
      ${entryAction('review', 'Make this the one', `data-resolve="${o.id}"`)}
    </div>`;
    return `<div class="answer-surface">
      <div class="answer-body">
        <p>These two disagree, and both are answering. Whichever you keep supersedes the other.</p>
      </div>
      <div class="conflict-pair">${row(a, b)}${row(b, a)}</div>
      <div class="trust-disclosure">
        <div class="td-row is-warn">${ICO.warn}<span class="td-text">Usage is the only thing separating them, and it
        is not evidence of which is correct.</span></div>
      </div>
    </div>`;
  }

  function noGroundingAnswer(q, scope, st) {
    /* Where it looked, so the claim is checkable. "Nothing grounds that" is a
       strong thing to say and it should say what it searched. */
    const where = scope && scope.axis ? 'the ' + scope.docs.length + ' documents in scope'
      : scope && !scope.broad ? 'the corpus' : 'the corpus';
    return `<div class="answer-surface">
      <div class="answer-body">
        <p>Nothing in ${esc(where)} grounds an answer to that.</p>
        <p>I would rather say so than assemble something plausible from adjacent content — a confident answer with no
        source behind it is the failure this product exists to remove.</p>
      </div>
      <div class="trust-disclosure has-exclusion">
        <div class="td-row is-err">${ICO.slash}<span class="td-text"><strong>0 sources matched.</strong> This is a
        genuine coverage gap, not a retrieval or a permission problem.</span></div>
        <button class="td-action" data-raise-gap="${esc(q).slice(0, 80)}">Raise it as a coverage gap →</button>
      </div>
    </div>`;
  }

  /* Scope is set before the query runs and stays visible throughout the
     answer. Here the scope IS the filter state, which is the whole point: what
     you can see and what AiMY may answer from are the same set. */
  function scopeBasis(st) {
    /* An open document is the basis. Saying "the whole corpus" while someone is
       reading one article is the canvas failing to show what it is standing on. */
    if (st.doc && byId(st.doc)) {
      const o = byId(st.doc);
      return [o.title, TYPES[o.t].label, COLLECTIONS[o.col], STATUS[o.status].label];
    }
    const chips = activeChips(st);
    if (!chips.length) return ['Your collections', LIVE.length + ' objects'];
    const labels = [];
    if (st.ids.length) labels.push(st.ids.length + ' documents');
    LIST_KEYS.concat(DATE_KEYS).forEach((k) => {
      if (k === 'ids') return;
      const v = st[k];
      (Array.isArray(v) ? v : v ? [v] : []).forEach((x) => labels.push(valueLabel(k, x)));
    });
    if (st.mine) labels.push('Owned by you');
    if (st.q) labels.push('“' + st.q + '”');
    return labels.slice(0, 4);
  }

  /* What AiMY may ground on. Exclusion is now a fact about replacement, not
     about age: a superseded document has a successor and an archived one is out
     of the corpus, so quoting either is quoting something that has been
     withdrawn. Everything else answers, and the answer discloses its condition —
     nothing is silently withheld because a clock ran out. */
  const answerable = (o) => o && !o.arch && !STATUS[o.status].excluded;

  /* What the answer stands on, resolved the same way the answer is — otherwise
     the grid fills with one set while the prose cites another. */
  const answerIds = (q) => {
    const topic = topicFor(q);
    if (topic && !questionShape(q)) return topic.ids.filter((id) => answerable(byId(id)));
    const scope = questionScope(q, readURL(), questionShape(q));
    return scope.broad ? [] : scope.docs.slice(0, 4).map((o) => o.id);
  };

  /* Put a set of documents on the surface and offer the way back. Used both by
     the automatic surfacing above and by the explicit button on every answer,
     so the two cannot drift apart. */
  function surfaceIds(ids, when) {
    const before = location.search;
    const next = readURL0();
    next.ids = ids;
    rememberFilter();
    writeURL(next);
    undoStack = () => { location.href = location.pathname + before; };
    toast('The surface now holds the ' + ids.length + ' documents this answer stands on',
      'Undo', when ? 'Applied ' + when + ' — Undo restores your filters' : 'Undo restores your filters');
  }

  /* ── Answering the question that was asked ──

     Three hand-written topics used to be the whole of it, matched on a noun.
     "Can EU customers get a refund after activating?" and "What changed in the
     refund policy?" both contain *refund* and are not the same question;
     returning the same paragraph for both is keyword matching wearing
     comprehension as a costume. And everything outside those three nouns fell
     to "nothing in the corpus grounds an answer to that" — which is a strong
     claim to make about a question the corpus can plainly answer.

     So: what the question ASKS decides the shape of the answer, and what its
     words NAME decides the documents it is answered from. Both are computed
     from the live corpus, which is what keeps them related to the question. */
  const STOP = ('what which whats who whom whose does did do done is are was were the a an and or of in on at to for '
    + 'about that this these those there here have has had been being will would should could can cannot may might '
    + 'me my our your their it its from with when where why how any some all still need needs want get got say says '
    + 'tell show find look into out over under document documents doc docs article articles thing things corpus '
    + 'knowledge base please').split(' ');

  const QUESTION_SHAPE = [
    ['owner',   /\bwho\b.{0,20}\b(owns?|maintains?|responsible|looks after)\b|\bowner(ship)?\b|\bunowned\b/i],
    ['changed', /\bwhat.{0,15}\b(changed|new|updated?)\b|\brecently\b|\bsince\b|\blatest\b|\bmost recent\b/i],
    ['stale',   /\bout of date\b|\boutdated\b|\bstale\b|\bbehind\b|\bre-?sync/i],
    ['unused',  /\bunused\b|\bnobody\b.{0,18}\b(use|uses|read|reads|cite|cites|open|opens|need|needs)\b|\bno ?one\b.{0,18}\b(use|uses|read|reads)\b|\bnot been (used|cited|opened)\b|\bworth keeping\b|\bstopped being used\b/i],
    ['count',   /\bhow many\b|\bhow much\b|\bcount\b|\bhow big\b/i],
    ['source',  /\bwhere\b.{0,20}\bcome from\b|\bwhich source\b|\bsyncing\b|\bnot syncing\b|\bsources?\b.{0,12}\b(broken|down|failing|stopped)\b/i]
  ];

  const questionShape = (q) => (QUESTION_SHAPE.find(([, re]) => re.test(q)) || [null])[0];

  /* The words that carry the QUESTION are not words to search for. "Which
     documents does nobody use?" was scoping itself to the one document whose
     summary happens to contain the word *nobody*, and then answering about that
     document — the asking words were being read as the subject. */
  const SHAPE_WORDS = {
    owner:   ['owns', 'owner', 'owners', 'ownership', 'unowned', 'maintains', 'responsible', 'assigned', 'unassigned'],
    changed: ['changed', 'change', 'changes', 'updated', 'update', 'updates', 'recent', 'recently', 'latest', 'newest'],
    stale:   ['outdated', 'stale', 'behind', 'resync', 'date', 'dates'],
    unused:  ['unused', 'nobody', 'uses', 'used', 'using', 'reads', 'reading', 'cites', 'cited', 'keeping'],
    count:   ['many', 'much', 'count', 'total', 'number'],
    source:  ['source', 'sources', 'syncing', 'synced', 'connected', 'broken', 'failing', 'stopped']
  };

  /* The documents a question is about: a plain term match over what each
     document says about itself, inside whatever the surface is already showing.
     This is the retrieval step, and having one is what makes "nothing grounds
     that" a true statement on the occasions it appears rather than the default
     for everything unrecognised. */
  function questionScope(q, st, shape) {
    const onSurface = applyFilters(st).filter(answerable);
    let pool = onSurface.length ? onSurface : ENTITLED.filter(answerable);
    let axisScoped = false;

    /* A word that names a real axis — a collection, a source, a service, a
       region — is never a coincidence, so it scopes the answer whatever its
       frequency. The lexicon already knows the whole taxonomy; asking it again
       here is reuse, not a second vocabulary that can drift from the first. */
    const axes = parseFilters(q).set;
    const axisKeys = Object.keys(axes).filter((k) => k !== 'q' && LIST_KEYS.indexOf(k) > -1 && axes[k].length);
    if (axisKeys.length) {
      const scoped = pool.filter((o) => axisKeys.every((k) => {
        const v = axes[k];
        return k === 'tag' ? v.some((x) => o.tags.indexOf(x) > -1)
          : k === 'service' ? v.some((x) => o.services.indexOf(x) > -1)
          : k === 'type' ? v.indexOf(o.t) > -1
          : k === 'collection' ? v.indexOf(o.col) > -1
          : k === 'source' ? v.indexOf(o.src) > -1
          : v.indexOf(o[k]) > -1;
      }));
      /* An axis narrows WHERE to look. It is not evidence that the answer is in
         there — "what is our policy on office dogs?" names the Policies
         collection and the collection says nothing about dogs. So the terms are
         still scored, inside the narrowed pool. */
      if (scoped.length) { pool = scoped; axisScoped = true; }
    }

    const drop = (SHAPE_WORDS[shape] || []).concat(STOP);
    const words = String(q).toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/)
      .filter((w) => w.length > 3 && drop.indexOf(w) < 0);
    if (!words.length) return { docs: pool, terms: [], broad: true, axis: axisScoped };
    /* A term that hits a quarter of the corpus is not evidence that the corpus
       covers the question — "what is our policy on office dogs?" matches every
       document with the word *policy* in it, and answering from those would be
       claiming coverage that does not exist. Only distinctive terms count. */
    const hay = (o) => (o.title + ' ' + o.sum + ' ' + o.tags.join(' ') + ' ' + COLLECTIONS[o.col]).toLowerCase();
    const generic = words.filter((w) => pool.filter((o) => hay(o).indexOf(w) > -1).length > pool.length * 0.25);
    const sharp = words.filter((w) => generic.indexOf(w) < 0);
    const scored = pool.map((o) => {
      const h = hay(o);
      return { o: o, n: sharp.filter((w) => h.indexOf(w) > -1).length };
    }).filter((x) => x.n > 0).sort((a, b) => b.n - a.n || a.o.upd - b.o.upd);
    /* Naming nothing the corpus recognises does not make the question empty:
       "what is out of date?" is about the whole surface. Only a question whose
       words match no document AND asks nothing computable is a coverage gap. */
    return { docs: scored.length ? scored.map((x) => x.o) : pool, terms: words,
             broad: !scored.length, axis: axisScoped };
  }

  const scopeLine = (scope, st) => scope.axis
    ? 'across the ' + scope.docs.length + ' in scope'
    : scope.broad
      ? (activeChips(st).length ? 'across what is on your surface' : 'across your four collections')
      : scope.docs.length === 1 ? 'in the one document that mentions it'
        : 'across the ' + scope.docs.length + ' documents that mention it';

  /* Every computed answer cites what it counted. A number with no way to see
     what is behind it is the same unsourced confidence this product exists to
     remove — it just looks more objective. */
  const citedList = (docs, note) => docs.length
    ? `<div class="source-list">${docs.slice(0, 4).map((o, i) => sourceRow(i + 1, o.id)).join('')}</div>`
      + (note ? `<div class="trust-disclosure"><div class="td-row is-warn">${ICO.warn}
          <span class="td-text">${note}</span></div></div>` : '')
    : '';

  const COMPUTED = {
    owner(scope, st, q) {
      const docs = scope.docs;
      /* "Who owns this" means "who do I ask". Some documents carry an
         ingestion marker in that field rather than a person — counting
         "Ingested · Zendesk" as an owner answers the question with something
         you cannot send a message to. */
      const named = (o) => OWNERS.indexOf(o.owner) > -1 && o.owner !== 'Unassigned';
      const by = {};
      docs.filter(named).forEach((o) => { by[o.owner] = (by[o.owner] || 0) + 1; });
      const top = Object.keys(by).sort((a, b) => by[b] - by[a]).slice(0, 3);
      const nobody = docs.filter((o) => !named(o));
      const unassigned = nobody.filter((o) => o.owner === 'Unassigned');
      const ingested = nobody.length - unassigned.length;
      return `<div class="answer-surface">
        <div class="answer-body">
          <p>${top.length
            ? top.map((n) => `<strong>${esc(n)}</strong> owns ${by[n]}`).join(', ') +
              ' ' + scopeLine(scope, st) + '.'
            : 'Nobody has their name on any of it ' + scopeLine(scope, st) + '.'}</p>
          ${nobody.length
            ? `<p><strong>${nobody.length}</strong> ${nobody.length === 1 ? 'has' : 'have'} nobody to ask${
                unassigned.length && ingested
                  ? ` — ${unassigned.length} unassigned, and ${ingested} that arrived from a source with no person attached`
                  : ingested ? ' — they arrived from a source with no person attached' : ''}.
               That is the part worth acting on.</p>`
            : '<p>Every one of them has a named owner.</p>'}
        </div>
        ${citedList(docs)}
        ${nobody.length
          ? applyBtn(nobody.map((o) => o.id), 'Show the ' + nobody.length + ' with nobody to ask')
          : applyBtn(docs.slice(0, 8).map((o) => o.id))}
      </div>`;
    },

    changed(scope, st, q) {
      const docs = scope.docs.slice().sort((a, b) => a.upd - b.upd);
      const recent = docs.filter((o) => o.upd <= 30).slice(0, 5);
      const list = recent.length ? recent : docs.slice(0, 3);
      return `<div class="answer-surface">
        <div class="answer-body">
          <p>${recent.length
            ? `<strong>${recent.length}</strong> changed in the last month ${scopeLine(scope, st)}.`
            : `Nothing changed in the last month ${scopeLine(scope, st)}. The most recent ${list.length === 1 ? 'is' : 'are'} below.`}</p>
          ${list.map((o) => `<p>${citeChip(list.indexOf(o) + 1, o.id, o.sum.slice(0, 120))}
            <strong>${esc(o.title)}</strong> — ${esc(fmtDate(o.upd))}${o.versions && o.versions[0]
              ? ', ' + esc(String(o.versions[0].label).toLowerCase()) : ''}.</p>`).join('')}
        </div>
        ${citedList(list, 'A change to the stored copy is not the same as a change at the source. Where the two differ, the document says so.')}
        ${applyBtn(list.map((o) => o.id))}
      </div>`;
    },

    stale(scope, st, q) {
      const docs = scope.docs.filter((o) => o.status === 'outdated');
      if (!docs.length) return `<div class="answer-surface">
        <div class="answer-body">
          <p>Nothing is behind its source ${scopeLine(scope, st)}. Every stored copy matches what the source last said.</p>
        </div>
        ${applyBtn(scope.docs.slice(0, 8).map((o) => o.id), 'Show what is in scope')}
      </div>`;
      const bySrc = {};
      docs.forEach((o) => { bySrc[o.src] = (bySrc[o.src] || 0) + 1; });
      const dead = Object.keys(bySrc).filter((k) => SRC[k].health !== 'ok');
      return `<div class="answer-surface">
        <div class="answer-body">
          <p><strong>${docs.length}</strong> ${docs.length === 1 ? 'document is' : 'documents are'} behind ${
            Object.keys(bySrc).map((k) => `${esc(SRC[k].label)} (${bySrc[k]})`).join(', ')}.</p>
          <p>${dead.length
            ? `${dead.map((k) => `<strong>${esc(SRC[k].label)}</strong>`).join(' and ')} ${dead.length === 1 ? 'is' : 'are'}
               not connected, so re-syncing those would queue rather than run — the connection is the thing to fix first.`
            : 'All of those sources are connected, so each one can be pulled again now.'}</p>
        </div>
        ${citedList(docs, 'Out of date is a condition, not an exclusion. These still answer, and every answer citing them says so.')}
        <div class="answer-apply">
          ${dead.length ? entryAction('review', 'Settings for ' + SRC[dead[0]].label, `data-settings="source:${dead[0]}"`) : ''}
          ${entryAction('direct', 'Show these ' + docs.length, `data-apply-ids="${docs.map((o) => o.id).join(',')}"`)}
        </div>
      </div>`;
    },

    unused(scope, st, q) {
      const docs = scope.docs.filter((o) => o.status === 'unused' || o.used > 120)
        .sort((a, b) => b.used - a.used).slice(0, 6);
      if (!docs.length) return `<div class="answer-surface">
        <div class="answer-body"><p>Everything ${scopeLine(scope, st)} has been cited in the last four months.</p></div>
        ${applyBtn(scope.docs.slice(0, 8).map((o) => o.id), 'Show what is in scope')}
      </div>`;
      return `<div class="answer-surface">
        <div class="answer-body">
          <p><strong>${docs.length}</strong> ${docs.length === 1 ? 'has' : 'have'} not been cited in months
          ${scopeLine(scope, st)}.</p>
          ${docs.slice(0, 4).map((o, i) => `<p>${citeChip(i + 1, o.id, o.sum.slice(0, 120))}
            <strong>${esc(o.title)}</strong> — ${esc(usedLabel(o).toLowerCase())}, ${o.uses} times in 90 days.</p>`).join('')}
        </div>
        ${citedList(docs, 'Low usage is not evidence that a document is wrong. It may be that something else is found first.')}
        <div class="answer-apply">
          ${entryAction('investigate', 'Is the first one worth keeping?', `data-act="triage" data-obj="${docs[0].id}"`)}
          ${entryAction('direct', 'Show these ' + docs.length, `data-apply-ids="${docs.map((o) => o.id).join(',')}"`)}
        </div>
      </div>`;
    },

    count(scope, st, q) {
      const docs = scope.docs;
      const byStatus = {};
      docs.forEach((o) => { byStatus[o.status] = (byStatus[o.status] || 0) + 1; });
      const rows = Object.keys(byStatus).sort((a, b) => byStatus[b] - byStatus[a]);
      return `<div class="answer-surface">
        <div class="answer-body">
          <p><strong>${docs.length}</strong> ${docs.length === 1 ? 'document' : 'documents'} ${scopeLine(scope, st)}.</p>
        </div>
        ${factRow(rows.map((s) => [byStatus[s], STATUS[s].label.toLowerCase()]))}
        ${applyBtn(docs.slice(0, 12).map((o) => o.id))}
      </div>`;
    },

    source(scope, st, q) {
      const keys = Object.keys(SRC).filter((k) => k !== 'upload');
      const named = keys.filter((k) => q.toLowerCase().indexOf(SRC[k].label.toLowerCase()) > -1);
      const list = named.length ? named : keys.filter((k) => SRC[k].health !== 'ok');
      const shown = list.length ? list : keys;
      return `<div class="answer-surface">
        <div class="answer-body">
          <p>${list.length && !named.length
            ? `<strong>${list.length}</strong> of ${keys.length} sources ${list.length === 1 ? 'is' : 'are'} not syncing.`
            : shown.map((k) => `<strong>${esc(SRC[k].label)}</strong> ${SRC[k].health === 'ok' ? 'is syncing' : 'is not syncing'}`).join('; ') + '.'}</p>
          ${shown.map((k) => `<p>${esc(SRC[k].label)} — ${esc(SRC[k].note)}.
            ${LIVE.filter((o) => o.src === k).length} documents come from it.</p>`).join('')}
        </div>
        <div class="answer-apply">
          ${shown.slice(0, 2).map((k) => entryAction('review', 'Settings for ' + SRC[k].label,
            `data-settings="source:${k}"`)).join('')}
        </div>
      </div>`;
    }
  };

  /* When the question names something the corpus holds but asks nothing this
     product computes, the honest answer is what those documents say — with the
     citations that let you check. It beats "nothing grounds that", which was
     being said about questions the corpus could plainly answer. */
  function corpusAnswer(scope, st, q) {
    const docs = scope.docs.slice(0, 3);
    return `<div class="answer-surface">
      <div class="answer-body">
        <p>${docs.length} document${docs.length === 1 ? '' : 's'} in scope ${docs.length === 1 ? 'covers' : 'cover'} that.</p>
        ${docs.map((o, i) => `<p>${citeChip(i + 1, o.id, o.sum.slice(0, 140))}
          <strong>${esc(o.title)}</strong> — ${esc(o.sum.slice(0, 160))}${o.sum.length > 160 ? '…' : ''}</p>`).join('')}
      </div>
      ${citedList(docs, 'This is what those documents say, not a synthesis of them. Where they disagree, comparing them is one click from either one.')}
      ${applyBtn(docs.map((o) => o.id))}
    </div>`;
  }

  /* The most specific topic that matches, not the first one declared. */
  const topicFor = (q) => ANSWERS.filter((a) => a.match.test(q))
    .sort((a, b) => (b.weight || 1) - (a.weight || 1))[0] || null;

  function answerFor(q, st) {
    /* Order matters, and it is the whole fix. What the question ASKS comes
       first: "what changed in the refund policy" and "can EU customers get a
       refund after activating" share a noun and are different questions, and
       the topic match cannot tell them apart. Only once the question asks
       nothing computable does the noun get to choose the answer. */
    const shape = questionShape(q);
    const scope = questionScope(q, st, shape);
    if (shape && COMPUTED[shape] && (scope.docs.length || shape === 'source')) {
      return COMPUTED[shape](scope, st, q);
    }

    const topic = topicFor(q);
    /* Nothing recognised, but the corpus holds documents about it: say what
       they say. "Nothing grounds an answer to that" is a strong claim and it
       was being made about questions the corpus could plainly answer. */
    if (!topic) return scope.docs.length && !scope.broad ? corpusAnswer(scope, st, q) : noGroundingAnswer(q, scope, st);
    /* Results first: the matching objects arrive before the prose resolves, so
       latency is filled with something useful rather than a spinner. */
    const results = applyFilters(st).filter((o) => topic.ids.indexOf(o.id) > -1).slice(0, 2);
    const body = topic.build();
    if (!results.length) return body;
    const head = `<div class="rs-head"><span class="rs-label">Matches</span>
      <span class="rs-note">already on your surface</span></div>
      <div class="rs-list">${results.map((o) => typeCard(o, true)).join('')}</div>`;
    return body.replace('<div class="answer-surface">', `<div class="answer-surface">${head}`);
  }

  /* ═══════════════════════════════════════════════
     TOAST + COMMIT SURFACES
  ═══════════════════════════════════════════════ */
  let undoStack = null;

  function toast(msg, undoLabel, sub) {
    const host = $('#toastHost');
    if (!host) return;
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
    const el = $('.aimy-toast', host);
    if (el) { void el.offsetWidth; el.classList.add('visible'); }
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { host.innerHTML = ''; }, 5000);
  }

  let pendingCommit = null;

  /* One structured commit surface, used by every consequential write. Free
     text never performs one — it only ever stages one. */
  function commit(o) {
    const host = $('#commitHost');
    if (!host) return;
    pendingCommit = o.onRun || null;
    const effects = (o.effects || []).concat([['rev', o.reversible || 'Reversible for 24h · logged to the audit trail']]);
    const effIco = (k) => k === 'ok' ? ICO.check : k === 'warn' ? ICO.warn : k === 'rev' ? ICO.shield : ICO.slash;

    host.innerHTML = `
      <div class="modal-backdrop" style="display:flex" data-hide-on-backdrop>
        <div class="modal" role="dialog" aria-modal="true" aria-label="${esc(o.title)}" style="width:${o.width || 560}px;max-width:100%">
          <div class="modal-header">
            <div class="modal-title">${esc(o.title)}</div>
            <button class="modal-close" data-commit-close aria-label="Close">${ICO.x.replace('<svg', '<svg width="14" height="14"')}</button>
          </div>
          <div class="modal-body">
            ${o.current ? `<div class="gov-cr-diff">
              <div class="gov-cr-current"><span class="gov-cr-label">Now</span><div class="gov-cr-val">${esc(o.current)}</div></div>
              <span class="gov-cr-arrow">${ICO.arrow.replace('<svg', '<svg width="16" height="16"')}</span>
              <div class="gov-cr-proposed"><span class="gov-cr-label">After</span><div class="gov-cr-val">${esc(o.proposed)}</div></div>
            </div>` : ''}
            <p class="gov-cr-rationale">${o.rationale}</p>
            <div class="ss-preview">
              <div class="ss-preview-head">What this will do</div>
              ${effects.map(([k, t]) => `<div class="ss-effect is-${k === 'rev' ? 'ok' : k}">${effIco(k)}<span>${t}</span></div>`).join('')}
            </div>
            ${o.typed ? `<div class="ds-field" style="max-width:none;margin-top:16px">
              <label class="field-label" for="commitTyped">Type <strong style="color:var(--d50)">${esc(o.typed)}</strong> to confirm</label>
              <input class="field-input" type="text" id="commitTyped" autocomplete="off" spellcheck="false"
                     placeholder="${esc(o.typed)}" data-typed="${esc(o.typed)}">
            </div>` : ''}
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" data-commit-close>Cancel</button>
            ${o.extra || ''}
            <button class="btn ${o.danger ? 'btn-err' : 'btn-brand'}" id="commitRun"
                    ${o.typed ? 'disabled style="opacity:.45;cursor:not-allowed"' : ''}
                    data-commit-run="${esc(o.done || o.confirm)}">${esc(o.confirm)}</button>
          </div>
        </div>
      </div>`;
  }

  function closeCommit() { const h = $('#commitHost'); if (h) h.innerHTML = ''; pendingCommit = null; }

  /* ═══════════════════════════════════════════════
     THE WRITE ROUTE

     A write typed into the input never runs. It resolves to a scope and stages
     the commit surface for it. Routing a consequential write through free text
     is the inversion the doctrine bans, and the fact that the sentence parsed
     cleanly is not evidence that the user meant every object it selected.
  ═══════════════════════════════════════════════ */
  const WRITE_SPEC = {
    archive:  { title: 'Archive documents', confirm: 'Archive', danger: true, typed: 'archive',
                verb: 'archived', rung: 'Destructive — typed confirmation and an audit entry' },
    delete:   { title: 'Delete permanently', confirm: 'Delete for good', danger: true, typed: 'delete',
                verb: 'deleted for good', rung: 'Not reversible — typed confirmation and an audit entry' },
    remove:   { title: 'Delete permanently', confirm: 'Delete for good', danger: true, typed: 'delete',
                verb: 'deleted for good', rung: 'Not reversible — typed confirmation and an audit entry' },
    verify:   { title: 'Re-sync from source', confirm: 'Re-sync', verb: 're-synced' },
    publish:  { title: 'Publish documents', confirm: 'Publish', danger: true, typed: 'publish', verb: 'published' },
    expire:   { title: 'Expire documents', confirm: 'Expire', danger: true, typed: 'expire', verb: 'expired' },
    restore:  { title: 'Restore a version', confirm: 'Restore', verb: 'restored' },
    approve:  { title: 'Approve for external use', confirm: 'Approve', verb: 'approved' },
    reassign: { title: 'Reassign ownership', confirm: 'Reassign', verb: 'reassigned' },
    tag:      { title: 'Tag documents', confirm: 'Apply tag', verb: 'tagged' }
  };

  function runWrite(intent, st) {
    const key = intent.verb.replace(/^re-?verify$/, 'verify').replace(/^review$/, 'verify');

    /* Creating is not a bulk operation over the surface, so it does not go
       through the scope machinery below — it goes to the same commit surface
       the New document button uses. */
    if (['add', 'create', 'new', 'draft'].indexOf(key) > -1) {
      const named = Object.keys(TYPES).find((k) => new RegExp('\\b' + k + '\\b', 'i').test(intent.text)) ||
                    (intent.set && intent.set.type ? intent.set.type[0] : '');
      newDocument(named || 'article');
      return;
    }

    const spec = WRITE_SPEC[key] || WRITE_SPEC.verify;

    const scope = isComposed(st) ? composedSet() : applyFilters(st);
    const from = 'everything on the surface';

    const excluded = scope.filter((o) => STATUS[o.status].excluded);
    const unowned  = scope.filter((o) => o.owner === 'Unassigned');
    const willAct  = scope.length - (key === 'verify' ? unowned.length : 0);

    commit({
      title: spec.title,
      rationale: `You typed <strong>“${esc(intent.text)}”</strong>. AiMY resolved that to ${esc(from)} —
        <strong>${scope.length} document${scope.length === 1 ? '' : 's'}</strong> — and staged it rather than running
        it. Writes with consequence do not go through free text.`,
      current: scope.length + ' document' + (scope.length === 1 ? '' : 's') + ' on the surface',
      proposed: willAct + ' ' + spec.verb,
      danger: spec.danger, typed: spec.typed, confirm: spec.confirm,
      done: spec.title,
      effects: [
        ['ok', `<strong>${willAct}</strong> document${willAct === 1 ? '' : 's'} will be ${esc(spec.verb)}.`],
        unowned.length ? ['warn', `<strong>${unowned.length}</strong> ${unowned.length === 1 ? 'has' : 'have'} no owner —
          ${key === 'verify' ? 'routed to the collection lead instead' : 'the action still applies, but nobody is accountable for the result'}.`] : null,
        excluded.length ? ['skip', `<strong>${excluded.length}</strong> ${excluded.length === 1 ? 'is' : 'are'} already
          excluded from retrieval, so answers do not change until this is confirmed.`] : null,
        spec.rung ? ['warn', esc(spec.rung)] : null
      ].filter(Boolean)
    });
  }

  /* ═══════════════════════════════════════════════
     GOVERNANCE AND SOURCES, AS CONVERSATIONS

     These used to be a panel above the grid: a slab of facts and controls
     sitting there permanently whether or not anyone had asked. They are not a
     surface — they are the answer to a question about a collection or a source,
     and the canvas is where questions are answered.

     Each one ends in the same structured commit surface it always did.
     Conversation for the judgement, commit for the consequence.
  ═══════════════════════════════════════════════ */
  const factRow = (pairs) => `<div class="conv-facts">${pairs.filter(Boolean).map(([v, l]) =>
    `<span class="conv-fact"><span class="conv-fact-v">${v}</span><span class="conv-fact-l">${esc(l)}</span></span>`).join('')}</div>`;



  /* ── The settings sheet's contents ──

     Real controls that write as you use them. Every change here is a rung-2
     change — reversible, scoped, and stated on the row it belongs to — so it
     applies on selection with an Undo, and the dialog each one used to open was
     ceremony. The two that are NOT rung 2 keep their confirmation: turning a
     customer-facing agent on, and deleting. */
  const setDropdown = (key, arg, label, rows, cur) => `
    <div class="v2-dropdown k-prop" data-set-key="${esc(key)}" data-set-arg="${esc(arg)}">
      <button class="v2-dropdown-btn" type="button" aria-haspopup="listbox" aria-expanded="false"
              aria-label="${esc(label)}">
        <span class="dd-label-text">${esc(rows.reduce((a, r) => (String(r[0]) === String(cur) ? r[1] : a), '—'))}</span>
        <svg viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.8"
             stroke-linecap="round" stroke-linejoin="round"><polyline points="1 1 5 5 9 1"/></svg>
      </button>
      <div class="v2-dropdown-panel" role="listbox">
        ${rows.map(([v, l]) => `<div class="v2-dropdown-option${String(v) === String(cur) ? ' selected' : ''}"
          role="option" aria-selected="${String(v) === String(cur)}" data-value="${esc(l)}" data-slug="${esc(v)}">${esc(l)}</div>`).join('')}
      </div>
    </div>`;

  const setRow = (label, control, note) => `
    <div class="set-row">
      <span class="set-label">${esc(label)}</span>
      <div class="set-control">${control}${note ? `<span class="set-note">${note}</span>` : ''}</div>
    </div>`;

  const setChrome = (title, sub) => `
    <div class="doc-bar">
      <span class="doc-bar-crumb">Settings<span class="doc-bar-sep">/</span>${esc(title)}</span>
      <span class="doc-bar-end">
        ${sub ? `<span class="set-sub">${esc(sub)}</span>` : ''}
        <button class="doc-close" data-set-close aria-label="Close settings">
          ${ICO.x.replace('<svg', '<svg width="15" height="15"')}</button>
      </span>
    </div>`;

  function sourceSettings(key) {
    const src = SRC[key];
    const mine = LIVE.filter((o) => o.src === key);
    const behind = mine.filter((o) => o.status === 'outdated');
    const blocked = mine.filter((o) => o.work === 'failed');
    const ok = src.health === 'ok';
    return setChrome(src.label, ok ? 'Connected' : 'Not connected') + `
      <div class="doc-scroll">
        <div class="set-panel">
          <p class="set-lead">${esc(src.note)}.
            ${behind.length ? `${behind.length} document${behind.length === 1 ? ' is' : 's are'} behind what the source now says.`
                            : 'Nothing here is behind its source.'}</p>

          ${factRow([
            [mine.length, 'documents from it'],
            [src.queued ? 'queued' : src.last === 0 ? 'Today' : src.last + 'd ago', 'last successful sync'],
            blocked.length ? [blocked.length, 'ingestion blocked'] : null,
            src.code ? [`<span class="conv-code">${esc(src.code)}</span>`, 'error'] : null
          ])}

          <div class="set-group">
            ${setRow('Sync every', setDropdown('cadence', key, 'Sync schedule',
              SYNC_SCHEDULES.map((x) => [x, x]), src.cadence),
              'How often this source is checked for changes. Between runs a document can be behind what the source says, and it says so when it is.')}
            ${setRow(ok ? 'Run now' : 'Connection',
              ok ? `<button class="btn btn-ghost btn-sm" data-sync-source="${key}">Sync now</button>`
                 : `<button class="btn btn-brand btn-sm" data-reconnect="${key}">Reconnect</button>`,
              ok ? 'Runs once, outside the schedule.' : 'Nothing ingests from here until it is connected.')}
          </div>

          <div class="set-group">
            <span class="conv-label">Recent runs</span>
            <div class="conv-log">
              ${src.history.slice(0, 4).map(([d, st2, note]) => `<div class="conv-log-row">
                <span class="status-dot ${st2 === 'ok' ? 'sd-ok' : st2 === 'warn' ? 'sd-warn' : 'sd-err'}"></span>
                <span class="conv-log-when">${esc(d === 0 ? 'Today' : d + 'd ago')}</span>
                <span class="conv-log-note">${esc(note)}</span></div>`).join('')}
            </div>
          </div>

          <div class="set-foot">
            ${entryAction('direct', 'Show its ' + mine.length + ' documents', `data-open-axis="source:${key}"`)}
          </div>
        </div>
      </div>`;
  }

  function collectionSettings(col) {
    const m = COLLECTION_META[col];
    const live = LIVE.filter((o) => o.col === col);
    const stale = live.filter((o) => o.status === 'outdated' || o.status === 'unused');
    const unowned = live.filter((o) => o.owner === 'Unassigned');
    const external = AGENTS.filter((a) => a.external && m.grounding[a.id]);
    return setChrome(COLLECTIONS[col], 'Owned by ' + m.owner) + `
      <div class="doc-scroll">
        <div class="set-panel">
          <p class="set-lead">${stale.length
            ? `${stale.length} of its ${live.length} documents are out of date or unused.`
            : `All ${live.length} are in use and match their sources.`}</p>

          ${factRow([
            [live.length, 'documents'],
            [stale.length, 'out of date or unused'],
            [unowned.length, 'unowned']
          ])}

          <div class="set-group">
            <span class="conv-label">Which agents may answer from this</span>
            <div class="set-checks">
              ${AGENTS.map((a) => `<label class="ds-choice set-check">
                <input type="checkbox" data-set-ground="${a.id}" data-set-col="${col}"
                       ${m.grounding[a.id] ? 'checked' : ''}><span></span>
                <span class="commit-choice-label">${esc(a.name)}${a.external
                  ? '<span class="gov-ext">Customer-facing</span>' : ''}</span>
              </label>`).join('')}
            </div>
            <span class="set-note">Human access and agent grounding are separate permissions. Content a colleague can
            read with judgement is not automatically content an autonomous agent should paraphrase to a customer.</span>
            ${external.length ? `<div class="trust-disclosure">
              <div class="td-row is-warn">${ICO.warn}<span class="td-text"><strong>${external.map((a) => esc(a.name)).join(', ')}
              is customer-facing</strong> and may paraphrase anything here to a customer.</span></div>
            </div>` : ''}
          </div>

          <div class="set-group">
            ${setRow('Auto-archive', setDropdown('retain', col, 'Retention', RETAIN_OPTIONS, m.retain),
              `Counted from a document's last update. Archiving takes it out of answers; it does not delete it, and it
               can be restored. Archived documents are kept <strong>${Math.round(m.purge / 30)} months</strong>
               before they can be deleted for good.`)}
          </div>

          <div class="set-foot">
            ${entryAction('direct', 'Show its ' + live.length + ' documents', `data-open-axis="collection:${col}"`)}
          </div>
        </div>
      </div>`;
  }

  function dataSettings() {
    const cols = USER.collections;
    const auto = cols.filter((c) => COLLECTION_META[c].retain > 0);
    const archived = CORPUS.filter((o) => o.arch);
    return setChrome('Archiving & deleting', archived.length + ' archived') + `
      <div class="doc-scroll">
        <div class="set-panel">
          <p class="set-lead">${auto.length
            ? `<strong>${auto.length} of ${cols.length}</strong> collections archive on their own.`
            : 'No collection archives on its own.'}
            Nothing is ever deleted automatically — retention archives, and archiving is reversible.</p>

          <div class="set-group">
            <span class="conv-label">Auto-archive, per collection</span>
            ${cols.map((c) => setRow(COLLECTIONS[c],
              setDropdown('retain', c, 'Retention for ' + COLLECTIONS[c], RETAIN_OPTIONS, COLLECTION_META[c].retain),
              `Kept ${Math.round(COLLECTION_META[c].purge / 30)} months after archiving.`)).join('')}
          </div>

          <div class="set-group">
            <span class="conv-label">The archive</span>
            <span class="set-note">Delete for good is reachable only from an archived document — you have to have
            archived something and come back for it.</span>
            ${archived.length
              ? `<div class="rs-list">${archived.map((o) => typeCard(o, true)).join('')}</div>`
              : '<p class="set-lead">Nothing is archived.</p>'}
          </div>
        </div>
      </div>`;
  }

  /* A change the input asked for, not yet made. It is shown as a proposal above
     the control it would move, because "I typed it and it happened" and "I typed
     it and I can see what it would do" are different products — and the second
     is the one the rest of this surface is. */
  let stagedSetting = null;

  function stagedBanner() {
    if (!stagedSetting) return '';
    const label = stagedSetting.key === 'cadence'
      ? 'Sync every ' + stagedSetting.value.replace(/^Every /, '').toLowerCase()
      : 'Auto-archive ' + ((RETAIN_OPTIONS.find(([v]) => String(v) === stagedSetting.value) || [0, ''])[1]).toLowerCase();
    return `<div class="set-staged">
      ${AIMY_MARK(13, 15)}
      <span class="set-staged-text">From what you typed: <strong>${esc(label)}</strong>. Nothing has changed yet.</span>
      <span class="set-staged-end">
        <button class="btn btn-ghost btn-sm" data-stage-drop>Discard</button>
        <button class="btn btn-brand btn-sm" data-stage-run>Apply it</button>
      </span>
    </div>`;
  }

  /* One entry point, so the rail, the URL and the input all land in the same
     place holding the same state. */
  function renderSettings(st) {
    const parts = String(st.settings).split(':');
    const kind = parts[0], value = parts[1];
    const html = kind === 'source' && SRC[value] ? sourceSettings(value)
      : kind === 'collection' && COLLECTIONS[value] ? collectionSettings(value)
      : kind === 'data' ? dataSettings()
      : '';
    if (!html) { patch({ settings: '' }, { replace: true }); stagedSetting = null; return; }
    /* The banner sits at the top of the panel, above the control it would move. */
    setModal.show(html.replace('<div class="set-panel">', '<div class="set-panel">' + stagedBanner()), st.settings);
  }

  /* "Find a source for this" is a question about grounding, not a rewrite. It
     asks whether anything in the corpus supports what the document says — which
     is answered with evidence and a set, so it belongs in the canvas. */
  function groundingAnswer(o, passage) {
    const near = LIVE.filter((x) => x.id !== o.id &&
      x.tags.some((tg) => o.tags.indexOf(tg) > -1)).slice(0, 3);
    canvas.close();
    canvas.ask(passage ? 'What supports "' + passage.slice(0, 60) + '"?' : 'What supports ' + o.title + '?',
      [o.title, COLLECTIONS[o.col]].concat(passage ? ['selection'] : []),
      () => `<div class="answer-surface">
        <div class="answer-body">
          <p>${near.length
            ? `${near.length} document${near.length === 1 ? '' : 's'} in the corpus cover${near.length === 1 ? 's' : ''} the same ground. ` +
              `Nothing in ${esc(SRC[o.src].label)} contradicts what this says.`
            : `Nothing else in the corpus covers this. It stands on its own source, and an answer that cites it cites only it.`}</p>
        </div>
        ${near.length ? `<div class="rs-list">${near.map((x) => typeCard(x, true)).join('')}</div>` : ''}
        <div class="trust-disclosure">
          <div class="td-row is-warn">${ICO.warn}<span class="td-text">Overlap is not corroboration. These share tags with it;
          whether they agree is a reading, and the comparison is one click away.</span></div>
        </div>
        <div class="answer-apply">
          ${near.length ? entryAction('investigate', 'Compare with ' + near[0].title,
            `data-set-conflict="${o.id}:${near[0].id}"`) : ''}
          ${entryAction('direct', 'Back to the document', `data-open-doc="${o.id}"`)}
        </div>
      </div>`);
  }

  /* Retention, archiving and deletion, across every collection at once. The
     per-collection conversation can say what one of them does; this is the only
     place that says what the rules add up to — and the only route to the
     archive, which is the only place Delete exists. */

  /* One entry point for both, so the chip, the briefing and a typed question
     all arrive at the same conversation. */



  /* ── The consequential changes the panel offers ── */
  /* The typed confirmation is owed to one specific change — turning a
     customer-facing agent ON — not to opening the form. Gating it on the state
     the collection happens to be in meant you had to type the collection name
     to allow an internal agent, which is a rung-4 ceremony for a rung-3 change
     and teaches people to type past it. It appears when you make the change
     that earns it. */

  /* The sync trigger. This was wired to a function that was never written, so
     "Change schedule" has been throwing since the day it appeared — the button
     was there, the handler was there, and the thing it called was not. */






  /* ═══════════════════════════════════════════════
     NON-HAPPY STATES

     Designed, not discovered. AI-unavailable is the interesting one here: the
     filters, the grid, the viewer and the editor are all plain state reads and
     keep working. Only the parse and the canvas degrade, and the input says so
     rather than silently doing nothing.
  ═══════════════════════════════════════════════ */
  const forcedState = new URLSearchParams(location.search).get('state') || '';

  function renderState(kind) {
    const stage = $('#wbStage');
    if (kind === 'loading') {
      stage.innerHTML = `<div class="ws-grid">${Array.from({ length: 6 }).map(() =>
        `<div class="skeleton-card"><div class="skeleton skeleton-line" style="width:38%"></div>
          <div class="skeleton skeleton-line" style="width:80%;height:15px"></div>
          <div class="skeleton skeleton-line" style="width:64%"></div>
          <div class="skeleton skeleton-line" style="width:52%"></div></div>`).join('')}</div>`;
      return true;
    }
    if (kind === 'error') {
      stage.innerHTML = `<div class="error-state">
        <div class="error-state-icon">${ICO.warn.replace('<svg', '<svg width="20" height="20"')}</div>
        <div class="error-state-title">Could not load</div>
        <div class="error-state-desc">Your filters are intact. Nothing changed — retrying is safe.</div>
        <button class="btn btn-brand btn-sm" data-retry>Retry</button>
      </div>`;
      return true;
    }
    return false;
  }

  function renderAiState() {
    const bar = $('#aimyFloatBar');
    const input = $('#floatInput');
    if (forcedState !== 'ai-down') return;
    if (bar) bar.classList.add('is-degraded');
    if (input) {
      input.placeholder = 'AiMY is unavailable — the filters still work';
      input.disabled = true;
    }
    const tray = $('#floatFilterTray');
    if (tray) tray.classList.add('is-forced');
  }

  /* ═══════════════════════════════════════════════
     RENDER — one entry point, driven by the URL
  ═══════════════════════════════════════════════ */
  function render() {
    const st = readURL();
    renderBrief(st);
    renderFilters(st);
    renderChips(st);

    if (forcedState === 'loading' || forcedState === 'error') { renderState(forcedState); return; }

    /* The grid always renders. A document opens over it, so the surface a
       person was working on is still there when they close the document —
       there is no "back", because they never left. */
    renderGrid(st);

    if (st.settings) renderSettings(st);
    else if (setModal.open) setModal.close();

    if (st.doc) {
      if (st.mode === 'edit') renderEditor(st); else renderViewer(st);
    } else if (docModal.open) {
      docModal.close();
    }

    /* The thread is part of the surface, not a transcript beside it. */
    canvas.repaint();
  }

  /* ═══════════════════════════════════════════════
     THE INPUT HANDLER — where the four routes actually diverge
  ═══════════════════════════════════════════════ */
  function submit(text) {
    const st = readURL();
    const intent = parseIntent(text);
    if (intent.route === 'empty') return;

    /* ── Reviewed: a write is staged, never run ── */
    if (intent.route === 'write') { runWrite(intent, st); return; }

    /* ── Settings: the sheet, with the change staged, never applied ── */
    if (intent.route === 'settings') {
      stagedSetting = intent.stage;
      patch({ settings: intent.target });
      return;
    }

    /* ── Direct: a known title opens its document. No generation, no canvas ── */
    if (intent.route === 'object') {
      patch({ doc: intent.id, mode: 'view' });
      toast('Opened “' + byId(intent.id).title + '”', null, 'Named exactly — nothing was generated');
      return;
    }

    /* ── Filters always apply, and a question always answers ──

       The two are not alternatives. A sentence carrying both — "expired ICPs,
       why did they lapse?" — narrows the surface AND answers within what it
       narrowed to. A sentence carrying only filter tokens narrows and stops. A
       sentence carrying only a question answers, and the surface becomes the
       sources that answer stands on. */
    const set = intent.set || {};
    let hasFilters = Object.keys(set).some((k) => k !== 'q') || (set.q && intent.route === 'filter');

    /* One exception, and it is the Notion-AI case: while a document is open, a
       question is about THAT document. The words it happens to share with the
       lexicon are not a request to re-filter — acting on them would close what
       you are reading and pull the ground out from under the question. An
       explicit filter phrase still filters; a question does not. */
    const reading = st.doc && intent.route === 'question';
    if (reading) hasFilters = false;

    if (hasFilters) applyTyped(set, text);

    if (intent.route === 'question') {
      /* The scope the answer is judged against is the scope that was just set,
         not the one that was there a moment ago. */
      const scoped = hasFilters ? readURL() : st;
      canvas.ask(text, scopeBasis(scoped), answerFor(text, scoped), { autoSurface: !hasFilters && !reading });
    }
  }

  /* Writes a parsed filter set into the URL. What AiMY understood shows up in
     the filter controls lighting up — there is nothing to restate underneath
     them.

     A typed phrase REPLACES the filter state; it does not add to it. A sentence
     is a statement of what you want to see, and merging it into whatever was
     there before produces a view nobody asked for and cannot read back. The
     controls and the chips are the incremental way in. */
  function applyTyped(set, text) {
    const next = readURL0();
    let matched = 0;
    Object.keys(set).forEach((k) => {
      const v = set[k];
      if (LIST_KEYS.indexOf(k) > -1)        { next[k] = v.slice(); matched++; }
      else if (k === 'q')                   { next.q = v; }
      else if (FLAG_KEYS.indexOf(k) > -1)   { next[k] = true; matched++; }
      else                                  { next[k] = v; matched++; }
    });
    /* Nothing recognised: keep it as a search rather than clearing the surface
       and calling that a result. */
    if (!matched && !set.q) next.q = text;
    next.doc = ''; next.mode = 'view';
    rememberFilter();
    writeURL(next);
  }

  /* ═══════════════════════════════════════════════
     WIRING — delegated, no inline handlers
  ═══════════════════════════════════════════════ */
  const DEMO = {
    filter:   'expired ICPs updated this year',
    object:   'Refund eligibility — EU customers',
    question: 'Can EU customers get a refund after activating?',
    write:    'archive all of these',
    settings: 'sync confluence hourly'
  };

  /* ── The prototype panel ──

     Built from the live corpus, not hard-coded. Every condition this product
     designs for — a document nothing has cited in a year, one whose source is
     down, one marked superseded with no replacement recorded — is real in the
     fixtures but tedious to reach by clicking, and those are exactly the
     screens worth looking at in a review. A link that cannot resolve is not
     rendered, so nothing here leads nowhere either. */
  function protoFirst(fn) {
    const o = (ENTITLED.filter(fn) || [])[0];
    return o ? o.id : '';
  }

  function protoGroups() {
    const deadSrc = Object.keys(SRC).find((k) => k !== 'upload' && SRC[k].health !== 'ok');
    const superseded = protoFirst((o) => !o.arch && o.status === 'superseded' && !(RELATED[o.id] || {}).supersededBy);
    const anySuperseded = protoFirst((o) => !o.arch && o.status === 'superseded');

    return [
      ['Input routes', 'Fills the input. Press Enter to run it.', [
        ['filter', 'demo:filter'], ['a document', 'demo:object'],
        ['a question', 'demo:question'], ['a write', 'demo:write'],
        ['settings', 'demo:settings']
      ]],
      ['A document in each state', 'Opens one that really is in that state.', [
        ['out of date', 'doc:' + protoFirst((o) => !o.arch && o.status === 'outdated')],
        ['conflicting', 'doc:' + protoFirst((o) => !o.arch && o.status === 'conflicting')],
        ['superseded, unlinked', 'doc:' + superseded],
        ['superseded', superseded ? '' : 'doc:' + anySuperseded],
        ['unused', 'doc:' + protoFirst((o) => !o.arch && o.status === 'unused')],
        ['unowned', 'doc:' + protoFirst((o) => !o.arch && o.status === 'unowned')],
        ['a draft', 'doc:' + protoFirst((o) => !o.arch && o.status === 'draft')],
        ['archived', 'arch:' + protoFirst((o) => o.arch)]
      ]],
      ['Surfaces', '', [
        ['editor', 'edit:' + protoFirst((o) => !o.arch && o.owner === USER.owner)],
        ['new document', 'new:1'],
        ['settings — a source', 'set:source:' + (deadSrc || 'confluence')],
        ['settings — a collection', 'set:collection:' + USER.collections[0]],
        ['settings — archiving', 'set:data'],
        ['the canvas', 'canvas:1']
      ]],
      /* Two states you cannot reach by clicking, because they only exist once
         somebody overrules the computation — and they are the ones with the
         most design in them: both open a picker rather than a destination. */
      ['Make a condition', 'Sets the status by hand, as a person would.', [
        ['superseded, nothing linked', 'mk:superseded'],
        ['conflicting, nothing linked', 'mk:conflicting']
      ]],
      ['Non-happy states', '', [
        ['loading', 'url:?state=loading'],
        ['error', 'url:?state=error'],
        ['AI down', 'url:?state=ai-down']
      ]],
      ['This URL is the whole state', '', [
        ['copy it', 'copy:1'],
        ['clear filters', 'url:?'],
        ['reload the fixtures', 'reload:1']
      ]]
    ];
  }

  function renderProto() {
    const host = $('#protoPanel');
    if (!host) return;
    host.innerHTML = protoGroups().map(([label, note, items]) => {
      /* A row whose target did not resolve is dropped rather than rendered
         dead — the same rule the product holds itself to. */
      const live = items.filter(([, go]) => go && !/:$/.test(go));
      if (!live.length) return '';
      return `<div class="proto-group">
        <span class="proto-group-label">${esc(label)}</span>
        ${note ? `<span class="proto-group-note">${esc(note)}</span>` : ''}
        <div class="proto-links">
          ${live.map(([text, go]) => `<button class="proto-link" data-proto="${esc(go)}">${esc(text)}</button>`).join('')}
        </div>
      </div>`;
    }).join('');
  }

  function protoRun(go) {
    const i = go.indexOf(':');
    const kind = go.slice(0, i), arg = go.slice(i + 1);
    const fb = $('#floatInput');

    if (kind === 'demo') { if (fb) { fb.value = DEMO[arg]; fb.focus(); } return; }
    if (kind === 'doc')  { patch({ doc: arg, mode: 'view' }); return; }
    if (kind === 'edit') { patch({ doc: arg, mode: 'edit' }); return; }
    if (kind === 'arch') { patch({ archived: true, doc: arg, mode: 'view' }); return; }
    if (kind === 'set')  { patch({ settings: arg }); return; }
    if (kind === 'new')  { newDocument('article'); return; }
    if (kind === 'canvas') { canvas.show(['Prototype']); return; }
    if (kind === 'url')  { location.search = arg.replace(/^\?/, ''); return; }
    if (kind === 'reload') { location.href = location.pathname; return; }
    if (kind === 'mk') {
      /* A plain document with nothing recorded either way, so the picker really
         does have nothing to go on — which is the case being demonstrated. */
      const o = ENTITLED.filter((x) => !x.arch && x.status === 'current' &&
        !(RELATED[x.id] || {}).supersededBy && !((RELATED[x.id] || {}).contradicts || []).length)[0];
      if (!o) { toast('Nothing plain enough left', null, 'Reload the fixtures and try again'); return; }
      o.statusSet = arg;
      o.statusBy = USER.owner;
      recompute();
      patch({ doc: o.id, mode: 'view' });
      markCard(o.id);
      toast('Set to ' + STATUS[arg].label, 'Undo', esc(o.title) + ' · nothing is linked to it');
      undoStack = () => { delete o.statusSet; delete o.statusBy; recompute(); render(); };
      return;
    }
    if (kind === 'copy') {
      const url = location.href;
      const done = () => toast('URL copied', null, 'Paste it anywhere — it rebuilds this exact surface');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, () => toast('Copy it from the address bar', null, url));
      } else {
        toast('Copy it from the address bar', null, url);
      }
    }
  }

  const proto = {
    open: false,
    toggle(next) {
      const panel = $('#protoPanel'), btn = $('#protoToggle');
      if (!panel || !btn) return;
      this.open = next === undefined ? !this.open : next;
      if (this.open) renderProto();
      panel.hidden = !this.open;
      btn.setAttribute('aria-expanded', String(this.open));
      $('#proto').classList.toggle('is-open', this.open);
    }
  };

  function wire() {
    /* Submit */
    const fb = $('#floatInput');
    if (fb) fb.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); const v = fb.value.trim(); fb.value = ''; submit(v); }
    });
    const fs = $('#floatSend');
    if (fs) fs.addEventListener('click', () => { const v = fb.value.trim(); fb.value = ''; submit(v); });

    /* The canvas input runs the same router as the float bar. Typing a filter
       phrase here narrows the surface behind the glass rather than being read
       as a question about nothing — one input contract, two places to reach it. */
    const oi = $('#overlayInput');
    if (oi) oi.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const v = oi.value.trim();
        if (!v) return;
        oi.value = '';
        submit(v);
      }
    });
    const os = $('#overlaySend');
    if (os) os.addEventListener('click', () => {
      const v = oi.value.trim();
      if (!v) return;
      oi.value = '';
      submit(v);
    });

    window.addEventListener('popstate', render);

    /* The filter controls. `dd:change` reports the label, so the machine value
       is read off the option the component marked selected. Choosing replaces
       the axis rather than adding to it — the control is single-select and
       pretending otherwise would leave it showing something untrue. */
    /* Property dropdowns in the editor write straight to the object. */
    document.addEventListener('dd:change', (e) => {
      const dd = e.target.closest('.v2-dropdown[data-prop-key]');
      if (!dd) return;
      const o = byId(readURL().doc);
      if (!o) return;
      const key = dd.getAttribute('data-prop-key');
      const opt = dd.querySelector('.v2-dropdown-option[aria-selected="true"]');
      const val = opt ? (opt.dataset.slug || '') : '';
      /* The override is the one property that is not just a field: clearing it
         hands the document back to the computation, and setting it records who
         did so. Same path chat uses. */
      if (key === 'statusSet') {
        if (val) { o.statusSet = val; o.statusBy = USER.owner; }
        else { delete o.statusSet; delete o.statusBy; }
        repaintEditor();
        return;
      }
      o[key] = val;
      /* Changing the type changes which fields the card and viewer draw, so the
         type-specific bag has to gain the shape the new type expects. */
      if (key === 't') o.x = Object.assign({}, BLANK_X[o.t] || {}, o.x);
      repaintEditor();
    });

    /* ── The settings sheet's controls ──

       These write on selection. Every one of them is reversible, scoped and
       stated on the row it belongs to, which is rung 2 — a dialog per field was
       ceremony standing in for feedback, and the feedback is now the control
       itself changing plus an Undo. */
    document.addEventListener('dd:change', (e) => {
      const dd = e.target.closest('.v2-dropdown[data-set-key]');
      if (!dd) return;
      const key = dd.getAttribute('data-set-key');
      const arg = dd.getAttribute('data-set-arg');
      const opt = dd.querySelector('.v2-dropdown-option[aria-selected="true"]');
      const val = opt ? (opt.dataset.slug || '') : '';

      if (key === 'cadence') {
        const src = SRC[arg];
        if (!src || val === src.cadence) return;
        const was = src.cadence;
        src.cadence = val;
        src.history.unshift([0, 'ok', 'Schedule changed to ' + val.toLowerCase() + ' by ' + USER.owner]);
        undoStack = () => { src.cadence = was; src.history.shift(); render(); };
        render();
        markAfter('.set-group', $('#setSheet'));
        toast('Sync schedule saved', 'Undo', src.label + ' · ' + val.toLowerCase());
        return;
      }

      if (key === 'retain') {
        const m = COLLECTION_META[arg];
        if (!m || +val === m.retain) return;
        const was = m.retain;
        m.retain = +val;
        undoStack = () => { m.retain = was; render(); };
        render();
        markAfter('.set-group', $('#setSheet'));
        toast('Auto-archive saved', 'Undo', COLLECTIONS[arg] + ' · ' +
          (m.retain ? 'archives after ' + Math.round(m.retain / 30) + ' months' : 'never archives on its own'));
      }
    });

    /* Grounding is the one setting where the rung depends on WHICH way it
       moves. Letting an internal agent read a collection is reversible and
       nobody outside sees it. Letting a customer-facing one read it puts this
       content in front of customers, and that earns the typed confirmation —
       which is why the checkbox reverts until the confirmation is completed. */
    document.addEventListener('change', (e) => {
      const cb = e.target.closest && e.target.closest('[data-set-ground]');
      if (!cb) return;
      const id = cb.getAttribute('data-set-ground');
      const col = cb.getAttribute('data-set-col');
      const m = COLLECTION_META[col];
      const agent = AGENTS.find((a) => a.id === id);
      if (!m || !agent) return;

      if (cb.checked && agent.external) {
        cb.checked = false;                       // not until it is confirmed
        commit({
          title: agent.name + ' may answer from ' + COLLECTIONS[col],
          danger: true, typed: COLLECTIONS[col], confirm: 'Allow it',
          current: 'Internal only', proposed: agent.name + ' may cite it to customers',
          rationale: `<strong>${esc(agent.name)}</strong> is customer-facing. Allowing it means anything in
            <strong>${esc(COLLECTIONS[col])}</strong> can be paraphrased to a customer without a person reading
            it first.`,
          effects: [
            ['warn', `All <strong>${LIVE.filter((o) => o.col === col).length}</strong> live documents here become
              answerable to customers.`],
            ['ok', 'Reversible — unticking it stops new answers immediately.'],
            ['ok', 'Logged to the audit trail with your name and the time.']
          ],
          onRun: () => {
            m.grounding[id] = true;
            render();
            markAfter('.set-checks', $('#setSheet'));
            toast(agent.name + ' allowed', 'Undo', 'It may now cite ' + COLLECTIONS[col]);
            undoStack = () => { m.grounding[id] = false; render(); };
            return true;
          }
        });
        return;
      }

      const was = m.grounding[id];
      m.grounding[id] = cb.checked;
      undoStack = () => { m.grounding[id] = was; render(); };
      render();
      markAfter('.set-checks', $('#setSheet'));
      toast(cb.checked ? agent.name + ' may answer from ' + COLLECTIONS[col]
                       : agent.name + ' no longer answers from ' + COLLECTIONS[col],
        'Undo', cb.checked ? 'Internal only — not customer-facing' : 'Existing answers are unaffected');
    });

    document.addEventListener('dd:change', (e) => {
      const dd = e.target.closest('.v2-dropdown[data-filter-key]');
      if (!dd) return;
      const key = dd.getAttribute('data-filter-key');
      const slug = (dd.querySelector('.v2-dropdown-option[aria-selected="true"]') || {}).dataset;
      const value = slug ? (slug.slug || '') : '';
      const st = readURL();
      if (FLAG_KEYS.indexOf(key) > -1) st[key] = !!value;
      else if (DATE_KEYS.indexOf(key) > -1) st[key] = value;
      else st[key] = value ? [value] : [];
      st.doc = ''; st.mode = 'view';
      rememberFilter();
      writeURL(st);
    });

    const gateRun = (locked) => {
      const btn = $('#commitRun');
      if (!btn) return;
      btn.disabled = locked;
      btn.style.opacity = locked ? '.45' : '';
      btn.style.cursor = locked ? 'not-allowed' : '';
    };

    document.addEventListener('input', (e) => {
      const t = e.target;
      if (t.hasAttribute && t.hasAttribute('data-typed')) {
        gateRun(t.value.trim().toLowerCase() !== t.getAttribute('data-typed').toLowerCase());
      }
    });

    /* Editor: audience checkboxes and the custom-property fields. */
    document.addEventListener('change', (e) => {
      const t = e.target;
      const o = byId(readURL().doc);
      if (!o || !t.hasAttribute) return;
      if (t.hasAttribute('data-aud')) {
        const a = t.getAttribute('data-aud');
        o.aud = t.checked ? o.aud.concat([a]).filter((x, i, arr) => arr.indexOf(x) === i)
                          : o.aud.filter((x) => x !== a);
        repaintEditor();
      }
    });

    /* Search inside a filter. The library's dropdown has letter typeahead — one
       key, 500ms buffer, jump to the first match — which is a different thing:
       it finds a value you can already spell. With a list of clients you cannot,
       so this narrows instead of jumping. Recorded in GAPS.md. */
    document.addEventListener('input', (e) => {
      const box = e.target.closest && e.target.closest('[data-dd-search]');
      if (!box) return;
      const panel = box.closest('.v2-dropdown-panel');
      const q = box.value.trim().toLowerCase();
      let hits = 0;
      $$('.v2-dropdown-option', panel).forEach((o) => {
        /* The first row is the axis's "All", and clearing a filter should not
           be something you have to spell your way back to. */
        const keep = !q || !o.dataset.slug || o.textContent.toLowerCase().indexOf(q) > -1;
        o.hidden = !keep;
        if (keep && o.dataset.slug) hits++;
      });
      const none = $('.dd-none', panel);
      if (none) none.hidden = !q || hits > 0;
    });

    /* The search field sits INSIDE the panel, and the library's dropdown closes
       on any click that is not an option or the trigger — so clicking into the
       search box shut the thing you were about to search. Both events are held
       at the document's capture phase, before the library's own document-level
       listeners run. Focus and the caret are default actions, not listeners, so
       they still happen. */
    ['click', 'mousedown'].forEach((type) => {
      document.addEventListener(type, (e) => {
        if (e.target.closest && e.target.closest('[data-dd-search]')) e.stopPropagation();
      }, true);
    });

    /* Typing in the search must not reach the listbox's keyboard model, or the
       first letter jumps the selection somewhere behind the panel. */
    document.addEventListener('keydown', (e) => {
      if (!e.target.closest || !e.target.closest('[data-dd-search]')) return;
      if (e.key === 'Escape') return;                 // Escape still closes it
      e.stopPropagation();
    }, true);

    /* A toolbar button steals focus on mousedown and collapses the selection
       before execCommand ever runs, which is why none of these appeared to do
       anything. Cancelling the default keeps the caret where it was. */
    document.addEventListener('mousedown', (e) => {
      if (e.target.closest && e.target.closest('[data-fmt]')) e.preventDefault();
    });

    /* Keep the toolbar honest about where the caret is. */
    document.addEventListener('selectionchange', () => {
      if ($('#docSheet [data-fmt]')) syncToolbar();
    });

    /* The body writes through on every keystroke so the Publish gate is honest
       the instant there is something to publish. No repaint — that would take
       the caret with it — just the one button that depends on it. */
    document.addEventListener('input', (e) => {
      if (!e.target.id || e.target.id !== 'editBody') return;
      const o = byId(readURL().doc);
      if (!o) return;
      writeBody(e.target);
      noteSave(o);
    }, true);

    /* Property key/value edits are committed on blur rather than on every
       keystroke — repainting mid-word would take the caret with it. */
    document.addEventListener('focusout', (e) => {
      const t = e.target;
      const o = byId(readURL().doc);
      if (!o || !t.hasAttribute) return;
      if (t.hasAttribute('data-prop-k')) {
        const was = t.getAttribute('data-prop-k'), now = t.value.trim();
        if (now && now !== was) { o.props[now] = o.props[was]; delete o.props[was]; repaintEditor(); }
      } else if (t.hasAttribute('data-prop-v')) {
        o.props[t.getAttribute('data-prop-v')] = t.value.trim();
      } else if (t.id === 'editBody') {
        /* Leaving the body is when the derived status can safely catch up —
           mid-word it would repaint under the caret. */
        writeBody(t);
        recompute();
        repaintEditor();
      } else if (t.hasAttribute('data-edit-title')) {
        const v = t.textContent.trim();
        if (v && v !== o.title) { o.title = v; repaintEditor(); }
      }
    }, true);

    /* Enter is the same action as the button. A compose field that only submits
       from a button is a field that has to be explained. */
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || !e.target.hasAttribute || !e.target.hasAttribute('data-comment-input')) return;
      e.preventDefault();
      const btn = $('[data-comment-add]');
      if (btn) btn.click();
    });

    /* Tag entry. Enter commits a token, Backspace on an empty field removes the
       last one — the two things every tag field is expected to do. */
    document.addEventListener('keydown', (e) => {
      const t = e.target;
      if (!t.hasAttribute || !t.hasAttribute('data-tag-add')) return;
      const o = byId(readURL().doc);
      if (!o) return;
      const key = t.getAttribute('data-tag-add');
      if (e.key === 'Enter') {
        e.preventDefault();
        const v = t.value.trim().toLowerCase().replace(/\s+/g, '-');
        if (!v) return;
        if (o[key].indexOf(v) === -1) o[key] = o[key].concat([v]);
        t.value = '';
        repaintEditor();
      } else if (e.key === 'Backspace' && !t.value && o[key].length) {
        e.preventDefault();
        o[key] = o[key].slice(0, -1);
        repaintEditor();
      }
    });

    document.addEventListener('click', (e) => {
      const t = e.target;
      let el;

      /* ── the date range controls ── */
      if ((el = t.closest('[data-cal-nav]'))) {
        const step = +el.getAttribute('data-cal-nav');
        const base = calMonth || new Date(Date.UTC(TODAY.getUTCFullYear(), TODAY.getUTCMonth(), 1));
        calMonth = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + step, 1));
        renderFilters(readURL());
        return;
      }
      if ((el = t.closest('[data-cal-day]'))) {
        const key = el.closest('[data-date-key]').getAttribute('data-date-key');
        const off = offsetOf(el.getAttribute('data-cal-day'));
        if (calPick === null) {
          /* First end picked. Nothing is written yet — half a range is not a
             filter, and writing one would empty the grid mid-gesture. */
          calPick = off;
          renderFilters(readURL());
          return;
        }
        const older = Math.max(calPick, off), newer = Math.min(calPick, off);
        calPick = null;
        calOpen = null;
        patch({ [key]: iso(dateOf(older)) + '..' + iso(dateOf(newer)) });
        return;
      }
      if ((el = t.closest('[data-date-field]'))) {
        const to = el.getAttribute('data-date-field');
        const st = readURL();
        const from = dateField || activeDateKey(st);
        dateField = to;
        calPick = null;
        /* Moving, not adding. Asking "when" twice about two different fields is
           a query nobody types and a row nobody can read back. */
        if (from !== to && st[from]) patch({ [from]: '', [to]: st[from] });
        else renderFilters(readURL());
        return;
      }
      if ((el = t.closest('[data-date-set]'))) {
        const key = el.closest('[data-date-key]').getAttribute('data-date-key');
        calPick = null;
        calOpen = null;
        patch({ [key]: el.getAttribute('data-date-set') });
        return;
      }
      if ((el = t.closest('.k-date-btn'))) {
        const key = el.closest('[data-date-key]').getAttribute('data-date-key');
        const cur = readURL()[key];
        calOpen = calOpen === 'date' ? null : 'date';
        calPick = null;
        /* Open on the month the range already names, not on today — otherwise
           changing a June range starts you in July every time. */
        const m = RANGE_RE.exec(cur || '');
        const on = m ? new Date(m[2] + 'T00:00:00Z') : TODAY;
        calMonth = calOpen ? new Date(Date.UTC(on.getUTCFullYear(), on.getUTCMonth(), 1)) : null;
        renderFilters(readURL());
        return;
      }
      if (calOpen && !t.closest('.k-date')) { calOpen = null; calPick = null; renderFilters(readURL()); }

      /* ── prototype panel ── */
      if (t.closest('#protoToggle')) { proto.toggle(); return; }
      if ((el = t.closest('[data-proto]'))) {
        protoRun(el.getAttribute('data-proto'));
        /* It closes behind you: it is scaffolding for getting somewhere, not
           somewhere to be. Copy is the one that leaves it open, because you may
           well want the next link too. */
        if (el.getAttribute('data-proto').indexOf('copy') !== 0) proto.toggle(false);
        return;
      }
      if (proto.open && !t.closest('#proto')) proto.toggle(false);

      /* ── chips and filters ── */
      if ((el = t.closest('[data-chip-drop]'))) {
        const c = el.closest('[data-chip]') || el;
        dropChip(c.getAttribute('data-chip'), c.getAttribute('data-chip-val'));
        return;
      }
      if (t.closest('[data-clear-all]')) { writeURL(readURL0()); return; }
      if ((el = t.closest('[data-quick]'))) {
        const [k, v] = el.getAttribute('data-quick').split('=');
        addFilter(k, v);
        return;
      }
      /* Every labelled value on a card or a document is a filter link. Clicking
         a tag, a region, a service, an audience or a custom property narrows
         the surface to it — which is how the modal stays a reading surface and
         still gets you back to the set. */
      if ((el = t.closest('[data-add-tag]')))      { addFilter('tag', el.getAttribute('data-add-tag')); return; }
      if ((el = t.closest('[data-add-client]')))   { addFilter('client', el.getAttribute('data-add-client')); return; }
      if ((el = t.closest('[data-add-region]')))   { addFilter('region', el.getAttribute('data-add-region')); return; }
      if ((el = t.closest('[data-add-service]')))  { addFilter('service', el.getAttribute('data-add-service')); return; }
      if ((el = t.closest('[data-add-audience]'))) { addFilter('audience', el.getAttribute('data-add-audience')); return; }
      if ((el = t.closest('[data-prop]')))         { addFilter('prop', el.getAttribute('data-prop')); return; }
      if (t.closest('[data-show-archive]')) { canvas.close(); patch({ archived: true }); return; }
      if ((el = t.closest('[data-open-axis]'))) {
        const [k, v] = el.getAttribute('data-open-axis').split(':');
        const next = readURL0();
        next[k] = [v];
        rememberFilter();
        writeURL(next);
        return;
      }
      if ((el = t.closest('[data-view]'))) { patch({ view: el.getAttribute('data-view') }); return; }
      if (t.closest('[data-toggle-mine]')) { const s = readURL(); s.mine = !s.mine; s.doc = ''; rememberFilter(); writeURL(s); return; }
      if (t.closest('[data-more]'))        { moreOpen = !moreOpen; renderFilters(readURL()); return; }
      if (t.closest('[data-resume]')) { location.search = lastFilter; return; }
      if (t.closest('[data-retry]'))  { location.href = location.pathname; return; }

      /* ── briefing ── */
      if ((el = t.closest('[data-brief-filter]'))) {
        const b = sinceLastVisit().find((x) => x.id === el.getAttribute('data-brief-filter'));
        if (!b || !b.href) return;
        const next = readURL0();
        Object.keys(b.href).forEach((k) => { next[k] = b.href[k]; });
        rememberFilter();
        writeURL(next);
        /* Filters AND explains — the finding and its detail in one click. */
        if (b.ask) patch({ settings: b.ask[0] + ':' + b.ask[1] });
        return;
      }
      if ((el = t.closest('[data-brief-prompt]'))) {
        canvas.stage(el.getAttribute('data-brief-prompt'),
          ['Coverage gap', '3 unanswered questions', 'Nothing to filter to']);
        return;
      }

      /* ── documents ── */
      if ((el = t.closest('[data-open-doc]'))) {
        patch({ doc: el.getAttribute('data-open-doc'), mode: 'view' });
        return;
      }
      if ((el = t.closest('[data-keep]'))) { canvas.close(); docAct('keep', el.getAttribute('data-keep')); return; }
      if ((el = t.closest('[data-compare-with]'))) { docAct('compare', el.getAttribute('data-compare-with')); return; }
      if ((el = t.closest('[data-resolve]'))) { canvas.close(); docAct('resolve', el.getAttribute('data-resolve')); return; }
      if ((el = t.closest('[data-edit-doc]'))) { patch({ doc: el.getAttribute('data-edit-doc'), mode: 'edit' }); return; }
      if ((el = t.closest('[data-view-doc]'))) { patch({ doc: el.getAttribute('data-view-doc'), mode: 'view' }); return; }
      if (t.closest('[data-doc-close]')) { previewVer = null; docModal.close(); return; }

      /* ── editor: tabs, versions, properties ── */
      if ((el = t.closest('[data-etab]'))) { editorTab = el.getAttribute('data-etab'); renderEditor(readURL()); return; }
      if ((el = t.closest('[data-open-ver]'))) { previewVer = +el.getAttribute('data-open-ver'); renderEditor(readURL()); return; }
      if (t.closest('[data-close-ver]')) { previewVer = null; renderEditor(readURL()); return; }
      if ((el = t.closest('[data-tag-drop]'))) {
        const o = byId(readURL().doc);
        const key = el.closest('[data-tag-field]').getAttribute('data-tag-field');
        o[key] = o[key].filter((x) => x !== el.getAttribute('data-tag-drop'));
        repaintEditor();
        return;
      }
      if ((el = t.closest('[data-prop-del]'))) {
        const o = byId(readURL().doc);
        delete o.props[el.getAttribute('data-prop-del')];
        repaintEditor();
        return;
      }
      if (t.closest('[data-prop-add]')) {
        const o = byId(readURL().doc);
        let n = 1;
        while (o.props['property-' + n] !== undefined) n++;
        o.props['property-' + n] = '';
        repaintEditor();
        return;
      }
      if ((el = t.closest('[data-discard]'))) {
        const o = byId(el.getAttribute('data-discard'));
        [CORPUS, LIVE, ENTITLED].forEach((arr) => { const i = arr.indexOf(o); if (i > -1) arr.splice(i, 1); });
        docModal.close();
        render();
        markAfter('.rm-main');
        toast('Discarded', null, 'Nothing was saved');
        return;
      }
      if ((el = t.closest('[data-versions]'))) {
        /* In the editor the version panel is already beside the body, so the
           chrome control only has work to do while reading. */
        const det = $('#docVersions');
        if (det) { det.open = true; det.scrollIntoView({ block: 'nearest' }); $('.ver-item', det).focus(); }
        else { const p = $('.ver-list'); if (p) p.scrollIntoView({ block: 'nearest' }); }
        return;
      }
      if ((el = t.closest('[data-card-act]'))) {
        cardActRun(el.getAttribute('data-card-act'));
        return;
      }
      /* Recording what a document conflicts with is a statement about both, so
         it is written on both — a one-sided contradiction would leave the other
         document claiming to be current while this one disagrees with it. */
      if ((el = t.closest('[data-set-conflict]'))) {
        const [a, b] = el.getAttribute('data-set-conflict').split(':');
        const A = byId(a), B = byId(b);
        if (!A || !B) return;
        RELATED[a] = Object.assign({ related: [], contradicts: [] }, RELATED[a]);
        RELATED[b] = Object.assign({ related: [], contradicts: [] }, RELATED[b]);
        if (RELATED[a].contradicts.indexOf(b) < 0) RELATED[a].contradicts.push(b);
        if (RELATED[b].contradicts.indexOf(a) < 0) RELATED[b].contradicts.push(a);
        recompute();
        render();
        markCard(a); markCard(b);
        docAct('compare', a);
        return;
      }
      if ((el = t.closest('[data-set-successor]'))) {
        const [a, b] = el.getAttribute('data-set-successor').split(':');
        if (!byId(a) || !byId(b)) return;
        RELATED[a] = Object.assign({ related: [], contradicts: [] }, RELATED[a], { supersededBy: b });
        RELATED[b] = Object.assign({ related: [], contradicts: [] }, RELATED[b]);
        if (RELATED[b].related.indexOf(a) < 0) RELATED[b].related.push(a);
        recompute();
        canvas.close();
        patch({ doc: b, mode: 'view' });
        markCard(a); markCard(b);
        toast('Recorded', 'Undo', esc(byId(b).title) + ' replaces ' + esc(byId(a).title));
        undoStack = () => { delete RELATED[a].supersededBy; recompute(); render(); };
        return;
      }
      if ((el = t.closest('[data-act]'))) {
        docAct(el.getAttribute('data-act'), el.getAttribute('data-obj'), el.getAttribute('data-arg'));
        return;
      }
      if ((el = t.closest('[data-new-doc]'))) { newDocument(readURL().type[0]); return; }
      if ((el = t.closest('[data-apply-ids]'))) {
        const ids = el.getAttribute('data-apply-ids').split(',');
        canvas.close();
        surfaceIds(ids);
        return;
      }

      /* ── set scope ── */
      /* ── commit surfaces ── */
      if (t.closest('[data-commit-close]') || (t.hasAttribute && t.hasAttribute('data-hide-on-backdrop') && t === e.target && t.classList.contains('modal-backdrop'))) {
        closeCommit(); return;
      }
      if ((el = t.closest('[data-commit-run]'))) {
        const label = el.getAttribute('data-commit-run');
        const run = pendingCommit;
        /* Run BEFORE tearing the surface down. Several commits carry a form —
           the schedule radios, the grounding checkboxes, the retention rule —
           and closing first left onRun reading a form that no longer existed,
           so the change silently did nothing. */
        /* And if it throws, say so. A commit that dies mid-run used to leave
           this surface open with the button still sitting there, which reads
           as "it refuses and will not tell me why". */
        let handled = false, failed = false;
        try { handled = run ? run() === true : false; }
        catch (err) { failed = true; console.error('commit failed:', err); }
        closeCommit();
        if (failed) { toast("That didn't go through", null, 'Nothing was changed'); return; }
        /* An onRun that says something specific returns true and keeps its own
           toast. Without this the generic one lands on top of it, and the user
           reads a restatement of the button they just pressed. */
        if (!handled) toast(label, 'Undo', 'Logged to the audit trail');
        return;
      }

      /* ── the axis panel: governance and sources, in place ── */

      if (t.closest('[data-stage-drop]')) { stagedSetting = null; render(); return; }
      if (t.closest('[data-stage-run]')) {
        const stage = stagedSetting;
        stagedSetting = null;
        if (!stage) { render(); return; }
        /* Drive the control rather than the model, so the staged path and the
           clicked path cannot drift apart. */
        const dd = $(`#setSheet .v2-dropdown[data-set-key="${stage.key}"]`);
        const opt = dd && $$('.v2-dropdown-option', dd).find((o) => o.dataset.slug === stage.value);
        if (!opt) { render(); return; }
        $$('.v2-dropdown-option', dd).forEach((o) => o.setAttribute('aria-selected', String(o === opt)));
        dd.dispatchEvent(new CustomEvent('dd:change', { bubbles: true }));
        return;
      }
      if (t.closest('[data-set-close]')) { setModal.close(); return; }
      if ((el = t.closest('[data-settings]'))) { patch({ settings: el.getAttribute('data-settings') }); return; }



      if ((el = t.closest('[data-reconnect]'))) {
        const k = el.getAttribute('data-reconnect');
        const was = { health: SRC[k].health, note: SRC[k].note, code: SRC[k].code };
        SRC[k].health = 'ok';
        SRC[k].note = 'Reconnected just now · first sync queued';
        delete SRC[k].code;
        SRC[k].history.unshift([0, 'ok', 'Reconnected by ' + USER.owner + ' · sync queued']);
        SRC[k].queued = true;
        undoStack = () => { Object.assign(SRC[k], was); SRC[k].history.shift(); render(); };
        render();
        markAfter('.rail-set');
        toast(SRC[k].label + ' reconnected', 'Undo', 'Sync queued · ingestion resumes on the next cycle');
        return;
      }
      if ((el = t.closest('[data-sync-source]'))) {
        const k = el.getAttribute('data-sync-source');
        SRC[k].history.unshift([0, 'ok', 'Manual sync by ' + USER.owner + ' · no changes found']);
        SRC[k].last = 0;
        delete SRC[k].queued;
        render();
        toast(SRC[k].label + ' synced', null, 'Triggered by hand — the schedule is unchanged');
        return;
      }

      /* ── editor ── */
      if ((el = t.closest('[data-fmt]'))) {
        const [cmd, val] = el.getAttribute('data-fmt').split(':');
        /* formatBlock wants a tag name in angle brackets in several engines and
           silently does nothing without them. */
        document.execCommand(cmd, false, cmd === 'formatBlock' ? '<' + val + '>' : (val || null));
        const body = $('#editBody');
        if (body) {
          body.focus();
          writeBody(body);
          syncToolbar();
        }
        return;
      }
      if ((el = t.closest('[data-suggest]'))) {
        const verdict = el.getAttribute('data-suggest');
        const ins = $('#aiSuggest ins');
        const o = byId(readURL().doc);
        if (!aiDraft || !o) return;

        /* Edit means edit THIS — the proposal, in place. It lives in state now,
           so it survives the repaint that used to wipe it. */
        if (verdict === 'edit') {
          aiDraft.editing = true;
          renderEditor(readURL());
          const box = $('#aiSuggest ins');
          if (box) {
            box.focus();
            const r = document.createRange();
            r.selectNodeContents(box);
            const sel = window.getSelection();
            sel.removeAllRanges(); sel.addRange(r);
          }
          return;
        }

        /* Accepting applies what is on screen — which, after an edit, is yours
           rather than what was proposed. */
        const html = ins ? ins.innerHTML.trim() : aiDraft.proposed;
        const text = ins ? ins.innerText.trim() : stripTags(aiDraft.proposed);
        const edited = html !== aiDraft.proposed;
        const msg = aiDraft.msg;

        if (verdict === 'accept') {
          /* Same split the writing tools use: o.html is what the document says,
             o.sum is the plain-text projection everything else reads. */
          o.sum = text;
          o.html = html;
          o.upd = 0;
          /* Accepting an edit is not publishing. A draft stays a draft until
             someone presses Publish — otherwise taking AiMY's wording would
             quietly make a brand-new document live. */
          /* An AiMY edit is an ordinary version with an AiMY author — not a
             separate history, so reviewing the human history never hides it. */
          addVersion(o, aiDraft.label, 'AiMY',
            edited ? 'edited and accepted by ' + USER.owner : 'accepted by ' + USER.owner, text, true);
          o.versions[0].html = html;
          recompute();
        }

        /* Either verdict ends the proposal. It stopped being a block that
           lingers with a note inside it: the record of what happened belongs to
           the canvas message, and the editor goes back to being the document. */
        aiDraft = null;
        aiOutcome(msg, verdict);
        repaintEditor();
        if (verdict === 'accept') {
          markAfter('#editBody', $('#docSheet'));
          markCard(o.id);
          toast('Applied', 'Undo', 'Filed as a version with AiMY as the author');
        } else {
          toast('Rejected', null, 'Kept in the trail, not applied');
        }
        return;
      }
      if ((el = t.closest('[data-restore]'))) {
        const o = byId(el.getAttribute('data-restore'));
        const agents = AGENTS.filter((a) => COLLECTION_META[o.col].grounding[a.id]).length;
        /* Restoring what you are previewing, not a fixed version — the button
           lives beside the preview, so it has to mean the one on screen. */
        const idx = previewVer === null ? 1 : previewVer;
        const from = VERSIONS(o)[idx] || VERSIONS(o)[VERSIONS(o).length - 1];
        commit({
          title: 'Restore ' + from.v,
          current: (VERSIONS(o)[0] || {}).v + ' · current', proposed: from.v + ' restored as the newest version',
          rationale: `Restore is additive: it creates a new version rather than deleting the ones it supersedes,
            so the audit trail does not acquire a hole exactly where someone will later need to look.`,
          confirm: 'Restore this version',
          effects: [
            agents ? ['warn', `Changes what <strong>${agents} consuming agent(s)</strong> answer from.`]
                   : ['skip', 'No agent grounds on this collection, so no answer changes.'],
            ['ok', 'History preserved — every superseded version stays readable.']],
          onRun: () => {
            o.sum = from.body;
            o.html = from.html || '';
            o.upd = 0;
            addVersion(o, 'Restored ' + from.v, USER.owner, 'restored from ' + fmtShort(from.at), from.body);
            o.versions[0].html = from.html || '';
            recompute();
            repaintEditor();
            markAfter('#editBody', $('#docSheet'));
            markCard(o.id);
            toast('Restored ' + from.v, null, 'Added as the newest version — nothing was deleted');
            return true;
          }
        });
        return;
      }
      /* The toolbar's AiMY button: document scope. */
      if ((el = t.closest('[data-ai-doc]'))) {
        const o = byId(readURL().doc);
        const isBlank = o && !String(o.sum || '').trim();
        aiMenu(el, isBlank ? DOC_AI.blank : DOC_AI.filled, 'data-ai-doc-run');
        return;
      }
      if ((el = t.closest('[data-ai-doc-run]'))) {
        const label = el.getAttribute('data-ai-doc-run');
        const m = el.closest('.ai-menu');
        if (m) m.remove();
        const o = byId(readURL().doc);
        if (!o) return;
        /* Not every AiMY action is a rewrite. "Find a source for this" asks
           whether the corpus supports what the document says, which is a
           question about grounding — proposing it as body text was answering a
           different question in the wrong place. */
        if (label === 'Find a source for this') { groundingAnswer(o); return; }
        aiPropose(label, aiCopy(label, o));
        return;
      }
      if ((el = t.closest('[data-ai-sel]'))) {
        const m = el.closest('.ai-menu');
        if (m) m.remove();
        const o = byId(readURL().doc);
        const label = el.getAttribute('data-ai-sel');
        /* The selected words, which the selection actions never received. */
        const picked = el.closest('.ai-menu').dataset.sel || '';
        if (!o) return;
        if (label === 'Find a source') { groundingAnswer(o, picked); return; }
        aiPropose(label, aiCopy(label, o, picked));
        return;
      }
      if (t.closest('[data-comment-add]')) {
        const input = $('[data-comment-input]');
        const o = byId(readURL().doc);
        if (!input || !input.value.trim() || !o) return;
        addComment(o, input.value.trim());
        render();
        markAfter('.comment:last-of-type', $('#docSheet'));
        toast('Comment added', 'Undo', 'On ' + o.title);
        undoStack = () => { o.comments.pop(); render(); };
        return;
      }

      /* ── answers ── */
      if ((el = t.closest('[data-raise-gap]'))) {
        /* A gap is the absence of a document, so the only honest destination is
           the document. Raising it creates the draft and opens it. */
        const q = el.getAttribute('data-raise-gap');
        canvas.close();
        newDocument('article', { title: q.replace(/\?$/, '') });
        toast('Draft started', null, 'From the question nothing could answer');
        return;
      }
      if ((el = t.closest('[data-flag]'))) {
        const id = el.getAttribute('data-flag');
        canvas.close();
        patch({ doc: id, mode: 'view' });
        toast('Flagged — opened the source so it can be corrected', null, 'Feedback is captured per citation, not per answer');
        return;
      }

      /* ── canvas ── */
      if (t.closest('[data-overlay-close]')) { canvas.close(); return; }
      if (t.closest('[data-mem-drop]')) { const m = t.closest('.memory-panel'); if (m) m.remove(); return; }
      if ((el = t.closest('.overlay-sugg-chip'))) { submit(el.textContent.trim()); return; }

      /* The whole card opens the document. LAST in the delegate on purpose:
         the title, the action, the tags and everything else interactive inside
         a card have already claimed the click and returned by here. Placing it
         any earlier makes the card swallow its own action button. */
      if ((el = t.closest('[data-card-open]'))) {
        patch({ doc: el.getAttribute('data-card-open'), mode: 'view' });
        return;
      }

      if (t.closest('[data-toast-undo]')) {
        const h = $('#toastHost');
        if (h) h.innerHTML = '';
        if (undoStack) { undoStack(); undoStack = null; } else history.back();
        return;
      }
    });
  }

  /* A blank state object with the same shape readURL produces, so callers can
     build a URL from scratch without hand-writing every key. */
  function readURL0() {
    const st = { doc: '', mode: 'view', settings: '', view: readURL().view, q: '', prop: '' };
    LIST_KEYS.forEach((k) => { st[k] = []; });
    DATE_KEYS.forEach((k) => { st[k] = ''; });
    FLAG_KEYS.forEach((k) => { st[k] = false; });
    return st;
  }

  function addFilter(key, value) {
    const st = readURL();
    if (FLAG_KEYS.indexOf(key) > -1) st[key] = true;
    else if (LIST_KEYS.indexOf(key) > -1) { st[key] = st[key] || []; if (st[key].indexOf(value) === -1) st[key].push(value); }
    else st[key] = value;
    st.doc = ''; st.mode = 'view';
    rememberFilter();
    writeURL(st);
  }

  function dropChip(key, value) {
    const st = readURL();
    if (FLAG_KEYS.indexOf(key) > -1) st[key] = false;
    else if (key === 'q' || key === 'prop') st[key] = '';
    else if (LIST_KEYS.indexOf(key) > -1) st[key] = st[key].filter((v) => v !== value);
    else st[key] = '';
    writeURL(st);
  }

  /* Actions available on a document, from the card or from inside the modal.
     One implementation, so a verify request means the same thing wherever it
     is started from. */
  function docAct(kind, id, arg) {
    const o = byId(id);
    if (!o) return;

    /* Out of date has one honest remedy: pull the source again. There is no
       "confirm it is still correct" here, because nobody performs that ritual
       and a button that claims they did is the badge lying in a new place. */
    if (kind === 'resync') {
      const src = SRC[o.src];
      /* Same rule as the card: there is no point confirming a pull from a
         source that cannot answer. */
      if (src.health !== 'ok') return docAct('reconnect', o.id);
      commit({
        title: 'Re-sync from source',
        current: 'Our copy — ' + fmtDate(o.upd),
        proposed: src.label + ' — ' + fmtDate(o.xu),
        rationale: `<strong>${esc(src.label)}</strong> changed after our copy. Pulling it again replaces the body
          with what the source says now.`,
        confirm: 'Pull it now',
        effects: [
          ['ok', 'Runs immediately, outside the schedule.'],
          ['skip', 'Local edits to this document are replaced by the source.']
        ],
        onRun: () => {
          const before = { upd: o.upd, used: o.used, work: o.work, versions: VERSIONS(o).slice() };
          o.upd = o.xu;
          if (o.work === 'failed') o.work = 'completed';
          addVersion(o, 'Re-synced from ' + src.label, src.label, 'pulled from the source');
          recompute();
          undoStack = () => { Object.assign(o, before); recompute(); render(); };
          render();
          markAfter('.dv-prov', $('#docSheet'));
          markAfter('.dv-head .trust-state', $('#docSheet'));
          markCard(o.id);
          toast('Re-synced from ' + src.label, 'Undo', 'Our copy now matches the source');
          return true;
        }
      });
      return;
    }

    if (kind === 'archive') {
      const agents = AGENTS.filter((a) => COLLECTION_META[o.col].grounding[a.id]).length;
      commit({
        title: 'Archive this document', danger: true, typed: 'archive', confirm: 'Archive',
        current: 'Live in ' + COLLECTIONS[o.col], proposed: 'Archived',
        rationale: `Archiving takes <strong>${esc(o.title)}</strong> out of the live corpus and out of answers.
          It is not deletion: the document stays whole, stays addressable at <code>?archived=1</code>, and can be
          restored.`,
        effects: [
          agents ? ['warn', `<strong>${agents} agent(s)</strong> ground on ${esc(COLLECTIONS[o.col])} and will stop citing it.`] : null,
          ['ok', 'Restorable from the archive with its history intact.']
        ].filter(Boolean),
        onRun: () => { o.arch = true; docModal.close(); render(); markAfter('.rm-main'); }
      });
      return;
    }

    /* Delete is not archive with a harsher word. It is the only action in the
       product that cannot be undone, so it is reachable only from the archive
       — you have to have archived something and then come back for it. */
    if (kind === 'delete') {
      const m = COLLECTION_META[o.col];
      commit({
        title: 'Delete permanently', danger: true, typed: 'delete', confirm: 'Delete for good',
        current: 'Archived · recoverable', proposed: 'Gone',
        rationale: `<strong>${esc(o.title)}</strong> and its ${VERSIONS(o).length} versions are removed. This cannot
          be undone and there is no restore afterwards.`,
        reversible: 'Not reversible. The audit trail keeps a record that it existed and who deleted it.',
        effects: [
          ['skip', 'Every version goes with it. Citations pointing here will break.'],
          ['warn', `${esc(COLLECTIONS[o.col])} keeps archived documents for ${Math.round(m.purge / 30)} months —
            this is ${o.upd < m.purge ? 'inside' : 'past'} that window.`]
        ],
        onRun: () => {
          [CORPUS, LIVE, ENTITLED].forEach((arr) => { const i = arr.indexOf(o); if (i > -1) arr.splice(i, 1); });
          docModal.close();
          render();
          markAfter('.rm-main');
          toast('Deleted', null, 'Permanent · logged to the audit trail');
          return true;
        }
      });
      return;
    }

    if (kind === 'restore') {
      commit({
        title: 'Restore from the archive', confirm: 'Restore',
        current: 'Archived', proposed: 'Live in ' + COLLECTIONS[o.col],
        rationale: `<strong>${esc(o.title)}</strong> returns to the live corpus with its trust state as it was —
          ${esc(STATUS[o.status].label.toLowerCase())}. Restoring does not change its condition.`,
        effects: [
          STATUS[o.status].excluded
            ? ['skip', 'It is ' + STATUS[o.status].label.toLowerCase() + ', so it still will not be used in answers.']
            : ['ok', 'It becomes available to answers again immediately.']
        ],
        onRun: () => { o.arch = false; docModal.close(); render(); markCard(o.id); }
      });
      return;
    }

    if (kind === 'successor') {
      const r = RELATED[o.id];
      if (r && r.supersededBy) patch({ doc: r.supersededBy, mode: 'view' });
      else pickRelated(o, 'successor');
      return;
    }
    if (kind === 'findsuccessor') { pickRelated(o, 'successor'); return; }

    /* Reconnecting is a change to a shared source, not to this document, so it
       is confirmed like one — and the re-sync it was standing in for runs
       straight after, because that is what you were trying to do. */
    if (kind === 'reconnect') {
      const src = SRC[o.src];
      const behind = LIVE.filter((x) => x.src === o.src && x.status === 'outdated');
      commit({
        title: 'Reconnect ' + src.label,
        current: src.note, proposed: 'Connected · syncing resumes',
        rationale: `<strong>${esc(src.label)}</strong> is not connected, so re-syncing <strong>${esc(o.title)}</strong>
          would queue and wait. Reconnecting is the thing that actually moves it.`,
        confirm: 'Reconnect it',
        effects: [
          ['ok', `<strong>${behind.length}</strong> document(s) from this source are behind it.`],
          ['ok', 'This document is pulled again as soon as the connection is back.'],
          ['skip', 'Nothing else is re-ingested now — the schedule handles the rest.']
        ],
        onRun: () => {
          const was = { health: src.health, note: src.note, code: src.code };
          src.health = 'ok';
          src.note = 'Reconnected just now · first sync queued';
          delete src.code;
          src.history.unshift([0, 'ok', 'Reconnected by ' + USER.owner + ' · ' + esc(o.title) + ' pulled']);
          src.last = 0;
          delete src.queued;
          const before = { upd: o.upd, work: o.work, versions: VERSIONS(o).slice() };
          o.upd = o.xu;
          if (o.work === 'failed') o.work = 'completed';
          addVersion(o, 'Re-synced from ' + src.label, src.label, 'pulled once the source reconnected');
          recompute();
          undoStack = () => { Object.assign(src, was); src.history.shift(); Object.assign(o, before); recompute(); render(); };
          render();
          markCard(o.id);
          markAfter('.rail-set');
          toast(src.label + ' reconnected', 'Undo', esc(o.title) + ' is up to date with it');
          return true;
        }
      });
      return;
    }

    /* ── The exits. Each one changes the fact the status is computed from, so
       the badge moves because the world moved, not because someone relabelled
       it. ── */

    if (kind === 'publish') {
      const agents = AGENTS.filter((a) => COLLECTION_META[o.col].grounding[a.id]);
      commit({
        title: 'Publish', confirm: 'Publish it',
        current: 'Draft', proposed: 'Live in ' + COLLECTIONS[o.col],
        rationale: `<strong>${esc(o.title)}</strong> becomes part of the collection and available to whatever is
          allowed to ground on it.`,
        effects: [
          agents.length
            ? ['warn', `<strong>${agents.map((a) => esc(a.name)).join(', ')}</strong> may start citing it immediately.`]
            : ['skip', 'No agent grounds on this collection, so nothing starts citing it.'],
          o.owner === 'Unassigned' ? ['warn', 'It has no owner. Publishing does not give it one.'] : null
        ].filter(Boolean),
        onRun: () => {
          const before = { work: o.work, upd: o.upd, versions: VERSIONS(o).slice() };
          o.work = 'completed';
          o.upd = 0;
          addVersion(o, 'Published', USER.owner, 'made live in ' + COLLECTIONS[o.col]);
          recompute();
          undoStack = () => { Object.assign(o, before); recompute(); render(); };
          /* Publishing leaves the editor. Staying in it meant the only feedback
             was a toast over an unchanged screen, which reads as nothing having
             happened — the card on the grid is where the result actually shows. */
          docModal.close();
          render();
          markCard(o.id);
          toast('Published', 'Undo', 'Live in ' + COLLECTIONS[o.col]);
          return true;
        }
      });
      return;
    }

    /* A contradiction is two documents, so resolving it is a choice between
       them rather than an edit to one. The loser is superseded by the winner —
       which is exactly what supersession means and why it already exists. */
    if (kind === 'compare' || kind === 'resolve') {
      const other = byId((RELATED[o.id] || { contradicts: [] }).contradicts[0]);
      /* Setting the status by hand says two documents disagree without saying
         which two. Falling back to opening this one answered a different
         question — the card said Compare and behaved like Open. Ask instead. */
      if (!other) { pickRelated(o, 'conflict'); return; }
      if (kind === 'compare') {
        canvas.close();
        canvas.ask('Compare ' + o.title + ' and ' + other.title,
          [o.title, other.title, 'Conflicting'],
          () => conflictAnswer(o, byId(RELATED[o.id].contradicts[0]) || other));
        return;
      }
      const winner = byId(o.id), loser = other;
      commit({
        title: 'Resolve the conflict', confirm: 'Make this the one',
        current: 'Both answering', proposed: esc(winner.title) + ' wins',
        rationale: `<strong>${esc(loser.title)}</strong> becomes superseded by <strong>${esc(winner.title)}</strong>.
          It stays readable and stops being used in answers.`,
        effects: [
          ['ok', 'Anyone following a link to the superseded one is told where the current one is.'],
          ['skip', esc(loser.title) + ' leaves answers. Nothing else changes.']
        ],
        onRun: () => {
          RELATED[loser.id] = Object.assign({ related: [], contradicts: [] }, RELATED[loser.id], { supersededBy: winner.id });
          RELATED[winner.id] = Object.assign({ related: [], contradicts: [] }, RELATED[winner.id], { contradicts: [] });
          recompute();
          render();
          markCard(winner.id);
          markCard(loser.id);
          toast('Resolved', null, esc(loser.title) + ' is superseded');
          return true;
        }
      });
      return;
    }

    return docActRest(kind, o, arg);
  }

  /* Which document does this one disagree with? The corpus knows what overlaps;
     it cannot know what contradicts, so this asks rather than guesses. Choosing
     records the contradiction on both sides and runs the real comparison. */
  /* Two questions, one shape: what does this disagree with, and what replaced
     this. Both are a relationship the corpus cannot infer — overlap is not
     disagreement and newer is not a replacement — so both ask, and choosing
     writes the relationship on BOTH documents. A one-sided link would leave the
     other one claiming to be unrelated. */
  const PICK = {
    conflict: {
      ask: (o) => 'What does ' + o.title + ' conflict with?',
      basis: (o) => [o.title, 'Conflicting', COLLECTIONS[o.col]],
      lead: 'Its status says it disagrees with something, but nothing records what.',
      none: 'Nothing else is in this collection, so there is nothing here it could contradict.',
      caveat: 'Overlap is not disagreement. Picking one records the contradiction on both documents, which is a statement about them — not a guess AiMY made.',
      verb: 'Compare with ',
      attr: (o, x) => `data-set-conflict="${o.id}:${x.id}"`,
      /* Anything in the collection that shares a tag. */
      pool: (o) => LIVE.filter((x) => x.id !== o.id && x.col === o.col)
    },
    successor: {
      ask: (o) => 'What replaced ' + o.title + '?',
      basis: (o) => [o.title, 'Superseded', COLLECTIONS[o.col]],
      lead: 'It is marked as replaced, but nothing records what replaced it.',
      none: 'Nothing in this collection is newer than it, so the replacement is not here.',
      caveat: 'Newer is not the same as replacing. Picking one records the supersession on both, so anyone following a link to this one is told where to go.',
      verb: 'This replaced it: ',
      attr: (o, x) => `data-set-successor="${o.id}:${x.id}"`,
      /* Only something newer can have replaced it. */
      pool: (o) => LIVE.filter((x) => x.id !== o.id && x.col === o.col && x.upd < o.upd)
    }
  };

  function pickRelated(o, kind) {
    const cfg = PICK[kind];
    const pool = cfg.pool(o);
    const near = pool.filter((x) => x.tags.some((tg) => o.tags.indexOf(tg) > -1)).slice(0, 4);
    const list = near.length ? near : pool.slice(0, 4);
    canvas.close();
    canvas.ask(cfg.ask(o), cfg.basis(o),
      `<div class="answer-surface">
        <div class="answer-body">
          <p>${cfg.lead}
          ${list.length
            ? (near.length
                ? 'These share its collection and its tags, so they are the ones most likely to cover the same ground:'
                : 'Nothing shares its tags. These are the rest of its collection:')
            : cfg.none}</p>
        </div>
        ${list.length ? `<div class="rs-list">${list.map((x) => typeCard(x, true)).join('')}</div>` : ''}
        <div class="trust-disclosure">
          <div class="td-row is-warn">${ICO.warn}<span class="td-text">${cfg.caveat}</span></div>
        </div>
        <div class="answer-apply">
          ${list.length
            ? list.map((x) => entryAction('investigate', cfg.verb + x.title, cfg.attr(o, x))).join('')
            : entryAction('review', 'Set the status back to automatic',
                `data-act="setstatus" data-obj="${o.id}" data-arg="auto"`)}
        </div>
      </div>`);
  }

  function docActRest(kind, o, arg) {
    /* Unused is a question, not a defect, so its exit is the two answers to it.
       "Keep" is a real outcome: it records the decision so the surface stops
       asking, which is what stops a briefing item becoming wallpaper. */
    /* "Is this worth keeping" cannot be answered by a yes/no box. It needs what
       else covers the same ground, who owns it and how it compares to the rest
       of its collection — so it is a conversation that ends in the choice. */
    if (kind === 'triage') {
      const overlap = LIVE.filter((x) => x.id !== o.id && x.col === o.col &&
        x.tags.some((tg) => o.tags.indexOf(tg) > -1)).slice(0, 3);
      const colAvg = (() => {
        const peers = LIVE.filter((x) => x.col === o.col);
        return Math.round(peers.reduce((n, x) => n + x.uses, 0) / Math.max(1, peers.length));
      })();
      canvas.ask('Is ' + o.title + ' still worth keeping?',
        [o.title, 'Unused', COLLECTIONS[o.col]],
        `<div class="answer-surface">
          <div class="answer-body">
            <p>Nothing has cited it in <strong>${Math.round(o.used / 30)} months</strong>. It was used
            ${o.uses} times in the last ninety days, against an average of ${colAvg} across
            ${esc(COLLECTIONS[o.col])}.</p>
            <p>${overlap.length
              ? 'These cover some of the same ground, which may be why nobody reaches for it:'
              : 'Nothing else in the collection covers the same tags, so this is the only thing on the subject.'}</p>
          </div>
          ${overlap.length ? `<div class="rs-list">${overlap.map((x) => typeCard(x, true)).join('')}</div>` : ''}
          <div class="trust-disclosure">
            <div class="td-row is-warn">${ICO.warn}<span class="td-text">Low usage is not evidence that it is wrong.
            ${overlap.length ? 'It may just be that the others are found first.' : 'It may be a subject nobody asks about yet.'}</span></div>
          </div>
          <div class="answer-apply">
            ${entryAction('review', 'Archive it', `data-act="archive" data-obj="${o.id}"`)}
            ${entryAction('direct', 'Keep it', `data-keep="${o.id}"`)}
            ${entryAction('direct', 'Open it', `data-open-doc="${o.id}"`)}
          </div>
        </div>`);
      return;
    }

    if (kind === 'keep') {
      o.statusSet = 'current';
      o.statusBy = USER.owner;
      recompute();
      render();
      undoStack = () => { delete o.statusSet; delete o.statusBy; recompute(); render(); };
      markCard(o.id);
      toast('Kept', 'Undo', 'Marked current by you — the flag is cleared');
      return;
    }

    /* Taking someone to the field beats telling them where it is. */
    if (kind === 'assign') {
      editorTab = 'props';
      patch({ doc: o.id, mode: 'edit' });
      setTimeout(() => {
        const dd = $('.v2-dropdown[data-prop-key="owner"] .v2-dropdown-btn');
        if (dd) { dd.scrollIntoView({ block: 'center' }); dd.focus(); }
      }, 120);
      return;
    }
    if (kind === 'source') { addFilter('source', o.src); return; }
    if (kind === 'open')   { patch({ doc: o.id, mode: 'view' }); return; }

    /* Set or clear the manual override. Same path from the editor and from
       chat, so the two cannot drift. */
    if (kind === 'setstatus') {
      const to = arg;
      if (!to || to === 'auto') {
        delete o.statusSet; delete o.statusBy;
      } else {
        o.statusSet = to; o.statusBy = USER.owner;
      }
      recompute();
      render();
      markCard(o.id);
      markAfter('.dv-head .trust-state, .dv-meta .trust-state', $('#docSheet'));
      toast(to && to !== 'auto' ? 'Status set to ' + STATUS[to].label : 'Status back to automatic',
        'Undo', to && to !== 'auto' ? 'Set by you, and marked as such' : 'Computed from the facts again');
      return;
    }

    if (kind === 'report') {
      /* Reporting is not editing. Switching modes took the document you were
         reading away from you as the reward for flagging it. The comment lands
         where comments live, and the record of it is on the document. */
      addComment(o, 'Reported a problem with this document.');
      recompute();
      render();
      markAfter('.comment:last-of-type', $('#docSheet'));
      markCard(o.id);
      toast('Reported', 'Undo', 'Added to the comments on this document');
      undoStack = () => { o.comments.pop(); render(); };
      return;
    }
  }

  /* New document — the mind map's manual Add.

     No confirmation. An empty draft commits nothing, changes nothing anyone
     else can see and is one click to discard, so a gate in front of it was
     ceremony around an action with no consequence. Every field it needs is in
     the editor's Properties panel, which is where you were going anyway. */
  let newSeq = 0;
  function newDocument(type, seed) {
    const t = TYPES[type] ? type : 'article';
    const id = 'new-' + (++newSeq);
    const doc = Object.assign({
      id: id, work: 'drafted', owner: USER.owner, t: t,
      title: 'Untitled ' + TYPES[t].label.toLowerCase(), col: USER.collections[0],
      src: 'upload', prod: 'copilot', client: '', tags: [], services: [], props: {},
      aud: ['admins', 'stakeholders'], region: 'global', arch: false,
      upd: 0, ing: 0, xc: 0, xu: 0, used: 0, uses: 0, sum: '', comments: [], versions: [],
      x: Object.assign({}, BLANK_X[t] || BLANK_X.article)
    }, seed || {});
    CORPUS.push(doc);
    LIVE.push(doc);
    ENTITLED.push(doc);
    recompute();
    editorTab = 'props';
    previewVer = null;
    patch({ doc: id, mode: 'edit' });
    return doc;
  }

  /* ── Files ──

     Text arrives as text; anything else records what was dropped and leaves the
     body for AiMY to draft into. Guessing a type from an extension is a guess,
     and the Properties panel is one click away to correct it. */
  const EXT_TYPE = { md: 'article', txt: 'article', doc: 'article', docx: 'article', pdf: 'asset',
                     ppt: 'asset', pptx: 'asset', png: 'asset', jpg: 'asset', jpeg: 'asset',
                     csv: 'icp', xlsx: 'icp', html: 'webpage', htm: 'webpage' };
  const TEXTY = /\.(md|txt|csv|html?|json)$/i;

  function ingestFiles(files) {
    const list = Array.from(files || []);
    if (!list.length) return;
    let first = null;
    list.forEach((f) => {
      const ext = (f.name.split('.').pop() || '').toLowerCase();
      const doc = newDocument(EXT_TYPE[ext] || 'article', {
        title: f.name.replace(/\.[^.]+$/, ''),
        props: { 'source-file': f.name, size: Math.max(1, Math.round(f.size / 1024)) + ' KB' }
      });
      first = first || doc;
      if (TEXTY.test(f.name)) {
        const reader = new FileReader();
        reader.onload = () => {
          doc.sum = String(reader.result).trim().slice(0, 400);
          recompute();
          if (readURL().doc === doc.id) renderEditor(readURL());
        };
        reader.readAsText(f);
      }
    });
    toast(list.length === 1 ? 'Added “' + list[0].name + '”' : 'Added ' + list.length + ' files',
      null, 'Draft, owned by you. Nothing is live until you say so.');
  }

  /* The drop layer covers the whole workbench. dragenter/dragleave fire on every
     child, so the depth counter is what stops it flickering as the pointer
     crosses a card. */
  function wireDrop() {
    const layer = $('#dropLayer');
    if (!layer) return;
    let depth = 0;
    const hasFiles = (e) => e.dataTransfer && Array.from(e.dataTransfer.types || []).indexOf('Files') > -1;
    document.addEventListener('dragenter', (e) => {
      if (!hasFiles(e)) return;
      depth++;
      layer.hidden = false;
      /* Reflow, not rAF — same as the document sheet. rAF does not run in a
         throttled tab, and this is the one layer whose whole job is to appear. */
      void layer.offsetWidth;
      layer.classList.add('open');
    });
    document.addEventListener('dragleave', (e) => {
      if (!hasFiles(e)) return;
      if (--depth > 0) return;
      depth = 0;
      layer.classList.remove('open');
      setTimeout(() => { if (!layer.classList.contains('open')) layer.hidden = true; }, 180);
    });
    document.addEventListener('dragover', (e) => { if (hasFiles(e)) e.preventDefault(); });
    document.addEventListener('drop', (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth = 0;
      layer.classList.remove('open');
      setTimeout(() => { layer.hidden = true; }, 180);
      ingestFiles(e.dataTransfer.files);
    });
  }

  /* Enough of each type's shape for the card and the viewer to render it before
     anyone has filled anything in. */
  const BLANK_X = {
    article:  { applies: '—' },
    ticket:   { requester: '—', status: 'Open', resolution: '—' },
    icp:      { segment: '—', fit: [], dis: [] },
    campaign: { objective: '—', window: '—', assets: '—' },
    asset:    { format: '—', usage: 'Internal only', approval: 'pending' },
    story:    { customer: '—', outcome: '—', quote: '', approval: 'pending' },
    blog:     { pub: 'Draft', canonical: '—', author: USER.owner },
    webpage:  { url: '—', crawl: '—', change: 'None' }
  };

  /* The card's one classified action. Each terminates in a completed action, a
     staged one, or a structured destination — never in "open". */
  function cardActRun(id) {
    const o = byId(id);
    if (!o) return;
    docAct(cardAction(o)[2], id);
  }

  /* ═══════════════════════════════════════════════
     BOOT
  ═══════════════════════════════════════════════ */
  function init() {
    canvas.init();
    docModal.init();
    setModal.init();
    wire();
    wireDrop();
    renderAiState();

    const u = $('#userName'), r = $('#userRole'), a = $('#userAvatar');
    if (u) u.textContent = USER.name;
    if (r) r.textContent = USER.role;
    if (a) a.textContent = USER.initials;

    render();

    /* The loading state resolves into the real surface, so the skeleton is a
       stage rather than a dead end. */
    if (forcedState === 'loading') setTimeout(() => { location.href = location.pathname; }, 2200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
