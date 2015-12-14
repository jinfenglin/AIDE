<?php

session_start();
// Unset all of the session variables.
$_SESSION = array();

?>


<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>User Login</title>
  <link href='http://fonts.googleapis.com/css?family=Lato' rel='stylesheet' type='text/css'>
  <!-- Bootstrap -->
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
  <link href="css/style.css" rel="stylesheet">
  <!-- Optional theme -->
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">
  <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
  
  <script type="text/javascript">
  function getMyScenario(sel) {
    var scenario = sel.value;
    var db = document.getElementById("inputDB");
	var html = "";
    if (scenario == "Scenario 4" || scenario == "Scenario 5" || scenario == "Scenario 6") {
      html = "<option>aide</option><option>sdss</option><option>testdb</option><option>sdssData</option>";
    }
    else if (scenario == "Scenario 1" || scenario == "Scenario 2") {
      html = "<option>housing</option><option>postgres</option>";
    }
	else if (scenario == "Scenario 3"){
		html = "<option>housing</option><option>postgres</option><option>sdss</option><option>sdssData</option>";
	}
    else {
      html = "<option>housing</option><option>postgres</option><option>testdb</option><option>sdss</option><option>sdssData</option>";

    }
      db.innerHTML = html;
  }
  
  </script>
</head>

<body>
  <div class="container">
	  
    <div class="row">
      <div class="col-md-11 text-center">
        <h2 class="">Explore By Example:</h2>
        <h4>An Automatic User Navigation System for Interactive Data Exploration</h4>
      </div>
      <div class="col-md-1 large-top-margin">
        <label>Welcome</label>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <hr>
      </div>
    </div>

    <div class="row">
      <div class="col-md-6">

        <div class="panel panel-default">

          <div class="panel-heading">
            <h4 class="panel-title">Connect To a Database</h4>
          </div>

          <div class="panel-body">

              <form class="form-horizontal onchange="this.form.submit()" small-southeast-align" role="form" name="form1" method="post" action="checklogin.php">

                <div class="form-group">
                  <label for="inputHost" class="col-md-3 control-label">Hostname</label>
                  <div class="col-md-6">
                    <select name="myhost" class="form-control" id="inputHost">
                      <option>localhost</option>
            <option>xcn05.cs-i.brandeis.edu</option>            
                      <option>dbcluster.cs.umass.edu</option>        
                    </select>
                  </div>
                </div>
				
                <div class="form-group">
                  <label for="inputPort" class="col-md-3 control-label">Port#</label>
                  <div class="col-md-6">
                    <select name="myport" class="form-control" id="inputPort">
                      <option>5432</option>
                      <option>54320</option>                    
                    </select>
                  </div>
                </div>
				  
                <div class="form-group">
                  <label for="Username" class="col-md-3 control-label">Username</label>
                  <div class="col-md-6">
                    <input name="myusername" type="text" class="form-control" id="Username" placeholder="">
                  </div>
                </div>

                <div class="form-group">
                  <label for="inputPassword" class="col-md-3 control-label">Password</label>
                  <div class="col-md-6">
                    <input name="mypassword" type="password" class="form-control" id="inputPassword" placeholder="">
                  </div>
                </div>

                <div class="form-group">
                  <label for="inputScenario" class="col-md-3 control-label">Scenario</label>
                  <div class="col-md-6">
                    <select name="myscenario" class="form-control" id="inputScenario" onchange="getMyScenario(this)">
                      <option value="Scenario 3">Interactive Linear Exploration</option>
					  <option value="Scenario 6">Interactive Non-Linear Exploration</option>
                      <option value="Scenario 1">Real Estate Exploration</option>            
                      <option value="Scenario 2">Manual</option>
                      <option value="Scenario 4">Linear</option>
                      <option value="Scenario 5">Non Linear</option>
                    </select>
                  </div>
                </div>


                <div class="form-group">
                  <label for="inputDB" class="col-md-3 control-label">Database</label>
                  <div class="col-md-6">

                    <select name="mydb" class="form-control" id="inputDB">
                      <option>aide</option>
                      <option>housing</option>
                      <option>postgres</option>    
					  <option>sdss</option>
					  <option>sdssData</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <div class="col-md-offset-3 col-md-6">
                    <button type="submit" class="btn btn-default">Sign in</button>
                  </div>
                </div>

              </form>

          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <hr>
      </div>
    </div>

  </div>

</body>

</html>
