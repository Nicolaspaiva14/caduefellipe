const supabaseUrl = 'https://irunkppevljtisgmkoez.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydW5rcHBldmxqdGlzZ21rb2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNTg1MTcsImV4cCI6MjA5MzczNDUxN30.kNvWjOe2jifWoGJw8FwRJumSapD9wI3Wt5ZflTTy49k';

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// Todos os eventos carregados ficam aqui para filtrar sem nova requisição
let todosOsShows = [];

function renderizarShows(lista) {
  const listEl  = document.getElementById('agenda-list');
  const emptyEl = document.getElementById('agenda-empty');

  listEl.innerHTML = '';

  if (!lista || lista.length === 0) {
    emptyEl.classList.remove('hidden');
    listEl.classList.add('hidden');
    return;
  }

  emptyEl.classList.add('hidden');

  lista.forEach((ev, i) => {
    // Parsing seguro da data para evitar deslocamento de fuso horário
    const partes = String(ev.data_show).trim().split('-');
    const ano = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const diaNum = parseInt(partes[2], 10);
    const dataObj = new Date(ano, mes, diaNum);

    const dia = dataObj.toLocaleDateString('pt-BR', { day: '2-digit' });
    const resto = dataObj.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

    const localLimpo = (ev.local || '').trim();
    const cidadeLimpa = (ev.cidade || '').trim();
    const termoBusca = [localLimpo, cidadeLimpa].filter(Boolean).join(', ');
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(termoBusca)}`;

    const li = document.createElement('li');
    li.className = 'agenda-item';
    li.style.animationDelay = `${i * 0.08}s`;

    li.innerHTML = `
      <div class="agenda-date">
        <span class="agenda-day">${dia}</span>
        <span class="agenda-month">${resto}</span>
      </div>
      <div class="agenda-divider"></div>
      <div class="agenda-info">
        <p class="agenda-cidade">${cidadeLimpa}</p>
        <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="agenda-local-link" title="Ver ${localLimpo} no Google Maps">
          <svg class="agenda-pin-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5-2.5 2.5 2.5 2.5 2.5z"/>
          </svg>
          <span class="agenda-local-nome">${localLimpo}</span>
        </a>
        <p class="agenda-hora">
          <svg class="agenda-clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>${ev.horario || ''}</span>
        </p>
      </div>
      <div class="agenda-action">
        <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="btn-maps" title="Abrir localização de ${localLimpo} no Google Maps" aria-label="Ver localização no Google Maps">
          <svg class="btn-maps-pin" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5-2.5 2.5 2.5 2.5 2.5z"/>
          </svg>
          <span>Ver no Maps</span>
        </a>
      </div>
    `;

    listEl.appendChild(li);
  });

  listEl.classList.remove('hidden');
}

function aplicarFiltro(filtro) {
  const agora   = new Date();
  const hoje    = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const fimSem  = new Date(hoje); fimSem.setDate(hoje.getDate() + (7 - hoje.getDay()));
  const fimMes  = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);

  let lista = todosOsShows;

  if (filtro === 'semana') {
    lista = todosOsShows.filter(ev => {
      const d = new Date(ev.data_show + 'T00:00:00');
      return d >= hoje && d <= fimSem;
    });
  } else if (filtro === 'mes') {
    lista = todosOsShows.filter(ev => {
      const d = new Date(ev.data_show + 'T00:00:00');
      return d >= hoje && d <= fimMes;
    });
  }

  renderizarShows(lista);
}

async function carregarAgenda() {
  const loadingEl = document.getElementById('agenda-loading');
  const listEl    = document.getElementById('agenda-list');
  const emptyEl   = document.getElementById('agenda-empty');

  try {
    const { data, error } = await supabaseClient
      .from('agenda')
      .select('*')
      .order('data_show', { ascending: true })
      .order('horario',   { ascending: true });

    if (error) throw error;

    loadingEl.classList.add('hidden');

    if (!data || data.length === 0) {
      emptyEl.classList.remove('hidden');
      return;
    }

    todosOsShows = data;
    renderizarShows(todosOsShows);

  } catch (err) {
    console.error(err);
    loadingEl.classList.add('hidden');
    emptyEl.textContent = 'Erro ao carregar agenda.';
    emptyEl.classList.remove('hidden');
  }
}

// Filtros
document.querySelectorAll('.filtro-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    aplicarFiltro(btn.dataset.filtro);
  });
});

carregarAgenda();