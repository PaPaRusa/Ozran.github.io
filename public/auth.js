document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const msg = document.getElementById('message');
  const loginTab = document.getElementById('show-login');
  const registerTab = document.getElementById('show-register');

  function clearMessage() {
    msg.textContent = '';
    msg.className = 'message';
  }

  loginTab.addEventListener('click', () => {
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    clearMessage();
  });

  registerTab.addEventListener('click', () => {
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    clearMessage();
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage();
    const formData = new FormData(loginForm);
    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password')
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      window.location.href = '/dashboard';
    } catch (err) {
      msg.textContent = err.message;
      msg.classList.add('error');
    }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage();
    const formData = new FormData(registerForm);
    if (formData.get('password') !== formData.get('confirmPassword')) {
      msg.textContent = 'Passwords do not match';
      msg.classList.add('error');
      return;
    }
    try {
      const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.get('username'),
          email: formData.get('email'),
          password: formData.get('password'),
          confirmPassword: formData.get('confirmPassword')
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      msg.textContent = 'Account created, please log in.';
      msg.classList.add('success');
      registerForm.reset();
      loginTab.click();
    } catch (err) {
      msg.textContent = err.message;
      msg.classList.add('error');
    }
  });

  checkAuth();
});

async function checkAuth() {
  try {
    const res = await fetch('/auth-status', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      if (data.authenticated) {
        window.location.href = '/dashboard';
      }
    }
  } catch (e) {
    // ignore
  }
}
