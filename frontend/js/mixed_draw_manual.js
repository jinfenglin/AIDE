var global_sample_data = [];
var global_reviewed_objects = [];
var global_marker = [];
var click_Num = 0;
var draw_type = 1;   // 0 is chart, 1 is map
//object structure: {attr_name: "some_name", min_value: 23.4, max_value: 21.5}

var all_attr_info = [];
var get_all_attr_info = function(){
	//attr_json_obj is an object, like {"attr_collection": [{}, {}]}
	var attr_json_obj = $.parseJSON($('#attr_range_data_input').val());
	
	//get attr array, this is an array of objects
	//the structure of objects is: {attr_name, min_value, max_value}
	var attr_array = attr_json_obj.attr_collection;
	
	all_attr_info = [];
	
	//put all attr object into all_attr_info
	for(var i = 0; i < attr_array.length; i++){
		all_attr_info.push(attr_array[i]);
	}
};

// check if a value in an array
var indexOf = function(needle) {
    if(typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(needle) {
            var i = -1, index = -1;

            for(i = 0; i < this.length; i++) {
                if(this[i] === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }

    return indexOf.call(this, needle);
};

var kemi_exploration_start = function(){
$('#tableContainer').empty();
		get_all_attr_info();
		get_attr_info();
		//x attr name
		var attr_x_name = attr_info[0].attr_name;
		//x attr min value
		var attr_x_minvalue = attr_info[0].min_value;
		//x attr max value
		var attr_x_maxvalue = attr_info[0].max_value;
		
		//y attr name
		var attr_y_name = attr_info[1].attr_name;
		//y attr min value
		var attr_y_minvalue = attr_info[1].min_value;
		//y attr max value
		var attr_y_maxvalue = attr_info[1].max_value;
	
		//console.log(attr_x_name, attr_x_minvalue, attr_x_maxvalue)
		//console.log(attr_y_name, attr_y_minvalue, attr_y_maxvalue)
	
	    //set initial sampling method:  width, depth or others
		var sampling_method = "depth";
		
		//build parameter string to send to server in order to get data
	    		
		//console.log(post_str)
		//console.log(attr_y_minvalue)
		//console.log(+attr_y_minvalue)
		
       // window.location.href = "get_initial_samples_for_manual.php?XSmall=" + $('#XSmall').val(); 
        
		//use asynchronous call to get data in json format 
		//data is parsed as object array 
		var link = "get_initial_samples_for_manual.php?";
		
		var query_str = "";
        var attrs = "";
		for(var j=0; j < all_attr_info.length; j++){
		
            if (j != all_attr_info.length - 1)
                attrs += all_attr_info[j].attr_name + ",";
            else
                attrs += all_attr_info[j].attr_name;
		     if(j != 0) {
		        query_str += " and ";
		     }
		    var attr_min = "#" + all_attr_info[j].attr_name + "_min";
            var attr_max = "#" + all_attr_info[j].attr_name + "_max";
            
            query_str += all_attr_info[j].attr_name + " >= " + $(attr_min).val() + " and " +
                        all_attr_info[j].attr_name + " <= " + $(attr_max).val();
            
		}
		
		var post_str = 'xname=' + attr_x_name +
	    '&yname=' + attr_y_name +
	    '&xmin=' + attr_x_minvalue +
	    '&xmax=' + attr_x_maxvalue +
	    '&ymin=' + attr_y_minvalue +
	    '&ymax=' + attr_y_maxvalue +
		'&method=' + sampling_method +
        '&attrs=' + attrs;
		


		console.log("get_initial_samples_for_manual.php?query_str=" + query_str);
        d3.json("get_initial_samples_for_manual.php?query_str=" + query_str, function(error, data) {
			if (error)
            	return console.warn(error);

            //console.log("here");
			// console.log(data);
			
			//output the number of samples to the list
			$("#list_num_samples").html(data.length);
			 
			//write 1 to the list value for the number of iterations
			$("#list_iterations").text(click_Num);
			
            //call scatter plot function
            
            global_sample_data = data;
            
            global_marker = [];
            
            for (i = 0; i < data.length; i++) {
                var turple = {id: data[i].id, label: "unlabel"};
                global_marker.push(turple);
                data[i].overlap = -1;
            }
            
            for(var i = 0; i < data.length; i++) {
                    if(indexOf.call(global_reviewed_objects, data[i].id) == -1) {
                        global_reviewed_objects.push(data[i].id);
                    }
            
                    if (data[i].overlap == -1) {
                        for(var n = i+1; n < data.length; n++) {
                            if(data[n].overlap == -1 && data[i].x_value == data[n].x_value && data[i].y_value == data[n].y_value) {
                                data[i].overlap = data[i].id;
                                data[n].overlap = data[i].id;
                            }
                        }
                    }
                }
            $("#list_reviewed_objects").html(global_reviewed_objects.length);
            
            var chart = document.getElementById('chart' );
            chart.style.backgroundColor = 'white';
            if (draw_type == 0) {
                $('#chart').empty();
                d3.select('#chart')
                .append('svg')
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
           // map_plot(global_sample_data);
			    scatter_plot(global_sample_data, d3.select('#chart svg'), {attr_name: attr_x_name, min_value: +attr_x_minvalue, max_value: +attr_x_maxvalue}, {attr_name: attr_y_name, min_value: +attr_y_minvalue, max_value: +attr_y_maxvalue});
            } else if (draw_type == 1) {
                $('#chart').empty();
                map_plot(global_sample_data);
			    //scatter_plot(global_sample_data, d3.select('#chart'), {attr_name: attr_x_name, min_value: +attr_x_minvalue, max_value: +attr_x_maxvalue}, {attr_name: attr_y_name, min_value: +attr_y_minvalue, max_value: +attr_y_maxvalue});

            }
                      })
          .header("Content-Type", "application/x-www-form-urlencoded")
          .post(post_str);
}

var plot_init = function(){
    scatterplot_init_mixed();
    map_init_mixed();
    
    $("#initial-sampling-start-btn").on('click', function(event){
    //get attribute name and range info into attr_info array
        click_Num += 1;
        
        kemi_exploration_start();
		
		
	  
    });
    
    
    $("#x-attr-name").change(function(){
	  
	  kemi_exploration_start();
  	});
	
  	//events when y attr changes
  	$("#y-attr-name").change(function(){
	  
	  kemi_exploration_start();
	  	
  	});
    
    $("#switch").on('click', function(event){
        
       
       draw_type = (draw_type + 1) % 2;
       $('#chart').empty();
       if (draw_type == 0) {
            d3.select('#chart')
                .append('svg')
                .attr("width", width + margin.left + margin.right )
                .attr("height", height + margin.top + margin.bottom );

            get_all_attr_info();
            get_attr_info();
		//x attr name
		    var attr_x_name = attr_info[0].attr_name;
		//x attr min value
		    var attr_x_minvalue = attr_info[0].min_value;
		//x attr max value
		    var attr_x_maxvalue = attr_info[0].max_value;
		
		//y attr name
		    var attr_y_name = attr_info[1].attr_name;
		//y attr min value
		    var attr_y_minvalue = attr_info[1].min_value;
		//y attr max value
		    var attr_y_maxvalue = attr_info[1].max_value;
            scatter_plot(global_sample_data, d3.select('#chart svg'), {attr_name: attr_x_name, min_value: +attr_x_minvalue, max_value: +attr_x_maxvalue}, {attr_name: attr_y_name, min_value: +attr_y_minvalue, max_value: +attr_y_maxvalue});
       } else if (draw_type == 1) {
            $('#tableContainer').empty();
            map_plot(global_sample_data);
       }
        
    });
}


$(plot_init);
