
<?php

// table name sent from form
$tablename=$_POST['table_select'];

if($tablename == "actor"){
  // Register $tablename and redirect to file "login_success.php"
  session_register("table_select");
  header("location:attribute_select.php");
}
else {
  echo "Not correct table name";
}
?>
