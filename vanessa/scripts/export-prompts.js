const {PROMPTS}=require('../prompts.js');
let md='# VANESSA 3.0 — Claude Build Prompts\n\nPaste each prompt into Claude Code in order (P1 first). **P2 is the MBS Highway Home Report workflow** (HR1–HR7); **P3–P5 are the Supabase buy-vs-rent, debt-consolidation and 5/1 ARM calculators.** Generated from `prompts.js` — edit that file, then run `node scripts/export-prompts.js`.\n\n';
let g='';for(const p of PROMPTS){if(p.group!==g){g=p.group;md+='## '+g+'\n\n';}md+='### '+p.id+' — '+p.title+'\n\n```text\n'+p.body+'\n```\n\n';}
require('fs').writeFileSync(__dirname+'/../docs/CLAUDE_BUILD_PROMPTS.md',md);
