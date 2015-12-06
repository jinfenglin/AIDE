<?php
session_start();

if(isset($_SESSION['error_message'])){

$error = $_SESSION['error_message'];

}
else {
  $error = "Error occurred.";
}

?>


<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Error Page</title>
  <link href='http://fonts.googleapis.com/css?family=Lato' rel='stylesheet' type='text/css'>
  <!-- Bootstrap -->
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
  <link href="css/style.css" rel="stylesheet">
  <!-- Optional theme -->
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">
  
</head>

<body>
  <div class="container">
    <div class="row">
      <div class="col-md-11 text-center">
        <h2 class="">Explore By Example:</h2>
        <h4>An Automatic User Navigation System for Interactive Data Exploration</h4>
      </div>
      <div class="col-md-1 large-top-margin">
        <label>Welcome</label>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <hr>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">


    <form class="" action="connect.php" method="post">
      <?php
      echo "<p><strong>{$error}</strong></p>";
      ?>
      <button type="submit" class="btn btn-default">Exit</button>
    </form>

  </div>
</div>

  </div>

</body>

</html>
