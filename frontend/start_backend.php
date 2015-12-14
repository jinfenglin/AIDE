<?php
//this PHP program will start the JAVA backend server and the Proxy program
session_start();

if(!isset($_SESSION["hostname"], $_SESSION["portnum"], $_SESSION["username"], $_SESSION["password"], $_SESSION["dbname"], $_SESSION["tblname"], $_SESSION["scenario"])){
  header("location:connect.php");
}

$proxy_port = $_POST['proxyport'];
$server_port = $_POST['serverport'];

$address = "localhost";


//start the JAVA backend program
/*
$old_path = getcwd();
//chdir('/Users/wenzhao/Sites/exploration/backend/liping');
chdir('./backend/liping');
//shell_exec('./run.sh >>/dev/null 2>>/dev/null');
//exec('./run.sh >>/dev/null 2>>/dev/null &');
exec('./run.sh >>output.txt 2>>output.txt &');
*/

$old_path = getcwd();

if($_SESSION["scenario"] == "Scenario 5" || $_SESSION["scenario"] == "Scenario 6"){
	//start liping's backend
	chdir('./backend/liping');
	exec('./run.sh >>output.txt 2>>output.txt &');
}
else{
	//start kiki's backend
//	chdir('./backend/kiki');
	//exec('./run.bat >>output.txt 2>>output.txt &');
}

chdir($old_path);

//sleep(1);

//start the Proxy program
//exec("java -classpath ./java_file/ ProxySocket {$server_port} {$proxy_port} >>/dev/null 2>>/dev/null &");

sleep(1);

$attrinfo_str = $_POST['attrinfo'];
//fwrite($configfile, $attrinfo_str);

//the obj is like {"attr_collection": [{"attr_name": xxx, "min_value": xxx, "max_value": xxx}, {}, ...]}
$attr_json_obj = json_decode($attrinfo_str);
//$attrinfo_array is an array of objects [{},{},{}...]
$attrinfo_array = $attr_json_obj -> {"attr_collection"};
	
/*
$hostname = "localhost";
$portnum = 8889;
$username = "wenzhao";
$password = "CSwenCF";
$dbname = "testdb";
*/

$hostname = $_SESSION["hostname"];
$portnum = (int)$_SESSION["portnum"];
$username = $_SESSION["username"];
$password = $_SESSION["password"];
$dbname = $_SESSION["dbname"];
$scenario = $_SESSION["scenario"];
if (isset($_SESSION["target_query"]))
    $target_query = $_SESSION["target_query"];
else
    $target_query = '';

$db = array();
$db["host"] = $hostname;
$db["port"] = $portnum;
$db["user"] = $username;
$db["pwd"] = $password;
$db["db"] = $dbname;

$visualAttributes = array();
if($_SESSION["tblname"] == "real_estate"){
	//this is housing dataset
	//the key is id
	$key = "id";
	$visualAttributes[] = "lat";
	$visualAttributes[] = "long";
}
else{
	//this is sdss dataset
	//the key is objid
	$key = "objid";
	$visualAttributes[] = "ra";
	$visualAttributes[] = "dec";
}


$attrnames = array();
//$attrnames[] = $_POST['xname'];
//$attrnames[] = $_POST['yname'];
for($i = 0; $i < count($attrinfo_array); $i++){
	$attrnames[] = $attrinfo_array[$i] -> {"attr_name"};
}

//$tablename = "sdss_random_sample";
$tablename = $_SESSION["tblname"];
	
$focusedExploration = true;

$lowerbound = array();
//$lowerbound[] = (float)$_POST['xmin'];
//$lowerbound[] = (float)$_POST['ymin'];
for($i = 0; $i < count($attrinfo_array); $i++){
	$lowerbound[] = $attrinfo_array[$i] -> {"min_value"};
}

$upperbound = array();
//$upperbound[] = (float)$_POST['xmax'];
//$upperbound[] = (float)$_POST['ymax'];
for($i = 0; $i < count($attrinfo_array); $i++){
	$upperbound[] = $attrinfo_array[$i] -> {"max_value"};
}

$query = array();
$query["key"] = $key;
$query["visualAttributes"] = $visualAttributes;
$query["attributes"] = $attrnames;
$query["tableName"] = $tablename;
$query["focusedExploration"] = $focusedExploration;
$query["lowerBounds"] = $lowerbound;
$query["upperBounds"] = $upperbound;

$demo = array();
$demo["scenario"] = $scenario;

$demo["recommendation"] = $_SESSION["recommendation"];

if($_SESSION["scenario"] == "Scenario 4"){
    $demo["target_query"] = $_SESSION["target_query_selected"];
} else {
    $demo["target_query"] = $target_query;
}

$config = array();
$config["db"] = $db;
$config["query"] = $query;
$config["demo"] = $demo;

//echo json_encode($config);

$config_json_str = json_encode($config) . "\n";
//fwrite($configfile, json_encode($config));

/* Create a TCP/IP socket. */
$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP) or die('Could not create socket.');

$result = socket_connect($socket, $address, $proxy_port) or die('Socket connection is failed.');

//echo config_json_str;
socket_write($socket, $config_json_str, strlen($config_json_str));


$reply = array();
$reply["success"] = 1;

echo json_encode($reply);

socket_close($socket);

?>

