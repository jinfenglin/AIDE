<?php

session_start();

//$val = $_POST['attr_data'];

if(!empty($_POST['attr_data'])) {
	
  //$attrdatastr is a json string		
  $attrdatastr = $_POST['attr_data'];
	  
  $attrdata = json_decode($_POST['attr_data']);
  //$attrdata is an object array, the structure is:
  //[{"attr_name": "some-name", "min_value": 24, "max_value": 34.2}, {...}, {...}] 
  //to refer to value, we can write as:
  // foreach($attrdata as $attr_item) {...}
  // inside the loop, we can use $attr_item -> {'attr_name'} to refer to 'attr_name' value
  
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
  <!-- Optional theme -->
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">

  <script src="https://maps.googleapis.com/maps/api/js?v=3.exp&signed_in=true"></script>

  <script src="http://d3js.org/d3.v3.min.js"></script>
  <script src="http://dimplejs.org/dist/dimple.v2.1.0.min.js"></script>
  <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
  <!-- Include all compiled plugins (below), or include individual files as needed -->
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>
  <!-- scatter plot draw function -->
  <script src="js/map_draw.js"></script>
  <script src="js/scatterplot_draw.js"></script>
  <script src="js/mixed_draw.js"></script>

  <style>
      #chart {
        height: 600px;
        width: 790px;
        margin: 0;
        padding: 0;
      }
     #legend {
        width: 118px;
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

            <div class="col-md-9" id='chart'>
                
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
                    <label for="" class="col-md-5 control-label">Initial Sampling:</label>
                    <div class="col-md-7">
                      <div class="btn-group-vertical" role="group" aria-label="...">
                        <button type="button" class="btn btn-default" id="initial-sampling-start-btn">Start</button>
                        <button type="button" class="btn btn-default" id="resample-btn">Resample</button>
                        <button type="button" class="btn btn-default" id="switch">switch</button>
                      </div>
                    </div>
                  </div>
				  
                  <div class="form-group">
                    <label for="" class="col-md-5 control-label">Exploration:</label>
                    <div class="col-md-7">
                      <div class="btn-group-vertical" role="group" aria-label="...">
                        <button type="button" class="btn btn-default" id="explore-start-btn">Start</button>
                        <button type="button" class="btn btn-default" id="next-iteration-btn">Next Iteration</button>
                        
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
				    echo "<input type='hidden' name='attr_range_data' id='attr_range_data_input' value='{$attrdatastr}'>\n";	
				  ?>
				  
                </form>

                <ul class="list-group bottom-align">
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
				    
                </ul>

            </div>

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
