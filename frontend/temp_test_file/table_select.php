

<?php
// Check if session is not registered, redirect back to main page.
// Put this code in first line of web page.
session_start();
// if(!session_is_registered("username")){
//   header("location:connect.php");
// }
 if(!isset($_SESSION["username"], $_SESSION["password"])){
   header("location:main_login.php");
 }
 else {
   echo "username: {$_SESSION["username"]}, password: {$_SESSION["password"]}";
 }

?>

<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>test page</title>
  <link href='http://fonts.googleapis.com/css?family=Lato:100,300' rel='stylesheet' type='text/css'>
  <!-- Bootstrap -->
  <link href="bootstrap/css/bootstrap.min.css" rel="stylesheet">
  <link href="css/style.css" rel="stylesheet">
</head>

<body>
  <div class="container">
    <div class="row">
      <div class="col-md-12 text-center text-uppercase">
        <h2 class="title-super">Data Explore</h2>
        <h4>IDE project</h4>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <hr>
      </div>
    </div>

    <div class="row">
      <div class="col-md-6">
        <h4 class="title-connection">Table Selection</h4>
        <form class="form-horizontal" role="form" name="form2" method="post" action="check_table_selection.php">

          <div class="form-group">
            <label for="inputTable" class="col-md-2 control-label">Table</label>
            <div class="col-md-10">
              <select name="table_select" class="form-control" id="inputTable">
                <?php
                // Printing results in HTML

                // while ($line = pg_fetch_array($_SESSION["tables"], null, PGSQL_ASSOC)) {
                //
                //   foreach ($line as $col_value) {
                //     echo "\t\t<option>$col_value</option>\n";
                //   }
                //
                // }
                //
                //
                // // Free resultset
                // pg_free_result($_SESSION["tables"]);
                //
                // // Closing connection
                // pg_close($_SESSION["connection"]);
                ?>
                <option>director</option>
                <option>actor</option>
                <option>casts</option>
                <option>movies</option>
                <option>movie_director</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <div class="col-md-offset-2 col-md-10">
              <button type="submit" class="btn btn-default">Select</button>
            </div>
          </div>

        </form>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <hr>
      </div>
    </div>


    </div>


    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <!-- Include all compiled plugins (below), or include individual files as needed -->
    <script src="bootstrap/js/bootstrap.min.js"></script>

  </body>

  </html>
