#!/usr/bin/env python3
"""amortize.py - transparent loan-scenario arithmetic (stdlib only).

PREP ONLY. Nothing here is a rate quote, an eligibility decision or a lock.
There are NO hard-coded rates, fee tables or limits: every rate, fee percent
and tax figure is an INPUT that Steven supplies from the lender sheet / the
VA's official funding-fee page ("verify at https://www.va.gov").

Annual rates are given as PERCENT (e.g. 6.5 means 6.5 percent), fee percents
likewise. Money is plain floats rounded to cents only at the output edge.
"""
import argparse
import json
import sys


def monthly_pi(loan_amount, annual_rate_pct, term_years):
    """Standard amortisation: P*r / (1-(1+r)^-n), r = monthly rate, n = months.
    A zero rate degrades to straight-line principal (P/n)."""
    if loan_amount < 0:
        raise ValueError("loan_amount must be >= 0")
    if term_years <= 0:
        raise ValueError("term_years must be > 0")
    if annual_rate_pct < 0:
        raise ValueError("annual_rate_pct must be >= 0")
    n = int(round(term_years * 12))
    if loan_amount == 0:
        return 0.0
    r = annual_rate_pct / 100.0 / 12.0
    if r == 0:
        return loan_amount / n
    return loan_amount * r / (1.0 - (1.0 + r) ** (-n))


def loan_with_financed_fee(base_loan, fee_pct):
    """Total loan = base_loan * (1 + fee_pct/100) when the fee is financed.
    fee_pct is an INPUT (0 for an exempt borrower or a non-VA loan)."""
    if base_loan < 0 or fee_pct < 0:
        raise ValueError("base_loan and fee_pct must be >= 0")
    fee_amount = base_loan * fee_pct / 100.0
    return base_loan + fee_amount, fee_amount


def base_loan_amount(price, down_payment):
    if price <= 0:
        raise ValueError("price must be > 0")
    if down_payment < 0 or down_payment > price:
        raise ValueError("down_payment must be between 0 and price")
    return price - down_payment


def ltv(loan_amount, value):
    """LTV percent = loan / value * 100. Caller decides price vs appraised
    value (lesser of the two on a purchase) - this function does not guess."""
    if value <= 0:
        raise ValueError("value must be > 0")
    return loan_amount / value * 100.0


def monthly_mi(loan_amount, annual_mi_pct):
    """Monthly mortgage insurance from an INPUT annual percent of loan."""
    if loan_amount < 0 or annual_mi_pct < 0:
        raise ValueError("inputs must be >= 0")
    return loan_amount * annual_mi_pct / 100.0 / 12.0


def piti(pi, annual_tax, annual_hoi, monthly_mi_amt=0.0, monthly_hoa=0.0):
    """Housing payment = P&I + tax/12 + HOI/12 + MI + HOA.
    (HOA is included in the housing payment for DTI by many investors; the
    treatment is an investor/Lucia question - shown separately in the table.)"""
    return pi + annual_tax / 12.0 + annual_hoi / 12.0 + monthly_mi_amt + monthly_hoa


def dti(housing_payment, other_monthly_debts, gross_monthly_income):
    """Return (front_pct, back_pct). front = housing/income, back = (housing +
    other debts)/income. Income must be the figure Steven/Lucia qualified;
    this function does not decide what counts as income."""
    if gross_monthly_income <= 0:
        raise ValueError("gross_monthly_income must be > 0")
    front = housing_payment / gross_monthly_income * 100.0
    back = (housing_payment + other_monthly_debts) / gross_monthly_income * 100.0
    return front, back


def payment_table(loan_amount, annual_rate_pct, term_years, periods=12):
    """First `periods` rows of the amortisation schedule:
    [(n, payment, interest, principal, balance), ...]."""
    pay = monthly_pi(loan_amount, annual_rate_pct, term_years)
    r = annual_rate_pct / 100.0 / 12.0
    bal = loan_amount
    rows = []
    total = int(round(term_years * 12))
    for i in range(1, min(periods, total) + 1):
        interest = bal * r
        principal = pay - interest
        bal -= principal
        if i == total:
            bal = 0.0 if abs(bal) < 0.01 else bal
        rows.append((i, pay, interest, principal, max(bal, 0.0)))
    return rows


def scenario(s):
    """Compute one scenario dict. Required keys: price, down_payment,
    rate_pct, term_years. Optional: funding_fee_pct (default 0, financed),
    value (default price), annual_tax, annual_hoi, annual_mi_pct, monthly_hoa,
    other_monthly_debts, gross_monthly_income. Returns a result dict with the
    inputs echoed so the worksheet shows what was used."""
    base = base_loan_amount(s["price"], s["down_payment"])
    total, fee = loan_with_financed_fee(base, s.get("funding_fee_pct", 0.0))
    pi = monthly_pi(total, s["rate_pct"], s["term_years"])
    mi = monthly_mi(total, s.get("annual_mi_pct", 0.0))
    housing = piti(pi, s.get("annual_tax", 0.0), s.get("annual_hoi", 0.0),
                   mi, s.get("monthly_hoa", 0.0))
    out = {
        "inputs": dict(s),
        "base_loan": base,
        "financed_fee": fee,
        "total_loan": total,
        "ltv_pct": ltv(total, s.get("value", s["price"])),
        "monthly_pi": pi,
        "monthly_mi": mi,
        "housing_payment": housing,
    }
    if s.get("gross_monthly_income"):
        f, b = dti(housing, s.get("other_monthly_debts", 0.0),
                   s["gross_monthly_income"])
        out["front_dti_pct"], out["back_dti_pct"] = f, b
    return out


def compare(scenarios):
    """Side-by-side rows for a list of scenario dicts (each may carry 'name')."""
    rows = []
    for i, s in enumerate(scenarios):
        r = scenario(s)
        r["name"] = s.get("name", "Scenario %d" % (i + 1))
        rows.append(r)
    return rows


def _fmt_table(rows):
    keys = [("total_loan", "Total loan"), ("ltv_pct", "LTV %"),
            ("monthly_pi", "P&I"), ("monthly_mi", "MI"),
            ("housing_payment", "Housing pmt"),
            ("front_dti_pct", "Front DTI %"), ("back_dti_pct", "Back DTI %")]
    names = [r["name"] for r in rows]
    lines = ["%-14s" % "" + "".join("%16s" % n for n in names)]
    for k, label in keys:
        cells = ["%16s" % ("%.2f" % r[k] if k in r else "n/a") for r in rows]
        lines.append("%-14s" % label + "".join(cells))
    return "\n".join(lines)


def main(argv=None):
    p = argparse.ArgumentParser(description="Scenario arithmetic. Input: JSON "
                                "file holding a list of scenario objects.")
    p.add_argument("json_file")
    a = p.parse_args(argv)
    with open(a.json_file) as fh:
        data = json.load(fh)
    if isinstance(data, dict):
        data = [data]
    print(_fmt_table(compare(data)))
    print("\nARITHMETIC ONLY - not a quote, not an eligibility decision. "
          "Rate/fee percents are the inputs you supplied.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
