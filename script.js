// script.js — Controle do splash e playlist de vídeos
(function () {
  'use strict';

  var video    = document.getElementById('bgVideo');
  var splash   = document.getElementById('splash');
  var btnEnter = document.getElementById('splashEnter');

  if (!video) return;

  // Limpa qualquer flag de splash salva em sessões anteriores
  try {
    sessionStorage.removeItem('splash_dismissed');
  } catch (e) {}

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

  // Tenta reprodução inicial em segundo plano
  playVideo();

  function dismissSplash() {
    // 1. Garante reprodução com o gesto do usuário (desbloqueia áudio/vídeo no mobile/iOS)
    playVideo();

    if (!splash) return;

    // 2. Anima saída do splash
    splash.classList.add('hidden');

    // 3. Remove do DOM após a transição
    splash.addEventListener('transitionend', function () {
      if (splash && splash.parentNode) {
        splash.remove();
      }
    }, { once: true });
  }

  // Clique no botão ENTRAR da tela de boas-vindas
  if (btnEnter) {
    btnEnter.addEventListener('click', dismissSplash);
    btnEnter.addEventListener('touchend', function (e) {
      e.preventDefault();
      dismissSplash();
    }, { passive: false });
  }

  // Ao clicar na logo ou em "Início", se o splash já tiver sido fechado,
  // recarrega a index.html para voltar à primeira tela ("Bem-vindo ao mundo de Cadu & Fellipe")
  var linksInicio = document.querySelectorAll('.logo-link, a[href="index.html"]');
  linksInicio.forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (!document.getElementById('splash')) {
        e.preventDefault();
        window.location.href = 'index.html';
        window.location.reload();
      }
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
