

var margin = {top: 10, right: 20, bottom: 40, left: 60},
width = 510 - margin.left - margin.right,
height = 350 - margin.top - margin.bottom;

//
var histbar_mouseOn = function() {

  var rectangle = d3.select(this);

  rectangle.transition()
  .duration(800).style("opacity", 0.8)
  .style("fill", "red")
  .ease("elastic");


};

var histbar_mouseOff = function() {

  var rectangle = d3.select(this);

  // go back to original size and opacity
  rectangle.transition()
  .duration(800).style("opacity", 1)
  .style("fill", "steelblue")
  .ease("elastic");


};


function width_draw(data, minvalue, maxvalue){

  var x = d3.scale.linear()
  .range([0, width]);

  var y = d3.scale.linear()
  .range([height, 0]);

  //convert string to number in each datum
  data.forEach(function(d) {
    d.groupid = +d.groupid;
    d.min_value = +d.min_value;
    d.max_value = +d.max_value;
    d.total_count = +d.total_count;
  });

  //sort data according to groupid ascendingly
  data.sort(function(a, b){return a.groupid-b.groupid});

  //some buckets are missing(has zero items in it), we need to find out
  var bucket_number = +($('#histogram-bucketnum').val());

  var datum_number = data.length;

  //add missing buckets into the data array
  if(datum_number<bucket_number){    //there are some bucket missing

    for(var idx = 0; idx<bucket_number; idx++){

      if(idx <= datum_number-1 && data[idx].groupid === idx+1 ){   //the datum is in the correct position
        continue;
      }
      else if (idx <= datum_number-1 && data[idx].groupid > idx+1){  //there is a datum missing
        data.splice(idx,0,{"groupid": idx+1, "total_count": 0});
        datum_number = datum_number + 1;
      }
      else {    //idx >  datum_number-1
        data.splice(idx,0,{"groupid": idx+1, "total_count": 0});
        datum_number = datum_number + 1;
      }

    }

  }

  //debugger;

  // set width and height of each bucket,
  // width is equal and  height = count/width;

  var range_max, range_min;

  if(minvalue === "" || maxvalue === ""){  //no range value specified
    range_max = d3.max(data.map(function(d) { return d.max_value; }));
    range_min = d3.min(data.map(function(d) { return d.min_value; }));
  }
  else {
    range_max = +(maxvalue);
    range_min = +(minvalue);
  }

  var bucket_width = (range_max - range_min)/bucket_number;
  var yscale = $("#histogram-yscale").val();

  for (var i = 0, start = range_min, bin; i < bucket_number; i++) {
    bin = data[i];
    bin.offset = start;
    bin.width = bucket_width;
    start = start + bucket_width;
    if(yscale === "linear"){

      bin.height = bin.total_count/bucket_width;
    }
    else if (yscale === "log10" && bin.total_count > 0){
      bin.height = Math.log10(bin.total_count/bucket_width);
    }
    else if (yscale === "log10" && bin.total_count == 0){
      bin.height = 0;
    }

  }

  // Set the scale domain.
  x.domain([range_min, range_max]);
  y.domain([0, d3.max(data.map(function(d) { return d.height; }))]);


  //debugger;

  d3.select("#histogram-width-chart svg g").selectAll(".widthBar")
  .data(data)
  .enter().append("rect")
  .attr("class", "widthBar")
  .attr("x", function(d) { return x(d.offset); })
  .attr("width", function(d) { return x(d.width + range_min); })
  .attr("y", function(d) { return y(d.height); })
  .attr("height", function(d) { return height - y(d.height); })
  .attr("stroke", "#fff");

  d3.select("#histogram-width-chart svg g")
  .selectAll("rect")
  .on("mouseover", histbar_mouseOn)
  .on("mouseout", histbar_mouseOff)
  .append("title")
  .text(function(d) {
    return "Count: " + d.total_count + "<br/> Range: " + 
	  Math.round(d.offset*100)/100 + " ~ " + Math.round((d.offset+d.width)*100)/100 + 
	  "<br/> Density: " + Math.round(d.total_count/d.width*100)/100;
  });
  
  $(".widthBar").tipsy({ gravity: 's', html: true});	

  //add x axis
  d3.select("#histogram-width-chart svg g")
  .append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.svg.axis()
  .scale(x)
  .ticks(8)
  .orient("bottom"));

  // Add the text label for the x axis
  d3.select("#histogram-width-chart svg g")
  .append("text")
  .attr("transform", "translate(" + width + " ," + (height + margin.bottom - 5) + ")")
  .style("text-anchor", "end")
  .text($("#histogram-attr").val());

  //add y axis
  d3.select("#histogram-width-chart svg g")
  .append("g")
  .attr("class", "y axis")
  .call(d3.svg.axis()
  .scale(y)
  .ticks(8)
  .orient("left"));

  //Add the text label for the Y axis
  d3.select("#histogram-width-chart svg g")
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 5)
  .attr("x", -5)
  .attr("dy", "1em")
  .style("text-anchor", "end")
  .text("Density");


}



function depth_draw(data, minvalue, maxvalue){

  var x = d3.scale.linear()
  .range([0, width]);

  var y = d3.scale.linear()
  .range([height, 0]);

  //convert string to number in each datum
  data.forEach(function(d) {
    d.groupid = +d.groupid;
    d.min_value = +d.min_value;
    d.max_value = +d.max_value;
    d.total_count = +d.total_count;
  });

  //sort data according to groupid ascendingly
  data.sort(function(a, b){return a.groupid-b.groupid});

  //some buckets are missing(has zero items in it), we need to find out
  var bucket_number = +($('#histogram-bucketnum').val());

  var datum_number = data.length;

  //add missing buckets into the data array
  //  if(datum_number<bucket_number){    //there are some bucket missing
  //
  //    for(var idx = 0; idx<bucket_number; idx++){
  //
  //      if(idx <= datum_number-1 && data[idx].groupid === idx+1 ){   //the datum is in the correct position
  //        continue;
  //      }
  //      else if (idx <= datum_number-1 && data[idx].groupid > idx+1){  //there is a datum missing
  //        data.splice(idx,0,{"groupid": idx+1, "total_count": 0});
  //        datum_number = datum_number + 1;
  //      }
  //      else {    //idx >  datum_number-1
  //        data.splice(idx,0,{"groupid": idx+1, "total_count": 0});
  //        datum_number = datum_number + 1;
  //      }
  //
  //    }
  //
  //  }

  //debugger;

  // set width and height of each bucket,
  // width is equal and  height = count/width;


  var range_max, range_min;

  if(minvalue === "" || maxvalue === ""){  //no range value specified
    range_max = d3.max(data.map(function(d) { return d.max_value; }));
    range_min = d3.min(data.map(function(d) { return d.min_value; }));
  }
  else {
    range_max = +(maxvalue);
    range_min = +(minvalue);
  }

  //var bucket_width = (range_max - range_min)/bucket_number;

  var yscale = $("#histogram-yscale").val();

  for (var i = 0, start = range_min, bin; i < bucket_number -1; i++) {
    bin = data[i];
    bin.offset = start;
    bin.width = (bin.max_value + data[i+1].min_value)/2 - bin.offset;
    start = start + bin.width;
    if(yscale === "linear"){
      bin.height = bin.total_count/bin.width;
    }
    else if (yscale === "log10" && bin.total_count > 0){
      bin.height = Math.log10(bin.total_count/bin.width);
    }
    else if (yscale === "log10" && bin.total_count == 0){
      bin.height = 0;
    }

  }
  data[bucket_number-1].offset = start;
  data[bucket_number-1].width = range_max - data[bucket_number-1].offset;
  if(yscale === "linear"){
    data[bucket_number-1].height = data[bucket_number-1].total_count/data[bucket_number-1].width;
  }
  else if (yscale === "log10" && data[bucket_number-1].total_count > 0){
    data[bucket_number-1].height = Math.log10(data[bucket_number-1].total_count/data[bucket_number-1].width);
  }
  else if (yscale === "log10" && data[bucket_number-1].total_count == 0){
    data[bucket_number-1].height = 0;
  }


  // Set the scale domain.
  x.domain([range_min, range_max]);
  y.domain([0, d3.max(data.map(function(d) { return d.height; }))]);


  //debugger;

  d3.select("#histogram-depth-chart svg g").selectAll(".depthBar")
  .data(data)
  .enter().append("rect")
  .attr("class", "depthBar")
  .attr("x", function(d) { return x(d.offset); })
  .attr("width", function(d) { return x(d.width + range_min); })
  .attr("y", function(d) { return y(d.height); })
  .attr("height", function(d) { return height - y(d.height); })
  .attr("stroke", "#fff");

  d3.select("#histogram-depth-chart svg g")
  .selectAll("rect")
  .on("mouseover", histbar_mouseOn)
  .on("mouseout", histbar_mouseOff)
  .append("title")
  .text(function(d) {
    return "Count: " + d.total_count + "<br/> Range: " + 
	  Math.round(d.offset*100)/100 + " ~ " + Math.round((d.offset+d.width)*100)/100 + 
	  "<br/> Density: " + Math.round(d.total_count/d.width*100)/100;
  });
  
  $(".depthBar").tipsy({ gravity: 's', html: true});	
  

  //add x axis
  d3.select("#histogram-depth-chart svg g")
  .append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.svg.axis()
  .scale(x)
  .ticks(8)
  .orient("bottom"));

  // Add the text label for the x axis
  d3.select("#histogram-depth-chart svg g")
  .append("text")
  .attr("transform", "translate(" + width + " ," + (height + margin.bottom - 5) + ")")
  .style("text-anchor", "end")
  .text($("#histogram-attr").val());

  //add y axis
  d3.select("#histogram-depth-chart svg g")
  .append("g")
  .attr("class", "y axis")
  .call(d3.svg.axis()
  .scale(y)
  .ticks(8)
  .orient("left"));

  //Add the text label for the Y axis
  d3.select("#histogram-depth-chart svg g")
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 5)
  .attr("x", -5)
  .attr("dy", "1em")
  .style("text-anchor", "end")
  .text("Density");


}
