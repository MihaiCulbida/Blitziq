<?php
session_start();

$logged_in = isset($_SESSION['user_id']);

if (!$logged_in) {
    header('Location: index.php');
    exit;
}

$username = htmlspecialchars($_SESSION['username']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blitziq</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="icon" type="image" href="img/logo1.png">
  <link rel="stylesheet" href="styles/page.css">
</head>
<body>

<nav class="navbar">
  <a class="navbar-logo" href="page.php">Blitz<span class="navbar-logo-badge">IQ</span></a>

  <ul class="navbar-links">
    <li><a href="#home" class="active" data-section="home">
      <img src="img/home.png" width="20" height="20" alt="">
      Home
    </a></li>
    <li><a href="#quizzes" data-section="quizzes">
      <img src="img/quizzes.png" width="20" height="20" alt="">
      My quizzes
    </a></li>
    <li><a href="#discover" data-section="discover">
      <img src="img/discover.png" width="22" height="22" alt="">
      Discover
    </a></li>
  </ul>

  <div class="navbar-search">
    <img src="img/search.png" width="14" height="14" class="navbar-search-icon" alt="">
    <input type="text" class="navbar-search-input" placeholder="Search">
  </div>

  <div class="navbar-right">
    <button class="navbar-new-btn" id="btn-new-quiz" aria-label="Create new quiz">
      <img src="img/add.png" width="14" height="14" alt="">
      New quiz
    </button>

    <button class="navbar-bell" id="btn-bell" aria-label="Notifications">
      <img src="img/bell.png" width="27" height="27" alt="">
    </button>

    <?php if ($logged_in): ?>
      <div class="navbar-avatar-wrap" id="navbar-avatar-wrap">
        <button class="navbar-avatar" id="btn-avatar" aria-label="Account menu">
          <?= strtoupper(mb_substr($username, 0, 1)) ?>
        </button>
        <div class="navbar-dropdown" id="navbar-dropdown">
          <span class="navbar-dropdown-user"><?= $username ?></span>
          <a href="index.php" class="navbar-dropdown-item">Home</a>
          <a href="logout.php" class="navbar-dropdown-item">Log out</a>
        </div>
      </div>
    <?php else: ?>
      <a href="index.php" class="navbar-avatar" style="text-decoration:none;font-size:0.75rem;">Login</a>
    <?php endif; ?>
  </div>
</nav>

<aside class="sidebar">
  <div class="sidebar-body">

    <div class="sidebar-section">
      My collections
      <button class="sidebar-toggle" id="sidebar-toggle" aria-label="Toggle sidebar">
        <img src="img/sidebar.png" width="24" height="24" alt="">
      </button>
    </div>

    <a href="#" class="sidebar-item sidebar-item--active">
      <img src="img/squares.png" width="22" height="22" alt="">
      <span class="sidebar-label">All quizzes</span>
    </a>

    <div class="sidebar-folders"></div>

    <a href="#" class="sidebar-item sidebar-item--muted">
      <img src="img/folder.png" alt="">
      <span class="sidebar-label">New folder</span>
    </a>

    <div class="sidebar-divider"></div>

    <div class="sidebar-section sidebar-section--saved">
      <span class="sidebar-label">Saved</span>
    </div>

    <a href="#" class="sidebar-item">
      <img src="img/bookmark.png" width="16" height="16" alt="">
      <span class="sidebar-label">Favorites</span>
    </a>
    <a href="#" class="sidebar-item">
      <img src="img/history.png" width="16" height="16" alt="">
      <span class="sidebar-label">History</span>
    </a>
  </div>
  <div class="sidebar-footer">
    <a href="#" class="sidebar-item">
      <img src="img/settings.png" width="16" height="16" alt="">
      <span class="sidebar-label">Settings</span>
    </a>
  </div>
</aside>

<main class="page-main">

  <section class="page-section is-active" id="section-home">
    <div class="cat-carousel-wrap">
      <div class="cat-carousel" id="cat-carousel">
        <div class="cat-track" id="cat-track">

          <div class="cat-card" style="--g1:#f97316;--g2:#ef4444">
            <div class="cat-card__bg"></div>
            <img class="cat-card__icon" src="img/science.png" alt="">
            <div class="cat-card__body">
              <h3 class="cat-card__title">Science</h3>
              <p class="cat-card__sub">Biology · Chemistry · Physics</p>
            </div>
          </div>

          <div class="cat-card" style="--g1:#8b5cf6;--g2:#6d28d9">
            <div class="cat-card__bg"></div>
            <img class="cat-card__icon" src="img/mathematics.png" alt="">
            <div class="cat-card__body">
              <h3 class="cat-card__title">Mathematics</h3>
              <p class="cat-card__sub">Algebra · Geometry · Stats</p>
            </div>
          </div>

          <div class="cat-card" style="--g1:#0ea5e9;--g2:#0284c7">
            <div class="cat-card__bg"></div>
            <img class="cat-card__icon" src="img/geography.png" alt="">
            <div class="cat-card__body">
              <h3 class="cat-card__title">Geography</h3>
              <p class="cat-card__sub">Countries · Maps · Capitals</p>
            </div>
          </div>

          <div class="cat-card" style="--g1:#10b981;--g2:#059669">
            <div class="cat-card__bg"></div>
            <img class="cat-card__icon" src="img/literature.png" alt="">
            <div class="cat-card__body">
              <h3 class="cat-card__title">Literature</h3>
              <p class="cat-card__sub">Classic · Poetry · Analysis</p>
            </div>
          </div>

          <div class="cat-card" style="--g1:#f59e0b;--g2:#d97706">
            <div class="cat-card__bg"></div>
            <img class="cat-card__icon" src="img/history1.png" alt="">
            <div class="cat-card__body">
              <h3 class="cat-card__title">History</h3>
              <p class="cat-card__sub">Ancient · Modern · Wars</p>
            </div>
          </div>

          <div class="cat-card" style="--g1:#ec4899;--g2:#db2777">
            <div class="cat-card__bg"></div>
            <img class="cat-card__icon" src="img/computer.png" alt="">
            <div class="cat-card__body">
              <h3 class="cat-card__title">Computer Science</h3>
              <p class="cat-card__sub">Coding · Algorithms · Web</p>
            </div>
          </div>

          <div class="cat-card" style="--g1:#14b8a6;--g2:#0d9488">
            <div class="cat-card__bg"></div>
            <img class="cat-card__icon" src="img/psychology.png" alt="">
            <div class="cat-card__body">
              <h3 class="cat-card__title">Psychology</h3>
              <p class="cat-card__sub">Mind · Behaviour · Theories</p>
            </div>
          </div>

          <div class="cat-card" style="--g1:#6366f1;--g2:#4338ca">
            <div class="cat-card__bg"></div>
            <img class="cat-card__icon" src="img/public.png" style="filter:invert(1)">
            <div class="cat-card__body">
              <h3 class="cat-card__title">Languages</h3>
              <p class="cat-card__sub">English · French · German</p>
            </div>
          </div>

        </div>
      </div>
      <button class="cat-arrow cat-arrow--left" id="cat-prev" aria-label="Previous">
        <img src="img/arrow-l.png" width="20" height="20" alt="Previous">
      </button>
      <button class="cat-arrow cat-arrow--right" id="cat-next" aria-label="Next">
        <img src="img/arrow-r.png" width="20" height="20" alt="Next">
      </button>
    </div>
  </section>

  <section class="page-section" id="section-quizzes">
    <p style="color:#6b7280;font-size:0.9rem;">My quizzes - coming soon.</p>
  </section>

  <section class="page-section" id="section-discover">

    <div class="disc-filters" id="disc-filters">
      <button class="disc-filter is-active" data-cat="">All</button>
      <button class="disc-filter" data-cat="Mathematics">Mathematics</button>
      <button class="disc-filter" data-cat="Biology">Biology</button>
      <button class="disc-filter" data-cat="Chemistry">Chemistry</button>
      <button class="disc-filter" data-cat="Physics">Physics</button>
      <button class="disc-filter" data-cat="History">History</button>
      <button class="disc-filter" data-cat="Geography">Geography</button>
      <button class="disc-filter" data-cat="Computer Science">Computer Science</button>
      <button class="disc-filter" data-cat="Language &amp; Literature">Language &amp; Literature</button>
      <button class="disc-filter" data-cat="Psychology">Psychology</button>
      <button class="disc-filter" data-cat="Other">Other</button>
    </div>

    <div class="disc-daily" id="disc-daily">
      <div class="disc-daily__left">
        <span class="disc-daily__eyebrow">
          <img src="img/calendar.png" width="16" height="16" style="filter: invert(1);" alt="">
          Daily quiz
        </span>
        <h2 class="disc-daily__title" id="disc-daily-title">Organic Chemistry – Functional Groups</h2>
        <p class="disc-daily__meta" id="disc-daily-meta">Chemistry · 10 questions · 30 sec / question</p>
      </div>
      <button class="disc-daily__btn" id="disc-daily-btn">
        <img src="img/arrow-right2.png" width="14" height="14" alt="">
        Start now
      </button>
    </div>

    <div class="disc-block">
      <div class="disc-block__hdr">
        <span class="disc-block__title">
          <img src="img/fire.png" width="20" height="20" alt="">
          Trending this week
        </span>
        <a href="#" class="disc-block__see-all">See all</a>
      </div>
      <div class="disc-grid disc-grid--trending" id="disc-trending"></div>
    </div>

    <div class="disc-block">
      <div class="disc-block__hdr">
        <span class="disc-block__title">
          <img src="img/star1.png" width="22" height="22" alt="">
          Recommended for you
        </span>
        <a href="#" class="disc-block__see-all">See all</a>
      </div>
      <div class="disc-grid disc-grid--recommended" id="disc-recommended"></div>
    </div>

  </section>

</main>

<div class="quiz-overlay" id="quiz-overlay" aria-hidden="true">
  <div class="quiz-modal" id="quiz-modal" role="dialog" aria-modal="true" aria-labelledby="qm-title">

    <div class="quiz-modal__header">
      <div class="quiz-modal__header-left">
        <h2 class="quiz-modal__title" id="qm-title">General information</h2>
        <span class="quiz-modal__step-label" id="qm-step-label">Step 1 of 3</span>
      </div>
      <div class="quiz-modal__header-right">
        <div class="quiz-modal__dots" aria-label="Progress">
          <div class="quiz-modal__dot is-active" id="qm-dot-1"></div>
          <div class="quiz-modal__dot" id="qm-dot-2"></div>
          <div class="quiz-modal__dot" id="qm-dot-3"></div>
        </div>
        <button class="quiz-modal__close" id="qm-close" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="quiz-modal__progress">
      <div class="quiz-modal__progress-fill" id="qm-progress"></div>
    </div>
    <div class="quiz-modal__body">
      <div class="qm-panel is-active" id="qm-panel-1">

        <div class="qm-field">
          <label class="qm-field__label" for="qm-name">Quiz name</label>
          <input class="qm-field__input" id="qm-name" type="text"
            placeholder="Biology - Animal Cell" maxlength="80" autocomplete="off">
          <span class="qm-field__hint">Maximum 80 characters</span>
        </div>

        <div class="qm-field">
          <label class="qm-field__label" for="qm-desc">
            Description <span class="qm-field__optional">optional</span>
          </label>
          <textarea class="qm-field__input qm-field__input--textarea" id="qm-desc"
            placeholder="A short description for participants..." maxlength="300"></textarea>
        </div>

        <div class="qm-row">
          <div class="qm-field">
            <label class="qm-field__label" for="qm-subject">Subject / Category</label>
            <div class="qm-field__select-wrap">
              <select class="qm-field__input qm-field__input--select" id="qm-subject">
                <option value="">Choose subject...</option>
                <option>Mathematics</option>
                <option>Biology</option>
                <option>Chemistry</option>
                <option>Physics</option>
                <option>History</option>
                <option>Geography</option>
                <option>Computer Science</option>
                <option>Language &amp; Literature</option>
                <option>Psychology</option>
                <option>Civic Education</option>
                <option>Other</option>
              </select>
              <svg class="qm-field__chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <div class="qm-field">
            <label class="qm-field__label" for="qm-lang">Language</label>
            <div class="qm-field__select-wrap">
              <select class="qm-field__input qm-field__input--select" id="qm-lang">
                <option>Romanian</option>
                <option>English</option>
                <option>French</option>
                <option>German</option>
                <option>Other</option>
              </select>
              <svg class="qm-field__chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="qm-divider"></div>
        <p class="qm-section-label">Visibility</p>

        <div class="qm-vis-group" role="group" aria-label="Quiz visibility">
          <button class="qm-vis-btn is-active" data-vis="public">
            <img class="qm-vis-btn__icon" src="img/public.png" width="20" height="20" alt="">
            <span class="qm-vis-btn__name">Public</span>
            <span class="qm-vis-btn__desc">Everyone can access</span>
          </button>
          <button class="qm-vis-btn" data-vis="private">
            <img class="qm-vis-btn__icon" src="img/draft.png" width="20" height="20" alt="">
            <span class="qm-vis-btn__name">Private</span>
            <span class="qm-vis-btn__desc">Link only</span>
          </button>
          <button class="qm-vis-btn" data-vis="draft">
            <img class="qm-vis-btn__icon" src="img/private.png" width="20" height="20" alt="">
            <span class="qm-vis-btn__name">Draft</span>
            <span class="qm-vis-btn__desc">Not publicly visible</span>
          </button>
        </div>

      </div>

      <div class="qm-panel" id="qm-panel-2">

        <div class="qm-row">
          <div class="qm-field">
            <label class="qm-field__label" for="qm-count">Number of questions</label>
            <input class="qm-field__input" id="qm-count" type="number" value="10" min="1" max="100">
            <span class="qm-field__hint">Between 1 and 100</span>
          </div>
          <div class="qm-field">
            <label class="qm-field__label" for="qm-time">Time per question</label>
            <div class="qm-time-wrap">
              <input class="qm-field__input" id="qm-time" type="number" value="30" min="5" max="300">
              <span class="qm-time-wrap__unit">sec.</span>
            </div>
            <span class="qm-field__hint">5 – 300 seconds</span>
          </div>
        </div>

        <div class="qm-divider"></div>
        <p class="qm-section-label">Answer choices</p>

        <div class="qm-answer-count">
          <span class="qm-answer-count__label">Choices per question:</span>
          <div class="qm-answer-count__controls" role="group" aria-label="Number of choices">
            <button class="qm-answer-count__btn" id="qm-count-down" aria-label="Decrease">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M2 5h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </button>
            <span class="qm-answer-count__val" id="qm-count-val" aria-live="polite">4</span>
            <button class="qm-answer-count__btn" id="qm-count-up" aria-label="Increase">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M5 2v6M2 5h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="qm-answers-preview" id="qm-answers-preview" aria-label="Answer choices preview"></div>

        <div class="qm-divider"></div>
        <p class="qm-section-label">Question type <span style="font-size:0.72rem;font-weight:400;color:#9ca3af;text-transform:none;letter-spacing:0;margin-left:4px;">can be changed per question in the editor</span></p>

        <div class="qm-type-info">
          <div class="qm-type-info__item">
            <img src="img/single.png" width="18" height="18" alt="">
            <span><strong>Single answer</strong> – one correct option</span>
          </div>
          <div class="qm-type-info__item">
            <img src="img/multi.png" width="18" height="18" alt="">
            <span><strong>Multiple answers</strong> – several correct options</span>
          </div>
          <div class="qm-type-info__item">
            <img src="img/truefalse.png" width="18" height="18" alt="">
            <span><strong>True / False</strong> – forces 2 choices</span>
          </div>
        </div>

      </div>

      <div class="qm-panel" id="qm-panel-3">

        <p class="qm-section-label">Behaviour</p>
        <div class="qm-row qm-row--3">
          <div class="qm-field">
            <label class="qm-field__label" for="qm-order">Question order</label>
            <div class="qm-field__select-wrap">
              <select class="qm-field__input qm-field__input--select" id="qm-order">
                <option value="fixed">Fixed</option>
                <option value="random">Random</option>
              </select>
              <svg class="qm-field__chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <div class="qm-field">
            <label class="qm-field__label" for="qm-aorder">Answer order</label>
            <div class="qm-field__select-wrap">
              <select class="qm-field__input qm-field__input--select" id="qm-aorder">
                <option value="fixed">Fixed</option>
                <option value="random">Random</option>
              </select>
              <svg class="qm-field__chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <div class="qm-field">
            <label class="qm-field__label" for="qm-attempts">Allowed attempts</label>
            <input class="qm-field__input" id="qm-attempts" type="number" value="1" min="1" max="10">
          </div>
        </div>

        <div class="qm-row qm-row--2">
          <div class="qm-field">
            <label class="qm-field__label" for="qm-pass">Minimum pass score (%)</label>
            <input class="qm-field__input" id="qm-pass" type="number" value="60" min="0" max="100">
          </div>
          <div class="qm-field">
            <label class="qm-field__label" for="qm-pts">Points per correct answer</label>
            <input class="qm-field__input" id="qm-pts" type="number" value="10" min="1">
          </div>
        </div>

        <div class="qm-divider"></div>
        <p class="qm-section-label">Display options</p>

        <div class="qm-toggles" role="group" aria-label="Display options">
          <button class="qm-toggle is-active" data-key="show-score">Show final score</button>
          <button class="qm-toggle is-active" data-key="show-correct">Correct answers</button>
          <button class="qm-toggle" data-key="show-timer">Visible timer</button>
          <button class="qm-toggle" data-key="show-progress">Question progress</button>
          <button class="qm-toggle" data-key="show-explain">Explanations after answer</button>
          <button class="qm-toggle" data-key="allow-skip">Allow skip</button>
        </div>

        <div class="qm-divider"></div>
        <p class="qm-section-label">Summary</p>
        <div class="qm-summary" id="qm-summary" aria-label="Configuration summary"></div>

      </div>
    </div>

    <div class="quiz-modal__footer">
      <button class="quiz-modal__btn quiz-modal__btn--ghost" id="qm-back">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Back
      </button>
      <button class="quiz-modal__btn quiz-modal__btn--ghost quiz-modal__btn--cancel" id="qm-cancel">
        Cancel
      </button>
      <button class="quiz-modal__btn quiz-modal__btn--primary" id="qm-next">
        Continue
        <img src="img/arrow-r.png" width="12" height="12" style="filter:invert(1)">
      </button>
    </div>

  </div>
</div>

<div class="notif-overlay" id="notif-overlay" aria-hidden="true">
  <div class="notif-panel" id="notif-panel" role="dialog" aria-modal="true" aria-label="Notifications">
    <div class="notif-panel__header">
      <h2 class="notif-panel__title">Notifications</h2>
      <button class="notif-panel__close" id="notif-close" aria-label="Close">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    <div class="notif-panel__body">
      <div class="notif-empty">
        <img src="img/bell.png" width="32" height="32" alt="" style="opacity:0.2;">
        <p class="notif-empty__title">No notifications yet</p>
        <p class="notif-empty__sub">You're all caught up!</p>
      </div>
    </div>
  </div>
</div>

<script src="src/page.js"></script>
</body>
</html>