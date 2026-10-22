const supabaseUrl = 'https://irunkppevljtisgmkoez.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydW5rcHBldmxqdGlzZ21rb2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNTg1MTcsImV4cCI6MjA5MzczNDUxN30.kNvWjOe2jifWoGJw8FwRJumSapD9wI3Wt5ZflTTy49k';

const supabaseClient = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

const form = document.getElementById('showForm');
const lista = document.getElementById('lista');

// Verificar Autenticação
async function checkAuth() {
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  if (error || !session) {
    window.location.href = 'adimin/login.html';
  }
}
checkAuth();

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    window.location.href = 'adimin/login.html';
  });
}


async function carregarShows() {

  lista.innerHTML = '<p class="loading">Carregando shows...</p>';

  const { data, error } = await supabaseClient
    .from('agenda')
    .select('*')
    .order('data_show', { ascending: true });


  if(error) {
    console.error(error);

    lista.innerHTML = `
      <p class="loading">
        Erro ao carregar os shows.<br><br>
        Verifique se a tabela agenda existe no Supabase.
      </p>
    `;

    return;
  }

  lista.innerHTML = '';


  if(data.length === 0) {
    lista.innerHTML = '<p class="loading">Nenhum show cadastrado.</p>';
    return;
  }


  data.forEach(show => {

    const item = document.createElement('div');
    item.className = 'show';

    const dataFormatada = new Date(show.data_show)
      .toLocaleDateString('pt-BR');


    item.innerHTML = `

      <div class="info">
        <div class="cidade">${show.cidade}</div>

        <div class="local">${show.local}</div>

        <div class="data">
          ${dataFormatada}
          ${show.horario ? '• ' + show.horario : ''}
        </div>
      </div>

      <button class="delete">
        Excluir
      </button>

    `;


    item.querySelector('.delete')
      .addEventListener('click', async () => {

        const confirmar = confirm(
          'Deseja excluir este show?'
        );

        if(!confirmar) return;

        const { error: deleteError } = await supabaseClient
          .from('agenda')
          .delete()
          .eq('id', show.id);

        if (deleteError) {
          console.error(deleteError);
          alert('Erro ao excluir: ' + deleteError.message);
          return;
        }

        carregarShows();
    });


    lista.appendChild(item);
  });
}


form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const horarioInicio =
    document.getElementById('horario_inicio').value;

  const horarioFim =
    document.getElementById('horario_fim').value;

  const novoShow = {
    data_show: document.getElementById('data').value,
    cidade: document.getElementById('cidade').value,
    local: document.getElementById('local').value,

    horario: `${horarioInicio} às ${horarioFim}`
  };


  const { error } = await supabaseClient
    .from('agenda')
    .insert([novoShow]);


  if(error) {
    console.error(error);

    alert(
      'Erro ao cadastrar show. Veja o console.'
    );

    return;
  }


  alert('Show cadastrado com sucesso!');

  form.reset();

  carregarShows();
});


carregarShows();

const listaMensagens = document.getElementById('lista-mensagens');

async function carregarMensagens() {
  if (!listaMensagens) return;
  listaMensagens.innerHTML = '<p class="loading">Carregando mensagens...</p>';

  const { data, error } = await supabaseClient
    .from('mensagens_contato')
    .select('*')
    .order('criado_em', { ascending: false });

  if (error) {
    console.error(error);
    listaMensagens.innerHTML = `<p class="loading">Erro ao carregar mensagens. Você rodou o comando SQL?</p>`;
    return;
  }

  listaMensagens.innerHTML = '';

  if (data.length === 0) {
    listaMensagens.innerHTML = '<p class="loading">Nenhuma mensagem recebida ainda.</p>';
    return;
  }

  data.forEach(msg => {
    const item = document.createElement('div');
    item.className = 'show'; 
    item.style.flexDirection = 'column';
    item.style.alignItems = 'flex-start';

    const dataFormatada = new Date(msg.criado_em).toLocaleDateString('pt-BR') + ' às ' + new Date(msg.criado_em).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});

    const zapLink = msg.telefone ? `https://wa.me/55${msg.telefone.replace(/\D/g, '')}` : null;

    item.innerHTML = `
      <div class="info" style="width: 100%; margin-bottom: 10px;">
        <div class="cidade" style="font-size: 16px;">${msg.nome} <span style="font-size: 13px; color: var(--gold); opacity: 0.8; font-weight: normal; margin-left: 10px;">${msg.email}</span></div>
        <div class="local" style="font-size: 14px; margin-top: 5px; opacity: 0.9;">
          <strong>Assunto:</strong> ${msg.assunto || 'Não informado'}
          ${msg.telefone ? ` &bull; <strong style="color: var(--gold);">Tel / WhatsApp:</strong> <a href="${zapLink}" target="_blank" rel="noopener noreferrer" style="color: #4ade80; text-decoration: underline; font-weight: 600;">📱 ${msg.telefone} (Abrir conversa)</a>` : ''}
        </div>
        <div class="data" style="margin-top: 5px;">${dataFormatada}</div>
      </div>
      <div class="mensagem-texto" style="width: 100%; padding: 15px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.9);">
        ${msg.mensagem.replace(/\n/g, '<br>')}
      </div>
      <button class="delete" style="margin-top: 15px; align-self: flex-end;">Excluir Mensagem</button>
    `;

    item.querySelector('.delete').addEventListener('click', async () => {
      const confirmar = confirm('Deseja excluir permanentemente esta mensagem?');
      if (!confirmar) return;

      const { error: deleteError } = await supabaseClient
        .from('mensagens_contato')
        .delete()
        .eq('id', msg.id);

      if (deleteError) {
        alert('Erro ao excluir: ' + deleteError.message);
        return;
      }
      carregarMensagens();
    });

    listaMensagens.appendChild(item);
  });
}

carregarMensagens();

// ============================================================
// NOTIFICAÇÕES EM TEMPO REAL PARA NOVAS MENSAGENS NO ADMIN
// ============================================================
function tocarSomNotificacao() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // Tom agudo D5
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); // Tom A5

    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.55);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.55);
  } catch (e) {
    console.warn('Áudio de notificação não pôde ser reproduzido:', e);
  }
}

function exibirNotificacaoNavegador(msg) {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification('🎵 Nova Mensagem - Cadu & Fellipe', {
        body: `${msg.nome || 'Cliente'} enviou: "${msg.assunto || 'Contato do site'}"`,
        icon: 'img/logo preta.png'
      });
    } else if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
}

// Solicita permissão para notificações na área de trabalho quando o admin entra
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

// Escuta em tempo real do Supabase para mensagens
supabaseClient
  .channel('mensagens_em_tempo_real')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'mensagens_contato' },
    (payload) => {
      if (payload.eventType === 'INSERT') {
        tocarSomNotificacao();
        exibirNotificacaoNavegador(payload.new);
      }
      carregarMensagens();
    }
  )
  .subscribe();

/* ============================================================
   GERENCIAMENTO DE FOTOS DA GALERIA
   ============================================================ */
const fotoForm = document.getElementById('fotoForm');
const fotoArquivo = document.getElementById('fotoArquivo');
const fotoDropzone = document.getElementById('fotoDropzone');
const fotoPreviewContainer = document.getElementById('fotoPreviewContainer');
const fotoPreviewImg = document.getElementById('fotoPreviewImg');
const btnRemovePreview = document.getElementById('btnRemovePreview');
const fotoDescricao = document.getElementById('fotoDescricao');
const btnSubmitFoto = document.getElementById('btnSubmitFoto');
const listaFotos = document.getElementById('lista-fotos');

let fotoSelecionada = null;

// Clique no dropzone abre o seletor de arquivos
if (fotoDropzone && fotoArquivo) {
  fotoDropzone.addEventListener('click', () => fotoArquivo.click());

  // Arrastar e soltar (drag & drop)
  ['dragenter', 'dragover'].forEach(eventName => {
    fotoDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      fotoDropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    fotoDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      fotoDropzone.classList.remove('dragover');
    });
  });

  fotoDropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processarArquivoFoto(files[0]);
    }
  });

  fotoArquivo.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processarArquivoFoto(e.target.files[0]);
    }
  });
}

function processarArquivoFoto(file) {
  if (!file.type.startsWith('image/')) {
    alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).');
    return;
  }
  fotoSelecionada = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    fotoPreviewImg.src = e.target.result;
    fotoPreviewContainer.style.display = 'block';
    fotoDropzone.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

if (btnRemovePreview) {
  btnRemovePreview.addEventListener('click', (e) => {
    e.stopPropagation();
    limparSelecaoFoto();
  });
}

function limparSelecaoFoto() {
  fotoSelecionada = null;
  if (fotoArquivo) fotoArquivo.value = '';
  if (fotoPreviewImg) fotoPreviewImg.src = '';
  if (fotoPreviewContainer) fotoPreviewContainer.style.display = 'none';
  if (fotoDropzone) fotoDropzone.style.display = 'flex';
}

// Otimizar imagem usando Canvas para upload rápido e leve
function otimizarImagem(file, maxDimensao = 1600, qualidade = 0.85) {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimensao || height > maxDimensao) {
          if (width > height) {
            height = Math.round((height * maxDimensao) / width);
            width = maxDimensao;
          } else {
            width = Math.round((width * maxDimensao) / height);
            height = maxDimensao;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve({ blob, dataUrl: canvas.toDataURL('image/jpeg', qualidade) });
        }, 'image/jpeg', qualidade);
      };
    };

    reader.readAsDataURL(file);
  });
}

// Enviar Foto
if (fotoForm) {
  fotoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!fotoSelecionada) {
      alert('Por favor, selecione ou arraste uma foto antes de publicar.');
      return;
    }

    const descricao = fotoDescricao.value.trim();
    if (!descricao) {
      alert('Por favor, informe uma descrição ou legenda para a foto.');
      return;
    }

    const btnOriginalText = btnSubmitFoto.textContent;
    btnSubmitFoto.disabled = true;
    btnSubmitFoto.textContent = 'Processando e enviando foto...';

    try {
      // 1. Otimizar a imagem no navegador
      const { blob, dataUrl } = await otimizarImagem(fotoSelecionada);

      let finalUrl = null;
      const fileName = `foto_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;

      // 2. Tentar subir no Storage do Supabase (bucket 'fotos')
      try {
        const { error: storageError } = await supabaseClient
          .storage
          .from('fotos')
          .upload(fileName, blob, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: false
          });

        if (!storageError) {
          const { data: publicData } = supabaseClient
            .storage
            .from('fotos')
            .getPublicUrl(fileName);
          
          if (publicData && publicData.publicUrl) {
            finalUrl = publicData.publicUrl;
          }
        }
      } catch (errStorage) {
        console.warn('Storage indisponível ou bucket fotos não criado, usando fallback direto.', errStorage);
      }

      // Se não conseguiu pelo storage, usa o dataUrl otimizado
      if (!finalUrl) {
        finalUrl = dataUrl;
      }

      // 3. Salvar na tabela 'fotos' do Supabase
      const { error: insertError } = await supabaseClient
        .from('fotos')
        .insert([{
          url: finalUrl,
          descricao: descricao
        }]);

      if (insertError) {
        throw insertError;
      }

      alert('Foto publicada com sucesso na galeria do site!');
      fotoForm.reset();
      limparSelecaoFoto();
      carregarFotosAdmin();

    } catch (err) {
      console.error('Erro ao enviar foto:', err);
      alert('Erro ao publicar foto: ' + (err.message || 'Verifique as permissões no Supabase.'));
    } finally {
      btnSubmitFoto.disabled = false;
      btnSubmitFoto.textContent = btnOriginalText;
    }
  });
}

// Carregar fotos no painel administrativo
async function carregarFotosAdmin() {
  if (!listaFotos) return;

  listaFotos.innerHTML = '<p class="loading">Carregando fotos da galeria...</p>';

  try {
    const { data, error } = await supabaseClient
      .from('fotos')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) throw error;

    listaFotos.innerHTML = '';

    if (!data || data.length === 0) {
      listaFotos.innerHTML = '<p class="loading" style="grid-column: 1 / -1;">Nenhuma foto publicada ainda na galeria.</p>';
      return;
    }

    data.forEach((foto) => {
      const card = document.createElement('div');
      card.className = 'foto-admin-item';

      const dataFormatada = foto.criado_em
        ? new Date(foto.criado_em).toLocaleDateString('pt-BR')
        : '';

      card.innerHTML = `
        <img src="${foto.url}" alt="${foto.descricao}" class="foto-admin-thumb" loading="lazy">
        <div class="foto-admin-body">
          <div class="foto-admin-desc">${foto.descricao}</div>
          <div class="foto-admin-date">${dataFormatada ? 'Publicada em: ' + dataFormatada : ''}</div>
          <button class="foto-admin-delete" type="button">
            🗑️ Excluir Foto
          </button>
        </div>
      `;

      card.querySelector('.foto-admin-delete').addEventListener('click', async () => {
        const confirmar = confirm(`Deseja remover esta foto da galeria?\n"${foto.descricao}"`);
        if (!confirmar) return;

        // Tentar remover do Storage se for arquivo armazenado
        if (foto.url && foto.url.includes('/storage/v1/object/public/fotos/')) {
          const parts = foto.url.split('/fotos/');
          if (parts[1]) {
            try {
              await supabaseClient.storage.from('fotos').remove([parts[1]]);
            } catch (e) {
              console.warn('Erro ao remover arquivo do storage:', e);
            }
          }
        }

        // Remover do banco de dados
        const { error: delError } = await supabaseClient
          .from('fotos')
          .delete()
          .eq('id', foto.id);

        if (delError) {
          alert('Erro ao excluir foto: ' + delError.message);
          return;
        }

        carregarFotosAdmin();
      });

      listaFotos.appendChild(card);
    });

  } catch (err) {
    console.error('Erro ao carregar fotos:', err);
    listaFotos.innerHTML = `<p class="loading" style="grid-column: 1 / -1;">Erro ao carregar fotos. Verifique a tabela fotos no Supabase.</p>`;
  }
carregarFotosAdmin();

// Escutar alterações de fotos em tempo real no admin
supabaseClient
  .channel('admin_fotos_realtime')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'fotos' },
    () => {
      carregarFotosAdmin();
    }
  )
  .subscribe();

/* ============================================================
   GERENCIAMENTO DE COMENTÁRIOS / OPINIÕES DA GALERA NO SUPABASE
   ============================================================ */
const COMENTARIOS_PADRAO = [
  {
    nome: 'Mariana Andrade',
    cidade: 'Hortolândia - SP',
    estrelas: '5',
    texto: 'Que show incrível! A energia dos meninos no palco é contagiante do início ao fim. Tocaram os clássicos do sertanejo e as músicas autorais que todo mundo cantou junto. Já estamos esperando o próximo aqui na região!'
  },
  {
    nome: 'Rodrigo Costa',
    cidade: 'Campinas - SP',
    estrelas: '5',
    texto: 'Contratamos o show para a nossa festa de aniversário e foi um sucesso total. Além de serem músicos de altíssimo nível, são super atenciosos com os convidados. Todos elogiaram muito!'
  },
  {
    nome: 'Felipe Bueno',
    cidade: 'Paulínia - SP',
    estrelas: '5',
    texto: 'Voz marcante, violão afiado e uma presença de palco sem igual. A dupla entrega emoção e animação sem deixar a pista parar por um minuto. Parabéns Cadu e Fellipe!'
  },
  {
    nome: 'Beatriz Lima',
    cidade: 'Santos - SP',
    estrelas: '5',
    texto: 'Assisti ao show no MSC Preziosa e fiquei encantada! Sertanejo com muita classe e carisma. Eles conquistaram todo mundo a bordo. Virei fã na hora!'
  },
  {
    nome: 'Lucas Mendes',
    cidade: 'Americana - SP',
    estrelas: '5',
    texto: 'Profissionalismo impecável de toda a equipe e uma performance que emociona de verdade. A transição das modas apaixonadas para o sertanejo universitário animado é perfeita.'
  },
  {
    nome: 'Juliana Nogueira',
    cidade: 'Sumaré - SP',
    estrelas: '5',
    texto: 'Foi o melhor show do ano na nossa cidade! Carisma puro, humildade e muita qualidade musical. Podem vir todo mês que a gente vai em todos!'
  }
];

const listaComentariosAdmin = document.getElementById('lista-comentarios-admin');
const btnRestaurarPadrao = document.getElementById('btnRestaurarPadrao');

async function carregarComentariosAdmin() {
  if (!listaComentariosAdmin) return;
  listaComentariosAdmin.innerHTML = '<p class="loading">Carregando comentários do banco de dados...</p>';

  try {
    const { data, error } = await supabaseClient
      .from('comentarios')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) throw error;

    listaComentariosAdmin.innerHTML = '';

    if (!data || data.length === 0) {
      listaComentariosAdmin.innerHTML = '<p class="loading">Nenhum comentário publicado no banco de dados.</p>';
      return;
    }

    data.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'show';
      card.style.flexDirection = 'column';
      card.style.alignItems = 'flex-start';

      const estrelasTxt = '★'.repeat(Number(item.estrelas) || 5);
      const dataFormatada = item.criado_em
        ? new Date(item.criado_em).toLocaleDateString('pt-BR') + ' às ' + new Date(item.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        : '';

      card.innerHTML = `
        <div class="info" style="width: 100%; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 8px;">
            <div class="cidade" style="font-size: 16px;">
              ${item.nome} 
              <span style="font-size: 13px; color: var(--gold); font-weight: normal; margin-left: 8px;">
                📍 ${item.cidade || 'Não informada'}
              </span>
            </div>
            <div style="color: var(--gold); font-size: 16px; letter-spacing: 2px;">${estrelasTxt}</div>
          </div>
          ${dataFormatada ? `<div class="data" style="margin-top: 4px; font-size: 12px; opacity: 0.7;">Enviado em: ${dataFormatada}</div>` : ''}
        </div>
        <div class="mensagem-texto" style="width: 100%; padding: 14px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.9); font-style: italic;">
          "${item.texto}"
        </div>
        <button class="delete" style="margin-top: 12px; align-self: flex-end;" type="button">
          🗑️ Excluir Definitivamente
        </button>
      `;

      card.querySelector('.delete').addEventListener('click', async () => {
        const confirmar = confirm(`Deseja apagar definitivamente o comentário de "${item.nome}" para TODOS os usuários?`);
        if (!confirmar) return;

        const { error: delError } = await supabaseClient
          .from('comentarios')
          .delete()
          .eq('id', item.id);

        if (delError) {
          alert('Erro ao excluir comentário no banco de dados: ' + delError.message);
          return;
        }

        carregarComentariosAdmin();
      });

      listaComentariosAdmin.appendChild(card);
    });

  } catch (err) {
    console.error('Erro ao carregar comentários do admin:', err);
    listaComentariosAdmin.innerHTML = `
      <p class="loading">
        Erro ao carregar comentários do Supabase.<br>
        Certifique-se de que a tabela <code>comentarios</code> foi criada no Supabase (veja o arquivo <code>comentarios.sql</code>).
      </p>
    `;
  }
}

if (btnRestaurarPadrao) {
  btnRestaurarPadrao.addEventListener('click', async () => {
    const confirmar = confirm('Deseja inserir os comentários de exemplo no banco de dados Supabase?');
    if (!confirmar) return;

    btnRestaurarPadrao.disabled = true;
    btnRestaurarPadrao.textContent = 'Inserindo no banco...';

    try {
      const { error } = await supabaseClient
        .from('comentarios')
        .insert(COMENTARIOS_PADRAO);

      if (error) throw error;

      alert('Comentários de exemplo adicionados com sucesso ao banco de dados!');
      carregarComentariosAdmin();
    } catch (e) {
      alert('Erro ao restaurar: ' + e.message);
    } finally {
      btnRestaurarPadrao.disabled = false;
      btnRestaurarPadrao.textContent = 'Restaurar Comentários Iniciais';
    }
  });
}

carregarComentariosAdmin();

// Escutar comentários em tempo real no admin
supabaseClient
  .channel('admin_comentarios_realtime')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'comentarios' },
    () => {
      carregarComentariosAdmin();
    }
  )
  .subscribe();