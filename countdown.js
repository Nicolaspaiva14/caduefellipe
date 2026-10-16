// countdown.js — próximo show e contagem regressiva na página inicial

(async function () {
  const SUPABASE_URL = 'https://irunkppevljtisgmkoez.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydW5rcHBldmxqdGlzZ21rb2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNTg1MTcsImV4cCI6MjA5MzczNDUxN30.kNvWjOe2jifWoGJw8FwRJumSapD9wI3Wt5ZflTTy49k';

  const wrapEl   = document.getElementById('next-show-wrap');
  const timerEl  = document.getElementById('countdown-timer');
  const detailEl = document.getElementById('next-show-detail');
  const labelEl  = document.getElementById('next-show-label');

  if (!wrapEl || !timerEl) return;

  let targetDate = null;
  let showInfo   = null;

  // 1. Tenta buscar do Supabase
  try {
    if (window.supabase) {
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      const hoje   = new Date().toISOString().split('T')[0];

      const { data, error } = await client
        .from('agenda')
        .select('data_show, horario, cidade, local')
        .gte('data_show', hoje)
        .order('data_show', { ascending: true })
        .order('horario',   { ascending: true })
        .limit(1)
        .single();

      if (!error && data) {
        const horaStr = data.horario ? data.horario.slice(0, 5) : '00:00';
        targetDate = new Date(`${data.data_show}T${horaStr}:00`);
        showInfo   = { data: data.data_show, cidade: data.cidade };
      }
    }
  } catch (e) {
    console.warn('Countdown: Supabase indisponivel, tentando agenda.json', e);
  }

  // 2. Fallback: agenda.json local
  if (!targetDate || isNaN(targetDate)) {
    try {
      const res   = await fetch('agenda.json');
      const lista = await res.json();
      const agora = new Date();

      const proximos = lista
        .map(ev => {
          const horaStr = ev.hora ? ev.hora.slice(0, 5) : '00:00';
          return { ...ev, dateObj: new Date(`${ev.data}T${horaStr}:00`) };
        })
        .filter(ev => ev.dateObj > agora)
        .sort((a, b) => a.dateObj - b.dateObj);

      if (proximos.length > 0) {
        targetDate = proximos[0].dateObj;
        showInfo   = { data: proximos[0].data, cidade: proximos[0].cidade };
      }
    } catch (e) {
      console.warn('Countdown: agenda.json tambem falhou', e);
    }
  }

  // 3. Nenhum show encontrado
  if (!targetDate || isNaN(targetDate)) {
    wrapEl.style.display = 'none';
    return;
  }

  // Exibe detalhe
  if (detailEl && showInfo) {
    const dataFormatada = new Date(showInfo.data + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
    detailEl.textContent = dataFormatada + '  \u00b7  ' + showInfo.cidade;
  }

  // 4. Timer
  function atualizar() {
    const diff = targetDate - Date.now();

    if (diff <= 0) {
      if (labelEl) labelEl.textContent = '🎤 Show acontecendo agora!';
      timerEl.textContent = '';
      if (detailEl) detailEl.textContent = '';
      clearInterval(intervalo);
      return;
    }

    const dias    = Math.floor(diff / 86400000);
    const horas   = Math.floor((diff % 86400000) / 3600000);
    const minutos = Math.floor((diff % 3600000)  / 60000);
    const segs    = Math.floor((diff % 60000)    / 1000);
    const pad     = n => String(n).padStart(2, '0');

    timerEl.textContent = dias > 0
      ? dias + 'd  ' + pad(horas) + 'h  ' + pad(minutos) + 'm  ' + pad(segs) + 's'
      : pad(horas) + 'h  ' + pad(minutos) + 'm  ' + pad(segs) + 's';
  }

  atualizar();
  const intervalo = setInterval(atualizar, 1000);
})();