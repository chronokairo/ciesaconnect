import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:html/parser.dart' as parser;

class DetalheNoticiaScreen extends StatefulWidget {
  final String title;
  final String imageUrl;
  final String link;

  const DetalheNoticiaScreen({
    super.key,
    required this.title,
    required this.imageUrl,
    required this.link,
  });

  @override
  State<DetalheNoticiaScreen> createState() => _DetalheNoticiaScreenState();
}

class _DetalheNoticiaScreenState extends State<DetalheNoticiaScreen> {
  String? _conteudoNoticia;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchNoticiaCompleta();
  }

  Future<void> _fetchNoticiaCompleta() async {
    try {
      final response = await http.get(Uri.parse(widget.link));
      if (response.statusCode == 200) {
        final document = parser.parse(response.body);

        // Extraia o corpo da notícia
        final contentElement = document.querySelector('div.article-body');
        final content =
            contentElement?.text.trim() ?? 'Conteúdo não disponível.';

        setState(() {
          _conteudoNoticia = content;
          _isLoading = false;
        });
      } else {
        setState(() {
          _conteudoNoticia = 'Erro ao carregar a notícia.';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _conteudoNoticia = 'Erro ao carregar a notícia.';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Detalhes da Notícia')),
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : SingleChildScrollView(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Imagem da notícia
                    widget.imageUrl.isNotEmpty
                        ? ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.network(
                            widget.imageUrl,
                            width: double.infinity,
                            height: 200,
                            fit: BoxFit.cover,
                            errorBuilder:
                                (context, error, stackTrace) =>
                                    Container(color: Colors.grey),
                          ),
                        )
                        : Container(
                          width: double.infinity,
                          height: 200,
                          child: const Icon(
                            Icons.image_not_supported,
                            size: 50,
                          ),
                        ),
                    const SizedBox(height: 16),
                    // Título
                    Text(
                      widget.title,
                      style: const TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.bold,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Conteúdo da notícia
                    Text(
                      _conteudoNoticia ?? 'Conteúdo não disponível.',
                      style: const TextStyle(fontSize: 18, height: 1.6),
                      textAlign: TextAlign.justify,
                    ),
                  ],
                ),
              ),
    );
  }
}
