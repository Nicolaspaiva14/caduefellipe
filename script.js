// script.js — video playlist para a index (compatível com iOS Safari / Android)
document.addEventListener('DOMContentLoaded', () => {
  const player = document.getElementById('bgVideo');
  if (!player) return;

  const playlist = ['videos/video1.mp4', 'videos/video2.mp4'];
  let idx = 0;

  // Garante propriedades e atributos essenciais para o WebKit / iOS Safari
  player.muted = true;
  player.defaultMuted = true;
  player.playsInline = true;
  player.setAttribute('playsinline', '');
  player.setAttribute('webkit-playsinline', '');

  function attemptPlay() {
    player.muted = true;
    player.defaultMuted = true;
    const playPromise = player.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay bloqueado por políticas do sistema (ex: Modo Pouca Energia do iOS)
        // Ativa o vídeo no primeiro toque ou rolagem do usuário
        setupTouchFallback();
      });
    }
  }

  let touchFallbackActive = false;
  function setupTouchFallback() {
    if (touchFallbackActive) return;
    touchFallbackActive = true;

    const events = ['touchstart', 'touchend', 'click', 'scroll', 'pointerdown'];
    const handleFirstInteraction = () => {
      player.muted = true;
      player.defaultMuted = true;
      const promise = player.play();
      if (promise !== undefined) {
        promise.then(() => {
          removeListeners();
        }).catch(() => {});
      }
    };

    function removeListeners() {
      events.forEach(evt => window.removeEventListener(evt, handleFirstInteraction, { passive: true }));
      touchFallbackActive = false;
    }

    events.forEach(evt => {
      window.addEventListener(evt, handleFirstInteraction, { passive: true, once: false });
    });

    player.addEventListener('play', removeListeners, { once: true });
  }

  function loadAndPlay(i) {
    try {
      player.muted = true;
      player.defaultMuted = true;
      player.src = playlist[i];
      player.load();
      attemptPlay();
    } catch (err) {
      console.warn('Erro ao carregar video:', err);
    }
  }

  // Avança para o próximo vídeo quando terminar
  player.addEventListener('ended', () => {
    idx = (idx + 1) % playlist.length;
    loadAndPlay(idx);
  });

  // Retoma se a aba voltar a ficar visível
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      try { player.pause(); } catch(e) {}
    } else {
      if (player.paused) {
        attemptPlay();
      }
    }
  });

  // Tenta reproduzir imediatamente
  attemptPlay();
});
