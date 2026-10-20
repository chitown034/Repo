import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))
import amortize as a  # noqa: E402


class TestAmortize(unittest.TestCase):
    def test_pi_known_value(self):
        # Textbook check: 100,000 at 6% for 30 years -> 599.55 (widely published).
        self.assertAlmostEqual(a.monthly_pi(100000, 6.0, 30), 599.55, places=2)

    def test_pi_zero_rate(self):
        self.assertAlmostEqual(a.monthly_pi(120000, 0, 10), 1000.0, places=6)

    def test_pi_zero_loan(self):
        self.assertEqual(a.monthly_pi(0, 5, 30), 0.0)

    def test_pi_bad_inputs(self):
        with self.assertRaises(ValueError):
            a.monthly_pi(1000, 5, 0)
        with self.assertRaises(ValueError):
            a.monthly_pi(-1, 5, 30)
        with self.assertRaises(ValueError):
            a.monthly_pi(1000, -1, 30)

    def test_financed_fee(self):
        total, fee = a.loan_with_financed_fee(400000, 2.0)
        self.assertAlmostEqual(fee, 8000.0)
        self.assertAlmostEqual(total, 408000.0)

    def test_fee_exempt(self):
        total, fee = a.loan_with_financed_fee(400000, 0)
        self.assertEqual((total, fee), (400000, 0))

    def test_base_loan(self):
        self.assertEqual(a.base_loan_amount(500000, 0), 500000)
        self.assertEqual(a.base_loan_amount(500000, 25000), 475000)
        with self.assertRaises(ValueError):
            a.base_loan_amount(500000, 600000)

    def test_ltv(self):
        self.assertAlmostEqual(a.ltv(408000, 400000), 102.0)
        self.assertAlmostEqual(a.ltv(320000, 400000), 80.0)
        with self.assertRaises(ValueError):
            a.ltv(1, 0)

    def test_mi(self):
        self.assertAlmostEqual(a.monthly_mi(300000, 0.5), 125.0)

    def test_piti(self):
        self.assertAlmostEqual(a.piti(2000, 6000, 1200, 100, 50),
                               2000 + 500 + 100 + 100 + 50)

    def test_dti(self):
        f, b = a.dti(2500, 500, 10000)
        self.assertAlmostEqual(f, 25.0)
        self.assertAlmostEqual(b, 30.0)
        with self.assertRaises(ValueError):
            a.dti(1, 1, 0)

    def test_payment_table_balances(self):
        rows = a.payment_table(100000, 6.0, 30, periods=360)
        self.assertEqual(len(rows), 360)
        self.assertAlmostEqual(rows[-1][4], 0.0, places=1)
        n, pay, interest, principal, bal = rows[0]
        self.assertAlmostEqual(interest, 500.0, places=2)
        self.assertAlmostEqual(pay, interest + principal, places=6)

    def test_scenario_and_compare(self):
        s = {"price": 500000, "down_payment": 0, "rate_pct": 0,
             "term_years": 10, "funding_fee_pct": 0, "annual_tax": 6000,
             "annual_hoi": 1200, "gross_monthly_income": 10000,
             "other_monthly_debts": 500}
        r = a.scenario(s)
        self.assertAlmostEqual(r["monthly_pi"], 500000 / 120)
        self.assertIn("back_dti_pct", r)
        rows = a.compare([dict(s, name="A"), dict(s, name="B", down_payment=50000)])
        self.assertEqual([x["name"] for x in rows], ["A", "B"])
        self.assertLess(rows[1]["total_loan"], rows[0]["total_loan"])

    def test_no_income_no_dti(self):
        r = a.scenario({"price": 100000, "down_payment": 0, "rate_pct": 5,
                        "term_years": 30})
        self.assertNotIn("front_dti_pct", r)


if __name__ == "__main__":
    unittest.main()
