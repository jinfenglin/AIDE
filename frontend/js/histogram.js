// var margin = {top: 20, right: 30, bottom: 30, left: 40},
// width = 590 - margin.left - margin.right,
// height = 400 - margin.top - margin.bottom;
//
// var x = d3.scale.ordinal()
// .rangeRoundBands([0, width], .1);
//
// var y = d3.scale.linear()
// .range([height, 0]);
//
// var xAxis = d3.svg.axis()
// .scale(x)
// .orient("bottom");
//
// var yAxis = d3.svg.axis()
// .scale(y)
// .orient("left");
//
// var chart = d3.select("#chartContainer1").append("svg")
// .attr("width", width + margin.left + margin.right)
// .attr("height", height + margin.top + margin.bottom)
// .append("g")
// .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//
// d3.tsv("data.tsv", type, function(error, data) {
//   x.domain(data.map(function(d) { return d.name; }));
//   y.domain([0, d3.max(data, function(d) { return d.value; })]);
//
//   chart.append("g")
//   .attr("class", "x axis")
//   .attr("transform", "translate(0," + height + ")")
//   .call(xAxis);
//
//   chart.append("g")
//   .attr("class", "y axis")
//   .call(yAxis);
//
//   chart.selectAll(".bar")
//   .data(data)
//   .enter().append("rect")
//   .attr("class", "bar")
//   .attr("x", function(d) { return x(d.name); })
//   .attr("y", function(d) { return y(d.value); })
//   .attr("height", function(d) { return height - y(d.value); })
//   .attr("width", x.rangeBand());
// });
//
// function type(d) {
//   d.value = +d.value; // coerce to number
//   return d;
// }

// *****************************************
var margin = {top: 10, right: 20, bottom: 20, left: 60},
legend_width = 100,
width = 590 - margin.left - margin.right - legend_width,
height = 400 - margin.top - margin.bottom;

d3.select("#chartContainer1").append("svg")
.attr("width", width + margin.left + margin.right + legend_width)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scale.linear()
.range([0, width]);

var y = d3.scale.linear()
.range([height, 0]);

// x.domain([0, 20]);
// y.domain([0, 15]);
//
// data = [  {"x":8.2, "y":7.3},
//           {"x":12.3, "y":4.3},
//           {"x":14.1, "y":11.3}
//        ];
//
// //debugger;
//
// //d3.select("#chartContainer1 svg g").selectAll("circle")
// svg1.selectAll("circle")
//    .data(data)
//    .enter()
//    .append("circle")
//    .attr("cx", function(d){return x(d.x);})
//    .attr("cy", function(d){return y(d.y);})
//    .attr("r", 10);
//
//  //debugger;
//
//  svg1.append("g")
//  .attr("class", "x axis")
//  .attr("transform", "translate(0," + height + ")")
//  .call(d3.svg.axis()
//  .scale(x)
//  .orient("bottom"));
//
//  svg1.append("g")
//  .attr("class", "y axis")
//  .call(d3.svg.axis()
//  .scale(y)
//  .orient("left"));


d3.csv("income.csv", function(bins) {

  // Coerce types.
  bins.forEach(function(bin) {
    bin.Income = +bin.Income;
    bin.People = +bin.People;
  });

  // Normalize each bin to so that height = quantity/width;
  // see http://en.wikipedia.org/wiki/Histogram#Examples
  for (var i = 1, n = bins.length, bin; i < n; i++) {
    bin = bins[i];
    bin.offset = bins[i - 1].Income;
    bin.width = bin.Income - bin.offset;
    bin.height = bin.People / bin.width;
  }

  // Drop the first bin, since it's incorporated into the next.
  bins.shift();

  // Set the scale domain.
  x.domain([0, d3.max(bins.map(function(d) { return d.offset + d.width; }))]);
  y.domain([0, d3.max(bins.map(function(d) { return d.height; }))]);

  // Add the bins.
  d3.select("#chartContainer1 svg g").selectAll(".bin2")
  .data(bins)
  .enter().append("rect")
  .attr("class", "bin2")
  .attr("x", function(d) { return x(d.offset); })
  .attr("width", function(d) { return x(d.width) - 1; })
  .attr("y", function(d) { return y(d.height); })
  .attr("height", function(d) { return height - y(d.height); });

  d3.select("#chartContainer1 svg g").append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.svg.axis()
  .scale(x)
  .orient("bottom"));

  d3.select("#chartContainer1 svg g").append("g")
  .attr("class", "y axis")
  .call(d3.svg.axis()
  .scale(y)
  .orient("left"));

});

var color = d3.scale.linear().domain([600, 400, 200, 0]).range(["red", "yellow", "green", "blue"]);
var value_range = d3.scale.linear().domain([0,600]).range([2*height/3, 0]);
var list = []
for(var i = 0; i<=600; i++){
	list.push(i);
}

d3.select("#chartContainer1 svg").append("g")
.attr("transform", "translate(" + (margin.left+width) + "," + margin.top + ")")
.selectAll("rect")
.data(list)
.enter()
.append("rect")
.attr("x", 0)
.attr("width", legend_width/2)
.attr("y", function(d){return value_range(d);})
.attr("height", 1)
.attr("fill", function(d){return color(d)});

d3.select("#chartContainer1 svg").append("g")
.attr("class", "y axis")
.attr("transform", "translate(" + (margin.left+width + legend_width/2 + 2) + "," + (margin.top + 1) + ")")
.call(d3.svg.axis()
.scale(value_range)
.orient("right"));



// ********************************************

var margin2 = {top: 10, right: 20, bottom: 20, left: 60},
width2 = 590 - margin2.left - margin2.right,
height2 = 400 - margin2.top - margin2.bottom;


var x2 = d3.scale.linear()
.range([0, width2]);

var y2 = d3.scale.linear()
.range([height2, 0]);


d3.select("#chartContainer2").append("svg")
.attr("width", width2 + margin2.left + margin2.right)
.attr("height", height2 + margin2.top + margin2.bottom)
.append("g")
.attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");


d3.csv("income.csv", function(bins) {

  // Coerce types.
  bins.forEach(function(bin) {
    bin.Income = +bin.Income;
    bin.People = +bin.People;
  });

  // Normalize each bin to so that height = quantity/width;
  // see http://en.wikipedia.org/wiki/Histogram#Examples
  for (var i = 1, n = bins.length, bin; i < n; i++) {
    bin = bins[i];
    bin.offset = bins[i - 1].Income;
    bin.width = bin.Income - bin.offset;
    bin.height = bin.People / bin.width;
  }

  // Drop the first bin, since it's incorporated into the next.
  bins.shift();

  // Set the scale domain.
  x2.domain([0, d3.max(bins.map(function(d) { return d.offset + d.width; }))]);
  y2.domain([0, d3.max(bins.map(function(d) { return d.height; }))]);

  // Add the bins.
  d3.select("#chartContainer2 svg g").selectAll(".bin2")
  .data(bins)
  .enter().append("rect")
  .attr("class", "bin2")
  .attr("x", function(d) { return x2(d.offset); })
  .attr("width", function(d) { return x2(d.width) - 1; })
  .attr("y", function(d) { return y2(d.height); })
  .attr("height", function(d) { return height2 - y2(d.height); });

  d3.select("#chartContainer2 svg g").append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height2 + ")")
  .call(d3.svg.axis()
  .scale(x2)
  .orient("bottom"));

  d3.select("#chartContainer2 svg g").append("g")
  .attr("class", "y axis")
  .call(d3.svg.axis()
  .scale(y2)
  .orient("left"));

});

// x.domain([0, 20]);
// y.domain([0, 15]);
//
// data = [  {"x":8.2, "y":7.3},
// {"x":12.3, "y":4.3},
// {"x":14.1, "y":11.3}
// ];
//
// //debugger;
//
// svg2.selectAll("circle")
// .data(data)
// .enter()
// .append("circle")
// .attr("cx", function(d){return x(d.x);})
// .attr("cy", function(d){return y(d.y);})
// .attr("r", 10);
//
//
// svg2.append("g")
//   .attr("class", "x axis")
//   .attr("transform", "translate(0," + height + ")")
//   .call(d3.svg.axis()
//   .scale(x)
//   .orient("bottom"));
//
// svg2.append("g")
//     .attr("class", "y axis")
//     .call(d3.svg.axis()
//     .scale(y)
//     .orient("left"));
