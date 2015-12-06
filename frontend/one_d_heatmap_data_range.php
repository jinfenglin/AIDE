<?php

// Check if session is not registered, redirect back to main page.
// Put this code in first line of web page.
session_start();

//table name sent from form
if(isset($_POST['attrname'], $_POST['bktnum'], $_POST['attrmin'], $_POST['attrmax'], $_POST['aggregate'])){
  $attrname = $_POST['attrname'];
  $bktnum = $_POST['bktnum'];
  $attrmin = $_POST['attrmin'];
  $attrmax = $_POST['attrmax'];
  $aggregate = $_POST['aggregate'];
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

if($aggregate === "count"){  //compute the count aggregation

  $query = "select grp_1 as col_num, count(*) as aggregate_value
  from (
  select {$attrname},
  width_bucket({$attrname}, {$attrmin}, {$attrmax} + 1e-10, {$bktnum}) as grp_1
  from {$_SESSION["tblname"]}
  where {$attrname} between {$attrmin} and {$attrmax}
  ) as sub1
  group by grp_1
  order by grp_1;";

}
else {   //$aggregate will be avg(...)

  $aggAttr = substr($aggregate, 4, -1);    //extract the attribute name from avg(...)

  $query = "select grp_1 as col_num, {$aggregate} as aggregate_value
  from (
  select {$attrname}, {$aggAttr},
  width_bucket({$attrname}, {$attrmin}, {$attrmax} + 1e-10, {$bktnum}) as grp_1
  from {$_SESSION["tblname"]}
  where {$attrname} between {$attrmin} and {$attrmax}
  ) as sub1
  group by grp_1
  order by grp_1;";

}

//$result = pg_query($dbconn, $query) or die('Query failed: ' . pg_last_error());

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
