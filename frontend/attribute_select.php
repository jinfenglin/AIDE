<?php

// Check if session is not registered, redirect back to main page.
// Put this code in first line of web page.
session_start();

// if(!session_is_registered("table_select")){
//   header("location:table_select.php");
// }

if(!isset($_SESSION["hostname"], $_SESSION["portnum"], $_SESSION["username"], $_SESSION["password"], $_SESSION["dbname"])){
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



  ?>

  <!DOCTYPE html>
  <html lang="en">

  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Select Attribute</title>
    <link href='http://fonts.googleapis.com/css?family=Lato' rel='stylesheet' type='text/css'>
    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
    <link href="css/style.css" rel="stylesheet">
    <!-- Optional theme -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">
    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <!-- Include all compiled plugins (below), or include individual files as needed -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>

    <script>
	function changeQuery(query_select){
		var query = query_select.value;
		//console.log(query);
		
		if(query == "query 1"){
			//set attribute for query 1
			//console.log("here");
			
			$("#query_attr_x_checkbox").val("rowc");
			$("#query_attr_x_text").attr("data-original-title", "Row center position(r-band coordinates)");
			$("#query_attr_x_text").html("<strong>rowc</strong>  (real)");
			
			$("#query_attr_y_checkbox").val("colc");
			$("#query_attr_y_text").attr("data-original-title", "Column center position(r-band coordinates)");
			$("#query_attr_y_text").html("<strong>colc</strong>  (real)");
			
			
		}
		else if(query == "query 2"){
			//set attribute for query 2
			//console.log("there");
			//console.log($("#query_attr_x_checkbox").val());
			//console.log($("#query_attr_x_text").attr("data-original-title"));
			//console.log($("#query_attr_x_text").html());
			
			$("#query_attr_x_checkbox").val("ra");
			$("#query_attr_x_text").attr("data-original-title", "J2000 Right Ascension (r-band)");
			$("#query_attr_x_text").html("<strong>ra</strong>  (float)");
			
			$("#query_attr_y_checkbox").val("dec");
			$("#query_attr_y_text").attr("data-original-title", "J2000 Declination (r-band)");
			$("#query_attr_y_text").html("<strong>dec</strong>  (float)");
			
		}
		
	};
	
    $(function () {
      $('[data-toggle="tooltip"]').tooltip();
    });
    </script>

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
              <li class="previous"><a href="checklogin.php"><span aria-hidden="true">&larr;</span> Go Back</a></li>
            </ul>
          </nav>
        </div>
      </div>

      <div class="row">
        <div class="col-md-12">

          <form class="" action="histogram2.php" method="post">
			  
              
              <?php
			  
              if($_SESSION["scenario"] == "Scenario 4"){
              echo "<div class='col-md-12 medium-top-margin medium-bottom-margin'>" .
				  "<div class='form-group'>".
                  "<label for='' class='col-md-2 control-label'>Query :</label>".
                      "<div class='col-md-3'>".
                        "<select name = 'target_query' class='form-control' id='target_query_id' onchange='changeQuery(this)'>".
                             "<option value='query 1'>query 1\n</option>;".
                             "<option value='query 2'>query 2\n</option>;".
                             //"<option value='query 3'>query 3\n</option>;".
                        "</select>".
                      "</div>".
              "</div>".
			"</div>";
            
              }
			  
			  
              ?>
              
            <div class='col-md-12 medium-top-margin medium-bottom-margin'>
                <div class="form-group">
                  <label for="recommendMethod" class="col-md-2 control-label">Recommendation: </label>
                  <div class="col-md-3">
                    <select name="recommendation" class="form-control" id="recommendMethod" onchange="getMyScenario(this)">
                      <option value="disabled">No Recommendation</option>
					            <option value="userbased">User Based Recommendation</option>
                      <option value="hybrid">Model Based Recommendation</option>            
                    </select>
                  </div>
                </div>
            </div>
			  
			<div class="col-md-12">
				  
            <div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">

            <div class="panel panel-default">
				  
                <div class="panel-heading" role="tab" id="headingThree">
                  <h4 class="panel-title">
                    <a class="collapsed" data-toggle="collapse" data-parent="#accordion" href="#collapseThree" aria-expanded="true" aria-controls="collapseThree">
                      Complete Attributes
                    </a>
                  </h4>
                </div>
				
                <?php
                if ($_SESSION["tblname"] == "real_estate") {
                    echo "<div id='collapseThree' class='panel-collapse collapse in' role='tabpanel' aria-labelledby='headingThree'>";
                }
                else {
                    echo "<div id='collapseThree' class='panel-collapse collapse' role='tabpanel' aria-labelledby='headingThree'>";
                }
                ?>
                  <div class="panel-body enable-scroll">

                    <?php

					if($_SESSION["tblname"] == "sdss_random_sample"){
						//use sdss query
						
	                    $query3 = "select a.attname as col_name, c.typname as col_type
	                    from pg_attribute as a, pg_class as b, pg_type as c
	                    where a.attrelid = b.oid and a.atttypid = c.oid
	                    and b.relname = '{$_SESSION["tblname"]}' and b.relkind = 'r'
	                    and a.attnum > 0;";

	                    //echo $query;
	                    //echo "<br>";

	                    //$result = pg_query($dbconn, $query) or die('Query failed. ' . pg_last_error());

	                    $result = pg_query($dbconn, $query3);

	                    if (!$result) {
	                      $_SESSION['error_message'] = "Error: Query failed. " . pg_last_error() . "<br /> {$query3} <br />";
	                      header('location:error_page.php');
	                      exit();
	                    }

	                    $rows = pg_num_rows($result);
						
					}
					else{
						//using housing query
						
	                    $query3_kemi = "SELECT c.column_name as col_name,pgd.description as coltype
	                    FROM pg_catalog.pg_statio_all_tables as st
	                    inner join pg_catalog.pg_description pgd on (pgd.objoid=st.relid)
	                    inner join information_schema.columns c on (pgd.objsubid=c.ordinal_position
	                    and  c.table_schema=st.schemaname and c.table_name='{$_SESSION["tblname"]}');";

	                    //echo $query;
	                    //echo "<br>";

	                    //$result = pg_query($dbconn, $query) or die('Query failed. ' . pg_last_error());

	                    $result = pg_query($dbconn, $query3_kemi);

	                    if (!$result) {
	                      $_SESSION['error_message'] = "Error: Query failed. " . pg_last_error() . "<br /> {$query3} <br />";
	                      header('location:error_page.php');
	                      exit();
	                    }

	                    $rows = pg_num_rows($result);
						
						
					}
                    
                    
					if($rows <= 0){
	  			      $message = "Input:  database: {$_SESSION["dbname"]}, table: {$_SESSION["tblname"]}.<br>\n";

	  			      $_SESSION['error_message'] = "Error: Cannot get attributes from {$_SESSION["tblname"]}. " . "<br /> {$message} <br />";
	  			      header('location:error_page.php');
	  			      exit();
						
					}
                    elseif($_SESSION["tblname"] == "sdss_random_sample"){
	                    // Printing sdss attributes

	                    while ($line = pg_fetch_array($result, null, PGSQL_NUM)) {
	                      echo "\t<label class='checkbox-inline no_indent col-md-3'>\n";
						  if($_SESSION["scenario"] == "Scenario 4"){
							  //disable the ckeckbox
		                      echo "\t\t<input type='checkbox' name='check_list[]' value='{$line[0]}' disabled>\n";
	                       
						  }
						  else{
						  	  //active the checkbox
		                      echo "\t\t<input type='checkbox' name='check_list[]' value='{$line[0]}'>\n";	                       
						  }
	                      echo "\t\t<p><strong>{$line[0]}</strong>  ({$line[1]})</p>\n";
	                      echo "</label>\n";

	                    }
						
                   
                    }
					else {
					
	                    // Printing housing attributes

	                    while ($line = pg_fetch_array($result, null, PGSQL_NUM)) {
                            if ($line[0] != 'town' && $line[0] != 'id' && $line[0] != 'lat' && $line[0] != 'long') {  // zhan: do not let user select 'town', 'id', 'lat' and 'long'
	                      echo "\t<label class='checkbox-inline no_indent col-md-3'>\n";
						  
						  if($_SESSION["scenario"] == "Scenario 1"){
						  	  echo "\t\t<input type='checkbox' name='check_list[]' value='{$line[0]}' checked>\n";
						  }
						  else{
						  	  echo "\t\t<input type='checkbox' name='check_list[]' value='{$line[0]}'>\n";	
						  }
	                      
	                       echo "\t\t<p><strong>{$line[1]}</strong>  </p>\n";                        //added by kemi
	                  //    echo "\t\t<p><strong>{$line[0]}</strong>  ({$line[1]})</p>\n";            //removed by kemi
                          echo "</label>\n";
                            }
						}
			     
			    	}

			    	// Free resultset
			    	pg_free_result($result);
			    	// Closing connection					

                    ?>

                  </div>
                </div>
              </div>

              <div class="panel panel-default">
				  
                <div class="panel-heading" role="tab" id="headingOne">
                  <h4 class="panel-title">
                    <a data-toggle="collapse" data-parent="#accordion" href="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                      Popular attributes
                    </a>
                  </h4>
                </div>
			    <?php
                if ($_SESSION["tblname"] == "real_estate") {
                    echo "<div id='collapseOne' class='panel-collapse collapse' role='tabpanel' aria-labelledby='headingOne'>";
                }
                else {
                    echo "<div id='collapseOne' class='panel-collapse collapse in' role='tabpanel' aria-labelledby='headingOne'>";
                }
                ?>	
                  <div class="panel-body enable-scroll">


                    <?php
                    // Printing results in HTML
					if($_SESSION["tblname"] == "sdss_random_sample"){
						
						
						if($_SESSION["scenario"] == "Scenario 4"){
							//display preselected and highlight attributes
  	                      echo "<div class='no_indent col-md-3'>\n";
  	                      echo "\t<label class='checkbox-inline'>\n";
						  echo "\t\t<input type='checkbox' name='check_list[]' id='query_attr_x_checkbox' value='rowc' checked>\n";
	                      echo "\t\t<p data-toggle='tooltip' data-placement='right' id='query_attr_x_text' title='Row center position(r-band coordinates)'><strong>rowc</strong>  (real)</p>\n";
	                      echo "</label>\n";
	                      echo "</div>\n";
	                      	
  	                      echo "<div class='no_indent col-md-3'>\n";
  	                      echo "\t<label class='checkbox-inline'>\n";
						  echo "\t\t<input type='checkbox' name='check_list[]' id='query_attr_y_checkbox' value='colc' checked>\n";
	                      echo "\t\t<p data-toggle='tooltip' data-placement='left' id='query_attr_y_text' title='Column center position(r-band coordinates)'><strong>colc</strong>  (real)</p>\n";
	                      echo "</label>\n";
	                      echo "</div>\n";	
						}
						
	                    $query1 = "select name as col_name, type, description
	                               from attribute_popularity
	                               order by times desc;";

	                    $result = pg_query($dbconn, $query1);

	                    if (!$result) {
	                      $_SESSION['error_message'] = "Error: Query failed. " . pg_last_error() . "<br /> {$query1} <br />";
	                      header('location:error_page.php');
	                      exit();
	                    }

	                    //$line_break = "&#013;";
	                    $direction = "right";
	                    while ($line = pg_fetch_array($result, null, PGSQL_NUM)) {
	                      echo "<div class='no_indent col-md-3'>\n";
	                      echo "\t<label class='checkbox-inline'>\n";
						  
						  if($_SESSION["scenario"] == "Scenario 4"){
							  //disable the ckeckbox
		                      echo "\t\t<input type='checkbox' name='check_list[]' value='{$line[0]}' disabled>\n";
						  }
						  else{
						  	  //active the checkbox
		                     echo "\t\t<input type='checkbox' name='check_list[]' value='{$line[0]}'>\n";
						  }
						  
	                      echo "\t\t<p data-toggle='tooltip' data-placement='{$direction}'  title='{$line[2]}'><strong>{$line[0]}</strong>  ({$line[1]})</p>\n";
	                      echo "</label>\n";
	                      echo "</div>\n";
	                      if($direction == "right"){
	                        $direction = "left";
	                      }
	                      else {
	                        $direction = "right";
	                      }

	                    }
	                    // Free resultset
	                    pg_free_result($result);
						
					}
					else if ($_SESSION["tblname"] == "real_estate") {
						$query3_kemi = "SELECT c.column_name as col_name,pgd.description as coltype
	                    FROM pg_catalog.pg_statio_all_tables as st
	                    inner join pg_catalog.pg_description pgd on (pgd.objoid=st.relid)
	                    inner join information_schema.columns c on (pgd.objsubid=c.ordinal_position
	                    and  c.table_schema=st.schemaname and c.table_name='{$_SESSION["tblname"]}');";

	                    //echo $query;
	                    //echo "<br>";

	                    //$result = pg_query($dbconn, $query) or die('Query failed. ' . pg_last_error());

	                    $result = pg_query($dbconn, $query3_kemi);

	                    if (!$result) {
	                      $_SESSION['error_message'] = "Error: Query failed. " . pg_last_error() . "<br /> {$query3} <br />";
	                      header('location:error_page.php');
	                      exit();
	                    }

	                    $rows = pg_num_rows($result);

	                    if($rows <= 0){
	  			      $message = "Input:  database: {$_SESSION["dbname"]}, table: {$_SESSION["tblname"]}.<br>\n";

	  			      $_SESSION['error_message'] = "Error: Cannot get attributes from {$_SESSION["tblname"]}. " . "<br /> {$message} <br />";
	  			      header('location:error_page.php');
	  			      exit();
						
					}
					else if($_SESSION["tblname"] == "real_estate") {
					
	                    // Printing housing attributes

	                    while ($line = pg_fetch_array($result, null, PGSQL_NUM)) {
                            if ($line[0] != 'town' && $line[0] != 'id' && $line[0] != 'lat' && $line[0] != 'long') {  // zhan: do not let user select 'town', 'id', 'lat' and 'long'
	                      echo "\t<label class='checkbox-inline no_indent col-md-3'>\n";
	                      echo "\t\t<input type='checkbox' name='check_list[]' value='{$line[0]}'>\n";
	                       echo "\t\t<p><strong>{$line[1]}</strong>  </p>\n";                        //added by kemi
	                  //    echo "\t\t<p><strong>{$line[0]}</strong>  ({$line[1]})</p>\n";            //removed by kemi
                          echo "</label>\n";
                            }
						}
			     
			    	}

			    	// Free resultset
			    	pg_free_result($result);


					}
					
                    ?>

                  </div>
                </div>
              </div>

              <div class="panel panel-default">
				  
                <div class="panel-heading" role="tab" id="headingTwo">
                  <h4 class="panel-title">
                    <a class="collapsed" data-toggle="collapse" data-parent="#accordion" href="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                      Attribute groups
                    </a>
                  </h4>
                </div>
				
                <div id="collapseTwo" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingTwo">

                    <ul class="list-group enable-scroll">

	                    <?php
	                    // Printing results in HTML
						
						if($_SESSION["tblname"] == "sdss_random_sample"){
		                    $query2 = "select group_id as group, column_name as col_name, type, description
		                    from column_groups
		                    order by group_id;";

		                    $result = pg_query($dbconn, $query2);

		                    if (!$result) {
		                      $_SESSION['error_message'] = "Error: Query failed. " . pg_last_error() . "<br /> {$query2} <br />";
		                      header('location:error_page.php');
		                      exit();
		                    }

		                    $group = "0";
		                    $direction = "right";
		                    while ($line = pg_fetch_array($result, null, PGSQL_NUM)) {

		                      if(strcmp($line[0], $group) !== 0){   //new group starts
		                        if(strcmp($group, "0") !== 0){  // not the first group
		                          echo "</li>";     //end previous group
		                        }
		                        echo "<li class='list-group-item'>";  //start a new group
		                        $group = $line[0];

		                      }
		                      echo "\t<label class='checkbox-inline'>\n";
							  
							  if($_SESSION["scenario"] == "Scenario 4"){
								  //disable the ckeckbox
			                      echo "\t\t<input type='checkbox' name='check_list[]' value='{$line[1]}' disabled>\n";
							  }
							  else{
							  	  //active the checkbox
			                     echo "\t\t<input type='checkbox' name='check_list[]' value='{$line[1]}'>\n";
							  }
							  
		                      //echo "\t\t<input type='checkbox' name='check_list[]' value='{$line[1]}'>\n";
		                      echo "\t\t<p data-toggle='tooltip' data-placement='{$direction}'  title='{$line[3]}'><strong>{$line[1]}</strong>  ({$line[2]})</p>\n";
		                      echo "</label>\n";

		                    }

		                    echo "</li>";    //last group


		                    // Free resultset
		                    pg_free_result($result);
			    			pg_close($dbconn);

														
						}

	                    
	                    ?>

                  	</ul>

                </div>
              </div>
              

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
 
  ?>
