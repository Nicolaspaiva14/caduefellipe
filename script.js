// script.js — Controle do splash e playlist de vídeos
(function () {
  'use strict';

  var video   = document.getElementById('bgVideo');
  var splash  = document.getElementById('splash');
  var btnEnter = document.getElementById('splashEnter');

  if (!video || !splash || !btnEnter) return;

  // Reforça atributos para iOS
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

  function dismissSplash() {
    // 1. Garante que o vídeo está tocando (gesto do usuário = iOS permite)
    playVideo();

    // 2. Anima saída do splash
    splash.classList.add('hidden');

    // 3. Remove do DOM após a transição para liberar memória
    splash.addEventListener('transitionend', function () {
      splash.remove();
    }, { once: true });
  }

  // Clique no botão ENTRAR
  btnEnter.addEventListener('click', dismissSplash);
  btnEnter.addEventListener('touchend', function (e) {
    e.preventDefault();
    dismissSplash();
  }, { passive: false });

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
