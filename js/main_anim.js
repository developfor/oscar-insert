(function(window, document, undefined){

var dataInsertPie = function(){

    var margin = {top: 0, right: 5, bottom: 0, left: 5},
    width = 270 - margin.left - margin.right,
    height = 220 - margin.top - margin.bottom,
    padding = 0,
    radius = Math.min(width, height) / 2,
    outerR = radius - padding,
    innterR = 0,
    domainStart = 0,
    color1 = '#1ba68c',
    color2 = '#97BF3F',
    highlight = '#F2522E',
    bgColor = 'white',
    textColor = 'black',
    textColorHighlight = 'white',
    toggleSpeed = 300;

    var arc = d3.svg.arc()
        .outerRadius(outerR)
        .innerRadius(innterR);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.gross_num; });

    var svg = d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height)
    .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    d3.json("../data/oscar2.json", function(error, data) {
        if (error) { 
            console.log("there is an error loading data " + error); //Log the error.
        } 
        else {
            var dataLength = data.length;
            update(data, dataLength);
            clickInfo();
        }
    });

    var update = function(data, dataLength){

        var color = d3.scale.linear()
        .domain([domainStart, dataLength])
        .range([color1, color2]); 

        var currentColor,
        colorArray = [],
        picked,
        current_data = "gross_num";
    
        data.forEach(function(d) {
            d.gross_num = +d.gross_num;
        });



          var path = svg.datum(data).selectAll("path")
      .data(pie)
    .enter().append("path")
      .style("fill", function(d) { 
                colorArray.push(color(d.data.id)); 
                return color(d.data.id); 
            })
        .attr('class', 'arc pie')
      .attr("id", function(d){ return d.data.tag})
      .attr("d", arc)
      .each(function(d) { this._current = d; })
      .on("mouseover", function(d) {
                picked = "." + this.id;

                $(picked).css('background-color', highlight)
                    .css('color', 'white');
            
                currentColor = d3.select(this).style('fill');

                d3.select(this).style("fill", highlight);
            })
            .on("mouseout", function(){
                d3.select(this).style("fill", currentColor);
                $(picked).css('background-color', bgColor)
                    .css('color', textColor);
            });

          $('#gross_num, #budget_num').on('click', function(){
            change(this.id);

            tabulate(data, colorArray, this.id);

            if(this.id =='gross_num'){
                $('#subtitle').text("Worldwide Gross (U.S. Dollars)");
            }else{
                $('#subtitle').text("Film Budget");
            }

        })

        function change(values) {
    
            var value = values;

            pie.value(function(d) { return d[value]; }); // change the value function
            path = path.data(pie); // compute the new angles
            path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs

        }

        tabulate(data, colorArray, current_data);
    }

    var tabulate = function (data, colors, current_data) {
        var cTable = $('#table-body');
        
        $(cTable).empty()

        var table = $('<table></table>');

        $.each(data, function(i){

            var row = $('<tr></tr>').addClass('ui-menu-item').addClass(data[i].tag);

            var col = $('<td></td>').text(" ").css("background-color", colors[i]);
            row.append(col);

            col = $('<td></td>').text(data[i].name);
            row.append(col);

            if(current_data === "gross_num"){
                col = $('<td></td>').text("$" + numberWithCommas(data[i].gross_num));
            }else{
                if(data[i].budget_num === 0){
                    col = $('<td></td>').text("Not Known");
                }else{
                    col = $('<td></td>').text("$" + numberWithCommas(data[i].budget_num));
                }
            }
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
        
            $(this).css('background-color', highlight)
                    .css('color', 'white');

            dPicked.style('fill', highlight)
        }).on('mouseout', function(d){
            dPicked.style('fill', currentColor);
            $(this).css('background-color', textColorHighlight)
                .css('color', textColor);
        })
    }

    function clickInfo(){
        var last;
        $('#info-button, #embed-button, #embed-close, #info-close').on('click', function(){
            var current = $(this).attr("id").split('-')[0];
            current += "-text";
            toggles(current, last)
            last = current;
        })
    }

    function toggles(picked, last){

        $('#country-info ul').hide();

        if($('#info-dropdown').is(':visible')){
            if(picked === last){
                $('#info-dropdown').slideToggle(toggleSpeed);
            }else{

                $('#info-dropdown').slideToggle(toggleSpeed, function(){
                    $('#info-text').hide();
                    $('#embed-text').hide();
                    $('#'+picked).show();
                    $('#info-dropdown').slideToggle(toggleSpeed);
                });
            }
        }else{
            $('#info-text').hide();
            $('#embed-text').hide();
            $('#'+picked).show();
            $('#info-dropdown').slideToggle(toggleSpeed);
        }
    }

    function numberWithCommas(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    function arcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return arc(i(t));
  };
}   
};

dataInsertPie();

})(this, document);