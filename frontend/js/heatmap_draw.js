//this file contains the functions for 2d heatmap

var heatmap_margin = {top: 20, right: 20, bottom: 40, left: 70},
heatmap_legend_margin = {top: 10, right: 40, bottom: 20, left: 40},
heatmap_legend_width = 40,
heatmap_width = 540 + 120 - heatmap_margin.left - heatmap_margin.right - heatmap_legend_width - heatmap_legend_margin.left - heatmap_legend_margin.right,
heatmap_height = 510 - heatmap_margin.top - heatmap_margin.bottom,
heatchart = null,
cells = null,
raw_data = [];
//color = d3.interpolateRgb("#fff", "#c09");
//color = d3.interpolateRgb("#00FF00", "#FF0000");

var selectCell = function(cell) {
  d3.select(cell).attr("stroke", "#000").attr("stroke-width", 2);

  //cell.parentNode.parentNode.appendChild(cell.parentNode);
  //cell.parentNode.appendChild(cell);
};

var deselectCell = function(cell) {
  d3.select(cell).attr("stroke", "#fff").attr("stroke-width", 1);
};

var onCellOver = function(cell, data) {
  selectCell(cell);
  //d3.select(cell).attr("data-toggle", "tooltip").attr("title", data.aggValue);
};

var onCellOut = function(cell, data) {
  deselectCell(cell);
  //d3.select(cell).attr("data-toggle", "").attr("title", "");
};

var createHeatchart = function(attr_name, bkt_num, value_range) {
  // attr_name: {x:"rowc", y:"colc"},
  // bkt_num: {x:5, y:5},
  // value_range: {x:{min_value: 400, max_value: 600}, y:{min_value: 800, max_value: 1000}}


  var x = d3.scale.linear()
  .range([0, heatmap_width]);

  var y = d3.scale.linear()
  .range([heatmap_height, 0]);


  //get min and max of number of points
  var min = 9999999;
  var max = -9999999;
  var l;


  for(var cellnum = 0; cellnum < cells.length; cellnum++ ){

    l = cells[cellnum].aggValue;

    if (l > max) {
      max = l;
    }
    if (l < min) {
      min = l;
    }

  }

  // Set the scale domain.
  x.domain([value_range.x.min_value, value_range.x.max_value]);
  y.domain([value_range.y.min_value, value_range.y.max_value]);

  //console.log(value_range);
  //console.log(cells);
  
  //var heat_color = d3.scale.linear().domain([max, min/3 + 2*max/3, 2*min/3 + max/3, min]).range(["red", "yellow", "green", "blue"]);
  var heat_color = d3.scale.linear().domain([max, min]).range(["red", "yellow"]);
  var legend_range = d3.scale.linear().domain([min, max]).range([2*heatmap_height/3, 0]);
  

  //debugger;

  heatchart.selectAll("rect")
  .data(cells)
  .enter()
  .append("rect")
  .attr("class", "rectangles")
  .attr("x", function(d, i) {
    return x(d.x_range.min_value + value_range.x.min_value);
  })
  .attr("y", function(d, i) {
    return y(d.y_range.max_value + value_range.y.min_value);
  })
  .attr("width", function(d, i) {
    return x(d.width + value_range.x.min_value);
  })
  .attr("height", function(d, i) {
    return heatmap_height - y(d.height + value_range.y.min_value);
  })
  .attr("fill", function(d, i) {
    //return color((d.aggValue - min) / (max - min));
	return heat_color(d.aggValue);
  })
  .attr("stroke", "#fff")
  .attr("stroke-width", 1)
  .attr("cell", function(d) {
    return "r" + d.row + "c" + d.col;
  })
  .on("mouseover", function(d) {
    onCellOver(this, d);
  })
  .on("mouseout", function(d) {
    onCellOut(this, d);
  })
  .append("title")
  .text(function(d) {
    return "Aggregation Value: " + Math.round(d.aggValue*100)/100 + 
	"<br/>" + attr_name.x + " Range: " + Math.round(d.x_range.min_value*100)/100 + " ~ " + Math.round(d.x_range.max_value*100)/100 + 
	"<br/>" + attr_name.y + " Range: " + Math.round(d.y_range.min_value*100)/100 + " ~ " + Math.round(d.y_range.max_value*100)/100;
	
  });

  $(".rectangles").tipsy({ gravity: 's', html: true});

  //add x axis
  heatchart.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + heatmap_height + ")")
  .call(d3.svg.axis()
  .scale(x)
  .ticks(8)
  .orient("bottom"));

  // Add the text label for the x axis
  heatchart.append("text")
  .attr("transform", "translate(" + heatmap_width + " ," + (heatmap_height + heatmap_margin.bottom - 5) + ")")
  .style("text-anchor", "end")
  .text(attr_name.x);

  //add y axis
  heatchart.append("g")
  .attr("class", "y axis")
  .call(d3.svg.axis()
  .scale(y)
  .ticks(8)
  .orient("left"));

  //Add the text label for the Y axis
  heatchart.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", (-1)*heatmap_margin.left + 5)
  .attr("x", -5)
  .attr("dy", "1em")
  .style("text-anchor", "end")
  .text(attr_name.y);
  
  //generate legend
  var list = [],
  legend_element_num = 600;
  
  for(var i = 0; i <= legend_element_num; i++){
  	list.push(min + (max-min)*i/legend_element_num);
  }
  
  d3.select("#heatchart svg").append("g")
  .attr("transform", "translate(" + (heatmap_margin.left + heatmap_width + heatmap_legend_margin.left) + "," + (heatmap_margin.top + heatmap_legend_margin.top) + ")")
  .selectAll("rect")
  .data(list)
  .enter()
  .append("rect")
  .attr("x", 0)
  .attr("width", heatmap_legend_width)
  .attr("y", function(d){return legend_range(d);})
  .attr("height", 1)
  .attr("fill", function(d){return heat_color(d)});
  
  d3.select("#heatchart svg").append("g")
  .attr("class", "legend axis")
  .attr("transform", "translate(" + (heatmap_margin.left + heatmap_width + heatmap_legend_margin.left + heatmap_legend_width + 2) + "," + (heatmap_margin.top + heatmap_legend_margin.top + 1) + ")")
  .call(d3.svg.axis()
  .scale(legend_range)
  .orient("right"));
  
  
};

var heatmap_plot = function(attr_name, bkt_num, value_range, aggregate_attr){
  // attr_name: {x:"rowc", y:"colc"},
  // bkt_num: {x:5, y:5},
  // value_range: {x:{min_value: 400, max_value: 600}, y:{min_value: 800, max_value: 1000}}
  // aggregate_attr: "count", "avg(u)"

  raw_data = [];

  var post_str = 'xname=' + attr_name.x +
  '&yname=' + attr_name.y +
  '&xbktnum=' + bkt_num.x +
  '&ybktnum=' + bkt_num.y +
  '&xmin=' + value_range.x.min_value +
  '&xmax=' + value_range.x.max_value +
  '&ymin=' + value_range.y.min_value +
  '&ymax=' + value_range.y.max_value +
  '&aggregate=' + aggregate_attr;

  //console.log(post_str);

  var bkt_width = (value_range.x.max_value - value_range.x.min_value)/bkt_num.x;
  var bkt_height = (value_range.y.max_value - value_range.y.min_value)/bkt_num.y;

  d3.json("heatmap_data_range.php", function(error, data) {
    if (error)
      return console.warn(error);

      data.forEach(function(d) {

        raw_data.push({
          col: +d.col_num,         //col represents x attribute
          row: +d.row_num,         //row represents y attribute
          aggValue: +d.aggregate_value,   //the aggregate value in each group
          width: bkt_width,
          height: bkt_height,
          x_range: {min_value: (+d.col_num - 1)*bkt_width, max_value: (+d.col_num)*bkt_width},
          y_range: {min_value: (+d.row_num - 1)*bkt_height, max_value: (+d.row_num)*bkt_height}
        });

      });

      //convert raw_data to cells
      //cells = raw_data;
      cells = [];
      for(var i = 1; i <= bkt_num.x; i++)     //i is col number
        for(var j = 1; j <= bkt_num.y; j++){  //j is row number

          if(raw_data.length > 0 && raw_data[0].col === i && raw_data[0].row === j){   //the current element of raw_data is in the right place
            cells.push(raw_data.shift());
          }
          else {   //the current element is missing
            cells.push({
              col: i,
              row: j,
              aggValue: 0,
              width: bkt_width,
              height: bkt_height,
              x_range: {min_value: (i - 1)*bkt_width, max_value: i*bkt_width},
              y_range: {min_value: (j - 1)*bkt_height, max_value: j*bkt_height}
            });
          }

        }


      //plot heatmap chart
      createHeatchart(attr_name, bkt_num, value_range);

    })
    .header("Content-Type", "application/x-www-form-urlencoded")
    .post(post_str);

};

var heatmap_plot_events = function(){

  var x_min, x_max, y_min, y_max;

  $('#heatmap-btn').on('click', function(event){

    $('#heatchart svg g').empty();

    if($('#x-minvalue').val() === '' || $('#x-maxvalue').val() === '' || isNaN($('#x-minvalue').val()) || isNaN($('#x-maxvalue').val())){
      //x range is not valid

      if($('#y-minvalue').val() === '' || $('#y-maxvalue').val() === '' || isNaN($('#y-minvalue').val()) || isNaN($('#y-maxvalue').val())){
        //y range is not valid

        d3.json("get_range.php", function(error, data) {   //get x range
          if (error)
            return console.warn(error);

            x_min = +data[0].min_value;
            x_max = +data[0].max_value;

            d3.json("get_range.php", function(error, data) {  //get y range
              if (error)
                return console.warn(error);

                //console.log(+data[0].min_value);
                //console.log(+data[0].max_value);
                y_min = +data[0].min_value;
                y_max = +data[0].max_value;

                //draw heatmap function call here
                heatmap_plot({ x: $('#heatmap-x-attr').val(), y: $('#heatmap-y-attr').val() },
                { x: +($('#heatmap-bucketnum').val()), y: +($('#heatmap-bucketnum').val()) },
                { x: {min_value: x_min, max_value: x_max}, y: {min_value: y_min, max_value: y_max} },
                $('#aggregate-attr').val());

              })
              .header("Content-Type", "application/x-www-form-urlencoded")
              .post("attr=" + $('#heatmap-y-attr').val());

            })
            .header("Content-Type", "application/x-www-form-urlencoded")
            .post("attr=" + $('#heatmap-x-attr').val());


          }
          else {
            //y range is valid

            d3.json("get_range.php", function(error, data) {   //get x range
              if (error)
                return console.warn(error);

                x_min = +data[0].min_value;
                x_max = +data[0].max_value;

                y_min = +($('#y-minvalue').val());
                y_max = +($('#y-maxvalue').val());

                //draw heatmap function call here
                heatmap_plot({ x: $('#heatmap-x-attr').val(), y: $('#heatmap-y-attr').val() },
                { x: +($('#heatmap-bucketnum').val()), y: +($('#heatmap-bucketnum').val()) },
                { x: {min_value: x_min, max_value: x_max}, y: {min_value: y_min, max_value: y_max} },
                $('#aggregate-attr').val());

              })
              .header("Content-Type", "application/x-www-form-urlencoded")
              .post("attr=" + $('#heatmap-x-attr').val());

            }

          }
          else {
            //x range is valid

            if($('#y-minvalue').val() === '' || $('#y-maxvalue').val() === '' || isNaN($('#y-minvalue').val()) || isNaN($('#y-maxvalue').val())){
              //y range is not valid

              d3.json("get_range.php", function(error, data) {  //get y range
                if (error)
                  return console.warn(error);

                  x_min = +($('#x-minvalue').val());
                  x_max = +($('#x-maxvalue').val());

                  //console.log(+data[0].min_value);
                  //console.log(+data[0].max_value);
                  y_min = +data[0].min_value;
                  y_max = +data[0].max_value;

                  //draw heatmap function call here
                  heatmap_plot({ x: $('#heatmap-x-attr').val(), y: $('#heatmap-y-attr').val() },
                  { x: +($('#heatmap-bucketnum').val()), y: +($('#heatmap-bucketnum').val()) },
                  { x: {min_value: x_min, max_value: x_max}, y: {min_value: y_min, max_value: y_max} },
                  $('#aggregate-attr').val());

                })
                .header("Content-Type", "application/x-www-form-urlencoded")
                .post("attr=" + $('#heatmap-y-attr').val());

              }
              else {
                //y range is valid

                x_min = +($('#x-minvalue').val());
                x_max = +($('#x-maxvalue').val());
                y_min = +($('#y-minvalue').val());
                y_max = +($('#y-maxvalue').val());

                //console.log("execute here");
                //console.log(x_min, x_max, y_min, y_max);

                //draw heatmap function call here
                heatmap_plot({ x: $('#heatmap-x-attr').val(), y: $('#heatmap-y-attr').val() },
                { x: +($('#heatmap-bucketnum').val()), y: +($('#heatmap-bucketnum').val()) },
                { x: {min_value: x_min, max_value: x_max}, y: {min_value: y_min, max_value: y_max} },
                $('#aggregate-attr').val());

              }

            }

          });


          //$("#heatmap-delete-btn").on('click', function(event){
            //$("#heatmap-row").remove();
          //});

          $("#x-update-btn").on('click', function(event){

            var min_value = $("#x-minvalue").val(),
            max_value = $("#x-maxvalue").val(),
			  attr_name_x = $("#heatmap-x-attr").val(),
			  default_x_min_value = 0,
			  default_x_max_value = 0;
		
		
				$.each(attr_default_range_collection, function(index, obj ){
			
					if(obj.attr_name === attr_name_x){
						//get the default min value for the attr
						default_x_min_value = obj.min_value;
						//get the default max value for the attr
						default_x_max_value = obj.max_value;
		        
					}  
	        
				});
	
				
            //the range value input is not valid, delete this attribute record
		    if(min_value === ''){
		        //delete_attr($("#histogram-attr").val());
				$(this).popover("destroy")
				.popover({
					placement: "top",
					trigger:'click',
					//title: "Input Error",
					content: "The input Min value is empty." 
					
				});
				//$(this).attr('data-popoverAttached', true);
				$(this).popover("show");
				//$(this).popover("hide");
				
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
					content: "The Min value should be smaller than the Max value." 
				});
			
				$(this).popover("show");
			
			}
			else if(+min_value < default_x_min_value || +max_value > default_x_max_value){
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
	    	  $('#'+attr_name_x+'-min-value').html(min_value);
	    	  //set max value for the attribute
	    	  $('#'+attr_name_x+'-max-value').html(max_value);
			  
			  
			  //change current range collection
  			  $.each(attr_current_range_collection, function(index, obj ){
				
  				if(obj.attr_name === attr_name_x){
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
		  
          $("#x-set-to-default-btn").on('click', function(event){
			  
            //set the current attribute to default total range
  			//the default range is in attr_default_range_collection defined in collect_attribute.js
  			$.each(attr_default_range_collection, function(index, obj ){
				
  				if(obj.attr_name === $("#heatmap-x-attr").val()){
  			        //set min value for the attribute in the info tab
  			  		$('#'+obj.attr_name+'-min-value').html(obj.min_value);
  			  		//set max value for the attribute in the info tab
  			  		$('#'+obj.attr_name+'-max-value').html(obj.max_value);
					
  				}  
		        
  			});
			
			//console.log(attr_current_range_collection);
		  	//change current range collection
			  $.each(attr_current_range_collection, function(index, obj ){
			
				if(obj.attr_name === $("#heatmap-x-attr").val()){
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
		  

          $("#y-update-btn").on('click', function(event){

            var min_value = $("#y-minvalue").val(),
            max_value = $("#y-maxvalue").val(),
			  attr_name_y = $("#heatmap-y-attr").val(),
			  default_y_min_value = 0,
			  default_y_max_value = 0;
		
		
				$.each(attr_default_range_collection, function(index, obj ){
			
					if(obj.attr_name === attr_name_y){
						//get the default min value for the attr
						default_y_min_value = obj.min_value;
						//get the default max value for the attr
						default_y_max_value = obj.max_value;
		        
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
				//$(this).popover("hide");
				
				
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
					content: "The Min value should be smaller than the Max value." 
				});
			
				$(this).popover("show");
				
			}
			else if(+min_value < default_y_min_value || +max_value > default_y_max_value){
				//the input min value is smaller than the default min value
				
				$(this).popover("destroy");
				
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
              //delete_attr($("#heatmap-y-attr").val());
              // then add new record of this attribute
              //add_attr($("#heatmap-y-attr").val(), min_value, max_value);
			  
	          //set min value for the attribute
	    	  $('#'+attr_name_y+'-min-value').html(min_value);
	    	  //set max value for the attribute
	    	  $('#'+attr_name_y+'-max-value').html(max_value);
			  
			  //change current range collection
  			  $.each(attr_current_range_collection, function(index, obj ){
				
  				if(obj.attr_name === attr_name_y){
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
		  
          $("#y-set-to-default-btn").on('click', function(event){
			  
            //set the current attribute to default total range
  			//the default range is in attr_default_range_collection defined in collect_attribute.js
  			$.each(attr_default_range_collection, function(index, obj ){
				
  				if(obj.attr_name === $("#heatmap-y-attr").val()){
  			        //set min value for the attribute in the info tab
  			  		$('#'+obj.attr_name+'-min-value').html(obj.min_value);
  			  		//set max value for the attribute in the info tab
  			  		$('#'+obj.attr_name+'-max-value').html(obj.max_value);
					
  				}  
		        
  			});
			
			//console.log(attr_current_range_collection);
		  	//change current range collection
			  $.each(attr_current_range_collection, function(index, obj ){
			
				if(obj.attr_name === $("#heatmap-y-attr").val()){
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
		  
		  
		  //set heatmap x attr as the first item
		  $('#heatmap-x-attr :nth-child(1)').prop('selected', true);
		  //set heatmap y attr as the second item
		  $('#heatmap-y-attr :nth-child(2)').prop('selected', true);
		  
		  //index starts from 0
		  x_selected_index = $("#heatmap-x-attr").prop("selectedIndex");
		  y_selected_index = $("#heatmap-y-attr").prop("selectedIndex");
		  
		  //disable aggregate on attr for x and y, + 1 for 'count', + 1 for starting from 1 
		  disable_index_for_x = x_selected_index + 1 + 1;
		  disable_index_for_y = y_selected_index + 1 + 1;
		  $("#aggregate-attr :nth-child(" + disable_index_for_x + ")").prop("disabled", true);
		  $("#aggregate-attr :nth-child(" + disable_index_for_y + ")").prop("disabled", true);
		  
		  //the number of x options
		  attr_x_option_num = $("#heatmap-x-attr option").length;
		  //the number of y options
		  attr_y_option_num = $("#heatmap-y-attr option").length;
		  
		  //events when heatmap x attr changes
		  $("#heatmap-x-attr").change(function(){
			  
			  //empty the input range value box for x attr
			  $("#x-minvalue").val("");
			  $("#x-maxvalue").val("");
			  
			  //set aggregate attr as the first item -- count
			  $('#aggregate-attr :nth-child(1)').prop('selected', true);
		  
			  //index starts from 0
			  x_selected_index = $("#heatmap-x-attr").prop("selectedIndex");
			  y_selected_index = $("#heatmap-y-attr").prop("selectedIndex");
			  
			  //cancel previous disabled aggregated item for x
			  $("#aggregate-attr :nth-child(" + disable_index_for_x + ")").prop("disabled", false);
			  //disable new item for x
			  disable_index_for_x = x_selected_index + 1 + 1;
			  $("#aggregate-attr :nth-child(" + disable_index_for_x + ")").prop("disabled", true);
			  
			  if(x_selected_index === y_selected_index){
			  	  //x and y attr names are the same, change y attr name to be the next
				  
				  //no need to cancel previous disabled aggregated item for y
				  //because the item is equal to the new item for x
				  
				  //change y attr name to be the next
				  y_selected_index = (y_selected_index + 1) % attr_y_option_num;
				  
				  //disable new item for y
				  disable_index_for_y = y_selected_index + 1 + 1;
				  $("#aggregate-attr :nth-child(" + disable_index_for_y + ")").prop("disabled", true);
				  
				  //change the attr index to start from 1
				  y_selected_index = y_selected_index + 1;
				  $('#heatmap-y-attr :nth-child(' + y_selected_index + ')').prop('selected', true);
				  
				  //empty the input range value box for y attr
				  $("#y-minvalue").val("");
				  $("#y-maxvalue").val("");
			  
				  
			  }
		  	
		  });
		  
		  //events when heatmap y attr changes
		  $("#heatmap-y-attr").change(function(){
			  
			  //empty the input range value box for y attr
			  $("#y-minvalue").val("");
			  $("#y-maxvalue").val("");
			  
			  //set aggregate attr as the first item -- count
			  $('#aggregate-attr :nth-child(1)').prop('selected', true);
		  
			  //index starts from 0
			  x_selected_index = $("#heatmap-x-attr").prop("selectedIndex");
			  y_selected_index = $("#heatmap-y-attr").prop("selectedIndex");
			  
			  //cancel previous disabled aggregated item for y
			  $("#aggregate-attr :nth-child(" + disable_index_for_y + ")").prop("disabled", false);
			  //disable new item for y
			  disable_index_for_y = y_selected_index + 1 + 1;
			  $("#aggregate-attr :nth-child(" + disable_index_for_y + ")").prop("disabled", true);
			  
			  if(x_selected_index === y_selected_index){
			  	  //x and y attr names are the same, change x attr name to be the next
				  
				  //no need to cancel previous disabled aggregated item for x
				  //because the item is equal to the new item for y
				  
				  //change x attr name to be the next
				  x_selected_index = (x_selected_index + 1) % attr_x_option_num;
				  
				  //disable new item for x
				  disable_index_for_x = x_selected_index + 1 + 1;
				  $("#aggregate-attr :nth-child(" + disable_index_for_x + ")").prop("disabled", true);
				  
				  //change the attr index to start from 1
				  x_selected_index = x_selected_index + 1;
				  $('#heatmap-x-attr :nth-child(' + x_selected_index + ')').prop('selected', true);
				  
				  //empty the input range value box for x attr
				  $("#x-minvalue").val("");
				  $("#x-maxvalue").val("");
			  
				  
			  }
			  
		  	
		  });
		  
		  



};

var init = function(){

  heatchart = d3.select("div#heatchart").append("svg")
  .attr("width", heatmap_width + heatmap_margin.left + heatmap_margin.right + heatmap_legend_width + heatmap_legend_margin.left + heatmap_legend_margin.right)
  .attr("height", heatmap_height + heatmap_margin.top + heatmap_margin.bottom)
  .attr("style", "outline: thin solid grey;")
  .append("g")
  .attr("transform", "translate(" + heatmap_margin.left + "," + heatmap_margin.top + ")");

  heatmap_plot_events();

};

$(init);
