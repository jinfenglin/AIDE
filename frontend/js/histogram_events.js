

function width_btn_hover(btn){

  btn.hover(
    function(){
      $(this).parent().siblings("p").text("Click to show equi-width histogram.");
      $(this).parent().siblings("p").removeClass("text-transparent");
    }, function(){
      $(this).parent().siblings("p").addClass("text-transparent");
    }
  );

}


function depth_btn_hover(btn){

  btn.hover(

    function(){
      $(this).parent().siblings("p").text("Click to show equi-depth histogram.");
      $(this).parent().siblings("p").removeClass("text-transparent");
    }, function(){
      $(this).parent().siblings("p").addClass("text-transparent");
    }
  );

}




function width_chart(){
  // attr_name -- '{$attr}'
  // chart_id -- '#width-chart-{$attr}'
  // bucketnum_id  -- '#{$attr}-bucketnum'
  // btn  --  $('#{$attr}-width-btn')
  // min_value_id -- '#{$attr}-minvalue'
  // max_value_id -- '#{$attr}-maxvalue'
  // yscale_id -- '{$attr}-yscale'

  d3.select("#histogram-width-chart")
	.append('svg')
  	.attr("width", width + margin.left + margin.right)
  	.attr("height", height + margin.top + margin.bottom)
  	.attr("style", "outline: thin solid grey;")
  	.append("g")
  	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  //width-button click events
  $("#histogram-width-btn").on('click', function(event){

    //clear previous width-chart
    $("#histogram-width-chart svg g").empty();

    var min_value = $("#histogram-minvalue").val(),
    max_value = $("#histogram-maxvalue").val();

    //input range is empty or not a number
    if(min_value === '' || max_value === '' || isNaN(min_value) || isNaN(max_value)){

      //get data and draw width-histogram without range
      d3.json("width_histogram.php", function(error, data) {
        if (error)
          return console.warn(error);

          //call draw function
          width_draw(data, "", "");

        })
        .header("Content-Type", "application/x-www-form-urlencoded")
        .post('attr=' + $('#histogram-attr').val() + '&bucketnum=' + $('#histogram-bucketnum').val());

      }
      else {
        //both min and max values of input range are valid number
        //get data and draw width-histogram with range

        d3.json("width_histogram_range.php", function(error, data) {
          if (error)
            return console.warn(error);

            //debugger;

            //call draw function
            width_draw(data, min_value, max_value);

          })
          .header("Content-Type", "application/x-www-form-urlencoded")
          .post('attr=' + $('#histogram-attr').val() + '&bucketnum=' + $('#histogram-bucketnum').val() + '&rangemin=' + min_value + '&rangemax=' + max_value);

        }

      });

    }



    function depth_chart(){
      // attr_name -- '{$attr}'
      // chart_id -- '#depth-chart-{$attr}'
      // bucketnum_id  -- '#{$attr}-bucketnum'
      // btn  --  $('#{$attr}-depth-btn')
      // min_value_id -- '#{$attr}-minvalue'
      // max_value_id -- '#{$attr}-maxvalue'
      // yscale_id -- '{$attr}-yscale'

      d3.select("#histogram-depth-chart")
      .append('svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
	  .attr("style", "outline: thin solid grey;")		
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


      //depth-button click events
      $("#histogram-depth-btn").on('click', function(event){

        //$(this).button('loading');


        //clear the previous depth-chart
        $("#histogram-depth-chart svg g").empty();

        var min_value = $("#histogram-minvalue").val(),
        max_value = $("#histogram-maxvalue").val();

        //input range is empty or not a number
        if(min_value === '' || max_value === '' || isNaN(min_value) || isNaN(max_value)){

          //get data and draw the depth-chart without range
          d3.json("depth_histogram.php", function(error, data) {
            if (error)
              return console.warn(error);

              //call draw function
              depth_draw(data, "", "");

            })
            .header("Content-Type", "application/x-www-form-urlencoded")
            .post('attr=' + $('#histogram-attr').val() + '&bucketnum=' + $('#histogram-bucketnum').val());

          }
          else {
            //both min and max values of input range are valid number
            //get data and draw depth-histogram with range

            d3.json("depth_histogram_range.php", function(error, data) {
              if (error)
                return console.warn(error);

                //call draw function
                depth_draw(data, min_value, max_value);

              })
              .header("Content-Type", "application/x-www-form-urlencoded")
              .post('attr=' + $('#histogram-attr').val() + '&bucketnum=' + $('#histogram-bucketnum').val() + '&rangemin=' + min_value + '&rangemax=' + max_value);

            }

          });


        }



        var histogram_init = function(){

          width_chart();
          depth_chart();

          $("#histogram-update-btn").on('click', function(event){
			  
			 

            var min_value = $("#histogram-minvalue").val(),
            max_value = $("#histogram-maxvalue").val(),
			attr_name_hist = $("#histogram-attr").val(),
			default_min_value = 0,
			default_max_value = 0;
			
			
			$.each(attr_default_range_collection, function(index, obj ){
				
				if(obj.attr_name === attr_name_hist){
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
				
				$(this).popover("destroy");
				//min value is larger than or equal to max value
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
              //delete_attr($("#histogram-attr").val());
              // then add new record of this attribute
              //add_attr($("#histogram-attr").val(), min_value, max_value);
			  
	          //set min value for the attribute
	    	  $('#'+attr_name_hist+'-min-value').html(min_value);
	    	  //set max value for the attribute
	    	  $('#'+attr_name_hist+'-max-value').html(max_value);
			  
			  //change current range collection
  			  $.each(attr_current_range_collection, function(index, obj ){
				
  				if(obj.attr_name === attr_name_hist){
  					//set the current min value for the attr
  					obj.min_value = +min_value;
  					//set the current max value for the attr
  					obj.max_value = +max_value;
			        
  				}  
		        
  			  });
			  
			  //console.log(attr_default_range_collection);
			  //console.log(attr_current_range_collection);
			  
			  //construct JSON object
			  attr_range_json_obj = {"attr_range_collection": attr_current_range_collection};
			  //convert the object into JSON string
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

          //$("#histogram-delete-btn").on('click', function(event){
            //$("#histogram-row").remove();
          //});
		  
          $("#histogram-set-to-default-btn").on('click', function(event){
            //set the current attribute to default total range
			//the default range is in attr_default_range_collection defined in collect_attribute.js
			  //console.log(attr_default_range_collection);
			$.each(attr_default_range_collection, function(index, obj ){
				
				if(obj.attr_name === $("#histogram-attr").val()){
			        //set min value for the attribute in the info tab
			  		$('#'+obj.attr_name+'-min-value').html(obj.min_value);
			  		//set max value for the attribute in the info tab
			  		$('#'+obj.attr_name+'-max-value').html(obj.max_value);
					
				}  
		        
			});  
			
			//console.log(attr_current_range_collection);
		  	//change current range collection
			  $.each(attr_current_range_collection, function(index, obj ){
			
				if(obj.attr_name === $("#histogram-attr").val()){
					//set the current min value for the attr
					obj.min_value = +$('#'+obj.attr_name+'-min-value').html();
					//set the current max value for the attr
					obj.max_value = +$('#'+obj.attr_name+'-max-value').html();
		        
				}  
	        
			  });
		  
		    //console.log(attr_current_range_collection);
			
	  	  //construct JSON object
	  	  attr_range_json_obj = {"attr_range_collection": attr_current_range_collection};	
		  //convert the object array into JSON string
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
		  
		  $("#histogram-attr").change(function(){
			  
			  //console.log("changed!");
			  $("#histogram-minvalue").val("");
			  $("#histogram-maxvalue").val("");
		  	
		  });
		  
		  

        };


        $(histogram_init);
