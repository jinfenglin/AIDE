<?php

// Check if session is not registered, redirect back to main page.
// Put this code in first line of web page.
session_start();

//table name sent from form
if(isset($_POST['xname'], $_POST['yname'], $_POST['xbktnum'], $_POST['ybktnum'], $_POST['xmin'], $_POST['xmax'], $_POST['ymin'], $_POST['ymax'], $_POST['aggregate'])){
  $xname = $_POST['xname'];
  $yname = $_POST['yname'];
  $xbktnum = $_POST['xbktnum'];
  $ybktnum = $_POST['ybktnum'];
  $xmin = $_POST['xmin'];
  $xmax = $_POST['xmax'];
  $ymin = $_POST['ymin'];
  $ymax = $_POST['ymax'];
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

  $query = "select grp_1 as col_num, grp_2 as row_num, count(*) as aggregate_value
  from (
  select {$xname}, {$yname},
  width_bucket({$xname}, {$xmin}, {$xmax} + 1e-10, {$xbktnum}) as grp_1,
  width_bucket({$yname}, {$ymin}, {$ymax} + 1e-10, {$ybktnum}) as grp_2
  from {$_SESSION["tblname"]}
  where {$xname} between {$xmin} and {$xmax}
  and {$yname} between {$ymin} and {$ymax}
  ) as sub1
  group by grp_1, grp_2
  order by grp_1, grp_2;";

}
else {   //$aggregate will be avg(...)

  $aggAttr = substr($aggregate, 4, -1);    //extract the attribute name from avg(...)

  $query = "select grp_1 as col_num, grp_2 as row_num, {$aggregate} as aggregate_value
  from (
  select {$xname}, {$yname}, {$aggAttr},
  width_bucket({$xname}, {$xmin}, {$xmax} + 1e-10, {$xbktnum}) as grp_1,
  width_bucket({$yname}, {$ymin}, {$ymax} + 1e-10, {$ybktnum}) as grp_2
  from {$_SESSION["tblname"]}
  where {$xname} between {$xmin} and {$xmax}
  and {$yname} between {$ymin} and {$ymax}
  ) as sub1
  group by grp_1, grp_2
  order by grp_1, grp_2;";

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
