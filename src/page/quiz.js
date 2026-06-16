(function () {
  'use strict';

  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
  const PANEL_TITLES = () => [t('general_info'), t('quiz_structure'), t('settings_confirmation')];
  const TOTAL = 3;

  let currentPanel = 1;
  let answerCount = 4;
  let visibility = 'public';

  const overlay = document.getElementById('quiz-overlay');
  const btnNewQuiz = document.getElementById('btn-new-quiz');
  const btnClose = document.getElementById('qm-close');
  const btnCancel = document.getElementById('qm-cancel');
  const btnNext = document.getElementById('qm-next');
  const btnBack = document.getElementById('qm-back');
  const progressFill = document.getElementById('qm-progress');
  const modalTitle = document.getElementById('qm-title');
  const stepLabel = document.getElementById('qm-step-label');
  const answerPreview = document.getElementById('qm-answers-preview');
  const summaryBox = document.getElementById('qm-summary');

  function clampInput(el, min, max) {
    if (!el) return;
    el.addEventListener('change', () => {
      let v = parseInt(el.value);
      if (isNaN(v)) v = min;
      el.value = Math.max(min, Math.min(max, v));
    });
    el.addEventListener('blur', () => {
      let v = parseInt(el.value);
      if (isNaN(v)) v = min;
      el.value = Math.max(min, Math.min(max, v));
    });
  }

  function openModal() {
    overlay.classList.add('is-open');
    overlay.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      document.getElementById('qm-name')?.focus();
      clampInput(document.getElementById('qm-count'), 1, 100);
      clampInput(document.getElementById('qm-time'), 5, 300);
      clampInput(document.getElementById('qm-attempts'), 1, 10);
      clampInput(document.getElementById('qm-pass'), 0, 100);
      clampInput(document.getElementById('qm-pts'), 1, 999);
    }, 270);
  }

  function closeModal(clearData = false) {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (clearData) setTimeout(resetModal, 280);
  }

  function resetModal() {
    answerCount = 4;
    visibility = 'public';
    goToPanel(1, false);
    const defaults = {
      'qm-name': '', 'qm-desc': '',
      'qm-count': 10, 'qm-time': 30,
      'qm-attempts': 1, 'qm-pass': 60, 'qm-pts': 10,
    };
    Object.entries(defaults).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    });
    ['qm-subject', 'qm-lang', 'qm-order', 'qm-aorder'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.selectedIndex = 0;
    });
    document.querySelectorAll('.qm-vis-btn').forEach(b =>
      b.classList.toggle('is-active', b.dataset.vis === 'public'));
    document.querySelectorAll('.qm-toggle').forEach(t =>
      t.classList.toggle('is-active', ['show-score', 'show-correct'].includes(t.dataset.key)));
    renderAnswers();
  }

  function goToPanel(target, animate = true) {
    if (target < 1 || target > TOTAL) return;
    document.getElementById('qm-panel-' + currentPanel)?.classList.remove('is-active');
    currentPanel = target;
    document.getElementById('qm-panel-' + currentPanel)?.classList.add('is-active');
    for (let i = 1; i <= TOTAL; i++) {
      const dot = document.getElementById('qm-dot-' + i);
      if (!dot) continue;
      dot.className = 'quiz-modal__dot';
      if (i === currentPanel) dot.classList.add('is-active');
      else if (i < currentPanel) dot.classList.add('is-done');
    }
    progressFill.style.width = ((currentPanel / TOTAL) * 100) + '%';
    modalTitle.textContent = PANEL_TITLES()[currentPanel - 1];
    stepLabel.textContent = `${t('step_of')} ${currentPanel} ${t('of')} ${TOTAL}`;
    btnBack.style.display = currentPanel > 1 ? 'inline-flex' : 'none';
    btnBack.querySelector('span').textContent = t('back');
    const cancelBtn = document.getElementById('qm-cancel');
    if (cancelBtn) cancelBtn.style.display = currentPanel > 1 ? 'none' : '';
    if (currentPanel === TOTAL) {
      buildSummary();
      btnNext.innerHTML = `${t('create_quiz')} <img src="img/arrow-right1.png" width="14" height="14" style="filter:invert(1)">`;
    } else {
      btnNext.innerHTML = `${t('continue')} <img src="img/arrow-r.png" width="12" height="12" style="filter:invert(1)">`;
    }
  }

  function renderAnswers() {
    document.getElementById('qm-count-val').textContent = answerCount;
    answerPreview.innerHTML = '';
    for (let i = 0; i < answerCount; i++) {
      const chip = document.createElement('div');
      chip.className = 'qm-answer-chip' + (i === 0 ? ' qm-answer-chip--correct' : '');
      chip.innerHTML = `
        <div class="qm-answer-chip__letter">${LETTERS[i]}</div>
        <div class="qm-answer-chip__bar"></div>
        ${i === 0 ? `<span class="qm-answer-chip__badge"><img src="img/correct1.png" width="10" height="10" alt="">correct</span>` : ''}
      `;
      answerPreview.appendChild(chip);
    }
  }

  function buildSummary() {
    const v = id => document.getElementById(id)?.value?.trim() || '-';
    const visMap = { public: t('public'), private: t('private'), draft: t('draft') };
    const rows = [
      [t('summary_name'),           v('qm-name') || '-'],
      [t('summary_subject'),        v('qm-subject') || '-'],
      [t('summary_questions'),      v('qm-count')],
      [t('summary_time_q'),         v('qm-time') + ' ' + t('summary_sec')],
      [t('summary_answer_choices'), answerCount],
      [t('summary_visibility'),     visMap[visibility]],
      [t('summary_attempts'),       v('qm-attempts')],
      [t('summary_pass_score'),     v('qm-pass') + ' %'],
      [t('summary_points'),         v('qm-pts')],
    ];
    summaryBox.innerHTML = rows.map(([label, value]) => `
      <div class="qm-summary__row">
        <span class="qm-summary__row-label">${label}</span>
        <span class="qm-summary__row-value">${value}</span>
      </div>
    `).join('');
  }

  function submitQuiz() {
    const name = document.getElementById('qm-name')?.value.trim();
    if (!name) {
      goToPanel(1);
      const input = document.getElementById('qm-name');
      input?.focus();
      input?.classList.add('has-error');
      input?.addEventListener('input', () => input.classList.remove('has-error'), { once: true });
      return;
    }

    const questionCount = Math.max(1, Math.min(100, parseInt(document.getElementById('qm-count')?.value) || 10));
    const timePerQuestion = Math.max(5, Math.min(300, parseInt(document.getElementById('qm-time')?.value) || 30));
    const attempts = Math.max(1, Math.min(10, parseInt(document.getElementById('qm-attempts')?.value) || 1));
    const passScore = Math.max(0, Math.min(100, parseInt(document.getElementById('qm-pass')?.value) || 60));
    const pointsPerAnswer = Math.max(1, parseInt(document.getElementById('qm-pts')?.value) || 10);
    const clampedAnswerCount = Math.max(2, Math.min(6, answerCount));

    const payload = {
      name,
      description: document.getElementById('qm-desc')?.value.trim() || '',
      subject: document.getElementById('qm-subject')?.value || '',
      language: document.getElementById('qm-lang')?.value || '',
      visibility,
      questionCount,
      timePerQuestion,
      answerCount: clampedAnswerCount,
      questionOrder: document.getElementById('qm-order')?.value || 'fixed',
      answerOrder: document.getElementById('qm-aorder')?.value || 'fixed',
      attempts,
      passScore,
      pointsPerAnswer,
      displayOptions: [...document.querySelectorAll('.qm-toggle.is-active')].map(t => t.dataset.key),
    };
    btnNext.innerHTML = t('creating');
    btnNext.disabled = true;
    setTimeout(() => {
      btnNext.disabled = false;
      if (typeof window.blitziqCreateDraft === 'function') {
        window.blitziqCreateDraft(payload);
      }
      if (typeof window.blitziqSwitchSection === 'function') {
        window.blitziqSwitchSection('quizzes');
      }
      closeModal(true);
    }, 600);
  }

  btnNewQuiz?.addEventListener('click', openModal);
  btnClose?.addEventListener('click', () => closeModal(false));
  btnCancel?.addEventListener('click', () => closeModal(false));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay?.classList.contains('is-open')) closeModal(false);
  });
  btnBack?.addEventListener('click', () => goToPanel(currentPanel - 1));
  btnNext?.addEventListener('click', () => {
    currentPanel === TOTAL ? submitQuiz() : goToPanel(currentPanel + 1);
  });

  document.querySelectorAll('.qm-vis-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      document.querySelectorAll('.qm-vis-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      visibility = btn.dataset.vis;
    })
  );

  document.getElementById('qm-count-down')?.addEventListener('click', () => {
    if (answerCount <= 2) return;
    answerCount--;
    renderAnswers();
  });
  document.getElementById('qm-count-up')?.addEventListener('click', () => {
    if (answerCount >= 6) return;
    answerCount++;
    renderAnswers();
  });

  document.querySelectorAll('.qm-toggle').forEach(btn =>
    btn.addEventListener('click', () => btn.classList.toggle('is-active'))
  );

  renderAnswers();
})();

// --- Category Carousel ---

(function () {
  const track = document.getElementById('cat-track');
  const prevBtn = document.getElementById('cat-prev');
  const nextBtn = document.getElementById('cat-next');
  if (!track || !prevBtn || !nextBtn) return;

  const VISIBLE = 4;
  const cards = track.querySelectorAll('.cat-card');
  const total = cards.length;
  const maxIndex = total - VISIBLE;
  let index = 0;
  let timer = null;

  function getCardWidth() {
    const card = cards[0];
    const style = getComputedStyle(track);
    const gap = parseFloat(style.gap) || 16;
    return card.getBoundingClientRect().width + gap;
  }

  function goTo(i) {
    index = Math.max(0, Math.min(i, maxIndex));
    track.style.transform = `translateX(-${index * getCardWidth()}px)`;
    prevBtn.style.opacity = index === 0 ? '0.4' : '1';
    nextBtn.style.opacity = index >= maxIndex ? '0.4' : '1';
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
      goTo(index >= maxIndex ? 0 : index + 1);
    }, 10000);
  }

  prevBtn.addEventListener('click', () => { goTo(index - 1); startTimer(); });
  nextBtn.addEventListener('click', () => { goTo(index + 1); startTimer(); });

  goTo(0);
  startTimer();

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.dataset.cat;
      if (!cat) return;

      const navLink = document.querySelector('.navbar-links a[data-section="discover"]');
      if (navLink) navLink.click();

      setTimeout(() => {
        const matchingFilter = [...document.querySelectorAll('.disc-filter')]
          .find(f => f.dataset.cat === cat);

        if (matchingFilter && typeof window.blitziqFilterGrids === 'function') {
          document.querySelectorAll('.disc-filter').forEach(f => f.classList.remove('is-active'));
          matchingFilter.classList.add('is-active');
          window.blitziqFilterGrids(cat);
        }

        setTimeout(() => {
          const firstBlock = document.querySelector('.disc-block--cat:not([style*="display: none"])');
          if (firstBlock) firstBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      }, 50);
    });
  });
})();