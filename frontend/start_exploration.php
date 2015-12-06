<?php

$proxy_port = $_POST['proxyport'];
$server_port = $_POST['serverport'];


//start the JAVA proxy program
//exec("java -classpath ./java_file/ Proxy {$server_port} {$proxy_port} >>/dev/null 2>>/dev/null &");

//sleep for 2 seconds
//sleep(10);

/* Get the IP address for the target host. */
//$address = gethostbyname('www.google.com');
$address = "localhost";
	
/* Create a TCP/IP socket. */
$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP) or die('Could not create socket.');

$result = socket_connect($socket, $address, $proxy_port) or die('Socket connection is failed.');

/*
$data = array();
$samples = array();
$points = array();
//$data[] = array("rowc" => 23.45, "colc" => 0.234);
//$data[] = array("rowc" => 14.78, "colc" => 1.32);
$samples[] = array(23.45, 0.234);
$samples[] = array(14.78, 1.32);
$data["samples"] = $samples;
$points[] = array(50.4, 4.32);
$points[] = array(30.6, 3.21);
$data["points"] = $points;

echo json_encode($data);
*/

//$in = json_encode($data);
//$in .= "\n";
$out = '';

//socket_write($socket, $in, strlen($in));

//$out = socket_read($socket, 20480);

while($resp = socket_read($socket, 1000)) {
   $out .= $resp;
   if (strpos($resp, "\n") !== false) break;
}

echo $out;	

socket_close($socket);


?>

