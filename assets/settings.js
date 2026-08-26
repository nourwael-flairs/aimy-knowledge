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
  const I = {
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
  const CTX_FIELDS = ['Agent name', 'Email address', 'Email domain', 'Ticket number',
                      'Priority level', 'Ticket subject', 'Company name', 'Created at'];

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
      maps: [
        { ctx: 'Agent name',     path: ['assignee', 'name'] },
        { ctx: 'Email address',  path: ['requester', 'email'] },
        { ctx: 'Email domain',   path: ['requester', 'organization', 'domain'] },
        { ctx: 'Ticket number',  path: ['ticket', 'id'], idres: true },
        { ctx: 'Priority level', path: ['ticket', 'priority'],
          values: [['5', 'Closed'], ['2', 'Open'], ['3', 'Pending']] }
      ],
      criteria: [['Status', 'Solved'], ['Form', 'Customer Support']],
      runs: [
        ['31 Oct, 15:41', [['Status', 'Closed'], ['Form', 'Sales']], 'run', 'Running', 412],
        ['31 Oct, 14:14', [['Status', 'Solved'], ['Form', 'Customer Support']], 'ok', 'Succeeded', 1284],
        ['31 Oct, 13:58', [['Status', 'Open'], ['Form', 'Billing']], 'err', 'Failed', 0]
      ] },

    { id: 'fb-freshdesk', product: 'FileBound Support', crm: 'FreshDesk', crmId: 'freshdesk',
      health: ['is-err', 'Token rejected'], last: '26 Jul', every: 'Every hour',
      window: 90, records: 4210,
      /* Deliberately broken: `contact.organization` does not exist in FreshDesk,
         whose equivalent is `contact.company`. This is what a renamed field on
         the connector's side looks like from in here. */
      maps: [
        { ctx: 'Agent name',    path: ['agent', 'name'] },
        { ctx: 'Email address', path: ['contact', 'email'] },
        { ctx: 'Email domain',  path: ['contact', 'organization', 'domain'] }
      ],
      criteria: [['Status', 'Open']],
      runs: [['26 Jul, 09:02', [['Status', 'Open']], 'err', 'Failed', 0]] },

    { id: 'ks-zendesk', product: 'Knowledge Search', crm: 'Zendesk', crmId: 'zendesk',
      health: ['is-warn', '3 records skipped'], last: '2 hours ago', every: 'Every 6 hours',
      window: 30, records: 340,
      maps: [{ ctx: 'Ticket subject', path: ['ticket', 'subject'] }],
      criteria: [], runs: [] }
  ];
  const connById = (id) => CONNECTIONS.filter((c) => c.id === id)[0];

  /* Everything already in a fixture was authored by a person, so it is
     confirmed. Every context field NOT yet mapped gets a proposal appended, so
     the table always shows the full vocabulary and never an empty page. */
  CONNECTIONS.forEach((c) => {
    c.maps.forEach((m) => { m.state = 'confirmed'; });
    CTX_FIELDS.forEach((ctx) => {
      if (c.maps.some((m) => m.ctx === ctx)) return;
      const p = propose(c.crmId, ctx);
      c.maps.push(p
        ? { ctx: ctx, path: p.path, state: 'suggested', confidence: p.confidence }
        : { ctx: ctx, path: [], state: 'unmapped' });
    });
    /* Keep the authored order, then suggestions, then the ones nothing could
       be found for. Sorting by state rather than name means the work to do
       collects at the bottom without anything being hidden. */
    const rank = { confirmed: 0, suggested: 1, unmapped: 2 };
    c.maps.sort((a, b) => rank[a.state] - rank[b.state]);
  });

  const mapCounts = (c) => ({
    confirmed: c.maps.filter((m) => m.state === 'confirmed').length,
    suggested: c.maps.filter((m) => m.state === 'suggested').length,
    unmapped:  c.maps.filter((m) => m.state === 'unmapped').length,
    broken:    c.maps.filter((m) => m.path.length && !walkPath(c.crmId, m.path).ok).length,
    total:     CTX_FIELDS.length
  });

  /* Match count. Every criterion narrows, so the number falls as you add one.
     Deterministic from the criteria themselves, because a figure that moved on
     its own would be worse than no figure. */
  /* ANY genuinely selects more than ALL, and the figure has to move or the
     control is decoration. Intersecting filters narrow; a union of the same
     filters widens toward the sum of their individual shares. */
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

  const PEOPLE = [
    { id: 'p1', name: 'Alex Smith', mail: 'alex.smith@flairstech.com', s: ['is-ok', 'Active'],
      grants: [['Super Admin', 'Product', 'InterFAX Support'], ['QA Manager', 'Client', 'CXS']] },
    { id: 'p2', name: 'Saly Tarek', mail: 'saly.tarek@flairstech.com', s: ['is-warn', 'Invite pending'], grants: [] },
    { id: 'p3', name: 'A. Mahfouz', mail: 'a.mahfouz@flairstech.com', s: ['is-ok', 'Active'],
      grants: [['Admin', 'Organisation', 'FlairsTech']] }
  ];

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
  const MODULES = [
    { g: 'AI Controls', id: 'skills', name: 'Skills', n: () => SKILLS.length },
    { g: 'AI Controls', id: 'agents', name: 'Agents and tools', n: () => AGENTS.length },
    { g: 'AI Controls', id: 'grounding', name: 'Grounding', n: () => COLS.filter((c) => c.on).length },

    { g: 'Organization', id: 'people', name: 'People', n: () => PEOPLE.length },
    { g: 'Organization', id: 'roles', name: 'Roles and permissions', n: () => ROLES.length },
    { g: 'Organization', id: 'hierarchy', name: 'Hierarchy', n: () => LEAF_TOTAL },
    { g: 'Organization', id: 'plan', name: 'Entitlements and plan' },

    /* Field mapping and sync were two rail items in the console and are one
       here, because they are two halves of one connection's contract and
       neither is legible without the other. */
    { g: 'Operations', id: 'connections', name: 'Connections', n: () => CONNECTIONS.length },
    { g: 'Operations', id: 'retention', name: 'Retention' },
    { g: 'Operations', id: 'webhooks', name: 'Enablement webhooks' },
    { g: 'Operations', id: 'audit', name: 'Audit trail', tier: 'Enterprise' }
  ];
  const GROUPS = ['AI Controls', 'Organization', 'Operations'];
  const moduleById = (id) => MODULES.filter((m) => m.id === id)[0];

  /* ═══ STATE ═══
     Read fresh on every render, never mirrored in a variable that can disagree
     with the address bar. */
  function readURL() {
    const p = new URLSearchParams(location.search);
    const m = p.get('m') || 'skills';
    const lens = ['yours', 'org', 'eff'].indexOf(p.get('lens')) >= 0 ? p.get('lens') : 'eff';
    return { m: moduleById(m) ? m : 'skills', skill: p.get('skill') || '',
             conn: p.get('conn') || '', lens: lens };
  }
  function patch(changes) {
    const st = readURL();
    Object.keys(changes).forEach((k) => { st[k] = changes[k]; });
    const p = new URLSearchParams();
    if (st.m && st.m !== 'skills') p.set('m', st.m);
    if (st.skill) p.set('skill', st.skill);
    /* Rebuilt from scratch every time, so a key this function does not know
       about is a key that silently disappears on the next navigation. */
    if (st.conn) p.set('conn', st.conn);
    if (st.lens && st.lens !== 'eff') p.set('lens', st.lens);
    const qs = p.toString();
    history.pushState(null, '', location.pathname + (qs ? '?' + qs : ''));
    render();
  }
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

  M.skills = function (st) {
    if (st.skill && skillById(st.skill)) return skillDetail(skillById(st.skill), st);
    const mine = SKILLS.filter((s) => s.from === 'Yours');
    const org  = SKILLS.filter((s) => s.from !== 'Yours');
    const list = (arr) => arr.map((s) => {
      const [k, t] = standing(s, st.lens);
      return row({
        go: 'skill:' + s.id, off: !s.on,
        ico: s.trigger === 'always' ? I.bolt : s.trigger === 'manual' ? I.hand : I.doc,
        name: s.name, d: s.desc,
        end: `<span class="set2-from${s.from === 'Organization' ? ' is-org' : ''}">${esc(TRIGGER[s.trigger])}</span>${pill(k, t)}`
      });
    }).join('');

    const showMine = st.lens !== 'org';
    const showOrg  = st.lens !== 'yours';
    return `
      ${showOrg ? `<section class="set2-sec">
        <div class="set2-sec-h"><h2 class="set2-sec-t">From the organization</h2>
          <span class="set2-sec-end set2-from set2-num">${org.length}</span></div>
        <div class="set2-rows">${list(org)}</div>
      </section>` : ''}
      ${showMine ? `<section class="set2-sec">
        <div class="set2-sec-h"><h2 class="set2-sec-t">Yours</h2>
          <span class="set2-sec-end"><button class="btn btn-brand btn-sm" type="button" data-new>New skill</button></span></div>
        <div class="set2-rows">${mine.length ? list(mine) : '<div class="set2-empty"><b>No skills of your own yet</b>Write one, or start from the example file.</div>'}</div>
      </section>` : ''}`;
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

      <section class="set2-sec">
        <div class="set2-sec-h"><h2 class="set2-sec-t">Which level governs</h2></div>
        ${ladder(s, st.lens)}
      </section>

      <section class="set2-sec">
        <div class="set2-sec-h"><h2 class="set2-sec-t">Instructions</h2>
          <span class="set2-sec-end">
            <span class="set2-view">
              <button class="set2-view-b${raw ? '' : ' is-on'}" type="button" data-view="pretty" data-sid="${esc(s.id)}" aria-label="Rendered">${I.eye}</button>
              <button class="set2-view-b${raw ? ' is-on' : ''}" type="button" data-view="raw" data-sid="${esc(s.id)}" aria-label="Source">${I.code}</button>
            </span>
          </span></div>
        <div class="set2-body${raw ? ' is-raw' : ''}">${raw ? esc(toMarkdown(s)) : esc(s.body)}</div>
      </section>

      <section class="set2-sec">
        <div class="set2-sec-h"><h2 class="set2-sec-t">What it reaches</h2></div>
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
      <div class="set2-sec-h"><h2 class="set2-sec-t">Collections agents may answer from</h2></div>
      <div class="set2-rows">${COLS.map((c) => row({
        ico: I.doc, name: c.name, d: c.d, off: !c.on, locked: c.locked,
        end: c.locked ? '' : toggle(c.on, 'Ground on ' + c.name)
      })).join('')}</div>
      <div class="set2-note" style="margin-top:0.75rem">Uploading documents moved to the Console. This decides which collections an agent may stand on, not what is in them.</div>
    </section>`;

  M.people = () => `
    <section class="set2-sec">
      <div class="set2-sec-h"><h2 class="set2-sec-t">People</h2>
        <span class="set2-sec-end"><button class="btn btn-brand btn-sm" type="button">Invite</button></span></div>
      <div class="set2-rows">${PEOPLE.map((p) => row({
        ico: I.user, name: p.name, d: p.grants.length
          ? p.grants.map((g) => g[0] + ' on ' + g[2]).join(' · ')
          : 'No grants. The invite carries no access until it is accepted.',
        end: pill(p.s[0], p.s[1])
      })).join('')}</div>
    </section>`;

  /* ── Roles ──
     A capability matrix, and the values are WORDS. A tick grid encodes a
     binary, and permissions here are not binary: "can read it but not change
     it" is the single most common answer and a checkbox has nowhere to put it.

     Cells that cannot legally change are locked rather than merely unchecked,
     so nobody can save a workspace with no administrator in it. */
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
    <section class="set2-sec">
      <div class="set2-sec-h"><h2 class="set2-sec-t">What each role can do</h2>
        <span class="set2-sec-end"><button class="btn btn-ghost btn-sm" type="button">New role</button></span></div>
      <div class="set2-matrix-wrap">
        <table class="set2-matrix">
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
      <div class="set2-note" style="margin-top:0.75rem">Locked cells cannot be changed. A workspace with no one able to assign roles or change the plan could not be recovered from inside the product.</div>
    </section>`;

  M.hierarchy = () => {
    const rows = [];
    TREE.forEach((n) => walk(n, 1, rows, new Set(), ''));
    return `
      <section class="set2-sec">
        <div class="set2-sec-h"><h2 class="set2-sec-t">Scope explorer</h2>
          <span class="set2-sec-end"><button class="btn btn-ghost btn-sm" type="button">Create client</button></span></div>
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
  M.connections = function (st) {
    if (st.conn && connById(st.conn)) return connectionDetail(connById(st.conn), st);
    const broken = CONNECTIONS.filter((c) => c.maps.some((m) => !walkPath(c.crmId, m.path).ok)).length;
    return `
      <section class="set2-sec">
        <div class="set2-sec-h"><h2 class="set2-sec-t">Connections</h2>
          <span class="set2-sec-end"><button class="btn btn-brand btn-sm" type="button">Connect a CRM</button></span></div>
        <div class="set2-rows">${CONNECTIONS.map((c) => {
          const bad = c.maps.filter((m) => !walkPath(c.crmId, m.path).ok).length;
          /* `d` is escaped downstream, so an HTML entity here ships as the
             literal text `&middot;`. Real characters only in data. */
          return row({
            go: 'conn:' + c.id, ico: I.plug,
            name: c.product,
            d: c.crm + ', ' + c.maps.length + (c.maps.length === 1 ? ' field mapped' : ' fields mapped'),
            end: (bad ? pill('is-err', bad + (bad > 1 ? ' fields broken' : ' field broken')) : '')
               + `<span class="set2-from">${esc(c.last)}</span>`
               + pill(c.health[0], c.health[1])
          });
        }).join('')}</div>
        ${broken ? `<div class="set2-note is-err" style="margin-top:0.75rem">
          A mapped field that no longer exists in the CRM reads as empty, and an empty field answers as though the data were missing rather than misrouted.</div>` : ''}
      </section>`;
  };

  /* ── The contract ── */
  function connectionDetail(c, st) {
    const k = mapCounts(c);
    const bad = k.broken;
    const n = matchCount(c);
    return `
      <button class="set2-back" type="button" data-back>&larr; Connections</button>
      <div class="set2-sec-h" style="margin-bottom:0">
        <h1 class="set2-title" style="font-size:var(--ty-title)">${esc(c.product)}</h1>
        <span class="set2-sec-end">${pill(c.health[0], c.health[1])}</span>
      </div>
      <div class="set2-bar">
        <div class="set2-scope">
          <span class="set2-scope-i">CRM <b>${esc(c.crm)}</b></span><span class="set2-scope-s">&rsaquo;</span>
          <span class="set2-scope-i">${esc(c.every)}</span><span class="set2-scope-s">&rsaquo;</span>
          <span class="set2-scope-i">Last read ${esc(c.last)}</span>
        </div>
      </div>

      ${setupChecklist(c)}

      <section class="set2-sec">
        <div class="set2-sec-h"><h2 class="set2-sec-t">What each field means</h2>
          <span class="set2-sec-end set2-tally">
            <span class="set2-num"><b>${k.confirmed}</b> confirmed</span>
            ${k.suggested ? `<span class="set2-num is-info"><b>${k.suggested}</b> suggested</span>` : ''}
            ${k.unmapped ? `<span class="set2-num is-mute"><b>${k.unmapped}</b> not mapped</span>` : ''}
            ${k.broken ? `<span class="set2-num is-err"><b>${k.broken}</b> broken</span>` : ''}
          </span></div>
        <div class="set2-map">
          <div class="set2-map-hd"><span>AiMY field</span><span>${esc(c.crm)} path and what it returns</span><span></span></div>
          ${c.maps.map((m, i) => mapRow(c, m, i)).join('')}
        </div>
        ${k.suggested ? `<div class="set2-note" style="margin-top:0.5rem">
          <span>${k.suggested} ${k.suggested === 1 ? 'path was' : 'paths were'} proposed from ${esc(c.crm)}'s schema. Check the values, then confirm.</span>
          <span style="margin-left:auto"><button class="btn btn-ghost btn-sm" type="button" data-map-ok-all>Confirm all suggested</button></span>
        </div>` : ''}
        ${bad ? `<div class="set2-note is-err" style="margin-top:0.5rem">${bad} path no longer exists in ${esc(c.crm)}. Fix or clear it.</div>` : ''}
      </section>

      <section class="set2-sec">
        <div class="set2-sec-h"><h2 class="set2-sec-t">How far back to read</h2></div>
        <div class="set2-inline">
          <span>Read records from the past</span>
          <input class="set2-fld set2-fld-n set2-num" type="number" min="1" max="3650"
                 value="${c.window}" data-dirty="window" aria-label="Days of history to read">
          <span>days</span>
        </div>
      </section>

      <section class="set2-sec">
        <div class="set2-sec-h"><h2 class="set2-sec-t">Which records to pull</h2></div>
        ${criteriaEditor(c)}
        <div class="set2-blast">
          <span class="set2-blast-n set2-num">${n.toLocaleString()}</span>
          <span class="set2-blast-l">record${n === 1 ? '' : 's'} match right now, of ${c.records.toLocaleString()}</span>
          <span class="set2-blast-end">
            <button class="btn btn-ghost btn-sm" type="button" data-test>Preview 20</button>
            <button class="btn btn-brand btn-sm" type="button" data-run>Run sync</button>
          </span>
        </div>
      </section>

      <section class="set2-sec">
        <div class="set2-sec-h"><h2 class="set2-sec-t">Recent runs</h2></div>
        ${c.runs.length ? `<div class="set2-runs">
          ${c.runs.map((r) => `
            <div class="set2-run">
              <span class="set2-run-when set2-num">${esc(r[0])}</span>
              <span class="set2-run-crit">${r[1].map((k) => `<span class="set2-chip">${esc(k[0])} <b>${esc(k[1])}</b></span>`).join('')}</span>
              <span class="set2-run-n set2-num">${r[4] ? r[4].toLocaleString() : ''}</span>
              <span class="set2-run-st">${pill(r[2] === 'ok' ? 'is-ok' : r[2] === 'err' ? 'is-err' : 'is-info',
                r[3])}</span>
            </div>`).join('')}
        </div>` : `<div class="set2-empty"><b>No runs yet</b>The first sync will appear here with what it matched.</div>`}
      </section>`;
  }

  /* One mapping. The path is segments, not a string: picking an object-typed
     key reveals the next segment, which is why there is no separate "add
     subfield" control. The console has one, and it is the same act. */
  function mapRow(c, m, i) {
    const res = walkPath(c.crmId, m.path);
    /* A path that resolves but stops on an object points at a structure, not a
       value. `requester.organization` is a real key and still maps nothing, so
       it is incomplete rather than broken, and it says so in those words: the
       fix is to keep going, not to start over. */
    const incomplete = res.ok && (m.path.length === 0 || keysAt(c.crmId, m.path).length > 0);
    const transforms = []
      .concat(m.values ? [{ k: 'values', label: m.values.length + ' values mapped' }] : [])
      .concat(m.idres ? [{ k: 'idres', label: 'ID resolved to name' }] : []);
    const samples = (res.ok && !incomplete) ? samplesFor(c.crmId, m.path) : null;

    /* The row's own verdict, in one word, on the right. Four states and they
       are mutually exclusive, so there is never more than one badge to read. */
    let flag = '';
    if (!res.ok) flag = pill('is-err', 'Not in ' + c.crm);
    else if (m.state === 'unmapped') flag = pill('is-mute', 'Not mapped');
    else if (incomplete) flag = pill('is-warn', 'Incomplete');
    else if (m.state === 'suggested') flag = pill(m.confidence === 'weak' ? 'is-warn' : 'is-info', 'Suggested');

    const cls = [!res.ok ? 'is-broken' : '', incomplete ? 'is-partial' : '',
                 m.state === 'unmapped' ? 'is-unmapped' : '',
                 m.state === 'suggested' ? 'is-suggested' : ''].filter(Boolean).join(' ');

    return `
      <div class="set2-map-row ${cls}" data-map="${i}">
        <span class="set2-map-ctx">${esc(m.ctx)}</span>
        <span class="set2-map-mid">
          <span class="set2-map-path">
            ${m.path.map((seg, j) => `
              ${j ? '<span class="set2-map-dot">.</span>' : ''}
              <button class="set2-seg${!res.ok && res.at === j ? ' is-bad' : ''}" type="button"
                      data-seg="${i}:${j}">${esc(seg)}</button>`).join('')}
            ${incomplete
              ? `${m.path.length ? '<span class="set2-map-dot">.</span>' : ''}
                 <button class="set2-seg is-more" type="button" data-seg="${i}:${m.path.length}">${m.path.length ? 'Choose a key' : 'Map a field'}</button>` : ''}
          </span>
          ${/* What comes back. Three values is enough to recognise a column and
                short enough to sit on one line. */ ''}
          ${samples
            ? `<span class="set2-sample">${samples.slice(0, 3).map((v) => `<i>${esc(v)}</i>`).join('')}</span>`
            : res.ok && !incomplete
              ? '<span class="set2-sample is-none">No values returned</span>'
              : ''}
        </span>
        <span class="set2-map-end">
          ${transforms.map((t) => `<button class="set2-chip is-act" type="button" data-tf="${i}:${t.k}">${esc(t.label)}</button>`).join('')}
          ${flag}
          ${m.state === 'suggested' && res.ok && !incomplete
            ? `<button class="btn btn-ghost btn-sm" type="button" data-map-ok="${i}">Confirm</button>` : ''}
          ${m.state === 'unmapped' ? ''
            : `<button class="set2-x" type="button" data-map-del="${i}" aria-label="Clear ${esc(m.ctx)} mapping">${I.x}</button>`}
        </span>
      </div>`;
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
  function setupSteps(c) {
    const k = mapCounts(c);
    return [
      { t: 'Authorise ' + c.crm, m: '2 min', done: true },
      { t: 'Confirm the field mapping', m: '5 min', done: k.suggested === 0 && k.broken === 0 && k.confirmed > 0 },
      { t: 'Set how far back to read', m: '1 min', done: !!c.window },
      { t: 'Run a preview', m: '1 min', done: !!c.previewed }
    ];
  }
  function setupChecklist(c) {
    if (c.setupHidden) return '';
    const steps = setupSteps(c);
    const done = steps.filter((s) => s.done).length;
    if (done === steps.length) return '';
    return `
      <section class="set2-sec">
        <div class="set2-setup">
          <div class="set2-setup-hd">
            <span class="set2-setup-t">Finish connecting ${esc(c.crm)}</span>
            <span class="set2-setup-n set2-num">${done} of ${steps.length}</span>
            <button class="set2-x" type="button" data-setup-hide aria-label="Hide setup steps">${I.x}</button>
          </div>
          <div class="set2-setup-bar"><i style="width:${Math.round(done / steps.length * 100)}%"></i></div>
          <div class="set2-setup-list">
            ${steps.map((s) => `
              <div class="set2-setup-i${s.done ? ' is-done' : ''}">
                <span class="set2-setup-ck">${s.done ? I.tick : ''}</span>
                <span>${esc(s.t)}</span>
                <span class="set2-setup-m set2-num">${esc(s.m)}</span>
              </div>`).join('')}
          </div>
        </div>
      </section>`;
  }

  /* ── The dry run ──
     Was a ghost button beside Run sync. A preview that shows nothing is worse
     than no preview, because it reads as reassurance. This renders real records
     with the mapping applied, which is the only place the mapping and the data
     are visible together. */
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

  M.retention = () => `
    <section class="set2-sec">
      <div class="set2-sec-h"><h2 class="set2-sec-t">Delete synced records</h2></div>
      <div class="set2-rows">${RETENTION.map((r) => {
        const n = wouldDelete(r);
        return `<div class="set2-row">
          ${I.plug}
          <span class="set2-row-main">
            <span class="set2-row-n">${esc(r.name)}</span>
            <span class="set2-row-d">Older than ${r.days} days</span>
          </span>
          <span class="set2-row-end">
            <input class="set2-fld set2-fld-n set2-num" type="number" min="1" max="3650"
                   value="${r.days}" data-ret="${esc(r.id)}" aria-label="${esc(r.name)} retention in days">
            <span class="set2-from set2-num">${n.toLocaleString()} affected</span>
            <button class="btn btn-ghost btn-sm" type="button" data-ret-go="${esc(r.id)}">Delete now</button>
          </span>
        </div>`;
      }).join('')}</div>
      <div class="set2-note is-warn" style="margin-top:0.75rem">Deleted records cannot be recovered. Lowering a threshold widens what the next run removes.</div>
    </section>`;

  M.webhooks = () => `
    <section class="set2-sec">
      <div class="set2-sec-h"><h2 class="set2-sec-t">Knowledge enablement</h2>
        <span class="set2-sec-end">${pill('is-ok', 'Last call succeeded')}</span></div>
      <div class="set2-field">
        <label class="set2-lbl" for="whUrl">Endpoint</label>
        <input class="set2-fld set2-mono" id="whUrl" data-dirty="webhooks"
               value="https://api.aimy.ai/webhooks/knowledge-enablement/cxs">
        <div class="set2-hint">Called when enrichment is triggered from your side. Last call 6 Jun 2026, 14:02.</div>
      </div>
      <div class="set2-field">
        <label class="set2-lbl" for="whTok">Auth token</label>
        <div class="set2-inline">
          <input class="set2-fld set2-mono" id="whTok" type="password" data-dirty="webhooks"
                 value="eyJhbGciOiJIUzI1NiIsInR5cCI6" autocomplete="off">
          <button class="btn btn-ghost btn-sm" type="button" data-reveal="whTok">Reveal</button>
          <button class="btn btn-ghost btn-sm" type="button" data-rotate>Rotate</button>
        </div>
        <div class="set2-hint">Rotated 4 Mar 2026 by A. Mahfouz. Rotating invalidates the current token immediately.</div>
      </div>
    </section>`;

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
  function popover(anchor, html) {
    closePop();
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
  function closePop() { const p = document.getElementById('setPop'); if (p) p.remove(); }

  function openSegPicker(anchor, c, mi, si) {
    const m = c.maps[mi];
    const opts = keysAt(c.crmId, m.path.slice(0, si));
    if (!opts.length) return;
    const p = popover(anchor, `
      <div class="set2-pop-hd"><input class="set2-fld" type="search" placeholder="Filter keys" data-pop-f aria-label="Filter keys"></div>
      <div class="set2-pop-bd" data-pop-list>
        ${opts.map((k) => {
          const node = keysAt(c.crmId, m.path.slice(0, si).concat([k]));
          return `<button class="set2-pop-i" type="button" data-pick="${esc(k)}">
            <span>${esc(k)}</span>${node.length ? '<span class="set2-pop-t">object</span>' : ''}</button>`;
        }).join('')}
      </div>`);
    p.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      $$('.set2-pop-i', p).forEach((b) => {
        b.style.display = b.textContent.toLowerCase().indexOf(q) < 0 ? 'none' : '';
      });
    });
    p.addEventListener('click', (e) => {
      const b = e.target.closest('[data-pick]');
      if (!b) return;
      m.path = m.path.slice(0, si).concat([b.dataset.pick]);
      DIRTY.add('maps'); closePop(); render();
    });
  }

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

  function openTransform(anchor, c, mi, kind) {
    const m = c.maps[mi];
    popover(anchor, kind === 'values'
      ? `<div class="set2-pop-hd set2-pop-t">Value mapping</div>
         <div class="set2-pop-bd">${m.values.map((v) =>
           `<div class="set2-pop-row"><code>${esc(v[0])}</code><span>reads as</span><b>${esc(v[1])}</b></div>`).join('')}</div>`
      : `<div class="set2-pop-hd set2-pop-t">ID resolution</div>
         <div class="set2-pop-bd"><div class="set2-pop-row"><code>ticket.id</code><span>resolves to</span><b>Display name</b></div></div>`);
  }

  /* ── The confirmation ladder ──
     Friction is graded by consequence, not by which page you are on. A toggle
     applies on the tick. A deletion that cannot be undone asks you to type the
     name, and states the number it is about to remove. */
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
    if (!MODAL) { host.innerHTML = ''; return; }
    host.innerHTML = MODAL === 'new' ? newSkillModal()
                   : MODAL === 'upload' ? uploadModal()
                   : MODAL.kind === 'preview' ? previewModal(MODAL.c)
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

    MODULES.forEach((m) => add([m.g], m.name, { m: m.id }));

    SKILLS.forEach((s) => add(['AI Controls', 'Skills'], s.name, { m: 'skills', skill: s.id }));
    AGENTS.forEach((a) => add(['AI Controls', 'Agents and tools'], a.name, { m: 'agents' }));
    COLS.forEach((c) => add(['AI Controls', 'Grounding'], c.name, { m: 'grounding' }));

    PEOPLE.forEach((p) => add(['Organization', 'People'], p.name, { m: 'people' }));
    ROLES.forEach((r) => add(['Organization', 'Roles and permissions'], r[0], { m: 'roles' }));
    CAPS.forEach(([g, caps]) => caps.forEach(([cap]) =>
      add(['Organization', 'Roles', g], cap, { m: 'roles' })));

    CONNECTIONS.forEach((c) => {
      add(['Operations', 'Connections'], c.product + ' and ' + c.crm, { m: 'connections', conn: c.id });
      add(['Operations', c.product, c.crm], 'How far back to read', { m: 'connections', conn: c.id });
      add(['Operations', c.product, c.crm], 'Which records to pull', { m: 'connections', conn: c.id });
      /* The CRM has to be in the path. One product can hold several
         connections, and without it two results read identically and go to
         different places, which is worse than not finding them. */
      c.maps.filter((m) => m.state !== 'unmapped').forEach((m) =>
        add(['Operations', c.product, c.crm], m.ctx, { m: 'connections', conn: c.id }));
    });
    RETENTION.forEach((r) =>
      add(['Operations', 'Retention'], r.name + ' threshold', { m: 'retention' }));
    add(['Operations', 'Enablement webhooks'], 'Endpoint', { m: 'webhooks' });
    add(['Operations', 'Enablement webhooks'], 'Auth token', { m: 'webhooks' });
    return out;
  }

  let PAL = null;
  function paintPalette() {
    const host = $('#setPal');
    if (PAL === null) { host.innerHTML = ''; return; }
    const q = PAL.toLowerCase().trim();
    const hits = q
      ? searchIndex().filter((e) =>
          (e.name + ' ' + e.path.join(' ')).toLowerCase().indexOf(q) >= 0).slice(0, 12)
      : searchIndex().slice(0, 8);
    host.innerHTML = `
      <div class="set2-scrim is-top" data-pal-scrim>
        <div class="set2-pal" role="dialog" aria-modal="true" aria-label="Search settings">
          <input class="set2-pal-f" type="search" placeholder="Search every setting" value="${esc(PAL)}"
                 data-pal-f autocomplete="off" aria-label="Search every setting">
          <div class="set2-pal-bd">
            ${hits.length ? hits.map((e, i) => `
              <button class="set2-pal-i${i === 0 ? ' is-on' : ''}" type="button" data-pal-go="${esc(JSON.stringify(e.go))}">
                <span class="set2-pal-n">${esc(e.name)}</span>
                <span class="set2-pal-p">${e.path.map(esc).join(' &rsaquo; ')}</span>
              </button>`).join('')
              : `<div class="set2-pal-empty">Nothing matches <b>${esc(PAL)}</b>. Try a field name, a person, or a connector.</div>`}
          </div>
          <div class="set2-pal-ft">
            <span><kbd>&uarr;</kbd><kbd>&darr;</kbd> move</span>
            <span><kbd>&crarr;</kbd> open</span>
            <span><kbd>Esc</kbd> close</span>
          </div>
        </div>
      </div>`;
    const f = $('[data-pal-f]', host);
    if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); }
  }

  /* ═══ RENDER ═══ */
  const RAW = new Set();
  const FILTER = {};

  function rail(st) {
    return `
      <button class="set2-search" type="button" data-pal-open>
        <span>Search settings</span>
        <span class="set2-search-k"><kbd>${/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl'}</kbd><kbd>K</kbd></span>
      </button>` + GROUPS.map((g) => `
      <div class="set2-rail-group">
        <div class="set2-rail-label">${esc(g)}</div>
        ${MODULES.filter((m) => m.g === g).map((m) => `
          <button class="set2-rail-item${m.id === st.m ? ' is-on' : ''}" type="button" data-m="${esc(m.id)}"
            ${m.id === st.m ? 'aria-current="page"' : ''}>
            <span>${esc(m.name)}</span>
            ${m.tier ? I.lock : m.n ? `<span class="set2-rail-n">${m.n()}</span>` : ''}
          </button>`).join('')}
      </div>`).join('');
  }

  function head(st) {
    const m = moduleById(st.m);
    /* Scope reads. The lens is the only control in this bar, which is why it
       is the only thing in it that looks like one. */
    return `
      <h1 class="set2-title">${esc(m.name)}</h1>
      <div class="set2-bar">
        <div class="set2-scope">
          <span class="set2-scope-i">Org <b>FlairsTech</b></span><span class="set2-scope-s">&rsaquo;</span>
          <span class="set2-scope-i">Client <b>CXS</b></span><span class="set2-scope-s">&rsaquo;</span>
          <span class="set2-scope-i">Product <b>Support Copilot</b></span>
        </div>
        <div class="set2-bar-end">
          <div class="seg" role="group" aria-label="Whose settings">
            ${[['yours', 'Yours'], ['org', 'Organization'], ['eff', 'Effective']].map(([v, l]) =>
              `<button class="seg-btn${st.lens === v ? ' active' : ''}" type="button" data-lens="${v}">${l}</button>`).join('')}
          </div>
        </div>
      </div>`;
  }

  function render() {
    const st = readURL();
    const m = moduleById(st.m);
    document.title = 'AiMY Settings, ' + m.name;
    $('#setRail').innerHTML = rail(st);
    const body = (M[st.m] || (() => '<div class="set2-empty"><b>Not built yet</b>This module carries its state only.</div>'))(st);
    /* A detail view brings its own header. Rendering the module header above it
       stacked two titles and two scope lines on one page, and the outer one
       named the list you had just left. */
    $('#setCol').innerHTML = ((st.skill || st.conn) ? '' : head(st)) + body + `
      ${/* Three exits, not two. A half-finished mapping is a normal condition
            and needs somewhere to go that is neither losing the work nor
            publishing it half-done. Navan's bar is the reference. */ ''}
      <div class="set2-save${DIRTY.size ? ' is-on' : ''}" data-save>
        <span class="set2-save-n"><b class="set2-num">${DIRTY.size}</b> unsaved in ${esc(m.name)}</span>
        <span class="set2-save-end">
          <button class="btn btn-ghost btn-sm" type="button" data-discard>Discard</button>
          <button class="btn btn-ghost btn-sm" type="button" data-save-go>Save as draft</button>
          <button class="btn btn-brand btn-sm" type="button" data-save-go>Publish</button>
        </span>
      </div>`;
    seatTabindex();
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

    const railBtn = e.target.closest('[data-m]');
    if (railBtn) { patch({ m: railBtn.dataset.m, skill: '' }); return; }

    const lens = e.target.closest('[data-lens]');
    if (lens) { patch({ lens: lens.dataset.lens }); return; }

    const go = e.target.closest('[data-go]');
    if (go && go.dataset.go.indexOf('skill:') === 0) { patch({ skill: go.dataset.go.slice(6) }); return; }
    if (go && go.dataset.go.indexOf('conn:') === 0) { patch({ conn: go.dataset.go.slice(5) }); return; }

    if (e.target.closest('[data-back]')) { patch({ skill: '', conn: '' }); return; }

    /* ── Path segment picker ──
       Choosing a key at depth N truncates everything deeper, because the
       subtree below it just changed. Keeping the old tail would leave a path
       that reads fine and resolves to nothing. */
    const seg = e.target.closest('[data-seg]');
    if (seg) {
      const [mi, si] = seg.dataset.seg.split(':').map(Number);
      openSegPicker(seg, connById(st.conn), mi, si);
      return;
    }
    const tf = e.target.closest('[data-tf]');
    if (tf) { openTransform(tf, connById(st.conn), +tf.dataset.tf.split(':')[0], tf.dataset.tf.split(':')[1]); return; }

    /* Clearing a mapping does not remove the ROW. The context field still
       exists and still needs an answer, so it drops back to "Not mapped"
       rather than vanishing from a list that is meant to be the full
       vocabulary. */
    const mdel = e.target.closest('[data-map-del]');
    if (mdel) {
      const c = connById(st.conn);
      const m = c.maps[+mdel.dataset.mapDel];
      m.path = []; m.state = 'unmapped'; delete m.values; delete m.idres;
      DIRTY.add('maps'); render(); return;
    }
    const mok = e.target.closest('[data-map-ok]');
    if (mok) {
      const c = connById(st.conn);
      c.maps[+mok.dataset.mapOk].state = 'confirmed';
      DIRTY.add('maps'); render(); return;
    }
    if (e.target.closest('[data-map-ok-all]')) {
      const c = connById(st.conn);
      c.maps.forEach((m) => { if (m.state === 'suggested' && walkPath(c.crmId, m.path).ok) m.state = 'confirmed'; });
      DIRTY.add('maps'); render(); return;
    }

    /* Criteria join. */
    const join = e.target.closest('[data-join]');
    if (join) { connById(st.conn).join = join.dataset.join; DIRTY.add('criteria'); render(); return; }

    /* The dry run. */
    if (e.target.closest('[data-test]')) {
      const c = connById(st.conn);
      c.previewed = true;
      /* Repaint the page under the modal too. The checklist's fourth step is
         "run a preview", and it has just been satisfied -- leaving the page
         stale means the step stays open behind the thing that completed it. */
      render();
      MODAL = { kind: 'preview', c: c };
      paintModal(); return;
    }

    if (e.target.closest('[data-setup-hide]')) {
      connById(st.conn).setupHidden = true; render(); return;
    }

    /* ── Criteria ── */
    const cdel = e.target.closest('[data-crit-del]');
    if (cdel) { const c = connById(st.conn); c.criteria.splice(+cdel.dataset.critDel, 1);
                DIRTY.add('criteria'); render(); return; }
    const cadd = e.target.closest('[data-crit-add]');
    if (cadd) { openCritPicker(cadd, connById(st.conn)); return; }

    /* ── The consequential ones ── */
    const retGo = e.target.closest('[data-ret-go]');
    if (retGo) {
      const r = RETENTION.filter((x) => x.id === retGo.dataset.retGo)[0];
      confirmDelete(r); return;
    }
    const rev = e.target.closest('[data-reveal]');
    if (rev) {
      const f = document.getElementById(rev.dataset.reveal);
      const shown = f.type === 'text';
      f.type = shown ? 'password' : 'text';
      rev.textContent = shown ? 'Reveal' : 'Hide';
      return;
    }
    if (e.target.closest('[data-run]')) return;

    /* ── Palette ── */
    if (e.target.closest('[data-pal-open]')) { PAL = ''; paintPalette(); return; }
    const palGo = e.target.closest('[data-pal-go]');
    if (palGo) { const go = JSON.parse(palGo.dataset.palGo); PAL = null; paintPalette();
                 patch({ m: go.m, skill: go.skill || '', conn: go.conn || '' }); return; }
    if (e.target.hasAttribute && e.target.hasAttribute('data-pal-scrim')) { PAL = null; paintPalette(); return; }

    if (e.target.closest('[data-new]')) { MODAL = 'new'; paintModal(); return; }
    if (e.target.closest('[data-open-upload]')) { MODAL = 'upload'; paintModal(); return; }
    if (e.target.closest('[data-open-new]')) { MODAL = 'new'; paintModal(); return; }
    if (e.target.closest('[data-example]')) { downloadExample(); return; }
    if (e.target.closest('[data-close]')) { closeModal(); return; }
    if (e.target.classList && e.target.hasAttribute && e.target.hasAttribute('data-scrim')) { closeModal(); return; }

    const view = e.target.closest('[data-view]');
    if (view) {
      if (view.dataset.view === 'raw') RAW.add(view.dataset.sid); else RAW.delete(view.dataset.sid);
      render(); return;
    }

    const ladT = e.target.closest('[data-lad-t]');
    if (ladT) {
      const box = ladT.closest('[data-lad]');
      const open = box.classList.toggle('is-open');
      ladT.setAttribute('aria-expanded', String(open));
      return;
    }

    if (e.target.closest('[data-discard]')) { DIRTY.clear(); render(); return; }
    if (e.target.closest('[data-save-go]')) { DIRTY.clear(); render(); return; }

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
      if (pick) { repaintPicker(pick.dataset.pick, id); $('[data-save]').classList.toggle('is-on', DIRTY.size > 0);
                  $('[data-save] .set2-num').textContent = DIRTY.size; }
      else render();
    }
  });

  document.addEventListener('input', (e) => {
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
    if (e.target.closest('[data-pal-f]')) { PAL = e.target.value; paintPalette(); return; }

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
    /* Retention threshold. The consequence recomputes as you type, because a
       number whose effect you cannot see is a number you cannot judge. */
    const ret = e.target.closest('[data-ret]');
    if (ret) {
      const r = RETENTION.filter((x) => x.id === ret.dataset.ret)[0];
      const v = parseInt(ret.value, 10);
      if (r && v > 0) { r.days = v; DIRTY.add('retention:' + r.id);
        const rowEl = ret.closest('.set2-row');
        $('.set2-row-d', rowEl).textContent = 'Older than ' + v + ' days';
        $('.set2-from', rowEl).textContent = wouldDelete(r).toLocaleString() + ' affected';
        const go = $('[data-ret-go]', rowEl);
        if (go) go.textContent = 'Delete now';
      }
    }
    if (e.target.hasAttribute && e.target.hasAttribute('data-dirty')) {
      DIRTY.add(e.target.id);
      const bar = $('[data-save]');
      if (bar) { bar.classList.add('is-on'); $('.set2-num', bar).textContent = DIRTY.size; }
    }
  });

  /* A popover is dismissed by anything that is not itself. */
  document.addEventListener('mousedown', (e) => {
    const p = document.getElementById('setPop');
    if (p && !p.contains(e.target) && !e.target.closest('[data-seg],[data-tf],[data-crit-add]')) closePop();
  });

  document.addEventListener('change', (e) => {
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
    /* Open from anywhere. Meta on mac, Ctrl elsewhere. */
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault(); PAL = PAL === null ? '' : null; paintPalette(); return;
    }
    if (PAL !== null) {
      const items = $$('.set2-pal-i');
      const at = items.findIndex((b) => b.classList.contains('is-on'));
      if (e.key === 'Escape') { e.preventDefault(); PAL = null; paintPalette(); return; }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!items.length) return;
        const to = Math.max(0, Math.min(items.length - 1, at + (e.key === 'ArrowDown' ? 1 : -1)));
        items.forEach((b, i) => b.classList.toggle('is-on', i === to));
        items[to].scrollIntoView({ block: 'nearest' });
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const sel = items[at < 0 ? 0 : at];
        if (sel) sel.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        return;
      }
      return;
    }
    if (e.key === 'Escape' && MODAL) { closeModal(); return; }
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

  window.addEventListener('popstate', render);
  render();
})();
