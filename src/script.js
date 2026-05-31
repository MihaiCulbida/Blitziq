(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  script.onload = initHero;
  document.head.appendChild(script);

  function initHero() {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 2.5);

    const geo = new THREE.PlaneGeometry(8, 6, 120, 80);

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }
      },
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying float vElevation;
        void main() {
          vUv = uv;
          vec3 pos = position;
          float w1 = sin(pos.x * 1.8 + uTime * 0.5) * cos(pos.y * 1.2 + uTime * 0.3) * 0.18;
          float w2 = sin(pos.x * 2.5 - uTime * 0.4 + pos.y * 1.5) * 0.12;
          float w3 = cos(pos.x * 1.1 + pos.y * 2.0 + uTime * 0.6) * 0.09;
          pos.z += w1 + w2 + w3;
          vElevation = pos.z;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying float vElevation;
        void main() {
          vec3 dark   = vec3(0.05, 0.02, 0.12);
          vec3 purple = vec3(0.32, 0.12, 0.75);
          vec3 violet = vec3(0.48, 0.18, 0.88);
          vec3 bright = vec3(0.62, 0.30, 0.98);
          float t = clamp((vElevation + 0.35) / 0.70, 0.0, 1.0);
          float pulse = sin(uTime * 0.3 + vUv.x * 3.14) * 0.5 + 0.5;
          vec3 col = mix(dark, purple, smoothstep(0.0, 0.4, t));
          col = mix(col, violet, smoothstep(0.3, 0.65, t) * (0.7 + 0.3 * pulse));
          col = mix(col, bright, smoothstep(0.6, 1.0, t) * 0.8);
          float fade = smoothstep(0.0, 0.42, vUv.y) * smoothstep(0.0, 0.42, 1.0 - vUv.y)
           * smoothstep(0.0, 0.32, vUv.x) * smoothstep(0.0, 0.32, 1.0 - vUv.x);
          col *= 0.2 + 0.8 * fade;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    function resize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    let t = 0;
    (function animate() {
      requestAnimationFrame(animate);
      t += 0.012;
      mat.uniforms.uTime.value = t;
      renderer.render(scene, camera);
    })();
  }
})();

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
      document.getElementById('form-contact').addEventListener('submit', async e => {
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
    }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
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
    if (closeTarget) closeOverlay(closeTarget.dataset.close);

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
document.querySelectorAll('[data-open]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      openOverlay(el.dataset.open);
    });
  });

  document.getElementById('contact-login-link')?.addEventListener('click', e => {
    e.preventDefault();
    closeOverlay('overlay-contact');
    openOverlay('overlay-login');
  });

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

 const navLinks = document.querySelectorAll('.navbar-links a[href^="#"]');
  const sections = [];
  navLinks.forEach(a => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) sections.push({ id, el });
  });

  function updateActive() {
    let current = sections[0]?.id;
    sections.forEach(({ id, el }) => {
      if (window.scrollY >= el.offsetTop - 120) current = id;
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', updateActive);
  updateActive();
})();

(function () {
  const questions = [
    {
      text: "What will this PHP code output?",
      code: `<?php\n$a = "5";\n$b = 3;\necho $a + $b;\n?>`,
      opts: ["Fatal error", "53", "8", '"5"3'],
      correct: 2,
      feedback: {
        ok: "Correct! PHP converts the string \"5\" to an integer automatically and calculates 5 + 3 = 8. This is called type juggling.",
        ko: "PHP converts \"5\" (string) to 5 (integer) automatically and adds 3, resulting in 8. This is called type juggling."
      }
    },
    {
      text: "Which method is the best defense against SQL injection in PHP?",
      code: null,
      opts: [
        "mysql_real_escape_string()",
        "Prepared statements with PDO or MySQLi",
        "htmlspecialchars()",
        "strip_tags()"
      ],
      correct: 1,
      feedback: {
        ok: "Exactly! Prepared statements separate SQL code from data entirely. mysql_real_escape_string() is deprecated since PHP 7.",
        ko: "The correct answer is prepared statements with PDO or MySQLi - they fully separate SQL code from user-supplied data."
      }
    },
    {
      text: "What does this expression return in PHP 8?",
      code: `<?php\nvar_dump(0 == "foo");\n?>`,
      opts: [
        'bool(true) - PHP converts "foo" to 0',
        "bool(false) - PHP 8 changed this behavior",
        "NULL",
        "A type error is thrown"
      ],
      correct: 1,
      feedback: {
        ok: "Nice! In PHP 8, comparing an integer with a non-numeric string returns false. In PHP 7 it returned true - a classic gotcha!",
        ko: 'In PHP 8 this returns bool(false). PHP 7 would return true (converting "foo" to 0), but PHP 8 fixed this.'
      }
    }
  ];

  let current = 0, score = 0, timerInterval = null, answered = false;

  function renderQuestion(i) {
    answered = false;
    const q = questions[i];
    document.getElementById('g-num').textContent = `Question ${i + 1} of 3`;
    document.getElementById('g-text').textContent = q.text;

    const codeEl = document.getElementById('g-code');
    if (q.code) { codeEl.style.display = 'block'; codeEl.textContent = q.code; }
    else { codeEl.style.display = 'none'; }

    document.getElementById('g-feedback').className = 'game-feedback';
    document.getElementById('g-feedback').textContent = '';
    document.getElementById('btn-next').className = 'game-next';

    const optsEl = document.getElementById('g-opts');
    optsEl.innerHTML = '';
    ['A', 'B', 'C', 'D'].forEach((letter, idx) => {
      const btn = document.createElement('button');
      btn.className = 'game-opt';
      btn.innerHTML = `<span class="game-opt-letter">${letter}</span>${q.opts[idx]}`;
      btn.addEventListener('click', () => selectAnswer(idx));
      optsEl.appendChild(btn);
    });

    document.getElementById('game-prog').style.width = ((i + 1) / 3 * 100) + '%';
    updateDots(i);
    startTimer();
  }

  function startTimer() {
    clearInterval(timerInterval);
    let t = 15;
    const el = document.getElementById('g-timer');
    el.textContent = t;
    el.className = 'game-timer';
    timerInterval = setInterval(() => {
      t--;
      el.textContent = t;
      if (t <= 5) el.className = 'game-timer urgent';
      if (t <= 0) { clearInterval(timerInterval); timeUp(); }
    }, 1000);
  }

  function timeUp() {
    if (answered) return;
    answered = true;
    const q = questions[current];
    document.querySelectorAll('.game-opt').forEach((b, idx) => {
      b.disabled = true;
      b.className = 'game-opt ' + (idx === q.correct ? 'correct' : 'dimmed');
    });
    const fb = document.getElementById('g-feedback');
    fb.textContent = "Time's up! " + q.feedback.ko;
    fb.className = 'game-feedback show ko';
    document.getElementById('btn-next').className = 'game-next show';
  }

  function selectAnswer(idx) {
    if (answered) return;
    answered = true;
    clearInterval(timerInterval);
    const q = questions[current];
    document.querySelectorAll('.game-opt').forEach((b, i) => {
      b.disabled = true;
      if (i === q.correct) b.className = 'game-opt correct';
      else if (i === idx) b.className = 'game-opt wrong';
      else b.className = 'game-opt dimmed';
    });
    const isCorrect = idx === q.correct;
    if (isCorrect) score++;
    const fb = document.getElementById('g-feedback');
    fb.textContent = isCorrect ? q.feedback.ok : q.feedback.ko;
    fb.className = 'game-feedback show ' + (isCorrect ? 'ok' : 'ko');
    document.getElementById('btn-next').className = 'game-next show';
  }

  function updateDots(active) {
    for (let i = 0; i < 3; i++) {
      const d = document.getElementById('gdot-' + i);
      d.className = 'game-dot' + (i < active ? ' done' : i === active ? ' active' : '');
    }
  }

  function showResult() {
    document.getElementById('game-main').style.display = 'none';
    document.getElementById('game-result').className = 'game-result show';
    document.getElementById('g-score').textContent = score;
    const titles = ['Keep practicing!', 'Good start!', 'PHP Master!'];
    const subs = [
      'PHP has many quirks. Review the docs and give it another shot!',
      "You're getting there - a bit more practice and you'll nail it.",
      'You know type juggling, security & breaking changes. Impressive!'
    ];
    document.getElementById('g-result-title').textContent = titles[score];
    document.getElementById('g-result-sub').textContent = subs[score];
    for (let i = 0; i < 3; i++) document.getElementById('gdot-' + i).className = 'game-dot done';
    document.getElementById('game-prog').style.width = '100%';
  }

  document.getElementById('btn-next').addEventListener('click', () => {
    current++;
    if (current < 3) renderQuestion(current);
    else showResult();
  });

  document.getElementById('btn-restart').addEventListener('click', () => {
    current = 0; score = 0;
    document.getElementById('game-main').style.display = '';
    document.getElementById('game-result').className = 'game-result';
    renderQuestion(0);
  });

  renderQuestion(0);
})();