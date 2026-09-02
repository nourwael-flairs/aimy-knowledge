/* ═══════════════════════════════════════════════════════════════════════════
   settings.js — AiMY Settings

   A page, not a fourth overlay. The corpus already carries the canvas, the
   settings sheet and the peek; settings is somewhere you GO, and giving it a
   URL is what makes it linkable, bookmarkable and drivable by an agent.

   ── The IA ──
   The production console splits at the top by WHO (Personal | Workspace
   Admin). That forces every capability to exist twice and reduces the whole
   override story to a banner sentence plus a padlock. This build splits by
   WHAT, and demotes "whose" to a LENS that sits across every module:

       AI Controls   what AiMY can do        Skills, Agents, Grounding
       Organization  who exists and reaches  People, Roles, Hierarchy, Plan
       Operations    the machinery           Sync, Webhooks, Mapping, ...

       Lens          Yours | Organization | Effective     (default Effective)

   So Skills is ONE destination. Your skills and the organisation's are in one
   list, each saying where it came from and whether it survived.

   ── Instructions are skills ──
   They were a separate object with their own module. They are the same thing:
   an instruction is a skill that ALWAYS applies. `trigger: 'always'` is the
   whole of the merge, and the four old RULES fixtures come across with their
   scope, their reach and their state intact. This reverses the position
   argued in the previous build of this file; it was a deliberate call, not an
   oversight.

   ── State ──
   The query string, same as the corpus. Nothing narrows the view off a
   variable the URL does not also hold, because a filter with neither a control
   nor a chip has silently taken something away.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ═══ ICONS ═══ */
  /* The same symbol knowledge.js uses, from the same sprite. A quick action is
     AiMY's reading of a page, and it has to be recognisable as that from the
     rail without a legend. */
  const AIMY = '<svg class="rail-fix-m" width="11" height="12" viewBox="0 0 18 20" aria-hidden="true"><use href="#aimy-logo-small"/></svg>';
  const I = {
    warn: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2.6 1.8 13.4h12.4z"/><path d="M8 6.6v3"/><path d="M8 11.6h.01"/></svg>',
    info: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6.2"/><path d="M8 7.4v3.4"/><path d="M8 5.2h.01"/></svg>',
    copy: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5.6" y="5.6" width="7.8" height="7.8" rx="1.6"/><path d="M10.4 5.6V4a1.6 1.6 0 0 0-1.6-1.6H4A1.6 1.6 0 0 0 2.4 4v4.8A1.6 1.6 0 0 0 4 10.4h1.6"/></svg>',
    tick: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6.2 4.6 8.8 10 3.4"/></svg>',
    dash: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M3 6h6"/></svg>',
    caret: '<svg class="set2-exp" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 2.5 8 6l-3.5 3.5"/></svg>',
    down: '<svg class="set2-lad-ch" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 4.5 6 8l3.5-3.5"/></svg>',
    chev: '<svg class="set2-chev" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 2.5 8 6l-3.5 3.5"/></svg>',
    lock: '<svg class="w-lock" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5.5" width="7" height="5" rx="1"/><path d="M4.2 5.5V4a1.8 1.8 0 0 1 3.6 0v1.5"/></svg>',
    x: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 3l6 6M9 3l-6 6"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4M7.5 8.5 12 4l4.5 4.5M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16"/></svg>',
    eye: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z"/><circle cx="8" cy="8" r="2"/></svg>',
    code: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 4.5 2 8l3.5 3.5M10.5 4.5 14 8l-3.5 3.5"/></svg>',
    /* Row glyphs. One family, one stroke, 16px grid. */
    bolt: '<svg class="set2-row-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 1.5 4 8.5h3l-1 6 5-7H8z"/></svg>',
    doc:  '<svg class="set2-row-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 1.5H4.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V4.5z"/><path d="M9.5 1.5v3h3M6 8.5h4M6 11h2.5"/></svg>',
    hand: '<svg class="set2-row-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 14.5a4.5 4.5 0 0 0 4.5-4.5V6a1 1 0 0 0-2 0V4a1 1 0 0 0-2 0V3a1 1 0 0 0-2 0v1a1 1 0 0 0-2 0v5.5"/><path d="M4.5 9.5 3 11l2 3"/></svg>',
    plug: '<svg class="set2-row-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 1.5v4M10 1.5v4M4 5.5h8v2a4 4 0 0 1-8 0z"/><path d="M8 11.5v3"/></svg>',
    user: '<svg class="set2-row-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="5.5" r="2.5"/><path d="M2.5 14a5.5 5.5 0 0 1 11 0"/></svg>',
    tree: '<svg class="set2-row-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="5.5" y="1.5" width="5" height="3.5" rx="1"/><rect x="1.5" y="11" width="4.5" height="3.5" rx="1"/><rect x="10" y="11" width="4.5" height="3.5" rx="1"/><path d="M8 5v3.5M3.75 11V8.5h8.5V11"/></svg>',
    left: '<svg class="set2-lad-ch" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7.5 2.5 4 6l3.5 3.5"/></svg>',
    trash: '<svg class="set2-tr" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.5h10M6.5 4.5V3.2a.7.7 0 0 1 .7-.7h1.6a.7.7 0 0 1 .7.7v1.3M4.4 4.5l.5 8a1 1 0 0 0 1 .9h4.2a1 1 0 0 0 1-.9l.5-8"/></svg>',
    key:  '<svg class="set2-row-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="10.5" r="3"/><path d="M7.6 8.4 13 3M11 5l1.5 1.5M12.5 3.5 14 5"/></svg>'
  };

  /* ═══ WHO ═══ */
  const USER = { name: 'Nour Wael', initials: 'NW', role: 'Product Design' };

  /* ═══ THE SIX-LEVEL TREE ═══
     The console's Access & hierarchy prototype, which is the only screen there
     that knows all six levels exist. CXS reaches all six; Upland five; MedFar
     is a client with nothing under it yet, which is the state most real
     clients are in and the one a picker most often gets wrong. AiMY's own
     agents sit last and are never scoped away. */
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

  function leavesOf(node, out) {
    out = out || [];
    if (!node.kids || !node.kids.length) { out.push(node); return out; }
    node.kids.forEach((k) => leavesOf(k, out));
    return out;
  }
  const ALL_LEAVES = TREE.reduce((a, n) => a.concat(leavesOf(n)), []);
  const LEAF_TOTAL = ALL_LEAVES.length;
  const nodeState = (node, sel) => {
    const lv = leavesOf(node);
    const on = lv.filter((l) => sel.has(l.id)).length;
    return on === 0 ? 'false' : on === lv.length ? 'true' : 'mixed';
  };
  function findNode(id, list) {
    list = list || TREE;
    for (const n of list) {
      if (n.id === id) return n;
      if (n.kids) { const f = findNode(id, n.kids); if (f) return f; }
    }
    return null;
  }

  /* ═══ PRECEDENCE ═══
     Six stops, one order, for every governed object.

     Specificity alone would hand every argument to the User stop, because the
     user is always the narrowest scope -- the opposite of what is wanted. A
     LOCK reconciles them: it sits at the level that set it and blocks every
     level BELOW, so specificity still decides among the levels it allows.
     That is what the console's padlock meant and never said. */
  const LEVELS = ['Organisation', 'Client', 'Business Unit', 'Product', 'Team', 'You'];

  function resolve(chain, lens, lockAt) {
    const floorFor = (top) => (lockAt == null ? top : Math.min(top, lockAt));
    if (lens === 'yours') return (chain[5] && chain[5].val && floorFor(5) === 5) ? 5 : -1;
    const top = lens === 'org' ? 4 : 5;           /* the org lens cannot see You */
    for (let i = floorFor(top); i >= 0; i--) if (chain[i] && chain[i].val) return i;
    return -1;
  }

  /* ═══ SKILLS ═══
     `trigger: always` is what an instruction was. Nothing else changed: the
     old rules keep their scope, their reach and their state. */
  const TRIGGER = { always: 'Always', auto: 'Automatic', manual: 'On demand' };

  const SKILLS = [
    { id: 'tone', name: 'Professional tone', from: 'Organization', trigger: 'always', on: true,
      desc: 'Neutral register. No emojis or jargon unless the reader asks for something looser.',
      by: 'A. Mahfouz', when: '11 Aug', v: 3, sources: ['policies'], targets: ['copilot', 'sales', 'voice'],
      body: 'Keep a professional, neutral tone. Avoid emojis and jargon unless the reader asks '
          + 'for something more creative. Never open with an apology.',
      lock: null,
      chain: [
        { on: 'FlairsTech', val: 'Professional, neutral tone. No emojis.', by: 'A. Mahfouz', when: '11 Aug' },
        {}, {}, {}, {}, {}
      ] },

    { id: 'refund', name: 'Draft a refund response', from: 'Yours', trigger: 'auto', on: true,
      desc: 'Cite the policy article and flag the contested clause rather than picking a side.',
      by: USER.name, when: '20m ago', v: 4, sources: ['policies', 'support'],
      targets: ['u-mahfouz', 'u-nour', 'copilot'],
      body: 'Answer from the EU refund article first, and name it. If the Returns FAQ disagrees '
          + 'about what happens after activation, say the clause is contested rather than picking '
          + 'a side. Nobody has ruled on it. Never quote a figure that is not in a cited source.',
      /* The organisation locked at Product, so this personal skill exists, is
         visible, and does not apply. This is the case the brief named. */
      lock: 3,
      chain: [
        { on: 'FlairsTech', val: 'Professional, neutral tone. No emojis.', by: 'A. Mahfouz', when: '11 Aug' },
        { on: 'CXS', val: 'Second person. Never quote a fare without a booking reference.', by: 'Ahmed Samy', when: '3 Sep' },
        {},
        { on: 'Support Copilot', val: 'Warm and conversational. Emojis permitted in chat.', by: 'Nour Wael', when: '2h ago' },
        {},
        { on: USER.name, val: 'Always open with the policy article, then the exception.', by: 'You', when: '20m ago' }
      ] },

    { id: 'booking', name: 'Booking reference guard', from: 'Organization', trigger: 'always', on: true,
      desc: 'Never quote a fare without a booking reference.',
      by: 'Ahmed Samy', when: '3 Sep', v: 1, sources: ['policies'], targets: ['u-alex', 'u-saly'],
      body: 'Refer to the traveller in the second person. Never quote a fare without a booking '
          + 'reference in hand.',
      lock: null,
      chain: [ {}, { on: 'CXS', val: 'Never quote a fare without a booking reference.', by: 'Ahmed Samy', when: '3 Sep' }, {}, {}, {}, {} ] },

    { id: 'sweep', name: 'Weekly staleness sweep', from: 'Yours', trigger: 'manual', on: true,
      desc: 'Documents behind their source, grouped by connector, with an owner for each.',
      by: USER.name, when: '3 Sep', v: 2, sources: ['policies', 'support', 'marketing'], targets: ['copilot'],
      body: 'Group by connector, not by collection. A stale document is almost always a symptom '
          + 'of the sync that fed it. Name the owner for each. Stop at ten and say how many were '
          + 'left out.',
      lock: null,
      chain: [ {}, {}, {}, {}, {}, { on: USER.name, val: 'Group by connector, stop at ten.', by: 'You', when: '3 Sep' } ] },

    { id: 'triage', name: 'Triage an inbound ticket', from: 'Library', trigger: 'auto', on: false,
      desc: 'Classify, cite the article that settles it, and say plainly when none does.',
      by: 'A. Mahfouz', when: '11 Aug', v: 1, sources: ['support'], targets: [],
      body: 'Classify first, answer second. If no article settles the ticket, say so plainly and '
          + 'route it. A confident answer from adjacent material is the failure this skill exists '
          + 'to prevent.',
      lock: null,
      chain: [ {}, {}, {}, {}, {}, {} ] }
  ];

  /* Per skill, so editing one skill's reach cannot move another's. */
  const SEL = {};
  SKILLS.forEach((s) => { SEL[s.id] = new Set(s.targets); });
  const OPEN = new Set(['flairs', 'cxs', 'cxs-ops', 'upland', 'aimy']);
  const DIRTY = new Set();

  const skillById = (id) => SKILLS.filter((s) => s.id === id)[0];
  const reachOf = (s) => SEL[s.id].size;

  /* A skill's standing under the current lens. `zero` is a defect, not an
     empty state: a skill that reaches nothing can never fire. */
  function standing(s, lens) {
    if (!s.on) return ['is-mute', 'Off'];
    if (reachOf(s) === 0) return ['is-err', 'Reaches nothing'];
    const win = resolve(s.chain, lens, s.lock);
    if (win === -1) return ['is-mute', 'Nothing of yours applies'];
    if (s.lock != null && s.chain[5] && s.chain[5].val && win !== 5) return ['is-mute', 'Overridden by Organization'];
    return ['is-ok', 'Applies'];
  }

  /* ═══════════════════════════════════════════════════════════════════════
     CONNECTIONS

     The console models this surface as four unrelated sections stacked on one
     scroll, scoped by two dropdowns that sit in different places and mean
     different things: a product picker in the page chrome ("FileBound") and a
     CRM picker in a section header ("CRM"). A third copy of the product,
     disabled, sits inside the sync form. Nothing on the page says that all
     four sections describe ONE thing.

     They do. A product plus a CRM is a CONNECTION, and everything else here
     is that connection's contract: what its fields mean, how far back to
     read, when to pull, and what to throw away. So the scope stops being two
     dropdowns and becomes a list you pick from, the way Supabase and Railway
     scope a project. You are never in a state where the page is showing you
     one product's mapping and another product's sync.
     ═══════════════════════════════════════════════════════════════════════ */

  /* The connector's own schema. Typeahead has to come from somewhere real or
     the picker is a text box wearing a costume. `o` marks an object, which is
     what makes a path longer than one segment possible.

     NOTE on the console's version: its key picker suggests "Mohamed, Mostafa,
     Mosaab" under a heading that reads SELECT KEY. Those are values, not keys.
     Either the prototype was wired to the wrong fixture or the control means
     something other than its label. Modelled here as keys, which is the only
     reading where the control and its heading agree. */
  const SCHEMA = {
    zendesk: {
      assignee:  { o: { name: 's', email: 's', id: 'id', phone: 's' } },
      requester: { o: { name: 's', email: 's',
                        organization: { o: { name: 's', domain: 's' } } } },
      ticket:    { o: { id: 'id', subject: 's', status: 'e', priority: 'e', created_at: 'd' } },
      brand:     { o: { name: 's' } }
    },
    freshdesk: {
      agent:    { o: { name: 's', email: 's', id: 'id' } },
      contact:  { o: { name: 's', email: 's', company: { o: { name: 's', domain: 's' } } } },
      ticket:   { o: { id: 'id', subject: 's', status: 'e', priority: 'e' } }
    }
  };

  /* ── What the path actually returns ──
     The single most important thing on this screen. A path that resolves
     cleanly and returns the WRONG column passes every other check there is:
     the schema accepts it, the syntax is fine, nothing goes red. The only way
     to catch it is to look at the values.

     Attio, HubSpot, folk and Podia all pin a data preview beside the mapping
     for exactly this reason. The production console does too, and mislabels it
     `SELECT KEY` -- those names under the picker are the VALUES coming back,
     not the keys going in. */
  const SAMPLES = {
    zendesk: {
      'assignee.name': ['Mohamed Ramy', 'Mostafa Adel', 'Mosaab Hany'],
      'assignee.email': ['m.ramy@cxs.com', 'm.adel@cxs.com', 'm.hany@cxs.com'],
      'assignee.id': ['4471', '4472', '4488'],
      'assignee.phone': ['+20 100 442 1180', '+20 100 771 3325', 'null'],
      'requester.name': ['Dana Whitfield', 'Ivo Kraus', 'Priya Raghavan'],
      'requester.email': ['dana@nordwind.de', 'ivo@tavola.it', 'priya@meridian.health'],
      'requester.organization.name': ['Nordwind GmbH', 'Tavola Retail', 'Meridian Health'],
      'requester.organization.domain': ['nordwind.de', 'tavola.it', 'meridian.health'],
      'ticket.id': ['88214', '88215', '88220'],
      'ticket.subject': ['Refund not received', 'Cannot export batch', 'Seat count wrong'],
      'ticket.status': ['solved', 'open', 'pending'],
      'ticket.priority': ['5', '2', '3'],
      'ticket.created_at': ['2026-08-14', '2026-08-14', '2026-08-15'],
      'brand.name': ['FileBound', 'FileBound', 'InterFAX']
    },
    freshdesk: {
      'agent.name': ['Tarek Ahmed', 'Salma Nabil', 'Karim Fouad'],
      'agent.email': ['tarek@upland.com', 'salma@upland.com', 'karim@upland.com'],
      'agent.id': ['9012', '9013', '9020'],
      'contact.name': ['Lena Fischer', 'Marco Rossi', 'Aisha Bello'],
      'contact.email': ['lena@nordwind.de', 'marco@tavola.it', 'aisha@orbit.bpo'],
      'contact.company.name': ['Nordwind GmbH', 'Tavola Retail', 'Orbit BPO'],
      'contact.company.domain': ['nordwind.de', 'tavola.it', 'orbit.bpo'],
      'ticket.id': ['5510', '5511', '5514'],
      'ticket.subject': ['Licence renewal', 'Batch stuck', 'Export failing'],
      'ticket.status': ['open', 'open', 'pending'],
      'ticket.priority': ['1', '3', '2']
    }
  };
  const samplesFor = (crmId, path) => (SAMPLES[crmId] || {})[path.join('.')] || null;

  /* ── Every path the connector exposes, flattened ──
     The console walks the schema one level at a time: pick `requester`, then a
     menu, then pick `organization`, then a menu, then pick `domain`. Three
     decisions to name one thing, and you cannot see what any of them return
     until you have made all three.

     Flattening it means ONE decision. Type "domain" and every path that could
     be a domain is on screen with its values beside it, whichever branch it
     lives on. The tree is still how the connector is shaped; it is just not
     how anybody should have to search it. */
  function allPaths(crmId, node, prefix, out) {
    out = out || []; prefix = prefix || [];
    const o = node ? node.o : SCHEMA[crmId];
    if (!o) return out;
    Object.keys(o).forEach((k) => {
      const next = o[k];
      const path = prefix.concat([k]);
      if (typeof next === 'string') out.push({ path: path, kind: next });
      else { out.push({ path: path, kind: 'o' }); allPaths(crmId, next, path, out); }
    });
    return out;
  }
  /* Leaves only, for the picker: an object is a container, not a value, and
     offering one as a mapping is offering something that answers nothing. */
  const leafPaths = (crmId) => allPaths(crmId).filter((p) => p.kind !== 'o');

  /* ── Derived subfields ──
     A field can carry children whose values come from INSIDE its own — the
     domain of an email, the surname in a name. The console models these as
     separate top-level paths, which loses the fact that the domain you use
     came from the email you already mapped: change the email and the domain
     silently keeps pointing at the old branch.

     Each derivation states when it APPLIES, tested against the parent's real
     sample values. Nothing offers "domain" on a ticket number. */
  const DERIVE = {
    domain: { label: 'Domain', hint: 'after the @',
      when: (s) => s.some((v) => String(v).indexOf('@') > 0),
      of: (v) => String(v).split('@')[1] || '' },
    local: { label: 'Name part', hint: 'before the @',
      when: (s) => s.some((v) => String(v).indexOf('@') > 0),
      of: (v) => String(v).split('@')[0] },
    first: { label: 'First word', hint: 'up to the first space',
      when: (s) => s.some((v) => String(v).trim().indexOf(' ') > 0),
      of: (v) => String(v).trim().split(/\s+/)[0] },
    last: { label: 'Last word', hint: 'after the last space',
      when: (s) => s.some((v) => String(v).trim().indexOf(' ') > 0),
      of: (v) => String(v).trim().split(/\s+/).slice(-1)[0] }
  };

  /* What a node actually returns, parent derivations applied. A derived node
     has no path of its own — it is its parent's value, transformed — so its
     samples are the parent's run through the derivation. */
  function nodeSamples(crmId, node, parentSamples) {
    if (node.derive) {
      const d = DERIVE[node.derive];
      if (!d || !parentSamples) return null;
      const out = parentSamples.map(d.of).filter(Boolean);
      return out.length ? out : null;
    }
    return node.path && node.path.length ? samplesFor(crmId, node.path) : null;
  }

  /* ── WHAT MAY HANG UNDER A FIELD ──
     Two different things, and the surface only ever offered one of them.

     A mapped key that lands on an OBJECT has real children in the connector's
     own schema: map Agent to `assignee` and the connector already knows about
     `name`, `email`, `id`, `phone`. Those are subfields in the plainest sense
     and they were unreachable — `derivesFor` needs sample STRINGS, so an
     object returned nothing and the row offered no way down at all.

     A mapped key that lands on a STRING has no children, but it can still be
     cut: the domain out of an email, the last word of a name. Those are
     derivations, and they were the only thing on offer.

     Both are subfields to the person reading. They are one picker, in two
     named groups, because "fields inside requester" and "pieces of this
     value" are different promises and a merged list makes them look alike. */
  const humanKey = (k) => k.replace(/[._-]+/g, ' ')
    .replace(/^./, (ch) => ch.toUpperCase());

  function childKeysFor(crmId, node) {
    if (!node.path || !node.path.length) return [];
    return keysAt(crmId, node.path).map((k) => ({
      key: k,
      label: humanKey(k),
      path: node.path.concat([k]),
      samples: samplesFor(crmId, node.path.concat([k]))
    }));
  }

  /* THREE LEVELS. The design fixes the depth and the model has to agree with
     it: a field, a subfield, and one below that. Deeper than three and the
     indent alone stops carrying the relationship — by the fourth step the
     reader is counting pixels to work out whose child a row is. */
  const MAX_LEVEL = 3;
  const canNest = (depth) => depth + 1 < MAX_LEVEL;

  function subOptions(c, node, parentSamples) {
    return { keys: childKeysFor(c.crmId, node),
             derives: derivesFor(c.crmId, node, parentSamples) };
  }
  const hasSubs = (o) => o.keys.length > 0 || o.derives.length > 0;

  /* Which derivations make sense for what this node returns. */
  function derivesFor(crmId, node, parentSamples) {
    const s = nodeSamples(crmId, node, parentSamples);
    if (!s) return [];
    return Object.keys(DERIVE).filter((k) => DERIVE[k].when(s));
  }

  /* Walk a path against the schema. Returns the node, or the index of the
     segment that broke. A mapping pointing at a key the connector no longer
     exposes is the failure that actually costs answers, and the console has
     no way to show it. */
  function walkPath(crmId, path) {
    let node = { o: SCHEMA[crmId] || {} };
    for (let i = 0; i < path.length; i++) {
      if (!node || !node.o || !(path[i] in node.o)) return { ok: false, at: i };
      const next = node.o[path[i]];
      node = (typeof next === 'string') ? { leaf: next } : next;
    }
    return { ok: true, node: node };
  }
  /* What may follow the path so far. An empty list means the path is complete. */
  const keysAt = (crmId, path) => {
    let node = { o: SCHEMA[crmId] || {} };
    for (const seg of path) {
      if (!node.o || !(seg in node.o)) return [];
      const next = node.o[seg];
      node = (typeof next === 'string') ? { leaf: next } : next;
    }
    return node.o ? Object.keys(node.o) : [];
  };

  /* The context fields AiMY exposes. Fixed vocabulary: the left side of a
     mapping is ours, the right side is theirs. */

  /* ── Auto-match ──
     Nobody should meet an empty mapping table. The system reads the connector's
     schema, proposes a path for every context field it recognises, and marks
     each proposal as SUGGESTED until a person confirms it.

     What it deliberately does NOT do is hide the rest. A suggestion collapses
     nothing: every context field stays on screen with its own state, whether
     it is confirmed, suggested, unmapped or broken. Filtering the screen down
     to "just the uncertain ones" would make the fast path opaque, and the
     whole point of this surface is that you can see what it will do. */
  const MATCH_HINTS = {
    'Agent name':     [['assignee', 'name'], ['agent', 'name']],
    'Email address':  [['requester', 'email'], ['contact', 'email']],
    'Email domain':   [['requester', 'organization', 'domain'], ['contact', 'company', 'domain']],
    'Ticket number':  [['ticket', 'id']],
    'Priority level': [['ticket', 'priority']],
    'Ticket subject': [['ticket', 'subject']],
    'Company name':   [['requester', 'organization', 'name'], ['contact', 'company', 'name']],
    'Created at':     [['ticket', 'created_at']]
  };
  /* Confidence is honest rather than decorative: a proposal only counts as
     strong when the connector actually returns values for it. A path that
     resolves but comes back empty is exactly the case a person must look at. */
  function propose(crmId, ctx) {
    const tries = MATCH_HINTS[ctx] || [];
    for (const path of tries) {
      if (!walkPath(crmId, path).ok) continue;
      const s = samplesFor(crmId, path);
      return { path: path, confidence: s && s.length ? 'strong' : 'weak' };
    }
    return null;
  }

  const CONNECTIONS = [
    { id: 'fb-zendesk', product: 'FileBound Support', crm: 'Zendesk', crmId: 'zendesk',
      health: ['is-ok', 'Healthy'], last: '14 minutes ago', every: 'Every 15 minutes',
      window: 30, records: 12840,
      /* A mapping is a TREE. `kids` are fields whose value comes from inside
         their parent's: the domain lives in the email, so it is a child of the
         email rather than a second path that happens to look related. */
      /* Every shape the table can draw is in here, because a fixture that
         only exercises the easy row is how a surface ships looking finished
         and reads as broken on real data: a plain string, a two-level nest, a
         three-level nest, an id that resolves, and two coded fields whose
         numbers mean nothing until they are named. */
      maps: [
        { ctx: 'Agent name',     path: ['assignee', 'name'] },
        { ctx: 'Assigned agent', path: ['assignee', 'id'], idres: true },
        { ctx: 'Email address',  path: ['requester', 'email'], kids: [
          { ctx: 'Company',      path: ['requester', 'organization', 'name'], kids: [
            { ctx: 'Email domain', path: ['requester', 'organization', 'domain'] } ] } ] },
        { ctx: 'Ticket number',  path: ['ticket', 'id'], idres: true },
        { ctx: 'Ticket status',  path: ['ticket', 'status'],
          values: [['2', 'Open'], ['3', 'Pending'], ['4', 'Solved'], ['5', 'Closed']] },
        { ctx: 'Priority level', path: ['ticket', 'priority'],
          values: [['1', 'Low'], ['2', 'Normal'], ['3', 'High'], ['4', 'Urgent']] }
      ],
      criteria: [['Status', 'Solved'], ['Form', 'Customer Support']],
      range: ['2026-08-01', '2026-08-31'],
      runs: [
        ['31 Oct, 15:41', [['Status', 'Closed'], ['Form', 'Sales']], 'run', 'Running', 412],
        ['31 Oct, 14:14', [['Status', 'Solved'], ['Form', 'Customer Support']], 'ok', 'Succeeded', 1284],
        /* The 6th slot is only on failures. A parallel FAILURES array would
           drift from the runs it describes the first time either was edited —
           the same trap the `SRC` fixture fell into. */
        ['31 Oct, 13:58', [['Status', 'Open'], ['Form', 'Billing']], 'err', 'Failed', 0,
          { code: 'MAP_422_PATH_GONE', fix: 'mapping', affected: 0, runs: 1,
            why: 'Priority level maps to ticket.priority, which Zendesk returned as null on every record in the window. Nothing was written.' }],
        ['30 Oct, 22:10', [['Status', 'Solved']], 'err', 'Failed', 806,
          { code: 'RATE_429_THROTTLED', fix: 'retry', affected: 806, runs: 2,
            why: 'Zendesk throttled the pull at 806 of 2,090 records. The run stopped where it was; the rest were never read.' }]
      ] },

    { id: 'fb-freshdesk', product: 'FileBound Support', crm: 'FreshDesk', crmId: 'freshdesk',
      health: ['is-err', 'Token rejected'], last: '26 Jul', every: 'Every hour',
      window: 90, records: 4210,
      /* Deliberately broken: `contact.organization` does not exist in FreshDesk,
         whose equivalent is `contact.company`. This is what a renamed field on
         the connector's side looks like from in here. */
      maps: [
        { ctx: 'Agent name',    path: ['agent', 'name'], kids: [
          { ctx: 'Agent surname', derive: 'last' } ] },
        { ctx: 'Email address', path: ['contact', 'email'] },
        /* Deliberately broken and left at the TOP level, so the broken-path
           case is still on screen: `contact.organization` does not exist in
           FreshDesk, whose equivalent is `contact.company`. */
        { ctx: 'Email domain',  path: ['contact', 'organization', 'domain'] }
      ],
      criteria: [['Status', 'Open']],
      runs: [['26 Jul, 09:02', [['Status', 'Open']], 'err', 'Failed', 0,
        { code: 'AUTH_401_TOKEN_EXPIRED', fix: 'reconnect', affected: 0, runs: 14,
          why: 'The token FreshDesk issued on 4 Mar was revoked. Every run since has failed the same way and nothing has been read.' }]] },

    { id: 'ks-zendesk', product: 'Knowledge Search', crm: 'Zendesk', crmId: 'zendesk',
      health: ['is-warn', '3 records skipped'], last: '2 hours ago', every: 'Every 6 hours',
      window: 30, records: 340,
      maps: [{ ctx: 'Ticket subject', path: ['ticket', 'subject'] }],
      criteria: [], runs: [] }
  ];
  const connById = (id) => CONNECTIONS.filter((c) => c.id === id)[0];

  /* ── The product, and the connectors under it ──
     A product is what the client actually calls the thing — FileBound Support.
     It reads from one or more CRMs, and the only thing that genuinely differs
     per CRM is the field mapping, which is why the CRM picker lives inside
     Config and nowhere else. */
  /* ── WHICH CLIENT, AND WHICH OF THEIR PRODUCTS ──
     The scope bar read `Client CXS > FileBound Support` with the client as
     dead text and only the product pickable. That hid a straight
     contradiction: the hierarchy puts FileBound Support under UPLAND, not CXS.
     A scope nobody can change is a scope nobody checks, and this one had been
     wrong on screen the whole time.

     Both are pickers now, and the product list is derived from the client
     rather than from every connection there is — so the pair on screen is
     always a pair that exists. */
  const CLIENT_LIST = nodesOfType('Client');

  /* Every product under one client, from the tree. The tree is the authority
     on what belongs to whom; CONNECTIONS only says which of them we read. */
  function productsOfClient(client) {
    const out = [];
    (function walk(ns, inside) {
      ns.forEach((n) => {
        const here = inside || (n.type === 'Client' && n.name === client);
        if (here && n.type === 'Product') out.push(n.name);
        if (n.kids) walk(n.kids, here);
      });
    })(TREE, false);
    return out;
  }
  /* Only products we actually have a connection for can be configured. The
     rest exist in the hierarchy and have nothing to say on this page. */
  const connectedOf = (client) => productsOfClient(client)
    .filter((p) => CONNECTIONS.some((c) => c.product === p));
  const clientOfProduct = (prod) =>
    CLIENT_LIST.filter((cl) => productsOfClient(cl).indexOf(prod) > -1)[0] || CLIENT_LIST[0];

  /* Default to a client that has something to show, so nobody lands on an
     empty page because the alphabet put an unconfigured client first. */
  /* -- LAND WHERE THE WORK IS --
     The rail row says "3 failed runs" and opening it used to land on the first
     client that had anything connected -- CXS, whose Knowledge Search
     connector has never run at all. So the rail advertised three failures and
     the page it opened showed none of them: the failures are on Upland, one
     client over, and nothing on screen said so.

     A count on a link is a promise about what the link opens. These two now
     read the same model in the same order -- worst first -- so following the
     warning arrives at the warning. An explicit `?sc=` still wins; this only
     decides where you land when you have not said. */
  const troubleOf = (prod) => {
    const list = connsOf(prod);
    return failures().filter((f) => list.indexOf(f.conn) > -1).length
         + list.reduce((a, c) => a + mapCounts(c).broken, 0);
  };
  function clientOf(st) {
    if (CLIENT_LIST.indexOf(st.sc) > -1) return st.sc;
    const connected = CLIENT_LIST.filter((cl) => connectedOf(cl).length);
    const needy = connected.filter((cl) =>
      connectedOf(cl).some((p) => troubleOf(p)))[0];
    return needy || connected[0] || CLIENT_LIST[0];
  }
  const PRODUCT_LIST = CONNECTIONS.map((c) => c.product).filter((v, i, a) => a.indexOf(v) === i);
  const connsOf = (prod) => CONNECTIONS.filter((c) => c.product === prod);
  /* Always a real product. A settings page that will not render until you have
     answered a question is a page with a gate in front of it. */
  /* Scoped to the chosen client. A product from another client in the address
     bar resolves to this client's first rather than rendering a pair that does
     not exist. */
  function prodOf(st) {
    const list = connectedOf(clientOf(st));
    if (list.indexOf(st.sp) > -1) return st.sp;
    return list.filter((p) => troubleOf(p))[0] || list[0];
  }
  function crmOf(st) {
    const list = connsOf(prodOf(st));
    return list.filter((c) => c.crmId === st.crm)[0] || list[0];
  }
  /* The product's primary connector carries the criteria and the run window:
     a sync is triggered for a PRODUCT, and the design says so by disabling the
     product field inside the trigger form rather than offering it again. */
  const primaryOf = (st) => connsOf(prodOf(st))[0];

  /* ── Failures, DERIVED ──
     Read off the runs they describe rather than authored beside them. A
     failure list that disagrees with the history it came from is worse than no
     failure list, and the only way to guarantee it cannot is to not store it. */
  function failures(connId) {
    const out = [];
    CONNECTIONS.filter((c) => !connId || c.id === connId).forEach((c) => {
      c.runs.forEach((r) => {
        if (r[2] !== 'err' || !r[5]) return;
        out.push({ conn: c, when: r[0], criteria: r[1], count: r[4],
                   code: r[5].code, why: r[5].why, fix: r[5].fix,
                   affected: r[5].affected, runs: r[5].runs });
      });
    });
    return out;
  }
  const failCount = (connId) => failures(connId).length;

  /* ── The endpoints ──
     What the console calls "Knowledge Enablement Webhook Settings" is two
     different things wearing one heading: the WORKFLOW (which sources enrich,
     and when) and the CREDENTIALS it runs on. They are split here — enablement
     is a switch you throw, an endpoint is a secret you rotate, and the
     confirmation each deserves is nothing like the other's.

     `last` reuses the runs table's [state, label] shape so `pill()` takes it
     unchanged, and carries three states on purpose: succeeded, failed, and
     never called — a brand new endpoint is not a healthy one. */
  const ENDPOINTS = {
    'fb-zendesk': { url: 'https://api.aimy.ai/v1/knowledge/filebound-zendesk',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6', rotated: ['4 Mar 2026', 'A. Mahfouz'],
      last: ['6 Jun 2026, 14:02', 'is-ok', 'Succeeded', '212ms'], calls: 4180 },
    'fb-freshdesk': { url: 'https://api.aimy.ai/v1/knowledge/filebound-freshdesk',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6', rotated: ['4 Mar 2026', 'A. Mahfouz'],
      last: ['26 Jul 2026, 09:02', 'is-err', '401 Unauthorised', '88ms'], calls: 0 },
    'ks-zendesk': { url: 'https://api.aimy.ai/v1/knowledge/knowledge-search',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6', rotated: ['12 May 2026', 'N. Wael'],
      last: [null, 'is-mute', 'Never called', ''], calls: 0 }
  };

  /* ── Enablement ──
     Per data source, because that is the grain the enrichment actually runs
     at. `n` is what it has produced, so turning one off has a stated cost. */
  const ENABLE = [
    { id: 'tickets', name: 'Tickets', on: true, n: 12840,
      d: 'Every synced ticket is read for what it settles.' },
    { id: 'macros', name: 'Macros and canned replies', on: true, n: 118,
      d: 'The replies your team already trusts, promoted to drafts AiMY can offer.' },
    { id: 'attach', name: 'Attachments', on: false, n: 0,
      d: 'PDFs and documents on a ticket. Off: nothing attached has been read.' },
    { id: 'notes', name: 'Internal notes', on: false, n: 0,
      d: 'Agent-only notes — written for colleagues, not customers.' }
  ];

  /* Everything already in a fixture was authored by a person, so it is
     confirmed. Every context field NOT yet mapped gets a proposal appended, so
     the table always shows the full vocabulary and never an empty page. */
  /* Every node in one connection's tree, depth-first, each with its address
     (`"2"`, `"2.0"`) and its parent. One walk, used by the renderer, the
     counters and the search index — so none of them can disagree about what
     the tree contains. */
  function mapNodes(c) {
    const out = [];
    (function walk(list, prefix, depth, parent) {
      list.forEach((m, i) => {
        const addr = prefix ? prefix + '.' + i : String(i);
        out.push({ m: m, addr: addr, depth: depth, parent: parent });
        if (m.kids && m.kids.length) walk(m.kids, addr, depth + 1, m);
      });
    })(c.maps, '', 0, null);
    return out;
  }
  /* The node at an address, and the list it lives in — deleting needs both. */
  function nodeAt(c, addr) {
    const parts = String(addr).split('.').map(Number);
    let list = c.maps, node = null, parent = null;
    for (let i = 0; i < parts.length; i++) {
      parent = node; node = list[parts[i]];
      if (!node) return null;
      if (i < parts.length - 1) list = node.kids || (node.kids = []);
    }
    return { node: node, list: list, at: parts[parts.length - 1], parent: parent };
  }

  CONNECTIONS.forEach((c) => {
    c.maps.forEach((m) => { m.state = 'confirmed'; (m.kids || []).forEach((k) => { k.state = 'confirmed'; }); });
    /* -- THE LIST IS WHAT SOMEBODY BUILT --
       There was a fixed vocabulary of eight context fields, and every one a
       connection had not mapped was pushed in as an empty row. Two problems,
       and the second is the worse one.

       It filled a fresh connector with eight rows nobody asked for, each
       reading "Not mapped" -- a page of homework presented as a page of
       settings, and none of it necessarily relevant to this product.

       And it decided what a person is allowed to call things. "Agent name"
       and "Company name" are one team's words. A context field is whatever
       this product needs the CRM to answer, and the only one who knows that
       is the person configuring it.

       So nothing is pushed. What is in the list is what somebody put there,
       and an empty connector says so in one sentence instead of eight rows. */
  });

  /* Counted over the whole tree, because a broken subfield is exactly as
     broken as a broken top-level field and hiding it in the total would be the
     one place this table is allowed to lie. */
  const mapCounts = (c) => {
    const all = mapNodes(c).map((n) => n.m);
    return {
      confirmed: all.filter((m) => m.state === 'confirmed').length,
      suggested: all.filter((m) => m.state === 'suggested').length,
      unmapped:  all.filter((m) => m.state === 'unmapped').length,
      broken:    all.filter((m) => !m.derive && m.path && m.path.length
                                   && !walkPath(c.crmId, m.path).ok).length,
      total:     all.length
    };
  };

  /* Match count. Every criterion narrows, so the number falls as you add one.
     Deterministic from the criteria themselves, because a figure that moved on
     its own would be worse than no figure. */
  /* ANY genuinely selects more than ALL, and the figure has to move or the
     control is decoration. Intersecting filters narrow; a union of the same
     filters widens toward the sum of their individual shares. */
  /* The history's own date format, so a run written now sits in the same
     column as the ones that came with the fixture. */
  let RANGE_ERR = false;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const pad2 = (n) => (n < 10 ? '0' : '') + n;
  function stampNow() {
    const d = new Date();
    return d.getDate() + ' ' + MONTHS[d.getMonth()] + ', '
         + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }

  /* "1 Oct - 31 Oct", or one end of it when only one is set. An ISO pair in a
     chip is a date a person has to decode. */
  function rangeLabel(r) {
    const one = (v) => {
      if (!v) return '';
      const p = String(v).split('-');
      if (p.length !== 3) return v;
      return String(+p[2]) + ' ' + (MONTHS[+p[1] - 1] || p[1]);
    };
    if (r[0] && r[1]) return one(r[0]) + ' \u2013 ' + one(r[1]);
    return r[0] ? 'from ' + one(r[0]) : 'up to ' + one(r[1]);
  }

  function matchCount(c) {
    if (!c.criteria.length) return c.records;
    const share = c.criteria.map((k, i) => (i === 0 ? 0.42 : 0.61));
    if ((c.join || 'all') === 'all') {
      return Math.floor(c.records * share.reduce((a, b) => a * b, 1));
    }
    /* Union by inclusion-exclusion on independent shares: 1 - product of the
       complements. Always at least as large as the intersection. */
    const none = share.reduce((a, s) => a * (1 - s), 1);
    return Math.floor(c.records * (1 - none));
  }

  const CRITERIA_VOCAB = {
    Status: ['Open', 'Pending', 'Solved', 'Closed'],
    Form: ['Customer Support', 'Billing', 'Sales', 'Onboarding'],
    Priority: ['Low', 'Normal', 'High', 'Urgent'],
    Brand: ['FileBound', 'InterFAX', 'Kapost']
  };

  /* ═══ THE OTHER MODULES ═══
     The `SRC` connector fixture that used to live here went with the sync
     module when field mapping and sync folded into one connection contract.
     It survived the merge unreferenced for a while, which is how a fixture
     starts disagreeing with the thing it once described. */

  /* Five, not three. A card grid never shows its wrap at three and the filters
     have nothing to filter, so the surface reads as finished when it is not. */
  const PEOPLE = [
    /* A grant is a ROLE, a scope TYPE, and the VALUES of that type it reaches.
       It was a flat triple, which could only ever say one value — so "Super
       Admin on Product" reaching two products had to be two grants that looked
       like two different things. The design draws it as one collapsible group
       with a chip per value, which is the shape the data always wanted. */
    { id: 'p1', name: 'Alex Smith', mail: 'alex.smith@flairstech.com', title: 'Solution Engineer',
      s: ['is-ok', 'Active'], admin: true,
      grants: [{ r: 'Super Admin', t: 'Product', v: ['InterFAX Support', 'Kapost Support'] },
               { r: 'QA Manager', t: 'Client', v: ['CXS'] }] },
    { id: 'p2', name: 'Saly Tarek', mail: 'saly.tarek@flairstech.com', title: 'Support Lead',
      s: ['is-warn', 'Invite pending'], grants: [] },
    { id: 'p3', name: 'A. Mahfouz', mail: 'a.mahfouz@flairstech.com', title: 'Head of Delivery',
      s: ['is-ok', 'Active'], admin: true,
      grants: [{ r: 'Admin', t: 'Organisation', v: ['FlairsTech'] }] },
    { id: 'p4', name: 'Nour Wael', mail: 'nour.wael@flairstech.com', title: 'Product Design',
      s: ['is-ok', 'Active'],
      grants: [{ r: 'Contributor', t: 'Client', v: ['Upland'] },
               { r: 'Read Only', t: 'Client', v: ['CXS'] }] },
    { id: 'p5', name: 'Karim Fouad', mail: 'karim.fouad@upland.com', title: 'QA Manager \u00b7 Upland',
      s: ['is-ok', 'Active'],
      grants: [{ r: 'QA Manager', t: 'Product', v: ['FileBound Support'] }] }
  ];
  /* Which role groups are open. Collapsed by default: a card with three roles
     and four chips each is a wall, and the role plus its scope type is the
     summary that answers "what can this person reach" without opening it. */
  const GOPEN = new Set(['p1:0']);
  /* The scope pickers read the SAME tree the targeting picker does, so a grant
     can never name a scope the hierarchy does not have. */
  const SCOPE_TYPES = ['Organisation', 'Client', 'Business Unit', 'Product', 'Team'];
  function nodesOfType(t) {
    const out = [];
    (function walk(ns) { ns.forEach((n) => { if (n.type === t) out.push(n.name);
      if (n.kids) walk(n.kids); }); })(TREE);
    return out;
  }
  const initialsOf = (n) => n.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  const ROLES = [
    ['Super Admin', 'Everything, on every scope it is granted for'],
    ['Admin', 'Manage skills, sources and people. Cannot change billing'],
    ['Manager', 'Manage skills and sources on their own scope'],
    ['QA Manager', 'Read everything, write reviews'],
    ['Contributor', 'Add and edit their own skills'],
    ['Read Only', 'Read. Nothing else']
  ];

  const AGENTS = [
    { id: 'copilot', name: 'Copilot', d: 'Internal support agent. 4 skills, 2 collections.', on: true },
    { id: 'sales', name: 'Sales', d: 'Internal. 2 skills, 1 collection.', on: true },
    { id: 'voice', name: 'Voice', d: 'Client-facing. 1 skill, 1 collection.', on: false }
  ];

  const COLS = [
    { id: 'policies', name: 'Policies', d: 'Owned by A. Mahfouz · 1,204 documents', on: true },
    { id: 'support', name: 'Support', d: 'Owned by N. Wael · 118 documents', on: true },
    { id: 'sales', name: 'Sales', d: 'Owned by Sales Ops · 340 documents', on: false },
    { id: 'legal', name: 'Legal', d: 'Owned by Legal · not entitled to your plan', on: false, locked: true }
  ];

  /* ═══ MODULES ═══
     `tier` is what the workspace is entitled to. Unowned modules stay in the
     rail and render at full contrast with dead controls, because a module you
     cannot read is a module you will never buy. */
  /* ── Grouped by WHO DOES THE WORK ──
     The previous build split by what a thing IS (AI Controls / Organization /
     Operations) and rejected the console's Personal | Workspace Admin split on
     the grounds that it forces every capability to exist twice. That objection
     still stands and this does not reopen it: Client and Admin is not the same
     capability under two owners — no module appears in both groups. It is the
     same WHAT split, ordered by whose job it is, which is the question someone
     opening settings is actually asking.

     `scope: 'conn'` marks the five facets of one connection. They are separate
     rail items because the brief asks for them separately, but they share one
     scope key (`?conn=`) so moving between them never silently re-points you at
     a different connector — which was the whole of the earlier objection to
     splitting mapping from sync, and it is answered by the scope, not by the
     merge.

     `off` keeps a module routable and in the search index while taking it out
     of the rail. That is what "defer, do not delete" means mechanically. */
  const MODULES = [
    /* ── WHY THIS IS THREE ITEMS AND NOT FIVE ──
       Failures and APIs were rail items of their own and neither earned one.

       A FAILURE IS A SYNC RUN. It is the same row of the same history table,
       read a second time on a second page — and the page that could act on it
       was the one you had just left. Sync now tells the whole story in the
       order it happens: what to pull, over what window, what broke, what
       happened, and what gets pruned afterwards.

       AN ENDPOINT IS WHAT ENABLEMENT RUNS ON. Splitting the switch from the
       secret gave two pages that are meaningless apart: the toggles do nothing
       without a live endpoint, and the endpoint exists only to serve them. The
       design has them under one heading and the design is right.

       Both ids still resolve, through ALIAS. */
    { g: 'Client', id: 'config',    name: 'Connections',          scope: 'prod' },
    /* "Enablement", not "Knowledge enablement". It sits under CLIENT beside
       Config and Sync, and the context makes the first word redundant — it was
       also the one name in the rail long enough to truncate, which is a worse
       cost than the word was worth. */
    { g: 'Client', id: 'enable',    name: 'Enablement',           scope: 'prod' },

    { g: 'Admin',  id: 'access',    name: 'User & access', wide: true },
    { g: 'Admin',  id: 'skills',    name: 'Skills' },

    /* Deferred: reachable by URL and findable in the palette, absent from the
       rail. Not deleted — that is the difference between deferring a module and
       dropping it. */
    { g: 'Admin',  id: 'agents',    name: 'Agents and tools', off: true },
    { g: 'Admin',  id: 'grounding', name: 'Grounding', off: true },
    { g: 'Admin',  id: 'plan',      name: 'Entitlements and plan', off: true },
    { g: 'Admin',  id: 'audit',     name: 'Audit trail', tier: 'Enterprise', off: true }
  ];
  const GROUPS = ['Client', 'Admin'];

  /* ── Old ids, carried across rather than 404ed ──
     Every `settings.html?m=…` that has been pasted anywhere comes through here.
     Four of them name things that are now SECTIONS rather than destinations, so
     they resolve to the module that holds the section — `?m=retention` lands on
     Sync, where the threshold sits beside the runs it prunes. Landing on the
     page that contains what you asked for beats landing on a page that no
     longer exists. */
  const ALIAS = { connections: 'config', people: 'access', webhooks: 'enable',
                  apis: 'enable', failures: 'config', sync: 'config',
                  retention: 'config', roles: 'access', hierarchy: 'access' };
  /* Several of those name a SECTION, and sections are pages now — so the ones
     that do land on the page holding them rather than on the module's first.
     `?m=retention` used to mean "Sync, scroll to find it"; it means the page
     the threshold is on. */
  const ALIAS_SEC = { webhooks: 'webhooks', apis: 'webhooks', failures: 'sync',
                      sync: 'sync', retention: 'relevance', people: 'people',
                      roles: 'roles', hierarchy: 'scopes' };
  const aliasOf = (id) => ALIAS[id] || id;
  const moduleById = (id) => MODULES.filter((m) => m.id === aliasOf(id))[0];

  /* ═══ STATE — THE CONSOLE OWNS IT ═══
     This file used to read the address bar and write it back, rebuilding the
     query string from scratch. On a page of its own that was correct. Sharing
     a page with the corpus it is not: the corpus owns twenty-eight keys and
     this rebuild knew four, so every filter you had set survived exactly until
     you opened a module — and the loss was silent, which is the worst way for
     a URL to be wrong.

     So there is one reader and one writer, both in knowledge.js, and this file
     asks. Every `patch({ ... })` call site below is untouched; only where the
     function comes from has moved. The fallback state exists so a render that
     somehow arrives before `init` cannot throw — it renders Skills. */
  /* ── The in-module filter set ──
     `f=role:Admin,status:Active` in, an object out. Values are stored raw and
     read back with `decodeURIComponent`, so a role called "Read Only" survives
     the round trip and a value containing a comma cannot split the set. */
  function readF(st) {
    const out = {};
    (st.f || '').split(',').filter(Boolean).forEach((pair) => {
      const i = pair.indexOf(':');
      if (i > 0) out[pair.slice(0, i)] = pair.slice(i + 1);
    });
    return out;
  }
  /* Values are stored RAW. `serialize` percent-encodes the whole query string
     and then puts commas and colons back as themselves, so encoding here too
     turned every space into `%2520`. The two separators are the only reserved
     characters and no role, status or scope type contains one; a free-text
     search does, which is why `q` strips them rather than escaping them. */
  function withF(st, key, val) {
    const f = readF(st);
    const clean = String(val == null ? '' : val).replace(/[,:]/g, ' ').trim();
    if (!clean || f[key] === clean) delete f[key]; else f[key] = clean;
    return Object.keys(f).map((k) => k + ':' + f[k]).join(',');
  }
  /* One dropdown. `all` is the absence of the key, never a value of it, so a
     filter set with nothing chosen serialises to nothing at all. */
  function filterSel(st, key, label, opts) {
    const f = readF(st);
    const cur = f[key] || '';
    return `
      <div class="set2-fsel">
        <select class="set2-fsel-s" data-f="${esc(key)}" aria-label="${esc(label)}">
          <option value=""${cur ? '' : ' selected'}>${esc(label)}</option>
          ${opts.map((o) => `<option value="${esc(o)}"${o === cur ? ' selected' : ''}>${esc(o)}</option>`).join('')}
        </select>
        ${I.down}
      </div>`;
  }

  let FQ_T = 0;
  let API = null;
  const FALLBACK = { m: 'config', skill: '', sp: '', crm: '', f: '', lens: 'eff' };
  function readURL() { return API ? API.readURL() : FALLBACK; }
  function patch(changes) { if (API) API.patch(changes); }
  function render() { if (API) API.render(); }
  const lensName = { yours: 'yours', org: 'org', eff: 'effective' };

  /* ═══ ATOMS ═══ */
  const pill = (k, t) => `<span class="set2-pill ${k}"><i></i>${esc(t)}</span>`;
  const ck = (st, label) =>
    `<button class="set2-ck" role="checkbox" aria-checked="${st}" aria-label="${esc(label)}" type="button" tabindex="-1">${st === 'mixed' ? I.dash : I.tick}</button>`;
  const toggle = (on, label, data) => `
    <label class="toggle" title="${esc(label)}">
      <input type="checkbox" ${on ? 'checked' : ''} aria-label="${esc(label)}" ${data || ''}>
      <span class="toggle-track"></span><span class="toggle-thumb"></span>
    </label>`;

  function row(o) {
    const tag = o.go ? 'button' : 'div';
    return `<${tag} class="set2-row${o.off ? ' is-off' : ''}${o.locked ? ' is-locked' : ''}"
      ${o.go ? `type="button" data-go="${esc(o.go)}"` : ''}>
      ${o.ico || ''}
      <span class="set2-row-main">
        <span class="set2-row-n">${esc(o.name)}${o.tagHtml || ''}</span>
        ${o.d ? `<span class="set2-row-d">${esc(o.d)}</span>` : ''}
      </span>
      <span class="set2-row-end">${o.end || ''}${o.locked ? I.lock : ''}${o.go ? I.chev : ''}</span>
    </${tag}>`;
  }

  /* ═══ LADDER ═══ */
  function ladder(s, lens) {
    const win = resolve(s.chain, lens, s.lock);
    const filled = s.chain.filter((c) => c && c.val).length;
    const head = win === -1
      ? `<span class="set2-lad-lv">Nothing of yours applies here</span>`
      : `<span class="set2-lad-lv">${esc(LEVELS[win])}</span>${pill('is-ok', 'Applies')}`;
    return `
      <div class="set2-lad" data-lad>
        <button class="set2-lad-hd" type="button" data-lad-t aria-expanded="false">
          ${head}
          <span class="set2-lad-more set2-num">${filled} of 6 levels set</span>${I.down}
        </button>
        <div class="set2-lad-bd">
          ${LEVELS.map((lv, i) => {
            const c = s.chain[i] || {};
            const empty = !c.val;
            const blocked = s.lock != null && i > s.lock && !empty;
            const beat = !empty && i !== win;
            return `<div class="set2-stop ${empty ? 'is-empty' : ''} ${beat ? 'is-beat' : ''} ${i === win ? 'is-win' : ''}">
              <span class="set2-stop-lv">${esc(lv)}</span>
              <span class="set2-stop-v">${empty ? 'Nothing set' : esc(c.val)}</span>
              <span class="set2-stop-end">
                ${i === win ? pill('is-ok', 'Applies') : ''}
                ${blocked ? I.lock + pill('is-mute', 'Locked by Organization') : ''}
                ${!empty && !blocked && i !== win ? `<span class="set2-from">${esc(c.by)} · ${esc(c.when)}</span>` : ''}
              </span>
            </div>`;
          }).join('')}
        </div>
      </div>`;
  }

  /* ═══ TARGETING PICKER ═══ */
  function walk(node, depth, out, sel, filter) {
    const kids = node.kids || [];
    const isLeaf = !kids.length;
    const hit = !filter || node.name.toLowerCase().indexOf(filter) >= 0;
    const kidRows = [];
    if (kids.length && (OPEN.has(node.id) || filter)) kids.forEach((k) => walk(k, depth + 1, kidRows, sel, filter));
    if (filter && !hit && !kidRows.length) return;
    const st = nodeState(node, sel);
    const lv = leavesOf(node);
    out.push(`<div class="set2-node is-l${depth}${isLeaf ? '' : ' is-grp'}${OPEN.has(node.id) ? ' is-open' : ''}"
      data-node="${esc(node.id)}" role="treeitem" tabindex="-1" aria-level="${depth}"
      aria-selected="${st === 'true'}"${isLeaf ? '' : ` aria-expanded="${OPEN.has(node.id)}"`}>
      ${isLeaf ? '<span class="set2-exp is-none"></span>' : I.caret}
      ${ck(st, node.name)}
      <span class="set2-node-n">${esc(node.name)}</span>
      ${isLeaf ? '' : `<span class="set2-node-ct">${lv.filter((l) => sel.has(l.id)).length} of ${lv.length}</span>`}
    </div>`);
    out.push.apply(out, kidRows);
  }

  function picker(s, filter) {
    const sel = SEL[s.id];
    const rows = [];
    TREE.forEach((n) => walk(n, 1, rows, sel, filter || ''));
    const zero = sel.size === 0;
    return `
      <div class="set2-pick" data-pick="${esc(s.id)}">
        <div class="set2-pick-hd">
          <input class="set2-fld" type="search" placeholder="Search clients, products, teams or people…" data-pfilter value="${esc(filter || '')}">
        </div>
        <div class="set2-pick-bd" role="tree" aria-multiselectable="true" aria-label="What this skill reaches">${rows.join('')}</div>
        <div class="set2-pick-ft${zero ? ' is-zero' : ''}" data-foot>
          ${zero
            ? '<span>Reaches nothing. A skill with no targets can never fire.</span>'
            : `<span>Reaches <b class="set2-num">${sel.size}</b> of <span class="set2-num">${LEAF_TOTAL}</span></span>`}
        </div>
      </div>`;
  }

  /* ═══ MODULE BODIES ═══ */
  const M = {};

  /* Which products a skill actually reaches, read off the same tree the
     targeting picker writes to — so the Products filter can never offer a
     product no skill was ever granted on. */
  const PRODUCTS = () => nodesOfType('Product');
  function productsOf(s) {
    const sel = SEL[s.id];
    const out = [];
    (function walk(ns) {
      ns.forEach((n) => {
        if (n.type === 'Product' && leavesOf(n).some((l) => sel && sel.has(l.id))) out.push(n.name);
        if (n.kids) walk(n.kids);
      });
    })(TREE);
    return out;
  }
  const agentsOf = (s) => AGENTS.filter((a) => s.targets.indexOf(a.id) > -1).map((a) => a.name);

  /* ══ SKILLS ════════════════════════════════════════════════════════════
     A table, because that is what the screen is: three facts per skill and
     rather a lot of skills. The list it replaces split them into "From the
     organization" and "Yours", which put the same question — does this apply
     to me — in two places and made the count at the top of the page wrong for
     both halves.

     Where it came from is a COLUMN now, so it sorts and filters like every
     other fact rather than being a wall you have to pick a side of. */
  const SORTS = {
    name:   (a, b) => a.name.localeCompare(b.name),
    desc:   (a, b) => a.desc.localeCompare(b.desc),
    status: (a, b) => standing(a, 'eff')[1].localeCompare(standing(b, 'eff')[1])
  };

  function sortTh(st, key, label) {
    const f = readF(st);
    const on = f.sort === key || f.sort === key + '!';
    const desc = f.sort === key + '!';
    return `<button class="set2-th" type="button" data-sort="${esc(key)}"
      aria-sort="${on ? (desc ? 'descending' : 'ascending') : 'none'}">
      ${esc(label)}<span class="set2-th-a${on ? ' is-on' : ''}">${on ? (desc ? '\u2193' : '\u2191') : '\u21c5'}</span>
    </button>`;
  }

  M.skills = function (st) {
    if (st.skill && skillById(st.skill)) return skillDetail(skillById(st.skill), st);
    const f = readF(st);
    const q = (f.q || '').toLowerCase();

    let list = SKILLS.filter((s) => {
      if (q && (s.name + ' ' + s.desc).toLowerCase().indexOf(q) < 0) return false;
      if (f.agent && agentsOf(s).indexOf(f.agent) < 0) return false;
      if (f.product && productsOf(s).indexOf(f.product) < 0) return false;
      return true;
    });
    const narrowed = list.length !== SKILLS.length;
    const skey = (f.sort || '').replace('!', '');
    if (SORTS[skey]) {
      list = list.slice().sort(SORTS[skey]);
      if (f.sort.slice(-1) === '!') list.reverse();
    }

    return `
      ${/* No section heading. This module has exactly one section, and its
            heading was the word already set as the page title two lines above
            it -- "Skills" under "Skills". The count it carried moves to the
            header, where it qualifies the title instead of repeating it. */ ''}
      <section class="set2-sec is-headless">
        <div class="set2-fbar">
          ${filterSel(st, 'agent', 'All agents', AGENTS.map((a) => a.name))}
          ${filterSel(st, 'product', 'All products', PRODUCTS())}
          <input class="set2-fld set2-fbar-q" type="search" placeholder="Search by skill name\u2026"
                 value="${esc(f.q || '')}" data-f-q aria-label="Search by skill name">
          <span class="set2-fbar-end">
            <button class="btn btn-ghost btn-sm" type="button" data-example>Download example</button>
            <button class="btn btn-brand btn-sm" type="button" data-new>New skill</button>
          </span>
        </div>

        ${list.length ? `
        <div class="set2-tbl" role="table">
          <div class="set2-tbl-hd" role="row">
            ${sortTh(st, 'name', 'Name')}
            ${sortTh(st, 'desc', 'Description')}
            ${sortTh(st, 'status', 'Status')}
          </div>
          ${list.map((s) => {
            const [k, t] = standing(s, 'eff');
            return `
            <button class="set2-tbl-r${s.on ? '' : ' is-off'}" type="button" role="row" data-go="skill:${esc(s.id)}">
              <span class="set2-tbl-n" role="cell">
                ${s.trigger === 'always' ? I.bolt : s.trigger === 'manual' ? I.hand : I.doc}
                <b>${esc(s.name)}</b>
                <span class="set2-from${s.from === 'Organization' ? ' is-org' : ''}">${esc(s.from)}</span>
              </span>
              <span class="set2-tbl-d" role="cell">${esc(s.desc)}</span>
              <span class="set2-tbl-s" role="cell">${pill(k, t)}${I.chev}</span>
            </button>`;
          }).join('')}
        </div>` : narrowed
          ? `<div class="set2-empty"><b>No skill matches</b>Nothing fits that agent, product and name at once.
              <button class="btn btn-ghost btn-sm" type="button" data-f-clear style="margin-top:0.5rem">Clear filters</button></div>`
          : `<div class="set2-empty"><b>No skills yet</b>Create the first one to get started.</div>`}
      </section>`;
  };

  function skillDetail(s, st) {
    const [k, t] = standing(s, st.lens);
    const raw = RAW.has(s.id);
    return `
      <button class="set2-back" type="button" data-back>&larr; Skills</button>
      <div class="set2-sec-h" style="margin-bottom:0">
        <h1 class="set2-title" style="font-size:var(--ty-title)">${esc(s.name)}</h1>
        <span class="set2-sec-end">${pill(k, t)}${toggle(s.on, 'Enable ' + s.name, `data-skill-on="${esc(s.id)}"`)}</span>
      </div>
      <div class="set2-bar">
        <div class="set2-scope">
          <span class="set2-scope-i">${esc(s.from)}</span><span class="set2-scope-s">&middot;</span>
          <span class="set2-scope-i">${esc(TRIGGER[s.trigger])}</span><span class="set2-scope-s">&middot;</span>
          <span class="set2-scope-i">${esc(s.by)}, ${esc(s.when)}</span><span class="set2-scope-s">&middot;</span>
          <span class="set2-scope-i set2-num">v${s.v}</span>
        </div>
      </div>

      <section class="set2-sec" id="st-precedence">
        <div class="set2-sec-h"><h2 class="set2-sec-t">Precedence</h2></div>
        ${ladder(s, st.lens)}
      </section>

      <section class="set2-sec" id="st-instructions">
        <div class="set2-sec-h"><h2 class="set2-sec-t">Instructions</h2>
          <span class="set2-sec-end">
            <span class="set2-view">
              <button class="set2-view-b${raw ? '' : ' is-on'}" type="button" data-sview="pretty" data-sid="${esc(s.id)}" aria-label="Rendered">${I.eye}</button>
              <button class="set2-view-b${raw ? ' is-on' : ''}" type="button" data-sview="raw" data-sid="${esc(s.id)}" aria-label="Source">${I.code}</button>
            </span>
          </span></div>
        <div class="set2-body${raw ? ' is-raw' : ''}">${raw ? esc(toMarkdown(s)) : esc(s.body)}</div>
      </section>

      <section class="set2-sec" id="st-reach">
        <div class="set2-sec-h"><h2 class="set2-sec-t">Reach</h2></div>
        ${picker(s, FILTER[s.id])}
      </section>`;
  }

  M.agents = () => `
    <section class="set2-sec">
      <div class="set2-sec-h"><h2 class="set2-sec-t">Agents</h2></div>
      <div class="set2-rows">${AGENTS.map((a) => row({
        ico: I.bolt, name: a.name, d: a.d, off: !a.on,
        end: toggle(a.on, 'Enable ' + a.name)
      })).join('')}</div>
    </section>`;

  M.grounding = () => `
    <section class="set2-sec">
      <div class="set2-sec-h"><h2 class="set2-sec-t">Collections</h2></div>
      <div class="set2-rows">${COLS.map((c) => row({
        ico: I.doc, name: c.name, d: c.d, off: !c.on, locked: c.locked,
        end: c.locked ? '' : toggle(c.on, 'Ground on ' + c.name)
      })).join('')}</div>
      <div class="set2-note" style="margin-top:0.75rem">Uploading documents moved to the Console. This decides which collections an agent may stand on, not what is in them.</div>
    </section>`;

  /* ══ USER & ACCESS ═════════════════════════════════════════════════════
     Was three rail items — People, Roles, Hierarchy — which split one question
     across three pages: a grant is a ROLE on a SCOPE held by a PERSON, and you
     cannot check whether it is right while looking at only one of the three.

     A card per person, each carrying its grants in full. The role name alone
     ("Super Admin") is the half people read and the scope is the half that
     matters, so the two are never separated: `Super Admin` on `Product
     InterFAX Support` is a different grant from the same role on the
     organisation, and a list that prints only the first is lying by omission.

     NO ROLE / STATUS / ACCESS FILTERS IN THIS PASS. They belong on this
     surface and the screenshot has them, but a filter has to write to the URL
     to be honest here, and a dropdown that narrows nothing is the exact defect
     this file spent a paragraph removing from the old filter row. Five people
     do not need them; fifty will, and they arrive with their query keys. */
  /* Selection is deliberately NOT in the URL: ticking three cards is a gesture
     mid-operation, and restoring it on a fresh load would restore an intention
     the reader no longer has. */
  const PICKED = new Set();

  /* ══ THE ROLE PICKER ═══════════════════════════════════════════════════
     Three steps, one panel, with a way back at each: ROLE, then the KIND of
     scope, then the scopes themselves. They are one popover replacing its own
     contents, so the anchor never moves and the card underneath never reflows.

     Values are multi-select and the panel stays open while you pick, because
     granting Super Admin on four products is one decision and re-opening the
     menu four times would make it read as four.

     `bulk` aims the same picker at everyone ticked. The operation is
     identical; only the target is plural. */
  let RPICK = null;
  const personById = (id) => PEOPLE.filter((p) => p.id === id)[0];

  function paintRPick(anchor) {
    if (!RPICK) { closePop(); return; }
    const who = RPICK.bulk
      ? PEOPLE.filter((p) => PICKED.has(p.id)).length + ' people'
      : ((personById(RPICK.pid) || {}).name || '');
    const back = (label) => `<button class="set2-pop-back" type="button" data-rp-back>${I.left} ${esc(label)}</button>`;
    let html = '';

    if (RPICK.step === 'role') {
      const q = (RPICK.q || '').toLowerCase();
      const hits = ROLES.filter((r) => !q || r[0].toLowerCase().indexOf(q) >= 0);
      html = `<div class="set2-pop-hd">Grant to ${esc(who)}</div>
        <input class="set2-pop-f" type="search" placeholder="Search roles\u2026"
               value="${esc(RPICK.q || '')}" data-rp-q autocomplete="off" aria-label="Search roles">`
        + (hits.length ? hits.map((r) => `
            <button class="set2-pop-i" type="button" data-rp-role="${esc(r[0])}">
              <span class="set2-pop-n">${esc(r[0])}</span>
              <span class="set2-pop-s">${esc(r[1])}</span>
            </button>`).join('')
          : `<div class="set2-pal-empty">No role called <b>${esc(RPICK.q)}</b>.</div>`);

    } else if (RPICK.step === 'type') {
      html = back(RPICK.role) + SCOPE_TYPES.map((t) => `
        <button class="set2-pop-i" type="button" data-rp-type="${esc(t)}">
          <span class="set2-pop-n">${esc(t)}</span>
          <span class="set2-pop-s">${nodesOfType(t).length}</span>
        </button>`).join('');

    } else {
      const p = RPICK.pid ? personById(RPICK.pid) : null;
      const g = (p && RPICK.gi != null) ? p.grants[RPICK.gi] : null;
      /* In the plural case a scope counts as HELD only when every selected
         person has it — a tick against something half of them have is a lie. */
      const have = g ? g.v : (RPICK.bulk
        ? nodesOfType(RPICK.type).filter((v) => {
            const sel = PEOPLE.filter((x) => PICKED.has(x.id));
            return sel.length && sel.every((x) => x.grants.some((gr) =>
              gr.r === RPICK.role && gr.t === RPICK.type && gr.v.indexOf(v) > -1));
          })
        : (RPICK.v || []));
      html = back(RPICK.type) + nodesOfType(RPICK.type).map((v) => `
        <button class="set2-pop-i${have.indexOf(v) > -1 ? ' is-on' : ''}" type="button" data-rp-val="${esc(v)}">
          <span class="set2-pop-n">${esc(v)}</span>
          ${have.indexOf(v) > -1 ? `<span class="set2-pop-p">${I.tick}</span>` : ''}
        </button>`).join('');
    }
    popover(anchor, html);
    const f = $('[data-rp-q]');
    if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); }
  }

  /* ══ ACCESS ════════════════════════════════════════════════════════════
     CARDS. A person is a thing, and their grants are a nested, independently
     expandable structure that a table row cannot hold — which is why the
     production surface uses cards and why they are the right call.

     What made the card grid bad was never the cards. It was two things:

     1. VARIABLE HEIGHT. Everyone holds a different number of grants, so every
        card was a different height and the grid was ragged by construction.
        Fixed height now, with the grants area scrolling inside its own box.
        The card is a frame; what it contains varies and the frame does not.
     2. MY OWN COLLISIONS. The save bar sat over the second row, the scope
        popover floated detached across two cards, and half the controls were
        under the 24px target floor. None of that was the pattern's fault.

     Groups are COLLAPSED by default so the resting height is predictable and
     the card shows what somebody can reach without being opened. */
  function grantGroup(p, g, i) {
    const key = p.id + ':' + i;
    const open = GOPEN.has(key);
    return `
      <div class="set2-gr${open ? ' is-open' : ''}">
        <button class="set2-gr-hd" type="button" data-gr="${esc(key)}" aria-expanded="${open}">
          ${I.down}
          <span class="set2-gr-r">${esc(g.r)}</span>
          <span class="set2-chip is-type">${esc(g.t)}</span>
          <span class="set2-gr-n">${g.v.length}</span>
        </button>
        <button class="set2-gr-del" type="button" data-gr-del="${esc(key)}"
                aria-label="Remove ${esc(g.r)} on ${esc(g.t)}">${I.trash}</button>
        <div class="set2-gr-bd">
          ${g.v.map((v, j) => `
            <span class="set2-chip is-scope">${esc(v)}
              <button class="set2-chip-x" type="button" data-gr-v="${esc(p.id)}:${i}:${j}"
                      aria-label="Revoke ${esc(v)}">${I.x}</button>
            </span>`).join('')}
          <button class="set2-grant-add" type="button" data-gr-add="${esc(key)}">+ Add scope</button>
        </div>
      </div>`;
  }

  const reachTypes = (p) => p.grants.map((g) => g.t).filter((v, i, a) => a.indexOf(v) === i);
  const reachCount = (p) => p.grants.reduce((a, g) => a + g.v.length, 0);

  function personCard(p) {
    const picked = PICKED.has(p.id);
    const n = reachCount(p);
    return `
      ${/* Two facts a quick action needs to locate: an invite nobody accepted,
             and somebody who can reach nothing. Both were readable on the card
             and neither was addressable. */ ''}
      <div class="set2-person${picked ? ' is-picked' : ''}${
          !p.grants.length ? ' is-none' : p.s[0] === 'is-warn' ? ' is-warn' : ''
        }" data-person="${esc(p.id)}">
        <div class="set2-person-hd">
          <button class="set2-ck2" type="button" role="checkbox" aria-checked="${picked}"
                  data-pick-p="${esc(p.id)}" aria-label="Select ${esc(p.name)}">${picked ? I.tick : ''}</button>
          <span class="set2-av">${esc(initialsOf(p.name))}</span>
          <span class="set2-person-lines">
            <span class="set2-person-n">${esc(p.name)}</span>
            <span class="set2-person-m">${esc(p.mail)}</span>
          </span>
          <button class="set2-kebab" type="button" data-person-menu="${esc(p.id)}"
                  aria-haspopup="menu" aria-label="More for ${esc(p.name)}">
            <span></span><span></span><span></span>
          </button>
        </div>
        <div class="set2-person-tags">
          ${pill(p.s[0], p.s[1] === 'Invite pending' ? 'Pending' : p.s[1])}
          ${p.admin ? pill('is-info', 'Admin') : ''}
          <span class="set2-from">${n ? n + ' scope' + (n === 1 ? '' : 's') : 'reaches nothing'}</span>
        </div>
        ${/* Its own scroll port. A person with six roles does not get to set the
              height of the row they happen to sit in. */ ''}
        ${/* A scrolling region a keyboard user cannot reach is a region they
              can only read the top of. Named and focusable, per the scrollable
              -region rule. */ ''}
        <div class="set2-grants" tabindex="0" role="group"
             aria-label="Roles held by ${esc(p.name)}">
          ${p.grants.length ? p.grants.map((g, i) => grantGroup(p, g, i)).join('')
            : `<div class="set2-grant is-none">No roles yet. This account can sign in and reach nothing.</div>`}
        </div>
        <div class="set2-person-ft">
          <button class="set2-gr-new" type="button" data-role-new="${esc(p.id)}">+ Grant a role</button>
        </div>
      </div>`;
  }

  M.access = function (st) {
    return pageBody(st);
  };

  function secPeople(st) {
    const f = readF(st);
    const q = (f.q || '').toLowerCase();
    const list = PEOPLE.filter((p) => {
      if (q && (p.name + ' ' + p.mail + ' ' + p.title).toLowerCase().indexOf(q) < 0) return false;
      if (f.role && !p.grants.some((g) => g.r === f.role)) return false;
      if (f.status && p.s[1] !== f.status) return false;
      if (f.access && reachTypes(p).indexOf(f.access) < 0) return false;
      return true;
    });
    const shown = list.map((p) => p.id);
    [...PICKED].forEach((id) => { if (shown.indexOf(id) < 0) PICKED.delete(id); });

    const narrowed = list.length !== PEOPLE.length;
    const pend = PEOPLE.filter((p) => p.s[0] === 'is-warn').length;
    const none = PEOPLE.filter((p) => !p.grants.length).length;
    const allOn = list.length > 0 && list.every((p) => PICKED.has(p.id));
    const picked = PEOPLE.filter((p) => PICKED.has(p.id));

    return `
      <section class="set2-sec" id="st-people">
        <div class="set2-sec-h"><h2 class="set2-sec-t">People</h2></div>

        ${inviteBar()}

        <div class="set2-fbar">
          <button class="set2-ck2" type="button" role="checkbox" aria-checked="${allOn}"
                  data-pick-all aria-label="Select everyone shown">${allOn ? I.tick : ''}</button>
          <input class="set2-fld set2-fbar-q" type="search" placeholder="Search team…"
                 value="${esc(f.q || '')}" data-f-q aria-label="Search team">
          <span class="set2-fbar-end">
            ${filterSel(st, 'role', 'Role', ROLES.map((r) => r[0]))}
            ${filterSel(st, 'status', 'Status', ['Active', 'Invite pending'])}
            ${filterSel(st, 'access', 'Access', SCOPE_TYPES)}
            ${narrowed ? `<button class="btn btn-ghost btn-sm" type="button" data-f-clear>Clear</button>` : ''}
          </span>
        </div>

        <p class="set2-lede">${list.length}${narrowed ? ' of ' + PEOPLE.length : ''} ${
          (narrowed ? PEOPLE.length : list.length) === 1 ? 'person' : 'people'} · <b>${
          PEOPLE.filter((p) => p.admin).length}</b> admins${
          pend ? ` · <b class="is-warn">${pend}</b> pending` : ''}${
          none ? ` · <b class="is-warn">${none}</b> with no access` : ''}</p>

        ${list.length
          ? `<div class="set2-team">${list.map(personCard).join('')}</div>`
          : `<div class="set2-empty"><b>Nobody matches</b>No one on the team fits those filters.</div>`}
      </section>

      ${PICKED.size ? `
        <div class="set2-bulk" role="region" aria-label="Actions for the selection">
          <span class="set2-bulk-n"><b class="set2-num">${PICKED.size}</b> selected</span>
          <button class="set2-lnk" type="button" data-pick-none>Deselect</button>
          <span class="set2-bulk-end">
            <button class="btn btn-ghost btn-sm" type="button" data-bulk-grant>Grant a role</button>
            ${picked.some((p) => p.s[0] === 'is-warn')
              ? `<button class="btn btn-ghost btn-sm" type="button" data-bulk-resend>Resend invite${
                   picked.filter((p) => p.s[0] === 'is-warn').length > 1 ? 's' : ''}</button>` : ''}
            <button class="btn btn-ghost btn-sm is-err" type="button" data-bulk-rm>Remove</button>
          </span>
        </div>` : ''}

      `;
  }

  const CAPS = [
    ['AI Controls', [
      ['Write organization skills', ['full', 'full', 'none', 'none', 'none', 'none']],
      ['Write personal skills',     ['full', 'full', 'full', 'full', 'full', 'none']],
      ['Change what a skill reaches', ['full', 'full', 'view', 'none', 'none', 'none']],
      ['Ground an agent on a collection', ['full', 'full', 'view', 'none', 'none', 'none']]
    ]],
    ['Organization', [
      ['Invite and remove people', ['full', 'full', 'none', 'none', 'none', 'none']],
      ['Assign roles',            ['lock', 'full', 'none', 'none', 'none', 'none']],
      ['Edit the hierarchy',      ['full', 'view', 'view', 'view', 'none', 'none']],
      ['Change the plan',         ['lock', 'none', 'none', 'none', 'none', 'none']]
    ]],
    ['Operations', [
      ['Edit a connection mapping', ['full', 'full', 'full', 'view', 'none', 'none']],
      ['Run a sync',                ['full', 'full', 'full', 'full', 'none', 'none']],
      ['Delete synced records',     ['lock', 'full', 'none', 'none', 'none', 'none']],
      ['Read the audit trail',      ['full', 'full', 'view', 'view', 'none', 'none']]
    ]]
  ];
  const CAP_STATE = {
    full: ['is-ok', 'Full'],
    view: ['is-mute', 'View only'],
    none: ['is-off', 'No access'],
    lock: ['is-ok', 'Always']
  };

  M.roles = () => `
    <section class="set2-sec" id="st-roles">
      ${/* It read "Locked cells cannot be changed", which implies the
            unlocked ones can. None can -- every cell is a static `td`. A
            client admin clicks, gets nothing, and concludes the product is
            broken rather than that the table is a reference. It says what it
            is. */ ''}
      ${/* No "New role" button. The note under the table says nothing here
            is editable; a button in the head offering to add a row to it was
            the table contradicting itself, and it did nothing when pressed. */ ''}
      <div class="set2-sec-h"><h2 class="set2-sec-t">Roles</h2></div>
      <div class="set2-matrix-wrap">
        <table class="set2-matrix" aria-label="What each role can do — reference only, not editable">
          <thead><tr><th></th>${ROLES.map((r) => `<th>${esc(r[0])}</th>`).join('')}</tr></thead>
          <tbody>
            ${CAPS.map(([group, caps]) => `
              <tr class="set2-matrix-g"><td colspan="${ROLES.length + 1}">${esc(group)}</td></tr>
              ${caps.map(([cap, states]) => `
                <tr>
                  <td class="set2-matrix-cap">${esc(cap)}</td>
                  ${states.map((s) => {
                    const [cls, label] = CAP_STATE[s];
                    return `<td class="set2-cell ${cls}${s === 'lock' ? ' is-locked' : ''}">
                      ${s === 'lock' ? I.lock : ''}${esc(label)}</td>`;
                  }).join('')}
                </tr>`).join('')}`).join('')}
          </tbody>
        </table>
      </div>
      <div class="set2-note" style="margin-top:0.75rem">This table is a reference — what each role can already do. Nothing in it is editable, including the cells without a lock: the lock marks the two capabilities that could not be granted back from inside the product if every admin gave them up. Change who holds a role above.</div>
    </section>`;

  M.hierarchy = () => {
    const rows = [];
    TREE.forEach((n) => walk(n, 1, rows, new Set(), ''));
    return `
      <section class="set2-sec" id="st-scopes">
        ${/* "Create client" had no handler. A control that does nothing is
              worse than none: it teaches that buttons here are not to be
              trusted. It returns with the flow that makes it real. */ ''}
        <div class="set2-sec-h"><h2 class="set2-sec-t">Scopes</h2></div>
        <div class="set2-pick">
          <div class="set2-pick-bd" style="max-height:24rem" role="tree" aria-label="Hierarchy">${rows.join('')}</div>
          <div class="set2-pick-ft"><span><b class="set2-num">${LEAF_TOTAL}</b> addressable units across six levels</span></div>
        </div>
      </section>`;
  };

  M.plan = () => `
    <section class="set2-sec">
      <div class="set2-sec-h"><h2 class="set2-sec-t">On your plan</h2></div>
      <div class="set2-rows">${MODULES.filter((m) => !m.tier).map((m) => row({
        ico: I.doc, name: m.name, end: pill('is-ok', 'Included')
      })).join('')}</div>
    </section>
    <section class="set2-sec">
      <div class="set2-sec-h"><h2 class="set2-sec-t">Available</h2></div>
      <div class="set2-rows">${MODULES.filter((m) => m.tier).map((m) => row({
        ico: I.doc, name: m.name, locked: true, end: pill('is-mute', m.tier)
      })).join('')}</div>
      <div class="set2-tier"><span>Prices pending commercial input.</span>
        <span class="set2-tier-end"><button class="btn btn-brand btn-sm" type="button">Talk to us</button></span></div>
    </section>`;

  /* ── The list ── */
  /* ══ FIVE FACETS OF ONE CONNECTION ═════════════════════════════════════
     A product plus a CRM is a CONNECTION, and Config, Sync, Failures,
     Knowledge enablement and APIs are five things you do to one. The console
     modelled this as unrelated sections scoped by two dropdowns that sat in
     different places and meant different things — a product picker in the page
     chrome and a CRM picker in a section header, with a third disabled copy of
     the product inside the sync form.

     Here the scope is ONE control in the module header, and it is shared state
     (`?conn=`). Moving from Config to Sync cannot silently re-point you at a
     different connector, which was the real objection to separating them.

     With nothing picked you get the list, headed by what you are about to do
     with it. Nobody meets an empty page and nobody meets a page scoped to
     something they did not choose. */

  /* ── The scope, as one control in the chrome ──
     Picked once and carried. It reads as a sentence about where you are, with
     exactly one thing in it you can change — which is the shape the design
     uses and the reason nothing below it has to ask again. */
  function prodScope(st) {
    const client = clientOf(st);
    const prod = prodOf(st);
    const list = prod ? connsOf(prod) : [];
    const bad = list.filter((c) => c.health[0] === 'is-err').length;
    return `
      <div class="set2-scope">
        <button class="set2-scope-pick" type="button" data-client-pick aria-haspopup="menu"
                aria-label="Choose a client">
          <span class="set2-scope-k">Client</span><b>${esc(client)}</b>${I.down}
        </button>
        <span class="set2-scope-s">&rsaquo;</span>
        ${prod
          ? `<button class="set2-scope-pick" type="button" data-prod-pick aria-haspopup="menu"
                     aria-label="Choose a product">
               <span class="set2-scope-k">Product</span><b>${esc(prod)}</b>${I.down}
             </button>
             <span class="set2-scope-s">&rsaquo;</span>
             <span class="set2-scope-i">${list.length} connector${list.length === 1 ? '' : 's'}</span>
             ${bad ? pill('is-err', bad + ' not connected') : pill('is-ok', 'Connected')}`
          : pill('is-mute', 'No products connected')}
      </div>`;
  }

  /* ── Config ── Dynamic Context Fields, and how far back to read ── */
  function secMapping(c, st) {
    const k = mapCounts(c);
    const list = connsOf(prodOf(st));
    return `
      <section class="set2-sec" id="st-fields">
        <div class="set2-sec-h"><h2 class="set2-sec-t">Fields</h2>
          <span class="set2-sec-end set2-tally">
            ${/* The CRM picker belongs HERE and nowhere else. A product's
                  connectors differ in exactly one way — what their fields are
                  called — so this is the only section on any of these pages
                  whose content changes when you switch connector. */ ''}
            ${/* Labelled, because it is the only picker on the page that does
                  NOT change the page. Two connectors under one product name
                  their fields differently and agree about everything else, so
                  this scopes one section and the scope bar above scopes the
                  rest. Unlabelled, the two read as rival answers to the same
                  question. */ ''}
            ${list.length > 1 ? `
              <button class="set2-crm-pick" type="button" data-crm-pick aria-haspopup="menu"
                      aria-label="Show fields for a different connector">
                <b>${esc(c.crm)}</b>${I.down}
              </button>` : `<span class="set2-from">${esc(c.crm)}</span>`}
            <span class="set2-num"><b>${k.confirmed}</b> confirmed</span>

            ${k.unmapped ? `<span class="set2-num is-mute"><b>${k.unmapped}</b> not mapped</span>` : ''}
            ${k.broken ? `<span class="set2-num is-err"><b>${k.broken}</b> broken</span>` : ''}
          </span></div>
        ${/* Every other section on the page opens with one sentence saying
              what it governs; this one opened with a table. */ ''}
        <div class="set2-sub">What each AiMY field reads from ${esc(c.crm)} for this product. A subfield takes its value from the field above it.</div>
        <div class="set2-map">
          <div class="set2-map-hd"><span>AiMY field</span><span>${esc(c.crm)} key</span><span></span></div>
          ${c.maps.length ? mapBranch(c, c.maps, '', 0, null)
            : `<div class="set2-empty"><b>No fields yet</b>Add the first thing you want ${esc(c.crm)} to answer for this product.</div>`}
        </div>
        <button class="set2-map-new" type="button" data-add-field>
          <span class="set2-map-add-i">+</span> Add field mapping
        </button>

        ${k.broken ? `<div class="set2-note is-err" style="margin-top:0.5rem">${k.broken} path no longer exists in ${esc(c.crm)}. A mapped field that is gone reads as empty, and an empty field answers as though the data were missing rather than misrouted.</div>` : ''}
      </section>`;
  }

  /* Was an inline sentence with the input embedded in it — "Read records from
     the past [30] days" — which reads beautifully once and cannot be scanned
     at all beside five more of its kind. It is the canonical settings row now:
     what the thing is on the left, what it is set to on the right. */
  /* ── ONE SCOPE PER SECTION, AND IT IS THE PAGE'S UNLESS IT CANNOT BE ──
     This took `crmOf(st)` -- the connector the FIELDS picker happens to be
     pointing at -- and rendered its `window` as a page-level setting. On a
     product with two connectors that meant three wrong things at once: the
     number shown belonged to one of them, editing it reached only that one,
     and changing the Fields picker silently changed what this section said
     without anything on screen moving.

     A product is the page's scope. A CRM is the Fields section's scope, and
     only that section's, because the only thing that genuinely differs
     between two connectors is what their fields are called. How far back to
     read is a question about answering, which the product does once.

     So this reads every connector on the product. Where they agree there is
     one number; where they do not, the disagreement is the news and the
     control says so rather than picking a winner. */
  /* ── DATA RELEVANCE RANGE ──
     Built to the frame: the section's own title and sentence, the label
     "Retrieve data from the past:", and ONE control carrying the number and
     its unit together. It was a bare number box with a "days" suffix beside
     it, which reads as two things to set instead of one thing to pick.

     A select, not free text: the horizons that matter are a short list, and
     typing 1..3650 into a box invites a number nobody meant. The product-level
     scope stays -- this is a question about answering, which the product does
     once, so it reads every connector and says so when they disagree. */
  const RELEVANCE = [7, 14, 30, 60, 90, 180, 365];

  function secWindow(st) {
    const list = connsOf(prodOf(st));
    const vals = list.map((x) => x.window).filter((v, i, a) => a.indexOf(v) === i);
    const same = vals.length === 1;
    const now = same ? vals[0] : Math.min.apply(null, vals);
    const opts = RELEVANCE.indexOf(now) > -1 ? RELEVANCE : RELEVANCE.concat([now]).sort((x, y) => x - y);
    return `
      <section class="set2-sec" id="st-window">
        <div class="set2-sec-h"><h2 class="set2-sec-t">Data relevance range</h2></div>
        <div class="set2-sub">Control how far back AiMY retrieves knowledge from your CRM.${
          list.length > 1 ? ' Applies to all ' + list.length + ' connectors.' : ''}</div>
        <div class="set2-set" style="margin-top:0.75rem">
          <div class="set2-set-row">
            <div class="set2-set-l">
              <div class="set2-set-n">Retrieve data from the past:</div>
              ${/* It deletes nothing. That is Retention, further down this
                    page, and the two are the settings most often confused for
                    each other. */ ''}
              <div class="set2-set-d">Reading only. Nothing is removed here \u2014 that is Retention, below.</div>
              ${same ? '' : `<div class="set2-note is-warn" style="margin-top:0.5rem">${
                list.map((x) => esc(x.crm) + ' reads ' + x.window + ' days').join(', ')
                }. Saving here sets them all to one range.</div>`}
            </div>
            <div class="set2-set-c">
              ${/* Applies on change, like everything else here. It used to
                    only mark the page dirty and wait for Publish, which is the
                    one behaviour the save bar existed to serve. */ ''}
              <select class="set2-fld set2-fld-sel" data-window
                      aria-label="How far back to retrieve data">
                ${opts.map((d) => `<option value="${d}"${d === now ? ' selected' : ''}>${d} days</option>`).join('')}
              </select>
            </div>
          </div>
        </div>
      </section>`;
  }

  /* The single sentence a retention threshold gets to say about itself. Both
     the initial render and every keystroke go through here, so the figure on
     the row is by construction the figure in the dialog. */
  function retentionSays(r) {
    const gone = wouldDelete(r);
    /* One line. At 14px the two-sentence version wrapped mid-clause and made
       the row taller than the control it describes -- and "fewer days deletes
       more" is a rule you watch happen as you type, not one you need told. */
    return gone
      ? '<b class="set2-num is-err">' + gone.toLocaleString() + '</b> record'
        + (gone === 1 ? '' : 's') + ' would go'
      : 'Nothing this old yet';
  }

  const RETENTION = [
    { id: 'freshdesk', name: 'FreshDesk', days: 90, matched: 4210,
      affects: [['Support', 'loses grounding for tickets before the threshold'],
                ['Triage an inbound ticket', 'answers from a shorter history'],
                ['FileBound Support', 'next sync re-reads only what remains']] },
    { id: 'zendesk', name: 'ZenDesk', days: 90, matched: 1180,
      affects: [['Support', 'loses grounding for tickets before the threshold'],
                ['Draft a refund response', 'loses the older refund precedents it cites']] }
  ];
  /* Fewer days selects MORE records for deletion. Getting this backwards is
     how a retention control becomes an incident. */
  const wouldDelete = (r) => Math.max(0, Math.round(r.matched * (180 - r.days) / 180));

  /* ══ THE MAPPING TREE ══════════════════════════════════════════════════
     A field can carry children whose values come from inside its own. The
     depth is real information — "Email domain" indented under "Email address"
     says the domain comes OUT of that email, and if you re-point the email the
     domain follows. Flattened into two sibling paths, that relationship is
     gone and nothing stops them drifting apart.

     ── THE ONE THING THAT MAKES THIS EASY ──
     One search, not a walk. The console picks a path one level at a time —
     `requester`, menu, `organization`, menu, `domain` — three decisions to
     name one thing, with nothing on screen to tell you whether you chose
     right until all three are made. Here the whole schema is flat and
     searchable, every result carries the values it actually returns, and
     picking is one decision you can check before you commit to it. */

  /* Which Advanced disclosures are open. Not URL state: it is a peek at a
     row, not a place, and restoring six open disclosures on load would be
     restoring somebody else's morning. */
  const ADV = new Set();

  function mapRow(c, m, addr, depth, samples, canSub) {
    const derived = !!m.derive;
    const res = derived ? { ok: true } : walkPath(c.crmId, m.path || []);
    const incomplete = !derived && res.ok
      && (!m.path || !m.path.length || keysAt(c.crmId, m.path).length > 0);

    let flag = '';
    if (!res.ok) flag = pill('is-err', 'Not in ' + c.crm);
    else if (m.state === 'unmapped') flag = pill('is-mute', 'Not mapped');
    else if (incomplete) flag = pill('is-warn', 'Incomplete');


    const cls = [!res.ok ? 'is-broken' : '', incomplete ? 'is-partial' : '',
                 m.state === 'unmapped' ? 'is-unmapped' : '',

                 depth ? 'is-sub is-d' + depth : ''].filter(Boolean).join(' ');

    /* What the field is set to, as one control. Derived rows name the
       derivation instead of a path, because that is what they are. */
    const label = derived
      ? `<span class="set2-key-d">${esc(DERIVE[m.derive] ? DERIVE[m.derive].label : m.derive)}</span>
         <span class="set2-key-h">${esc(DERIVE[m.derive] ? DERIVE[m.derive].hint : '')}</span>`
      : (m.path && m.path.length
          ? m.path.map((s, j) => `<span class="set2-key-s${!res.ok && res.at === j ? ' is-bad' : ''}">${esc(s)}</span>`)
              .join('<span class="set2-key-dot">.</span>')
          : '<span class="set2-key-none">Search a field\u2026</span>');

    /* ── WHAT ADVANCED IS FOR, ON THIS FIELD ──
       It opened on any mapped row and showed both groups every time, so a
       plain text field like `ticket.subject` got a VALUE MAPPING heading over
       a sentence saying there was nothing to map, beside a button offering to
       resolve IDs on a field that has none. Two controls, neither of which
       could do anything, under a heading announcing the absence of news.

       The connector's schema already says which is which: `e` is a coded
       value, `id` is a reference. Advanced appears when one of them applies
       and shows only the half that does. On a string or a date there is
       nothing advanced about the field, so there is no Advanced. */
    /* Any row that resolves to a value has both facts to report. */
    const canAdv = !derived && res.ok && !incomplete;
    return `
      <div class="set2-map-row ${cls}" data-map="${esc(addr)}" style="--d:${depth}">
        ${/* A DRAFT ROW NAMES ITSELF WHERE IT LIVES.
              Adding a field opened a dialog to ask for one word, then closed
              it and drew the row somewhere else. The dialog interrupted
              nothing, protected nothing, and put the naming in a different
              place from the thing being named -- so you typed a name blind and
              found out afterwards where it landed.
              The row appears first, in its place in the list, with the field
              already focused. Enter keeps it, Escape drops it, and leaving it
              empty drops it too. */ ''}
        ${m.draft
          ? `<input class="set2-fld set2-map-name" data-newname="${esc(addr)}"
                    placeholder="Name this field\u2026" autocomplete="off"
                    aria-label="What this product calls this field">`
          : `<span class="set2-map-ctx">${esc(m.ctx)}</span>`}
        <span class="set2-map-mid">
          ${derived
            ? `<span class="set2-key is-derived">${label}</span>`
            : `<button class="set2-key" type="button" data-path="${esc(addr)}"
                       aria-label="Choose the ${esc(c.crm)} field for ${esc(m.ctx)}">${label}</button>`}
          ${/* ONE value, whole, and a count. Two never fit the 222px this
                column has -- "dana@nordwind..." and "ivo@tavol..." were each
                cut mid-address, and a truncated sample proves nothing about
                what the field returns. One that fits does. */ ''}
          ${/* Two raw values with a dot between them said nothing about what
                they were, and the row had no room to explain. They belong in
                the PICKER, where you are choosing between fields and the
                values are the thing that tells them apart. Once the choice is
                made the row does not need to keep proving it. */ ''}
        </span>
        ${/* Advanced moved OUT of the value cell. Stacked under the path and
              the samples it was a third line of near-identical weight, and it
              is not a third fact about the field — it is an action, so it
              belongs with the other actions. */ ''}
        <span class="set2-map-end">
          ${canSub && !(m.kids && m.kids.length)
            ? `<button class="set2-map-plus" type="button" data-add-sub="${esc(addr)}"
                       title="Add a subfield under ${esc(m.ctx)}"
                       aria-label="Add a subfield under ${esc(m.ctx)}">+</button>` : ''}
          ${flag}
          ${canAdv ? `<button class="set2-adv${ADV.has(addr) ? ' is-open' : ''}" type="button" data-adv="${esc(addr)}"
             aria-expanded="${ADV.has(addr)}">Advanced${I.caret}</button>` : ''}
          ${false && res.ok && !incomplete
            ? `<button class="btn btn-ghost btn-sm" type="button" data-map-ok="${esc(addr)}">Confirm</button>` : ''}
          <button class="set2-x" type="button" data-map-del="${esc(addr)}"
                  aria-label="Remove ${esc(m.ctx)}">${I.trash}</button>
        </span>
      </div>`;
  }

  /* Value mapping and ID resolution, inline. They were chips opening a
     popover, which put the two things most likely to be WRONG about a mapping
     behind a click — a value map that says 5 means Closed is either right or
     it quietly mislabels every ticket, and you cannot tell without looking. */
  /* `e` enum -> the codes have names. `id` -> it points at a row that has
     one. Anything else -> the value is the answer. A node the person has
     already configured keeps its group even if the schema changes under it,
     or the setting would vanish with no way to turn it off. */
  /* The design shows one Advanced panel with BOTH groups in it, and I split
     them by field kind so that most rows got one group or none. That answered
     a complaint about a useless empty panel by deleting the thing the design
     asked for. The panel is one shape: value mapping, then ID resolution.
     What it will not do is open on a row with no resolved value behind it --
     unmapped, broken, or still pointing at a container -- because there the
     panel would be describing nothing. */


  /* ── ADVANCED IS TWO FACTS ──
     I gated these by the connector's field kind, twice, and both times the
     value mapping disappeared from the row that had one. The gate was me
     answering "this panel is empty on a plain string" by making the panel
     conditional, which is a rule the design does not have and which I could
     not keep correct.

     The design shows one panel with two headings, and under each heading what
     the system resolved. That is all this is. Nothing here is chosen by a
     person and nothing here is hidden by a condition, so there is no state to
     get wrong. */
  function advSection(c, m, addr, depth) {
    const pairs = m.values && m.values.length ? m.values : null;
    const isId = !!m.idres;
    return `
      <div class="set2-adv-bd" data-adv-for="${esc(addr)}" style="--d:${depth}">
        <div class="set2-adv-g">
          <div class="set2-adv-t">Value mapping</div>
          ${pairs
            ? `<div class="set2-adv-pairs">${pairs.map(([k, v]) => `
                <span class="set2-pair"><b class="set2-mono">${esc(k)}</b>&rarr;<span>${esc(v)}</span></span>`).join('')}</div>`
            : `<span class="set2-adv-none">None</span>`}
        </div>
        <div class="set2-adv-g">
          <div class="set2-adv-t">ID resolution</div>
          ${isId
            ? `<div class="set2-adv-pairs"><span class="set2-pair">Resolve ID &rarr; <span>Display name</span></span></div>`
            : `<span class="set2-adv-none">None</span>`}
        </div>
      </div>`;
  }

  /* Adding a subfield is adding a field that happens to sit under another
     one, so it is the same act: a draft row appears at the child's depth with
     its name focused. It was a popover offering four string transforms, which
     was a different interaction, a different vocabulary, and the only way to
     get a second or third child was to find the transform list again. */
  /* Nested groups stack their add rows, so two of these sit one above the
     other 21px apart -- close enough to read as the same button twice. Each
     names the field it would hang a subfield under. */
  function addSubRow(addr, depth, open, parent) {
    return `
      <button class="set2-map-add${open ? ' is-open' : ''}" type="button"
              data-add-sub="${esc(addr)}" style="--d:${depth}">
        <span class="set2-map-add-i">+</span> Add subfield${
          parent ? ' to <b>' + esc(parent) + '</b>' : ''}
      </button>`;
  }

  /* Depth-first, so a child is always drawn directly under the field it comes
     from and the indentation means what it looks like it means. */
  function mapBranch(c, list, prefix, depth, parentSamples) {
    return list.map((m, i) => {
      const addr = prefix ? prefix + '.' + i : String(i);
      const samples = nodeSamples(c.crmId, m, parentSamples);
      /* Offered only where there is something to add AND a level to add it
         at. Both halves matter: an "Add subfield" that opens an empty picker
         is a dead end, and one that opens at level three is a promise the
         model will not keep. */
      /* Any field can hold subfields; only the level decides. The old gate
         asked whether a string transform applied to this value, so a field
         mapped to an object -- the case where subfields matter most -- offered
         none. */
      const canSub = canNest(depth) && !m.draft;
      return mapRow(c, m, addr, depth, samples, canSub)
        + (ADV.has(addr) ? advSection(c, m, addr, depth) : '')
        + mapBranch(c, m.kids || [], addr, depth + 1, samples)
        /* ── NO INVISIBLE ROWS ──
           This rendered under every nestable row and hid the ones that were
           not wanted with `opacity: 0` -- which hides the pixels and keeps the
           38px. Eight fields meant eight empty bands padding the table out,
           and the gaps between rows read as arbitrary because half of them
           were an invisible button.
           A group that is open keeps the full-width row, as the frame shows.
           Everywhere else the affordance is a "+" in the row's own actions,
           which costs no vertical space at all. */
        + (canSub && m.kids && m.kids.length ? addSubRow(addr, depth + 1, true, m.ctx) : '');
    }).join('');
  }

  /* ── The picker ──
     Every leaf the connector has, ranked so the one you almost certainly want
     is first: an exact word match on the field's own name beats a partial
     match, which beats everything else. Values beside every row, because a
     path that resolves and returns the wrong column passes every other check
     there is. */
  function openPathPicker(anchor, c, addr) {
    const nd = nodeAt(c, addr);
    if (!nd) return;
    const words = nd.node.ctx.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    /* -- CONTAINERS ARE PICKABLE --
       Leaves only, said the old comment: "an object is a container, not a
       value, and offering one as a mapping is offering something that answers
       nothing." True of the mapping, false of the FLOW -- mapping Agent to
       `assignee` is how you then take `name`, `email` and `phone` out of it as
       subfields. With leaves only, nothing could ever hold a subfield that was
       not a string transform, so the third level had no way to exist.
       They are offered, and marked as what they are. */
    const all = allPaths(c.crmId).map((p) => {
      const s = samplesFor(c.crmId, p.path);
      const str = p.path.join('.').toLowerCase();
      const last = p.path[p.path.length - 1].toLowerCase();
      let score = 0;
      words.forEach((w) => { if (last === w) score += 10; else if (last.indexOf(w) >= 0) score += 5;
                             else if (str.indexOf(w) >= 0) score += 2; });
      if (s) score += 1;
      /* A container ranks below a leaf of equal match: most of the time the
         value IS the answer, and drilling in is the deliberate case. */
      if (p.kind === 'o') score -= 3;
      return { p: p, s: s, score: score, str: str };
    }).sort((x, y) => y.score - x.score);

    const rows = (q) => {
      const hits = all.filter((r) => !q || r.str.indexOf(q) >= 0);
      if (!hits.length) return `<div class="set2-pal-empty">No field matches <b>${esc(q)}</b>.</div>`;
      return hits.map((r) => `
        <button class="set2-pop-i is-path" type="button" data-pick-path="${esc(r.p.path.join('.'))}">
          <span class="set2-pop-n set2-mono">${r.p.path.map(esc).join('.')}</span>
          <span class="set2-pop-s">${r.p.kind === 'o'
            ? keysAt(c.crmId, r.p.path).length + ' fields inside'
            : (r.s ? r.s.slice(0, 2).map(esc).join(' \u00b7 ') : 'no values')}</span>
        </button>`).join('');
    };

    const p = popover(anchor, `
      <input class="set2-pop-f" type="search" placeholder="Search ${esc(c.crm)} fields\u2026"
             data-pop-f autocomplete="off" aria-label="Search fields">
      <div class="set2-pop-bd" data-pop-list>${rows('')}</div>`);
    const f = $('[data-pop-f]', p); if (f) f.focus();
    p.addEventListener('input', (e) => {
      $('[data-pop-list]', p).innerHTML = rows(e.target.value.toLowerCase().trim());
    });
    p.addEventListener('click', (e) => {
      const b = e.target.closest('[data-pick-path]');
      if (!b) return;
      nd.node.path = b.getAttribute('data-pick-path').split('.');
      nd.node.state = 'confirmed';
      DIRTY.add('maps'); closePop(); render();
    });
  }

  /* Criteria read as a sentence, and every one of them narrows. The console
     shows the same chips with no conjunction stated anywhere, so whether two
     criteria mean AND or OR is left to the reader. */

  function criteriaEditor(c) {
    const join = c.join || 'all';
    return `
      ${/* The conjunction is a CONTROL, not a convention. Two filters meant AND
            by assumption before this, and nothing on screen said so, which is
            how a sync quietly pulls the wrong half of a corpus. */ ''}
      <div class="set2-joinbar">
        <span>Match</span>
        <span class="seg" role="group" aria-label="How filters combine">
          <button class="seg-btn${join === 'all' ? ' active' : ''}" type="button" data-join="all">All</button>
          <button class="seg-btn${join === 'any' ? ' active' : ''}" type="button" data-join="any">Any</button>
        </span>
        <span>of the following</span>
      </div>
      <div class="set2-crit" data-crit>
        ${c.criteria.length
          ? c.criteria.map((k, i) => `
              ${i ? `<span class="set2-crit-and">${join === 'all' ? 'and' : 'or'}</span>` : ''}
              <span class="set2-chip">${esc(k[0])} is <b>${esc(k[1])}</b>
                <button type="button" data-crit-del="${i}" aria-label="Remove ${esc(k[0])} filter">${I.x}</button>
              </span>`).join('')
          : '<span class="set2-crit-all">Every record. Add a filter to narrow it.</span>'}
        <button class="set2-add is-inline" type="button" data-crit-add>+ Filter</button>
      </div>`;
  }

  /* ── Setup checklist ──
     A new connection is a four-step job whose steps live on different parts of
     one page. Externalising the sequence, with an honest estimate per step,
     beats leaving a person to work out the order. It removes itself once done
     rather than becoming permanent furniture. */

  function previewRows(c, n) {
    const cols = c.maps.filter((m) => m.path.length && walkPath(c.crmId, m.path).ok
                                   && keysAt(c.crmId, m.path).length === 0);
    const depth = cols.reduce((d, m) => Math.max(d, (samplesFor(c.crmId, m.path) || []).length), 0);
    const rows = [];
    for (let r = 0; r < Math.min(n, depth || 0); r++) {
      rows.push(cols.map((m) => {
        const s = samplesFor(c.crmId, m.path);
        let v = s ? s[r % s.length] : null;
        /* Transforms are applied here too, or the preview would show the raw
           value while the agent receives the mapped one. */
        if (v && m.values) { const hit = m.values.filter((x) => x[0] === v)[0]; if (hit) v = hit[1]; }
        return v;
      }));
    }
    return { cols: cols, rows: rows };
  }

  /* ── Retention ──
     The console renders the most dangerous control on the whole surface as a
     bare number input beside a trash icon, under a red sentence saying the
     action cannot be undone. It never says how many records the number
     currently selects, so "90" and "9" look equally harmless.

     Here the threshold computes its own consequence, and the confirmation is
     graded by that consequence rather than by which page you are on: typing
     the connector's name is required only because the records are gone. */

  /* ── One connection, end to end ──
     Config and Sync were two doors onto one question: what we read from this
     connector, and when. Splitting them meant the field you just mapped and
     the run that would use it were on different pages, and neither page could
     answer "is this working" on its own.

     The order is the lifecycle: what the fields mean, how far back to read,
     what to pull, what broke, what happened, what gets pruned. */
  /* A client with nothing connected is a real state, not an error. It gets a
     page that says so and offers the one thing worth doing from here. */
  function noProducts(st) {
    const client = clientOf(st);
    const all = productsOfClient(client).length;
    return `
      <section class="set2-sec">
        <div class="set2-empty"><b>${esc(client)} has no connected products</b>${all
          ? all + ' product' + (all === 1 ? '' : 's') + ' exist under this client, and none of them reads from a CRM yet.'
          : 'This client has no products in the hierarchy yet.'}
          <button class="btn btn-brand btn-sm" type="button" style="margin-top:0.75rem">Connect a CRM</button></div>
      </section>`;
  }

  M.config = function (st) {
    if (!prodOf(st)) return noProducts(st);
    return pageBody(st);
  };

  /* ── THE SECTIONS, ADDRESSED BY NAME ──
     A page names the sections it composes and this resolves them. One table,
     so adding a page is a line in SUBPAGES and never a change here, and a page
     naming a section that does not exist fails loudly at the point of the
     typo rather than rendering a shorter page than intended. */
  const SECTION = {
    mapping:    (st) => secMapping(crmOf(st), st),
    window:     (st) => secWindow(st),
    retention:  (st) => secRetention(st),
    criteria:   (st) => secCriteria(primaryOf(st), st),
    runs:       (st) => secRuns(st),
    enrichment: (st) => secEnrichment(st),
    apis:       (st) => M.apis(st),
    people:     (st) => secPeople(st),
    roles:      () => M.roles(),
    scopes:     () => M.hierarchy()
  };

  /* ── ONE SECTION, ONE TITLE ──
     Every page built from a single section said its own name twice: once as
     the page title and again, 40px below it, as the section head — "Dynamic
     fields" over "FIELDS", "Enrichment" over "ENRICHMENT". The section head
     earns its place on a page with two of them and is pure repetition on a
     page with one.

     Marked here rather than removed in each renderer, because the sections are
     shared: `retention` is a head worth having on the Data relevance page and
     would be the same repetition if it ever stood alone. What is redundant is
     the pairing, not the head, so the pairing is what carries the class. */
  function pageBody(st) {
    const pg = pageOf(st);
    if (!pg) return '';
    const out = pg.secs.map((k) => {
      const f = SECTION[k];
      if (!f) throw new Error('No section renderer named ' + k);
      return f(st);
    }).join('');
    return pg.secs.length > 1 ? out : `<div class="set2-solo">${out}</div>`;
  }

  /* ── Sync ── which records, when, what happened, and what gets pruned ── */
  /* ── TRIGGER SYNC ──
     Built to the frame: the criteria you are about to run with, the product
     and window they run against, and the two buttons that run them -- one
     block, because they are one act. It was three loose pieces under a heading
     called "Records", which named the noun rather than the job.

     The conjunction went with the frame's shape. Two chips side by side with a
     segmented All/Any control above them made the reader parse a rule before
     reading a filter; the heading states it once instead, and every chip after
     the first is joined by the word it means. */
  /* Every filter the connector can take, as one flat list of "Key: Value" --
     which is how a person thinks of them and how the frame shows them. */
  function critOptions(c) {
    const out = [];
    Object.keys(CRITERIA_VOCAB).forEach((k) =>
      CRITERIA_VOCAB[k].forEach((v) => out.push([k, v])));
    return out.filter((p) => !c.criteria.some((x) => x[0] === p[0] && x[1] === p[1]));
  }

  function critRows(c, q) {
    const hits = critOptions(c).filter((p) =>
      !q || (p[0] + ': ' + p[1]).toLowerCase().indexOf(q) > -1);
    if (!hits.length) return `<div class="set2-ta-none">Nothing matches ${esc(q)}.</div>`;
    return hits.slice(0, 8).map(([k, v]) => `
      <button class="set2-ta-i" type="button" data-crit-pick="${esc(k)}|${esc(v)}">
        <span class="set2-ta-k">${esc(k)}:</span><b>${esc(v)}</b>
      </button>`).join('');
  }

  function secCriteria(c, st) {
    const prod = prodOf(st);
    const list = connsOf(prod);
    const n = list.reduce((a, x) => a + matchCount(x), 0);
    const tot = list.reduce((a, x) => a + x.records, 0);
    const r = c.range || ['', ''];
    return `
      <section class="set2-sec" id="st-records">
        <div class="set2-sec-h"><h2 class="set2-sec-t">Trigger sync</h2>
          <span class="set2-sec-end set2-from">${esc(c.crm)}${list.length > 1
            ? ' \u00b7 runs on all ' + list.length + ' connectors' : ''}</span></div>
        <div class="set2-sub">Define the criteria a manual run reads with, then start it.</div>

        <div class="set2-card">
          <div class="set2-card-t">Sync criteria</div>
          ${/* A typeahead, not a menu behind a "+ Filter" button. You know the
                filter you want before you go looking for it, and typing "sol"
                is faster than opening a key list and then a value list. */ ''}
          <div class="set2-ta">
            <input class="set2-fld set2-ta-f" type="search" data-crit-q autocomplete="off"
                   placeholder="Add a filter \u2014 try Status or Form\u2026"
                   aria-label="Search filters to add" aria-expanded="false">
            <div class="set2-ta-list" data-crit-list hidden></div>
          </div>
          <div class="set2-crit" data-crit>
            ${c.criteria.length
              ? c.criteria.map((k, i) => `
                  ${i ? `<span class="set2-crit-and">and</span>` : ''}
                  <span class="set2-chip">${esc(k[0])}: <b>${esc(k[1])}</b>
                    <button type="button" data-crit-del="${i}" aria-label="Remove the ${esc(k[0])} filter">${I.x}</button>
                  </span>`).join('')
              : '<span class="set2-crit-all">No filter yet \u2014 every record matches.</span>'}
          </div>
        </div>

        <div class="set2-up" style="margin-top:0.875rem">
          <div class="set2-field">
            <label class="set2-lbl">Product</label>
            ${/* Fixed, and shown rather than hidden: a run belongs to the
                  product the page is scoped to, and offering it again would
                  be a second place to set the same thing. */ ''}
            <input class="set2-fld is-fixed" value="${esc(prod)}" readonly aria-readonly="true" tabindex="-1">
          </div>
          <div class="set2-field">
            <label class="set2-lbl">Date range</label>
            <div class="set2-range">
              ${/* `is-empty` so an unset box reads as a prompt rather than as
                    the literal text "mm/dd/yyyy" -- which is what the native
                    control prints, and what a reader takes for a value. */ ''}
              <input class="set2-fld set2-range-d${r[0] ? '' : ' is-empty'}" type="date"
                     value="${esc(r[0])}" data-range="0" aria-label="Sync from">
              <span class="set2-range-a" aria-hidden="true">&rarr;</span>
              <input class="set2-fld set2-range-d${r[1] ? '' : ' is-empty'}" type="date"
                     value="${esc(r[1])}" data-range="1" aria-label="Sync to">
              ${r[0] || r[1] ? `<button class="set2-x" type="button" data-range-clear aria-label="Clear the date range">${I.x}</button>` : ''}
            </div>
            ${/* Under the dates, not under the whole row. It was full width at
                  the section's left edge, 288px from the field it describes. */ ''}
            ${RANGE_ERR
              ? `<div class="set2-note is-err">The end of the range is before its start, so nothing would match. Swap them, or clear one.</div>`
              : `<div class="set2-hint">Leave empty to resume from the last successful sync.</div>`}
          </div>
        </div>

        <div class="set2-blast">
          <span class="set2-blast-n set2-num">${n.toLocaleString()}</span>
          <span class="set2-blast-l">record${n === 1 ? '' : 's'} match right now, of ${tot.toLocaleString()}</span>
          <span class="set2-blast-end">
            <button class="btn btn-ghost btn-sm" type="button" data-test>Test sync</button>
            <button class="btn btn-brand btn-sm" type="button" data-run>Run sync</button>
          </span>
        </div>
      </section>`;
  }

  /* The history is the PRODUCT's, because the run is. Every row names the
     connector it hit — two CRMs' runs in one undifferentiated list would make
     a FreshDesk failure look like a FileBound-wide outage. */
  function secRuns(st) {
    const list = connsOf(prodOf(st));
    const rows = [];
    list.forEach((c) => c.runs.forEach((r) => rows.push({ c: c, r: r })));
    /* ── NEWEST FIRST, ACROSS CONNECTORS ──
       It flattened connector by connector, so every Zendesk run sat above
       every FreshDesk one whatever their times were -- and a run started just
       now on the second connector appeared below fixture rows from October.
       A history that is not in time order is not a history.

       Runs started in this session carry a real clock in slot 6; the fixture
       rows have none and keep the order they were authored in, underneath. */
    rows.sort((a, b) => (b.r[6] || 0) - (a.r[6] || 0));
    const bad = rows.filter((x) => x.r[2] === 'err').length;
    return `
      <section class="set2-sec" id="st-history">
        <div class="set2-sec-h"><h2 class="set2-sec-t">Sync history</h2>
          ${bad ? `<span class="set2-sec-end set2-tally"><span class="set2-num is-err"><b>${bad}</b> failed</span></span>` : ''}</div>
        <div class="set2-sub">Recent sync runs and their outcomes.</div>
        ${rows.length ? `
        <div class="set2-runs" role="table" aria-label="Recent sync runs">
          <div class="set2-run set2-run-hd" role="row">
            <span>Date</span><span>Criteria</span><span>Records</span><span>Status</span>
          </div>
          ${rows.map(({ c, r }) => {
            const state = r[2] === 'ok' ? 'is-ok' : r[2] === 'err' ? 'is-err' : 'is-info';
            return `
            <div class="set2-run${r[2] === 'err' ? ' is-failed' : ''}" role="row">
              <span class="set2-run-when set2-num">${esc(r[0])}</span>
              <span class="set2-run-crit">
                <span class="set2-chip is-type">${esc(c.crm)}</span>
                ${r[1].map((k) => `<span class="set2-chip">${esc(k[0])}: <b>${esc(k[1])}</b></span>`).join('')}
                ${/* ── The reason is no longer ON the row ──

                      It lived here as a code and a two-line clamp, and the
                      clamp is what gave it away: a reason cut mid-word — "on
                      every record in the windo…" — is not an explanation, it
                      is the shape of one. It also doubled the row's height, so
                      a table whose whole job is to be scanned had two rhythms
                      in it, one for runs that worked and one for runs that did
                      not.

                      A failed run IS a run and its row still says so — the
                      pill, and a way in underneath it. What broke, and what to
                      press about it, is one click away in a panel with room
                      for the whole sentence. */ ''}
              </span>
              <span class="set2-run-n set2-num">${r[4] ? r[4].toLocaleString() : ''}</span>
              <span class="set2-run-st">
                ${pill(state, r[3])}
                ${/* Not "Retry". That button was a no-op, and on two of the
                      three failures here it also named the wrong move —
                      `FIXES` says retrying a revoked token or a dead mapping
                      path cannot work. The row no longer guesses at the fix;
                      it opens the thing that knows it. */ ''}
                ${r[2] === 'err' && r[5] && r[5].why
                  ? `<button class="set2-why" type="button"
                             data-why="${esc(c.id)}|${c.runs.indexOf(r)}"
                             aria-haspopup="dialog"
                             aria-label="Why the run from ${esc(r[0])} failed">Why it failed</button>` : ''}
              </span>
            </div>`;
          }).join('')}
        </div>` : `<div class="set2-empty"><b>No runs yet</b>The first sync will appear here with what it matched.</div>`}
      </section>`;
  }

  /* Retention is a section of Sync rather than a rail item of its own: its
     threshold prunes exactly the records the runs above it pulled, and the two
     read as one decision when they are on one page. */
  /* ── Retention ──
     Per CRM, and EVERY CRM this product syncs — not just the one currently
     scoped. FileBound Support reads from both Zendesk and FreshDesk, and a
     threshold page that showed you one of them would let you set 90 days on
     the connector you happened to be looking at while the other silently kept
     everything. The design lists both for exactly that reason. */
  /* ── TRIGGER DELETE ──
     Built to the frame: the title, the sentence under it, one irreversible-
     action banner, and a card of one row per CRM -- name, threshold, days,
     and the red trash that starts it.

     The row keeps the figure it would destroy. The frame does not show one,
     but the frame also does not have to survive somebody typing 10 into a box
     labelled days: this section's whole argument is that the number is
     judgeable before it is pressed, and a threshold that cannot state its own
     blast radius is a threshold nobody can judge. It sits in the space the
     frame leaves between the name and the control, and it is the same call to
     `retentionSays` the confirmation reads, so the two cannot disagree. */
  function secRetention(st) {
    const prod = prodOf(st);
    const crms = connsOf(prod).map((x) => x.crmId).filter((v, i, a) => a.indexOf(v) === i);
    const rows = RETENTION.filter((r) => crms.indexOf(r.id) > -1);
    if (!rows.length) return '';
    return `
      <section class="set2-sec" id="st-retention">
        ${/* "\u2014 older than X days" came off the heading. The X was the frame's
              placeholder for a value, and a shipped heading that still says X
              reads as unfinished; the sentence under it says the same thing
              in words and the rows say it in numbers. */ ''}
        <div class="set2-sec-h"><h2 class="set2-sec-t">Trigger delete</h2></div>
        <div class="set2-sub">Remove synced data older than a set threshold, per CRM.</div>
        <div class="set2-danger" role="note">
          <span class="set2-danger-i" aria-hidden="true">${I.warn}</span>
          <span>This action is irreversible. Deleted records cannot be recovered.</span>
        </div>
        <div class="set2-ret-card">
          ${rows.map((r) => `
            <div class="set2-ret-row" data-ret-row="${esc(r.id)}">
              <span class="set2-ret-n">${esc(r.name)}</span>
              <span class="set2-ret-says">${retentionSays(r)}</span>
              <span class="set2-ret-c">
                <input class="set2-fld set2-fld-n set2-num" type="number" min="1" max="3650"
                       value="${r.days}" data-ret="${esc(r.id)}"
                       aria-label="${esc(r.name)} retention threshold in days">
                <span class="set2-set-u">days</span>
              </span>
              <button class="set2-ret-del" type="button" data-ret-go="${esc(r.id)}"
                      aria-label="Delete ${esc(r.name)} records older than ${r.days} days">${I.trash}</button>
            </div>`).join('')}
        </div>
      </section>`;
  }

  /* `M.sync` folded into `M.config` — the two were one question. `?m=sync`
     still resolves, through ALIAS. */

  /* ── Failures ══════════════════════════════════════════════════════════
     Promoted out of the runs table, because a red pill in a history row says
     that something broke and nothing else: not what, not why, not whether it
     is still broken, and not what to press.

     Unscoped by design when no connection is picked. "What is broken right
     now" is a question about the whole workspace, and answering it per
     connector would mean visiting three pages to find the one that is down.

     THE ACTION IS CHOSEN BY THE CAUSE. A retry on a revoked token is theatre,
     and a reconnect on a rate limit is worse than doing nothing. */
  const FIXES = {
    reconnect: ['Reconnect', 'The credential is dead. Retrying cannot help until it is replaced.'],
    retry:     ['Retry run', 'Transient. The same run should succeed now.'],
    mapping:   ['Open Config', 'The mapping points at something the connector no longer returns.']
  };

  /* ── The failure, where the failure is ──

     This was `secFailures`, a section of its own listing every broken run — and
     it had been dead code since the runs table absorbed it. What the absorption
     kept was the sentence; what it dropped was everything that made the
     sentence actionable: which fix the CAUSE calls for, why that one and not
     another, how many records went missing, and how many runs have failed the
     same way in a row. The row inherited half a Failures section and a Retry
     button that did nothing.

     So the card comes back, per run, anchored to the row it is about. Same
     markup it always had — `.set2-fail*` is styled for exactly this — with the
     code as the panel's title, which is the one place somebody would copy it
     from for a support ticket. It renders nothing when nothing is broken by
     construction now: there is no trigger on a run that worked. */
  function openFailPop(anchor, c, r) {
    const f = r[5];
    const [label, note] = FIXES[f.fix] || FIXES.retry;
    const pop = popover(anchor, `
      <div class="set2-fail" role="dialog" aria-label="Why the run failed">
        <div class="set2-fail-hd">
          <span class="set2-fail-w">${esc(c.product)} <span class="set2-scope-s">&rsaquo;</span> ${esc(c.crm)}</span>
          <span class="set2-fail-when set2-from">${esc(r[0])}</span>
        </div>
        ${pill('is-err', f.code || 'FAILED')}
        <p class="set2-fail-why">${esc(f.why)}</p>
        <p class="set2-fail-note">${esc(note)}</p>
        <div class="set2-fail-ft">
          <span class="set2-fail-n set2-num">${f.affected
            ? f.affected.toLocaleString() + ' records read then dropped'
            : 'Nothing was read'}</span>
          ${f.runs > 1 ? `<span class="set2-from">${f.runs} runs in a row</span>` : ''}
          <span class="set2-fail-do">
            <button class="btn btn-brand btn-sm" type="button"
              ${f.fix === 'mapping' ? `data-fail-go="${esc(c.id)}"` : 'data-fail-fix'}>${esc(label)}</button>
          </span>
        </div>
      </div>`);
    pop.classList.add('is-wide');
    const btn = pop.querySelector('.btn');
    if (btn) btn.focus();
    return pop;
  }

  /* ── Knowledge enablement ══════════════════════════════════════════════
     The workflow, not the credential. What the console puts under this
     heading is a URL and a token, which is an ENDPOINT — that is APIs, one
     rail item down. What belongs under "enablement" is what enrichment is
     allowed to read, at the grain it actually runs at, with what it has
     produced beside it so that turning one off has a stated cost. */
  M.enable = function (st) {
    if (!prodOf(st)) return noProducts(st);
    return pageBody(st);
  };

  function secEnrichment(st) {
    const on = ENABLE.filter((e) => e.on).length;
    return `
      <section class="set2-sec" id="st-enrichment">
        <div class="set2-sec-h"><h2 class="set2-sec-t">Enrichment</h2>
          <span class="set2-sec-end set2-tally"><span class="set2-num"><b>${on}</b> of ${ENABLE.length} on</span></span></div>
        <div class="set2-note">Enrichment runs when it is triggered from your side, against the endpoints below. Nothing here polls on its own.</div>
        ${/* No icon. It was the same document glyph on all four rows —
              decoration wearing an information's clothes, and it pushed every
              name 1rem off the column the rest of the page aligns to. */ ''}
        <div class="set2-rows set2-en" style="margin-top:0.75rem">
          ${ENABLE.map((e) => row({
            name: e.name, d: e.d, off: !e.on,
            end: `<span class="set2-from">${e.n ? e.n.toLocaleString() + ' read' : 'nothing read'}</span>`
               + toggle(e.on, e.name, `data-enable="${esc(e.id)}"`)
          })).join('')}
        </div>
      </section>`;
  }

  /* ── APIs ══════════════════════════════════════════════════════════════
     The endpoint and the secret that reaches it. Split out of the console's
     "Knowledge Enablement Webhook Settings" because a switch and a credential
     want different confirmations: one is reversible by pressing it again, the
     other invalidates every caller the moment it is pressed. */
  /* One endpoint per DATA SOURCE, which is what the design says and what the
     grain actually is: enrichment is triggered against a connector, so a
     product with two connectors has two endpoints and two secrets. Stacked on
     one page rather than behind a picker, because the question people arrive
     with is "which of these is live", and a picker answers it one at a time. */
  /* ── KNOWLEDGE ENABLEMENT WEBHOOK SETTINGS ──
     To the frame: the title, the sentence under it, one blue note saying who
     calls these, then a labelled row per credential -- field, a help affordance
     inside it, and its own Save.

     Per-field Save rather than a page-level one. Settings here apply as they
     are made, and these two are the exception that proves it: a URL or a token
     half-typed is not a setting, it is a keystroke, so each field commits when
     you say so and nothing else on the page waits for it.

     Still one section per connector, because a product with two connectors has
     two endpoints and two secrets, and the frame's "per data source" says so. */
  /* ── ONE SECTION, A GROUP PER CONNECTOR ──
     This rendered a full section per connector -- heading, the same sentence,
     the same blue note, then the two rows -- so a product with two connectors
     read the identical paragraph twice, 300px apart, with only the word
     "Zendesk" or "FreshDesk" changed. The frame has ONE heading over this,
     and the frame is right: what differs between two connectors is two URLs
     and two tokens, and that is all that should repeat. The connector name
     becomes a sub-head over its own pair of rows; the spine still lands on
     each group by id, so nothing it pointed at has moved out of reach.

     THE SAVE SLEEPS. Four brand Save buttons sat on this page at rest, beside
     fields nobody had touched -- more primary actions than the page has
     primary acts, and none of them could say whether anything had changed.
     Each is quiet and inert until its field differs from what is stored,
     lights when it does, and goes back to quiet the moment it has saved. */
  M.apis = function (st) {
    if (!prodOf(st)) return '';
    const list = connsOf(prodOf(st)).filter((c) => !!ENDPOINTS[c.id]);
    if (!list.length) return '';
    const one = list.length === 1;
    const e0 = ENDPOINTS[list[0].id];
    return `
      <section class="set2-sec" id="st-webhooks">
        <div class="set2-sec-h"><h2 class="set2-sec-t">Webhook settings</h2>
          ${one ? `<span class="set2-sec-end">${pill(e0.last[1], e0.last[2])}</span>` : ''}</div>
        <div class="set2-sub">Configure endpoints to activate the knowledge enrichment workflow for ${one ? 'this data source' : 'each data source'}.</div>
        <div class="set2-info" role="note">
          <span class="set2-info-i" aria-hidden="true">${I.info}</span>
          <span>These webhooks are called when knowledge enrichment is triggered from your side.</span>
        </div>
        ${list.map((c, i) => whGroup(c, i, !one)).join('')}
      </section>`;
  };

  function whGroup(c, i, named) {
    const e = ENDPOINTS[c.id];
    const last = e.last[0]
      ? 'Last call: ' + e.last[0] + ' \u2014 ' + e.last[2]
      : 'Never called \u2014 live, but nothing has reached it yet.';
    /* The health was in the pill and only in the pill, which a selector cannot
       read. A quick action has to be able to find the endpoint that is down,
       so the group carries the same fact as a class. */
    const bad = e.last[1] === 'is-err' ? ' is-err' : e.last[1] === 'is-warn' ? ' is-warn' : '';
    return `
      <div class="set2-wh-grp${bad}" id="st-api-${esc(c.id)}">
        ${named ? `<div class="set2-wh-hd"><h3 class="set2-wh-t">${esc(c.crm)}</h3>${pill(e.last[1], e.last[2])}</div>` : ''}
        <div class="set2-wh">
          <div class="set2-wh-row">
            <label class="set2-wh-l" for="apUrl${i}">Webhook URL</label>
            <div class="set2-wh-c">
              <span class="set2-wh-f">
                <input class="set2-fld set2-mono" id="apUrl${i}" value="${esc(e.url)}"
                       spellcheck="false" autocomplete="off" data-wh-in="${esc(c.id)}:url">
                <button class="set2-wh-help" type="button"
                        title="Where AiMY posts when enrichment runs for ${esc(c.crm)}"
                        aria-label="What this endpoint is for">${I.info}</button>
              </span>
              <button class="set2-wh-copy" type="button" data-copy="${esc(e.url)}"
                      aria-label="Copy the webhook URL">${I.copy}</button>
              <button class="btn btn-ghost btn-sm set2-wh-save" type="button"
                      data-wh-save="${esc(c.id)}:url" disabled>Save</button>
            </div>
            <div class="set2-wh-note">${esc(last)}</div>
          </div>

          <div class="set2-wh-row">
            <label class="set2-wh-l" for="apTok${i}">Auth token</label>
            <div class="set2-wh-c">
              <span class="set2-wh-f">
                <input class="set2-fld set2-mono" id="apTok${i}" type="password" value="${esc(e.token)}"
                       spellcheck="false" autocomplete="off" data-wh-in="${esc(c.id)}:token">
                <button class="set2-wh-help" type="button" data-reveal="apTok${i}" aria-pressed="false"
                        title="Show the token" aria-label="Show the token">${I.eye}</button>
              </span>
              <button class="set2-wh-copy" type="button" data-copy="${esc(e.token)}"
                      aria-label="Copy the auth token">${I.copy}</button>
              <button class="btn btn-ghost btn-sm set2-wh-save" type="button"
                      data-wh-save="${esc(c.id)}:token" disabled>Save</button>
            </div>
            ${/* Generating a replacement is not saving. It invalidates every
                  caller on their next request, so it keeps its confirmation.
                  The link itself is quiet: the dialog states the cost, and a
                  red link at rest on every connector was spending the alarm
                  colour on a thing nobody had pressed. */ ''}
            <div class="set2-wh-note">Last changed ${esc(e.rotated[0])} by ${esc(e.rotated[1])}.
              <button class="set2-lnk" type="button" data-rotate="${esc(c.id)}">Generate a new token</button></div>
          </div>
        </div>
      </div>`;
  }

  M.audit = () => `
    <section class="set2-sec">
      <div class="set2-sec-h"><h2 class="set2-sec-t">Audit trail</h2></div>
      <div class="set2-rows">${[
        ['Nour Wael', 'Edited skill “Draft a refund response”', '20m ago'],
        ['Ahmed Samy', 'Added exception on Client CXS', '3 Sep'],
        ['A. Mahfouz', 'Locked tone at Product level', '11 Aug']
      ].map((a) => row({ ico: I.user, name: a[0], d: a[1], locked: true,
        end: `<span class="set2-from">${esc(a[2])}</span>` })).join('')}</div>
      <div class="set2-tier">${I.lock}<span>Enterprise plan. You are seeing the last three entries.</span>
        <span class="set2-tier-end"><button class="btn btn-brand btn-sm" type="button">Talk to us</button></span></div>
    </section>`;

  /* ═══ THE SKILL FILE ═══
     A skill IS a file. The write form's three fields are its frontmatter and
     its body, which is what lets the upload route accept the same object the
     write route produces. Serialise and parse have to round-trip or the two
     routes are quietly making different things. */
  /* The file's vocabulary and the code's are not the same word. `manual` reads
     better in a switch; `on-demand` reads better in a file. Serialising the
     internal word made download -> upload -> download emit a DIFFERENT file
     from the one it took in, which is the round trip quietly failing while
     every screen still looked right. */
  const TRIGGER_FILE = { always: 'always', auto: 'automatic', manual: 'on-demand' };

  function toMarkdown(s) {
    return '---\n'
      + 'name: ' + s.id + '\n'
      + 'description: ' + s.desc + '\n'
      + 'trigger: ' + TRIGGER_FILE[s.trigger] + '\n'
      + 'sources: [' + s.sources.join(', ') + ']\n'
      + 'targets: [' + Array.from(SEL[s.id]).join(', ') + ']\n'
      + '---\n\n'
      + '# ' + s.name + '\n\n'
      + s.body + '\n';
  }

  /* The other direction. Deliberately forgiving about shape and unforgiving
     about the two fields that decide whether the thing is a skill at all: a
     file with no `name` cannot be addressed and a file with no `description`
     cannot be matched on, so an automatic skill without one silently never
     fires. Both errors NAME the missing field -- "invalid file" tells the
     author nothing they can act on. */
  function parseSkillFile(text) {
    const m = String(text).replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!m) throw new Error('No YAML frontmatter. The file must open with a line of three dashes.');

    const meta = {};
    let key = null;
    m[1].split('\n').forEach((line) => {
      if (/^\s*#/.test(line) || !line.trim()) return;
      const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
      if (kv) { key = kv[1]; meta[key] = kv[2].trim(); }
      /* A wrapped value: YAML continues a scalar on an indented line, which is
         how any description longer than a breath actually arrives. */
      else if (key && /^\s+\S/.test(line)) meta[key] += ' ' + line.trim();
    });

    ['name', 'description'].forEach((k) => {
      if (!meta[k]) throw new Error('Missing `' + k + '` in the frontmatter.');
    });

    const list = (v) => !v ? [] : v.replace(/^\[|\]$/g, '').split(',')
      .map((x) => x.trim()).filter(Boolean);
    const trig = (meta.trigger || 'automatic').toLowerCase().replace('on-demand', 'manual').replace('automatic', 'auto');

    /* The body is everything under the frontmatter, minus a leading H1 --
       that heading is the display name, not part of the instruction. */
    let body = m[2].replace(/^\s*\n/, '');
    const h1 = body.match(/^#\s+(.+)\n+/);
    let title = meta.name;
    if (h1) { title = h1[1].trim(); body = body.slice(h1[0].length); }

    return {
      id: meta.name, name: title, desc: meta.description,
      trigger: TRIGGER[trig] ? trig : 'auto',
      sources: list(meta.sources), targets: list(meta.targets),
      body: body.trim()
    };
  }

  /* Accepting an uploaded skill is the same act as creating one, so it lands
     in the same place with the same defaults rather than in a parallel list. */
  function acceptSkill(parsed) {
    const dup = skillById(parsed.id);
    if (dup) throw new Error('A skill named `' + parsed.id + '` already exists. Rename it, or edit that one.');
    const s = {
      id: parsed.id, name: parsed.name, from: 'Yours', trigger: parsed.trigger, on: true,
      desc: parsed.desc, by: USER.name, when: 'just now', v: 1,
      sources: parsed.sources, targets: parsed.targets, body: parsed.body,
      lock: null, chain: [{}, {}, {}, {}, {}, { on: USER.name, val: parsed.desc, by: 'You', when: 'just now' }]
    };
    SKILLS.push(s);
    SEL[s.id] = new Set(s.targets);
    return s;
  }

  function readSkillFile(file) {
    const err = $('#upErr');
    if (!/\.(md|markdown)$/i.test(file.name)) {
      if (err) err.textContent = 'Only .md is wired in this build. A .zip needs a server to unpack it.';
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      try {
        const s = acceptSkill(parseSkillFile(r.result));
        closeModal();
        patch({ m: 'skills', skill: s.id });
      } catch (ex) {
        if (err) err.textContent = ex.message;
      }
    };
    r.readAsText(file);
  }

  const EXAMPLE =
    '---\n'
    + '# The name is how the skill is addressed. Lower case, hyphens, no spaces.\n'
    + 'name: draft-refund-response\n'
    + '\n'
    + '# The description is what the agent MATCHES ON when trigger is automatic,\n'
    + '# so a vague one costs accuracy rather than tidiness. Say what the skill\n'
    + '# does and when to reach for it.\n'
    + 'description: Turn a refund question into a reply that cites the policy and\n'
    + '  flags the contested clause.\n'
    + '\n'
    + '# always    - applies to every turn. This is what an instruction is.\n'
    + '# automatic - the agent picks it, by matching the description above.\n'
    + '# on-demand - a person picks it.\n'
    + 'trigger: automatic\n'
    + '\n'
    + '# Which collections this skill may stand on. Leave empty for all of them.\n'
    + 'sources: [policies, support]\n'
    + '\n'
    + '# What it reaches. Any level of the hierarchy: a client, a business unit,\n'
    + '# a product, a team or one person. Empty means it reaches nothing and\n'
    + '# will never fire, which the interface will tell you about.\n'
    + 'targets: [interfax, kapost]\n'
    + '---\n'
    + '\n'
    + '# Draft a refund response\n'
    + '\n'
    + 'Everything below the frontmatter is the instruction itself. Write it the\n'
    + 'way you would brief a new colleague: what to do, in what order, what to\n'
    + 'refuse, and which source settles a disagreement.\n'
    + '\n'
    + 'Answer from the EU refund article first, and name it. If the Returns FAQ\n'
    + 'disagrees about what happens after activation, say the clause is contested\n'
    + 'rather than picking a side. Never quote a figure that is not in a cited\n'
    + 'source.\n';

  /* ═══════════════════════════════════════════════════════════════════════
     POPOVERS

     Anchored to the control they change, not centred over the page. GAPS 25
     records that the library has one dialog shape and it assumes the decision
     was already made before it opened. Picking a CRM key IS the decision, and
     it is a decision about one cell, so it belongs beside that cell.
     ═══════════════════════════════════════════════════════════════════════ */
  /* What opened the panel, so Escape can put focus back on it. */
  let POP_OPENER = null;

  function popover(anchor, html) {
    closePop();
    POP_OPENER = anchor;
    const p = document.createElement('div');
    p.className = 'set2-pop';
    p.id = 'setPop';
    p.innerHTML = html;
    document.body.appendChild(p);
    const r = anchor.getBoundingClientRect();
    const w = p.offsetWidth, h = p.offsetHeight;
    /* `documentElement.clientWidth/Height` is the layout viewport and is what
       `position: fixed` is measured against. `window.innerWidth` includes the
       scrollbar and, in an embedded or backgrounded frame, can report 0 --
       which made every clamp below evaluate against nothing and pushed the
       panel to the top-left corner. Guarded so a zero reading falls back to
       placing the panel under its anchor rather than somewhere arbitrary. */
    const vw = document.documentElement.clientWidth || w + 16;
    const vh = document.documentElement.clientHeight || r.bottom + h + 16;
    /* Flip up only when there is genuinely no room below AND there is room
       above, so a tall panel in a short viewport does not jump somewhere worse
       than where it started. */
    let top = r.bottom + 6;
    if (top + h > vh - 8 && r.top - h - 6 >= 8) top = r.top - h - 6;
    p.style.top = Math.max(8, Math.min(top, vh - h - 8)) + 'px';
    p.style.left = Math.max(8, Math.min(r.left, vw - w - 8)) + 'px';
    const f = p.querySelector('input');
    if (f) f.focus();
    return p;
  }
  function closePop() {
    const p = document.getElementById('setPop');
    if (p) p.remove();
    POP_OPENER = null;
  }

  /* `openSegPicker` stood here — the level-by-level walk through the schema.
     `openPathPicker` replaced it: one search over every leaf, with the values
     each one returns, so choosing is one decision you can check. */

  function openCritPicker(anchor, c) {
    const keys = Object.keys(CRITERIA_VOCAB);
    const p = popover(anchor, `
      <div class="set2-pop-bd">
        ${keys.map((k) => `<button class="set2-pop-i" type="button" data-ck="${esc(k)}"><span>${esc(k)}</span></button>`).join('')}
      </div>`);
    p.addEventListener('click', (e) => {
      const k = e.target.closest('[data-ck]');
      if (k) {
        const key = k.dataset.ck;
        p.innerHTML = `<div class="set2-pop-bd">${CRITERIA_VOCAB[key].map((v) =>
          `<button class="set2-pop-i" type="button" data-cv="${esc(v)}"><span>${esc(v)}</span></button>`).join('')}</div>`;
        p.dataset.key = key;
        return;
      }
      const v = e.target.closest('[data-cv]');
      if (v) { c.criteria.push([p.dataset.key, v.dataset.cv]); DIRTY.add('criteria'); closePop(); render(); }
    });
  }

  function confirmDelete(r) {
    const n = wouldDelete(r);
    MODAL = { kind: 'delete', r: r, n: n };
    paintModal();
  }

  /* ═══ MODALS ═══ */
  let MODAL = null;
  function closeModal() { MODAL = null; paintModal(); }
  function paintModal() {
    const host = $('#setModal');
    /* Guarded because the host is the shell's, not this file's. It was missing
       from console.html when settings moved here and every modal failed
       silently against a null — a throw would have been better than that, so
       the guard is loud rather than lenient. */
    if (!host) { if (MODAL) console.warn('AiMY settings: no #setModal host on this page'); return; }
    if (!MODAL) { host.innerHTML = ''; return; }
    host.innerHTML = MODAL === 'new' ? newSkillModal()
                   : MODAL === 'upload' ? uploadModal()
                   : MODAL.kind === 'preview' ? previewModal(MODAL.c)
                   : MODAL.kind === 'rmpeople' ? removePeopleModal(MODAL)
                   : MODAL.kind === 'rotate' ? rotateModal(MODAL)
                   : deleteModal(MODAL);
    const f = $('.set2-modal input, .set2-modal textarea', host);
    if (f) f.focus();
  }

  function previewModal(c) {
    const p = previewRows(c, 20);
    const n = matchCount(c);
    const k = mapCounts(c);
    return `
      <div class="set2-scrim" data-scrim>
        <div class="set2-modal is-wide" role="dialog" aria-modal="true" aria-labelledby="pvT">
          <div class="set2-modal-hd">
            <h2 class="set2-modal-t" id="pvT">What ${esc(c.crm)} would send</h2>
            <button class="set2-modal-x" type="button" data-close aria-label="Close">${I.x}</button>
          </div>
          <div class="set2-modal-bd">
            ${/* The criteria this dry run used, restated. The point of a test
                  is that it ran the SAME filter the button below it will, and
                  a preview that does not show what it filtered by asks to be
                  taken on trust. */ ''}
            <div class="set2-pv-crit">
              ${c.criteria.length
                ? c.criteria.map((k) => `<span class="set2-chip">${esc(k[0])}: <b>${esc(k[1])}</b></span>`).join('')
                : '<span class="set2-from">No filter — every record</span>'}
              ${(c.range && (c.range[0] || c.range[1]))
                ? `<span class="set2-chip">Range: <b>${esc(rangeLabel(c.range))}</b></span>` : ''}
            </div>
            ${p.cols.length ? `
              <div class="set2-pv-wrap">
                <table class="set2-pv">
                  <thead><tr>${p.cols.map((m) => `<th>${esc(m.ctx)}<span>${esc(m.path.join('.'))}</span></th>`).join('')}</tr></thead>
                  <tbody>
                    ${p.rows.map((r) => `<tr>${r.map((v) =>
                      `<td>${v == null || v === 'null' ? '<i>empty</i>' : esc(v)}</td>`).join('')}</tr>`).join('')}
                  </tbody>
                </table>
              </div>
              ${k.unmapped ? `<div class="set2-note" style="margin-top:0.75rem">${k.unmapped} field${k.unmapped > 1 ? 's are' : ' is'} not mapped and would arrive empty.</div>` : ''}
            ` : `<div class="set2-empty"><b>Nothing to preview</b>No field is mapped to a value yet.</div>`}
          </div>
          <div class="set2-modal-ft">
            <span class="set2-save-n">Showing ${p.rows.length} of <b class="set2-num">${n.toLocaleString()}</b> matching records</span>
            <span class="set2-modal-end">
              <button class="btn btn-ghost btn-sm" type="button" data-close>Close</button>
              <button class="btn btn-brand btn-sm" type="button" data-close>Run sync</button>
            </span>
          </div>
        </div>
      </div>`;
  }

  /* ── Removing people ──
     Graded the same way the record deletion is, because the consequence is
     the same shape: it cannot be undone and the number is the thing that must
     not be skimmed past. It names WHO, because "3 people" and "Alex, Karim and
     the person who owns the Upland grant" are different sentences and only one
     of them can be checked.

     `--- ` Anyone still holding a grant is called out separately: removing a
     person with live access takes the access with them, and that is the part
     nobody reads the count for. */
  /* ── Inviting somebody ──
     EMAIL AND NOTHING ELSE. The form asked for full name and job title as
     well, which is asking a person to type what the directory already knows
     and will overwrite — two fields that can only be entered wrong. The
     address is the one fact the inviter actually has.

     Several at once, because adding a team is the common case and doing it one
     at a time is the same decision six times.

     ── INLINE, NOT A MODAL ──
     It was a button in the section head that opened a dialog: addresses, then
     an optional role, then an optional scope. Three decisions to get one
     address in, and the two optional ones were the very act the card offers a
     moment later with "+ Grant a role" — so the dialog asked for the same
     thing twice, once blind and once in place. The frame puts one field at the
     top of the list with a Send beside it, and the frame is right: the field
     takes addresses, Enter or a comma adds another, Send does the lot, and the
     roles are granted where the person is.

     `bad` is set only when a commit is ATTEMPTED on something that is not an
     address. Flagging the draft as wrong while it is still being typed marks
     every address wrong for its first eight characters. */
  const NEWU = { mails: [], draft: '', bad: false };
  const MAIL_RE = /^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/;

  function inviteBar() {
    const n = NEWU.mails.length;
    const draft = NEWU.draft.trim();
    const draftOk = MAIL_RE.test(draft);
    const total = n + (draftOk ? 1 : 0);
    return `
      <div class="set2-invite" data-invite>
        <div class="set2-tags set2-invite-f${NEWU.bad ? ' is-bad' : ''}">
          ${NEWU.mails.map((m, i) => `
            <span class="set2-chip is-scope">${esc(m)}
              <button class="set2-chip-x" type="button" data-au-rm="${i}"
                      aria-label="Remove ${esc(m)}">${I.x}</button>
            </span>`).join('')}
          ${/* `type="text"`, not `email`: an email input refuses
                `setSelectionRange`, which is how the caret is put back after
                the bar repaints. `inputmode` still brings up the @ keyboard. */ ''}
          <input class="set2-tags-i" type="text" inputmode="email" data-au-mail
                 value="${esc(NEWU.draft)}" autocomplete="off" spellcheck="false" autocapitalize="off"
                 aria-label="Email addresses to invite"
                 placeholder="${n ? 'and another\u2026' : 'Type email addresses to invite \u2014 Enter adds another'}">
        </div>
        <button class="btn btn-brand btn-sm set2-invite-go" type="button" data-au-go${total ? '' : ' disabled'}>
          Send invite${total > 1 ? 's' : ''}</button>
        ${NEWU.bad
          ? `<div class="set2-hint set2-invite-h"><b class="is-err">${esc(draft)}</b> is not an email address.</div>` : ''}
      </div>`;
  }

  /* The bar repaints itself in place. A full render on every chip would
     rebuild the page under the field being typed into and take the caret with
     it. */
  function repaintInvite() {
    const el = $('[data-invite]');
    if (!el) return;
    el.outerHTML = inviteBar();
    const f = $('[data-au-mail]');
    if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); }
  }

  /* One address in, whichever key put it there. */
  function commitMail() {
    const t = NEWU.draft.trim();
    if (!t) return false;
    if (!MAIL_RE.test(t)) { NEWU.bad = true; repaintInvite(); return false; }
    if (NEWU.mails.indexOf(t) < 0) NEWU.mails.push(t);
    NEWU.draft = ''; NEWU.bad = false;
    repaintInvite();
    return true;
  }

  /* Until the directory answers, the name is the address made readable —
     `karim.fouad@upland.com` reads as Karim Fouad. It is a placeholder and the
     card says so with "Invite pending". */
  const nameFromMail = (mail) => mail.split('@')[0].split(/[._-]+/).filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1)).join(' ') || mail;

  function removePeopleModal(m) {
    const withGrants = m.people.filter((p) => p.grants.length);
    const n = m.people.length;
    return `
      <div class="set2-scrim" data-scrim>
        <div class="set2-modal" role="dialog" aria-modal="true" aria-labelledby="rmT">
          <div class="set2-modal-hd">
            <h2 class="set2-modal-t" id="rmT">Remove ${n} ${n === 1 ? 'person' : 'people'}</h2>
            <button class="set2-modal-x" type="button" data-close aria-label="Close">${I.x}</button>
          </div>
          <div class="set2-modal-bd">
            <div class="set2-note is-err" style="margin-bottom:1rem">They lose access immediately. An invite sent to them stops working, and a new one has to be issued to bring them back.</div>
            <div class="set2-cascade">
              <div class="set2-cascade-t">Who</div>
              ${m.people.map((p) => `
                <div class="set2-cascade-i">
                  <span class="set2-cascade-k">${esc(p.name)}</span>
                  <span class="set2-cascade-v">${p.grants.length
                    ? p.grants.map((g) => esc(g.r) + ' on ' + g.v.length + ' ' + esc(g.t.toLowerCase()) + (g.v.length === 1 ? '' : 's')).join(' \u00b7 ')
                    : 'no roles to lose'}</span>
                </div>`).join('')}
            </div>
            ${withGrants.length ? `<div class="set2-note is-warn" style="margin-top:0.75rem">${
              withGrants.length} of them ${withGrants.length === 1 ? 'holds a live grant' : 'hold live grants'}. That access goes with them.</div>` : ''}
            <div class="set2-field" style="margin-top:1rem">
              <label class="set2-lbl" for="rmType">Type <b class="set2-num">${n}</b> to confirm</label>
              <input class="set2-fld set2-num" id="rmType" autocomplete="off" inputmode="numeric"
                     data-confirm="${esc(String(n))}" data-confirm-loose="${esc(String(n))}">
            </div>
          </div>
          <div class="set2-modal-ft">
            <button class="btn btn-ghost btn-sm" type="button" data-close>Cancel</button>
            <button class="btn btn-brand btn-sm is-err" type="button" data-confirm-go disabled>Remove ${n === 1 ? 'them' : 'them all'}</button>
          </div>
        </div>
      </div>`;
  }

  function rotateModal(m) {
    return `
      <div class="set2-scrim" data-scrim>
        <div class="set2-modal" role="dialog" aria-modal="true" aria-labelledby="roT">
          <div class="set2-modal-hd">
            <h2 class="set2-modal-t" id="roT">Generate a new ${esc(m.crm)} token</h2>
            <button class="set2-modal-x" type="button" data-close aria-label="Close">${I.x}</button>
          </div>
          <div class="set2-modal-bd">
            <div class="set2-note is-err">The current token stops working the moment the new one exists — every caller starts failing on its next request, not at its next deploy. Have somewhere ready to paste the new one.</div>
          </div>
          <div class="set2-modal-ft">
            <button class="btn btn-ghost btn-sm" type="button" data-close>Cancel</button>
            <button class="btn btn-brand btn-sm is-err" type="button" data-rotate-go>Generate it</button>
          </div>
        </div>
      </div>`;
  }

  function deleteModal(m) {
    return `
      <div class="set2-scrim" data-scrim>
        <div class="set2-modal" role="dialog" aria-modal="true" aria-labelledby="dlT">
          <div class="set2-modal-hd">
            <h2 class="set2-modal-t" id="dlT">Delete ${esc(m.r.name)} records</h2>
            <button class="set2-modal-x" type="button" data-close aria-label="Close">${I.x}</button>
          </div>
          <div class="set2-modal-bd">
            <div class="set2-blast is-err" style="margin:0 0 1rem">
              <span class="set2-blast-n set2-num">${m.n.toLocaleString()}</span>
              <span class="set2-blast-l">records older than ${m.r.days} days will be removed and cannot be recovered</span>
            </div>
            ${/* The cascade. A count says how big the hole is; this says what
                  falls into it. Okta warns about dependent flows, Replit about
                  the deployment that dies with the app -- the pattern is to
                  name the SECOND casualty, which is always the surprising one. */ ''}
            <div class="set2-cascade">
              <div class="set2-cascade-t">What else this affects</div>
              ${m.r.affects.map((a) => `
                <div class="set2-cascade-i">
                  <span class="set2-cascade-k">${esc(a[0])}</span>
                  <span class="set2-cascade-v">${esc(a[1])}</span>
                </div>`).join('')}
            </div>
            <div class="set2-field">
              ${/* Typing the COUNT rather than the name, following HubSpot: the
                    number is the thing that must not be skimmed past, and a
                    name can be typed without ever reading the figure above it. */ ''}
              <label class="set2-lbl" for="dlType">Type <b class="set2-num">${m.n.toLocaleString()}</b> to confirm you have read the number</label>
              <input class="set2-fld set2-num" id="dlType" autocomplete="off" inputmode="numeric"
                     data-confirm="${esc(String(m.n))}" data-confirm-loose="${esc(m.n.toLocaleString())}">
            </div>
          </div>
          <div class="set2-modal-ft">
            <span class="set2-modal-end">
              <button class="btn btn-ghost btn-sm" type="button" data-close>Cancel</button>
              <button class="btn btn-err btn-sm" type="button" data-close disabled data-confirm-go>Delete ${m.n.toLocaleString()} records</button>
            </span>
          </div>
        </div>
      </div>`;
  }

  function newSkillModal() {
    return `
      <div class="set2-scrim" data-scrim>
        <div class="set2-modal" role="dialog" aria-modal="true" aria-labelledby="nsT">
          <div class="set2-modal-hd">
            <h2 class="set2-modal-t" id="nsT">Write a skill</h2>
            <button class="set2-modal-x" type="button" data-close aria-label="Close">${I.x}</button>
          </div>
          <div class="set2-modal-bd">
            <div class="set2-field"><label class="set2-lbl" for="nsName">Name</label>
              <input class="set2-fld set2-mono" id="nsName" placeholder="weekly-status-report" autocomplete="off"></div>
            <div class="set2-field"><label class="set2-lbl" for="nsDesc">Description</label>
              <textarea class="set2-fld" id="nsDesc" style="min-height:4rem" placeholder="Generate weekly status reports from recent work. Use when asked for updates or progress summaries."></textarea>
              <div class="set2-hint">This is what the agent matches on when the trigger is automatic.</div></div>
            <div class="set2-field"><label class="set2-lbl" for="nsBody">Instructions</label>
              <textarea class="set2-fld" id="nsBody" placeholder="Summarize my recent work in three sections: wins, blockers, and next steps…"></textarea></div>
          </div>
          <div class="set2-modal-ft">
            <button class="btn btn-ghost btn-sm" type="button" data-open-upload>Upload a file instead</button>
            <span class="set2-modal-end">
              <button class="btn btn-ghost btn-sm" type="button" data-close>Cancel</button>
              <button class="btn btn-brand btn-sm" type="button" data-close>Create</button>
            </span>
          </div>
        </div>
      </div>`;
  }

  function uploadModal() {
    return `
      <div class="set2-scrim" data-scrim>
        <div class="set2-modal" role="dialog" aria-modal="true" aria-labelledby="upT">
          <div class="set2-modal-hd">
            <h2 class="set2-modal-t" id="upT">Upload a skill</h2>
            <button class="set2-modal-x" type="button" data-close aria-label="Close">${I.x}</button>
          </div>
          <div class="set2-modal-bd">
            <div class="set2-up">
              <div>
                <ul class="set2-up-req" style="padding-left:1rem;margin:0 0 0.875rem">
                  <li><code>.md</code> must carry <code>name</code> and <code>description</code> as YAML frontmatter</li>
                  <li><code>.zip</code> or <code>.skill</code> must contain a <code>SKILL.md</code></li>
                  <li>Everything below the frontmatter is the instruction</li>
                </ul>
                <button class="btn btn-ghost btn-sm" type="button" data-example>Download an example</button>
              </div>
              <label class="set2-drop" data-drop>
                ${I.up}
                <span>Drag a file here, or click to choose</span>
                <input type="file" accept=".md,.markdown,.zip,.skill" hidden data-file>
              </label>
            </div>
            <div class="set2-note is-err" id="upErr" style="margin-top:0.875rem;display:block;min-height:0;background:transparent;padding:0"></div>
          </div>
          <div class="set2-modal-ft">
            <button class="btn btn-ghost btn-sm" type="button" data-open-new>Write one instead</button>
            <span class="set2-modal-end">
              <button class="btn btn-ghost btn-sm" type="button" data-close>Cancel</button>
            </span>
          </div>
        </div>
      </div>`;
  }

  function downloadExample() {
    const blob = new Blob([EXAMPLE], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'aimy-skill-example.md';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     SEARCH

     Indexes LEAF SETTINGS, not modules. Typing "retention" should find the
     FreshDesk threshold itself, not the page it sits on -- Devin's palette
     returns "Settings > Review > Per-PR spend limit" and that specificity is
     the whole value. Module-level search would have been a nicer-looking
     version of the profile-pill deep links this replaced.

     Every entry carries its full path, so a result says where it lives as well
     as what it is.
     ═══════════════════════════════════════════════════════════════════════ */
  function searchIndex() {
    const out = [];
    const add = (path, name, go) => out.push({ path: path, name: name, go: go });

    /* A module is a group of pages, so the destinations are the PAGES. The
       module still resolves — someone typing "Connections" means the group and
       gets its first page — but "Webhook settings" is now a result of its own
       rather than something you find by opening Enablement and scrolling. */
    MODULES.forEach((m) => {
      add([m.g], m.name, { m: m.id });
      (pagesOf(m.id) || []).forEach((pg) =>
        add([m.g, m.name], pg.name, { m: m.id, sec: pg.id }));
    });

    SKILLS.forEach((s) => add(['Admin', 'Skills'], s.name, { m: 'skills', skill: s.id }));
    AGENTS.forEach((a) => add(['Admin', 'Agents and tools'], a.name, { m: 'agents' }));
    COLS.forEach((c) => add(['Admin', 'Grounding'], c.name, { m: 'grounding' }));

    PEOPLE.forEach((p) => add(['Admin', 'User & access'], p.name, { m: 'access' }));
    ROLES.forEach((r) => add(['Admin', 'User & access', 'Roles'], r[0], { m: 'access' }));
    CAPS.forEach(([g, caps]) => caps.forEach(([cap]) =>
      add(['Admin', 'User & access', 'Roles', g], cap, { m: 'access' })));

    /* The CRM has to be in the path. One product can hold several connections,
       and without it two results read identically and go to different places,
       which is worse than not finding them at all. */
    CONNECTIONS.forEach((c) => {
      const at = ['Client', c.product, c.crm];
      add(['Client', 'Connections'], c.product + ' and ' + c.crm,
          { m: 'config', sec: 'fields', sp: c.product, crm: c.crmId });
      add(at, 'How far back to read', { m: 'config', sec: 'relevance', sp: c.product, crm: c.crmId });
      add(at, 'Which records to pull', { m: 'config', sec: 'sync', sp: c.product });
      add(at, 'Recent runs', { m: 'config', sec: 'sync', sp: c.product });
      add(at, 'Endpoint URL', { m: 'enable', sec: 'webhooks', sp: c.product });
      add(at, 'Auth token', { m: 'enable', sec: 'webhooks', sp: c.product });
      c.maps.filter((m) => m.state !== 'unmapped').forEach((m) =>
        add(at, m.ctx, { m: 'config', sec: 'fields', sp: c.product, crm: c.crmId }));
      failures(c.id).forEach((f) =>
        add(at.concat('Failures'), f.code, { m: 'config', sec: 'sync', sp: c.product }));
    });
    RETENTION.forEach((r) =>
      add(['Client', 'Connections', 'Data relevance'], r.name + ' retention threshold',
          { m: 'config', sec: 'relevance' }));
    ENABLE.forEach((e) =>
      add(['Client', 'Enablement', 'Enrichment'], e.name, { m: 'enable', sec: 'enrichment' }));
    return out;
  }

  /* ── The palette left this file ──
     knowledge.js registers Cmd/Ctrl-K on the document and says in as many words
     that the palette "belongs to the product and not to a page". On a shared
     page both bindings fired and both dialogs opened. `searchIndex` is the half
     worth keeping — it indexes LEAF SETTINGS with their full path, not modules —
     so it is exported and the console's palette reads it. */
  /* ═══ RENDER ═══ */
  const RAW = new Set();
  const FILTER = {};

  /* ══ THE RAIL SECTION ══════════════════════════════════════════════════
     This replaces "Sources & data" in the briefing rail. Same shape — a
     section label over `.rail-set` rows, a status dot, a name, a note on the
     right — because that shape was already the right one: it is dense enough
     that eleven destinations fit in a rail that also has to carry a briefing.

     What it takes from QA is not the layout but the RULE: every note states
     what AiMY actually found on that surface, with the number in it. A rail
     that reads "3 sources" every day is a rail nobody reads twice. The order
     never moves, so the column can be learned as a place while what it says
     changes underneath — that is the half of QA's reasoning worth keeping.

     Sources & data is not lost, it is one level up: a source that is down now
     reads as "1 source down" on Connections, and the row is the way to the
     screen that fixes it. */

  /* Every figure is read off the fixture it describes. A note that disagrees
     with the module it points at is worse than no note. */
  function moduleNote(id) {
    let n;
    switch (id) {
      case 'skills':
        n = SKILLS.filter((x) => standing(x, 'eff')[0] !== 'is-ok').length;
        return n ? [n + ' not applying', 'warn'] : [SKILLS.length + ' applying', 'ok'];
      case 'agents':
        n = AGENTS.filter((a) => !a.on).length;
        return n ? [n + ' off', 'warn'] : [AGENTS.length + ' on', 'ok'];
      case 'grounding':
        return [COLS.filter((c) => c.on).length + ' of ' + COLS.length + ' on', 'ok'];
      case 'access':
        n = PEOPLE.filter((p) => p.s[0] === 'is-warn').length;
        return n ? [n + ' invite pending', 'warn'] : [PEOPLE.length + ' people', 'ok'];
      case 'roles':
        return [ROLES.length + ' roles', ''];
      case 'hierarchy':
        return [LEAF_TOTAL + ' scopes', ''];
      /* The worst true thing about the connection: a failed run outranks a
         broken field, which outranks a healthy count. */
      case 'config': {
        n = failCount();
        if (n) return [n + ' failed run' + (n > 1 ? 's' : ''), 'err'];
        n = CONNECTIONS.reduce((a, c) => a + mapCounts(c).broken, 0);
        return n ? [n + (n > 1 ? ' fields broken' : ' field broken'), 'err']
                 : [CONNECTIONS.length + ' connected', 'ok'];
      }

      /* Enablement owns the endpoints, and a dead endpoint beats a count of
         switches: the switches do nothing while it is down. */
      case 'enable': {
        const bad = Object.keys(ENDPOINTS).filter((k) => ENDPOINTS[k].last[1] === 'is-err').length;
        if (bad) return [bad + ' endpoint down', 'err'];
        return [ENABLE.filter((e) => e.on).length + ' of ' + ENABLE.length + ' on', 'ok'];
      }
      case 'retention':
        n = RETENTION.reduce((a, r) => a + wouldDelete(r), 0);
        return n ? [n.toLocaleString() + ' would delete', 'warn'] : ['nothing queued', 'ok'];
      default:
        return null;
    }
  }

  const DOT = { ok: 'sd-ok', warn: 'sd-warn', err: 'sd-err' };

  /* ══════════════════════════════════════════════════════════════════════
     THE RAIL — one tree, muted labels, expandable parents

     Modelled on the Twilio console's left nav and every console that shares
     its shape: a muted group label, a parent row you can expand, one page per
     leaf, and the leaf you are on marked. The reference set is on Mobbin —
     Supabase for the label-over-children contrast step, Remote for the
     expand-to-children behaviour.

     THREE THINGS SEPARATE, and the file already had a rule for two of them:
     the GROUP is a signpost read once, the PAGE NAME is what you came to find,
     and the STATE is what the page is carrying. So the group label is quietest,
     the page name is the loudest thing in the column, and the state sits under
     it in meta. That is the same ladder `.set2-sec-t` follows on the page
     itself, and it should be — the rail is a table of contents for a surface
     that has to read as one surface.

     WHAT IS EXPANDED. Exactly one group, or none. An accordion rather than a
     set of independent drawers, and for the reason accordions exist: the rail
     also carries the briefing and a way back to chat, and three groups open at
     once pushed the last of them past the fold on a 950px window — so the
     structure this exists to show could not be seen all at once, which is the
     one thing it had to do.

     One at a time also makes the closed rows worth reading. A group's dot is
     the worst state under it, and a dot only says something when the thing it
     summarises is folded away.

     It is a preference about the chrome, so it lives here rather than in the
     URL — a link should open a page, not restore somebody else's idea of which
     drawer was pulled out. */
  let RAIL_OPEN = null;
  /* Which module RAIL_OPEN was an answer about. Arriving at a module — by
     click, by quick action, by pasted link or by Back — opens it, because you
     cannot pick a page from a group you cannot see. Toggling after that is
     yours and survives until you go somewhere else, INCLUDING shutting the
     group you are standing in: every group collapses, and the page you are on
     is still named by the title above the column. */
  let RAIL_FOR = null;

  function railSync(st) {
    const here = aliasOf(st.m);
    if (RAIL_FOR !== here) { RAIL_FOR = here; RAIL_OPEN = here; }
  }

  /* ── The quick action ──
     A rail row says what is wrong. This says what to do about it, and doing it
     is one click, and the click lands on the row rather than on the page that
     contains it. It carries the AiMY mark because it is AiMY's reading of the
     page, not a control the page itself offers — the same mark, meaning the
     same thing, as everywhere else in the product. */
  function quickFix(m, f) {
    return `<button class="rail-fix" type="button"
        data-fix-m="${esc(m.id)}" data-fix-sec="${esc(f.sec)}"
        ${f.find ? `data-fix-find="${esc(f.find)}"` : ''}>
        ${AIMY}<span class="rail-fix-l">${esc(f.label)}</span>
        <svg class="rail-fix-go" viewBox="0 0 12 12" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
             width="10" height="10"><path d="M4.5 2.5 8 6l-3.5 3.5"/></svg>
      </button>`;
  }

  /* A leaf. The page name, what it is carrying, and — only when something is
     wrong — the one action that ends it. */
  function pageRow(m, pg, st, here) {
    const ps = pageState(st, pg, m);
    return `<button class="rail-pg${here ? ' is-on' : ''}" type="button"
        data-m="${esc(m.id)}" data-sec="${esc(pg.id)}"${here ? ' aria-current="page"' : ''}>
        <span class="rail-pg-n">${esc(pg.name)}</span>
        ${ps && ps.note ? `<span class="rail-pg-s${ps.s ? ' ' + DOT[ps.s] : ''}">${esc(ps.note)}</span>` : ''}
      </button>`
      + (ps && ps.fix ? quickFix(m, ps.fix) : '');
  }

  /* A parent. Its own note is the worst thing under it, because that is the
     question someone scanning a collapsed tree is asking — and it is derived
     from the pages rather than computed a second time, so a rail that says
     "1 broken" always has a page under it that says which. */
  function moduleNoteFrom(m, st, pages) {
    if (!pages) return moduleNote(m.id);
    const rank = { err: 3, warn: 2, ok: 1 };
    let worst = null;
    pages.forEach((pg) => {
      const ps = pageState(st, pg, m);
      if (ps && ps.s && (!worst || rank[ps.s] > rank[worst.s])) worst = ps;
    });
    return worst ? [worst.note, worst.s] : null;
  }

  function navRow(m, st) {
    const pages = pagesOf(m.id);
    const on = m.id === aliasOf(st.m);
    const note = moduleNoteFrom(m, st, pages);
    const open = pages ? RAIL_OPEN === m.id : false;
    const dot = note && note[1] ? `<span class="status-dot ${DOT[note[1]]}"></span>`
                                : '<span class="rail-cfg-nodot"></span>';

    /* No pages: the row IS the page, and it keeps exactly the shape it had. */
    if (!pages) {
      return `<button class="rail-set-row rail-cfg-row${on ? ' is-on' : ''}" type="button"
        data-m="${esc(m.id)}"${on ? ' aria-current="page"' : ''}>
        ${dot}
        <span class="rail-set-name">${esc(m.name)}</span>
        ${m.tier ? `<span class="rail-set-note">${esc(m.tier)}</span>`
                 : note ? `<span class="rail-set-note">${esc(note[0])}</span>` : ''}
      </button>`;
    }

    /* ── THE HEADER IS A DISCLOSURE, NOT A DESTINATION ──
       It was two controls — a chevron that opened the group and a title that
       went to its first page. Two things to press a millimetre apart that do
       different things, and the larger of them navigated: pressing "Connections"
       to see what is under it took you somewhere instead.

       A group has no page of its own. Going "to" it only ever meant going to
       the first thing in it, and that thing is listed directly underneath and
       one click away. So the whole header does the one job the group actually
       has, and the pages are the only destinations in the tree. */

    /* ── WHAT A CLOSED GROUP STILL HAS TO SAY ──
       Folded away, the pages under it are gone and so is every quick action on
       them — and a fix you cannot see is a fix nobody does. The dot says
       something is wrong; this says how many things AiMY can act on, in AiMY's
       own mark, so the reason to open the group is on the closed group. */
    const acts = pages.filter((pg) => {
      const ps = pageState(st, pg, m);
      return ps && ps.fix;
    }).length;

    return `<div class="rail-grp${open ? ' is-open' : ''}">
        <button class="rail-grp-h${on ? ' is-on' : ''}" type="button" data-rail-x="${esc(m.id)}"
                aria-expanded="${open}">
          <span class="rail-grp-x" aria-hidden="true">
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round"
                 width="11" height="11"><path d="M4.5 2.5 8 6l-3.5 3.5"/></svg>
          </span>
          ${dot}<span class="rail-set-name">${esc(m.name)}</span>
          ${!open && acts ? `<span class="rail-grp-acts"
             title="${acts} thing${acts === 1 ? '' : 's'} AiMY can fix in here">
             ${AIMY}<b>${acts}</b></span>` : ''}
        </button>
        ${open ? `<div class="rail-pgs">${pages.map((pg) =>
            pageRow(m, pg, st, on && pageOf(st) === pg)).join('')}</div>` : ''}
      </div>`;
  }

  /* `off` modules are routable and stay in the search index — they are just
     not in the rail. That is what "defer, do not delete" means mechanically. */
  function nav(st) {
    const back = st.m ? `
      <button class="rail-set-row rail-cfg-back" type="button" data-m="">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="13" height="13">
          <path d="M19 12H5M11 18l-6-6 6-6"/>
        </svg>
        <span class="rail-set-name">All documents</span>
      </button>` : '';
    railSync(st);
    return back + GROUPS.map((g) => {
      const rows = MODULES.filter((m) => m.g === g && !m.off);
      if (!rows.length) return '';
      return `<div class="brief-section-label">${esc(g)}</div>
        <div class="rail-set rail-tree">${rows.map((m) => navRow(m, st)).join('')}</div>`;
    }).join('');
  }

  /* Only where a module has no section head to carry it. Everywhere else the
     count belongs beside the section it counts. */
  const TALLY = {
    skills: () => {
      const off = SKILLS.filter((x) => standing(x, 'eff')[0] !== 'is-ok').length;
      return `<span class="set2-num"><b>${SKILLS.length}</b> configured</span>`
           + (off ? `<span class="set2-num is-warn"><b>${off}</b> not applying</span>` : '');
    }
  };

  function head(st) {
    const m = moduleById(st.m);
    const scoped = m.scope === 'prod';
    /* ── The lens is not a page-level control ──
       `Yours | Organization | Effective` answers "whose value wins", and only
       three functions read it — all of them reachable only from Skills. It sat
       above every module regardless, which meant that on Retention, Webhooks
       and Connections it was a segmented control that changed nothing. It
       lives where it works now. */
    /* ── THE TITLE IS THE PAGE, NOT THE MODULE ──
       "Connections" is a group in the rail with three pages under it. Printing
       it again over one of them named the folder rather than the file, and
       left the page you were on unnamed anywhere except a rail row 500px to
       the left. The module still says where you are — it is the parent row,
       marked, directly above the child. */
    const pg = pageOf(st);
    return `
      <h1 class="set2-title">${esc(pg ? pg.name : m.name)}</h1>
      <div class="set2-bar">
        ${scoped ? prodScope(st) : `
        <div class="set2-scope">
          <span class="set2-scope-i">Org <b>FlairsTech</b></span><span class="set2-scope-s">&rsaquo;</span>
          <span class="set2-scope-i">Client <b>CXS</b></span>
        </div>`}
        <div class="set2-bar-end set2-tally">${
          !st.skill && TALLY[m.id] ? TALLY[m.id](st) : ''}</div>
      </div>`;
  }

  /* ── The module column, as a string ──
     The console decides WHERE this goes and WHEN it is painted; this file
     decides what is in it. It used to assign two innerHTMLs and a title, all of
     which belonged to a page that no longer exists. */
  /* ══════════════════════════════════════════════════════════════════════
     PAGES — a module is a group of pages, not one page with a map

     WHAT THIS REPLACES. Connections was 2178px of five sections with a spine
     down the left gutter: a map, a reading position, and a state per section.
     The spine was a good answer to the wrong question. It made a long page
     navigable; it did not make it short. Someone who came to fix a broken
     field mapping still loaded the sync history, the retention thresholds and
     every run of both connectors to get there, and the address bar could not
     tell anyone else where they had been.

     The rail already had a list of destinations in it. The spine was a SECOND
     list of destinations, in a different place, in a different visual
     language, for the sections of whichever destination you had picked from
     the first. Merging them is not a new idea — it is what every console with
     more settings than fit on a page does, Twilio's included: one tree, muted
     group labels, expandable parents, one page per leaf.

     So these are PAGES now. Each is addressable (`?sec=`), each is one screen,
     and the rail says what is on all of them at once.

     WHAT EACH ENTRY IS. `id` addresses it, `name` is the rail row, `secs` are
     the section renderers it composes, and `state` reports what the page is
     carrying — the same computation the spine used, because it was the right
     computation and only its housing was wrong.

     `state` returns `{ note, s, fix }`. `note` and `s` are the line and the
     severity under the rail row. `fix` is what is new: the one thing worth
     doing about a bad state, named as an action rather than as a count. */

  /* ── ONE PROBLEM, NAMED AS THE ACTION THAT ENDS IT ──

     "3 broken" is a diagnosis. It says a page has something wrong on it and
     leaves you to find which row, which is the part that costs the time — and
     the old spine did that from a gutter you could only read once you were
     already on the page carrying the problem.

     A fix carries `sec` (which page) and `find` (which row on it). Arriving
     scrolls to that row and marks it, so the click lands you ON the thing
     rather than at the top of a page that contains it somewhere. */
  const fixTo = (label, sec, find) => ({ label: label, sec: sec, find: find || null });

  const SUBPAGES = {
    /* Three pages, grouped the way the questions group: what the fields MEAN,
       how much data we keep, and what we pull and what happened when we did.
       Relevance and Trigger delete are one page because they are one question
       asked in two directions — how far back to read, and how far back to
       keep. Trigger sync and Sync history are one page because a run and the
       record of it are the same object before and after. */
    config: [
      { id: 'fields', name: 'Dynamic fields', secs: ['mapping'],
        state: function (st) {
          var mc = mapCounts(crmOf(st));
          if (mc.broken) return { note: mc.broken + ' broken', s: 'err',
            fix: fixTo('Repoint ' + mc.broken + ' broken path' + (mc.broken === 1 ? '' : 's'),
                       'fields', '.set2-map-row.is-broken') };
          if (mc.unmapped) return { note: mc.unmapped + ' not mapped', s: 'warn',
            fix: fixTo('Map ' + mc.unmapped + ' field' + (mc.unmapped === 1 ? '' : 's'),
                       'fields', '.set2-map-row.is-unmapped') };
          return { note: mc.confirmed + ' mapped', s: 'ok' };
        } },
      { id: 'relevance', name: 'Data relevance', secs: ['window', 'retention'],
        state: function (st) {
          var list = connsOf(prodOf(st));
          var crms = list.map(function (x) { return x.crmId; })
                         .filter(function (v, i, a) { return a.indexOf(v) === i; });
          var rows = RETENTION.filter(function (r) { return crms.indexOf(r.id) > -1; });
          var gone = rows.reduce(function (a, r) { return a + wouldDelete(r); }, 0);
          /* The queued deletion outranks the window, because one is a number
             you set and the other is records about to stop existing. */
          if (gone) return { note: gone.toLocaleString() + ' queued to delete', s: 'warn',
            fix: fixTo('Review what would go', 'relevance', '#st-retention') };
          var wins = list.map(function (x) { return x.window; })
                         .filter(function (v, i, a) { return a.indexOf(v) === i; });
          if (wins.length > 1) return { note: 'connectors disagree', s: 'warn',
            fix: fixTo('Settle the window', 'relevance', '#st-window') };
          return { note: (wins[0] || 0) + ' days', s: 'ok' };
        } },
      { id: 'sync', name: 'Sync', secs: ['criteria', 'runs'],
        state: function (st) {
          var list = connsOf(prodOf(st));
          var runs = list.reduce(function (a, x) { return a + (x.runs ? x.runs.length : 0); }, 0);
          var fails = failures().filter(function (f) { return list.indexOf(f.conn) > -1; }).length;
          if (fails) return { note: fails + ' failed', s: 'err',
            fix: fixTo('Open ' + fails + ' failed run' + (fails === 1 ? '' : 's'),
                       'sync', '.set2-run.is-failed') };
          if (!runs) return { note: 'never run', s: 'warn',
            fix: fixTo('Run the first sync', 'sync', '#st-records') };
          return { note: runs + ' run' + (runs === 1 ? '' : 's'), s: 'ok' };
        } }
    ],

    /* Two, and the split is the one the design already drew: what enrichment
       may read, and the endpoints it runs against. */
    enable: [
      { id: 'enrichment', name: 'Enrichment', secs: ['enrichment'],
        state: function () {
          var on = ENABLE.filter(function (e) { return e.on; }).length;
          if (!on) return { note: 'nothing enabled', s: 'warn',
            fix: fixTo('Turn on enrichment', 'enrichment', '#st-enrichment') };
          return { note: on + ' of ' + ENABLE.length + ' on', s: 'ok' };
        } },
      { id: 'webhooks', name: 'Webhook settings', secs: ['apis'],
        state: function (st) {
          var list = connsOf(prodOf(st)).filter(function (c) { return !!ENDPOINTS[c.id]; });
          var cls = function (c) { return ENDPOINTS[c.id].last[1]; };
          var bad = list.filter(function (c) { return cls(c) === 'is-err'; }).length;
          var warn = list.filter(function (c) { return cls(c) === 'is-warn'; }).length;
          if (bad) return { note: bad + ' endpoint' + (bad > 1 ? 's' : '') + ' down', s: 'err',
            fix: fixTo('Reconnect ' + bad + ' endpoint' + (bad > 1 ? 's' : ''),
                       'webhooks', '.set2-wh-grp.is-err') };
          if (warn) return { note: warn + ' degraded', s: 'warn',
            fix: fixTo('Check ' + warn + ' endpoint' + (warn > 1 ? 's' : ''),
                       'webhooks', '.set2-wh-grp.is-warn') };
          return { note: list.length ? list.length + ' live' : 'none set up',
                   s: list.length ? 'ok' : '' };
        } }
    ],

    /* Access splits the same way, for the same reason. Nothing above asked for
       it, but removing the spine leaves a 2114px page with no way around it,
       and its three sections were already three clean pages. */
    access: [
      { id: 'people', name: 'People', secs: ['people'],
        state: function () {
          var pend = PEOPLE.filter(function (p) { return p.s[0] === 'is-warn'; }).length;
          var none = PEOPLE.filter(function (p) { return !p.grants.length; }).length;
          if (none) return { note: none + ' with no access', s: 'warn',
            fix: fixTo('Give ' + none + ' person' + (none === 1 ? '' : 's') + ' a role',
                       'people', '.set2-person.is-none') };
          if (pend) return { note: pend + ' pending', s: 'warn',
            fix: fixTo('Resend ' + pend + ' invite' + (pend === 1 ? '' : 's'),
                       'people', '.set2-person.is-warn') };
          return { note: PEOPLE.length + ' people', s: 'ok' };
        } },
      { id: 'roles', name: 'Roles', secs: ['roles'],
        state: function () { return { note: ROLES.length + ' roles', s: '' }; } },
      { id: 'scopes', name: 'Scopes', secs: ['scopes'],
        state: function () { return { note: LEAF_TOTAL + ' scopes', s: '' }; } }
    ]
  };

  /* A module with no page list is one page, and the rail row IS the page.
     Skills and the deferred modules are that. */
  const pagesOf = (id) => SUBPAGES[aliasOf(id)] || null;

  /* Absent, unknown, or belonging to another module all mean the same thing:
     the first page. A `sec` that names nothing here must not render a blank
     column, and it must not sit in the URL pretending to name something. */
  function pageOf(st) {
    const list = pagesOf(st.m);
    if (!list) return null;
    const want = st.sec || ALIAS_SEC[st.m] || '';
    return list.filter((x) => x.id === want)[0] || list[0];
  }

  /* Computed once per paint and read by both the rail row and its quick
     action, so the two can never disagree about what is wrong. A module whose
     scope is unset has no page state at all — the pages exist, but every
     number on them would be about nothing. */
  function pageState(st, pg, m) {
    if (!pg || !pg.state) return null;
    if (m && m.scope === 'prod' && !prodOf(st)) return null;
    try { return pg.state(st); } catch (err) { return null; }
  }

  function body(st) {
    const m = moduleById(st.m) || moduleById('config');
    const inner = (M[m.id] || (() => '<div class="set2-empty"><b>Not built yet</b>This module carries its state only.</div>'))(st);
    /* A detail view brings its own header. Rendering the module header above it
       stacked two titles and two scope lines on one page, and the outer one
       named the list you had just left. */
    /* Only a SKILL detail brings its own header. A connection is a scope, not
       a page you drilled into — Dynamic fields scoped to FileBound is still
       Dynamic fields — so the page keeps its title and the scope shows in the
       bar under it. */
    /* 46rem is the widest a settings ROW stays legible — past it the control
       is a hand's width from the label it belongs to. A card GRID has the
       opposite problem: capped at 46rem it gives two cramped columns, which is
       what made this surface feel condensed. The cap is per-module now. */
    /* ── NO SPINE, AND NOTHING TOOK ITS GUTTER ──
       The map moved into the rail, where the other list of destinations
       already was. What is left is one column, and it stays exactly where it
       was: the 180px + 32px the spine occupied was dead gutter before it
       existed and is dead gutter again, so no measure inside the column moves
       and the left edge is still at 512 on every page. */
    return `<div class="set2-col${m.wide ? ' is-wide' : ''}">`
      + (st.skill ? '' : head(st))
      + inner + `</div>`;
  }

  /* Called by the console once the string above is in the DOM. `seatTabindex`
     reads elements, so it cannot run inside a function that only returns
     markup — and a timer would be a guess about when the paint landed. */
  /* ── WHICH PAGE DID I TOUCH ──
     The unsaved block says "1 unsaved" without naming which page it means, and
     the rail is the only thing on screen that lists them. So the rail carries
     it: the page you changed is marked, and its note is refreshed from the
     model in the same call.

     A class flip and a text swap, not a re-render — this is called from an
     `input` handler, and rebuilding would take the caret out of the field
     being typed in. */
  const DIRTY_STAGE = new Set();

  /* The note is RECOMPUTED from the model rather than passed in as a string.
     Two callers passing their own wording is how "30 days" ends up beside an
     input reading 45 — the same drift that let the retention row disagree with
     its own confirmation. One function owns each page's note, and this asks it
     again rather than guessing. */
  function pageNoteOf(secId) {
    const st0 = readURL();
    const m0 = moduleById(st0.m) || moduleById('config');
    const list = pagesOf(m0.id) || [];
    const pg = list.filter((x) => x.id === secId)[0];
    const ps = pg ? pageState(st0, pg, m0) : null;
    return ps ? ps.note : null;
  }

  /* Callers still name the SECTION they touched — `fields`, `records`,
     `retention` — because that is what they know about themselves. This maps a
     section to the page that now carries it, so nothing at a call site had to
     learn the new grouping. */
  const PAGE_OF_SECTION = (() => {
    const out = {};
    Object.keys(SUBPAGES).forEach((mid) => SUBPAGES[mid].forEach((pg) =>
      pg.secs.forEach((k) => { out[k] = pg.id; })));
    /* The ids the call sites use are the section ELEMENT ids (`st-history`),
       which predate the renderer names. Both spellings resolve. */
    out.history = out.runs; out.records = out.criteria;
    out.window = out.window; out.fields = out.mapping;
    return out;
  })();

  function markDirtyStage(id) {
    DIRTY_STAGE.add(id);
    const sec = PAGE_OF_SECTION[id] || id;
    const item = $('.rail-pg[data-sec="' + sec + '"]');
    if (item) {
      item.classList.add('is-dirty');
      const n = $('.rail-pg-s', item);
      const note = pageNoteOf(sec);
      if (n && note) n.textContent = note;
    }
    bumpUnsaved();
  }

  /* One place decides whether the unsaved block is showing and what number it
     shows. It was two: the generic field path updated it and the retention
     path did not, so changing a deletion threshold and a lookback left the
     block saying "1" while the discard dialog listed two. */
  function bumpUnsaved() {
    const bar = $('[data-save]');
    if (!bar) return;
    bar.hidden = !DIRTY.size;
    const n = $('.set2-num', bar);
    if (n) n.textContent = DIRTY.size;
  }

  /* The draft row is created by a render, so the caret has to be placed after
     that render rather than by the click that asked for it. */
  function focusDraft() {
    const f = $('[data-newname]');
    if (f) { f.focus(); f.select(); }
  }

  /* Anywhere in the tree, not just the top level -- a draft subfield lives in
     its parent's `kids`. */
  function draftNode(c) {
    return mapNodes(c).filter((n) => n.m.draft)[0] || null;
  }

  /* Keeping and dropping are the same two outcomes however you leave the
     field -- Enter, Escape, or clicking away -- so they live in one place. */
  function settleDraft(keep) {
    const st0 = readURL();
    const c = crmOf(st0);
    const d = draftNode(c);
    if (!d) return false;
    const f = $('[data-newname]');
    const name = keep && f ? f.value.trim() : '';
    const at = nodeAt(c, d.addr);
    if (!name) { if (at) at.list.splice(at.at, 1); render(); return true; }
    d.m.ctx = name;
    delete d.m.draft;
    DIRTY.add('maps'); markDirtyStage('fields');
    render();
    /* Straight on to the only thing left to decide about it. */
    const row = $('.set2-map-row[data-map="' + d.addr + '"] [data-path]');
    if (row) row.click();
    return true;
  }

  function painted() { seatTabindex(); focusDraft(); landFix(); }

  /* ── ARRIVING AT A FIX ──
     A quick action navigates and then has to finish the job: the page it asked
     for is painted, and the row it named has to be found, brought into view
     and marked. That cannot happen in the click — the page does not exist yet
     — so the click records what it was after and this reads it once the paint
     has landed.

     One shot. The mark is a state of the arrival, not of the row, so it clears
     itself and does not survive the next thing you do. */
  let PENDING_FIX = null;
  function landFix() {
    const want = PENDING_FIX;
    PENDING_FIX = null;
    if (!want) return;
    const el = $(want);
    if (!el) return;
    const quiet = matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: quiet ? 'auto' : 'smooth', block: 'center' });
    el.classList.add('is-found');
    /* Focus follows the eye, or the next Tab resumes from the rail, which is
       behind you now. */
    const f = el.matches('button, input, a, select') ? el
            : el.querySelector('button, input, a, select');
    if (f) f.focus({ preventScroll: true });
    else { el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); }
    setTimeout(() => el.classList.remove('is-found'), 2400);
  }

  function seatTabindex() {
    $$('[role="tree"]').forEach((t) => {
      const rows = $$('[data-node]', t);
      if (rows.length) rows[0].setAttribute('tabindex', '0');
    });
  }

  function repaintPicker(sid, focusId) {
    const p = $(`[data-pick="${sid}"]`);
    if (!p) return;
    const s = skillById(sid);
    p.outerHTML = picker(s, FILTER[sid]);
    const np = $(`[data-pick="${sid}"]`);
    const rows = $$('[data-node]', np);
    if (!rows.length) return;
    const want = focusId ? rows.filter((r) => r.dataset.node === focusId)[0] : null;
    (want || rows[0]).setAttribute('tabindex', '0');
    if (want) want.focus();
  }

  function toggleNode(id, sel) {
    const node = findNode(id);
    if (!node) return;
    const lv = leavesOf(node);
    const all = lv.every((l) => sel.has(l.id));
    lv.forEach((l) => { if (all) sel.delete(l.id); else sel.add(l.id); });
  }

  /* ═══ WIRING ═══ */
  document.addEventListener('click', (e) => {
    const st = readURL();

    /* ── The quick action ──
       Two moves in one click: go to the page, then find the row. The second
       half cannot run here, so it is left for `landFix` to do once the page it
       asked for has actually been painted. */
    const fixBtn = e.target.closest('[data-fix-m]');
    if (fixBtn) {
      PENDING_FIX = fixBtn.getAttribute('data-fix-find') || null;
      patch({ m: fixBtn.getAttribute('data-fix-m'),
              sec: fixBtn.getAttribute('data-fix-sec'), skill: '' });
      return;
    }

    /* Opening a parent is not going to it. See navRow: two things you can do
       to a group, so two controls, and this one changes no page.

       Opening one shuts whatever was open, and pressing the open one shuts it
       — so the rail is an accordion with a closed state, and no group is stuck
       open because you happen to be inside it. */
    const railX = e.target.closest('[data-rail-x]');
    if (railX) {
      const id = railX.getAttribute('data-rail-x');
      RAIL_OPEN = RAIL_OPEN === id ? null : id;
      RAIL_FOR = aliasOf(st.m);
      render();
      return;
    }
    /* The header is a `<button>` wrapping the row, so a click inside it lands
       on a child first. The branch above catches it either way through
       `closest`; this note is here so nobody adds a `[data-m]` back to it. */

    /* NO `[data-m]` BRANCH. The console routes rail rows — see knowledge.js,
       which owns both the rail's DOM and the URL. A second handler here read
       the same attribute and patched the same state a moment earlier, and the
       two disagreed about `sec`: this one set it, that one cleared it, and the
       page rows did nothing at all. One router. */

    const lens = e.target.closest('[data-lens]');
    if (lens) { patch({ lens: lens.dataset.lens }); return; }

    const go = e.target.closest('[data-go]');
    if (go && go.dataset.go.indexOf('skill:') === 0) { patch({ skill: go.dataset.go.slice(6) }); return; }

    if (e.target.closest('[data-back]')) { patch({ skill: '' }); return; }

    /* ── One search, not a walk ── */
    const pth = e.target.closest('[data-path]');
    if (pth) { openPathPicker(pth, crmOf(st), pth.getAttribute('data-path')); return; }

    const addSub = e.target.closest('[data-add-sub]');
    if (addSub) {
      const c = crmOf(st);
      if (draftNode(c)) { focusDraft(); return; }
      const nd = nodeAt(c, addSub.getAttribute('data-add-sub'));
      if (!nd) return;
      nd.node.kids = nd.node.kids || [];
      nd.node.kids.push({ ctx: '', path: [], state: 'unmapped', draft: true });
      render(); return;
    }

    /* A new mapping starts UNMAPPED and named after nothing, because naming it
       is the first decision and pre-filling one would be guessing. */
    /* It named the field FOR you, walking a fixed list and falling back to
       "New field" — so the first thing you did after adding one was rename
       something you had just been handed. It asks. */
    if (e.target.closest('[data-add-field]')) {
      const c = crmOf(st);
      /* One at a time. A second draft while the first is unnamed would leave
         two rows that are not yet fields. */
      if (c.maps.some((m) => m.draft)) { focusDraft(); return; }
      c.maps.push({ ctx: '', path: [], state: 'unmapped', draft: true });
      render(); return;
    }

    const adv = e.target.closest('[data-adv]');
    if (adv) { const k = adv.getAttribute('data-adv');
      ADV.has(k) ? ADV.delete(k) : ADV.add(k); render(); return; }


    /* ── Removing ──
       A SUBFIELD is removed outright: it exists only because somebody added
       it. A TOP-LEVEL field is not — the context field still exists and still
       needs an answer, so it drops back to "Not mapped" rather than vanishing
       from a list that is meant to be the full vocabulary. Its children go
       with it, because a derivation of nothing derives nothing. */
    const mdel = e.target.closest('[data-map-del]');
    if (mdel) {
      const c = crmOf(st);
      const nd = nodeAt(c, mdel.getAttribute('data-map-del'));
      if (!nd) return;
      if (nd.parent) nd.list.splice(nd.at, 1);
      else { nd.node.path = []; nd.node.state = 'unmapped';
             delete nd.node.values; delete nd.node.idres; delete nd.node.kids; }
      DIRTY.add('maps'); render(); return;
    }
    const mok = e.target.closest('[data-map-ok]');
    if (mok) {
      const nd = nodeAt(crmOf(st), mok.getAttribute('data-map-ok'));
      if (nd) { nd.node.state = 'confirmed'; DIRTY.add('maps'); render(); }
      return;
    }
    if (e.target.closest('[data-map-ok-all]')) {
      const c = crmOf(st);
      mapNodes(c).forEach(({ m }) => {
        if (m.state === 'suggested' && !m.derive && walkPath(c.crmId, m.path).ok) m.state = 'confirmed';
      });
      DIRTY.add('maps'); render(); return;
    }

    /* Criteria join. */
    const join = e.target.closest('[data-join]');
    if (join) { primaryOf(st).join = join.dataset.join; DIRTY.add('criteria'); render(); return; }

    /* ── THE DRY RUN ──
       Same criteria, same window, same connector set as Run sync -- the only
       difference is that nothing is written. A test that read a different
       filter to the one the button beneath it would run is worse than no test,
       because it would be believed. */
    if (e.target.closest('[data-test]')) {
      const p0 = primaryOf(st);
      const r0 = (p0 && p0.range) || ['', ''];
      /* Refused for the same reason a run is: a backwards window matches
         nothing, and a preview of nothing looks like a mapping problem. */
      if (r0[0] && r0[1] && r0[0] > r0[1]) {
        RANGE_ERR = true; render();
        const f = $('[data-range="1"]'); if (f) f.focus();
        return;
      }
      RANGE_ERR = false;
      const c = crmOf(st);
      c.previewed = true;
      /* Repaint the page under the modal too. The checklist's fourth step is
         "run a preview", and it has just been satisfied -- leaving the page
         stale means the step stays open behind the thing that completed it. */
      render();
      MODAL = { kind: 'preview', c: c };
      paintModal(); return;
    }

    /* The setup checklist that `[data-setup-hide]` dismissed is gone — it
       restated the mapping tally one line above the mapping tally. Its handler
       went with it rather than being left listening for a control nothing
       renders. */

    /* ── Criteria ── */
    const cdel = e.target.closest('[data-crit-del]');
    if (cdel) { const c = primaryOf(st); c.criteria.splice(+cdel.dataset.critDel, 1);
                DIRTY.add('criteria'); render(); return; }
    /* Picking from the typeahead adds the filter and clears the box, because
       the next thing you do is almost always add a second one. */
    const critPick = e.target.closest('[data-crit-pick]');
    if (critPick) {
      const [k, v] = critPick.getAttribute('data-crit-pick').split('|');
      const c0 = primaryOf(st);
      if (c0 && !c0.criteria.some((x) => x[0] === k && x[1] === v)) {
        c0.criteria.push([k, v]);
        DIRTY.add('criteria'); markDirtyStage('records');
      }
      render(); return;
    }
    /* A retry is a run, so it goes where runs go. The prototype has no queue
       behind it; what matters here is that the affordance sits on the row that
       failed rather than in a section of its own. */
    /* Each field commits itself. There is no page-level state to flush, so
       this writes the value and says so on the row it belongs to. */
    const whs = e.target.closest('[data-wh-save]');
    if (whs) {
      const key = whs.getAttribute('data-wh-save');
      const [cid, which] = key.split(':');
      const ep = ENDPOINTS[cid];
      const box = $('[data-wh-in="' + key + '"]');
      if (ep && box) {
        const v = box.value.trim();
        if (!v) return;
        if (which === 'url') ep.url = v; else ep.token = v;
        box.value = v;
        /* Back to rest: quiet, inert, and saying what just happened. */
        whs.classList.remove('is-dirty'); whs.disabled = true; whs.textContent = 'Saved';
        setTimeout(() => { const b = $('[data-wh-save="' + key + '"]');
                           if (b && b.disabled) b.textContent = 'Save'; }, 1600);
      }
      return;
    }

    /* Was `[data-retry]`, and its whole body was `return` — a button that
       rendered on every failed row and did nothing when pressed. */
    const why = e.target.closest('[data-why]');
    if (why) {
      const [cid, i] = why.getAttribute('data-why').split('|');
      const c = connById(cid);
      const r = c && c.runs[+i];
      if (r && r[5]) openFailPop(why, c, r);
      return;
    }

    const cadd = e.target.closest('[data-crit-add]');
    if (cadd) { openCritPicker(cadd, primaryOf(st)); return; }

    /* ── The consequential ones ── */
    const retGo = e.target.closest('[data-ret-go]');
    if (retGo) {
      const r = RETENTION.filter((x) => x.id === retGo.dataset.retGo)[0];
      confirmDelete(r); return;
    }
    /* ── Team & access ── */
    const grT = e.target.closest('[data-gr]');
    if (grT) { const k = grT.getAttribute('data-gr');
      GOPEN.has(k) ? GOPEN.delete(k) : GOPEN.add(k); render(); return; }

    const grD = e.target.closest('[data-gr-del]');
    if (grD) { const [pid, gi] = grD.getAttribute('data-gr-del').split(':');
      const p = personById(pid); if (p) { p.grants.splice(+gi, 1); DIRTY.add('grant:' + pid); render(); }
      return; }

    /* Revoking the last scope of a group removes the group: a role granted on
       nothing reaches nothing, and leaving the empty shell behind would show
       access that does not exist. */
    const grV = e.target.closest('[data-gr-v]');
    if (grV) { const [pid, gi, vi] = grV.getAttribute('data-gr-v').split(':');
      const p = personById(pid);
      if (p && p.grants[+gi]) {
        p.grants[+gi].v.splice(+vi, 1);
        if (!p.grants[+gi].v.length) p.grants.splice(+gi, 1);
        DIRTY.add('grant:' + pid); render();
      }
      return; }

    /* Revoking a selection. Addresses are resolved to objects BEFORE anything
       is spliced — indices shift as you delete, and deleting by index in a
       loop removes the wrong grants after the first one. */
    if (e.target.closest('[data-bulk-revoke]')) {
      const doomed = [];
      [...PICKED].forEach((k) => {
        const [pid, gi, vi] = k.split(':');
        const p = personById(pid);
        if (p && p.grants[+gi]) doomed.push({ p: p, g: p.grants[+gi], v: p.grants[+gi].v[+vi] });
      });
      doomed.forEach(({ p, g, v }) => {
        const at = g.v.indexOf(v);
        if (at > -1) g.v.splice(at, 1);
        if (!g.v.length) { const gat = p.grants.indexOf(g); if (gat > -1) p.grants.splice(gat, 1); }
        DIRTY.add('grant:' + p.id);
      });
      PICKED.clear(); render(); return;
    }

    /* Adding a value to a group that already has a role and a type skips
       straight to step three — the two questions it would ask are answered. */
    const grA = e.target.closest('[data-gr-add]');
    if (grA) { const [pid, gi] = grA.getAttribute('data-gr-add').split(':');
      const p = personById(pid);
      if (!p || !p.grants[+gi]) return;
      RPICK = { pid: pid, gi: +gi, step: 'val', role: p.grants[+gi].r, type: p.grants[+gi].t };
      paintRPick(grA); return; }

    const rNew = e.target.closest('[data-role-new]');
    if (rNew) { RPICK = { pid: rNew.getAttribute('data-role-new'), gi: null, step: 'role', q: '', v: [] };
      paintRPick(rNew); return; }

    /* The anchor: a card's own button, or the bulk bar. */
    const rpAnchor = () => (RPICK && RPICK.bulk)
      ? $('[data-bulk-grant]') : $('[data-role-new="' + (RPICK ? RPICK.pid : '') + '"]');

    const rpBack = e.target.closest('[data-rp-back]');
    if (rpBack && RPICK) {
      RPICK.step = RPICK.step === 'val' ? 'type' : 'role';
      paintRPick(rpAnchor() || rpBack); return; }

    const rpRole = e.target.closest('[data-rp-role]');
    if (rpRole && RPICK) { RPICK.role = rpRole.getAttribute('data-rp-role'); RPICK.step = 'type';
      paintRPick(rpAnchor() || rpRole); return; }

    const rpType = e.target.closest('[data-rp-type]');
    if (rpType && RPICK) { RPICK.type = rpType.getAttribute('data-rp-type'); RPICK.step = 'val';
      paintRPick(rpAnchor() || rpType); return; }

    /* The grant is created the moment the FIRST value is chosen, not when the
       panel closes. A role with no scope reaches nothing, so there is no state
       worth having between "picked a type" and "picked something". */
    const rpVal = e.target.closest('[data-rp-val]');
    if (rpVal && RPICK && RPICK.bulk) {
      /* Granted to everyone ticked in one move. Someone who already holds this
         role on this scope TYPE gains the scope rather than a duplicate group:
         two "QA Manager on Client" rows on one card is a state nobody asked
         for and nobody can tell apart. */
      const v = rpVal.getAttribute('data-rp-val');
      PEOPLE.filter((x) => PICKED.has(x.id)).forEach((x) => {
        let g = x.grants.filter((y) => y.r === RPICK.role && y.t === RPICK.type)[0];
        if (!g) { g = { r: RPICK.role, t: RPICK.type, v: [] }; x.grants.push(g); }
        if (g.v.indexOf(v) < 0) g.v.push(v);
        DIRTY.add('grant:' + x.id);
      });
      render();
      const anchor = $('[data-bulk-grant]');
      if (anchor) paintRPick(anchor); else closePop();
      return;
    }
    if (rpVal && RPICK) {
      const p = personById(RPICK.pid); if (!p) return;
      const v = rpVal.getAttribute('data-rp-val');
      let g = RPICK.gi != null ? p.grants[RPICK.gi] : null;
      if (!g) { g = { r: RPICK.role, t: RPICK.type, v: [] };
                p.grants.push(g); RPICK.gi = p.grants.length - 1;
                GOPEN.add(RPICK.pid + ':' + RPICK.gi); }
      const at = g.v.indexOf(v);
      if (at > -1) g.v.splice(at, 1); else g.v.push(v);
      /* A group emptied of every value is a grant that reaches nothing. */
      if (!g.v.length) { p.grants.splice(RPICK.gi, 1); RPICK.gi = null; RPICK.step = 'type'; }
      DIRTY.add('grant:' + p.id);
      render();
      const anchor = rpAnchor();
      if (anchor) paintRPick(anchor); else closePop();
      return;
    }

    const pMenu = e.target.closest('[data-person-menu]');
    if (pMenu) {
      const p = personById(pMenu.getAttribute('data-person-menu'));
      if (!p) return;
      popover(pMenu, `
        <button class="set2-pop-i" type="button" data-role-new="${esc(p.id)}"><span class="set2-pop-n">Grant a role</span></button>
        ${p.s[0] === 'is-warn' ? '<button class="set2-pop-i" type="button"><span class="set2-pop-n">Resend invite</span></button>' : ''}
        <button class="set2-pop-i" type="button" data-copy="${esc(p.mail)}"><span class="set2-pop-n">Copy email</span></button>
        <button class="set2-pop-i is-err" type="button" data-rm-one="${esc(p.id)}"><span class="set2-pop-n">Remove from workspace</span></button>`);
      return;
    }

    /* ── Selection ── */
    const pk = e.target.closest('[data-pick-p]');
    if (pk) { const id = pk.getAttribute('data-pick-p');
      PICKED.has(id) ? PICKED.delete(id) : PICKED.add(id); render(); return; }

    /* Over what is SHOWN, never over the whole list — a "select all" that
       reaches past the filter is how people revoke rows they never saw. */
    if (e.target.closest('[data-pick-all]')) {
      const ids = [...document.querySelectorAll('[data-pick-p]')]
        .map((b) => b.getAttribute('data-pick-p'));
      const all = ids.length && ids.every((k) => PICKED.has(k));
      ids.forEach((k) => { all ? PICKED.delete(k) : PICKED.add(k); });
      render(); return;
    }
    if (e.target.closest('[data-pick-none]')) { PICKED.clear(); render(); return; }

    /* One role, granted to everyone ticked. Same three-step picker a single
       card uses — the operation is identical, only the target is plural. */
    const bg = e.target.closest('[data-bulk-grant]');
    if (bg) { RPICK = { pid: null, bulk: true, gi: null, step: 'role', q: '', v: [] };
      paintRPick(bg); return; }

    const brs = e.target.closest('[data-bulk-resend]');
    if (brs) { brs.disabled = true; brs.textContent = 'Sent'; return; }

    if (e.target.closest('[data-bulk-rm]')) {
      MODAL = { kind: 'rmpeople', people: PEOPLE.filter((p) => PICKED.has(p.id)) };
      paintModal(); return;
    }
    const rmOne = e.target.closest('[data-rm-one]');
    if (rmOne) {
      const p = personById(rmOne.getAttribute('data-rm-one'));
      if (p) { MODAL = { kind: 'rmpeople', people: [p] }; paintModal(); }
      return;
    }

    /* ── Inviting somebody ── */
    const auRm = e.target.closest('[data-au-rm]');
    if (auRm) { NEWU.mails.splice(+auRm.getAttribute('data-au-rm'), 1); repaintInvite(); return; }

    if (e.target.closest('[data-au-go]')) {
      /* Whatever is still in the box counts — nobody should lose the address
         they just typed because they pressed the button instead of Enter. And
         a draft that is NOT an address stops the send rather than being
         dropped on the floor: silently inviting two of three is the kind of
         partial success nobody notices until the third person asks. */
      if (NEWU.draft.trim() && !commitMail()) return;
      const all = NEWU.mails.slice();
      if (!all.length) return;
      all.forEach((mail, i) => {
        PEOPLE.push({
          id: 'p' + (Date.now() % 100000) + i,
          name: nameFromMail(mail), mail: mail,
          title: 'From your directory',
          s: ['is-warn', 'Invite pending'],
          grants: []
        });
      });
      NEWU.mails = []; NEWU.draft = ''; NEWU.bad = false;
      DIRTY.add('people'); render();
      /* The card arriving with its Pending pill is the real confirmation; the
         button says so too, under the cursor, and the field is ready for the
         next batch. */
      const go = $('[data-au-go]');
      if (go) {
        go.textContent = all.length > 1 ? 'Sent ' + all.length + ' invites' : 'Invite sent';
        setTimeout(() => { const b = $('[data-au-go]');
                           if (b && b.disabled) b.textContent = 'Send invite'; }, 1800);
      }
      const f = $('[data-au-mail]'); if (f) f.focus();
      return;
    }

    /* ── Filters ── */
    if (e.target.closest('[data-f-clear]')) { patch({ f: '' }); return; }

    /* Three states, not two: ascending, descending, and the order the fixture
       is in — which is the authored order and is worth being able to get back
       to without reloading. */
    const th = e.target.closest('[data-sort]');
    if (th) {
      const k = th.getAttribute('data-sort');
      const cur = readF(st).sort || '';
      const next = cur === k ? k + '!' : cur === k + '!' ? '' : k;
      patch({ f: withF(st, 'sort', next || null) });
      return;
    }

    /* ── The date range for one run ── */
    if (e.target.closest('[data-range-clear]')) {
      const c = primaryOf(st); if (c) { c.range = ['', '']; DIRTY.add('range'); render(); }
      return;
    }

    /* ── The connection picker ──
       One control for what the console spread across three: a product picker
       in the page chrome, a CRM picker in a section header, and a disabled
       third copy of the product inside the sync form. */
    const clPick = e.target.closest('[data-client-pick]');
    if (clPick) {
      const cur = clientOf(st);
      popover(clPick, CLIENT_LIST.map((cl) => {
        const n = connectedOf(cl).length;
        return `
        <button class="set2-pop-i${cl === cur ? ' is-on' : ''}" type="button" data-client-go="${esc(cl)}">
          <span class="set2-pop-n">${esc(cl)}</span>
          <span class="set2-pop-s">${n ? n + ' connected' : 'nothing connected'}</span>
        </button>`;
      }).join(''));
      return;
    }
    const cgo2 = e.target.closest('[data-client-go]');
    if (cgo2) { closePop();
      /* The product goes with the client. Carrying it across would leave the
         bar naming a pair that does not exist, which is the bug this replaced. */
      patch({ sc: cgo2.getAttribute('data-client-go'), sp: '', crm: '' }); return; }

    const pick = e.target.closest('[data-prod-pick]');
    if (pick) {
      const cur = prodOf(st);
      popover(pick, connectedOf(clientOf(st)).map((p) => {
        const list = connsOf(p);
        const bad = list.filter((c) => c.health[0] === 'is-err').length;
        return `
        <button class="set2-pop-i${p === cur ? ' is-on' : ''}" type="button" data-prod-go="${esc(p)}">
          <span class="set2-pop-n">${esc(p)}</span>
          <span class="set2-pop-p">${list.map((c) => esc(c.crm)).join(', ')}${bad ? ' \u00b7 ' + bad + ' down' : ''}</span>
        </button>`;
      }).join(''));
      return;
    }
    const pgo = e.target.closest('[data-prod-go]');
    if (pgo) { closePop(); patch({ sp: pgo.getAttribute('data-prod-go'), crm: '' }); return; }

    /* The CRM sub-picker, which exists on Config alone. */
    const cpick = e.target.closest('[data-crm-pick]');
    if (cpick) {
      const cur = crmOf(st);
      popover(cpick, connsOf(prodOf(st)).map((c) => `
        <button class="set2-pop-i${c.id === cur.id ? ' is-on' : ''}" type="button" data-crm-go="${esc(c.crmId)}">
          <span class="set2-pop-n">${esc(c.crm)}</span>
          <span class="set2-pop-p">${esc(c.health[1])}</span>
        </button>`).join(''));
      return;
    }
    const cgo = e.target.closest('[data-crm-go]');
    if (cgo) { closePop(); patch({ crm: cgo.getAttribute('data-crm-go') }); return; }

    /* A URL or a token you have to select by hand is one that gets mis-pasted.
       The button says what happened rather than firing a toast across the
       screen — the thing that changed is under the cursor. */
    const cp = e.target.closest('[data-copy]');
    if (cp) {
      const val = cp.getAttribute('data-copy');
      const was = cp.textContent;
      const done = (ok) => { cp.textContent = ok ? 'Copied' : 'Press Ctrl+C';
                             setTimeout(() => { cp.textContent = was; }, 1400); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(val).then(() => done(true), () => done(false));
      } else { done(false); }
      return;
    }

    const en = e.target.closest('[data-enable]');
    if (en) {
      const row = ENABLE.filter((x) => x.id === en.getAttribute('data-enable'))[0];
      if (row) { row.on = !row.on; DIRTY.add('enable:' + row.id); render(); }
      return;
    }

    /* A broken mapping is not fixed here — it is fixed in Config, on the row
       that broke. Sending someone to the screen that can act beats a button
       that reports the same failure again. */
    const fgo = e.target.closest('[data-fail-go]');
    if (fgo) { const c = connById(fgo.getAttribute('data-fail-go'));
      if (c) patch({ m: 'config', sp: c.product, crm: c.crmId }); return; }
    const ffix = e.target.closest('[data-fail-fix]');
    if (ffix) { ffix.disabled = true; ffix.textContent = 'Queued'; return; }

    const rev = e.target.closest('[data-reveal]');
    if (rev) {
      const f = document.getElementById(rev.dataset.reveal);
      const shown = f.type === 'text';
      f.type = shown ? 'password' : 'text';
      /* The glyph stays and the label flips. Writing a word into the button
         replaced the eye with the text "Hide" and widened the control. */
      rev.setAttribute('aria-pressed', String(!shown));
      rev.setAttribute('aria-label', shown ? 'Show the token' : 'Hide the token');
      rev.title = shown ? 'Show the token' : 'Hide the token';
      rev.classList.toggle('is-on', !shown);
      return;
    }
    /* ── RUN SYNC ──
       It returned. The button was the end of the flow rather than the start of
       one, so the criteria you had just assembled went nowhere and the history
       below never learned that a run had been asked for.

       A run is a row in the history, written from exactly what the form said:
       the criteria as they stand, the window if one is set, and the count
       those criteria match. It lands as RUNNING, because that is what it is
       the moment you press it, and settles a beat later -- a real sync is not
       instantaneous and a history that only ever shows finished runs cannot
       show you one in flight. */
    if (e.target.closest('[data-run]')) {
      const conns = connsOf(prodOf(st));
      if (!conns.length) return;
      const p = primaryOf(st);
      const r = (p && p.range) || ['', ''];

      /* ── A RANGE HAS TO RUN FORWARDS ──
         Both ends are free text as far as the control is concerned, and a pair
         that ends before it starts matches nothing while looking like a
         perfectly ordinary filter. It is caught here rather than discovered in
         a run that returns zero for a reason nobody can see. */
      if (r[0] && r[1] && r[0] > r[1]) {
        RANGE_ERR = true; render();
        const f = $('[data-range="1"]'); if (f) f.focus();
        return;
      }
      RANGE_ERR = false;

      /* ── ONE ROW PER CONNECTOR ──
         The header says the run goes to all of them and the count above the
         button is their total, so a single row against the primary would
         record a third of what the button just promised: the form said 5,057
         and the history said 3,289. Each connector runs with its own criteria
         and reports its own number, and the rows add up to the figure you
         pressed. */
      const when = stampNow();
      const started = conns.map((c) => {
        const crit = c.criteria.map((k) => k.slice());
        if (r[0] || r[1]) crit.push(['Range', rangeLabel(r)]);
        /* Slot 6 is the sortable clock. Slot 0 stays the human string the
           column prints -- one is for the reader, the other for the sort, and
           deriving either from the other would mean parsing a display format. */
        const row = [when, crit, 'run', 'Running', matchCount(c), null, Date.now()];
        c.runs.unshift(row);
        return { c: c, row: row };
      });
      DIRTY.add('runs'); markDirtyStage('history');
      render();
      setTimeout(() => {
        started.forEach(({ c, row }) => {
          if (c.runs.indexOf(row) < 0) return;
          row[2] = 'ok'; row[3] = 'Succeeded';
        });
        render();
      }, 1400);
      return;
    }

    if (e.target.closest('[data-new]')) { MODAL = 'new'; paintModal(); return; }
    if (e.target.closest('[data-open-upload]')) { MODAL = 'upload'; paintModal(); return; }
    if (e.target.closest('[data-open-new]')) { MODAL = 'new'; paintModal(); return; }
    if (e.target.closest('[data-example]')) { downloadExample(); return; }
    if (e.target.closest('[data-close]')) { closeModal(); return; }
    if (e.target.classList && e.target.hasAttribute && e.target.hasAttribute('data-scrim')) { closeModal(); return; }

    const view = e.target.closest('[data-sview]');
    if (view) {
      if (view.dataset.sview === 'raw') RAW.add(view.dataset.sid); else RAW.delete(view.dataset.sid);
      render(); return;
    }

    const ladT = e.target.closest('[data-lad-t]');
    if (ladT) {
      const box = ladT.closest('[data-lad]');
      const open = box.classList.toggle('is-open');
      ladT.setAttribute('aria-expanded', String(open));
      return;
    }

    const rot = e.target.closest('[data-rotate]');
    if (rot) {
      /* Named from the row that was pressed, not from the Fields picker --
         with two connectors on the page those are different CRMs. */
      const c0 = connById(rot.getAttribute('data-rotate')) || crmOf(readURL());
      MODAL = { kind: 'rotate', crm: (c0 || {}).crm || 'this' };
      paintModal(); return;
    }
    if (e.target.closest('[data-rotate-go]')) { closeModal(); return; }

    const node = e.target.closest('[data-node]');
    if (node) {
      const pick = node.closest('[data-pick]');
      const id = node.dataset.node;
      if (e.target.closest('.set2-exp')) {
        if (OPEN.has(id)) OPEN.delete(id); else OPEN.add(id);
      } else if (pick) {
        toggleNode(id, SEL[pick.dataset.pick]);
        DIRTY.add('targets:' + pick.dataset.pick);
      } else { return; }
      /* Repaint the picker in place and nothing else. It used to also update
         the unsaved bar, which no longer exists -- settings apply as they are
         made, so there is no count to keep. */
      if (pick) repaintPicker(pick.dataset.pick, id);
      else render();
    }
  });

  document.addEventListener('input', (e) => {
    /* Repainted on every keystroke ONLY where the form's shape depends on the
       value — the counters and the scope field, which appears once a role is
       chosen. Everything else just stores. */
    /* A comma commits, the same as Enter — people paste comma-separated lists
       out of a spreadsheet and expect that to work. */
    const auM = e.target.closest('[data-au-mail]');
    if (auM) {
      if (auM.value.indexOf(',') > -1) {
        /* A pasted list: every valid address becomes a chip, and whatever did
           not parse stays in the box to be looked at rather than vanishing. */
        const rest = [];
        auM.value.split(',').forEach((part) => {
          const t = part.trim();
          if (!t) return;
          if (MAIL_RE.test(t)) { if (NEWU.mails.indexOf(t) < 0) NEWU.mails.push(t); }
          else rest.push(t);
        });
        NEWU.draft = rest.join(', ');
        NEWU.bad = false;
        repaintInvite();
        return;
      }
      NEWU.draft = auM.value;
      /* Typing retracts the complaint: it was about the previous attempt. */
      if (NEWU.bad) { NEWU.bad = false; repaintInvite(); return; }
      const go = $('[data-au-go]');
      if (go) { go.disabled = !(NEWU.mails.length || MAIL_RE.test(NEWU.draft.trim()));
                go.textContent = 'Send invite' + (NEWU.mails.length + (MAIL_RE.test(NEWU.draft.trim()) ? 1 : 0) > 1 ? 's' : ''); }
      return;
    }

    /* The role picker's own search filters in place rather than re-rendering
       the popover, so the caret never jumps. */
    if (e.target.closest('[data-rp-q]') && RPICK) {
      RPICK.q = e.target.value;
      const q = RPICK.q.toLowerCase();
      $$('.set2-pop-i', $('#setPop')).forEach((b) => {
        b.style.display = b.textContent.toLowerCase().indexOf(q) < 0 ? 'none' : '';
      });
      return;
    }
    /* The team search is URL state like every other filter, but it is written
       on a debounce: a `patch` per keystroke would push a history entry per
       letter and make the back button unusable. */
    const fq = e.target.closest('[data-f-q]');
    if (fq) {
      const v = e.target.value;
      clearTimeout(FQ_T);
      FQ_T = setTimeout(() => {
        const st = readURL();
        const el = $('[data-f-q]');
        const at = el ? el.selectionStart : null;
        patch({ f: withF(st, 'q', v) });
        const back = $('[data-f-q]');
        if (back) { back.focus(); if (at != null) back.setSelectionRange(at, at); }
      }, 260);
      return;
    }

    const f = e.target.closest('[data-pfilter]');
    if (f) {
      const pick = f.closest('[data-pick]');
      FILTER[pick.dataset.pick] = f.value.toLowerCase().trim();
      const sel = f.selectionStart;
      repaintPicker(pick.dataset.pick);
      const nf = $(`[data-pick="${pick.dataset.pick}"] [data-pfilter]`);
      if (nf) { nf.focus(); nf.setSelectionRange(sel, sel); }
      return;
    }
    /* Type-to-confirm. The button stays dead until the name matches, so the
       gate is the typing rather than the clicking. */
    /* The confirmed removal. Bound before the generic confirm handler so the
       people case is not mistaken for a retention delete. */
    const rmGo = e.target.closest('[data-confirm-go]');
    if (rmGo && MODAL && MODAL.kind === 'rmpeople') {
      MODAL.people.forEach((p) => {
        const i = PEOPLE.indexOf(p); if (i > -1) PEOPLE.splice(i, 1);
        PICKED.delete(p.id);
      });
      closeModal(); render(); return;
    }

    const cf = e.target.closest('[data-confirm]');
    if (cf) {
      const ok = $('[data-confirm-go]');
      /* Accepts the number with or without its thousands separators, because
         insisting on the comma tests typing rather than reading. */
      const v = cf.value.trim().toLowerCase().replace(/[\s,]/g, '');
      const want = String(cf.dataset.confirm).toLowerCase().replace(/[\s,]/g, '');
      if (ok) ok.disabled = v !== want;
      return;
    }
    /* ── RETENTION THRESHOLD ──
       The consequence recomputes as you type, because a number whose effect
       you cannot see is a number you cannot judge. That was the intent; it was
       not what shipped.

       IT WAS WRITING INTO A ROW THAT DOES NOT EXIST. The handler reached for
       `.set2-row` / `.set2-row-d` / `.set2-from`; `secRetention` renders
       `.set2-set-row` / `.set2-set-d`. `closest` returned null, `$` falls back
       to `document` when its root is falsy, the document has no `.set2-row-d`
       either, and the assignment threw — AFTER `r.days = v` had already
       changed the model.

       So lowering FreshDesk from 90 days to 10 left the row saying "2,105
       records would go" while the confirmation it feeds said 3,976. The error
       was silent, and it was DIRECTIONAL: it always understated the damage as
       you made the threshold more destructive. On the one control here that
       cannot be undone.

       One call to `wouldDelete(r)`, one sentence, written by the same code
       that renders it — so the row and the dialog cannot drift again. */
    /* A credential field wakes its own Save, and only its own, and only when
       the value actually differs from what is stored. Clearing the field puts
       the button back to sleep: an empty endpoint is not a setting. */
    const whi = e.target.closest('[data-wh-in]');
    if (whi) {
      const key = whi.getAttribute('data-wh-in');
      const [cid, which] = key.split(':');
      const ep = ENDPOINTS[cid];
      const b = $('[data-wh-save="' + key + '"]');
      if (ep && b) {
        const v = whi.value.trim();
        const dirty = !!v && v !== (which === 'url' ? ep.url : ep.token);
        b.disabled = !dirty; b.classList.toggle('is-dirty', dirty); b.textContent = 'Save';
      }
      return;
    }
    const ret = e.target.closest('[data-ret]');
    if (ret) {
      const r = RETENTION.filter((x) => x.id === ret.dataset.ret)[0];
      const v = parseInt(ret.value, 10);
      const rowEl = ret.closest('[data-ret-row]');
      if (r && v > 0 && rowEl) {
        r.days = v;
        DIRTY.add('retention:' + r.id);
        const said = $('.set2-ret-says', rowEl);
        if (said) said.innerHTML = retentionSays(r);
        /* The spine's note is the same fact one column to the left. Leaving it
           reading "over 90 days" beside an input reading 10 is the stale-index
           problem in miniature. */
        markDirtyStage('retention');
      }
    }
    /* Filtered in place. Re-rendering on each keystroke would rebuild the box
       being typed into and take the caret with it. */
    const cq = e.target.closest('[data-crit-q]');
    if (cq) {
      const box = $('[data-crit-list]');
      const st0 = readURL();
      const c0 = primaryOf(st0);
      if (box && c0) {
        const q = cq.value.toLowerCase().trim();
        box.innerHTML = critRows(c0, q);
        box.hidden = !q;
        cq.setAttribute('aria-expanded', String(!!q));
      }
      return;
    }
    /* One horizon for the product, written the moment it is chosen. */
    const win = e.target.closest('[data-window]');
    if (win) {
      const v = parseInt(win.value, 10);
      if (v > 0) connsOf(prodOf(readURL())).forEach((c) => { c.window = v; });
      render(); return;
    }
    if (e.target.hasAttribute && e.target.hasAttribute('data-dirty')) {
      /* Keyed by `data-dirty`, not by `id`. These inputs carry no id, so this
         was adding "" every time -- one empty string in a Set, which meant the
         count read 1 no matter how many different fields you had touched. */
      DIRTY.add(e.target.getAttribute('data-dirty'));
      /* The field knows which section it sits in; the spine should not have to
         guess at it. */
      const sec = e.target.closest('[id^="st-"]');
      if (sec) markDirtyStage(sec.id.slice(3)); else bumpUnsaved();
    }
  });

  /* Clicking away is an answer as much as Enter is: a named draft is kept, an
     empty one is dropped. Deferred a tick so a click on another control lands
     first and is not swallowed by the re-render this causes. */
  document.addEventListener('focusout', (e) => {
    const f = e.target.closest && e.target.closest('[data-newname]');
    if (!f) return;
    const v = f.value;
    /* The guard is "is there still a draft to settle", NOT "is the field still
       focused". It read `$('[data-newname]') === e.target` and returned — and
       right after a blur the input IS still that element, because nothing has
       re-rendered yet, so clicking away never kept or dropped anything.
       Enter and Escape re-render first, so by this tick the field is gone and
       this correctly does nothing. */
    setTimeout(() => {
      if (!$('[data-newname]')) return;
      settleDraft(!!(v && v.trim()));
    }, 0);
  });

  /* A popover is dismissed by anything that is not itself. */
  document.addEventListener('mousedown', (e) => {
    const p = document.getElementById('setPop');
    if (p && !p.contains(e.target)
        && !e.target.closest('[data-path],[data-add-sub],[data-tf],[data-crit-add],[data-prod-pick],[data-crm-pick],[data-client-pick]')) closePop();
  });

  document.addEventListener('change', (e) => {
    const fs = e.target.closest('[data-f]');
    if (fs) { const st = readURL();
      patch({ f: withF(st, fs.getAttribute('data-f'), fs.value) }); return; }

    /* Touching either end retracts the complaint: it was about the pair as it
       stood, and the pair has changed. */
    if (e.target.closest('[data-range]') && RANGE_ERR) RANGE_ERR = false;
    const rg = e.target.closest('[data-range]');
    if (rg) { const st = readURL(); const c = primaryOf(st);
      if (c) { c.range = c.range || ['', '']; c.range[+rg.getAttribute('data-range')] = rg.value;
               DIRTY.add('range'); render(); }
      return; }

    const t = e.target.closest('[data-skill-on]');
    if (t) { const s = skillById(t.dataset.skillOn); s.on = t.checked; render(); return; }
    const f = e.target.closest('[data-file]');
    if (f && f.files && f.files[0]) readSkillFile(f.files[0]);
  });

  /* Drag and drop on the zone. `dragover` must be cancelled or the browser
     navigates to the file instead of handing it over. */
  document.addEventListener('dragover', (e) => {
    const z = e.target.closest && e.target.closest('[data-drop]');
    if (!z) return;
    e.preventDefault(); z.classList.add('is-over');
  });
  document.addEventListener('dragleave', (e) => {
    const z = e.target.closest && e.target.closest('[data-drop]');
    if (z) z.classList.remove('is-over');
  });
  document.addEventListener('drop', (e) => {
    const z = e.target.closest && e.target.closest('[data-drop]');
    if (!z) return;
    e.preventDefault(); z.classList.remove('is-over');
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) readSkillFile(file);
  });

  /* ═══ KEYBOARD ═══
     The ARIA treeview map, which is the spec's. The tri-state cascade under it
     is ours -- the spec defines `mixed` and says nothing about parent-to-child
     propagation -- and it is the same cascade the mouse gets, because two
     selection models on one widget is how a picker disagrees with itself. */
  document.addEventListener('keydown', (e) => {
    /* The draft field name. Enter keeps it, Escape drops it — the two answers
       to "what is this called", and nothing else needs a key. */
    if (e.target.closest && e.target.closest('[data-newname]')) {
      if (e.key === 'Enter')  { e.preventDefault(); settleDraft(true);  return; }
      if (e.key === 'Escape') { e.preventDefault(); settleDraft(false); return; }
    }
    /* Enter inside the address box commits a chip rather than submitting the
       form — the common case is a second address, not the end of the task. */
    if (e.key === 'Enter' && e.target.closest && e.target.closest('[data-au-mail]')) {
      e.preventDefault();
      NEWU.draft = e.target.value || '';
      /* Enter on an empty box with chips waiting is the end of the list, so
         it sends — the same Enter that added them finishes the job. */
      if (!NEWU.draft.trim() && NEWU.mails.length) { const go = $('[data-au-go]'); if (go) go.click(); return; }
      commitMail();
      return;
    }
    /* Backspace on an empty box takes the last chip back. */
    if (e.key === 'Backspace' && e.target.closest && e.target.closest('[data-au-mail]')
        && !e.target.value && NEWU.mails.length) {
      NEWU.mails.pop(); repaintInvite();
      return;
    }
    /* A credential field commits on Enter and reverts on Escape, so the
       common case never has to leave the keyboard for the Save beside it. */
    const whIn = e.target.closest && e.target.closest('[data-wh-in]');
    if (whIn) {
      const key = whIn.getAttribute('data-wh-in');
      if (e.key === 'Enter') {
        e.preventDefault();
        const b = $('[data-wh-save="' + key + '"]'); if (b && !b.disabled) b.click();
        return;
      }
      if (e.key === 'Escape') {
        const [cid, which] = key.split(':');
        const ep = ENDPOINTS[cid];
        if (ep) { whIn.value = which === 'url' ? ep.url : ep.token;
                  whIn.dispatchEvent(new Event('input', { bubbles: true })); }
        return;
      }
    }

    /* The modal is the only layer this file still owns. It is unambiguously the
       shallowest one on the page: a settings view has no open document and no
       canvas under it, so it does not need a place in the console's ladder —
       it just has to answer first, and registering later achieves that. */
    if (e.key === 'Escape' && MODAL) { closeModal(); return; }
    /* ── A panel you can open with the keyboard, you can leave with it ──

       The popover is dismissed by a mousedown anywhere else, which is the whole
       story for a pointer and none of it for a keyboard. It matters here more
       than for the pickers: this one moves focus to its action button on open,
       so without Escape somebody who pressed "Why it failed" is standing inside
       a panel with no key that gets them out of it.

       Focus goes back to what opened it. Returning it to the body would drop a
       reader at the top of the page they were already halfway down. */
    if (e.key === 'Escape' && document.getElementById('setPop')) {
      const back = POP_OPENER;
      closePop();
      if (back && document.contains(back)) back.focus();
      return;
    }
    const node = e.target.closest && e.target.closest('[data-node]');
    if (!node) return;
    const tree = node.closest('[role="tree"]');
    const pick = node.closest('[data-pick]');
    const rows = $$('[data-node]', tree);
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
        e.preventDefault();
        if (!pick) return;
        toggleNode(id, SEL[pick.dataset.pick]);
        DIRTY.add('targets:' + pick.dataset.pick);
        repaintPicker(pick.dataset.pick, id);
        break;
      case 'ArrowDown': e.preventDefault(); move(i + 1); break;
      case 'ArrowUp':   e.preventDefault(); move(i - 1); break;
      case 'Home':      e.preventDefault(); move(0); break;
      case 'End':       e.preventDefault(); move(rows.length - 1); break;
      case 'ArrowRight':
        e.preventDefault();
        if (open === 'false') { OPEN.add(id); pick ? repaintPicker(pick.dataset.pick, id) : render(); }
        else if (open === 'true') move(i + 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (open === 'true') { OPEN.delete(id); pick ? repaintPicker(pick.dataset.pick, id) : render(); }
        else {
          const lvl = +node.getAttribute('aria-level');
          for (let j = i - 1; j >= 0; j--)
            if (+rows[j].getAttribute('aria-level') < lvl) { move(j); break; }
        }
        break;
      default: return;
    }
  });

  /* ═══════════════════════════════════════════════════════════════════════
     THE EXPORT

     This file used to end by rendering itself and listening for `popstate`.
     Both assumed it owned a page. It owns a VIEW now, so the console calls in:
     `body` and `nav` return markup, `painted` runs what needs the DOM, `index`
     feeds the one palette, and `init` hands over the URL functions.

     Registered the way chat.js registers `window.AIMY_GATE` — the house
     pattern for "a second script that the shell drives".
     ═══════════════════════════════════════════════════════════════════════ */
  /* `_pages` is exported for the same reason `_stageAt` was: it is the rule
     that decides what the rail lists and what each row says about it, and a
     browser pane can check it against the model without driving a scroll. */
  window.AIMY_SETTINGS = {
    _pages: function (st) {
      const m = moduleById(st.m) || moduleById('config');
      const list = pagesOf(m.id) || [];
      return list.map(function (pg) {
        return { id: pg.id, name: pg.name, state: pageState(st, pg, m) };
      });
    },
    init: function (api) { API = api; },
    body: body,
    nav: nav,
    painted: painted,
    index: searchIndex,
    has: function (id) { return !!moduleById(id); },
    modules: MODULES
  };
})();
