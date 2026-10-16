/* ============================================================
   NAV.JS — hamburger menu + scroll-to-top (shared)
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- HAMBURGER ---------- */
  const btn = document.querySelector('.hamburger');
  const nav = document.querySelector('.main-nav');

  if (btn && nav) {
    const links = nav.querySelectorAll('a');

function resetLinks() {
  links.forEach(a => {
    a.style.animation = '';
    a.style.opacity = '';
    a.style.transform = '';
  });
}

function animateLinks() {
  links.forEach(a => {
    a.style.animation = '';
  });
}

    // Estado inicial: links ocultos
    const isMobile = () => window.innerWidth <= 900;
    if (isMobile()) resetLinks();

    window.addEventListener('resize', () => {
      if (!isMobile()) {
        // Desktop: remove os estilos inline para o CSS desktop assumir
        links.forEach(a => {
          a.style.animation = '';
          a.style.opacity   = '';
          a.style.transform = '';
        });
      } else if (!nav.classList.contains('open')) {
        resetLinks();
      }
    });

    btn.addEventListener('click', () => {
      const opening = !nav.classList.contains('open');
      btn.classList.toggle('open');
      nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', opening);
      document.body.style.overflow = opening ? 'hidden' : '';

      if (opening && isMobile()) {
        animateLinks();
      } else {
        resetLinks();
      }
    });

    // Fecha ao clicar em qualquer link
    links.forEach(a => {
      a.addEventListener('click', () => {
        btn.classList.remove('open');
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        if (isMobile()) resetLinks();
      });
    });
  }

  /* ---------- SCROLL TO TOP ---------- */
  const topBtn = document.querySelector('.scroll-to-top');
  if (topBtn) {
    window.addEventListener('scroll', () => {
      topBtn.classList.toggle('show', window.scrollY > 200);
    });

    topBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }



  /* ---------- ATALHO TECLADO (Ctrl + Shift + A ou Cmd + Shift + A) ---------- */
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      window.location.href = 'admin.html';
    }
  });

});
