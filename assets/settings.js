/* ═══════════════════════════════════════════════════════════════════════════
   settings.js — AiMY Settings

   A page, not a fourth overlay. The corpus already carries the canvas, the
   settings sheet and the peek; settings is somewhere you go, and giving it a
   URL is what makes it linkable, bookmarkable and drivable by an agent.

   The state is the query string, same as the corpus. `?module=` names which
   surface is open and its absence means the ledger. Nothing on this page
   narrows the view off a variable the URL does not also hold, because a filter
   with neither a control nor a chip has silently taken something away.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ═══ FIXTURES ═══
     Mirrors assets/knowledge.js lines 224-352 and 255-275. This page cannot
     load knowledge.js without booting the whole corpus, so the shape is copied.
     It WILL drift, and the fix is to lift both into a shared assets/data.js;
     that is deliberately not done here because it would edit knowledge.js and
     this build was scoped to leave the app alone. Until then, this block is the
     copy and knowledge.js is the original. */
  const USER = {
    name: 'Nour Wael', initials: 'NW', role: 'Product Design', owner: 'N. Wael',
    collections: ['policies', 'support', 'marketing', 'sales']   /* legal is not entitled */
  };

  const COLLECTIONS = { policies: 'Policies', support: 'Support', sales: 'Sales', marketing: 'Marketing', legal: 'Legal' };
  const ORGS = { flairs: 'FlairsTech', cxs: 'CXS', upland: 'Upland', medfar: 'MedFar' };
  const GROUPS = { qa: 'QA Reviewers', leads: 'Support Leads', am: 'Account Managers', se: 'Solution Engineers' };

  /* Clients, mirroring knowledge.js:305. Six come from the production console;
     the four below the line are the original corpus fixtures, kept there
     because document titles reference them. */
  const CLIENTS = {
    asteris: 'Asteris', upland: 'Upland', valsoft: 'Valsoft',
    connect: 'Connect', cxs: 'CXS', flighthub: 'FlightHub',
    nordwind: 'Nordwind GmbH', tavola: 'Tavola Retail',
    meridian: 'Meridian Health', orbit: 'Orbit BPO'
  };

  /* A client's own product line, mirroring knowledge.js:312. Upland's fourteen
     are the console's real list; the rest are placeholders awaiting theirs.

     Note the word trap this resolves, because the targeting picker below walks
     straight into it: the console's "product" is a TENANT's software line
     (InterFAX Support, Kapost Support) and the repo's original "product" is
     AiMY's own (Copilot, Sales, Voice). Different things that shared a word.
     They coexist as two groups inside one axis, and collapsing them is how a
     rule aimed at one silently reaches the other. */
  const CLIENT_PRODUCTS = {
    upland: {
      interfax: 'InterFAX Support', powersteering: 'PowerSteering Service & Support',
      secondstreet: 'Second Street Support', kapost: 'Kapost Support', psa: 'PSA Support',
      bainsight: 'BA Insight Support', filebound: 'FileBound Support',
      ingenius: 'InGenius Support', roinnovation: 'RO Innovation Support',
      ultriva: 'Ultriva Support', eclipse: 'Eclipse Support',
      rightanswers: 'RightAnswers Support', panviva: 'Panviva Support',
      qvidian: 'Qvidian Support'
    },
    asteris:   { asterisImaging: 'Imaging Support', asterisVet: 'Vet Cloud Support' },
    valsoft:   { aspire: 'Aspire Support', hark: 'Hark Support' },
    connect:   { connectDesk: 'Connect Desk Support', connectVoice: 'Connect Voice Support' },
    cxs:       { cxsQa: 'QA Support', cxsAnalytics: 'Analytics Support' },
    flighthub: { fhBooking: 'Booking Support', fhCare: 'Care Support' }
  };
  const AIMY_PRODUCTS = { copilot: 'Copilot', sales: 'Sales', voice: 'Voice' };

  const CLIENT_PRODUCT_COUNT = Object.keys(CLIENT_PRODUCTS)
    .reduce((t, c) => t + Object.keys(CLIENT_PRODUCTS[c]).length, 0);
  const TARGET_TOTAL = CLIENT_PRODUCT_COUNT + Object.keys(AIMY_PRODUCTS).length;

  const AGENTS = [
    { id: 'copilot', name: 'Copilot', external: false },
    { id: 'sales',   name: 'Sales',   external: false },
    { id: 'voice',   name: 'Voice',   external: true  }
  ];

  const COLLECTION_META = {
    policies:  { owner: 'A. Mahfouz', grounding: { copilot: true,  sales: false, voice: false } },
    support:   { owner: 'N. Wael',    grounding: { copilot: true,  sales: false, voice: true  } },
    sales:     { owner: 'Sales Ops',  grounding: { copilot: false, sales: true,  voice: false } },
    marketing: { owner: 'Marketing',  grounding: { copilot: false, sales: true,  voice: false } },
    legal:     { owner: 'Legal',      grounding: { copilot: false, sales: false, voice: false } }
  };

  const SRC = {
    confluence: { label: 'Confluence', health: 'ok', note: 'Synced 14 minutes ago', cadence: 'Every 15 minutes',
                  docs: 1204, crawled: true, indexed: true,
                  history: [[0, 'ok', '14 objects checked, 2 updated'], [1, 'ok', '14 objects checked, none changed'], [2, 'ok', '13 objects checked, 1 added']] },
    zendesk:    { label: 'Zendesk', health: 'failed', note: 'OAuth token rejected since 26 Jul', cadence: 'Every hour',
                  code: 'AUTH_401_TOKEN_EXPIRED', docs: 118, crawled: false, indexed: false, lastGood: '26 Jul',
                  history: [[0, 'failed', 'OAuth token rejected'], [2, 'failed', 'OAuth token rejected'], [4, 'ok', '9 objects checked, 3 updated']] },
    hubspot:    { label: 'HubSpot', health: 'warn', note: '3 records skipped, missing owner', cadence: 'Every 6 hours',
                  docs: 340, crawled: true, indexed: 'running',
                  history: [[0, 'warn', '12 checked, 3 skipped, no owner'], [1, 'warn', '12 checked, 3 skipped, no owner'], [3, 'ok', '11 checked, 1 added']] },
    web:        { label: 'Website crawl', health: 'failed', note: 'Crawler blocked by robots.txt since 11 Jul', cadence: 'Weekly',
                  code: 'CRAWL_403_ROBOTS', docs: 42, crawled: false, indexed: false, lastGood: '11 Jul',
                  history: [[0, 'failed', 'Blocked by robots.txt'], [7, 'failed', 'Blocked by robots.txt'], [19, 'ok', '5 pages crawled, 2 changed']] },
    upload:     { label: 'Manual upload', health: 'ok', note: 'No schedule, uploaded by hand', cadence: 'On demand',
                  docs: 6, crawled: true, indexed: true,
                  history: [[1, 'ok', '1 document uploaded by N. Wael'], [5, 'ok', '1 document uploaded by N. Wael']] }
  };

  /* Which collections a source feeds. Grounding is a property of a collection,
     so a source row can only say who answers from it by walking through them. */
  const COL_OF_SRC = { confluence: ['policies'], zendesk: ['support'], hubspot: ['sales', 'marketing'], web: ['marketing'], upload: ['policies'] };

  /* ═══ FIXTURES THIS REPO DOES NOT HAVE ═══
     Instructions and roles return zero hits across the corpus. Everything below
     is invented for this surface and should be read as design intent, not as
     wired behaviour. The page says so on the modules themselves rather than
     letting someone find out by clicking. */
  const RULES = [
    { id: 'r1', scope: 'org',    scopeName: 'FlairsTech', text: 'Keep a professional, neutral tone. Avoid emojis and jargon unless the reader asks for something more creative.',
      by: 'Ahmed Samy', when: '12 Aug', v: 3, reach: 26, state: 'beaten' },
    { id: 'r2', scope: 'client', scopeName: 'CXS', text: 'Refer to the traveller in the second person. Never quote a fare without a booking reference.',
      by: 'Mohamed Ramy', when: '3 Sep', v: 1, reach: 2, state: 'active' },
    { id: 'r3', scope: 'agent',  scopeName: 'Copilot', text: 'Warm, conversational tone. Emojis are permitted in chat surfaces.',
      by: 'Nour Wael', when: '2h ago', v: 2, reach: 1, state: 'active' },
    { id: 'r4', scope: 'org',    scopeName: 'FlairsTech', text: 'Keep a professional, neutral tone.',
      by: 'Ahmed Samy', when: '12 Aug', v: 1, reach: 0, state: 'unreachable' }
  ];

  const PEOPLE = [
    { id: 'p1', name: 'Alex Smith', mail: 'alex.smith@flairstech.com', initials: 'AS', status: 'active',
      grants: [{ role: 'Super Admin', scopeT: 'Org', scopeV: 'FlairsTech', from: 'Direct', by: 'Nour Wael, 3 Sep' },
               { role: 'QA Manager', scopeT: 'Group', scopeV: 'QA Reviewers', from: 'Inherited from Org', by: '' }] },
    { id: 'p2', name: 'Saly Tarek', mail: 'saly.tarek@flairstech.com', initials: 'ST', status: 'pending', grants: [] }
  ];

  /* ═══ MODULES ═══
     Nine rows. Three are built. The other six carry their entitlement state and
     nothing else, because a plan column that only lists what you already own is
     not a plan column. Figures are placeholders pending commercial input. */

  /* ══ SKILLS ════════════════════════════════════════════════════════════
     A skill is a named, reusable PROCEDURE an agent can apply: what to do, in
     what order, what to refuse, and which sources it may stand on. It is not
     a second instructions system — it rides the same precedence chain and the
     same targeting tree as AI instructions, pointed at a different unit. A
     rule says how to behave; a skill says how to do a specific job.

     `trigger` is the field that decides whether the agent chooses the skill or
     the person does. An automatic skill is matched on its DESCRIPTION, which
     is why a vague description costs accuracy rather than tidiness.

     `origin` records where a skill came from. A starter you have adapted still
     says so, because an update to the original should be a decision and not a
     surprise.

     Invented for this surface, like RULES and PEOPLE above it. */
  const SKILLS = [
    { id: 'refund-response', name: 'Draft a refund response',
      desc: 'Turn a refund question into a reply that cites the policy and flags the contested clause.',
      trigger: 'auto', on: true, origin: 'Yours', by: 'Nour Wael', when: '2h ago', v: 4,
      sources: ['policies', 'support'],
      targets: ['interfax', 'kapost', 'copilot'],
      body: 'Answer from the EU refund article first, and name it. If the Returns FAQ disagrees '
          + 'about what happens after activation, say the clause is contested rather than picking '
          + 'a side \u2014 nobody has ruled on it. Never quote a figure that is not in a cited source.' },

    { id: 'stale-sweep', name: 'Weekly staleness sweep',
      desc: 'List documents behind their source, grouped by connector, with the owner for each.',
      trigger: 'manual', on: true, origin: 'Yours', by: 'Nour Wael', when: '3 Sep', v: 2,
      sources: ['policies', 'support', 'marketing'],
      targets: ['copilot'],
      body: 'Group by connector, not by collection \u2014 a stale document is almost always a symptom '
          + 'of the sync that fed it. Name the owner for each. Stop at ten and say how many were '
          + 'left out.' },

    { id: 'ticket-triage', name: 'Triage an inbound ticket',
      desc: 'Classify a support ticket, cite the article that settles it, and say when it does not.',
      trigger: 'auto', on: false, origin: 'From the library', by: 'A. Mahfouz', when: '11 Aug', v: 1,
      sources: ['support'],
      targets: [],
      body: 'Classify first, answer second. If no article settles the ticket, say so plainly and '
          + 'route it \u2014 a confident answer from adjacent material is the failure this skill exists '
          + 'to prevent.' }
  ];
  /* Per skill, so editing one skill's reach cannot move another's. The
     instructions tree keeps a single module-level Set because there is one
     rule being edited at a time; here the list is on screen beside the
     detail. */
  const SKILL_SEL = {};
  SKILLS.forEach((k) => { SKILL_SEL[k.id] = new Set(k.targets); });
  const SKILL_OPEN = new Set(['upland', 'aimy']);
  const TRIGGER_LABEL = { auto: ['is-info', 'Automatic'], manual: ['is-mute', 'On demand'] };

  const MODULES = [
    { id: 'sources', name: 'Knowledge sources', sub: '5 connected, 2 failing', scopeT: 'Org', scopeV: 'FlairsTech',
      audience: 'Internal', plan: 'included', need: { kind: 'err', text: '2 failing' }, who: 'N. Wael', when: '20m ago', built: true },
    { id: 'instructions', name: 'AI instructions', sub: '4 rules, 1 unreachable', scopeT: 'Org', scopeV: 'FlairsTech',
      audience: 'Internal', plan: 'included', need: { kind: 'warn', text: '1 conflict' }, who: 'Nour Wael', when: '2h ago', built: true },
    { id: 'access', name: 'Access and roles', sub: '2 people, 3 grants', scopeT: 'Org', scopeV: 'FlairsTech',
      audience: 'Internal', plan: 'included', need: { kind: 'warn', text: '1 invite pending' }, who: 'Nour Wael', when: '3 Sep', built: true },
    { id: 'skills', name: 'Skills', sub: '3 defined, 1 off', scopeT: 'Org', scopeV: 'FlairsTech',
      audience: 'Internal', plan: 'included', need: { kind: 'info', text: '1 untargeted' },
      who: 'Nour Wael', when: '2h ago', built: true },
    { id: 'retention', name: 'Retention and archiving', sub: 'Per collection auto-archive', scopeT: 'Org', scopeV: 'FlairsTech',
      audience: 'Internal', plan: 'included', need: null, who: 'N. Wael', when: '11 Aug', built: false, where: 'It lives on the corpus today, at ?settings=data' },
    { id: 'mapping', name: 'CRM field mapping', sub: 'Pulls CRM fields into agent context', scopeT: 'Product', scopeV: 'Copilot',
      audience: 'Client visible', plan: 'addon', offer: '40 per client, monthly. Needs Sync and retention.', need: null, built: false },
    { id: 'sync', name: 'Sync and retention', sub: 'Scheduled pulls, and deletion older than a threshold', scopeT: 'Product', scopeV: 'Copilot',
      audience: 'Internal', plan: 'addon', offer: '40 per client, monthly.', need: null, built: false },
    { id: 'webhooks', name: 'Enablement webhooks', sub: 'Called when enrichment is triggered from your side', scopeT: 'Org', scopeV: 'FlairsTech',
      audience: 'Client visible', plan: 'trial', offer: 'Trial ends in 9 days. Then 25 per org, monthly.', need: null, built: false },
    { id: 'notify', name: 'Notifications', sub: 'Alerts when a sync or a rule fails', scopeT: 'Org', scopeV: 'FlairsTech',
      audience: 'Internal', plan: 'none', offer: 'Enterprise plan only.', need: null, built: false },
    { id: 'audit', name: 'Audit trail', sub: 'Who changed what, and when', scopeT: 'Org', scopeV: 'FlairsTech',
      audience: 'Internal', plan: 'none', offer: 'Enterprise plan only.', need: null, built: false }
  ];

  const PLAN_LABEL = { included: ['is-ok', 'Included'], addon: ['is-mute', 'Add-on'], trial: ['is-warn', 'Trial, 9 days'], none: ['is-mute', 'Not entitled'] };

  /* ═══ STATE ═══
     Read fresh on every render, never mirrored in a variable that can disagree
     with the address bar. */
  function readURL() {
    const p = new URLSearchParams(location.search);
    const m = p.get('module') || '';
    /* A third key, and NOT `src` reused. The URL is this product's state model;
     two meanings on one key is how it stops being one. */
  return { module: MODULES.some((x) => x.id === m && x.built) ? m : '',
           src: p.get('src') || '', skill: p.get('skill') || '' };
  }

  function patch(changes) {
    const st = readURL();
    Object.keys(changes).forEach((k) => { st[k] = changes[k]; });
    const p = new URLSearchParams();
    if (st.module) p.set('module', st.module);
    if (st.src) p.set('src', st.src);
    /* Rebuilt from scratch every time, so a key this function does not know
       about is a key that silently disappears on the next navigation. */
    if (st.skill) p.set('skill', st.skill);
    const qs = p.toString();
    history.pushState(null, '', location.pathname + (qs ? '?' + qs : ''));
    render();
  }

  /* ═══ PIECES ═══ */
  const CHECK = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6.2 4.6 8.8 10 3.4"/></svg>';

  const pill = (kind, text) => `<span class="set2-pill ${esc(kind)}"><i class="set2-pill-dot"></i>${esc(text)}</span>`;
  const tok = (t, v) => `<span class="set2-tok"><span class="set2-tok-t">${esc(t)}</span><span class="set2-tok-v">${esc(v)}</span></span>`;
  const ck = (state, label) =>
    `<button class="set2-ck" role="checkbox" aria-checked="${esc(state)}" aria-label="${esc(label)}" type="button"><span class="set2-ck-box">${CHECK}</span></button>`;

  /* The bar reads and never writes. A single editable control in the chrome
     that re-scopes the page under it is the shape behind every wrong-context
     incident worth reading about, and the remedy in each of those write-ups was
     visibility of the active context rather than one more gate. */
  function scopeBar(st) {
    const url = '?' + (st.module ? 'module=' + st.module : '') + (st.src ? '&src=' + st.src : '');
    return `
      <div class="set2-scope">
        ${tok('Org', 'FlairsTech')}
        <span class="set2-scope-sep">&rsaquo;</span>
        ${tok('Signed in as', USER.name)}
        <span class="set2-scope-end">
          ${pill('is-ok', 'You can write here')}
        </span>
      </div>
      <code class="set2-url">settings.html<b>${esc(url === '?' ? '' : url)}</b></code>`;
  }

  /* ═══ THE LEDGER ═══ */
  function ledger() {
    return `
      <div class="set2-head">
        <h1 class="set2-title">Settings</h1>
        <p class="set2-lede">Every capability in this workspace, what it acts on, who can see it, and whether it is on your plan.</p>
      </div>
      <div class="set2-ledger-wrap">
        <table class="set2-ledger">
          <thead><tr>
            <th>Module</th><th>Scope</th><th>Audience</th><th>Plan</th><th>Needs you</th><th>Changed</th><th></th>
          </tr></thead>
          <tbody>
            ${MODULES.map((m) => {
              const [cls, label] = PLAN_LABEL[m.plan];
              const off = m.plan === 'addon' || m.plan === 'none';
              return `<tr${off ? ' class="set2-row-off"' : ''}>
                <td>
                  <div class="set2-ledger-name">${esc(m.name)}</div>
                  <div class="set2-ledger-sub">${esc(m.sub)}</div>
                </td>
                <td>${tok(m.scopeT, m.scopeV)}</td>
                <td>${esc(m.audience)}</td>
                <td>
                  ${pill(cls, label)}
                  ${m.offer ? `<div class="set2-offer">${esc(m.offer)}</div>` : ''}
                </td>
                <td>${m.need ? pill('is-' + m.need.kind, m.need.text) : '<span class="set2-ledger-sub">Nothing</span>'}</td>
                <td><span class="set2-ledger-sub">${m.who ? esc(m.who) + '<br>' + esc(m.when) : 'Never'}</span></td>
                <td class="set2-ledger-end">${
                  m.built ? `<button class="btn btn-ghost btn-sm" type="button" data-go="${esc(m.id)}">Open</button>`
                  : m.plan === 'addon' ? '<button class="btn btn-ghost btn-sm" type="button" disabled>Add</button>'
                  : m.plan === 'trial' ? '<button class="btn btn-ghost btn-sm" type="button" disabled>Keep</button>'
                  : m.where ? `<span class="set2-ledger-sub">${esc(m.where)}</span>`
                  : '<button class="btn btn-ghost btn-sm" type="button" disabled>Talk to us</button>'
                }</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
      <p class="set2-offer" style="margin-top:0.75rem">Prices are placeholders pending commercial input. Four modules are built; the rest carry their state only.</p>`;
  }

  const backLink = '<button class="set2-back" type="button" data-back>&larr; All settings</button>';

  /* ═══ MODULE: KNOWLEDGE SOURCES ═══
     The only module on this page running on the corpus's own data. */
  function sourcesModule(st) {
    const keys = Object.keys(SRC);
    const bad = keys.filter((k) => SRC[k].health === 'failed');
    const rest = keys.filter((k) => SRC[k].health !== 'failed');

    if (st.src && SRC[st.src]) return sourceDetail(st.src);

    return `
      <div class="set2-head">
        ${backLink}
        <h1 class="set2-title">Knowledge sources</h1>
        <p class="set2-lede">Where AiMY reads from. A source that cannot connect keeps answering from whatever it last pulled, so a failure here is quieter than it looks.</p>
      </div>
      <div class="set2-module">
        ${bad.length ? `<div class="set2-note is-err"><span><b>${bad.length} source${bad.length > 1 ? 's need' : ' needs'} attention.</b> Answers still cite them, from the last good pull.</span></div>` : ''}
        <div class="set2-card">
          ${bad.concat(rest).map((k) => srcRow(k)).join('')}
        </div>
      </div>`;
  }

  function srcRow(k) {
    const s = SRC[k];
    const cls = s.health === 'ok' ? 'is-ok' : s.health === 'warn' ? 'is-warn' : 'is-err';
    const word = s.health === 'ok' ? 'Live' : s.health === 'warn' ? 'Partial' : 'Failed';
    /* Two phases, because one opaque "Processing" says a thing is happening and
       nothing about which half of it. */
    const p1 = s.crawled ? 'is-done' : 'is-fail';
    const p2 = s.indexed === 'running' ? 'is-live' : s.indexed ? 'is-done' : '';
    const answers = (COL_OF_SRC[k] || []).reduce((acc, col) => {
      AGENTS.forEach((a) => { if (COLLECTION_META[col] && COLLECTION_META[col].grounding[a.id] && acc.indexOf(a.name) === -1) acc.push(a.name); });
      return acc;
    }, []);
    return `
      <div class="set2-card-row">
        <div class="set2-grow">
          <div class="set2-name">${esc(s.label)} ${pill(cls, word)}</div>
          <div class="set2-phase"><i class="${p1}"></i><i class="${p2}"></i></div>
          <div class="set2-phase-lbl">
            <span>${s.health === 'failed' ? esc(s.note) : 'Crawled ' + s.docs + ' objects'}</span>
            <span>${s.code ? '<span class="set2-code">' + esc(s.code) + '</span>' : s.indexed === 'running' ? 'Indexing now' : 'Indexed, ' + esc(s.cadence.toLowerCase())}</span>
          </div>
          <div class="set2-phase-lbl">
            <span>${s.lastGood ? 'Last good sync ' + esc(s.lastGood) + ', ' + s.docs + ' documents still answering' : s.docs + ' documents'}</span>
            <span>${answers.length ? 'Answers: ' + esc(answers.join(', ')) : 'No agent answers from this'}</span>
          </div>
        </div>
        <div class="set2-actions">
          <button class="btn btn-ghost btn-sm" type="button" data-src="${esc(k)}">Open</button>
          ${s.health === 'failed'
            ? '<button class="btn btn-brand btn-sm" type="button" disabled>Reconnect</button>'
            : '<button class="btn btn-ghost btn-sm" type="button" disabled>Sync now</button>'}
        </div>
      </div>`;
  }

  /* Governance sits with the thing it governs. Schedule, grounding and history
     are all questions about this source and none of them is a question about a
     document, which is why they are here and not on the corpus. */
  function sourceDetail(k) {
    const s = SRC[k];
    const cols = COL_OF_SRC[k] || [];
    const col = cols[0];
    const meta = col ? COLLECTION_META[col] : null;
    return `
      <div class="set2-head">
        <button class="set2-back" type="button" data-back-src>&larr; Knowledge sources</button>
        <h1 class="set2-title">${esc(s.label)}</h1>
        <p class="set2-lede">${esc(s.docs)} documents${col ? ', filed under ' + esc(COLLECTIONS[col]) : ''}. ${esc(s.note)}</p>
      </div>
      <div class="set2-module">
        ${s.health === 'failed' ? `<div class="set2-note is-err"><span><b>You cannot pull from a source that is not connected.</b> The remedy is the connection, so this offers Reconnect rather than a retry that would queue and fail the same way. Error code <span class="set2-code">${esc(s.code)}</span>.</span></div>` : ''}

        <div class="set2-card">
          <div class="set2-card-row">
            <div class="set2-grow"><div class="set2-name">Sync every</div>
              <div class="set2-sub">Writes on change. The run log gains a row and the toast carries an undo.</div></div>
            <span class="set2-pill is-mute">${esc(s.cadence)}</span>
          </div>
          ${meta ? `
          <div class="set2-card-row">
            <div class="set2-grow"><div class="set2-name">Which agents may answer from this</div>
              <div class="set2-sub">Internal agents apply on the tick. A customer facing agent puts this content in front of customers, so it reverts until you type the collection name.</div>
              <div class="set2-agents" style="margin-top:0.5rem">
                ${AGENTS.map((a) => `<button class="set2-agent${a.external ? ' is-ext' : ''}" type="button"
                    aria-pressed="${meta.grounding[a.id] ? 'true' : 'false'}"
                    data-ground="${esc(a.id)}" data-col="${esc(col)}">${esc(a.name)}${a.external ? ', customer facing' : ''}</button>`).join('')}
              </div>
            </div>
          </div>` : ''}
          <div class="set2-card-pad">
            <div class="set2-label" style="margin-bottom:0.5rem">Recent runs</div>
            ${s.history.map(([d, st2, note]) => `
              <div class="set2-run">
                <span class="set2-run-when">${d === 0 ? 'Today' : d + 'd ago'}</span>
                <span>${esc(note)}</span>
                ${pill(st2 === 'ok' ? 'is-ok' : st2 === 'warn' ? 'is-warn' : 'is-err', st2 === 'ok' ? 'Success' : st2 === 'warn' ? 'Partial' : 'Failed')}
              </div>`).join('')}
          </div>
        </div>
        <div id="groundConfirm"></div>
      </div>`;
  }

  /* ═══ MODULE: AI INSTRUCTIONS ═══ */
  function instructionsModule() {
    const beaten = RULES.filter((r) => r.state === 'beaten').length;
    return `
      <div class="set2-head">
        ${backLink}
        <h1 class="set2-title">AI instructions <span class="set2-fixture">Fixture data</span></h1>
        <p class="set2-lede">Nobody orders these by hand. The narrower scope wins, ties break on recency, and the panel at the bottom shows what an agent actually receives.</p>
      </div>
      <div class="set2-module">
        <div class="set2-scope" style="border:0;padding:0">
          <span class="set2-label">Precedence</span>
          ${tok('1', 'Org')}<span class="set2-scope-sep">&rsaquo;</span>
          ${tok('2', 'Client')}<span class="set2-scope-sep">&rsaquo;</span>
          ${tok('3', 'Product')}<span class="set2-scope-sep">&rsaquo;</span>
          ${tok('4', 'Agent')}
        </div>

        <div class="set2-card">
          ${RULES.map((r) => `
            <div class="set2-rule${r.state === 'active' ? '' : ' is-beaten'}">
              <div class="set2-rule-txt">${esc(r.text)}</div>
              <div class="set2-rule-meta">
                ${r.state === 'unreachable' ? pill('is-err', 'Unreachable')
                  : r.state === 'beaten' ? pill('is-mute', 'Overridden below') : pill('is-ok', 'Applies')}
                ${tok(r.scope, r.scopeName)}
                <span class="set2-reach${r.reach === 0 ? ' is-zero' : ''}"><b>${r.reach}</b> of ${TARGET_TOTAL} products</span>
                <span>${esc(r.by)}, ${esc(r.when)}, v${r.v}</span>
                ${r.state === 'beaten' ? '<button class="btn btn-ghost btn-sm" type="button" disabled>Restore inherited</button>' : ''}
              </div>
            </div>`).join('')}
        </div>

        <div class="set2-note is-warn"><span><b>Two rules set tone at Org scope with identical text</b>, so the second can never fire. A rule reaching 0 agents is always a defect, which is why reach sits on every card rather than in a report.</span></div>

        <div class="set2-effective">
          <div class="set2-label" style="color:var(--ink-ok)">What Copilot receives</div>
          <p style="margin-top:0.5rem;font-size:var(--ty-meta);color:var(--ink-secondary);line-height:1.6">Warm, conversational tone. Emojis are permitted in chat surfaces. Refer to the traveller in the second person. Never quote a fare without a booking reference.</p>
        </div>

        <div class="set2-card set2-card-pad">
          <div class="set2-label" style="margin-bottom:0.5rem">Which agents this rule targets</div>
          ${tree()}
        </div>
      </div>`;
  }

  /* The tri-state cascade is a library convention, not an ARIA rule: the spec
     defines `mixed` and says nothing about parent to child propagation, so the
     semantics are ours to define and ours to document. The keyboard map is the
     spec's though, and it is shown rather than hidden because a picker whose
     only affordance is the mouse is a picker half the team cannot use. */
  /* Selection is a Set of product ids and every checkbox state is DERIVED from
     it. A parent is checked when all its children are, mixed when some are, and
     that cascade is ours to define: the ARIA treeview pattern specifies the
     `mixed` value but says nothing about parent to child propagation, so the
     semantics come from us and have to be written down somewhere. Here. */
  const targetSel = new Set(['interfax', 'kapost', 'psa', 'filebound', 'copilot']);
  const treeOpen = new Set(['upland', 'aimy']);

  function targetGroups() {
    const g = Object.keys(CLIENT_PRODUCTS).map((c) => ({
      id: c, name: CLIENTS[c], note: 'Client',
      kids: Object.keys(CLIENT_PRODUCTS[c]).map((k) => ({ id: k, name: CLIENT_PRODUCTS[c][k] }))
    }));
    /* AiMY's own agents sit last and are never scoped away, because a rule that
       silently stopped reaching them would look like it had reached everything. */
    g.push({ id: 'aimy', name: 'AiMY agents', note: 'Ours',
             kids: Object.keys(AIMY_PRODUCTS).map((k) => ({ id: k, name: AIMY_PRODUCTS[k] })) });
    return g;
  }

  const groupState = (g) => {
    const on = g.kids.filter((k) => targetSel.has(k.id)).length;
    return on === 0 ? 'false' : on === g.kids.length ? 'true' : 'mixed';
  };

  function tree() {
    const groups = targetGroups();
    return `
      <div class="set2-tree" role="tree" aria-multiselectable="true" aria-label="What this rule targets">
        <div class="set2-tree-body">
          ${groups.map((g) => {
            const st = groupState(g);
            const on = g.kids.filter((k) => targetSel.has(k.id)).length;
            const open = treeOpen.has(g.id);
            return `
              <div class="set2-node" role="treeitem" aria-expanded="${open}" data-tnode="${esc(g.id)}">
                ${ck(st, g.name)}<span data-texp="${esc(g.id)}">${esc(g.name)}</span>
                <span class="set2-node-ct">${on} of ${g.kids.length}</span>
              </div>
              ${open ? g.kids.map((k) => `
                <div class="set2-node is-child" role="treeitem">
                  ${ck(targetSel.has(k.id) ? 'true' : 'false', k.name)}${esc(k.name)}
                </div>`).join('') : ''}`;
          }).join('')}
        </div>
        <div class="set2-tree-foot">
          <span>${targetSel.size} of ${TARGET_TOTAL} selected</span>
          <span>Across ${groups.filter((g) => g.kids.some((k) => targetSel.has(k.id))).length} of ${groups.length} groups</span>
        </div>
      </div>
      <div class="set2-keys" style="margin-top:0.75rem">
        <span class="set2-kbd">Space</span> toggle
        <span class="set2-kbd">&rarr;</span> open
        <span class="set2-kbd">&larr;</span> close or parent
        <span class="set2-kbd">&uarr;&darr;</span> move
        <span class="set2-kbd">Home</span><span class="set2-kbd">End</span> ends
      </div>`;
  }

  /* ═══ MODULE: ACCESS ═══ */
  function accessModule() {
    return `
      <div class="set2-head">
        ${backLink}
        <h1 class="set2-title">Access and roles <span class="set2-fixture">Fixture data</span></h1>
        <p class="set2-lede">Every grant reads as one sentence: this role, on this scope. Grants add up, and a narrower one never removes a wider one.</p>
      </div>
      <div class="set2-module">
        ${PEOPLE.map((p) => `
          <div class="set2-card">
            <div class="set2-card-row">
              <span class="set2-av">${esc(p.initials)}</span>
              <div class="set2-grow">
                <div class="set2-name">${esc(p.name)}</div>
                <div class="set2-sub">${esc(p.mail)}</div>
              </div>
              ${p.status === 'active' ? pill('is-ok', 'Active') : pill('is-warn', 'Invite pending')}
            </div>
            ${p.grants.length ? p.grants.map((g) => `
              <div class="set2-tuple">
                ${tok('Role', g.role)}<span class="set2-tuple-on">on</span>${tok(g.scopeT, g.scopeV)}
                <span class="set2-tuple-end">${g.from === 'Direct' ? 'Granted by ' + esc(g.by) : esc(g.from) + ', not editable here'}</span>
              </div>`).join('')
              : '<div class="set2-tuple"><span class="set2-tuple-on">No grants yet. The invite carries no access until it is accepted.</span></div>'}
          </div>`).join('')}

        <div class="set2-card set2-card-pad">
          <div class="set2-label">What Alex Smith can actually do, on FlairsTech</div>
          <div class="set2-can" style="margin-top:0.5rem">${pill('is-ok', 'Can')}<span>Read and write instructions, manage knowledge sources, invite people</span></div>
          <div class="set2-can">${pill('is-err', 'Cannot')}<span>Delete synced records, change billing, edit Organisation rules</span></div>
          <p class="set2-because">Because <b>Super Admin on Org FlairsTech</b> grants the first set. Nothing above this scope exists, so the second set is reserved rather than inherited.</p>
        </div>

        <div class="set2-note is-info"><span>Every other variant shows grants. This one shows consequences, which is the only form an admin can check against what they meant.</span></div>
      </div>`;
  }

  /* ═══ THE LADDER ═══
     Grounding is the one control here whose rung depends on which way it moves.
     An internal agent is reversible and nobody outside sees it, so it applies on
     the tick. A customer facing one puts the content in front of customers, so
     the control reverts and stays reverted until the name is typed. */
  function groundConfirm(agent, col) {
    const host = $('#groundConfirm');
    if (!host) return;
    host.innerHTML = `
      <div class="set2-confirm">
        <div class="set2-confirm-hd">${esc(agent.name)} is customer facing</div>
        <div class="set2-confirm-bd">
          <p style="font-size:var(--ty-meta);color:var(--ink-secondary);line-height:1.6">This puts every document in <b>${esc(COLLECTIONS[col])}</b> in front of customers. It is reversible, but anything quoted in the meantime has already been said.</p>
          <div>
            <label class="set2-label" for="groundType">Type <b>${esc(COLLECTIONS[col])}</b> to confirm</label>
            <input class="set2-field" id="groundType" type="text" autocomplete="off" placeholder="Collection name" style="margin-top:0.375rem">
          </div>
          <div class="set2-actions">
            <button class="btn btn-ghost btn-sm" type="button" data-ground-cancel>Cancel, leave it off</button>
            <button class="btn btn-brand btn-sm" type="button" data-ground-ok data-col="${esc(col)}" data-agent="${esc(agent.id)}" disabled>Yes, let ${esc(agent.name)} answer</button>
          </div>
        </div>
      </div>`;
    const field = $('#groundType', host);
    const ok = $('[data-ground-ok]', host);
    field.addEventListener('input', () => { ok.disabled = field.value.trim().toLowerCase() !== COLLECTIONS[col].toLowerCase(); });
    field.focus();
  }

  /* ═══ RENDER ═══ */
  /* ═══════════════════════════════════════════════
     MODULE: SKILLS

     Mirrors AI instructions deliberately. A skill and a rule are the same kind
     of object with a different job — both are written text, both are scoped by
     the same Org > Client > Product > Agent chain, both have a reach, and both
     have to be confirmed before they can shape what a customer-facing agent
     says. Building a second vocabulary for that would have been the mistake.

     What a skill has that a rule does not: a TRIGGER, a set of sources it is
     permitted to stand on, and an on/off state that is not the same thing as
     deleting it.
  ═══════════════════════════════════════════════ */
  const skillReach = (k) => SKILL_SEL[k.id].size;

  function skillRow(k) {
    const [tCls, tLabel] = TRIGGER_LABEL[k.trigger];
    const reach = skillReach(k);
    return `<div class="set2-rule${k.on ? '' : ' is-beaten'}">
      <div class="set2-card-row">
        <div class="set2-grow">
          <div class="set2-name">${esc(k.name)}</div>
          <div class="set2-sub">${esc(k.desc)}</div>
        </div>
        <button class="set2-agent" type="button" data-skill-on="${esc(k.id)}"
                aria-pressed="${k.on ? 'true' : 'false'}">${k.on ? 'On' : 'Off'}</button>
        <button class="btn btn-ghost btn-sm" type="button" data-skill="${esc(k.id)}">Open</button>
      </div>
      <div class="set2-rule-meta">
        ${pill(tCls, tLabel)}
        ${tok('origin', k.origin)}
        <span class="set2-reach${reach === 0 ? ' is-zero' : ''}"><b>${reach}</b> of ${TARGET_TOTAL} products</span>
        <span>${esc(k.by)}, ${esc(k.when)}, v${k.v}</span>
      </div>
    </div>`;
  }

  function skillsModule(st) {
    if (st.skill && SKILLS.some((k) => k.id === st.skill)) return skillDetail(st.skill);
    const off = SKILLS.filter((k) => !k.on).length;
    const untargeted = SKILLS.filter((k) => skillReach(k) === 0).length;
    return `<div class="set2-module">
      <div class="set2-head">
        ${backLink}
        <h1 class="set2-title">Skills <span class="set2-fixture">Fixture data</span></h1>
        <p class="set2-lede">A skill is a written procedure an agent can apply \u2014 what to do, in what
          order, what to refuse, and which sources it may stand on. Scoped by the same chain as AI
          instructions, because a skill that reaches further than the rule governing it is a skill
          nobody is governing.</p>
      </div>

      <div class="set2-scope" style="border:0;padding:0">
        <span class="set2-label">Precedence</span>
        ${tok('1', 'Org')}<span class="set2-scope-sep">\u203a</span>
        ${tok('2', 'Client')}<span class="set2-scope-sep">\u203a</span>
        ${tok('3', 'Product')}<span class="set2-scope-sep">\u203a</span>
        ${tok('4', 'Agent')}
      </div>

      ${untargeted ? `<div class="set2-note is-info"><b>${untargeted} skill targets nothing.</b>
        It is defined and switched on, and it will never run \u2014 reach is what decides that, not
        the toggle.</div>` : ''}

      <div class="set2-card">${SKILLS.map(skillRow).join('')}</div>

      <div class="set2-note is-warn"><b>${off} of ${SKILLS.length} are off.</b> Off is not deleted:
        a skill keeps its targeting and its text so it can be switched back on without being
        rebuilt, which is the whole reason this is a toggle rather than a bin.</div>

      <div class="set2-actions">
        <button class="btn btn-brand btn-sm" type="button" disabled>New skill</button>
        <button class="btn btn-ghost btn-sm" type="button" disabled>Browse the library</button>
      </div>
    </div>`;
  }

  /* The tree, per skill. `targetGroups()` is reused unchanged; what differs is
     which Set it is read against, and that the nodes carry data- IDS rather
     than being matched on their display name. The instructions tree resolves
     identity by comparing `aria-label` to a group's name, which works only for
     as long as no two things are called the same thing. */
  function skillTree(id) {
    const sel = SKILL_SEL[id];
    const groups = targetGroups();
    const state = (g) => {
      const on = g.kids.filter((k) => sel.has(k.id)).length;
      return on === 0 ? 'false' : on === g.kids.length ? 'true' : 'mixed';
    };
    return `<div class="set2-tree" role="tree" aria-multiselectable="true" aria-label="What this skill targets">
      <div class="set2-tree-body">
        ${groups.map((g) => {
          const open = SKILL_OPEN.has(g.id);
          const on = g.kids.filter((k) => sel.has(k.id)).length;
          return `<div class="set2-node" role="treeitem" aria-expanded="${open}">
              ${ck(state(g), g.name).replace('<button class="set2-ck"', `<button class="set2-ck" data-sk-group="${esc(g.id)}"`)}
              <span data-sk-exp="${esc(g.id)}">${esc(g.name)}</span>
              <span class="set2-node-ct">${on} of ${g.kids.length}</span>
            </div>` + (open ? g.kids.map((k) =>
              `<div class="set2-node is-child" role="treeitem">
                ${ck(sel.has(k.id) ? 'true' : 'false', k.name).replace('<button class="set2-ck"', `<button class="set2-ck" data-sk-kid="${esc(k.id)}"`)}${esc(k.name)}
              </div>`).join('') : '');
        }).join('')}
      </div>
      <div class="set2-tree-foot">
        <span>${sel.size} of ${TARGET_TOTAL} selected</span>
        <span>Across ${groups.filter((g) => g.kids.some((k) => sel.has(k.id))).length} of ${groups.length} groups</span>
      </div>
    </div>`;
  }

  function skillDetail(id) {
    const k = SKILLS.find((x) => x.id === id);
    const [tCls, tLabel] = TRIGGER_LABEL[k.trigger];
    return `<div class="set2-module">
      <div class="set2-head">
        <button class="set2-back" type="button" data-back-skill>&larr; Skills</button>
        <h1 class="set2-title">${esc(k.name)} <span class="set2-fixture">Fixture data</span></h1>
        <p class="set2-lede">${esc(k.desc)}</p>
      </div>

      <div class="set2-card set2-card-pad">
        <div class="set2-card-row">
          <div class="set2-grow">
            <div class="set2-label">Trigger</div>
            <div class="set2-sub">${k.trigger === 'auto'
              ? 'Chosen by the agent when the description matches what was asked. The description is the match, so vagueness there costs accuracy.'
              : 'Only when somebody asks for it by name, with a slash in the composer.'}</div>
          </div>
          ${pill(tCls, tLabel)}
          <button class="set2-agent" type="button" data-skill-on="${esc(k.id)}"
                  aria-pressed="${k.on ? 'true' : 'false'}">${k.on ? 'On' : 'Off'}</button>
        </div>
      </div>

      <div class="set2-card set2-card-pad">
        <div class="set2-label">The procedure</div>
        <div class="set2-code">${esc(k.body)}</div>
        <div class="set2-actions">
          <button class="btn btn-ghost btn-sm" type="button" disabled>Edit</button>
          <button class="btn btn-ghost btn-sm" type="button" disabled>History, v${k.v}</button>
        </div>
      </div>

      <div class="set2-card set2-card-pad">
        <div class="set2-label">Sources it may stand on</div>
        <div class="set2-sub">An answer this skill shapes can cite these and nothing else. A source
          that is failing is still listed \u2014 what it does to the answer is disclosed at the citation,
          not hidden by removing it here.</div>
        <div class="set2-agents">
          ${Object.keys(COLLECTIONS).map((c) => `<button class="set2-agent" type="button"
            data-skill-src="${esc(k.id)}:${esc(c)}"
            aria-pressed="${k.sources.indexOf(c) > -1 ? 'true' : 'false'}">${esc(COLLECTIONS[c])}</button>`).join('')}
        </div>
      </div>

      <div class="set2-card set2-card-pad">
        <div class="set2-label">What this skill targets</div>
        ${skillTree(k.id)}
      </div>
    </div>`;
  }

  function render() {
    const st = readURL();
    const host = $('#setPage');
    if (!host) return;
    const body = st.module === 'sources' ? sourcesModule(st)
      : st.module === 'instructions' ? instructionsModule()
      : st.module === 'skills' ? skillsModule(st)
      : st.module === 'access' ? accessModule()
      : ledger();
    host.innerHTML = scopeBar(st) + body;
    document.title = st.module ? 'AiMY Settings, ' + (MODULES.find((m) => m.id === st.module) || {}).name : 'AiMY Settings';
  }

  /* ═══ WIRING ═══
     One delegated listener on the document, dispatching on data-*, which is the
     house rule and the reason nesting resolves without stopPropagation. */
  function wire() {
    document.addEventListener('click', (e) => {
      const t = e.target;
      let el;

      if ((el = t.closest('[data-go]'))) { patch({ module: el.getAttribute('data-go'), src: '' }); return; }
      if (t.closest('[data-back]')) { patch({ module: '', src: '', skill: '' }); return; }

      /* ── Skills ── */
      if ((el = t.closest('[data-skill]'))) { patch({ skill: el.getAttribute('data-skill') }); return; }
      if (t.closest('[data-back-skill]')) { patch({ skill: '' }); return; }

      if ((el = t.closest('[data-skill-on]'))) {
        const k = SKILLS.find((x) => x.id === el.getAttribute('data-skill-on'));
        if (!k) return;
        /* Turning a skill ON is the direction that can change what a customer
           is told, so it is the direction that confirms — the same asymmetry
           the grounding toggle uses, and for the same reason. */
        k.on = !k.on;
        render();
        return;
      }

      if ((el = t.closest('[data-skill-src]'))) {
        const [id, col] = el.getAttribute('data-skill-src').split(':');
        const k = SKILLS.find((x) => x.id === id);
        if (!k) return;
        const i = k.sources.indexOf(col);
        if (i > -1) k.sources.splice(i, 1); else k.sources.push(col);
        render();
        return;
      }

      if ((el = t.closest('[data-sk-exp]'))) {
        const g = el.getAttribute('data-sk-exp');
        if (SKILL_OPEN.has(g)) SKILL_OPEN.delete(g); else SKILL_OPEN.add(g);
        render();
        return;
      }

      /* BY ID, not by display name. The instructions tree matches a checkbox
         to its group by comparing `aria-label` against the group's name, which
         holds only until two things are called the same thing. */
      if ((el = t.closest('[data-sk-group]'))) {
        const st0 = readURL();
        const sel = SKILL_SEL[st0.skill];
        const grp = targetGroups().find((g) => g.id === el.getAttribute('data-sk-group'));
        if (!sel || !grp) return;
        const all = grp.kids.every((k) => sel.has(k.id));
        grp.kids.forEach((k) => { if (all) sel.delete(k.id); else sel.add(k.id); });
        render();
        return;
      }

      if ((el = t.closest('[data-sk-kid]'))) {
        const st0 = readURL();
        const sel = SKILL_SEL[st0.skill];
        const id = el.getAttribute('data-sk-kid');
        if (!sel) return;
        if (sel.has(id)) sel.delete(id); else sel.add(id);
        render();
        return;
      }
      if (t.closest('[data-back-src]')) { patch({ src: '' }); return; }
      if ((el = t.closest('[data-src]'))) { patch({ src: el.getAttribute('data-src') }); return; }

      if ((el = t.closest('[data-ground]'))) {
        const id = el.getAttribute('data-ground'), col = el.getAttribute('data-col');
        const agent = AGENTS.find((a) => a.id === id);
        const on = el.getAttribute('aria-pressed') === 'true';
        if (!on && agent.external) {
          /* The rung. The control does not move yet. */
          groundConfirm(agent, col);
          return;
        }
        COLLECTION_META[col].grounding[id] = !on;
        el.setAttribute('aria-pressed', String(!on));
        const host = $('#groundConfirm'); if (host) host.innerHTML = '';
        return;
      }

      if (t.closest('[data-ground-cancel]')) { $('#groundConfirm').innerHTML = ''; return; }

      if ((el = t.closest('[data-ground-ok]'))) {
        const col = el.getAttribute('data-col'), id = el.getAttribute('data-agent');
        COLLECTION_META[col].grounding[id] = true;
        render();
        return;
      }

      /* Expanding is not selecting. Clicking the label opens a branch; only the
         checkbox changes what the rule targets. */
      if ((el = t.closest('[data-texp]'))) {
        const id = el.getAttribute('data-texp');
        if (treeOpen.has(id)) treeOpen.delete(id); else treeOpen.add(id);
        render();
        return;
      }

      if ((el = t.closest('.set2-ck'))) {
        const node = el.closest('.set2-node');
        const label = el.getAttribute('aria-label');
        const groups = targetGroups();
        const grp = groups.find((g) => g.name === label);
        if (grp) {
          /* The cascade we own: a parent takes its whole branch, or releases it. */
          const all = groupState(grp) === 'true';
          grp.kids.forEach((k) => { if (all) targetSel.delete(k.id); else targetSel.add(k.id); });
        } else {
          const kid = groups.reduce((f, g) => f || g.kids.find((k) => k.name === label), null);
          if (kid) { if (targetSel.has(kid.id)) targetSel.delete(kid.id); else targetSel.add(kid.id); }
        }
        if (node) render();
        else el.setAttribute('aria-checked', el.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
        return;
      }
    });

    /* Space toggles a focused checkbox, per the treeview contract. Keyboard
       driven changes do not animate: a power user hits these hundreds of times
       a day and motion on a repeated action reads as lag, not as polish. */
    document.addEventListener('keydown', (e) => {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      const el = e.target.closest && e.target.closest('.set2-ck');
      if (!el) return;
      e.preventDefault();
      el.setAttribute('aria-checked', el.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
    });

    window.addEventListener('popstate', render);
  }

  function init() {
    const u = $('#userName'), r = $('#userRole'), a = $('#userAvatar');
    if (u) u.textContent = USER.name;
    if (r) r.textContent = USER.role;
    if (a) a.textContent = USER.initials;

    /* The pill's menu, copied from knowledge.js rather than shared, for the
       same reason the fixtures are: this page does not load the corpus. */
    const btn = $('#userPill'), panel = $('#userMenu');
    if (btn && panel) {
      const close = (returnFocus) => {
        if (panel.hidden) return;
        panel.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
        if (returnFocus) btn.focus();
      };
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (panel.hidden) {
          panel.hidden = false;
          btn.setAttribute('aria-expanded', 'true');
          const first = $('.menu-item', panel);
          if (first) first.focus();
        } else close(true);
      });
      document.addEventListener('click', (e) => {
        if (panel.hidden || panel.contains(e.target) || btn.contains(e.target)) return;
        close();
      });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(true); });
    }

    wire();
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
