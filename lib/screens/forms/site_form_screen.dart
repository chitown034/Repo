import 'package:flutter/services.dart';
import 'package:material_ui/material_ui.dart';

import '../../app/org.dart';
import '../../data/site_content.dart';
import '../../services/links.dart';

/// Native version of a website form. Submitting opens a pre-filled email to
/// the club so nothing is lost if the phone is offline; the website form is
/// offered as a fallback.
class SiteFormScreen extends StatefulWidget {
  const SiteFormScreen({
    super.key,
    required this.title,
    required this.fields,
    this.intro,
    this.webPath,
    this.submitLabel = 'Send',
  });

  final String title;
  final List<FormFieldSpec> fields;
  final String? intro;
  final String? webPath;
  final String submitLabel;

  @override
  State<SiteFormScreen> createState() => _SiteFormScreenState();
}

class _SiteFormScreenState extends State<SiteFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final Map<String, String> _values = {};

  String? _validate(FormFieldSpec f, String? v) {
    final value = (v ?? '').trim();
    if (f.required && value.isEmpty) return 'Required';
    if (value.isEmpty) return null;
    if (f.kind == FormFieldKind.email && !RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(value)) {
      return 'Enter a valid email';
    }
    if (f.kind == FormFieldKind.phone && value.replaceAll(RegExp(r'\D'), '').length < 10) {
      return 'Enter a 10-digit phone number';
    }
    return null;
  }

  String _body() {
    final b = StringBuffer('${widget.title} — submitted from the mobile app\n\n');
    for (final f in widget.fields) {
      final v = (_values[f.name] ?? '').trim();
      if (v.isNotEmpty) b.writeln('${f.label}: $v');
    }
    return b.toString();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();
    final ok = await composeEmail(subject: '${widget.title} (App)', body: _body());
    if (!mounted) return;
    if (ok) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Your email app is open with your details. Tap send to finish.')));
    } else {
      await Clipboard.setData(ClipboardData(text: _body()));
      if (!mounted) return;
      showDialog<void>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('No email app found'),
          content: Text(
            'Your answers were copied. Paste them into an email to ${Org.email}, '
            'or call us at ${Org.phoneDisplay}.',
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('OK')),
            if (widget.webPath != null)
              FilledButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  openLink(context, '${Org.website}/${widget.webPath}');
                },
                child: const Text('Use website form'),
              ),
          ],
        ),
      );
    }
  }

  Widget _field(FormFieldSpec f) {
    final label = f.required ? '${f.label} *' : f.label;
    switch (f.kind) {
      case FormFieldKind.select:
        return DropdownButtonFormField<String>(
          isExpanded: true,
          decoration: InputDecoration(labelText: label),
          items: [for (final o in f.options) DropdownMenuItem(value: o, child: Text(o))],
          validator: (v) => f.required && v == null ? 'Required' : null,
          onChanged: (v) => _values[f.name] = v ?? '',
          onSaved: (v) => _values[f.name] = v ?? '',
        );
      case FormFieldKind.choice:
        return FormField<String>(
          validator: (v) => f.required && v == null ? 'Required' : null,
          onSaved: (v) => _values[f.name] = v ?? '',
          builder: (state) => Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: Theme.of(context).textTheme.titleSmall),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  for (final o in f.options)
                    ChoiceChip(
                      label: Text(o),
                      selected: state.value == o,
                      onSelected: (_) {
                        state.didChange(o);
                        _values[f.name] = o;
                      },
                    ),
                ],
              ),
              if (state.hasError)
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text(
                    state.errorText!,
                    style: TextStyle(color: Theme.of(context).colorScheme.error, fontSize: 12),
                  ),
                ),
            ],
          ),
        );
      default:
        return TextFormField(
          decoration: InputDecoration(
            labelText: label,
            hintText: f.placeholder,
            alignLabelWithHint: f.kind == FormFieldKind.longText,
          ),
          keyboardType: switch (f.kind) {
            FormFieldKind.email => TextInputType.emailAddress,
            FormFieldKind.phone => TextInputType.phone,
            FormFieldKind.longText => TextInputType.multiline,
            _ => TextInputType.text,
          },
          autofillHints: switch (f.label.toLowerCase()) {
            'first name' => const [AutofillHints.givenName],
            'last name' => const [AutofillHints.familyName],
            'name' => const [AutofillHints.name],
            'email' => const [AutofillHints.email],
            'phone' => const [AutofillHints.telephoneNumber],
            'zip' => const [AutofillHints.postalCode],
            'city' => const [AutofillHints.addressCity],
            _ => null,
          },
          textCapitalization: f.kind == FormFieldKind.email ? TextCapitalization.none : TextCapitalization.sentences,
          minLines: f.kind == FormFieldKind.longText ? 3 : 1,
          maxLines: f.kind == FormFieldKind.longText ? 6 : 1,
          validator: (v) => _validate(f, v),
          onSaved: (v) => _values[f.name] = v ?? '',
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: Form(
        key: _formKey,
        child: AutofillGroup(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
            children: [
              if (widget.intro != null) ...[
                Text(widget.intro!, style: Theme.of(context).textTheme.bodyLarge),
                const SizedBox(height: 16),
              ],
              for (final f in widget.fields) ...[_field(f), const SizedBox(height: 14)],
              const SizedBox(height: 8),
              FilledButton.icon(onPressed: _submit, icon: const Icon(Icons.send), label: Text(widget.submitLabel)),
              const SizedBox(height: 12),
              Text(
                'Sends from your email app to ${Org.email}. Prefer to talk? Call ${Org.phoneDisplay}.',
                style: Theme.of(context).textTheme.bodySmall,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
