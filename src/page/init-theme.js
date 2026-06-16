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
 