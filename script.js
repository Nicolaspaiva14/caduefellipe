// script.js — video playlist para a index
document.addEventListener('DOMContentLoaded', () => {
  const player = document.getElementById('bgVideo');
  if (!player) return;

  const playlist = ['videos/video1.mp4', 'videos/video2.mp4'];
  let idx = 0;

  function preload(src) {
    const v = document.createElement('video');
    v.src = src;
    v.preload = 'auto';
  }

  async function loadAndPlay(i) {
    try {
      player.pause();
      player.src = playlist[i];
      player.muted = true;
      player.playsInline = true;
      player.load();

      await new Promise(resolve => {
        let done = false;
        const onMeta = () => { if (!done) { done = true; player.removeEventListener('loadedmetadata', onMeta); resolve(); } };
        player.addEventListener('loadedmetadata', onMeta);
        setTimeout(() => { if (!done) { done = true; resolve(); } }, 1500);
      });

      await player.play();
    } catch (err) {
      console.warn('Autoplay bloqueado ou erro:', err);
    }
  }

  player.addEventListener('ended', () => {
    idx = (idx + 1) % playlist.length;
    preload(playlist[(idx + 1) % playlist.length]);
    setTimeout(() => loadAndPlay(idx), 100);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { try { player.pause(); } catch(e) {} }
    else { if (player.paused) loadAndPlay(idx); }
  });

  preload(playlist[1]);
  loadAndPlay(0);
});
