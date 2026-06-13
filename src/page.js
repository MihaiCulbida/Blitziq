const lastUser = localStorage.getItem('blitziq-last-user');
const avatarEl = document.querySelector('.navbar-avatar');
const currentUser = avatarEl ? avatarEl.textContent.trim() : null;
const THEME_KEY = 'blitziq-dark-mode';
const themeToggleBtn = document.getElementById('btn-theme-toggle');
const themeToggleIcon = document.getElementById('theme-toggle-icon');

if (currentUser && lastUser !== currentUser) {
  localStorage.removeItem('blitziq-quizzes');
  localStorage.removeItem('blitziq-folders');
  localStorage.removeItem('blitziq-saved');
  localStorage.removeItem('blitziq-notifs');
}
if (currentUser) {
  localStorage.setItem('blitziq-last-user', currentUser);
}

function applyTheme(isDark) {
  document.body.classList.toggle('dark-mode', isDark);
  if (themeToggleIcon) {
    themeToggleIcon.src = isDark ? 'img/sun.png' : 'img/moon.png';
    themeToggleIcon.alt = isDark ? 'Light mode' : 'Dark mode';
    themeToggleIcon.classList.toggle('theme-icon-sun', isDark);
  }
  localStorage.setItem(THEME_KEY, isDark ? '1' : '0');
}

function initTheme() {
  const savedDark = localStorage.getItem(THEME_KEY) === '1';
  applyTheme(savedDark);
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', e => {
    e.stopPropagation();
    const isDark = !document.body.classList.contains('dark-mode');
    applyTheme(isDark);
  });
}

async function loadServerData() {
  try {
    const res = await fetch('php/save_data.php');
    const json = await res.json();
    if (json.success && json.data) {
      localStorage.setItem('blitziq-quizzes', JSON.stringify(json.data.quizzes || []));
      localStorage.setItem('blitziq-folders', JSON.stringify(json.data.folders || []));
      localStorage.setItem('blitziq-saved', JSON.stringify(json.data.saved || []));
      localStorage.setItem('blitziq-notifs', JSON.stringify(json.data.notifs || []));
    }
    if (json.data.history) localStorage.setItem('blitziq-history', JSON.stringify(json.data.history));
  } catch (e) {
    console.error('Failed to load server data:', e);
  }
}

async function syncToServer() {
  try {
    await fetch('php/save_data.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quizzes: JSON.parse(localStorage.getItem('blitziq-quizzes') || '[]'),
        folders: JSON.parse(localStorage.getItem('blitziq-folders') || '[]'),
        saved: JSON.parse(localStorage.getItem('blitziq-saved') || '[]'),
        notifs: JSON.parse(localStorage.getItem('blitziq-notifs') || '[]'),
        history: getHistory(),
      })
    });
  } catch (e) {
    console.error('Failed to sync to server:', e);
  }
}

function getHistory() {
  try { return JSON.parse(localStorage.getItem('blitziq-history')) || []; }
  catch { return []; }
}

function saveHistory(arr) {
  localStorage.setItem('blitziq-history', JSON.stringify(arr.slice(0, 100)));
}

function addHistoryEntry(entry) {
  const h = getHistory();
  h.unshift(entry);
  saveHistory(h);
}

document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  loadServerData();
  applyTranslations();
});

function getCategoryIcon(categoryId) {
  const cat = QUIZ_DATA.categories.find(c => c.id === categoryId);
  return cat ? cat.icon : 'img/quizzes.png';
}

const ALL_QUIZZES = QUIZ_DATA.quizzes.map(q => ({
  name: q.name,
  meta: `${q.subject} · ${q.questions.length} questions`,
  badge: q.badge || '',
  icon: getCategoryIcon(q.category),
  questions: q.questions,
  timePerQ: q.timePerQ,
  points: q.points,
  passScore: q.passScore,
}));

const COLORS = ['#a78bfa', '#f472b6', '#34d399', '#60a5fa', '#fb923c', '#facc15'];
const STORAGE_KEY = 'blitziq-folders';
const SAVED_KEY = 'blitziq-saved';

function getSaved() {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY)) || []; }
  catch { return []; }
}

function setSaved(arr) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(arr));
  syncToServer(); 
}

function getFolders() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveFolders(f) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(f));
  syncToServer(); 
}

function getQuizzes() {
  try { return JSON.parse(localStorage.getItem('blitziq-quizzes') || '[]'); }
  catch { return []; }
}

function getNotifications() {
  try { return JSON.parse(localStorage.getItem('blitziq-notifs')) || []; }
  catch { return []; }
}

function addNotification(notif) {
  const notifs = getNotifications();
  notifs.unshift({ id: Date.now().toString(), ts: Date.now(), read: false, ...notif });
  localStorage.setItem('blitziq-notifs', JSON.stringify(notifs.slice(0, 50)));
  syncToServer();
  renderNotifications();
  updateBellBadge();
}

function renderNotifications() {
  const body = document.querySelector('.notif-panel__body');
  if (!body) return;
  const notifs = getNotifications();

  if (notifs.length === 0) {
    body.innerHTML = `
      <div class="notif-empty">
        <img src="img/bell.png" width="32" height="32" alt="" style="opacity:0.2;">
        <p class="notif-empty__title">${t('no_notifs_title')}</p>
        <p class="notif-empty__sub">${t('no_notifs_sub')}</p>
      </div>`;
    updateBellBadge();
    return;
  }

  body.innerHTML = `
    <div class="notif-list-header">
      <span class="notif-list-header__count">${notifs.length} ${notifs.length !== 1 ? t('notifs_count') : t('notif_count')}</span>
      <button class="notif-clear-all" id="notif-clear-all">${t('clear_all')}</button>
    </div>
    ${notifs.map(n => `
      <div class="notif-item ${n.read ? '' : 'notif-item--unread'}" data-id="${n.id}">
        <div class="notif-item__body">
          <p class="notif-item__text">${n.text}</p>
          <span class="notif-item__time">${formatNotifTime(n.ts)}</span>
        </div>
        <button class="notif-item__delete" data-id="${n.id}" aria-label="Delete notification" title="Delete">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    `).join('')}
  `;

  body.querySelector('#notif-clear-all')?.addEventListener('click', () => {
    localStorage.removeItem('blitziq-notifs');
    renderNotifications();
    updateBellBadge();
  });

  body.querySelectorAll('.notif-item__delete').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const el = body.querySelector(`.notif-item[data-id="${id}"]`);
      if (el) {
        el.classList.add('notif-item--removing');
        setTimeout(() => {
          let notifs = getNotifications();
          notifs = notifs.filter(x => x.id !== id);
          localStorage.setItem('blitziq-notifs', JSON.stringify(notifs));
          renderNotifications();
          updateBellBadge();
        }, 220);
      }
    });
  });

  body.querySelectorAll('.notif-item').forEach(el => {
    el.addEventListener('click', e => {
      if (e.target.closest('.notif-item__delete')) return;
      const notifs = getNotifications();
      const n = notifs.find(x => x.id === el.dataset.id);
      if (n && !n.read) {
        n.read = true;
        localStorage.setItem('blitziq-notifs', JSON.stringify(notifs));
        el.classList.remove('notif-item--unread');
        updateBellBadge();
      }
    });
  });

  updateBellBadge();
}

function formatNotifTime(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return t('just_now');
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ' + t('ago');
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ' + t('ago');
  return new Date(ts).toLocaleDateString();
}

function updateBellBadge() {
  const bell = document.getElementById('btn-bell');
  if (!bell) return;
  const unread = getNotifications().filter(n => !n.read).length;
  let dot = bell.querySelector('.bell-dot');
  if (unread === 0) {
    if (dot) dot.remove();
    return;
  }
  if (!dot) {
    dot = document.createElement('span');
    dot.className = 'bell-dot';
    bell.appendChild(dot);
  }
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
  const favLink = document.querySelector('.sidebar-item[data-section="favorites"]');
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
      const oldToNew = {};
      folders.forEach((f, newIdx) => {
        const oldIdx = newIdx <= dest ? 
          (newIdx < dragSrcIndex ? newIdx : newIdx + 1) : newIdx;
        oldToNew[newIdx] = newIdx;
      });
      
      const reordered = [...folders];
      reordered.splice(dest, 0, dragged);
      
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

(function () {
  'use strict';

  const DAILY_QUIZ = {
    title: 'Animal Cell – Structure & Functions',
    meta: 'Biology · 10 questions · 30 sec / question',
    id: 'bio_001'
  };

  const TRENDING    = ALL_QUIZZES.filter(q => q.badge === 'hot' || q.badge === 'new' || q.badge === 'classic');
  const RECOMMENDED = ALL_QUIZZES.filter(q => !q.badge);

  const BADGE_LABELS = { hot: 'Hot', new: 'New', classic: 'Classic' };

  function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  function init() {
    renderDaily();
    
    let realQuiz = null;
    if (typeof QUIZ_DATA !== 'undefined' && QUIZ_DATA.quizzes) {
      realQuiz = QUIZ_DATA.quizzes.find(q => 
        q.name === DAILY_QUIZ.title || 
        q.id === DAILY_QUIZ.id
      );
    }
    
    document.getElementById('disc-daily-btn')?.addEventListener('click', () => {
      if (realQuiz) {
        const quizForModal = {
          name: realQuiz.name,
          meta: `${realQuiz.subject} · ${realQuiz.questions.length} questions · ${realQuiz.timePerQ} sec/question`,
          icon: 'img/calendar.png',
          subject: realQuiz.subject,
          questions: realQuiz.questions,
          timePerQ: realQuiz.timePerQ,
          points: realQuiz.points,
          passScore: realQuiz.passScore
        };
        
        if (typeof window.blitziqOpenStartModal === 'function') {
          window.blitziqOpenStartModal(quizForModal);
        }
      } else {
        showToast(t('toast_daily_unavailable'));
      }
    });
    
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
  
    let realQuiz = null;
    if (typeof QUIZ_DATA !== 'undefined' && QUIZ_DATA.quizzes) {
      realQuiz = QUIZ_DATA.quizzes.find(q => q.name === DAILY_QUIZ.title || q.id === DAILY_QUIZ.id);
    }
  
    const root = document.createElement('div');
    root.id = 'home-features-root';
    root.className = 'home-features';
  
    const dailyEl = document.createElement('div');
    dailyEl.className = 'home-daily';
    dailyEl.innerHTML = `
      <div class="home-daily__left">
        <span class="home-daily__eyebrow">
          <img src="img/calendar.png" width="14" height="14" style="vertical-align: middle; filter: invert(1);" alt="">
          ${t('daily_quiz')}
        </span>
        <h3 class="home-daily__title">${DAILY_QUIZ.title}</h3>
        <p class="home-daily__meta">${DAILY_QUIZ.meta}</p>
      </div>
      <button class="home-daily__btn">
        <img src="img/arrow-right2.png" width="13" height="13" alt="">
        ${t('start_now')}
      </button>
    `;
  
    dailyEl.querySelector('.home-daily__btn').addEventListener('click', () => {
      if (realQuiz) {
        const quizForModal = {
          name: realQuiz.name,
          meta: `${realQuiz.subject} · ${realQuiz.questions.length} questions · ${realQuiz.timePerQ} sec/question`,
          icon: 'img/calendar.png',
          subject: realQuiz.subject,
          questions: realQuiz.questions,
          timePerQ: realQuiz.timePerQ,
          points: realQuiz.points,
          passScore: realQuiz.passScore
        };
        if (typeof window.blitziqOpenStartModal === 'function') {
          window.blitziqOpenStartModal(quizForModal);
        }
      } else {
        showToast(t('toast_daily_unavailable'));
      }
    });
  
    root.appendChild(dailyEl);
  
    const trendingBlock = document.createElement('div');
    trendingBlock.className = 'home-block';
    trendingBlock.innerHTML = `
      <div class="home-block__hdr">
        <span class="home-block__title">
          <img src="img/fire.png" width="18" height="18" alt="">
          ${t('trending_label')}
        </span>
        <button class="home-block__see-all">${t('see_all')}</button>
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
          ${t('recommended_label')}
        </span>
        <button class="home-block__see-all">${t('see_all')}</button>
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
    card.addEventListener('click', () => {
      if (typeof window.blitziqOpenStartModal === 'function') {
        window.blitziqOpenStartModal(quiz);
      }
    });
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
          ${hasMore ? `<a href="#" class="disc-block__see-all">${t('see_all')}</a>` : ''}
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
            seeAll.textContent = t('show_less') || 'Show less';
          } else {
            while (grid.children.length > LIMIT) grid.lastChild.remove();
            seeAll.textContent = t('see_all');
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
    card.addEventListener('click', () => {
      if (typeof window.blitziqOpenStartModal === 'function') {
        window.blitziqOpenStartModal(quiz);
      }
    });
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
  window.blitziqFilterGrids = filterGrids;
  window.renderDiscoverCategories = renderDiscoverCategories;

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
        <span class="search-header__query">${t('results_for')} "<strong>${q}</strong>"</span>
        <span class="search-header__count">${results.length} ${t('found')}</span>
      `;
      searchSection.appendChild(header);

      if (results.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'search-empty';
        empty.innerHTML = `
          <p class="search-empty__title">${t('no_quizzes_found')}</p>
          <p class="search-empty__sub">${t('no_quizzes_found_sub')}</p>
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

  window.renderHomeFeatures = renderHomeFeatures;

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
    syncToServer(); 
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
  const avatar = document.querySelector('.navbar-avatar');
  if (!avatar) {
    showToast(t('toast_login_to_create'));
    return null;
  }
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
          <p class="mq-empty__title">${t('no_quizzes_title')}</p>
          <p class="mq-empty__sub">${t('no_quizzes_sub')}</p>
        </div>
      `;
      return;
    }
    section.innerHTML = `
      <div class="mq-header">
        <h2 class="mq-header__title">${t('my_quizzes_title')}</h2>
        <span class="mq-header__count">${quizzes.length} ${quizzes.length !== 1 ? t('quizzes_word') : t('quiz_word')}</span>
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
    const statusLabel = quiz.status === 'draft' ? t('draft_label') : t('published_label');
    card.innerHTML = `
      <div class="mq-card__top">
        <span class="mq-card__status mq-card__status--${quiz.status}">${statusLabel}</span>
        <button class="mq-card__delete" data-id="${quiz.id}" aria-label="Delete quiz" title="${t('delete')}">
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
          <span class="mq-card__progress-label">${filled}/${total} ${t('filled')}</span>
        </div>
        <button class="mq-card__edit" data-id="${quiz.id}">
          <img src="img/edit.png" width="12" height="12" alt="" style="filter:invert(1)">
          ${t('edit')}
        </button>
      </div>
    `;
    card.addEventListener('click', e => {
      if (e.target.closest('.mq-card__edit') || e.target.closest('.mq-card__delete')) return;
      window.blitziqOpenStartModal(quiz);
    });
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

  window.blitziqOpenEditor = function(quizId) { openEditor(quizId); };

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
    syncToServer();
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
              ${t('editor_back')}
            </button>
            <span class="qe-sidebar__title">${escapeHtml(quiz.name)}</span>
          </div>
          <div class="qe-q-list" id="qe-q-list"></div>
          <div class="qe-q-add-wrap" id="qe-q-add-wrap">
            <button class="qe-q-add-btn" id="qe-q-add" title="${t('editor_add_question')}" aria-label="${t('editor_add_question')}">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
              ${t('editor_add_question')}
            </button>
          </div>
        </aside>
        <main class="qe-main">
          <div class="qe-topbar">
            <span class="qe-topbar__info" id="qe-q-label">${t('editor_q_of')} 1 ${t('editor_of')} ${quiz.questions.length}</span>
            <div class="qe-topbar__right">
              <div style="position:relative;display:inline-flex;">
                <button class="qe-save-btn" id="qe-folder-btn" style="border-radius:8px;">
                  <img src="img/folder.png" width="16" height="16" alt="">
                </button>
                <div class="qe-folder-dropdown" id="qe-folder-dropdown"></div>
              </div>
              <button class="qe-save-btn" id="qe-save">
                <img src="img/save.png" width="14" height="14" alt="">
                ${t('editor_save')}
              </button>
              <button class="qe-publish-btn" id="qe-publish">${t('editor_publish')}</button>
            </div>
          </div>
          <div class="qe-editor" id="qe-editor">
            ${descBlock}
            <div class="qe-field">
              <label class="qe-field__label">${t('editor_question_label')}</label>
              <textarea class="qe-field__input qe-field__input--textarea" id="qe-q-text" placeholder="${t('question_text_placeholder')}" rows="3"></textarea>
            </div>
            <div class="qe-meta-row">
              <div class="qe-field qe-field--small">
                <label class="qe-field__label">${t('time_sec')}</label>
                <input class="qe-field__input" id="qe-q-time" type="number" min="5" max="300">
              </div>
              <div class="qe-field qe-field--small">
                <label class="qe-field__label">${t('points')}</label>
                <input class="qe-field__input" id="qe-q-pts" type="number" min="1">
              </div>
              <div class="qe-field qe-field--small">
                <label class="qe-field__label">${t('type')}</label>
                <div class="qe-field__select-wrap" style="position:relative;">
                  <select class="qe-field__input" id="qe-q-type" style="padding-right:28px;cursor:pointer;appearance:none;">
                    <option value="single">${t('editor_option_single')}</option>
                    <option value="multi">${t('editor_option_multiple')}</option>
                    <option value="truefalse">${t('editor_option_truefalse')}</option>
                  </select>
                  <svg style="position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:#6b7280;" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
            <div class="qe-divider"></div>
            <p class="qe-section-label">${t('editor_answers_label')} <span class="qe-section-hint">${t('editor_answers_hint')}</span></p>
            <div class="qe-answers" id="qe-answers"></div>
            <div class="qe-nav">
              <button class="qe-nav-btn" id="qe-prev">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                ${t('editor_prev')}
              </button>
              <button class="qe-nav-btn qe-nav-btn--primary" id="qe-next-q">
                ${t('editor_next_q')}
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
        folderDropdown.innerHTML = `<div class="qe-folder-dropdown__empty">${t('editor_no_folders')}</div>`;
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
            renderFolders();
            folderBtn.click();
          });
        });
      }
      folderDropdown.classList.toggle('is-open');
    });
    
    document.getElementById('qe-publish')?.addEventListener('click', () => {
      saveCurrentQuestion(quiz);
      quiz.status = 'published';
      saveQuizzes();
      addNotification({
        text: `"${quiz.name}" ${t('toast_published')}`,
      });
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
    btn.title = atMax ? t('max_questions_reached') : t('editor_add_question');
    btn.style.opacity = atMax ? '0.4' : '';
    btn.style.cursor = atMax ? 'not-allowed' : '';

    const topLabel = document.getElementById('qe-q-label');
    if (topLabel) topLabel.textContent = `${t('editor_q_of')} ${currentQIndex + 1} ${t('editor_of')} ${quiz.questions.length}`;
  }

  function showQuestionDeleteConfirm(itemEl, quiz, index) {
    if (itemEl.querySelector('.qe-q-delete-confirm')) return;
    itemEl.classList.add('is-confirming');

    const confirm = document.createElement('div');
    confirm.className = 'qe-q-delete-confirm';
    confirm.innerHTML = `
      <span class="qe-q-delete-confirm__text">${t('delete_confirm')}</span>
      <button class="qe-q-delete-confirm__yes">${t('yes')}</button>
      <button class="qe-q-delete-confirm__no">${t('no')}</button>
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
    document.getElementById('qe-q-label').textContent = `${t('editor_q_of')} ${index + 1} ${t('editor_of')} ${quiz.questions.length}`;
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
        <input class="qe-answer-input" type="text" placeholder="${isTF ? (ai === 0 ? 'True' : 'False') : t('editor_answer_placeholder') + ' ' + letters[ai] + '...'}" value="${escapeHtml(ans.text)}" data-ai="${ai}">
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
        <button class="qe-answer-add-btn" id="qe-answer-add" ${!canAdd ? 'disabled' : ''} title="${!canAdd ? t('max_answers') : t('editor_add_answer')}">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
          ${!canAdd ? `${t('editor_add_answer')} (${t('editor_max_answers')} ${MAX_ANSWERS})` : `${t('editor_add_answer')} (${answers.length}/${MAX_ANSWERS})`}
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
      showToast(t('toast_saved'));
    } else {
      console.log('Quiz saved');
      const saveBtn = document.getElementById('qe-save');
      if (saveBtn) {
        const originalBg = saveBtn.style.background;
        saveBtn.style.background = '#10b981';
        setTimeout(() => { saveBtn.style.background = originalBg; }, 500);
      }
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

(function () {
  'use strict';

  const overlay = document.getElementById('start-overlay');
  const closeBtn = document.getElementById('start-modal-close');
  const titleEl = document.getElementById('start-modal-title');
  const metaEl = document.getElementById('start-modal-meta');
  const infoEl = document.getElementById('start-modal-info');
  const saveBtn = document.getElementById('start-modal-save');
  const startBtn = document.getElementById('start-modal-start');

  document.getElementById('start-modal-start')?.addEventListener('click', () => {
    if (!currentQuiz) return;
    closeStartModal();
    setTimeout(() => {
      if (typeof window.blitziqRunQuiz === 'function') {
        window.blitziqRunQuiz(currentQuiz);
      }
    }, 250);
  });

  let currentQuiz = null;

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
    quiz: null,
    questions: [],
    index: 0,
    score: 0,
    correct: 0,
    wrong: 0,
    skipped: 0,
    skippedIndices: [],
    answeredIndices: new Set(),
    isRetry: false,
    answered: false,
    timer: null,
    timeLeft: 30,
    startTime: 0,
  };

  const overlay = document.getElementById('qr-overlay');
  const nameEl = document.getElementById('qr-name');
  const counterEl = document.getElementById('qr-counter');
  const fillEl = document.getElementById('qr-progress-fill');
  const timerEl = document.getElementById('qr-timer');
  const timerVal = document.getElementById('qr-timer-val');
  const scoreVal = document.getElementById('qr-score-val');
  const qNum = document.getElementById('qr-q-num');
  const qText = document.getElementById('qr-q-text');
  const answersEl = document.getElementById('qr-answers');
  const feedback = document.getElementById('qr-feedback');
  const nextBtn = document.getElementById('qr-next-btn');
  const bodyEl = document.getElementById('qr-body');
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
        { text: 'Option A', correct: true },
        { text: 'Option B', correct: false },
        { text: 'Option C', correct: false },
        { text: 'Option D', correct: false },
      ],
      type: 'single',
      time: 30,
      points: 10,
    }));
  }

  function open(quiz) {
    state = {
      quiz,
      questions: buildQuestions(quiz),
      index: 0,
      score: 0,
      correct: 0,
      wrong: 0,
      skipped: 0,
      skippedIndices: [],
      answeredIndices: new Set(),
      isRetry: false,
      answered: false,
      timer: null,
      timeLeft: 30,
      startTime: Date.now(),
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
      skipBtn.style.display = state.isRetry ? 'none' : '';
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

    allBtns.forEach((btn, i) => {
      btn.disabled = true;
      const ans = answers[i];
      const check = btn.querySelector('.icon-check');
      const xmark = btn.querySelector('.icon-x');

      if (ans.correct) {
        btn.classList.add('qr-answer--correct');
        if (check) check.style.display = '';
      } else if (i === chosenIndex && !isCorrect) {
        btn.classList.add('qr-answer--wrong');
        if (xmark) xmark.style.display = '';
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
  if (fbText) fbText.innerHTML = `${t('incorrect')} <strong style="color:#fff">${correctAnswers}</strong>`;
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
    if (state.answered) return;
    if (state.isRetry) return;
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
      <div class="qr-results__stat">
        <span class="qr-results__stat-val">${state.score}</span>
        <span class="qr-results__stat-label">${t('score')}</span>
      </div>
      <div class="qr-results__stat">
        <span class="qr-results__stat-val">${state.correct}/${total}</span>
        <span class="qr-results__stat-label">${t('correct')}</span>
      </div>
      <div class="qr-results__stat">
        <span class="qr-results__stat-val">${pct}%</span>
        <span class="qr-results__stat-label">${t('accuracy')}</span>
      </div>
      <div class="qr-results__stat">
        <span class="qr-results__stat-val">${timeStr}</span>
        <span class="qr-results__stat-label">${t('time')}</span>
      </div>
    `;

    addHistoryEntry({
      id: state.quiz.id || '',
      name: state.quiz.name || 'Quiz',
      subject: state.quiz.subject || '',
      score: state.score,
      correct: state.correct,
      total: state.questions.length,
      pct: pct,
      passed: passed,
      elapsed: elapsed,
      playedAt: Date.now()
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

      if (state.timeLeft <= 0) {
        clearTimer();
        timeoutQuestion();
      }
    }, 1000);
  }

  function clearTimer() {
    if (state.timer) { clearInterval(state.timer); state.timer = null; }
    timerEl.className = 'qr-timer';
  }

  nextBtn?.addEventListener('click', nextQuestion);

  document.getElementById('qr-results-retry')?.addEventListener('click', () => {
    open(state.quiz);
  });

  document.getElementById('qr-results-close')?.addEventListener('click', () => {
    close();
  });

  document.addEventListener('keydown', e => {
    if (!overlay?.classList.contains('is-open')) return;
    if (e.key === 'Escape') { clearTimer(); close(); return; }
    if (state.answered && e.key === 'Enter') { nextQuestion(); return; }
    const num = parseInt(e.key);
    if (!isNaN(num) && num >= 1 && num <= 6 && !state.answered) {
      pickAnswer(num - 1);
    }
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
      <div class="history-card__icon">
        <img src="img/quizzes.png" alt="">
      </div>
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

  function isMobile() {
    return window.innerWidth <= MOBILE_BP;
  }

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
        const sectionId = btn.dataset.section;
        const desktopLink = document.querySelector(
          `.navbar-links a[data-section="${sectionId}"]`
        );
        if (desktopLink) {
          desktopLink.click();
        }
        syncActiveTab(sectionId);
      });
    });

    document.getElementById('bottom-new-quiz')?.addEventListener('click', () => {
      document.getElementById('btn-new-quiz')?.click();
    });

    document.getElementById('bottom-sidebar-btn')?.addEventListener('click', () => {
      toggleSidebar();
    });

    document.querySelectorAll('.navbar-links a[data-section]').forEach(link => {
      link.addEventListener('click', () => {
        syncActiveTab(link.dataset.section);
      });
    });

    const observer = new MutationObserver(() => {
      const active = document.querySelector('.page-section.is-active');
      if (active) {
        const id = active.id.replace('section-', '');
        syncActiveTab(id);
      }
    });

    const main = document.querySelector('.page-main');
    if (main) observer.observe(main, { childList: true, subtree: false, attributes: true, attributeFilter: ['class'] });

    document.querySelectorAll('.page-section').forEach(s => {
      observer.observe(s, { attributes: true, attributeFilter: ['class'] });
    });

    if (typeof window.applyTranslations === 'function') {
      window.applyTranslations();
    }

    const initialActive = document.querySelector('.page-section.is-active');
    if (initialActive) {
      syncActiveTab(initialActive.id.replace('section-', ''));
    } else {
      syncActiveTab('home');
    }
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

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSidebar();
  });

  document.querySelectorAll('.navbar-links a[data-section]').forEach(link => {
    link.addEventListener('click', () => {
      if (isMobile()) closeSidebar();
    });
  });

  document.addEventListener('click', e => {
    if (!isMobile()) return;

    const sidebarItem = e.target.closest('.sidebar-item:not(#settings-btn), .sidebar-folder, .sidebar-folder-quiz-item, .sidebar-fav-list a');
    if (sidebarItem) {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar?.classList.contains('is-mobile-open')) {
        setTimeout(closeSidebar, 80);
      }
    }
  });

  function init() {
    if (!isMobile()) return; 

    injectBottomNav();
    injectSidebarBackdrop();

    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', e => {
        if (isMobile()) {
          e.stopPropagation();
          closeSidebar();
        }
      });
    }
  }

  let lastMobile = isMobile();
  window.addEventListener('resize', () => {
    const mobile = isMobile();
    if (mobile && !lastMobile) {
      init();
    } else if (!mobile && lastMobile) {
      closeSidebar();
    }
    lastMobile = mobile;
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.blitziqMobile = { openSidebar, closeSidebar, toggleSidebar };
})();