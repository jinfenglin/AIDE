<?php

$proxy_port = $_POST['proxyport'];
//$proxy_port = 3334;

$address = "localhost";

/* Create a TCP/IP socket. */
$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP) or die('Could not create socket.');

//connect to the JAVA Proxy program
$result = socket_connect($socket, $address, $proxy_port) or die('Socket connection is failed.');

$in = "Stop\n";

//send "Stop" message to the JAVA Proxy program
socket_write($socket, $in, strlen($in));

$reply = array();
$reply["success"] = 1;

echo json_encode($reply);

socket_close($socket);

?>

