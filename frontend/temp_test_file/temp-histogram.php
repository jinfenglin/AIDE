<?php

session_start();

if(isset($_POST['confirm'])){
  if(!empty($_POST['check_list'])) {

    // Loop to store and display values of individual checked checkbox.
    // foreach($_POST['check_list'] as $selected) {
    //   echo "<p>".$selected ."</p>";
    // }
    // echo "<br/><b>Note :</b> <span>Similarily, You Can Also Perform CRUD Operations using These Selected Values.</span>";


    if(!isset($_SESSION["username"], $_SESSION["password"], $_SESSION["dbname"], $_SESSION["tblname"])){
      header("location:connect.php");
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
      <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
      <!-- Include all compiled plugins (below), or include individual files as needed -->
      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>
      <!-- histogram draw function -->
      <script src="js/histogram_draw.js"></script>
      <!-- attribute information collector -->
      <script src="js/collect_attribute.js"></script>
      <!-- events processing -->
      <script src="js/histogram_events.js"></script>
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
                <li class="previous"><a href="attribute_select.php"><span aria-hidden="true">&larr;</span> Go Back</a></li>

              </ul>
            </nav>
          </div>
        </div>

        <div class="row">
          <div class="col-md-12">
            <h4 class="title-connection">Histogram Display</h4>
          </div>
        </div>

        <?php

        // Counting number of checked checkboxes.
        // $checked_count = count($_POST['check_list']);
        // echo "You have selected following ".$checked_count." option(s): <br/>";

        foreach($_POST['check_list'] as $attr) {

          echo "<div class='row  small-top-margin medium-bottom-margin' id='info-row-{$attr}'>\n";

          ?>

            <div class='col-md-2'>
                <?php
                echo "<h3 class='text-uppercase'><mark><strong>{$attr}</strong></mark></h3>";
                ?>
            </div>

            <div class='col-md-3'>

              <form class="form-horizontal">

                <div class="form-group">
                  <label for="" class="col-md-5">Bucket Number</label>
                  <div class="col-md-4">
                    <?php
                       echo "<select name='' class='form-control' id='{$attr}-bucketnum'>";
                    ?>
                      <option>5</option>
                      <option selected="selected">10</option>
                      <option>15</option>
                      <option>20</option>
                      <option>25</option>
                      <option>30</option>
                    </select>
                  </div>
                  <div class="col-md-3"></div>
                </div>


                <div class="form-group">
                  <div class="col-md-4">
                    <?php
                      echo "<label class='sr-only' for='{$attr}-width-btn'>Show equi-width histogram</label>\n";
                      echo "<button type='button' id='{$attr}-width-btn' data-loading-text='Loading...' class='btn btn-default' autocomplete='off'>Equi-width</button>\n";
                    ?>

                  </div>
                  <div class="col-md-offset-1 col-md-4">
                    <?php
                      echo "<label class='sr-only' for='{$attr}-depth-btn'>Show equi-depth histogram</label>";
                      echo "<button type='button' id='{$attr}-depth-btn' data-loading-text='Loading...' class='btn btn-default' autocomplete='off'>Equi-depth</button>";
                    ?>
                  </div>
                  <p class="help-block col-md-12 text-transparent">Click to show histogram.</p>
                </div>

              </form>

            </div>

            <div class='col-md-6'>

              <form class="form-inline">
                <div class="form-group">
                  <label class="sr-only" for="minvalue">Min Value</label>
                  <label class="sr-only" for="maxvalue">Max Value</label>
                  <div class="input-group">
                    <div class="input-group-addon">Min</div>
                    <?php
                      echo "<input type='text' class='form-control' id='{$attr}-minvalue' placeholder=''>\n";
                    ?>
                    <div class="input-group-addon">Max</div>
                    <?php
                      echo "<input type='text' class='form-control' id='{$attr}-maxvalue' placeholder=''>\n";
                    ?>
                  </div>
                </div>
                <?php
                  echo "<button type='button' class='btn btn-default' id='{$attr}-update-btn'>Update</button>\n";
                ?>
                <p class="help-block">Please specify your interested value range here.</p>
              </form>

            </div>

            <div class='col-md-1'>
              <?php
                echo "<button type='button' class='btn btn-default' id='{$attr}-delete-btn'>\n";
              ?>
                <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
              </button>
            </div>

          </div>

          <?php
            echo "<div class='row' id='title-row-{$attr}'>\n";
          ?>
            <div class='col-md-6 text-center'>
              <?php
                echo "<h5 id='{$attr}-width-title'>Equi-width Histogram</h5>\n";
              ?>

            </div>
            <div class='col-md-6 text-center'>
              <?php
                echo "<h5 id='{$attr}-depth-title'>Equi-depth Histogram</h5>\n";
              ?>

            </div>
          </div>


            <?php

            echo "<div class='row medium-bottom-margin' id='chart-row-{$attr}'>\n";
            echo "\t<div id='width-chart-{$attr}' class='col-md-6'>\n";
            echo "\t</div>\n";
            echo "\t<div id='depth-chart-{$attr}' class='col-md-6'>";
            echo "\t</div>\n";
            echo "</div>\n";

            echo "<div class='row' id='hr-row-{$attr}'>\n";

            ?>
                <div class="col-md-12">
                  <hr>
                </div>
              </div>

              <script type="text/javascript">

              <?php
              //width button hover events
                echo "width_btn_hover($('#{$attr}-width-btn'));\n";
              //depth button hover events
                echo "depth_btn_hover($('#{$attr}-depth-btn'));\n";

              //update button click event
                echo "update_btn_click($('#{$attr}-update-btn'), '{$attr}', '#{$attr}-minvalue', '#{$attr}-maxvalue');\n";

              //plot width histogram
                echo "width_chart('#width-chart-{$attr}', '{$attr}', '#{$attr}-bucketnum', $('#{$attr}-width-btn'), '#{$attr}-minvalue', '#{$attr}-maxvalue');\n";
              //plot depth histogram
                echo "depth_chart('#depth-chart-{$attr}', '{$attr}', '#{$attr}-bucketnum', $('#{$attr}-depth-btn'), '#{$attr}-minvalue', '#{$attr}-maxvalue');\n";

              //delete button click event
                echo "$('#{$attr}-delete-btn').on('click', function(event){\n";
                echo "$('#info-row-{$attr}').remove();\n";
                echo "$('#title-row-{$attr}').remove();\n";
                echo "$('#chart-row-{$attr}').remove();\n";
                echo "$('#hr-row-{$attr}').remove();\n";
                echo "delete_attr('{$attr}');\n";
                echo "$(store_attr);\n";
              ?>

              });

              </script>


              <?php

            }   //for each loop

            ?>

            <div class="row">
              <div class="col-md-12">
                <form action="space_explore.php" method="post">
                  <input type="hidden" name="attr_data" id="attr_data_input">
                  <button type="submit" name="attr_confirm" class="btn btn-primary button-align">Submit</button>
                </form>
              </div>
            </div>


          </div>


        </body>

        </html>


        <?php

        // Closing connection
        //pg_close($dbconn);

      }
      else{

        $_SESSION['error_message'] = "Error: Please Select At Least One Option. " . " <br />";
        header('location:empty_attribute.php');
        exit();

      }
    }
    else{
      //echo "<p>reset button clicked.</p>";
      header('location:attribute_select.php');
    }
    ?>
