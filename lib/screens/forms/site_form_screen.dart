import 'package:cupertino_ui/cupertino_ui.dart';
import 'package:flutter/services.dart';
import 'package:material_ui/material_ui.dart';

import '../../app/org.dart';
import '../../data/site_content.dart';
import '../../services/links.dart';
import '../../ui/apple.dart';

/// Native version of a website form, laid out like an iOS Settings form.
/// Submitting opens a pre-filled email to the club so nothing is lost if the
/// phone is offline; the website form is offered as a fallback.
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
    if (f.required && value.isEmpty) return '${f.label} is required';
    if (value.isEmpty) return null;
    if (f.kind == FormFieldKind.email && !RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(value)) {
      return 'Enter a valid email address';
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
    if (!_formKey.currentState!.validate()) {
      HapticFeedback.heavyImpact();
      return;
    }
    _formKey.currentState!.save();
    final ok = await composeEmail(subject: '${widget.title} (App)', body: _body());
    if (!mounted) return;
    if (ok) {
      showToast(context, 'Mail is open with your details. Tap Send to finish.');
      return;
    }
    await Clipboard.setData(ClipboardData(text: _body()));
    if (!mounted) return;
    final useWeb = await showAppleAlert(
      context,
      title: 'No Mail App Found',
      message: 'Your answers were copied. Paste them into an email to ${Org.email}, or call ${Org.phoneDisplay}.',
      ok: widget.webPath != null ? 'Use Website' : 'OK',
      cancel: widget.webPath != null ? 'Close' : null,
    );
    if (useWeb && widget.webPath != null && mounted) {
      await openLink(context, '${Org.website}/${widget.webPath}');
    }
  }

  bool _compact(FormFieldSpec f) => switch (f.kind) {
    FormFieldKind.longText => false,
    FormFieldKind.choice => f.options.length <= 3 && f.options.every((o) => o.length <= 12),
    FormFieldKind.select => true,
    _ => f.label.length <= 26,
  };

  /// Consecutive compact fields share a section; long questions get their own.
  List<Widget> _sections() {
    final out = <Widget>[];
    var group = <FormFieldSpec>[];
    void flush() {
      if (group.isEmpty) return;
      out.add(InsetSection(dividerIndent: 16, children: [for (final f in group) _compactField(f)]));
      group = [];
    }

    for (final f in widget.fields) {
      if (_compact(f)) {
        group.add(f);
      } else {
        flush();
        out.add(
          InsetSection(header: f.required ? '${f.label} *' : f.label, dividerIndent: 54, children: [_longField(f)]),
        );
      }
    }
    flush();
    return out;
  }

  Widget _textField(FormFieldSpec f, {required String hint, bool multiline = false}) => Padding(
    padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
    child: TextFormField(
      style: context.t.bodyLarge,
      decoration: InputDecoration(hintText: hint),
      keyboardType: switch (f.kind) {
        FormFieldKind.email => TextInputType.emailAddress,
        FormFieldKind.phone => TextInputType.phone,
        _ => multiline ? TextInputType.multiline : TextInputType.text,
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
      minLines: multiline ? 3 : 1,
      maxLines: multiline ? 8 : 1,
      validator: (v) => _validate(f, v),
      onSaved: (v) => _values[f.name] = v ?? '',
    ),
  );

  Widget _compactField(FormFieldSpec f) {
    final label = f.required ? '${f.label} *' : f.label;
    switch (f.kind) {
      case FormFieldKind.select:
        return FormField<String>(
          validator: (v) => f.required && (v == null || v.isEmpty) ? '${f.label} is required' : null,
          onSaved: (v) => _values[f.name] = v ?? '',
          builder: (state) => _withError(
            state,
            AppleRow(
              title: label,
              value: state.value ?? 'Choose',
              accessory: RowAccessory.none,
              trailing: Padding(
                padding: const EdgeInsets.only(left: 6),
                child: Icon(CupertinoIcons.chevron_up_chevron_down, size: 15, color: context.c.tertiaryLabel),
              ),
              onTap: () async {
                FocusScope.of(context).unfocus();
                final i = await showApplePicker(
                  context,
                  title: f.label,
                  options: f.options,
                  initial: state.value == null ? 0 : f.options.indexOf(state.value!),
                );
                if (i != null) state.didChange(f.options[i]);
              },
            ),
          ),
        );
      case FormFieldKind.choice:
        return FormField<String>(
          validator: (v) => f.required && v == null ? '${f.label} is required' : null,
          onSaved: (v) => _values[f.name] = v ?? '',
          builder: (state) => _withError(
            state,
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: context.t.bodyLarge),
                  const SizedBox(height: 8),
                  AppleSegmented<String>(
                    value: state.value ?? '',
                    segments: {for (final o in f.options) o: o},
                    onChanged: state.didChange,
                  ),
                ],
              ),
            ),
          ),
        );
      default:
        return _textField(f, hint: label);
    }
  }

  Widget _longField(FormFieldSpec f) {
    if (f.kind != FormFieldKind.choice) {
      return _textField(f, hint: f.kind == FormFieldKind.longText ? 'Type here' : 'Answer', multiline: true);
    }
    // Selection list with checkmarks, as in iOS Settings.
    return FormField<String>(
      validator: (v) => f.required && v == null ? '${f.label} is required' : null,
      onSaved: (v) => _values[f.name] = v ?? '',
      builder: (state) => _withError(
        state,
        Column(
          children: [
            for (var i = 0; i < f.options.length; i++) ...[
              if (i > 0)
                Padding(
                  padding: const EdgeInsets.only(left: 16),
                  child: Container(height: 0.5, color: context.c.separator),
                ),
              AppleRow(
                title: f.options[i],
                accessory: RowAccessory.none,
                trailing: state.value == f.options[i]
                    ? Icon(CupertinoIcons.checkmark_alt, color: context.c.tint, size: 20)
                    : null,
                onTap: () {
                  HapticFeedback.selectionClick();
                  state.didChange(f.options[i]);
                },
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _withError(FormFieldState<String> state, Widget child) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      child,
      if (state.hasError)
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
          child: Text(state.errorText!, style: context.t.bodySmall?.copyWith(color: context.c.red)),
        ),
    ],
  );

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Scaffold(
      backgroundColor: c.bg,
      appBar: appleBar(
        context,
        widget.title,
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          minimumSize: const Size(44, 44),
          onPressed: _submit,
          child: Text(
            widget.submitLabel,
            style: TextStyle(color: c.tint, fontWeight: FontWeight.w600),
          ),
        ),
      ),
      body: Form(
        key: _formKey,
        child: AutofillGroup(
          child: ListView(
            keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
            padding: EdgeInsets.fromLTRB(0, 16, 0, 32 + MediaQuery.paddingOf(context).bottom),
            children: [
              if (widget.intro != null)
                Padding(
                  padding: const EdgeInsets.fromLTRB(kGutter + 4, 0, kGutter + 4, 16),
                  child: Text(widget.intro!, style: context.t.bodyMedium?.copyWith(color: c.secondaryLabel)),
                ),
              ..._sections(),
              Padding(
                padding: kPage,
                child: AppleButton(label: widget.submitLabel, onPressed: _submit),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(32, 12, 32, 0),
                child: Text(
                  'Sends from your Mail app to ${Org.email}. Prefer to talk? Call ${Org.phoneDisplay}.',
                  textAlign: TextAlign.center,
                  style: context.t.labelSmall?.copyWith(color: c.secondaryLabel),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
