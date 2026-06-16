(function () {
  'use strict';

  const overlay = document.getElementById('start-overlay');
  const closeBtn = document.getElementById('start-modal-close');
  const titleEl = document.getElementById('start-modal-title');
  const metaEl = document.getElementById('start-modal-meta');
  const infoEl = document.getElementById('start-modal-info');
  const saveBtn = document.getElementById('start-modal-save');

  let currentQuiz = null;

  document.getElementById('start-modal-start')?.addEventListener('click', () => {
    if (!currentQuiz) return;
    closeStartModal();
    setTimeout(() => {
      if (typeof window.blitziqRunQuiz === 'function') {
        window.blitziqRunQuiz(currentQuiz);
      }
    }, 250);
  });

  function isSaved(name) {
    return getSaved().some(q => q.name === name);
  }

  function updateSaveBtn() {
    if (!currentQuiz || !saveBtn) return;
    const saved = isSaved(currentQuiz.name);
    saveBtn.innerHTML = `
      <img src="img/${saved ? 'bookmark1' : 'bookmark'}.png" width="15" height="15" alt="">
      ${saved ? t('saved_label') : t('save')}
    `;
    saveBtn.style.color = saved ? '#6d28d9' : '';
    saveBtn.style.borderColor = saved ? '#a78bfa' : '';
  }

  function openStartModal(quiz) {
    currentQuiz = quiz;
    titleEl.textContent = quiz.name;

    const questionCount = quiz.questions
      ? quiz.questions.length
      : parseInt(quiz.meta?.match(/(\d+)\s+question/)?.[1]) || '—';
    const subject = quiz.subject || quiz.meta?.split('·')[0]?.trim() || 'Unknown';

    metaEl.textContent = `${subject} · ${questionCount} questions` +
      (quiz.timePerQ ? ` · ${quiz.timePerQ}s per question` : '');

    const infos = [
      [t('info_questions'),  questionCount],
      [t('info_time_q'),     quiz.timePerQ  ? quiz.timePerQ + 's' : '—'],
      [t('info_points'),     quiz.points    ?? '—'],
      [t('info_pass'),       quiz.passScore != null ? quiz.passScore + '%' : '—'],
    ];
    infoEl.innerHTML = infos.map(([label, value]) => `
      <div class="start-modal__info-item">
        <span class="start-modal__info-label">${label}</span>
        <span class="start-modal__info-value">${value}</span>
      </div>
    `).join('');

    updateSaveBtn();
    overlay.classList.add('is-open');
    overlay.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeStartModal() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  saveBtn?.addEventListener('click', () => {
    if (!currentQuiz) return;
    const saved = getSaved();
    const idx = saved.findIndex(q => q.name === currentQuiz.name);
    if (idx === -1) {
      saved.push({ name: currentQuiz.name, meta: currentQuiz.meta || '', icon: currentQuiz.icon || '' });
    } else {
      saved.splice(idx, 1);
    }
    setSaved(saved);
    updateSaveBtn();
    if (typeof window.blitziqRenderFavorites === 'function') {
      window.blitziqRenderFavorites();
    }
  });

  closeBtn?.addEventListener('click', closeStartModal);
  overlay?.addEventListener('click', e => { if (e.target === overlay) closeStartModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay?.classList.contains('is-open')) closeStartModal();
  });

  document.querySelectorAll('.start-modal__mode').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.start-modal__mode').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });

  window.blitziqOpenStartModal = openStartModal;
})();

(function () {
  'use strict';

  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

  let state = {
    quiz: null, questions: [], index: 0, score: 0,
    correct: 0, wrong: 0, skipped: 0,
    skippedIndices: [], answeredIndices: new Set(),
    isRetry: false, answered: false,
    timer: null, timeLeft: 30, startTime: 0,
  };

  const overlay   = document.getElementById('qr-overlay');
  const nameEl    = document.getElementById('qr-name');
  const counterEl = document.getElementById('qr-counter');
  const fillEl    = document.getElementById('qr-progress-fill');
  const timerEl   = document.getElementById('qr-timer');
  const timerVal  = document.getElementById('qr-timer-val');
  const scoreVal  = document.getElementById('qr-score-val');
  const qNum      = document.getElementById('qr-q-num');
  const qText     = document.getElementById('qr-q-text');
  const answersEl = document.getElementById('qr-answers');
  const feedback  = document.getElementById('qr-feedback');
  const nextBtn   = document.getElementById('qr-next-btn');
  const resultsEl = document.getElementById('qr-results');

  function buildQuestions(quiz) {
    if (quiz.questions && quiz.questions.length > 0) {
      return quiz.questions.map(q => ({
        text: q.text || '(No question text)',
        answers: q.answers || [],
        type: q.type || 'single',
        time: q.time || quiz.timePerQ || 30,
        points: q.points || quiz.points || 10,
      }));
    }
    const count = parseInt(quiz.meta?.match(/(\d+)\s+question/)?.[1]) || 5;
    return Array.from({ length: count }, (_, i) => ({
      text: `Question ${i + 1} — "${quiz.name}"`,
      answers: [
        { text: 'Option A', correct: true }, { text: 'Option B', correct: false },
        { text: 'Option C', correct: false }, { text: 'Option D', correct: false },
      ],
      type: 'single', time: 30, points: 10,
    }));
  }

  function open(quiz) {
    state = {
      quiz, questions: buildQuestions(quiz),
      index: 0, score: 0, correct: 0, wrong: 0, skipped: 0,
      skippedIndices: [], answeredIndices: new Set(),
      isRetry: false, answered: false, timer: null, timeLeft: 30, startTime: Date.now(),
    };

    nameEl.textContent = quiz.name;
    scoreVal.textContent = '0';
    document.getElementById('qr-body').style.display = '';
    document.getElementById('qr-question-wrap').style.display = '';
    document.querySelector('.qr-footer').style.display = '';
    resultsEl.style.display = 'none';
    feedback.className = 'qr-feedback';
    feedback.innerHTML = '<span class="qr-feedback__icon" id="qr-feedback-icon"></span><span id="qr-feedback-text"></span>';
    nextBtn.style.display = 'none';

    overlay.classList.add('is-open');
    overlay.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';

    showCountdown(() => loadQuestion());
  }

  function showCountdown(onDone) {
    const body = document.getElementById('qr-body');
    const questionWrap = document.getElementById('qr-question-wrap');
    const footer = document.querySelector('.qr-footer');
    const existing = document.getElementById('qr-countdown');

    body.style.display = 'none';
    questionWrap.style.display = 'none';
    footer.style.display = 'none';
    if (existing) existing.remove();

    const cd = document.createElement('div');
    cd.id = 'qr-countdown';
    cd.innerHTML = `
      <div class="qr-cd-label">${t('get_ready')}</div>
      <div class="qr-cd-ring">
        <svg class="qr-cd-svg" viewBox="0 0 120 120">
          <circle class="qr-cd-track" cx="60" cy="60" r="52"/>
          <circle class="qr-cd-arc"   cx="60" cy="60" r="52" id="qr-cd-arc"/>
        </svg>
        <span class="qr-cd-num" id="qr-cd-num">3</span>
      </div>
      <div class="qr-cd-quiz-name" id="qr-cd-quiz-name"></div>
    `;
    overlay.appendChild(cd);

    const quizNameEl = cd.querySelector('#qr-cd-quiz-name');
    if (quizNameEl) quizNameEl.textContent = state.quiz.name || '';

    const arc = cd.querySelector('#qr-cd-arc');
    const numEl = cd.querySelector('#qr-cd-num');
    const CIRC = 2 * Math.PI * 52;
    arc.style.strokeDasharray = CIRC;
    arc.style.strokeDashoffset = '0';

    const steps = [
      { num: '3', color: '#a78bfa', label: t('get_ready') },
      { num: '2', color: '#f472b6', label: t('almost') },
      { num: '1', color: '#34d399', label: t('go') },
    ];

    let i = 0;
    function tick() {
      if (i >= steps.length) {
        cd.classList.add('qr-cd-out');
        setTimeout(() => {
          cd.remove();
          body.style.display = '';
          questionWrap.style.display = '';
          footer.style.display = '';
          onDone();
        }, 400);
        return;
      }
      const s = steps[i];
      numEl.textContent = s.num;
      cd.querySelector('.qr-cd-label').textContent = s.label;
      arc.style.stroke = s.color;
      numEl.style.color = s.color;
      arc.style.transition = 'none';
      arc.style.strokeDashoffset = '0';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        arc.style.transition = 'stroke-dashoffset 1s linear';
        arc.style.strokeDashoffset = CIRC;
      }));
      cd.classList.remove('qr-cd-pop');
      void cd.offsetWidth;
      cd.classList.add('qr-cd-pop');
      i++;
      setTimeout(tick, 1000);
    }
    tick();
  }

  function close() {
    clearTimer();
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function loadQuestion() {
    const q = state.questions[state.index];
    state.answered = false;
    feedback.className = 'qr-feedback';
    feedback.innerHTML = '<span class="qr-feedback__icon" id="qr-feedback-icon"></span><span id="qr-feedback-text"></span>';
    nextBtn.style.display = 'none';

    const skipBtn = document.getElementById('qr-skip-btn');
    if (skipBtn) {
      const allowSkip = (state.quiz.displayOptions || []).includes('allow-skip');
      skipBtn.style.display = (!state.isRetry && allowSkip) ? '' : 'none';
      skipBtn.onclick = () => skipQuestion();
    }

    const total = state.questions.length;
    const current = state.index + 1;
    counterEl.textContent = `${current} / ${total}`;
    fillEl.style.width = ((current / total) * 100) + '%';
    qNum.textContent = `${t('runner_q_of')} ${current} ${t('runner_of')} ${total}`;
    qText.textContent = q.text || '(No question text)';

    answersEl.innerHTML = '';
    const answers = q.answers.length > 0 ? q.answers : [
      { text: 'True', correct: true }, { text: 'False', correct: false }
    ];
    answers.forEach((ans, i) => {
      const btn = document.createElement('button');
      btn.className = 'qr-answer';
      btn.dataset.index = i;
      btn.innerHTML = `
        <span class="qr-answer__letter">${LETTERS[i]}</span>
        <span class="qr-answer__text">${ans.text || '(empty)'}</span>
        <span class="qr-answer__icon">
          <img class="icon-check" src="img/correct1.png" width="18" height="18" style="display:none; filter: invert(1)">
          <img class="icon-x" src="img/incorrect.png" width="18" height="18" style="display:none; filter: invert(1)">
        </span>
      `;
      btn.addEventListener('click', () => pickAnswer(i));
      answersEl.appendChild(btn);
    });

    renderDots();
    startTimer(q.time || 30);
  }

  function renderDots() {
    const dotsEl = document.getElementById('qr-dots');
    if (!dotsEl) return;
    const total = state.questions.length;
    const MAX_DOTS = 12;
    dotsEl.innerHTML = '';
    if (total > MAX_DOTS) return;
    for (let i = 0; i < total; i++) {
      const d = document.createElement('span');
      d.className = 'qr-dots__dot' +
        (i < state.index ? ' qr-dots__dot--done' : '') +
        (i === state.index ? ' qr-dots__dot--current' : '');
      dotsEl.appendChild(d);
    }
  }

  function pickAnswer(chosenIndex) {
    if (state.answered) return;
    state.answered = true;
    const skipBtn = document.getElementById('qr-skip-btn');
    if (skipBtn) skipBtn.style.display = 'none';
    clearTimer();

    const q = state.questions[state.index];
    const answers = q.answers.length > 0 ? q.answers : [{ text: 'True', correct: true }, { text: 'False', correct: false }];
    const chosen = answers[chosenIndex];
    const isCorrect = chosen?.correct === true;

    if (isCorrect) {
      state.correct++;
      state.score += (q.points || 10);
      scoreVal.textContent = state.score;
    } else {
      state.wrong++;
    }

    const allBtns = answersEl.querySelectorAll('.qr-answer');
    const showCorrect = (state.quiz.displayOptions || []).includes('show-correct');

    allBtns.forEach((btn, i) => {
      btn.disabled = true;
      const ans = answers[i];
      const check = btn.querySelector('.icon-check');
      const xmark = btn.querySelector('.icon-x');
      if (i === chosenIndex && isCorrect) {
        btn.classList.add('qr-answer--correct');
        if (check) check.style.display = '';
      } else if (i === chosenIndex && !isCorrect) {
        btn.classList.add('qr-answer--wrong');
        if (xmark) xmark.style.display = '';
      } else if (ans.correct && showCorrect) {
        btn.classList.add('qr-answer--correct');
        if (check) check.style.display = '';
      } else {
        btn.classList.add('qr-answer--dimmed');
      }
    });

    const fbIcon = document.getElementById('qr-feedback-icon');
    const fbText = document.getElementById('qr-feedback-text');

    if (isCorrect) {
      feedback.className = 'qr-feedback qr-feedback--correct';
      if (fbIcon) fbIcon.innerHTML = `<img src="img/correct1.png" width="14" height="14" style="filter:invert(1)">`;
      if (fbText) fbText.innerHTML = `${t('runner_correct_prefix')}${q.points || 10}${t('runner_correct_suffix')}`;
    } else {
      feedback.className = 'qr-feedback qr-feedback--wrong';
      if (fbIcon) fbIcon.innerHTML = `<img src="img/incorrect.png" width="14" height="14" style="filter:invert(1)">`;
      const correctAnswers = answers.filter(a => a.correct).map(a => a.text).join(', ');
      if (fbText) fbText.innerHTML = showCorrect
        ? `${t('incorrect')} <strong style="color:#fff">${correctAnswers}</strong>`
        : t('incorrect');
    }

    requestAnimationFrame(() => feedback.classList.add('is-visible'));
    nextBtn.style.display = '';
    const remaining = state.questions.slice(state.index + 1).some((_, i) => !state.answeredIndices.has(state.index + 1 + i));
    const hasNext = remaining || state.skippedIndices.some(i => !state.answeredIndices.has(i));
    nextBtn.textContent = hasNext ? t('runner_next') : t('runner_see_results');
    nextBtn.innerHTML += ` <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  function timeoutQuestion() {
    if (state.answered) return;
    state.answered = true;
    state.wrong++;
    state.answeredIndices.add(state.index);
    const skipBtn = document.getElementById('qr-skip-btn');
    if (skipBtn) skipBtn.style.display = 'none';

    const q = state.questions[state.index];
    const answers = q.answers.length > 0 ? q.answers : [];
    const allBtns = answersEl.querySelectorAll('.qr-answer');
    allBtns.forEach((btn, i) => {
      btn.disabled = true;
      if (answers[i]?.correct) {
        btn.classList.add('qr-answer--correct');
        const check = btn.querySelector('.icon-check');
        if (check) check.style.display = 'block';
      } else {
        btn.classList.add('qr-answer--dimmed');
      }
    });

    feedback.className = 'qr-feedback qr-feedback--wrong';
    feedback.innerHTML = `<span class="qr-feedback__icon" id="qr-feedback-icon"><img src="img/timer.png" width="16" height="16" style="filter:invert(1)"></span><span id="qr-feedback-text">${t('times_up')}</span>`;
    requestAnimationFrame(() => feedback.classList.add('is-visible'));
    nextBtn.style.display = '';
    const remaining = state.questions.slice(state.index + 1).some((_, i) => !state.answeredIndices.has(state.index + 1 + i));
    const hasNext = remaining || state.skippedIndices.some(i => !state.answeredIndices.has(i));
    nextBtn.textContent = hasNext ? t('runner_next') : t('runner_see_results');
    nextBtn.innerHTML += ` <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  function skipQuestion() {
    if (state.answered || state.isRetry) return;
    state.answered = true;
    clearTimer();
    state.skipped++;
    state.skippedIndices.push(state.index);
    advance();
  }

  function nextQuestion() {
    state.answeredIndices.add(state.index);
    advance();
  }

  function advance() {
    const skippedSet = new Set(state.skippedIndices);
    for (let i = state.index + 1; i < state.questions.length; i++) {
      if (!state.answeredIndices.has(i) && !skippedSet.has(i)) {
        state.index = i;
        state.isRetry = false;
        loadQuestion();
        return;
      }
    }
    while (state.skippedIndices.length > 0) {
      const next = state.skippedIndices.shift();
      if (!state.answeredIndices.has(next)) {
        state.index = next;
        state.isRetry = true;
        state.skipped--;
        loadQuestion();
        return;
      }
    }
    showResults();
  }

  function showResults() {
    clearTimer();
    feedback.className = 'qr-feedback';
    document.getElementById('qr-body').style.display = 'none';
    document.getElementById('qr-question-wrap').style.display = 'none';
    document.querySelector('.qr-footer').style.display = 'none';
    resultsEl.style.display = '';

    const total = state.questions.length;
    const pct = total > 0 ? Math.round((state.correct / total) * 100) : 0;
    const elapsed = Math.round((Date.now() - state.startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    const passScore = state.quiz.passScore ?? 60;
    const passed = pct >= passScore;

    document.getElementById('qr-results-title').textContent = pct === 100 ? t('perfect_score') : passed ? t('quiz_passed') : t('keep_practicing');
    document.getElementById('qr-results-sub').textContent = passed
      ? `${t('scored_above')} ${pct}% — ${t('above_pass')} ${passScore}% ${t('pass_mark')}`
      : `${t('scored_below')} ${pct}% — ${t('below_pass')} ${passScore}%. ${t('youve_got_this')}`;

    document.getElementById('qr-results-stats').innerHTML = `
      <div class="qr-results__stat"><span class="qr-results__stat-val">${state.score}</span><span class="qr-results__stat-label">${t('score')}</span></div>
      <div class="qr-results__stat"><span class="qr-results__stat-val">${state.correct}/${total}</span><span class="qr-results__stat-label">${t('correct')}</span></div>
      <div class="qr-results__stat"><span class="qr-results__stat-val">${pct}%</span><span class="qr-results__stat-label">${t('accuracy')}</span></div>
      <div class="qr-results__stat"><span class="qr-results__stat-val">${timeStr}</span><span class="qr-results__stat-label">${t('time')}</span></div>
    `;

    addHistoryEntry({
      id: state.quiz.id || '', name: state.quiz.name || 'Quiz',
      subject: state.quiz.subject || '', score: state.score,
      correct: state.correct, total: state.questions.length,
      pct, passed, elapsed, playedAt: Date.now()
    });

    fillEl.style.width = '100%';
  }

  function startTimer(seconds) {
    clearTimer();
    state.timeLeft = seconds;
    timerVal.textContent = seconds;
    timerEl.className = 'qr-timer';
    state.timer = setInterval(() => {
      state.timeLeft--;
      timerVal.textContent = state.timeLeft;
      if (state.timeLeft <= 5) timerEl.className = 'qr-timer is-danger';
      else if (state.timeLeft <= 10) timerEl.className = 'qr-timer is-warning';
      if (state.timeLeft <= 0) { clearTimer(); timeoutQuestion(); }
    }, 1000);
  }

  function clearTimer() {
    if (state.timer) { clearInterval(state.timer); state.timer = null; }
    timerEl.className = 'qr-timer';
  }

  nextBtn?.addEventListener('click', nextQuestion);
  document.getElementById('qr-results-retry')?.addEventListener('click', () => { open(state.quiz); });
  document.getElementById('qr-results-close')?.addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (!overlay?.classList.contains('is-open')) return;
    if (e.key === 'Escape') { clearTimer(); close(); return; }
    if (state.answered && e.key === 'Enter') { nextQuestion(); return; }
    const num = parseInt(e.key);
    if (!isNaN(num) && num >= 1 && num <= 6 && !state.answered) pickAnswer(num - 1);
  });

  window.blitziqRunQuiz = open;

  function renderHistory() {
    const list = document.getElementById('history-list');
    const empty = document.getElementById('history-empty');
    if (!list) return;
    const h = getHistory();
    list.innerHTML = '';
    if (!h.length) {
      empty.style.display = '';
      list.style.display = 'none';
      return;
    }
    empty.style.display = 'none';
    list.style.display = '';
    h.forEach(entry => {
      const mins = Math.floor(entry.elapsed / 60);
      const secs = entry.elapsed % 60;
      const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
      const date = new Date(entry.playedAt);
      const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const card = document.createElement('div');
      card.className = 'history-card';
      card.innerHTML = `
        <div class="history-card__icon"><img src="img/quizzes.png" alt=""></div>
        <div class="history-card__body">
          <div class="history-card__name">${entry.name}</div>
          <div class="history-card__meta">${dateStr} · ${entry.correct}/${entry.total} ${t('correct')} · ${timeStr}</div>
        </div>
        <div class="history-card__score">${entry.pct}%</div>
      `;
      list.appendChild(card);
    });
  }

  window.renderHistory = renderHistory;

  document.getElementById('btn-history')?.addEventListener('click', e => {
    e.preventDefault();
    renderHistory();
    document.getElementById('history-overlay').classList.add('is-open');
  });
  document.getElementById('history-close')?.addEventListener('click', () => {
    document.getElementById('history-overlay').classList.remove('is-open');
  });
  document.getElementById('history-overlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('history-overlay')) {
      document.getElementById('history-overlay').classList.remove('is-open');
    }
  });
})();

(function () {
  'use strict';

  const MOBILE_BP = 768;
  function isMobile() { return window.innerWidth <= MOBILE_BP; }

  function injectBottomNav() {
    if (document.getElementById('bottom-nav')) return;

    const nav = document.createElement('nav');
    nav.id = 'bottom-nav';
    nav.className = 'bottom-nav';
    nav.setAttribute('aria-label', 'Main navigation');
    nav.innerHTML = `
      <button class="bottom-nav__item" data-section="home" aria-label="Home">
        <img src="img/home.png" width="22" height="22" alt="">
        <span data-i18n="home">Home</span>
      </button>
      <button class="bottom-nav__item" data-section="quizzes" aria-label="My Quizzes">
        <img src="img/quizzes.png" width="22" height="22" alt="">
        <span data-i18n="my_quizzes">My quizzes</span>
      </button>
      <button class="bottom-nav__fab" id="bottom-new-quiz" aria-label="New Quiz">
        <img src="img/add.png" width="18" height="18" alt="">
        <span data-i18n="new_quiz">New</span>
      </button>
      <button class="bottom-nav__item" data-section="discover" aria-label="Discover">
        <img src="img/discover.png" width="22" height="22" alt="">
        <span data-i18n="discover">Discover</span>
      </button>
      <button class="bottom-nav__item" id="bottom-sidebar-btn" aria-label="Collections">
        <img src="img/sidebar.png" width="22" height="22" alt="">
        <span data-i18n="my_collections">More</span>
      </button>
    `;
    document.body.appendChild(nav);

    function syncActiveTab(sectionId) {
      nav.querySelectorAll('.bottom-nav__item[data-section]').forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.section === sectionId);
      });
    }

    nav.querySelectorAll('.bottom-nav__item[data-section]').forEach(btn => {
      btn.addEventListener('click', () => {
        const desktopLink = document.querySelector(`.navbar-links a[data-section="${btn.dataset.section}"]`);
        if (desktopLink) desktopLink.click();
        syncActiveTab(btn.dataset.section);
      });
    });

    document.getElementById('bottom-new-quiz')?.addEventListener('click', () => {
      document.getElementById('btn-new-quiz')?.click();
    });
    document.getElementById('bottom-sidebar-btn')?.addEventListener('click', toggleSidebar);

    document.querySelectorAll('.navbar-links a[data-section]').forEach(link => {
      link.addEventListener('click', () => syncActiveTab(link.dataset.section));
    });

    const observer = new MutationObserver(() => {
      const active = document.querySelector('.page-section.is-active');
      if (active) syncActiveTab(active.id.replace('section-', ''));
    });

    const main = document.querySelector('.page-main');
    if (main) observer.observe(main, { childList: true, subtree: false, attributes: true, attributeFilter: ['class'] });
    document.querySelectorAll('.page-section').forEach(s => {
      observer.observe(s, { attributes: true, attributeFilter: ['class'] });
    });

    if (typeof window.applyTranslations === 'function') window.applyTranslations();

    const initialActive = document.querySelector('.page-section.is-active');
    syncActiveTab(initialActive ? initialActive.id.replace('section-', '') : 'home');
  }

  function injectSidebarBackdrop() {
    if (document.getElementById('sidebar-backdrop')) return;
    const backdrop = document.createElement('div');
    backdrop.id = 'sidebar-backdrop';
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', closeSidebar);
  }

  function openSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const hamburger = document.getElementById('navbar-hamburger');
    if (!sidebar) return;
    sidebar.classList.add('is-mobile-open');
    backdrop?.classList.add('is-visible');
    hamburger?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const hamburger = document.getElementById('navbar-hamburger');
    if (!sidebar) return;
    sidebar.classList.remove('is-mobile-open');
    backdrop?.classList.remove('is-visible');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    sidebar.classList.contains('is-mobile-open') ? closeSidebar() : openSidebar();
  }

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSidebar(); });

  document.querySelectorAll('.navbar-links a[data-section]').forEach(link => {
    link.addEventListener('click', () => { if (isMobile()) closeSidebar(); });
  });

  document.addEventListener('click', e => {
    if (!isMobile()) return;
    const sidebarItem = e.target.closest('.sidebar-item:not(#settings-btn), .sidebar-folder, .sidebar-folder-quiz-item, .sidebar-fav-list a');
    if (sidebarItem) {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar?.classList.contains('is-mobile-open')) setTimeout(closeSidebar, 80);
    }
  });

  function init() {
    if (!isMobile()) return;
    injectBottomNav();
    injectSidebarBackdrop();
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', e => {
        if (isMobile()) { e.stopPropagation(); closeSidebar(); }
      });
    }
  }

  let lastMobile = isMobile();
  window.addEventListener('resize', () => {
    const mobile = isMobile();
    if (mobile && !lastMobile) { init(); }
    else if (!mobile && lastMobile) { closeSidebar(); }
    lastMobile = mobile;
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.blitziqMobile = { openSidebar, closeSidebar, toggleSidebar };
})();