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
const css = fs.readFileSync(path.join(here, 'knowledge.css'), 'utf8') +
            fs.readFileSync(path.join(here, 'aimy-ds.css'), 'utf8');

/* Classes written into markup by the templates. Template holes (`${…}`) are
   skipped: what they resolve to is decided at runtime and cannot be read here. */
const used = new Set();
for (const m of js.matchAll(/class="([^"$]*)"/g)) {
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
const noComments = fs.readFileSync(path.join(here, 'knowledge.css'), 'utf8')
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

if (orphans.length) {
  console.error('\n  ' + orphans.length + ' class(es) rendered with no CSS rule anywhere:\n');
  orphans.forEach((c) => console.error('    .' + c));
  console.error('');
  process.exit(1);
}
console.log('css-audit: ' + used.size + ' classes checked, no orphans, spacing on scale.');
