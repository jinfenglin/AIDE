//this file contains the functions for 1d heatmap


var one_d_heatmap_margin = {top: 20, right: 20, bottom: 40, left: 60},
legend_margin = {top: 10, right: 40, bottom: 20, left: 40},
legend_width = 40,
one_d_heatmap_width = 540 + 120 - one_d_heatmap_margin.left - one_d_heatmap_margin.right - legend_width - legend_margin.left - legend_margin.right,
one_d_heatmap_height = 400 - one_d_heatmap_margin.top - one_d_heatmap_margin.bottom,
one_d_heatchart = null,
one_d_cells = null,
one_d_raw_data = [];
//color = d3.interpolateRgb("#fff", "#c09");
//color = d3.interpolateRgb("#00FF00", "#FF0000");

var one_d_selectCell = function(cell) {
  d3.select(cell).attr("stroke", "#000").attr("stroke-width", 2);

  //cell.parentNode.parentNode.appendChild(cell.parentNode);
  //cell.parentNode.appendChild(cell);
};

var one_d_deselectCell = function(cell) {
  d3.select(cell).attr("stroke", "#fff").attr("stroke-width", 1);
};

var one_d_onCellOver = function(cell, data) {
  one_d_selectCell(cell);
  //d3.select(cell).attr("data-toggle", "tooltip").attr("title", data.aggValue);
};

var one_d_onCellOut = function(cell, data) {
  one_d_deselectCell(cell);
  //d3.select(cell).attr("data-toggle", "").attr("title", "");
};


var one_d_createHeatchart = function(attr_name, bkt_num, value_range) {
  // attr_name: "rowc",
  // bkt_num: 5,
  // value_range: {min_value: 400, max_value: 600}
  
  var x = d3.scale.linear()
  .range([0, one_d_heatmap_width]);

  var y = d3.scale.linear()
  .range([one_d_heatmap_height, 0]);


  //get min and max of number of points
  var min = 9999999;
  var max = -9999999;
  var l;


  for(var cellnum = 0; cellnum < one_d_cells.length; cellnum++ ){

    l = one_d_cells[cellnum].aggValue;

    if (l > max) {
      max = l;
    }
    if (l < min) {
      min = l;
    }

  }
  
  // Set the scale domain.
  x.domain([value_range.min_value, value_range.max_value]);
  //y.domain([0, 100]);
  
  //var heat_color = d3.scale.linear().domain([max, min/3 + 2*max/3, 2*min/3 + max/3, min]).range(["red", "yellow", "green", "blue"]);
  var heat_color = d3.scale.linear().domain([max, min]).range(["red", "yellow"]);
  var legend_range = d3.scale.linear().domain([min, max]).range([2*one_d_heatmap_height/3, 0]);
  
  
  one_d_heatchart.selectAll("rect")
  .data(one_d_cells)
  .enter()
  .append("rect")
  .attr("class", "rectangles")
  .attr("x", function(d, i) {
    return x(d.x_range.min_value + value_range.min_value);
  })
  .attr("y", function(d, i) {
    return 0;
  })
  .attr("width", function(d, i) {
    return x(d.width + value_range.min_value);
  })
  .attr("height", function(d, i) {
    return one_d_heatmap_height;
  })
  .attr("fill", function(d, i) {
    //return color((d.aggValue - min) / (max - min));
	return heat_color(d.aggValue);
  })
  .attr("stroke", "#fff")
  .attr("stroke-width", 1)
  .attr("cell", function(d) {
    return "r1" + "c" + d.col;
  })
  .on("mouseover", function(d) {
    one_d_onCellOver(this, d);
  })
  .on("mouseout", function(d) {
    one_d_onCellOut(this, d);
  })
  .append("title")
  .text(function(d) {
    return "Aggregation Value: " + Math.round(d.aggValue*100)/100 + 
	  "<br/>" + attr_name + " Range: " + Math.round(d.x_range.min_value*100)/100 + " ~ " + Math.round(d.x_range.max_value*100)/100;
	
	
  });

  $(".rectangles").tipsy({ gravity: 's', html: true});
  
  //add x axis
  one_d_heatchart.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + one_d_heatmap_height + ")")
  .call(d3.svg.axis()
  .scale(x)
  .ticks(8)
  .orient("bottom"));

  // Add the text label for the x axis
  one_d_heatchart.append("text")
  .attr("transform", "translate(" + one_d_heatmap_width + " ," + (one_d_heatmap_height + one_d_heatmap_margin.bottom - 5) + ")")
  .style("text-anchor", "end")
  .text(attr_name);

  
  //Add the text label for the Y axis
  one_d_heatchart.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", (-1)*one_d_heatmap_margin.left + 5)
  .attr("x", -5)
  .attr("dy", "1em")
  .style("text-anchor", "end")
  .text("Aggregation value heatmap");
  
  
  
  //generate legend
  var list = [],
  legend_element_num = 600;
  
  for(var i = 0; i <= legend_element_num; i++){
  	list.push(min + (max-min)*i/legend_element_num);
  }
  
  
  d3.select("#one-d-heatchart svg").append("g")
  .attr("transform", "translate(" + (one_d_heatmap_margin.left + one_d_heatmap_width + legend_margin.left) + "," + (one_d_heatmap_margin.top + legend_margin.top) + ")")
  .selectAll("rect")
  .data(list)
  .enter()
  .append("rect")
  .attr("x", 0)
  .attr("width", legend_width)
  .attr("y", function(d){return legend_range(d);})
  .attr("height", 1)
  .attr("fill", function(d){return heat_color(d)});
  
  d3.select("#one-d-heatchart svg").append("g")
  .attr("class", "legend axis")
  .attr("transform", "translate(" + (one_d_heatmap_margin.left + one_d_heatmap_width + legend_margin.left + legend_width + 2) + "," + (one_d_heatmap_margin.top + legend_margin.top + 1) + ")")
  .call(d3.svg.axis()
  .scale(legend_range)
  .orient("right"));
  
  
  
};


var one_d_heatmap_plot = function(attr_name, bkt_num, value_range, aggregate_attr){
  // attr_name: "rowc",
  // bkt_num: 5,
  // value_range: {min_value: 400, max_value: 600}
  // aggregate_attr: "count", "avg(u)"

  one_d_raw_data = [];
  
  var one_d_post_str = 'attrname=' + attr_name +
  '&bktnum=' + bkt_num +
  '&attrmin=' + value_range.min_value +
  '&attrmax=' + value_range.max_value +
  '&aggregate=' + aggregate_attr;
  
  //console.log(one_d_post_str);
  
  var bkt_width = (value_range.max_value - value_range.min_value)/bkt_num;
  
  d3.json("one_d_heatmap_data_range.php", function(error, data) {
    if (error)
      return console.warn(error);

      data.forEach(function(d) {

        one_d_raw_data.push({
          col: +d.col_num,         //col represents the attribute
          aggValue: +d.aggregate_value,   //the aggregate value in each group
          width: bkt_width,
		  x_range: {min_value: (+d.col_num - 1)*bkt_width, max_value: (+d.col_num)*bkt_width}
        });

      });
	  
	  //console.log(one_d_raw_data);
	  
      //convert one_d_raw_data to one_d_cells
      //one_d_cells = one_d_raw_data;
      one_d_cells = [];
      for(var i = 1; i <= bkt_num; i++){     //i is col number
        
          if(one_d_raw_data.length > 0 && one_d_raw_data[0].col === i){   //the current element of raw_data is in the right place
            one_d_cells.push(one_d_raw_data.shift());
          }
          else {   //the current element is missing
            one_d_cells.push({
              col: i,
              aggValue: 0,
              width: bkt_width,
			  x_range: {min_value: (i - 1)*bkt_width, max_value: i*bkt_width}              
            });
          }

       }
	   
	   //console.log(one_d_cells);
	   
	   one_d_createHeatchart(attr_name, bkt_num, value_range);
	       
    })
    .header("Content-Type", "application/x-www-form-urlencoded")
    .post(one_d_post_str);
  
  

};

var one_d_heatmap_plot_events = function(){
	
	var attr_min, attr_max;
	
	$('#one-d-heatmap-btn').on('click', function(event){
		
		//clear one-d-heatchart
		$('#one-d-heatchart svg g').empty();
		
	    if($('#one-d-heatmap-minvalue').val() === '' || $('#one-d-heatmap-maxvalue').val() === '' || isNaN($('#one-d-heatmap-minvalue').val()) || isNaN($('#one-d-heatmap-maxvalue').val())){
	      //the attr range is not valid
			
            d3.json("get_range.php", function(error, data) {  //get y range
              if (error)
                return console.warn(error);

			    attr_min = +data[0].min_value;
                attr_max = +data[0].max_value;
				//console.log(attr_min);
				//console.log(attr_max);

                //draw one-d heatmap function call here
                one_d_heatmap_plot( $('#one-d-heatmap-attr').val(),
                +($('#one-d-heatmap-bucketnum').val()),
                {min_value: attr_min, max_value: attr_max},
                $('#one-d-heatmap-aggregate-attr').val());

              })
              .header("Content-Type", "application/x-www-form-urlencoded")
              .post("attr=" + $('#one-d-heatmap-attr').val());
			
		
		}
		else{
			//the attr range is valid
			
			attr_min = +($('#one-d-heatmap-minvalue').val());
			attr_max = +($('#one-d-heatmap-maxvalue').val());
			//console.log(attr_min);
			//console.log(attr_max);
			
            //draw one-d heatmap function call here
            one_d_heatmap_plot( $('#one-d-heatmap-attr').val(),
            +($('#one-d-heatmap-bucketnum').val()),
            {min_value: attr_min, max_value: attr_max},
            $('#one-d-heatmap-aggregate-attr').val());
			
		}
		
	});
	
	
    $("#one-d-heatmap-update-btn").on('click', function(event){

      var min_value = $("#one-d-heatmap-minvalue").val(),
      max_value = $("#one-d-heatmap-maxvalue").val(),
	  attr_name_update = $("#one-d-heatmap-attr").val(),
	  default_min_value = 0,
	  default_max_value = 0;
		
		
		$.each(attr_default_range_collection, function(index, obj ){
			
			if(obj.attr_name === attr_name_update){
				//get the default min value for the attr
				default_min_value = obj.min_value;
				//get the default max value for the attr
				default_max_value = obj.max_value;
		        
			}  
	        
		});
		

      //the range value input is not valid
      if(min_value === ''){
        //delete_attr($("#histogram-attr").val());
		$(this).popover("destroy");
	
		$(this).popover({
			placement: "top",
			trigger:'click',
			//title: "Input Error",
			content: "The input Min value is empty." 
		});

		$(this).popover("show");

      }
	else if(max_value === ''){
		$(this).popover("destroy");
	
		$(this).popover({
			placement: "top",
			trigger:'click',
			//title: "Input Error",
			content: "The input Max value is empty." 
		});

		$(this).popover("show");

	}
	else if(isNaN(min_value)){
		$(this).popover("destroy");
	
		$(this).popover({
			placement: "top",
			trigger:'click',
			//title: "Input Error",
			content: "The input Min value is not a number." 
		});

		$(this).popover("show");

		
	}
	else if(isNaN(max_value)){
		$(this).popover("destroy");
	
		$(this).popover({
			placement: "top",
			trigger:'click',
			//title: "Input Error",
			content: "The input Max value is not a number." 
		});

		$(this).popover("show");

	}
	else if(+min_value >= +max_value){
		//min value is larger than or equal to max value
		$(this).popover("destroy");
		
		$(this).popover({
			placement: "top",
			trigger:'click',
			title: "Input Error",
			content: "The input Min value should be smaller than the input Max value." 
		});
	
		$(this).popover("show");
	
	  } 
	else if(+min_value < default_min_value || +max_value > default_max_value){
		//the input min value is smaller than the default min value
		$(this).popover("destroy");
		//min value is larger than or equal to max value
		$(this).popover({
			placement: "top",
			trigger:'click',
			title: "Input Error",
			content: "The input Min value and Max value should be within the default total range." 
		});
	
		$(this).popover("show");
	
	}
	else {
        //the range value input is valid
        // first delete existing record of this attribute,
        //delete_attr($("#heatmap-x-attr").val());
        // then add new record of this attribute
        //add_attr($("#heatmap-x-attr").val(), min_value, max_value);
	  
        //set min value for the attribute
  	    $('#'+attr_name_update+'-min-value').html(min_value);
  	    //set max value for the attribute
  	    $('#'+attr_name_update+'-max-value').html(max_value);
		
	  	//change current range collection
	  	$.each(attr_current_range_collection, function(index, obj ){
		
			if(obj.attr_name === attr_name_update){
				//set the current min value for the attr
				obj.min_value = +min_value;
				//set the current max value for the attr
				obj.max_value = +max_value;
	        
			}  
        
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
	  	
	  

      }

      //store_attr();

    });
	
    $("#one-d-heatmap-set-to-default-btn").on('click', function(event){
		
        //set the current attribute to default total range
		//the default range is in attr_default_range_collection defined in collect_attribute.js
		$.each(attr_default_range_collection, function(index, obj ){
			
			if(obj.attr_name === $("#one-d-heatmap-attr").val()){
		        //set min value for the attribute in the info tab
		  		$('#'+obj.attr_name+'-min-value').html(obj.min_value);
		  		//set max value for the attribute in the info tab
		  		$('#'+obj.attr_name+'-max-value').html(obj.max_value);
				
			}  
	        
		});
		
		//console.log(attr_current_range_collection);
	  	//change current range collection
		  $.each(attr_current_range_collection, function(index, obj ){
		
			if(obj.attr_name === $("#one-d-heatmap-attr").val()){
				//set the current min value for the attr
				obj.min_value = +$('#'+obj.attr_name+'-min-value').html();
				//set the current max value for the attr
				obj.max_value = +$('#'+obj.attr_name+'-max-value').html();
	        
			}  
        
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
		
	  

    });
	
	
  //index starts from 0
  attr_selected_index = $("#one-d-heatmap-attr").prop("selectedIndex");
  
  //disable aggregate on attr, + 1 for 'count', + 1 for starting from 1 
  disable_index_for_attr = attr_selected_index + 1 + 1;
  $("#one-d-heatmap-aggregate-attr :nth-child(" + disable_index_for_attr + ")").prop("disabled", true);
  
  
  //events when heatmap x attr changes
  $("#one-d-heatmap-attr").change(function(){
  
	  //empty the input range value box for x attr
	  $("#one-d-heatmap-minvalue").val("");
	  $("#one-d-heatmap-maxvalue").val("");
	  
	  //set aggregate attr as the first item -- count
	  $('#one-d-heatmap-aggregate-attr :nth-child(1)').prop('selected', true);
	  
	  //index starts from 0
	  attr_selected_index = $("#one-d-heatmap-attr").prop("selectedIndex");
	  
	  //cancel previous disabled aggregated item for x
	  $("#one-d-heatmap-aggregate-attr :nth-child(" + disable_index_for_attr + ")").prop("disabled", false);
	  //disable new item for x
	  disable_index_for_attr = attr_selected_index + 1 + 1;
	  $("#one-d-heatmap-aggregate-attr :nth-child(" + disable_index_for_attr + ")").prop("disabled", true);
	  
  
  
  });
	
	
};

var one_d_heatmap_init = function(){

  one_d_heatchart = d3.select("div#one-d-heatchart").append("svg")
  .attr("width", one_d_heatmap_width + one_d_heatmap_margin.left + one_d_heatmap_margin.right + legend_width + legend_margin.left + legend_margin.right)
  .attr("height", one_d_heatmap_height + one_d_heatmap_margin.top + one_d_heatmap_margin.bottom)
  .attr("style", "outline: thin solid grey;")
  .append("g")
  .attr("transform", "translate(" + one_d_heatmap_margin.left + "," + one_d_heatmap_margin.top + ")");

  one_d_heatmap_plot_events();

};

$(one_d_heatmap_init);
