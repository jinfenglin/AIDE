<?php

session_start();

if(isset($_POST['confirm'])){
  if(!empty($_POST['check_list'])) {

    // Loop to store and display values of individual checked checkbox.
    // foreach($_POST['check_list'] as $selected) {
    //   echo "<p>".$selected ."</p>";
    // }
    // echo "<br/><b>Note :</b> <span>Similarily, You Can Also Perform CRUD Operations using These Selected Values.</span>";


    if(!isset($_SESSION["hostname"], $_SESSION["portnum"], $_SESSION["username"], $_SESSION["password"], $_SESSION["dbname"], $_SESSION["tblname"])){
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
      <link href='http://fonts.googleapis.com/css?family=Lato' rel='stylesheet' type='text/css'>
      <!-- Bootstrap -->
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
      <link href="css/style.css" rel="stylesheet">
      <!-- Optional theme -->
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">
      <!-- tipsy css -->
      <link rel="stylesheet" href="http://onehackoranother.com/projects/jquery/tipsy/stylesheets/tipsy.css" type="text/css" title="no title" charset="utf-8"/>
      <script src="http://d3js.org/d3.v3.min.js"></script>
      <script src="http://dimplejs.org/dist/dimple.v2.1.0.min.js"></script>
      <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
      <!-- Include all compiled plugins (below), or include individual files as needed -->
      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>
      <!-- facebook tipsy -->
      <script src="js/jquery.tipsy.js" type="text/javascript" charset="utf-8"></script>
      <!-- histogram draw function -->
      <script src="js/histogram_draw.js"></script>
      <!-- attribute information collector -->
      <script src="js/collect_attribute.js"></script>
      <!-- events processing -->
      <script src="js/histogram_events.js"></script>
      <!-- heatmap draw function -->
      <script src="js/heatmap_draw.js"></script>
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
                <li class="previous"><a href="attribute_select.php"><span aria-hidden="true">&larr;</span> Go Back</a></li>

              </ul>
            </nav>
          </div>
        </div>


        <div class='row' id='histogram-row'>
            <div class="col-md-12">

              <div class="panel panel-default">

                <div class="panel-heading">
                    <h4 class='panel-title text-capitalize'>Histogram Display</h4>
                </div>

                <div class="panel-body">

                  <div class="col-md-12 small-southeast-align">

                    <div class="col-md-4">

                      <form class="form-horizontal">

                        <div class="form-group">
                          <label for="" class="col-md-5 control-label">Attribute Name:</label>
                          <div class="col-md-6">

                            <select name='' class='form-control' id='histogram-attr'>

                              <?php
                              foreach($_POST['check_list'] as $attr) {
                                echo "<option>{$attr}</option>\n";
                              }

                              ?>
                            </select>
                          </div>
                        </div>

                        <div class="form-group">
                          <label for="" class="col-md-5 control-label">Bucket Number:</label>
                          <div class="col-md-6">
                            <select name='' class='form-control' id='histogram-bucketnum'>
                            <option>5</option>
                            <option selected="selected">10</option>
                            <option>15</option>
                            <option>20</option>
                            <option>25</option>
                            <option>30</option>
                          </select>
                          </div>
                        </div>

                        <div class="form-group">
                          <label for="" class="col-md-5 control-label">Y Scale:</label>
                          <div class="col-md-6">
                            <select name='' class='form-control' id='histogram-yscale'>
                            	<option selected="selected">linear</option>
                            	<option>log10</option>
                          	</select>
                          </div>
                        </div>

                      </form>

                    </div>


                	<div class='col-md-7'>

                  	  <form class="form-inline">
                    	  <div class="form-group">
                      		<label class="sr-only" for="minvalue">Min Value</label>
                      	  	<label class="sr-only" for="maxvalue">Max Value</label>
                      	  	<div class="input-group">
                        		<div class="input-group-addon">Min</div>
                        		<input type='text' class='form-control' id='histogram-minvalue' placeholder=''>
                        		<div class="input-group-addon">Max</div>
                        		<input type='text' class='form-control' id='histogram-maxvalue' placeholder=''>
                      	  	</div>
                    	  </div>
                    	  <button type='button' class='btn btn-default' id='histogram-update-btn'>Update</button>
                    	  <p class="help-block col-md-12">Please specify your interested value range here.</p>
                  	  </form>

                  	  <div class="btn-group" role="group" aria-label="...">
                    	  <button type="button" id="histogram-width-btn" class="btn btn-default">Equi-width</button>
                    	  <button type="button" id="histogram-depth-btn" class="btn btn-default">Equi-depth</button>
                  	  </div>

                	</div>

                	<div class='col-md-1'>

                  	  <button type='button' class='btn btn-default' id='histogram-delete-btn'>
                  	  <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                	  </button>
              		</div>

            	  </div>


            	  <div class="col-md-12">
              		<div class='col-md-6 text-center small-bottom-margin medium-top-margin'>
                		<h5 id='histogram-width-title'>Equi-width Histogram</h5>
              	  	</div>
              	  	<div class='col-md-6 text-center small-bottom-margin medium-top-margin'>
                		<h5 id='histogram-depth-title'>Equi-depth Histogram</h5>
              	  	</div>
            	  </div>

            	  <div class="col-md-12">

              		<div id='width-chart-container' class='col-md-6'>
                		<div id='histogram-width-chart'></div>
              	  	</div>

              	  	<div id='depth-chart-container' class='col-md-6'>
                		<div id='histogram-depth-chart'></div>
              	  	</div>

            	  </div>


                </div>

              </div>

            </div>
        </div>


        <div class='row' id='heatmap-row'>
          <div class="col-md-12">
			  
            <div class="panel panel-default">

              <div class="panel-heading">
                <h4 class='panel-title text-capitalize'>Heatmap Display</h4>
              </div>

              <div class="panel-body">

                <div class="col-md-12 small-southeast-align">

                  <div class="col-md-4">

                    <form class="form-horizontal">

                      <div class="form-group">
                        <label for="" class="col-md-5 control-label">X Attribute:</label>
                        <div class="col-md-6">

                          	<select name='' class='form-control' id='heatmap-x-attr'>
                        		<?php
                        			foreach($_POST['check_list'] as $attr) {
                          			  echo "<option>{$attr}</option>\n";
                        		  	}

                        		?>
                        	</select>
                      	</div>
                      </div>

                      <div class="form-group">
                      	<label for="" class="col-md-5 control-label">Y Attribute:</label>
                      	<div class="col-md-6">
                        	<select name='' class='form-control' id='heatmap-y-attr'>
                          	  <?php
                          		foreach($_POST['check_list'] as $attr) {
                            		echo "<option>{$attr}</option>\n";
                          	  	}

                          	  ?>
                        	</select>
                      	</div>
                      </div>

                      <div class="form-group">
                      	<label for="" class="col-md-5 control-label">Aggregate on:</label>
                      	<div class="col-md-6">
                        	<select name='' class='form-control' id='aggregate-attr'>
                          	  <option selected="selected">count</option>

                          		<?php
                          	  		foreach($_POST['check_list'] as $attr) {
                            			echo "<option>avg({$attr})</option>\n";
                          		  	}

                          		?>
                        	</select>
                      	</div>
                      </div>

                      <div class="form-group">
                      	<label for="" class="col-md-5 control-label">Bucket Number:</label>
                      	<div class="col-md-6">
                        	<select name='' class='form-control' id='heatmap-bucketnum'>
                        		<option>5</option>
                        		<option selected="selected">10</option>
                        		<option>15</option>
                        		<option>20</option>
                        		<option>25</option>
                        		<option>30</option>
                      	  	</select>
                    	</div>
                  	  </div>


                  	  <div class="form-group">
                    	  <label for="" class="col-md-5 control-label">Show Heatmap:</label>
                    	  <div class="col-md-7">
                      		<div class="btn-group-vertical" role="group" aria-label="...">
                        		<button type='button' id='heatmap-btn' class='btn btn-default'>Plot</button>
                      	  	</div>
                    	  </div>
                  	  </div>
					  
                	</form>

              	  </div>

              	  <div class='col-md-7'>

                    <form class="form-inline medium-bottom-margin">
                      <div class="form-group">
                        <label class="" for="">X</label>
                        <div class="input-group">
                          <div class="input-group-addon">Min</div>
                          <input type='text' class='form-control' id='x-minvalue' placeholder=''>
                          <div class="input-group-addon">Max</div>
                          <input type='text' class='form-control' id='x-maxvalue' placeholder=''>
                        </div>
                      </div>
                      <button type='button' class='btn btn-default' id='x-update-btn'>Update</button>
                    </form>

                    <form class="form-inline">
                      <div class="form-group">
                        <label class="" for="">Y</label>
                        <div class="input-group">
                          <div class="input-group-addon">Min</div>
                          <input type='text' class='form-control' id='y-minvalue' placeholder=''>
                          <div class="input-group-addon">Max</div>
                          <input type='text' class='form-control' id='y-maxvalue' placeholder=''>
                        </div>
                      </div>
                      <button type='button' class='btn btn-default' id='y-update-btn'>Update</button>
                    </form>

              	  </div>

              	  <div class='col-md-1'>
                	  <button type='button' class='btn btn-default' id='heatmap-delete-btn'>
                		  <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
              		  </button>
            	  </div>

                </div>

                <div class="col-md-12 small-southeast-align">

                  <div class="col-md-offset-4 col-md-7" id="heatchartContainer">
                    <div id="heatchart"></div>
                  </div>

                </div>

              </div>

            </div>
          </div>
        </div>


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
