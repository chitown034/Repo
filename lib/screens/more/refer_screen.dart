import 'package:cupertino_ui/cupertino_ui.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_contacts/flutter_contacts.dart';
import 'package:material_ui/material_ui.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../app/org.dart';
import '../../ui/apple.dart';

/// The seminar invite text from the original app, personalized per friend.
String referralMessage(String name) =>
    'Hi ${name.trim().isEmpty ? 'there' : name.trim()}, I just attended this awesome VA Home Buying Seminar '
    'hosted by Active Duty Veteran and Hometown Hero Homeowners Club, and I was amazed by all the information '
    'shared at this event. Many MYTHS of credit score requirements were dispelled, NO private mortgage '
    'insurance, ZERO down payment, LOW interest rates were all explained in detail and much MORE. I thought '
    'you would appreciate learning about the VA Home Buying seminar for FREE. Just take an hour out of your '
    'day to learn about this great benefit!';

/// Builds the SMS composer link. Like the original app, each invite is a
/// group text to the friend and the club's President so he can follow up.
Uri referralSmsUri(List<String> recipients, String body, {TargetPlatform? platform}) {
  final p = platform ?? defaultTargetPlatform;
  final clean = [for (final r in recipients) r.replaceAll(RegExp(r'[^0-9+]'), '')];
  final encoded = Uri.encodeComponent(body);
  if (p == TargetPlatform.iOS) {
    return Uri.parse('sms:/open?addresses=${clean.join(',')}&body=$encoded');
  }
  return Uri.parse('smsto:${clean.join(';')}?body=$encoded');
}

class Invitee {
  Invitee(this.name, this.phone);
  final String name;
  final String phone;
  bool selected = false;
  bool sent = false;
}

/// "Invite friends to the VA seminar" referral feature.
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
      final list = await FlutterContacts.getAll(properties: {ContactProperty.phone});
      final out = <Invitee>[
        for (final c in list)
          if (c.phones.isNotEmpty) Invitee(c.displayName ?? 'No Name', c.phones.first.number),
      ]..sort((a, b) => a.name.toLowerCase().compareTo(b.name.toLowerCase()));
      setState(() {
        _contacts = out;
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
    if (ok == true && phone.text.replaceAll(RegExp(r'\D'), '').length >= 10) {
      setState(() => _manual.insert(0, Invitee(name.text, phone.text)..selected = true));
    }
  }

  Future<void> _send(Invitee i) async {
    final uri = referralSmsUri([i.phone, Org.referralCcNumber], referralMessage(i.name));
    final ok = await launchUrl(uri).catchError((_) => false);
    if (!mounted) return;
    if (ok) {
      setState(() => i.sent = true);
    } else {
      showToast(context, 'No messaging app available');
    }
  }

  void _openQueue() {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheet) {
          final sel = _selected;
          final next = sel.where((i) => !i.sent).firstOrNull;
          return DraggableScrollableSheet(
            expand: false,
            initialChildSize: 0.6,
            builder: (ctx, controller) => ListView(
              controller: controller,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(kGutter + 4, 0, kGutter + 4, 6),
                  child: Text('Send ${sel.length} Invite${sel.length == 1 ? '' : 's'}', style: ctx.t.headlineSmall),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(kGutter + 4, 0, kGutter + 4, 16),
                  child: Text(
                    'Each invite opens Messages with a personal note. ${Org.referralCcNumber} (our President, '
                    'Steven) is included so he can answer questions.',
                    style: ctx.t.bodyMedium?.copyWith(color: ctx.c.secondaryLabel),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(kGutter, 0, kGutter, 22),
                  child: next != null
                      ? AppleButton(
                          icon: CupertinoIcons.paperplane_fill,
                          label: 'Text ${next.name}',
                          onPressed: () async {
                            await _send(next);
                            setSheet(() {});
                          },
                        )
                      : AppleCard(
                          child: Row(
                            children: [
                              Icon(CupertinoIcons.checkmark_seal_fill, color: ctx.c.green),
                              const SizedBox(width: 10),
                              Text('All invites opened. Thank you!', style: ctx.t.titleSmall),
                            ],
                          ),
                        ),
                ),
                InsetSection(
                  dividerIndent: 54,
                  children: [
                    for (final i in sel)
                      AppleRow(
                        leading: Icon(
                          i.sent ? CupertinoIcons.checkmark_circle_fill : CupertinoIcons.circle,
                          color: i.sent ? ctx.c.green : ctx.c.tertiaryLabel,
                          size: 26,
                        ),
                        title: i.name,
                        subtitle: i.phone,
                        accessory: RowAccessory.none,
                        trailing: CupertinoButton(
                          padding: EdgeInsets.zero,
                          minimumSize: const Size(44, 30),
                          onPressed: () async {
                            await _send(i);
                            setSheet(() {});
                          },
                          child: Text(i.sent ? 'Resend' : 'Send', style: TextStyle(color: ctx.c.tint)),
                        ),
                      ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    ).then((_) => setState(() {}));
  }

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final q = _search.toLowerCase();
    final visible = [
      for (final i in _all)
        if (q.isEmpty || i.name.toLowerCase().contains(q) || i.phone.contains(q)) i,
    ];
    final count = _selected.length;
    return LargeTitleScaffold(
      title: 'Invite Friends',
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
                    label: 'Invite $count Friend${count == 1 ? '' : 's'}',
                    onPressed: _openQueue,
                  ),
                ),
              ),
            ),
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(kGutter + 4, 0, kGutter + 4, 16),
            child: Text(
              'Know someone who served, or will? Text them a personal invite to our free VA Home Buying Seminar.',
              style: context.t.bodyLarge?.copyWith(color: c.secondaryLabel),
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(kGutter, 0, kGutter, 22),
            child: AppleCard(
              padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Align(alignment: Alignment.centerLeft, child: Caption('Message Preview')),
                  const SizedBox(height: 10),
                  // iMessage-style bubble.
                  Container(
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
                    child: Text(
                      referralMessage('Alex'),
                      style: context.t.bodyMedium?.copyWith(color: Colors.white, height: 1.35),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text('Delivered', style: context.t.labelSmall?.copyWith(color: c.secondaryLabel, fontSize: 11)),
                ],
              ),
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: InsetSection(
            footer: _denied ? 'Contacts access is off. Turn it on in Settings, or add numbers yourself.' : null,
            children: [
              if (_contacts == null)
                AppleRow(
                  icon: CupertinoIcons.person_crop_circle_fill,
                  iconColor: Hue.gray,
                  title: 'Choose from Contacts',
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
                iconColor: Hue.blue,
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
              child: AppleSearchField(placeholder: 'Search', onChanged: (v) => setState(() => _search = v.trim())),
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
