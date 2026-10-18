-- VANESSA 3.0 — calculators + MBS Highway Home Report signals
-- Run after the §19 master migrations. All functions are pure (immutable) so the
-- dashboard, n8n and Claude Edge Functions all get identical numbers.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- helpers
create or replace function pmt(principal numeric, annual_rate numeric, n_months int)
returns numeric language sql immutable as $$
  select case when n_months <= 0 then 0
              when annual_rate = 0 then principal / n_months
              else principal * (annual_rate/12) / (1 - power(1 + annual_rate/12, -n_months)) end
$$;

create or replace function balance_after(principal numeric, annual_rate numeric, n_months int, paid int)
returns numeric language sql immutable as $$
  select case when annual_rate = 0 then principal - principal / n_months * paid
              else principal * power(1 + annual_rate/12, paid)
                   - pmt(principal, annual_rate, n_months) * (power(1 + annual_rate/12, paid) - 1) / (annual_rate/12) end
$$;

-- ---------------------------------------------------------------- BUY vs RENT
-- Year-by-year net-worth comparison. Rates are decimals (0.065 = 6.5%).
-- Buyer net worth  = home value - loan balance - selling costs
-- Renter net worth = down payment + closing costs invested, plus every month the
--                    buyer's total cost exceeds rent invested (and vice versa), compounding.
create or replace function calc_buy_vs_rent(
  price numeric, down_pct numeric, rate numeric, term_years int,
  property_tax_rate numeric, insurance_annual numeric, hoa_monthly numeric,
  maintenance_pct numeric, appreciation numeric,
  rent_monthly numeric, rent_growth numeric, renters_insurance_annual numeric,
  invest_return numeric, closing_cost_pct numeric, selling_cost_pct numeric,
  horizon_years int, marginal_tax_rate numeric default 0, itemizes boolean default false
) returns jsonb language plpgsql immutable as $$
declare
  loan numeric := price * (1 - down_pct);
  down numeric := price * down_pct;
  closing numeric := price * closing_cost_pct;
  pi numeric := pmt(loan, rate, term_years * 12);
  y int; m int;
  home_val numeric := price;
  rent numeric := rent_monthly;
  bal numeric := loan;
  portfolio numeric := down + closing;
  mr numeric := power(1 + invest_return, 1.0/12) - 1;
  int_paid numeric; prin_paid numeric; m_int numeric;
  owner_cost numeric; renter_cost numeric;
  tax_m numeric; maint_m numeric; ins_m numeric;
  buyer_nw numeric; renter_nw numeric;
  rows jsonb := '[]'::jsonb;
  breakeven int := null;
  tax_benefit numeric;
begin
  for y in 1..horizon_years loop
    int_paid := 0; prin_paid := 0;
    for m in 1..12 loop
      m_int := bal * rate / 12;
      int_paid := int_paid + m_int;
      prin_paid := prin_paid + (pi - m_int);
      bal := bal - (pi - m_int);
      tax_m := home_val * property_tax_rate / 12;
      maint_m := price * maintenance_pct / 12;           -- maintenance scales with original price
      ins_m := insurance_annual / 12;
      tax_benefit := case when itemizes then (m_int + tax_m) * marginal_tax_rate else 0 end;
      owner_cost := pi + tax_m + ins_m + hoa_monthly + maint_m - tax_benefit;
      renter_cost := rent + renters_insurance_annual / 12;
      portfolio := portfolio * (1 + mr) + (owner_cost - renter_cost);   -- renter invests the difference
    end loop;
    home_val := home_val * (1 + appreciation);
    rent := rent * (1 + rent_growth);
    buyer_nw := home_val * (1 - selling_cost_pct) - bal;
    renter_nw := portfolio;
    if breakeven is null and buyer_nw >= renter_nw then breakeven := y; end if;
    rows := rows || jsonb_build_object(
      'year', y, 'home_value', round(home_val), 'loan_balance', round(bal),
      'buyer_net_worth', round(buyer_nw), 'renter_net_worth', round(renter_nw),
      'monthly_owner_cost', round(owner_cost), 'monthly_rent', round(rent / (1 + rent_growth)),
      'interest_paid_year', round(int_paid), 'principal_paid_year', round(prin_paid));
  end loop;
  return jsonb_build_object(
    'loan', round(loan), 'down_payment', round(down), 'closing_costs', round(closing),
    'monthly_pi', round(pi, 2), 'breakeven_year', breakeven,
    'winner_at_horizon', case when buyer_nw >= renter_nw then 'buy' else 'rent' end,
    'advantage_at_horizon', round(abs(buyer_nw - renter_nw)),
    'years', rows,
    'disclaimer', 'Illustrative estimate, not a loan offer or financial advice. Assumptions drive the result.');
end $$;

-- ---------------------------------------------------------------- DEBT CONSOLIDATION
-- debts: [{"name":"Visa","balance":8400,"rate":0.2399,"payment":210,"type":"revolving"}, ...]
-- mode 'cashout_refi' rolls debts into a new first mortgage; 'heloc' / 'heloan' add a second lien
-- and leave the first mortgage alone (existing_first_* supplied so the true blended cost is visible).
create or replace function calc_debt_consolidation(
  debts jsonb, mode text, new_rate numeric, new_term_years int, closing_cost_pct numeric,
  existing_first_balance numeric default 0, existing_first_rate numeric default 0,
  existing_first_payment numeric default 0, home_value numeric default 0, max_cltv numeric default 0.80,
  mortgage_dti_income numeric default 0
) returns jsonb language plpgsql immutable as $$
declare
  d jsonb;
  total_bal numeric := 0; total_pay numeric := 0; weighted_rate numeric := 0;
  closing numeric; new_amt numeric; new_pay numeric;
  cur_interest numeric := 0; new_interest numeric;
  cur_months numeric; cltv numeric; monthly_saving numeric;
  breakeven numeric; warn jsonb := '[]'::jsonb;
  cur_payoff_months numeric;
begin
  for d in select * from jsonb_array_elements(debts) loop
    total_bal := total_bal + (d->>'balance')::numeric;
    total_pay := total_pay + (d->>'payment')::numeric;
    weighted_rate := weighted_rate + (d->>'balance')::numeric * (d->>'rate')::numeric;
    -- months to pay off at current payment: n = -ln(1 - r*B/P) / ln(1+r)
    if (d->>'payment')::numeric > (d->>'balance')::numeric * (d->>'rate')::numeric / 12 and (d->>'rate')::numeric > 0 then
      cur_months := -ln(1 - ((d->>'rate')::numeric/12 * (d->>'balance')::numeric) / (d->>'payment')::numeric)
                    / ln(1 + (d->>'rate')::numeric/12);
    else
      cur_months := case when (d->>'rate')::numeric = 0 then (d->>'balance')::numeric / greatest((d->>'payment')::numeric,1) else 600 end;
      warn := warn || to_jsonb(''::text || 'Payment on "' || coalesce(d->>'name','debt') || '" barely covers interest.');
    end if;
    cur_interest := cur_interest + greatest((d->>'payment')::numeric * cur_months - (d->>'balance')::numeric, 0);
  end loop;
  if total_bal = 0 then return jsonb_build_object('error','no debts supplied'); end if;
  weighted_rate := weighted_rate / total_bal;

  closing := total_bal * closing_cost_pct;
  if mode = 'cashout_refi' then
    new_amt := existing_first_balance + total_bal + closing;       -- everything rolls into one new first
    new_pay := pmt(new_amt, new_rate, new_term_years * 12);
    -- savings compare the whole housing + debt payment stack before vs after
    monthly_saving := (existing_first_payment + total_pay) - new_pay;
    new_interest := new_pay * new_term_years * 12 - new_amt;
  else
    new_amt := total_bal + closing;                                 -- second lien only
    new_pay := pmt(new_amt, new_rate, new_term_years * 12);
    monthly_saving := total_pay - new_pay;
    new_interest := new_pay * new_term_years * 12 - new_amt;
  end if;
  breakeven := case when monthly_saving > 0 then closing / monthly_saving else null end;
  -- both modes end with first-lien balance + (debts + closing) secured against the home
  cltv := case when home_value > 0 then (existing_first_balance + total_bal + closing) / home_value end;
  if cltv is not null and cltv > max_cltv then warn := warn || to_jsonb(''::text || 'CLTV ' || round(cltv*100,1) || '% exceeds ' || round(max_cltv*100) || '% cap — reduce debts rolled in.'); end if;
  if new_term_years * 12 > coalesce(cur_months,0) * 1.5 then warn := warn || to_jsonb(''::text || 'Longer term lowers the payment but can raise total interest — check lifetime cost.'); end if;
  if mode = 'cashout_refi' and existing_first_rate > 0 and new_rate > existing_first_rate then
    warn := warn || to_jsonb(''::text || 'Cash-out refi replaces a ' || round(existing_first_rate*100,3) || '% first mortgage with ' || round(new_rate*100,3) || '% — consider a HELOC/HELOAN instead.');
  end if;
  warn := warn || to_jsonb('Unsecured debt becomes debt secured by the home — missed payments risk foreclosure.'::text);

  return jsonb_build_object(
    'debt_total', round(total_bal), 'debt_monthly_payments', round(total_pay),
    'weighted_avg_rate', round(weighted_rate, 4),
    'new_loan_amount', round(new_amt), 'new_payment', round(new_pay, 2),
    'monthly_cash_flow_change', round(monthly_saving, 2),
    'closing_costs', round(closing), 'breakeven_months', round(breakeven, 1),
    'interest_remaining_current', round(cur_interest), 'interest_lifetime_new', round(new_interest),
    'lifetime_interest_delta', round(cur_interest - new_interest),
    'cltv', round(cltv, 4), 'warnings', warn,
    'disclaimer', 'Illustrative estimate; verify with live pricing and underwriting. Not a commitment to lend.');
end $$;

-- ---------------------------------------------------------------- 5/1 ARM vs FIXED
create or replace function calc_arm_vs_fixed(
  loan numeric, fixed_rate numeric, arm_start_rate numeric, arm_index numeric, arm_margin numeric,
  term_years int default 30, initial_cap numeric default 0.02, periodic_cap numeric default 0.02,
  lifetime_cap numeric default 0.05, initial_fixed_years int default 5, horizon_years int default 10
) returns jsonb language plpgsql immutable as $$
declare
  n int := term_years * 12;
  fixed_pay numeric := pmt(loan, fixed_rate, n);
  arm_pay numeric := pmt(loan, arm_start_rate, n);
  bal numeric := loan; rate numeric := arm_start_rate;
  m int; y int; pay numeric := arm_pay; paid_arm numeric := 0; paid_fixed numeric := 0;
  fully numeric := arm_index + arm_margin;
  rows jsonb := '[]'::jsonb; worst_rate numeric; worst_pay numeric; bal_fixed numeric := loan;
  reset_rate numeric; target numeric;
begin
  for m in 1..least(n, horizon_years * 12) loop
    if m > initial_fixed_years * 12 and ((m - 1 - initial_fixed_years * 12) % 12 = 0) then
      target := arm_index + arm_margin;
      if m = initial_fixed_years * 12 + 1 then
        reset_rate := least(target, arm_start_rate + initial_cap);
      else
        reset_rate := least(greatest(target, rate - periodic_cap), rate + periodic_cap);
      end if;
      rate := least(reset_rate, arm_start_rate + lifetime_cap);
      pay := pmt(bal, rate, n - m + 1);
    end if;
    bal := bal + bal * rate / 12 - pay;
    bal_fixed := bal_fixed + bal_fixed * fixed_rate / 12 - fixed_pay;
    paid_arm := paid_arm + pay; paid_fixed := paid_fixed + fixed_pay;
    if m % 12 = 0 then
      y := m / 12;
      rows := rows || jsonb_build_object('year', y, 'arm_rate', round(rate,4), 'arm_payment', round(pay),
               'fixed_payment', round(fixed_pay), 'arm_cumulative_savings', round(paid_fixed - paid_arm),
               'arm_balance', round(bal), 'fixed_balance', round(bal_fixed));
    end if;
  end loop;
  worst_rate := arm_start_rate + lifetime_cap;
  worst_pay := pmt(balance_after(loan, arm_start_rate, n, initial_fixed_years * 12), worst_rate, n - initial_fixed_years * 12);
  return jsonb_build_object(
    'fixed_payment', round(fixed_pay,2), 'arm_initial_payment', round(arm_pay,2),
    'initial_monthly_savings', round(fixed_pay - arm_pay,2),
    'fully_indexed_rate', round(fully,4),
    'balance_at_reset', round(balance_after(loan, arm_start_rate, n, initial_fixed_years*12)),
    'worst_case_rate', round(worst_rate,4), 'worst_case_payment', round(worst_pay,2),
    'worst_case_payment_shock', round(worst_pay - arm_pay,2),
    'years', rows,
    'note', 'Qualify the ARM at the greater of note rate or fully-indexed rate per investor guidelines; 5/1 ARMs suit buyers likely to sell or refinance before year 5.');
end $$;

-- ---------------------------------------------------------------- saved runs (audit + reuse)
create table if not exists calc_runs (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('buy_vs_rent','debt_consolidation','arm_vs_fixed')),
  contact_id uuid references contacts(id) on delete set null,
  inputs jsonb not null,
  result jsonb not null,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);
alter table calc_runs enable row level security;
create policy calc_runs_owner on calc_runs for all using (created_by = auth.uid()) with check (created_by = auth.uid());

create or replace function run_calc(kind text, inputs jsonb, contact uuid default null)
returns jsonb language plpgsql security invoker as $$
declare r jsonb; i jsonb := inputs;
begin
  if kind = 'buy_vs_rent' then
    r := calc_buy_vs_rent((i->>'price')::numeric,(i->>'down_pct')::numeric,(i->>'rate')::numeric,(i->>'term_years')::int,
      (i->>'property_tax_rate')::numeric,(i->>'insurance_annual')::numeric,(i->>'hoa_monthly')::numeric,
      (i->>'maintenance_pct')::numeric,(i->>'appreciation')::numeric,(i->>'rent_monthly')::numeric,
      (i->>'rent_growth')::numeric,(i->>'renters_insurance_annual')::numeric,(i->>'invest_return')::numeric,
      (i->>'closing_cost_pct')::numeric,(i->>'selling_cost_pct')::numeric,(i->>'horizon_years')::int,
      coalesce((i->>'marginal_tax_rate')::numeric,0), coalesce((i->>'itemizes')::boolean,false));
  elsif kind = 'debt_consolidation' then
    r := calc_debt_consolidation(i->'debts', i->>'mode',(i->>'new_rate')::numeric,(i->>'new_term_years')::int,
      (i->>'closing_cost_pct')::numeric, coalesce((i->>'existing_first_balance')::numeric,0),
      coalesce((i->>'existing_first_rate')::numeric,0), coalesce((i->>'existing_first_payment')::numeric,0),
      coalesce((i->>'home_value')::numeric,0), coalesce((i->>'max_cltv')::numeric,0.80));
  elsif kind = 'arm_vs_fixed' then
    r := calc_arm_vs_fixed((i->>'loan')::numeric,(i->>'fixed_rate')::numeric,(i->>'arm_start_rate')::numeric,
      (i->>'arm_index')::numeric,(i->>'arm_margin')::numeric, coalesce((i->>'term_years')::int,30));
  else raise exception 'unknown calc kind %', kind; end if;
  insert into calc_runs(kind, contact_id, inputs, result) values (kind, contact, i, r);
  return r;
end $$;

-- ---------------------------------------------------------------- MBS HIGHWAY HOME REPORT
-- One row per published Home Report; signals are the discrete, parseable calls inside it.
-- Source of truth is whatever your MBS Highway subscription lets you export or email — never scrape
-- behind a login (see blueprint §2 data-access note).
create table if not exists mbsh_home_reports (
  id uuid primary key default gen_random_uuid(),
  report_date date not null,
  edition text not null default 'am' check (edition in ('am','midday','close','weekly')),
  source text not null default 'email' check (source in ('email','csv','manual','api')),
  raw_text text,
  headline text,
  umbs_coupon text default 'UMBS 5.5',
  umbs_price numeric, umbs_change_ticks numeric,
  ust10y numeric, ust10y_change_bp numeric,
  lock_lean text check (lock_lean in ('lock','float','neutral')),
  lean_confidence numeric check (lean_confidence between 0 and 1),
  ai_summary text, consumer_safe_version text,
  compliance_status text not null default 'pending' check (compliance_status in ('pending','pass','fix','block')),
  created_at timestamptz not null default now(),
  unique (report_date, edition)
);

create table if not exists mbsh_signals (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references mbsh_home_reports(id) on delete cascade,
  kind text not null check (kind in ('support','resistance','trend','momentum','bollinger','stochastic','calendar','auction','fed','alert','commentary')),
  label text not null,
  value text,
  direction text check (direction in ('bullish','bearish','neutral')),     -- bullish = bond prices up / rates down
  strength smallint check (strength between 1 and 5),
  affects_locks boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists mbsh_signals_report on mbsh_signals(report_id);

alter table mbsh_home_reports enable row level security;
alter table mbsh_signals enable row level security;
create policy mbsh_reports_read on mbsh_home_reports for select using (auth.role() = 'authenticated');
create policy mbsh_signals_read on mbsh_signals for select using (auth.role() = 'authenticated');
create policy mbsh_reports_write on mbsh_home_reports for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy mbsh_signals_write on mbsh_signals for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Feeds the dashboard Market Intel page AND the 6:30am Morning Brief (W22).
create or replace view v_home_report_signals as
select r.report_date, r.edition, r.headline, r.lock_lean, r.lean_confidence, r.umbs_change_ticks, r.ust10y_change_bp,
       r.compliance_status,
       coalesce(jsonb_agg(jsonb_build_object('kind', s.kind, 'label', s.label, 'value', s.value,
                'direction', s.direction, 'strength', s.strength, 'affects_locks', s.affects_locks)
                order by s.strength desc) filter (where s.id is not null), '[]'::jsonb) as signals,
       count(*) filter (where s.affects_locks) as lock_relevant_signals
from mbsh_home_reports r left join mbsh_signals s on s.report_id = r.id
group by r.id;

create or replace view v_daily_brief_market as
select * from v_home_report_signals
where report_date = (select max(report_date) from mbsh_home_reports)
order by case edition when 'close' then 1 when 'midday' then 2 when 'am' then 3 else 4 end limit 1;

-- Threshold the W18 rate-alert workflow reads from settings; included here so SQL and n8n agree.
create or replace function home_report_alert_level(umbs_ticks numeric, ust10y_bp numeric, lock_signals int)
returns text language sql immutable as $$
  select case when abs(umbs_ticks) >= 25 or abs(ust10y_bp) >= 7 then 'rate_alert'
              when lock_signals >= 2 then 'watch'
              else 'normal' end
$$;
