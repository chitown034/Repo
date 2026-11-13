import 'package:flutter/services.dart';
import 'package:material_ui/material_ui.dart';

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
        body: IndexedStack(
          index: _index,
          children: [
            for (var i = 0; i < 5; i++)
              _built.contains(i)
                  ? Navigator(
                      key: _keys[i],
                      onGenerateRoute: (_) => MaterialPageRoute(builder: (_) => _root(i)),
                    )
                  : const SizedBox.shrink(),
          ],
        ),
        bottomNavigationBar: NavigationBar(
          selectedIndex: _index,
          onDestinationSelected: _select,
          destinations: const [
            NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
            NavigationDestination(
              icon: Icon(Icons.manage_search_outlined),
              selectedIcon: Icon(Icons.manage_search),
              label: 'Benefits',
            ),
            NavigationDestination(
              icon: Icon(Icons.grid_view_outlined),
              selectedIcon: Icon(Icons.grid_view_rounded),
              label: 'Resources',
            ),
            NavigationDestination(
              icon: Icon(Icons.calculate_outlined),
              selectedIcon: Icon(Icons.calculate),
              label: 'Tools',
            ),
            NavigationDestination(icon: Icon(Icons.forum_outlined), selectedIcon: Icon(Icons.forum), label: 'Contact'),
          ],
        ),
      ),
    );
  }
}
