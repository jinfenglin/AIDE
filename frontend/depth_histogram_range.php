<?php

// Check if session is not registered, redirect back to main page.
// Put this code in first line of web page.
session_start();

//table name sent from form
if(isset($_POST['attr'], $_POST['bucketnum'], $_POST['rangemin'], $_POST['rangemax'])){
  $attr = $_POST['attr'];
  $bktnum = $_POST['bucketnum'];
  $range_min = $_POST['rangemin'];
  $range_max = $_POST['rangemax'];
}
else {
  header("location:connect.php");
}

// $attr = "ra";
// $bktnum = "5";
// $range_min = "30.2";
// $range_max = "45.8";

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

$query = "select grp as groupid, min({$attr}) AS min_value, max({$attr}) AS max_value, count(*) AS total_count
from (
select {$attr}
, ntile({$bktnum}) over (order by {$attr}) as grp
from {$_SESSION["tblname"]}
where {$attr} between {$range_min} and {$range_max}
) as sub
group by grp
order by grp;";

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
