/* Ops module — Marketing plan (VA Loan Mastermind), EA/ISA SOP, and Zoho CRM sync spec. Sourced from the two uploaded plans. */
const MARKETING = {
  event:{name:"VA Homebuyer Class — Participating Agent & MLO Seminar",date:"Thu Oct 15, 2026 · doors 5:30 PM · program 6:30–9:00 PM",where:"Las Vegas, NV — Nellis AFB corridor",budget:5150,stevenShare:2575,leadSplit:"75% on company-generated leads that close",hook:"Most airmen around Nellis rent — your BAH could build YOUR equity. No NV income tax + $0-down VA loan."},
  personas:[["Active-duty renter (Nellis)","VA Purchase $0-down","Geofencing + Meta"],["Veteran / surviving-spouse homeowner","VA IRRRL / refinance","Database mining, direct mail"],["Hometown hero (teacher, nurse, first responder)","FHA / Conv / Hometown Heroes","Meta lookalikes, agent referrals"],["Equity-rich veteran homeowner 60+","Cash-out, HELOC, HECM","CPA/family office, quarterly seminars"],["Senior officer / defense executive","VA Jumbo, family-office advisory","NDIA, MOAA, warm intros"]],
  kpis:[["Vegas seminar","Registrations","80–100",92],["Vegas seminar","Show-up rate","35–45%",48],["Vegas seminar","Webinar-to-application","8–15%",11],["Vegas seminar","Application-to-closed","30–50%",null],["Google Ads","Search CTR","> 5%",6.1],["Google Ads","Cost per registration","$25–$45",38],["Google Ads","Blended CPA (closed loan)","< $1,200",null],["Google Ads","ROAS","4x minimum",null],["Referral network","Vetted agents per metro","2–3",2],["Family office","Deep partnerships Yr 1","3–5",1],["Family office","LinkedIn acceptance","30–40%",34],["Licensing","Active states by Q2 2027","13",5]],
  channels:[["Meta ads (Special Ad Category: Credit)","21-day campaign; no lookalikes/narrow geo under the category — route around compliantly","$1,800"],["GetGeofencing — Nellis","200,000 impressions, base-adjacent polygons","$1,500"],["Google Ads (always-on)","$10,000/mo program; VA-intent search + YouTube; Phase 1 foundation","$10,000/mo"],["Bring a Battle Buddy referral","Attendee-sent intro texts via QR (W26); no cash for loan referrals","$0"],["Broker-to-broker referral network","25% realtor-to-realtor splits; 10 sourcing channels","$0"],["CPA / estate attorney / family office","White paper + 25 coffee meetings; 1–2 intros each","$500"],["Defense relocation specialists / employers","RMC contacts; base housing offices; chambers (NDIA, MOAA)","memberships"]],
  followUp:[["24 hours","Thank-you email with slides to every registrant","W4 / ISA"],["48 hours","Charles works loan leads; veteran Realtor works buyer leads","ISA"],["Day 7","Warm calls; segment company-generated (75% split) vs self-generated","ISA / Steven"],["Ongoing","CRM tagging by lead source; no-show nurture sequence","Zoho / FUB"],["Conference window Oct 16–19","Delegate same-day follow-up; batch calls into evenings","ISA"]],
  webinars:[["VA Loan Mastermind Live","Bi-weekly · Tue 6 PM PT"],["Hometown Hero Home Buying","Bi-weekly · Thu 6 PM PT"],["Retirement Equity Strategy (Reverse)","Monthly · Sat 10 AM PT"],["Military Officer Wealth Strategy","Quarterly · invite-only"]],
  stack:[["Webinar","WebinarJam or Zoom Webinar"],["CRM","Zoho CRM (mortgage) · Follow Up Boss (real estate)"],["Email","ActiveCampaign"],["Landing pages","ClickFunnels / Unbounce"],["Tracking","GTM + GA4"],["Call tracking","CallRail"],["Compliance archive","Smarsh / Global Relay"]],
  timeline:[["Sept 15","Launch GetGeofencing (200K impressions)","CPA/estate-attorney outreach begins"],["Sept 24","Launch Facebook 21-day campaign","Google Ads Phase 1 foundation"],["Oct 1–14","Monitor registrations, reminders, weekly reports","NDIA/MOAA/Chamber events"],["Oct 15","Event day","—"],["Oct 16–19","24/48-hour follow-up (delegated)","NAMB + CVLS @ Caesars"],["Oct 16–22","Day-7 calls, CRM tagging, no-show nurture","Publish reverse-mortgage white paper"],["Q4 2026","Next seminar in a Tier-1 market","FL, GA, WA licensing; Advisor Briefing webinar"]],
  compliance:["Every Meta mortgage ad under Special Ad Category: Credit","NMLS # + Equal Housing on every piece","No rate/payment claims without full Reg Z trigger-term disclosures","Battle Buddy referrals: no thing of value for loan referrals (RESPA §8)","TCPA consent captured at registration for SMS/calls","Population/BAH figures are planning estimates — verify before publishing"],
};
const SOP = {
  nonNeg:["No lead left behind — every lead identified, routed, contacted, documented, owned, next action set","Speed wins — initial response within 5 minutes during coverage hours","CRM is truth — Zoho for mortgage, FUB for real estate; if it isn't logged it didn't happen","Steven's calendar is a revenue asset — protect prime time for licensed work","Automation before repetition","Every relationship has a cadence","Every process is documented","Compliance before convenience"],
  layers:[["Layer 1 — Steven (licensed producer)","Applications, licensed advice, consultations, negotiation, UW strategy, seminars, high-value relationships, compliance approvals","Admin, data entry, scheduling, first-draft research, routine follow-up"],["Layer 2 — Human ops (EA/ISA, showing asst, TC)","Intake, qualification, scheduling, CRM hygiene, events, transactions, vendors","Anything requiring Steven's license"],["Layer 3 — AI orchestration (Claude Code, Perplexity, You.com, n8n)","Drafts, data aggregation, automation, monitoring, dashboards","Publishing client-facing content; compliance determinations; impersonating Steven"],["Layer 4 — Systems of record (Zoho, FUB, Notion, Arive, Dotloop)","Store outputs so nothing lives only in chat/email/memory","—"]],
  startOfDay:["Review calendar: today + next 3 business days","Zoho: new mortgage leads, hot leads, overdue tasks, appointments, unassigned contacts","FUB: same for real estate","Check channels: FUB Phone, Zoho telephony/SMS, email, social DMs, portals, Slack, voicemail","Pipeline deadlines next 72h: Arive/Zoho (mortgage) + Realty Flow/Dotloop/SkySlope (RE)","Automation health: n8n/Pabbly failures, duplicates, Zoho↔Arive sync","Prepare Steven's daily briefing (appointments, urgent leads, deadline risks, approvals, decisions)","Confirm today's prospecting, partner, recruiting, transaction and content lists"],
  leadSop:["Classify business line first: mortgage vs real estate (both → linked records in both CRMs)","Check for existing record in the applicable CRM; merge duplicates only after verifying identity","Tag source, date/time, business line, state, city/ZIP, intent, owner","Respond within 5 minutes via approved script/channel (Zoho telephony for mortgage)","Attempt a live call when appropriate","Document every attempt and outcome","Collect factual qualification only — no mortgage/legal/tax advice","Qualified → TidyCal consultation on Steven's calendar with buffers + intake","Not ready → consent-based nurture + personal follow-up task","Outside footprint → flag for referral review in Zoho","Cross-line need → create record in other CRM and cross-reference","Escalate hot/urgent/VIP/complaint/high-value immediately"],
  endOfDay:["Every new lead contacted, dispositioned, next action assigned","Clear or reschedule all due tasks — no unexplained overdue","Confirm next-day appointments; send reminders","Review loan/transaction deadlines within 72h","Update dashboards + Notion Mission Control","Daily summary to Steven: wins, appointments, hot leads, risks, approvals, open items, tomorrow's top priorities","Automation exceptions have an owner and date"],
  qualification:[["Identity/contact","Best number and email for updates?"],["Geography","Which city and state?"],["Intent","Buy, sell, refinance, invest, relocate, explore?"],["Timeline","When would you like to move or talk?"],["Motivation","What prompted you to reach out?"],["Status","Searching, preparing to list, under contract, gathering info?"],["Representation","Working with an agent or lender?"],["Readiness","Would a 15–30 minute conversation with Steven help?"],["Consent","OK to call/text/email about your request?"]],
  notAnswer:["Rates, APR, points, payments or 'what will I qualify for'","AUS/underwriting interpretation or eligibility","Property valuation or negotiation advice","Legal/tax questions","Whether a referral arrangement is allowed (route to Compliance)"],
  stages:["New inquiry","Consultation scheduled","Consultation completed","Application scheduled","Application in progress","Application submitted","Disclosures pending/sent","Documentation collection","Processing","Submitted to underwriting","Conditional approval","Conditions outstanding","Clear to close","Closing scheduled","Funded / closed","Withdrawn / denied / lost","Future nurture"],
  irrrlProgram:{criteria:["Note rate ≥ 6.0% (adjust to PMMS; prospect 0.75–1.0 pt above market)","Seasoning floor for outreach: 6 months (closing requires 210 days + 6 payments)","Existing loan is VA-guaranteed","Preliminary NTB & recoupment likely"],buckets:["(a) Seasoning-eligible now + rate gap met → hot outreach","(b) Seasoning not met, rate gap met → nurture until eligible","(c) Rate gap not met → quarterly check-in"],sources:["Steven's closed VA loans in Arive/Zoho (highest conversion)","Compliant licensed data vendors (TCPA-approved by Steven)","Webinar/seminar attendees with an existing VA loan"],boundary:"ISA identifies, segments, books. Steven confirms seasoning/NTB, quotes any figure, makes the recommendation."},
  escalate:["Lock expiring < 72h","Any borrower asking for a rate/payment figure","Complaint or regulator contact","PMMS crosses a full-point threshold week-over-week","New lender promotion with a limited window","Google Ads spend > 75% of the $10k monthly cap","IRRRL bucket (a) grows by 10+ in a week","Referral partner SLA breach","Automation failure affecting Zoho↔Arive sync"],
  alerts:[["PMMS full-point move (WoW)","Immediate"],["Lender promo with window","Immediate"],["Google Ads > 75% of cap","Immediate"],["IRRRL bucket (a) +10","Same day"],["Failed automation","Same day"]],
  capacityAudit:["List every recurring task with hours/week","Assign to Layer 1–4; justify anything in Layer 1","Identify top 3 to push down a layer","Document the SOP for each pushed task","Report Steven's % time in Layer 1 activities (target ≥ 80%)"],
};
/* ---------------- Zoho CRM sync spec ---------------- */
const ZOHO = {
  status:{connected:true,account:"Composio connection (private) · created 2026-09-21",scopes:"❌ CRM scopes missing — API returned 403 NO_PERMISSION on Leads/Deals/Modules",needed:"ZohoCRM.modules.ALL, ZohoCRM.settings.ALL, ZohoCRM.users.READ, ZohoCRM.notifications.ALL (webhooks)"},
  modules:[["Leads","contacts (type = borrower/buyer, stage < application)","Lead_Source ← source · Lead_Status ← stage · Email/Phone/Mobile · Street/City/State/Zip ← market · Veteran__c ← veteran · Loan_Purpose__c ← program intent · Consent_SMS__c ← consent_sms"],["Contacts","contacts (converted) + agents/partners","Account_Name ← brokerage · Partner_Status__c ← partner_status · Tier__c ← tier"],["Deals","loans","Deal_Name ← borrower + program · Stage ← SOP stage (17) · Amount ← amount · Closing_Date ← est_close · Arive_Loan_ID__c ← arive_id · Rate__c ← rate · Lock_Expiration__c ← lock_exp"],["Tasks","tasks","Subject ← title · Due_Date ← due · Priority ← priority · Who_Id ← contact"],["Calls / Events","audit_log (outreach) / calendar","Logged from Zoho telephony; synced for the daily brief"],["Notes","approvals (decided)","Approved drafts attached to the record"]],
  stageMap:[["New inquiry","New"],["Consultation scheduled","Contacted"],["Consultation completed","Consult"],["Application in progress","Pre-approved"],["Submitted to underwriting / Conditional approval","Contract"],["Funded / closed","Closed"]],
  workflows:[
    ["Z1","Lead capture → Zoho","Webinar/Eventbrite/website/Meta lead form webhook","Dedupe by email+phone (ZOHO_SEARCH) › create Lead (ZOHO_CREATE) with source/state/intent/consent › create follow-up Task (5-min SLA) › mirror to Supabase contacts",false],
    ["Z2","Zoho → dashboard pipeline","Zoho workflow rule / webhook on Lead_Status or Deal Stage change","n8n webhook › upsert Supabase loans/contacts › Realtime pushes the Kanban",false],
    ["Z3","Dashboard → Zoho stage update","Card dragged in Pipeline page","POST /webhook/zoho-stage › ZOHO_UPDATE (Deals.Stage) › audit_log",false],
    ["Z4","Zoho ↔ Arive reconciliation","Daily 7:00am PT","Compare Deal stage/amount/est_close vs Arive export › flag drift › task for ISA (SOP §4.5)",false],
    ["Z5","IRRRL bucket sync","Weekly Mon 6:00am","Query Deals (program=VA, rate ≥ threshold) › compute seasoning › tag bucket a/b/c in Zoho › count into Market dashboard",false],
    ["Z6","Approved outreach → Zoho activity","Approval decided = approved","Create Note/Call/Email activity on the Zoho record with the approved text + compliance verdict",true],
    ["Z7","Daily brief from Zoho","W22 cron","ZOHO_SEARCH new leads (Created_Time > 24h) · overdue Tasks · hot leads › Morning Brief ZOHO block",false],
  ],
  edgeFunction:`// supabase/functions/zoho-sync/index.ts — Zoho CRM v8 REST via OAuth refresh token (secrets in Supabase Vault)
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
const DC = Deno.env.get("ZOHO_DC") ?? "com";                 // com | eu | in | com.au | jp
const ACCOUNTS = \`https://accounts.zoho.\${DC}/oauth/v2/token\`;
const API = \`https://www.zohoapis.\${DC}/crm/v8\`;
let cached: { token: string; exp: number } | null = null;
async function token() {
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;
  const body = new URLSearchParams({ grant_type: "refresh_token", client_id: Deno.env.get("ZOHO_CLIENT_ID")!,
    client_secret: Deno.env.get("ZOHO_CLIENT_SECRET")!, refresh_token: Deno.env.get("ZOHO_REFRESH_TOKEN")! });
  const r = await fetch(ACCOUNTS, { method: "POST", body }); const j = await r.json();
  if (!j.access_token) throw new Error("zoho token: " + JSON.stringify(j));
  cached = { token: j.access_token, exp: Date.now() + (j.expires_in ?? 3600) * 1000 }; return cached.token;
}
async function zoho(path: string, init: RequestInit = {}) {
  const r = await fetch(API + path, { ...init, headers: { Authorization: "Zoho-oauthtoken " + await token(), "Content-Type": "application/json", ...(init.headers||{}) } });
  const j = await r.json(); if (!r.ok) throw new Error(\`zoho \${r.status}: \${JSON.stringify(j).slice(0,300)}\`); return j;
}
serve(async (req) => {
  const { op, module = "Leads", data, criteria, fields = "Last_Name,Email,Phone,Lead_Status,Lead_Source,Modified_Time", page_token } = await req.json();
  try {
    switch (op) {
      case "list":   return Response.json(await zoho(\`/\${module}?fields=\${encodeURIComponent(fields)}&per_page=200&sort_by=Modified_Time&sort_order=desc\${page_token?"&page_token="+page_token:""}\`));
      case "search": return Response.json(await zoho(\`/\${module}/search?criteria=\${encodeURIComponent(criteria)}&fields=\${encodeURIComponent(fields)}\`));
      case "upsert": return Response.json(await zoho(\`/\${module}/upsert\`, { method: "POST", body: JSON.stringify({ data, duplicate_check_fields: ["Email","Phone"] }) }));
      case "update": return Response.json(await zoho(\`/\${module}\`, { method: "PUT", body: JSON.stringify({ data }) }));
      default: return new Response("unknown op", { status: 400 });
    }
  } catch (e) { return new Response(String(e), { status: 502 }); }
});`,
  n8nNodes:["Webhook (POST /zoho-sync)","Zoho CRM node (OAuth2 credential — scopes above)","Function: dedupe + field map","Supabase node: upsert contacts/loans","IF: stage changed → Slack/SMS","Error workflow → audit_log"],
  checklist:["Reconnect Zoho in Composio (or create a Zoho API Console 'Server-based' client) with scopes: ZohoCRM.modules.ALL, ZohoCRM.settings.ALL, ZohoCRM.users.READ","Confirm the data center (US = zoho.com) — EU/IN accounts use different API hosts","Create custom fields in Leads/Deals: Veteran__c, Loan_Purpose__c, Consent_SMS__c, Arive_Loan_ID__c, Rate__c, Lock_Expiration__c, IRRRL_Bucket__c","Store client id/secret/refresh token in Supabase Vault (never in the dashboard)","Deploy supabase/functions/zoho-sync and set ZOHO_* secrets","Import n8n Z1–Z7 and point Zoho workflow rules at the n8n webhook","Run Z4 once and reconcile Arive drift before enabling Z3 writes"],
};
/* ---- Routines, schedules, new agents & workflows (automation center) ---- */
const ROUTINES=[
 ["05:45","daily","Market data pull","Treasury/FRED/PMMS + MBS Highway AM email parse (HR1–HR3)","0 45 5 * * 1-5","Market Intel","W17"],
 ["06:30","daily","Morning Brief","Aggregate Zoho/Arive/approvals → SMS + email + dashboard (HR6)","0 30 6 * * 1-5","Chief of Staff","W22"],
 ["06:45","daily","Approvals block (Steven, 15 min)","Credit letters, Get-Well plans, outreach drafts, consumer market text","—","Steven","W24"],
 ["07:00","daily","Zoho ↔ Arive reconciliation","Stage/amount/date drift → ISA tasks","0 0 7 * * 1-5","Ops integrator agent","Z4"],
 ["07:15","daily","Speed-to-lead report","5-min SLA attainment yesterday; unanswered leads","0 15 7 * * 1-5","ISA","A1"],
 ["08:30 ET","daily","Data-release snapshot","CPI/PCE/jobs days: before/after UMBS & 10y; rate alert if thresholds hit","0 30 8 * * 1-5 (ET)","Market Intel","W18"],
 ["09:00","daily","Pipeline stand-up (15 min)","Every file: owner + next date; conditions idle >48h escalated","—","Team","A18"],
 ["hourly","daily","Sequence engine","Send due touches; pause on replies; create call tasks","0 0 * * * *","Outreach agent","SQ-*"],
 ["hourly","daily","Referral SLA monitor","7/14-day partner update checks","0 0 * * * *","Referral Desk","W7"],
 ["12:00","daily","Midday Pulse","Delta since AM; hot leads; approvals pending","0 0 12 * * 1-5","Chief of Staff","W22"],
 ["14:30","daily","Market close summary","Close edition Home Report → signals → brief","0 30 14 * * 1-5","Market Intel","HR1–HR7"],
 ["15:00 Fri","weekly","Friday status blast","Borrower + agent status on every active file (approved templates)","0 0 15 * * 5","Status bot","A15"],
 ["17:30","daily","EOD Wrap","Wins, risks, tomorrow's top 3; every lead dispositioned","0 30 17 * * 1-5","Chief of Staff","W22"],
 ["nightly","daily","Missing-doc chase","Portal checklist reminders until complete","0 0 19 * * *","Doc agent","A8"],
 ["06:00 Mon","weekly","IRRRL bucket refresh","Re-score VA borrowers vs PMMS; buckets a/b/c","0 0 6 * * 1","Refi Hunter","Z5/W16"],
 ["Mon","weekly","Capacity audit","Layer 1 time ≥ 80%; push tasks down a layer","—","EA/ISA","13.7"],
 ["Mon","weekly","Partner research block","10 new targets per channel from the lead playbooks","—","ISA","P19"],
 ["Fri","weekly","KPI scorecard","Pull-through, cycle time, cost/loan, NPS, reviews, SLA %","0 0 16 * * 5","Chief of Staff","W28"],
 ["1st","monthly","Guideline corpus refresh","Circulars/MLs/Selling Guide updates → RAG + 'what changed' note","0 0 3 1 * *","Guideline librarian","W21"],
 ["1st","monthly","Rules re-verify","program_rules, credit_rules, BAH/pay tables, limits","—","Loan Tutor","P1/P18"],
 ["1st","monthly","Lender scorecard","Turn times, exceptions, declined-file rescues by lender","—","Loan Ops","—"],
 ["15th","monthly","License/CE tracker","DRE, NMLS, state renewals, CE deadlines","0 0 9 15 * *","Compliance","W27"],
 ["Qtr","quarterly","Advisor Briefing webinar + builder scorecard review","Reverse CE session; builder preferred-lender renewals","—","Steven","SQ-W/SQ-B"],
 ["Jan","annual","BAH/pay/limits reload","DTMO files, DFAS pay table, FHFA/FHA limits, VA funding fee check","0 0 6 2 1 *","BAH data agent","P18"],
];
AGENTS.push(
 {n:19,name:"Partner Prospector (Bizdev)",desc:"Researches targets from the lead playbooks, enriches, enrolls in sequences",on:true,last:"Added 10 NV builders to the tracker"},
 {n:20,name:"Outreach Writer",desc:"Personalizes sequence touches per contact; routes to approvals",on:true,last:"Drafted 14 touches for SQ-B"},
 {n:21,name:"VA Tough-File Strategist",desc:"Ranks the 32 strategies for a referred/declined VA file; drafts the compensating-factor narrative",on:true,last:"Rescued 1 file via residual income + seller debt payoff"},
 {n:22,name:"Guideline Librarian",desc:"Maintains the guideline corpus, flags circular/ML changes, feeds the Loan Coach",on:true,last:"Logged 2 updates"},
 {n:23,name:"BAH & Pay Data Agent",desc:"Loads DTMO/DFAS files annually; flags estimate vs official",on:true,last:"335 stations seeded; awaiting DTMO import"},
 {n:24,name:"Loan Coach",desc:"Underwriter/processor/broker mentor Q&A grounded in the guideline corpus",on:true,last:"Answered 6 questions today"},
);
WORKFLOWS.push(
 W("SQ","Sequence engine","Hourly cron / enrollment tag","Compute due touches › personalize (Outreach Writer) › Compliance gate › send via Zoho/Twilio or create call/LinkedIn task › log › pause on reply",true,"Prospecting"),
 W("BD1","Lead research sprint","Mon 9:00 (ISA)","Pick channel › run playbook sources › capture contacts (verified) › import CSV to tracker › enroll",false,"Prospecting"),
 W("BD2","Reply triage","Inbound email/SMS on a sequence","Classify › pause sequence › ISA task (5-min) › book or exit",false,"Prospecting"),
 W("VT1","Tough-file rescue","AUS refer / lender decline on a VA file","Run toughRank › pick strategies › draft 26-6393 narrative + LOEs › route to no-overlay lender",true,"Loan Ops"),
 W("GL1","Coach feedback loop","Coach answer rated 'wrong/outdated'","Librarian reviews › corpus update › re-test",false,"Loan Ops"),
);
