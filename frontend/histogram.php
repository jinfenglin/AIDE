<?php
if(isset($_POST['confirm'])){
  if(!empty($_POST['check_list'])) {

    // Loop to store and display values of individual checked checkbox.
    // foreach($_POST['check_list'] as $selected) {
    //   echo "<p>".$selected ."</p>";
    // }
    // echo "<br/><b>Note :</b> <span>Similarily, You Can Also Perform CRUD Operations using These Selected Values.</span>";

    session_start();
    if(!isset($_SESSION["username"], $_SESSION["password"], $_SESSION["dbname"], $_SESSION["tblname"])){
      header("location:main_login.php");
    }

    //$conn_input = "host=dbcluster.cs.umass.edu port=54320 dbname={$_SESSION["dbname"]} user={$_SESSION["username"]} password={$_SESSION["password"]}";
    //echo $conn_input;
    //echo "<br>";
    //$dbconn = pg_connect($conn_input) or die('Could not connect: ' . pg_last_error());

    ?>

    <!DOCTYPE html>
    <html lang="en">

    <head>
      <meta charset="utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Histogram</title>
      <link href='http://fonts.googleapis.com/css?family=Lato:100,300' rel='stylesheet' type='text/css'>
      <!-- Bootstrap -->
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
      <link href="css/style.css" rel="stylesheet">
      <script src="http://d3js.org/d3.v3.min.js"></script>
      <script src="http://dimplejs.org/dist/dimple.v2.1.0.min.js"></script>
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




        <?php

        // Counting number of checked checkboxes.
        // $checked_count = count($_POST['check_list']);
        // echo "You have selected following ".$checked_count." option(s): <br/>";

        foreach($_POST['check_list'] as $attr) {

          ?>

          <div class='row'>
            <div class='col-md-6'>





              <?php
                echo "<h4 class='title-attribute'>{$attr}</h4>";

              ?>


          <form class="large-top-margin">
            <div class="form-group">
              <label class="sr-only" for="width">Show equi-width histogram</label>
              <label class="sr-only" for="depth">Show equi-depth histogram</label>
              <button type='button' id='width' name='width' class='btn btn-default'>Equi-width</button>
              <button type='button' id='depth' name='depth' class='btn btn-default'>Equi-depth</button>
              <p class="help-block">Click to show equi-width or equi-depth histogram.</p>
            </div>

          </form>

          <form class="form-inline large-top-margin">
            <div class="form-group">
              <label class="sr-only" for="minvalue">Min Value</label>
              <label class="sr-only" for="maxvalue">Max Value</label>
              <div class="input-group">
                <div class="input-group-addon">Min</div>
                <input type="text" class="form-control" id="minvalue" placeholder="">
                <div class="input-group-addon">Max</div>
                <input type="text" class="form-control" id="maxvalue" placeholder="">

              </div>
            </div>
            <button type="button" class="btn btn-default">Update</button>
            <p class="help-block">Please specify your interested value range here.</p>
          </form>

        </div>


         <?php





          echo "\t<div id='chart{$attr}' class='col-md-6'>";

          ?>

          <script type="text/javascript">

          <?php
          echo "var svg = dimple.newSvg('#chart{$attr}', 590, 400);";
          ?>

          var data = [
          { "Word":"Hello", "Awesomeness":2000 },
          { "Word":"World", "Awesomeness":3000 }
          ];
          var chart = new dimple.chart(svg, data);
          chart.addCategoryAxis("x", "Word");
          chart.addMeasureAxis("y", "Awesomeness");
          chart.addSeries(null, dimple.plot.bar);
          chart.draw();
          </script>





          <?php

          echo "\t</div>\n";



          echo "</div>\n";

          // Free resultset
          //pg_free_result($result);

          ?>

          <div class="row">
            <div class="col-md-12">
              <hr>
            </div>
          </div>


          <?php



        }   //for each loop

        ?>


      </div>


      <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
      <!-- Include all compiled plugins (below), or include individual files as needed -->
      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>

    </body>

    </html>




    <?php

    // Closing connection
    //pg_close($dbconn);

  }
  else{
    echo "<b>Please Select At Least One Option.</b>";
  }
}
else{
  echo "<p>reset button clicked.</p>";
}
?>
