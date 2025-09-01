document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const msg = document.getElementById('message');

  document.getElementById('show-login').addEventListener('click', () => {
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    msg.textContent = '';
  });

  document.getElementById('show-register').addEventListener('click', () => {
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    msg.textContent = '';
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    const formData = new FormData(loginForm);
    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
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
    }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    const formData = new FormData(registerForm);
    if (formData.get('password') !== formData.get('confirmPassword')) {
      msg.textContent = 'Passwords do not match';
      return;
    }
    try {
      const res = await fetch('/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          username: formData.get('username'),
          email: formData.get('email'),
          password: formData.get('password'),
          confirmPassword: formData.get('confirmPassword')
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      msg.style.color = 'green';
      msg.textContent = 'Account created, please log in.';
      registerForm.reset();
      document.getElementById('show-login').click();
    } catch (err) {
      msg.textContent = err.message;
    }
  });

  checkAuth();
});

async function checkAuth() {
  try {
    const res = await fetch('/auth-status', {credentials: 'include'});
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
