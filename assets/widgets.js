/* ═══════════════════════════════════════════════════════════════════════════
   widgets.js — Wave 1 variant gallery

   Twenty specimens: four shape-defining widgets, five variants each. They are
   live rather than drawn, because a targeting picker that cannot be clicked
   cannot be judged — the whole question about it is what happens at the third
   level down, and a static image of the first level answers nothing.

   The fixtures below are the CONSOLE's, not this repo's: the six-level tree in
   `TREE` is the Access & hierarchy prototype (FlairsTech > CXS > Customer
   Operations > Support Copilot > Knowledge Ops > user), which is the only
   screen in the production console that knows all six levels exist. Everything
   else in the console models three at most.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ═══ ICONS ═══ */
  const I = {
    tick: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6.2 4.6 8.8 10 3.4"/></svg>',
    dash: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M3 6h6"/></svg>',
    chev: '<svg class="w1-exp" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 2.5 8 6l-3.5 3.5"/></svg>',
    down: '<svg class="w1-fold-ch" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 4.5 6 8l3.5-3.5"/></svg>',
    lock: '<svg class="w1-lock" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5.5" width="7" height="5" rx="1"/><path d="M4.2 5.5V4a1.8 1.8 0 0 1 3.6 0v1.5"/></svg>',
    x:    '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 3l6 6M9 3l-6 6"/></svg>',
    doc:  '<svg class="w1-row-ico" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M11.5 2.5H6a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 6 17.5h8a1.5 1.5 0 0 0 1.5-1.5V6.5z"/><path d="M11.5 2.5v4h4M7.5 11h5M7.5 14h3"/></svg>',
    bolt: '<svg class="w1-row-ico" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2.5 5 11h4l-1 6.5L15 9h-4z"/></svg>'
  };

  /* ═══ THE SIX-LEVEL TREE ═══
     Depth is the point. CXS reaches all six; Upland reaches five; MedFar is a
     client with nothing under it yet, which is the state most of the console's
     real clients are actually in and the one a picker most often gets wrong.
     AiMY's own agents sit last and are never scoped away. */
  const TREE = [{
    id: 'flairs', name: 'FlairsTech', type: 'Organisation', kids: [
      { id: 'cxs', name: 'CXS', type: 'Client', kids: [
        { id: 'cxs-ops', name: 'Customer Operations', type: 'Business Unit', kids: [
          { id: 'cxs-copilot', name: 'Support Copilot', type: 'Product', kids: [
            { id: 'cxs-kops', name: 'Knowledge Ops', type: 'Team', kids: [
              { id: 'u-mahfouz', name: 'A. Mahfouz', type: 'User' },
              { id: 'u-nour', name: 'Nour Wael', type: 'User' }
            ]},
            { id: 'cxs-senab', name: 'Support Enablement', type: 'Team', kids: [
              { id: 'u-alex', name: 'Alex Smith', type: 'User' },
              { id: 'u-saly', name: 'Saly Tarek', type: 'User' }
            ]}
          ]},
          { id: 'cxs-ksearch', name: 'Knowledge Search', type: 'Product', kids: [
            { id: 'cxs-disc', name: 'Discovery', type: 'Team', kids: [
              { id: 'u-ramy', name: 'Mohamed Ramy', type: 'User' }
            ]}
          ]}
        ]},
        { id: 'cxs-dx', name: 'Digital Experience', type: 'Business Unit', kids: [
          { id: 'cxs-self', name: 'Self-Service', type: 'Product', kids: [] }
        ]}
      ]},
      { id: 'upland', name: 'Upland', type: 'Client', kids: [
        { id: 'upl-sup', name: 'Support Operations', type: 'Business Unit', kids: [
          { id: 'interfax', name: 'InterFAX Support', type: 'Product', kids: [
            { id: 'ifx-t1', name: 'Tier 1', type: 'Team', kids: [
              { id: 'u-tarek', name: 'Tarek Ahmed', type: 'User' }
            ]}
          ]},
          { id: 'kapost', name: 'Kapost Support', type: 'Product', kids: [] },
          { id: 'filebound', name: 'FileBound Support', type: 'Product', kids: [] }
        ]}
      ]},
      { id: 'medfar', name: 'MedFar', type: 'Client', kids: [] },
      { id: 'aimy', name: 'AiMY agents', type: 'Ours', kids: [
        { id: 'copilot', name: 'Copilot', type: 'Agent' },
        { id: 'sales', name: 'Sales', type: 'Agent' },
        { id: 'voice', name: 'Voice', type: 'Agent' }
      ]}
    ]
  }];

  /* A leaf is a node with nothing under it. Selection lives ONLY on leaves and
     every branch state is derived, so a branch can never disagree with what is
     actually selected under it. */
  function leavesOf(node, out) {
    out = out || [];
    if (!node.kids || !node.kids.length) { out.push(node); return out; }
    node.kids.forEach((k) => leavesOf(k, out));
    return out;
  }
  const ALL_LEAVES = TREE.reduce((a, n) => a.concat(leavesOf(n)), []);
  const LEAF_TOTAL = ALL_LEAVES.length;

  function nodeState(node, sel) {
    const lv = leavesOf(node);
    const on = lv.filter((l) => sel.has(l.id)).length;
    return on === 0 ? 'false' : on === lv.length ? 'true' : 'mixed';
  }

  /* ═══ THE PRECEDENCE CHAIN ═══
     Six stops, always in this order, for every governed object. `null` means
     the level holds no value, which is different from holding an empty one. */
  const LEVELS = ['Organisation', 'Client', 'Business Unit', 'Product', 'Team', 'User'];
  const LEVEL_SHORT = ['Org', 'Client', 'BU', 'Product', 'Team', 'You'];

  /* A skill's value at each of the six stops. This is the refund skill, which
     is the case the brief named: the organisation has one, and so do you. */
  const CHAIN = [
    { at: 0, on: 'FlairsTech', val: 'Professional, neutral tone. No emojis.', by: 'A. Mahfouz', when: '11 Aug' },
    { at: 1, on: 'CXS', val: 'Second person. Never quote a fare without a booking reference.', by: 'Ahmed Samy', when: '3 Sep' },
    { at: 2, on: null, val: null },
    { at: 3, on: 'Support Copilot', val: 'Warm and conversational. Emojis permitted in chat.', by: 'Nour Wael', when: '2h ago' },
    { at: 4, on: null, val: null },
    { at: 5, on: 'Nour Wael', val: 'Always open with the policy article, then the exception.', by: 'You', when: '20m ago' }
  ];
  /* ═══ THE LOCK ═══
     Specificity alone would hand every argument to the User stop, because the
     user is always the narrowest scope. That is the opposite of what the brief
     asks for: the organisation's skill has to beat the personal one.

     A LOCK is what reconciles them. It sits at the level that set it and blocks
     every level BELOW it, so specificity still decides among the levels the
     lock allows. Here the organisation has locked at Product, which is why your
     own value at the User stop exists, is visible, and does not apply.

     This is exactly what the console's padlock and its "Locked by Admin" label
     meant, and never said. */
  const LOCK_AT = 3;

  /* Resolution differs by lens, and that is the whole reason the lens exists.
     Returns the index of the winning stop, or -1 for "nothing applies here". */
  function resolve(chain, lens, lockAt) {
    const floorFor = (top) => (lockAt == null ? top : Math.min(top, lockAt));
    if (lens === 'yours') {
      /* Your value only, and only when nothing above has locked it out. The
         -1 is the honest answer to "what of mine applies here": nothing. */
      return (chain[5].val && floorFor(5) === 5) ? 5 : -1;
    }
    const top = lens === 'org' ? 4 : 5;   /* the org lens cannot see the user stop */
    for (let i = floorFor(top); i >= 0; i--) if (chain[i].val) return i;
    return -1;
  }

  /* The default paint and the default lens must agree. Deriving it is the only
     way they cannot drift apart — a hardcoded winner here was the first defect
     this gallery grew. */
  const WIN0 = resolve(CHAIN, 'effective', LOCK_AT);

  /* ═══ SKILL ROWS ═══
     Four of these were RULES until instructions and skills became one object.
     `trigger: always` is what an instruction is. */
  const SKILLS = [
    { n: 'Draft a refund response', d: 'Cite the policy and flag the contested clause.', t: 'Automatic', src: 'Yours', state: 'beat' },
    { n: 'Professional tone', d: 'Neutral register, no emojis unless asked.', t: 'Always', src: 'Organization', state: 'ok' },
    { n: 'Triage an inbound ticket', d: 'Classify, cite the article that settles it, say when none does.', t: 'Automatic', src: 'Library', state: 'off' },
    { n: 'Weekly staleness sweep', d: 'Documents behind their source, grouped by connector.', t: 'On demand', src: 'Yours', state: 'ok' },
    { n: 'Booking reference guard', d: 'Never quote a fare without a reference.', t: 'Always', src: 'Organization', state: 'zero' }
  ];
  const STATE_PILL = {
    ok:   ['is-ok',   'Applies'],
    beat: ['is-mute', 'Overridden by Organization'],
    off:  ['is-mute', 'Off'],
    zero: ['is-err',  'Unreachable']
  };

  /* ═══ ATOMS ═══ */
  const tok  = (t, v) => `<span class="w1-tok"><span class="w1-tok-t">${esc(t)}</span><span class="w1-tok-v">${esc(v)}</span></span>`;
  const pill = (k, t) => `<span class="w1-pill ${k}"><i></i>${esc(t)}</span>`;
  const ck   = (st, label) =>
    `<button class="w1-ck" role="checkbox" aria-checked="${st}" aria-label="${esc(label)}" type="button" tabindex="-1">${st === 'mixed' ? I.dash : I.tick}</button>`;

  function skillRow(s, opts) {
    opts = opts || {};
    const [cls, txt] = STATE_PILL[s.state];
    return `
      <div class="w1-row">
        ${s.t === 'Always' ? I.bolt : I.doc}
        <div class="w1-row-main">
          <div class="w1-row-n">${esc(s.n)}</div>
          <div class="w1-row-d">${esc(s.d)}</div>
        </div>
        <div class="w1-row-end">
          <span class="w1-src${s.src === 'Organization' ? ' is-org' : ''}">${esc(s.src)}</span>
          ${opts.noState ? '' : pill(cls, txt)}
          ${opts.locked ? I.lock : ''}
        </div>
      </div>`;
  }

  /* ═══ WIDGET 1 — MODULE SHELL ═══ */
  const W1 = [
    { k: 'V1', t: 'Ledger row', why: 'The current build. Ten modules scan in one glance, but the module’s own content has nowhere to live — <b>this is the shape settings.html has today</b>.',
      html: () => `
        <table class="w1-led">
          <thead><tr><th>Module</th><th>Scope</th><th>Audience</th><th>Plan</th><th>Needs you</th><th></th></tr></thead>
          <tbody>
            ${[['Skills', '3 defined, 1 unreachable', 'Org', 'FlairsTech', 'Internal', 'is-ok', 'Included', 'is-err', '1 unreachable', 'Open'],
               ['Connectors and sync', '5 connected, 2 failing', 'Org', 'FlairsTech', 'Internal', 'is-ok', 'Included', 'is-err', '2 failing', 'Open'],
               ['CRM field mapping', 'Pulls CRM fields into agent context', 'Product', 'Copilot', 'Client-visible', 'is-mute', 'Add-on', '', '', 'Add']
              ].map((r) => `
              <tr>
                <td><div class="w1-led-n">${esc(r[0])}</div><div class="w1-led-s">${esc(r[1])}</div></td>
                <td>${tok(r[2], r[3])}</td>
                <td><span class="w1-led-s">${esc(r[4])}</span></td>
                <td>${pill(r[5], r[6])}</td>
                <td>${r[7] ? pill(r[7], r[8]) : '<span class="w1-led-s">Nothing</span>'}</td>
                <td><button class="btn btn-ghost btn-sm" type="button">${esc(r[9])}</button></td>
              </tr><tr class="w1-led-sp"></tr>`).join('')}
          </tbody>
        </table>` },

    { k: 'V2', t: 'Header band', why: 'State sits in a tinted band above the rows. Clearest separation of module-state from module-content, at the cost of <b>a band on every module down the page</b>.',
      html: () => `
        <div class="w1-mod" data-mod>
          <div class="w1-mod-hd is-band">
            <span class="w1-mod-name">Skills</span>
            ${pill('is-ok', 'Included')}
            <span class="w1-src">Internal</span>
            <div class="w1-mod-end">${tok('Org', 'FlairsTech')}<button class="btn btn-ghost btn-sm" type="button" data-dirty>Edit a row</button></div>
          </div>
          <div class="w1-mod-body">${SKILLS.slice(0, 3).map((s) => skillRow(s)).join('')}</div>
          <div class="w1-save"><span class="w1-save-n"><b class="w1-num">2</b> changes in Skills</span>
            <span class="w1-save-end"><button class="btn btn-ghost btn-sm" type="button" data-clean>Discard</button><button class="btn btn-brand btn-sm" type="button" data-clean>Save</button></span></div>
        </div>` },

    { k: 'V3', t: 'No card at all', why: 'Title in the page flow, rows floating on the page surface. <b>Maximum T2 compliance</b> — not one drawn line anywhere. Weakest at saying where a module ends.',
      html: () => `
        <div class="w1-bare">
          <div class="w1-bare-t">Skills</div>
          <div class="w1-mod-body">${SKILLS.slice(0, 3).map((s) => skillRow(s)).join('')}</div>
        </div>` },

    { k: 'V4', t: 'Split header, dimmed lock', why: 'Name left, state right, on one baseline. Shown in the <b>not-entitled</b> state: the whole module dims. Honest, but you cannot read what you would be buying.',
      html: () => `
        <div class="w1-mod is-dim">
          <div class="w1-mod-hd">
            <span class="w1-mod-name">CRM field mapping</span>
            <div class="w1-mod-end">${pill('is-mute', 'Add-on')}${I.lock}</div>
          </div>
          <div class="w1-mod-body">${SKILLS.slice(0, 2).map((s) => skillRow(s, { noState: true })).join('')}</div>
          <div class="w1-tier"><span>40 per client, monthly. Needs Connectors and sync.</span>
            <span class="w1-tier-end"><button class="btn btn-ghost btn-sm" type="button">Add to plan</button></span></div>
        </div>` },

    { k: 'V5', t: 'Lock the controls, not the module', why: 'Same not-entitled state, full contrast. <b>You can read exactly what you are missing</b>, which is the pitch; only the controls are dead.',
      html: () => `
        <div class="w1-mod">
          <div class="w1-mod-hd">
            <span class="w1-mod-name">CRM field mapping</span>
            <div class="w1-mod-end">${pill('is-mute', 'Add-on')}</div>
          </div>
          <div class="w1-mod-body">${SKILLS.slice(0, 2).map((s) => skillRow(s, { noState: true, locked: true })).join('')}</div>
          <div class="w1-tier">${I.lock}<span>Not on your plan. 40 per client, monthly.</span>
            <span class="w1-tier-end"><button class="btn btn-brand btn-sm" type="button">Add to plan</button></span></div>
        </div>` }
  ];

  /* ═══ WIDGET 2 — SCOPE + LENS BAR ═══ */
  const CRUMB = [['Org', 'FlairsTech'], ['Client', 'CXS'], ['BU', 'Customer Operations'], ['Product', 'Support Copilot']];

  function lensCtl(id, big) {
    return `<div class="w1-lens${big ? ' is-big' : ''}" role="group" aria-label="Lens" data-lens-g="${id}">
      ${[['yours', 'Yours'], ['org', 'Organization'], ['eff', 'Effective']].map(([v, l]) =>
        `<button class="w1-lens-b${v === 'eff' ? ' is-on' : ''}" type="button" data-lens="${v}">${l}</button>`).join('')}
    </div>`;
  }

  const W2 = [
    { k: 'V1', t: 'Breadcrumb + segmented lens', why: 'The plain reading. Scope is text you cannot click; the lens is the only control. <b>Longest at six levels.</b>',
      html: () => `<div class="w1-bar">
        <div class="w1-crumb">${CRUMB.map(([t, v], i) =>
          `${i ? '<span class="w1-crumb-s">&rsaquo;</span>' : ''}<span class="w1-crumb-i">${esc(t)} <b>${esc(v)}</b></span>`).join('')}</div>
        <div class="w1-bar-end">${lensCtl('a')}<span class="w1-write">You can write here</span></div></div>` },

    { k: 'V2', t: 'Typed tokens', why: 'Reuses the existing <code>set2-tok</code>: the type sits above the value, so <b>a bare “CXS” can never be mistaken for a product</b>. Heavier, and the console’s exact bug is what it fixes.',
      html: () => `<div class="w1-bar">
        <div class="w1-crumb">${CRUMB.map(([t, v], i) => `${i ? '<span class="w1-crumb-s">&rsaquo;</span>' : ''}${tok(t, v)}`).join('')}</div>
        <div class="w1-bar-end"><select class="w1-lens-sel"><option>Effective</option><option>Yours</option><option>Organization</option></select></div></div>` },

    { k: 'V3', t: 'Two rows', why: 'Scope above, lens and write-state below. Calmer and taller. <b>Costs a row of vertical on every module page.</b>',
      html: () => `<div class="w1-bar is-two">
        <div class="w1-bar-row w1-crumb">${CRUMB.map(([t, v], i) =>
          `${i ? '<span class="w1-crumb-s">&rsaquo;</span>' : ''}<span class="w1-crumb-i">${esc(t)} <b>${esc(v)}</b></span>`).join('')}</div>
        <div class="w1-bar-row">${lensCtl('c')}<span class="w1-bar-end w1-write">You can write here</span></div></div>` },

    { k: 'V4', t: 'Lens first', why: 'The lens is the biggest thing in the bar because it is the only writable thing in it. Scope trails as quiet context. <b>Inverts what the console emphasised.</b>',
      html: () => `<div class="w1-bar">
        ${lensCtl('d', true)}
        <div class="w1-crumb">${CRUMB.map(([t, v], i) =>
          `${i ? '<span class="w1-crumb-s">&rsaquo;</span>' : ''}<span class="w1-crumb-i">${esc(t)} <b>${esc(v)}</b></span>`).join('')}</div>
        <span class="w1-bar-end w1-write">You can write here</span></div>` },

    { k: 'V5', t: 'Collapsed scope', why: 'Deepest two levels shown, the rest behind a counter. <b>The only variant that still fits when all six levels are filled</b> — click <code>+2</code> to expand.',
      html: () => `<div class="w1-bar">
        <div class="w1-crumb" data-crumb>
          <button class="w1-crumb-more" type="button" data-crumb-more>+2</button>
          <span class="w1-crumb-s">&rsaquo;</span>
          <span class="w1-crumb-i">BU <b>Customer Operations</b></span>
          <span class="w1-crumb-s">&rsaquo;</span>
          <span class="w1-crumb-i">Product <b>Support Copilot</b></span>
        </div>
        <div class="w1-bar-end">${lensCtl('e')}<span class="w1-write">You can write here</span></div></div>` }
  ];

  /* ═══ WIDGET 3 — PRECEDENCE LADDER ═══ */
  function ladderRail(win, lockAt) {
    return `<div class="w1-rail" data-rail>
      ${LEVELS.map((lv, i) => {
        const has = !!CHAIN[i].val;
        /* A stop below the lock that holds a value is the interesting one: it
           exists, it is not empty, and it still does not apply. */
        const cls = [has ? 'has-val' : '', i === win ? 'is-win' : '',
                     lockAt != null && i > lockAt && has ? 'is-lock' : ''].filter(Boolean).join(' ');
        return `${i ? `<span class="w1-rail-t${i <= win ? ' is-past' : ''}"></span>` : ''}
          <span class="w1-rail-s ${cls}" data-stop="${i}"><span class="w1-rail-d"></span><span class="w1-rail-l">${esc(LEVEL_SHORT[i])}</span></span>`;
      }).join('')}
    </div>`;
  }

  function ladderSteps(win) {
    return `<div><div class="w1-steps" data-steps>
      ${LEVELS.map((lv, i) => `<i class="${i < win ? 'is-past' : i === win ? 'is-win' : ''}"></i>`).join('')}
    </div><div class="w1-steps-l"><span>Organisation</span><span>${win >= 0 ? esc(LEVELS[win]) + ' wins' : 'Nothing applies'}</span><span>You</span></div></div>`;
  }

  function ladderStack(win, lockAt) {
    return `<div class="w1-stack" data-stack>
      ${LEVELS.map((lv, i) => {
        const c = CHAIN[i];
        const empty = !c.val;
        const blocked = lockAt != null && i > lockAt;
        const beat = !empty && i !== win;
        return `<div class="w1-stack-r ${empty ? 'is-empty' : ''} ${beat ? 'is-beat' : ''} ${i === win ? 'is-win' : ''}">
          <span class="w1-stack-lv">${esc(LEVEL_SHORT[i])}</span>
          <span class="w1-stack-v">${empty ? 'Nothing set' : esc(c.val)}</span>
          ${i === win ? pill('is-ok', 'Applies') : ''}
          ${blocked && !empty ? I.lock + pill('is-mute', 'Locked by Organization') : ''}
        </div>`;
      }).join('')}
    </div>`;
  }

  const W3 = [
    { k: 'V1', t: 'Rail', why: 'Six stops on a track. Fits inside a table row, so <b>every skill can carry its own ladder</b> without the page growing. Shows position, not values.',
      html: () => ladderRail(WIN0, LOCK_AT) },
    { k: 'V2', t: 'Stepped bar', why: 'Reads as <b>how far down the chain the value came from</b>. Smallest of the five. Loses which levels held a value and which were empty.',
      html: () => ladderSteps(WIN0) },
    { k: 'V3', t: 'Stacked list', why: 'Every level, its value, struck through when beaten, <b>and your own shown locked out rather than hidden</b>. The only variant that answers “what would I get back”. Tallest by far.',
      html: () => ladderStack(WIN0, LOCK_AT) },
    { k: 'V4', t: 'Winner first, chain on demand', why: 'Quiet at rest, whole chain on contact — <b>the direction’s own test</b>. Click the header.',
      html: () => `<div class="w1-fold" data-fold>
        <button class="w1-fold-hd" type="button" data-fold-t>
          ${tok(LEVELS[WIN0], CHAIN[WIN0].on)}${pill('is-ok', 'Applies')}
          <span class="w1-fold-more w1-num">overrides ${CHAIN.filter((c, i) => c.val && i !== WIN0).length}</span>${I.down}
        </button>
        <div class="w1-fold-bd">${ladderStack(WIN0, LOCK_AT)}</div></div>` },
    { k: 'V5', t: 'Default and exceptions', why: 'The organisation lens. The top row is named <b>Default</b> and exceptions are authored under it — override stops being an accident.',
      html: () => `<div class="w1-def">
        <div class="w1-def-r is-def"><span class="w1-def-k">Default</span>
          <span class="w1-def-v">Professional, neutral tone. No emojis.</span>
          <span class="w1-def-end"><span class="w1-src">A. Mahfouz &middot; 11 Aug</span></span></div>
        <div class="w1-def-r"><span class="w1-def-k">Client</span>
          <span class="w1-def-v"><b>CXS</b> &mdash; second person, never quote a fare without a reference.</span>
          <span class="w1-def-end"><span class="w1-src">Ahmed Samy &middot; 3 Sep</span></span></div>
        <div class="w1-def-r"><span class="w1-def-k">Product</span>
          <span class="w1-def-v"><b>Support Copilot</b> &mdash; warm and conversational, emojis permitted.</span>
          <span class="w1-def-end">${pill('is-ok', 'Applies')}</span></div>
        <button class="w1-add" type="button">+ Add exception for specific groups or users</button></div>` }
  ];

  /* ═══ WIDGET 4 — TARGETING PICKER ═══ */
  const SEL = new Set(['u-mahfouz', 'u-nour', 'u-alex', 'copilot']);
  const OPEN = new Set(['flairs', 'cxs', 'cxs-ops', 'cxs-copilot', 'upland', 'aimy']);

  function walk(node, depth, out, filter) {
    const kids = node.kids || [];
    const isLeaf = !kids.length;
    const hit = !filter || node.name.toLowerCase().indexOf(filter) >= 0;
    const kidRows = [];
    if (kids.length && (OPEN.has(node.id) || filter)) {
      kids.forEach((k) => walk(k, depth + 1, kidRows, filter));
    }
    if (filter && !hit && !kidRows.length) return;
    const st = nodeState(node, SEL);
    /* Roving tabindex: exactly one node in a tree is tabbable and the arrows
       move focus inside it. A tree that put every node in the tab order would
       cost 22 tabs to step over, which is how a keyboard path becomes one
       nobody uses. `aria-selected` carries the tick; `aria-checked` is not a
       treeitem property. */
    out.push(`<div class="w1-node is-l${depth}${isLeaf ? '' : ' is-grp'}${OPEN.has(node.id) ? ' is-open' : ''}"
      data-node="${esc(node.id)}" role="treeitem" tabindex="-1"
      aria-level="${depth}" aria-selected="${st === 'true'}"
      ${isLeaf ? '' : `aria-expanded="${OPEN.has(node.id)}"`}>
      ${isLeaf ? '<span class="w1-exp is-none"></span>' : I.chev}
      ${ck(st, node.name)}
      <span class="w1-node-n">${esc(node.name)}</span>
      <span class="w1-node-ty">${esc(node.type)}</span>
      ${isLeaf ? '' : `<span class="w1-node-ct">${leavesOf(node).filter((l) => SEL.has(l.id)).length} of ${leavesOf(node).length}</span>`}
    </div>`);
    out.push.apply(out, kidRows);
  }

  function pickerTree(filter) {
    const rows = [];
    TREE.forEach((n) => walk(n, 1, rows, filter));
    return rows.join('');
  }

  function pickerFoot() {
    const groups = TREE[0].kids.filter((g) => leavesOf(g).some((l) => SEL.has(l.id))).length;
    return `<span><b class="w1-num">${SEL.size}</b> of <span class="w1-num">${LEAF_TOTAL}</span> selected</span>
            <span>Across <b class="w1-num">${groups}</b> of <span class="w1-num">${TREE[0].kids.length}</span> clients</span>`;
  }

  const W4 = [
    { k: 'V1', t: 'Full tree', why: 'The existing picker extended from two levels to six. Tri-state cascades all the way down. <b>Try Upland → Support Operations → InterFAX.</b>',
      html: () => `<div class="w1-pick" data-pick="1">
        <div class="w1-pick-bd" role="tree" aria-multiselectable="true" aria-label="Targets">${pickerTree('')}</div>
        <div class="w1-pick-ft" data-foot>${pickerFoot()}</div></div>` },

    { k: 'V2', t: 'Column browser', why: 'One column per level, pick left to right. <b>Depth stops mattering</b> because you never see more than one level at a time. Costs horizontal room.',
      html: () => `<div class="w1-cols">
        ${[['Client', ['CXS', 'Upland', 'MedFar', 'AiMY agents'], 0],
           ['Business Unit', ['Customer Operations', 'Digital Experience'], 0],
           ['Product', ['Support Copilot', 'Knowledge Search'], 0],
           ['Team', ['Knowledge Ops', 'Support Enablement'], -1],
           ['User', ['A. Mahfouz', 'Nour Wael'], -1]].map(([h, items, on]) => `
          <div class="w1-col"><div class="w1-col-h">${esc(h)}</div>
            ${items.map((n, i) => `<div class="w1-col-i${i === on ? ' is-on' : ''}"><span>${esc(n)}</span>${i === on ? I.chev : ''}</div>`).join('')}
          </div>`).join('')}</div>` },

    { k: 'V3', t: 'Tree, search, chips', why: 'Search filters the tree; the selection is summarised as removable chips so <b>you can read what you picked without re-reading the tree</b>. Type “support”.',
      html: () => `<div class="w1-pick" data-pick="3">
        <div class="w1-pick-hd"><input class="w1-fld" type="search" placeholder="Search clients, products, teams or users…" data-pfilter></div>
        <div class="w1-pick-bd" role="tree" aria-multiselectable="true" aria-label="Targets">${pickerTree('')}</div>
        <div class="w1-pick-ft" data-foot>${pickerFoot()}</div></div>
        <div class="w1-chips" style="margin-top:0.75rem" data-chips></div>` },

    { k: 'V4', t: 'Level first, then a flat list', why: 'Choose the level, then tick a flat list at that level. <b>Kills depth entirely</b> — but you cannot express “all of Upland except FileBound”.',
      html: () => `<div>
        <div class="w1-lvl" style="margin-bottom:0.75rem">
          ${LEVELS.slice(1).map((l, i) => `<button class="w1-lvl-b${i === 2 ? ' is-on' : ''}" type="button">${esc(l)}</button>`).join('')}
        </div>
        <div class="w1-flat">
          ${['Support Copilot', 'Knowledge Search', 'Self-Service', 'InterFAX Support', 'Kapost Support', 'FileBound Support'].map((n, i) =>
            `<div class="w1-node">${ck(i < 2 ? 'true' : 'false', n)}<span class="w1-node-n">${esc(n)}</span></div>`).join('')}
        </div></div>` },

    { k: 'V5', t: 'Include and exclude rules', why: 'States reach as rules instead of ticks. <b>Survives 35 groups and any depth</b>, and stays correct when a client adds a product tomorrow. Hardest to build and to read back.',
      html: () => `<div class="w1-rule">
        <div class="w1-rule-r is-inc"><span class="w1-rule-k">Include</span><span class="w1-rule-v">Everything under <b>Upland</b></span></div>
        <div class="w1-rule-r is-exc"><span class="w1-rule-k">Except</span><span class="w1-rule-v"><b>FileBound Support</b></span></div>
        <div class="w1-rule-r is-inc"><span class="w1-rule-k">Include</span><span class="w1-rule-v"><b>CXS</b> &rsaquo; Customer Operations &rsaquo; Support Copilot</span></div>
        <button class="w1-add" type="button">+ Add a rule</button>
        <div class="w1-pick-ft" style="border-radius:var(--r-md);margin-top:0.25rem"><span>Reaches <b class="w1-num">4</b> of <span class="w1-num">${LEAF_TOTAL}</span> today, and any product added under Upland tomorrow</span></div></div>` }
  ];

  /* ═══ SECTIONS ═══ */
  const SECTIONS = [
    { id: 'shell',  n: '01', t: 'Module Shell',      job: 'Holds one capability: its name, its entitlement, its rows, and its own save boundary.', v: W1 },
    { id: 'bar',    n: '02', t: 'Scope + Lens Bar',  job: 'Says where you are and whose settings you are reading. Scope never writes; the lens is the one control.', v: W2 },
    { id: 'ladder', n: '03', t: 'Precedence Ladder', job: 'Organisation › Client › BU › Product › Team › User. The narrower scope wins; ties break on recency.', v: W3 },
    { id: 'picker', n: '04', t: 'Targeting Picker',  job: 'How far a skill reaches, across all six levels. The console renders this as 35 flat chips.', v: W4 }
  ];

  /* ═══ RENDER ═══ */
  function render() {
    $('#wvNav').innerHTML = SECTIONS.map((s, i) =>
      `<button class="wv-navlink${i === 0 ? ' is-on' : ''}" type="button" data-jump="${s.id}">${esc(s.t)}</button>`).join('');

    $('#wvPage').innerHTML = SECTIONS.map((s) => `
      <section class="wv-sec" id="${s.id}">
        <div class="wv-sec-h"><span class="wv-sec-n">${s.n}</span><h2 class="wv-sec-t">${esc(s.t)}</h2></div>
        <p class="wv-sec-job">${esc(s.job)}</p>
        ${s.v.map((v) => `
          <div class="wv-var">
            <div class="wv-var-h"><span class="wv-var-k">${v.k}</span><span class="wv-var-t">${esc(v.t)}</span><span class="wv-var-why">${v.why}</span></div>
            <div class="wv-stage${s.id === 'shell' ? ' is-plain' : ''}">${v.html()}</div>
          </div>`).join('')}
      </section>`).join('');
  }

  /* Repaint only the pickers, so a tick in one specimen does not blow away the
     open/closed state a reviewer set up in another. */
  function repaintPickers(focusId) {
    $$('[data-pick]').forEach((p) => {
      const f = $('[data-pfilter]', p);
      $('.w1-pick-bd', p).innerHTML = pickerTree(f && f.value ? f.value.toLowerCase().trim() : '');
      const foot = $('[data-foot]', p);
      if (foot) foot.innerHTML = pickerFoot();
      /* Innards were replaced, so the roving tabindex has to be re-seated or
         the next Tab lands outside the tree entirely. */
      const rows = $$('[data-node]', p);
      if (!rows.length) return;
      const want = focusId ? rows.filter((r) => r.dataset.node === focusId)[0] : null;
      (want || rows[0]).setAttribute('tabindex', '0');
      if (want) want.focus();
    });
    const chips = $('[data-chips]');
    if (chips) {
      const on = ALL_LEAVES.filter((l) => SEL.has(l.id));
      chips.innerHTML = on.length
        ? on.map((l) => `<span class="w1-chip">${esc(l.name)}<button type="button" data-unchip="${esc(l.id)}" aria-label="Remove ${esc(l.name)}">${I.x}</button></span>`).join('')
        : '<span class="w1-var-why" style="font-size:var(--ty-micro);color:var(--ink-faint)">Nothing selected. A skill that reaches nothing is a defect, not an empty state.</span>';
    }
  }

  function findNode(id, list) {
    list = list || TREE;
    for (const n of list) {
      if (n.id === id) return n;
      if (n.kids) { const f = findNode(id, n.kids); if (f) return f; }
    }
    return null;
  }

  function toggleNode(id) {
    const node = findNode(id);
    if (!node) return;
    const lv = leavesOf(node);
    const all = lv.every((l) => SEL.has(l.id));
    lv.forEach((l) => { if (all) SEL.delete(l.id); else SEL.add(l.id); });
  }

  /* ═══ WIRING ═══ */
  function wire() {
    document.addEventListener('click', (e) => {
      const jump = e.target.closest('[data-jump]');
      if (jump) {
        const el = document.getElementById(jump.dataset.jump);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        $$('[data-jump]').forEach((b) => b.classList.toggle('is-on', b === jump));
        return;
      }

      /* Save boundary — micro-interaction 3. */
      const dirty = e.target.closest('[data-dirty]');
      if (dirty) { dirty.closest('[data-mod]').classList.add('is-dirty'); return; }
      const clean = e.target.closest('[data-clean]');
      if (clean) { clean.closest('[data-mod]').classList.remove('is-dirty'); return; }

      /* Ladder resolve — micro-interaction 1. The marker moves because the
         resolution genuinely changed, not because a class was swapped. */
      const lens = e.target.closest('[data-lens]');
      if (lens) {
        const g = lens.closest('[data-lens-g]');
        $$('[data-lens]', g).forEach((b) => b.classList.toggle('is-on', b === lens));
        const v = lens.dataset.lens;
        const win = resolve(CHAIN, v === 'eff' ? 'effective' : v, LOCK_AT);
        /* Micro-interaction 1. Every ladder specimen re-resolves, because they
           are five renderings of ONE fact and a disagreement between them would
           be the widget lying about itself. */
        $$('[data-rail]').forEach((r) => {
          $$('.w1-rail-s', r).forEach((s, i) => s.classList.toggle('is-win', i === win));
          $$('.w1-rail-t', r).forEach((t, i) => t.classList.toggle('is-past', i + 1 <= win));
        });
        $$('[data-steps]').forEach((r) => $$('i', r).forEach((s, i) => {
          s.classList.toggle('is-past', i < win); s.classList.toggle('is-win', i === win);
        }));
        $$('[data-stack]').forEach((s) => {
          s.outerHTML = ladderStack(win, LOCK_AT);
        });
        $$('[data-steps]').forEach((r) => {
          const lbl = r.parentNode.querySelector('.w1-steps-l span:nth-child(2)');
          if (lbl) lbl.textContent = win >= 0 ? LEVELS[win] + ' wins' : 'Nothing of yours applies';
        });
        return;
      }

      const more = e.target.closest('[data-crumb-more]');
      if (more) {
        const c = more.closest('[data-crumb]');
        c.innerHTML = CRUMB.map(([t, v], i) =>
          `${i ? '<span class="w1-crumb-s">&rsaquo;</span>' : ''}<span class="w1-crumb-i">${esc(t)} <b>${esc(v)}</b></span>`).join('');
        return;
      }

      const fold = e.target.closest('[data-fold-t]');
      if (fold) { fold.closest('[data-fold]').classList.toggle('is-open'); return; }

      const unchip = e.target.closest('[data-unchip]');
      if (unchip) { SEL.delete(unchip.dataset.unchip); repaintPickers(); return; }

      /* Picker. A click on the chevron opens; a click anywhere else toggles.
         Reach settle — micro-interaction 2 — is the counter in the foot. */
      const node = e.target.closest('[data-node]');
      if (node) {
        const id = node.dataset.node;
        if (e.target.closest('.w1-exp')) {
          if (OPEN.has(id)) OPEN.delete(id); else OPEN.add(id);
        } else {
          toggleNode(id);
        }
        repaintPickers();
      }
    });

    document.addEventListener('input', (e) => {
      if (e.target.matches('[data-pfilter]')) repaintPickers();
    });

    /* ═══ KEYBOARD ═══
       The ARIA treeview map, which is the spec's and not ours. The tri-state
       cascade below it IS ours -- the spec defines `mixed` and says nothing
       about parent-to-child propagation -- and it is the same cascade the
       mouse gets, because two selection models on one widget is how a picker
       starts disagreeing with itself. */
    document.addEventListener('keydown', (e) => {
      const node = e.target.closest && e.target.closest('[data-node]');
      if (!node) return;
      const pick = node.closest('[data-pick]');
      if (!pick) return;
      const rows = $$('[data-node]', pick);
      const i = rows.indexOf(node);
      const id = node.dataset.node;
      const open = node.getAttribute('aria-expanded');
      const move = (j) => {
        const t = rows[Math.max(0, Math.min(rows.length - 1, j))];
        if (!t) return;
        rows.forEach((r) => r.setAttribute('tabindex', '-1'));
        t.setAttribute('tabindex', '0'); t.focus();
      };

      switch (e.key) {
        case ' ': case 'Enter':
          e.preventDefault(); toggleNode(id); repaintPickers(id); break;
        case 'ArrowDown': e.preventDefault(); move(i + 1); break;
        case 'ArrowUp':   e.preventDefault(); move(i - 1); break;
        case 'Home':      e.preventDefault(); move(0); break;
        case 'End':       e.preventDefault(); move(rows.length - 1); break;
        case 'ArrowRight':
          e.preventDefault();
          if (open === 'false') { OPEN.add(id); repaintPickers(id); }
          else if (open === 'true') move(i + 1);   /* already open: into the first child */
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (open === 'true') { OPEN.delete(id); repaintPickers(id); }
          else {
            /* Close is not available, so go to the parent: the nearest row
               above at a shallower level. */
            const lvl = +node.getAttribute('aria-level');
            for (let j = i - 1; j >= 0; j--) {
              if (+rows[j].getAttribute('aria-level') < lvl) { move(j); break; }
            }
          }
          break;
        default: return;
      }
    });

    /* Density. The Operations tables are watched for long stretches and the
       rest are not, so the two modes have to be judged side by side. */
    const d = $('#wvDensity');
    d.addEventListener('click', () => {
      const on = d.getAttribute('aria-pressed') === 'true';
      d.setAttribute('aria-pressed', String(!on));
      d.textContent = on ? 'Comfortable' : 'Compact';
      document.body.setAttribute('data-density', on ? 'default' : 'compact');
    });

    /* Which section you are in, without a scroll library. */
    const obs = new IntersectionObserver((es) => {
      es.forEach((en) => {
        if (!en.isIntersecting) return;
        $$('[data-jump]').forEach((b) => b.classList.toggle('is-on', b.dataset.jump === en.target.id));
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    SECTIONS.forEach((s) => { const el = document.getElementById(s.id); if (el) obs.observe(el); });
  }

  render();
  repaintPickers();
  wire();
})();
