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
    box:      svg('<path d="M21 8v13H3V8"/><rect x="1" y="3" width="22" height="5" rx="1"/><path d="M10 12h4"/>'),
    send:     svg('<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>'),
    /* The same picture the drop layer draws, so choosing a file and dropping
       one read as the same capability rather than two. */
    upload:   svg('<path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/>')
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
    name: 'Nour Wael', initials: 'NW', role: 'Product Design',
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
      /* Not "Superseded 12 Mar 2026". That was the supersession written into a
         scope field, and once the card started reading the scope aloud it came
         out as "Applies to superseded 12 mar 2026". The status and the Replaced
         by edge already say it; this field says what it is for. */
      x:{ applies:'Sales teams — reference only' } },

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

  /* `used` counts days since the last citation, so 0 means "today" — except
     when nothing has ever cited it, where 0 is the absence of a date rather
     than a date. A document created a minute ago read "used today"; so did one
     nobody has ever opened. A zero is not a date. */
  const neverCited = (o) => !o.uses;

  const usedLabel = (o) => {
    if (neverCited(o)) return 'Never';
    if (o.used === 0) return 'Today';
    if (o.used === 1) return 'Yesterday';
    if (o.used < 30) return o.used + ' days ago';
    const m = Math.round(o.used / 30);
    return m + (m === 1 ? ' month ago' : ' months ago');
  };

  /* One phrase for "how much has anything used this", so the four places that
     say it cannot disagree — and so none of them has to special-case the zero. */
  const citedPhrase = (o) => neverCited(o)
    ? 'Never cited'
    : 'Cited ' + o.uses + ' times in 90 days — last ' + usedLabel(o).toLowerCase();

  /* Relationships. Kept out of the object bodies because they are a graph, and
     a graph half-stored on each node goes out of sync the first time one side
     is edited. */
  /* ═══════════════════════════════════════════════
     THE GRAPH

     This corpus has always been one. Every document carries typed edges — to a
     collection, a source, an owner, a client, a product, a region, its tags —
     and the product has only ever rendered them as filter dropdowns. That is
     the string reading of the data: `client` is a column and `nordwind` is a
     value in it. The other reading is Google's — things, not strings — where
     Nordwind is a thing with four documents, a success story, two tickets and
     an owner hanging off it.

     Nothing new is stored to get that. What changes is that the edges become
     addressable in both directions, and that an edge can say where it came
     from.

     TWO KINDS, and the distinction is the whole design.

     IMPLICIT edges are the fields themselves. They are derived, always true,
     cost nothing, and nobody asserted them — so nothing claims anybody did.

     ASSERTED edges are claims: this contradicts that, this replaced that.
     Somebody or something said so, and the edge carries who and when. That is
     Glean's point about edge properties, and it is the rule this product
     already holds for status — a computed fact and a claimed one must never
     look identical — finally applied to relationships too.
  ═══════════════════════════════════════════════ */
  const ENTITY = {
    doc:        { kind: 'Document',      filter: 'ids',        label: (id) => (byId(id) || {}).title || id },
    owner:      { kind: 'Person or team', filter: 'ids',       label: (id) => id },
    collection: { kind: 'Collection',    filter: 'collection', label: (id) => COLLECTIONS[id] || id },
    source:     { kind: 'Source',        filter: 'source',     label: (id) => (SRC[id] || {}).label || id },
    client:     { kind: 'Client',        filter: 'client',     label: (id) => CLIENTS[id] || id },
    product:    { kind: 'Product',       filter: 'product',    label: (id) => PRODUCTS[id] || id },
    region:     { kind: 'Region',        filter: 'region',     label: (id) => REGIONS[id] || id },
    service:    { kind: 'Service',       filter: 'service',    label: (id) => SERVICES[id] || id },
    tag:        { kind: 'Tag',           filter: 'tag',        label: (id) => id }
  };

  const entityLabel = (kind, id) => (ENTITY[kind] ? ENTITY[kind].label(id) : id) || id;

  /* Read straight off the document. The phrase is what gets rendered — the
     relationship is the sentence, not a label above a value. */
  const IMPLICIT = [
    { type: 'ownedBy',   to: 'owner',      phrase: 'Owned by',      get: (o) => o.owner ? [o.owner] : [] },
    { type: 'in',        to: 'collection', phrase: 'Filed in',      get: (o) => [o.col] },
    { type: 'from',      to: 'source',     phrase: 'Came from',     get: (o) => [o.src] },
    { type: 'about',     to: 'client',     phrase: 'About',         get: (o) => o.client ? [o.client] : [] },
    { type: 'serves',    to: 'product',    phrase: 'Answers for',   get: (o) => o.prod ? [o.prod] : [] },
    { type: 'covers',    to: 'region',     phrase: 'Covers',        get: (o) => o.region ? [o.region] : [] },
    { type: 'uses',      to: 'service',    phrase: 'Part of',       get: (o) => o.services || [] },
    { type: 'tagged',    to: 'tag',        phrase: 'Tagged',        get: (o) => o.tags || [] }
  ];

  /* Somebody claimed these. `by` and `at` are not decoration: an edge with no
     author is a fact, and an edge with one is an opinion, and the reader is
     owed the difference. */
  const ASSERTED = {
    contradicts:  { phrase: 'Disagrees with', inverse: 'contradicts',  tone: 'err' },
    supersededBy: { phrase: 'Replaced by',    inverse: 'supersedes' },
    supersedes:   { phrase: 'Replaces',       inverse: 'supersededBy' },
    related:      { phrase: 'Related to',     inverse: 'related' },
    /* Both halves of a one-way claim have to be entries, or looking at the far
       end falls through to the generic phrase. `references` used to name its
       inverse as prose — 'referenced by' — which is not a key, so a document
       that something else referenced said only "Related to" and lost the
       direction the claim was made in. */
    references:   { phrase: 'References',     inverse: 'referencedBy' },
    referencedBy: { phrase: 'Referenced by',  inverse: 'references' },
    /* The commonest real link in this corpus and the model could not hold it:
       a ticket that an article resolves. */
    answers:      { phrase: 'Answers',        inverse: 'answeredBy' },
    answeredBy:   { phrase: 'Answered by',    inverse: 'answers' }
  };

  /* Every live document has at least one of these. Eight edges across
     forty-two documents left thirty-four rails restating their own fields and
     calling it a graph. */
  const EDGES = [
    /* Refunds, returns and warranty — the conflict the product is built around. */
    { from: 'article-refund',        to: 'article-returns-faq', type: 'contradicts',  by: 'AiMY',       at: 12 },
    { from: 'article-refund',        to: 'article-warranty',    type: 'related',      by: 'A. Mahfouz', at: 40 },
    { from: 'article-returns-faq',   to: 'article-warranty',    type: 'related',      by: 'A. Mahfouz', at: 40 },
    { from: 'article-refund',        to: 'ticket-48120',        type: 'answers',      by: 'A. Mahfouz', at: 11 },
    { from: 'article-refund-2024',   to: 'article-refund',      type: 'supersededBy', by: 'A. Mahfouz', at: 120 },
    /* Residency, GDPR and the DPA. */
    { from: 'article-residency',     to: 'blog-residency',      type: 'related',      by: 'N. Wael',    at: 26 },
    { from: 'article-residency',     to: 'article-gdpr-dsr',    type: 'related',      by: 'N. Wael',    at: 26 },
    { from: 'article-residency',     to: 'ticket-51877',        type: 'answers',      by: 'N. Wael',    at: 20 },
    { from: 'article-retention',     to: 'ticket-49002',        type: 'answers',      by: 'Legal',      at: 33 },
    { from: 'article-dpa',           to: 'article-retention',   type: 'contradicts',  by: 'AiMY',      at: 7 },
    { from: 'page-security',         to: 'article-dpa',         type: 'references',   by: 'Marketing',  at: 44 },
    { from: 'asset-deck-security',   to: 'article-residency',   type: 'references',   by: 'Brand',      at: 30 },
    { from: 'asset-deck-security',   to: 'page-security',       type: 'references',   by: 'Brand',      at: 30 },
    { from: 'campaign-residency',    to: 'blog-residency',      type: 'references',   by: 'Marketing',  at: 22 },
    /* Onboarding, SSO and the SLA. */
    { from: 'article-sso',           to: 'ticket-51004',        type: 'answers',      by: 'O. Said',    at: 16 },
    { from: 'article-onboarding',    to: 'article-sso',         type: 'related',      by: 'O. Said',    at: 48 },
    { from: 'article-sla',           to: 'article-onboarding',  type: 'related',      by: 'O. Said',    at: 48 },
    { from: 'article-sla',           to: 'page-status',         type: 'contradicts',  by: 'AiMY',      at: 5 },
    /* Billing. */
    { from: 'article-billing',       to: 'ticket-52310',        type: 'answers',      by: 'N. Wael',    at: 14 },
    { from: 'page-pricing',          to: 'asset-pricing-sheet', type: 'references',   by: 'Marketing',  at: 18 },
    /* Voice. */
    { from: 'article-voice-handoff', to: 'ticket-52488',        type: 'answers',      by: 'O. Said',    at: 8 },
    { from: 'asset-voice-demo',      to: 'article-voice-handoff', type: 'references', by: 'Brand',      at: 24 },
    { from: 'blog-voice-draft',      to: 'article-voice-handoff', type: 'references', by: 'Marketing',  at: 6 },
    { from: 'campaign-q4-voice',     to: 'asset-voice-demo',    type: 'references',   by: 'Marketing',  at: 21 },
    /* Segments and the stories that prove them. */
    { from: 'article-churn-signals', to: 'icp-bpo',             type: 'supersededBy', by: 'O. Said',    at: 55 },
    { from: 'icp-bpo',               to: 'icp-bpo-apac',        type: 'related',      by: 'Sales Ops',  at: 60 },
    { from: 'story-nordwind',        to: 'ticket-48120',        type: 'references',   by: 'N. Wael',    at: 9 },
    { from: 'story-orbit',           to: 'icp-bpo',             type: 'references',   by: 'Sales Ops',  at: 35 },
    { from: 'story-meridian',        to: 'icp-healthcare',      type: 'references',   by: 'Sales Ops',  at: 28 },
    { from: 'story-tavola',          to: 'icp-retail-voice',    type: 'references',   by: 'Sales Ops',  at: 19 },
    /* Campaigns. */
    { from: 'campaign-q3',           to: 'asset-onepager',      type: 'references',   by: 'Marketing',  at: 50 },
    { from: 'campaign-q1-launch',    to: 'campaign-q3',         type: 'supersededBy', by: 'Marketing',  at: 90 },
    { from: 'blog-quality-scale',    to: 'story-nordwind',      type: 'references',   by: 'Marketing',  at: 38 }
  ];

  /* RELATED is now a PROJECTION of the edge list, not a second copy of it.
     Twenty call sites read it and every one of them still works; the four that
     used to mutate it go through assertEdge instead, so provenance cannot be
     forgotten by accident. */
  let RELATED = {};

  function rebuildRelated() {
    RELATED = {};
    const slot = (id) => (RELATED[id] = RELATED[id] || { related: [], contradicts: [] });
    EDGES.forEach((e) => {
      const a = slot(e.from), b = slot(e.to);
      if (e.type === 'contradicts') {
        if (a.contradicts.indexOf(e.to) < 0) a.contradicts.push(e.to);
        if (b.contradicts.indexOf(e.from) < 0) b.contradicts.push(e.from);
      } else if (e.type === 'supersededBy') {
        a.supersededBy = e.to;
        if (b.related.indexOf(e.from) < 0) b.related.push(e.from);
      } else if (e.type === 'supersedes') {
        b.supersededBy = e.from;
        if (a.related.indexOf(e.to) < 0) a.related.push(e.to);
      } else {
        if (a.related.indexOf(e.to) < 0) a.related.push(e.to);
        if (b.related.indexOf(e.from) < 0) b.related.push(e.from);
      }
    });
  }
  rebuildRelated();

  /* Claims go in and out through here, so every one of them carries an author
     and a date, and undoing one is exact. */
  function assertEdge(from, to, type, by) {
    dropEdge(from, to);
    EDGES.push({ from: from, to: to, type: type, by: by || USER.owner, at: 0 });
    rebuildRelated();
  }
  function dropEdge(from, to) {
    for (let i = EDGES.length - 1; i >= 0; i--) {
      const e = EDGES[i];
      if ((e.from === from && e.to === to) || (e.from === to && e.to === from)) EDGES.splice(i, 1);
    }
    rebuildRelated();
  }

  /* Everything connected to one thing, in both directions, as phrases.
     Returns [{ phrase, kind, id, label, by, at }] — the peek renders it
     straight, because the sentence IS the relationship. */
  function edgesOf(kind, id) {
    const out = [];
    const push = (phrase, k, target, e) => {
      if (!target) return;
      out.push({ phrase: phrase, kind: k, id: target, label: entityLabel(k, target),
                 by: e && e.by, at: e && e.at });
    };

    if (kind === 'doc') {
      const o = byId(id);
      if (!o) return out;
      EDGES.forEach((e) => {
        if (e.from === id) push((ASSERTED[e.type] || {}).phrase || e.type, 'doc', e.to, e);
        else if (e.to === id) {
          const inv = (ASSERTED[e.type] || {}).inverse;
          const ph = (ASSERTED[inv] || {}).phrase || 'Related to';
          push(ph, 'doc', e.from, e);
        }
      });
      IMPLICIT.forEach((r) => r.get(o).forEach((v) => push(r.phrase, r.to, v, null)));
      return out;
    }

    /* Any other entity: the documents that point at it, then what those
       documents have in common — which is how you get from a client to the
       person who owns everything about them without ever leaving the panel. */
    const rel = IMPLICIT.find((r) => r.to === kind);
    if (!rel) return out;
    const docs = ENTITLED.filter((o) => !o.arch && rel.get(o).indexOf(id) > -1);
    docs.forEach((o) => push('Includes', 'doc', o.id, null));
    const seen = {};
    IMPLICIT.forEach((r) => {
      if (r.to === kind) return;
      docs.forEach((o) => r.get(o).forEach((v) => {
        const key = r.to + ':' + v;
        if (seen[key]) return;
        seen[key] = 1;
        push(r.phrase === 'Owned by' ? 'Owned by' : r.phrase, r.to, v, null);
      }));
    });
    return out;
  }

  /* The documents an entity gathers — used for its count and for the URL that
     puts them on the surface. */
  function docsOf(kind, id) {
    if (kind === 'doc') return [byId(id)].filter(Boolean);
    const rel = IMPLICIT.find((r) => r.to === kind);
    return rel ? ENTITLED.filter((o) => !o.arch && rel.get(o).indexOf(id) > -1) : [];
  }

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

  /* `problem` marks a reported fault rather than a remark. The two read
     differently because they ask different things of the owner: one is a
     conversation, the other is a job. */
  function addComment(o, text, problem) {
    o.comments = (o.comments || []).concat([
      { who: USER.name, initials: USER.initials, when: 'just now', text: text, problem: !!problem }
    ]);
  }

  const openProblems = (o) => (o.comments || []).filter((c) => c.problem && !c.done).length;

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
    /* No mode. A document is one surface — reading and writing are the same
       act — so there is nothing for the URL to say about which one you are in.
       `?mode=edit` in an old link is simply ignored. */
    const st = { doc: p.get('doc') || '',
                 settings: p.get('settings') || '',
                 view: p.get('view') === 'tree' ? 'tree' : 'grid',
                 /* Which edge the tree walks. Every axis in the folder view is
                    an implicit edge type, so grouping by client IS traversing
                    the `about` edge — and like everything else, it is a link. */
                 group: GROUPS[p.get('group')] ? p.get('group') : 'col',
                 /* One named ordering, not a sort menu. It answers "what needs
                    a person first", which is the only ordering question this
                    surface has ever been asked.

                    Three values, two states. Absent means "whatever this
                    surface's default is" — attention for the composed landing
                    set, recency for a filtered one — so `recent` has to be
                    writable or the toggle would be dead in the one place the
                    default is already on. */
                 sort: /^(attention|recent)$/.test(p.get('sort') || '') ? p.get('sort') : '' };
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
    /* ── The canvas gets out of the way of its own results ──

       Anything that changes the page while the canvas is open was clicked IN
       the canvas — it is a full overlay, so nothing behind it is reachable —
       and the point of clicking it was to see what it did. This used to be ten
       scattered `canvas.close()` calls at ten call sites, which meant every new
       action arrived not closing it until somebody noticed.

       One rule at the funnel every URL change already goes through. `ask()`
       does not write the URL, so a follow-up answer still opens normally. */
    if (canvas && canvas.open) canvas.close();
    const p = new URLSearchParams();
    if (st.q) p.set('q', st.q);
    LIST_KEYS.forEach((k) => { if (st[k] && st[k].length) p.set(k, st[k].join(',')); });
    DATE_KEYS.forEach((k) => { if (st[k]) p.set(k, st[k]); });
    FLAG_KEYS.forEach((k) => { if (st[k]) p.set(k, '1'); });
    if (st.prop) p.set('prop', st.prop);
    if (st.doc) p.set('doc', st.doc);
    if (st.settings) p.set('settings', st.settings);
    if (st.view === 'tree') p.set('view', 'tree');
    if (st.group && st.group !== 'col') p.set('group', st.group);
    if (st.sort) p.set('sort', st.sort);
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
    if (Object.keys(changes).some((k) => ALL_KEYS.indexOf(k) > -1)) st.doc = '';
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
    /* Status leads, and then needScore breaks the tie. Ranking on needScore
       alone let the "+2 because it is yours" and the work state outweigh the
       status: an unowned document sat below four documents with nothing wrong,
       which is not what a control called Needs attention can mean. Severity
       first, then whose it is. */
    if (sort === 'attention') return s.sort((a, b) =>
      (NEED_SCORE[b.status] || 0) - (NEED_SCORE[a.status] || 0)
      || needScore(b) - needScore(a)
      || a.upd - b.upd);
    if (sort === 'title') return s.sort((a, b) => a.title.localeCompare(b.title));
    return s.sort((a, b) => a.upd - b.upd);           // most recently updated first
  }

  /* The landing set: what you own or touched, ranked by what needs you. The
     cap is stated on the surface rather than applied quietly — a list that
     hides its tail overstates how contained the problem is.

     The order is passed in rather than hard-coded, so one function decides it
     for every surface and the toggle is a live control here too. */
  function composedSet(sort) {
    const mine = LIVE.filter((o) => o.owner === USER.owner || USER.recent.indexOf(o.id) > -1);
    const rest = LIVE.filter((o) => mine.indexOf(o) === -1);
    return sortSet(mine, sort).concat(sortSet(rest, sort)).slice(0, COMPOSED_CAP);
  }

  /* Absent means "this surface's default": the composed set leads with what
     needs a person, a filtered set with what changed last. */
  const orderOf = (st, composed) => st.sort || (composed ? 'attention' : 'updated');

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

  /* Questions that arrived and found nothing. Rows rather than a sentence, so
     the briefing can report that there are none — which is a real condition and
     was an unreachable one while the count was written into the copy. */
  const ASKED = [
    { topic: 'Data residency in APAC', n: 3,
      prompt: 'Draft an article covering data residency for APAC enterprise contracts' },
    { topic: 'Refunds on annual plans', n: 1,
      prompt: 'Draft an article covering refunds on annual plans' }
  ];

  function sinceLastVisit() {
    const out = [];
    const since = (o) => o.upd <= LAST_VISIT;

    const failing = Object.keys(SRC).filter((k) => SRC[k].health === 'failed');
    const stale = failing.length ? LIVE.filter((o) => failing.indexOf(o.src) > -1).length : 0;
    /* Only when it has cost something. With nothing drawn from a dead source
       this read "Zendesk stopped syncing. 0 documents have not updated since.
       Show them" over a filter that matches nothing — a briefing entry whose
       action is a dead end. The Sources block below states every source's
       health and carries Reconnect; the briefing is for consequences. */
    if (stale) {
      out.push({
        id: 'source', tone: 'err',
        text: `${failing.map((k) => SRC[k].label).join(' and ')} stopped syncing. ${stale} document${stale === 1 ? ' has' : 's have'} not updated since.`,
        action: 'Show them', mode: 'direct', href: { source: failing }, ask: ['source', failing[0]]
      });
    }

    /* Somebody said a document is wrong — the only entry here a PERSON put
       there rather than the system deriving it. It sits with the rest in
       severity order, below a source that has stopped feeding eleven documents
       and above what is merely stale. Without it a report went into a comment
       thread nobody had a reason to open, which is the same as nowhere. */
    const reported = LIVE.filter((o) => openProblems(o));
    if (reported.length) {
      const n = reported.reduce((s, o) => s + openProblems(o), 0);
      out.push({
        id: 'reported', tone: 'err',
        text: n === 1
          ? `Somebody reported a problem with ${reported[0].title}.`
          : `${n} reported problems across ${reported.length} document${reported.length === 1 ? '' : 's'}.`,
        action: reported.length === 1 ? 'Open it' : 'Show them', mode: 'review',
        doc: reported.length === 1 ? reported[0].id : null,
        href: reported.length === 1 ? null : { ids: reported.map((o) => o.id) }
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

    /* This was one hard-coded sentence, pushed unconditionally — which made a
       briefing with nothing in it impossible, and the empty state below it
       unreachable. A count that is always three is not a count. */
    if (ASKED.length && LIVE.length) {
      const asked = ASKED.reduce((s, a) => s + a.n, 0);
      const lead = ASKED.slice().sort((a, b) => b.n - a.n)[0];
      out.push({
        id: 'gap', tone: 'warn',
        text: `${asked} question${asked === 1 ? '' : 's'} came in that nothing here answers. ${lead.topic} leads.`,
        /* No filter target: a gap is the absence of a document. */
        action: 'Draft one', mode: 'prompt', prompt: lead.prompt
      });
    }

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
           to read — which is the thing a briefing exists to have done for you.

           And a briefing with nothing in it still has something to say. The
           heading over an empty list read as a rail that had failed to load;
           "nothing needs you" is the best news this panel can carry and it was
           the one state it could not report. -->
      ${(() => {
        const news = sinceLastVisit();
        if (!news.length) {
          return `<p class="brief-quiet">Nothing changed and nothing needs a person.
            The library is as you left it.</p>`;
        }
        return `<div class="brief-list">${news.slice(0, 5).map((b) => `
        <div class="brief-entry is-${b.tone}">
          <p class="brief-text">${esc(b.text)}</p>
          <button class="brief-go" data-entry-mode="${b.mode}" ${b.doc
            ? `data-open-doc="${esc(b.doc)}"`
            : b.href ? `data-brief-filter="${esc(b.id)}"` : `data-brief-prompt="${esc(b.prompt)}"`}>${esc(b.action)}</button>
        </div>`).join('')}</div>`;
      })()}

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


  /* ═══════════════════════════════════════════════
     THE BELL — what is still waiting on a person

     The rail says what CHANGED since Thursday. The bell says what is still
     OUTSTANDING, which is a different question and the only one worth putting
     a dot on the chrome for: a source that came back and a document that was
     published both leave the rail's story true and this one's false.

     Both read the same model, so the two can never contradict each other, and
     neither is a hand-written list that survives what it describes being
     fixed. The bell it replaces carried a hard-coded "3 notifications" and a
     red dot with nothing behind it — a count that is always three is not a
     count, and a dot nothing can clear is not a signal.

     Every row ends somewhere real, and which route it takes is the row's own
     business: a single report opens that document, a set becomes the surface,
     a question goes to the canvas. That is the same four-route contract the
     input bar honours, so the panel is not a fifth way to do things.
  ═══════════════════════════════════════════════ */
  function needsYou() {
    const out = [];
    const withStatus = (s) => LIVE.filter((o) => o.status === s);
    /* Counts here are the corpus's, not a fixture's, so every one of them can
       legitimately be 1 — and a row reading "1 documents" is a row nobody
       believes the rest of. */
    const docs = (n) => n + (n === 1 ? ' document' : ' documents');
    const is = (n, one, many) => (n === 1 ? one : many);

    /* A dead source leads whether or not it has cost a document yet: it is the
       only entry here that keeps getting worse while you read the others. */
    const failing = Object.keys(SRC).filter((k) => SRC[k].health === 'failed');
    if (failing.length) {
      const names = failing.map((k) => SRC[k].label);
      const starved = LIVE.filter((o) => failing.indexOf(o.src) > -1);
      out.push({
        id: 'source', sev: 'p1', type: 'Sync blocked',
        when: failing.length === 1 ? SRC[failing[0]].last + 'd down' : failing.length + ' sources',
        body: names.join(' and ') + ' stopped syncing. ' + (starved.length
          ? docs(starved.length) + ' ' + is(starved.length, 'has', 'have') + ' not updated since.'
          : 'Nothing here is drawn from them yet.'),
        why: 'It is the only one that keeps getting worse while you read the rest.',
        cta: 'Why it stopped',
        ids: starved.map((o) => o.id),
        go: () => submit('Which sources stopped syncing, and what has it cost?')
      });
    }

    /* The one entry a PERSON put here. Everything else is derived, which is
       exactly why this cannot be left to sort itself out. */
    const reported = LIVE.filter((o) => openProblems(o));
    if (reported.length) {
      const n = reported.reduce((a, o) => a + openProblems(o), 0);
      out.push({
        id: 'reported', sev: 'p1', type: 'Reported',
        when: n + ' open',
        body: n === 1
          ? 'Somebody reported a problem with ' + reported[0].title + ', and nobody has answered it.'
          : n + ' reported problems across ' + docs(reported.length) + ' are unanswered.',
        why: 'A person put it there, so nothing but a person will clear it.',
        cta: reported.length === 1 ? 'Open the report' : 'Show them',
        ids: reported.map((o) => o.id),
        go: () => reported.length === 1
          ? patch({ doc: reported[0].id })
          : patch({ ids: reported.map((o) => o.id) })
      });
    }

    const conflicting = withStatus('conflicting');
    if (conflicting.length) {
      out.push({
        id: 'conflicting', sev: 'p1', type: 'Conflict',
        when: docs(conflicting.length),
        body: docs(conflicting.length) + ' ' + is(conflicting.length, 'disagrees', 'disagree')
          + ' with another document, and answers still stand on both sides.',
        why: 'Two answers to one question is worse than none, because both look confident.',
        cta: 'Compare them',
        ids: conflicting.map((o) => o.id),
        go: () => submit('Which documents contradict each other, and which one should win?')
      });
    }

    const outdated = withStatus('outdated');
    if (outdated.length) {
      out.push({
        id: 'outdated', sev: 'p2', type: 'Behind source',
        when: docs(outdated.length),
        body: docs(outdated.length) + ' ' + is(outdated.length, 'is', 'are')
          + ' behind their source. Answers still cite them, and say so.',
        why: 'Wrong, but not getting wronger — and a blocked source is why some of it is.',
        cta: 'Re-sync them',
        ids: outdated.map((o) => o.id),
        go: () => submit('Which documents are out of date against their source?')
      });
    }

    const drafted = withStatus('draft');
    if (drafted.length) {
      out.push({
        id: 'drafts', sev: 'p2', type: 'Not live',
        when: drafted.length + ' drafted',
        body: 'AiMY drafted ' + docs(drafted.length) + '. ' + is(drafted.length,
          'It answers nothing until you publish it.',
          'None of them answers anything until you publish them.'),
        why: 'Work already done that nobody can reach yet — the cheapest thing on this list to finish.',
        cta: is(drafted.length, 'Read the draft', 'Read the drafts'),
        ids: drafted.map((o) => o.id),
        /* Status is a LIST key — a bare string writes nothing and the row
           becomes a button that quietly does not work. */
        go: () => patch({ status: ['draft'] })
      });
    }

    const unowned = withStatus('unowned');
    if (unowned.length) {
      out.push({
        id: 'unowned', sev: 'p2', type: 'Unowned',
        when: docs(unowned.length),
        body: docs(unowned.length) + ' ' + is(unowned.length, 'has', 'have')
          + ' nobody accountable for ' + is(unowned.length, 'it', 'them') + '.',
        why: 'Every other line on this list needs somebody to send it to.',
        cta: is(unowned.length, 'Who should own it', 'Who should own them'),
        ids: unowned.map((o) => o.id),
        go: () => submit('Which documents are unowned, and who should own each one?')
      });
    }

    /* A gap is the absence of a document, so there is nothing to filter to and
       the row stages a write rather than running one. */
    if (ASKED.length && LIVE.length) {
      const asked = ASKED.reduce((s, a) => s + a.n, 0);
      const lead = ASKED.slice().sort((a, b) => b.n - a.n)[0];
      out.push({
        id: 'gap', sev: 'p3', type: 'Coverage gap',
        when: asked + ' asked',
        body: asked + ' question' + (asked === 1 ? '' : 's') + ' came in that nothing here answers. '
          + lead.topic + ' leads.',
        why: 'Nothing on the surface would ever have said so — an absence has no card.',
        cta: 'Draft the answer',
        ids: [],
        go: () => canvas.stage(lead.prompt, ['Coverage gap', asked + ' unanswered questions', 'Nothing to filter to'])
      });
    }

    const unused = withStatus('unused');
    if (unused.length) {
      out.push({
        id: 'unused', sev: 'p3', type: 'Unused',
        when: 'no citations',
        body: docs(unused.length) + ' ' + is(unused.length, 'has', 'have')
          + ' not been cited or opened in three months.',
        why: 'Either dead weight or a gap in how people find things, and both are worth a look.',
        cta: is(unused.length, 'Triage it', 'Triage them'),
        ids: unused.map((o) => o.id),
        go: () => submit('Which documents has nobody used, and are any worth keeping?')
      });
    }

    return out;
  }

  /* The panel's own action, and the one question it cannot answer by listing
     itself again. Severity order is the answer, so the answer says why that is
     the order rather than restating the rows. */
  function triageAnswer() {
    const q = needsYou();
    if (!q.length) return `<div class="answer-surface">
      <div class="answer-body">
        <p>Nothing is waiting on you. Everything you can see is owned, in use, matching its
        source, and nothing disagrees with anything else.</p>
      </div>
    </div>`;
    const lead = q[0], rest = q.slice(1);
    return `<div class="answer-surface">
      <div class="answer-body">
        <p><strong>${esc(lead.type)}, first.</strong> ${esc(lead.body)} ${esc(lead.why)}</p>
        ${rest.length ? `<p>Then, in this order:</p>` +
          rest.map((t) => `<p><strong>${esc(t.type)}</strong> — ${esc(t.body)} ${esc(t.why)}</p>`).join('') : ''}
        <p>That order is severity, not age: what is still getting worse comes before what is
        merely wrong, and what is merely wrong comes before what is only untidy.</p>
      </div>
      ${lead.ids.length ? applyBtn(lead.ids, 'Show what the first one covers') : ''}
    </div>`;
  }

  const bell = {
    btn: null, panel: null, list: null, dot: null, count: null, open: false, read: {},

    init() {
      this.btn = $('#ntfBell');
      this.panel = $('#ntfPanel');
      this.list = $('#ntfList');
      if (!this.btn || !this.panel || !this.list) return;
      this.dot = $('#ntfDot');
      this.count = $('#ntfCount');

      this.btn.addEventListener('click', (e) => { e.stopPropagation(); this.toggle(); });

      const clear = $('#ntfClear');
      if (clear) clear.addEventListener('click', () => {
        needsYou().forEach((t) => { this.read[t.id] = true; });
        this.paint();
        this.sync();
      });

      const askAll = $('#ntfAskAll');
      if (askAll) askAll.addEventListener('click', () => {
        this.close();
        canvas.ask('Across everything waiting on me right now, what should I do first and why?',
          ['Source health', 'Reported problems', 'Every status in the library'], () => triageAnswer());
      });

      /* Chrome that survives you clicking the work behind it is a modal
         pretending not to be one. Escape is handled in the canvas's chain,
         where every dismissable layer on this page is ordered once. */
      document.addEventListener('click', (e) => {
        if (!this.open || this.panel.contains(e.target) || this.btn.contains(e.target)) return;
        this.close();
      });

      document.addEventListener('keydown', (e) => {
        if (!this.open || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
        const items = $$('.ntf-row-cta', this.list);
        if (!items.length) return;
        e.preventDefault();
        const i = items.indexOf(document.activeElement);
        if (i === -1) { items[0].focus(); return; }
        items[e.key === 'ArrowDown' ? (i + 1) % items.length
                                    : (i - 1 + items.length) % items.length].focus();
      });

      this.sync();
    },

    /* The dot and the count are DERIVED, on every render, from the same corpus
       the surface is drawing. Publish the drafts and the number goes down
       without anything having to remember to tell it. */
    sync() {
      if (!this.btn) return;
      const n = needsYou().filter((t) => !this.read[t.id]).length;
      if (this.count) { this.count.textContent = n; this.count.hidden = n === 0; }
      if (this.dot) this.dot.hidden = n === 0;
      this.btn.setAttribute('aria-label', n === 0
        ? 'Notifications, nothing waiting on you'
        : 'Notifications, ' + n + ' waiting on you');
      if (this.open) this.paint();
    },

    paint() {
      const q = needsYou();
      this.list.innerHTML = '';
      if (!q.length) {
        const empty = document.createElement('li');
        empty.className = 'ntf-empty';
        empty.textContent = 'Nothing is waiting on you.';
        this.list.appendChild(empty);
        return;
      }
      q.forEach((t) => {
        const li = document.createElement('li');
        li.className = 'ntf-row' + (this.read[t.id] ? ' is-read' : '');
        li.innerHTML =
          `<span class="ntf-sev ${t.sev}" aria-hidden="true"></span>
           <div class="ntf-row-main">
             <div class="ntf-row-head">
               <span class="ntf-row-type">${esc(t.type)}</span>
               <span class="ntf-row-when">${esc(t.when)}</span>
             </div>
             <p class="ntf-row-body">${esc(t.body)}</p>
             <button class="ntf-row-cta" type="button">${esc(t.cta)}</button>
           </div>`;
        $('.ntf-row-cta', li).addEventListener('click', () => this.start(t));
        this.list.appendChild(li);
      });
    },

    /* Acting on a row is what marks it read — there is no separate gesture for
       saying you have seen something you are about to deal with. The panel goes
       first, so it cannot be left floating over whatever the row just opened. */
    start(t) {
      this.read[t.id] = true;
      this.close();
      t.go();
    },

    toggle() { if (this.open) this.close(true); else this.show(); },

    show() {
      this.paint();
      this.panel.hidden = false;
      this.open = true;
      this.btn.setAttribute('aria-expanded', 'true');
      const first = $('.ntf-row-cta', this.list);
      if (first) first.focus();
    },

    close(returnFocus) {
      if (!this.panel || !this.open) return;
      this.panel.hidden = true;
      this.open = false;
      this.btn.setAttribute('aria-expanded', 'false');
      if (returnFocus) this.btn.focus();
      this.sync();
    }
  };


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



  /* ── The card ──

     Two labelled facts per type, chosen as the two a reader needs before they
     decide whether to open it. A Ticket without its resolution is useless; an
     ICP without its region and services is not an ICP; a Success Story without
     its client is an anecdote. The full record is one click away in the modal,
     so the card's job is to be scannable, not complete. */

  /* One classified action per card, chosen by what the object actually needs. */
  /* ═══════════════════════════════════════════════
     FACTS ARE PHRASES

     `REQUESTER` over `Nordwind GmbH` is two things to read where one would do,
     and the shouting 9px uppercase run was carrying a hierarchy that size,
     weight and position are for. A fact says itself now: *Raised by Nordwind
     GmbH*. Fewer words on screen, not more.

     Where the value is already a badge — a status, an approval — the badge
     stands alone. A coloured pill reading *Resolved* does not need the word
     STATUS above it.

     One table, used by the card (first two) and by the document's rail (all).
     They cannot drift apart because there is nothing to keep in step.
  ═══════════════════════════════════════════════ */
  const TYPE_FACTS = {
    article:  (o) => ['Applies to ' + esc(o.x.applies).toLowerCase(),
                      neverCited(o) ? 'Never cited' : 'Last cited ' + esc(usedLabel(o).toLowerCase())],
    ticket:   (o) => ['Raised by ' + esc(o.x.requester),
                      o.x.status === 'Resolved' ? 'Resolved' : 'Still open',
                      o.x.resolution && o.x.resolution !== '—' ? 'Closed with ' + esc(o.x.resolution).replace(/\.$/, '') : ''],
    icp:      (o) => ['Covers ' + esc(REGIONS[o.region]),
                      o.services.length ? 'Part of ' + esc(o.services.map((s) => SERVICES[s].toLowerCase()).join(' and ')) : '',
                      o.x.segment && o.x.segment !== '—' ? 'Segment: ' + esc(o.x.segment) : ''],
    campaign: (o) => ['Ran ' + esc(o.x.window),
                      'Aimed at ' + esc(o.x.objective).toLowerCase(),
                      o.x.assets && o.x.assets !== '—' ? esc(o.x.assets) : ''],
    asset:    (o) => [esc(o.x.format) + ' — ' + esc(o.x.usage).toLowerCase(),
                      o.x.approval === 'approved' ? 'Cleared for use' : 'Approval still pending'],
    story:    (o) => ['About ' + esc(CLIENTS[o.client] || 'no named client'),
                      'Outcome: ' + esc(o.x.outcome),
                      o.x.approval === 'approved' ? 'Cleared to quote' : 'Not cleared to quote'],
    blog:     (o) => [o.x.pub === 'Published' ? 'Published' : esc(o.x.pub),
                      'Written by ' + esc(o.x.author),
                      o.x.canonical && o.x.canonical !== '—' ? 'Canonical at ' + esc(o.x.canonical) : ''],
    webpage:  (o) => ['Crawled ' + esc(o.x.crawl),
                      o.x.change === 'None' ? 'Unchanged since the last crawl' : esc(o.x.change) + ' since the last crawl',
                      o.x.url && o.x.url !== '—' ? esc(o.x.url) : '']
  };

  const typeFacts = (o) => (TYPE_FACTS[o.t] || (() => []))(o).filter(Boolean);

  /* What the document says about itself, beyond its type. Phrases, in the
     order somebody would ask them. */
  const docFacts = (o) => [
    ownerPhrase(o),
    'Updated ' + esc(fmtDate(o.upd)),
    o.client ? 'About ' + esc(CLIENTS[o.client]) : '',
    o.prod ? 'Answers for ' + esc(PRODUCTS[o.prod]) : '',
    'Visible to ' + esc(o.aud.map((a) => AUDIENCE[a].toLowerCase()).join(' and ')),
    o.tags.length ? 'Tagged ' + esc(o.tags.join(', ')) : ''
  ].filter(Boolean);

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

  /* Status as ink, not as a pill above the title. The dot and the word take the
     status tone and sit INSIDE the meta line, where colour and weight carry
     them without outranking the document's name — the same move GitHub makes
     for open and closed. The card's left edge takes the tone too, so a
     screenful reads at a glance and a document with nothing wrong stays quiet. */
  function statusInk(o) {
    const s = STATUS[o.status];
    return `<span class="tc-st" title="${esc(o.statusSet
      ? 'Set by ' + (o.statusBy || USER.owner) + '. ' + s.why : s.why)}"><i class="tc-dot"></i>${esc(s.label)}` +
      `${o.statusSet ? '<span class="pin-dot" aria-label="set by hand"></span>' : ''}</span>`;
  }

  /* ── Three tiers, not five rows ──

     The card used to stack a type row, a status pill, a title, two identically
     styled facts and an owner: six runs, four of them within 3px and two of
     them byte-identical, so it read as a grey ladder with a bigger rung in the
     middle. What every list of this kind settles on — GitHub's issue rows,
     Linear, Gmail, Notion's database cards — is the opposite rule: metadata
     collapses onto ONE dim line and never becomes rows that compete.

     So: the title first and alone, one line of the document's own words under
     it, and everything else — status, type, owner, last use — on a single
     middot line at 11px. Each tier differs from its neighbour in at least two
     of size, weight, colour and position, which is what makes the hierarchy
     legible without a single label.

     One footer, not two. The library's card ends with a bordered, tinted
     `.tc-gov` strip followed by a bordered `.tc-action` strip holding a
     full-width button — two rules and a banner where one row does the job. */
  function typeCard(o, compact) {
    const t = TYPES[o.t];
    const act = cardAction(o);
    const snip = compact ? '' : (typeFacts(o)[0] || '');
    const meta = [
      statusInk(o),
      `<span class="tc-kind">${t.ico}${esc(t.label)}</span>`,
      /* Some documents carry an ingestion marker in the owner field rather than
         a person — "Ingested · Zendesk" — which on a middot-separated line reads
         as two more items and pointed the peek at an owner that does not exist.
         Same test the document's byline uses. */
      hasOwner(o)
        ? `<button class="tc-who" data-peek="owner:${esc(o.owner)}">${esc(o.owner)}</button>`
        /* When the STATUS is already Unowned the phrase would say it twice on
           one line. It still earns its place on a draft or an out-of-date
           document, where nobody being accountable is the second finding. */
        : o.status === 'unowned' ? ''
        : `<span class="tc-who is-none">${o.owner === 'Unassigned' ? 'nobody owns it' : 'no owner'}</span>`,
      /* Both dates, because they answer different questions and one is not the
         other: a document edited last week can still be one nobody has cited in
         four months, and that gap IS the finding. Edited takes a date because
         it is a point in time; used takes a distance because the question is
         how long it has been. */
      compact ? '' : `<span>edited ${esc(fmtDate(o.upd))}</span>`,
      compact ? '' : `<span>${neverCited(o) ? 'never used' : 'used ' + esc(usedLabel(o).toLowerCase())}</span>`
    ].filter(Boolean);
    /* The whole card opens the document. The title stays a real button so the
       keyboard has one focusable target that announces which document it is —
       wrapping the card itself in a button would swallow the action inside it,
       and nested buttons are invalid besides. */
    return `<div class="type-card${compact ? ' is-compact' : ''}" data-obj="${o.id}" data-status="${o.status}"
         data-work-state="${o.work}" data-card-open="${o.id}">
      <button class="tc-title-btn" data-open-doc="${o.id}"><span class="tc-title">${esc(o.title)}</span></button>
      ${snip ? `<p class="tc-snip">${snip}</p>` : ''}
      <p class="tc-meta">${meta.join('<i class="tc-sep">·</i>')}</p>
      ${compact ? '' : `<div class="tc-foot">
        <span class="tc-foot-act">${entryAction(act[0], act[1], `data-card-act="${o.id}"`)}</span>
      </div>`}
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
        <!-- One ordering, named after the question it answers. A real control
             on every surface, including the landing set, where it starts on and
             turning it off gives you what changed last. It was a dead label
             there, which is the worst place for a dead control. -->
        <button class="rm-sort${orderOf(st, composed) === 'attention' ? ' is-on' : ''}"
                type="button" data-sort-attention
                aria-pressed="${orderOf(st, composed) === 'attention'}">
          ${ICO.flag ? ICO.flag.replace('<svg', '<svg width="12" height="12"') : ''}Needs attention</button>
        <!-- Two readings of one set. The library's segmented control, so it
             reads as a view switch rather than as an action. -->
        <div class="seg rm-views" role="group" aria-label="How to show these">
          ${VIEWS.map(([v, label]) => `<button class="seg-btn${(st.view || 'grid') === v ? ' active' : ''}"
            type="button" data-view="${v}" aria-pressed="${(st.view || 'grid') === v}">
            ${(v === 'tree' ? ICO.folder : ICO.grid).replace('<svg', '<svg width="12" height="12"')}${esc(label)}</button>`).join('')}
        </div>
        <!-- AFTER the switch, not before it. Rendered first, the picker moved
             the switcher 141px right the moment you chose Folders — out from
             under the pointer that had just clicked it. It is a sub-option OF
             Folders, so it belongs downstream of the control that turns it on,
             where it can appear and disappear without moving anything. -->
        ${st.view === 'tree' ? groupPicker(st) : ''}
        <!-- No file control here. The result line is about the set you are
             looking at, and New document is the one action that belongs to it.
             Starting from a file is reachable where you are already starting
             something — the blank document's row — and by dropping one, which
             works on this page and says what it will do. -->
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
     THE TREE — the graph, walked one edge at a time

     A second view, not a second product. Whatever the filters say is what the
     tree contains, so switching between grid and tree keeps your place and
     changes only the shape of what you are looking at.

     The hierarchy used to be hard-coded Collection → Type → document, which is
     one traversal of a graph that has eight axes, frozen. It is a **grouping**
     now, and every axis in the list is an implicit edge type: grouping by
     client is walking the `about` edge, grouping by owner is walking `ownedBy`.
     A folder view over a knowledge graph is not a filing cabinet, it is a
     choice of which relationship to see the corpus through, and `?group=` is
     where that choice lives.

     Three things make it a graph rather than a re-sort. The group headers are
     entities — the name opens the peek, so a folder can tell you what it IS.
     Documents with no value on the axis get their own honest group instead of
     being dropped. And each document carries its asserted edges on the line
     beneath it, so the connections are visible in the structure rather than
     one click away inside each document.

     Built on the library's `.tree`, which is native <details>, so it needs no
     state of its own and survives a re-render open.
  ═══════════════════════════════════════════════ */
  const GROUPS = {
    col:    { label: 'Collection', kind: 'collection', of: (o) => o.col,
              none: 'Not filed anywhere', order: () => USER.collections },
    client: { label: 'Client',     kind: 'client',     of: (o) => o.client, none: 'Not about any client' },
    prod:   { label: 'Product',    kind: 'product',    of: (o) => o.prod,   none: 'Answers for no product' },
    owner:  { label: 'Owner',      kind: 'owner',      of: (o) => o.owner,  none: 'Nobody owns it' },
    src:    { label: 'Source',     kind: 'source',     of: (o) => o.src,    none: 'From nowhere' },
    region: { label: 'Region',     kind: 'region',     of: (o) => o.region, none: 'Covers no region' },
    t:      { label: 'Type',       kind: null,         of: (o) => o.t,      none: 'Untyped' }
  };

  /* The second level is Type, unless Type is already the first — then it is
     Collection, because a level that repeats the one above it is a level that
     says nothing. */
  const subGroup = (g) => (g === 't' ? 'col' : 't');

  const groupName = (g, id) => !id ? GROUPS[g].none
    : GROUPS[g].kind ? entityLabel(GROUPS[g].kind, id)
    : (TYPES[id] || {}).label || id;

  /* Narrowing the surface to a group. Most axes are filter keys; owner is not
     — there is no `owner` in the URL — so it narrows by identity instead,
     which is the same result reached the only way the model allows. */
  function groupFilterAttr(g, id, docs) {
    if (!id) return '';
    const f = GROUPS[g].kind && ENTITY[GROUPS[g].kind].filter;
    if (g === 't') return `data-open-axis="type:${esc(id)}"`;
    if (!f || f === 'ids') return `data-apply-ids="${docs.map((d) => d.id).join(',')}"`;
    return `data-open-axis="${f}:${esc(id)}"`;
  }

  /* A document's claims, on the line beneath it. Only the asserted ones: the
     implicit edges are the tree's own structure and repeating them here would
     print the folder name inside every folder. */
  function treeEdges(o) {
    const out = [];
    EDGES.forEach((e) => {
      if (e.from === o.id) out.push([(ASSERTED[e.type] || {}).phrase || e.type, e.to]);
      else if (e.to === o.id) {
        const inv = (ASSERTED[e.type] || {}).inverse;
        out.push([(ASSERTED[inv] || {}).phrase || 'Related to', e.from]);
      }
    });
    if (!out.length) return '';
    return `<p class="ws-tree-edges">${out.map(([phrase, id]) =>
      `<button class="ws-tree-edge" data-open-doc="${esc(id)}">
        <em>${esc(phrase)}</em> ${esc(entityLabel('doc', id))}</button>`).join('')}</p>`;
  }

  function bucket(docs, g) {
    const by = {};
    docs.forEach((o) => { (by[GROUPS[g].of(o) || ''] = by[GROUPS[g].of(o) || ''] || []).push(o); });
    const pref = (GROUPS[g].order ? GROUPS[g].order() : []).filter((k) => by[k]);
    /* Preferred order first, then whatever else the filter dragged in, and the
       group with no value last — it is a finding, not a heading, and it belongs
       at the end where a finding goes. */
    return pref
      .concat(Object.keys(by).filter((k) => k && pref.indexOf(k) < 0).sort((a, b) =>
        groupName(g, a).localeCompare(groupName(g, b))))
      .concat(by[''] ? [''] : [])
      .map((k) => [k, by[k]]);
  }

  function renderTree(st, list) {
    const g = GROUPS[st.group] ? st.group : 'col';
    const sub = subGroup(g);
    const top = bucket(list, g);

    return `<div class="tree ws-tree">
      ${top.map(([id, docs]) => {
        const needs = docs.filter((o) => STATUS[o.status].tone !== 'verified').length;
        const name = groupName(g, id);
        return `<details class="ws-tree-col"${top.length <= 2 ? ' open' : ''}>
          <summary>
            <svg class="tree-chev" width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>
            ${ICO.folder ? ICO.folder.replace('<svg', '<svg width="13" height="13"') : ''}
            ${id && GROUPS[g].kind
              ? `<button class="ws-tree-name is-ent" data-peek="${GROUPS[g].kind}:${esc(id)}"
                   title="What else touches ${esc(name)}">${esc(name)}</button>`
              : `<span class="ws-tree-name${id ? '' : ' is-none'}">${esc(name)}</span>`}
            <span class="ws-tree-n">${docs.length}</span>
            ${needs ? `<span class="ws-tree-needs" title="${needs} need a person">${needs}</span>` : ''}
            ${id ? `<button class="ws-tree-only" ${groupFilterAttr(g, id, docs)}
                    title="Show only ${esc(name)}">Only this</button>` : ''}
          </summary>
          <div class="tree-children">
            ${bucket(docs, sub).map(([sid, sdocs]) => `<details class="ws-tree-type" open>
              <summary>
                <svg class="tree-chev" width="11" height="11" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>
                ${sub === 't' && TYPES[sid] ? TYPES[sid].ico.replace('<svg', '<svg width="12" height="12"') : ''}
                <span class="ws-tree-name${sid ? '' : ' is-none'}">${esc(groupName(sub, sid))}</span>
                <span class="ws-tree-n">${sdocs.length}</span>
              </summary>
              <div class="tree-children">
                ${sdocs.map((o) => `<div class="ws-tree-leaf">
                  <button class="tree-leaf ws-tree-doc" data-card-open="${o.id}">
                    <span class="ws-tree-doc-title">${esc(o.title)}</span>
                    ${statusBadge(o.status)}
                    <span class="ws-tree-doc-who">${esc(o.owner)}</span>
                  </button>
                  ${treeEdges(o)}
                </div>`).join('')}
              </div>
            </details>`).join('')}
          </div>
        </details>`;
      }).join('')}
    </div>`;
  }

  /* The grouping control. It is a dropdown rather than a segmented control
     because seven axes in a row would be a menu bar pretending to be a switch. */
  function groupPicker(st) {
    const cur = GROUPS[st.group] ? st.group : 'col';
    return `<div class="v2-dropdown k-filter k-group" data-group-key>
      <button class="v2-dropdown-btn" type="button" aria-haspopup="listbox" aria-expanded="false"
              aria-label="Group the tree by">
        <span class="dd-label-text">Grouped by ${esc(GROUPS[cur].label.toLowerCase())}</span>
        <svg viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.8"
             stroke-linecap="round" stroke-linejoin="round"><polyline points="1 1 5 5 9 1"/></svg>
      </button>
      <div class="v2-dropdown-panel" role="listbox">
        ${Object.keys(GROUPS).map((k) => `<div class="v2-dropdown-option${k === cur ? ' selected' : ''}"
          role="option" aria-selected="${k === cur}" data-value="${esc(GROUPS[k].label)}"
          data-slug="${k}">${esc(GROUPS[k].label)}</div>`).join('')}
      </div>
    </div>`;
  }

  const VIEWS = [['grid', 'Cards'], ['tree', 'Folders']];

  function renderGrid(st) {
    const stage = $('#wbStage');
    const composed = isComposed(st);
    /* The composed set arrives already ordered — yours first, then everything
       else, each ranked by what needs a person. Re-sorting it here is what
       silently threw the ownership half of the composition away. */
    /* One ordering decision for both surfaces, so the toggle and the landing
       page cannot disagree about what "needs a person" means. */
    const order = orderOf(st, composed);
    const list = composed ? composedSet(order) : sortSet(applyFilters(st), order);

    if (!list.length) { stage.innerHTML = emptyResult(st); return; }

    stage.innerHTML = resultMeta(st, list, composed) +
      (st.view === 'tree' ? renderTree(st, list)
                          : `<div class="ws-grid">${list.map((o) => typeCard(o)).join('')}</div>`);
  }

  /* An empty result is a finding about the filter, not an absence — except
     when the shelf itself is bare, and then it is the opposite finding and the
     Clear filters button is a lie.

     `LIVE.length` was printed either way, so browsing an empty archive read
     "37 documents, none of them matching all of these filters" over a button
     that would clear a filter that was not the reason. The count has to come
     from the set the filter was applied TO. */
  function emptyResult(st) {
    const shelf = ENTITLED.filter((o) => (st.archived ? o.arch : !o.arch));
    const noun = st.archived ? 'archived document' : 'document';
    const bare = !shelf.length;
    return `<div class="empty-state k-enter">
      <div class="empty-state-icon">${(bare ? ICO.box : ICO.search).replace('<svg', '<svg width="20" height="20"')}</div>
      <div class="empty-state-title">${bare
        ? (st.archived ? 'Nothing is archived' : 'Nothing here yet')
        : 'No matches'}</div>
      <div class="empty-state-desc">${bare
        ? (st.archived
            ? 'Archive a document and it waits here, kept whole and restorable.'
            : 'Write one, or drop a file on this page to start from something you already have.')
        : shelf.length + ' ' + noun + (shelf.length === 1 ? '' : 's')
          + ', none of them matching all of these filters.'}</div>
      <div class="k-row k-gap-2" style="justify-content:center;margin-top:14px">
        ${bare
          ? (st.archived
              ? '<button class="btn btn-ghost btn-sm" data-clear-all>Back to the library</button>'
              : `<button class="btn btn-brand btn-sm" data-new-doc>New document</button>
                 <button class="btn btn-ghost btn-sm" data-pick-files>Choose a file</button>`)
          : '<button class="btn btn-brand btn-sm" data-clear-all>Clear filters</button>'}
      </div>
      ${bare && !st.archived ? `<p class="empty-state-fine">${FILE_KINDS}</p>` : ''}
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


  /* ═══════════════════════════════════════════════
     THE PEEK — a thing, opened where you found it

     Entity pages were the obvious answer and the wrong one: a route per client
     would put back the destinations this whole build spent ten passes removing.
     So the graph surfaces in place. Click any entity anywhere and a panel opens
     anchored to it, carrying what it is, everything connected to it, and what
     you can do about it. Click a connection inside the panel and you are on the
     next thing, with a back arrow — traversal without ever leaving the page you
     were reading.

     `.cite-preview` is the library's hovercard and is the right look, but it
     cannot be the mechanism: it is `position: absolute` against a `.cite-wrap`
     parent and its open state is `:hover` on that parent. A panel that can be
     anchored to an owner's name in a card footer, a source in a rail and a row
     inside itself needs fixed positioning and a click. Recorded in GAPS.md.
  ═══════════════════════════════════════════════ */
  let peekStack = [];
  let peekOpener = null;

  /* What this thing is, in sentences. Same rule as everywhere else: no label
     above a value, a phrase that carries its own meaning. */
  function peekFacts(kind, id) {
    const n = docsOf(kind, id).length;
    const count = n + (n === 1 ? ' document' : ' documents');
    if (kind === 'doc') {
      const o = byId(id);
      if (!o) return [];
      return [TYPES[o.t].label + ' in ' + COLLECTIONS[o.col],
              'Owned by ' + o.owner,
              'Updated ' + fmtDate(o.upd),
              STATUS[o.status].why];
    }
    if (kind === 'source') {
      const s = SRC[id];
      return [s.health === 'ok' ? 'Syncing ' + s.cadence.toLowerCase() : 'Not syncing',
              s.note, count + ' came from it'];
    }
    if (kind === 'collection') {
      const m = COLLECTION_META[id];
      const on = AGENTS.filter((a) => m.grounding[a.id]);
      return ['Owned by ' + m.owner, count,
              on.length ? on.map((a) => a.name).join(' and ') + ' can answer from it'
                        : 'No agent answers from it',
              m.retain ? 'Archives after ' + Math.round(m.retain / 30) + ' months'
                       : 'Never archives on its own'];
    }
    if (kind === 'owner') {
      const docs = docsOf(kind, id);
      const needs = docs.filter((o) => STATUS[o.status].tone !== 'verified').length;
      const cols = [...new Set(docs.map((o) => COLLECTIONS[o.col]))];
      return [count, cols.length ? 'Across ' + cols.join(', ') : '',
              needs ? needs + ' of them need a person' : 'None of them need anything'];
    }
    const docs = docsOf(kind, id);
    const stale = docs.filter((o) => STATUS[o.status].tone !== 'verified').length;
    return [count, stale ? stale + ' need a person' : 'Nothing here needs attention'];
  }

  /* ── The panel says what only it can say ──

     It used to try to be a knowledge panel: the documents, then everything
     those documents had in common, as folds. One region came out at 490px with
     thirteen visible rows and fifty-five interactive elements behind them, six
     of which were near-identical counts — *8 owners · 4 collections · 5 sources
     · 2 clients · 3 products · 20 tags* — with no priority between them. A data
     dump wearing a panel, and it was read twice as unreadable.

     Every one of those questions already has a better home:

       what else is in this region  →  Show its N documents
       who owns them                →  Folders, grouped by owner
       which of them need a person  →  Needs attention

     The surface is bigger, filterable, groupable and sortable; a 320px panel
     was competing with it and losing. So the panel keeps the one thing the
     surface cannot tell you — what this thing IS — and hands the rest over. */
  function peekBody(kind, id) {
    if (kind !== 'doc') return '';
    const groups = {};
    edgesOf(kind, id).forEach((e) => { (groups[e.phrase] = groups[e.phrase] || []).push(e); });
    /* Claims before fields: what somebody said about this document outranks
       what its own fields say, and Disagrees with outranks all of it. */
    const rank = (p) => (p === 'Disagrees with' ? 0 : ASSERTED_PHRASES.indexOf(p) > -1 ? 1 : 2);
    return Object.keys(groups)
      .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
      .map((phrase) => `<div class="peek-group">
        <span class="peek-phrase">${esc(phrase)}</span>
        <div class="peek-items">
          ${groups[phrase].map((e) => `<button class="peek-item"
              ${e.kind === 'doc' ? `data-open-doc="${esc(e.id)}"` : `data-peek="${esc(e.kind)}:${esc(e.id)}"`}>
            ${e.kind === 'doc' && byId(e.id) ? TYPES[byId(e.id).t].ico.replace('<svg', '<svg width="11" height="11"') : ''}
            <span class="peek-item-label">${esc(e.label)}</span>
            ${e.by ? `<span class="peek-by">${esc(e.by)}, ${esc(fmtShort(e.at))}</span>` : ''}
          </button>`).join('')}
        </div>
      </div>`).join('');
  }

  const ASSERTED_PHRASES = Object.keys(ASSERTED).map((k) => ASSERTED[k].phrase);

  function peekRender() {
    const host = $('#peek');
    if (!host || !peekStack.length) return;
    const top = peekStack[peekStack.length - 1];
    const { kind, id } = top;
    const docs = docsOf(kind, id);
    const facts = peekFacts(kind, id).filter(Boolean);
    const f = ENTITY[kind] || {};

    host.innerHTML = `
      <div class="peek-head">
        ${peekStack.length > 1
          ? `<button class="peek-back" data-peek-back aria-label="Back">
               ${ICO.arrow.replace('<svg', '<svg width="13" height="13" style="transform:rotate(180deg)"')}</button>`
          : ''}
        <span class="peek-title">${esc(entityLabel(kind, id))}</span>
        <span class="peek-kind">${esc(f.kind || kind)}</span>
        <button class="peek-close" data-peek-close aria-label="Close">
          ${ICO.x.replace('<svg', '<svg width="13" height="13"')}</button>
      </div>
      <p class="peek-facts">${facts.map(esc).join(' · ')}</p>
      <!-- What you can do comes BEFORE what is connected. It used to be last,
           under 978px of list in a 520px panel, which meant the panel opened
           showing you a list and no way out of it. -->
      <div class="peek-foot">
        ${kind === 'doc'
          ? entityAction('Open it', `data-open-doc="${id}"`)
          : docs.length
            ? entityAction('Show its ' + docs.length + (docs.length === 1 ? ' document' : ' documents'),
                `data-peek-show="${esc(kind)}:${esc(id)}"`)
            : ''}
        ${kind === 'source' ? entityAction('Settings', `data-settings="source:${id}"`) : ''}
        ${kind === 'collection' ? entityAction('Settings', `data-settings="collection:${id}"`) : ''}
      </div>
      <div class="peek-body">${peekBody(kind, id)}</div>`;
    host.hidden = false;
    void host.offsetWidth;
    host.classList.add('is-open');
    peekPlace(top.rect);
    const first = $('[data-peek-back], .peek-item, [data-peek-close]', host);
    if (first) setTimeout(() => first.focus(), 40);
  }

  const entityAction = (label, attr) =>
    `<button class="peek-act" ${attr}>${esc(label)}</button>`;

  /* Anchored to what you clicked, and kept on screen. A panel that opens off
     the bottom of the window is a panel that did not open. */
  function peekPlace(rect) {
    const host = $('#peek');
    if (!host || !rect) return;
    const w = host.offsetWidth, h = host.offsetHeight;
    const pad = 10;
    let left = rect.left + rect.width / 2 - w / 2;
    left = Math.max(pad, Math.min(left, window.innerWidth - w - pad));
    let top = rect.bottom + 8;
    if (top + h > window.innerHeight - pad) top = Math.max(pad, rect.top - h - 8);
    host.style.left = Math.round(left) + 'px';
    host.style.top = Math.round(top) + 'px';
  }

  function openPeek(kind, id, anchor, push) {
    if (!ENTITY[kind]) return;
    const rect = anchor ? anchor.getBoundingClientRect()
                        : (peekStack[peekStack.length - 1] || {}).rect;
    if (!push) { peekStack = []; peekOpener = anchor || null; }
    peekStack.push({ kind: kind, id: id, rect: rect });
    peekRender();
  }

  function closePeek() {
    const host = $('#peek');
    if (!host || !peekStack.length) return;
    peekStack = [];
    host.classList.remove('is-open');
    setTimeout(() => { host.hidden = true; host.innerHTML = ''; }, 160);
    const back = peekOpener;
    peekOpener = null;
    if (back && document.contains(back)) setTimeout(() => back.focus(), 40);
  }

  /* Focus stays inside an open overlay. Extracted from the document modal when
     the document became a page: the settings sheet still needs it. */
  function trapFocus(root, e) {
    const f = $$('a[href],button:not([disabled]),input:not([disabled]),textarea,[contenteditable="true"],[tabindex]:not([tabindex="-1"])', root)
      .filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

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

    trap(e) { trapFocus(this.sheet, e); },

    show(html, key) {
      /* One thing at a time on top of the work. */
      if (!this.open && canvas.open) canvas.close({ quiet: true });
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
        ? list.map((c, i) => `<div class="comment${c.problem ? (c.done ? ' is-problem is-done' : ' is-problem') : ''}">
            <div class="avatar avatar-sm">${esc(c.initials)}</div>
            <div class="comment-body">
              <div class="comment-head"><span class="comment-author">${esc(c.who)}</span>
                ${c.problem ? `<span class="comment-flag">${ICO.flag.replace('<svg', '<svg width="11" height="11"')}
                  ${c.done ? 'Resolved' : 'Reported a problem'}</span>` : ''}
                <span class="comment-time">${esc(c.when)}</span></div>
              <div class="comment-text">${esc(c.text)}</div>
              <!-- A report is a job, so it has a way to be finished. Anyone who
                   can read the document can close it: the person who fixed it
                   is not always the owner, and a queue only one person can
                   clear is a queue that does not clear. -->
              ${c.problem && !c.done
                ? `<button class="comment-resolve" data-resolve-problem="${i}">Mark it resolved</button>` : ''}
            </div>
          </div>`).join('')
        : `<p class="comment-empty">Nothing yet. A comment is the way to raise something
           without changing the document.</p>`}
      <!-- One control, not two. A word-button beside a field asks you to read
           it before you can use the field; a send glyph inside it is the same
           affordance every message box has, and Enter already did the job. -->
      <div class="comment-compose">
        <input class="field-input" type="text" placeholder="Add a comment…" aria-label="Add a comment"
               data-comment-input>
        <button class="comment-send" data-comment-add aria-label="Add this comment" title="Add this comment">
          ${ICO.send.replace('<svg', '<svg width="14" height="14"')}</button>
      </div>
    </div>`;
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

  /* What can be done to WORDS rather than to a block. The selection menu carries
     these; the block toolbar carries the rest, because a heading or a list is a
     property of the paragraph and applying one to three words means applying it
     to the paragraph they are in. */
  /* Each figure gets a name it keeps. Opening the native file dialog blurs the
     page, which blurs the body, which repaints the editor — so the element that
     asked for the file is gone by the time the file arrives. A name survives the
     repaint; a reference does not. */
  let figSeq = 0;

  const SEL_FMT = [
    ['bold', '<strong>B</strong>', 'Bold'],
    ['italic', '<em>I</em>', 'Italic'],
    ['underline', '<span style="text-decoration:underline">U</span>', 'Underline']
  ];

  /* ── The block types ──

     The toolbar could already make a heading or a list out of the block you
     were in, which is formatting. What it could not do is what every document
     tool is expected to do: ADD a block of a different kind. So there is one
     list of block types, reachable two ways — the + in the block toolbar, for
     the first time, and `/` on an empty line, for every time after.

     The first five run execCommand, because the browser already knows how to
     turn a paragraph into a heading or a list. The last three insert real
     markup, because there is no command for "a code block". */
  /* `insertHTML` sanitises a <pre> or a <figure> into an inline span and drops
     it wherever the caret happens to be — mid-word, inside the paragraph. A
     block has to arrive as a block, so this places it in the body itself: after
     the block being written, or in its place when that one is empty. The caret
     lands on the part you would type next. */
  function insertBlock(html) {
    const body = $('#editBody');
    if (!body) return;
    let at = caretBlock();
    if (!at || at.parentElement !== body) at = body.lastElementChild;

    const wrap = document.createElement('div');
    wrap.innerHTML = html + '<p><br></p>';
    const made = [...wrap.children];
    const after = at ? at.nextSibling : null;
    made.forEach((n) => body.insertBefore(n, after));
    /* An empty paragraph you were sitting in was only ever a place to stand, so
       the new block takes its place. An empty code block or figure is empty on
       purpose — waiting for you — and stays. */
    if (at && !at.textContent.trim() && /^(P|H3|H4|DIV|BLOCKQUOTE)$/.test(at.tagName)) at.remove();

    const fill = made[0].querySelector('code, figcaption') || made[made.length - 1];
    const r = document.createRange();
    r.selectNodeContents(fill); r.collapse(true);
    putCaret(r);
  }

  const BLOCKS = [
    ['Text',          'T',   () => document.execCommand('formatBlock', false, 'p')],
    ['Heading',       'H',   () => document.execCommand('formatBlock', false, 'h3')],
    ['Subheading',    'H',   () => document.execCommand('formatBlock', false, 'h4')],
    ['Bulleted list', '&#8226;',  () => document.execCommand('insertUnorderedList')],
    ['Numbered list', '1.',  () => document.execCommand('insertOrderedList')],
    ['Quote',         '&#8220;',  () => document.execCommand('formatBlock', false, 'blockquote')],
    /* The block arrives empty with the caret in it and its hint drawn by CSS,
       the way a real editor does it. Placeholder *text* would have to be
       selected to be replaced, and a selection is what makes the toolbar hand
       over to the selection menu — so the tools would vanish on arrival. */
    ['Code',          '&lt;&gt;', () => insertBlock('<pre class="doc-code"><code></code></pre>')],
    /* No upload in a prototype, and a fake one would be worse than none. The
       block says what it is waiting for, and the drop handler this document
       already has is what fills it. */
    /* ── Choose, do not drop ──

       The placeholder used to read "Drop an image on the document to fill
       this", which asked for the one gesture the page had already claimed: the
       workbench's drop layer turns any dropped file into a new document, so
       aiming at the figure made a document instead of an image. Two meanings
       for one gesture, and the block always lost. A file field is a control
       everyone has already been taught, and it collides with nothing. */
    ['Image',         '&#9635;',  () => insertBlock(
      '<figure class="doc-figure" data-fig="' + (++figSeq) + '">' +
      '<button type="button" class="doc-figure-ph" contenteditable="false" ' +
      'data-pick-image="' + figSeq + '">Choose an image</button><figcaption></figcaption></figure>')],
    ['Divider',       '&#8212;',  () => insertBlock('<hr class="doc-hr">')]
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
  /* Which custom property is open for editing. View state, like the rest of
     this — nobody wants to link to a document with one field unfolded. */
  let openProp = null;

  const OWNERS = ['N. Wael', 'A. Mahfouz', 'O. Said', 'Sales Ops', 'Marketing', 'Brand', 'Legal', 'Unassigned'];

  /* Every property is a control that writes straight through to the object.
     Status is shown and not set: it is derived, and a field you could type into
     would be the attestation model coming back through a side door.

     `lead` is the half of the fact the control cannot say for itself, and it
     lives INSIDE the trigger, so the whole row is one target. `blank` completes
     the same phrase when there is no value — *About no client*, never *None*,
     because a document with no client is a fact and a dash is a shrug. */
  const artic = (s) => (/^[aeiou]/i.test(s) ? 'an ' : 'a ') + s;

  const PROP_FIELDS = [
    { key: 'owner',  label: 'Owner',      lead: 'Owned by',      map: () => OWNERS.map((x) => [x, x]) },
    { key: 't',      label: 'Type',       lead: 'It is',         map: () => opts(TYPES), disp: artic },
    { key: 'col',    label: 'Collection', lead: 'Filed in',      map: () => opts(COLLECTIONS), blank: 'nowhere' },
    { key: 'prod',   label: 'Product',    lead: 'Answering for', map: () => opts(PRODUCTS), blank: 'no product' },
    { key: 'client', label: 'Client',     lead: 'About',         map: () => opts(CLIENTS), blank: 'no client' },
    { key: 'region', label: 'Region',     lead: 'Covering',      map: () => opts(REGIONS), blank: 'no region' }
  ];

  /* `row` puts the lead inside the trigger and lets it fill the line. The
     library's panel, keyboard model and ARIA are untouched — only the trigger
     changes shape, and `data-value` carries the display form so selecting a new
     option does not drop the article the trigger was reading with. */
  function propDropdown(f, o, row) {
    const cur = o[f.key] || '';
    const blank = f.blank || '—';
    const rows = [['', blank, blank]]
      .concat(f.map().map(([v, l]) => [v, f.disp ? f.disp(l) : l, l]));
    const label = rows.reduce((acc, r) => (r[0] === cur ? r[1] : acc), blank);
    return `<div class="v2-dropdown k-prop${row ? ' k-row' : ''}" data-prop-key="${f.key}">
      <button class="v2-dropdown-btn" type="button" aria-haspopup="listbox" aria-expanded="false"
              aria-label="${esc(f.label)}">
        ${row && f.lead ? `<span class="prop-lead">${esc(f.lead)}</span>` : ''}
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

  /* An empty tag field inside a sentence used to render as a full stop after a
     blank — "and it touches ." — so the placeholder answers the sentence
     instead of instructing the field. */
  const tagField = (o, key, label, lookup) => {
    const vals = o[key] || [];
    return `<div class="tag-input${vals.length ? '' : ' is-empty'}" data-tag-field="${key}">
      ${vals.map((v) => `<span class="tag-token">${esc(lookup ? lookup[v] || v : v)}
        <button type="button" data-tag-drop="${esc(v)}" aria-label="Remove ${esc(v)}">&times;</button></span>`).join('')}
      <input type="text" placeholder="${vals.length ? 'add…' : 'nothing yet'}"
             aria-label="Add ${esc(label)}" data-tag-add="${key}">
    </div>`;
  };

  /* ── The details are rows ──

     Three shapes have now been tried on this panel. A LABEL column was two
     things to read where one would do. A flowing SENTENCE with the controls
     inside it fixed that and broke something else: prose wrapped around six
     inline controls cannot avoid orphaning its own punctuation — measured at
     three lines with a comma stranded at x=296 of 320 and a full stop starting
     the last line — and an open panel landed on the words after it.

     So: one fact per row, the phrase and its value together, and the whole row
     is the control. The lead sits inside the trigger, which means one hit
     target per fact, a scannable left edge, no flow, no punctuation to orphan,
     and a panel that opens under its own row instead of over the next fact. */
  const propRow = (lead, body) => `<div class="prop-row">
    <span class="prop-lead">${esc(lead)}</span>${body}</div>`;

  function propsPanel(o) {
    const facts = typeFacts(o);
    const custom = Object.keys(o.props);
    return `<div class="props">
      ${facts.length ? `<div class="prop-facts">${facts.map((f) => `<p>${f}</p>`).join('')}</div>` : ''}

      <div class="prop-rows">
        ${PROP_FIELDS.map((f) => propDropdown(f, o, true)).join('')}
        ${propRow('Tagged', tagField(o, 'tags', 'Tagged'))}
        <!-- "Touches" said nothing. The field holds which of our service lines
             the document belongs to — Support delivery, Voice operations — and
             "Part of Support delivery" says that without a glossary. -->
        ${propRow('Part of', tagField(o, 'services', 'Part of', SERVICES))}
        ${propRow('Visible to', `<div class="prop-checks">${Object.keys(AUDIENCE).map((a) => `
          <label class="ds-choice"><input type="checkbox" data-aud="${a}"${o.aud.indexOf(a) > -1 ? ' checked' : ''}>
            <span></span><span class="prop-check-label">${esc(AUDIENCE[a])}</span></label>`).join('')}</div>`)}
      </div>

      <!-- Status carries a reason as well as a value, and the reason is the
           half that matters, so it keeps its own block below the rows. -->
      <div class="prop-status">
        ${propDropdown({ key: 'statusSet', label: 'Status', lead: 'Status is', blank: 'Automatic',
          map: () => Object.keys(STATUS).map((k) => [k, STATUS[k].label]) }, o, true)}
        <span class="prop-why">${o.statusSet
          ? 'Set by ' + esc(o.statusBy || USER.owner) + '. Choose Automatic to compute it again.'
          : esc(STATUS[o.status].why)}</span>
      </div>

      <!-- ── Anything the fixed fields cannot hold ──

           This was the one block that never got the phrase treatment: the words
           "It also says:" over two bare text boxes, whose only names were
           aria-label attributes a sighted reader never sees. Two unlabelled
           inputs and a sentence fragment, which is exactly as much as it
           explained.

           It reads as a fact now — "tier is enterprise" — and becomes the two
           inputs when you click it, which is the same rule as the title, the
           body and every other row on this page. A new one arrives already
           open, with the placeholders doing the naming the labels used to fail
           to do. -->
      <div class="prop-custom">
        ${custom.length ? '<p class="prop-also">Other facts about it</p>' : ''}
        ${custom.map((k) => `<div class="prop-kv${k === openProp ? ' is-open' : ''}" data-prop-pair="${esc(k)}">
          <button class="prop-kv-read" data-prop-open="${esc(k)}">
            <span class="prop-lead">${esc(k)}</span> is
            <span class="prop-kv-val">${esc(o.props[k]) || '—'}</span>
          </button>
          <input class="field-input" value="${esc(k)}" data-prop-k="${esc(k)}"
                 placeholder="Name" aria-label="Property name">
          <input class="field-input" value="${esc(o.props[k])}" data-prop-v="${esc(k)}"
                 placeholder="Value" aria-label="Value of ${esc(k)}">
          <button class="prop-kv-x" data-prop-del="${esc(k)}" aria-label="Remove ${esc(k)}">${ICO.x.replace('<svg', '<svg width="12" height="12"')}</button>
        </div>`).join('')}
        <!-- "Add another" when there is nothing to add another OF. -->
        <button class="prop-add" data-prop-add>+ Add ${custom.length ? 'another' : 'a fact'}</button>
      </div>
    </div>`;
  }


  /* ═══════════════════════════════════════════════
     THE DOCUMENT

     One surface. There is no view mode and no edit mode, because a person
     reading a document and a person fixing a sentence in it are the same
     person half a second apart, and making them press a button in between was
     the product asking them to declare an intention they had not formed yet.

     Click the title, you are editing the title. Click the body, you are in the
     body. Nothing is disabled and nothing is armed; the affordance appears
     under the pointer and is otherwise absent, so the thing reads as a document
     rather than as a form with a document in it.

     It is also a page now, not a modal. A modal has no room for a rail, and a
     document with eleven facts, its connections, its history and its comments
     needs one. The URL is unchanged — `?doc=` — so every link still resolves
     and Back still returns to the surface you filtered.
  ═══════════════════════════════════════════════ */
  let railOpen = true;

  /* Some documents carry an ingestion marker in the owner field rather than a
     person. As a label over a value that read as odd data; as a sentence,
     "Owned by Ingested · Zendesk" reads as nonsense. The phrase treatment makes
     the defect visible, which is the argument for the phrase treatment. */
  const hasOwner = (o) => OWNERS.indexOf(o.owner) > -1 && o.owner !== 'Unassigned';
  const ownerPhrase = (o) => hasOwner(o) ? 'Owned by ' + esc(o.owner)
    : o.owner === 'Unassigned' ? 'Nobody owns it'
    : 'No owner — it arrived from ' + esc(SRC[o.src].label);

  /* The byline. Everything a masthead would say, as one line of phrases, each
     entity in it openable. */
  function docByline(o) {
    const src = SRC[o.src];
    return `<div class="doc-byline">
      ${statusBadge(o.status, o.statusSet ? 'Set by ' + esc(o.statusBy || USER.owner) : '')}
      <button class="doc-by-ent" data-peek="owner:${esc(o.owner)}">${ownerPhrase(o)}</button>
      <span class="doc-by-sep">·</span>
      <!-- ── When it changed, and every time it changed ──

           This lived in the topbar behind the word "3 versions", beside the
           save indicator, at the far end of a row you read past on your way to
           the document. But the question a version answers is the one the
           byline already raises: how current is this? So the date and its
           history are one control, in the line that states the date. -->
      ${VERSIONS(o).length ? `<details class="doc-versions doc-by-ver" id="docVersions">
        <summary>Updated ${esc(fmtDate(o.upd))}
          <span class="doc-by-vn">${VERSIONS(o).length} version${VERSIONS(o).length === 1 ? '' : 's'}</span></summary>
        <div class="doc-versions-panel">
          ${versionList(o, true)}
          <p class="ver-hint">Open a version to read it. Only the current one can be edited.</p>
        </div>
      </details>`
      /* A document written a minute ago has no history, and "0 versions" over
         an empty panel is a control that opens onto nothing. */
      : `<span>Updated ${esc(fmtDate(o.upd))}</span>`}
      <span class="doc-by-sep">·</span>
      <!-- "Came from Manual upload" is not where a document you typed came
           from. It came from you, here. -->
      ${bornHere(o)
        ? '<span>Written here</span>'
        : `<button class="doc-by-ent" data-peek="source:${o.src}">Came from ${esc(src.label)}</button>`}
      <span class="doc-by-sep">·</span>
      <button class="doc-by-ent" data-peek="collection:${o.col}">Filed in ${esc(COLLECTIONS[o.col])}</button>
    </div>`;
  }

  /* The rail. Four blocks, each a `<details>` so the browser keeps what you
     opened without any state of ours. */
  const railBlock = (title, open, body, n) => `
    <details class="rail-block"${open ? ' open' : ''}>
      <summary>
        <svg class="tree-chev" width="11" height="11" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>
        <span class="rail-block-title">${esc(title)}</span>
        ${n ? `<span class="rail-block-n">${n}</span>` : ''}
      </summary>
      <div class="rail-block-body">${body}</div>
    </details>`;

  /* Connections, as sentences. Each row reads "Disagrees with Returns FAQ —
     AiMY, 18 Jul": the relationship, the thing, and who said so. An implicit
     edge has no author because nobody authored it. */
  /* Claims only. Measured: seven of the nine groups here — Owned by, Filed in,
     Came from, Answers for, Covers, Touches, Tagged — were the implicit edges,
     which are the document's own fields, which are editable rows six inches
     above in About it. 316px of the rail restating 316px of the rail. The
     implicit edges are real and the model still holds them; they are simply not
     news twice on one screen.

     What is left is what somebody claimed, which is the half a reader cannot
     work out for themselves. */
  const claimsOf = (o) => edgesOf('doc', o.id).filter((e) => ASSERTED_PHRASES.indexOf(e.phrase) > -1);

  function connectionsBlock(o) {
    const edges = claimsOf(o);
    const groups = {};
    edges.forEach((e) => { (groups[e.phrase] = groups[e.phrase] || []).push(e); });
    const keys = Object.keys(groups);
    return (keys.length
      ? keys.map((phrase) => `<div class="rail-conn">
          <span class="rail-conn-phrase">${esc(phrase)}</span>
          ${groups[phrase].map((e) => `<button class="rail-conn-item"
            ${e.kind === 'doc' ? `data-open-doc="${esc(e.id)}"` : `data-peek="${esc(e.kind)}:${esc(e.id)}"`}>
            <span class="rail-conn-label">${esc(e.label)}</span>
            ${e.by ? `<span class="rail-conn-by">${esc(e.by)}, ${esc(fmtShort(e.at))}</span>` : ''}
          </button>`).join('')}
        </div>`).join('')
      : '<p class="rail-empty">Nobody has connected this to anything yet.</p>')
      /* Finding a connection is a search over forty-two documents. It was in
         here — a neighbour list plus a picker holding thirty-four hidden rows
         — inside a 320px column, and it was most of why the rail ran to twice
         the window. The rail describes; the canvas searches. */
      /* Named the same thing as the starter row that opens the same surface.
         "Find connections" described what this used to be — a discovery answer
         in the canvas — and kept the name after it became a picker you connect
         from, so one action had two names and neither matched its heading. */
      + `<div class="rail-act">${entryAction('investigate', 'Connect it to documents',
           `data-act="connect" data-obj="${o.id}"`, AIMY_MARK(12, 14))}</div>`;
  }

  /* ── What nobody claimed ──

     The rest of the graph is real, it is just implicit: two documents about the
     same client, answering for the same product, carrying the same tags. Walking
     the edges a document already has finds its neighbours without anyone having
     to assert anything.

     They are kept apart from the claims and labelled as computed, for exactly
     the reason a hand-set status carries a marker — a thing the system noticed
     and a thing a person claimed must never render identically. Narrowest axis
     first, because "also about Nordwind" is worth something and "also came from
     Confluence" is worth almost nothing. */
  const NEIGHBOUR = [
    { has: (o) => !!o.client, phrase: (o) => 'Also about ' + CLIENTS[o.client],
      match: (a, b) => b.client === a.client },
    { has: (o) => !!o.prod,   phrase: (o) => 'Also answers for ' + PRODUCTS[o.prod],
      match: (a, b) => b.prod === a.prod },
    { has: (o) => o.tags.length > 1, phrase: (o) => 'Also tagged ' + o.tags.slice(0, 2).join(' and '),
      match: (a, b) => b.tags.filter((t) => a.tags.indexOf(t) > -1).length > 1 },
    { has: () => true,        phrase: (o) => 'Also filed in ' + COLLECTIONS[o.col],
      match: (a, b) => b.col === a.col },
    { has: (o) => hasOwner(o), phrase: (o) => 'Also owned by ' + o.owner,
      match: (a, b) => b.owner === a.owner },
    { has: () => true,        phrase: (o) => 'Also came from ' + SRC[o.src].label,
      match: (a, b) => b.src === a.src }
  ];

  function neighbours(o, max) {
    /* Anything already claimed is a connection, not a suggestion, and it is in
       the block above. Suggesting it again would make asserting it look like a
       no-op. */
    const claimed = {};
    EDGES.forEach((e) => {
      if (e.from === o.id) claimed[e.to] = 1;
      if (e.to === o.id) claimed[e.from] = 1;
    });
    const out = [];
    NEIGHBOUR.forEach((n) => {
      if (out.length >= (max || 3) || !n.has(o)) return;
      const docs = LIVE.filter((x) => x.id !== o.id && !claimed[x.id] && n.match(o, x));
      if (docs.length) out.push({ phrase: n.phrase(o), docs: docs });
    });
    return out;
  }

  /* ── Connecting is picking several things at once ──

     It used to be a canvas answer: a list of neighbour groups over a search,
     with a `+` per row that opened its own confirmation. Three problems. On a
     document created a minute ago the suggestions are noise — a new document
     shares its collection and owner with almost everything. The rows were
     `data-open-doc`, so clicking one NAVIGATED AWAY from the document you were
     connecting. And one commit per connection is the wrong unit: what you want
     at creation is to pick the three things this relates to and be done.

     One list, then. Search over all of it, checkboxes rather than links, the
     relationship chosen once for the batch, and one confirmation. The
     suggestions survive as a REASON on a row rather than as a section, which
     keeps the noticed-versus-claimed distinction without giving guesses their
     own real estate. */
  const CONNECT_AS = [
    ['related', 'Related to'], ['references', 'References'],
    ['supersedes', 'Replaces'], ['answers', 'Answers']
  ];

  function connectCandidates(o) {
    const claimed = {};
    EDGES.forEach((e) => {
      if (e.from === o.id) claimed[e.to] = 1;
      if (e.to === o.id) claimed[e.from] = 1;
    });
    /* Why AiMY would have suggested it, as a caption — narrowest axis wins, so
       a shared client beats a shared source. */
    const why = {};
    neighbours(o, 6).forEach((g) => g.docs.forEach((d) => {
      if (!why[d.id]) why[d.id] = g.phrase;
    }));
    return LIVE.filter((x) => x.id !== o.id && !claimed[x.id])
      .sort((a, b) => (why[b.id] ? 1 : 0) - (why[a.id] ? 1 : 0) || a.title.localeCompare(b.title))
      .map((d) => ({ d: d, why: why[d.id] || '' }));
  }

  function connectPicker(o) {
    const rows = connectCandidates(o);
    if (!rows.length) { toast('Nothing left to connect', null, 'It is already connected to everything else'); return; }
    commit({
      title: 'Connect this to other documents',
      sheet: true, width: 420,
      rationale: `Whatever you pick becomes <strong>your</strong> claim about
        <strong>${esc(o.title)}</strong>, and carries your name and today's date wherever it is read.`,
      extra: '',
      /* The foot counts what you have ticked, so the button is the answer to
         "how many did I pick?" — the one question a long list keeps raising. */
      confirm: 'Pick some documents', done: 'Connected',
      effects: [['ok', 'Both documents show the connection, from either end'],
                ['ok', 'Recorded as asserted by ' + esc(USER.owner)]],
      body: `<div class="cx-pick">
        <div class="cx-as">
          <span class="cx-as-lead">Connect them as</span>
          <div class="seg cx-seg" role="group" aria-label="What kind of connection">
            ${CONNECT_AS.map(([v, label], i) => `<button class="seg-btn${i === 0 ? ' active' : ''}"
              type="button" data-cx-as="${v}" aria-pressed="${i === 0}">${esc(label)}</button>`).join('')}
          </div>
        </div>
        <input class="field-input cx-q" type="search" placeholder="Find a document"
               aria-label="Find a document to connect" data-pick-q autocomplete="off">
        <div class="cx-list">
          ${rows.map(({ d, why }) => `<label class="cx-row ds-choice" data-pick-row="${esc(d.title.toLowerCase())}">
            <input type="checkbox" data-cx-pick="${d.id}"><span></span>
            <span class="cx-row-text">
              <span class="cx-row-title">${esc(d.title)}</span>
              ${why ? `<span class="cx-row-why">${esc(why)}</span>` : ''}
            </span>
          </label>`).join('')}
          <p class="cx-none" hidden>Nothing here matches that.</p>
        </div>
      </div>`,
      onRun: () => {
        const type = ($('.cx-seg .seg-btn.active') || {}).getAttribute
          ? $('.cx-seg .seg-btn.active').getAttribute('data-cx-as') : 'related';
        const picked = $$('[data-cx-pick]').filter((c) => c.checked).map((c) => c.getAttribute('data-cx-pick'));
        if (!picked.length) { toast('Nothing was selected', null, 'Nothing changed'); return true; }
        picked.forEach((id) => assertEdge(o.id, id, type));
        recompute(); render(); markCard(o.id); picked.forEach(markCard);
        const label = (CONNECT_AS.filter((c) => c[0] === type)[0] || CONNECT_AS[0])[1].toLowerCase();
        toast('Connected to ' + picked.length + ' document' + (picked.length === 1 ? '' : 's'),
          'Undo', esc(o.title) + ' — ' + label);
        /* One undo for the batch. Dropping them one at a time would leave a
           half-made claim if you stopped halfway. */
        undoStack = () => { picked.forEach((id) => dropEdge(o.id, id)); recompute(); render(); };
        return true;
      }
    });
    syncPickCount();
  }

  function gateReport() {
    const btn = $('#commitRun'), box = $('[data-report-what]');
    if (!btn || !box) return;
    const on = !!box.value.trim();
    btn.disabled = !on;
    btn.style.opacity = on ? '' : '.45';
    btn.style.cursor = on ? '' : 'not-allowed';
  }

  /* Same gating the typed confirmation uses: the button says what it will do
     and cannot be pressed until that is something. */
  function syncPickCount() {
    const btn = $('#commitRun');
    if (!btn || !$('[data-cx-pick]')) return;
    const n = $$('[data-cx-pick]').filter((c) => c.checked).length;
    btn.textContent = n ? 'Connect ' + n + ' document' + (n === 1 ? '' : 's') : 'Pick some documents';
    btn.disabled = !n;
    btn.style.opacity = n ? '' : '.45';
    btn.style.cursor = n ? '' : 'not-allowed';
  }

  /* The source's own dates, as phrases rather than a four-cell grid of labels. */
  /* ── Some documents have no upstream at all ──

     `newDocument` files everything under the `upload` source with today's date
     in all four fields, and this block used to print them literally. A document
     you had just written said: *Ingested 30 Jul 2026 · Created in Manual upload
     30 Jul 2026 · Manual upload changed it 30 Jul 2026 · Cited 0 times — last
     today*, over a **Re-sync from Manual upload** button that would have
     replaced the body with nothing. Four false statements and a destructive
     dead end on every document the product invites you to make.

     A dropped file and a document typed here are both origins without an
     upstream — `dropFiles` marks the first with a `source-file` property — and
     neither of them syncs. Nothing to sync from, so no button offering to. */
  const bornHere = (o) => /^new-/.test(o.id) && !o.props['source-file'];
  const noUpstream = (o) => o.src === 'upload';

  function provenanceBlock(o) {
    const s = SRC[o.src];
    const behind = o.xu < o.upd;
    if (noUpstream(o)) {
      const file = o.props['source-file'];
      return `<div class="rail-facts">
        <p>${bornHere(o) ? 'You wrote it here, ' + esc(fmtDate(o.ing))
                         : 'You uploaded ' + esc(file || 'it') + ', ' + esc(fmtDate(o.ing))}</p>
        <p>Nothing syncs into it — ${bornHere(o) ? 'it has no source'
                                                 : 'a dropped file is not a live source'}</p>
        <p>${esc(citedPhrase(o))}</p>
        <!-- The line above states an absence; this is the one thing you can do
             about it, so it sits directly under it. -->
        <div class="rail-act">
          ${entryAction('investigate', 'Find a source for it', `data-act="ground" data-obj="${o.id}"`, AIMY_MARK(12, 14))}
        </div>
      </div>`;
    }
    return `<div class="rail-facts">
      <p>Ingested ${esc(fmtDate(o.ing))}</p>
      <p>Created in ${esc(s.label)} ${esc(fmtDate(o.xc))}</p>
      <p${behind ? ' class="is-overdue"' : ''}>${esc(s.label)} changed it ${esc(fmtDate(o.xu))}</p>
      <p>${esc(citedPhrase(o))}</p>
      <div class="rail-act">
        <!-- Pulling a source is not a thing you look at, so it stops carrying
             the direct mode's eye. And finding one is AiMY's job, so it
             carries AiMY's mark. -->
        ${s.health === 'ok'
          ? entryAction('direct', 'Re-sync from ' + s.label, `data-act="resync" data-obj="${o.id}"`, ICO.refresh)
          : entryAction('review', 'Reconnect ' + s.label, `data-act="reconnect" data-obj="${o.id}"`)}
        ${entryAction('investigate', 'Find another source', `data-act="ground" data-obj="${o.id}"`, AIMY_MARK(12, 14))}
      </div>
    </div>`;
  }

  function renderDoc(st) {
    const o = byId(st.doc);
    if (!o) { patch({ doc: '' }, { replace: true }); return; }
    const stage = $('#wbStage');
    /* ── A document with no body is a document with no body ──

       This also required the title to start with "Untitled", which was a proxy
       for "you just made this" and stopped being true the moment a file could
       name one. Every ingested document therefore got the starting moves
       suppressed — a filled title over an empty page and nothing offered, which
       is exactly what a Word file looked like on arrival. The test is the body,
       and the same test the drop layer uses. */
    const blank = isBlankDoc(o);
    const preview = previewVer !== null ? VERSIONS(o)[previewVer] : null;
    const owns = o.owner === USER.owner;
    const keep = stage.dataset.doc === o.id ? $('#docCanvas') && $('#docCanvas').scrollTop : 0;
    const live = document.activeElement;
    const armed = live && live.getAttribute && live.getAttribute('contenteditable') === 'true' && isEditable(live)
      ? (live.id === 'editBody' ? '#editBody' : '[data-edit-title]') : null;

    const notice = (STATUS[o.status].excluded || o.arch || o.status === 'outdated') ? `
      <div class="dv-notice is-${o.arch || o.status === 'superseded' ? 'superseded' : 'expired'}">
        ${o.arch ? ICO.box : o.status === 'superseded' ? ICO.arrow : ICO.refresh}
        <span class="dv-notice-text"><strong>${o.arch ? 'Archived.' : o.status === 'superseded' ? 'Replaced.' : 'Out of date.'}</strong>
        ${o.arch ? 'Kept whole and restorable. Not used in answers.'
          : o.status === 'superseded' ? 'A newer document replaced it. Not used in answers.'
          : esc(SRC[o.src].label) + ' changed after our copy. Still used in answers, and answers say so.'}</span>
        ${o.arch || o.status === 'superseded'
          ? `<button class="dv-notice-link" data-act="${o.arch ? 'restore' : 'successor'}" data-obj="${o.id}">
               ${o.arch ? 'Restore it →'
                 : (RELATED[o.id] || {}).supersededBy ? 'Go to the current one →' : 'Find what replaced it →'}</button>`
          : ''}
      </div>` : '';

    stage.dataset.doc = o.id;
    stage.innerHTML = `
      <div class="doc-page${railOpen ? '' : ' rail-closed'}">
        <div class="doc-topbar">
          <button class="doc-back" data-doc-close>
            ${ICO.arrow.replace('<svg', '<svg width="14" height="14" style="transform:rotate(180deg)"')}
            All documents</button>
          <span class="doc-top-end">
            ${savedLabel(o)}
            ${blank ? `<button class="btn btn-ghost btn-sm" data-discard="${o.id}">Discard</button>` : ''}
            ${o.status === 'draft'
              ? `<button class="btn btn-brand btn-sm" data-act="publish" data-obj="${o.id}" data-publish
                   ${String(o.sum || '').trim() ? '' : 'disabled title="A document with no content cannot go live"'}
                 >${String(o.sum || '').trim() ? 'Publish' : 'Add some content first'}</button>` : ''}
            <button class="doc-rail-toggle" data-rail-toggle aria-expanded="${railOpen}"
                    aria-label="${railOpen ? 'Hide details' : 'Show details'}">
              ${ICO.sidebar ? ICO.sidebar.replace('<svg', '<svg width="15" height="15"') : ICO.eye.replace('<svg', '<svg width="15" height="15"')}</button>
          </span>
        </div>

        <div class="doc-canvas" id="docCanvas">
          <div class="doc-paper">
            ${preview ? `<div class="ver-preview">
                ${ICO.clock.replace('<svg', '<svg width="14" height="14"')}
                <span>Reading <strong>${esc(preview.v)}</strong> from ${esc(fmtShort(preview.at))} — you cannot edit history.</span>
                <span class="ver-preview-end">
                  ${preview.current ? '' : `<button class="btn btn-ghost btn-sm" data-restore="${o.id}">Restore this version</button>`}
                  <button class="btn btn-brand btn-sm" data-close-ver>Back to the current one</button>
                </span>
              </div>`
            : ''}

            <!-- ── Everything ABOUT the document comes before it ──

                 The notice, the byline and the ownership note used to sit
                 BETWEEN the title and the body — 73px of status interrupting
                 the two things you can actually click and edit. The document's
                 whole model is that you touch text and it becomes editable, and
                 that reads as one surface only when the editable blocks are
                 contiguous. So the head is a head: it goes above the title, and
                 title and body are neighbours. -->
            ${(notice || docByline(o) || (!preview && !owns)) ? `<header class="doc-head">
              ${notice}
              ${docByline(o)}
              ${!preview && !owns ? `<p class="doc-note">Owned by ${esc(o.owner)}, not you. Your edit is recorded against your name.</p>` : ''}
            </header>` : ''}

            <!-- No contenteditable at rest. See armEditable: the attribute
                 arrives under the pointer and leaves when you look away, so
                 what you land on is a document, not a form holding one. -->
            <h1 class="doc-title" spellcheck="false" data-edit-title
                ${preview ? '' : 'tabindex="0" aria-label="Title — press Enter to edit"'}
                >${esc(o.title)}</h1>

            <div class="dv-body${!preview && blank ? ' is-blank' : ''}"
                 spellcheck="false" id="editBody" data-drop-body
                 ${preview ? '' : 'tabindex="0" aria-label="Document — press Enter to edit"'}
                 data-placeholder="Write here, drop a file, or use Draft with AiMY above.">
              ${preview ? `<p>${esc(VERSION_BODY(o, previewVer))}</p>`
                /* One empty paragraph, not nothing. An empty body has no block
                   for the caret to be IN, so `caretBlock` returned null, so the
                   toolbar never appeared and the + with it — on the one document
                   where you have the most to add. Typing into a bare body also
                   makes a naked text node the block model cannot see. */
                : blank ? '<p><br></p>'
                : o.html || `<p>${esc(o.sum)}</p>${o.src === 'upload' && /^new-/.test(o.id)
                    ? '' : `<p>${esc((BODY_COPY[o.t] || [''])[0])}</p>`}`}
            </div>

            <!-- A blank document's starting moves, BELOW the empty body rather
                 than above it — put between the title and the body they would
                 break the same run of editable blocks the head just stopped
                 breaking. A document with a body does not need them: the
                 assistant is on the block, and connecting is in the rail. -->
            ${preview || !blank ? '' : `<div class="doc-start">
              <button class="doc-ai" data-ai-doc aria-haspopup="true" aria-expanded="false">
                ${AIMY_MARK(13, 15)}<span>Draft with AiMY</span></button>
              <!-- Starting from a file you already have is the third way in, and
                   it was the only one with no control — it existed as a drag
                   gesture and nothing else. -->
              <button class="doc-start-act" data-pick-files>
                ${ICO.upload ? ICO.upload.replace('<svg', '<svg width="13" height="13"') : ''}<span>Start from a file</span></button>
              <button class="doc-start-act" data-act="connect" data-obj="${o.id}">
                ${AIMY_MARK(13, 15)}<span>Connect it to documents</span></button>
            </div>
            <p class="doc-start-fine">${o.pendingText
              ? `<strong>${esc(o.pendingText)}</strong> is filed here — its text has not been
                 pulled out yet, which needs the ingestion service. Draft from it, or write it here.`
              : `Or drop one on the page — ${esc(FILE_KINDS)}`}</p>`}

            ${aiDraftBlock(o)}

            <!-- Comments belong under the writing, not beside it. You comment
                 on a document while READING it — you have just found the thing
                 you want to say something about — and in a 320px rail the
                 thread was 141px of somebody else's column. -->
            ${preview ? '' : (() => {
              const thread = commentThread(o);
              if (!thread) return '';
              const n = (o.comments || []).length;
              return `<section class="doc-comments" aria-label="Comments">
                <h2 class="doc-comments-head">${n ? n + ' comment' + (n === 1 ? '' : 's') : 'No comments yet'}</h2>
                ${thread}
              </section>`;
            })()}
          </div>
        </div>

        <aside class="doc-rail" aria-label="About this document">
          <!-- All three closed. The document is what you came for; the rail is
               what you go to when you have a question about it, and three open
               blocks answered questions nobody had asked yet.

               The titles are the questions each one answers, in parallel, so
               the summary alone tells you whether to open it. "About it" was
               vague enough to mean any of the three. -->
          ${railBlock('What it is', false, propsPanel(o))}
          ${railBlock('What it connects to', false, connectionsBlock(o), claimsOf(o).length)}
          ${railBlock('Where it came from', false, provenanceBlock(o))}
          <div class="rail-foot">
            <!-- Not on a draft. Nobody else can read it, so there is nobody to
                 report it to and no thread for the report to land in — pressing
                 this on a draft used to write a comment into a document that
                 renders none, and say it had worked. -->
            ${o.status === 'draft' ? ''
              : `<button class="cite-action" data-act="report" data-obj="${o.id}">${ICO.flag}Report a problem</button>`}
            <button class="cite-action" data-act="${o.arch ? 'restore' : 'archive'}" data-obj="${o.id}">${ICO.box}${o.arch ? 'Restore' : 'Archive'}</button>
            ${o.arch ? `<button class="cite-action is-danger" data-act="delete" data-obj="${o.id}">${ICO.x}Delete</button>` : ''}
          </div>
        </aside>
      </div>`;

    const canvas = $('#docCanvas');
    if (canvas) canvas.scrollTop = keep;
    if (!preview) wireSelectionMenu();
    /* A repaint replaces the DOM the caret was living in. Scroll was already
       carried across; the armed state has to travel with it or an AI accept
       mid-edit would drop you back out of the text you were in. */
    if (armed) { const el = $(armed); if (el) { armEditable(el); caretToEnd(el); } }
    else if (blank) { const t = $('[data-edit-title]'); if (t) setTimeout(() => armEditable(t), 80); }
  }

  /* ── Read first, edit on touch ──

     The page used to render with `contenteditable` already on, which made it an
     editor displaying a document rather than a document you can change. Nothing
     is armed now. The attribute arrives when you put the pointer in the text and
     leaves when you look away, and the formatting toolbar comes with it — at
     rest there is no chrome to say "this is a form".

     Because the element was NOT editable when the pointer went down, the browser
     does not place a caret for us. We place it at the point, or the click would
     silently jump to the start of the block and you would type in the wrong
     place. */
  function editableAt(x, y) {
    if (document.caretRangeFromPoint) return document.caretRangeFromPoint(x, y);
    if (!document.caretPositionFromPoint) return null;
    const p = document.caretPositionFromPoint(x, y);
    if (!p) return null;
    const r = document.createRange();
    r.setStart(p.offsetNode, p.offset); r.collapse(true);
    return r;
  }

  function putCaret(range) {
    if (!range) return;
    const sel = window.getSelection();
    sel.removeAllRanges(); sel.addRange(range);
  }

  function caretToStart(el) { const r = document.createRange(); r.selectNodeContents(el); r.collapse(true); putCaret(r); }
  function caretToEnd(el)   { const r = document.createRange(); r.selectNodeContents(el); r.collapse(false); putCaret(r); }

  function armEditable(el, x, y) {
    if (!el || el.getAttribute('contenteditable') === 'true') return;
    /* History is readable, never writable — the version banner says so and the
       attribute must agree with it. */
    if ($('.ver-preview')) return;
    el.setAttribute('contenteditable', 'true');
    const page = el.closest('.doc-page');
    if (page && el.id === 'editBody') page.classList.add('is-writing');
    el.focus({ preventScroll: true });
    if (typeof x === 'number') putCaret(editableAt(x, y));
    else caretToStart(el);
    if (el.id === 'editBody') setTimeout(placeBlockMark, 0);
  }

  function disarmEditable(el) {
    if (!el || !el.removeAttribute) return;
    el.removeAttribute('contenteditable');
    const page = el.closest && el.closest('.doc-page');
    if (page) page.classList.remove('is-writing');
    dropBlockMark();
  }

  /* ── One toolbar, on the block you are editing ──

     The document has one rule — nothing is armed until you touch it — and the
     writing tools used to ignore it twice over: a formatting toolbar pinned to
     the top of the paper, occupying 46px of hidden box on every document, and
     an assistant in the right gutter whose menu had 104px to open into and so
     clipped itself.

     They are one thing now, above the block the caret is in, where there is the
     full measure to open into. Invisible in view mode, following the caret, and
     gone when the caret is. */
  function dropBlockMark() {
    const m = $('#blkTools');
    if (m) m.remove();
    closeBlockMenu();
  }

  function caretBlock() {
    const body = $('#editBody');
    if (!body || body.getAttribute('contenteditable') !== 'true') return null;
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || !body.contains(sel.anchorNode)) return null;
    /* Two menus over one paragraph is one too many: a selection belongs to
       wireSelectionMenu, which is already anchored to the words. */
    if (!sel.isCollapsed) return null;
    let n = sel.anchorNode;
    while (n && n.parentElement !== body) n = n.parentElement;
    return n && n.nodeType === 1 ? n : null;
  }

  function placeBlockMark() {
    const block = caretBlock();
    const host = $('#docCanvas');
    if (!block || !host) { dropBlockMark(); return; }
    let m = $('#blkTools');
    if (!m) {
      m = document.createElement('div');
      m.id = 'blkTools';
      m.className = 'toolbar blk-tools';
      m.setAttribute('role', 'toolbar');
      m.setAttribute('aria-label', 'Writing tools');
      m.innerHTML = `<button class="icon-btn blk-add" type="button" data-blocks
           aria-haspopup="true" aria-expanded="false"
           aria-label="Add a block" title="Add a block">+</button>
         <span class="toolbar-sep"></span>`
        + TOOLBAR.map(([cmd, glyph, label]) => cmd === '|'
        ? '<span class="toolbar-sep"></span>'
        : `<button class="icon-btn" type="button" aria-label="${esc(label)}" title="${esc(label)}"
             data-fmt="${esc(cmd)}">${glyph}</button>`).join('')
        + '<span class="toolbar-sep"></span>'
        + `<button class="blk-ai" type="button" data-ai-doc aria-haspopup="true" aria-expanded="false"
             aria-label="Rewrite this with AiMY" title="Rewrite with AiMY">
             ${AIMY_MARK(13, 15)}<span>AiMY</span></button>`;
      host.appendChild(m);
      syncToolbar();
    }
    const hr = host.getBoundingClientRect(), br = block.getBoundingClientRect();
    /* Above the block, aligned to the text's left edge — the measure is 762px
       wide, so the menu this opens has somewhere to go. In the gutter it had
       104px and clipped itself. */
    m.style.top = (br.top - hr.top + host.scrollTop - m.offsetHeight - 8) + 'px';
    m.style.left = Math.max(0, br.left - hr.left) + 'px';
  }

  const isEditable = (el) => !!el && !!el.matches && el.matches('[data-edit-title], #editBody');

  /* The block list, from the + or from a slash. `slashed` remembers that the
     block still holds the "/" that opened it, so choosing an item clears it
     first — otherwise every block made this way starts with a stray character. */
  let slashed = null;

  function closeBlockMenu() {
    const m = $('#blkMenu');
    if (m) m.remove();
    const btn = $('[data-blocks]');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function openBlockMenu(rect, fromSlash) {
    closeBlockMenu();
    const host = $('#docCanvas');
    if (!host) return;
    slashed = fromSlash ? caretBlock() : null;
    const hr = host.getBoundingClientRect();
    const m = document.createElement('div');
    m.id = 'blkMenu';
    m.className = 'blk-menu k-enter';
    m.setAttribute('role', 'menu');
    m.innerHTML = BLOCKS.map(([label, glyph], i) =>
      `<button class="blk-menu-item" type="button" role="menuitem" data-block="${i}">
         <span class="blk-menu-ico">${glyph}</span>${esc(label)}</button>`).join('');
    host.appendChild(m);
    m.style.left = Math.max(0, rect.left - hr.left) + 'px';
    m.style.top = (rect.bottom - hr.top + host.scrollTop + 6) + 'px';
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
    renderDoc(readURL());
    markAfter('#aiSuggest', $('#docCanvas'));
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
    const b = $('.doc-page [data-publish]');
    if (b) {
      const has = !!o.sum;
      b.disabled = !has;
      b.textContent = has ? 'Publish' : 'Add some content first';
    }
    return o;
  }

  /* A toolbar that never shows what is already on is telling you nothing. */
  function syncToolbar() {
    $$('.doc-page [data-fmt]').forEach((btn) => {
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
    renderDoc(st);
  }



  /* ── AiMY, at document scope ──

     The toolbar's AiMY button used to raise a toast telling you to select
     something first, which is a button explaining why it does nothing. It now
     opens the same `.ai-menu` the selection uses, with the actions that apply
     to a whole document. A blank one leads with the only action that matters
     when there is nothing there yet. */
  const DOC_AI = {
    /* Not a constant. "Draft from a linked ticket" was offered on every blank
       document, and a blank document has no connections at all — so it named a
       ticket out of nowhere, and only ever a ticket. It is offered when there
       is something to draft FROM, it works off whatever is actually connected,
       and it says which. The loop is: connect it, then draft from them. */
    blank:  ['Write a first draft', 'Outline it'],
    fromConnections: 'Draft from what it connects to',
    /* "Find a source for this" is not a writing action — it runs
       groundingAnswer, which finds what SUPPORTS the document — and filing it
       under a menu named for rewriting made the one genuinely useful thing in
       here the hardest to find. It lives in Where it came from now, beside the
       source it is asking about. */
    filled: ['Rewrite for support agents', 'Shorten', 'Expand', 'Fill the gaps']
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

      /* Built from the documents actually connected, whatever type they are, so
         it cannot invent a source and always says what it drew on. */
      case DOC_AI.fromConnections: {
        const from = claimsOf(o).slice(0, 3);
        if (!from.length) return paras(['Nothing is connected to this yet, so there is nothing to draft from.']);
        const names = from.map((e) => e.label);
        const list = names.length === 1 ? names[0]
          : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
        const kinds = [...new Set(from.map((e) => {
          const d = byId(e.id); return d ? TYPES[d.t].label.toLowerCase() : 'document';
        }))];
        return paras([
          `${what} draws on ${list}. What follows is what those ${kinds.length === 1 ? kinds[0] + 's' : 'documents'} already establish, written once so a reader does not have to open all ${names.length}.`,
          `Where they agree, the rule is stated here and they are the evidence for it. Where they disagree, the disagreement is the finding, and it is named rather than smoothed over.`,
          `Each of them remains the record of its own case. This is the part that generalises${tags ? ', including what ' + tags + ' has in common across them' : ''}.`
        ]);
      }

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
    const host = $('#docCanvas');
    if (!host) return null;
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
        const host = $('#docCanvas');
        const hr = host.getBoundingClientRect();
        const menu = document.createElement('div');
        menu.className = 'ai-menu is-open k-enter';
        menu.style.left = Math.max(8, r.left - hr.left) + 'px';
        menu.style.top = (r.bottom - hr.top + host.scrollTop + 8) + 'px';
        /* The library's menu is buttons in a row with an optional primary and
           separators. It has no header slot, so the earlier version invented
           `.ai-menu-head` and `.ai-menu-item`, which resolved to nothing. */
        menu.dataset.sel = sel.toString().trim();
        /* ── Formatting first, because that is what a selection is for ──

           This menu carried only the AiMY actions, and the formatting lived in
           the block toolbar — which hides the moment there IS a selection, so
           selecting a word and reaching for Bold found nothing anywhere on the
           page. The two halves of "I have selected some words" belong in one
           place: what to do to them, then what to ask AiMY about them. */
        menu.innerHTML =
          SEL_FMT.map(([cmd, glyph, label]) =>
            `<button class="ai-menu-fmt" type="button" data-fmt="${esc(cmd)}"
               aria-label="${esc(label)}" title="${esc(label)}">${glyph}</button>`).join('')
          + '<span class="sep"></span>'
          + ['Rewrite', 'Shorten', 'Add the missing scope', 'Find a source']
            .map((l, i) => `<button${i === 0 ? ' class="ai-menu-primary"' : ''} data-ai-sel="${esc(l)}">${esc(l)}</button>`)
            .join('<span class="sep"></span>');
        host.appendChild(menu);
        syncToolbar();
      }, 10);
    });
    body.addEventListener('keydown', kill);
    const scroller = $('#docCanvas');
    if (scroller) scroller.addEventListener('scroll', kill, { passive: true });
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
        /* Topmost first. The bell panel is a dropdown off the chrome, so it is
           always the shallowest thing open and always the first to go. */
        if (bell.open) { bell.close(true); return; }
        if (peekStack.length) { closePeek(); return; }
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
      <div class="conflict-meta">${esc(SRC[o.src].label)} · ${esc(o.owner)} · ${neverCited(o) ? 'never used' : 'used ' + esc(usedLabel(o).toLowerCase())},
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
            <strong>${esc(o.title)}</strong> — ${esc(citedPhrase(o).toLowerCase())}.</p>`).join('')}
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

    /* ── Two shells, one surface ──

       A centred box is right when the decision was made before it opened and
       all that is left is to confirm it. Connecting is the other case: the
       surface IS the decision, the list is as long as the library, and a box
       that grows with its content had to be capped, which put the confirm
       button behind a scroll. The sheet takes the full height of the window
       instead, so the list has somewhere to go and the foot never moves. */
    host.innerHTML = `
      <div class="modal-backdrop${o.sheet ? ' is-sheet' : ''}" style="display:flex" data-hide-on-backdrop>
        <div class="modal${o.sheet ? ' modal-sheet' : ''}" role="dialog" aria-modal="true" aria-label="${esc(o.title)}" style="width:${o.width || 560}px;max-width:100%">
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
            <!-- A commit body that is a CHOICE, not a warning. The library's
                 surface assumes the decision was made before it opened and it
                 only has to be confirmed; connecting is the case where the
                 surface is where you decide. See GAPS.md. -->
            ${o.body || ''}
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
  /* A number stacked over its noun is the same label/value shape as everywhere
     else, and reads as two things. "5 documents" is one. */
  const factRow = (pairs) => `<div class="conv-facts">${pairs.filter(Boolean).map(([v, l]) =>
    `<span class="conv-fact"><strong>${v}</strong> ${esc(l)}</span>`).join('')}</div>`;



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
    /* The bell is derived state like the rail, so it repaints with it rather
       than being told by whoever happened to change the corpus. */
    bell.sync();
    renderFilters(st);
    renderChips(st);

    if (forcedState === 'loading' || forcedState === 'error') { renderState(forcedState); return; }

    /* One stage. A document is a page now, so it renders INSTEAD of the grid
       rather than over it — a modal has no room for a rail, and a document
       with its facts, its connections, its history and its comments needs one.
       The filter state is untouched in the URL, so closing returns to exactly
       the surface you left. */
    /* A document is a page, so it gets the window. The briefing rail is about
       what changed on the workbench since your last visit; while you are
       reading one document it is 268px of something else, and the measure the
       body needs is worth more than it. */
    document.body.classList.toggle('is-doc', !!(st.doc && byId(st.doc)));
    if (st.doc && byId(st.doc)) { renderDoc(st); }
    else { $('#wbStage').removeAttribute('data-doc'); renderGrid(st); }

    if (st.settings) renderSettings(st);
    else if (setModal.open) setModal.close();



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
      patch({ doc: intent.id });
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
        /* No "editor" any more: a document is one surface, so opening one IS
           opening the editor. */
        ['a document', 'doc:' + protoFirst((o) => !o.arch && o.owner === USER.owner)],
        ['new document', 'new:1'],
        ['settings — a source', 'set:source:' + (deadSrc || 'confluence')],
        ['settings — a collection', 'set:collection:' + USER.collections[0]],
        ['settings — archiving', 'set:data'],
        ['the canvas', 'canvas:1'],
        ['a peek', 'peek:client:nordwind']
      ]],
      /* Two states you cannot reach by clicking, because they only exist once
         somebody overrules the computation — and they are the ones with the
         most design in them: both open a picker rather than a destination. */
      ['Make a condition', 'Sets the status by hand, as a person would.', [
        ['superseded, nothing linked', 'mk:superseded'],
        ['conflicting, nothing linked', 'mk:conflicting']
      ]],
      /* ── Every surface that can be empty, reachable ──

         An empty state is the hardest thing in a prototype to look at, because
         the fixtures are built to be full and nothing in the product will take
         you there. Each of these forces the REAL condition — mutating the
         corpus where it has to — rather than faking the markup, so what you see
         is what a person would see. "Reload the fixtures" undoes all of it. */
      ['Empty states', 'Forces the real condition. Reload the fixtures to undo.', [
        ['no results', 'url:?q=zzzzzz'],
        ['no folders', 'url:?q=zzzzzz&view=tree'],
        ['nothing archived', 'mt:archive'],
        ['a quiet briefing', 'mt:brief'],
        ['nothing left to connect', 'mt:connected'],
        ['no connections', 'mt:noedges'],
        ['no comments', 'mt:nocomments'],
        ['a blank document', 'new:1'],
        ['an empty library', 'mt:library']
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
    if (kind === 'doc')  { patch({ doc: arg }); return; }
    if (kind === 'edit') { patch({ doc: arg }); return; }
    if (kind === 'arch') { patch({ archived: true, doc: arg }); return; }
    if (kind === 'set')  { patch({ settings: arg }); return; }
    if (kind === 'new')  { newDocument('article'); return; }
    if (kind === 'canvas') { canvas.show(['Prototype']); return; }
    if (kind === 'peek') {
      const [k, v] = arg.split(':');
      openPeek(k, v, $('#protoToggle'));
      return;
    }
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
      patch({ doc: o.id });
      markCard(o.id);
      toast('Set to ' + STATUS[arg].label, 'Undo', esc(o.title) + ' · nothing is linked to it');
      undoStack = () => { delete o.statusSet; delete o.statusBy; recompute(); render(); };
      return;
    }
    /* ── Emptying something, for real ──

       Each of these changes the data the surface reads, so the surface is
       genuinely in the state rather than being told to look like it. */
    if (kind === 'mt') {
      /* `location.href` would reload, and a reload re-runs the fixtures — which
         would put back the very thing these triggers just took away. Every one
         of them has to stay inside the session. */
      if (arg === 'archive') {
        CORPUS.forEach((o) => { o.arch = false; });
        recompute();
        patch({ archived: true, doc: '' });
        return;
      }
      if (arg === 'library') {
        /* Everything gone. The one state a corpus of 42 fixtures can never
           reach on its own, and the first thing a new customer sees. */
        [CORPUS, LIVE, ENTITLED].forEach((a) => { a.length = 0; });
        EDGES.length = 0;
        ASKED.length = 0;
        USER.recent = [];
        recompute();
        patch({ archived: false, doc: '' });
        render();
        return;
      }
      if (arg === 'brief') {
        /* The briefing reports failing sources, out-of-date and unused
           documents, AiMY's drafts, unanswered questions and where you left
           off. All six have to be false at once, which is a rare morning and a
           perfectly ordinary one. */
        CORPUS.forEach((o) => { o.statusSet = 'current'; o.statusBy = USER.owner; });
        Object.keys(SRC).forEach((k) => { SRC[k].health = 'ok'; });
        USER.recent = [];
        ASKED.length = 0;
        lastFilter = null;
        recompute();
        render();
        toast('Nothing needs a person', null, 'Everything current, every source healthy');
        return;
      }
      const o = byId(readURL().doc) || ENTITLED.filter((x) => !x.arch && x.owner === USER.owner)[0];
      if (!o) { toast('Nothing to work with', null, 'Reload the fixtures'); return; }
      if (arg === 'connected') {
        /* Connected to everything, so there is nothing left to pick. */
        LIVE.forEach((x) => { if (x.id !== o.id) assertEdge(o.id, x.id, 'related'); });
        recompute();
        patch({ doc: o.id });
        toast('Connected to everything', null, 'Open Connect it to documents');
        return;
      }
      if (arg === 'noedges') {
        for (let i = EDGES.length - 1; i >= 0; i--) {
          if (EDGES[i].from === o.id || EDGES[i].to === o.id) EDGES.splice(i, 1);
        }
        recompute();
        patch({ doc: o.id });
        return;
      }
      if (arg === 'nocomments') {
        o.comments = [];
        patch({ doc: o.id });
        return;
      }
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
    /* Which edge the tree walks. Same shape as every other state change here:
       it goes in the URL, so a grouped tree is a link somebody can send. */
    document.addEventListener('dd:change', (e) => {
      const dd = e.target.closest('.v2-dropdown[data-group-key]');
      if (!dd) return;
      const opt = dd.querySelector('.v2-dropdown-option[aria-selected="true"]');
      const val = opt ? (opt.dataset.slug || 'col') : 'col';
      if (val !== readURL().group) patch({ group: val });
    });

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
      st.doc = '';
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

  /* The list is there when you open it, and searching narrows it. The field is
     a way through a long list, not a gate in front of it.

     Non-matching options are DETACHED rather than hidden. The library's
     keyboard model reads `.v2-dropdown-option` straight from the DOM and does
     not check `hidden`, so arrow keys would walk through rows nobody can see.
     Removing them keeps that model honest without touching the library, and the
     full ordered set is held here so reattaching restores the order exactly. */
  const ddAll = new WeakMap();

  function ddFilter(panel) {
    if (!panel) return;
    const box = $('[data-dd-search]', panel);
    if (!box) return;
    let all = ddAll.get(panel);
    if (!all) { all = $$('.v2-dropdown-option', panel); ddAll.set(panel, all); }

    const q = box.value.trim().toLowerCase();
    const none = $('.dd-none', panel);

    /* No query, no narrowing. The axis's "All" row survives either way:
       clearing a filter must never be something you have to spell your way
       back to. */
    const show = all.filter((o) => !q || !o.dataset.slug ||
      o.textContent.toLowerCase().indexOf(q) > -1);

    all.forEach((o) => { if (o.parentNode) o.remove(); });
    show.forEach((o) => panel.insertBefore(o, none));

    const hits = show.filter((o) => o.dataset.slug).length;
    if (none) none.hidden = !q || hits > 0;

    /* The library points aria-activedescendant at the selected option when it
       opens the panel — which is a moment before this runs, so it can be left
       naming a node that is no longer in the document. A screen reader would be
       told the active item is something it cannot find. */
    const active = panel.getAttribute('aria-activedescendant');
    if (active && !document.getElementById(active)) {
      panel.removeAttribute('aria-activedescendant');
      $$('.v2-dropdown-option.is-active', panel).forEach((o) => o.classList.remove('is-active'));
    }
  }

    /* Search inside a filter. The library's dropdown has letter typeahead — one
       key, 500ms buffer, jump to the first match — which is a different thing:
       it finds a value you can already spell. With a list of clients you cannot,
       so this narrows instead of jumping. Recorded in GAPS.md. */
    document.addEventListener('input', (e) => {
      const box = e.target.closest && e.target.closest('[data-dd-search]');
      if (!box) return;
      ddFilter(box.closest('.v2-dropdown-panel'));
    });

    /* Cull on open too, so the list is closed before the first keystroke rather
       than blinking shut after it. Next tick: the library opens the panel from
       its own click listener and this has to land after that. */
    document.addEventListener('click', (e) => {
      const btn = e.target.closest && e.target.closest('.v2-dropdown-btn');
      if (!btn) return;
      const panel = $('.v2-dropdown-panel', btn.closest('.v2-dropdown') || document.body);
      const box = panel && $('[data-dd-search]', panel);
      if (!box) return;
      /* Reopening starts from the whole list. A search you cannot see the end
         of, still applied from last time, is a filter hiding inside a filter. */
      setTimeout(() => { box.value = ''; ddFilter(panel); }, 0);
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
    /* ── Nothing in the writing chrome may take focus ──

       A button that takes focus on mousedown blurs the body, which disarms it,
       which repaints the document, which detaches the button — so the click
       that was travelling to it never lands. It looked like "the menu just
       closes and nothing happens".

       The toolbar and the assistant were guarded; the assistant's own MENU was
       not, so every draft action was dead. The rule is the surface, not the
       individual control: anything inside the writing chrome cancels its
       mousedown. */
    document.addEventListener('mousedown', (e) => {
      if (!e.target.closest) return;
      if (e.target.closest('.blk-tools') || e.target.closest('.ai-menu') ||
          e.target.closest('.blk-menu') || e.target.closest('[data-fmt]') ||
          e.target.closest('[data-pick-image]')) { e.preventDefault(); return; }
      /* Touching anything else puts the block list away. Choosing a block and
         pressing + again already close it; this is the third way out, which is
         the one you reach for without thinking. */
      if ($('#blkMenu')) closeBlockMenu();
    });

    /* Keep the toolbar honest about where the caret is. */
    document.addEventListener('selectionchange', () => {
      if ($('.doc-page [data-fmt]')) syncToolbar();
      /* The mark follows the caret from block to block, and leaves the moment
         there is a selection or nothing is armed. One listener, because the
         caret moving IS the only thing that can change which block it belongs
         to. */
      if ($('#editBody')) placeBlockMark();
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
      /* A slash alone on a block asks for the block list — the shortcut every
         document tool has. Anything else typed closes it again. */
      const blk = caretBlock();
      if (blk && blk.textContent.trim() === '/') openBlockMenu(blk.getBoundingClientRect(), true);
      else if ($('#blkMenu')) closeBlockMenu();
    }, true);

    /* Property key/value edits are committed on blur rather than on every
       keystroke — repainting mid-word would take the caret with it. */
    document.addEventListener('focusout', (e) => {
      const t = e.target;
      const o = byId(readURL().doc);
      if (!o || !t.hasAttribute) return;
      if (t.hasAttribute('data-prop-k')) {
        const was = t.getAttribute('data-prop-k'), now = t.value.trim();
        /* The key IS the identity, so a rename has to carry the open marker
           with it or the pair folds shut under the pointer mid-edit. */
        if (now && now !== was) {
          o.props[now] = o.props[was]; delete o.props[was];
          if (openProp === was) openProp = now;
          repaintEditor();
        }
      } else if (t.hasAttribute('data-prop-v')) {
        o.props[t.getAttribute('data-prop-v')] = t.value.trim();
        /* Leaving the pair folds it back to the phrase — but only if focus
           actually left the pair, not if it moved from the name to the value. */
        const pair = t.closest('.prop-kv');
        setTimeout(() => {
          if (pair && pair.contains(document.activeElement)) return;
          if (openProp !== null) { openProp = null; repaintEditor(); }
        }, 0);
      } else if (t.id === 'editBody') {
        /* Leaving the body is when the derived status can safely catch up —
           mid-word it would repaint under the caret. */
        disarmEditable(t);
        writeBody(t);
        recompute();
        repaintEditor();
      } else if (t.hasAttribute('data-edit-title')) {
        disarmEditable(t);
        const v = t.textContent.trim();
        if (v && v !== o.title) { o.title = v; repaintEditor(); }
      }
    }, true);

    /* The connect picker filters in place. No repaint — a repaint would take
       the field and everything typed into it. */
    document.addEventListener('input', (e) => {
      if (!e.target.hasAttribute || !e.target.hasAttribute('data-pick-q')) return;
      const q = e.target.value.trim().toLowerCase();
      const body = e.target.parentNode;
      let n = 0;
      $$('[data-pick-row]', body).forEach((r) => {
        const on = !q || r.getAttribute('data-pick-row').indexOf(q) > -1;
        r.hidden = !on;
        if (on) n++;
      });
      const none = $('.cx-none', body) || $('.nb-none', body);
      if (none) none.hidden = n > 0;
    });

    document.addEventListener('change', (e) => {
      if (e.target.hasAttribute && e.target.hasAttribute('data-cx-pick')) syncPickCount();
    });

    document.addEventListener('input', (e) => {
      if (e.target.hasAttribute && e.target.hasAttribute('data-report-what')) gateReport();
    });

    /* Put the pointer in the text and the text becomes writable, at the point
       you touched. Nothing else on the page arms anything. */
    document.addEventListener('mousedown', (e) => {
      const el = e.target.closest && e.target.closest('[data-edit-title], #editBody');
      if (el) armEditable(el, e.clientX, e.clientY);
    }, true);

    /* The keyboard cannot put a pointer anywhere, so the two blocks are
       focusable and Enter arms them with the caret at the start. */
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const el = e.target;
      if (!isEditable(el) || el.getAttribute('contenteditable') === 'true') return;
      e.preventDefault();
      armEditable(el);
    });

    /* Escape leaves the text — and only the text. Without the capture guard it
       would also reach the handler that closes the document, so one key would
       both commit the edit and throw away the page it was made on. */
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      /* One Escape, one thing: the block list closes before the writing does. */
      if ($('#blkMenu')) { e.stopPropagation(); closeBlockMenu(); return; }
      const el = document.activeElement;
      if (!isEditable(el) || el.getAttribute('contenteditable') !== 'true') return;
      e.stopPropagation();
      el.blur();
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
      /* The relationship the whole batch is being asserted as. A segmented
         control, so exactly one is chosen and it is chosen once. */
      if ((el = t.closest('[data-cx-as]'))) {
        $$('.cx-seg .seg-btn').forEach((b) => {
          const on = b === el;
          b.classList.toggle('active', on);
          b.setAttribute('aria-pressed', String(on));
        });
        return;
      }
      if ((el = t.closest('[data-view]'))) { patch({ view: el.getAttribute('data-view') }); return; }
      if ((el = t.closest('[data-sort-attention]'))) {
        /* Write the state you are turning ON, not the absence of the other —
           an absent key means "this surface's default", and on the composed
           set that default is already attention, so clearing it would leave
           the button pressed and nothing changed. */
        const st0 = readURL();
        patch({ sort: orderOf(st0, isComposed(st0)) === 'attention' ? 'recent' : 'attention' });
        return;
      }
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
        /* A document reference opens the document. If the reference was inside
           the panel, the panel has done its job and goes — it closes only on
           an outside click otherwise, which would leave it hanging over the
           page it just sent you to. */
        if (peekStack.length) closePeek();
        patch({ doc: el.getAttribute('data-open-doc') });
        return;
      }
      if ((el = t.closest('[data-keep]'))) { canvas.close(); docAct('keep', el.getAttribute('data-keep')); return; }
      if ((el = t.closest('[data-compare-with]'))) { docAct('compare', el.getAttribute('data-compare-with')); return; }
      if ((el = t.closest('[data-resolve]'))) { canvas.close(); docAct('resolve', el.getAttribute('data-resolve')); return; }
      if (t.closest('[data-doc-close]')) { previewVer = null; patch({ doc: '' }); return; }

      /* ── editor: tabs, versions, properties ── */
      if ((el = t.closest('[data-open-ver]'))) { previewVer = +el.getAttribute('data-open-ver'); renderDoc(readURL()); return; }
      if (t.closest('[data-close-ver]')) { previewVer = null; renderDoc(readURL()); return; }
      if ((el = t.closest('[data-tag-drop]'))) {
        const o = byId(readURL().doc);
        const key = el.closest('[data-tag-field]').getAttribute('data-tag-field');
        o[key] = o[key].filter((x) => x !== el.getAttribute('data-tag-drop'));
        repaintEditor();
        return;
      }
      if ((el = t.closest('[data-prop-open]'))) {
        openProp = el.getAttribute('data-prop-open');
        repaintEditor();
        const v = $('[data-prop-v="' + openProp.replace(/"/g, '\\"') + '"]');
        if (v) setTimeout(() => { v.focus(); v.select(); }, 40);
        return;
      }
      if ((el = t.closest('[data-prop-del]'))) {
        const o = byId(readURL().doc);
        const k = el.getAttribute('data-prop-del');
        delete o.props[k];
        if (openProp === k) openProp = null;
        repaintEditor();
        return;
      }
      if (t.closest('[data-prop-add]')) {
        const o = byId(readURL().doc);
        let n = 1;
        while (o.props['property-' + n] !== undefined) n++;
        o.props['property-' + n] = '';
        /* A new one arrives open — there is nothing to read yet, and the
           placeholders are what name the two boxes. */
        openProp = 'property-' + n;
        repaintEditor();
        const key = $('[data-prop-k="' + openProp + '"]');
        if (key) setTimeout(() => { key.focus(); key.select(); }, 40);
        return;
      }
      if ((el = t.closest('[data-discard]'))) {
        const o = byId(el.getAttribute('data-discard'));
        [CORPUS, LIVE, ENTITLED].forEach((arr) => { const i = arr.indexOf(o); if (i > -1) arr.splice(i, 1); });
        patch({ doc: '' });
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
        assertEdge(a, b, 'contradicts');
        recompute();
        render();
        markCard(a); markCard(b);
        docAct('compare', a);
        return;
      }
      if ((el = t.closest('[data-set-successor]'))) {
        const [a, b] = el.getAttribute('data-set-successor').split(':');
        if (!byId(a) || !byId(b)) return;
        assertEdge(a, b, 'supersededBy');
        recompute();
        canvas.close();
        patch({ doc: b });
        markCard(a); markCard(b);
        toast('Recorded', 'Undo', esc(byId(b).title) + ' replaces ' + esc(byId(a).title));
        undoStack = () => { dropEdge(a, b); recompute(); render(); };
        return;
      }
      /* Promoting a neighbour to a connection is a claim about two documents,
         so it goes through the commit surface and comes out with a name and a
         date on it — which is the whole difference between the two lists. */
      if ((el = t.closest('[data-connect]'))) {
        const [a, b] = el.getAttribute('data-connect').split('|');
        const A = byId(a), B = byId(b);
        if (!A || !B) return;
        commit({
          title: 'Connect two documents',
          current: A.title, proposed: B.title,
          rationale: 'AiMY noticed these share fields. Connecting them is <strong>your</strong> claim, '
            + 'and it will carry your name and today\'s date wherever it is read.',
          effects: [['ok', 'Both documents show <strong>Related to</strong> the other'],
                    ['ok', 'Recorded as asserted by ' + esc(USER.owner)]],
          confirm: 'Connect them', done: 'Connected',
          onRun: () => {
            assertEdge(a, b, 'related');
            recompute(); render(); markCard(a); markCard(b);
            toast('Connected', 'Undo', esc(A.title) + ' and ' + esc(B.title));
            undoStack = () => { dropEdge(a, b); recompute(); render(); };
          }
        });
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
        /* The second funnel. `writeURL` closes the canvas for anything that
           changes the URL, but a commit can change the page without touching
           it — connecting two documents rewrites the rail and leaves the
           address alone — and the result is behind the overlay either way. A
           commit that ran, changed something. */
        if (!failed && canvas.open) canvas.close();
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
      /* Folding the rail is view state, not document state — it is about this
         screen, not about this document, so it does not belong in the URL. */
      if (t.closest('[data-rail-toggle]')) { railOpen = !railOpen; renderDoc(readURL()); return; }

      /* ── the peek ── */
      if (t.closest('[data-peek-close]')) { closePeek(); return; }
      if (t.closest('[data-peek-back]')) { peekStack.pop(); peekRender(); return; }
      if ((el = t.closest('[data-peek-show]'))) {
        const [k, v] = el.getAttribute('data-peek-show').split(':');
        const f = (ENTITY[k] || {}).filter;
        closePeek();
        /* An axis the URL knows becomes that filter; anything else becomes the
           explicit set of ids, which is the same bridge an answer uses. */
        if (f && f !== 'ids' && LIST_KEYS.indexOf(f) > -1) patch({ [f]: [v] });
        else patch({ ids: docsOf(k, v).map((o) => o.id) });
        return;
      }
      if ((el = t.closest('[data-peek]'))) {
        const [k, v] = el.getAttribute('data-peek').split(':');
        /* Inside the panel it stacks; from the page it starts fresh. */
        openPeek(k, v, el, !!t.closest('#peek'));
        return;
      }
      if (peekStack.length && !t.closest('#peek')) closePeek();

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
          renderDoc(readURL());
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
          markAfter('#editBody', $('#docCanvas'));
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
            markAfter('#editBody', $('#docCanvas'));
            markCard(o.id);
            toast('Restored ' + from.v, null, 'Added as the newest version — nothing was deleted');
            return true;
          }
        });
        return;
      }
      /* The figure's own file field. Its mousedown is cancelled with the rest
         of the writing chrome, so the body is never blurred and never
         repainted — which is what keeps this element attached long enough for
         the picked file to land in it. */
      if ((el = t.closest('[data-pick-image]'))) {
        const name = el.getAttribute('data-pick-image');
        pickFiles('image/*', false, (files) => {
          const f = files[0];
          /* Re-found, not remembered. The dialog blurred the page and the
             editor repainted while it was open, so `el` and the figure it was
             in are both detached by now. */
          const fig = $(`.doc-figure[data-fig="${name}"]`);
          const ph = fig && $('.doc-figure-ph', fig);
          if (!fig) return;
          const img = document.createElement('img');
          img.className = 'doc-figure-img';
          img.src = URL.createObjectURL(f);
          img.alt = '';
          if (ph) ph.replaceWith(img); else fig.insertBefore(img, fig.firstChild);
          const cap = $('figcaption', fig);
          if (cap && !cap.textContent.trim()) cap.textContent = f.name.replace(/\.[^.]+$/, '');
          const body = $('#editBody');
          if (body) writeBody(body);
        });
        return;
      }
      if (t.closest('[data-pick-files]')) {
        pickFiles(FILE_ACCEPT, true, ingestFiles);
        return;
      }
      if ((el = t.closest('[data-blocks]'))) {
        const open = el.getAttribute('aria-expanded') === 'true';
        if (open) { closeBlockMenu(); return; }
        el.setAttribute('aria-expanded', 'true');
        openBlockMenu(el.getBoundingClientRect(), false);
        return;
      }
      if ((el = t.closest('[data-block]'))) {
        const spec = BLOCKS[Number(el.getAttribute('data-block'))];
        closeBlockMenu();
        if (!spec) return;
        const body = $('#editBody');
        if (body) {
          body.focus({ preventScroll: true });
          /* Clear the "/" that summoned the menu before the block is made. */
          if (slashed && slashed.textContent.trim() === '/') {
            const r = document.createRange();
            r.selectNodeContents(slashed);
            putCaret(r);
            document.execCommand('delete');
          }
          slashed = null;
          spec[2]();
          writeBody(body);
          setTimeout(placeBlockMark, 0);
        }
        return;
      }
      /* The toolbar's AiMY button: document scope. */
      if ((el = t.closest('[data-ai-doc]'))) {
        const o = byId(readURL().doc);
        const isBlank = o && !String(o.sum || '').trim();
        /* The draft-from-connections action is offered only when there is
           something to draft from, so the menu never names a source that does
           not exist. */
        const items = (isBlank ? DOC_AI.blank : DOC_AI.filled)
          .concat(o && claimsOf(o).length ? [DOC_AI.fromConnections] : []);
        aiMenu(el, items, 'data-ai-doc-run');
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
      if ((el = t.closest('[data-resolve-problem]'))) {
        const o = byId(readURL().doc);
        const i = Number(el.getAttribute('data-resolve-problem'));
        const c = o && (o.comments || [])[i];
        if (!c) return;
        c.done = true;
        c.resolvedBy = USER.owner;
        recompute();
        render();
        markAfter('.comment.is-done', $('#docCanvas'));
        markCard(o.id);
        toast('Marked resolved', 'Undo', 'The report stays on the document, closed');
        undoStack = () => { delete c.done; delete c.resolvedBy; recompute(); render(); };
        return;
      }
      if (t.closest('[data-comment-add]')) {
        const input = $('[data-comment-input]');
        const o = byId(readURL().doc);
        if (!input || !input.value.trim() || !o) return;
        addComment(o, input.value.trim());
        render();
        markAfter('.comment:last-of-type', $('#docCanvas'));
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
        patch({ doc: id });
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
        patch({ doc: el.getAttribute('data-card-open') });
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
    const cur = readURL();
    const st = { doc: '', settings: '', view: cur.view, group: cur.group, sort: cur.sort, q: '', prop: '' };
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
    st.doc = '';
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
      /* Nothing to pull from. The rail no longer offers this on a document with
         no upstream, but an old link or a proto entry still could, and running
         it would replace a body with an empty source. */
      if (noUpstream(o)) {
        toast('Nothing to re-sync from', null,
          bornHere(o) ? 'You wrote this here — it has no source' : 'A dropped file is not a live source');
        return;
      }
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
          markAfter('.rail-facts', $('#docCanvas'));
          markAfter('.doc-byline .trust-state', $('#docCanvas'));
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
        onRun: () => { o.arch = true; patch({ doc: '' }); markAfter('.rm-main'); }
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
          patch({ doc: '' });
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
        onRun: () => { o.arch = false; patch({ doc: '' }); markCard(o.id); }
      });
      return;
    }

    if (kind === 'successor') {
      const r = RELATED[o.id];
      if (r && r.supersededBy) patch({ doc: r.supersededBy });
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
          patch({ doc: '' });
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
    /* A search over the whole corpus, so it opens where searches open. Same
       rows and same `+` as before — only the container changed, from a 320px
       rail block to something wide enough to read. */
    if (kind === 'ground') { groundingAnswer(o); return; }
    if (kind === 'connect') { connectPicker(o); return; }
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
          /* The contradiction is settled, so it stops being a contradiction and
             becomes a supersession — one edge replacing another, both authored. */
          assertEdge(loser.id, winner.id, 'supersededBy');
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
      patch({ doc: o.id });
      setTimeout(() => {
        const dd = $('.v2-dropdown[data-prop-key="owner"] .v2-dropdown-btn');
        if (dd) { dd.scrollIntoView({ block: 'center' }); dd.focus(); }
      }, 120);
      return;
    }
    if (kind === 'source') { addFilter('source', o.src); return; }
    if (kind === 'open')   { patch({ doc: o.id }); return; }

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
      markAfter('.doc-byline .trust-state', $('#docCanvas'));
      toast(to && to !== 'auto' ? 'Status set to ' + STATUS[to].label : 'Status back to automatic',
        'Undo', to && to !== 'auto' ? 'Set by you, and marked as such' : 'Computed from the facts again');
      return;
    }

    /* ── A report has to carry what is wrong ──

       This wrote one canned sentence — "Reported a problem with this document."
       — and told you it was done. Three faults. It never asked **what** the
       problem was, so the owner got a flag with no information and no way to
       act on it. On a draft it lied: a draft renders no comment thread, so the
       toast said "Added to the comments" over a thread that does not exist and
       nothing appeared. And nothing carried the report anywhere the owner would
       look — it sat in a thread nobody had a reason to open.

       So: it asks, in the surface every consequential write already uses; it is
       gated until there is something to send; it lands in the thread marked as
       a problem rather than as a remark; and it shows up in the owner's
       briefing, which is the page whose whole job is what needs a person. */
    if (kind === 'report') {
      commit({
        title: 'Report a problem with this document',
        width: 520,
        rationale: `This goes to <strong>${esc(o.owner)}</strong>, who owns
          <strong>${esc(o.title)}</strong>, with your name and today's date on it.
          It does not change the document.`,
        confirm: 'Send it', done: 'Reported',
        effects: [['ok', 'Shows on the document as a reported problem'],
                  ['ok', 'Appears in ' + esc(o.owner) + '&rsquo;s briefing until it is resolved'],
                  ['warn', 'Anyone who can read this document can read the report']],
        body: `<div class="rp-form">
          <label class="field-label" for="rpWhat">What is wrong with it?</label>
          <textarea class="field-input rp-what" id="rpWhat" rows="3" data-report-what
            placeholder="The 14-day window contradicts the warranty article, which says 30."></textarea>
          <p class="rp-hint">One sentence is enough. Say what you expected and what it says.</p>
        </div>`,
        onRun: () => {
          const box = $('[data-report-what]');
          const what = box ? box.value.trim() : '';
          if (!what) return true;
          addComment(o, what, true);
          recompute();
          render();
          markAfter('.comment:last-of-type', $('#docCanvas'));
          markCard(o.id);
          toast('Reported', 'Undo', 'On ' + o.title + ' — ' + o.owner + ' will see it');
          undoStack = () => { o.comments.pop(); render(); };
          return true;
        }
      });
      /* Same gating as the typed confirmation: the button cannot be pressed
         until it would send something. An empty report is the defect this is
         fixing, so it must not be reachable by pressing straight through. */
      gateReport();
      return;
    }
  }

  /* New document — the mind map's manual Add.

     No confirmation. An empty draft commits nothing, changes nothing anyone
     else can see and is one click to discard, so a gate in front of it was
     ceremony around an action with no consequence. Every field it needs is in
     the editor's Properties panel, which is where you were going anyway. */
  /* `quiet` makes one without going to it — ingestion needs that, because five
     dropped files cannot all be opened and only the last one would win. */
  let newSeq = 0;
  function newDocument(type, seed, quiet) {
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
    if (!quiet) patch({ doc: id });
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
  /* Ingestion has worked since the fifth pass and nothing on the page said so.
     A capability you only discover by already dragging a file at it is a
     capability for people who guessed. This string is what it takes, said in
     the places somebody is looking for a way in. */
  const FILE_KINDS = 'Word, PDF, PowerPoint, Excel, Markdown, text, CSV, HTML or an image.';
  const FILE_ACCEPT = '.md,.txt,.doc,.docx,.pdf,.ppt,.pptx,.csv,.xlsx,.html,.htm,.png,.jpg,.jpeg';

  /* One input, reused. Dropping is a gesture you have to know about; choosing is
     one every file field has taught. Both end in the same function. */
  let filePicker = null;
  function pickFiles(accept, multiple, onPick) {
    if (!filePicker) {
      filePicker = document.createElement('input');
      filePicker.type = 'file';
      filePicker.hidden = true;
      document.body.appendChild(filePicker);
    }
    filePicker.value = '';
    filePicker.accept = accept || '';
    filePicker.multiple = !!multiple;
    filePicker.onchange = () => { if (filePicker.files && filePicker.files.length) onPick(filePicker.files); };
    filePicker.click();
  }

  const isBlankDoc = (o) => o && !String(o.sum || '').trim() && !String(o.html || '').trim();

  /* ── What a drop means depends on where you drop it ──

     One sentence covered every case and was wrong in two of them. Dropping a
     file while a document you had just created was open made a SECOND document
     and navigated to it, leaving the blank one behind — and dropping while
     editing a written document threw you off the page you were writing. */
  function dropIntent() {
    const o = byId(readURL().doc);
    if (isBlankDoc(o)) {
      return { title: 'Drop to fill this document',
               sub: 'The file becomes “' + o.title + '”. Nothing else is created.' };
    }
    if (o) {
      return { title: 'Drop to add to Knowledge',
               sub: 'A draft per file. This document stays open.' };
    }
    return { title: 'Drop to add to Knowledge',
             sub: 'A draft per file, owned by you. Nothing goes live until you say so.' };
  }

  /* ── A file arrives as blocks, not as one paragraph of its own source ──

     Ingestion used to put the raw text into `o.sum`, which the document renders
     as a single `<p>`. A Markdown file therefore arrived with its headings,
     lists and quotes visible as `#` and `-` in the middle of a sentence, and a
     document with structure came in with none. `o.html` is what the body reads
     when it has one, so that is what a file should produce. */
  const mdInline = (s) => esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');

  function mdToHTML(src) {
    const out = [];
    let list = null, code = null;
    const closeList = () => { if (list) { out.push('</' + list + '>'); list = null; } };
    src.split(/\r?\n/).forEach((raw) => {
      const line = raw.replace(/\s+$/, '');
      if (/^\s*```/.test(line)) {
        if (code) { out.push('<pre class="doc-code"><code>' + esc(code.join('\n')) + '</code></pre>'); code = null; }
        else { closeList(); code = []; }
        return;
      }
      if (code) { code.push(raw); return; }
      if (!line.trim()) { closeList(); return; }
      let m;
      if ((m = line.match(/^(#{1,6})\s+(.*)$/))) {
        closeList();
        /* The document's own scale is h3 / h4 — the title is the h1 and there
           is no h2 in it, so an imported heading tree flattens into those two
           rather than introducing a third size nothing else uses. */
        const lvl = Math.min(m[1].length + 2, 4);
        out.push('<h' + lvl + '>' + mdInline(m[2]) + '</h' + lvl + '>');
        return;
      }
      if (/^\s*[-*+]\s+/.test(line)) {
        if (list !== 'ul') { closeList(); out.push('<ul>'); list = 'ul'; }
        out.push('<li>' + mdInline(line.replace(/^\s*[-*+]\s+/, '')) + '</li>');
        return;
      }
      if (/^\s*\d+[.)]\s+/.test(line)) {
        if (list !== 'ol') { closeList(); out.push('<ol>'); list = 'ol'; }
        out.push('<li>' + mdInline(line.replace(/^\s*\d+[.)]\s+/, '')) + '</li>');
        return;
      }
      if (/^\s*>\s?/.test(line)) {
        closeList();
        out.push('<blockquote>' + mdInline(line.replace(/^\s*>\s?/, '')) + '</blockquote>');
        return;
      }
      if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { closeList(); out.push('<hr class="doc-hr">'); return; }
      closeList();
      out.push('<p>' + mdInline(line) + '</p>');
    });
    if (code) out.push('<pre class="doc-code"><code>' + esc(code.join('\n')) + '</code></pre>');
    closeList();
    return out.join('');
  }

  const plainToHTML = (src) => src.split(/\r?\n\s*\r?\n/)
    .map((b) => b.trim()).filter(Boolean)
    .map((b) => '<p>' + esc(b).replace(/\r?\n/g, '<br>') + '</p>')
    .join('') || '<p><br></p>';

  const textOf = (html) => {
    const d = document.createElement('div');
    d.innerHTML = html;
    return (d.textContent || '').replace(/\s+/g, ' ').trim();
  };

  function readInto(doc, f) {
    const done = () => {
      recompute();
      if (readURL().doc === doc.id) renderDoc(readURL());
    };
    if (!TEXTY.test(f.name)) {
      /* Nothing to read without an extraction service. The body stays EMPTY —
         writing the explanation into it would fill the document with a sentence
         about itself, and a document with a body loses the starting moves that
         are the whole answer to "so what do I do with this". The fact is
         recorded on the document and stated above those moves instead. */
      doc.pendingText = f.name;
      done();
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      let text = String(reader.result);
      if (/\.html?$/i.test(f.name)) text = text.replace(/<[^>]*>/g, ' ');
      const md = /\.(md|markdown)$/i.test(f.name);
      /* A Markdown file's first `# Heading` IS the document's title, and
         repeating it as the first block of its own body is the thing every
         importer gets wrong once. */
      if (md) {
        const m = text.match(/^\s*#\s+(.+?)\s*(\r?\n|$)/);
        if (m) { doc.title = m[1]; text = text.slice(m[0].length); }
      }
      doc.html = md ? mdToHTML(text) : plainToHTML(text);
      doc.sum = textOf(doc.html).slice(0, 400);
      done();
    };
    reader.readAsText(f);
  }

  function ingestFiles(files) {
    const list = Array.from(files || []);
    if (!list.length) return;
    const open = byId(readURL().doc);

    /* A blank document is a document waiting for content. Filling it is what
       you meant; making a second one beside it never was. */
    if (isBlankDoc(open) && list.length === 1) {
      const f = list[0];
      open.title = f.name.replace(/\.[^.]+$/, '');
      open.props = Object.assign({}, open.props,
        { 'source-file': f.name, size: Math.max(1, Math.round(f.size / 1024)) + ' KB' });
      readInto(open, f);
      recompute();
      renderDoc(readURL());
      toast('Filled from “' + f.name + '”', null, 'Still a draft, still yours');
      return;
    }

    const made = list.map((f) => {
      const ext = (f.name.split('.').pop() || '').toLowerCase();
      const doc = newDocument(EXT_TYPE[ext] || 'article', {
        title: f.name.replace(/\.[^.]+$/, ''),
        props: { 'source-file': f.name, size: Math.max(1, Math.round(f.size / 1024)) + ' KB' }
      }, true);
      readInto(doc, f);
      return doc;
    });

    const one = made.length === 1;
    /* Opening the new draft is right when you were browsing and made one thing.
       It is wrong when you were reading something else, and wrong when there
       are five of them and only the last would win. */
    if (one && !open) { patch({ doc: made[0].id }); return; }
    recompute();
    render();
    made.forEach((d) => markCard(d.id));
    toast(one ? 'Added “' + list[0].name + '”' : 'Added ' + list.length + ' files',
      one ? 'Open it' : null, open ? 'Draft, owned by you. ' + open.title + ' stays open.'
                                   : 'Draft, owned by you. Nothing is live until you say so.');
    /* The toast has one action slot and it runs `undoStack`. This is the one
       case where that action is not an undo: staying put is the right default,
       so the way to the thing you just made has to be offered rather than
       taken. */
    if (one) undoStack = () => patch({ doc: made[0].id });
  }

  /* The drop layer covers the whole workbench. dragenter/dragleave fire on every
     child, so the depth counter is what stops it flickering as the pointer
     crosses a card. */
  function wireDrop() {
    const layer = $('#dropLayer');
    if (!layer) return;
    let depth = 0;
    /* Not while a commit surface is up. A sheet or a modal is a question the
       page is waiting on an answer to, and quietly making four documents
       behind it is not an answer to any of them. */
    const hasFiles = (e) => e.dataTransfer &&
      Array.from(e.dataTransfer.types || []).indexOf('Files') > -1 &&
      !($('#commitHost') || {}).innerHTML;
    const title = $('.drop-title', layer), sub = $('.drop-sub', layer);
    document.addEventListener('dragenter', (e) => {
      if (!hasFiles(e)) return;
      depth++;
      /* Written at the moment it appears, because what a drop does here is a
         function of what is open, and the answer changes while the page is
         alive. */
      const say = dropIntent();
      if (title) title.textContent = say.title;
      if (sub) sub.textContent = say.sub;
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
    bell.init();
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
