import 'package:flutter/services.dart';
import 'package:material_ui/material_ui.dart';

import '../../logic/calculators.dart';
import '../../services/links.dart';

final _usd = _UsdFormat();

class _UsdFormat {
  String call(double x) {
    final n = x.round();
    final s = n.abs().toString();
    final b = StringBuffer();
    for (var i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) b.write(',');
      b.write(s[i]);
    }
    return '${n < 0 ? '-' : ''}\$$b';
  }
}

String _pct(double x) => '${x == x.roundToDouble() ? x.toStringAsFixed(0) : x.toString()}%';

/// Military & VA home buying calculators (same math as the website).
class CalculatorsScreen extends StatelessWidget {
  const CalculatorsScreen({super.key, this.initial = 0});
  final int initial;

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 4,
      initialIndex: initial,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Calculators'),
          bottom: const TabBar(
            isScrollable: true,
            tabAlignment: TabAlignment.start,
            tabs: [
              Tab(text: 'Payment'),
              Tab(text: 'Funding fee'),
              Tab(text: 'BAH buying power'),
              Tab(text: 'VA rating'),
            ],
          ),
        ),
        body: const TabBarView(children: [_PaymentCalc(), _FeeCalc(), _AffordCalc(), _RatingCalc()]),
      ),
    );
  }
}

class _NumField extends StatelessWidget {
  const _NumField({required this.label, required this.value, required this.onChanged, this.prefix, this.suffix});
  final String label;
  final double value;
  final ValueChanged<double> onChanged;
  final String? prefix;
  final String? suffix;

  @override
  Widget build(BuildContext context) => TextFormField(
    initialValue: value == 0 ? '0' : _fmt(value),
    keyboardType: const TextInputType.numberWithOptions(decimal: true),
    inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[0-9.]'))],
    decoration: InputDecoration(labelText: label, prefixText: prefix, suffixText: suffix),
    onChanged: (v) => onChanged(double.tryParse(v) ?? 0),
  );

  static String _fmt(double v) => v == v.roundToDouble() ? v.toStringAsFixed(0) : v.toString();
}

class _Results extends StatelessWidget {
  const _Results({required this.headline, required this.headlineLabel, required this.rows});
  final String headline;
  final String headlineLabel;
  final List<(String, String)> rows;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    return Card(
      color: scheme.primary.withValues(alpha: 0.06),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(headlineLabel, style: t.labelLarge?.copyWith(color: scheme.onSurfaceVariant)),
            const SizedBox(height: 4),
            Text(headline, style: t.displaySmall?.copyWith(color: scheme.primary)),
            const SizedBox(height: 10),
            for (final (k, v) in rows)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  children: [
                    Expanded(child: Text(k, style: t.bodyMedium)),
                    Text(v, style: t.titleSmall),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}

Widget _page(BuildContext context, String intro, List<Widget> fields, Widget results) {
  final t = Theme.of(context).textTheme;
  return ListView(
    padding: const EdgeInsets.fromLTRB(20, 16, 20, 40),
    children: [
      Text(intro, style: t.bodyMedium?.copyWith(color: Theme.of(context).colorScheme.onSurfaceVariant)),
      const SizedBox(height: 16),
      results,
      const SizedBox(height: 20),
      for (final f in fields) ...[f, const SizedBox(height: 12)],
      const SizedBox(height: 8),
      Text(
        'Estimates only, for education. Not a loan offer, credit decision, or VA rating decision. Taxes, '
        'insurance, rates, and VA rules vary. Confirm with your lender and VA.gov.',
        style: t.bodySmall?.copyWith(color: Theme.of(context).colorScheme.onSurfaceVariant),
      ),
      const SizedBox(height: 12),
      Wrap(
        spacing: 8,
        runSpacing: 8,
        children: [
          OutlinedButton(
            onPressed: () => openLink(context, 'app://va-home-buying-webinar'),
            child: const Text('Free VA home buying webinar'),
          ),
          TextButton(
            onPressed: () =>
                openLink(context, 'https://www.va.gov/housing-assistance/home-loans/funding-fee-and-closing-costs/'),
            child: const Text('VA funding fee rules'),
          ),
        ],
      ),
    ],
  );
}

class _UseToggle extends StatelessWidget {
  const _UseToggle({required this.use, required this.onChanged});
  final VaLoanUse use;
  final ValueChanged<VaLoanUse> onChanged;

  @override
  Widget build(BuildContext context) => SegmentedButton<VaLoanUse>(
    segments: const [
      ButtonSegment(value: VaLoanUse.first, label: Text('First use')),
      ButtonSegment(value: VaLoanUse.subsequent, label: Text('After first use')),
    ],
    selected: {use},
    onSelectionChanged: (s) => onChanged(s.first),
  );
}

class _ExemptSwitch extends StatelessWidget {
  const _ExemptSwitch({required this.value, required this.onChanged, required this.label});
  final bool value;
  final ValueChanged<bool> onChanged;
  final String label;

  @override
  Widget build(BuildContext context) => SwitchListTile(
    contentPadding: EdgeInsets.zero,
    value: value,
    onChanged: onChanged,
    title: Text(label, style: Theme.of(context).textTheme.bodyMedium),
  );
}

class _PaymentCalc extends StatefulWidget {
  const _PaymentCalc();
  @override
  State<_PaymentCalc> createState() => _PaymentCalcState();
}

class _PaymentCalcState extends State<_PaymentCalc> with AutomaticKeepAliveClientMixin {
  double price = 650000, down = 0, rate = 6.25, tax = 1.1, ins = 1800, hoa = 0;
  int years = 30;
  VaLoanUse use = VaLoanUse.first;
  bool exempt = false;

  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context);
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
    return _page(
      context,
      'Principal, interest, taxes, insurance, and HOA, with the VA funding fee financed into the loan.',
      [
        _NumField(label: 'Home price', prefix: '\$ ', value: price, onChanged: (v) => setState(() => price = v)),
        Row(
          children: [
            Expanded(
              child: _NumField(
                label: 'Down payment',
                suffix: '%',
                value: down,
                onChanged: (v) => setState(() => down = v),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _NumField(
                label: 'Interest rate',
                suffix: '%',
                value: rate,
                onChanged: (v) => setState(() => rate = v),
              ),
            ),
          ],
        ),
        SegmentedButton<int>(
          segments: const [
            ButtonSegment(value: 30, label: Text('30 yr')),
            ButtonSegment(value: 20, label: Text('20 yr')),
            ButtonSegment(value: 15, label: Text('15 yr')),
          ],
          selected: {years},
          onSelectionChanged: (s) => setState(() => years = s.first),
        ),
        Row(
          children: [
            Expanded(
              child: _NumField(
                label: 'Property tax',
                suffix: '%/yr',
                value: tax,
                onChanged: (v) => setState(() => tax = v),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _NumField(
                label: 'Insurance',
                prefix: '\$ ',
                suffix: '/yr',
                value: ins,
                onChanged: (v) => setState(() => ins = v),
              ),
            ),
          ],
        ),
        _NumField(label: 'HOA', prefix: '\$ ', suffix: '/mo', value: hoa, onChanged: (v) => setState(() => hoa = v)),
        _UseToggle(use: use, onChanged: (v) => setState(() => use = v)),
        _ExemptSwitch(
          value: exempt,
          onChanged: (v) => setState(() => exempt = v),
          label: 'Exempt from funding fee (for example, receiving VA disability compensation)',
        ),
      ],
      _Results(
        headlineLabel: 'Estimated monthly payment',
        headline: _usd(r.total),
        rows: [
          ('Principal & interest', _usd(r.principalInterest)),
          ('Property tax', _usd(r.tax)),
          ('Insurance', _usd(r.insurance)),
          ('HOA', _usd(r.hoa)),
          ('Funding fee (financed)', '${_usd(r.fundingFee)} (${_pct(r.fundingFeeRate)})'),
          ('Total loan amount', _usd(r.loanAmount)),
        ],
      ),
    );
  }
}

class _FeeCalc extends StatefulWidget {
  const _FeeCalc();
  @override
  State<_FeeCalc> createState() => _FeeCalcState();
}

class _FeeCalcState extends State<_FeeCalc> with AutomaticKeepAliveClientMixin {
  VaLoanType type = VaLoanType.purchase;
  VaLoanUse use = VaLoanUse.first;
  double price = 650000, down = 0;
  bool exempt = false;

  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context);
    final r = vaFundingFee(type: type, use: use, priceOrBase: price, downPct: down, exempt: exempt);
    return _page(
      context,
      "Uses VA's published rates effective April 7, 2023. Fee is a percentage of the loan amount.",
      [
        DropdownButtonFormField<VaLoanType>(
          initialValue: type,
          decoration: const InputDecoration(labelText: 'Loan type'),
          items: const [
            DropdownMenuItem(value: VaLoanType.purchase, child: Text('Purchase or construction')),
            DropdownMenuItem(value: VaLoanType.cashout, child: Text('Cash-out refinance')),
            DropdownMenuItem(value: VaLoanType.irrrl, child: Text('IRRRL (rate reduction)')),
          ],
          onChanged: (v) => setState(() => type = v ?? type),
        ),
        _UseToggle(use: use, onChanged: (v) => setState(() => use = v)),
        _NumField(
          label: 'Price or loan base',
          prefix: '\$ ',
          value: price,
          onChanged: (v) => setState(() => price = v),
        ),
        if (type == VaLoanType.purchase)
          _NumField(label: 'Down payment', suffix: '%', value: down, onChanged: (v) => setState(() => down = v)),
        _ExemptSwitch(
          value: exempt,
          onChanged: (v) => setState(() => exempt = v),
          label: 'Exempt (VA disability compensation, Purple Heart on active duty, or eligible surviving spouse)',
        ),
      ],
      _Results(
        headlineLabel: 'Estimated funding fee',
        headline: _usd(r.fee),
        rows: [('Rate applied', _pct(r.rate)), ('Loan amount', _usd(r.loanAmount))],
      ),
    );
  }
}

class _AffordCalc extends StatefulWidget {
  const _AffordCalc();
  @override
  State<_AffordCalc> createState() => _AffordCalcState();
}

class _AffordCalcState extends State<_AffordCalc> with AutomaticKeepAliveClientMixin {
  double pay = 5200, bah = 3300, debt = 600, rate = 6.25, tax = 1.1, ins = 150;

  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context);
    final r = buyingPower(
      basePay: pay,
      bahAndOther: bah,
      monthlyDebts: debt,
      ratePct: rate,
      taxRatePct: tax,
      insuranceHoa: ins,
    );
    return _page(
      context,
      "Estimates a home price using VA's 41% debt-to-income guideline. Lenders also review residual income and credit.",
      [
        _NumField(
          label: 'Base pay',
          prefix: '\$ ',
          suffix: '/mo',
          value: pay,
          onChanged: (v) => setState(() => pay = v),
        ),
        _NumField(
          label: 'BAH and other income',
          prefix: '\$ ',
          suffix: '/mo',
          value: bah,
          onChanged: (v) => setState(() => bah = v),
        ),
        _NumField(
          label: 'Monthly debts',
          prefix: '\$ ',
          suffix: '/mo',
          value: debt,
          onChanged: (v) => setState(() => debt = v),
        ),
        Row(
          children: [
            Expanded(
              child: _NumField(
                label: 'Interest rate',
                suffix: '%',
                value: rate,
                onChanged: (v) => setState(() => rate = v),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _NumField(
                label: 'Property tax',
                suffix: '%/yr',
                value: tax,
                onChanged: (v) => setState(() => tax = v),
              ),
            ),
          ],
        ),
        _NumField(
          label: 'Insurance + HOA',
          prefix: '\$ ',
          suffix: '/mo',
          value: ins,
          onChanged: (v) => setState(() => ins = v),
        ),
      ],
      _Results(
        headlineLabel: 'Estimated home price',
        headline: _usd(r.homePrice),
        rows: [
          ('Gross monthly income', _usd(r.grossIncome)),
          ('Max total payment at 41% DTI', _usd(r.maxPayment)),
          ('Available for housing', _usd(r.availableForHousing)),
        ],
      ),
    );
  }
}

class _RatingCalc extends StatefulWidget {
  const _RatingCalc();
  @override
  State<_RatingCalc> createState() => _RatingCalcState();
}

class _RatingCalcState extends State<_RatingCalc> with AutomaticKeepAliveClientMixin {
  final List<double> ratings = [50, 30, 20, 10];

  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context);
    final r = combinedRating(ratings);
    return _page(
      context,
      'Applies VA\'s combined ratings method ("VA math"). Bilateral factor not included.',
      [
        for (var i = 0; i < ratings.length; i++)
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<double>(
                  initialValue: ratings[i],
                  decoration: InputDecoration(labelText: 'Rating ${i + 1}'),
                  items: [
                    for (var v = 0; v <= 100; v += 10)
                      DropdownMenuItem(value: v.toDouble(), child: Text(v == 0 ? 'None' : '$v%')),
                  ],
                  onChanged: (v) => setState(() => ratings[i] = v ?? 0),
                ),
              ),
              IconButton(
                tooltip: 'Remove',
                onPressed: ratings.length > 1 ? () => setState(() => ratings.removeAt(i)) : null,
                icon: const Icon(Icons.remove_circle_outline),
              ),
            ],
          ),
        if (ratings.length < 12)
          Align(
            alignment: Alignment.centerLeft,
            child: TextButton.icon(
              onPressed: () => setState(() => ratings.add(10)),
              icon: const Icon(Icons.add),
              label: const Text('Add a rating'),
            ),
          ),
      ],
      _Results(
        headlineLabel: 'Combined VA rating',
        headline: '${r.rounded}%',
        rows: [
          ('Combined value (VA table)', '${r.exact}'),
          ('Funding fee exempt if compensated', r.fundingFeeExempt ? 'Generally yes' : 'No'),
        ],
      ),
    );
  }
}
