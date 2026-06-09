<?php
session_start();
session_destroy();
?>
<!DOCTYPE html>
<html>
<head>
    <script>
        localStorage.removeItem('blitziq-quizzes');
        localStorage.removeItem('blitziq-folders');
        localStorage.removeItem('blitziq-saved');
        localStorage.removeItem('blitziq-notifs');
        localStorage.removeItem('blitziq-sidebar');
        window.location.href = '../index.php';
    </script>
</head>
<body>
</body>
</html>