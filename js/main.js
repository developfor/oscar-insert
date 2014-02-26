(function(window, document, undefined){

var dataInsertPie = function(){

    //variables for svg proportions
    var margin = {top: 0, right: 5, bottom: 0, left: 5},
    width = 270 - margin.left - margin.right,
    height = 220 - margin.top - margin.bottom,
    padding = 0,
    radius = Math.min(width, height) / 2;
    //variables for d3 elements
    var outerR = radius - padding,
    innterR = 50,
    domainStart = 0,
    color1 = '#453020',
    color2 = '#5F381E',
    color3 = '#885134',
    color4 = '#A74327',
    color5 = '#CF794D',
    color6 = '#EEA37C',
    color7 = '#E5AB63',
    color8 = '#EAA961',
    color9 = '#EBC177',
    highlight = '#2E5879';
    //variables for table
    var bgColor = 'white',
    textColor = 'black',
    textColorHighlight = 'white',
    tableHeight = 140;
    //variables for info toggles
    var toggleSpeed = 300,
    isAnimate = 1;

    //d3 set up for pie chart
    var arc = d3.svg.arc()
        .outerRadius(outerR)
        .innerRadius(innterR);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.gross_num; });

    var color = d3.scale.ordinal()
    .range([color1, color2, color3, color4, color5, color6, color7, color8, color9]);

    var svg = d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height)
    .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    //import data
    d3.json("data/oscar.json", function(error, data) {
        if (error) { 
            console.log("there is an error loading data " + error); //Log the error.
        } 
        else {
            var dataLength = data.length;
            //call the function to create the pie chart
            update(data, dataLength);
            //call to function for the toggle information
            clickInfo();
        }

        // button click select highlight 
        $("#gross_num").addClass("button-select");

        $("#budget_num").on("click", function(){
            $(".button").removeClass("button-select");
            $("#budget_num").addClass("button-select");
        });

        $("#gross_num").on("click", function(){
            $(".button").removeClass("button-select");
            $("#gross_num").addClass("button-select");
        });
    });

    //function creates and updates the pie chart
    var update = function(data, dataLength){

        var currentColor,
        colorArray = [],
        picked,
        current_data = "gross_num";

        //converts gross_num to a number
        data.forEach(function(d) {
            d.gross_num = +d.gross_num;
        });

        //create the pie chart
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
                //get a class name from the mouseover section
                picked = "." + this.id;

                //highlight the row in the table that matches mouseover section
                $(picked).css('background-color', highlight)
                    .css('color', 'white');
            
                //get the current color of the mouseover section
                currentColor = d3.select(this).style('fill');

                //change the current mouseover section color to the highlight color
                d3.select(this).style("fill", highlight);
            })
            .on("mouseout", function(){
                //change the mouseover section color back from hightlight color
                d3.select(this).style("fill", currentColor);
                //change the hightlight color of the table back
                $(picked).css('background-color', bgColor)
                    .css('color', textColor);
            });

            //click function to go between the gross and budget data
            $('#gross_num, #budget_num').on('click', function(){
                //call to the change function that gets the new pie values
                change(this.id);
                //call to the table function to change the table data
                tabulate(data, colorArray, this.id);

                //change the subtitle under Best Picture Nominees
                if(this.id =='gross_num'){
                    $('#subtitle').text("Worldwide Gross (U.S. Dollars)");
                }else{
                    $('#subtitle').text("Film Budget (U.S. Dollars)");
            }
    })//END OF UPDATE FUNCTION

        //changes the data values for pie and redraws it
        function change(values) {

            var value = values;

            pie.value(function(d) { return d[value]; }); // change the value function
            path = path.data(pie); // compute the new angles
            path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs

        }
        //call the table creation function
        tabulate(data, colorArray, current_data);
    }//END OF CHANGE FUCNCTION

    var tabulate = function (data, colors, current_data) {
        var cTable = $('#table-body'); //holds the table id
        
        $(cTable).empty() //empties the table

        var table = $('<table></table>'); //creates a table

        $(table).css('height', tableHeight); //makes the height of the table

        //adds rows and columns to the table for each bit of data

        $.each(data, function(i){

            var row = $('<tr></tr>').addClass('ui-menu-item').addClass(data[i].tag);//creates row

            var col = $('<td></td>').text(" ").css("background-color", colors[i]);//creates column color
            row.append(col); //appends column to row

            col = $('<td></td>').text(data[i].name); //creates column film name
            row.append(col);    //appends column to row

            //adds $ and commas to money amounts
            if(current_data === "gross_num"){
                col = $('<td></td>').text("$" + numberWithCommas(data[i].gross_num));//creates column money
            }else{
                col = $('<td></td>').text("$" + numberWithCommas(data[i].budget_num));//creates column money
            }
            row.append(col);//adds column to row

            table.append(row);//adds row to table
        })
        //adds table to page
        $(cTable).append(table);
        overTable(data);//call to mouseover function for the table
    }//END OF TABULATE FUNCTION

    //function that highlights pie and table on mouseover of a table entry
    var overTable = function(data){
        var currentColor,
        dPicked;
        $('.ui-menu-item').on('mouseover', function(d){
            dPicked = $(this).attr("class").split(' ')[1];//splits the differnet classes and gets second class name
            dPicked = d3.select("#" + dPicked);//makes the class name into an id
            currentColor = dPicked.style('fill');//gets the current color of effected pie piece
        
            //changes highlight of mouseover row
            $(this).css('background-color', highlight)
                    .css('color', 'white');
            //changes highlight of corresponding pie piece
            dPicked.style('fill', highlight)
        }).on('mouseout', function(d){
            //changes back to default colors of pie and table row
            dPicked.style('fill', currentColor);
            $(this).css('background-color', textColorHighlight)
                .css('color', textColor);
        })
    }//END OF OVERTABLE FUNCTION

    //the click function for the info and embed buttons
    var clickInfo = function(){
        
        var last;
        $('#info-button, #embed-button, #embed-close, #info-close').on('click', function(){
            if(isAnimate === 1){
                isAnimate = 0;
                var current = $(this).attr("id").split('-')[0];// split this id to get a single id
                current += "-text";
                toggles(current, last)//call the toggle function
                last = current;
            }
        })
    }//END OF CLICKINFO

    //toggle function it is called by clickInfo
    var toggles = function(picked, last){

        if($('#info-dropdown').is(':visible')){  //if the dropdown is open
            if(picked === last){  //if the button clicked is the same as the one clicked before
                $('#info-dropdown').slideToggle(toggleSpeed, function(){
                    isAnimate = 1;//turn ability to click on once toggle has finished
                });
              
            }else{ //if the button clicked is different from the one clicked before

                $('#info-dropdown').slideToggle(toggleSpeed, function(){
                    $('#info-text').hide();
                    $('#embed-text').hide();
                    $('#'+picked).show();
                    $('#info-dropdown').slideToggle(toggleSpeed);
                    isAnimate = 1; //turn ability to click on once toggle has finished
                });
            
            }
        }else{ //if nothing has been clicked yet
            $('#info-text').hide();
            $('#embed-text').hide();
            $('#'+picked).show();
            $('#info-dropdown').slideToggle(toggleSpeed, function(){
                isAnimate = 1; //turn ability to click on once toggle has finished
            });
        }

    }//END OF TOGGLES FUNCTION

    //add commas to numbers
    var numberWithCommas = function(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    //works out the animation of the pie
    var arcTween = function (a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
            return arc(i(t));
        };
    }   
};

dataInsertPie();

})(this, document);