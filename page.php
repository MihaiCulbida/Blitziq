<?php
session_start();

if (!isset($_SESSION['user_id'])) {
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
    <li><a href="#home" class="active">
      <img src="img/home.png" width="20" height="20">
      Home
    </a></li>
    <li><a href="#quizzes">
      <img src="img/quizzes.png" width="20" height="20">
      My quizzes
    </a></li>
    <li><a href="#discover">
      <img src="img/discover.png" width="22" height="22">
      Discover
    </a></li>
  </ul>

  <div class="navbar-search">
    <img src="img/search.png" width="14" height="14" class="navbar-search-icon">
    <input type="text" class="navbar-search-input" placeholder="Search">
  </div>

  <div class="navbar-right">
    <button class="navbar-new-btn">
      <img src="img/add.png" width="14" height="14">
      New quiz
    </button>

    <button class="navbar-bell" aria-label="Notifications">
      <img src="img/bell.png" width="27" height="27">
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

    <div class="sidebar-section">My collections</div>
    <a href="#" class="sidebar-item sidebar-item--active">
      <img src="img/squares.png" width="16" height="16">
      All quizzes
    </a>

    <div class="sidebar-folders">
    </div>

    <a href="#" class="sidebar-item sidebar-item--muted">
      <img src="img/folder.png">
      New folder
    </a>

    <div class="sidebar-divider"></div>

    <div class="sidebar-section">Saved</div>

    <a href="#" class="sidebar-item">
      <img src="img/bookmark.png" width="16" height="16">
      Favorites
    </a>
    <a href="#" class="sidebar-item">
      <img src="img/history.png" width="16" height="16">
      History
    </a>
  </div>
  <div class="sidebar-footer">
    <a href="#" class="sidebar-item">
      <img src="img/settings.png" width="16" height="16">
      Settings
    </a>
  </div>
</aside>
<script src="src/page.js"></script>
</body>
</html>