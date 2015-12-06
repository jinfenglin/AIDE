<?php

// Check if session is not registered, redirect back to main page.
// Put this code in first line of web page.
//session_start();

//table name sent from form
if(isset($_POST['xname'], $_POST['yname'], $_POST['xbktnum'], $_POST['ybktnum'])){
  $xname = $_POST['xname'];
  $yname = $_POST['yname'];
  $xbktnum = $_POST['xbktnum'];
  $ybktnum = $_POST['ybktnum'];
}
else {
  header("location:main_login.php");
}

// $xname = "rowc";
// $yname = "colc";
// $xbktnum = 5;
// $ybktnum = 5;

if(isset($_POST['xmin'], $_POST['xmax'])){
  $xmin = $_POST['xmin'];
  $xmax = $_POST['xmax'];
}
else {
  $xmin = "(select min({$xname}) from sdss_random_sample where {$xname} > -9999)-0.0001";
  $xmax = "(select max({$xname}) from sdss_random_sample where {$xname} > -9999)+0.0001";
}

if(isset($_POST['ymin'], $_POST['ymax'])){
  $ymin = $_POST['ymin'];
  $ymax = $_POST['ymax'];
}
else {
  $ymin = "(select min({$yname}) from sdss_random_sample where {$yname} > -9999)-0.0001";
  $ymax = "(select max({$yname}) from sdss_random_sample where {$yname} > -9999)+0.0001";
}

// if(!isset($_SESSION["username"], $_SESSION["password"], $_SESSION["dbname"], $_SESSION["tblname"])){
//   header("location:main_login.php");
// }
//
//$conn_input = "host=dbcluster.cs.umass.edu port=54320 dbname={$_SESSION["dbname"]} user={$_SESSION["username"]} password={$_SESSION["password"]}";
$conn_input = "host=dbcluster.cs.umass.edu port=54320 dbname=testdb user=wenzhao password=CSwenCF";

$dbconn = pg_connect($conn_input) or die('Could not connect: ' . pg_last_error());
// $dbconn = pg_connect($conn_input);
//
// if (!$dbconn) {
//   $message = "Input:  username: {$_SESSION["username"]}, password: {$_SESSION["password"]}, database: {$_SESSION["dbname"]} .\n";
//
//   $_SESSION['error_message'] = "Error: Could not connect. " . pg_last_error() . "<br /> {$message} <br />";
//   header('location:error_page.php');
//   exit();
// }

$query = "select grp_1 as row_num, grp_2 as col_num, count(*) as num_points
from (
select {$xname}, {$yname},
width_bucket({$xname}, {$xmin}, {$xmax}, {$xbktnum}) as grp_1,
width_bucket({$yname}, {$ymin}, {$ymax}, {$ybktnum}) as grp_2
from sdss_random_sample
where {$xname} between ({$xmin}) and ({$xmax})
and {$yname} between ({$ymin}) and ({$ymax})
) as sub1
group by grp_1, grp_2
order by grp_1, grp_2;";

$result = pg_query($dbconn, $query) or die('Query failed: ' . pg_last_error());

// $result = pg_query($dbconn, $query);
//
// if (!$result) {
//   $_SESSION['error_message'] = "Error: Query failed. " . pg_last_error() . "<br /> {$query} <br />";
//   header('location:error_page.php');
//   exit();
// }

//$rows = pg_num_rows($result);

$data = array();

while ($line = pg_fetch_array($result, null, PGSQL_ASSOC)) {
  $data[] = $line;
}

echo json_encode($data);

pg_free_result($result);

pg_close($dbconn);


?>
