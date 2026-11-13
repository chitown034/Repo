import 'dart:math' as math;

/// Calculator math, ported 1:1 from veteransresourcenetwork.org/calculators.
/// Estimates only, for education.

enum VaLoanType { purchase, cashout, irrrl }

enum VaLoanUse { first, subsequent }

/// VA funding fee percentage (VA rates effective April 7, 2023).
double fundingFeeRate({
  required VaLoanType type,
  required VaLoanUse use,
  required double downPct,
  required bool exempt,
}) {
  if (exempt) return 0;
  if (type == VaLoanType.irrrl) return 0.5;
  if (type == VaLoanType.cashout) return use == VaLoanUse.first ? 2.15 : 3.3;
  if (downPct >= 10) return 1.25;
  if (downPct >= 5) return 1.5;
  return use == VaLoanUse.first ? 2.15 : 3.3;
}

/// Monthly principal & interest payment.
double monthlyPayment(double principal, double ratePct, int years) {
  final r = ratePct / 100 / 12;
  final k = years * 12;
  if (k <= 0) return 0;
  if (r == 0) return principal / k;
  return principal * r / (1 - math.pow(1 + r, -k));
}

class PaymentResult {
  const PaymentResult({
    required this.principalInterest,
    required this.tax,
    required this.insurance,
    required this.hoa,
    required this.fundingFee,
    required this.fundingFeeRate,
    required this.loanAmount,
  });
  final double principalInterest;
  final double tax;
  final double insurance;
  final double hoa;
  final double fundingFee;
  final double fundingFeeRate;
  final double loanAmount;
  double get total => principalInterest + tax + insurance + hoa;
}

PaymentResult vaPayment({
  required double price,
  required double downPct,
  required double ratePct,
  required int years,
  required double taxRatePct,
  required double insurancePerYear,
  required double hoaPerMonth,
  required VaLoanUse use,
  required bool exempt,
}) {
  final base = price * (1 - downPct / 100);
  final rate = fundingFeeRate(type: VaLoanType.purchase, use: use, downPct: downPct, exempt: exempt);
  final fee = base * rate / 100;
  final loan = base + fee;
  return PaymentResult(
    principalInterest: monthlyPayment(loan, ratePct, years),
    tax: price * taxRatePct / 100 / 12,
    insurance: insurancePerYear / 12,
    hoa: hoaPerMonth,
    fundingFee: fee,
    fundingFeeRate: rate,
    loanAmount: loan,
  );
}

class FundingFeeResult {
  const FundingFeeResult(this.rate, this.loanAmount);
  final double rate;
  final double loanAmount;
  double get fee => loanAmount * rate / 100;
}

FundingFeeResult vaFundingFee({
  required VaLoanType type,
  required VaLoanUse use,
  required double priceOrBase,
  required double downPct,
  required bool exempt,
}) {
  final down = type == VaLoanType.purchase ? downPct : 0.0;
  final loan = priceOrBase * (1 - down / 100);
  return FundingFeeResult(fundingFeeRate(type: type, use: use, downPct: down, exempt: exempt), loan);
}

class AffordResult {
  const AffordResult(this.grossIncome, this.maxPayment, this.availableForHousing, this.homePrice);
  final double grossIncome;
  final double maxPayment;
  final double availableForHousing;
  final double homePrice;
}

/// Buying power using VA's 41% debt-to-income guideline, BAH counted as income.
AffordResult buyingPower({
  required double basePay,
  required double bahAndOther,
  required double monthlyDebts,
  required double ratePct,
  required double taxRatePct,
  required double insuranceHoa,
}) {
  final income = basePay + bahAndOther;
  final max = income * 0.41;
  final house = math.max(0.0, max - monthlyDebts);
  final r = ratePct / 100 / 12;
  const k = 360;
  final taxRate = taxRatePct / 100 / 12;
  final factor = (r == 0 ? 1 / k : r / (1 - math.pow(1 + r, -k))) * 1.0215 + taxRate;
  final price = math.max(0.0, (house - insuranceHoa) / factor);
  return AffordResult(income, max, house, price);
}

class RatingResult {
  const RatingResult(this.exact, this.rounded);
  final int exact;
  final int rounded;
  bool get fundingFeeExempt => rounded >= 10;
}

/// VA combined ratings ("VA math"); bilateral factor not included.
RatingResult combinedRating(Iterable<double> ratings) {
  final vals = ratings.map((v) => v.clamp(0, 100).toDouble()).where((v) => v > 0).toList()
    ..sort((a, b) => b.compareTo(a));
  if (vals.isEmpty) return const RatingResult(0, 0);
  var combined = 0;
  for (final v in vals) {
    combined = _jsRound(combined + (100 - combined) * v / 100);
  }
  return RatingResult(combined, _jsRound(combined / 10) * 10);
}

/// JavaScript Math.round semantics (half rounds toward +infinity).
int _jsRound(num x) => (x + 0.5).floor();
