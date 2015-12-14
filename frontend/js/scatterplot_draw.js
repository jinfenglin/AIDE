//we add a line here
var margin = {top: 30, right: 20, bottom: 40, left: 60},
width = 790 - margin.left - margin.right,
height = 600 - margin.top - margin.bottom;

//d3 x scale in the plot
var x = d3.scale.linear()
.range([0, width]);

//d3 y scale in the plot
var y = d3.scale.linear()
.range([height, 0]);

//circle radius for the samples
var circle_radius = 5;

//indicator whether the exploration has already started
var exploration_started = false;
//indicator whether the backend has learned a model, after the backend gets some labeled samples, the model_learned will be true 
var model_learned = false;

var truth_query_shape = null;
var truth_query_data = [];

var previous_user_data = [];

//grid_points is an array of objects, each object contains data_value(an array) and label			
var grid_points = [];

//received_samples is an object, which is like 
//{1: [key, visualattr1, visualattr2, attr1, attr2, attr3,..., attrn], 2: [key, visualattr1, visualattr2, attr1, attr2, attr3,..., attrn], ...}
//the key is the id of the sample
var received_samples = {};
//this is the id of each sample, increment by 1 each time
var sample_id = 0;

//labeled_samples is an object, and is like {id1: [attr1,attr2,...,attrn, label], id2: [attr1,attr2,...,attrn, label], ...}
//this structure will only contain labeled samples in each iteration, and will be set to empty at the beginning of each iteration 
var labeled_samples = {};

//all_labeled_samples_sofar is an object, and is like {id1: [attr1,attr2,...,attrn, label], id2: [attr1,attr2,...,attrn, label], ...}
//all_labeled_samples_sofar contains all labeled samples so far 
var all_labeled_samples_sofar = {};

//this structure will contains backend labeled samples in each iteration
//like: {id1: label1, id2: label2,...}
var backend_labeled_samples = {};

//add a labeled sample to the labeled_samples object and all_labeled_samples_sofar object
//positive label is 1, negative label is -1
var add_labeled_sample = function(id, label) {
	
	//add to the object the array that contains exploration attr, skipping key and visual attr
	labeled_samples[id] = received_samples[id].slice(4).concat([label]);
	all_labeled_samples_sofar[id] = received_samples[id].slice(4).concat([label]);
	
};

var remove_labeled_sample = function(id) {
	//remove element with the id
	delete labeled_samples[id];
	delete all_labeled_samples_sofar[id];
};

// what to do when we mouse over a bubble
var mouseOn = function() {

  var circle = d3.select(this);

  // transition to increase size/opacity of bubble
  circle.transition()
  .duration(800)
  //.style("opacity", 1)
  .attr("r", circle_radius*2).ease("elastic");

  // append lines to bubbles that will be used to show the precise data points.
  // translate their location based on margins
  d3.select('#chart svg').append("g")
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

  d3.select('#chart svg').append("g")
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
  .duration(800)
  //.style("opacity", .75)
  .attr("r", circle_radius).ease("elastic");

  // fade out guide lines, then remove them
  d3.selectAll(".guide").transition().duration(100)
  .styleTween("opacity", function() { return d3.interpolate(0.5, 0); })
  .remove();

};

//what happens when the user clicks on a circle
var mouseClick = function() {

  	var circle = d3.select(this);

	//console.log(typeof(circle.attr("xvalue")));
	
	//get the stroke-width attribute value of the circle
	circle_stroke_width = +circle.attr("stroke-width");

	if(circle_stroke_width === 2){
		//the circle has already been labeled, we need to unlabel it
		circle.attr("stroke-width", 0);
		circle.style("fill", "Gray");
		
		if(circle.attr("stroke") === "Green"){  //should be Green
			//this is a positive sample
			//decrease 1 to the list value for positive points
			$("#list_num_positive").text( +$("#list_num_positive").text() - 1);
			
		}
		else if(circle.attr("stroke") === "Red"){  //should be Red
			//this is a negative sample
			//decrease 1 to the list value for negative points
			$("#list_num_negative").text( +$("#list_num_negative").text() - 1);
			
		}
		
		//remove this labeled sample
		remove_labeled_sample(+circle.attr("sample_id"));
		
	}
	else {
		//the circle has not been labeled, we need to label it
		if ($('#point-label').val() === 'positive'){
			//positive label
			//positive points are labeled as green
	    	circle.attr("stroke", "Green").attr("stroke-width", 2);	//should be Green
			circle.style("fill", "Green");	//should be Green
			circle.style("opacity", 0.75);
		
			//increase 1 to the list value for positive points
			$("#list_num_positive").text( +$("#list_num_positive").text() + 1);
			
			//add this positive labeled sample, label as 1
			add_labeled_sample(+circle.attr("sample_id"), 1);
			
		}
		else{
			//negative label
			//negative points are labeled as red
	    	circle.attr("stroke", "Red").attr("stroke-width", 2);  //should be Red
			circle.style("fill", "Red");	//should be Red
			circle.style("opacity", 0.75);
			
			//increase 1 to the list value for negative points
			$("#list_num_negative").text( +$("#list_num_negative").text() + 1);
			
			//add this negative labeled sample, label as -1
			add_labeled_sample(+circle.attr("sample_id"), -1);
			
		}
		
	} 
	
};

function change_visualization_space(svg, new_x_index, new_y_index){
	//this function is triggered when user changes attributes during the exploration, so the visualization space will be changed
	//svg: the svg to plot  
	//new_x_index: the new x attribute index in all_attr_info:  [{attr_name, min_value, max_value}, {}, {}...]
	//new_y_index: the new y attribute index in all_attr_info
		
	//console.log(all_attr_info);
	
	var x_name = all_attr_info[new_x_index].attr_name;
	var x_minvalue = all_attr_info[new_x_index].min_value;
	var x_maxvalue = all_attr_info[new_x_index].max_value;
	var y_name = all_attr_info[new_y_index].attr_name;
	var y_minvalue = all_attr_info[new_y_index].min_value;
	var y_maxvalue = all_attr_info[new_y_index].max_value;
	
    // Set the scale domain.
    x.domain([x_minvalue, x_maxvalue]);
    y.domain([y_minvalue, y_maxvalue]);
	
	//generate data
	//plot_data is an array of objects: {id, x_value, y_value, label}
	//label: 1 is positive, -1 is negative, 0 is unlabeled
	var plot_data = [];
	
	//first push all labeled samples
	for (var key in all_labeled_samples_sofar) {
	  if (all_labeled_samples_sofar.hasOwnProperty(key)) {
		  plot_data.push(
			  {
				  id: 0,
				  key_id: key,
				  visualattr1_value: received_samples[key][1],
				  visualattr2_value: received_samples[key][2],
				  x_value: all_labeled_samples_sofar[key][new_x_index],
				  y_value: all_labeled_samples_sofar[key][new_y_index],
				  label: all_labeled_samples_sofar[key][all_attr_info.length]
			  }
		  );
	  }
	}
	
	//then push unlabeled samples
	for (var key in received_samples) {
	  if (received_samples.hasOwnProperty(key) && !(key in all_labeled_samples_sofar)) {
		  plot_data.push(
			  {
				  id: 0,
				  key_id: key,
				  visualattr1_value: received_samples[key][1],
				  visualattr2_value: received_samples[key][2],				  
				  x_value: received_samples[key][new_x_index + 3],
				  y_value: received_samples[key][new_y_index + 3],
				  label: 0
			  }
		  );
	  }
	}
	
	//console.log(plot_data);
	
    // group that will contain all of the circles
    var groups = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
    // style the circles, set their locations based on data
    var circles =
    groups.selectAll("circle")
    .data(plot_data)
    .enter().append("circle")
    .attr("class", "circles")
    .attr({
      cx: function(d) { return x(d.x_value); },
      cy: function(d) { return y(d.y_value); },
      r: circle_radius,
  	  sample_id: function(d) { return d.key_id; },
  	  xvalue: function(d) { return d.x_value; },
  	  yvalue: function(d) { return d.y_value; }  
    })
	.attr("stroke-width", function(d){
		if(d.label == 1 || d.label == -1){
			//the sample is labeled
			return 2;
		}
		else{
			//the sample is not labeled
			return 0;
		}
	})
	.attr("stroke", function(d){
    	if(d.label == 1){
			//stroke color as positive
    		return "Green";	//should be Green
    	}
		else if(d.label == -1){
			//stroke color as negative
			return "Red";		//should be Red
		}
		else{
			//stroke color as unlabeled
			return "Gray";
		}
	})
	.style("opacity", function(d){
		if(d.label == 0){
			return 0.25;
		}
		else{
			return 0.75;
		}
	})
    .style("fill", function(d) {
    	if(d.label == 1){
			//color as positive
    		return "Green";	//should be Green
    	}
		else if(d.label == -1){
			//color as negative
			return "Red";	//should be Red
		}
		else{
			//color as unlabeled
			return "Gray";
		}
    });
  
    circles
    .append("title")
    .text(function(d) {  
  	  //generate tooltip title content 
	  
  	var title_content =  "<p>" + x_name + ": " + Math.round(d.x_value*100)/100 + "" +
  	  	  	"<br/>" +
  	  		"" + y_name + ": " + Math.round(d.y_value*100)/100 + "" +
  	  "<br/></p>";
	  
  	  var link = ""; 
  	  var link_content = "";
	  
	  /*
  	  if(x_name === "ra" && y_name === "dec"){
  		  //x is ra, y is dec
  	  	link = "http://skyserver.sdss.org/dr8/en/tools/chart/navi.asp?ra=" + Math.round(d.x_value*1000)/1000 + "&dec=" + Math.round(d.y_value*1000)/1000 + "";
  		link_content = '<a href="' + link + '" target="_blank">picture</a>';
  	  }
  	  else if(x_name === "dec" && y_name === "ra"){
  		  //y is ra, x is dec
  	  	link = "http://skyserver.sdss.org/dr8/en/tools/chart/navi.asp?ra=" + Math.round(d.y_value*1000)/1000 + "&dec=" + Math.round(d.x_value*1000)/1000 + "";
  		link_content = '<a href="' + link + '" target="_blank">picture</a>';
  	  }
  	  else{
  	  	  //x and y are not ra and dec
  		  link_content = "";
  	  }
	  */
	  
	  //selected db table name
	  var table_name = $("#tablename_input").val();
	  
	  if(table_name == "sdss_random_sample"){
		//visualattr1 is "ra", visualattr2 is "dec"  
  	  	link = "http://skyserver.sdss.org/dr8/en/tools/chart/navi.asp?ra=" + Math.round(d.visualattr1_value*1000)/1000 + "&dec=" + Math.round(d.visualattr2_value*1000)/1000 + "";
  		link_content = '<a href="' + link + '" target="_blank">picture</a>';
	  	
	  }
	  
  	  return title_content + link_content;
	  
    });
  
    $(".circles").tipsy({ gravity: 's', html: true, fade: true, delayIn: 0, delayOut: 1200});	
  	
  
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
    .text(x_name);

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
    .text(y_name);
	
	
	
	
};

function plot_true_query_shape(svg, true_query_data, shape_str, target , x_range, y_range){
	//svg: the svg to plot true query shape
	//true_query_data is an array
	//	for rectanges:  [{"rowc": [lowB, upB], "colc": [lowB, upB]}, {}]
	//	for ellipses:  [{"rowc": [o_value, radius], "colc": [o_value, radius]}, {}]
	//shape_str is either "rectangles" or "ellipses"
	//x_range:  {attr_name, min_value, max_value}
	//y_range:  {attr_name, min_value, max_value}
	
	var x_name = x_range.attr_name;
	var x_minvalue = x_range.min_value;
	var x_maxvalue = x_range.max_value;
	var y_name = y_range.attr_name;
	var y_minvalue = y_range.min_value;
	var y_maxvalue = y_range.max_value;
		
	var groups = svg.insert("g", "g")
			.attr("class", "true_query_shape")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	//console.log(true_query_data);
	
	for(var i=0; i< true_query_data.length; i++){
		//plot each area
		
		//console.log(true_query_data[i][x_name]);
		//console.log(true_query_data[i][x_name][0]);
		
		if(shape_str == "rectangles"){
			//plot rectanges
			//d3.select("#chart svg").insert("rect", "g").attr("x", 310).attr("y", 410).attr("width", 50).attr("height", 80).attr("fill", "white").attr("stroke", "red").attr("stroke-width", 2);
			
			var rectange_width = (+true_query_data[i][x_name][1]) - (+true_query_data[i][x_name][0]);
			var rectange_height = (+true_query_data[i][y_name][1]) - (+true_query_data[i][y_name][0]);
			
			groups.append("rect")
			.attr({
				x: x(+true_query_data[i][x_name][0]),
				y: y(+true_query_data[i][y_name][1]),
				width: x(rectange_width + x_minvalue),
				height: y(y_maxvalue - rectange_height)				
			})
			.style("fill", "none")
			.attr("stroke", target ? "Green" : "Blue")
			.attr("stroke-width", 2);
			
			
		}
		else if(shape_str == "ellipses"){
			//plot ellipses
			
			groups.append("ellipse")
			.attr({
				cx: x(true_query_data[i][x_name][0]),
				cy: y(true_query_data[i][y_name][0]),
				rx: x(true_query_data[i][x_name][1] + x_minvalue),
				ry: y(y_maxvalue - true_query_data[i][y_name][1])
			})
			.style("fill", "none")
			.attr("stroke", target ? "Green" : "Blue")
			.attr("stroke-width", 2);
			
		}
		
	}
		
	
};

STAGE = {EXPLOIT:1,GRID:2,HISTOGTAM:3,RECOMMEND:5,MISCLASSIFIED:4}

function plot_more_samples(data, svg, x_range, y_range){
	//data:  {id, x_value, y_value, visualattr1_value, visualattr2_value}
	//svg: the d3 selection of the place to draw the scatter plot
	//x_range:  {attr_name, min_value, max_value}
	//y_range:  {attr_name, min_value, max_value}
	
	
	d3.selectAll(".circles").each(function(d, i){ 
		if(d3.select(this).attr("stroke-width") == 0){
			d3.select(this).style("opacity", 0.25);
		} 
			
	});
	
    //convert string to number in each datum
    data.forEach(function(d) {
		d.id = +d.id;
      d.x_value = +d.x_value;
      d.y_value = +d.y_value;
	  d.stage_id = +d.stage_id;
	  d.visualattr1_value = +d.visualattr1_value;
	  d.visualattr2_value = +d.visualattr2_value;
    });

    
	var groups = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
    // style the circles, set their locations based on data
    var circles =
    groups.selectAll("circle")
    .data(data)
    .enter().append("circle")
    .attr("class", "circles")
    .attr({
      cx: function(d) { return x(d.x_value); },
      cy: function(d) { return y(d.y_value); },
      r: circle_radius,
		sample_id: function(d) { return d.key_id; },
  	  xvalue: function(d) { return d.x_value; },
  	  yvalue: function(d) { return d.y_value; }  
    })
	.attr("stroke-width", 0)
    .style("fill", function (d) { return d.stage_id == STAGE.RECOMMEND ? "Blue" : "Gray"});
  
  	
    circles
    .append("title")
    .text(function(d) {  
  	  //generate tooltip title content 
	  
  	var title_content =  "<p>" + x_range.attr_name + ": " + Math.round(d.x_value*100)/100 + "" +
  	  	  	"<br/>" +
  	  		"" + y_range.attr_name + ": " + Math.round(d.y_value*100)/100 + "" +
  	  "<br/></p>";
	  
  	  var link = ""; 
  	  var link_content = "";
	  
	  /*
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
	  */
	  
	  //selected db table name
	  var table_name = $("#tablename_input").val();
	  
	  if(table_name == "sdss_random_sample"){
		//visualattr1 is "ra", visualattr2 is "dec"  
  	  	link = "http://skyserver.sdss.org/dr8/en/tools/chart/navi.asp?ra=" + Math.round(d.visualattr1_value*1000)/1000 + "&dec=" + Math.round(d.visualattr2_value*1000)/1000 + "";
  		link_content = '<a href="' + link + '" target="_blank">picture</a>';
	  	
	  }
	  
  	  return title_content + link_content;
	  
    });
  
    $(".circles").tipsy({ gravity: 's', html: true, fade: true, delayIn: 0, delayOut: 1200});	

	
    //set labeled samples to empty	
    labeled_samples = {};
  	
    // run the mouseon/out functions
    circles.on("mouseover", mouseOn);
    circles.on("mouseout", mouseOff);
    circles.on("click", mouseClick);
	
	
};

function scatter_plot(data, svg, x_range, y_range){
//data:  {id, x_value, y_value, visualattr1_value, visualattr2_value}
//svg: the d3 selection of the place to draw the scatter plot
//x_range:  {attr_name, min_value, max_value}
//y_range:  {attr_name, min_value, max_value}

  
  //convert string to number in each datum
  data.forEach(function(d) {
	  d.id = +d.id;
    d.x_value = +d.x_value;
    d.y_value = +d.y_value;
    d.stage_id = +d.stage_id;
	d.visualattr1_value = +d.visualattr1_value;
	d.visualattr2_value = +d.visualattr2_value;
  });

  // Set the scale domain.
  x.domain([x_range.min_value, x_range.max_value]);
  y.domain([y_range.min_value, y_range.max_value]);

  // group that will contain all of the circles
  var groups = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // style the circles, set their locations based on data
  var circles =
  groups.selectAll("circle")
  .data(data)
  .enter().append("circle")
  .attr("class", "circles")
  .attr({
    cx: function(d) { return x(d.x_value); },
    cy: function(d) { return y(d.y_value); },
    r: circle_radius,
	  sample_id: function(d) { return d.key_id; },
	  xvalue: function(d) { return d.x_value; },
	  yvalue: function(d) { return d.y_value; }  
  })
  .attr("stroke-width", 0)
  .style("fill", function (d) { return d.stage_id == STAGE.RECOMMEND ? "Blue" : "Gray"});
  //.style("fill", "DeepSkyBlue");

  circles
  .append("title")
  .text(function(d) {  
	  //generate tooltip title content 
	  
	var title_content =  "<p>" + x_range.attr_name + ": " + Math.round(d.x_value*100)/100 + "" +
	  	  	"<br/>" +
	  		"" + y_range.attr_name + ": " + Math.round(d.y_value*100)/100 + "" +
	  "<br/></p>";
	  
	  var link = ""; 
	  var link_content = "";
	  
	  /*
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
	  */
	  
	  //selected db table name
	  var table_name = $("#tablename_input").val();
	  
	  if(table_name == "sdss_random_sample"){
		//visualattr1 is "ra", visualattr2 is "dec"  
  	  	link = "http://skyserver.sdss.org/dr8/en/tools/chart/navi.asp?ra=" + Math.round(d.visualattr1_value*1000)/1000 + "&dec=" + Math.round(d.visualattr2_value*1000)/1000 + "";
  		link_content = '<a href="' + link + '" target="_blank">picture</a>';
	  	
	  }
	  
	  return title_content + link_content;
	  
  });
  
  $(".circles").tipsy({ gravity: 's', html: true, fade: true, delayIn: 0, delayOut: 1200});	


  //set labeled samples to empty	
  labeled_samples = {};
  	
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


};

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
	
	
};

//all_attr_info is an object array, which contains objects for all attributes that the user selected
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
	
	//remove existing grid points group if any
	svg.select("g.gridgroup").remove();
	
    // insert group that contains all of the grid points
	// insert before any "g", so make the grid points in the background, not hiding any labeled points
    var groups = svg.insert("g", "g")
					.attr("class", "gridgroup")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
						  return "Aquamarine";
				      else 
				          return "Coral";				   
			});
	
	//positive points use: fill, Aquamarine
	//negative points use: fill, Coral
	
}

var change_exploration_interface = function(){
	
	//first empty the svg
	$('#chart svg').empty();
		
	var x_index_to_plot = $("#x-attr-name").prop("selectedIndex");
	var y_index_to_plot = $("#y-attr-name").prop("selectedIndex");
	//then change the visualization space and replot samples
	change_visualization_space(d3.select('#chart svg'), x_index_to_plot, y_index_to_plot);
	
	//plot the true query shape
	if(truth_query_shape != null && truth_query_data.length > 0){
		
		plot_true_query_shape(d3.select('#chart svg'), truth_query_data, truth_query_shape, true, {attr_name: all_attr_info[x_index_to_plot].attr_name, min_value: +all_attr_info[x_index_to_plot].min_value, max_value: +all_attr_info[x_index_to_plot].max_value}, {attr_name: all_attr_info[y_index_to_plot].attr_name, min_value: +all_attr_info[y_index_to_plot].min_value, max_value: +all_attr_info[y_index_to_plot].max_value});


        if (truth_query_shape != null && previous_user_data.length > 0) {
				plot_true_query_shape(d3.select('#chart svg'), previous_user_data, truth_query_shape, false, {attr_name: all_attr_info[attr_x_index_to_plot].attr_name, min_value: +all_attr_info[attr_x_index_to_plot].min_value, max_value: +all_attr_info[attr_x_index_to_plot].max_value}, {attr_name: all_attr_info[attr_y_index_to_plot].attr_name, min_value: +all_attr_info[attr_y_index_to_plot].min_value, max_value: +all_attr_info[attr_y_index_to_plot].max_value});
			}
	}
  	
	if(model_learned === true && all_attr_info.length <= 2){
		//if the backend has already learned the model, and the exploration space is only 2 dimensional, we can plot the grid points
		//the grid point data to plot, only contains two attr value and labels 
		var grid_point_data_to_plot = [];
		
		for(var i = 0; i<grid_points.length; i++){
			//push grid points value 				
			grid_point_data_to_plot.push(
				{
					x_value: grid_points[i].data_value[x_index_to_plot],
					y_value: grid_points[i].data_value[y_index_to_plot],
					label: grid_points[i].label
				}
			);
		
		}
		
		//remove true query shape
		d3.select('#chart svg').select("g.true_query_shape").remove();
		
		//plot the grid points
		grid_points_plot(grid_point_data_to_plot, d3.select('#chart svg'), {attr_name: all_attr_info[x_index_to_plot].attr_name, min_value: +all_attr_info[x_index_to_plot].min_value, max_value: +all_attr_info[x_index_to_plot].max_value}, {attr_name: all_attr_info[y_index_to_plot].attr_name, min_value: +all_attr_info[y_index_to_plot].min_value, max_value: +all_attr_info[y_index_to_plot].max_value});
		
		//plot the true query shape
		if(truth_query_shape != null && truth_query_data.length > 0){
			
			plot_true_query_shape(d3.select('#chart svg'), truth_query_data, truth_query_shape, true, {attr_name: all_attr_info[x_index_to_plot].attr_name, min_value: +all_attr_info[x_index_to_plot].min_value, max_value: +all_attr_info[x_index_to_plot].max_value}, {attr_name: all_attr_info[y_index_to_plot].attr_name, min_value: +all_attr_info[y_index_to_plot].min_value, max_value: +all_attr_info[y_index_to_plot].max_value});
	
		}
		
		if (truth_query_shape != null && previous_user_data.length > 0) {
				plot_true_query_shape(d3.select('#chart svg'), previous_user_data, truth_query_shape, false,  {attr_name: all_attr_info[attr_x_index_to_plot].attr_name, min_value: +all_attr_info[attr_x_index_to_plot].min_value, max_value: +all_attr_info[attr_x_index_to_plot].max_value}, {attr_name: all_attr_info[attr_y_index_to_plot].attr_name, min_value: +all_attr_info[attr_y_index_to_plot].min_value, max_value: +all_attr_info[attr_y_index_to_plot].max_value});
			}
		
		
	}
	
};


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
	  
	  //if exploration already starts, change visualization, x and y attributes will be different according to the code above
	  if(exploration_started === true){
	  	//the exploration has already started, change the visualization
		
		  change_exploration_interface();
		
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
	  
	  //if exploration already starts, change visualization, x and y attributes will be different according to the code above
	  if(exploration_started === true){
	  	//the exploration has already started, change the visualization
		change_exploration_interface();
	  
	  }
	  	  
	  	
  	});
	
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
	
	get_all_attr_info();
	//console.log(all_attr_info);
	
	
	//diable start, next-iteration, stop button
	$("#explore-start-btn").prop("disabled", true);
	$("#next-iteration-btn").prop("disabled", true);
	$("#explore-stop-btn").prop("disabled", true);
	
	
	var post_para = 'serverport=' + 8889 + 
	'&proxyport=' + 4446 + 
	'&attrinfo=' + $('#attr_range_data_input').val();
	
	//start JAVA backend server and Proxy program
    d3.html("start_backend.php", function(error, data) {
		if (error)
        	return console.warn(error);
		
		//returned data is {"success": 1}
		//console.log(data);
		$("#explore-start-btn").prop("disabled", false);
		
	
	})
	.header("Content-Type", "application/x-www-form-urlencoded")
	.post(post_para);
	
	
	//build parameter string to send to server to write the config file
    //var post_str = 'xname=' + attr_x_name +
    //'&yname=' + attr_y_name +
    //'&xmin=' + attr_x_minvalue +
    //'&xmax=' + attr_x_maxvalue +
    //'&ymin=' + attr_y_minvalue +
    //'&ymax=' + attr_y_maxvalue;
	/*
	var post_str = 'attrinfo=' + $('#attr_range_data_input').val();
	
	//write config files through php
    d3.json("write_config_file.php", function(error, data) {
		if (error)
        	return console.warn(error);
		
		//returned data is {"success": 1}
		//console.log(data);
	
	})
	.header("Content-Type", "application/x-www-form-urlencoded")
	.post(post_str);
	*/
	/*
	var post_str = 'proxyport=' + 4446 + 
	'&attrinfo=' + $('#attr_range_data_input').val();
	
	//send config info through socket in php
    d3.json("send_config_info.php", function(error, data) {
		if (error)
        	return console.warn(error);
		
		//returned data is {"success": 1}
		//console.log(data);
	
	})
	.header("Content-Type", "application/x-www-form-urlencoded")
	.post(post_str);
	*/
	
	/*
	//events when initial sampling start button is clicked
    $("#initial-sampling-start-btn").on('click', function(event){
		
		//after user click start, the program here reads the value range for x attr and y attr, get intial samples and plot
		
		//empty original plot
		$('#chart svg').empty();
		
		
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
        
		
	    //d3.csv("rowc_colc.csv", function(error, data) {
	    //  if (error)
	    //    return console.warn(error);
	        //console.log(data);
	    //    scatter_plot(data, d3.select('#chart svg'), {min_value: 400, max_value: 600}, {min_value: 1000, max_value: 1200});
	    //  });
        
		
		
	  
    });
	
	
    $("#resample-btn").on('click', function(event){
		
		//after use click next-iteration button, the code here will call learning module, get next point to present to user
		//then plot grid points of the positive region and negative region
		
		//console.log(labeled_samples);
		//console.log(all_labeled_samples_sofar);
		//$('#chart svg').empty();
		//change_visualization_space(d3.select('#chart svg'), 1, 0);
		
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
				
				//if(Math.pow(i-0.5*x_num,2) + Math.pow(j-0.6*y_num, 2) < Math.pow(0.1*x_num,2))
				//	point_label = "positive";
				//else
				//	point_label = "negative";
				
				
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
		//grid_points_plot(grid_points, d3.select('#chart svg'), {attr_name: attr_x_name, min_value: +attr_x_minvalue, max_value: +attr_x_maxvalue}, {attr_name: attr_y_name, min_value: +attr_y_minvalue, max_value: +attr_y_maxvalue});
		
		
	
    });
	*/
	
	
	$("#to-label-btn").on('click', function(event){
		//when the user click tolabel, the frontend will label samples automatically, according to backend_labeled_samples
		
		//1. get circles
		//2. change the circle color, stroke, stroke-width
		
		//console.log("to label button is clicked..");
		//console.log("backend labels are:");
		//console.log(backend_labeled_samples);
		
		d3.selectAll(".circles").each(function(d, i){ 
			/*
			if(d3.select(this).attr("stroke-width") == 0){
				d3.select(this).style("opacity", 0.25);
			} 
			*/
			
			//get the circle
			var circle = d3.select(this);
			//get each sample key, it is a string
			var sample_key = circle.attr("sample_id");
			
			
			if(backend_labeled_samples[sample_key] == 1){
				//it is positive sample
				
				//positive points are labeled as green
		    	circle.attr("stroke", "Green").attr("stroke-width", 2);	//should be Green
				circle.style("fill", "Green");	//should be Green
				circle.style("opacity", 0.75);
		
				//increase 1 to the list value for positive points
				$("#list_num_positive").text( +$("#list_num_positive").text() + 1);
			
				
			}
			else{
				//it is negative sample
				
				//negative points are labeled as red
		    	circle.attr("stroke", "Red").attr("stroke-width", 2);  //should be Red
				circle.style("fill", "Red");	//should be Red
				circle.style("opacity", 0.75);
			
				//increase 1 to the list value for negative points
				$("#list_num_negative").text( +$("#list_num_negative").text() + 1);
			
			}
			
			
		});
		
	});
	
	
	$("#explore-start-btn").on('click', function(event){
		/*
		//start exploration process
		//communicate with the JAVA backend
				
		in the PHP file, I need to 
		(1)get the intial samples from the PHP files through socket 
		*/
						
		//empty original plot
		$('#chart svg').empty();
				
		//build parameter string to send to server in order to get data
	    var post_str = 'proxyport=' + 4446 +
	    '&serverport=' + 8889;
	    
		
        d3.json("start_exploration.php", function(error, data) {
			if (error)
            	return console.warn(error);
            console.log(data);
            $("#list_accuracy").text(data.predictedAccuracy);
            //console.log("here");
			//console.log(data);
			//console.log(data.samples);
			
			//set exploration_started to true 
			exploration_started = true;
			
			var sample_num = data.samples.length;
			var grid_point_num = data.points.length;
			
			//console.log(data.samples);
			//console.log(data.points);
			
			//clear backend_labeled_samples(global variable)
			//backend_labeled_samples = {};
			//for scenario 4, get labelsFromBackEnd
			if(data.labelsFromBackEnd != undefined){
				//labelsFromBackEnd field is defined, so it is scenario 4, labels are send from the backend
				//generate data for backend_labeled_samples
				//the structure of labelsFromBackEnd is: [[key1, label1], [key2,label2],....]
				//console.log(data.labelsFromBackEnd);
				for(var i = 0; i< data.labelsFromBackEnd.length; i++){
					var backend_label = data.labelsFromBackEnd[i];
					backend_labeled_samples[backend_label[0]] = backend_label[1];
				}
			}
			
			
			//output the number of samples to the list
			$("#list_num_samples").html(sample_num);
			
			//initialize the number of positive-labeled samples to be 0
			$("#list_num_positive").text(0);
			
			//initialize the number of negative-labeled samples to be 0
			$("#list_num_negative").text(0);
			 
			//write 1 to the list value for the number of iterations
			$("#list_iterations").text(1);
			
			//the index of attr for x and y
			var attr_x_index_to_plot = 0;
			var attr_y_index_to_plot = 0;
			
			//decide which attributes to visualize
			for(var j=0; j < all_attr_info.length; j++){
				if(all_attr_info[j].attr_name === $("#x-attr-name").val()){
					attr_x_index_to_plot = j;
				}
				if(all_attr_info[j].attr_name === $("#y-attr-name").val()){
					attr_y_index_to_plot = j;
				}
			}
			
			//generate the sample data to plot
			var sample_data = [];
			
			for(var i = 0; i<sample_num; i++){
				
				//generate a unique sample id for each received sample
				sample_id = sample_id+1;
				
				//get sample key
				var sample_key = data.samples[i][0];
				//put each sample to the received_samples object, the key is the sample_key
				//the structure of each element is: [key, visualAttr1, visualAttr2, attr1, attr2,...]
				received_samples[sample_key] = data.samples[i];
				
				//console.log(typeof(sample_key));
				//console.log(sample_key);
				
				sample_data.push(
					{
						id: sample_id,
						key_id: sample_key,
						stage_id: data.samples[i][1],
						visualattr1_value: data.samples[i][2],
						visualattr2_value: data.samples[i][3],						
						x_value: data.samples[i][attr_x_index_to_plot + 4],
					 	y_value: data.samples[i][attr_y_index_to_plot + 4]
					}					
				);
				
				//console.log(sample_data);
			}
			//console.log(received_samples);
			//console.log(sample_data);
			
            //call scatter plot function to plot samples
			//scatter_plot(sample_data, d3.select('#chart svg'), {attr_name: attr_x_name, min_value: +attr_x_minvalue, max_value: +attr_x_maxvalue}, {attr_name: attr_y_name, min_value: +attr_y_minvalue, max_value: +attr_y_maxvalue});
			scatter_plot(sample_data, d3.select('#chart svg'), {attr_name: all_attr_info[attr_x_index_to_plot].attr_name, min_value: +all_attr_info[attr_x_index_to_plot].min_value, max_value: +all_attr_info[attr_x_index_to_plot].max_value}, {attr_name: all_attr_info[attr_y_index_to_plot].attr_name, min_value: +all_attr_info[attr_y_index_to_plot].min_value, max_value: +all_attr_info[attr_y_index_to_plot].max_value});
			
			
			//var truth_query_shape = null;
			//get the true query shape
			if($("#scenario_num_input").val() == "Scenario 4"){
				//if it is scenario 4, true query shape is rectanges
				truth_query_shape = "rectangles";
			}
			else if($("#scenario_num_input").val() == "Scenario 5"){
				//if it is scenario 5, true query shape is ellipses
				truth_query_shape = "ellipses";
			}
			
			//plot the true query shape
			if(truth_query_shape != null && data.truth != undefined){
				//console.log(truth_query_shape);
				//console.log(data.truth);
			
				//truth_query_data is global variable
				truth_query_data = data.truth;
				plot_true_query_shape(d3.select('#chart svg'), truth_query_data, truth_query_shape, true, {attr_name: all_attr_info[attr_x_index_to_plot].attr_name, min_value: +all_attr_info[attr_x_index_to_plot].min_value, max_value: +all_attr_info[attr_x_index_to_plot].max_value}, {attr_name: all_attr_info[attr_y_index_to_plot].attr_name, min_value: +all_attr_info[attr_y_index_to_plot].min_value, max_value: +all_attr_info[attr_y_index_to_plot].max_value});
			
			}
			if (data.previous != undefined) {
				previous_user_data = data.previous;
				plot_true_query_shape(d3.select('#chart svg'), previous_user_data, truth_query_shape,false, {attr_name: all_attr_info[attr_x_index_to_plot].attr_name, min_value: +all_attr_info[attr_x_index_to_plot].min_value, max_value: +all_attr_info[attr_x_index_to_plot].max_value}, {attr_name: all_attr_info[attr_y_index_to_plot].attr_name, min_value: +all_attr_info[attr_y_index_to_plot].min_value, max_value: +all_attr_info[attr_y_index_to_plot].max_value});
			}
			
			//record grid points value
			for(var i = 0; i<grid_point_num; i++){
				//push grid points value 
				/*
				grid_points.push(
					{
						x_value: data.points[i][0],
						y_value: data.points[i][1],
						label: "negative"
					}
				);
				*/
				//push grid points value, each grid point may contain more than 2 attributes
				//grid_points is an array of objects, each object contains data_value(an array) and label
				grid_points.push(
					{
						data_value: data.points[i],
						label: "negative"
					}
				);
			
			}
			//console.log(grid_points);
			//grid_points_plot(grid_points, d3.select('#chart svg'), {attr_name: attr_x_name, min_value: +attr_x_minvalue, max_value: +attr_x_maxvalue}, {attr_name: attr_y_name, min_value: +attr_y_minvalue, max_value: +attr_y_maxvalue});
			
		  	$("#next-iteration-btn").prop("disabled", false);
		  	$("#explore-stop-btn").prop("disabled", false);
		
			
          })
          .header("Content-Type", "application/x-www-form-urlencoded")
          .post(post_str);
        
		
	  	$("#explore-start-btn").prop("disabled", true);
	  	
		
	});
	
	$("#next-iteration-btn").on('click', function(event){
	
		//transfer the current samples with labels back
		//get the next set of samples
		
		//var data = [{x_value: 140, y_value: 50}, {x_value: 160, y_value: 55}];
        //call plot_more_samples function
		//plot_more_samples(data, d3.select('#chart svg'), {attr_name: attr_x_name, min_value: +attr_x_minvalue, max_value: +attr_x_maxvalue}, {attr_name: attr_y_name, min_value: +attr_y_minvalue, max_value: +attr_y_maxvalue});
		
		var labeled_sample_array = [];
		//labeled_samples is an object, key is the id of each sample
		for (var key in labeled_samples) {
		  if (labeled_samples.hasOwnProperty(key)) {
			  labeled_sample_array.push(labeled_samples[key]);
		  }
		}
		//console.log(labeled_sample_array);
		
		
		//generate labeled samples
		var labeled_sample_json_obj = {"samples": labeled_sample_array, "stop": false};
		
		//console.log(labeled_sample_json_obj);
		
		//build parameter string to send to server
	    var post_str = 'proxyport=' + 4446 +
			'&labelsamples=' + JSON.stringify(labeled_sample_json_obj);
	    
		//console.log(post_str);
			
		//pass samples with labels
		//get next set of samples and grid points labels
		
        d3.json("next_exploration.php", function(error, data) {
			if (error)
            	return console.warn(error);
			console.log(data);
			
			$("#list_accuracy").text(data.predictedAccuracy);
			//after the backend gets some labeled samples, the backend will learn a model, so model_learned will be true
			model_learned = true;
			
			//get the next set of samples and plot them 
			//data.samples
			var sample_num = data.samples.length;
			//console.log(data.samples);
			//console.log(sample_num);
			
			//clear backend_labeled_samples(global variable)
			//backend_labeled_samples = {};
			//for scenario 4, get labelsFromBackEnd
			if(data.labelsFromBackEnd != undefined){
				//labelsFromBackEnd field is defined, so it is scenario 4, labels are send from the backend
				//generate data for backend_labeled_samples
				//the structure of labelsFromBackEnd is: [[key1, label1], [key2,label2],....]
				for(var i = 0; i< data.labelsFromBackEnd.length; i++){
					var backend_label = data.labelsFromBackEnd[i];
					backend_labeled_samples[backend_label[0]] = backend_label[1];
				}
			}
			
			
			//change the sample count information in the list
			$("#list_num_samples").text( +$("#list_num_samples").text() + sample_num);
			//change the #iterations information in the list
			$("#list_iterations").text( +$("#list_iterations").text() + 1);
			
			//the index of attr for x and y
			var attr_x_index_to_plot = 0;
			var attr_y_index_to_plot = 0;
			
			//decide which attributes to visualize
			for(var j=0; j < all_attr_info.length; j++){
				if(all_attr_info[j].attr_name === $("#x-attr-name").val()){
					attr_x_index_to_plot = j;
				}
				if(all_attr_info[j].attr_name === $("#y-attr-name").val()){
					attr_y_index_to_plot = j;
				}
			}
			
			//generate the sample data to plot
			var sample_data = [];
			
			for(var i = 0; i<sample_num; i++){
				
				//generate a unique sample id for each received sample
				sample_id = sample_id+1;
				
				//get sample key
				var sample_key = data.samples[i][0];
				
				//put each sample to the received_samples object, the key is the sample_key
				//the structure of each element is: [key, visualAttr1, visualAttr2, attr1, attr2,...]				
				received_samples[sample_key] = data.samples[i];
				
				sample_data.push(
					{
						id: sample_id,
						key_id: sample_key,						
						stage_id: data.samples[i][1],
						visualattr1_value: data.samples[i][2],
						visualattr2_value: data.samples[i][3],												
						x_value: data.samples[i][attr_x_index_to_plot + 4],
					 	y_value: data.samples[i][attr_y_index_to_plot + 4]
					}					
				);
			}
			//console.log(sample_data);
			
			plot_more_samples(sample_data, d3.select('#chart svg'), {attr_name: all_attr_info[attr_x_index_to_plot].attr_name, min_value: +all_attr_info[attr_x_index_to_plot].min_value, max_value: +all_attr_info[attr_x_index_to_plot].max_value}, {attr_name: all_attr_info[attr_y_index_to_plot].attr_name, min_value: +all_attr_info[attr_y_index_to_plot].min_value, max_value: +all_attr_info[attr_y_index_to_plot].max_value});
			
			//get the grid points labels and plot them
			//data.labels
			var grid_points_num = grid_points.length;
			//check if #label == #points
			if(grid_points_num != data.labels.length){
				console.log("grid point labels doesn't correspond to the grid points!");
			}
			//change the labels in grid_points array
			for(var i = 0; i<grid_points_num; i++){
				if(data.labels[i] == 1){
					//the label is positive
					grid_points[i].label = "positive";
				}
				else {
					//the label is negative
					grid_points[i].label = "negative";
				}
			}
			
			if(all_attr_info.length <= 2){
				//if the exploration space is only 2 dimensional, then plot the grid points, otherwise don't plot the grid points
				
				//the grid point data to plot, only contains two attr value and labels 
				var grid_point_data_to_plot = [];
			
				for(var i = 0; i<grid_points_num; i++){
					//push grid points value 				
					grid_point_data_to_plot.push(
						{
							x_value: grid_points[i].data_value[attr_x_index_to_plot],
							y_value: grid_points[i].data_value[attr_y_index_to_plot],
							label: grid_points[i].label
						}
					);
			
				}
			
				//remove true query shape
				d3.select('#chart svg').select("g.true_query_shape").remove();
				//plot the grid points
				grid_points_plot(grid_point_data_to_plot, d3.select('#chart svg'), {attr_name: all_attr_info[attr_x_index_to_plot].attr_name, min_value: +all_attr_info[attr_x_index_to_plot].min_value, max_value: +all_attr_info[attr_x_index_to_plot].max_value}, {attr_name: all_attr_info[attr_y_index_to_plot].attr_name, min_value: +all_attr_info[attr_y_index_to_plot].min_value, max_value: +all_attr_info[attr_y_index_to_plot].max_value});
			
				//plot the true query shape
				if(truth_query_shape != null && truth_query_data.length > 0){
					
					plot_true_query_shape(d3.select('#chart svg'), truth_query_data, truth_query_shape, true,{attr_name: all_attr_info[attr_x_index_to_plot].attr_name, min_value: +all_attr_info[attr_x_index_to_plot].min_value, max_value: +all_attr_info[attr_x_index_to_plot].max_value}, {attr_name: all_attr_info[attr_y_index_to_plot].attr_name, min_value: +all_attr_info[attr_y_index_to_plot].min_value, max_value: +all_attr_info[attr_y_index_to_plot].max_value});
			
				}
				
				if (truth_query_shape != null && previous_user_data.length > 0) {
				plot_true_query_shape(d3.select('#chart svg'), previous_user_data, truth_query_shape, false, {attr_name: all_attr_info[attr_x_index_to_plot].attr_name, min_value: +all_attr_info[attr_x_index_to_plot].min_value, max_value: +all_attr_info[attr_x_index_to_plot].max_value}, {attr_name: all_attr_info[attr_y_index_to_plot].attr_name, min_value: +all_attr_info[attr_y_index_to_plot].min_value, max_value: +all_attr_info[attr_y_index_to_plot].max_value});
			}
			
			
				
			}
			
			
			
		})
		.header("Content-Type", "application/x-www-form-urlencoded")
		.post(post_str);
		
		 
	
	});
	
	$("#explore-stop-btn").on('click', function(event){
		
		//stop the Proxy JAVA program
		
		//build parameter string to send to server
	    var post_str = 'proxyport=' + 4446;
	    
	    
		
        d3.json("stop_exploration.php", function(error, data) {
			if (error)
            	return console.warn(error);
			
			//returned data is {"success": 1}
			//console.log(data);
			
			//set exploration_started to false
			exploration_started = false;
			
			//go to the first page
			window.location.href = "connect.php";
		
		})
		.header("Content-Type", "application/x-www-form-urlencoded")
		.post(post_str);
		
	});
	
	
}


$(scatterplot_init);
