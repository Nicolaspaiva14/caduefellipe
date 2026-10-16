// script.js — playlist e alternância suave de vídeos da página inicial
document.addEventListener('DOMContentLoaded', () => {
  const player = document.getElementById('bgVideo');
  if (!player) return;

  const playlist = ['videos/video1.mp4', 'videos/video2.mp4'];
  let idx = 0;

  // Garante que o WebKit / iOS trate como vídeo mudo em linha
  player.muted = true;
  player.defaultMuted = true;
  player.playsInline = true;

  // Quando começar a tocar pela primeira vez, remove loop para permitir transição entre os vídeos
  player.addEventListener('playing', () => {
    player.removeAttribute('loop');
  }, { once: true });

  function loadAndPlay(i) {
    try {
      player.muted = true;
      player.defaultMuted = true;
      player.src = playlist[i];
      player.load();
      const p = player.play();
      if (p && p.catch) p.catch(() => {});
    } catch (err) {
      console.warn('Erro ao alternar vídeo:', err);
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
      player.muted = true;
      const p = player.play();
      if (p && p.catch) p.catch(() => {});
    }
  });
});
