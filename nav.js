/* ============================================================
   NAV.JS — Hamburger menu mobile nativo + Scroll-to-top (shared)
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- HAMBURGER MENU MOBILE ---------- */
  const btn = document.querySelector('.hamburger');
  const nav = document.querySelector('.main-nav');

  if (btn && nav) {
    const links = nav.querySelectorAll('a');

    function openMenu() {
      btn.classList.add('open');
      nav.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'Fechar menu');
      document.body.classList.add('nav-locked');
    }

    function closeMenu() {
      btn.classList.remove('open');
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Abrir menu');
      document.body.classList.remove('nav-locked');
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = nav.classList.contains('open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Fecha ao clicar em qualquer link de navegação
    links.forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    // Fecha ao clicar fora do menu (no backdrop)
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !btn.contains(e.target)) {
        closeMenu();
      }
    });

    // Fecha ao pressionar Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        closeMenu();
      }
    });

    // Fecha no resize para desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900 && nav.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  /* ---------- SCROLL TO TOP ---------- */
  const topBtn = document.querySelector('.scroll-to-top');
  if (topBtn) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          topBtn.classList.toggle('show', window.scrollY > 280);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    topBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- ATALHO TECLADO ADMIN (Ctrl + Shift + A) ---------- */
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      window.location.href = 'admin.html';
    }
  });

});
