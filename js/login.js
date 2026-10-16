const supabaseUrl = 'https://irunkppevljtisgmkoez.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydW5rcHBldmxqdGlzZ21rb2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNTg1MTcsImV4cCI6MjA5MzczNDUxN30.kNvWjOe2jifWoGJw8FwRJumSapD9wI3Wt5ZflTTy49k';

const supabaseClient = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('loginError');
const submitBtn = document.querySelector('.btn-login');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  errorMsg.textContent = '';

  const allowedEmails = ['nic08pm@gmail.com', 'dulaineju@gmail.com'];
  if (!allowedEmails.includes(email)) {
    errorMsg.textContent = 'Acesso restrito. E-mail não autorizado.';
    return;
  }

  submitBtn.textContent = 'Entrando...';
  submitBtn.disabled = true;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  submitBtn.textContent = 'Entrar';
  submitBtn.disabled = false;

  if (error) {
    console.error(error);
    errorMsg.textContent = 'E-mail ou senha incorretos.';
    return;
  }

  window.location.href = '../admin.html';
});

async function checkAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    window.location.href = '../admin.html';
  }
}

checkAuth();

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
