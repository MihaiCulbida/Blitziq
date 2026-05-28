<!DOCTYPE html>
<html>
<head>
  <title>Blitziq</title>
  <link rel="stylesheet" href="styles/style.css">
</head>
<body>

  <?php echo "Afisare text in php <br><br>"; ?>
  <?php echo "<script>console.log('Mesaj in consola');</script>"; ?>

  <?php
 
   $numere = [1,2,3,4,5,6,7,8,9,11];
   $par = 0;
   $impar = 0;
   $i = 0;

    while ($i < count($numere)) {
        if ($numere[$i] % 2 === 0) {
           $par++;
        } else {
           $impar++;
        }
    $i++;
    }

    echo "Nr pare: $par <br>";
    echo "Nr impare: $impar";
   ?>     

  <script src="src/script.js"></script>
</body>
</html>