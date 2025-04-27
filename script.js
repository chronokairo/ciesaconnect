// Aguarda o DOM carregar completamente
document.addEventListener('DOMContentLoaded', () => {

    // --- Funções Utilitárias ---
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    // --- Rolagem Suave para Âncoras Internas ---
    $$('nav a[href^="#"], nav a[href*="#"]').forEach(anchor => {
        // Verifica se o link aponta para a página atual antes de adicionar o listener
        if (anchor.pathname === window.location.pathname || anchor.pathname.endsWith('index.html') && window.location.pathname.endsWith('/')) {
             if (anchor.hash) { // Só adiciona listener se houver um hash (#)
                anchor.addEventListener('click', e => {
                    e.preventDefault();
                    const targetElement = $(anchor.hash); // Usa o hash diretamente como seletor
                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                });
            }
        }
    });

    // --- Botão "Voltar ao Topo" ---
    const backToTopButton = $('#back-to-top');
    if (backToTopButton) {
        const toggleBackToTop = () => {
            backToTopButton.style.display = window.scrollY > 300 ? 'block' : 'none';
        };
        window.addEventListener('scroll', toggleBackToTop);
        toggleBackToTop(); // Verifica o estado inicial ao carregar

        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Animação de Fade-in para Seções ---
    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 1s ease-in forwards'; // 'forwards' mantém o estado final
                observer.unobserve(entry.target); // Opcional: parar de observar após animar uma vez
            }
        });
    }, { threshold: 0.1 }); // Inicia a animação quando 10% da seção está visível

    $$('section').forEach(section => sectionObserver.observe(section));

    // --- Funcionalidades de Lista (Avisos/Eventos) ---
    const listContainer = $('.list-container'); // Container principal (avisos-container ou eventos-container)
    const buscaInput = $('#busca-input');
    const buscaBtn = $('#busca-btn');
    const filtroBtns = $$('.filtro-btn');
    const paginationContainer = $('.paginacao');

    if (listContainer && (buscaInput || filtroBtns.length > 0)) {
        const itemsPerPage = 5; // Quantidade de itens por página (ajuste conforme necessário)
        let currentPage = 1;
        let currentFilter = 'todos';
        let currentSearchTerm = '';

        const allItems = Array.from(listContainer.querySelectorAll('.list-item')); // Pega todos os itens uma vez

        const applyFiltersAndSearch = () => {
            let filteredItems = allItems;

            // Aplicar Filtro
            if (currentFilter !== 'todos') {
                filteredItems = filteredItems.filter(item => {
                    const tipo = item.getAttribute('data-tipo');
                    const categoria = item.getAttribute('data-categoria');
                    return tipo === currentFilter || categoria === currentFilter;
                });
            }

            // Aplicar Busca
            if (currentSearchTerm) {
                filteredItems = filteredItems.filter(item => {
                    const title = item.querySelector('.aviso-titulo, .evento-titulo')?.textContent.toLowerCase() || '';
                    const content = item.querySelector('.aviso-conteudo, .evento-descricao')?.textContent.toLowerCase() || '';
                    const local = item.querySelector('.evento-local')?.textContent.toLowerCase() || ''; // Específico para eventos
                    return title.includes(currentSearchTerm) || content.includes(currentSearchTerm) || (local && local.includes(currentSearchTerm));
                });
            }

            return filteredItems;
        };

        const displayPage = (itemsToShow) => {
            listContainer.innerHTML = ''; // Limpa a lista atual
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const pageItems = itemsToShow.slice(startIndex, endIndex);

            if (pageItems.length === 0 && itemsToShow.length > 0) {
                 // Se a página atual está vazia mas há itens filtrados, volte para a página 1
                 currentPage = 1;
                 displayPage(itemsToShow);
                 return;
            } else if (pageItems.length === 0) {
                listContainer.innerHTML = '<p>Nenhum item encontrado com os critérios selecionados.</p>';
            }

            pageItems.forEach(item => listContainer.appendChild(item));
            updatePagination(itemsToShow.length);
        };

        const updatePagination = (totalItems) => {
            if (!paginationContainer) return;
            paginationContainer.innerHTML = ''; // Limpa botões antigos
            const totalPages = Math.ceil(totalItems / itemsPerPage);

            if (totalPages <= 1) return; // Não mostra paginação se só tem 1 página

            // Botão Anterior
            const prevButton = document.createElement('button');
            prevButton.textContent = 'Anterior';
            prevButton.classList.add('btn-page');
            prevButton.dataset.page = 'prev';
            prevButton.disabled = currentPage === 1;
            prevButton.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    displayPage(applyFiltersAndSearch());
                }
            });
            paginationContainer.appendChild(prevButton);

            // Botões de Página (simplificado para mostrar algumas páginas)
            // Idealmente, implementar lógica para '...' se houver muitas páginas
            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement('button');
                pageButton.textContent = i;
                pageButton.classList.add('btn-page');
                if (i === currentPage) {
                    pageButton.classList.add('atual');
                }
                pageButton.dataset.page = i;
                pageButton.addEventListener('click', () => {
                    currentPage = i;
                    displayPage(applyFiltersAndSearch());
                });
                paginationContainer.appendChild(pageButton);
            }

            // Botão Próximo
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Próximo';
            nextButton.classList.add('btn-page');
            nextButton.dataset.page = 'next';
            nextButton.disabled = currentPage === totalPages;
            nextButton.addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    displayPage(applyFiltersAndSearch());
                }
            });
            paginationContainer.appendChild(nextButton);
        };

        // Event Listeners para Filtros
        filtroBtns.forEach(button => {
            button.addEventListener('click', () => {
                filtroBtns.forEach(btn => btn.classList.remove('ativo'));
                button.classList.add('ativo');
                currentFilter = button.getAttribute('data-filtro');
                currentPage = 1; // Resetar para a primeira página ao mudar filtro
                displayPage(applyFiltersAndSearch());
            });
        });

        // Event Listener para Busca
        if (buscaBtn && buscaInput) {
            const performSearch = () => {
                currentSearchTerm = buscaInput.value.toLowerCase();
                currentPage = 1; // Resetar para a primeira página ao buscar
                displayPage(applyFiltersAndSearch());
            };
            buscaBtn.addEventListener('click', performSearch);
            // Opcional: buscar ao pressionar Enter no input
            buscaInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }

        // Exibição inicial
        displayPage(applyFiltersAndSearch());
    }

    // --- Funcionalidade de Comentários (Front-end Simples) ---
    $$('.comentario-form').forEach(form => {
        const textarea = form.querySelector('textarea');
        const button = form.querySelector('.btn-comment');
        const commentList = form.closest('.comentarios').querySelector('.comment-list');
        const commentCountSpan = form.closest('.comentarios').querySelector('.comment-count');

        if (textarea && button && commentList && commentCountSpan) {
            button.addEventListener('click', () => {
                const commentText = textarea.value.trim();
                if (commentText) {
                    const newComment = document.createElement('div');
                    newComment.classList.add('comentario');
                    // Simula um novo comentário (sem nome de usuário real)
                    newComment.innerHTML = `<p><strong>Usuário:</strong> ${commentText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`; // Sanitiza HTML básico
                    commentList.appendChild(newComment);
                    textarea.value = ''; // Limpa o campo

                    // Atualiza a contagem
                    const currentCount = parseInt(commentCountSpan.textContent) || 0;
                    commentCountSpan.textContent = currentCount + 1;
                }
            });
        }
    });

    // --- REMOVIDO: Função loadPosts() --- 
    // A página de blog agora usa embeds do Instagram

}); // Fim do DOMContentLoaded

