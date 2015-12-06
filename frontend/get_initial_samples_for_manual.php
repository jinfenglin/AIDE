<?php

// Check if session is not registered, redirect back to main page.
// Put this code in first line of web page.
session_start();

//get attribute x,y value ranges, initial sampling method

//echo '[{"ra": "23.8", "dec": "3.4"}, {"ra": "12.9", "dec": "1.5"}]';

if(isset($_POST['xname'], $_POST['yname'], $_POST['xmin'], $_POST['xmax'], $_POST['ymin'], $_POST['ymax'], $_POST['method'], $_POST['attrs'])){
  $xname = $_POST['xname'];
  $yname = $_POST['yname'];
  $xmin = $_POST['xmin'];
  $xmax = $_POST['xmax'];
  $ymin = $_POST['ymin'];
  $ymax = $_POST['ymax'];
  $method = $_POST['method'];
  $attrs = $_POST['attrs'];
}
else {
  header("location:connect.php");
}
$query_str = $_GET['query_str'];
//$xname = "ra";
//$yname = "dec";
//$xmin = "40";
//$xmax = "60";
//$ymin = "-5";
//$ymax = "10";
//$method = "width";

if(!isset($_SESSION["hostname"], $_SESSION["portnum"], $_SESSION["username"], $_SESSION["password"], $_SESSION["dbname"], $_SESSION["tblname"])){
  header("location:connect.php");
}

//
$conn_input = "host={$_SESSION["hostname"]} port={$_SESSION["portnum"]} dbname={$_SESSION["dbname"]} user={$_SESSION["username"]} password={$_SESSION["password"]}";
//$conn_input = "host=dbcluster.cs.umass.edu port=54320 dbname=testdb user=wenzhao password=CSwenCF";

//$dbconn = pg_connect($conn_input) or die('Could not connect: ' . pg_last_error());
$dbconn = pg_connect($conn_input);

if (!$dbconn) {
  $message = "Input:  host: {$_SESSION["hostname"]}, port: {$_SESSION["portnum"]}, username: {$_SESSION["username"]}, password: {$_SESSION["password"]}, database: {$_SESSION["dbname"]} .\n";

  $_SESSION['error_message'] = "Error: Could not connect. " . pg_last_error() . "<br /> {$message} <br />";
  header('location:error_page.php');
  exit();
}

$tablename = $_SESSION["tblname"];

/*if($method === "width"){  //use equi-width sampling method
            // modified by kemi, works for map and chart
    $query = "select id, lat, long, price, beds, baths, size, crime, population, prc_college, income, town, pricesqrf, {$xname} as x_value, {$yname} as y_value
			from (
				select id, lat, long, price, beds, baths, size, crime, population, prc_college, income, town, pricesqrf, row_number() over(
            						partition by grp_1, grp_2
            						order by random()
       		 						) as rn  
				from (
					select id, lat, long, price, beds, baths, size, crime, population, prc_college, income, town, pricesqrf,
       			 	width_bucket({$xname}, {$xmin}, {$xmax}, 27) as grp_1,   
       			 	width_bucket({$yname}, {$ymin}, {$ymax}, 27) as grp_2
					from {$tablename}
					where {$query_str}
				) as sub1
			) as sub2
            where rn <= 1;";

}
elseif ($method === "depth") {   //use equi-depth sampling method

            // modified by kemi, works for map and chart
    $query = "select id, lat, long, price, beds, baths, size, crime, population, prc_college, income, town, pricesqrf, {$xname} as x_value, {$yname} as y_value
			from (
				select id, lat, long, price, beds, baths, size, crime, population, prc_college, income, town, pricesqrf, grp_1, grp_2,
       		 			row_number() over (partition by grp_1, grp_2 order by random()) as rn
				from (
					select id, lat, long, price, beds, baths, size, crime, population, prc_college, income, town, pricesqrf, grp_1,
       			 			ntile(27) over (partition by grp_1 order by {$yname}) as grp_2
					from (
						select id, lat, long, price, beds, baths, size, crime, population, prc_college, income, town, pricesqrf,
       				 		ntile(27) over (order by {$xname}) as grp_1
						from {$tablename}
						where {$query_str}
					) as sub1
				) as sub2	   
			) as sub3
            where rn <= 1;";
  	
}*/

//$result = pg_query($dbconn, $query) or die('Query failed: ' . pg_last_error());
//$query = trim(preg_replace('/\s+/g', '', $query));
$query = "select distinct id, lat, long, price, beds, baths, size, crime, population, prc_college, income, town, pricesqrf, {$xname} as x_value, {$yname} as y_value from {$tablename} where {$query_str};";
$_SESSION["target_query"] = "select {$attrs} from {$tablename} where {$query_str};";
$result = pg_query($dbconn, $query);

if (!$result) {
  $_SESSION['error_message'] = "Error: Query failed. " . pg_last_error() . "<br /> {$query} <br />";
  header('location:error_page.php');
  exit();
}

//$rows = pg_num_rows($result);

$data = array();

while ($line = pg_fetch_array($result, null, PGSQL_ASSOC)) {
  $data[] = $line;
}

echo json_encode($data);

pg_free_result($result);

pg_close($dbconn);

//echo '[{"ra": "23.8", "dec": "3.4"}, {"ra": "12.9", "dec": "1.5"}]';

?>
