import 'package:flutter/foundation.dart';
import 'package:flutter_contacts/flutter_contacts.dart';
import 'package:material_ui/material_ui.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../app/org.dart';
import '../../app/theme.dart';

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
      final out = <Invitee>[];
      for (final c in list) {
        if (c.phones.isEmpty) continue;
        out.add(Invitee(c.displayName ?? 'No name', c.phones.first.number));
      }
      out.sort((a, b) => a.name.toLowerCase().compareTo(b.name.toLowerCase()));
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
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add a friend'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: name,
              decoration: const InputDecoration(labelText: 'Name'),
              textCapitalization: TextCapitalization.words,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: phone,
              decoration: const InputDecoration(labelText: 'Mobile number'),
              keyboardType: TextInputType.phone,
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Add')),
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
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('No messaging app available')));
    }
  }

  void _openQueue() {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheet) {
          final sel = _selected;
          final next = sel.where((i) => !i.sent).firstOrNull;
          return DraggableScrollableSheet(
            expand: false,
            initialChildSize: 0.6,
            builder: (ctx, controller) => ListView(
              controller: controller,
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
              children: [
                Text(
                  'Send ${sel.length} invite${sel.length == 1 ? '' : 's'}',
                  style: Theme.of(ctx).textTheme.titleLarge,
                ),
                const SizedBox(height: 6),
                Text(
                  'Each invite opens your messaging app with a personal note. '
                  '${Org.referralCcNumber} (our President, Steven) is included so he can answer questions.',
                  style: Theme.of(ctx).textTheme.bodySmall,
                ),
                const SizedBox(height: 12),
                if (next != null)
                  FilledButton.icon(
                    onPressed: () async {
                      await _send(next);
                      setSheet(() {});
                    },
                    icon: const Icon(Icons.send),
                    label: Text('Text ${next.name}'),
                  )
                else
                  const ListTile(
                    leading: Icon(Icons.check_circle, color: Colors.green),
                    title: Text('All invites opened. Thank you!'),
                  ),
                const SizedBox(height: 8),
                for (final i in sel)
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Icon(
                      i.sent ? Icons.check_circle : Icons.radio_button_unchecked,
                      color: i.sent ? Colors.green : null,
                    ),
                    title: Text(i.name),
                    subtitle: Text(i.phone),
                    trailing: TextButton(
                      onPressed: () async {
                        await _send(i);
                        setSheet(() {});
                      },
                      child: Text(i.sent ? 'Resend' : 'Send'),
                    ),
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
    final t = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    final q = _search.toLowerCase();
    final visible = [
      for (final i in _all)
        if (q.isEmpty || i.name.toLowerCase().contains(q) || i.phone.contains(q)) i,
    ];
    final count = _selected.length;
    return Scaffold(
      appBar: AppBar(title: const Text('Invite Friends')),
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Container(
              margin: const EdgeInsets.fromLTRB(20, 4, 20, 12),
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(gradient: Brand.heroGradient, borderRadius: BorderRadius.circular(20)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.group_add, color: Colors.white),
                  const SizedBox(height: 8),
                  Text(
                    'Invite friends to the free VA Home Buying Seminar',
                    style: t.titleLarge?.copyWith(color: Colors.white),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Pick people who served (or will). We’ll text each one a personal invite.',
                    style: t.bodyMedium?.copyWith(color: Colors.white70),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: ExpansionTile(
                tilePadding: EdgeInsets.zero,
                title: Text('Preview message', style: t.titleSmall),
                children: [
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: scheme.primary.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(referralMessage('Alex'), style: t.bodyMedium),
                  ),
                  const SizedBox(height: 12),
                ],
              ),
            ),
          ),
          if (_contacts == null)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    FilledButton.icon(
                      onPressed: _loading ? null : _loadContacts,
                      icon: _loading
                          ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                          : const Icon(Icons.contacts_outlined),
                      label: const Text('Choose from my contacts'),
                    ),
                    if (_denied) ...[
                      const SizedBox(height: 8),
                      Text(
                        'Contacts access is off. You can turn it on in Settings, or add numbers below.',
                        style: t.bodySmall,
                        textAlign: TextAlign.center,
                      ),
                      TextButton(
                        onPressed: () => FlutterContacts.permissions.openSettings(),
                        child: const Text('Open Settings'),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
              child: Row(
                children: [
                  OutlinedButton.icon(
                    onPressed: _addManual,
                    icon: const Icon(Icons.dialpad),
                    label: const Text('Add number'),
                  ),
                  const SizedBox(width: 8),
                  TextButton.icon(
                    onPressed: () => SharePlus.instance.share(ShareParams(text: referralMessage(''))),
                    icon: const Icon(Icons.ios_share),
                    label: const Text('Share another way'),
                  ),
                ],
              ),
            ),
          ),
          if (_all.isNotEmpty)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 4),
                child: TextField(
                  onChanged: (v) => setState(() => _search = v.trim()),
                  decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'Search contacts'),
                ),
              ),
            ),
          if (_contacts != null && _all.isEmpty)
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.all(32),
                child: Center(child: Text('No contacts with phone numbers found.')),
              ),
            ),
          SliverList.builder(
            itemCount: visible.length,
            itemBuilder: (context, idx) {
              final i = visible[idx];
              return CheckboxListTile(
                value: i.selected,
                onChanged: (v) => setState(() => i.selected = v ?? false),
                secondary: CircleAvatar(
                  backgroundColor: scheme.primary.withValues(alpha: 0.12),
                  child: Text(
                    i.name.isEmpty ? '#' : i.name.characters.first.toUpperCase(),
                    style: TextStyle(color: scheme.primary),
                  ),
                ),
                title: Text(i.name),
                subtitle: Text(i.phone),
              );
            },
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      floatingActionButton: count == 0
          ? null
          : FloatingActionButton.extended(
              backgroundColor: Brand.red,
              foregroundColor: Colors.white,
              onPressed: _openQueue,
              icon: const Icon(Icons.send),
              label: Text('Invite $count friend${count == 1 ? '' : 's'}'),
            ),
    );
  }
}
