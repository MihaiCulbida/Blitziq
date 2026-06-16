<?php 
require_once 'php/functions.php';
session_start();

$logged_in = isset($_SESSION['user_id']);
$username = $logged_in ? htmlspecialchars($_SESSION['username']) : '';

if ($logged_in) {
    $dir = __DIR__ . '/data';
    if (!is_dir($dir)) mkdir($dir, 0777, true);
    $userFile = $dir . '/user_' . $_SESSION['user_id'] . '_data.json';
    if (!file_exists($userFile)) {
        file_put_contents($userFile, json_encode([
            'quizzes' => [],
            'folders' => [],
            'saved' => [],
            'notifs' => []
        ]));
    }
}
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
  <link rel="stylesheet" href="styles/page/page.css">
  <link rel="stylesheet" href="styles/page/history.css">
  <link rel="stylesheet" href="styles/page/theme-p.css">
  <link rel="stylesheet" href="styles/page/mobile.css">
</head>
<body>

<nav class="navbar">
  <a class="navbar-logo" href="page.php">Blitz<span class="navbar-logo-badge">IQ</span></a>

  <ul class="navbar-links">
    <li><a href="#home" class="active" data-section="home">
      <img src="img/home.png" width="20" height="20" alt="">
      <span data-i18n="home">Home</span>
    </a></li>
    <li><a href="#quizzes" data-section="quizzes">
      <img src="img/quizzes.png" width="20" height="20" alt="">
      <span data-i18n="my_quizzes">My quizzes</span>
    </a></li>
    <li><a href="#discover" data-section="discover">
      <img src="img/discover.png" width="22" height="22" alt="">
      <span data-i18n="discover">Discover</span>
    </a></li>
  </ul>

  <div class="navbar-search">
    <img src="img/search.png" width="14" height="14" class="navbar-search-icon" alt="">
    <input type="text" class="navbar-search-input" data-i18n-placeholder="search_placeholder" placeholder="Search">
  </div>

  <div class="navbar-right">
    <button class="navbar-new-btn" id="btn-new-quiz" aria-label="Create new quiz">
      <img src="img/add.png" width="14" height="14" alt="">
      <span data-i18n="new_quiz">New quiz</span>
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
          <a href="#" class="navbar-dropdown-item" id="btn-avatar-profile">
            <img src="img/user.png" width="20" height="20" alt="">
            <span data-i18n="profile">Profile</span>
          </a>
          <a href="index.php" class="navbar-dropdown-item">
            <img src="img/home.png" width="16" height="16" alt="">
            <span data-i18n="home">Home</span>
          </a>
          <a href="#" class="navbar-dropdown-item" id="btn-avatar-contact">
            <img src="img/contact.png" width="18" height="18" alt="">
            <span data-i18n="contact">Contact</span>
          </a>
          <a href="#" class="navbar-dropdown-item" id="btn-avatar-help">
            <img src="img/help.png" width="18" height="18" alt="">
            <span data-i18n="help">Help</span>
          </a>
          <a href="php/logout.php" class="navbar-dropdown-item">
            <img src="img/logout.png" width="16" height="16" alt="">
            <span data-i18n="log_out">Log out</span>
          </a>
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
      <span data-i18n="my_collections">My collections</span>
      <button class="sidebar-toggle" id="sidebar-toggle" aria-label="Toggle sidebar">
        <img src="img/sidebar.png" width="24" height="24" alt="">
      </button>
    </div>

    <a href="#" class="sidebar-item sidebar-item--active">
      <img src="img/squares.png" width="22" height="22" alt="">
      <span class="sidebar-label" data-i18n="all_quizzes">All quizzes</span>
    </a>

    <div class="sidebar-folders"></div>

    <a href="#" class="sidebar-item sidebar-item--muted">
      <img src="img/folder.png" alt="">
      <span class="sidebar-label" data-i18n="new_folder">New folder</span>
    </a>

    <div class="sidebar-divider"></div>

    <div class="sidebar-section sidebar-section--saved">
      <span class="sidebar-label" data-i18n="saved">Saved</span>
    </div>

    <a href="#" class="sidebar-item">
      <img src="img/bookmark.png" width="16" height="16" alt="">
      <span class="sidebar-label" data-i18n="favorites">Favorites</span>
    </a>
    <a href="#" class="sidebar-item" id="btn-history">
      <img src="img/history.png" width="16" height="16" alt="">
      <span class="sidebar-label" data-i18n="history">History</span>
    </a>
  </div>
  <div class="sidebar-footer">
    <div class="sidebar-settings-wrap">
      <a href="#" class="sidebar-item" id="settings-btn">
        <img src="img/settings.png" width="16" height="16" alt="">
        <span class="sidebar-label" data-i18n="settings">Settings</span>
      </a>
      <div class="sidebar-settings-dropdown" id="settings-dropdown">
        <a href="#" class="sidebar-settings-item" id="settings-theme">
          <img src="img/moon.png" width="16" height="16" alt="">
          <span data-i18n="theme">Theme</span>
        </a>
        <div class="settings-lang-wrap">
          <a href="#" class="sidebar-settings-item" id="settings-language">
            <img src="img/public.png" width="16" height="16" alt="">
            <span data-i18n="language">Language</span>
            <img src="img/arrow-r.png" width="10" height="10" alt="" style="margin-left:auto;opacity:0.4;">
          </a>
          <div class="settings-lang-dropdown" id="settings-lang-dropdown">
            <button class="settings-lang-btn is-active" data-lang="en">English</button>
            <button class="settings-lang-btn" data-lang="ro">Română</button>
            <button class="settings-lang-btn" data-lang="ru">Русский</button>
          </div>
        </div>
        <a href="#" class="sidebar-settings-item" id="settings-help">
          <img src="img/help.png" width="18" height="18" alt="">
          <span data-i18n="help">Help</span>
        </a>
        <a href="php/logout.php" class="sidebar-settings-item">
          <img src="img/logout.png" width="16" height="16" alt="">
          <span data-i18n="log_out">Log out</span>
        </a>
      </div>
    </div>
  </div>
</aside>

<main class="page-main">

  <section class="page-section is-active" id="section-home">
    <div class="cat-carousel-wrap">
      <div class="cat-carousel" id="cat-carousel">
        <div class="cat-track" id="cat-track">

          <div class="cat-card" style="--g1:#f97316;--g2:#ef4444" data-cat="Biology">
            <div class="cat-card__bg"></div>
            <img class="cat-card__icon" src="img/science.png" alt="">
            <div class="cat-card__body">
              <h3 class="cat-card__title" data-i18n="cat_sciences">Science</h3>
              <p class="cat-card__sub">Biology · Chemistry · Physics</p>
            </div>
          </div>

          <div class="cat-card" style="--g1:#8b5cf6;--g2:#6d28d9" data-cat="Mathematics">
            <div class="cat-card__bg"></div>
            <img class="cat-card__icon" src="img/mathematics.png" alt="">
            <div class="cat-card__body">
              <h3 class="cat-card__title" data-i18n="cat_mathematics">Mathematics</h3>
              <p class="cat-card__sub">Algebra · Geometry · Stats</p>
            </div>
          </div>

          <div class="cat-card" style="--g1:#0ea5e9;--g2:#0284c7" data-cat="Geography">
            <div class="cat-card__bg"></div>
            <img class="cat-card__icon" src="img/geography.png" alt="">
            <div class="cat-card__body">
              <h3 class="cat-card__title" data-i18n="cat_geography">Geography</h3>
              <p class="cat-card__sub">Countries · Maps · Capitals</p>
            </div>
          </div>

          <div class="cat-card" style="--g1:#10b981;--g2:#059669" data-cat="Language & Literature">
            <div class="cat-card__bg"></div>
            <img class="cat-card__icon" src="img/literature.png" alt="">
            <div class="cat-card__body">
              <h3 class="cat-card__title" data-i18n="cat_literature">Literature</h3>
              <p class="cat-card__sub">Classic · Poetry · Analysis</p>
            </div>
          </div>

          <div class="cat-card" style="--g1:#f59e0b;--g2:#d97706" data-cat="History">
            <div class="cat-card__bg"></div>
            <img class="cat-card__icon" src="img/history1.png" alt="">
            <div class="cat-card__body">
              <h3 class="cat-card__title" data-i18n="cat_history">History</h3>
              <p class="cat-card__sub">Ancient · Modern · Wars</p>
            </div>
          </div>

          <div class="cat-card" style="--g1:#ec4899;--g2:#db2777" data-cat="Computer Science">
            <div class="cat-card__bg"></div>
            <img class="cat-card__icon" src="img/computer.png" alt="">
            <div class="cat-card__body">
              <h3 class="cat-card__title" data-i18n="cat_technology">Computer Science</h3>
              <p class="cat-card__sub">Coding · Algorithms · Web</p>
            </div>
          </div>

          <div class="cat-card" style="--g1:#14b8a6;--g2:#0d9488" data-cat="Psychology">
            <div class="cat-card__bg"></div>
            <img class="cat-card__icon" src="img/psychology.png" alt="">
            <div class="cat-card__body">
              <h3 class="cat-card__title" data-i18n="cat_arts">Psychology</h3>
              <p class="cat-card__sub">Mind · Behaviour · Theories</p>
            </div>
          </div>

          <div class="cat-card" style="--g1:#6366f1;--g2:#4338ca" data-cat="Language & Literature">
            <div class="cat-card__bg"></div>
            <img class="cat-card__icon" src="img/public.png" style="filter:invert(1)">
            <div class="cat-card__body">
              <h3 class="cat-card__title" data-i18n="cat_languages">Languages</h3>
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
    <p style="color:#6b7280;font-size:0.9rem;" data-i18n="my_quizzes">My quizzes</p>
  </section>

  <section class="page-section" id="section-discover">

    <div class="disc-filters" id="disc-filters">
      <button class="disc-filter is-active" data-cat="" data-i18n="all">All</button>
      <button class="disc-filter" data-cat="Mathematics" data-i18n="cat_mathematics">Mathematics</button>
      <button class="disc-filter" data-cat="Biology" data-i18n="cat_sciences">Science</button>
      <button class="disc-filter" data-cat="History" data-i18n="cat_history">History</button>
      <button class="disc-filter" data-cat="Geography" data-i18n="cat_geography">Geography</button>
      <button class="disc-filter" data-cat="Computer Science" data-i18n="cat_technology">Computer Science</button>
      <button class="disc-filter" data-cat="Language &amp; Literature" data-i18n="cat_literature">Language &amp; Literature</button>
      <button class="disc-filter" data-cat="Psychology" data-i18n="cat_arts">Psychology</button>
      <button class="disc-filter" data-cat="Other" data-i18n="cat_general">Other</button>
    </div>

    <div class="disc-daily" id="disc-daily">
      <div class="disc-daily__left">
        <span class="disc-daily__eyebrow">
          <img src="img/calendar.png" width="16" height="16" style="filter: invert(1);" alt="">
          <span data-i18n="daily_quiz">Daily quiz</span>
        </span>
        <h2 class="disc-daily__title" id="disc-daily-title">Organic Chemistry – Functional Groups</h2>
        <p class="disc-daily__meta" id="disc-daily-meta">Chemistry · 10 questions · 30 sec / question</p>
      </div>
      <button class="disc-daily__btn" id="disc-daily-btn">
        <img src="img/arrow-right2.png" width="14" height="14" alt="">
        <span data-i18n="start_now">Start now</span>
      </button>
    </div>

    <div class="disc-block">
      <div class="disc-block__hdr">
        <span class="disc-block__title">
          <img src="img/fire.png" width="20" height="20" alt="">
          <span data-i18n="trending">Trending this week</span>
        </span>
        <a href="#" class="disc-block__see-all" data-i18n="see_all">See all</a>
      </div>
      <div class="disc-grid disc-grid--trending" id="disc-trending"></div>
    </div>

    <div class="disc-block">
      <div class="disc-block__hdr">
        <span class="disc-block__title">
          <img src="img/star1.png" width="22" height="22" alt="">
          <span data-i18n="recommended">Recommended for you</span>
        </span>
        <a href="#" class="disc-block__see-all" data-i18n="see_all">See all</a>
      </div>
      <div class="disc-grid disc-grid--recommended" id="disc-recommended"></div>
    </div>

  </section>

</main>

<div class="history-overlay" id="history-overlay" aria-hidden="true">
  <div class="history-panel" id="history-panel" role="dialog" aria-modal="true" aria-label="History">
    <div class="history-panel__header">
      <h2 class="history-panel__title" data-i18n="history_title">History</h2>
      <button class="history-panel__close" id="history-close" aria-label="Close">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    <div class="history-panel__body" id="history-body">
      <div class="history-empty" id="history-empty">
        <img src="img/history.png" width="32" height="32" alt="" style="opacity:0.2;">
        <p class="history-empty__title" data-i18n="no_history_title">No history yet</p>
        <p class="history-empty__sub" data-i18n="no_history_sub">Quizzes you play will appear here</p>
      </div>
      <div class="history-list" id="history-list"></div>
    </div>
  </div>
</div>

<div class="settings-overlay" id="settings-profile-overlay" aria-hidden="true">
  <div class="settings-modal" role="dialog" aria-modal="true">
    <div class="settings-modal__header">
      <h2 class="settings-modal__title" data-i18n="profile_title">Profile</h2>
      <button class="settings-modal__close" id="settings-profile-close">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    <div class="settings-modal__body">
      <div class="profile-avatar-big">
        <?= strtoupper(mb_substr($username, 0, 1)) ?>
      </div>
      <div class="profile-info">
        <p class="profile-name"><?= $username ?></p>
        <p class="profile-email"><?= $logged_in ? htmlspecialchars($_SESSION['email'] ?? 'No email') : '' ?></p>
      </div>
    </div>
  </div>
</div>

<div class="settings-overlay" id="settings-help-overlay" aria-hidden="true">
  <div class="settings-modal" role="dialog" aria-modal="true">
    <div class="settings-modal__header">
      <h2 class="settings-modal__title" data-i18n="help_title">Help</h2>
      <button class="settings-modal__close" id="settings-help-close">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    <div class="settings-modal__body">
      <div class="help-item">
        <p class="help-title" data-i18n="help_1_title">Getting started</p>
        <p class="help-desc" data-i18n="help_1_desc">Click <strong>New quiz</strong> to create your first quiz. Add questions, set a timer and publish.</p>
      </div>
      <div class="help-item">
        <p class="help-title" data-i18n="help_2_title">Playing a quiz</p>
        <p class="help-desc" data-i18n="help_2_desc">Browse quizzes in Discover, click one and press <strong>Start quiz</strong>. Answer before the timer runs out.</p>
      </div>
      <div class="help-item">
        <p class="help-title" data-i18n="help_3_title">Saving quizzes</p>
        <p class="help-desc" data-i18n="help_3_desc">Click the bookmark icon on any quiz to save it to your Favorites in the sidebar.</p>
      </div>
      <div class="help-item">
        <p class="help-title" data-i18n="help_4_title">Contact</p>
        <p class="help-desc" data-i18n="help_4_desc">Reach out via Telegram or Instagram — links in the footer of the main page.</p>
      </div>
    </div>
  </div>
</div>

<div class="settings-overlay" id="settings-language-overlay" aria-hidden="true">
  <div class="settings-modal" role="dialog" aria-modal="true">
    <div class="settings-modal__header">
      <h2 class="settings-modal__title" data-i18n="language">Language</h2>
      <button class="settings-modal__close" id="settings-language-close">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    <div class="settings-modal__body">
      <div class="lang-list">
        <button class="lang-btn is-active" data-lang="en">English</button>
        <button class="lang-btn" data-lang="ro">Română</button>
        <button class="lang-btn" data-lang="ru">Русский</button>
      </div>
    </div>
  </div>
</div>

<div class="quiz-overlay" id="quiz-overlay" aria-hidden="true">
  <div class="quiz-modal" id="quiz-modal" role="dialog" aria-modal="true" aria-labelledby="qm-title">

    <div class="quiz-modal__header">
      <div class="quiz-modal__header-left">
        <h2 class="quiz-modal__title" id="qm-title" data-i18n="general_info">General information</h2>
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
          <label class="qm-field__label" for="qm-name">
            <span data-i18n="quiz_name">Quiz name</span>
          </label>
          <input class="qm-field__input" id="qm-name" type="text"
            data-i18n-placeholder="quiz_name_placeholder"
            placeholder="Biology - Animal Cell" maxlength="80" autocomplete="off">
          <span class="qm-field__hint" data-i18n="quiz_name_hint">Maximum 80 characters</span>
        </div>

        <div class="qm-field">
          <label class="qm-field__label" for="qm-desc">
            <span data-i18n="description">Description</span>
            <span class="qm-field__optional" data-i18n="description_optional">optional</span>
          </label>
          <textarea class="qm-field__input qm-field__input--textarea" id="qm-desc"
            data-i18n-placeholder="description_placeholder"
            placeholder="A short description for participants..." maxlength="300"></textarea>
        </div>

        <div class="qm-row">
          <div class="qm-field">
            <label class="qm-field__label" for="qm-subject">
              <span data-i18n="subject_category">Subject / Category</span>
            </label>
            <div class="qm-field__select-wrap">
              <select class="qm-field__input qm-field__input--select" id="qm-subject">
                <option value="" data-i18n="choose_subject">Choose subject...</option>
                <option>Mathematics</option>
                <option>Biology</option>
                <option>Chemistry</option>
                <option>Physics</option>
                <option>History</option>
                <option>Geography</option>
                <option>Computer Science</option>
                <option>Language &amp; Literature</option>
                <option>Psychology</option>
                <option>Other</option>
              </select>
              <svg class="qm-field__chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <div class="qm-field">
            <label class="qm-field__label" for="qm-lang">
              <span data-i18n="language_label">Language</span>
            </label>
            <div class="qm-field__select-wrap">
              <select class="qm-field__input qm-field__input--select" id="qm-lang">
                <option>Romanian</option>
                <option>English</option>
                <option>Русский</option>
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
        <p class="qm-section-label" data-i18n="visibility">Visibility</p>

        <div class="qm-vis-group" role="group" aria-label="Quiz visibility">
          <button class="qm-vis-btn is-active" data-vis="public">
            <img class="qm-vis-btn__icon" src="img/public.png" width="20" height="20" alt="">
            <span class="qm-vis-btn__name" data-i18n="public">Public</span>
            <span class="qm-vis-btn__desc" data-i18n="public_desc">Everyone can access</span>
          </button>
          <button class="qm-vis-btn" data-vis="private">
            <img class="qm-vis-btn__icon" src="img/draft.png" width="20" height="20" alt="">
            <span class="qm-vis-btn__name" data-i18n="private">Private</span>
            <span class="qm-vis-btn__desc" data-i18n="private_desc">Link only</span>
          </button>
          <button class="qm-vis-btn" data-vis="draft">
            <img class="qm-vis-btn__icon" src="img/private.png" width="20" height="20" alt="">
            <span class="qm-vis-btn__name" data-i18n="draft">Draft</span>
            <span class="qm-vis-btn__desc" data-i18n="draft_desc">Not publicly visible</span>
          </button>
        </div>

      </div>

      <div class="qm-panel" id="qm-panel-2">

        <div class="qm-row">
          <div class="qm-field">
            <label class="qm-field__label" for="qm-count">
              <span data-i18n="num_questions">Number of questions</span>
            </label>
            <input class="qm-field__input" id="qm-count" type="number" value="10" min="1" max="100">
            <span class="qm-field__hint" data-i18n="between_1_100">Between 1 and 100</span>
          </div>
          <div class="qm-field">
            <label class="qm-field__label" for="qm-time">
              <span data-i18n="time_per_question">Time per question</span>
            </label>
            <div class="qm-time-wrap">
              <input class="qm-field__input" id="qm-time" type="number" value="30" min="5" max="300">
            </div>
            <span class="qm-field__hint" data-i18n="time_hint">5 – 300 seconds</span>
          </div>
        </div>

        <div class="qm-divider"></div>
        <p class="qm-section-label" data-i18n="answer_choices">Answer choices</p>

        <div class="qm-answer-count">
          <span class="qm-answer-count__label" data-i18n="choices_per_q">Choices per question:</span>
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
        <p class="qm-section-label">
          <span data-i18n="question_type">Question type</span>
          <span style="font-size:0.72rem;font-weight:400;color:#9ca3af;text-transform:none;letter-spacing:0;margin-left:4px;" data-i18n="type_hint">can be changed per question in the editor</span>
        </p>

        <div class="qm-type-info">
          <div class="qm-type-info__item">
            <img src="img/single.png" width="18" height="18" alt="">
            <span><strong data-i18n="single_answer">Single answer</strong> – <span data-i18n="single_desc">one correct option</span></span>
          </div>
          <div class="qm-type-info__item">
            <img src="img/multi.png" width="18" height="18" alt="">
            <span><strong data-i18n="multiple_answers">Multiple answers</strong> – <span data-i18n="multiple_desc">several correct options</span></span>
          </div>
          <div class="qm-type-info__item">
            <img src="img/truefalse.png" width="18" height="18" alt="">
            <span><strong data-i18n="true_false">True / False</strong> – <span data-i18n="true_false_desc">forces 2 choices</span></span>
          </div>
        </div>

      </div>

      <div class="qm-panel" id="qm-panel-3">

        <p class="qm-section-label" data-i18n="behaviour">Behaviour</p>
        <div class="qm-row qm-row--3">
          <div class="qm-field">
            <label class="qm-field__label" for="qm-order">
              <span data-i18n="question_order">Question order</span>
            </label>
            <div class="qm-field__select-wrap">
              <select class="qm-field__input qm-field__input--select" id="qm-order">
                <option value="fixed" data-i18n="fixed">Fixed</option>
                <option value="random" data-i18n="random">Random</option>
              </select>
              <svg class="qm-field__chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <div class="qm-field">
            <label class="qm-field__label" for="qm-aorder">
              <span data-i18n="answer_order">Answer order</span>
            </label>
            <div class="qm-field__select-wrap">
              <select class="qm-field__input qm-field__input--select" id="qm-aorder">
                <option value="fixed" data-i18n="fixed">Fixed</option>
                <option value="random" data-i18n="random">Random</option>
              </select>
              <svg class="qm-field__chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <div class="qm-field">
            <label class="qm-field__label" for="qm-attempts">
              <span data-i18n="allowed_attempts">Allowed attempts</span>
            </label>
            <input class="qm-field__input" id="qm-attempts" type="number" value="1" min="1" max="10">
          </div>
        </div>

        <div class="qm-row qm-row--2">
          <div class="qm-field">
            <label class="qm-field__label" for="qm-pass">
              <span data-i18n="min_pass_score">Minimum pass score (%)</span>
            </label>
            <input class="qm-field__input" id="qm-pass" type="number" value="60" min="0" max="100">
          </div>
          <div class="qm-field">
            <label class="qm-field__label" for="qm-pts">
              <span data-i18n="points_correct">Points per correct answer</span>
            </label>
            <input class="qm-field__input" id="qm-pts" type="number" value="10" min="1">
          </div>
        </div>

        <div class="qm-divider"></div>
        <p class="qm-section-label" data-i18n="display_options">Display options</p>

        <div class="qm-toggles" role="group" aria-label="Display options">
          <button class="qm-toggle is-active" data-key="show-score" data-i18n="show_final_score">Show final score</button>
          <button class="qm-toggle is-active" data-key="show-correct" data-i18n="correct_answers">Correct answers</button>
          <button class="qm-toggle" data-key="show-timer" data-i18n="visible_timer">Visible timer</button>
          <button class="qm-toggle" data-key="show-progress" data-i18n="question_progress">Question progress</button>
          <button class="qm-toggle" data-key="show-explain" data-i18n="explanations">Explanations after answer</button>
          <button class="qm-toggle" data-key="allow-skip" data-i18n="allow_skip">Allow skip</button>
        </div>

        <div class="qm-divider"></div>
        <p class="qm-section-label" data-i18n="summary">Summary</p>
        <div class="qm-summary" id="qm-summary" aria-label="Configuration summary"></div>

      </div>
    </div>

    <div class="quiz-modal__footer">
      <button class="quiz-modal__btn quiz-modal__btn--ghost" id="qm-back">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span data-i18n="back">Back</span>
      </button>
      <button class="quiz-modal__btn quiz-modal__btn--ghost quiz-modal__btn--cancel" id="qm-cancel">
        <span data-i18n="cancel">Cancel</span>
      </button>
      <button class="quiz-modal__btn quiz-modal__btn--primary" id="qm-next">
        <span data-i18n="continue">Continue</span>
        <img src="img/arrow-r.png" width="12" height="12" style="filter:invert(1)">
      </button>
    </div>

  </div>
</div>

<div class="notif-overlay" id="notif-overlay" aria-hidden="true">
  <div class="notif-panel" id="notif-panel" role="dialog" aria-modal="true" aria-label="Notifications">
    <div class="notif-panel__header">
      <h2 class="notif-panel__title" data-i18n="notifications">Notifications</h2>
      <button class="notif-panel__close" id="notif-close" aria-label="Close">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    <div class="notif-panel__body">
      <div class="notif-empty">
        <img src="img/bell.png" width="32" height="32" alt="" style="opacity:0.2;">
        <p class="notif-empty__title" data-i18n="no_notifs_title">No notifications yet</p>
        <p class="notif-empty__sub" data-i18n="no_notifs_sub">You're all caught up!</p>
      </div>
    </div>
  </div>
</div>

<div class="start-overlay" id="start-overlay" aria-hidden="true">
  <div class="start-modal" id="start-modal" role="dialog" aria-modal="true">

    <div class="start-modal__header">
      <div class="start-modal__title-wrap">
        <h2 class="start-modal__title" id="start-modal-title"></h2>
        <span class="start-modal__meta" id="start-modal-meta"></span>
      </div>
      <button class="start-modal__close" id="start-modal-close" aria-label="Close">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <div class="start-modal__body">
      <p class="start-modal__section-label" data-i18n="mode">Mode</p>
      <div class="start-modal__modes">
        <button class="start-modal__mode is-active" data-mode="single">
          <img src="img/user.png" width="22" height="22" alt="Single player">
          <span class="start-modal__mode-name" data-i18n="single_player">Single player</span>
          <span class="start-modal__mode-desc" data-i18n="single_player_desc">Practice on your own</span>
        </button>
        <button class="start-modal__mode" data-mode="multi">
          <img src="img/users.png" width="22" height="22" alt="Multiplayer">
          <span class="start-modal__mode-name" data-i18n="multiplayer">Multiplayer</span>
          <span class="start-modal__mode-desc" data-i18n="multiplayer_desc">Play with others</span>
        </button>
      </div>

      <div class="start-modal__info" id="start-modal-info"></div>
    </div>

    <div class="start-modal__footer">
      <button class="start-modal__save" id="start-modal-save">
        <img src="img/bookmark.png" width="15" height="15" alt="">
        <span data-i18n="save">Save</span>
      </button>
      <button class="start-modal__start" id="start-modal-start">
        <span data-i18n="start_quiz">Start quiz</span>
        <img src="img/arrow-right1.png" width="13" height="13" style="filter:invert(1)">
      </button>
    </div>
  </div>
</div>

<div class="overlay" id="overlay-contact" role="dialog" aria-modal="true" aria-label="Contact">
  <div class="overlay-backdrop" data-close="overlay-contact"></div>
  <div class="overlay-card">
    <button class="overlay-close" data-close="overlay-contact" aria-label="Close">
      <img src="img/close.png" width="16" height="16">
    </button>
    <h2 class="overlay-title" data-i18n="contact_title">Get in touch</h2>
    <p class="overlay-sub" data-i18n="contact_sub">We'll get back to you as soon as possible</p>
    <div id="contact-error" class="overlay-alert" style="display:none;"></div>
    <div id="contact-success" class="overlay-alert overlay-alert--success" style="display:none;"></div>
    <form class="overlay-form" id="form-contact" novalidate>
      <div class="overlay-field">
        <label for="contact-to" data-i18n="contact_to_label">To</label>
        <input id="contact-to" type="email" value="clbidamihai@gmail.com" readonly>
      </div>
      <div class="overlay-field">
        <label for="contact-subject" data-i18n="contact_subj_label">Subject</label>
        <input id="contact-subject" name="subject" type="text" data-i18n-placeholder="contact_subj_ph" placeholder="What's this about?" required>
      </div>
      <div class="overlay-field">
        <label for="contact-msg" data-i18n="contact_msg_label">Message</label>
        <textarea id="contact-msg" name="message" rows="4" data-i18n-placeholder="contact_msg_ph" placeholder="Your message..." required style="resize:vertical;"></textarea>
      </div>
      <button type="submit" class="overlay-submit" id="btn-contact-submit">
        <span class="overlay-submit-text" data-i18n="contact_send">Send message</span>
        <span class="overlay-spinner" style="display:none;"></span>
      </button>
    </form>
    <div class="contact-socials">
      <p class="contact-socials-label" data-i18n="contact_socials">Or reach out on socials</p>
      <div class="contact-socials-row">
        <a href="https://github.com/MihaiCulbida" target="_blank"><img src="img/github.png" width="28" height="28"></a>
        <a href="https://instagram.com/acsiless" target="_blank"><img src="img/instagram.png" width="28" height="28"></a>
        <a href="https://t.me/acsiless" target="_blank"><img src="img/telegram.png" width="28" height="28"></a>
      </div>
    </div>
  </div>
</div>

<div class="qr-overlay" id="qr-overlay" aria-hidden="true">

  <header class="qr-header">
    <div class="qr-header__left">
      <span class="qr-logo">Blitz<span class="qr-logo-badge">IQ</span></span>
      <span class="qr-header__name" id="qr-name"></span>
    </div>
    <div class="qr-header__center">
      <div class="qr-progress-bar">
        <div class="qr-progress-bar__fill" id="qr-progress-fill"></div>
      </div>
      <span class="qr-header__counter" id="qr-counter"></span>
    </div>
    <div class="qr-header__right">
      <div class="qr-timer" id="qr-timer">
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.5"/>
          <path d="M7 4.5V7l1.5 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span id="qr-timer-val">30</span>
      </div>
      <div class="qr-score-pill" id="qr-score-pill">
        <svg width="11" height="11" viewBox="0 0 13 13" fill="none">
          <path d="M6.5 1l1.5 3.1 3.4.5-2.5 2.4.6 3.4L6.5 9 3 10.4l.6-3.4L1 4.6l3.4-.5z" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/>
        </svg>
        <span id="qr-score-val">0</span>
      </div>
    </div>
  </header>

  <div class="qr-question" id="qr-question-wrap">
    <div class="qr-q-num" id="qr-q-num"></div>
    <h2 class="qr-q-text" id="qr-q-text"></h2>
  </div>
  
  <div class="qr-feedback" id="qr-feedback" aria-live="polite">
    <span class="qr-feedback__icon" id="qr-feedback-icon"></span>
    <span id="qr-feedback-text"></span>
  </div>
  
  <div class="qr-body" id="qr-body">
    <div class="qr-answers" id="qr-answers"></div>
  </div>

  <div class="qr-footer">
    <div class="qr-dots" id="qr-dots"></div>
    <div style="display:flex;align-items:center;gap:8px;">
      <button class="qr-skip-btn" id="qr-skip-btn">
        <span data-i18n="skip">Skip</span>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <path d="M5 2l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button class="qr-next-btn" id="qr-next-btn" style="display:none">
        <span data-i18n="next">Next</span>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <path d="M5 2l5 5-5 5" stroke="#111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>

  <div class="qr-results" id="qr-results" style="display:none">
    <div class="qr-results__badge" id="qr-results-badge"></div>
    <h2 class="qr-results__title" id="qr-results-title"></h2>
    <p class="qr-results__sub" id="qr-results-sub"></p>
    <div class="qr-results__stats" id="qr-results-stats"></div>
    <div class="qr-results__actions">
      <button class="qr-results__retry" id="qr-results-retry">
        <span data-i18n="try_again">Try again</span>
        <img src="img/again.png" width="14" height="14" style="filter:invert(1)">
      </button>
      <button class="qr-results__close" id="qr-results-close">
        <span data-i18n="back_to_quizzes">Back to quizzes</span>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <path d="M5 2l5 5-5 5" stroke="#111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</div>


<script>
  const QUIZ_DATA = <?php 
    $items = json_decode(file_get_contents('data/items.json'), true);
    echo json_encode($items);
  ?>;
</script>
<script src="src/page/translate.js"></script>
<script src="src/page/page.js"></script>
</body>
</html>