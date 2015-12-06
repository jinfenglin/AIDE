<?php

ini_set('display_errors', 'On');
//error_reporting(E_ALL | E_STRICT);

//exec('ls', $output);
exec("java -classpath ./java_file/ hello", $output);
//var_dump($output);
echo "{$output[0]}";

?>
