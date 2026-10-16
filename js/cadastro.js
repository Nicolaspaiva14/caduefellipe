const supabaseUrl = 'https://irunkppevljtisgmkoez.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydW5rcHBldmxqdGlzZ21rb2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNTg1MTcsImV4cCI6MjA5MzczNDUxN30.kNvWjOe2jifWoGJw8FwRJumSapD9wI3Wt5ZflTTy49k';

const supabaseClient = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

const cadastroForm = document.getElementById('cadastroForm');
const errorMsg = document.getElementById('cadastroError');
const submitBtn = document.querySelector('.btn-login');

cadastroForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  errorMsg.textContent = '';
  errorMsg.style.color = '#ff4d4d'; // reset para vermelho de erro

  // Restrição de e-mail e senha
  const allowedEmails = ['nic08pm@gmail.com', 'dulaineju@gmail.com'];
  if (!allowedEmails.includes(email)) {
    errorMsg.textContent = 'Apenas e-mails autorizados podem se cadastrar.';
    return;
  }

  submitBtn.textContent = 'Criando Conta...';
  submitBtn.disabled = true;

  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password
  });

  submitBtn.textContent = 'Criar Conta';
  submitBtn.disabled = false;

  if (error) {
    console.error(error);
    if (error.message.includes('already registered')) {
       errorMsg.textContent = 'Este e-mail já está cadastrado. Volte e faça o login.';
    } else {
       errorMsg.textContent = 'Erro ao criar conta: ' + error.message;
    }
    return;
  }

  errorMsg.style.color = 'var(--gold)';
  errorMsg.textContent = 'Conta criada com sucesso! Verifique seu e-mail ou faça login.';
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 3000);
});

// Alternar visibilidade da senha (olho branco)
const btnTogglePassword = document.getElementById('btnTogglePassword');
const passwordInput = document.getElementById('password');

if (btnTogglePassword && passwordInput) {
  const eyeOpen = btnTogglePassword.querySelector('.eye-open');
  const eyeClosed = btnTogglePassword.querySelector('.eye-closed');

  btnTogglePassword.addEventListener('click', () => {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');

    if (eyeOpen && eyeClosed) {
      eyeOpen.style.display = isPassword ? 'none' : 'block';
      eyeClosed.style.display = isPassword ? 'block' : 'none';
    }

    btnTogglePassword.setAttribute('title', isPassword ? 'Ocultar senha' : 'Mostrar senha');
  });
}
