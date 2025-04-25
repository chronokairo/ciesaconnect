import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:html/parser.dart' as parser;
import 'package:url_launcher/url_launcher.dart';

import 'detail_screen.dart';

void main() {
  runApp(const CiesaNoticiasApp());
}

class CiesaNoticiasApp extends StatelessWidget {
  const CiesaNoticiasApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CIESA Notícias',
      theme: ThemeData(
        brightness: Brightness.dark,
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.indigo,
          brightness: Brightness.dark,
        ),
        scaffoldBackgroundColor: const Color(0xFF1C1C1E), // Cinza escuro
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF1C1C1E), // Mesma cor do fundo
          elevation: 0,
          titleTextStyle: TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        cardColor: const Color(0xFF2C2C2E), // Cor dos cards
        textTheme: const TextTheme(
          bodyMedium: TextStyle(color: Colors.white, fontSize: 16, height: 1.5),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: Color(0xFF1C1C1E),
          selectedItemColor: Colors.indigo,
          unselectedItemColor: Colors.grey,
        ),
        useMaterial3: true,
      ),
      home: const NoticiasScreen(),
    );
  }
}

class NoticiasScreen extends StatefulWidget {
  const NoticiasScreen({super.key});

  @override
  State<NoticiasScreen> createState() => _NoticiasScreenState();
}

class _NoticiasScreenState extends State<NoticiasScreen> {
  late Future<List<Map<String, String>>> noticiasFuture;
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    noticiasFuture = fetchNoticias();
  }

  Future<List<Map<String, String>>> fetchNoticias() async {
    final url = Uri.parse('https://ciesa.br/noticias/');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      final document = parser.parse(response.body);
      final articles = document.querySelectorAll('div.card.mb-3.text-start');

      return articles.map((article) {
        final title =
            article.querySelector('h5.card-title')?.text.trim() ?? 'Sem título';
        final link =
            article.querySelector('a.card-link')?.attributes['href'] ?? '';
        final image =
            article.querySelector('img.card-img-top')?.attributes['src'] ?? '';
        return {
          'title': title,
          'link': 'https://ciesa.br$link',
          'image': image,
        };
      }).toList();
    } else {
      throw Exception('Erro ao acessar o site');
    }
  }

  void _abrirLink(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Não foi possível abrir o link')),
      );
    }
  }

  // Navegação entre as telas do menu inferior
  Widget _getScreen(int index) {
    switch (index) {
      case 0:
        return _buildFeed(); // Tela de Feed
      case 1:
        return const Center(
          child: Text('Meus Favoritos'),
        ); // Placeholder para Favoritos
      case 2:
        return const Center(child: Text('Postar')); // Placeholder para Postar
      case 3:
        return const Center(child: Text('Perfil')); // Placeholder para Perfil
      default:
        return _buildFeed();
    }
  }

  // Tela de Feed (já existente)
  Widget _buildFeed() {
    return FutureBuilder<List<Map<String, String>>>(
      future: noticiasFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return const Center(child: Text('Erro ao carregar notícias.'));
        }

        final noticias = snapshot.data ?? [];
        if (noticias.isEmpty) {
          return const Center(child: Text('Nenhuma notícia disponível.'));
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: noticias.length,
          itemBuilder: (context, index) {
            final noticia = noticias[index];
            return Card(
              margin: const EdgeInsets.only(bottom: 16),
              clipBehavior: Clip.antiAlias,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Stack(
                children: [
                  // Background image
                  noticia['image'] != null && noticia['image']!.isNotEmpty
                      ? Image.network(
                        noticia['image']!,
                        width: double.infinity,
                        height: 200,
                        fit: BoxFit.cover,
                        errorBuilder:
                            (context, error, stackTrace) =>
                                Container(color: Colors.grey),
                      )
                      : Container(
                        width: double.infinity,
                        height: 200,
                        color: Colors.grey,
                        child: const Icon(Icons.image_not_supported, size: 50),
                      ),
                  // Gradient overlay
                  Container(
                    width: double.infinity,
                    height: 200,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          Colors.black.withOpacity(0.6),
                          Colors.transparent,
                        ],
                        begin: Alignment.bottomCenter,
                        end: Alignment.topCenter,
                      ),
                    ),
                  ),
                  // Text content
                  Positioned(
                    bottom: 16,
                    left: 16,
                    right: 16,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          noticia['title'] ?? 'Sem título',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 8),
                        GestureDetector(
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder:
                                    (context) => DetalheNoticiaScreen(
                                      title: noticia['title'] ?? 'Sem título',
                                      imageUrl: noticia['image'] ?? '',
                                      link: noticia['link'] ?? '',
                                    ),
                              ),
                            );
                          },
                          child: const Text(
                            'Leia mais',
                            style: TextStyle(
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('CIESA Connect')),
      body: _getScreen(_selectedIndex),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Feed'),
          BottomNavigationBarItem(
            icon: Icon(Icons.favorite),
            label: 'Favoritos',
          ),
          BottomNavigationBarItem(icon: Icon(Icons.add), label: 'Postar'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Perfil'),
        ],
      ),
    );
  }
}
