<?php
session_start();
$logged_in = isset($_SESSION['user_id']);
$username  = $logged_in ? htmlspecialchars($_SESSION['username']) : '';
?>
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blitziq</title>
  <link rel="icon" type="image" href="img/logo1.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles/style.css">
  <link rel="stylesheet" href="styles/theme-l.css">
</head>
<body>

  <div class="overlay" id="overlay-login" role="dialog" aria-modal="true" aria-label="Log in">
    <div class="overlay-backdrop" data-close="overlay-login"></div>
    <div class="overlay-card">
      <button class="overlay-close" data-close="overlay-login" aria-label="Close">
        <img src="img/close.png" width="16" height="16">
      </button>

      <h2 class="overlay-title" data-il18n="login_title">Welcome back</h2>
      <p class="overlay-sub" data-il18n="login_sub">Log in to your account</p>

      <div id="login-error" class="overlay-alert" style="display:none;"></div>

      <form class="overlay-form" id="form-login" novalidate>
        <div class="overlay-field">
          <label for="login-email" data-il18n-text="login_email_label">Email or username</label>
          <input id="login-email" name="identifier" type="text" placeholder="you@example.com" data-il18n-placeholder="login_email_ph" autocomplete="username" required>
        </div>
        <div class="overlay-field">
          <label for="login-password" data-il18n-text="login_pass_label">Password</label>
          <div class="overlay-pw-wrap">
            <input id="login-password" name="password" type="password" placeholder="••••••••" data-il18n-placeholder="login_pass_ph" autocomplete="current-password" required>
            <button type="button" class="overlay-eye" data-target="login-password" aria-label="Toggle password visibility">
              <img src="img/eye-closed.png" width="16" height="16">
            </button>
          </div>
        </div>
        <button type="submit" class="overlay-submit" id="btn-login-submit">
          <span class="overlay-submit-text" data-il18n-text="login_btn">Log in</span>
          <span class="overlay-spinner" style="display:none;"></span>
        </button>
      </form>

      <p class="overlay-switch">
        <span data-il18n-text="login_switch">Don't have an account?</span>
        <button type="button" class="overlay-switch-btn" data-switch="overlay-signup" data-il18n-text="login_switch_btn">Sign up</button>
      </p>
    </div>
  </div>

  <div class="overlay" id="overlay-signup" role="dialog" aria-modal="true" aria-label="Sign up">
    <div class="overlay-backdrop" data-close="overlay-signup"></div>
    <div class="overlay-card">
      <button class="overlay-close" data-close="overlay-signup" aria-label="Close">
        <img src="img/close.png" width="16" height="16">
      </button>

      <h2 class="overlay-title" data-il18n="signup_title">Create account</h2>
      <p class="overlay-sub" data-il18n="signup_sub">Join thousands of quiz creators</p>

      <div id="signup-error" class="overlay-alert" style="display:none;"></div>
      <div id="signup-success" class="overlay-alert overlay-alert--success" style="display:none;"></div>

      <form class="overlay-form" id="form-signup" novalidate>
        <div class="overlay-field">
          <label for="signup-username" data-il18n-text="signup_user_label">Username</label>
          <input id="signup-username" name="username" type="text" placeholder="coolquizmaster" data-il18n-placeholder="signup_user_ph" autocomplete="username" required>
        </div>
        <div class="overlay-field">
          <label for="signup-email" data-il18n-text="signup_email_label">Email</label>
          <input id="signup-email" name="email" type="email" placeholder="you@example.com" data-il18n-placeholder="signup_email_ph" autocomplete="email" required>
        </div>
        <div class="overlay-field">
          <label for="signup-password" data-il18n-text="signup_pass_label">Password</label>
          <div class="overlay-pw-wrap">
            <input id="signup-password" name="password" type="password" placeholder="Min. 8 characters" data-il18n-placeholder="signup_pass_ph" autocomplete="new-password" required>
            <button type="button" class="overlay-eye" data-target="signup-password" aria-label="Toggle password visibility">
              <img src="img/eye-closed.png" width="16" height="16">
            </button>
          </div>
        </div>
        <div class="overlay-field">
          <label for="signup-confirm" data-il18n-text="signup_confirm_label">Confirm password</label>
          <div class="overlay-pw-wrap">
            <input id="signup-confirm" name="confirm" type="password" placeholder="Repeat password" data-il18n-placeholder="signup_confirm_ph" autocomplete="new-password" required>
            <button type="button" class="overlay-eye" data-target="signup-confirm" aria-label="Toggle password visibility">
              <img src="img/eye-closed.png" width="16" height="16">
            </button>
          </div>
        </div>
        <button type="submit" class="overlay-submit" id="btn-signup-submit">
          <span class="overlay-submit-text" data-il18n-text="signup_btn">Create account</span>
          <span class="overlay-spinner" style="display:none;"></span>
        </button>
      </form>

      <p class="overlay-switch">
        <span data-il18n-text="signup_switch">Already have an account?</span>
        <button type="button" class="overlay-switch-btn" data-switch="overlay-login" data-il18n-text="signup_switch_btn">Log in</button>
      </p>
    </div>
  </div>

  <nav class="navbar">
    <a class="navbar-logo">Blitz<span class="navbar-logo-badge">IQ</span></a>

    <ul class="navbar-links">
      <li><a href="#hero" data-il18n-text="nav_home">Home</a></li>
      <li><a href="#features" data-il18n-text="nav_features">Features</a></li>
      <li><a href="#game" data-il18n-text="nav_demo">Demo</a></li>
      <li><a href="#about" data-il18n-text="nav_about">About</a></li>
      <li><a href="#cta" data-il18n-text="nav_contact">Contact</a></li>
    </ul>

    <div class="navbar-actions">
      <div class="navbar-lang-wrap" id="navbar-lang-wrap">
        <button type="button" class="navbar-btn navbar-btn-lang" id="btn-lang-toggle">EN</button>
        <div class="navbar-lang-dropdown" id="navbar-lang-dropdown">
          <button class="navbar-lang-option" data-lang="en">English</button>
          <button class="navbar-lang-option" data-lang="ro">Română</button>
          <button class="navbar-lang-option" data-lang="ru">Русский</button>
        </div>
      </div>
      
      <?php if ($logged_in): ?>
        <span class="navbar-username"><?= $username ?></span>
        <div class="navbar-avatar-wrap" id="navbar-avatar-wrap">
          <button class="navbar-avatar" id="btn-avatar" aria-label="Account menu">
            <?= strtoupper(mb_substr($username, 0, 1)) ?>
          </button>
          <div class="navbar-dropdown" id="navbar-dropdown">
            <span class="navbar-dropdown-user"><?= $username ?></span>
            <a href="#" class="navbar-dropdown-item" id="btn-dark-toggle">
              <img src="img/moon.png" id="theme-toggle-icon" width="18" height="18" alt="Dark mode">
              <span data-il18n-text="nav_theme">Theme</span>
            </a>
            <a href="php/logout.php" class="navbar-dropdown-item">
        <img src="img/logout.png" width="16" height="16" alt="">
        <span data-il18n-text="nav_logout">Log out</span>
      </a>
    </div>
  </div>
<?php else: ?>
  <button type="button" class="navbar-btn navbar-btn-login" id="btn-open-login" data-il18n-text="nav_login">Log in</button>
  <button type="button" class="navbar-btn navbar-btn-signup" id="btn-open-signup" data-il18n-text="nav_signup">Sign up</button>
<?php endif; ?>
</div>
</nav>
<section class="hero" id="hero">
  <canvas id="hero-canvas"></canvas>

  <div class="hero-content">
    <h1 class="hero-title" data-il18n="hero_title">The fastest way to<br>run live quizzes</h1>
    <h2 class="hero-subtext" data-il18n-text="hero_sub">Your crowd. Your questions.</h2>
    <p class="hero-desc" data-il18n-text="hero_desc">Create, share, and host real-time quizzes - for classrooms, events, or just for fun.</p>
    <div class="hero-actions">
      <button class="hero-btn hero-btn-primary" onclick="if(document.querySelector('.navbar-avatar')){window.location.href='page.php'}else{showToast(window.tl('toast_not_logged'))}">
        <span data-il18n-text="hero_start">Start creating</span>
        <img class="hero-btn-img" src="img/arrow-right1.png">
      </button>
      <button class="hero-btn hero-btn-secondary" onclick="if(document.querySelector('.navbar-avatar')){window.location.href='page.php#discover'}else{showToast(window.tl('toast_not_logged'))}">
        <img class="hero-btn2-img" src="img/arrow-right2.png">
        <span data-il18n-text="hero_try">Try a quiz</span>
      </button>
    </div>
  </div>

  <div class="hero-join">
    <h3 class="hero-join-title" data-il18n-text="hero_join_title">Try it now</h3>
    <div class="hero-join-row">
      <input class="hero-join-input" type="text" placeholder="Code" data-il18n-placeholder="hero_join_ph">
      <button class="hero-join-btn">
        <span data-il18n-text="hero_join_btn">Join</span>
        <img class="hero-join-img" src="img/arrow-right1.png">
      </button>
    </div>
  </div>
</section>

  <div class="fs" id="features">
    <h2 class="fs-heading" data-il18n="features_heading">Everything you need.<br><span>Nothing you don't.</span></h2>
    <div class="fs-grid">

      <div class="fs-card">
        <p class="fs-num">01</p>
        <h3 class="fs-title" data-il18n-text="feat1_title">Build a quiz in under a minute</h3>
        <p class="fs-desc" data-il18n-text="feat1_desc">Type your questions, pick the right answer, set a timer. No learning curve, just a clean editor that gets out of your way.</p>
        <div class="mock-q">What is the capital of France?</div>
        <div class="mock-opts">
          <div class="mock-opt"><div class="dot"></div>Berlin</div>
          <div class="mock-opt ok"><div class="dot ok"></div>Paris</div>
          <div class="mock-opt"><div class="dot"></div>Madrid</div>
          <div class="mock-opt"><div class="dot"></div>Rome</div>
        </div>
      </div>

      <div class="fs-card" style="align-items:center;">
        <p class="fs-num">02</p>
        <h3 class="fs-title" data-il18n-text="feat2_title">Timed pressure</h3>
        <p class="fs-desc" style="text-align:center;" data-il18n-text="feat2_desc">Every question has a countdown. Fast answers score more.</p>
        <div class="mock-timer-wrap">
          <div class="mock-timer">12</div>
          <div class="mock-timer-label" data-il18n-text="feat2_sec">seconds left</div>
        </div>
      </div>

      <div class="fs-card">
        <p class="fs-num">03</p>
        <h3 class="fs-title" data-il18n-text="feat3_title">Results after every session</h3>
        <p class="fs-desc" data-il18n-text="feat3_desc">See which questions people skipped the most and their percentage.</p>
        <div class="mock-results" style="margin-top:8px;">
          <div class="mock-r-row">
            <span class="mock-r-label">Q1</span>
            <div class="mock-r-track"><div class="mock-r-fill hi" style="width:91%"></div></div>
            <span class="mock-r-val">91%</span>
          </div>
          <div class="mock-r-row">
            <span class="mock-r-label">Q2</span>
            <div class="mock-r-track"><div class="mock-r-fill" style="width:58%"></div></div>
            <span class="mock-r-val">58%</span>
          </div>
          <div class="mock-r-row">
            <span class="mock-r-label">Q3</span>
            <div class="mock-r-track"><div class="mock-r-fill" style="width:34%"></div></div>
            <span class="mock-r-val">34%</span>
          </div>
          <div class="mock-r-pills">
            <div class="mock-r-pill"><div class="mock-r-pill-num">24</div><div class="mock-r-pill-sub" data-il18n-text="feat3_players">players</div></div>
            <div class="mock-r-pill accent"><div class="mock-r-pill-num">68%</div><div class="mock-r-pill-sub" data-il18n-text="feat3_avg">avg score</div></div>
            <div class="mock-r-pill"><div class="mock-r-pill-num">8</div><div class="mock-r-pill-sub" data-il18n-text="feat3_questions">questions</div></div>
          </div>
        </div>
      </div>

    </div>
  </div>

<section class="game" id="game">
  <div class="game-head">
    <h2 class="game-title">
      Play<span class="game-title-amp">&amp;</span>Learn
      <span class="game-badge" data-il18n-text="game_badge">Interactive</span>
    </h2>
  </div>

  <div class="game-card" id="game-card">
    <div class="game-prog" id="game-prog" style="width:33%"></div>

    <div id="game-main">
      <div class="game-top">
        <span class="game-num" id="g-num">Question 1 of 3</span>
        <div class="game-timer-wrap">
          <span class="game-timer" id="g-timer">15</span>s
        </div>
      </div>

      <div class="game-body">
        <div class="game-question" id="g-text"></div>
        <div class="game-code" id="g-code"></div>
        <div class="game-opts" id="g-opts"></div>
        <div class="game-feedback" id="g-feedback"></div>
        <button class="game-next" id="btn-next">
          <span data-il18n-text="game_next_q">Next question</span> <img src="img/arrow-right1.png" class="game-next-img">
        </button>
      </div>
    </div>

    <div class="game-result" id="game-result">
      <div class="game-score-ring">
        <span class="game-score-num" id="g-score">0</span>
        <span class="game-score-max">/ 3</span>
      </div>
      <div class="game-result-title" id="g-result-title"></div>
      <div class="game-result-sub" id="g-result-sub"></div>
      <button class="game-restart" id="btn-restart">
        <span data-il18n-text="game_try_again">Try again</span> <img src="img/again.png" class="game-next-img">
      </button>
    </div>
  </div>

  <div class="game-dots">
    <div class="game-dot active" id="gdot-0"></div>
    <div class="game-dot" id="gdot-1"></div>
    <div class="game-dot" id="gdot-2"></div>
  </div>
</section>

<section class="about" id="about">
  <div class="about-inner">
    <div class="about-header">
      <h2 class="about-heading" data-il18n="about_heading">Built for speed.<br><span>Designed for everyone.</span></h2>
    </div>
    <div class="about-grid">
      <div class="about-card">
        <div class="about-num">01</div>
        <h3 class="about-card-title" data-il18n-text="about1_title">Create in seconds</h3>
        <p class="about-card-desc" data-il18n-text="about1_desc">Add your questions, set the timer and you're ready. No complicated setup, no learning curve.</p>
      </div>
      <div class="about-card">
        <div class="about-num">02</div>
        <h3 class="about-card-title" data-il18n-text="about2_title">Play live with anyone</h3>
        <p class="about-card-desc" data-il18n-text="about2_desc">Share a simple code and participants join instantly from any device, anywhere.</p>
      </div>
      <div class="about-card">
        <div class="about-num">03</div>
        <h3 class="about-card-title" data-il18n-text="about3_title">Multiple choice questions</h3>
        <p class="about-card-desc" data-il18n-text="about3_desc">4 answer options, one correct. Simple for players, efficient for the host.</p>
      </div>
      <div class="about-card">
        <div class="about-num">04</div>
        <h3 class="about-card-title" data-il18n-text="about4_title">Detailed analytics</h3>
        <p class="about-card-desc" data-il18n-text="about4_desc">See which questions were hardest and how well your group performed after each session.</p>
      </div>
      <div class="about-card">
        <div class="about-num">05</div>
        <h3 class="about-card-title" data-il18n-text="about5_title">For any occasion</h3>
        <p class="about-card-desc" data-il18n-text="about5_desc">Classroom, team building, party or event, Blitziq adapts to your context.</p>
      </div>
      <div class="about-card">
        <div class="about-num">06</div>
        <h3 class="about-card-title" data-il18n-text="about6_title">Free to start</h3>
        <p class="about-card-desc" data-il18n-text="about6_desc">Create your account and launch your first quiz in less than 2 minutes. No credit card needed.</p>
      </div>
    </div>
  </div>
</section>

<section class="cta" id="cta">
  <h2 class="cta-title" data-il18n-text="cta_title">Ready to run your first quiz?</h2>
  <p class="cta-desc" data-il18n-text="cta_desc">Join thousands of hosts already using Blitziq, free to start, no card needed.</p>
  <div class="cta-actions">
    <button class="hero-btn hero-btn-primary" id="btn-cta-signup">
      <span data-il18n-text="cta_signup">Create account</span> <img class="hero-btn-img" src="img/arrow-right1.png">
    </button>
    <button class="hero-btn hero-btn-secondary" id="btn-cta-contact">
      <img class="hero-btn2-img" src="img/arrow-right2.png"> <span data-il18n-text="cta_contact">Talk to us</span>
    </button>
  </div>
</section>

<footer class="footer">
  <div class="footer-top">
    <div class="footer-brand">
      <a class="footer-logo">Blitz<span>IQ</span></a>
      <p class="footer-brand-desc" data-il18n-text="footer_desc">The interactive quiz platform that makes learning captivating for students and professionals alike.</p>
    </div>
    <div class="footer-col">
      <h4 class="footer-col-title" data-il18n-text="footer_product">Product</h4>
      <ul>
        <li><a href="#features" data-il18n-text="footer_features">Features</a></li>
        <li><a href="#game" data-il18n-text="footer_demo">Demo game</a></li>
        <li><a href="#about" data-il18n-text="footer_about">About</a></li>
        <li><a href="#cta" data-il18n-text="footer_contact">Contact</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4 class="footer-col-title" data-il18n-text="footer_company">Company</h4>
      <ul>
        <li><a href="#" data-open="overlay-contact" data-il18n-text="footer_contacts">Contacts</a></li>
        <li><a href="#" data-open="overlay-about" data-il18n-text="footer_about">About</a></li>
        <li><a href="#" data-open="overlay-terms" data-il18n-text="footer_terms">Terms &amp; Conditions</a></li>
        <li><a href="#" data-open="overlay-privacy" data-il18n-text="footer_privacy">Privacy Policy</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4 class="footer-col-title" data-il18n-text="footer_socials">Socials</h4>
      <ul class="footer-socials">
        <li><a href="https://github.com/MihaiCulbida" target="_blank"><img src="img/github.png" width="30" height="30"></a></li>
        <li><a href="https://instagram.com/acsiless" target="_blank"><img src="img/instagram.png" width="30" height="30"></a></li>
        <li><a href="https://t.me/acsiless" target="_blank"><img src="img/telegram.png" width="30" height="30"></a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <p data-il18n-text="footer_copy">© 2026 Blitziq</p>
  </div>
</footer>

<div class="overlay" id="overlay-contact" role="dialog" aria-modal="true" aria-label="Contact">
  <div class="overlay-backdrop" data-close="overlay-contact"></div>
  <div class="overlay-card">
    <button class="overlay-close" data-close="overlay-contact" aria-label="Close">
      <img src="img/close.png" width="16" height="16">
    </button>

    <h2 class="overlay-title" data-il18n="contact_title">Get in touch</h2>
    <p class="overlay-sub" data-il18n="contact_sub">We'll get back to you as soon as possible</p>

    <?php if ($logged_in): ?>
      <div id="contact-error" class="overlay-alert" style="display:none;"></div>
      <div id="contact-success" class="overlay-alert overlay-alert--success" style="display:none;"></div>
      <form class="overlay-form" id="form-contact" novalidate>
        <div class="overlay-field">
          <label for="contact-to" data-il18n-text="contact_to_label">To</label>
          <input id="contact-to" type="email" value="clbidamihai@gmail.com" readonly>
        </div>
        <div class="overlay-field">
          <label for="contact-subject" data-il18n-text="contact_subj_label">Subject</label>
          <input id="contact-subject" name="subject" type="text" placeholder="What's this about?" data-il18n-placeholder="contact_subj_ph" required>
        </div>
        <div class="overlay-field">
          <label for="contact-msg" data-il18n-text="contact_msg_label">Message</label>
          <textarea id="contact-msg" name="message" rows="4" placeholder="Your message..." data-il18n-placeholder="contact_msg_ph" required style="resize:vertical;"></textarea>
        </div>
        <button type="submit" class="overlay-submit" id="btn-contact-submit">
          <span class="overlay-submit-text" data-il18n-text="contact_send">Send message</span>
          <span class="overlay-spinner" style="display:none;"></span>
        </button>
      </form>
    <?php else: ?>
      <p class="overlay-sub" style="margin-top:0;">
        <a href="#" id="contact-login-link" style="color:var(--accent);" data-il18n-text="contact_login_link">Log in</a>
        <span data-il18n-text="contact_login_pre">to send a message directly.</span>
      </p>
    <?php endif; ?>

    <div class="contact-socials">
      <p class="contact-socials-label" data-il18n-text="contact_socials">Or reach out on socials</p>
      <div class="contact-socials-row">
        <a href="https://github.com/MihaiCulbida" target="_blank"><img src="img/github.png" width="28" height="28"></a>
        <a href="https://instagram.com/acsiless" target="_blank"><img src="img/instagram.png" width="28" height="28"></a>
        <a href="https://t.me/acsiless" target="_blank"><img src="img/telegram.png" width="28" height="28"></a>
      </div>
    </div>
  </div>
</div>

<div class="overlay" id="overlay-about" role="dialog" aria-modal="true" aria-labelledby="about-title">
  <div class="overlay-backdrop" data-close="overlay-about"></div>
  <div class="overlay-card info-card">

    <button class="overlay-close" data-close="overlay-about" aria-label="Close">
      <img src="img/close.png" width="16" height="16">
    </button>

    <h2 class="overlay-title" id="about-title" data-il18n-text="about_ov_title">About BlitzIQ</h2>

    <div class="info-section">
      <p class="info-label" data-il18n-text="about_ov_q_label">What is BlitzIQ?</p>
      <p class="info-text" data-il18n="about_ov_q_text">BlitzIQ is a live quiz platform. A question appears, a timer counts down, you answer fast. Simple to host, instant to join, built for classrooms, events, or anyone who thinks learning should feel like a game.</p>
    </div>

    <div class="info-section">
      <p class="info-label" data-il18n-text="about_ov_score_label">How scoring works</p>
      <p class="info-text" data-il18n="about_ov_score_text">Every correct answer scores points. Answer faster and you score <strong>more</strong> - the timer is part of the game. Wrong or late answers score zero. Final rankings are shown after the last question.</p>
    </div>

    <div class="info-section">
      <p class="info-label" data-il18n-text="about_ov_types_label">Question types</p>
      <p class="info-text" data-il18n="about_ov_types_text">Multiple choice with up to <strong>6 options</strong>, true/false, and timed open questions. Each quiz supports up to <strong>100 questions</strong>, with per-question time limits from 5 to 300 seconds.</p>
    </div>

    <div class="info-footer">
      <p class="info-footer-note" data-il18n-text="about_ov_built">Built by Culbida Mihail</p>
      <button class="info-footer-btn" id="btn-about-create" data-il18n-text="about_ov_create">
        Start creating <img src="img/arrow-right1.png" width="13" height="13">
      </button>
    </div>

  </div>
</div>

<div class="overlay" id="overlay-terms" role="dialog" aria-modal="true" aria-labelledby="terms-title">
  <div class="overlay-backdrop" data-close="overlay-terms"></div>
  <div class="overlay-card info-card">

    <button class="overlay-close" data-close="overlay-terms" aria-label="Close">
      <img src="img/close.png" width="16" height="16">
    </button>

    <h2 class="overlay-title" id="terms-title" data-il18n-text="terms_title">Terms &amp; Conditions</h2>

    <div class="info-section">
      <p class="info-label" data-il18n-text="terms_using_label">Using the platform</p>
      <p class="info-text" data-il18n="terms_using_text">BlitzIQ is open to anyone aged <strong>13 or older</strong>. Use is permitted for personal, non-commercial purposes only. We reserve the right to suspend any account without prior notice if these terms are violated.</p>
    </div>

    <div class="info-section">
      <p class="info-label" data-il18n-text="terms_ip_label">Intellectual property</p>
      <p class="info-text" data-il18n="terms_ip_text">The interface, logo, code, and all other elements of the platform are protected by copyright and belong to BlitzIQ. Content created by users - questions, answers, quizzes, remains their property. Reproducing or distributing platform elements without written permission is prohibited.</p>
    </div>

    <div class="info-section">
      <p class="info-label" data-il18n-text="terms_liab_label">Liability</p>
      <p class="info-text" data-il18n="terms_liab_text">BlitzIQ is provided without guarantees of uninterrupted availability or data accuracy. The owner cannot be held liable for data loss, service interruptions, or any damages resulting from the use of the platform.</p>
    </div>

    <div class="info-section">
      <p class="info-label" data-il18n-text="terms_conduct_label">Conduct</p>
      <p class="info-text" data-il18n="terms_conduct_text">Publishing content that is illegal, misleading, or harmful to others is strictly prohibited. Attempts to copy, reverse-engineer, or exploit the platform, as well as any automated use that disrupts normal service - are not permitted.</p>
    </div>

    <div class="info-footer">
      <p class="info-footer-note">BlitzIQ · 2026</p>
      <button class="info-footer-btn" id="btn-terms-accept" data-il18n-text="terms_accept">Got it</button>
    </div>
  </div>
</div>

<div class="overlay" id="overlay-privacy" role="dialog" aria-modal="true" aria-labelledby="privacy-title">
  <div class="overlay-backdrop" data-close="overlay-privacy"></div>
  <div class="overlay-card info-card">

    <button class="overlay-close" data-close="overlay-privacy" aria-label="Close">
      <img src="img/close.png" width="16" height="16">
    </button>

    <h2 class="overlay-title" id="privacy-title" data-il18n-text="privacy_title">Privacy Policy</h2>

    <div class="info-section">
      <p class="info-label" data-il18n-text="privacy_collect_label">What we collect</p>
      <p class="info-text" data-il18n="privacy_collect_text">When you create an account, we store your <strong>username</strong> and <strong>email address</strong>. When you create or play a quiz, we store the content and results associated with your account. We do not collect payment information, location data, or any data beyond what is necessary to run the platform.</p>
    </div>

    <div class="info-section">
      <p class="info-label" data-il18n-text="privacy_use_label">How we use it</p>
      <p class="info-text" data-il18n="privacy_use_text">Your data is used solely to provide and improve the BlitzIQ service - account authentication, displaying your quizzes, and showing session results. We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
    </div>

    <div class="info-section">
      <p class="info-label" data-il18n-text="privacy_cookies_label">Cookies</p>
      <p class="info-text" data-il18n="privacy_cookies_text">BlitzIQ uses a single session cookie to keep you logged in. No tracking cookies, no analytics cookies, no third-party advertising scripts. The session cookie is deleted when you log out or close the browser.</p>
    </div>

    <div class="info-section">
      <p class="info-label" data-il18n-text="privacy_rights_label">Your rights</p>
      <p class="info-text" data-il18n="privacy_rights_text">You can request the deletion of your account and all associated data at any time by contacting us directly. We will process the request within a reasonable timeframe and confirm once complete.</p>
    </div>

    <div class="info-footer">
      <p class="info-footer-note">BlitzIQ · 2026</p>
      <button class="info-footer-btn" id="btn-privacy-accept" data-il18n-text="privacy_accept">Got it</button>
    </div>
  </div>
</div>

<script>

(function(){
  const THEME_KEY = 'blitziq-dark';
  const html = document.documentElement;
  if (localStorage.getItem(THEME_KEY) === '1') html.classList.add('dark');

  document.addEventListener('DOMContentLoaded', function () {
    const icon = document.getElementById('theme-toggle-icon');

    function applyThemeIcon(isDark) {
      if (!icon) return;
      icon.src = isDark ? 'img/sun.png' : 'img/moon.png';
      icon.classList.toggle('theme-icon-sun', isDark);
    }

    applyThemeIcon(localStorage.getItem(THEME_KEY) === '1');

    document.addEventListener('click', function(e) {
      const btn = e.target.closest('#btn-dark-toggle');
      if (!btn) return;
      e.stopPropagation();
      const isDark = html.classList.toggle('dark');
      localStorage.setItem(THEME_KEY, isDark ? '1' : '0');
      applyThemeIcon(isDark);
    });
  });
})();
</script>
  <script src="src/toast.js"></script>
  <script src="src/translatel.js"></script>
  <script src="src/hero.js"></script>
  <script src="src/overlays.js"></script>
  <script src="src/quiz-game.js"></script>
</body>
</html>