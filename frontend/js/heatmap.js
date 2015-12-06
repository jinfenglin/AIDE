
var margin = {top: 10, right: 20, bottom: 40, left: 60},
width = 540 - margin.left - margin.right,
height = 510 - margin.top - margin.bottom;

//cells is a 2-d array, each element is {row: 4, col: 5, numPoints: 349, x_range:{min_value:2.5, max_value: 9.5}, y_range:{min_value:1.9, max_value:7.4}}
var cells = null,
raw_data = [],
color = d3.interpolateRgb("#fff", "#c09");


var selectCell = function(cell) {
  d3.select(cell).attr("stroke", "#f00").attr("stroke-width", 2);

  //cell.parentNode.parentNode.appendChild(cell.parentNode);
  //cell.parentNode.appendChild(cell);
};

var deselectCell = function(cell) {
  d3.select(cell).attr("stroke", "#fff").attr("stroke-width", 1);
};

var onCellOver = function(cell, data) {
  selectCell(cell);

};

var onCellOut = function(cell, data) {
  deselectCell(cell);

};


var getData = function(attr_name, bkt_num, value_range){
// attr_name: {x:"rowc", y:"colc"},
// bkt_num: {x:5, y:5},
// value_range: {x:{min_value: 400, max_value: 600}, y:{min_value: 800, max_value: 1000}}

raw_data = [];

  // if (cells === null) {
  //   cells = getEmptyCells();
  // }
  // else {
  //   clearCells();
  // }

  var post_str = 'xname=' + attr_name.x +
                '&yname=' + attr_name.y +
                '&xbktnum=' + bkt_num.x +
                '&ybktnum=' + bkt_num.y +
                '&xmin=' + value_range.x.min_value +
                '&xmax=' + value_range.x.max_value +
                '&ymin=' + value_range.y.min_value +
                '&ymax=' + value_range.y.max_value;

  //console.log(post_str);

  var bkt_width = (value_range.x.max_value - value_range.x.min_value)/bkt_num.x;
  var bkt_height = (value_range.y.max_value - value_range.y.min_value)/bkt_num.y;

  d3.json("heatmap_data_range.php", function(error, data) {
    if (error)
      return console.warn(error);



      data.forEach(function(d) {

        raw_data.push({
          row: +d.row_num,
          col: +d.col_num,
          numPoints: +d.num_points,
          width: bkt_width,
          height: bkt_height,
          x_range: {min_value: (+d.col_num - 1)*bkt_width, max_value: (+d.col_num)*bkt_width},
          y_range: {min_value: (+d.row_num - 1)*bkt_height, max_value: (+d.row_num)*bkt_height}
        });

      });

      //convert raw_data to cells
      cells = raw_data;

      //plot heatmap chart
      createHeatchart(attr_name, bkt_num, value_range);

    })
    .header("Content-Type", "application/x-www-form-urlencoded")
    .post(post_str);



};


var createHeatchart = function(attr_name, bkt_num, value_range) {
  // attr_name: {x:"rowc", y:"colc"},
  // bkt_num: {x:5, y:5},
  // value_range: {x:{min_value: 400, max_value: 600}, y:{min_value: 800, max_value: 1000}}


  var x = d3.scale.linear()
  .range([0, width]);

  var y = d3.scale.linear()
  .range([height, 0]);


  //get min and max of number of points
  var min = 9999999;
  var max = -9999999;
  var l;

  // for (var rowNum = 0; rowNum < cells.length; rowNum++) {
  //   for (var colNum = 0; colNum < numCols; colNum++) {
  //     l = cells[rowNum][colNum].points.length;
  //
  //     if (l > max) {
  //       max = l;
  //     }
  //     if (l < min) {
  //       min = l;
  //     }
  //   }
  // }

  for(var cellnum = 0; cellnum < cells.length; cellnum++ ){

    l = cells[cellnum].numPoints;

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


  var heatchart = d3.select("div#heatchart").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //console.log(cells);

  heatchart.selectAll("rect")
  .data(cells)
  .enter()
  .append("rect")
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
    return height - y(d.height + value_range.y.min_value);
  })
  .attr("fill", function(d, i) {
    return color((d.numPoints - min) / (max - min));
  })
  .attr("stroke", "#fff")
  .attr("stroke-width", 1)
  .attr("cell", function(d) {
    return "r" + d.row + "c" + d.col;
  })
  .on("mouseover", function(d) {
    onCellOver(this, d);
  }).on("mouseout", function(d) {
    onCellOut(this, d);
  });

  //add x axis
  heatchart.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.svg.axis()
  .scale(x)
  .orient("bottom"));

  // Add the text label for the x axis
  heatchart.append("text")
  .attr("transform", "translate(" + width + " ," + (height + margin.bottom) + ")")
  .style("text-anchor", "end")
  .text(attr_name.x + " Value");

  //add y axis
  heatchart.append("g")
  .attr("class", "y axis")
  .call(d3.svg.axis()
  .scale(y)
  .orient("left"));

  //Add the text label for the Y axis
  heatchart.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", (-1)*margin.left)
  .attr("x", -5)
  .attr("dy", "1em")
  .style("text-anchor", "end")
  .text(attr_name.y + " Value");


};



var init = function(){

  getData({x:"rowc", y:"colc"}, {x:5, y:5}, {x:{min_value: 400, max_value: 600}, y:{min_value: 800, max_value: 1000}});
  //createHeatchart({x:"rowc", y:"colc"}, {x:5, y:5}, {x:{min_value: 400, max_value: 600}, y:{min_value: 800, max_value: 1000}});

};

$(init);
