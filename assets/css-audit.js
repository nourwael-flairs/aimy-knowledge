/* ═══════════════════════════════════════════════════════════════════════
   css-audit.js — every class the product renders must resolve to a rule.

   This exists because a bulk deletion once cut a CSS range between two
   section markers without checking what was inside it, and took the editor,
   the drop layer, the status override and the conflict blocks with it. The
   page still loaded, nothing threw, and the damage was only visible to
   somebody looking at the screen.

   A missing rule is not a runtime error, so no error trap will find it.
   This will.

       node assets/css-audit.js

   Exits non-zero if any class rendered by knowledge.js has no rule in
   knowledge.css or aimy-ds.css.
   ═══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');

const here = __dirname;
const js = fs.readFileSync(path.join(here, 'knowledge.js'), 'utf8');
const css0 = fs.readFileSync(path.join(here, 'knowledge.css'), 'utf8');
const dsCss = fs.readFileSync(path.join(here, 'aimy-ds.css'), 'utf8');
const css = css0 + dsCss;

/* Classes written into markup by the templates. Template holes (`${…}`) are
   skipped: what they resolve to is decided at runtime and cannot be read here.

   Block comments come out first, for the same reason they do before the spacing
   scan below: this file reads source text, not parsed markup, so a comment that
   DESCRIBES a class attribute is indistinguishable from one that renders it.
   The comment on knowledge.js:2351 explaining this very scanner was reported as
   an orphan `.…` — the audit failing on its own documentation. */
const jsCode = js.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
const used = new Set();
for (const m of jsCode.matchAll(/class="([^"$]*)"/g)) {
  for (const c of m[1].split(/\s+/)) if (c) used.add(c);
}

/* Utility and state classes that are deliberately styled only in combination
   (`.type-card.is-compact`), or that carry no visual weight of their own. */
const EXEMPT = new Set(['k-hidden', 'k-enter', 'k-row', 'k-gap-2', 'k-gap-3', 'k-gap-4', 'k-sr']);

const orphans = [...used]
  .filter((c) => !EXEMPT.has(c))
  .filter((c) => !css.includes('.' + c))
  .sort();

/* Control characters in the source. A tooling round-trip silently turned every
   regex word boundary into a literal backspace (0x08): valid JavaScript,
   invisible in an editor, and the regex just stops matching — so a question
   like "which documents does nobody use?" fell through to the coverage-gap
   answer with nothing to show for it. `node --check` passes it happily. */
const ctrl = [];
js.split(/\r?\n/).forEach((line, i) => {
  for (const ch of line) {
    const c = ch.codePointAt(0);
    if (c < 9 || (c > 10 && c < 32)) {
      ctrl.push([i + 1, c, line.trim().slice(0, 70)]);
      break;
    }
  }
});

if (ctrl.length) {
  console.error('\n  ' + ctrl.length + ' line(s) hold a control character:\n');
  ctrl.forEach((row) => console.error('    knowledge.js:' + row[0] + '  0x' + row[1].toString(16) + '  ' + row[2]));
  console.error('\n  0x08 is almost always a word boundary that was eaten in transit.\n');
  process.exit(1);
}

/* ── Spacing ──

   The library declares a 4px scale (`--sp-1…--sp-15`) and says in its own
   documentation: "No hard-coded colors or spacing in product code." An audit
   found 62% of this product's spacing off that scale — thirteen different gap
   values, chosen a component at a time over many rounds, which is exactly what
   uneven rhythm looks like from the inside.

   The scale used here is the library's plus the two dense steps it does not
   have — 2 and 6 — because a 4→8 jump is 100% and small controls need
   something between. The library's own components prove the need: it uses 6px
   42 times and 10px 67 times. Recorded in GAPS.md.

   Above 60 anything on an 8px grid passes: those are layout offsets, not
   rhythm — clearing a fixed input, not spacing two labels. */
const SPACE = [2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 60];
const ok = (n) => SPACE.includes(n) || (n > 60 && n % 8 === 0);

const bad = [];
const noComments = css0
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
noComments.split(/\r?\n/).forEach((line, i) => {
  /* Every declaration on the line, not just the first — one-line rules are
     common here and a guard that stops at the first is a guard with a hole. */
  for (const m of line.matchAll(/(?<![-\w])(padding|margin|gap|row-gap|column-gap)(-top|-right|-bottom|-left)?\s*:([^;{}]+);/g)) {
    /* Negative values are optical corrections, not rhythm. Each one is a
       judgment about a specific glyph and does not belong to a scale. */
    (m[3].match(/(?<!-)\b\d+(?:\.\d+)?px/g) || []).forEach((v) => {
      const n = parseFloat(v);
      if (n > 0 && !ok(n)) bad.push([i + 1, n, line.trim().slice(0, 62)]);
    });
  }
});

if (bad.length) {
  console.error('\n  ' + bad.length + ' spacing value(s) off the scale:\n');
  bad.forEach((row) => console.error('    knowledge.css:' + row[0] + '  ' + row[1] + 'px  ' + row[2]));
  console.error('\n  Scale: ' + SPACE.join(' · ') + ' (and 8px multiples above 60).\n');
  process.exit(1);
}

/* ── Type scale ──

   Same reasoning as spacing, and the same history: the library declares
   --fs-2xs…--fs-5xl and then uses it zero times — 265 literal sizes in
   aimy-ds.css, 55% off its own scale, clustered at the small end (8, 8.5, 9,
   9.5, 10.5, 11.5, 12.5). Twenty-six distinct sizes existed across this repo
   against an eleven-step declared scale. A scale that is declared and not
   enforced is a suggestion.

   The check is on the TOKEN, not the value, and that is deliberate: --ty-title
   and --ty-body re-point inside panels, so a rule saying `15px` is right on one
   surface and wrong on the other, while a rule saying var(--ty-body) is right
   on both. Checking values would make the density scale unexpressible.

   --fs-* is banned outright. It is the library's PAGE scale, and reaching for
   it is how 10px arrives without anybody having decided on 10px.

   Exempt a line with an `scale-ok:` comment on it or above it, and say why.
   A blanket exemption list is a thing nobody reads; a reason beside the rule
   is a thing somebody argues with. */
const OUT_OF_SCOPE = /\.(topnav-|ov-chat|overlay-|turn-|aimy-|conv-|proto-)/;
const TYPE_OK = /^(?:inherit|var\(--ty-(?:display|title|body|meta|micro)\))$/;
const rawLines = css0.split(/\r?\n/);
const noCLines = noComments.split(/\r?\n/);

/* The rule a declaration belongs to, so the scope exclusions can be applied.
   Walks back to the nearest selector, which is enough here: this file has no
   nested rules outside @media, and an @media prelude never matches. */
const selectorFor = (i) => {
  for (let j = i; j >= 0; j--) {
    const m = noCLines[j].match(/([^{}\n]+)\{\s*$/) || noCLines[j].match(/^([^{}]*?)\s*\{/);
    if (m) return m[1].trim();
  }
  return '';
};
const exempt = (i, tag) =>
  new RegExp(tag).test(rawLines[i] || '') || new RegExp(tag).test(rawLines[i - 1] || '');

const typeBad = [];
noCLines.forEach((line, i) => {
  for (const m of line.matchAll(/(?<![-\w])font-size\s*:\s*([^;{}]+)[;}]/g)) {
    const v = m[1].trim();
    if (TYPE_OK.test(v) || exempt(i, 'scale-ok:') || OUT_OF_SCOPE.test(selectorFor(i))) continue;
    typeBad.push([i + 1, v, line.trim().slice(0, 56)]);
  }
});

/* ── Ink floor ──

   The ramp inverts between themes at every rung but one. --d500 is #637280 in
   BOTH, so it is the pivot, and a role pointing at it has no symmetric
   meaning: it measures 4.56 in light and 3.10 in dark. GAPS §1.8 carried a
   contrast table measured in light and labelled dark for a whole pass, and
   five label classes were moved onto --d500 on the strength of it. This is the
   check that would have caught that.

   `color:` only. --d500 and below stay legal for borders, backgrounds and icon
   fills, where the 3:1 non-text threshold applies — hence the lookbehind, which
   keeps background-color, border-color, caret-color and scrollbar-color out. */
const INK_BANNED = /var\(\s*--(?:d(?:500|600|700|750|800|850|900|950)|accent)\s*\)/;
const inkBad = [];
noCLines.forEach((line, i) => {
  for (const m of line.matchAll(/(?<![-\w])color\s*:\s*([^;{}]+)[;}]/g)) {
    if (!INK_BANNED.test(m[1]) || exempt(i, 'ink-ok:') || OUT_OF_SCOPE.test(selectorFor(i))) continue;
    inkBad.push([i + 1, m[1].trim(), line.trim().slice(0, 56)]);
  }
});

/* ── Every token resolves ──

   `var(--d150, var(--d200))` stood on the three main PROSE surfaces for
   several passes. --d150 does not exist; the fallback quietly supplied --d200,
   so the page looked deliberate and the declaration was a typo.
   `var(--lh-normal)` did the same on two rules with no fallback at all. Neither
   throws, neither renders wrong enough to see, and no error trap will find
   them. A fallback masks intent, so a token carrying one is flagged too. */
const defined = new Set();
for (const m of (css0 + dsCss).matchAll(/(--[\w-]+)\s*:/g)) defined.add(m[1]);
const TOKEN_EXEMPT = new Set(['--i', '--st']);   /* both set from markup, not CSS */
const undef = new Map();
for (const m of noComments.matchAll(/var\(\s*(--[\w-]+)/g)) {
  if (!defined.has(m[1]) && !TOKEN_EXEMPT.has(m[1])) undef.set(m[1], (undef.get(m[1]) || 0) + 1);
}

/* ── Every filter key exists ──

   Two controls shipped filtering nothing, and neither threw: the Work state
   dropdown wrote `st.work` and the tray's Expired and Due chips wrote
   `st.trust`. Neither key is in LIST_KEYS, so `serialize` never emitted it,
   `parseParams` never read it back, and `applyFilters` never looked at it —
   six options and two chips moving a URL parameter nothing consumes.

   `addFilter` is why it is silent: its last branch is `else st[key] = value`,
   which accepts any key at all. That is correct for `q` and `prop`, and it
   means a typo lands in the state object and stops there.

   The keys are read out of the source rather than imported, because this file
   cannot execute the IIFE that holds them. */
const keyList = (name) => {
  const m = js.match(new RegExp('const ' + name + '\\s*=\\s*\\[([\\s\\S]*?)\\]'));
  return m ? (m[1].match(/'([^']+)'/g) || []).map((q) => q.slice(1, -1)) : [];
};
const FILTER_KEYS = new Set(
  keyList('LIST_KEYS').concat(keyList('DATE_KEYS'), keyList('FLAG_KEYS'), ['q', 'prop'])
);
const keyBad = [];
if (FILTER_KEYS.size) {
  /* Only the filter-control array. `{ key, label }` is a common enough shape
     that scanning for it everywhere also catches the tree's grouping axes and
     the document's property fields, and those keep their own namespaces on
     purpose — `col` groups the folder view, `collection` filters the set. */
  const arr = js.match(/const PRIMARY_FILTERS\s*=\s*\[([\s\S]*?)\];/);
  if (arr) {
    for (const m of arr[1].matchAll(/key:\s*'([\w-]+)'/g)) {
      if (!FILTER_KEYS.has(m[1])) keyBad.push([0, "key: '" + m[1] + "'", 'PRIMARY_FILTERS']);
    }
  }
  /* Quick chips, which live in the shell: data-quick="key=value" */
  const shell = fs.readFileSync(path.join(here, '..', 'index.html'), 'utf8');
  for (const m of shell.matchAll(/data-quick="([\w-]+)=/g)) {
    if (!FILTER_KEYS.has(m[1])) keyBad.push([0, 'data-quick="' + m[1] + '="', 'index.html']);
  }
}

const report = (rows, head, tail) => {
  if (!rows.length) return false;
  console.error('\n  ' + rows.length + ' ' + head + ':\n');
  rows.forEach((r) => console.error('    knowledge.css:' + r[0] + '  ' + r[1] + '  ' + (r[2] || '')));
  console.error('\n  ' + tail + '\n');
  return true;
};

let failed = false;
failed = report(typeBad, 'font-size(s) off the type scale',
  'Scale: --ty-display · --ty-title · --ty-body · --ty-meta · --ty-micro (12px floor).\n' +
  '  --fs-* is the library page scale and this product does not use it.') || failed;
failed = report(inkBad, 'text colour(s) below the ink floor',
  'Text uses --ink-primary / secondary / quiet / faint / action. --d500 and below\n' +
  '  are non-text only (3:1). Exempt one line with an `ink-ok:` comment and a reason.') || failed;
failed = report([...undef].map(([t, n]) => [0, t, '\u00d7' + n]), 'token(s) referenced but never defined',
  'A var() with no declaration renders as its fallback, or as nothing. Neither throws.') || failed;
failed = report(keyBad, 'filter key(s) the state model does not declare',
  'Keys are LIST_KEYS + DATE_KEYS + FLAG_KEYS, plus q and prop. addFilter takes any key at all.') || failed;
if (failed) process.exit(1);

if (orphans.length) {
  console.error('\n  ' + orphans.length + ' class(es) rendered with no CSS rule anywhere:\n');
  orphans.forEach((c) => console.error('    .' + c));
  console.error('');
  process.exit(1);
}
console.log('css-audit: ' + used.size + ' classes checked · no orphans · spacing and type on scale · ink above the floor · every token resolves.');
