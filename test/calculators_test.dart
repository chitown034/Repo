import 'package:active_duty/logic/calculators.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('VA funding fee rate (VA rates effective 2023-04-07)', () {
    double rate(VaLoanType t, VaLoanUse u, double down, {bool exempt = false}) =>
        fundingFeeRate(type: t, use: u, downPct: down, exempt: exempt);

    test('purchase, first use, by down payment', () {
      expect(rate(VaLoanType.purchase, VaLoanUse.first, 0), 2.15);
      expect(rate(VaLoanType.purchase, VaLoanUse.first, 5), 1.5);
      expect(rate(VaLoanType.purchase, VaLoanUse.first, 10), 1.25);
    });
    test('purchase after first use', () {
      expect(rate(VaLoanType.purchase, VaLoanUse.subsequent, 0), 3.3);
      expect(rate(VaLoanType.purchase, VaLoanUse.subsequent, 5), 1.5);
    });
    test('cash-out, IRRRL, exempt', () {
      expect(rate(VaLoanType.cashout, VaLoanUse.first, 0), 2.15);
      expect(rate(VaLoanType.cashout, VaLoanUse.subsequent, 0), 3.3);
      expect(rate(VaLoanType.irrrl, VaLoanUse.subsequent, 0), 0.5);
      expect(rate(VaLoanType.purchase, VaLoanUse.first, 0, exempt: true), 0);
    });
  });

  test('VA payment with the website default inputs', () {
    final r = vaPayment(
      price: 650000,
      downPct: 0,
      ratePct: 6.25,
      years: 30,
      taxRatePct: 1.1,
      insurancePerYear: 1800,
      hoaPerMonth: 0,
      use: VaLoanUse.first,
      exempt: false,
    );
    expect(r.fundingFee, closeTo(13975, 0.01));
    expect(r.loanAmount, closeTo(663975, 0.01));
    expect(r.principalInterest, closeTo(4088.21, 0.01));
    expect(r.tax, closeTo(595.83, 0.01));
    expect(r.total, closeTo(4834.04, 0.01));
  });

  test('zero interest divides evenly', () {
    expect(monthlyPayment(36000, 0, 30), 100);
  });

  test('BAH buying power with the website default inputs', () {
    final r = buyingPower(
      basePay: 5200,
      bahAndOther: 3300,
      monthlyDebts: 600,
      ratePct: 6.25,
      taxRatePct: 1.1,
      insuranceHoa: 150,
    );
    expect(r.grossIncome, 8500);
    expect(r.maxPayment, closeTo(3485, 0.001));
    expect(r.availableForHousing, closeTo(2885, 0.001));
    expect(r.homePrice, closeTo(379533.35, 0.01));
  });

  group('combined VA rating', () {
    test('examples from the website FAQs', () {
      final a = combinedRating([50, 30]);
      expect(a.exact, 65);
      expect(a.rounded, 70);
      expect(combinedRating([30, 20, 10]).rounded, 50);
    });
    test('order does not matter and zeros are ignored', () {
      expect(combinedRating([10, 0, 50, 30, 20]).exact, combinedRating([50, 30, 20, 10]).exact);
    });
    test('empty and exemption flag', () {
      expect(combinedRating(const []).rounded, 0);
      expect(combinedRating([10]).fundingFeeExempt, isTrue);
      expect(combinedRating([0]).fundingFeeExempt, isFalse);
    });
  });
}
