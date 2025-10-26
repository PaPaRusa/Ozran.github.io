document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/auth-status', {credentials: 'include'});
    if (!res.ok) throw new Error('status');
    const data = await res.json();
    if (!data.authenticated) {
      window.location.href = '/auth';
      return;
    }
    document.getElementById('user').textContent = data.user.username;
  } catch (e) {
    window.location.href = '/auth';
  }
});

async function logout() {
  try {
    await fetch('/logout', {method: 'POST', credentials: 'include'});
  } finally {
    window.location.href = '/auth';
  }
}
