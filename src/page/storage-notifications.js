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