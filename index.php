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
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
      <div class="blob blob-4"></div>
      <div class="blob blob-5"></div>
      <div class="blob blob-6"></div>
    </div>

    <div class="hero-content">
      <h1 class="hero-title">Text</h1>
      <h2 class="hero-subtext">Subtext</h2>
      <p class="hero-desc">Description</p>
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

  <div class="section1"></div>

</body>
</html>