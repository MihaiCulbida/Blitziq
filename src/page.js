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

  const navLinks = document.querySelectorAll('.navbar-links a');
  navLinks.forEach(a => {
    a.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      a.classList.add('active');
    });
  });

  const sidebarToggle = document.getElementById('sidebar-toggle');

  if (localStorage.getItem('blitziq-sidebar') === '1') {
    document.body.classList.add('sidebar-collapsed');
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      const collapsed = document.body.classList.toggle('sidebar-collapsed');
      localStorage.setItem('blitziq-sidebar', collapsed ? '1' : '0');
    });
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
    const count = getFolders().length;
    btn.style.display = count >= MAX_FOLDERS ? 'none' : '';
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
  const container = document.querySelector('.sidebar-folders');
  if (container) container.style.display = 'none';
})();

(function () {
  'use strict';

  const LETTERS      = ['A', 'B', 'C', 'D', 'E', 'F'];
  const PANEL_TITLES = ['General information', 'Quiz structure', 'Settings & confirmation'];
  const TOTAL        = 3;

  let currentPanel = 1;
  let answerCount  = 4;
  let quizType     = 'single';
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
    quizType    = 'single';
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

    document.querySelectorAll('.qm-type-card').forEach(c =>
      c.classList.toggle('is-active', c.dataset.type === 'single'));

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
      if (i === currentPanel)     dot.classList.add('is-active');
      else if (i < currentPanel)  dot.classList.add('is-done');
    }

    progressFill.style.width = ((currentPanel / TOTAL) * 100) + '%';
    modalTitle.textContent   = PANEL_TITLES[currentPanel - 1];
    stepLabel.textContent    = `Step ${currentPanel} of ${TOTAL}`;
    btnBack.style.display    = currentPanel > 1 ? '' : 'none';

    if (currentPanel === TOTAL) {
      buildSummary();
      btnNext.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Create quiz`;
    } else {
      btnNext.innerHTML = `Continue
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M5 2l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
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
        ${i === 0
          ? `<span class="qm-answer-chip__badge">
               <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                 <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
               </svg>
               correct
             </span>`
          : ''}
      `;
      answerPreview.appendChild(chip);
    }
  }

  function buildSummary() {
    const v = id => document.getElementById(id)?.value?.trim() || '—';

    const typeMap = {
      single:    'Single answer',
      multi:     'Multiple answers',
      truefalse: 'True / False',
      open:      'Open answer',
    };
    const visMap = { public: 'Public', private: 'Private', draft: 'Draft' };

    const rows = [
      ['Name',               v('qm-name') || '—'],
      ['Subject',            v('qm-subject') || '—'],
      ['Questions',          v('qm-count')],
      ['Time / question',    v('qm-time') + ' sec.'],
      ['Answer type',        typeMap[quizType]],
      ['Answer choices',     answerCount],
      ['Visibility',         visMap[visibility]],
      ['Attempts',           v('qm-attempts')],
      ['Pass score',         v('qm-pass') + ' %'],
      ['Points / correct',   v('qm-pts')],
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
      description:     document.getElementById('qm-desc')?.value.trim()           || '',
      subject:         document.getElementById('qm-subject')?.value               || '',
      language:        document.getElementById('qm-lang')?.value                  || '',
      visibility,
      questionCount:   parseInt(document.getElementById('qm-count')?.value)       || 10,
      timePerQuestion: parseInt(document.getElementById('qm-time')?.value)        || 30,
      answerCount,
      quizType,
      questionOrder:   document.getElementById('qm-order')?.value                 || 'fixed',
      answerOrder:     document.getElementById('qm-aorder')?.value                || 'fixed',
      attempts:        parseInt(document.getElementById('qm-attempts')?.value)    || 1,
      passScore:       parseInt(document.getElementById('qm-pass')?.value)        || 60,
      pointsPerAnswer: parseInt(document.getElementById('qm-pts')?.value)         || 10,
      displayOptions:  [...document.querySelectorAll('.qm-toggle.is-active')].map(t => t.dataset.key),
    };

    console.log('[BlitzIQ] Quiz payload:', payload);

    btnNext.textContent = 'Saving...';
    btnNext.disabled    = true;

    setTimeout(() => {
      btnNext.disabled = false;
      closeModal();
    }, 800);
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

  document.querySelectorAll('.qm-type-card').forEach(card =>
    card.addEventListener('click', () => {
      document.querySelectorAll('.qm-type-card').forEach(c => c.classList.remove('is-active'));
      card.classList.add('is-active');
      quizType = card.dataset.type;
      if (quizType === 'truefalse') { answerCount = 2; renderAnswers(); }
    })
  );

  document.getElementById('qm-count-down')?.addEventListener('click', () => {
    if (quizType === 'truefalse' || answerCount <= 2) return;
    answerCount--;
    renderAnswers();
  });
  document.getElementById('qm-count-up')?.addEventListener('click', () => {
    if (quizType === 'truefalse' || answerCount >= 6) return;
    answerCount++;
    renderAnswers();
  });

  document.querySelectorAll('.qm-toggle').forEach(btn =>
    btn.addEventListener('click', () => btn.classList.toggle('is-active'))
  );

  renderAnswers();
})();