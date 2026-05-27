<!DOCTYPE html>
<html>
<head>
  <title>BlitzIq</title>
</head>
<body>
  <form action="php/auth.php" method="post">
    <input type="hidden" name="action" value="register">
    <input type="text" name="username" placeholder="Username" required><br>
    <input type="email" name="email" placeholder="Email" required><br>
    <input type="password" name="password" placeholder="Parolă" required><br>
    <button type="submit">Înregistrare</button>
  </form>
</body>
</html>