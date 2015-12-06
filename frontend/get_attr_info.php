<?php
// Check if session is not registered, redirect back to main page.
// Put this code in first line of web page.
session_start();

//table name sent from form
if(isset($_POST['attr_names'])){
  $attr_names = $_POST['attr_names'];
}
else {
  header("location:connect.php");
}

//$attr = "rowc";
//$attr_names = "ra,dec,rowc,";
//var_dump($attr_names);	
if(!isset($_SESSION["hostname"], $_SESSION["portnum"], $_SESSION["username"], $_SESSION["password"], $_SESSION["dbname"], $_SESSION["tblname"])){
  header("location:connect.php");
}

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

$attr_array = explode( ',', $attr_names );
//var_dump($attr_array);

$query = "";
foreach ($attr_array as $attr){
	
	if(empty($attr))
		break;
	
	//$new_attr_query = "select  '{$attr}:' || round(CAST(min({$attr}) as numeric), 4) as min_value,  '{$attr}:' || round(CAST(max({$attr}) as numeric), 4) as max_value from {$_SESSION["tblname"]} where {$attr} > -9999";
	
	$new_attr_query = "select  '{$attr}:' || min({$attr}) as min_value,  '{$attr}:' || max({$attr}) as max_value from {$_SESSION["tblname"]} where {$attr} > -9999";
	
	if(empty($query))
		$query = $query . $new_attr_query;
	else
		$query = $query . " union " . $new_attr_query;
	
}
//var_dump($query);


//$query = "select min({$attr}) as min_value, max({$attr}) as max_value from {$_SESSION["tblname"]} where {$attr} > -9999;";

//$result = pg_query($dbconn, $query) or die('Query failed: ' . pg_last_error());
//var_dump($result);
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


?>
