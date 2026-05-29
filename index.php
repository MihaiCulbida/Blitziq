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

  <nav class="navbar">
    <a class="navbar-logo"> Blitz <span class="navbar-logo-badge">IQ</span> </a>

    <ul class="navbar-links">
      <li><a href="#">text</a></li>
      <li><a href="#">text</a></li>
      <li><a href="#">text</a></li>
      <li><a href="#">text</a></li>
      <li><a href="#">text</a></li>
    </ul>

    <div class="navbar-actions">
      <button type="button" class="navbar-btn navbar-btn-login" onclick="window.location.href='login.php'">Log in</button>
      <button type="button" class="navbar-btn navbar-btn-signup" onclick="window.location.href='register.php'">Sign up</button>
    </div>
  </nav>

  <section class="hero">

    <div class="hero-shapes">
      <div class="blob   blob-1"></div>
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

</body>
</html>