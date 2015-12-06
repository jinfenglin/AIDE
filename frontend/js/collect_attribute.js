//attribute object array with initial default value
var attr_default_range_collection = [];

//attribute object array with current values
var attr_current_range_collection = [];

//attribute object array with submitted value
var attr_collection = [];

function delete_attr(attr_name_input){

  attr_collection = attr_collection.filter(function(element){
    return element.attr_name != attr_name_input;
  });

}

function add_attr(attr_name_input, min_input, max_input){

   attr_collection.push(
     {
       "attr_name": attr_name_input,
       "min_value": +(min_input),
       "max_value": +(max_input)
     }
   );

}


function store_attr(){
	attr_json_object = {"attr_collection": attr_collection};
  $('#attr_data_input').val(JSON.stringify(attr_json_object));
  
  $('#attr_data_input_manual').val(JSON.stringify(attr_json_object));
}

function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function get_attr_init_range_info(){

	attr_info_index = 0;
				
	attr_names = ""
				
  	$('#attr_info_table tr').each(function(){
		//set index for each attribute
  		$(this).find("td.attr-info-index").html(attr_info_index);
		attr_info_index = attr_info_index + 1;	
		
		//get attribute name
		attr_info_name = $(this).find("td.attr-info-name").html();
		
		if(typeof(attr_info_name) == 'string'){
			//this is an attribute
			
			//console.log(attr_info_name);
			attr_names = attr_names + attr_info_name + ",";	
              
		}
		
		
  	});
	
    d3.json("get_attr_info.php", function(error, data) {  
      if (error)
        return console.warn(error);


	  data.forEach(function(d) {
	    
		//min_entry is like "ra:0.0082"
		//max_entry is like "ra:359.9954"
		min_entry = d.min_value;
		max_entry = d.max_value;
		
		//min_result is like ["ra", "0.0082"]
		//max_result is like ["ra", "359.9954"]
		min_result = min_entry.split(":");
		max_result = max_entry.split(":");
		
        //set min value for the attribute
  		$('#'+min_result[0]+'-min-value').html(numberWithCommas(min_result[1]));
  		//set max value for the attribute
  		$('#'+max_result[0]+'-max-value').html(numberWithCommas(max_result[1]));
		
		//record the default range info for each attr
		attr_default_range_collection.push(
			{
       		 	"attr_name": min_result[0],
       		 	"min_value": +(min_result[1]),
       		 	"max_value": +(max_result[1])
			}
		);
		
		//initialize the current range info for each attr by the default value
		attr_current_range_collection.push(
			{
       		 	"attr_name": min_result[0],
       		 	"min_value": +(min_result[1]),
       		 	"max_value": +(max_result[1])
			}
		);
				
		
	  });
	  
	  //construct JSON object
	  attr_range_json_obj = {"attr_range_collection": attr_current_range_collection};
	  //convert the JSON object into JSON string
	  json_attr_range_info = JSON.stringify(attr_range_json_obj);
	  //console.log(json_attr_range_info);
	  
	  //update the tuple count information
      d3.json("get_tuple_count.php", function(error, data) {  
        if (error)
          return console.warn(error);
		
		//the data returned is an array which contains only one object, like [{"count": 24678}]
  	    //output the tuple count within these attribute ranges
  	    $("#tupleNumber").text(data[0].count);
	  
	  
	  })
      .header("Content-Type", "application/x-www-form-urlencoded")
      .post("attr_range_info=" + json_attr_range_info);
	
	  
	  //console.log(data.length);
      //console.log(+data[0].min_value);
      //console.log(+data[0].max_value);
      //attr_min = +data[0].min_value;
      //attr_max = +data[0].max_value;
	
	  //console.log(attr_info_name);
	  //console.log(attr_min);
	  //console.log(attr_max);
	
	  	
    })
    .header("Content-Type", "application/x-www-form-urlencoded")
    .post("attr_names=" + attr_names);
	
	
	$('.attr-info-checkbox :checkbox').click(function() {
	    var checkbox_item = $(this);
		var attr_name_checkbox = checkbox_item.val();
		//var attr_info_min = $('#'+attr_name_checkbox+'-min-value').html();
		//var attr_info_max = $('#'+attr_name_checkbox+'-max-value').html();
		var attr_info_min = null;
		var attr_info_max = null;
		
		for(var i=0; i<attr_current_range_collection.length; i++){
			if(attr_current_range_collection[i].attr_name == attr_name_checkbox){
				attr_info_min = attr_current_range_collection[i].min_value;
				attr_info_max = attr_current_range_collection[i].max_value;
			}
		}
		
		//console.log(attr_info_min);
		//console.log(attr_info_max);
		
	    //checkbox_item will contain a reference to the checkbox   
	    if (checkbox_item.is(':checked')) {
	        // the checkbox was checked 
			
			//add attributes record
	        // add new record of this attribute
	        add_attr(attr_name_checkbox, attr_info_min, attr_info_max);
					
	    } else {
	        // the checkbox was unchecked
	        // first delete existing record of this attribute,
	        delete_attr(attr_name_checkbox);
	        
	    }
		
  	  //update attributes records
  	  store_attr();
	  
		
	});
	
	
}

$(get_attr_init_range_info);