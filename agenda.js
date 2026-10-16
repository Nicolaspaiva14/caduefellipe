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
    const dataObj = new Date(ev.data_show + 'T00:00:00');

    const dia = dataObj.toLocaleDateString('pt-BR', { day: '2-digit' });
    const resto = dataObj.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

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
        <p class="agenda-cidade">${ev.cidade}</p>
        <p class="agenda-local">${ev.local}</p>
        <p class="agenda-hora">${ev.horario || ''}</p>
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