// Guarda os slides e os lugares onde o contador e a barra serão atualizados.
const slides = [...document.querySelectorAll('.slide')];
const counter = document.querySelector('.counter');
const fill = document.querySelector('.progress span');
let current = 0; // Número do slide que está aparecendo (começa em zero).

// Mostra um slide e atualiza o contador, a barra de progresso e o endereço.
function show(n) {
  // Não deixa ir antes da capa nem depois do último slide.
  current = Math.max(0, Math.min(slides.length - 1, n));
  slides.forEach((slide, index) => {
    const isCurrent = index === current;
    slide.classList.toggle('active', isCurrent);
    slide.setAttribute('aria-hidden', isCurrent ? 'false' : 'true');
  });
  counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  fill.style.width = `${100 * (current + 1) / slides.length}%`;
  history.replaceState(null, '', `#slide-${current + 1}`);
}

// Liga os botões de voltar e avançar à troca de slide.
document.querySelector('#prev').addEventListener('click', () => show(current - 1));
document.querySelector('#next').addEventListener('click', () => show(current + 1));

// Permite navegar pelo teclado e apertar P para imprimir.
document.addEventListener('keydown', event => {
  if (['ArrowRight', 'PageDown', ' '].includes(event.key)) {
    event.preventDefault();
    show(current + 1);
  } else if (['ArrowLeft', 'PageUp'].includes(event.key)) {
    event.preventDefault();
    show(current - 1);
  } else if (event.key === 'Home') {
    show(0);
  } else if (event.key === 'End') {
    show(slides.length - 1);
  } else if (event.key.toLowerCase() === 'p') {
    window.print();
  }
});

// Em celulares, um gesto de deslizar também troca o slide.
let touchX = null;
document.addEventListener('touchstart', event => {
  touchX = event.changedTouches[0].screenX;
}, { passive: true });
document.addEventListener('touchend', event => {
  if (touchX === null) return;
  const distance = event.changedTouches[0].screenX - touchX;
  if (Math.abs(distance) > 70) show(current + (distance < 0 ? 1 : -1));
  touchX = null;
}, { passive: true });

// Se o endereço termina com #slide-N, abre aquele slide; senão, começa na capa.
const hash = location.hash.match(/slide-(\d+)/);
show(hash ? Number(hash[1]) - 1 : 0);
