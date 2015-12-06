
<?php

// Check if session is not registered, redirect back to main page.
// Put this code in first line of web page.
session_start();

// if(!session_is_registered("table_select")){
//   header("location:table_select.php");
// }

if(!isset($_SESSION["username"], $_SESSION["password"], $_SESSION["dbname"])){
  header("location:connect.php");
}
// else {
//   echo "username: {$_SESSION["username"]}, password: {$_SESSION["password"]}, db: {$_SESSION["dbname"]}, table: {$tablename}";
// }

if(!empty($_POST['table_select'])){
  // table name sent from form
  $_SESSION["tblname"]=$_POST['table_select'];
}
elseif(!isset($_SESSION["tblname"])){
  header("location:checklogin.php");
}

$conn_input = "host=dbcluster.cs.umass.edu port=54320 dbname={$_SESSION["dbname"]} user={$_SESSION["username"]} password={$_SESSION["password"]}";
//echo $conn_input;
//echo "<br>";
//$dbconn = pg_connect($conn_input) or die('Could not connect. ' . pg_last_error());

$dbconn = pg_connect($conn_input);

if (!$dbconn) {
  $message = "Input:  username: {$_SESSION["username"]}, password: {$_SESSION["password"]}, database: {$_SESSION["dbname"]} .\n";

  $_SESSION['error_message'] = "Error: Could not connect. " . pg_last_error() . "<br /> {$message} <br />";
  header('location:error_page.php');
  exit();
}



$query = "select a.attname as col_name, c.typname as col_type
from pg_attribute as a, pg_class as b, pg_type as c
where a.attrelid = b.oid and a.atttypid = c.oid
and b.relname = '{$_SESSION["tblname"]}' and b.relkind = 'r'
and a.attnum > 0;";

//echo $query;
//echo "<br>";

//$result = pg_query($dbconn, $query) or die('Query failed. ' . pg_last_error());

$result = pg_query($dbconn, $query);

if (!$result) {
  $_SESSION['error_message'] = "Error: Query failed. " . pg_last_error() . "<br /> {$query} <br />";
  header('location:error_page.php');
  exit();
}

$rows = pg_num_rows($result);


if($rows > 0){



  ?>

  <!DOCTYPE html>
  <html lang="en">

  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Select Attribute</title>
    <link href='http://fonts.googleapis.com/css?family=Lato:100,300' rel='stylesheet' type='text/css'>
    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
    <link href="css/style.css" rel="stylesheet">
    <!-- Optional theme -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">

  </head>

  <body>
    <div class="container">
      <div class="row">
        <div class="col-md-11 text-center text-uppercase">
          <h2 class="title-super">Data Explore</h2>
          <h4>IDE project</h4>
        </div>
        <form class="col-md-1 large-top-margin" action="connect.php" method="post">

          <?php
          echo "<label>{$_SESSION["username"]}</label>";
          ?>

          <button type="submit" class="btn btn-default">Logout</button>
        </form>
      </div>

      <div class="row">
        <div class="col-md-12">
          <hr>
        </div>
      </div>

      <div class="row">
        <div class="col-md-12">
          <nav>
            <ul class="pager">
              <li class="previous"><a href="checklogin.php"><span aria-hidden="true">&larr;</span> Go Back</a></li>

            </ul>
          </nav>
        </div>
      </div>




<div class="row">
  <div class="col-md-12">

    <form class="" action="histogram1.php" method="post">

    <div class="panel panel-default">

      <div class="panel-heading">
        <h4 class="panel-title">Select Attributes</h4>
      </div>

      <div class="panel-body">



          <?php
          // Printing results in HTML

          while ($line = pg_fetch_array($result, null, PGSQL_NUM)) {
            echo "\t<label class='checkbox-inline no_indent col-md-3'>\n";
            echo "\t\t<input type='checkbox' name='check_list[]' value='{$line[0]}'>\n";
            echo "\t\t{$line[0]}({$line[1]})\n";
            echo "</label>\n";

          }
          // Free resultset
          pg_free_result($result);

          // Closing connection
          pg_close($dbconn);
          
          ?>




</div>
</div>

<div class="col-md-12">
  <button type="submit" name="reset" class="btn btn-default button-align">Reset</button>
  <button type="submit" name="confirm" class="btn btn-primary button-align">Confirm</button>
</div>
</form>


</div>
</div>

</div>



</body>

</html>


<?php
}
else {
  $message = "Input:  database: {$_SESSION["dbname"]}, table: {$_SESSION["tblname"]}.<br>\n";

  $_SESSION['error_message'] = "Error: Cannot get attributes from {$_SESSION["tblname"]}. " . "<br /> {$message} <br />";
  header('location:error_page.php');
  exit();

}

?>
