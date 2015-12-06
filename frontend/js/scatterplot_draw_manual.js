
var margin = {top: 30, right: 20, bottom: 40, left: 40},
width = 790 - margin.left - margin.right,
height = 600 - margin.top - margin.bottom;

var global_data_overlap = [];
var header = ["picture", "price", "beds", "baths", "size", "town", "crime", "population", "education", "income"];
var global_x_range;
var global_y_range;
function btnClicked(elmt, id) {
    var elmtid = event.target.id;
    
    for (i = 0; i < global_marker.length; i++) {
        if(global_marker[i].id == id) {
            break;
        }
    }
    
    if (elmt.style.background === 'white') {
        
        elmt.style.background = 'yellow';
        if (elmtid.indexOf('positive') > -1) {
        
            if(global_marker[i].label == "negative") {
                $("#list_num_negative").text( +$("#list_num_negative").text() - 1);
            }
            
            global_marker[i].label = "positive";
            $("#list_num_positive").text( +$("#list_num_positive").text() + 1);
            var negative = document.getElementById('negative_btn_'+id);
            if (negative.style.background === 'yellow') {
                negative.style.background = 'white';
            }
        }
        else if (elmtid.indexOf('negative') > -1) {
            
            if(global_marker[i].label == "positive") {
                $("#list_num_positive").text( +$("#list_num_positive").text() - 1);
            }
            
            global_marker[i].label = "negative";
            $("#list_num_negative").text( +$("#list_num_negative").text() + 1);
            var positive = document.getElementById('positive_btn_'+id);
            if (positive.style.background === 'yellow') {
                positive.style.background = 'white';
            }
        }
    }
    else {
        elmt.style.background = 'white';
        global_marker[i].label = "unlabel";
        
        if (elmtid.indexOf('positive') > -1) {
            $("#list_num_positive").text( +$("#list_num_positive").text() - 1);
        }
        else if (elmtid.indexOf('negative') > -1) {
            $("#list_num_negative").text( +$("#list_num_negative").text() - 1);
        }
    }
}

function scatter_plot(data, svg, x_range, y_range){
//data:  {x_value, y_value}
//svg: the d3 selection of the place to draw the scatter plot
//x_range:  {attr_name, min_value, max_value}
//y_range:  {attr_name, min_value, max_value}

  global_data_overlap = [];
  var x = d3.scale.linear()
  .range([0, width]);

  var y = d3.scale.linear()
  .range([height, 0]);

  //circle radius in the plot
  var circle_radius = 5;

  //convert string to number in each datum
  data.forEach(function(d) {
    d.x_value = +d.x_value;
    d.y_value = +d.y_value;
  });

  global_x_range = x_range;
  global_y_range = y_range;
  
  // Set the scale domain.
  x.domain([x_range.min_value, x_range.max_value]);
  y.domain([y_range.min_value, y_range.max_value]);

  // group that will contain all of the circles
  var groups = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // style the circles, set their locations based on data
  global_data_overlap = data;
  var circles =
  groups.selectAll("circle")
  .data(data)
  .enter().append("circle")
  .attr("class", "circles")
  .attr("id", function(d) { return d.id; })
  .attr("overlap", function(d) { return d.overlap; })
  .attr({
    cx: function(d) { return x(d.x_value); },
    cy: function(d) { return y(d.y_value); },
    r: circle_radius
  })
  .style("fill", "DeepSkyBlue");
  
    circles.attr("stroke", function(d) {
    for (var i = 0; i < global_marker.length; i++) { 
        // if(global_marker[i].id == d.id ) {
//             if(d.overlap == -1)
//             {
//                 if(global_marker[i].label == "positive") {
//                     return "red";
//                 }else if (global_marker[i].label == "negative"){
//                     return "green";
//                 } else {
//                     return "DeepSkyBlue";
//                 }
//             } else {
//                 return "DeepSkyBlue";
//             }
//             
//         }
        return "DeepSkyBlue";
    }
    });
    
    circles.attr("stroke-width", function(d){
    for (i = 0; i < global_marker.length; i++) {
        if(global_marker[i].id == d.id) {
            if(d.overlap == -1) {
                if(global_marker[i].label == "positive" || global_marker[i].label == "negative") {
                    return 2;
                } else {
                    return 0;
                }
            } else {
                return 10;
            }
        }
    }
    });
    
  circles
  .append("title")
  .text(function(d) {  
	  //generate tooltip title content 
	  
	// var title_content =  "<p>" + x_range.attr_name + ": " + Math.round(d.x_value*100)/100 + "" + // pop
// 	  	  	"<br/>" +
// 	  		"" + y_range.attr_name + ": " + Math.round(d.y_value*100)/100 + "" +
// 	  "<br/></p>";
	  var title_content = "<p>$" + d.price + "<br/>" + 
	                       d.beds + " bed"+ d.baths + " bath" + d.size + " sqft" + "<br/>" +
	                       "<br/>" + 
	                       d.town + " information:" + "<br/>" +
	                       "annual crimes per 1000 residents: " + d.crime + "<br/>" +
	                       "population: " + d.population + "<br/>" +
	                       "adults with bachelor: " + d.prc_college + "<br/>" +
	                       "per capita income: " + d.income +
	                       +"</p>";
	  
	  var link = ""; 
	  var link_content = "";
	  
	  if(x_range.attr_name === "ra" && y_range.attr_name === "dec"){
		  //x is ra, y is dec
	  	link = "http://skyserver.sdss.org/dr8/en/tools/chart/navi.asp?ra=" + Math.round(d.x_value*1000)/1000 + "&dec=" + Math.round(d.y_value*1000)/1000 + "";
		link_content = '<a href="' + link + '" target="_blank">picture</a>';
	  }
	  else if(x_range.attr_name === "dec" && y_range.attr_name === "ra"){
		  //y is ra, x is dec
	  	link = "http://skyserver.sdss.org/dr8/en/tools/chart/navi.asp?ra=" + Math.round(d.y_value*1000)/1000 + "&dec=" + Math.round(d.x_value*1000)/1000 + "";
		link_content = '<a href="' + link + '" target="_blank">picture</a>';
	  }
	  else{
	  	  //x and y are not ra and dec
		  link_content = "";
	  }
	  
	  //return title_content + link_content;
      return "";
	  
  });
  
  // $(".circles").tipsy({ gravity: 's', html: true, fade: true, delayIn: 0, delayOut: 1200});	 // pop

  // what to do when we mouse over a bubble
  var mouseOn = function() {

    // unfinished by Kemi
    var circle = d3.select(this);

    // transition to increase size/opacity of bubble
    circle.transition()
    .duration(800).style("opacity", 1)
    .attr("r", circle_radius*2).ease("elastic");

    // append lines to bubbles that will be used to show the precise data points.
    // translate their location based on margins
    svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("class", "guide")
    .append("line")
    .attr("x1", circle.attr("cx"))
    .attr("x2", circle.attr("cx"))
    .attr("y1", +circle.attr("cy") + circle_radius*2)
    .attr("y2", height)
    .style("stroke-dasharray", ("10,3"))
    .style("stroke", "orange")
    .transition()
    .delay(200)
    .duration(400)
    .styleTween("opacity", function() { return d3.interpolate(0, 0.5); });

    svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("class", "guide")
    .append("line")
    .attr("x1", +circle.attr("cx") - circle_radius*2)
    .attr("x2", 0)
    .attr("y1", circle.attr("cy"))
    .attr("y2", circle.attr("cy"))
    .style("stroke-dasharray", ("10,3"))
    .style("stroke", "orange")
    .transition()
    .delay(200)
    .duration(400)
    .styleTween("opacity", function() { return d3.interpolate(0, 0.5); });

    // function to move mouseover item to front of SVG stage, in case
    // another bubble overlaps it
    d3.selection.prototype.moveToFront = function() {
      return this.each(function() {
        this.parentNode.appendChild(this);
      });
    };

    // skip this functionality for IE9, which doesn't like it
    // if (!$.browser.msie) {
    //   circle.moveToFront();
    // }
    circle.moveToFront();
  };


  // what happens when we leave a bubble?
  var mouseOff = function() {

    var circle = d3.select(this);

    // go back to original size and opacity
    circle.transition()
    .duration(800).style("opacity", .75)
    .attr("r", circle_radius).ease("elastic");

    // fade out guide lines, then remove them
    d3.selectAll(".guide").transition().duration(100)
    .styleTween("opacity", function() { return d3.interpolate(0.5, 0); })
    .remove();

  };

  var mouseClick = function() {

    var circle = d3.select(this);
    // circle id

    for (i = 0; i < global_marker.length; i++) {
        if(global_marker[i].id == circle.attr("id")) {
            break;
        }
    }
    
    //if (circle.attr("overlap") != -1) {
        
        var tmpData = [];
        
        if (circle.attr("overlap") != -1) {
            for (var i=0; i<global_data_overlap.length; i++) {
                if(circle.attr("overlap") == global_data_overlap[i].overlap) {
                    tmpData.push(global_data_overlap[i]);
                }
            }
        } else {
            for (var i=0; i<global_data_overlap.length; i++) {
                if(global_data_overlap[i].id == circle.attr("id")) {
                    tmpData.push(global_data_overlap[i]);
                    break;
                }
            }
            
        }
        
        $('#tableContainer').empty();
        var tableContainer = document.getElementById('tableContainer');
        /*if (tableContainer != null) {
            $('#tableContainer').empty();
            tableContainer.remove();
        }

        var panel = document.getElementsByClassName('panel-body')[0];
        var d = document.createElement('div');
        d.setAttribute("id", "tableContainer");
        d.setAttribute("class", "tableContainer");
        panel.appendChild(d);

        tableContainer = document.getElementById('tableContainer');*/

        var result = "<table border='0' cellpadding='0' cellspacing='0' width='100%' class='scrollTable'>";
        result += "<caption> <center>houses with "+ tmpData[0].x_value + global_x_range.attr_name + " ," + tmpData[0].y_value + global_y_range.attr_name +"</center></caption>";
        var thead = "<thead class='fixedHeader'>";
        result += thead + "<tr>";
        var i;
        console.log(header);
        for (i = 0; i < header.length; i++) {
            result += "<th>" + header[i]+"</th>";
        }
        result += "</tr></thead><tbody class='scrollContent'>";
        for (i = 0; i < tmpData.length; i++) {
            
            for (var idx = 0; idx < global_marker.length; idx++) {
                if(global_marker[idx].id == tmpData[i].id) {
                    break;
                }
            }
            var positiveColor = "white";
            var negativeColor = "white";
            
            if (global_marker[idx].label == "positive") {
                positiveColor = "yellow";
            } else if (global_marker[idx].label == "negative") {
                negativeColor = "yellow";
            }
            result += "<tr>";
            result +=  "<td>" + "<img src=pictures/" + tmpData[i].id +
                           ".jpg height=90px width=90px>" + "</td><td>" + tmpData[i].price + "</td><td>" + tmpData[i].beds + "</td><td>" + 
                       tmpData[i].baths + "</td><td>" + tmpData[i].size + "</td><td>" + tmpData[i].town + "</td><td>" +
                        tmpData[i].crime + "</td><td>" + tmpData[i].population + "</td><td>" + tmpData[i].prc_college + 
                        "</td><td>" + tmpData[i].income + "</td>";
        }
        result += "</tbody></table>";
        tableContainer.innerHTML = result;
        
   // } // else if ($('#point-label').val() === 'positive'){
// 		//positive label
// 		
// 		//get the stroke-width attribute value of the circle
// 		circle_stroke_width = +circle.attr("stroke-width");
// 		
// 		if(circle_stroke_width === 2){
// 			//the circle has already been labeled, unlabel it
// 			circle.attr("stroke-width", 0);
// 			
// 			//decrease 1 to the list value for positive points
// 			$("#list_num_positive").text( +$("#list_num_positive").text() - 1);
// 			global_marker[i].label = 'unlabel';
// 		}
// 		else{
// 			//positive points are labeled as red
// 	    	circle.attr("stroke", "red").attr("stroke-width", 2);	
// 			
// 			//increase 1 to the list value for positive points
// 			$("#list_num_positive").text( +$("#list_num_positive").text() + 1);
// 			global_marker[i].label = 'positive';
// 		}
// 		
// 	}		
// 	else{
// 		//negative label
// 		
// 		//get the stroke-width attribute value of the circle
// 		circle_stroke_width = +circle.attr("stroke-width");
// 		
// 		if(circle_stroke_width === 2){
// 			//the circle has already been labeled, unlabel it
// 			circle.attr("stroke-width", 0);
// 			
// 			//decrease 1 to the list value for negative points
// 			$("#list_num_negative").text( +$("#list_num_negative").text() - 1);
// 			global_marker[i].label = 'unlabel';
// 		}
// 		else{
// 			//negative points are labeled as green
// 	    	circle.attr("stroke", "green").attr("stroke-width", 2);
// 			
// 			//increase 1 to the list value for negative points
// 			$("#list_num_negative").text( +$("#list_num_negative").text() + 1);
// 			global_marker[i].label = 'negative';
// 					
// 		}
// 		
// 		
// 	} 
		


  };


  // run the mouseon/out functions
  circles.on("mouseover", mouseOn);
  circles.on("mouseout", mouseOff);
  circles.on("click", mouseClick);

  //add x axis
  svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
  .call(d3.svg.axis()
  .scale(x)
  .ticks(10)
  .orient("bottom"));

  // Add the text label for the x axis
  svg.append("text")
  .attr("text-anchor", "end")
  .attr("x", width + margin.left)
  .attr("y", height + margin.top - 5)
  .text(x_range.attr_name);

  //add y axis
  svg.append("g")
  .attr("class", "y axis")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  .call(d3.svg.axis()
  .scale(y)
  .ticks(10)
  .orient("left"));

  // Add the text label for the Y axis
  svg.append("text")
  .attr("text-anchor", "end")
  .attr("x", (-1)*margin.top)
  .attr("y", margin.left + 5)
  .attr("dy", "1em")
  .attr("transform", "rotate(-90)")
  .text(y_range.attr_name);


}

//attr_info is an object array, which contains two objects, one is for x, the other is for y
//object structure: {attr_name: "some_name", min_value: 23.4, max_value: 21.5}
var attr_info = [];

var get_attr_info = function(){
	
	//attr_json_obj is an object, like {"attr_collection": [{}, {}]}
	var attr_json_obj = $.parseJSON($('#attr_range_data_input').val());
	
	//get attr array, this is an array of objects
	//the structure of objects is: {attr_name, min_value, max_value}
	var attr_array = attr_json_obj.attr_collection;
	
	//empty attr_info array
	attr_info = [];

	//get x attr obj, filter result is a one object array
    var attr_x_obj = attr_array.filter(function(element){
      return element.attr_name === $('#x-attr-name').val();
    });

	//push x object
	attr_info.push(attr_x_obj[0]);
	
	//get y attr obj, filter result is a one object array 
    var attr_y_obj = attr_array.filter(function(element){
      return element.attr_name === $('#y-attr-name').val();
    });

	//push y object
	attr_info.push(attr_y_obj[0]);
	
	
}

var grid_points_plot = function(grid_point_data, svg, x_range, y_range){
	//grid_point_data is an object array
	//the object structure is: {x_value: 26.1, y_value: 19.7, label: "positive"}
	//svg: the d3 selection of the place to draw the scatter plot
	//x_range:  {attr_name, min_value, max_value}
	//y_range:  {attr_name, min_value, max_value}
	
    var x = d3.scale.linear()
    .range([0, width]);

    var y = d3.scale.linear()
    .range([height, 0]);

    //circle radius in the plot
    var circle_radius = 1;

    //convert string to number in each datum
    grid_point_data.forEach(function(d) {
      d.x_value = +d.x_value;
      d.y_value = +d.y_value;
    });

    // Set the scale domain.
    x.domain([x_range.min_value, x_range.max_value]);
    y.domain([y_range.min_value, y_range.max_value]);

    // insert group that contains all of the grid points
	// insert before any "g", so make the grid points in the background, not hiding any labeled points
    var groups = svg.insert("g", "g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // style the circles, set their locations based on data
    var circles =
    groups.selectAll("circle")
    .data(grid_point_data)
    .enter().append("circle")
    .attr("class", "")
    .attr({
      cx: function(d) { return x(d.x_value); },
      cy: function(d) { return y(d.y_value); },
      r: circle_radius
    })
    .style("fill", function(d) { 
		              if (d.label === "positive") 
						  return "Coral";
				      else 
				          return "Aquamarine";				   
			});
	
	//positive points use: fill, Coral
	//negative points use: fill, Aquamarine
	
}


// added by kemi
var scatterplot_init_mixed = function(){

	
	//initialize the chart
    d3.select('#chart')
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  	//set x attr as the first item
  	$('#x-attr-name :nth-child(1)').prop('selected', true);
  	//set y attr as the second item
  	$('#y-attr-name :nth-child(2)').prop('selected', true);
  
  	//the number of x options
  	attr_x_option_num = $("#x-attr-name option").length;
  	//the number of y options
  	attr_y_option_num = $("#y-attr-name option").length;
  
  	//events when x attr changes
  	$("#x-attr-name").change(function(){
	  
	  //index starts from 0
	  x_selected_index = $("#x-attr-name").prop("selectedIndex");
	  y_selected_index = $("#y-attr-name").prop("selectedIndex");
	  
	  if(x_selected_index === y_selected_index){
		  //x attr and y attr are the same, change y attr name to be the next
		  
		  //change y attr name to be the next
		  y_selected_index = (y_selected_index + 1) % attr_y_option_num;
		  //change the attr index to start from 1
		  y_selected_index = y_selected_index + 1;
		  $('#y-attr-name :nth-child(' + y_selected_index + ')').prop('selected', true);
		  		  
	  }
	  	
  	});
	
  	//events when y attr changes
  	$("#y-attr-name").change(function(){
	  
	  //index starts from 0
	  x_selected_index = $("#x-attr-name").prop("selectedIndex");
	  y_selected_index = $("#y-attr-name").prop("selectedIndex");
	  
	  if(x_selected_index === y_selected_index){
		  //x attr and y attr are the same, change x attr name to be the next
		  
		  //change x attr name to be the next
		  x_selected_index = (x_selected_index + 1) % attr_x_option_num;
		  //change the attr index to start from 1
		  x_selected_index = x_selected_index + 1;
		  $('#x-attr-name :nth-child(' + x_selected_index + ')').prop('selected', true);
		  		  
	  }
	  	
  	});
	
	
    $("#next-iteration-btn").on('click', function(event){
		
		//after use click next-iteration button, the code here will call learning module, get next point to present to user
		//then plot grid points of the positive region and negative region
		
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
	
		
		//generate grid points array
		var grid_points = [];
		//the number of grid points in each dimension
		var x_num = 100;
		var y_num = 100;
		var point_label = "";
		
		for(i=1; i<x_num; i++){
			for(j=1; j<y_num; j++){
				
				//generate rectangle areas
				
				if (i>0.4*x_num && i<0.6*x_num && j>0.5*y_num && j<0.7*y_num)
					point_label = "positive";
				else
					point_label = "negative";
				
				
				//generate circle areas
				/*
				if(Math.pow(i-0.5*x_num,2) + Math.pow(j-0.6*y_num, 2) < Math.pow(0.1*x_num,2))
					point_label = "positive";
				else
					point_label = "negative";
				*/
				
				grid_points.push(
					{
						x_value: i*attr_x_maxvalue/x_num + (x_num-i)*attr_x_minvalue/x_num,
						y_value: j*attr_y_maxvalue/y_num + (y_num-j)*attr_y_minvalue/y_num,
						label: point_label
					}
				);
			}		
			
		}
			
		//plot grid points
		grid_points_plot(grid_points, d3.select('#chart svg'), {attr_name: attr_x_name, min_value: +attr_x_minvalue, max_value: +attr_x_maxvalue}, {attr_name: attr_y_name, min_value: +attr_y_minvalue, max_value: +attr_y_maxvalue});
		
		
	
    });
}



var scatterplot_init = function(){
	
	//initialize the chart
    d3.select('#chart')
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  	//set x attr as the first item
  	$('#x-attr-name :nth-child(1)').prop('selected', true);
  	//set y attr as the second item
  	$('#y-attr-name :nth-child(2)').prop('selected', true);
  
  	//the number of x options
  	attr_x_option_num = $("#x-attr-name option").length;
  	//the number of y options
  	attr_y_option_num = $("#y-attr-name option").length;
  
  	//events when x attr changes
  	$("#x-attr-name").change(function(){
	  
	  //index starts from 0
	  x_selected_index = $("#x-attr-name").prop("selectedIndex");
	  y_selected_index = $("#y-attr-name").prop("selectedIndex");
	  
	  if(x_selected_index === y_selected_index){
		  //x attr and y attr are the same, change y attr name to be the next
		  
		  //change y attr name to be the next
		  y_selected_index = (y_selected_index + 1) % attr_y_option_num;
		  //change the attr index to start from 1
		  y_selected_index = y_selected_index + 1;
		  $('#y-attr-name :nth-child(' + y_selected_index + ')').prop('selected', true);
		  		  
	  }
	  	
  	});
	
  	//events when y attr changes
  	$("#y-attr-name").change(function(){
	  
	  //index starts from 0
	  x_selected_index = $("#x-attr-name").prop("selectedIndex");
	  y_selected_index = $("#y-attr-name").prop("selectedIndex");
	  
	  if(x_selected_index === y_selected_index){
		  //x attr and y attr are the same, change x attr name to be the next
		  
		  //change x attr name to be the next
		  x_selected_index = (x_selected_index + 1) % attr_x_option_num;
		  //change the attr index to start from 1
		  x_selected_index = x_selected_index + 1;
		  $('#x-attr-name :nth-child(' + x_selected_index + ')').prop('selected', true);
		  		  
	  }
	  	
  	});
	
	
	
	//events when initial sampling start button is clicked
    $("#initial-sampling-start-btn").on('click', function(event){
		
		//after user click start, the program here reads the value range for x attr and y attr, get intial samples and plot
		
		//empty original plot
		$('#chart svg').empty();
		
		//get attribute name and range info into attr_info array
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
	    var post_str = 'xname=' + attr_x_name +
	    '&yname=' + attr_y_name +
	    '&xmin=' + attr_x_minvalue +
	    '&xmax=' + attr_x_maxvalue +
	    '&ymin=' + attr_y_minvalue +
	    '&ymax=' + attr_y_maxvalue +
		'&method=' + sampling_method;
		
		
		//console.log(post_str)
		//console.log(attr_y_minvalue)
		//console.log(+attr_y_minvalue)
        
		//use asynchronous call to get data in json format 
		//data is parsed as object array 
        d3.json("get_initial_samples.php", function(error, data) {
			if (error)
            	return console.warn(error);

            //console.log("here");
			//console.log(data);
			
			//output the number of samples to the list
			$("#list_num_samples").html(data.length);
			
			//initialize the number of positive-labeled samples to be 0
			$("#list_num_positive").text(0);
			
			//initialize the number of negative-labeled samples to be 0
			$("#list_num_negative").text(0);
			 
			//write 1 to the list value for the number of iterations
			$("#list_iterations").text(1);
			
			
            //call scatter plot function
			scatter_plot(data, d3.select('#chart svg'), {attr_name: attr_x_name, min_value: +attr_x_minvalue, max_value: +attr_x_maxvalue}, {attr_name: attr_y_name, min_value: +attr_y_minvalue, max_value: +attr_y_maxvalue});

          })
          .header("Content-Type", "application/x-www-form-urlencoded")
          .post(post_str);
        
		/*
	    d3.csv("rowc_colc.csv", function(error, data) {
	      if (error)
	        return console.warn(error);
	        //console.log(data);
	        scatter_plot(data, d3.select('#chart svg'), {min_value: 400, max_value: 600}, {min_value: 1000, max_value: 1200});
	      });
        */
		
		
	  
    });
	
	
    $("#next-iteration-btn").on('click', function(event){
		
		//after use click next-iteration button, the code here will call learning module, get next point to present to user
		//then plot grid points of the positive region and negative region
		
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
	
		
		//generate grid points array
		var grid_points = [];
		//the number of grid points in each dimension
		var x_num = 100;
		var y_num = 100;
		var point_label = "";
		
		for(i=1; i<x_num; i++){
			for(j=1; j<y_num; j++){
				
				//generate rectangle areas
				
				if (i>0.4*x_num && i<0.6*x_num && j>0.5*y_num && j<0.7*y_num)
					point_label = "positive";
				else
					point_label = "negative";
				
				
				//generate circle areas
				/*
				if(Math.pow(i-0.5*x_num,2) + Math.pow(j-0.6*y_num, 2) < Math.pow(0.1*x_num,2))
					point_label = "positive";
				else
					point_label = "negative";
				*/
				
				grid_points.push(
					{
						x_value: i*attr_x_maxvalue/x_num + (x_num-i)*attr_x_minvalue/x_num,
						y_value: j*attr_y_maxvalue/y_num + (y_num-j)*attr_y_minvalue/y_num,
						label: point_label
					}
				);
			}		
			
		}
			
		//plot grid points
		grid_points_plot(grid_points, d3.select('#chart svg'), {attr_name: attr_x_name, min_value: +attr_x_minvalue, max_value: +attr_x_maxvalue}, {attr_name: attr_y_name, min_value: +attr_y_minvalue, max_value: +attr_y_maxvalue});
		
		
	
    });
	
	
}


//$(scatterplot_init);
