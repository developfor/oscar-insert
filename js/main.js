(function(window, document, undefined){

    var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 253 - margin.left - margin.right,
    height = 220 - margin.top - margin.bottom,
    padding = 0,
    radius = Math.min(width, height) / 2;

   var color = d3.scale.linear()
      .domain([0, 9])
      .range(['#1ba68c', '#97BF3F']); 

    var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.gross_num; });

    var svg = d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height)
    .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    d3.json("../data/oscar.json", function(error, data) {
        if (error) { 
            console.log("there is an error loading data " + error); //Log the error.
        } 
        else {
            update(data);
            clickInfo();
        }
    });

var update = function(data){

    var currentColor,
    colorArray = [],
    picked;
    
    data.forEach(function(d) {
        d.gross_num = +d.gross_num;
    });

    var g = svg.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d) { colorArray.push(color(d.data.id)); return color(d.data.id); })
        .attr("class", "pie")
        .attr("id", function(d){ return d.data.tag})
        .on("mouseover", function(d) {

            picked = this.id;
            picked = "." + picked;

            $(picked).css('background-color', '#F2522E')
                .css('color', 'white');
            
            currentColor = d3.select(this).style('fill');

            d3.select(this).style("fill", "#F2522E");
        })
        .on("mouseout", function(){
            d3.select(this).style("fill", currentColor);
            $(picked).css('background-color', 'white')
                .css('color', 'black');
        });

    tabulate(data, colorArray);
}

var tabulate = function (data, colors) {
    var cTable = $('#table-body');

    $(cTable).empty()

    var table = $('<table></table>');

    $.each(data, function(i){
        var row = $('<tr></tr>').addClass('ui-menu-item').addClass(data[i].tag);

        var col = $('<td></td>').addClass('one' ).text(" ").css("background-color", colors[i]);
        row.append(col);

        col = $('<td></td>').addClass('two').text(data[i].name);
        row.append(col);

        col = $('<td></td>').addClass('three').text(data[i].gross_dollar);
        row.append(col);

        table.append(row);

    })

    $('#table-body').append(table);
    overTable(data);
}

var overTable = function(data){
    var currentColor,
    dPicked;
    $('.ui-menu-item').on('mouseover', function(d){
        dPicked = $(this).attr("class").split(' ')[1];
        dPicked = d3.select("#" + dPicked);
        currentColor = dPicked.style('fill');
        
        $(this).css('background-color', '#F2522E')
                .css('color', 'white');

        dPicked.style('fill', "#F2522E")
  }).on('mouseout', function(d){
        dPicked.style('fill', currentColor);
        $(this).css('background-color', 'white')
                .css('color', 'black');
  })
}


function clickInfo(){
var last;
$('#info-button, #embed-button, #embed-close, #info-close').on('click', function(){
    console.log('hi')
  var current = $(this).attr("id").split('-')[0];
  current += "-text";
  toggles(current, last)
  last = current;
})
}//END OF CLICKINFO

function toggles(picked, last){

  $('#country-info ul').hide();

if($('#info-dropdown').is(':visible')){

  if(picked === last){
    $('#info-dropdown').slideToggle(300);
  }else{

    $('#info-dropdown').slideToggle(300, function(){
      $('#info-text').hide();
        $('#embed-text').hide();
        $('#'+picked).show();
        $('#info-dropdown').slideToggle(300);
      });
  }
}else{
  $('#info-text').hide();
     $('#embed-text').hide();
     $('#'+picked).show();
     $('#info-dropdown').slideToggle(300);
}
}

})(this, document);