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
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const text = btn.querySelector('.overlay-submit-text');
    const spin = btn.querySelector('.overlay-spinner');
    btn.disabled = loading;
    text.style.display = loading ? 'none' : '';
    spin.style.display = loading ? 'inline-block' : 'none';
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function handleAuthSuccess(username) {
    const actions = document.querySelector('.navbar-actions');
    if (!actions) return;
    actions.innerHTML = `
      <span class="navbar-username">${escapeHtml(username)}</span>
      <div class="navbar-avatar-wrap" id="navbar-avatar-wrap">
        <button class="navbar-avatar" id="btn-avatar" aria-label="Account menu">
          ${username.charAt(0).toUpperCase()}
        </button>
        <div class="navbar-dropdown" id="navbar-dropdown">
          <a href="logout.php" class="navbar-dropdown-item">Log out</a>
        </div>
      </div>
    `;
    const newAvatarBtn = document.getElementById('btn-avatar');
    const newDropdown  = document.getElementById('navbar-dropdown');
    newAvatarBtn.addEventListener('click', e => {
      e.stopPropagation();
      newDropdown.classList.toggle('is-open');
    });
  }

  function submitForm({ formId, endpoint, btnId, errorId, successId }) {
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
        showAlert(errorId, 'Network error, please try again.');
      } finally {
        setLoading(btnId, false);
      }
    });
  }

  submitForm({
    formId:    'form-login',
    endpoint:  'login.php',
    btnId:     'btn-login-submit',
    errorId:   'login-error',
    successId: null,
  });

  submitForm({
    formId:    'form-signup',
    endpoint:  'register.php',
    btnId:     'btn-signup-submit',
    errorId:   'signup-error',
    successId: 'signup-success',
  });

  const contactCard = document.querySelector('#overlay-contact .overlay-card');
  if (contactCard) {
    contactCard.innerHTML = `
      <button class="overlay-close" data-close="overlay-contact" aria-label="Close">
        <img src="img/close.png" width="16" height="16">
      </button>
      <h2 class="overlay-title">Get in touch</h2>
      <p class="overlay-sub">We'll get back to you as soon as possible</p>
      <div id="contact-error" class="overlay-alert" style="display:none;"></div>
      <div id="contact-success" class="overlay-alert overlay-alert--success" style="display:none;"></div>
      <form class="overlay-form" id="form-contact" novalidate>
        <div class="overlay-field">
          <label for="contact-to">To</label>
          <input id="contact-to" type="email" value="clbidamihai@gmail.com" readonly>
        </div>
        <div class="overlay-field">
          <label for="contact-subject">Subject</label>
          <input id="contact-subject" name="subject" type="text" placeholder="What's this about?" required>
        </div>
        <div class="overlay-field">
          <label for="contact-msg">Message</label>
          <textarea id="contact-msg" name="message" rows="4" placeholder="Your message..." required style="resize:vertical;"></textarea>
        </div>
        <button type="submit" class="overlay-submit" id="btn-contact-submit">
          <span class="overlay-submit-text">Send message</span>
          <span class="overlay-spinner" style="display:none;"></span>
        </button>
      </form>
      <div class="contact-socials">
        <p class="contact-socials-label">Or reach out on socials</p>
        <div class="contact-socials-row">
          <a href="https://github.com/MihaiCulbida" target="_blank"><img src="img/github.png" width="28" height="28"></a>
          <a href="https://instagram.com/acsiless" target="_blank"><img src="img/instagram.png" width="28" height="28"></a>
          <a href="https://t.me/acsiless" target="_blank"><img src="img/telegram.png" width="28" height="28"></a>
        </div>
      </div>
    `;
  }

  document.getElementById('form-contact')?.addEventListener('submit', async e => {
    e.preventDefault();
    const err = document.getElementById('contact-error');
    const ok  = document.getElementById('contact-success');
    const btn = document.getElementById('btn-contact-submit');
    err.style.display = 'none';
    ok.style.display  = 'none';
    btn.querySelector('.overlay-submit-text').style.display = 'none';
    btn.querySelector('.overlay-spinner').style.display = 'inline-block';

    await new Promise(r => setTimeout(r, 800));

    btn.querySelector('.overlay-submit-text').style.display = 'inline';
    btn.querySelector('.overlay-spinner').style.display = 'none';
    ok.textContent = 'Message sent!';
    ok.style.display = 'block';
    e.target.reset();
  });

  const btnLogin  = document.getElementById('btn-open-login');
  const btnSignup = document.getElementById('btn-open-signup');
  if (btnLogin)  btnLogin.addEventListener('click',  () => openOverlay('overlay-login'));
  if (btnSignup) btnSignup.addEventListener('click', () => openOverlay('overlay-signup'));

  document.addEventListener('click', function (e) {
    const closeTarget = e.target.closest('[data-close]');
    if (closeTarget) closeOverlay(closeTarget.dataset.close);

    const switchTarget = e.target.closest('[data-switch]');
    if (switchTarget) {
      const currentOverlay = switchTarget.closest('.overlay');
      if (currentOverlay) closeOverlay(currentOverlay.id);
      openOverlay(switchTarget.dataset.switch);
    }
  });

  document.querySelectorAll('[data-open]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const target = el.dataset.open;
      if (target === 'overlay-contact' && !document.querySelector('.navbar-avatar')) {
        openOverlay('overlay-login');
        return;
      }
      openOverlay(target);
    });
  });

  document.getElementById('contact-login-link')?.addEventListener('click', e => {
    e.preventDefault();
    closeOverlay('overlay-contact');
    openOverlay('overlay-login');
  });

  document.querySelectorAll('.overlay-eye').forEach(btn => {
    btn.addEventListener('click', function () {
      const input = document.getElementById(this.dataset.target);
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
      this.querySelector('img').src = input.type === 'text' ? 'img/eye-open.png' : 'img/eye-closed.png';
    });
  });

  const avatarBtn = document.getElementById('btn-avatar');
  const dropdown  = document.getElementById('navbar-dropdown');

  if (avatarBtn && dropdown) {
    avatarBtn.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.classList.toggle('is-open');
    });
    document.addEventListener('click', () => {
      dropdown.classList.remove('is-open');
    });
  }

  document.getElementById('btn-cta-signup')?.addEventListener('click', () => {
    if (document.querySelector('.navbar-avatar')) {
      showToast('You are already logged in.');
      return;
    }
    openOverlay('overlay-signup');
  });

  document.getElementById('btn-cta-contact')?.addEventListener('click', () => {
    if (!document.querySelector('.navbar-avatar')) {
      openOverlay('overlay-login');
      return;
    }
    openOverlay('overlay-contact');
  });

  const navLinks = document.querySelectorAll('.navbar-links a[href^="#"]');
  const sections = [];
  navLinks.forEach(a => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) sections.push({ id, el });
  });

  function updateActive() {
    let current = sections[0]?.id;
    let minDist = Infinity;
    sections.forEach(({ id, el }) => {
      const rect = el.getBoundingClientRect();
      const dist = Math.abs(rect.top);
      if (rect.top <= window.innerHeight / 2 && dist < minDist) {
        minDist = dist;
        current = id;
      }
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', updateActive);
  updateActive();

document.querySelectorAll('[data-open="overlay-about"]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    openOverlay('overlay-about');
  });
});

document.getElementById('btn-about-create')?.addEventListener('click', () => {
  closeOverlay('overlay-about');
  if (document.querySelector('.navbar-avatar')) {
    window.location.href = 'page.php';
  } else {
    openOverlay('overlay-signup');
  }
});

document.querySelectorAll('[data-open="overlay-terms"]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    openOverlay('overlay-terms');
  });
});
 
document.getElementById('btn-terms-accept')?.addEventListener('click', () => {
  closeOverlay('overlay-terms');
});

document.getElementById('btn-privacy-accept')?.addEventListener('click', () => {
  closeOverlay('overlay-privacy');
});

})();