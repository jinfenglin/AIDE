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
    
    $_SESSION["target_query_selected"] = $_POST["target_query"];
    $_SESSION["recommendation"] = $_POST['recommendation'];
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
      <!-- histogram draw function -->
      <script src="js/histogram_draw.js"></script>
      <!-- attribute information collector -->
      <script src="js/collect_attribute.js"></script>
      <!-- events processing -->
      <script src="js/histogram_events.js"></script>
      <!-- 2d heatmap draw function -->
      <script src="js/heatmap_draw.js"></script>
      <!-- 1d heatmap draw function -->
      <script src="js/1d_heatmap_draw.js"></script>
	  
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

        <div class='row'>
            <div class="col-md-12">
				<div class="panel panel-info">
				  <!-- Default panel contents -->
				  <div class="panel-heading">
					  <h4 class='panel-title'>
					  	Attribute Information
				  	  </h4>
				  </div>
				  
				  	
				  <!-- Table -->
				  
				  <table class="table" id="attr_info_table">
	  				  <tr>
						<th>#</th>  
	  				    <th>Name</th>
	  				    <th>Range Min value</th>
	  					<th>Range Max value</th>
						<th>Select to Explore?</th>
	  				  </tr>
                      <?php
                      	foreach($_POST['check_list'] as $attr) {
							echo "<tr>\n";
							echo "<td class='attr-info-index'></td>\n";
                        	echo "<td class='attr-info-name'>{$attr}</td>\n";
							echo "<td class='attr-info-min-value' id='{$attr}-min-value'></td>\n";
							echo "<td class='attr-info-max-value' id='{$attr}-max-value'></td>\n";
							echo "<td class='attr-info-checkbox' id='{$attr}-info-checkbox'><input type='checkbox' value='{$attr}'></td>";
							echo "</tr>\n";
                      	}

                      ?>
	  				  
				  </table>
				  
				  
				  <div class="panel-footer">
					   The total number of tuples within these attribute ranges: <mark id="tupleNumber"></mark>
				  </div>
				  
					  
				</div>	
            </div>
        </div>
				
		
        <div class='row'>
            <div class="col-md-12">
				
				<div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
					
	              <div class="panel panel-default">

	                <div class="panel-heading" role="tab" id="headingOne">
	                    <h4 class='panel-title text-capitalize'>
		                    <a data-toggle="collapse" data-parent="#accordion" href="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
		                      1D Histogram Display
		                    </a>							
						</h4>
	                </div>
					
					<div id="collapseOne" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne">
						
		                <div class="panel-body">

		                  <div class="col-md-12 small-southeast-align">

		                    <div class="col-md-4">

		                      <form class="form-horizontal">

		                        <div class="form-group">
		                          <label for="" class="col-md-5 control-label">Attribute Name:</label>
		                          <div class="col-md-5">

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
		                          <div class="col-md-5">
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
		                          <div class="col-md-5">
		                            <select name='' class='form-control' id='histogram-yscale'>
		                            	<option selected="selected">linear</option>
		                            	
		                          	</select>
		                          </div>
		                        </div>

		                      </form>

		                    </div>


		                	<div class='col-md-8'>

		                  	  <form class="form-inline">
								  <div class="col-md-6">
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
							  	  </div>
								  <div class="col-md-4">
		                    	  	<button type='button' class='btn btn-default' id='histogram-update-btn'>Update Exploration Range</button>
								  </div>
								  <div class="col-md-2">
		                    	  	<button type='button' class='btn btn-default' id='histogram-set-to-default-btn'>Set to Default</button>
								  </div>								  
								  <div class="col-md-12">	
		                    	  	<p class="help-block">Please specify your interested exploration range for the attribute here.</p>
							  	  </div>
								  								  
		                  	  </form>

							  <div class="col-md-12 small-top-margin">
	                    	 	 <div class="form-group">
	                      	  		 <label for="" class="col-md-3 control-label">Show Histogram:</label>
	                      	  		 <div class="col-md-7">
	  		                  	  	   <div class="btn-group" role="group" aria-label="...">
	  		                    	  	 <button type="button" id="histogram-width-btn" class="btn btn-primary">Equi-width Plot</button>
	  		                    	  	 <button type="button" id="histogram-depth-btn" class="btn btn-primary">Equi-depth Plot</button>
	  		                  	  	   </div>
	                      	  		</div>
	                    	 	</div>
						 	</div>

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
				  
				  
	              <div class="panel panel-default">

	                <div class="panel-heading" role="tab" id="headingTwo">
	                  <h4 class='panel-title text-capitalize'>
						  
	                      <a class="collapsed" data-toggle="collapse" data-parent="#accordion" href="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
	                        1D Heatmap Display
	                      </a>
					  </h4>
	                </div>
				  
					<div id="collapseTwo" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingTwo">
				  		<div class="panel-body">
							
  		                  	<div class="col-md-12 small-southeast-align">

  		                    <div class="col-md-4">

  		                      <form class="form-horizontal">

  		                        <div class="form-group">
  		                          <label for="" class="col-md-6 control-label">Group by Attribute:</label>
  		                          <div class="col-md-5">

  		                            	<select name='' class='form-control' id='one-d-heatmap-attr'>
  		                          		<?php
  		                          			foreach($_POST['check_list'] as $attr) {
  		                            			  echo "<option>{$attr}</option>\n";
  		                          		  	}

  		                          		?>
  		                          	</select>
  		                        	</div>
  		                        </div>

  		                        
  		                        <div class="form-group">
  		                        	<label for="" class="col-md-6 control-label">Aggregate Function:</label>
  		                        	<div class="col-md-5">
  		                          	<select name='' class='form-control' id='one-d-heatmap-aggregate-attr'>
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
  		                        	<label for="" class="col-md-6 control-label">Bucket Number:</label>
  		                        	<div class="col-md-5">
  		                          		<select name='' class='form-control' id='one-d-heatmap-bucketnum'>
  		                          			<option>5</option>
  		                          			<option selected="selected">10</option>
  		                          			<option>15</option>
  		                          			<option>20</option>
  		                          			<option>25</option>
  		                          			<option>30</option>
  		                        	 	</select>
  		                      		</div>
  		                    	</div>
  		                  	  </form>

  		                	</div>

  		                	  <div class='col-md-8'>
							  
  							  <div class='col-md-12 medium-bottom-margin'>								  
  		                      	<form class="form-inline">	
  									<div class="col-md-6">							  	
  		                        	  	<div class="form-group">
  		                          			<label class="sr-only" for="">1D attr range</label>
  		                          	  		<div class="input-group">
  		                            			<div class="input-group-addon">Min</div>
  		                            			<input type='text' class='form-control' id='one-d-heatmap-minvalue' placeholder=''>
  		                            			<div class="input-group-addon">Max</div>
  		                            			<input type='text' class='form-control' id='one-d-heatmap-maxvalue' placeholder=''>
  		                          	  		</div>
  		                        	  	</div>		
  									</div>
  	  								<div class="col-md-4">
  	  	                        		<button type='button' class='btn btn-default' id='one-d-heatmap-update-btn'>Update Exploration Range</button>
  	  								</div>
  	  								<div class="col-md-2">
  	  	                        		<button type='button' class='btn btn-default' id='one-d-heatmap-set-to-default-btn'>Set to Default</button>
  	  								</div>							
  		                      	</form>							  
  						  	  </div>

  							  
  						  	  <div class='col-md-12'>	
  								  <form class="form-horizontal">
  	 		                    	 <div class="form-group">
  	 		                      	  	<label for="" class="col-md-3 control-label">Show Heatmap:</label>
  	 		                      	  	<div class="col-md-7">
  	 		                        		<div class="btn-group-vertical" role="group" aria-label="...">
  	 		                          		<button type='button' id='one-d-heatmap-btn' class='btn btn-primary'>Plot</button>
  	 		                        	  	</div>
  	 		                      	  	</div>
  	 		                    	 </div>
									  
  								  </form>		  
						  
  						  	  </div>	
						  	
  		                	  </div>

  		                  </div>
							
							
	                  <div class="col-md-12 small-southeast-align">

	                    <div class="col-md-offset-4 col-md-7" id="one-d-heatchartContainer">
	                      <div id="one-d-heatchart"></div>
	                    </div>

	                  </div>
						
							
							
						</div>	
					</div>
				  </div>
				  
			  
	              <div class="panel panel-default">

	                <div class="panel-heading" role="tab" id="headingThree">
	                  <h4 class='panel-title text-capitalize'>
						  
	                      <a class="collapsed" data-toggle="collapse" data-parent="#accordion" href="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
	                        2D Heatmap Display
	                      </a>
					  </h4>
	                </div>
					
					<div id="collapseThree" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingThree">
						
		                <div class="panel-body">

		                  	<div class="col-md-12 small-southeast-align">

		                    <div class="col-md-4">

		                      <form class="form-horizontal">

		                        <div class="form-group">
		                          <label for="" class="col-md-5 control-label">X Attribute:</label>
		                          <div class="col-md-5">

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
		                        	<div class="col-md-5">
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
		                        	<div class="col-md-5">
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
		                        	<div class="col-md-5">
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


		                    	 
					  
		                  	</form>

		                	</div>

		                	  <div class='col-md-8'>
							  
							  <div class='col-md-12 medium-bottom-margin'>								  
		                      	<form class="form-inline">	
									<div class="col-md-7">							  	
		                        	  	<div class="form-group">
		                          			<label class="sr-only" for="">X</label>
		                          	  		<div class="input-group">
		                            			<div class="input-group-addon">X &nbsp; &nbsp; Min</div>
		                            			<input type='text' class='form-control' id='x-minvalue' placeholder=''>
		                            			<div class="input-group-addon">X &nbsp; &nbsp; Max</div>
		                            			<input type='text' class='form-control' id='x-maxvalue' placeholder=''>
		                          	  		</div>
		                        	  	</div>		
									</div>
	  								<div class="col-md-3">
	  	                        		<button type='button' class='btn btn-default' id='x-update-btn'>Update X Range</button>
	  								</div>
	  								<div class="col-md-2">
	  	                        		<button type='button' class='btn btn-default' id='x-set-to-default-btn'>Set to Default</button>
	  								</div>							
		                      	</form>							  
						  	  </div>

							  <div class='col-md-12 medium-bottom-margin'>
		                      <form class="form-inline">
								  <div class="col-md-7">
		                        	  <div class="form-group">
		                          		<label class="sr-only" for="">Y</label>
		                          	  	<div class="input-group">
		                            		<div class="input-group-addon">Y &nbsp; &nbsp; Min</div>
		                            		<input type='text' class='form-control' id='y-minvalue' placeholder=''>
		                            		<div class="input-group-addon">Y &nbsp; &nbsp; Max</div>
		                            		<input type='text' class='form-control' id='y-maxvalue' placeholder=''>
		                          	  	</div>
		                        	</div>
								</div>
								<div class="col-md-3">
		                        	<button type='button' class='btn btn-default' id='y-update-btn'>Update Y Range</button>
								</div>
								<div class="col-md-2">
		                        	<button type='button' class='btn btn-default' id='y-set-to-default-btn'>Set to Default</button>
								</div>
		                      </form>
						  	  </div>
						  
						  	  <div class='col-md-12'>	
								  <form class="form-horizontal">
	 		                    	 <div class="form-group">
	 		                      	  	<label for="" class="col-md-3 control-label">Show Heatmap:</label>
	 		                      	  	<div class="col-md-7">
	 		                        		<div class="btn-group-vertical" role="group" aria-label="...">
	 		                          		<button type='button' id='heatmap-btn' class='btn btn-primary'>Plot</button>
	 		                        	  	</div>
	 		                      	  	</div>
	 		                    	 </div>
									  
								  </form>		  
						  
						  	  </div>	
						  	
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
            </div>
        </div>


        <div class="row">
          <div class="col-md-12">
           <?php
			  if($_SESSION["scenario"] != "Scenario 2"){
                echo "<form target='_blank' action='space_explore.php' method='post'>".
                    "<input type='hidden' name='attr_data' id='attr_data_input'>".
                    "<button type='submit' name='attr_confirm' class='btn btn-primary button-align'>Automatic</button>".
                "</form>";
              } else {
                echo "<form target='_blank' action='space_explore.php' method='post'>".
                    "<input type='hidden' name='attr_data' id='attr_data_input'>".
                    "<button type='submit' name='attr_confirm' class='btn btn-primary button-align' disabled='disabled'>Automatic</button>".
                "</form>";
              }
            ?>
            <form target="_blank" action="space_explore_manual.php" method="post">
              <input type="hidden" name="attr_data" id="attr_data_input_manual">
			  <?php
			  if($_SESSION["tblname"] == "real_estate" && $_SESSION["scenario"] == "Scenario 2"){
				  //if it is real_estate, then the manual button is active
				  echo "<button type='submit' name='attr_confirm' class='btn btn-primary button-align'>Manual</button>\n";
				  
			  }
			  else{
				  //if it is sdss, then the manual button is active
				  echo "<button type='submit' name='attr_confirm' class='btn btn-primary button-align' disabled='disabled'>Manual</button>\n";
			  }
			  ?>
              
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
