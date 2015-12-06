<?php

$proxy_port = $_POST['proxyport'];
$input_sample_str = $_POST['labelsamples']; 

$address = "localhost";
	
/* Create a TCP/IP socket. */
$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP) or die('Could not create socket.');

$result = socket_connect($socket, $address, $proxy_port) or die('Socket connection is failed.');

$input_sample_str = $input_sample_str . "\n";

//send the labeled samples JSON string to the proxy
socket_write($socket, $input_sample_str, strlen($input_sample_str));

//get the next set of samples and grid point labels
//$out = socket_read($socket, 2048);
$out = '';

while($resp = socket_read($socket, 1000)) {
   $out .= $resp;
   if (strpos($resp, "\n") !== false) break;
}

echo $out;	

socket_close($socket);


?>

