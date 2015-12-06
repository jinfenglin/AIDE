<?php

// Check if session is not registered, redirect back to main page.
// Put this code in first line of web page.
session_start();

//table name sent from form
if(isset($_POST['attr_range_info'])){
  $json_attr_range_info = $_POST['attr_range_info'];  
}
else {
  header("location:connect.php");
}

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

//convert the json string to JSON object, $attr_range_json_obj is like {"attr_range_collection": [{}, {}]}
$attr_range_json_obj = json_decode($json_attr_range_info);
//get the array from the JSON object
$attr_range_info = $attr_range_json_obj -> attr_range_collection;

$query = "select count(*) as count
from {$_SESSION["tblname"]}
where 3=3 ";


foreach($attr_range_info as $single_attr_info){
	$query = $query . " and {$single_attr_info -> attr_name} between {$single_attr_info -> min_value} and {$single_attr_info -> max_value} ";
}
	
$query = $query . ";";
	
//$result = pg_query($dbconn, $query) or die('Query failed: ' . pg_last_error());
$result = pg_query($dbconn, $query);

if (!$result) {
  $_SESSION['error_message'] = "Error: Query failed. " . pg_last_error() . "<br /> {$query} <br />";
  header('location:error_page.php');
  exit();
}


$rows = pg_num_rows($result);

$data = array();

while ($line = pg_fetch_array($result, null, PGSQL_ASSOC)) {
  $data[] = $line;
}

echo json_encode($data);

pg_free_result($result);

pg_close($dbconn);



