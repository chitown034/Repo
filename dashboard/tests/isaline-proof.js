// Targeted proof that isaLineMergeArrays no longer loses a message that arrives with no id.
const fs = require('fs');
const src = fs.readFileSync(process.argv[2] || 'deck/command-deck.html', 'utf8');
const js = src.match(/<script>([\s\S]*?)<\/script>/g).pop();
const body = js.replace(/^<script>/, '').replace(/<\/script>$/, '');
const start = body.indexOf('function isaLineMergeArrays');
const end = body.indexOf('function isaLineMergeRead');
const fn = body.slice(start, end);
const ctx = { ISA_LINE_MAX: 500, lsShapeWarn(){}, };
const run = new Function('ISA_LINE_MAX', 'lsShapeWarn', fn + '; return isaLineMergeArrays;');
const merge = run(ctx.ISA_LINE_MAX, ctx.lsShapeWarn);

const withId = Array.from({length: 40}, (_, i) => ({id: 'x'+i, ts: '2026-09-22T0'+(i%10)+':00:00Z', from: 'isa', text: 'msg '+i}));
const noId   = [
  {ts: '2026-09-22T11:00:00Z', from: 'isa', text: 'urgent: buyer needs a callback tonight'},
  {ts: '2026-09-22T11:05:00Z', from: 'isa', text: 'EOD summary attached'},
];
const a = withId.slice(0, 20).concat([noId[0]]);
const b = withId.slice(20).concat([noId[1]]);

const out = merge(a, b);
const texts = new Set(out.map(m => m.text));
const lostIdless = noId.filter(m => !texts.has(m.text));
const lostIded  = withId.filter(m => !texts.has(m.text));

// idempotence: merging the result with itself must not duplicate the id-less rows
const again = merge(out, out);
const dupes = again.length !== out.length;

console.log('merged rows            :', out.length, '(expected', withId.length + noId.length + ')');
console.log('id-less messages lost  :', lostIdless.length, lostIdless.map(m=>m.text));
console.log('id-bearing lost        :', lostIded.length);
console.log('derived ids assigned   :', out.filter(m=>m.idDerived).length);
console.log('replay duplicates rows :', dupes, '(', out.length, '->', again.length, ')');
const ok = lostIdless.length === 0 && lostIded.length === 0 && !dupes;
console.log(ok ? 'PROOF PASS — nothing lost, replay idempotent' : 'PROOF FAIL');
process.exit(ok ? 0 : 1);
