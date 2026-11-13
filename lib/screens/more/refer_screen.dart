import 'package:cupertino_ui/cupertino_ui.dart';
import 'package:flutter_contacts/flutter_contacts.dart';
import 'package:material_ui/material_ui.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../app/org.dart';
import '../../app/routes.dart';
import '../../logic/referral.dart';
import '../../ui/apple.dart';

/// Pay It Forward: pick people from the phone's contacts,
/// choose a pre-drafted intro, and send each one a 3-way text with Steven.
class ReferScreen extends StatefulWidget {
  const ReferScreen({super.key});

  @override
  State<ReferScreen> createState() => _ReferScreenState();
}

class _ReferScreenState extends State<ReferScreen> {
  List<Invitee>? _contacts;
  final List<Invitee> _manual = [];
  String _search = '';
  bool _loading = false;
  bool _denied = false;
  ReferralTone _tone = referralTones.first;

  /// Wording edited by the user; null means the tone's own text.
  String? _custom;

  String get _template => _custom ?? _tone.template;
  List<Invitee> get _all => [..._manual, ...?_contacts];
  List<Invitee> get _selected => _all.where((i) => i.selected).toList();

  Future<void> _loadContacts() async {
    setState(() => _loading = true);
    try {
      final status = await FlutterContacts.permissions.request(PermissionType.read);
      if (status != PermissionStatus.granted && status != PermissionStatus.limited) {
        setState(() {
          _denied = true;
          _loading = false;
        });
        return;
      }
      final list = await FlutterContacts.getAll(properties: {ContactProperty.name, ContactProperty.phone});
      final steven = phoneKey(Org.referralCcNumber);
      final out = <Invitee>[];
      for (final c in list) {
        if (c.phones.isEmpty) continue;
        // Prefer a mobile number: the intro is a text message.
        final phone = c.phones.firstWhere(
          (p) => p.label.label == PhoneLabel.mobile || p.label.label == PhoneLabel.iPhone,
          orElse: () => c.phones.first,
        );
        if (phoneKey(phone.number) == steven) continue;
        final first = (c.name?.first ?? '').trim();
        out.add(Invitee(c.displayName ?? 'No Name', phone.number, firstName: first.isEmpty ? null : first));
      }
      out.sort((a, b) => a.name.toLowerCase().compareTo(b.name.toLowerCase()));
      setState(() {
        _contacts = out;
        _denied = false;
        _loading = false;
      });
    } catch (_) {
      setState(() {
        _denied = true;
        _loading = false;
      });
    }
  }

  Future<void> _addManual() async {
    final name = TextEditingController();
    final phone = TextEditingController();
    final ok = await showCupertinoDialog<bool>(
      context: context,
      builder: (ctx) => CupertinoAlertDialog(
        title: const Text('Add a Friend'),
        content: Padding(
          padding: const EdgeInsets.only(top: 12),
          child: Column(
            children: [
              CupertinoTextField(controller: name, placeholder: 'Name', textCapitalization: TextCapitalization.words),
              const SizedBox(height: 8),
              CupertinoTextField(controller: phone, placeholder: 'Mobile Number', keyboardType: TextInputType.phone),
            ],
          ),
        ),
        actions: [
          CupertinoDialogAction(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          CupertinoDialogAction(
            isDefaultAction: true,
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Add'),
          ),
        ],
      ),
    );
    if (ok != true || !mounted) return;
    if (phoneKey(phone.text).length < 10) {
      showToast(context, 'Enter a 10-digit mobile number');
    } else if (phoneKey(phone.text) == phoneKey(Org.referralCcNumber)) {
      showToast(context, "That's Steven's number. He's in every text.");
    } else {
      setState(() => _manual.insert(0, Invitee(name.text.trim(), phone.text.trim())..selected = true));
    }
  }

  Future<void> _pickTone() async {
    final i = await showApplePicker(
      context,
      title: 'Message',
      options: [for (final t in referralTones) t.name],
      initial: referralTones.indexOf(_tone),
    );
    if (i != null) {
      setState(() {
        _tone = referralTones[i];
        _custom = null;
      });
    }
  }

  Future<void> _editMessage() async {
    final text = await Navigator.of(context).push<String>(
      appleRoute(
        _EditMessageScreen(initial: _template, original: _tone.template),
        title: 'Back',
      ),
    );
    if (text != null) setState(() => _custom = text.trim().isEmpty || text == _tone.template ? null : text);
  }

  Future<void> _startSending() async {
    final people = _selected;
    for (final p in people) {
      p.sent = false;
    }
    await pushScreen(
      context,
      SendRunScreen(people: people, template: _template),
      title: 'Back',
    );
    if (!mounted) return;
    setState(() {
      for (final p in people) {
        if (p.sent) p.selected = false;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final q = _search.toLowerCase();
    final visible = [
      for (final i in _all)
        if (q.isEmpty || i.name.toLowerCase().contains(q) || i.phone.contains(q)) i,
    ];
    final selected = _selected;
    final count = selected.length;
    final previewName = selected.isNotEmpty && selected.first.firstName.isNotEmpty ? selected.first.firstName : 'Alex';
    return LargeTitleScaffold(
      title: 'Pay It Forward',
      bottomBar: count == 0
          ? null
          : DecoratedBox(
              decoration: BoxDecoration(
                color: c.bg.withValues(alpha: 0.94),
                border: Border(top: BorderSide(color: c.separator, width: 0.5)),
              ),
              child: SafeArea(
                top: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(kGutter, 10, kGutter, 10),
                  child: AppleButton(
                    icon: CupertinoIcons.paperplane_fill,
                    label: 'Send to $count Friend${count == 1 ? '' : 's'}',
                    onPressed: _startSending,
                  ),
                ),
              ),
            ),
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(kGutter + 4, 0, kGutter + 4, 16),
            child: Text(
              'Know a vet who should be using their VA benefit? Pick them from your contacts and each one gets '
              'their own 3-way text with you and Steven.',
              style: context.t.bodyLarge?.copyWith(color: c.secondaryLabel),
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(kGutter, 0, kGutter, 12),
            child: AppleCard(
              padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Align(alignment: Alignment.centerLeft, child: Caption('To: $previewName, Steven & You')),
                  const SizedBox(height: 10),
                  _Bubble(text: fillReferral(_template, previewName)),
                ],
              ),
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: InsetSection(
            dividerIndent: 16,
            footer:
                "Each friend's first name is filled in automatically. Steven (${Org.referralCcNumber}) is in "
                'every text so he can take it from there.',
            children: [
              AppleRow(
                title: 'Message',
                value: _custom != null ? 'Custom' : _tone.name,
                accessory: RowAccessory.none,
                trailing: Padding(
                  padding: const EdgeInsets.only(left: 6),
                  child: Icon(CupertinoIcons.chevron_up_chevron_down, size: 15, color: c.tertiaryLabel),
                ),
                onTap: _pickTone,
              ),
              AppleRow(title: 'Edit Wording', onTap: _editMessage),
            ],
          ),
        ),
        SliverToBoxAdapter(
          child: InsetSection(
            header: 'Who Comes to Mind?',
            footer: _denied ? 'Contacts access is off. Turn it on in Settings, or add numbers yourself.' : null,
            children: [
              if (_contacts == null)
                AppleRow(
                  icon: CupertinoIcons.person_crop_circle_fill,
                  iconColor: Hue.blue,
                  title: 'Choose from Contacts',
                  subtitle: 'Opens your phone’s contact list',
                  trailing: _loading ? const CupertinoActivityIndicator() : null,
                  onTap: _loading ? null : _loadContacts,
                ),
              if (_denied)
                AppleRow(
                  icon: CupertinoIcons.settings,
                  iconColor: Hue.gray,
                  title: 'Open Settings',
                  onTap: () => FlutterContacts.permissions.openSettings(),
                ),
              AppleRow(icon: CupertinoIcons.plus, iconColor: Hue.green, title: 'Add Phone Number', onTap: _addManual),
              AppleRow(
                icon: CupertinoIcons.share,
                iconColor: Hue.gray,
                title: 'Share Another Way',
                onTap: () => SharePlus.instance.share(ShareParams(text: referralMessage(''))),
              ),
            ],
          ),
        ),
        if (_all.isNotEmpty)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(kGutter, 0, kGutter, 12),
              child: AppleSearchField(
                placeholder: 'Search contacts',
                onChanged: (v) => setState(() => _search = v.trim()),
              ),
            ),
          ),
        if (_contacts != null && _all.isEmpty)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Text(
                'No contacts with phone numbers.',
                textAlign: TextAlign.center,
                style: context.t.bodyLarge?.copyWith(color: c.secondaryLabel),
              ),
            ),
          ),
        // Lazily built inset-grouped list for large address books.
        SliverPadding(
          padding: kPage,
          sliver: SliverList.builder(
            itemCount: visible.length,
            itemBuilder: (context, idx) {
              final i = visible[idx];
              final first = idx == 0;
              final last = idx == visible.length - 1;
              return ClipRSuperellipse(
                borderRadius: BorderRadius.vertical(
                  top: Radius.circular(first ? 14 : 0),
                  bottom: Radius.circular(last ? 14 : 0),
                ),
                child: ColoredBox(
                  color: c.card,
                  child: Column(
                    children: [
                      if (!first)
                        Padding(
                          padding: const EdgeInsets.only(left: 54),
                          child: Container(height: 0.5, color: c.separator),
                        ),
                      AppleRow(
                        leading: Icon(
                          i.selected ? CupertinoIcons.checkmark_circle_fill : CupertinoIcons.circle,
                          color: i.selected ? c.tint : c.tertiaryLabel,
                          size: 26,
                        ),
                        title: i.name.isEmpty ? i.phone : i.name,
                        subtitle: i.phone,
                        value: i.sent ? 'Sent' : null,
                        accessory: RowAccessory.none,
                        onTap: () => setState(() => i.selected = !i.selected),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

/// iMessage-style bubble.
class _Bubble extends StatelessWidget {
  const _Bubble({required this.text});
  final String text;

  @override
  Widget build(BuildContext context) => Container(
    constraints: const BoxConstraints(maxWidth: 300),
    padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 9),
    decoration: const ShapeDecoration(
      color: Color(0xFF0A84FF),
      shape: RoundedSuperellipseBorder(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(18),
          topRight: Radius.circular(18),
          bottomLeft: Radius.circular(18),
          bottomRight: Radius.circular(5),
        ),
      ),
    ),
    child: Text(text, style: context.t.bodyMedium?.copyWith(color: Colors.white, height: 1.35)),
  );
}

/// Edits the wording used for everyone; keeps [referralToken] as the name placeholder.
class _EditMessageScreen extends StatefulWidget {
  const _EditMessageScreen({required this.initial, required this.original});
  final String initial;
  final String original;

  @override
  State<_EditMessageScreen> createState() => _EditMessageScreenState();
}

class _EditMessageScreenState extends State<_EditMessageScreen> {
  late final _text = TextEditingController(text: widget.initial);

  @override
  void dispose() {
    _text.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Scaffold(
      backgroundColor: c.bg,
      appBar: appleBar(
        context,
        'Edit Wording',
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          minimumSize: const Size(44, 44),
          onPressed: () => Navigator.pop(context, _text.text),
          child: Text(
            'Done',
            style: TextStyle(color: c.tint, fontWeight: FontWeight.w600),
          ),
        ),
      ),
      body: ListView(
        keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
        padding: const EdgeInsets.only(top: 16, bottom: 32),
        children: [
          InsetSection(
            footer: 'Keep $referralToken where each friend’s name should go.',
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                child: TextField(
                  controller: _text,
                  minLines: 6,
                  maxLines: 14,
                  textCapitalization: TextCapitalization.sentences,
                  style: context.t.bodyLarge?.copyWith(height: 1.4),
                ),
              ),
            ],
          ),
          Padding(
            padding: kPage,
            child: AppleButton(
              kind: ButtonStyleKind.gray,
              label: 'Reset to Original',
              onPressed: () => setState(() => _text.text = widget.original),
            ),
          ),
        ],
      ),
    );
  }
}

/// Sends the intro to everyone selected: Messages opens for the first person,
/// and each time the user comes back the next one opens, until all are done.
class SendRunScreen extends StatefulWidget {
  const SendRunScreen({super.key, required this.people, required this.template, this.open, this.autoStart = true});

  final List<Invitee> people;
  final String template;

  /// Overridable for tests; defaults to opening the phone's messaging app.
  final Future<bool> Function(Invitee)? open;
  final bool autoStart;

  @override
  State<SendRunScreen> createState() => _SendRunScreenState();
}

class _SendRunScreenState extends State<SendRunScreen> with WidgetsBindingObserver {
  late final SendRun _run = SendRun(widget.people, open: widget.open ?? _openMessages);

  Future<bool> _openMessages(Invitee p) =>
      launchUrl(referralSmsUri([p.phone, Org.referralCcNumber], fillReferral(widget.template, p.firstName)))
          .catchError((_) => false);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _run.addListener(_changed);
    if (widget.autoStart) WidgetsBinding.instance.addPostFrameCallback((_) => _run.send());
  }

  void _changed() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _run.removeListener(_changed);
    _run.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused || state == AppLifecycleState.hidden) {
      _run.onLeftApp();
    } else if (state == AppLifecycleState.resumed) {
      final next = _run.onReturned();
      if (next != null) {
        // A short beat so the user sees who was sent before Messages opens again.
        Future<void>.delayed(const Duration(milliseconds: 900), () {
          if (mounted && _run.auto && _run.awaiting == null && !next.sent) _run.send(next);
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final t = context.t;
    final total = _run.people.length;
    final next = _run.next;
    final awaiting = _run.awaiting;
    final (IconData icon, Color color, String title, String body) = _run.done
        ? (
            CupertinoIcons.checkmark_seal_fill,
            c.green,
            'All $total sent. Thank you.',
            'Steven will reply in each thread and take it from there.',
          )
        : _run.failed
        ? (
            CupertinoIcons.exclamationmark_circle_fill,
            c.red,
            'Messages didn’t open',
            'This device has no messaging app available. Try again on your phone.',
          )
        : awaiting != null
        ? (
            CupertinoIcons.chat_bubble_2_fill,
            c.tint,
            'Messages is open for ${_name(awaiting)}',
            'Tap Send there, then come back here. The next text opens by itself.',
          )
        : _run.auto && _run.sentCount > 0
        ? (
            CupertinoIcons.paperplane_fill,
            c.tint,
            'Opening Messages for ${_name(next!)}…',
            'Sent ${_run.sentCount} of $total so far.',
          )
        : (
            CupertinoIcons.paperplane_fill,
            c.tint,
            'Ready to send ${_run.sentCount == 0 ? total : total - _run.sentCount}',
            'Each person gets their own 3-way text with you and Steven.',
          );
    return LargeTitleScaffold(
      title: 'Sending',
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(kGutter, 0, kGutter, 16),
            child: AppleCard(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(icon, color: color, size: 26),
                      const SizedBox(width: 10),
                      Expanded(child: Text(title, style: t.titleMedium)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(body, style: t.bodyMedium?.copyWith(color: c.secondaryLabel)),
                  const SizedBox(height: 14),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(3),
                    child: LinearProgressIndicator(
                      value: total == 0 ? 0 : _run.sentCount / total,
                      minHeight: 6,
                      backgroundColor: c.fill,
                      color: c.green,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text('${_run.sentCount} of $total sent', style: t.bodySmall?.copyWith(color: c.secondaryLabel)),
                ],
              ),
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(kGutter, 0, kGutter, 22),
            child: _run.done
                ? AppleButton(label: 'Done', onPressed: () => Navigator.pop(context))
                : awaiting != null
                ? AppleButton(
                    kind: ButtonStyleKind.gray,
                    label: 'Open Messages Again',
                    onPressed: () => _run.send(awaiting),
                  )
                : _run.auto && _run.sentCount > 0
                ? AppleButton(kind: ButtonStyleKind.gray, label: 'Pause', onPressed: _run.pause)
                : AppleButton(
                    icon: CupertinoIcons.paperplane_fill,
                    label: _run.sentCount == 0 ? 'Send to All $total' : 'Continue with ${_name(next!)}',
                    onPressed: () {
                      _run.auto = true;
                      _run.send();
                    },
                  ),
          ),
        ),
        SliverToBoxAdapter(
          child: InsetSection(
            dividerIndent: 54,
            footer: 'A text counts as sent once you come back from Messages. Didn’t send one? Tap Resend.',
            children: [
              for (final p in _run.people)
                AppleRow(
                  leading: Icon(
                    p.sent ? CupertinoIcons.checkmark_circle_fill : CupertinoIcons.circle,
                    color: p.sent ? c.green : c.tertiaryLabel,
                    size: 26,
                  ),
                  title: p.name.isEmpty ? p.phone : p.name,
                  subtitle: p.phone,
                  accessory: RowAccessory.none,
                  trailing: CupertinoButton(
                    padding: EdgeInsets.zero,
                    minimumSize: const Size(44, 30),
                    onPressed: () {
                      if (p.sent) _run.retry(p);
                      _run.send(p);
                    },
                    child: Text(p.sent ? 'Resend' : 'Send', style: TextStyle(color: c.tint)),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  String _name(Invitee p) => p.firstName.isNotEmpty ? p.firstName : (p.name.isNotEmpty ? p.name : p.phone);
}
