(function () {
  'use strict';

  function openOverlay(id) {
    const el = document.getElementById(id);
    if (!el) return;
    document.querySelectorAll('.overlay.is-open').forEach(o => {
      if (o !== el) closeOverlay(o.id);
    });
    el.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const first = el.querySelector('input');
      if (first) first.focus();
    }, 200);
  }

  function closeOverlay(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('is-open');
    document.body.style.overflow = '';
    clearAlert(id);
  }

  function clearAlert(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;
    overlay.querySelectorAll('.overlay-alert').forEach(a => {
      a.style.display = 'none';
      a.textContent = '';
    });
  }

  function showAlert(elId, message, isSuccess = false) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent = message;
    el.className = 'overlay-alert' + (isSuccess ? ' overlay-alert--success' : '');
    el.style.display = 'block';
  }

  function setLoading(btnId, loading) {
    const btn  = document.getElementById(btnId);
    if (!btn) return;
    const text = btn.querySelector('.overlay-submit-text');
    const spin = btn.querySelector('.overlay-spinner');
    btn.disabled  = loading;
    text.style.display = loading ? 'none' : '';
    spin.style.display = loading ? 'inline-block' : 'none';
  }

  function handleAuthSuccess(username) {
    const actions = document.querySelector('.navbar-actions');
    if (!actions) return;
    actions.innerHTML = `
      <span class="navbar-user">
        <span class="navbar-avatar">${username.charAt(0).toUpperCase()}</span>
        ${escapeHtml(username)}
      </span>
      <a href="logout.php" class="navbar-btn navbar-btn-login">Log out</a>
    `;
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }


  function submitForm({ formId, endpoint, btnId, errorId, successId, onSuccess }) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      setLoading(btnId, true);
      clearAlert(errorId.replace('-error', '').replace('-success', ''));

      const body = new URLSearchParams(new FormData(form));

      try {
        const res  = await fetch(endpoint, { method: 'POST', body });
        const data = await res.json();

        if (data.success) {
          if (successId) showAlert(successId, data.message, true);
          handleAuthSuccess(data.username);
          setTimeout(() => closeOverlay(formId.replace('form-', 'overlay-')), 800);
        } else {
          showAlert(errorId, data.message || 'Something went wrong.');
        }
      } catch {
        showAlert(errorId, 'Network error — please try again.');
      } finally {
        setLoading(btnId, false);
      }
    });
  }

  submitForm({
    formId: 'form-login',
    endpoint: 'login.php',
    btnId: 'btn-login-submit',
    errorId: 'login-error',
    successId: null,
  });

  submitForm({
    formId: 'form-signup',
    endpoint: 'register.php',
    btnId: 'btn-signup-submit',
    errorId: 'signup-error',
    successId: 'signup-success',
  });

  const btnLogin  = document.getElementById('btn-open-login');
  const btnSignup = document.getElementById('btn-open-signup');
  if (btnLogin)  btnLogin.addEventListener('click',  () => openOverlay('overlay-login'));
  if (btnSignup) btnSignup.addEventListener('click', () => openOverlay('overlay-signup'));

  document.addEventListener('click', function (e) {
    const closeTarget = e.target.closest('[data-close]');
    if (closeTarget) {
      closeOverlay(closeTarget.dataset.close);
    }
    const switchTarget = e.target.closest('[data-switch]');
    if (switchTarget) {
      const currentOverlay = switchTarget.closest('.overlay');
      if (currentOverlay) closeOverlay(currentOverlay.id);
      openOverlay(switchTarget.dataset.switch);
    }
  });

  document.querySelectorAll('.overlay-eye').forEach(btn => {
    btn.addEventListener('click', function () {
      const input = document.getElementById(this.dataset.target);
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
      this.querySelector('img').src = input.type === 'text' ? 'img/eye-open.png' : 'img/eye-closed.png';
    });
  });

})();