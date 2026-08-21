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
      by: 'Ahmed Samy', when: '12 Aug', v: 3, reach: 33, state: 'beaten' },
    { id: 'r2', scope: 'client', scopeName: 'CXS', text: 'Refer to the traveller in the second person. Never quote a fare without a booking reference.',
      by: 'Mohamed Ramy', when: '3 Sep', v: 1, reach: 12, state: 'active' },
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
  const MODULES = [
    { id: 'sources', name: 'Knowledge sources', sub: '5 connected, 2 failing', scopeT: 'Org', scopeV: 'FlairsTech',
      audience: 'Internal', plan: 'included', need: { kind: 'err', text: '2 failing' }, who: 'N. Wael', when: '20m ago', built: true },
    { id: 'instructions', name: 'AI instructions', sub: '4 rules, 1 unreachable', scopeT: 'Org', scopeV: 'FlairsTech',
      audience: 'Internal', plan: 'included', need: { kind: 'warn', text: '1 conflict' }, who: 'Nour Wael', when: '2h ago', built: true },
    { id: 'access', name: 'Access and roles', sub: '2 people, 3 grants', scopeT: 'Org', scopeV: 'FlairsTech',
      audience: 'Internal', plan: 'included', need: { kind: 'warn', text: '1 invite pending' }, who: 'Nour Wael', when: '3 Sep', built: true },
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
    return { module: MODULES.some((x) => x.id === m && x.built) ? m : '', src: p.get('src') || '' };
  }

  function patch(changes) {
    const st = readURL();
    Object.keys(changes).forEach((k) => { st[k] = changes[k]; });
    const p = new URLSearchParams();
    if (st.module) p.set('module', st.module);
    if (st.src) p.set('src', st.src);
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
      <p class="set2-offer" style="margin-top:0.75rem">Prices are placeholders pending commercial input. Three modules are built; the rest carry their state only.</p>`;
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
                <span class="set2-reach${r.reach === 0 ? ' is-zero' : ''}"><b>${r.reach}</b> of 34 agents</span>
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
  function tree() {
    const groups = [
      { id: 'client', name: 'Client agents', sel: 3, all: 8, state: 'mixed', kids: [['ClassyTravel', 'true'], ['Flighthub', 'true'], ['Medfar', 'true'], ['Upland', 'false'], ['Wingbuddy', 'false']] },
      { id: 'fn', name: 'Function agents', sel: 6, all: 6, state: 'true', kids: [] },
      { id: 'prod', name: 'Product support', sel: 15, all: 19, state: 'mixed', kids: [] }
    ];
    return `
      <div class="set2-tree" role="tree" aria-multiselectable="true" aria-label="Agents">
        <div class="set2-tree-body">
          ${groups.map((g) => `
            <div class="set2-node" role="treeitem" aria-expanded="${g.kids.length ? 'true' : 'false'}">
              ${ck(g.state, g.name)}${esc(g.name)}<span class="set2-node-ct">${g.sel} of ${g.all}</span>
            </div>
            ${g.kids.map(([n, c]) => `<div class="set2-node is-child" role="treeitem">${ck(c, n)}${esc(n)}</div>`).join('')}`).join('')}
        </div>
        <div class="set2-tree-foot"><span>24 of 34 selected</span><span>18 gain this rule, 6 already had it</span></div>
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
  function render() {
    const st = readURL();
    const host = $('#setPage');
    if (!host) return;
    const body = st.module === 'sources' ? sourcesModule(st)
      : st.module === 'instructions' ? instructionsModule()
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
      if (t.closest('[data-back]')) { patch({ module: '', src: '' }); return; }
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

      if ((el = t.closest('.set2-ck'))) {
        const cur = el.getAttribute('aria-checked');
        el.setAttribute('aria-checked', cur === 'true' ? 'false' : 'true');
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
