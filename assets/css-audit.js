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

if (orphans.length) {
  console.error('\n  ' + orphans.length + ' class(es) rendered with no CSS rule anywhere:\n');
  orphans.forEach((c) => console.error('    .' + c));
  console.error('');
  process.exit(1);
}
console.log('css-audit: ' + used.size + ' classes checked, no orphans.');
