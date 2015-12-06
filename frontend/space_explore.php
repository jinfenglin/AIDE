<?php

session_start();

//$val = $_POST['attr_data'];
if(!empty($_POST['attr_data']) or isset($_SESSION['attrdatastr'])) {

  if(!empty($_POST['attr_data'])) {
  //$attrdatastr is a json object, like "{"attr_collection": [{},{}]}"	
  $attrdatastr = $_POST['attr_data'];
	  
  $attrjsonobj = json_decode($_POST['attr_data']);
  //$attrjsonobj is an json object, like {"attr_collection": [{},{}]}
  $attrdata = $attrjsonobj -> attr_collection;
  //$attrdata is an object array, the structure is:
  //[{"attr_name": "some-name", "min_value": 24, "max_value": 34.2}, {...}, {...}] 
  //to refer to value, we can write as:
  // foreach($attrdata as $attr_item) {...}
  // inside the loop, we can use $attr_item -> {'attr_name'} to refer to 'attr_name' value

  }
  else {
      $attrdatastr = $_SESSION['attrdatastr'];
      $attrjsonobj = json_decode($attrdatastr);
      $attrdata = $attrjsonobj -> attr_collection;
  }
?>

<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Space Explore</title>
  <link href='http://fonts.googleapis.com/css?family=Lato' rel='stylesheet' type='text/css'>
  <!-- Bootstrap -->
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
  <link href="css/style.css" rel="stylesheet">  
  <!--
  <link href="css/table.css" rel="stylesheet">
	  -->
  <!-- Optional theme -->
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">
  <!-- tipsy css -->
  <!--
  <link rel="stylesheet" href="http://onehackoranother.com/projects/jquery/tipsy/stylesheets/tipsy.css" type="text/css" title="no title" charset="utf-8"/>
	  -->
  <link href="css/tipsy.css" rel="stylesheet">
  
  <script src="http://d3js.org/d3.v3.min.js"></script>
  <script src="http://dimplejs.org/dist/dimple.v2.1.0.min.js"></script>
  <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
  <!-- Include all compiled plugins (below), or include individual files as needed -->
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>
  <!-- facebook tipsy -->
  <script src="js/jquery.tipsy.js" type="text/javascript" charset="utf-8"></script>  
  <!-- scatter plot draw function -->
  <?php
	
		if($_SESSION["scenario"] == "Scenario 4" || $_SESSION["scenario"] == "Scenario 5" || $_SESSION["scenario"] == "Scenario 6"){
			//if it is scenario 4 or 5 or 6, where we use sdss dataset 		
  			echo "<script src='js/scatterplot_draw.js'></script>";
  		}
		elseif($_SESSION["scenario"] == "Scenario 3" && $_SESSION["tblname"] == "sdss_random_sample"){
			//if it is scenario 3 and select sdss dataset
			echo "<script src='js/scatterplot_draw.js'></script>";
		}		
		else{
			//we use scenario 1, 2, 3, where we use housing data set
			echo "<link href='css/table.css' rel='stylesheet'>";
			echo "<script src='js/map_draw.js'></script>";
			echo "<script src='js/mixed_draw.js'></script>";
			echo "<script src='https://maps.googleapis.com/maps/api/js?v=3.exp&signed_in=true'></script>";
		}
  ?>
  
  
  
  
  <style>
      #chart {
        height: 600px;
        width: 790px;
        margin: 0;
        padding: 0;
      }
     #legend {
        width: 119px;
        height: 131px;
        font-family: Arial, sans-serif;
        background: #fff;
        padding: 10px;
        margin: 10px;
      }
      #legend img {
        vertical-align: middle;
      }
  </style>
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

    <div class="row">
      <div class="col-md-12">

        <div class="panel panel-default">

          <div class="panel-heading">
            <h4 class="panel-title">AIDE: Interactive Data Exploration</h4>
          </div>

          <div class="panel-body">

            <div class="col-md-9">
				
				<?php
				//put table name in a hidden input
				echo "<input type='hidden' name='table_name' value='{$_SESSION["tblname"]}' id='tablename_input'>\n";
				echo "<input type='hidden' name='scenario_num' value='{$_SESSION["scenario"]}' id='scenario_num_input'>\n";
				//display relevant attr info well
				if($_SESSION["tblname"] == "real_estate" && $_SESSION["scenario"] == "Scenario 2"){
					echo "<div class='col-md-12 well'>\n";

					$pieces = explode("where", $_SESSION['target_query']);
					echo "<p id='relevant-areas'>Target relevant areas: </p>" . $pieces[1] . "<p>\n</p>";
					echo "</div>\n";
				}
				
				if($_SESSION["tblname"] == "real_estate"){
					echo "<div class='col-md-12 well'>\n";
					echo "<h4 class='text-capitalize'><strong>prediction</strong></h4>\n";
					//echo "<p class='text-capitalize'>Relevant attributes:</p>\n";
					//echo "<p class='text-center' id='predicted-relevant-attr-text'></p>\n";
					echo "<p id='predicted-relevant-attr-text'><strong>Relevant Attributes</strong>:</p>\n";
					echo "<p class='text-capitalize'><strong>Relevant areas</strong>:</p>";
					//echo "<p class='text-center' id='predicted-relevant-areas-text'></p>\n";
					echo "<p id='predicted-relevant-areas-text'></p>\n";
					echo "</div>\n";
				}
				?>
				
				<div class="col-md-12" id='chart'>
					
				</div>
				
            </div>

            <div class="col-md-3">

                <form class="form-horizontal">
				  
				  
                  <div class="form-group">
                    <label for="" class="col-md-5 control-label">X Attribute:</label>
                    <div class="col-md-7">
                      <select class="form-control" id='x-attr-name'>

                        <?php

                        foreach($attrdata as $attr_item) {
                          echo "<option>{$attr_item -> {'attr_name'}}</option>\n";
                        }

                        ?>

                      </select>
                    </div>
                  </div>
				  
                  <div class="form-group">
                    <label for="" class="col-md-5 control-label">Y Attribute:</label>
                    <div class="col-md-7">
                      <select class="form-control" id='y-attr-name'>

                        <?php

                        foreach($attrdata as $attr_item) {
                          echo "<option>{$attr_item -> {'attr_name'}}</option>\n";
                        }

                        ?>

                      </select>
                    </div>
                  </div>
				  
                  <div class="form-group">
                    <label for="" class="col-md-5 control-label">Exploration:</label>
                    <div class="col-md-7">
                      <div class="btn-group-vertical" role="group" aria-label="...">
                        <button type="button" class="btn btn-default" id="explore-start-btn">Start</button>
                        <?php
						if($_SESSION["tblname"] == "real_estate"){
							//switch is active
							echo "<button type='button' class='btn btn-default' id='switch'>switch</button>\n";
						}
						else{
							//for sdss, switch is inactive
							echo "<button type='button' class='btn btn-default' id='switch' disabled='disabled'>switch</button>\n";
							
						}
						?>
						<?php
						//if($_SESSION["tblname"] == "real_estate"){
							//tolabel is active
							
			                if($_SESSION["scenario"] == "Scenario 2" || $_SESSION["scenario"] == "Scenario 4"|| $_SESSION["scenario"] == "Scenario 1"){
				                //if it is real_estate, then the label button is active
				             echo "<button type='button' class='btn btn-default' id='to-label-btn'>Label</button>\n";
				  
			                } else {
				                //if it is sdss, then the label button is inactive
				                echo "<button type='button' class='btn btn-default' id='to-label-btn' disabled='disabled'>Label</button>\n";
				            }
			  
						//}
						// else{
// 							//for sdss, tolabel is inactive
// 							echo "<button type='button' class='btn btn-default' id='to-label-btn' disabled='disabled'>To label</button>\n";
// 							
// 						}
						?>
						
                        <button type="button" class="btn btn-default" id="next-iteration-btn">Next Iteration</button>
                        <button type="button" class="btn btn-default" id="explore-stop-btn">Stop</button>
                        
                        <?php
                        if ($_SESSION["scenario"] == "Scenario 2") {
                            // echo "<button type='button' class='btn btn-default' id='nextKiteration-btn'>Next K Iteration</button>";
                        }
						
						if($_SESSION["tblname"] == "real_estate"){
							echo "<button type='button' class='btn btn-default' id='all-relevant-objects-btn'>All Relevant Objects</button>";
						}
                        ?>
                        
                      </div>
                    </div>
                  </div>
				  
                  <div class="form-group">
                    <label for="" class="col-md-5 control-label">Label:</label>
                    <div class="col-md-7">				  
				    	<select class="form-control" id="point-label">
				    		<option>positive</option>
				    		<option>negative</option>
				    	</select>
                    </div>
                  </div>
				  
				  <?php
				  if($_SESSION["tblname"] == "real_estate"){
					  echo "<div class='form-group'>" . 
                    "<label for='' class='col-md-5 control-label'>Predicted Areas:</label>" .
                    "<div class='col-md-7'>" .
                      "<select class='form-control' id='pre-areas'>" .						  
                      "</select>" .
                    "</div>" .
                  "</div>";				  
					
				  }
					
				  ?>
				  
				  
				  <?php
				    echo "<input type='hidden' name='attr_range_data' id='attr_range_data_input' value='{$attrdatastr}'>\n";	
				  ?>
				  
                </form>

                <ul class="list-group bottom-align" id='list-of-nums'>
                  <li class="list-group-item">
                    <span class="badge" id="list_num_samples">0</span>
                    Number of Samples
                  </li>
                  <li class="list-group-item">
                    <span class="badge" id="list_num_positive">0</span>
                    Positive Samples
                  </li>
                  <li class="list-group-item">
                    <span class="badge" id="list_num_negative">0</span>
                    Negative Samples
                  </li>
                  <li class="list-group-item">
                    <span class="badge" id="list_iterations">0</span>
                    Iterations
                  </li>
                  
                  <?php
                        if ($_SESSION["scenario"] == "Scenario 2" || $_SESSION["scenario"] == "Scenario 4") {
                             echo "<li class='list-group-item'>
                                    <span class='badge' id='list_accuracy'>0</span>
                                    F_Measure
                                    </li>";
                        }
                  ?>
				    
                </ul>
                
            </div>
            <div class="tableContainer" id='tableContainer'></div>
          </div>

        </div>

      </div>
    </div>


  </div>

</body>

</html>

<?php

}
else{

  $_SESSION['error_message'] = "Error: No attribute ranges specified. " . " <br />" . "Please provide the ranges of at least two attributes to explore. " . " <br />";
  header('location:empty_attribute.php');
  exit();

}

?>
