(function () {
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

  if (localStorage.getItem('blitziq-sidebar') === '1') {
    document.body.classList.add('sidebar-collapsed');
  }

  const sidebarToggle = document.getElementById('sidebar-toggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      const collapsed = document.body.classList.toggle('sidebar-collapsed');
      localStorage.setItem('blitziq-sidebar', collapsed ? '1' : '0');
    });
  }

  const navLinks = document.querySelectorAll('.navbar-links a[data-section]');
  const sections = document.querySelectorAll('.page-section');

  function switchSection(sectionId) {
    sections.forEach(s => s.classList.remove('is-active'));
    navLinks.forEach(l => l.classList.remove('active'));

    const target = document.getElementById('section-' + sectionId);
    if (target) target.classList.add('is-active');

    const link = document.querySelector(`.navbar-links a[data-section="${sectionId}"]`);
    if (link) link.classList.add('active');

    const hash = '#' + sectionId;
    history.replaceState(null, '', hash);
  }

  navLinks.forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      switchSection(a.dataset.section);
    });
  });

  const initialHash = location.hash.replace('#', '');
  if (initialHash && document.getElementById('section-' + initialHash)) {
    switchSection(initialHash);
  }

  const MAX_FOLDERS = 6;
  const STORAGE_KEY = 'blitziq-folders';
  const COLORS = ['#a78bfa', '#f472b6', '#34d399', '#60a5fa', '#fb923c', '#facc15'];
  let dragSrcIndex = -1;

  function getFolders() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  }

  function saveFolders(f) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(f));
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function getNewFolderBtn() {
    return document.querySelector('.sidebar-item--muted');
  }

  function updateNewFolderBtn() {
    const btn = getNewFolderBtn();
    if (!btn) return;
    btn.style.display = getFolders().length >= MAX_FOLDERS ? 'none' : '';
  }

  function renderFolders() {
    const folders   = getFolders();
    const container = document.querySelector('.sidebar-folders');
    if (!container) return;

    container.innerHTML = '';
    folders.forEach((folder, index) => container.appendChild(buildFolderRow(folder, index)));

    if (folders.length === 0) {
      const allQuizzes = document.querySelector('.sidebar-item--active');
      if (allQuizzes) allQuizzes.classList.remove('is-expanded');
    }

    updateFolderVisibility();
    updateNewFolderBtn();
  }

  function buildFolderRow(folder, index) {
    const a = document.createElement('a');
    a.href = '#';
    a.className = 'sidebar-folder';
    a.dataset.index = index;
    a.draggable = true;
    a.innerHTML = `
      <span class="sidebar-folder-dot" style="background:${COLORS[index % COLORS.length]}"></span>
      <span class="sidebar-folder-name">${escapeHtml(folder.name)}</span>
      <span class="sidebar-folder-count">${folder.count}</span>
      <button class="sidebar-folder-delete" data-index="${index}" aria-label="Delete folder" title="Delete">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      </button>
    `;

    a.querySelector('.sidebar-folder-delete').addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      showDeleteConfirm(a, index);
    });

    a.addEventListener('dragstart', e => {
      dragSrcIndex = index;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', index);
      requestAnimationFrame(() => a.classList.add('is-dragging'));
    });

    a.addEventListener('dragend', () => {
      a.classList.remove('is-dragging');
      document.querySelectorAll('.sidebar-folder').forEach(el =>
        el.classList.remove('drag-over-top', 'drag-over-bottom')
      );
    });

    a.addEventListener('dragover', e => {
      e.preventDefault();
      const thisIndex = parseInt(a.dataset.index);
      if (thisIndex === dragSrcIndex) return;
      e.dataTransfer.dropEffect = 'move';
      const rect = a.getBoundingClientRect();
      const mid  = rect.top + rect.height / 2;
      document.querySelectorAll('.sidebar-folder:not(.sidebar-folder-new-row)').forEach(el =>
        el.classList.remove('drag-over-top', 'drag-over-bottom')
      );
      a.classList.add(e.clientY < mid ? 'drag-over-top' : 'drag-over-bottom');
    });

    a.addEventListener('dragleave', e => {
      if (!a.contains(e.relatedTarget)) {
        a.classList.remove('drag-over-top', 'drag-over-bottom');
      }
    });

    a.addEventListener('drop', e => {
      e.preventDefault();
      const targetIndex  = parseInt(a.dataset.index);
      const insertBefore = a.classList.contains('drag-over-top');
      a.classList.remove('drag-over-top', 'drag-over-bottom');
      if (dragSrcIndex === targetIndex) return;

      const folders = getFolders();
      const [dragged] = folders.splice(dragSrcIndex, 1);
      let dest = targetIndex > dragSrcIndex
        ? (insertBefore ? targetIndex - 1 : targetIndex)
        : (insertBefore ? targetIndex : targetIndex + 1);
      folders.splice(dest, 0, dragged);
      saveFolders(folders);
      renderFolders();

      const allQuizzesBtn = document.querySelector('.sidebar-item--active');
      if (allQuizzesBtn) allQuizzesBtn.classList.add('is-expanded');
      updateFolderVisibility();
    });

    return a;
  }

  function showDeleteConfirm(row, index) {
    if (row.querySelector('.sidebar-folder-confirm')) return;

    row.classList.add('is-confirming');

    const confirm = document.createElement('div');
    confirm.className = 'sidebar-folder-confirm';
    confirm.innerHTML = `
      <span class="sidebar-folder-confirm-text">Delete?</span>
      <button class="sidebar-folder-confirm-yes">Yes</button>
      <button class="sidebar-folder-confirm-no">No</button>
    `;

    row.appendChild(confirm);
    requestAnimationFrame(() => confirm.classList.add('is-visible'));

    confirm.querySelector('.sidebar-folder-confirm-yes').addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      row.classList.add('is-removing');
      setTimeout(() => {
        const folders = getFolders();
        folders.splice(index, 1);
        saveFolders(folders);
        renderFolders();
      }, 220);
    });

    confirm.querySelector('.sidebar-folder-confirm-no').addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      confirm.classList.remove('is-visible');
      row.classList.remove('is-confirming');
      setTimeout(() => confirm.remove(), 180);
    });

    function outsideClick(e) {
      if (!row.contains(e.target)) {
        confirm.classList.remove('is-visible');
        row.classList.remove('is-confirming');
        setTimeout(() => confirm.remove(), 180);
        document.removeEventListener('click', outsideClick);
      }
    }
    setTimeout(() => document.addEventListener('click', outsideClick), 0);
  }

  function showInlineNewFolder() {
    if (document.body.classList.contains('sidebar-collapsed')) return;
    const container = document.querySelector('.sidebar-folders');
    if (!container) return;
    if (container.querySelector('.sidebar-folder-new-row')) return;

    const folders    = getFolders();
    const colorIndex = folders.length % COLORS.length;

    const row = document.createElement('div');
    row.className = 'sidebar-folder sidebar-folder-new-row';
    row.innerHTML = `
      <span class="sidebar-folder-dot" style="background:${COLORS[colorIndex]}"></span>
      <input
        class="sidebar-folder-inline-input"
        type="text"
        placeholder="Folder name"
        maxlength="40"
        autocomplete="off"
      >
      <button class="sidebar-folder-inline-cancel" aria-label="Cancel">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      </button>
    `;

    container.appendChild(row);
    requestAnimationFrame(() => row.classList.add('is-visible'));

    const allQuizzesBtn = document.querySelector('.sidebar-item--active');
    if (allQuizzesBtn && !allQuizzesBtn.classList.contains('is-expanded')) {
      allQuizzesBtn.classList.add('is-expanded');
      updateFolderVisibility();
    }

    const input = row.querySelector('.sidebar-folder-inline-input');
    input.focus();

    function commit() {
      const name = input.value.trim();
      if (!name) { cancelFolder(); return; }
      const folders = getFolders();
      if (folders.length >= MAX_FOLDERS) { cancelFolder(); return; }
      row.classList.add('is-removing');
      folders.push({ name, count: 0 });
      saveFolders(folders);
      row.classList.remove('is-visible');
      setTimeout(() => renderFolders(), 200);
    }

    function cancelFolder() {
      row.classList.remove('is-visible');
      row.classList.add('is-removing');
      setTimeout(() => row.remove(), 220);
    }

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter')  { e.preventDefault(); commit(); }
      if (e.key === 'Escape') { e.preventDefault(); cancelFolder(); }
    });

    input.addEventListener('blur', () => {
      setTimeout(() => {
        if (!row.classList.contains('is-removing') &&
            document.activeElement !== row.querySelector('.sidebar-folder-inline-cancel')) {
          commit();
        }
      }, 120);
    });

    row.querySelector('.sidebar-folder-inline-cancel').addEventListener('mousedown', e => {
      e.preventDefault();
    });
    row.querySelector('.sidebar-folder-inline-cancel').addEventListener('click', e => {
      e.preventDefault();
      cancelFolder();
    });
  }

  function updateFolderVisibility() {
    const folders       = getFolders();
    const container     = document.querySelector('.sidebar-folders');
    const allQuizzesBtn = document.querySelector('.sidebar-item--active');
    if (!container || !allQuizzesBtn) return;

    const isExpanded = allQuizzesBtn.classList.contains('is-expanded');
    const hasNewRow  = !!container.querySelector('.sidebar-folder-new-row');
    container.style.display = (isExpanded && (folders.length > 0 || hasNewRow)) ? 'block' : 'none';
  }

  const newFolderBtn = getNewFolderBtn();
  if (newFolderBtn) {
    newFolderBtn.addEventListener('click', e => {
      e.preventDefault();
      if (document.body.classList.contains('sidebar-collapsed')) {
        document.body.classList.remove('sidebar-collapsed');
        localStorage.setItem('blitziq-sidebar', '0');
      }
      showInlineNewFolder();
    });
  }

  const allQuizzesBtn = document.querySelector('.sidebar-item--active');
  if (allQuizzesBtn) {
    allQuizzesBtn.addEventListener('click', e => {
      e.preventDefault();
      if (document.body.classList.contains('sidebar-collapsed')) {
        document.body.classList.remove('sidebar-collapsed');
        localStorage.setItem('blitziq-sidebar', '0');
      }
      const folders = getFolders();
      if (folders.length === 0) return;
      allQuizzesBtn.classList.toggle('is-expanded');
      updateFolderVisibility();
    });

    const chevron = document.createElement('span');
    chevron.className = 'sidebar-item-chevron';
    chevron.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    allQuizzesBtn.appendChild(chevron);
  }

  renderFolders();
  const foldersContainer = document.querySelector('.sidebar-folders');
  if (foldersContainer) foldersContainer.style.display = 'none';
})();

(function () {
  'use strict';

  const LETTERS      = ['A', 'B', 'C', 'D', 'E', 'F'];
  const PANEL_TITLES = ['General information', 'Quiz structure', 'Settings & confirmation'];
  const TOTAL        = 3;

  let currentPanel = 1;
  let answerCount  = 4;
  let visibility   = 'public';

  const overlay       = document.getElementById('quiz-overlay');
  const btnNewQuiz    = document.getElementById('btn-new-quiz');
  const btnClose      = document.getElementById('qm-close');
  const btnCancel     = document.getElementById('qm-cancel');
  const btnNext       = document.getElementById('qm-next');
  const btnBack       = document.getElementById('qm-back');
  const progressFill  = document.getElementById('qm-progress');
  const modalTitle    = document.getElementById('qm-title');
  const stepLabel     = document.getElementById('qm-step-label');
  const answerPreview = document.getElementById('qm-answers-preview');
  const summaryBox    = document.getElementById('qm-summary');

  function openModal() {
    overlay.classList.add('is-open');
    overlay.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('qm-name')?.focus(), 270);
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(resetModal, 280);
  }

  function resetModal() {
    answerCount = 4;
    visibility  = 'public';

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

    ['qm-subject','qm-lang','qm-order','qm-aorder'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.selectedIndex = 0;
    });

    document.querySelectorAll('.qm-vis-btn').forEach(b =>
      b.classList.toggle('is-active', b.dataset.vis === 'public'));

    document.querySelectorAll('.qm-toggle').forEach(t =>
      t.classList.toggle('is-active', ['show-score','show-correct'].includes(t.dataset.key)));

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
      if (i === currentPanel)    dot.classList.add('is-active');
      else if (i < currentPanel) dot.classList.add('is-done');
    }

    progressFill.style.width = ((currentPanel / TOTAL) * 100) + '%';
    modalTitle.textContent   = PANEL_TITLES[currentPanel - 1];
    stepLabel.textContent    = `Step ${currentPanel} of ${TOTAL}`;
    btnBack.style.display    = currentPanel > 1 ? '' : 'none';

    if (currentPanel === TOTAL) {
      buildSummary();
      btnNext.innerHTML = `Create quiz <img src="img/arrow-right1.png" width="14" height="14" style="filter:invert(1)">`;
    } else {
      btnNext.innerHTML = `Continue <img src="img/arrow-r.png" width="12" height="12" style="filter:invert(1)">`;
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
        ${i === 0 ? `<span class="qm-answer-chip__badge">
          <img src="img/correct.png" width="10" height="10" alt="">
          correct</span>` : ''}
      `;
      answerPreview.appendChild(chip);
    }
  }

  function buildSummary() {
    const v = id => document.getElementById(id)?.value?.trim() || '-';

    const visMap  = { public: 'Public', private: 'Private', draft: 'Draft' };

    const rows = [
      ['Name',             v('qm-name') || '-'],
      ['Subject',          v('qm-subject') || '-'],
      ['Questions',        v('qm-count')],
      ['Time / question',  v('qm-time') + ' sec.'],
      ['Answer choices',   answerCount],
      ['Visibility',       visMap[visibility]],
      ['Attempts',         v('qm-attempts')],
      ['Pass score',       v('qm-pass') + ' %'],
      ['Points / correct', v('qm-pts')],
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

    const payload = {
      name,
      description:     document.getElementById('qm-desc')?.value.trim()        || '',
      subject:         document.getElementById('qm-subject')?.value            || '',
      language:        document.getElementById('qm-lang')?.value               || '',
      visibility,
      questionCount:   parseInt(document.getElementById('qm-count')?.value)    || 10,
      timePerQuestion: parseInt(document.getElementById('qm-time')?.value)     || 30,
      answerCount,
      questionOrder:   document.getElementById('qm-order')?.value              || 'fixed',
      answerOrder:     document.getElementById('qm-aorder')?.value             || 'fixed',
      attempts:        parseInt(document.getElementById('qm-attempts')?.value) || 1,
      passScore:       parseInt(document.getElementById('qm-pass')?.value)     || 60,
      pointsPerAnswer: parseInt(document.getElementById('qm-pts')?.value)      || 10,
      displayOptions:  [...document.querySelectorAll('.qm-toggle.is-active')].map(t => t.dataset.key),
    };

    btnNext.innerHTML = 'Creating...';
    btnNext.disabled  = true;

    setTimeout(() => {
      btnNext.disabled = false;

      if (typeof window.blitziqCreateDraft === 'function') {
        window.blitziqCreateDraft(payload);
      }

      if (typeof window.blitziqSwitchSection === 'function') {
        window.blitziqSwitchSection('quizzes');
      }

      closeModal();
    }, 600);
  }

  btnNewQuiz?.addEventListener('click', openModal);
  btnClose?.addEventListener('click', closeModal);
  btnCancel?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay?.classList.contains('is-open')) closeModal();
  });

  btnNext?.addEventListener('click', () => {
    currentPanel === TOTAL ? submitQuiz() : goToPanel(currentPanel + 1);
  });
  btnBack?.addEventListener('click', () => goToPanel(currentPanel - 1));

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

(function () {
  const track   = document.getElementById('cat-track');
  const prevBtn = document.getElementById('cat-prev');
  const nextBtn = document.getElementById('cat-next');
  if (!track || !prevBtn || !nextBtn) return;

  const VISIBLE  = 4;
  const cards    = track.querySelectorAll('.cat-card');
  const total    = cards.length;
  const maxIndex = total - VISIBLE;
  let index = 0;
  let timer = null;

  function getCardWidth() {
    const card  = cards[0];
    const style = getComputedStyle(track);
    const gap   = parseFloat(style.gap) || 16;
    return card.getBoundingClientRect().width + gap;
  }

  function goTo(i) {
    index = Math.max(0, Math.min(i, maxIndex));
    track.style.transform    = `translateX(-${index * getCardWidth()}px)`;
    prevBtn.style.opacity    = index === 0 ? '0.4' : '1';
    nextBtn.style.opacity    = index >= maxIndex ? '0.4' : '1';
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
})();

(function () {
  'use strict';

  const DAILY_QUIZ = {
    title: 'Organic Chemistry – Functional Groups',
    meta:  'Chemistry · 10 questions · 30 sec / question',
  };

  const TRENDING = [
    { name: 'Animal Cell – Structure & Functions', meta: 'Biology · 25 questions', badge: 'hot',     icon: 'img/science.png',   featured: true },
    { name: 'Functions & Limits – Baccalaureate',  meta: 'Mathematics · 20 questions', badge: 'new', icon: 'img/mathematics.png' },
    { name: 'World Capitals',                       meta: 'Geography · 30 questions', badge: 'classic', icon: 'img/geography.png' },
    { name: 'Sorting Algorithms',                   meta: 'Computer Science · 15 questions', badge: '', icon: 'img/computer.png' },
  ];

  const RECOMMENDED = [
    { name: 'Eminescu\'s Poetry',          meta: 'Literature · 10 questions',        icon: 'img/literature.png' },
    { name: 'Periodic Table – Elements',   meta: 'Chemistry · 18 questions',         icon: 'img/science.png' },
    { name: 'World War II – Key Events',   meta: 'History · 22 questions',           icon: 'img/history1.png' },
    { name: 'Cognitive Psychology Basics', meta: 'Psychology · 12 questions',        icon: 'img/psychology.png' },
    { name: 'French Vocabulary – A2',      meta: 'Language & Literature · 20 questions', icon: 'img/public.png' },
    { name: 'Newton\'s Laws of Motion',    meta: 'Physics · 16 questions',           icon: 'img/science.png' },
  ];

  const BADGE_LABELS = { hot: 'Hot', new: 'New', classic: 'Classic' };

  function init() {
    renderDaily();
    renderGrid('disc-trending',     TRENDING,     true);
    renderGrid('disc-recommended',  RECOMMENDED,  false);
    initFilters();
  }

  function renderDaily() {
    const titleEl = document.getElementById('disc-daily-title');
    const metaEl  = document.getElementById('disc-daily-meta');
    if (titleEl) titleEl.textContent = DAILY_QUIZ.title;
    if (metaEl)  metaEl.textContent  = DAILY_QUIZ.meta;
  }

  function buildCard(quiz, isTrending) {
    const card = document.createElement('div');
    card.className = 'disc-card' + (isTrending && quiz.featured ? ' disc-card--featured' : '');

    const iconWrap = document.createElement('div');
    iconWrap.className = 'disc-card__icon-wrap';
    const img = document.createElement('img');
    img.src = quiz.icon;
    img.alt = '';
    iconWrap.appendChild(img);

    const body = document.createElement('div');
    body.className = 'disc-card__body';

    const name = document.createElement('p');
    name.className = 'disc-card__name';
    name.textContent = quiz.name;

    const meta = document.createElement('p');
    meta.className = 'disc-card__meta';
    meta.textContent = quiz.meta;

    body.appendChild(name);
    body.appendChild(meta);

    if (quiz.badge && BADGE_LABELS[quiz.badge]) {
      const footer = document.createElement('div');
      footer.className = 'disc-card__footer';
      const badge = document.createElement('span');
      badge.className = `disc-card__badge disc-card__badge--${quiz.badge}`;
      badge.textContent = BADGE_LABELS[quiz.badge];
      footer.appendChild(badge);
      body.appendChild(footer);
    }

    card.appendChild(iconWrap);
    card.appendChild(body);

    return card;
  }

  function renderGrid(containerId, data, isTrending) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (data.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'disc-empty';
      empty.textContent = 'No quizzes found for this category.';
      container.appendChild(empty);
      return;
    }

    data.forEach(quiz => container.appendChild(buildCard(quiz, isTrending)));
  }

  function initFilters() {
    const filters = document.querySelectorAll('.disc-filter');
    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        filters.forEach(f => f.classList.remove('is-active'));
        btn.classList.add('is-active');
        const cat = btn.dataset.cat;
        filterGrids(cat);
      });
    });
  }

  function filterGrids(cat) {
    const filteredTrending     = cat ? TRENDING.filter(q => q.meta.toLowerCase().includes(cat.toLowerCase())) : TRENDING;
    const filteredRecommended  = cat ? RECOMMENDED.filter(q => q.meta.toLowerCase().includes(cat.toLowerCase())) : RECOMMENDED;

    renderGrid('disc-trending',    filteredTrending,    true);
    renderGrid('disc-recommended', filteredRecommended, false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

(function () {
  'use strict';

  let quizzes       = JSON.parse(localStorage.getItem('blitziq-quizzes') || '[]');
  let editorQuizId  = null;
  let currentQIndex = 0;

  function saveQuizzes() {
    localStorage.setItem('blitziq-quizzes', JSON.stringify(quizzes));
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
  }

  function getQuiz(id) {
    return quizzes.find(q => q.id === id);
  }

  window.blitziqCreateDraft = function (payload) {
    const count = parseInt(payload.questionCount) || 10;
    const questions = Array.from({ length: count }, (_, i) => ({
      index:    i,
      text:     '',
      answers:  Array.from({ length: payload.answerCount }, () => ({ text: '', correct: false })),
      type:     'single',
      time:     payload.timePerQuestion,
      points:   payload.pointsPerAnswer,
    }));
    if (questions.length > 0) {
      questions[0].answers[0].correct = true;
    }

    const quiz = {
      id:            Date.now().toString(),
      name:          payload.name,
      description:   payload.description || '',
      subject:       payload.subject || '',
      language:      payload.language || '',
      visibility:    payload.visibility || 'public',
      answerCount:   payload.answerCount,
      timePerQ:      payload.timePerQuestion,
      questionOrder: payload.questionOrder,
      answerOrder:   payload.answerOrder,
      attempts:      payload.attempts,
      passScore:     payload.passScore,
      points:        payload.pointsPerAnswer,
      displayOptions: payload.displayOptions || [],
      status:        'draft',
      createdAt:     Date.now(),
      questions,
    };

    quizzes.unshift(quiz);
    saveQuizzes();
    renderMyQuizzes();
    return quiz;
  };

  function renderMyQuizzes() {
    const section = document.getElementById('section-quizzes');
    if (!section) return;

    if (quizzes.length === 0) {
      section.innerHTML = `
        <div class="mq-empty">
          <div class="mq-empty__icon">
            <img src="img/quizzes.png" width="40" height="40" alt="">
          </div>
          <p class="mq-empty__title">No quizzes yet</p>
          <p class="mq-empty__sub">Click <strong>New quiz</strong> to create your first one.</p>
        </div>
      `;
      return;
    }

    section.innerHTML = `
      <div class="mq-header">
        <h2 class="mq-header__title">My quizzes</h2>
        <span class="mq-header__count">${quizzes.length} quiz${quizzes.length !== 1 ? 'zes' : ''}</span>
      </div>
      <div class="mq-grid" id="mq-grid"></div>
    `;

    const grid = document.getElementById('mq-grid');
    quizzes.forEach(quiz => grid.appendChild(buildQuizCard(quiz)));
  }

  function buildQuizCard(quiz) {
    const card = document.createElement('div');
    card.className = 'mq-card';
    card.dataset.id = quiz.id;

    const filled   = quiz.questions.filter(q => q.text.trim()).length;
    const total    = quiz.questions.length;
    const pct      = total > 0 ? Math.round((filled / total) * 100) : 0;
    const statusLabel = quiz.status === 'draft' ? 'Draft' : 'Published';

    card.innerHTML = `
      <div class="mq-card__top">
        <span class="mq-card__status mq-card__status--${quiz.status}">${statusLabel}</span>
        <button class="mq-card__delete" data-id="${quiz.id}" aria-label="Delete quiz" title="Delete">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <div class="mq-card__body">
        <h3 class="mq-card__name">${escapeHtml(quiz.name)}</h3>
        <p class="mq-card__meta">${escapeHtml(quiz.subject || 'No subject')} · ${total} questions · ${quiz.timePerQ}s</p>
      </div>
      <div class="mq-card__footer">
        <div class="mq-card__progress-wrap">
          <div class="mq-card__progress-bar">
            <div class="mq-card__progress-fill" style="width:${pct}%"></div>
          </div>
          <span class="mq-card__progress-label">${filled}/${total} filled</span>
        </div>
        <button class="mq-card__edit" data-id="${quiz.id}">
          <img src="img/edit.png" width="12" height="12" alt="" style="filter:invert(1)">
          Edit
        </button>
      </div>
    `;

    card.querySelector('.mq-card__edit').addEventListener('click', () => openEditor(quiz.id));
    card.querySelector('.mq-card__delete').addEventListener('click', e => {
      e.stopPropagation();
      deleteQuiz(quiz.id);
    });

    return card;
  }

  function deleteQuiz(id) {
    quizzes = quizzes.filter(q => q.id !== id);
    saveQuizzes();
    renderMyQuizzes();
  }

  function setNavbarEditorMode(hidden) {
    const search = document.querySelector('.navbar-search');
    const newBtn = document.getElementById('btn-new-quiz');
    const bell   = document.querySelector('.navbar-bell');
    [search, newBtn, bell].forEach(el => {
      if (!el) return;
      if (hidden) {
        el.classList.add('is-hidden');
      } else {
        el.classList.remove('is-hidden');
        el.style.display = '';
      }
    });
  }

  function openEditor(quizId) {
    editorQuizId  = quizId;
    currentQIndex = 0;
    const quiz    = getQuiz(quizId);
    if (!quiz) return;

    switchSection('quizzes');
    setNavbarEditorMode(true);

    const section = document.getElementById('section-quizzes');
    section.innerHTML = buildEditorHTML(quiz);

    attachEditorEvents(quiz);
    renderQuestionList(quiz);
    loadQuestion(quiz, 0);
  }

  function closeEditor() {
    editorQuizId = null;
    setNavbarEditorMode(false);
    renderMyQuizzes();
  }

  function buildEditorHTML(quiz) {
    return `
      <div class="qe-wrap">

        <aside class="qe-sidebar">
          <div class="qe-sidebar__header">
            <button class="qe-back" id="qe-back">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Back
            </button>
            <span class="qe-sidebar__title">${escapeHtml(quiz.name)}</span>
          </div>
          <div class="qe-q-list" id="qe-q-list"></div>
        </aside>

        <main class="qe-main">
          <div class="qe-topbar">
            <span class="qe-topbar__info" id="qe-q-label">Question 1 of ${quiz.questions.length}</span>
            <div class="qe-topbar__right">
              <button class="qe-save-btn" id="qe-save">
                <img src="img/save.png" width="14" height="14" alt="">
                Save
              </button>
              <button class="qe-publish-btn" id="qe-publish">Publish quiz</button>
            </div>
          </div>

          <div class="qe-editor" id="qe-editor">

            <div class="qe-field">
              <label class="qe-field__label">Question text</label>
              <textarea class="qe-field__input qe-field__input--textarea" id="qe-q-text"
                placeholder="Type your question here..." rows="3"></textarea>
            </div>

            <div class="qe-meta-row">
              <div class="qe-field qe-field--small">
                <label class="qe-field__label">Time (sec)</label>
                <input class="qe-field__input" id="qe-q-time" type="number" min="5" max="300">
              </div>
              <div class="qe-field qe-field--small">
                <label class="qe-field__label">Points</label>
                <input class="qe-field__input" id="qe-q-pts" type="number" min="1">
              </div>
              <div class="qe-field qe-field--small">
                <label class="qe-field__label">Type</label>
                <div class="qe-field__select-wrap" style="position:relative;">
                  <select class="qe-field__input" id="qe-q-type" style="padding-right:28px;cursor:pointer;appearance:none;">
                    <option value="single">Single</option>
                    <option value="multi">Multiple</option>
                    <option value="truefalse">True / False</option>
                  </select>
                  <svg style="position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:#6b7280;" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <div class="qe-divider"></div>
            <p class="qe-section-label">Answers <span class="qe-section-hint">(click the icon to mark correct)</span></p>

            <div class="qe-answers" id="qe-answers"></div>

            <div class="qe-nav">
              <button class="qe-nav-btn" id="qe-prev">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Previous
              </button>
              <button class="qe-nav-btn qe-nav-btn--primary" id="qe-next-q">
                Next
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 2l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>

          </div>
        </main>

      </div>
    `;
  }

  function attachEditorEvents(quiz) {
    document.getElementById('qe-back')?.addEventListener('click', () => {
      saveCurrentQuestion(quiz);
      closeEditor();
    });

    document.getElementById('qe-save')?.addEventListener('click', () => {
      saveCurrentQuestion(quiz);
      showSaveToast();
    });

    document.getElementById('qe-publish')?.addEventListener('click', () => {
      saveCurrentQuestion(quiz);
      quiz.status = 'published';
      saveQuizzes();
      closeEditor();
    });

    document.getElementById('qe-prev')?.addEventListener('click', () => {
      saveCurrentQuestion(quiz);
      if (currentQIndex > 0) {
        currentQIndex--;
        renderQuestionList(quiz);
        loadQuestion(quiz, currentQIndex);
      }
    });

    document.getElementById('qe-next-q')?.addEventListener('click', () => {
      saveCurrentQuestion(quiz);
      if (currentQIndex < quiz.questions.length - 1) {
        currentQIndex++;
        renderQuestionList(quiz);
        loadQuestion(quiz, currentQIndex);
      }
    });
  }

  function renderQuestionList(quiz) {
    const list = document.getElementById('qe-q-list');
    if (!list) return;
    list.innerHTML = '';

    quiz.questions.forEach((q, i) => {
      const item = document.createElement('div');
      item.className = 'qe-q-item' + (i === currentQIndex ? ' is-active' : '');
      const filled = q.text.trim() !== '';
      item.innerHTML = `
        <span class="qe-q-item__num">${i + 1}</span>
        <span class="qe-q-item__text">${filled ? escapeHtml(q.text.substring(0, 40)) + (q.text.length > 40 ? '…' : '') : '<em>Empty</em>'}</span>
        ${filled ? '<span class="qe-q-item__dot qe-q-item__dot--filled"></span>' : '<span class="qe-q-item__dot"></span>'}
      `;
      item.addEventListener('click', () => {
        saveCurrentQuestion(quiz);
        currentQIndex = i;
        renderQuestionList(quiz);
        loadQuestion(quiz, i);
      });
      list.appendChild(item);
    });
  }

  function loadQuestion(quiz, index) {
    const q = quiz.questions[index];
    if (!q) return;

    document.getElementById('qe-q-label').textContent = `Question ${index + 1} of ${quiz.questions.length}`;
    document.getElementById('qe-q-text').value  = q.text   || '';
    document.getElementById('qe-q-time').value  = q.time   || quiz.timePerQ;
    document.getElementById('qe-q-pts').value   = q.points || quiz.points;

    const typeSelect = document.getElementById('qe-q-type');
    if (typeSelect) {
      typeSelect.value = q.type || 'single';

      const freshSelect = typeSelect.cloneNode(true);
      typeSelect.parentNode.replaceChild(freshSelect, typeSelect);
      freshSelect.value = q.type || 'single';

      freshSelect.addEventListener('change', () => {
        q.text   = document.getElementById('qe-q-text').value;
        q.time   = parseInt(document.getElementById('qe-q-time').value)  || quiz.timePerQ;
        q.points = parseInt(document.getElementById('qe-q-pts').value)   || quiz.points;
        q.type   = freshSelect.value;

        if (q.type === 'truefalse') {
          const prev = q.answers || [];
          q.answers = [
            { text: prev[0]?.text || 'True',  correct: prev[0]?.correct || false },
            { text: prev[1]?.text || 'False', correct: prev[1]?.correct || false },
          ];
          if (!q.answers[0].correct && !q.answers[1].correct) {
            q.answers[0].correct = true;
          }
        } else {
          const prev = q.answers || [];
          const target = quiz.answerCount;
          const tfDefaults = ['True', 'False'];
          const cleaned = prev.map((a, i) => ({
            text:    tfDefaults.includes(a.text) ? '' : a.text,
            correct: a.correct,
          }));
          while (cleaned.length < target) cleaned.push({ text: '', correct: false });
          q.answers = cleaned.slice(0, target);

          if (q.type === 'single' && !q.answers.some(a => a.correct)) {
            q.answers[0].correct = true;
          }
        }

        saveQuizzes();
        loadQuestion(quiz, index);
      });
    }

    const answersEl = document.getElementById('qe-answers');
    answersEl.innerHTML = '';

    const letters  = ['A', 'B', 'C', 'D', 'E', 'F'];
    const isTF     = q.type === 'truefalse';
    const answers  = isTF ? q.answers.slice(0, 2) : q.answers;

    answers.forEach((ans, ai) => {
      const row = document.createElement('div');
      row.className = 'qe-answer-row' + (ans.correct ? ' is-correct' : '');
      row.innerHTML = `
        <button class="qe-answer-correct" data-ai="${ai}" aria-label="Mark correct" title="Mark as correct">
          <img src="${ans.correct ? 'img/correct.png' : 'img/correct-empty.png'}" width="16" height="16" alt="" class="qe-correct-img">
        </button>
        <span class="qe-answer-letter">${letters[ai]}</span>
        <input class="qe-answer-input" type="text" placeholder="${isTF ? (ai === 0 ? 'True' : 'False') : 'Answer ' + letters[ai] + '...'}"
          value="${escapeHtml(ans.text)}" data-ai="${ai}">
      `;

      row.querySelector('.qe-answer-correct').addEventListener('click', () => {
        q.text   = document.getElementById('qe-q-text').value;
        q.time   = parseInt(document.getElementById('qe-q-time').value)   || quiz.timePerQ;
        q.points = parseInt(document.getElementById('qe-q-pts').value)    || quiz.points;

        if (q.type === 'single' || q.type === 'truefalse') {
          q.answers.forEach(a => a.correct = false);
        }
        q.answers[ai].correct = !q.answers[ai].correct;

        if ((q.type === 'single' || q.type === 'truefalse') && !q.answers.some(a => a.correct)) {
          q.answers[ai].correct = true;
        }

        saveQuizzes();
        loadQuestion(quiz, index);
      });

      row.querySelector('.qe-answer-input').addEventListener('input', e => {
        q.answers[ai].text = e.target.value;
      });

      answersEl.appendChild(row);
    });

    const prevBtn = document.getElementById('qe-prev');
    const nextBtn = document.getElementById('qe-next-q');
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === quiz.questions.length - 1;
  }

  function saveCurrentQuestion(quiz) {
    const q = quiz.questions[currentQIndex];
    if (!q) return;
    q.text   = document.getElementById('qe-q-text')?.value  || '';
    q.time   = parseInt(document.getElementById('qe-q-time')?.value)  || quiz.timePerQ;
    q.points = parseInt(document.getElementById('qe-q-pts')?.value)   || quiz.points;
    const typeSelect = document.getElementById('qe-q-type');
    if (typeSelect) q.type = typeSelect.value;
    saveQuizzes();
    renderQuestionList(quiz);
  }

  function showSaveToast() {
    if (typeof showToast === 'function') {
      showToast('Quiz saved!');
    }
  }

  function switchSection(id) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('is-active'));
    document.querySelectorAll('.navbar-links a[data-section]').forEach(l => l.classList.remove('active'));
    const target = document.getElementById('section-' + id);
    if (target) target.classList.add('is-active');
    const link = document.querySelector(`.navbar-links a[data-section="${id}"]`);
    if (link) link.classList.add('active');
    history.replaceState(null, '', '#' + id);
  }
  window.blitziqSwitchSection = switchSection;

  renderMyQuizzes();

})();