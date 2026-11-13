import 'package:cupertino_ui/cupertino_ui.dart';
import 'package:flutter/services.dart';
import 'package:material_ui/material_ui.dart';

import '../ui/apple.dart';

import 'benefits/benefits_finder_screen.dart';
import 'home_screen.dart';
import 'more/contact_screen.dart';
import 'resources_screen.dart';
import 'tools/tools_screen.dart';

/// Bottom-navigation shell. Each tab keeps its own navigation stack.
class AppShell extends StatefulWidget {
  const AppShell({super.key});

  static void selectTab(BuildContext context, int index) =>
      context.findAncestorStateOfType<_AppShellState>()?._select(index);

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _index = 0;
  final _keys = List.generate(5, (_) => GlobalKey<NavigatorState>());
  final _built = <int>{0};

  void _select(int i) {
    if (i == _index) {
      _keys[i].currentState?.popUntil((r) => r.isFirst);
    }
    setState(() {
      _index = i;
      _built.add(i);
    });
  }

  Widget _root(int i) => switch (i) {
    0 => const HomeScreen(),
    1 => const BenefitsFinderScreen(),
    2 => const ResourcesScreen(),
    3 => const ToolsScreen(),
    _ => const ContactScreen(isTab: true),
  };

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop) return;
        final nav = _keys[_index].currentState;
        if (nav != null && nav.canPop()) {
          nav.pop();
        } else if (_index != 0) {
          _select(0);
        } else {
          await SystemNavigator.pop();
        }
      },
      child: Scaffold(
        backgroundColor: context.c.bg,
        body: IndexedStack(
          index: _index,
          children: [
            for (var i = 0; i < 5; i++)
              _built.contains(i)
                  ? HeroControllerScope(
                      controller: CupertinoApp.createCupertinoHeroController(),
                      child: Navigator(key: _keys[i], onGenerateRoute: (_) => appleRoute<void>(_root(i))),
                    )
                  : const SizedBox.shrink(),
          ],
        ),
        bottomNavigationBar: CupertinoTabBar(
          currentIndex: _index,
          onTap: (i) {
            HapticFeedback.selectionClick();
            _select(i);
          },
          height: 54,
          iconSize: 25,
          activeColor: context.c.tint,
          inactiveColor: const Color(0xFF8E8E93),
          backgroundColor: (context.c.dark ? const Color(0xFF161618) : const Color(0xFFF9F9F9)).withValues(alpha: 0.94),
          border: Border(top: BorderSide(color: context.c.separator, width: 0.5)),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(CupertinoIcons.house),
              activeIcon: Icon(CupertinoIcons.house_fill),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(CupertinoIcons.checkmark_shield),
              activeIcon: Icon(CupertinoIcons.checkmark_shield_fill),
              label: 'Benefits',
            ),
            BottomNavigationBarItem(
              icon: Icon(CupertinoIcons.square_grid_2x2),
              activeIcon: Icon(CupertinoIcons.square_grid_2x2_fill),
              label: 'Resources',
            ),
            BottomNavigationBarItem(
              icon: Icon(CupertinoIcons.wrench),
              activeIcon: Icon(CupertinoIcons.wrench_fill),
              label: 'Tools',
            ),
            BottomNavigationBarItem(
              icon: Icon(CupertinoIcons.chat_bubble_2),
              activeIcon: Icon(CupertinoIcons.chat_bubble_2_fill),
              label: 'Contact',
            ),
          ],
        ),
      ),
    );
  }
}
