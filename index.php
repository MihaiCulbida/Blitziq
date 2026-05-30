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
</head>
<body>

  <div class="overlay" id="overlay-login" role="dialog" aria-modal="true" aria-label="Log in">
    <div class="overlay-backdrop" data-close="overlay-login"></div>
    <div class="overlay-card">
      <button class="overlay-close" data-close="overlay-login" aria-label="Close">
        <img src="img/close.png" width="16" height="16">
      </button>

      <h2 class="overlay-title">Welcome back</h2>
      <p class="overlay-sub">Log in to your account</p>

      <div id="login-error" class="overlay-alert" style="display:none;"></div>

      <form class="overlay-form" id="form-login" novalidate>
        <div class="overlay-field">
          <label for="login-email">Email or username</label>
          <input id="login-email" name="identifier" type="text" placeholder="you@example.com" autocomplete="username" required>
        </div>
        <div class="overlay-field">
          <label for="login-password">Password</label>
          <div class="overlay-pw-wrap">
            <input id="login-password" name="password" type="password" placeholder="••••••••" autocomplete="current-password" required>
              <button type="button" class="overlay-eye" data-target="login-password" aria-label="Toggle password visibility">
              <img src="img/eye-closed.png" width="16" height="16">
            </button>
          </div>
        </div>
        <button type="submit" class="overlay-submit" id="btn-login-submit">
          <span class="overlay-submit-text">Log in</span>
          <span class="overlay-spinner" style="display:none;"></span>
        </button>
      </form>

      <p class="overlay-switch">
        Don't have an account?
        <button type="button" class="overlay-switch-btn" data-switch="overlay-signup">Sign up</button>
      </p>
    </div>
  </div>

  <div class="overlay" id="overlay-signup" role="dialog" aria-modal="true" aria-label="Sign up">
    <div class="overlay-backdrop" data-close="overlay-signup"></div>
    <div class="overlay-card">
      <button class="overlay-close" data-close="overlay-signup" aria-label="Close">
        <img src="img/close.png" width="16" height="16">
      </button>

      <h2 class="overlay-title">Create account</h2>
      <p class="overlay-sub">Join thousands of quiz creators</p>

      <div id="signup-error" class="overlay-alert" style="display:none;"></div>
      <div id="signup-success" class="overlay-alert overlay-alert--success" style="display:none;"></div>

      <form class="overlay-form" id="form-signup" novalidate>
        <div class="overlay-field">
          <label for="signup-username">Username</label>
          <input id="signup-username" name="username" type="text" placeholder="coolquizmaster" autocomplete="username" required>
        </div>
        <div class="overlay-field">
          <label for="signup-email">Email</label>
          <input id="signup-email" name="email" type="email" placeholder="you@example.com" autocomplete="email" required>
        </div>
        <div class="overlay-field">
          <label for="signup-password">Password</label>
          <div class="overlay-pw-wrap">
            <input id="signup-password" name="password" type="password" placeholder="Min. 8 characters" autocomplete="new-password" required>
            <button type="button" class="overlay-eye" data-target="signup-password" aria-label="Toggle password visibility">
              <img src="img/eye-closed.png" width="16" height="16">
            </button>
          </div>
        </div>
        <div class="overlay-field">
          <label for="signup-confirm">Confirm password</label>
          <div class="overlay-pw-wrap">
            <input id="signup-confirm" name="confirm" type="password" placeholder="Repeat password" autocomplete="new-password" required>
            <button type="button" class="overlay-eye" data-target="signup-confirm" aria-label="Toggle password visibility">
              <img src="img/eye-closed.png" width="16" height="16">
            </button>
          </div>
        </div>
        <button type="submit" class="overlay-submit" id="btn-signup-submit">
          <span class="overlay-submit-text">Create account</span>
          <span class="overlay-spinner" style="display:none;"></span>
        </button>
      </form>

      <p class="overlay-switch">
        Already have an account?
        <button type="button" class="overlay-switch-btn" data-switch="overlay-login">Log in</button>
      </p>
    </div>
  </div>

  <nav class="navbar">
    <a class="navbar-logo">Blitz<span class="navbar-logo-badge">IQ</span></a>

    <ul class="navbar-links">
      <li><a href="#">Home</a></li>
      <li><a href="#">Features</a></li>
      <li><a href="#">Demo</a></li>
      <li><a href="#">text</a></li>
      <li><a href="#">Contact</a></li>
    </ul>

    <div class="navbar-actions">
      <?php if ($logged_in): ?>
        <span class="navbar-user">
          <span class="navbar-avatar"><?= strtoupper(mb_substr($username, 0, 1)) ?></span>
          <?= $username ?>
        </span>
        <a href="logout.php" class="navbar-btn navbar-btn-login">Log out</a>
      <?php else: ?>
        <button type="button" class="navbar-btn navbar-btn-login" id="btn-open-login">Log in</button>
        <button type="button" class="navbar-btn navbar-btn-signup" id="btn-open-signup">Sign up</button>
      <?php endif; ?>
    </div>
  </nav>

  <section class="hero">
    <div class="hero-shapes">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
      <div class="blob blob-4"></div>
      <div class="blob blob-5"></div>
      <div class="blob blob-6"></div>
    </div>

    <div class="hero-content">
      <h1 class="hero-title">The fastest way to<br>run live quizzes</h1>
      <h2 class="hero-subtext">Your crowd. Your questions.</h2>
      <p class="hero-desc">Create, share, and host real-time quizzes - for classrooms, events, or just for fun.</p>
      <div class="hero-actions">
        <button class="hero-btn hero-btn-primary">
          Start creating
          <img class="hero-btn-img" src="img/arrow-right1.png">
        </button>
        <button class="hero-btn hero-btn-secondary">
          <img class="hero-btn2-img" src="img/arrow-right2.png">
          Try a quiz
        </button>
      </div>
    </div>

    <div class="hero-join">
      <h3 class="hero-join-title">Try it now</h3>
      <div class="hero-join-row">
        <input class="hero-join-input" type="text" placeholder="Code">
        <button class="hero-join-btn">
          Join
          <img class="hero-join-img" src="img/arrow-right1.png">
        </button>
      </div>
    </div>
  </section>

  <div class="fs">
    <h2 class="fs-heading">Everything you need.<br><span>Nothing you don't.</span></h2>
    <div class="fs-grid">

      <div class="fs-card">
        <p class="fs-num">01</p>
        <h3 class="fs-title">Build a quiz in under a minute</h3>
        <p class="fs-desc">Type your questions, pick the right answer, set a timer. No learning curve — just a clean editor that gets out of your way.</p>
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
        <h3 class="fs-title">Timed pressure</h3>
        <p class="fs-desc" style="text-align:center;">Every question has a countdown. Fast answers score more.</p>
        <div class="mock-timer-wrap">
          <div class="mock-timer">12</div>
          <div class="mock-timer-label">seconds left</div>
        </div>
      </div>

      <div class="fs-card">
        <p class="fs-num">03</p>
        <h3 class="fs-title">Results after every session</h3>
        <p class="fs-desc">See which questions people skipped the most and their percentage.</p>
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
            <div class="mock-r-pill"><div class="mock-r-pill-num">24</div><div class="mock-r-pill-sub">players</div></div>
            <div class="mock-r-pill accent"><div class="mock-r-pill-num">68%</div><div class="mock-r-pill-sub">avg score</div></div>
            <div class="mock-r-pill"><div class="mock-r-pill-num">8</div><div class="mock-r-pill-sub">questions</div></div>
          </div>
        </div>
      </div>

    </div>
  </div>

<section class="game">
  <div class="game-head">
    <h2 class="game-title">
      Play<span class="game-title-amp">&amp;</span>Learn
      <span class="game-badge">Interactive</span>
    </h2>
  </div>

  <div class="game-card" id="game-card">
    <div class="game-prog" id="game-prog" style="width:33%"></div>

    <div id="game-main">
      <div class="game-top">
        <span class="game-num" id="g-num">Question 1 of 3</span>
        <div class="game-timer-wrap">
          <img src="img/clock.png" width="14" height="14" style="opacity:.5">
          <span class="game-timer" id="g-timer">15</span>s
        </div>
      </div>

      <div class="game-body">
        <div class="game-left">
          <div class="game-question" id="g-text"></div>
          <div class="game-code" id="g-code"></div>
          <div class="game-feedback" id="g-feedback"></div>
          <button class="game-next" id="btn-next">
            Next question <img src="img/arrow-right1.png" class="game-next-img">
          </button>
        </div>
        <div class="game-right">
          <div class="game-opts" id="g-opts"></div>
        </div>
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
        Try again <img src="img/arrow-right1.png" class="game-next-img">
      </button>
    </div>
  </div>

  <div class="game-dots">
    <div class="game-dot active" id="gdot-0"></div>
    <div class="game-dot" id="gdot-1"></div>
    <div class="game-dot" id="gdot-2"></div>
  </div>
</section>

  <script src="src/script.js"></script>
</body>
</html>