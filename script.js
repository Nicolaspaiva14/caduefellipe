// script.js — Controle do splash e playlist de vídeos
(function () {
  'use strict';

  var video    = document.getElementById('bgVideo');
  var splash   = document.getElementById('splash');
  var btnEnter = document.getElementById('splashEnter');

  if (!video) return;

  // Reforça atributos para reprodução automática sem som (compatível com mobile/iOS)
  video.muted        = true;
  video.defaultMuted = true;
  video.playsInline  = true;

  var playlist = ['videos/video1.mp4', 'videos/video2.mp4'];
  var idx = 0;

  function playVideo() {
    video.muted = true;
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }

  function dismissSplash(imediato) {
    try {
      sessionStorage.setItem('splash_dismissed', '1');
    } catch (e) {}

    playVideo();

    if (!splash) return;

    if (imediato) {
      splash.remove();
      return;
    }

    splash.classList.add('hidden');
    splash.addEventListener('transitionend', function () {
      if (splash && splash.parentNode) {
        splash.remove();
      }
    }, { once: true });
  }

  // Se clicou na logo, veio de navegação com parâmetro ou já entrou antes: vai direto para os vídeos
  var params = new URLSearchParams(window.location.search);
  var pularSplash = params.has('direct') ||
                    params.has('skipSplash') ||
                    window.location.hash === '#inicio' ||
                    (function () {
                      try { return sessionStorage.getItem('splash_dismissed') === '1'; } catch (e) { return false; }
                    })() ||
                    (document.referrer && document.referrer.includes(window.location.host));

  if (pularSplash && splash) {
    dismissSplash(true);
  } else {
    playVideo();
  }

  // Clique no botão ENTRAR
  if (btnEnter) {
    btnEnter.addEventListener('click', function () {
      dismissSplash(false);
    });
    btnEnter.addEventListener('touchend', function (e) {
      e.preventDefault();
      dismissSplash(false);
    }, { passive: false });
  }

  // Clique na logo na própria página inicial remove imediatamente o splash se existir
  var linksInicio = document.querySelectorAll('.logo-link, a[href*="index.html"]');
  linksInicio.forEach(function (link) {
    link.addEventListener('click', function () {
      dismissSplash(true);
    });
  });

  // ── Playlist: alterna vídeo quando termina ──
  video.addEventListener('ended', function () {
    idx = (idx + 1) % playlist.length;
    video.muted = true;
    video.src   = playlist[idx];
    video.load();
    video.play().catch(function () {});
  });

  // Retoma se a aba voltar a ficar visível
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && video.paused) {
      video.muted = true;
      video.play().catch(function () {});
    }
  });
}());
