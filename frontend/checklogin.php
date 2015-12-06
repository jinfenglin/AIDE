<?php

session_start();

if(!empty($_POST['myhost']) && !empty($_POST['myport']) && !empty($_POST['myusername']) && !empty($_POST['mypassword']) && !empty($_POST['mydb']) && !empty($_POST['myscenario'])){
  $_SESSION["hostname"] = $_POST['myhost'];
  $_SESSION["portnum"]  = $_POST['myport'];		
  $_SESSION["username"] = $_POST['myusername'];
  $_SESSION["password"] = $_POST['mypassword'];
  $_SESSION["dbname"]   = $_POST['mydb'];
  $_SESSION["scenario"] = $_POST['myscenario'];
}
elseif(!isset($_SESSION["hostname"], $_SESSION["portnum"], $_SESSION["username"], $_SESSION["password"], $_SESSION["dbname"], $_SESSION["scenario"])){
  header("location:connect.php");
}


//echo "{$username}, {$password}, {$dbname}<br>";
//echo "host=dbcluster.cs.umass.edu port=54320 dbname={$dbname} user={$username} password={$password}";
// Connecting, selecting database
$conn_input = "host={$_SESSION["hostname"]} port={$_SESSION["portnum"]} dbname={$_SESSION["dbname"]} user={$_SESSION["username"]} password={$_SESSION["password"]}";
//echo $conn_input;
//echo "<br>";
//$dbconn = pg_connect($conn_input) or die('Could not connect. ' . pg_last_error());
$dbconn = pg_connect($conn_input);

if (!$dbconn) {
  $message = "Input:  host: {$_SESSION["hostname"]}, port: {$_SESSION["portnum"]}, username: {$_SESSION["username"]}, password: {$_SESSION["password"]}, database: {$_SESSION["dbname"]} .\n";

  $_SESSION['error_message'] = "Error: Could not connect. " . pg_last_error() . "<br /> {$message} <br />";
  header('location:error_page.php');
  exit();
}


$query = "select table_name
from information_schema.tables
where table_schema = 'public'
and table_type = 'BASE TABLE';";

//$result = pg_query($dbconn, $query) or die('Query failed. ' . pg_last_error());
$result = pg_query($dbconn, $query);

if (!$result) {
  $_SESSION['error_message'] = "Error: Query failed. " . pg_last_error() . "<br /> {$query} <br />";
  header('location:error_page.php');
  exit();
}


$rows = pg_num_rows($result);

//echo $rows . " row(s) returned.\n";



if($rows > 0){
  // Register $myusername, $mypassword and redirect to file "login_success.php"
  //session_register("username");
  //session_register("password");
  // $_SESSION["username"] = $username;
  // $_SESSION["password"] = $password;
  // $_SESSION["dbname"] = $dbname;
  //$_SESSION["connection"] = $dbconn;
  //$_SESSION["tables"] = $result;
  //header("location:table_select.php");

  ?>


  <!DOCTYPE html>
  <html lang="en">

  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Select Table</title>
    <link href='http://fonts.googleapis.com/css?family=Lato' rel='stylesheet' type='text/css'>
    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
    <link href="css/style.css" rel="stylesheet">
    <!-- Optional theme -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">
    <!-- d3 package -->	
    <script src="http://d3js.org/d3.v3.min.js"></script>	
    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <!-- output table size function -->
    <script src="js/table_info.js"></script>
	
  </head>

  <body>
	  
    <div class="container">
		
      <div class="row">
        <div class="col-md-11 text-center">
          <h2 class="">Explore By Example:</h2>
          <h4>An Automatic User Navigation System for Interactive Data Exploration</h4>
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
              <li class="previous"><a href="connect.php"><span aria-hidden="true">&larr;</span> Go Back</a></li>
            </ul>
          </nav>
        </div>
      </div>


      <div class="row">
        <div class="col-md-6">

          <div class="panel panel-default">

            <div class="panel-heading">
              <h4 class="panel-title">Select A Table</h4>
            </div>

            <div class="panel-body">

              <form class="form-horizontal small-southeast-align" role="form" name="form2" method="post" action="attribute_select.php">

                <div class="form-group">
                  <label for="inputTable" class="col-md-2 control-label">Table</label>
                  <div class="col-md-6">
                    <select name="table_select" class="form-control" id="inputTable">
                      <?php
                      // Printing results in HTML

                     if ($_SESSION['dbname'] == 'postgres') {
                         echo "\t\t<option>real_estate</option>\n";    // zhan: if housing database, hardcode the table
                     }
                     else if ($_SESSION['dbname'] == 'testdb' || $_SESSION['dbname'] == 'sdss'){
                      echo "\t\t<option>sdss_random_sample</option>\n";
                     }
                     else {
                      while ($line = pg_fetch_array($result, null, PGSQL_ASSOC)) {

                          foreach ($line as $col_value) {
                              echo "\t\t<option>$col_value</option>\n";
                        }

                      }
                     }


                      // Free resultset
                      pg_free_result($result);

                      // Closing connection
                      pg_close($dbconn);
                      ?>

                    </select>
                  </div>
				  <div class="col-md-4">
				  	<p class="form-control-static"><mark id="tableSize">781 MB</mark></p>
			  	  </div>	  
                </div>

                <div class="form-group">
                  <div class="col-md-offset-2 col-md-4">
                    <button type="submit" class="btn btn-default">Select</button>
                  </div>
                </div>

              </form>

            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-12">
          <hr>
        </div>
      </div>


    </div>

  </body>

  </html>


  <?php
}
else {
  $message = "Input:  host: {$_SESSION["hostname"]}, port: {$_SESSION["portnum"]}, username: {$_SESSION["username"]}, password: {$_SESSION["password"]}, database: {$_SESSION["dbname"]} .\n";

  $_SESSION['error_message'] = "Error: The database selected doesn't contain any tables. " . "<br /> {$message} <br />";
  header('location:error_page.php');
  exit();

}

?>
