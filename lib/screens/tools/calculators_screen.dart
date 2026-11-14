import 'package:cupertino_ui/cupertino_ui.dart';
import 'package:flutter/services.dart';
import 'package:material_ui/material_ui.dart';

import '../../logic/calculators.dart';
import '../../services/links.dart';
import '../../ui/apple.dart';

String _usd(double x) {
  final n = x.round();
  final s = n.abs().toString().replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',');
  return '${n < 0 ? '-' : ''}\$$s';
}

String _pct(double x) => '${x == x.roundToDouble() ? x.toStringAsFixed(0) : x.toString()}%';

String _num(double v) => v == v.roundToDouble() ? v.toStringAsFixed(0) : v.toString();

/// Military & VA home buying calculators (same math as the website).
class CalculatorsScreen extends StatefulWidget {
  const CalculatorsScreen({super.key, this.initial = 0});
  final int initial;

  @override
  State<CalculatorsScreen> createState() => _CalculatorsScreenState();
}

class _CalculatorsScreenState extends State<CalculatorsScreen> {
  late int _tab = widget.initial;

  // Payment
  double price = 650000, down = 0, rate = 6.25, tax = 1.1, ins = 1800, hoa = 0;
  int years = 30;
  VaLoanUse use = VaLoanUse.first;
  bool exempt = false;

  // Funding fee
  VaLoanType feeType = VaLoanType.purchase;
  VaLoanUse feeUse = VaLoanUse.first;
  double feePrice = 650000, feeDown = 0;
  bool feeExempt = false;

  // Buying power
  double pay = 5200, bah = 3300, debt = 600, aRate = 6.25, aTax = 1.1, aIns = 150;

  // Rating
  final List<double> ratings = [50, 30, 20, 10];

  @override
  Widget build(BuildContext context) {
    final (intro, result, inputs) = switch (_tab) {
      0 => _payment(),
      1 => _fee(),
      2 => _afford(),
      _ => _rating(),
    };
    return LargeTitleScaffold(
      title: 'Calculators',
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(kGutter, 0, kGutter, 14),
            child: AppleSegmented<int>(
              value: _tab,
              segments: const {0: 'Payment', 1: 'Fee', 2: 'BAH', 3: 'Rating'},
              onChanged: (v) => setState(() => _tab = v),
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(kGutter + 4, 0, kGutter + 4, 14),
            child: Text(intro, style: context.t.bodyMedium?.copyWith(color: context.c.secondaryLabel)),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(padding: const EdgeInsets.fromLTRB(kGutter, 0, kGutter, 22), child: result),
        ),
        SliverToBoxAdapter(
          child: KeyedSubtree(key: ValueKey(_tab), child: inputs),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(kGutter, 0, kGutter, 0),
            child: Column(
              children: [
                AppleButton(
                  kind: ButtonStyleKind.tinted,
                  label: 'Free VA Home Buying Webinar',
                  onPressed: () => openLink(context, 'app://va-home-buying-webinar'),
                ),
                CupertinoButton(
                  onPressed: () => openLink(
                    context,
                    'https://www.va.gov/housing-assistance/home-loans/funding-fee-and-closing-costs/',
                  ),
                  child: Text('VA Funding Fee Rules', style: context.t.bodyLarge?.copyWith(color: context.c.tint)),
                ),
                Text(
                  'Estimates only, for education. Not a loan offer, credit decision, or VA rating decision. '
                  'Taxes, insurance, rates, and VA rules vary. Confirm with your lender and VA.gov.',
                  textAlign: TextAlign.center,
                  style: context.t.labelSmall?.copyWith(color: context.c.secondaryLabel, height: 1.4),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  (String, Widget, Widget) _payment() {
    final r = vaPayment(
      price: price,
      downPct: down,
      ratePct: rate,
      years: years,
      taxRatePct: tax,
      insurancePerYear: ins,
      hoaPerMonth: hoa,
      use: use,
      exempt: exempt,
    );
    return (
      'Principal, interest, taxes, insurance, and HOA, with the VA funding fee financed into the loan.',
      _Result(
        label: 'Estimated Monthly Payment',
        value: _usd(r.total),
        rows: [
          ('Principal & interest', _usd(r.principalInterest)),
          ('Property tax', _usd(r.tax)),
          ('Insurance', _usd(r.insurance)),
          ('HOA', _usd(r.hoa)),
          ('Funding fee (financed)', '${_usd(r.fundingFee)} (${_pct(r.fundingFeeRate)})'),
          ('Total loan amount', _usd(r.loanAmount)),
        ],
      ),
      Column(
        children: [
          InsetSection(
            header: 'Loan',
            dividerIndent: 16,
            children: [
              _NumRow(label: 'Home Price', prefix: '\$', value: price, onChanged: (v) => setState(() => price = v)),
              _NumRow(label: 'Down Payment', suffix: '%', value: down, onChanged: (v) => setState(() => down = v)),
              _NumRow(label: 'Interest Rate', suffix: '%', value: rate, onChanged: (v) => setState(() => rate = v)),
              _SegRow<int>(
                label: 'Term',
                value: years,
                segments: const {30: '30 yr', 20: '20 yr', 15: '15 yr'},
                onChanged: (v) => setState(() => years = v),
              ),
            ],
          ),
          InsetSection(
            header: 'Costs',
            dividerIndent: 16,
            children: [
              _NumRow(label: 'Property Tax', suffix: '%/yr', value: tax, onChanged: (v) => setState(() => tax = v)),
              _NumRow(
                label: 'Insurance',
                prefix: '\$',
                suffix: '/yr',
                value: ins,
                onChanged: (v) => setState(() => ins = v),
              ),
              _NumRow(label: 'HOA', prefix: '\$', suffix: '/mo', value: hoa, onChanged: (v) => setState(() => hoa = v)),
            ],
          ),
          InsetSection(
            header: 'VA Funding Fee',
            footer: 'Veterans receiving VA disability compensation are generally exempt.',
            dividerIndent: 16,
            children: [
              _SegRow<VaLoanUse>(
                label: 'VA Loan Use',
                value: use,
                segments: const {VaLoanUse.first: 'First', VaLoanUse.subsequent: 'After First'},
                onChanged: (v) => setState(() => use = v),
              ),
              _SwitchRow(label: 'Exempt from Funding Fee', value: exempt, onChanged: (v) => setState(() => exempt = v)),
            ],
          ),
        ],
      ),
    );
  }

  (String, Widget, Widget) _fee() {
    final r = vaFundingFee(type: feeType, use: feeUse, priceOrBase: feePrice, downPct: feeDown, exempt: feeExempt);
    return (
      "Uses VA's published rates effective April 7, 2023. The fee is a percentage of the loan amount.",
      _Result(
        label: 'Estimated Funding Fee',
        value: _usd(r.fee),
        rows: [('Rate applied', _pct(r.rate)), ('Loan amount', _usd(r.loanAmount))],
      ),
      InsetSection(
        header: 'Loan',
        footer: 'Exempt: VA disability compensation, Purple Heart on active duty, or eligible surviving spouse.',
        dividerIndent: 16,
        children: [
          _SegRow<VaLoanType>(
            label: 'Loan Type',
            value: feeType,
            segments: const {
              VaLoanType.purchase: 'Purchase',
              VaLoanType.cashout: 'Cash-Out',
              VaLoanType.irrrl: 'IRRRL',
            },
            onChanged: (v) => setState(() => feeType = v),
          ),
          _SegRow<VaLoanUse>(
            label: 'VA Loan Use',
            value: feeUse,
            segments: const {VaLoanUse.first: 'First', VaLoanUse.subsequent: 'After First'},
            onChanged: (v) => setState(() => feeUse = v),
          ),
          _NumRow(
            label: 'Price or Loan Base',
            prefix: '\$',
            value: feePrice,
            onChanged: (v) => setState(() => feePrice = v),
          ),
          if (feeType == VaLoanType.purchase)
            _NumRow(label: 'Down Payment', suffix: '%', value: feeDown, onChanged: (v) => setState(() => feeDown = v)),
          _SwitchRow(label: 'Exempt', value: feeExempt, onChanged: (v) => setState(() => feeExempt = v)),
        ],
      ),
    );
  }

  (String, Widget, Widget) _afford() {
    final r = buyingPower(
      basePay: pay,
      bahAndOther: bah,
      monthlyDebts: debt,
      ratePct: aRate,
      taxRatePct: aTax,
      insuranceHoa: aIns,
    );
    return (
      "Estimates a home price using VA's 41% debt-to-income guideline. Lenders also review residual income and credit.",
      _Result(
        label: 'Estimated Home Price',
        value: _usd(r.homePrice),
        rows: [
          ('Gross monthly income', _usd(r.grossIncome)),
          ('Max payment at 41% DTI', _usd(r.maxPayment)),
          ('Available for housing', _usd(r.availableForHousing)),
        ],
      ),
      Column(
        children: [
          InsetSection(
            header: 'Monthly Income & Debts',
            dividerIndent: 16,
            children: [
              _NumRow(
                label: 'Base Pay',
                prefix: '\$',
                suffix: '/mo',
                value: pay,
                onChanged: (v) => setState(() => pay = v),
              ),
              _NumRow(
                label: 'BAH & Other Income',
                prefix: '\$',
                suffix: '/mo',
                value: bah,
                onChanged: (v) => setState(() => bah = v),
              ),
              _NumRow(
                label: 'Debts',
                prefix: '\$',
                suffix: '/mo',
                value: debt,
                onChanged: (v) => setState(() => debt = v),
              ),
            ],
          ),
          InsetSection(
            header: 'Home',
            dividerIndent: 16,
            children: [
              _NumRow(label: 'Interest Rate', suffix: '%', value: aRate, onChanged: (v) => setState(() => aRate = v)),
              _NumRow(label: 'Property Tax', suffix: '%/yr', value: aTax, onChanged: (v) => setState(() => aTax = v)),
              _NumRow(
                label: 'Insurance + HOA',
                prefix: '\$',
                suffix: '/mo',
                value: aIns,
                onChanged: (v) => setState(() => aIns = v),
              ),
            ],
          ),
        ],
      ),
    );
  }

  (String, Widget, Widget) _rating() {
    final r = combinedRating(ratings);
    final options = [for (var v = 0; v <= 100; v += 10) v == 0 ? 'None' : '$v%'];
    return (
      'Applies VA\'s combined ratings method ("VA math"). Bilateral factor not included.',
      _Result(
        label: 'Combined VA Rating',
        value: '${r.rounded}%',
        rows: [
          ('Combined value (VA table)', '${r.exact}'),
          ('Funding fee exempt if compensated', r.fundingFeeExempt ? 'Generally yes' : 'No'),
        ],
      ),
      InsetSection(
        header: 'Individual Ratings',
        dividerIndent: 16,
        children: [
          for (var i = 0; i < ratings.length; i++)
            AppleRow(
              title: 'Rating ${i + 1}',
              value: ratings[i] == 0 ? 'None' : '${ratings[i].round()}%',
              accessory: RowAccessory.none,
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const SizedBox(width: 4),
                  Icon(CupertinoIcons.chevron_up_chevron_down, size: 15, color: context.c.tertiaryLabel),
                  if (ratings.length > 1)
                    CupertinoButton(
                      padding: const EdgeInsets.only(left: 12),
                      minimumSize: const Size(30, 30),
                      onPressed: () => setState(() => ratings.removeAt(i)),
                      child: Icon(CupertinoIcons.minus_circle_fill, color: context.c.red, size: 22),
                    ),
                ],
              ),
              onTap: () async {
                final pick = await showApplePicker(
                  context,
                  title: 'Rating ${i + 1}',
                  options: options,
                  initial: (ratings[i] / 10).round(),
                );
                if (pick != null) setState(() => ratings[i] = pick * 10.0);
              },
            ),
          if (ratings.length < 12)
            AppleRow(
              leading: Icon(CupertinoIcons.plus_circle_fill, color: context.c.green, size: 22),
              title: 'Add Rating',
              titleColor: context.c.tint,
              accessory: RowAccessory.none,
              onTap: () => setState(() => ratings.add(10)),
            ),
        ],
      ),
    );
  }
}

class _Result extends StatelessWidget {
  const _Result({required this.label, required this.value, required this.rows});
  final String label;
  final String value;
  final List<(String, String)> rows;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return AppleCard(
      padding: const EdgeInsets.fromLTRB(18, 18, 18, 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Caption(label),
          const SizedBox(height: 4),
          Text(
            value,
            style: context.t.displayMedium?.copyWith(color: c.tint, fontFeatures: const [FontFeature.tabularFigures()]),
          ),
          const SizedBox(height: 8),
          for (final (k, v) in rows) ...[
            Container(height: 0.5, color: c.separator),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 9),
              child: Row(
                children: [
                  Expanded(
                    child: Text(k, style: context.t.bodyMedium?.copyWith(color: c.secondaryLabel)),
                  ),
                  Text(v, style: context.t.titleSmall?.copyWith(fontFeatures: const [FontFeature.tabularFigures()])),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// "Label ........ value" numeric input row, as in iOS Settings.
class _NumRow extends StatelessWidget {
  const _NumRow({required this.label, required this.value, required this.onChanged, this.prefix, this.suffix});
  final String label;
  final double value;
  final ValueChanged<double> onChanged;
  final String? prefix;
  final String? suffix;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 11, 16, 11),
      child: Row(
        children: [
          Expanded(child: Text(label, style: context.t.bodyLarge)),
          if (prefix != null) Text(prefix!, style: context.t.bodyLarge?.copyWith(color: c.secondaryLabel)),
          ConstrainedBox(
            constraints: const BoxConstraints(minWidth: 24, maxWidth: 130),
            child: IntrinsicWidth(
              child: TextFormField(
                initialValue: _num(value),
                textAlign: TextAlign.end,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[0-9.]'))],
                style: context.t.bodyLarge?.copyWith(color: c.secondaryLabel),
                onChanged: (v) => onChanged(double.tryParse(v) ?? 0),
              ),
            ),
          ),
          if (suffix != null)
            Padding(
              padding: const EdgeInsets.only(left: 2),
              child: Text(suffix!, style: context.t.bodyLarge?.copyWith(color: c.tertiaryLabel)),
            ),
        ],
      ),
    );
  }
}

class _SegRow<T extends Object> extends StatelessWidget {
  const _SegRow({required this.label, required this.value, required this.segments, required this.onChanged});
  final String label;
  final T value;
  final Map<T, String> segments;
  final ValueChanged<T> onChanged;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: context.t.bodyLarge),
        const SizedBox(height: 8),
        AppleSegmented<T>(value: value, segments: segments, onChanged: onChanged),
      ],
    ),
  );
}

class _SwitchRow extends StatelessWidget {
  const _SwitchRow({required this.label, required this.value, required this.onChanged});
  final String label;
  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.fromLTRB(16, 7, 12, 7),
    child: Row(
      children: [
        Expanded(child: Text(label, style: context.t.bodyLarge)),
        CupertinoSwitch(value: value, activeTrackColor: context.c.green, onChanged: onChanged),
      ],
    ),
  );
}
