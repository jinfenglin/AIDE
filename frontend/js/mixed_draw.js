var global_sample_data = [];
var global_marker = [];
var new_samples = [];
var marker_from_backend = [];
var draw_type = 1;   // 0 is chart, 1 is map
var showingObject = 0;

var arg_circle;

var global_objects = [];

var predicted_query = "";

var margin = {top: 30, right: 20, bottom: 40, left: 60},
width = 790 - margin.left - margin.right,
height = 600 - margin.top - margin.bottom;

var global_data_overlap = [];
var header = ["picture"];
var global_x_range;
var global_y_range;

//circle radius for the samples
var circle_radius = 5;

//record the circles generated in the last iteration, then to make the unlabeled samples in last iteration fade(opacity reduces to 0.25)
var last_iteration_generated_circles = null;

//indicator whether the exploration has already started
var exploration_started = false;
//indicator whether the backend has learned a model, after the backend gets some labeled samples, the model_learned will be true 
var model_learned = false;

//grid_points is an array of objects, each object contains data_value(an array) and label			
var grid_points = [];

//relevant attributes: ["attr1", "attr2"]
var relevantAttributes = [];

//relevant areas: [{"rowc":[lowB, upBound], "colc":[lowB, upBound], “third”:[min, max]},{}]
var relevantAreas = [];

//received_samples is an object, which is like {1: [attr1, attr2, attr3,..., attrn], 2: [attr1, attr2, attr3,..., attrn], ...}
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

//add a labeled sample to the labeled_samples object and all_labeled_samples_sofar object
//positive label is 1, negative label is -1
var add_labeled_sample = function(id, label) {
	//add to the object
	labeled_samples[id] = received_samples[id].concat([label]);
	all_labeled_samples_sofar[id] = received_samples[id].concat([label]);
	
};

var remove_labeled_sample = function(id) {
	//remove element with the id
	delete labeled_samples[id];
	delete all_labeled_samples_sofar[id];
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


function btnClicked(elmt, id, circle) {
    var elmtid = event.target.id;
    var sample_data;
    console.log(arg_circle);
    for (i = 0; i < global_marker.length; i++) {
        if(global_marker[i].id == id) {
            break;
        }
    }
    for (var n=0; n<global_sample_data.length; n++) {
        if(global_sample_data[n].id == id) {
            sample_data = global_sample_data[n];
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
    
    if(sample_data.overlap == -1) {
        if(global_marker[i].label == "positive") {
            arg_circle.attr("stroke", "Green").attr("stroke-width", 2);	//should be Green
		    arg_circle.style("fill", "Green");	//should be Green
		}
		
		if(global_marker[i].label == "negative") {
		    arg_circle.attr("stroke", "Red").attr("stroke-width", 2);  //should be Red
			arg_circle.style("fill", "Red");	//should be Red
		}
		
		if(global_marker[i].label == "unlabel") {
		    arg_circle.attr("stroke", "gray").attr("stroke-width", 0);  //should be Red
			arg_circle.style("fill", "gray");	//should be Red
		}
    } else {
        var pos = 0;
        var neg = 0;
        var unlab= 0;
        for (var n=0; n<global_sample_data.length; n++) {
            if(global_sample_data[n].overlap == sample_data.overlap) {
                
                for(var i=0; i<global_marker.length; i++) {
                    if(global_marker[i].id == global_sample_data[n].id && global_marker[i].label == "positive") {
                        pos += 1;
                    }
                
                    if(global_marker[i].id == global_sample_data[n].id && global_marker[i].label == "negative") {
                        neg += 1;
                    }
                
                    if(global_marker[i].id == global_sample_data[n].id && global_marker[i].label == "unlabel") {
                        unlab+= 1;
                    }
                }
            }
        }
        console.log(sample_data.overlap);
        console.log(pos);
        console.log(neg);
        console.log(unlab);
        
        if(unlab > 0) {
            arg_circle.attr("stroke", "Gray").attr("stroke-width", 10);
            arg_circle.style("fill", "Gray");
        } else {
            if(pos > 0 && neg == 0) {
                arg_circle.attr("stroke", "Green").attr("stroke-width", 10);  //should be Red
			    arg_circle.style("fill", "Green");	//should be Red
            } else if (neg > 0 && pos == 0) {
                arg_circle.attr("stroke", "Red").attr("stroke-width", 10);  //should be Red
			    arg_circle.style("fill", "Red");	//should be Red
            } else {
                arg_circle.attr("stroke", "DeepSkyBlue").attr("stroke-width", 10);  //should be Red
			    arg_circle.style("fill", "DeepSkyBlue");	//should be Red
            }
        }
    }
}


function kemi_change_visualization_space(svg, new_x_index, new_y_index){
	//this function is triggered when user changes attributes during the exploration, so the visualization space will be changed
	//svg: the svg to plot  
	//new_x_index: the new x attribute index in all_attr_info:  [{attr_name, min_value, max_value}, {}, {}...]
	//new_y_index: the new y attribute index in all_attr_info
		
	
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
				  id: key,
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
				  id: key,
				  x_value: received_samples[key][new_x_index],
				  y_value: received_samples[key][new_y_index],
				  label: 0
			  }
		  );
	  }
	}
	
	
    // group that will contain all of the circles
    var groups = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
    // style the circles, set their locations based on data
    var circles =
    groups.selectAll("circle")
    .data(plot_data)
    .enter().append("circle")
    .attr("class", "house_circles")
    .attr({
      cx: function(d) { return x(d.x_value); },
      cy: function(d) { return y(d.y_value); },
      r: circle_radius,
  	  sample_id: function(d) { return d.id; },
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
    .text(" " + x_name + " value");

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
    .text(" " + y_name + " value");
	
	
	
	
};


function kemi_plot_more_samples(data, svg, x_range, y_range){
	//data:  {id, x_value, y_value}
	//svg: the d3 selection of the place to draw the scatter plot
	//x_range:  {attr_name, min_value, max_value}
	//y_range:  {attr_name, min_value, max_value}
	
    //convert string to number in each datum
    data.forEach(function(d) {
		d.id = +d.id;
      d.x_value = +d.x_value;
      d.y_value = +d.y_value;
    });

    
	var groups = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
    // style the circles, set their locations based on data
    var circles =
    groups.selectAll("circle")
    .data(data)
    .enter().append("circle")
    .attr("class", "house_circles")
    .attr({
      cx: function(d) { return x(d.x_value); },
      cy: function(d) { return y(d.y_value); },
      r: circle_radius,
		sample_id: function(d) { return d.id; },
  	  xvalue: function(d) { return d.x_value; },
  	  yvalue: function(d) { return d.y_value; }  
    })
    .style("fill", "Gray");
  
    //set labeled samples to empty	
    labeled_samples = {};
  	
    // run the mouseon/out functions
    circles.on("mouseover", mouseOn);
    circles.on("mouseout", mouseOff);
    circles.on("click", mouseClick);
	
	
};


function kemi_scatter_plot(data, svg, x_range, y_range, drawAll){
//data:  {x_value, y_value}
//svg: the d3 selection of the place to draw the scatter plot
//x_range:  {attr_name, min_value, max_value}
//y_range:  {attr_name, min_value, max_value}

  console.log("data in scatter plot");
  console.log(data);
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
  var circles;
  if (showingObject) {
    circles =
  groups.selectAll("circle")
  .data(global_data_overlap)
  .enter().append("circle")
  .attr("class", "house_circles")
  .attr("id", function(d) { return d.id; })
  .attr("overlap", function(d) { return d.overlap; })
  .attr({
    cx: function(d) { return x(d.x_value); },
    cy: function(d) { return y(d.y_value); },
    r: circle_radius
  })
  .style("fill", "DeepSkyBlue");
  
    circles.attr("stroke", "DeepSkyBlue");
  }
  else {

    circles =
  groups.selectAll("circle")
  .data(global_data_overlap)
  .enter().append("circle")
  .attr("class", "house_circles")
  .attr("id", function(d) { return d.id; })
  .attr("overlap", function(d) { return d.overlap; })
  .attr({
    cx: function(d) { return x(d.x_value); },
    cy: function(d) { return y(d.y_value); },
    r: circle_radius
  })
  .style("fill", "Gray");
  
    circles.attr("stroke", "Gray");
  }
  

    if (showingObject == 0) {
    circles.attr("stroke", function(d){
         if(d.overlap == -1) {
             for (i = 0; i < global_marker.length; i++) {
                if(global_marker[i].id == d.id) {
                    if(global_marker[i].label == "positive" ) {
                        return "Green";
                    } else if(global_marker[i].label == "negative") {
                        return "Red";
                    } else {
                        if(new_samples.indexOf(d.id) > -1) {
                            return "Black";
                        } else {
                            return "Gray";
                        }
                    }
                }
            }
         } else {
            var sample_data;
            for(var q=0; q<global_sample_data.length; q++) {
                if(global_sample_data[q].id == d.id) {
                    sample_data = global_sample_data[q];
                    break;
                }
            }
         
            var pos = 0;
            var neg = 0;
            var unlab= 0;
            var isNew = false;
            for (var n=0; n<global_sample_data.length; n++) {
                if(global_sample_data[n].overlap == sample_data.overlap) {
                
                    for(var i=0; i<global_marker.length; i++) {
                        if(global_marker[i].id == global_sample_data[n].id && global_marker[i].label == "positive") {
                            pos += 1;
                        }
                
                        if(global_marker[i].id == global_sample_data[n].id && global_marker[i].label == "negative") {
                            neg += 1;
                        }
                
                        if(global_marker[i].id == global_sample_data[n].id && global_marker[i].label == "unlabel") {
                            unlab+= 1;
                            if(new_samples.indexOf(global_sample_data[n].id)>-1) {
                                isNew = true;
                            }
                        }
                    }
                }
            }

            if(unlab > 0) {
                if(isNew == true) {
                            return "Black";
                        } else {
                            return "Gray";
                    }
            } else {
                if(pos > 0 && neg == 0) {
                    return "Green";
                } else if (neg > 0 && pos == 0) {
                    return "Red";
                } else {
                    return "DeepSkyBlue";
                }
            }
         }
    });
    
    circles.style("fill", function(d){
         if(d.overlap == -1) {
             for (i = 0; i < global_marker.length; i++) {
                if(global_marker[i].id == d.id) {
                    if(global_marker[i].label == "positive" ) {
                        return "Green";
                    } else if(global_marker[i].label == "negative") {
                        return "Red";
                    } else {
                        if(new_samples.indexOf(d.id)>-1) {
                            return "Black";
                        } else {
                            return "Gray";
                        }
                    }
                }
            }
         } else {
            var sample_data;
            for(var q=0; q<global_sample_data.length; q++) {
                if(global_sample_data[q].id == d.id) {
                    sample_data = global_sample_data[q];
                    break;
                }
            }
         
            var pos = 0;
            var neg = 0;
            var unlab= 0;
            var isNew = false;
            for (var n=0; n<global_sample_data.length; n++) {
                if(global_sample_data[n].overlap == sample_data.overlap) {
                
                    for(var i=0; i<global_marker.length; i++) {
                        if(global_marker[i].id == global_sample_data[n].id && global_marker[i].label == "positive") {
                            pos += 1;
                        }
                
                        if(global_marker[i].id == global_sample_data[n].id && global_marker[i].label == "negative") {
                            neg += 1;
                        }
                
                        if(global_marker[i].id == global_sample_data[n].id && global_marker[i].label == "unlabel") {
                            unlab+= 1;
                            if(new_samples.indexOf(global_sample_data[n].id) > -1) {
                                isNew = true;
                            }
                        }
                    }
                }
            }

            if(unlab > 0) {
                if(isNew == true) {
                            return "Black";
                        } else {
                            return "Gray";
                    }
            } else {
                if(pos > 0 && neg == 0) {
                    return "Green";
                } else if (neg > 0 && pos == 0) {
                    return "Red";
                } else {
                    return "DeepSkyBlue";
                }
            }
         }
    });
}
    
    circles.attr("stroke-width", function(d){
      if (d.overlap != -1) {
        return 10;
      }
      else {
        return 0;
  }
    });
    

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
    .duration(800).style("opacity", 1.0)
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
        result += "<caption> <center>houses with "+ global_x_range.attr_name + ": " + tmpData[0].x_value + " ," + global_y_range.attr_name + ": " + tmpData[0].y_value + "</center></caption>";
        var thead = "<thead class='fixedHeader'>";
        result += thead + "<tr>";
        var i;
        
        if (showingObject)
            var len = header.length-1;
        else
            var len = header.length;
        for (i = 0; i < len; i++) {
            result += "<th>" + header[i]+"</th>";
        }
        var w = 91 * i;
        document.getElementById('tableContainer').setAttribute("style","width:" + w + "px");
        result += "</tr></thead><tbody class='scrollContent'>";

        /*var result = "<table border='0' cellpadding='0' cellspacing='0' width='100%' class='scrollTable'>";
        result += "<caption> <center>houses with "+ tmpData[0].x_value + global_x_range.attr_name + " ," + tmpData[0].y_value + global_y_range.attr_name +"</center></caption>";
        var thead = "<thead class='fixedHeader'>";
        result += thead + "<tr>";
        var i;
        for (i = 0; i < header.length; i++) {
            result += "<th>" + header[i]+"</th>";
        }
        result += "</tr></thead><tbody class='scrollContent'>";*/
        for (i = 0; i < tmpData.length; i++) {
            
            if (showingObject == 0) {
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
        }
            
            result += "<tr>";
            result +=  "<td>" + "<img src=pictures/" + tmpData[i].id +
                           ".jpg height=90px width=90px>" + "</td>";
            var j;
            for (j = 1; j < header.length - 1; j++) {
                var attr = header[j];
                result += "<td>" + tmpData[i][attr] + "</td>";
            }
            
            if (showingObject == 0) {
            arg_circle = circle;
            result += "<td> <button style='width:67px;background:"+ positiveColor +"' id='positive_btn_"+ tmpData[i].id+"' onClick='btnClicked(this,"+tmpData[i].id+")'>positive</button>" + 
                        "<button style='width:67px;background:"+ negativeColor +"' id='negative_btn_" + tmpData[i].id+"' onClick='btnClicked(this,"+tmpData[i].id+")'>negative</button></td>" + 
                        "</tr>";
            }

            /*result +=  "<td>" + "<img src=pictures/" + tmpData[i].id +
                           ".jpg height=90px width=90px>" + "</td><td>" + tmpData[i].price + "</td><td>" + tmpData[i].beds + "</td><td>" + 
                       tmpData[i].baths + "</td><td>" + tmpData[i].size + "</td><td>" + tmpData[i].town + "</td><td>" +
                        tmpData[i].crime + "</td><td>" + tmpData[i].population + "</td><td>" + tmpData[i].prc_college + 
                        "</td><td>" + tmpData[i].income + "</td>" + 
                        "<td> <button style='width:67px;background:"+ positiveColor +"' id='positive_btn_"+ tmpData[i].id+"' onClick='btnClicked(this,"+tmpData[i].id+")'>positive</button>" + 
                        "<button style='width:67px;background:"+ negativeColor +"' id='negative_btn_" + tmpData[i].id+"' onClick='btnClicked(this,"+tmpData[i].id+")'>negative</button></td>" + 
                        "</tr>";*/
        }
        result += "</tbody></table>";
        tableContainer.innerHTML = result;
        console.log(result);
        
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
		


  };  //mouseClick


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
	
	
}

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

	for (var i = 0; i < all_attr_info.length; i++) {
        header.push(all_attr_info[i].attr_name);
    }
	
    header.push("label");
};


var kemi_generate_grid_points_plot = function(x_grid_name, x_grid_minvalue, x_grid_maxvalue, y_grid_name, y_grid_minvalue, y_grid_maxvalue){
	//get the relevant area in the 2d space
	//x_grid_range will be 2d array, like [[min1, max1], [min2, max2],...], represents relevant ranges for x in area1, area2,...
	//y_grid_range is the same
	var x_grid_range = [];
	var y_grid_range = [];
	
	//"prediction":[{"rowc":[lowB, upBound], "colc":[lowB, upBound], “third”:[min, max]},{}]
	for(var i = 0; i < relevantAreas.length; i++){
		var area_obj = relevantAreas[i];
		//both x,y will in area_obj, if x or y is not constaint, the range will be the total range
		//push the x,y range for each area
		x_grid_range.push(area_obj[x_grid_name]);
		y_grid_range.push(area_obj[y_grid_name]);
		
	}

	//construct grid points, and give them labels according to x_grid_range and y_grid_range
	// grid points array
	var grid_points = [];
	//the number of grid points in each dimension
	var x_num = 100;
	var y_num = 100;
	var point_label = "";

	for(var i=1; i<x_num; i++){
		for(var j=1; j<y_num; j++){
	
			//generate rectangle areas
			//give grid points labels
			
			var grid_x_value = i*x_grid_maxvalue/x_num + (x_num-i)*x_grid_minvalue/x_num;
			var grid_y_value = j*y_grid_maxvalue/y_num + (y_num-j)*y_grid_minvalue/y_num;
			
			point_label = "";
			//check each relevant area
			for(var k=0; k < x_grid_range.length; k++){
				if(grid_x_value > x_grid_range[k][0] && grid_x_value < x_grid_range[k][1] && grid_y_value > y_grid_range[k][0] && grid_y_value < y_grid_range[k][1]){
					//the grid point is within the relevant area
					point_label = "positive";
				}
			}
			
			if(point_label.length == 0){
				//not positive, assign to negative
				point_label = "negative";
				
			}
			/*
			if (i>0.4*x_num && i<0.6*x_num && j>0.5*y_num && j<0.7*y_num)
				point_label = "positive";
			else
				point_label = "negative";
			*/
	
			grid_points.push(
				{
					x_value: grid_x_value,
					y_value: grid_y_value,
					label: point_label
				}
			);
		}		

	}

	//plot grid points
	kemi_grid_points_plot(grid_points, d3.select('#chart svg'), {attr_name: x_grid_name, min_value: +x_grid_minvalue, max_value: +x_grid_maxvalue}, {attr_name: y_grid_name, min_value: +y_grid_minvalue, max_value: +y_grid_maxvalue});
	
};

var kemi_grid_points_plot = function(grid_point_data, svg, x_range, y_range){
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
	
};

var kemi_change_exploration_interface = function(){
	
	//first empty the svg
	$('#chart svg').empty();
	
	//get the index of current x, y attributes in user selected attributes	
	var x_index_to_plot = $("#x-attr-name").prop("selectedIndex");
	var y_index_to_plot = $("#y-attr-name").prop("selectedIndex");
	
	var x_name = all_attr_info[x_index_to_plot].attr_name;
	var x_minvalue = all_attr_info[x_index_to_plot].min_value;
	var x_maxvalue = all_attr_info[x_index_to_plot].max_value;
	var y_name = all_attr_info[y_index_to_plot].attr_name;
	var y_minvalue = all_attr_info[y_index_to_plot].min_value;
	var y_maxvalue = all_attr_info[y_index_to_plot].max_value;
	
	//then change the visualization space and replot samples
	//kemi_change_visualization_space(d3.select('#chart svg'), x_index_to_plot, y_index_to_plot);
		
	//change x_value, y_value for each data in global_sample_data, change the overlap
	//generate new_global_sample_data
	
  if (showingObject) {
    for(var i=0; i< global_objects.length; i++) {
      global_objects[i].x_value = global_objects[i][x_name];
      global_objects[i].y_value = global_objects[i][y_name];
      global_objects[i].overlap = -1;
  }
  
  
  
  for(var i = 0; i < global_objects.length; i++) {
       if (global_objects[i].overlap == -1) {
          for(var n = 0; n < global_objects.length; n++) {
             if(i != n && global_objects[i].x_value == global_objects[n].x_value
                 && global_objects[i].y_value == global_objects[n].y_value) {
                  global_objects[i].overlap = global_objects[i].id;
                  global_objects[n].overlap = global_objects[i].id;
              }
            }
          }
      }
  //then plot 
  kemi_scatter_plot(global_objects, d3.select('#chart svg'), {attr_name: x_name, min_value: +x_minvalue, max_value: +x_maxvalue}, {attr_name: y_name, min_value: +y_minvalue, max_value: +y_maxvalue}, false);
  }
  else {
	for(var i=0; i< global_sample_data.length; i++) {
	    global_sample_data[i].x_value = global_sample_data[i][x_name];
	    global_sample_data[i].y_value = global_sample_data[i][y_name];
	    global_sample_data[i].overlap = -1;
	}
	
	
	
	for(var i = 0; i < global_sample_data.length; i++) {
       if (global_sample_data[i].overlap == -1) {
          for(var n = 0; n < global_sample_data.length; n++) {
             if(i != n && global_sample_data[i].x_value == global_sample_data[n].x_value
                 && global_sample_data[i].y_value == global_sample_data[n].y_value) {
                  global_sample_data[i].overlap = global_sample_data[i].id;
                  global_sample_data[n].overlap = global_sample_data[i].id;
              }
            }
          }
      }
	//then plot	
	kemi_scatter_plot(global_sample_data, d3.select('#chart svg'), {attr_name: x_name, min_value: +x_minvalue, max_value: +x_maxvalue}, {attr_name: y_name, min_value: +y_minvalue, max_value: +y_maxvalue}, false);
	}
  	/*
	//print grid points
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
		
		//plot the grid points
		kemi_grid_points_plot(grid_point_data_to_plot, d3.select('#chart svg'), {attr_name: all_attr_info[x_index_to_plot].attr_name, min_value: +all_attr_info[x_index_to_plot].min_value, max_value: +all_attr_info[x_index_to_plot].max_value}, {attr_name: all_attr_info[y_index_to_plot].attr_name, min_value: +all_attr_info[y_index_to_plot].min_value, max_value: +all_attr_info[y_index_to_plot].max_value});
		
	}
	*/
	if(model_learned === true && (relevantAttributes.indexOf($("#x-attr-name").val()) > -1 || relevantAttributes.indexOf($("#y-attr-name").val()) > -1)){
		//model learned and x or y is within relevant attributes, then generate grid points and display relevant ranges
		kemi_generate_grid_points_plot(x_name, x_minvalue, x_maxvalue, y_name, y_minvalue, y_maxvalue);
		
	}
	
};

var plot_init = function(){
    //scatterplot_init_mixed();
    //map_init_mixed();
    
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
		
		  kemi_change_exploration_interface();
		
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
		kemi_change_exploration_interface();
	  
	  }
	  
	  	
  	});
  	
  	$("#pre-areas").change(function() {
  	
  	});
	
	get_all_attr_info();
	
	//diable start, next-iteration, stop button
	$("#explore-start-btn").prop("disabled", true);
	$("#next-iteration-btn").prop("disabled", true);
	$("#explore-stop-btn").prop("disabled", true);
  $("#all-relevant-objects-btn").prop("disabled", true);
  $("#switch").prop("disabled", true);
	
	
	var post_para = 'serverport=' + 8889 + 
	'&proxyport=' + 4446 + 
	'&attrinfo=' + $('#attr_range_data_input').val();
	
	//start JAVA backend server and Proxy program
    d3.json("start_backend.php", function(error, data) {
		if (error)
        	return console.warn(error);
		
		//returned data is {"success": 1}
		$("#explore-start-btn").prop("disabled", false);
	
	})
	.header("Content-Type", "application/x-www-form-urlencoded")
	.post(post_para);
	
	
    $("#initial-sampling-start-btn").on('click', function(event){
		
    //get attribute name and range info into attr_info array
        $('#tableContainer').empty();
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
		
		
        
		//use asynchronous call to get data in json format 
		//data is parsed as object array 
        d3.json("get_initial_samples_for_map.php", function(error, data) {
			if (error)
            	return console.warn(error);

			
			//output the number of samples to the list
			$("#list_num_samples").html(data.length);
			
			//initialize the number of positive-labeled samples to be 0
			$("#list_num_positive").text(0);
			
			//initialize the number of negative-labeled samples to be 0
			$("#list_num_negative").text(0);
			 
			//write 1 to the list value for the number of iterations
			$("#list_iterations").text(1);
			
            //call scatter plot function
            
            global_sample_data = data;
            global_marker = [];
            
            for (i = 0; i < data.length; i++) {
                var turple = {id: data[i].id, label: "unlabel"};
                global_marker.push(turple);
                data[i].overlap = -1;
            }
            
            for(var i = 0; i < data.length; i++) {
                    if (data[i].overlap == -1) {
                        for(var n = i+1; n < data.length; n++) {
                            if(data[n].overlap == -1 && data[i].x_value == data[n].x_value && data[i].y_value == data[n].y_value) {
                                data[i].overlap = data[i].id;
                                data[n].overlap = data[i].id;
                            }
                        }
                    }
                }
            
            var chart = document.getElementById('chart' );
            chart.style.backgroundColor = 'white';
            if (draw_type == 0) {
                $('#chart').empty();
                d3.select('#chart')
                .append('svg')
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
           // map_plot(global_sample_data);
			    kemi_scatter_plot(global_sample_data, d3.select('#chart svg'), {attr_name: attr_x_name, min_value: +attr_x_minvalue, max_value: +attr_x_maxvalue}, {attr_name: attr_y_name, min_value: +attr_y_minvalue, max_value: +attr_y_maxvalue}, false);
            } else if (draw_type == 1) {
                $('#chart').empty();
                map_plot(global_sample_data, header);
			    //scatter_plot(global_sample_data, d3.select('#chart'), {attr_name: attr_x_name, min_value: +attr_x_minvalue, max_value: +attr_x_maxvalue}, {attr_name: attr_y_name, min_value: +attr_y_minvalue, max_value: +attr_y_maxvalue});

            }
                      })
          .header("Content-Type", "application/x-www-form-urlencoded")
          .post(post_str);
        
		/*
	    d3.csv("rowc_colc.csv", function(error, data) {
	      if (error)
	        return console.warn(error);
	        scatter_plot(data, d3.select('#chart svg'), {min_value: 400, max_value: 600}, {min_value: 1000, max_value: 1200});
	      });
        */
		
		
	  
    });
    
    $("#switch").on('click', function(event){

        
       draw_type = (draw_type + 1) % 2;
       
       var chart = document.getElementById('chart' );
       chart.style.backgroundColor = 'white';
       
       $('#chart').empty();
       if (draw_type == 0) {
            d3.select('#chart')
                .append('svg')
                .attr("width", width + margin.left + margin.right )
                .attr("height", height + margin.top + margin.bottom );
            var attr_x_index_to_plot = 0;
			var attr_y_index_to_plot = 0;
            for(var j=0; j < all_attr_info.length; j++){
				if(all_attr_info[j].attr_name === $("#x-attr-name").val()){
					attr_x_index_to_plot = j;
				}
				if(all_attr_info[j].attr_name === $("#y-attr-name").val()){
					attr_y_index_to_plot = j;
				}
			}
            if (showingObject == 0) {
            kemi_scatter_plot(global_sample_data, d3.select('#chart svg'), {attr_name: all_attr_info[attr_x_index_to_plot].attr_name, min_value: +all_attr_info[attr_x_index_to_plot].min_value, max_value: +all_attr_info[attr_x_index_to_plot].max_value}, {attr_name: all_attr_info[attr_y_index_to_plot].attr_name, min_value: +all_attr_info[attr_y_index_to_plot].min_value, max_value: +all_attr_info[attr_y_index_to_plot].max_value}, false);
			}
            else 
            kemi_scatter_plot(global_objects, d3.select('#chart svg'), {attr_name: all_attr_info[attr_x_index_to_plot].attr_name, min_value: +all_attr_info[attr_x_index_to_plot].min_value, max_value: +all_attr_info[attr_x_index_to_plot].max_value}, {attr_name: all_attr_info[attr_y_index_to_plot].attr_name, min_value: +all_attr_info[attr_y_index_to_plot].min_value, max_value: +all_attr_info[attr_y_index_to_plot].max_value}, false);

			//generate grid points here 
			var x_name = all_attr_info[attr_x_index_to_plot].attr_name;
			var x_minvalue = all_attr_info[attr_x_index_to_plot].min_value;
			var x_maxvalue = all_attr_info[attr_x_index_to_plot].max_value;
			var y_name = all_attr_info[attr_y_index_to_plot].attr_name;
			var y_minvalue = all_attr_info[attr_y_index_to_plot].min_value;
			var y_maxvalue = all_attr_info[attr_y_index_to_plot].max_value;
	
			if(model_learned === true && (relevantAttributes.indexOf($("#x-attr-name").val()) > -1 || relevantAttributes.indexOf($("#y-attr-name").val()) > -1)){
				//model learned and x or y is within relevant attributes, then generate grid points and display relevant ranges
				kemi_generate_grid_points_plot(x_name, x_minvalue, x_maxvalue, y_name, y_minvalue, y_maxvalue);
		
			}
			
       } else if (draw_type == 1) {
            $('#tableContainer').empty();
            if (showingObject == 0)
                map_plot(global_sample_data, header);
            else
                map_plot(global_objects, header);
       }
        
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
            
            $("#list_accuracy").text(data.predictedAccuracy);
			marker_from_backend = data.labelsFromBackEnd;
			
			//set exploration_started to true 
			exploration_started = true;
			
			var sample_num = data.samples.length;
			//var grid_point_num = data.points.length;
			
			//console.log("inside start button event...");
			//console.log("data received...");
			//console.log(data.samples);
			
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
			global_sample_data = [];
			
			new_samples = [];
			for(var i=0; i<sample_num; i++) {
			    var tmp = {};
			    tmp.id   = data.samples[i][0];
			    tmp.lat  = data.samples[i][1];
			    tmp.long = data.samples[i][2];
			    
                for(var j=0; j < all_attr_info.length; j++){
                    tmp[all_attr_info[j].attr_name] = data.samples[i][j+3];
                    
                    tmp.x_value = data.samples[i][attr_x_index_to_plot+3],
					tmp.y_value = data.samples[i][attr_y_index_to_plot+3]
			    }
			    global_sample_data.push(tmp);
			    
			    new_samples.push(tmp.id);
            }
            global_marker = [];
            for (i = 0; i < global_sample_data.length; i++) {
                var turple = {id: global_sample_data[i].id, label: "unlabel"};
                global_marker.push(turple);
                global_sample_data[i].overlap = -1;
            }
            
            for(var i = 0; i < global_sample_data.length; i++) {
       if (global_sample_data[i].overlap == -1) {
          for(var n = 0; n < global_sample_data.length; n++) {
             if(i != n && global_sample_data[i].x_value == global_sample_data[n].x_value
                 && global_sample_data[i].y_value == global_sample_data[n].y_value) {
                  global_sample_data[i].overlap = global_sample_data[i].id;
                  global_sample_data[n].overlap = global_sample_data[i].id;
              }
            }
          }
      }
            
            //console.log("data to plot: 1. global sample data  2. global marker");
            //console.log(global_sample_data);
			//console.log(global_marker);    
                
			
			//generate the sample data to plot
			// var sample_data = [];
// 			
// 			 for(var i = 0; i<sample_num; i++){
// 				
// 				//generate a unique sample id for each received sample
// 				sample_id = sample_id+1;
// 				//put each sample to the received_samples object, the key is the sample_id
// 				received_samples[sample_id] = data.samples[i];
// 				
// 				sample_data.push(
// 					{
// 						id: sample_id,
// 						x_value: data.samples[i][attr_x_index_to_plot],
// 					 	y_value: data.samples[i][attr_y_index_to_plot]
// 					}					
// 				);
// 			}
			
            //call scatter plot function to plot samples
			//scatter_plot(sample_data, d3.select('#chart svg'), {attr_name: attr_x_name, min_value: +attr_x_minvalue, max_value: +attr_x_maxvalue}, {attr_name: attr_y_name, min_value: +attr_y_minvalue, max_value: +attr_y_maxvalue});
			if (draw_type == 0) {
			    kemi_scatter_plot(global_sample_data, d3.select('#chart svg'), {attr_name: all_attr_info[attr_x_index_to_plot].attr_name, min_value: +all_attr_info[attr_x_index_to_plot].min_value, max_value: +all_attr_info[attr_x_index_to_plot].max_value}, {attr_name: all_attr_info[attr_y_index_to_plot].attr_name, min_value: +all_attr_info[attr_y_index_to_plot].min_value, max_value: +all_attr_info[attr_y_index_to_plot].max_value}, false);
			} else {
			    map_plot(global_sample_data, header);
			}
			
			/*
			//record grid points value
			for(var i = 0; i<grid_point_num; i++){
				//push grid points value 
				
				//grid_points.push(
				//	{
				//		x_value: data.points[i][0],
				//		y_value: data.points[i][1],
				//		label: "negative"
				//	}
				//);
				
				//push grid points value, each grid point may contain more than 2 attributes
				//grid_points is an array of objects, each object contains data_value(an array) and label
				grid_points.push(
					{
						data_value: data.points[i],
						label: "negative"
					}
				);
			
			}						
			//grid_points_plot(grid_points, d3.select('#chart svg'), {attr_name: attr_x_name, min_value: +attr_x_minvalue, max_value: +attr_x_maxvalue}, {attr_name: attr_y_name, min_value: +attr_y_minvalue, max_value: +attr_y_maxvalue});
			*/
			
		  	$("#next-iteration-btn").prop("disabled", false);
		  	$("#explore-stop-btn").prop("disabled", false);

        $("#all-relevant-objects-btn").prop("disabled", false);
        $("#switch").prop("disabled", false);
		
			
          })
          .header("Content-Type", "application/x-www-form-urlencoded")
          .post(post_str);
        document.getElementById("explore-start-btn").disabled = true;
		
	});
	
	$("#to-label-btn").on('click', function(event){
        var num_positive = 0;
        var num_negative = 0;
		for(var j=0; j<marker_from_backend.length; j++) {
		    for(var i=0; i<global_marker.length; i++) {
		        if(global_marker[i].id == marker_from_backend[j][0]) {
		            
		            if(marker_from_backend[j][1] == -1) {
		                global_marker[i].label = "negative";
		                num_negative += 1;
		            } else {
		                global_marker[i].label = "positive";
		                num_positive += 1;
		            }
		            break;
		        }
		    }
		}
		
		var chart = document.getElementById('chart' );
       chart.style.backgroundColor = 'white';
       
       $('#chart').empty();
       if (draw_type == 0) {
            d3.select('#chart')
                .append('svg')
                .attr("width", width + margin.left + margin.right )
                .attr("height", height + margin.top + margin.bottom );
            var attr_x_index_to_plot = 0;
			var attr_y_index_to_plot = 0;
            for(var j=0; j < all_attr_info.length; j++){
				if(all_attr_info[j].attr_name === $("#x-attr-name").val()){
					attr_x_index_to_plot = j;
				}
				if(all_attr_info[j].attr_name === $("#y-attr-name").val()){
					attr_y_index_to_plot = j;
				}
			}
            if (showingObject == 0) {
                kemi_scatter_plot(global_sample_data, d3.select('#chart svg'), {attr_name: all_attr_info[attr_x_index_to_plot].attr_name, min_value: +all_attr_info[attr_x_index_to_plot].min_value, max_value: +all_attr_info[attr_x_index_to_plot].max_value}, {attr_name: all_attr_info[attr_y_index_to_plot].attr_name, min_value: +all_attr_info[attr_y_index_to_plot].min_value, max_value: +all_attr_info[attr_y_index_to_plot].max_value}, false);
			}
            else 
                kemi_scatter_plot(global_objects, d3.select('#chart svg'), {attr_name: all_attr_info[attr_x_index_to_plot].attr_name, min_value: +all_attr_info[attr_x_index_to_plot].min_value, max_value: +all_attr_info[attr_x_index_to_plot].max_value}, {attr_name: all_attr_info[attr_y_index_to_plot].attr_name, min_value: +all_attr_info[attr_y_index_to_plot].min_value, max_value: +all_attr_info[attr_y_index_to_plot].max_value}, false);

			//generate grid points here 
			var x_name = all_attr_info[attr_x_index_to_plot].attr_name;
			var x_minvalue = all_attr_info[attr_x_index_to_plot].min_value;
			var x_maxvalue = all_attr_info[attr_x_index_to_plot].max_value;
			var y_name = all_attr_info[attr_y_index_to_plot].attr_name;
			var y_minvalue = all_attr_info[attr_y_index_to_plot].min_value;
			var y_maxvalue = all_attr_info[attr_y_index_to_plot].max_value;
	
			if(model_learned === true && (relevantAttributes.indexOf($("#x-attr-name").val()) > -1 || relevantAttributes.indexOf($("#y-attr-name").val()) > -1)){
				//model learned and x or y is within relevant attributes, then generate grid points and display relevant ranges
				kemi_generate_grid_points_plot(x_name, x_minvalue, x_maxvalue, y_name, y_minvalue, y_maxvalue);
		
			}
       } else if (draw_type == 1) {
            $('#tableContainer').empty();
            map_plot(global_sample_data, header);
       }
		$("#list_num_positive").text(num_positive);
			
			//initialize the number of negative-labeled samples to be 0
	    $("#list_num_negative").text(num_negative);
		
	});
	
	$("#next-iteration-btn").on('click', function(event){
        showingObject = 0;
        $('#tableContainer').empty();
	
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
		
		//console.log("old labeled samples:");
		//console.log(labeled_sample_array);
		//console.log(labeled_samples);
		
		for (var i=0; i < global_sample_data.length; i++) {
		    for (var n=0; n < global_marker.length; n++) {
		        
		        if(global_sample_data[i].id == global_marker[n].id && global_marker[n].label != "unlabel") {
		            var tmp = [];
		            
		            for(var j=0; j < all_attr_info.length; j++){
                        tmp.push(global_sample_data[i][all_attr_info[j].attr_name]);
			        }
		            
		            if(global_marker[n].label == "positive") {
		                tmp.push(1);
		            } else {
		                tmp.push(-1);
		            }
		            labeled_sample_array.push(tmp);
		            break;
		        }
		    }
		}
		
		console.log("labeled sample array to send: ");
		console.log(labeled_sample_array);
		
		
		//generate labeled samples
		var labeled_sample_json_obj = {"samples": labeled_sample_array, "stop": false};
		
		
		//build parameter string to send to server
	    var post_str = 'proxyport=' + 4446 +
			'&labelsamples=' + JSON.stringify(labeled_sample_json_obj);
	    
			
		//pass samples with labels
		//get next set of samples and grid points labels
        d3.json("next_exploration.php", function(error, data) {
			if (error)
            	return console.warn(error);
			
			
			console.log("data received in next iteration...");
			console.log(data);
			
			$("#list_accuracy").text(data.predictedAccuracy);
			
			if (typeof data.labelsFromBackEnd != 'undefined') {
			    for(var labelIdx=0; labelIdx<data.labelsFromBackEnd.length; labelIdx++) {
			        marker_from_backend.push(data.labelsFromBackEnd[labelIdx]);
			    }
            }
			//after the backend gets some labeled samples, the backend will learn a model, so model_learned will be true
			model_learned = true;
			
			//get the next set of samples and plot them 
			//data.samples
			var sample_num = data.samples.length;
			
			//global variables
			relevantAttributes = data.relevantAttributes;
			relevantAreas = data.prediction;

            predicted_query = data.predictedQuery;  // zhan: get predicted query every iteration
			
			if(relevantAttributes == ""){
				relevantAttributes = [];
			}
			
			if(relevantAreas == ""){
				relevantAreas = [];
			}
			
			//display relevant attributes and prediction areas in the well in the exploration page
			var relevant_attr_str = "<strong>Relevant Attributes</strong>: ";
			for(var i = 0; i < relevantAttributes.length - 1; i++){
				relevant_attr_str = relevant_attr_str  + relevantAttributes[i] + ", ";
			}
			if(relevantAttributes.length >= 1){
				relevant_attr_str = relevant_attr_str + relevantAttributes[relevantAttributes.length-1] + ".";
			}
			
			
			$("#predicted-relevant-attr-text").html(relevant_attr_str);
			
			var relevant_areas = "";
			//"prediction":[{"rowc":[lowB, upBound], "colc":[lowB, upBound], “third”:[min, max]},{}]
			for(var i = 0; i < relevantAreas.length; i++){
				relevant_areas = relevant_areas + "Area " + (i+1) + ":   ";
				var area_obj = relevantAreas[i];
				var first_relevant_attr = true;
				for(var key in area_obj){
					//check if the attr is the default total range
					var attr_index = -1;
          var attr_index_in_all = -1;
					
					//decide the attribute index
					for(var j=0; j < all_attr_info.length; j++){
						if(all_attr_info[j].attr_name === key){
							attr_index_in_all = j;
						}						
					}

          for(var j=0; j < relevantAttributes.length; j++){
            if(relevantAttributes[j] === key){
              attr_index = j;
              break;
            }           
          }
					
					//if(attr_index>-1 && all_attr_info[attr_index].min_value == area_obj[key][0] && all_attr_info[attr_index].max_value == area_obj[key][1]){
						//the attr range is the default total range, so not relevant attribute
						//don't print out
          if (attr_index_in_all == -1 || attr_index == -1 || (all_attr_info[attr_index_in_all].min_value == area_obj[key][0] && all_attr_info[attr_index_in_all].max_value == area_obj[key][1])) {
						continue;
					}
					
					if(first_relevant_attr == true){
						//this is the first relevant attribute
						relevant_areas = relevant_areas + area_obj[key][0] + " <= " + key + " <= " + area_obj[key][1];
						first_relevant_attr = false;
					}
					else{
						//not the first relevant attribute
						relevant_areas = relevant_areas + " AND " + area_obj[key][0] + " <= " + key + " <= " + area_obj[key][1];
						
					}
					
				}
				relevant_areas = relevant_areas + ".<br/>";
				
			}
			
			$("#predicted-relevant-areas-text").html(relevant_areas);
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
			new_samples = [];
			for(var i=0; i<sample_num; i++) {
			    var tmp = {};
			    
			    tmp.id   = data.samples[i][0];
			    tmp.lat  = data.samples[i][1];
			    tmp.long = data.samples[i][2];
			    
                for(var j=0; j < all_attr_info.length; j++){
                    tmp[all_attr_info[j].attr_name] = data.samples[i][j+3];
                    
                    tmp.x_value = data.samples[i][attr_x_index_to_plot+3],
					tmp.y_value = data.samples[i][attr_y_index_to_plot+3]
			    }
			    var turple = {id: data.samples[i][0], label: "unlabel"};
			    global_marker.push(turple);
			    tmp.overlap = -1;
			    global_sample_data.push(tmp);
			    new_samples.push(tmp.id);
            }
            
            for(var i = 0; i < global_sample_data.length; i++) {
       if (global_sample_data[i].overlap == -1) {
          for(var n = 0; n < global_sample_data.length; n++) {
             if(i != n && global_sample_data[i].x_value == global_sample_data[n].x_value
                 && global_sample_data[i].y_value == global_sample_data[n].y_value) {
                  global_sample_data[i].overlap = global_sample_data[i].id;
                  global_sample_data[n].overlap = global_sample_data[i].id;
              }
            }
          }
      }
			
			//generate the sample data to plot
			// var sample_data = [];
// 			
// 			for(var i = 0; i<sample_num; i++){
// 				
// 				//generate a unique sample id for each received sample
// 				sample_id = sample_id+1;
// 				//put each sample to the received_samples object, the key is the sample_id
// 				received_samples[sample_id] = data.samples[i];
// 				
// 				sample_data.push(
// 					{
// 						id: sample_id,
// 						x_value: data.samples[i][attr_x_index_to_plot],
// 					 	y_value: data.samples[i][attr_y_index_to_plot]
// 					}					
// 				);
// 			}
			
			//plot_more_samples(sample_data, d3.select('#chart svg'), {attr_name: all_attr_info[attr_x_index_to_plot].attr_name, min_value: +all_attr_info[attr_x_index_to_plot].min_value, max_value: +all_attr_info[attr_x_index_to_plot].max_value}, {attr_name: all_attr_info[attr_y_index_to_plot].attr_name, min_value: +all_attr_info[attr_y_index_to_plot].min_value, max_value: +all_attr_info[attr_y_index_to_plot].max_value});
			
			
		   
		   var chart = document.getElementById('chart' );
           chart.style.backgroundColor = 'white';
       
           $('#chart').empty();
           if (draw_type == 0) {
                d3.select('#chart')
                    .append('svg')
                    .attr("width", width + margin.left + margin.right )
                    .attr("height", height + margin.top + margin.bottom );

                kemi_scatter_plot(global_sample_data, d3.select('#chart svg'), {attr_name: all_attr_info[attr_x_index_to_plot].attr_name, min_value: +all_attr_info[attr_x_index_to_plot].min_value, max_value: +all_attr_info[attr_x_index_to_plot].max_value}, {attr_name: all_attr_info[attr_y_index_to_plot].attr_name, min_value: +all_attr_info[attr_y_index_to_plot].min_value, max_value: +all_attr_info[attr_y_index_to_plot].max_value}, false);
           } else if (draw_type == 1) {
                $('#tableContainer').empty();
                map_plot(global_sample_data, header);
           }
			
		   /*
			//get the grid points labels and plot them
			//data.labels
			var grid_points_num = grid_points.length;
			//check if #label == #points
			if(grid_points_num != data.labels.length){
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
			
				//plot the grid points
				kemi_grid_points_plot(grid_point_data_to_plot, d3.select('#chart svg'), {attr_name: all_attr_info[attr_x_index_to_plot].attr_name, min_value: +all_attr_info[attr_x_index_to_plot].min_value, max_value: +all_attr_info[attr_x_index_to_plot].max_value}, {attr_name: all_attr_info[attr_y_index_to_plot].attr_name, min_value: +all_attr_info[attr_y_index_to_plot].min_value, max_value: +all_attr_info[attr_y_index_to_plot].max_value});
			
			}
		   */
		   
				if(relevantAttributes.indexOf($("#x-attr-name").val()) > -1 || relevantAttributes.indexOf($("#y-attr-name").val()) > -1){

				//if the exploration space is more than 2, and both x, y attr are in relevant attr, then construct grid points in the 2d space
				var x_grid_name = all_attr_info[attr_x_index_to_plot].attr_name;
				var x_grid_minvalue = +all_attr_info[attr_x_index_to_plot].min_value;
				var x_grid_maxvalue = +all_attr_info[attr_x_index_to_plot].max_value;
				var y_grid_name = all_attr_info[attr_y_index_to_plot].attr_name;
				var y_grid_minvalue = +all_attr_info[attr_y_index_to_plot].min_value;
				var y_grid_maxvalue = +all_attr_info[attr_y_index_to_plot].max_value;
				
				kemi_generate_grid_points_plot(x_grid_name, x_grid_minvalue, x_grid_maxvalue, y_grid_name, y_grid_minvalue, y_grid_maxvalue);
				
			}
			
			
			
		})
		.header("Content-Type", "application/x-www-form-urlencoded")
		.post(post_str);
		
		 
	
	});

    $("#all-relevant-objects-btn").on('click', function(event) {

        showingObject = 1;
        global_objects = [];
        $('#tableContainer').empty();
        var post_str = 'predictedQuery=' + predicted_query;
        d3.json("get_all_relevant_objects.php", function(error, data) {
            if (error)
                return console.warn(error);
            
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
            var objects_num = data.length;
            var ul = document.getElementById('list-of-nums');
            if (document.getElementById('list_relevant_objects') == null)
                ul.innerHTML += "<li class='list-group-item'> <span class='badge' id='list_relevant_objects'>" + objects_num + "</span> Relevant Objects </li>";
            else
                $("#list_relevant_objects").text(objects_num);
            for(var i=0; i<objects_num; i++) {
                var tmp = {};

                for (var key in data[i]) {
                    tmp[key] = data[i][key];
                }
                
                tmp.x_value = data[i][all_attr_info[attr_x_index_to_plot].attr_name];
                tmp.y_value = data[i][all_attr_info[attr_y_index_to_plot].attr_name];

                tmp.overlap = -1;
                global_objects.push(tmp);
            }
            
            for(var i = 0; i < global_objects.length; i++) {
       if (global_objects[i].overlap == -1) {
          for(var n = 0; n < global_objects.length; n++) {
             if(i != n && global_objects[i].x_value == global_objects[n].x_value
                 && global_objects[i].y_value == global_objects[n].y_value) {
              
                  global_objects[i].overlap = global_objects[i].id;
                  global_objects[n].overlap = global_objects[i].id;
                }
              }
            }
          }
      
           
           var chart = document.getElementById('chart' );
           chart.style.backgroundColor = 'white';


           $('#chart').empty();
           if (draw_type == 0) {
           d3.select('#chart')
           .append('svg')
           .attr("width", width + margin.left + margin.right )
           .attr("height", height + margin.top + margin.bottom );

           kemi_scatter_plot(global_objects, d3.select('#chart svg'), {attr_name: all_attr_info[attr_x_index_to_plot].attr_name, min_value: +all_attr_info[attr_x_index_to_plot].min_value, max_value: +all_attr_info[attr_x_index_to_plot].max_value}, {attr_name: all_attr_info[attr_y_index_to_plot].attr_name, min_value: +all_attr_info[attr_y_index_to_plot].min_value, max_value: +all_attr_info[attr_y_index_to_plot].max_value}, true);
           } 
           else if (draw_type == 1) {
             $('#tableContainer').empty();
                map_plot(global_objects, header);
           }

           if(relevantAttributes.indexOf($("#x-attr-name").val()) > -1 || relevantAttributes.indexOf($("#y-attr-name").val()) > -1) {
                //if the exploration space is more than 2, and both x, y attr are in relevant attr, then construct grid points in the 2d space
                var x_grid_name = all_attr_info[attr_x_index_to_plot].attr_name;
                var x_grid_minvalue = +all_attr_info[attr_x_index_to_plot].min_value;
                var x_grid_maxvalue = +all_attr_info[attr_x_index_to_plot].max_value;
                var y_grid_name = all_attr_info[attr_y_index_to_plot].attr_name;
                var y_grid_minvalue = +all_attr_info[attr_y_index_to_plot].min_value;
                var y_grid_maxvalue = +all_attr_info[attr_y_index_to_plot].max_value;
                
                kemi_generate_grid_points_plot(x_grid_name, x_grid_minvalue, x_grid_maxvalue, y_grid_name, y_grid_minvalue, y_grid_maxvalue);
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
			
			//set exploration_started to false
			exploration_started = false;
			
			//go to the first page
			window.location.href = "connect.php";
		
		})
		.header("Content-Type", "application/x-www-form-urlencoded")
		.post(post_str);
		
	});
	
	
	
}


$(plot_init);