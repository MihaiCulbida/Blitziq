const COLORS = ['#a78bfa', '#f472b6', '#34d399', '#60a5fa', '#fb923c', '#facc15'];
const STORAGE_KEY = 'blitziq-folders';

function getFolders() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveFolders(f) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(f));
}

function getQuizzes() {
  try { return JSON.parse(localStorage.getItem('blitziq-quizzes') || '[]'); }
  catch { return []; }
}

(function () {
  const avatarBtn = document.getElementById('btn-avatar');
  const dropdown = document.getElementById('navbar-dropdown');

  if (avatarBtn && dropdown) {
    avatarBtn.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.classList.toggle('is-open');
    });
    document.addEventListener('click', () => {
      dropdown.classList.remove('is-open');
    });
  }

  const bellBtn = document.getElementById('btn-bell');
  const notifOverlay = document.getElementById('notif-overlay');
  const notifClose = document.getElementById('notif-close');
  
  function openNotif() {
    notifOverlay.classList.add('is-open');
    notifOverlay.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
  }
  
  function closeNotif() {
    notifOverlay.classList.remove('is-open');
    notifOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  
  if (bellBtn && notifOverlay) {
    bellBtn.addEventListener('click', openNotif);
    notifClose.addEventListener('click', closeNotif);
    notifOverlay.addEventListener('click', e => {
      if (e.target === notifOverlay) closeNotif();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && notifOverlay.classList.contains('is-open')) closeNotif();
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
    history.replaceState(null, '', '#' + sectionId);
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
  let dragSrcIndex = -1;

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
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
    const folders = getFolders();
    const container = document.querySelector('.sidebar-folders');
    if (!container) return;
    container.innerHTML = '';
    folders.forEach((folder, index) => {
    container.appendChild(buildFolderRow(folder, index));
  
    const subList = document.createElement('div');
    subList.className = 'sidebar-folder-quizzes';
    subList.dataset.fi = index;
  
    const allQuizzes = getQuizzes();
    allQuizzes.filter(q => q.folders && q.folders.includes(index)).forEach(q => {
      const item = document.createElement('a');
      item.href = '#';
      item.className = 'sidebar-folder-quiz-item';
      item.innerHTML = `<span class="sidebar-folder-quiz-dot"></span><span class="sidebar-label">${escapeHtml(q.name)}</span>`;
      item.addEventListener('click', e => {
        e.preventDefault();
        window.blitziqSwitchSection('quizzes');
        openEditor(q.id);
      });
      subList.appendChild(item);
    });
  
    container.appendChild(subList);
  });
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

    a.addEventListener('click', e => {
      e.preventDefault();
      const sub = document.querySelector(`.sidebar-folder-quizzes[data-fi="${index}"]`);
      if (!sub) return;
      sub.classList.toggle('is-open');
      a.classList.toggle('is-expanded');
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
      const mid = rect.top + rect.height / 2;
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
      const targetIndex = parseInt(a.dataset.index);
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

    const folders = getFolders();
    const colorIndex = folders.length % COLORS.length;

    const row = document.createElement('div');
    row.className = 'sidebar-folder sidebar-folder-new-row';
    row.innerHTML = `
      <span class="sidebar-folder-dot" style="background:${COLORS[colorIndex]}"></span>
      <input class="sidebar-folder-inline-input" type="text" placeholder="Folder name" maxlength="40" autocomplete="off">
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
      if (e.key === 'Enter') { e.preventDefault(); commit(); }
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
    const folders = getFolders();
    const container = document.querySelector('.sidebar-folders');
    const allQuizzesBtn = document.querySelector('.sidebar-item--active');
    if (!container || !allQuizzesBtn) return;
    const isExpanded = allQuizzesBtn.classList.contains('is-expanded');
    const hasNewRow = !!container.querySelector('.sidebar-folder-new-row');
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

  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
  const PANEL_TITLES = ['General information', 'Quiz structure', 'Settings & confirmation'];
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

  function closeModal() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(resetModal, 280);
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
    modalTitle.textContent = PANEL_TITLES[currentPanel - 1];
    stepLabel.textContent = `Step ${currentPanel} of ${TOTAL}`;
    btnBack.style.display = currentPanel > 1 ? '' : 'none';
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
        ${i === 0 ? `<span class="qm-answer-chip__badge"><img src="img/correct.png" width="10" height="10" alt="">correct</span>` : ''}
      `;
      answerPreview.appendChild(chip);
    }
  }

  function buildSummary() {
    const v = id => document.getElementById(id)?.value?.trim() || '-';
    const visMap = { public: 'Public', private: 'Private', draft: 'Draft' };
    const rows = [
      ['Name', v('qm-name') || '-'],
      ['Subject', v('qm-subject') || '-'],
      ['Questions', v('qm-count')],
      ['Time / question', v('qm-time') + ' sec.'],
      ['Answer choices', answerCount],
      ['Visibility', visMap[visibility]],
      ['Attempts', v('qm-attempts')],
      ['Pass score', v('qm-pass') + ' %'],
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

    const countEl = document.getElementById('qm-count');
    const timeEl = document.getElementById('qm-time');
    const attemptsEl = document.getElementById('qm-attempts');
    const passEl = document.getElementById('qm-pass');
    const ptsEl = document.getElementById('qm-pts');

    const questionCount = Math.max(1, Math.min(100, parseInt(countEl?.value) || 10));
    const timePerQuestion = Math.max(5, Math.min(300, parseInt(timeEl?.value) || 30));
    const attempts = Math.max(1, Math.min(10, parseInt(attemptsEl?.value) || 1));
    const passScore = Math.max(0, Math.min(100, parseInt(passEl?.value) || 60));
    const pointsPerAnswer = Math.max(1, parseInt(ptsEl?.value) || 10);
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
    btnNext.innerHTML = 'Creating...';
    btnNext.disabled = true;
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
})();

(function () {
  'use strict';

  const DAILY_QUIZ = {
    title: 'Organic Chemistry – Functional Groups',
    meta: 'Chemistry · 10 questions · 30 sec / question',
  };

  const TRENDING = [
    { name: 'Animal Cell – Structure & Functions', meta: 'Biology · 25 questions', badge: 'hot', icon: 'img/science.png' },
    { name: 'Photosynthesis & Cellular Respiration', meta: 'Biology · 20 questions', badge: 'new', icon: 'img/science.png' },
    { name: 'Human Digestive System', meta: 'Biology · 18 questions', badge: '', icon: 'img/science.png' },
    { name: 'Genetics & DNA Replication', meta: 'Biology · 22 questions', badge: 'hot', icon: 'img/science.png' },
    { name: 'Ecosystems & Food Chains', meta: 'Biology · 15 questions', badge: '', icon: 'img/science.png' },
    { name: 'Functions & Limits – Baccalaureate', meta: 'Mathematics · 20 questions', badge: 'new', icon: 'img/mathematics.png' },
    { name: 'Quadratic Equations & Inequalities', meta: 'Mathematics · 18 questions', badge: 'hot', icon: 'img/mathematics.png' },
    { name: 'Trigonometry – Identities & Values', meta: 'Mathematics · 16 questions', badge: '', icon: 'img/mathematics.png' },
    { name: 'Probability & Statistics Basics', meta: 'Mathematics · 22 questions', badge: '', icon: 'img/mathematics.png' },
    { name: 'Integrals & Derivatives', meta: 'Mathematics · 24 questions', badge: 'classic', icon: 'img/mathematics.png' },
    { name: 'World Capitals', meta: 'Geography · 30 questions', badge: 'classic', icon: 'img/geography.png' },
    { name: 'Rivers & Mountains of Europe', meta: 'Geography · 20 questions', badge: '', icon: 'img/geography.png' },
    { name: 'Countries of Africa – Flags & Facts', meta: 'Geography · 25 questions', badge: 'hot', icon: 'img/geography.png' },
    { name: 'Climate Zones & Biomes', meta: 'Geography · 18 questions', badge: 'new', icon: 'img/geography.png' },
    { name: 'Romania – Counties & Cities', meta: 'Geography · 20 questions', badge: '', icon: 'img/geography.png' },
    { name: 'Sorting Algorithms', meta: 'Computer Science · 15 questions', badge: '', icon: 'img/computer.png' },
    { name: 'Object-Oriented Programming Concepts', meta: 'Computer Science · 18 questions', badge: 'new', icon: 'img/computer.png' },
    { name: 'Data Structures – Arrays & Lists', meta: 'Computer Science · 20 questions', badge: '', icon: 'img/computer.png' },
    { name: 'SQL & Database Fundamentals', meta: 'Computer Science · 16 questions', badge: 'hot', icon: 'img/computer.png' },
    { name: 'Networks & Protocols Basics', meta: 'Computer Science · 14 questions', badge: '', icon: 'img/computer.png' },
    { name: 'Newton\'s Laws of Motion', meta: 'Physics · 16 questions', badge: '', icon: 'img/science.png' },
    { name: 'Electricity & Circuits', meta: 'Physics · 20 questions', badge: 'hot', icon: 'img/science.png' },
    { name: 'Optics – Light & Refraction', meta: 'Physics · 18 questions', badge: '', icon: 'img/science.png' },
    { name: 'Thermodynamics – Heat & Energy', meta: 'Physics · 15 questions', badge: 'new', icon: 'img/science.png' },
    { name: 'Kinematics & Projectile Motion', meta: 'Physics · 22 questions', badge: 'classic', icon: 'img/science.png' },
    { name: 'World War II – Key Events', meta: 'History · 22 questions', badge: 'hot', icon: 'img/history1.png' },
    { name: 'Ancient Rome – Republic & Empire', meta: 'History · 18 questions', badge: 'classic', icon: 'img/history1.png' },
    { name: 'French Revolution – Causes & Effects', meta: 'History · 20 questions', badge: '', icon: 'img/history1.png' },
    { name: 'Cold War – Key Moments', meta: 'History · 16 questions', badge: 'new', icon: 'img/history1.png' },
    { name: 'History of Romania – Medieval Period', meta: 'History · 14 questions', badge: '', icon: 'img/history1.png' },
  ];

  const RECOMMENDED = [
    { name: 'Eminescu\'s Poetry', meta: 'Language & Literature · 10 questions', icon: 'img/literature.png' },
    { name: 'Romanian Grammar – Parts of Speech', meta: 'Language & Literature · 18 questions', icon: 'img/literature.png' },
    { name: 'Shakespeare\'s Works & Characters', meta: 'Language & Literature · 16 questions', icon: 'img/literature.png' },
    { name: 'Literary Devices & Figures of Speech', meta: 'Language & Literature · 14 questions', icon: 'img/literature.png' },
    { name: 'Romanian Writers – 19th & 20th Century', meta: 'Language & Literature · 20 questions', icon: 'img/literature.png' },
    { name: 'Periodic Table – Elements', meta: 'Chemistry · 18 questions', icon: 'img/science.png' },
    { name: 'Chemical Bonds & Reactions', meta: 'Chemistry · 22 questions', icon: 'img/science.png' },
    { name: 'Acids, Bases & pH Scale', meta: 'Chemistry · 16 questions', icon: 'img/science.png' },
    { name: 'Organic Chemistry – Carbon Compounds', meta: 'Chemistry · 20 questions', icon: 'img/science.png' },
    { name: 'Stoichiometry & Molar Mass', meta: 'Chemistry · 18 questions', icon: 'img/science.png' },
    { name: 'Cognitive Psychology Basics', meta: 'Psychology · 12 questions', icon: 'img/psychology.png' },
    { name: 'Freud\'s Psychoanalytic Theory', meta: 'Psychology · 14 questions', icon: 'img/psychology.png' },
    { name: 'Memory & Learning Processes', meta: 'Psychology · 16 questions', icon: 'img/psychology.png' },
    { name: 'Developmental Psychology – Piaget', meta: 'Psychology · 18 questions', icon: 'img/psychology.png' },
    { name: 'Personality Theories & Traits', meta: 'Psychology · 15 questions', icon: 'img/psychology.png' },
    { name: 'French Vocabulary – A2', meta: 'Language & Literature · 20 questions', icon: 'img/public.png' },
    { name: 'English Grammar – Tenses', meta: 'Language & Literature · 22 questions', icon: 'img/public.png' },
    { name: 'German – Basic Vocabulary B1', meta: 'Language & Literature · 18 questions', icon: 'img/public.png' },
    { name: 'Spanish – Common Phrases A1', meta: 'Language & Literature · 16 questions', icon: 'img/public.png' },
    { name: 'Latin – Declensions & Conjugations', meta: 'Language & Literature · 14 questions', icon: 'img/public.png' },
    { name: 'Animal Kingdoms – Classification', meta: 'Biology · 14 questions', icon: 'img/science.png' },
    { name: 'Human Nervous System', meta: 'Biology · 18 questions', icon: 'img/science.png' },
    { name: 'Plant Biology – Structures & Functions', meta: 'Biology · 16 questions', icon: 'img/science.png' },
    { name: 'Evolution & Natural Selection', meta: 'Biology · 20 questions', icon: 'img/science.png' },
    { name: 'Microbiology – Bacteria & Viruses', meta: 'Biology · 15 questions', icon: 'img/science.png' },
    { name: 'EU Countries & Capitals', meta: 'Geography · 27 questions', icon: 'img/geography.png' },
    { name: 'Physical Geography of Asia', meta: 'Geography · 22 questions', icon: 'img/geography.png' },
    { name: 'World Oceans & Seas', meta: 'Geography · 16 questions', icon: 'img/geography.png' },
    { name: 'Natural Disasters – Causes & Effects', meta: 'Geography · 18 questions', icon: 'img/geography.png' },
    { name: 'Cartography & Map Reading', meta: 'Geography · 12 questions', icon: 'img/geography.png' },
    { name: 'Basic Algebra', meta: 'Mathematics · 18 questions', icon: 'img/mathematics.png' },
    { name: 'Geometry – Theorems & Proofs', meta: 'Mathematics · 20 questions', icon: 'img/mathematics.png' },
    { name: 'Number Theory – Primes & Divisibility', meta: 'Mathematics · 15 questions', icon: 'img/mathematics.png' },
    { name: 'Combinatorics & Permutations', meta: 'Mathematics · 16 questions', icon: 'img/mathematics.png' },
    { name: 'Matrices & Linear Systems', meta: 'Mathematics · 18 questions', icon: 'img/mathematics.png' },
    { name: 'HTML & CSS Fundamentals', meta: 'Computer Science · 20 questions', icon: 'img/computer.png' },
    { name: 'Binary & Number Systems', meta: 'Computer Science · 14 questions', icon: 'img/computer.png' },
    { name: 'Operating Systems – Core Concepts', meta: 'Computer Science · 16 questions', icon: 'img/computer.png' },
    { name: 'Recursion & Dynamic Programming', meta: 'Computer Science · 18 questions', icon: 'img/computer.png' },
    { name: 'Cybersecurity Basics', meta: 'Computer Science · 15 questions', icon: 'img/computer.png' },
    { name: 'Roman Empire – Key Facts', meta: 'History · 15 questions', icon: 'img/history1.png' },
    { name: 'World War I – Causes & Alliances', meta: 'History · 20 questions', icon: 'img/history1.png' },
    { name: 'The Renaissance – Art & Ideas', meta: 'History · 16 questions', icon: 'img/history1.png' },
    { name: 'Ancient Greece – City-States & Culture', meta: 'History · 18 questions', icon: 'img/history1.png' },
    { name: 'Colonialism & Decolonization', meta: 'History · 14 questions', icon: 'img/history1.png' },
    { name: 'Introduction to Philosophy', meta: 'Psychology · 10 questions', icon: 'img/psychology.png' },
    { name: 'Social Psychology – Group Behaviour', meta: 'Psychology · 16 questions', icon: 'img/psychology.png' },
    { name: 'Emotions & Motivation', meta: 'Psychology · 14 questions', icon: 'img/psychology.png' },
    { name: 'Abnormal Psychology – Disorders', meta: 'Psychology · 18 questions', icon: 'img/psychology.png' },
    { name: 'Behaviorism – Pavlov & Skinner', meta: 'Psychology · 12 questions', icon: 'img/psychology.png' },
    { name: 'Electrochemistry & Redox Reactions', meta: 'Chemistry · 16 questions', icon: 'img/science.png' },
    { name: 'States of Matter & Gas Laws', meta: 'Chemistry · 20 questions', icon: 'img/science.png' },
    { name: 'Biochemistry – Proteins & Enzymes', meta: 'Chemistry · 18 questions', icon: 'img/science.png' },
    { name: 'Nuclear Chemistry & Radioactivity', meta: 'Chemistry · 14 questions', icon: 'img/science.png' },
    { name: 'Solutions & Concentration Calculations', meta: 'Chemistry · 16 questions', icon: 'img/science.png' },
    { name: 'Waves & Sound', meta: 'Physics · 18 questions', icon: 'img/science.png' },
    { name: 'Magnetism & Electromagnetism', meta: 'Physics · 20 questions', icon: 'img/science.png' },
    { name: 'Modern Physics – Relativity Basics', meta: 'Physics · 14 questions', icon: 'img/science.png' },
    { name: 'Quantum Mechanics – Introduction', meta: 'Physics · 12 questions', icon: 'img/science.png' },
    { name: 'Fluids – Pressure & Archimedes', meta: 'Physics · 16 questions', icon: 'img/science.png' },
  ];

  const BADGE_LABELS = { hot: 'Hot', new: 'New', classic: 'Classic' };

  function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  function init() {
    renderDaily();
    renderHomeFeatures();
    renderDiscoverCategories();
    initFilters();
    initSearch();
  }

  function renderDaily() {
    const titleEl = document.getElementById('disc-daily-title');
    const metaEl = document.getElementById('disc-daily-meta');
    if (titleEl) titleEl.textContent = DAILY_QUIZ.title;
    if (metaEl) metaEl.textContent = DAILY_QUIZ.meta;
  }

  function renderHomeFeatures() {
    const section = document.getElementById('section-home');
    if (!section || document.getElementById('home-features-root')) return;

    const root = document.createElement('div');
    root.id = 'home-features-root';
    root.className = 'home-features';

    const dailyEl = document.createElement('div');
    dailyEl.className = 'home-daily';
    dailyEl.innerHTML = `
      <div class="home-daily__left">
        <span class="home-daily__eyebrow">
          <img src="img/calendar.png" width="14" height="14" style="vertical-align: middle; filter: invert(1);" alt="">
          Daily quiz
        </span>
        <h3 class="home-daily__title">${DAILY_QUIZ.title}</h3>
        <p class="home-daily__meta">${DAILY_QUIZ.meta}</p>
      </div>
      <button class="home-daily__btn">
        <img src="img/arrow-right2.png" width="13" height="13" alt="">
        Start now
      </button>
    `;
    root.appendChild(dailyEl);

    const trendingBlock = document.createElement('div');
    trendingBlock.className = 'home-block';
    trendingBlock.innerHTML = `
      <div class="home-block__hdr">
        <span class="home-block__title">
          <img src="img/fire.png" width="18" height="18" alt="">
          Trending
        </span>
        <button class="home-block__see-all">See all</button>
      </div>
      <div class="home-scroll-row" id="hf-trending"></div>
    `;
    trendingBlock.querySelector('.home-block__see-all').addEventListener('click', () => {
      document.querySelector('.navbar-links a[data-section="discover"]')?.click();
    });
    root.appendChild(trendingBlock);

    const recBlock = document.createElement('div');
    recBlock.className = 'home-block';
    recBlock.innerHTML = `
      <div class="home-block__hdr">
        <span class="home-block__title">
          <img src="img/star1.png" width="20" height="20" alt="">
          Recommended for you
        </span>
        <button class="home-block__see-all">See all</button>
      </div>
      <div class="home-scroll-row" id="hf-recommended"></div>
    `;
    recBlock.querySelector('.home-block__see-all').addEventListener('click', () => {
      document.querySelector('.navbar-links a[data-section="discover"]')?.click();
    });
    root.appendChild(recBlock);

    section.appendChild(root);

    shuffle(TRENDING).slice(0, 6).forEach(q => {
      document.getElementById('hf-trending').appendChild(buildHomeCard(q));
    });
    shuffle(RECOMMENDED).slice(0, 6).forEach(q => {
      document.getElementById('hf-recommended').appendChild(buildHomeCard(q));
    });
  }

  function buildHomeCard(quiz) {
    const card = document.createElement('div');
    card.className = 'home-card';
    card.innerHTML = `
      <div class="home-card__icon-wrap">
        <img src="${quiz.icon}" alt="">
      </div>
      <div class="home-card__body">
        <p class="home-card__name">${quiz.name}</p>
        <p class="home-card__meta">${quiz.meta}</p>
        ${quiz.badge && BADGE_LABELS[quiz.badge] ? `<span class="home-card__badge home-card__badge--${quiz.badge}">${BADGE_LABELS[quiz.badge]}</span>` : ''}
      </div>
    `;
    return card;
  }

  function renderDiscoverCategories() {
    const trendingBlock = document.getElementById('disc-trending')?.closest('.disc-block');
    const recommendedBlock = document.getElementById('disc-recommended')?.closest('.disc-block');
    if (trendingBlock) trendingBlock.remove();
    if (recommendedBlock) recommendedBlock.remove();

    const publishedUserQuizzes = (JSON.parse(localStorage.getItem('blitziq-quizzes') || '[]'))
      .filter(q => q.status === 'published' && q.subject)
      .map(q => ({
        name: q.name,
        meta: `${q.subject} · ${q.questions.length} questions`,
        badge: '',
        icon: 'img/quizzes.png',
        _userQuiz: true,
      }));
    
    const allQuizzes = [...publishedUserQuizzes, ...TRENDING, ...RECOMMENDED];
    const categoryMap = {};
    allQuizzes.forEach(q => {
      const cat = q.meta.split('·')[0].trim();
      if (!categoryMap[cat]) categoryMap[cat] = [];
      if (!categoryMap[cat].find(x => x.name === q.name)) {
        categoryMap[cat].push(q);
      }
    });

    const section = document.getElementById('section-discover');
    if (!section) return;

    shuffle(Object.keys(categoryMap)).forEach(cat => {
      const quizzes = shuffle(categoryMap[cat]);
      if (quizzes.length === 0) return;

      const LIMIT = 6;
      const hasMore = quizzes.length > LIMIT;

      const block = document.createElement('div');
      block.className = 'disc-block disc-block--cat';
      block.dataset.cat = cat;
      block.innerHTML = `
        <div class="disc-block__hdr">
          <span class="disc-block__title">${cat}</span>
          ${hasMore ? '<a href="#" class="disc-block__see-all">See all</a>' : ''}
        </div>
        <div class="disc-grid disc-grid--recommended"></div>
      `;

      const grid = block.querySelector('.disc-grid');
      quizzes.slice(0, LIMIT).forEach(q => grid.appendChild(buildCard(q)));

      if (hasMore) {
        const seeAll = block.querySelector('.disc-block__see-all');
        let expanded = false;
        seeAll.addEventListener('click', e => {
          e.preventDefault();
          expanded = !expanded;
          if (expanded) {
            quizzes.slice(LIMIT).forEach(q => grid.appendChild(buildCard(q)));
            seeAll.textContent = 'Show less';
          } else {
            while (grid.children.length > LIMIT) grid.lastChild.remove();
            seeAll.textContent = 'See all';
          }
        });
      }

      section.appendChild(block);
    });
  }

  function buildCard(quiz) {
    const card = document.createElement('div');
    card.className = 'disc-card';
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

  function initFilters() {
    const filters = document.querySelectorAll('.disc-filter');
    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        filters.forEach(f => f.classList.remove('is-active'));
        btn.classList.add('is-active');
        filterGrids(btn.dataset.cat);
      });
    });
  }

  function filterGrids(cat) {
    document.querySelectorAll('.disc-block--cat').forEach(block => {
      if (!cat) {
        block.style.display = '';
      } else {
        block.style.display = block.dataset.cat.toLowerCase().includes(cat.toLowerCase()) ? '' : 'none';
      }
    });
  }

  function initSearch() {
    const input = document.querySelector('.navbar-search-input');
    if (!input) return;

    const publishedUserQuizzes = (JSON.parse(localStorage.getItem('blitziq-quizzes') || '[]'))
      .filter(q => q.status === 'published' && q.subject)
      .map(q => ({
        name: q.name,
        meta: `${q.subject} · ${q.questions.length} questions`,
        badge: '',
        icon: 'img/quizzes.png',
      }));
    
    const allQuizzes = [...publishedUserQuizzes, ...TRENDING, ...RECOMMENDED].filter(
      (q, i, arr) => arr.findIndex(x => x.name === q.name) === i
    );

    let searchSection = document.getElementById('section-search');
    if (!searchSection) {
      searchSection = document.createElement('section');
      searchSection.className = 'page-section';
      searchSection.id = 'section-search';
      document.querySelector('.page-main').appendChild(searchSection);
    }

    let lastActiveSection = null;

    function showSearch(query) {
      const q = query.trim().toLowerCase();

      if (!searchSection.classList.contains('is-active')) {
        const active = document.querySelector('.page-section.is-active:not(#section-search)');
        if (active) lastActiveSection = active.id.replace('section-', '');
      }

      if (!q) {
        restoreSection();
        return;
      }

      document.querySelectorAll('.page-section').forEach(s => s.classList.remove('is-active'));
      document.querySelectorAll('.navbar-links a[data-section]').forEach(l => l.classList.remove('active'));
      searchSection.classList.add('is-active');

      const results = allQuizzes.filter(quiz =>
        quiz.name.toLowerCase().includes(q) ||
        quiz.meta.toLowerCase().includes(q)
      );

      searchSection.innerHTML = '';

      const header = document.createElement('div');
      header.className = 'search-header';
      header.innerHTML = `
        <span class="search-header__query">Results for "<strong>${q}</strong>"</span>
        <span class="search-header__count">${results.length} found</span>
      `;
      searchSection.appendChild(header);

      if (results.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'search-empty';
        empty.innerHTML = `
          <p class="search-empty__title">No quizzes found</p>
          <p class="search-empty__sub">Try a different keyword or browse by category.</p>
        `;
        searchSection.appendChild(empty);
        return;
      }

      const grid = document.createElement('div');
      grid.className = 'disc-grid disc-grid--recommended';
      results.forEach(quiz => grid.appendChild(buildCard(quiz)));
      searchSection.appendChild(grid);
    }

    function restoreSection() {
      searchSection.innerHTML = '';
      searchSection.classList.remove('is-active');
      const target = lastActiveSection || 'home';
      const section = document.getElementById('section-' + target);
      if (section) section.classList.add('is-active');
      const link = document.querySelector(`.navbar-links a[data-section="${target}"]`);
      if (link) link.classList.add('active');
    }

    function clearSearch() {
      input.value = '';
      restoreSection();
    }

    input.addEventListener('input', () => showSearch(input.value));

    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        clearSearch();
        input.blur();
      }
    });

    document.querySelectorAll('.navbar-links a[data-section]').forEach(a => {
      a.addEventListener('click', () => {
        if (input.value.trim()) clearSearch();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

(function () {
  'use strict';

  const MAX_QUESTIONS = 100;
  const MAX_ANSWERS = 6;
  const MIN_ANSWERS = 2;

  let quizzes = JSON.parse(localStorage.getItem('blitziq-quizzes') || '[]');
  let editorQuizId = null;
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
    const count = Math.max(1, Math.min(MAX_QUESTIONS, parseInt(payload.questionCount) || 10));
    const ansCount = Math.max(MIN_ANSWERS, Math.min(MAX_ANSWERS, parseInt(payload.answerCount) || 4));
    const questions = Array.from({ length: count }, (_, i) => ({
      index: i,
      text: '',
      answers: Array.from({ length: ansCount }, () => ({ text: '', correct: false })),
      type: 'single',
      time: Math.max(5, Math.min(300, parseInt(payload.timePerQuestion) || 30)),
      points: Math.max(1, parseInt(payload.pointsPerAnswer) || 10),
    }));
    if (questions.length > 0) {
      questions[0].answers[0].correct = true;
    }
    const quiz = {
      id: Date.now().toString(),
      name: payload.name,
      description: payload.description || '',
      subject: payload.subject || '',
      language: payload.language || '',
      visibility: payload.visibility || 'public',
      answerCount: ansCount,
      timePerQ: Math.max(5, Math.min(300, parseInt(payload.timePerQuestion) || 30)),
      questionOrder: payload.questionOrder,
      answerOrder: payload.answerOrder,
      attempts: Math.max(1, Math.min(10, parseInt(payload.attempts) || 1)),
      passScore: Math.max(0, Math.min(100, parseInt(payload.passScore) || 60)),
      points: Math.max(1, parseInt(payload.pointsPerAnswer) || 10),
      displayOptions: payload.displayOptions || [],
      status: 'draft',
      createdAt: Date.now(),
      questions,
    };
    quizzes.unshift(quiz);
    saveQuizzes();
    renderMyQuizzes();
    renderDiscoverCategories();
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
    const filled = quiz.questions.filter(q => q.text.trim()).length;
    const total = quiz.questions.length;
    const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
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
    const bell = document.querySelector('.navbar-bell');
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
    editorQuizId = quizId;
    currentQIndex = 0;
    const quiz = getQuiz(quizId);
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
    renderDiscoverCategories();
  }

  function buildEditorHTML(quiz) {
    const descBlock = quiz.description
      ? `<div class="qe-desc-banner">
           <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;opacity:0.6">
             <path d="M7 1a6 6 0 100 12A6 6 0 007 1zm0 2.5a.75.75 0 110 1.5.75.75 0 010-1.5zM6 6.5h2v3.5H6V6.5z" fill="currentColor"/>
           </svg>
           <span>${escapeHtml(quiz.description)}</span>
         </div>`
      : '';

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
          <div class="qe-q-add-wrap" id="qe-q-add-wrap">
            <button class="qe-q-add-btn" id="qe-q-add" title="Add question" aria-label="Add question">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
              Add question
            </button>
          </div>
        </aside>
        <main class="qe-main">
          <div class="qe-topbar">
            <span class="qe-topbar__info" id="qe-q-label">Question 1 of ${quiz.questions.length}</span>
            <div class="qe-topbar__right">
              <div style="position:relative;display:inline-flex;">
                <button class="qe-save-btn" id="qe-folder-btn" style="border-right:none;border-radius:8px 0 0 8px;">
                  <img src="img/folder.png" width="14" height="14" alt="">
                </button>
                <div class="qe-folder-dropdown" id="qe-folder-dropdown"></div>
              </div>
              <button class="qe-save-btn" id="qe-save">
                <img src="img/save.png" width="14" height="14" alt="">
                Save
              </button>
              <button class="qe-publish-btn" id="qe-publish">Publish quiz</button>
            </div>
          </div>
          <div class="qe-editor" id="qe-editor">
            ${descBlock}
            <div class="qe-field">
              <label class="qe-field__label">Question text</label>
              <textarea class="qe-field__input qe-field__input--textarea" id="qe-q-text" placeholder="Type your question here..." rows="3"></textarea>
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
    const folderBtn = document.getElementById('qe-folder-btn');
    const folderDropdown = document.getElementById('qe-folder-dropdown');
    
    folderBtn?.addEventListener('click', e => {
      e.stopPropagation();
      const folders = getFolders();
      if (!folders.length) {
        folderDropdown.innerHTML = '<div class="qe-folder-dropdown__empty">No folders yet</div>';
      } else {
        const currentFolders = quiz.folders || [];
        folderDropdown.innerHTML = folders.map((f, i) => `
          <button class="qe-folder-dropdown__item ${currentFolders.includes(i) ? 'is-active' : ''}" data-fi="${i}">
            <span class="qe-folder-dropdown__dot" style="background:${COLORS[i % COLORS.length]}"></span>
            ${escapeHtml(f.name)}
            ${currentFolders.includes(i) ? '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
          </button>
        `).join('');
        folderDropdown.querySelectorAll('.qe-folder-dropdown__item').forEach(btn => {
          btn.addEventListener('click', e => {
            e.stopPropagation();
            const fi = parseInt(btn.dataset.fi);
            if (!quiz.folders) quiz.folders = [];
            const idx = quiz.folders.indexOf(fi);
            if (idx === -1) {
              quiz.folders.push(fi);
            } else {
              quiz.folders.splice(idx, 1);
            }
            saveQuizzes();
            folderBtn.click();
          });
        });
      }
      folderDropdown.classList.toggle('is-open');
    });
    
    document.addEventListener('click', () => folderDropdown?.classList.remove('is-open'));
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

    document.getElementById('qe-q-add')?.addEventListener('click', () => {
      if (quiz.questions.length >= MAX_QUESTIONS) return;
      saveCurrentQuestion(quiz);
      const newQ = {
        index: quiz.questions.length,
        text: '',
        answers: Array.from({ length: quiz.answerCount }, () => ({ text: '', correct: false })),
        type: 'single',
        time: quiz.timePerQ,
        points: quiz.points,
      };
      newQ.answers[0].correct = true;
      quiz.questions.push(newQ);
      saveQuizzes();
      currentQIndex = quiz.questions.length - 1;
      renderQuestionList(quiz);
      loadQuestion(quiz, currentQIndex);
      updateAddQuestionBtn(quiz);
      const list = document.getElementById('qe-q-list');
      if (list) list.scrollTop = list.scrollHeight;
    });

    updateAddQuestionBtn(quiz);
  }

  function updateAddQuestionBtn(quiz) {
    const btn = document.getElementById('qe-q-add');
    if (!btn) return;
    const atMax = quiz.questions.length >= MAX_QUESTIONS;
    btn.disabled = atMax;
    btn.title = atMax ? `Maximum ${MAX_QUESTIONS} questions reached` : 'Add question';
    btn.style.opacity = atMax ? '0.4' : '';
    btn.style.cursor = atMax ? 'not-allowed' : '';

    const topLabel = document.getElementById('qe-q-label');
    if (topLabel) topLabel.textContent = `Question ${currentQIndex + 1} of ${quiz.questions.length}`;
  }

  function showQuestionDeleteConfirm(itemEl, quiz, index) {
    if (itemEl.querySelector('.qe-q-delete-confirm')) return;
    itemEl.classList.add('is-confirming');

    const confirm = document.createElement('div');
    confirm.className = 'qe-q-delete-confirm';
    confirm.innerHTML = `
      <span class="qe-q-delete-confirm__text">Delete?</span>
      <button class="qe-q-delete-confirm__yes">Yes</button>
      <button class="qe-q-delete-confirm__no">No</button>
    `;
    itemEl.appendChild(confirm);
    requestAnimationFrame(() => confirm.classList.add('is-visible'));

    confirm.querySelector('.qe-q-delete-confirm__yes').addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      itemEl.classList.add('is-removing');
      setTimeout(() => {
        quiz.questions.splice(index, 1);
        quiz.questions.forEach((q, i) => q.index = i);
        saveQuizzes();
        if (currentQIndex >= quiz.questions.length) {
          currentQIndex = Math.max(0, quiz.questions.length - 1);
        }
        if (quiz.questions.length === 0) {
          quiz.questions.push({
            index: 0,
            text: '',
            answers: Array.from({ length: quiz.answerCount }, () => ({ text: '', correct: false })),
            type: 'single',
            time: quiz.timePerQ,
            points: quiz.points,
          });
          quiz.questions[0].answers[0].correct = true;
          saveQuizzes();
          currentQIndex = 0;
        }
        renderQuestionList(quiz);
        loadQuestion(quiz, currentQIndex);
        updateAddQuestionBtn(quiz);
      }, 220);
    });

    confirm.querySelector('.qe-q-delete-confirm__no').addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      confirm.classList.remove('is-visible');
      itemEl.classList.remove('is-confirming');
      setTimeout(() => confirm.remove(), 180);
    });

    function outsideClick(e) {
      if (!itemEl.contains(e.target)) {
        confirm.classList.remove('is-visible');
        itemEl.classList.remove('is-confirming');
        setTimeout(() => confirm.remove(), 180);
        document.removeEventListener('click', outsideClick);
      }
    }
    setTimeout(() => document.addEventListener('click', outsideClick), 0);
  }

  function renderQuestionList(quiz) {
    const list = document.getElementById('qe-q-list');
    if (!list) return;
    list.innerHTML = '';
    quiz.questions.forEach((q, i) => {
      const item = document.createElement('div');
      item.className = 'qe-q-item' + (i === currentQIndex ? ' is-active' : '');
      item.dataset.index = i;
      const filled = q.text.trim() !== '';
      item.innerHTML = `
        <span class="qe-q-item__num">${i + 1}</span>
        <span class="qe-q-item__text">${filled ? escapeHtml(q.text.substring(0, 40)) + (q.text.length > 40 ? '…' : '') : '<em>Empty</em>'}</span>
        <button class="qe-q-item__delete" data-index="${i}" aria-label="Delete question" title="Delete question">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </button>
        ${filled ? '<span class="qe-q-item__dot qe-q-item__dot--filled"></span>' : '<span class="qe-q-item__dot"></span>'}
      `;

      item.addEventListener('click', e => {
        if (e.target.closest('.qe-q-item__delete')) return;
        saveCurrentQuestion(quiz);
        currentQIndex = i;
        renderQuestionList(quiz);
        loadQuestion(quiz, i);
      });

      item.querySelector('.qe-q-item__delete').addEventListener('click', e => {
        e.stopPropagation();
        showQuestionDeleteConfirm(item, quiz, i);
      });

      list.appendChild(item);
    });
  }

  function loadQuestion(quiz, index) {
    const q = quiz.questions[index];
    if (!q) return;
    document.getElementById('qe-q-label').textContent = `Question ${index + 1} of ${quiz.questions.length}`;
    document.getElementById('qe-q-text').value = q.text || '';

    const timeInput = document.getElementById('qe-q-time');
    timeInput.value = Math.max(5, Math.min(300, q.time || quiz.timePerQ));
    timeInput.min = 5;
    timeInput.max = 300;
    timeInput.onchange = () => {
      let v = parseInt(timeInput.value);
      if (isNaN(v)) v = 5;
      timeInput.value = Math.max(5, Math.min(300, v));
    };

    const ptsInput = document.getElementById('qe-q-pts');
    ptsInput.value = Math.max(1, q.points || quiz.points);
    ptsInput.min = 1;
    ptsInput.onchange = () => {
      let v = parseInt(ptsInput.value);
      if (isNaN(v)) v = 1;
      ptsInput.value = Math.max(1, v);
    };

    const typeSelect = document.getElementById('qe-q-type');
    if (typeSelect) {
      typeSelect.value = q.type || 'single';
      const freshSelect = typeSelect.cloneNode(true);
      typeSelect.parentNode.replaceChild(freshSelect, typeSelect);
      freshSelect.value = q.type || 'single';
      freshSelect.addEventListener('change', () => {
        q.text = document.getElementById('qe-q-text').value;
        q.time = Math.max(5, Math.min(300, parseInt(document.getElementById('qe-q-time').value) || quiz.timePerQ));
        q.points = Math.max(1, parseInt(document.getElementById('qe-q-pts').value) || quiz.points);
        q.type = freshSelect.value;
        if (q.type === 'truefalse') {
          const prev = q.answers || [];
          q.answers = [
            { text: prev[0]?.text || 'True', correct: prev[0]?.correct || false },
            { text: prev[1]?.text || 'False', correct: prev[1]?.correct || false },
          ];
          if (!q.answers[0].correct && !q.answers[1].correct) {
            q.answers[0].correct = true;
          }
        } else {
          const prev = q.answers || [];
          const target = quiz.answerCount;
          const tfDefaults = ['True', 'False'];
          const cleaned = prev.map((a) => ({
            text: tfDefaults.includes(a.text) ? '' : a.text,
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

    renderAnswerRows(quiz, q, index);

    const prevBtn = document.getElementById('qe-prev');
    const nextBtn = document.getElementById('qe-next-q');
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === quiz.questions.length - 1;
  }

  function renderAnswerRows(quiz, q, questionIndex) {
    const answersEl = document.getElementById('qe-answers');
    answersEl.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const isTF = q.type === 'truefalse';
    const answers = isTF ? q.answers.slice(0, 2) : q.answers;
    const canAdd = !isTF && answers.length < MAX_ANSWERS;
    const canRemove = !isTF && answers.length > MIN_ANSWERS;

    answers.forEach((ans, ai) => {
      const row = document.createElement('div');
      row.className = 'qe-answer-row' + (ans.correct ? ' is-correct' : '');
      row.innerHTML = `
        <button class="qe-answer-correct" data-ai="${ai}" aria-label="Mark correct" title="Mark as correct">
          <img src="${ans.correct ? 'img/correct.png' : 'img/correct-empty.png'}" width="16" height="16" alt="" class="qe-correct-img">
        </button>
        <span class="qe-answer-letter">${letters[ai]}</span>
        <input class="qe-answer-input" type="text" placeholder="${isTF ? (ai === 0 ? 'True' : 'False') : 'Answer ' + letters[ai] + '...'}" value="${escapeHtml(ans.text)}" data-ai="${ai}">
        ${canRemove ? `
        <button class="qe-answer-remove" data-ai="${ai}" aria-label="Remove answer" title="Remove answer">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
        </button>` : ''}
      `;

      row.querySelector('.qe-answer-correct').addEventListener('click', () => {
        q.text = document.getElementById('qe-q-text').value;
        q.time = Math.max(5, Math.min(300, parseInt(document.getElementById('qe-q-time').value) || quiz.timePerQ));
        q.points = Math.max(1, parseInt(document.getElementById('qe-q-pts').value) || quiz.points);
        if (q.type === 'single' || q.type === 'truefalse') {
          q.answers.forEach(a => a.correct = false);
        }
        q.answers[ai].correct = !q.answers[ai].correct;
        if ((q.type === 'single' || q.type === 'truefalse') && !q.answers.some(a => a.correct)) {
          q.answers[ai].correct = true;
        }
        saveQuizzes();
        renderAnswerRows(quiz, q, questionIndex);
      });

      row.querySelector('.qe-answer-input').addEventListener('input', e => {
        q.answers[ai].text = e.target.value;
      });

      if (canRemove) {
        row.querySelector('.qe-answer-remove').addEventListener('click', e => {
          e.stopPropagation();
          syncAnswerTexts(q);
          q.answers.splice(ai, 1);
          if ((q.type === 'single') && !q.answers.some(a => a.correct)) {
            q.answers[0].correct = true;
          }
          saveQuizzes();
          renderAnswerRows(quiz, q, questionIndex);
        });
      }

      answersEl.appendChild(row);
    });

    if (!isTF) {
      const addRow = document.createElement('div');
      addRow.className = 'qe-answer-add-row';
      addRow.innerHTML = `
        <button class="qe-answer-add-btn" id="qe-answer-add" ${!canAdd ? 'disabled' : ''} title="${!canAdd ? 'Maximum ' + MAX_ANSWERS + ' answers' : 'Add answer'}">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
          Add answer ${!canAdd ? `(max ${MAX_ANSWERS})` : `(${answers.length}/${MAX_ANSWERS})`}
        </button>
      `;
      if (canAdd) {
        addRow.querySelector('#qe-answer-add').addEventListener('click', () => {
          syncAnswerTexts(q);
          q.answers.push({ text: '', correct: false });
          saveQuizzes();
          renderAnswerRows(quiz, q, questionIndex);
          setTimeout(() => {
            const inputs = document.querySelectorAll('.qe-answer-input');
            inputs[inputs.length - 1]?.focus();
          }, 30);
        });
      }
      answersEl.appendChild(addRow);
    }
  }

  function syncAnswerTexts(q) {
    document.querySelectorAll('.qe-answer-input').forEach((input, i) => {
      if (q.answers[i]) q.answers[i].text = input.value;
    });
  }

  function saveCurrentQuestion(quiz) {
    const q = quiz.questions[currentQIndex];
    if (!q) return;
    q.text = document.getElementById('qe-q-text')?.value || '';
    q.time = Math.max(5, Math.min(300, parseInt(document.getElementById('qe-q-time')?.value) || quiz.timePerQ));
    q.points = Math.max(1, parseInt(document.getElementById('qe-q-pts')?.value) || quiz.points);
    const typeSelect = document.getElementById('qe-q-type');
    if (typeSelect) q.type = typeSelect.value;
    syncAnswerTexts(q);
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