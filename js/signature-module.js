var arraydata, topicnames, barN;
var svgID, svgW, svgH;
var holeWidth = 15,
    minRadius, maxRadius;
var padding, angle, textRadius, maxScore;
var radiiValues, topResults, abbrNames;
var topResultsNumber = 10,
    labelTextSize = 10,
    onlyShowTop = false,
    showNumbers = true;

var scale = d3.scale.linear()
    .clamp(true)
    .nice();

/* MUST do before generating a signature */

// Sets the data to represent
function loadData(dataValues) {
    arraydata = dataValues;
    barN = dataValues.length;
    max = d3.max(dataValues);
}

// Sets the names of the topics; should just be an array of strings
function loadNames(nameValues) {
    topicnames = nameValues;
}

// Sets the maximum (for configuring the scale of the radius)
function setMax(value) {
    maxScore = value;
}

// Sets the number of top results to be displayed
function setTopResultsNumber(value) {
    topResultsNumber = value;
}

// Toggles whether to only show the results as top results or not
function setShowTopOnly(value) {
    onlyShowTop = value;
}

//Toggles whether to show numbers for each bar or not
function setShowNumbers(value) {
    showNumbers = value;
}

// Stationary Signature; for related profile displays. No labels, no animation

function createStagnantSignature(selectedsvgid) {
    svgID = "#" + selectedsvgid;
    var svg = d3.select(svgID);
    svgW = $(svgID).width();
    svgH = $(svgID).height();

    var n;
    if (svgW < svgH) {
        n = svgW;
    } else {
        n = svgH;
    }

    var padding = n / 16.5;
    var minRadius = holeWidth / 3;
    var maxRadius = 3.05 * n / 7
    var angle = (2 * Math.PI) / barN;

    var rvalues = [];

    scale.domain([0, maxScore])
        .range([minRadius, maxRadius]);

    for (i = 0; i < barN; i++) {
        var radius = scale(arraydata[i]);
        rvalues.push(radius);
    }

    for (i = 0; i < barN; i++) {
        if (rvalues[i] > maxRadius / 2.5) {
            var color = "rgb(160, 20, 20)";
            var arc = d3.svg.arc()
                .innerRadius(3)
                .outerRadius(minRadius)
                .startAngle(i * angle)
                .endAngle((i + 1) * angle);

            var cbar = svg.append("path")
                .attr("d", arc)
                .attr("fill", color)
                .attr("transform", "translate(" + svgW / 2 + ", " + svgH / 2 + ")")
                .attr("opacity", "0");

            arc.outerRadius(rvalues[i]);

            cbar.transition()
                .duration(450)
                .delay(350 + i * 5)
                .attr("d", arc)
                .attr("opacity", "0.7");
        }
    }
}


function createSignature(selectedsvgid) {
    svgID = "#" + selectedsvgid;
    var svg = d3.select(svgID);
    svgW = $(svgID).width();
    svgH = $(svgID).height();

    var n;
    if (svgW < svgH) {
        n = svgW;
    } else {
        n = svgH;
    }

    padding = n / 17.5;
    var maxRadius = 3 * n / 8;
    var minRadius = holeWidth;
    angle = (2 * Math.PI) / barN;

    var rvalues = [];

    //Takes the values of the dataset and scales them to the boundaries of the radii values

    scale.domain([0, maxScore])
        .range([minRadius, maxRadius]);

    for (i = 0; i < barN; i++) {
        var radius = scale(arraydata[i]);
        rvalues.push(radius);
    }

    radiiValues = rvalues;

    if (barN < 50) {
        var barTextSize = 15;
    } else {
        var barTextSize = 12;

    }

    textRadius = d3.max(radiiValues) + 1.2 * padding;
    var minTextRadius = maxRadius / 2;

    var topValues = arraydata.concat().sort(function (a, b) {
        return a - b;
    }).reverse().slice(0, topResultsNumber);


    var refinedValues = [];

    for (i = 0; i < topResultsNumber; i++) {
        if (topValues[i] != 0) {
            refinedValues.push(topValues[i]);
        }
    }

    topResults = refinedValues;

    //CONSTRUCTION

    var color = "rgb(160, 20, 20)";

    for (i = 0; i < barN; i++) {
        var isTopResult = false;
        for (k = 0; k < topResultsNumber; k++) {
            if (topResults[k] == arraydata[i]) {
                isTopResult = true;
            }
        }

        //creates the invisible strip
        var arc = d3.svg.arc()
            .innerRadius(holeWidth)
            .outerRadius(maxRadius - 1.75 * padding)
            .startAngle(i * angle)
            .endAngle((i + 1) * angle);

        var gp = svg.append("g")
            .attr("id", "gp" + (i + 1))
            .attr("onmouseover", "selectBar(d3.select(this))")
            .attr("onmouseout", "resetBars()");

        var current = d3.select("#gp" + (i + 1));

        current.append("path")
            .attr("d", arc)
            .attr("fill", "rgba(0, 0, 0, 0)")
            .attr("id", "space" + (i + 1))
            .attr("transform", "translate(" + svgW / 2 + ", " + svgH / 2 + ")");

        //adjusts for visible strip
        arc.outerRadius(minRadius);

        var cbar = current.append("path")
            .attr("d", arc)
            .attr("fill", color)
            .attr("transform", "translate(" + svgW / 2 + ", " + svgH / 2 + ")")
            .attr("opacity", "0")
            .attr("id", "bar" + (i + 1));

        arc.outerRadius(rvalues[i]);

        if (arraydata[i] == 0 || (onlyShowTop && !isTopResult)) {
            gp.attr("visibility", "hidden");
            current.attr("visibility", "hidden");
        } else {
            cbar.transition()
                .duration(450)
                .delay(350 + i * 15)
                .attr("d", arc)
                .attr("opacity", "0.7");
        }

        //NOT the actual angle; calculated based on a scale where 0 is east and angles are measured counter-clockwise
        var calcAngle = Math.PI / 2 - (angle * i + angle / 2);

        var textX = Math.cos(calcAngle) * textRadius;
        var textY = Math.sin(calcAngle) * textRadius;

        //Topic labels
        var t = current.append("text")
            .text(i + 1)
            .attr("fill", "black")
            .attr("text-anchor", "middle")
            .attr("font-family", "Arial")
            .attr("font-size", labelTextSize)
            .attr("x", svgW / 2 + textX)
            .attr("y", svgH / 2 - textY)
            .attr("opacity", "0")
            .attr("visibility", "hidden")
            .attr("id", "label" + (i + 1));

        if (isTopResult && showNumbers) {
            t.attr("visibility", "visible")
                .transition()
                .duration(450)
                .delay(350 + i * 15)
                .attr("opacity", "1");
        }

        current.append("text")
            .text("score: " + arraydata[i])
            .attr("id", "barText" + (i + 1))
            .attr("font-size", barTextSize)
            .attr("font-family", "Arial")
            .attr("fill", "white")
            .attr("text-anchor", "middle")
            .attr("opacity", 0)
            .attr("visibility", "hidden");

    }

    var fixedtxt = svg.append("text")
        .attr("id", "fixed")
        .attr("font-size", 2 * labelTextSize)
        .attr("x", svgW / 2)
        .attr("y", svgH - 2 * labelTextSize)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .attr("opacity", 0)
        .attr("visibility", "hidden")
        .style("text-transform", "capitalize");

}

function resetBars() {
    var svg = d3.select(svgID);
    svgW = $(svgID).width();
    svgH = $(svgID).height();

    var n;
    if (svgW < svgH) {
        n = svgW;
    } else {
        n = svgH;
    }

    var padding = n / 16.5;
    var minRadius = holeWidth / 3;
    var maxRadius = 3.05 * n / 7;
    
    scale.range(minRadius, maxRadius);
    for(i = 0; i < radiiValues.length; i++){
        radiiValues[i] = scale(radiiValues[i]);
    }

    for (i = 0; i < barN; i++) {
        var isTopResult = false;
        for (k = 0; k < topResultsNumber; k++) {
            if (topResults[k] == arraydata[i]) {
                isTopResult = true;
            }
        }
        var arc = d3.svg.arc()
            .innerRadius(holeWidth)
            .outerRadius(radiiValues[i])
            .startAngle(i * angle)
            .endAngle((i + 1) * angle);

        d3.select("#bar" + (i + 1)).transition()
            .duration(200)
            .attr("transform", "translate(" + svgW / 2 + ", " + svgH / 2 + ") scale(1)")
            .attr("opacity", "0.7")
            .attr("d", arc);

        var calcAngle = Math.PI / 2 - (angle * i + angle / 2);

        d3.select("#barText" + (i + 1))
            .attr("visibility", "hidden")
            .attr("opacity", "0");

        d3.select("#space" + (i + 1)).transition()
            .duration(200)
            .attr("transform", "translate(" + svgW / 2 + ", " + svgH / 2 + ") scale(1)");

        var textX = Math.cos(calcAngle) * textRadius;
        var textY = Math.sin(calcAngle) * textRadius;

        if (isTopResult && showNumbers) {
            d3.select("#label" + (i + 1)).transition()
                .attr("x", svgW / 2 + textX)
                .attr("y", svgH / 2 - textY)
                .attr("font-size", labelTextSize)
                .attr("visibility", "visible")
                .attr("opacity", "1");

        } else {
            d3.select("#label" + (i + 1)).transition()
                .attr("x", svgW / 2 + textX)
                .attr("y", svgH / 2 - textY)
                .attr("font-size", labelTextSize)
                .attr("opacity", "0");

        }
    }

    d3.select("#fixed").transition()
        .attr("x", svgW / 2)
        .attr("y", svgH / 2)
        .attr("opacity", "0")
        .attr("visibility", "hidden");
}

// HOVER EFFECTS

function selectBar(selection) {

    var id = selection.attr("id");
    id = parseInt(id.replace('gp', ''));
    var index = id - 1;

    //Calculates new angles

    var largeAngle = (4 * Math.PI) / (barN - 1); //ANGLE OF ENLARGED BAR
    var largeAngleDifference = largeAngle - angle;
    var smallAngle = ((2 * Math.PI) - largeAngle) / (barN - 1); //ANGLE OF SHRUNKEN BARS
    var smallAngleDifference = angle - smallAngle;

    //Finds the hovered arc; adjusts it

    var largeSAngle, largeEAngle;

    //Finds the selected bar; calculates its new angles.
    for (i = 0; i < barN; i++) {
        if (i == index) {
            largeSAngle = (i * angle) - (largeAngleDifference / 2);
            largeEAngle = largeSAngle + largeAngle;
            var arc = d3.svg.arc()
                .innerRadius(holeWidth)
                .outerRadius(radiiValues[i])
                .startAngle(largeSAngle)
                .endAngle(largeEAngle);

            var calcAngle = (largeSAngle + largeAngle / 2);

            var textX = Math.cos(calcAngle) * (textRadius);
            var textY = Math.sin(calcAngle) * (textRadius);

            var barText = d3.select("#barText" + id);

            if (radiiValues[i] < textRadius / 2 || Math.floor(arraydata[i]) >= 75) {
                barText.attr("fill", "black");
            }

            if (radiiValues[i] < textRadius / 2) {
                var barTextX = Math.cos(calcAngle) * (radiiValues[i] + padding);
                var barTextY = Math.sin(calcAngle) * (radiiValues[i] + padding);
            } else {
                var barTextX = Math.cos(calcAngle) * (radiiValues[i] - padding);
                var barTextY = Math.sin(calcAngle) * (radiiValues[i] - padding);
            }

            barText.attr("visibility", "hidden")
                .transition()
                .duration(200)
                .attr("opacity", 1)
                .attr("x", svgW / 2 + barTextX)
                .attr("y", svgH / 2 - barTextY);

            if (showNumbers) {
                d3.select("#label" + id).transition()
                    .attr("font-size", labelTextSize * 11 / 8)
                    .attr("visibility", "visible")
                    .attr("opacity", "1");
            }

            d3.select("#bar" + id).transition()
                .duration(200)
                .attr("d", arc)
                .attr("opacity", ".9")
                .attr("transform", "translate(" + svgW / 2 + ", " + svgH / 2 + ") scale(1.05)");

            d3.select("#space" + id).transition()
                .duration(50)
                .attr("transform", "translate(" + svgW / 2 + ", " + svgH / 2 + ") scale(2)");

            d3.select("#fixed")
                .text(topicnames[i])
                .attr("visibility", "visible")
                .transition()
                .duration(200)
                .attr("opacity", "1");

            var bbox = d3.select("#fixed").node().getBBox();

            var txtWidth = bbox.width;

            if (txtWidth > svgW) {
                d3.select("#fixed").attr("font-size", 1.5 * labelTextSize);
            } else {

                d3.select("#fixed").attr("font-size", 2 * labelTextSize);
            }

            break;
        }
    }

    //Adjusts other bars based on the new angle of the selected one.

    for (i = 0; i < barN; i++) {
        var isTopResult = false;

        for (k = 0; k < topResultsNumber; k++) {
            if (topResults[k] == arraydata[i]) {
                isTopResult = true;
            }
        }

        arc = d3.svg.arc()
            .innerRadius(holeWidth)
            .outerRadius(radiiValues[i]);

        if (i < id) {
            var tempS = largeSAngle - ((index - i) * smallAngle);
            var tempE = largeSAngle - ((index - i - 1) * smallAngle);
            arc.startAngle(2 * Math.PI + tempS)
                .endAngle(2 * Math.PI + tempE);
            calcAngle = Math.PI / 2 - (2 * Math.PI + largeSAngle - ((index - i) * smallAngle) + smallAngle / 2);

        } else if (i > index) {
            arc.startAngle(largeEAngle + ((i - index - 1) * smallAngle))
                .endAngle(largeEAngle + ((i - index) * smallAngle));
            calcAngle = Math.PI / 2 - (largeEAngle + ((i - index - 1) * smallAngle) + smallAngle / 2);
        }

        if (i != index) {
            d3.select("#bar" + (i + 1)).transition()
                .duration(200)
                .attr("opacity", "0.3")

            .attr("transform", "translate(" + svgW / 2 + ", " + svgH / 2 + ")")
                .attr("d", arc);

            d3.select("#barText" + (i + 1))
                .attr("opacity", "0")
                .attr("visibility", "hidden");

            if (isTopResult && i != index && Math.abs(i - index) % barN >= 2) {
                d3.select("#label" + (i + 1)).transition()
                    .attr("font-size", labelTextSize)
                    .attr("visibility", "visible")
                    .attr("opacity", ".4");
            } else {
                d3.select("#label" + (i + 1)).transition()
                    .attr("font-size", labelTextSize)
                    .attr("opacity", "0");

            }
        }
    }
}

/* general functionality */

var resizeTimer;
$(window).resize(function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resetBars, 100);
});