// Rolagem suave ao clicar nos links do menu
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
        e.preventDefault();
        document.querySelector(anchor.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Botão "Voltar ao Topo"
const backToTop = document.getElementById('back-to-top');

const toggleBackToTop = () => {
    backToTop.style.display = window.scrollY > 200 ? 'block' : 'none';
};

window.addEventListener('scroll', toggleBackToTop);

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Animação de fade-in ao aparecer seção na tela
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeIn 1s ease-in';
        }
    });
});

document.querySelectorAll('section').forEach(section => observer.observe(section));

// Funcionalidade dos filtros
document.querySelectorAll('.filtro-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('ativo'));
        button.classList.add('ativo');

        const filtro = button.getAttribute('data-filtro');
        document.querySelectorAll('.aviso').forEach(aviso => {
            aviso.style.display = (filtro === 'todos' || aviso.getAttribute('data-tipo') === filtro) ? 'block' : 'none';
        });
    });
});

// Funcionalidade de busca
const buscaBtn = document.getElementById('busca-btn');
const buscaInput = document.getElementById('busca-input');

if (buscaBtn && buscaInput) {
    buscaBtn.addEventListener('click', () => {
        const termoBusca = buscaInput.value.toLowerCase();

        document.querySelectorAll('.aviso').forEach(aviso => {
            const titulo = aviso.querySelector('.aviso-titulo')?.textContent.toLowerCase() || '';
            const conteudo = aviso.querySelector('.aviso-conteudo')?.textContent.toLowerCase() || '';

            aviso.style.display = (titulo.includes(termoBusca) || conteudo.includes(termoBusca)) ? 'block' : 'none';
        });
    });
}
