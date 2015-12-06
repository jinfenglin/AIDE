

var refresh_table_info = function(){
	
	var tablename_select = $("#inputTable").val();
	
	//console.log(tablename_select);
	
    d3.json("get_table_size.php", function(error, data) {
      if (error)
        return console.warn(error);

	  //console.log(data[0].table_size);
	  
	  //output the table in the page
	  $("#tableSize").text(data[0].table_size);
		
      })
      .header("Content-Type", "application/x-www-form-urlencoded")
      .post('tablename=' + tablename_select);
	
};


var init_table_info = function(){

	refresh_table_info();
	
	  $("#inputTable").change(function(){
		
	  	refresh_table_info();	  
		  
	  });  
	

};

$(init_table_info);