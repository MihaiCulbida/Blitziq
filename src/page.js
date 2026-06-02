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
})();