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

  const settingsBtn = document.getElementById('settings-btn');
  const settingsDropdown = document.getElementById('settings-dropdown');

  if (settingsBtn && settingsDropdown) {
    settingsBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      if (document.body.classList.contains('sidebar-collapsed')) {
        document.body.classList.remove('sidebar-collapsed');
        localStorage.setItem('blitziq-sidebar', '0');
      }
      settingsDropdown.classList.toggle('is-open');
    });
    document.addEventListener('click', e => {
      if (!settingsBtn.closest('.sidebar-settings-wrap').contains(e.target)) {
        settingsDropdown.classList.remove('is-open');
      }
    });
  }

  function openSettingsModal(id) {
    document.querySelectorAll('.settings-overlay').forEach(o => {
      o.classList.remove('is-open');
      o.setAttribute('aria-hidden', 'true');
    });
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('is-open');
    el.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    settingsDropdown.classList.remove('is-open');
  }

  function closeAllSettingsModals() {
    document.querySelectorAll('.settings-overlay').forEach(o => {
      o.classList.remove('is-open');
      o.setAttribute('aria-hidden', 'true');
    });
    document.body.style.overflow = '';
  }

  function updateThemeSettingsIcon() {
    const icon = document.querySelector('#settings-theme img');
    if (!icon) return;
    const isDark = document.body.classList.contains('dark-mode');
    icon.src = isDark ? 'img/sun.png' : 'img/moon.png';
  }

  document.getElementById('settings-profile')?.addEventListener('click', e => {
    e.preventDefault();
    openSettingsModal('settings-profile-overlay');
  });

  document.getElementById('settings-theme')?.addEventListener('click', e => {
    e.preventDefault();
    const isDark = !document.body.classList.contains('dark-mode');
    applyTheme(isDark);
    updateThemeSettingsIcon();
    settingsDropdown.classList.remove('is-open');
  });

  document.getElementById('settings-language')?.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    const langDropdown = document.getElementById('settings-lang-dropdown');
    langDropdown?.classList.toggle('is-open');
  });

  document.addEventListener('click', e => {
    const langWrap = document.querySelector('.settings-lang-wrap');
    if (langWrap && !langWrap.contains(e.target)) {
      document.getElementById('settings-lang-dropdown')?.classList.remove('is-open');
    }
  });

  document.getElementById('settings-help')?.addEventListener('click', e => {
    e.preventDefault();
    openSettingsModal('settings-help-overlay');
  });

  document.querySelectorAll('.settings-modal__close').forEach(btn => {
    btn.addEventListener('click', closeAllSettingsModals);
  });

  document.querySelectorAll('.settings-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeAllSettingsModals();
    });
  });

  document.getElementById('btn-avatar-profile')?.addEventListener('click', e => {
    e.preventDefault();
    dropdown.classList.remove('is-open');
    openSettingsModal('settings-profile-overlay');
  });

  document.getElementById('btn-avatar-help')?.addEventListener('click', e => {
    e.preventDefault();
    dropdown.classList.remove('is-open');
    openSettingsModal('settings-help-overlay');
  });

  document.getElementById('btn-avatar-contact')?.addEventListener('click', e => {
    e.preventDefault();
    dropdown.classList.remove('is-open');
    openContactOverlay();
  });

  function openContactOverlay() {
    const el = document.getElementById('overlay-contact');
    if (!el) return;
    el.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  document.querySelector('#overlay-contact .overlay-backdrop')?.addEventListener('click', () => {
    document.getElementById('overlay-contact')?.classList.remove('is-open');
    document.body.style.overflow = '';
  });

  document.querySelector('#overlay-contact .overlay-close')?.addEventListener('click', () => {
    document.getElementById('overlay-contact')?.classList.remove('is-open');
    document.body.style.overflow = '';
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
    ok.textContent = window.t('contact_sent');
    ok.style.display = 'block';
    e.target.reset();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllSettingsModals();
  });

  document.querySelectorAll('.settings-lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.settings-lang-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      localStorage.setItem('blitziq-lang', btn.dataset.lang);
      document.getElementById('settings-lang-dropdown')?.classList.remove('is-open');
      applyTranslations();
    });
  });

  const savedLang = localStorage.getItem('blitziq-lang');
  if (savedLang) {
    document.querySelectorAll('.settings-lang-btn').forEach(b => {
      b.classList.toggle('is-active', b.dataset.lang === savedLang);
    });
  }

  updateThemeSettingsIcon();

  // --- Bell / Notifications panel ---

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

  // --- Sidebar collapse ---

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

  // --- Section switching ---

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

  // --- Folders ---

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
          window.blitziqOpenEditor(q.id);
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

  function renderFavorites() {
    const allItems = document.querySelectorAll('.sidebar-item');
    let favItem = null;
    allItems.forEach(el => {
      if (el.querySelector('img[src="img/bookmark.png"]') || el.querySelector('img[src="img/bookmark1.png"]')) {
        if (el.textContent.trim().includes('Favorites')) favItem = el;
      }
    });
    if (!favItem) return;

    const existing = favItem.nextElementSibling;
    if (existing && existing.classList.contains('sidebar-fav-list')) existing.remove();

    const saved = getSaved();
    if (saved.length === 0) {
      favItem.classList.remove('is-expanded');
      return;
    }

    const list = document.createElement('div');
    list.className = 'sidebar-fav-list sidebar-folder-quizzes' + (favItem.classList.contains('is-expanded') ? ' is-open' : '');

    saved.forEach(q => {
      const item = document.createElement('a');
      item.href = '#';
      item.className = 'sidebar-folder-quiz-item';
      item.innerHTML = `
        <span class="sidebar-folder-quiz-dot" style="background:#a78bfa"></span>
        <span class="sidebar-label" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;" title="${escapeHtml(q.name)}">${escapeHtml(q.name)}</span>
      `;
      item.addEventListener('click', e => {
        e.preventDefault();
        window.blitziqOpenStartModal(q);
      });
      list.appendChild(item);
    });

    favItem.insertAdjacentElement('afterend', list);
  }

  (function () {
    const allItems = document.querySelectorAll('.sidebar-item');
    allItems.forEach(el => {
      if (el.textContent.trim().includes('Favorites')) {
        if (!el.querySelector('.sidebar-item-chevron')) {
          const chevron = document.createElement('span');
          chevron.className = 'sidebar-item-chevron';
          chevron.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`;
          el.appendChild(chevron);
        }
        el.addEventListener('click', e => {
          e.preventDefault();
          const saved = getSaved();
          if (saved.length === 0) return;
          el.classList.toggle('is-expanded');
          const list = el.nextElementSibling;
          if (list && list.classList.contains('sidebar-fav-list')) {
            list.classList.toggle('is-open');
          }
        });
      }
    });
  })();

  renderFavorites();
  window.blitziqRenderFavorites = renderFavorites;

  function buildFolderRow(folder, index) {
    const a = document.createElement('a');
    a.href = '#';
    a.className = 'sidebar-folder';
    a.dataset.index = index;
    a.draggable = true;
    a.innerHTML = `
      <span class="sidebar-folder-dot" style="background:${COLORS[index % COLORS.length]}"></span>
      <span class="sidebar-folder-name">${escapeHtml(folder.name)}</span>
      <span class="sidebar-folder-count">${getQuizzes().filter(q => q.folders && q.folders.includes(index)).length}</span>
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

      const quizzes = getQuizzes();
      quizzes.forEach(q => {
        if (!q.folders || !q.folders.length) return;
        q.folders = q.folders.map(fi => {
          if (fi === dragSrcIndex) return dest;
          if (dragSrcIndex < dest) {
            if (fi > dragSrcIndex && fi <= dest) return fi - 1;
          } else {
            if (fi >= dest && fi < dragSrcIndex) return fi + 1;
          }
          return fi;
        });
      });
      localStorage.setItem('blitziq-quizzes', JSON.stringify(quizzes));
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
      <span class="sidebar-folder-confirm-text">${t('delete_confirm')}</span>
      <button class="sidebar-folder-confirm-yes">${t('yes')}</button>
      <button class="sidebar-folder-confirm-no">${t('no')}</button>
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
      <input class="sidebar-folder-inline-input" type="text" placeholder="${t('folder_name_placeholder')}" maxlength="40" autocomplete="off">
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
      folders.push({ name });
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