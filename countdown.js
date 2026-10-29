// countdown.js — próximo show e contagem regressiva na página inicial

(async function () {
  const SUPABASE_URL = 'https://irunkppevljtisgmkoez.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydW5rcHBldmxqdGlzZ21rb2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNTg1MTcsImV4cCI6MjA5MzczNDUxN30.kNvWjOe2jifWoGJw8FwRJumSapD9wI3Wt5ZflTTy49k';

  const wrapEl   = document.getElementById('next-show-wrap');
  const timerEl  = document.getElementById('countdown-timer');
  const detailEl = document.getElementById('next-show-detail');
  const labelEl  = document.getElementById('next-show-label');

  if (!wrapEl || !timerEl) return;

  // Extrai hora e minuto de qualquer string (ex: " 20:00 às 23:00", "22:00", etc.)
  function extrairHorario(str) {
    if (!str) return { hora: 20, minuto: 0 };
    const match = String(str).match(/(\d{1,2}):(\d{2})/);
    if (match) {
      const h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      if (!isNaN(h) && !isNaN(m) && h >= 0 && h < 24 && m >= 0 && m < 60) {
        return { hora: h, minuto: m };
      }
    }
    return { hora: 20, minuto: 0 };
  }

  // Cria objeto Date a partir de data_show (YYYY-MM-DD) e horário
  function parseDataShow(dataShowStr, horarioStr) {
    if (!dataShowStr) return null;
    const partes = String(dataShowStr).trim().split('-');
    if (partes.length < 3) return null;
    const ano = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const dia = parseInt(partes[2], 10);
    if (isNaN(ano) || isNaN(mes) || isNaN(dia)) return null;

    const { hora, minuto } = extrairHorario(horarioStr);
    const data = new Date(ano, mes, dia, hora, minuto, 0);
    return isNaN(data.getTime()) ? null : data;
  }

  let targetDate = null;
  let showInfo   = null;
  const agora    = new Date();

  // Data de hoje no fuso local (YYYY-MM-DD)
  const anoHoje = agora.getFullYear();
  const mesHoje = String(agora.getMonth() + 1).padStart(2, '0');
  const diaHoje = String(agora.getDate()).padStart(2, '0');
  const hojeStr = `${anoHoje}-${mesHoje}-${diaHoje}`;

  // 1. Tenta buscar da tabela 'agenda' no Supabase
  try {
    if (window.supabase) {
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

      const { data, error } = await client
        .from('agenda')
        .select('data_show, horario, cidade, local')
        .gte('data_show', hojeStr)
        .order('data_show', { ascending: true })
        .limit(20);

      if (!error && Array.isArray(data) && data.length > 0) {
        for (const ev of data) {
          const d = parseDataShow(ev.data_show, ev.horario);
          if (!d) continue;

          // Duração estimada do show: 4 horas
          const fimEstimado = new Date(d.getTime() + 4 * 60 * 60 * 1000);
          if (fimEstimado.getTime() > agora.getTime()) {
            targetDate = d;
            showInfo   = {
              data: ev.data_show,
              cidade: (ev.cidade || '').trim(),
              local: (ev.local || '').trim(),
              horario: ev.horario
            };
            break;
          }
        }
      }
    }
  } catch (e) {
    console.warn('Countdown: Supabase indisponível, tentando fallback', e);
  }

  // 2. Fallback: agenda.json local
  if (!targetDate) {
    try {
      const res   = await fetch('agenda.json');
      const lista = await res.json();

      const proximos = lista
        .map(ev => {
          const d = parseDataShow(ev.data, ev.hora);
          return { ...ev, dateObj: d };
        })
        .filter(ev => ev.dateObj && (ev.dateObj.getTime() + 4 * 3600000) > agora.getTime())
        .sort((a, b) => a.dateObj - b.dateObj);

      if (proximos.length > 0) {
        targetDate = proximos[0].dateObj;
        showInfo   = {
          data: proximos[0].data,
          cidade: proximos[0].cidade,
          local: proximos[0].local || ''
        };
      }
    } catch (e) {
      console.warn('Countdown: agenda.json também falhou', e);
    }
  }

  // 3. Nenhum show futuro cadastrado
  if (!targetDate || isNaN(targetDate.getTime())) {
    if (labelEl) labelEl.textContent = 'Agenda Cadu & Fellipe';
    timerEl.textContent = 'Em breve';
    if (detailEl) detailEl.textContent = 'Novas datas serão divulgadas';
    wrapEl.style.display = 'flex';
    return;
  }

  // Garante que o container esteja visível
  wrapEl.style.display = 'flex';

  // Exibe detalhe do show com link interativo se aplicável
  if (detailEl && showInfo) {
    const partes = String(showInfo.data).split('-');
    const ano = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const dia = parseInt(partes[2], 10);
    const dataObj = new Date(ano, mes, dia);

    const dataFormatada = dataObj.toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });

    const localTexto = showInfo.local ? ` \u00b7 ${showInfo.local}` : '';
    detailEl.textContent = `${dataFormatada} \u00b7 ${showInfo.cidade}${localTexto}`;
  }

  // 4. Timer com contagem regressiva
  function atualizar() {
    const diff = targetDate.getTime() - Date.now();

    // Show acontecendo agora (iniciou há menos de 4h)
    if (diff <= 0) {
      const jaPassouMs = Math.abs(diff);
      const quatroHorasMs = 4 * 60 * 60 * 1000;

      if (jaPassouMs < quatroHorasMs) {
        if (labelEl) labelEl.textContent = '🎤 Show acontecendo hoje!';
        timerEl.textContent = 'AO VIVO';
      } else {
        if (labelEl) labelEl.textContent = 'Obrigado pelo carinho!';
        timerEl.textContent = 'Show finalizado';
        clearInterval(intervalo);
      }
      return;
    }

    if (labelEl) labelEl.textContent = 'O próximo show é em';

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