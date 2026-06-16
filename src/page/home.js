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
        q.name === DAILY_QUIZ.title || q.id === DAILY_QUIZ.id
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

      if (!q) { restoreSection(); return; }

      document.querySelectorAll('.page-section').forEach(s => s.classList.remove('is-active'));
      document.querySelectorAll('.navbar-links a[data-section]').forEach(l => l.classList.remove('active'));
      searchSection.classList.add('is-active');

      const results = allQuizzes.filter(quiz =>
        quiz.name.toLowerCase().includes(q) || quiz.meta.toLowerCase().includes(q)
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
      if (e.key === 'Escape') { clearSearch(); input.blur(); }
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