import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:material_ui/material_ui.dart' show ThemeMode;
import 'package:shared_preferences/shared_preferences.dart';

class SavedResource {
  const SavedResource({required this.title, required this.url, this.subtitle = ''});
  final String title;
  final String url;
  final String subtitle;

  Map<String, String> toJson() => {'title': title, 'url': url, 'subtitle': subtitle};
  factory SavedResource.fromJson(Map<String, dynamic> j) =>
      SavedResource(title: j['title'] as String, url: j['url'] as String, subtitle: (j['subtitle'] as String?) ?? '');
}

/// On-device preferences: saved benefits/resources, home state, theme.
/// Nothing leaves the phone.
class Prefs extends ChangeNotifier {
  Prefs._();
  static final Prefs instance = Prefs._();

  SharedPreferences? _sp;
  final Set<String> savedBenefitIds = {};
  final List<SavedResource> savedResources = [];
  String? homeState;
  ThemeMode themeMode = ThemeMode.system;

  Future<void> load() async {
    try {
      _sp = await SharedPreferences.getInstance();
    } catch (_) {
      return; // Storage unavailable: run with defaults.
    }
    final sp = _sp!;
    savedBenefitIds.addAll(sp.getStringList('savedBenefits') ?? const []);
    for (final s in sp.getStringList('savedResources') ?? const <String>[]) {
      try {
        savedResources.add(SavedResource.fromJson(jsonDecode(s) as Map<String, dynamic>));
      } catch (_) {}
    }
    homeState = sp.getString('homeState');
    themeMode = ThemeMode.values.asNameMap()[sp.getString('themeMode')] ?? ThemeMode.system;
    notifyListeners();
  }

  bool isBenefitSaved(String id) => savedBenefitIds.contains(id);

  void toggleBenefit(String id) {
    savedBenefitIds.contains(id) ? savedBenefitIds.remove(id) : savedBenefitIds.add(id);
    _sp?.setStringList('savedBenefits', savedBenefitIds.toList());
    notifyListeners();
  }

  bool isResourceSaved(String url) => savedResources.any((r) => r.url == url);

  void toggleResource(SavedResource r) {
    final i = savedResources.indexWhere((x) => x.url == r.url);
    i >= 0 ? savedResources.removeAt(i) : savedResources.insert(0, r);
    _sp?.setStringList('savedResources', [for (final x in savedResources) jsonEncode(x.toJson())]);
    notifyListeners();
  }

  void setHomeState(String? code) {
    homeState = code;
    code == null ? _sp?.remove('homeState') : _sp?.setString('homeState', code);
    notifyListeners();
  }

  void setThemeMode(ThemeMode m) {
    themeMode = m;
    _sp?.setString('themeMode', m.name);
    notifyListeners();
  }
}
