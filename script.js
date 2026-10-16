// script.js — alterna os videos da playlist ao terminar cada um
document.addEventListener('DOMContentLoaded', function() {
  var player = document.getElementById('bgVideo');
  if (!player) return;

  // Reforça propriedades para iOS/WebKit
  player.muted = true;
  player.defaultMuted = true;
  player.playsInline = true;

  var playlist = ['videos/video1.mp4', 'videos/video2.mp4'];
  var idx = 0;

  // Quando um vídeo termina, carrega o próximo manualmente
  player.addEventListener('ended', function() {
    idx = (idx + 1) % playlist.length;
    player.muted = true;
    player.src = playlist[idx];
    player.load();
    player.play().catch(function() {});
  });

  // Retoma se a aba voltar a ficar visível
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden && player.paused) {
      player.muted = true;
      player.play().catch(function() {});
    }
  });
});
