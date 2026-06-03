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