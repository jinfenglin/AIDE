<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);

$server_port = 8889;

$old_path = getcwd();
echo $old_path;
echo "<br/>";

//chdir('/Users/wenzhao/Sites/exploration/backend/liping');
chdir('C:/Users/yun/workspace/Aide');
$new_path = getcwd();
echo $new_path;
echo "<br/>";

//shell_exec('./run.sh >>/dev/null 2>>/dev/null &');
exec('./run.bat');

//$classpath = "./bin:./packages/commons-math3-3.5.jar:./packages/postgresql-9.3-1102.jdbc4.jar:./packages/LibSVM-1.0.6.jar:./packages/weka.jar:./packages/json-20140107.jar:./packages/pdm-timeseriesforecasting-ce-stable.jar";

//exec("java -Xmx4196M -cp {$classpath} execute.RunDemoSocket {$server_port} backEndConfig.json >>output.txt 2>>output.txt &");


chdir($old_path);
echo getcwd();
echo "<br/>";

//start the JAVA backend program
//exec("bash ./backend/liping/run.sh >>/dev/null 2>>/dev/null &")
//$CLASSPATH="./backend/liping/bin:./backend/liping/packages/commons-math3-3.5.jar:./backend/liping/packages/postgresql-9.3-1102.jdbc4.jar:./backend/liping/packages/LibSVM-1.0.6.jar:./backend/liping/packages/weka.jar:./backend/liping/packages/json-20140107.jar:./backend/liping/packages/pdm-timeseriesforecasting-ce-stable.jar";

//echo $CLASSPATH;
echo "<br/>";
//echo "java -Xmx4196M -cp {$CLASSPATH} execute.RunDemoSocket {$server_port} ./backend/liping/backEndConfig.json >>/dev/null 2>>/dev/null &";
echo "<br/>";


echo "<br/>";

echo "success";


?>

