<?php

$attr = "avg(treeee)";
echo $attr;
echo "<br>";
echo substr($attr, 4, -1);

// $conn_input = "host=dbcluster.cs.umass.edu port=54320 dbname=testdb user=wenzhao password=CSwenCF";
// //echo $conn_input;
// //echo "<br>";
// $dbconn = pg_connect($conn_input) or die('Could not connect: ' . pg_last_error());
//
// if(isset($_POST['attr']))
//   $attr = $_POST['attr'];
// else
//   $attr = "dec";


// $query = "select grp as groupid, min({$attr}) as min_value, max({$attr}) as max_value, count(*) as total_count
// from (
// select *,
// width_bucket({$attr}, (select min({$attr}) from sdss_random_sample where {$attr} > -9999)-0.00001,
// (select max({$attr}) from sdss_random_sample where {$attr} > -9999)+0.00001, 5) as grp
// from sdss_random_sample
// where {$attr} > -9999
// ) as sub
// group by grp
// order by grp;";
//
// $result = pg_query($dbconn, $query) or die('Query failed: ' . pg_last_error());
// $rows = pg_num_rows($result);
//
// $data = array();
//
// while ($line = pg_fetch_array($result, null, PGSQL_ASSOC)) {
//   $data[] = $line;
// }
//
// echo json_encode($data);
//
// pg_free_result($result);
//
// pg_close($dbconn);


?>
