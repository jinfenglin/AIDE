

<?php
//this file is used to check the input array value get from histogram1.php, this is for test purpose.

ini_set('display_errors', 'On');
//error_reporting(E_ALL | E_STRICT);


if(!empty($_POST['attr_data'])) {

  // foreach($_POST['attr_data'] as $attrdata) {
  //   echo "{$attrdata}";
  // }

  $attrdata = json_decode($_POST['attr_data']);
  //echo "attrdata:";
  //var_dump($attrdata);

  echo "each item:";
  foreach($attrdata as $attr_item) {
    //$attrname =  $attr_item -> {'attr_name'};
    echo "{$attr_item -> {'attr_name'}}\n";
    //var_dump($attr_item);
  }


  //echo gettype($_POST['attr_data']);
  //echo $_POST['attr_data'];

}



?>
