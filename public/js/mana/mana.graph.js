(function (manaGraph) {

// Draws a line graph with the given dataPoints to container.
manaGraph.drawTimeGraph = function (dataPoints, container, bucket) {

    // Some data points start with [1, XXX] (should be [0, XXX]) and brakes the new tick logic
    // Below loops converts the old structures to the new one
    if (dataPoints[0].data[0][0] == 1) {
        for (var i = 0; i < dataPoints.length; i++) {
            for (var j = 0; j < dataPoints[i].data.length; j++) {
                dataPoints[i].data[j][0] -= 1;
            }
        }
    }

    var graphProperties = {
        series:{
            lines:{ stack:false, show:true, fill:true, lineWidth:2, fillColor:{ colors:[
                { opacity:0 },
                { opacity:0.15 }
            ] }, shadowSize:0 },
            points:{ show:true, radius:4, shadowSize:0 },
            shadowSize:0
        },
        grid:{ hoverable:true, borderColor:"null", color:"#BDBDBD", borderWidth:0, minBorderMargin:10, labelMargin:10},
        xaxis:{ tickDecimals:"number", tickSize:0, tickLength:0 },
        yaxis:{ min:0, minTickSize:1, tickDecimals:"number", ticks:3 },
        legend:{ show:false, margin:[-25, -44], noColumns:3, backgroundOpacity:0 },
        colors: manaGraph.GRAPH_COLORS
    };

    graphProperties.series.points.show = (dataPoints[0].data.length <= 90);

    var graphTicks = [],
    tickObj = {};

    if (manaCommon.getPeriod() == "month" && !bucket) {
        tickObj = manaCommon.getTickObj("monthly");
    } else {
        tickObj = manaCommon.getTickObj(bucket);
    }

    graphProperties.xaxis.max = tickObj.max;
    graphProperties.xaxis.min = tickObj.min;
    graphProperties.xaxis.ticks = tickObj.ticks;

    graphTicks = tickObj.tickTexts;

    var graphObj = $.plot($(container), dataPoints, graphProperties),
    keyEventCounter = "A",
    keyEvents = [],
    keyEventsIndex = 0;

    for (var k = 0; k < graphObj.getData().length; k++) {

        var tmpMax = 0,
        tmpMaxIndex = 0,
        tmpMin = 999999999999,
        tmpMinIndex = 0,
        label = (graphObj.getData()[k].label + "").toLowerCase();

        if (graphObj.getData()[k].mode === "ghost") {
            keyEventsIndex += graphObj.getData()[k].data.length;
            continue;
        }

        $.each(graphObj.getData()[k].data, function (i, el) {

            //data point is null
            //this workaround is used to start drawing graph with a certain padding
            if (!el[1] && el[1] !== 0) {
                return true;
            }

            el[1] = parseFloat(el[1]);

            if (el[1] >= tmpMax) {
                tmpMax = el[1];
                tmpMaxIndex = el[0];
            }

            if (el[1] <= tmpMin) {
                tmpMin = el[1];
                tmpMinIndex = el[0];
            }
        });

        if (tmpMax == tmpMin) {
            continue;
        }

        keyEvents[k] = [];

        keyEvents[k][keyEvents[k].length] = {
            data:[tmpMinIndex, tmpMin],
            code:keyEventCounter,
            color:graphObj.getData()[k].color,
            event:"min",
            desc:jQuery.i18n.prop('common.graph-min', tmpMin, label, graphTicks[tmpMinIndex])
        };

        keyEventCounter = String.fromCharCode(keyEventCounter.charCodeAt() + 1);

        keyEvents[k][keyEvents[k].length] = {
            data:[tmpMaxIndex, tmpMax],
            code:keyEventCounter,
            color:graphObj.getData()[k].color,
            event:"max",
            desc:jQuery.i18n.prop('common.graph-max', tmpMax, label, graphTicks[tmpMaxIndex])
        };

        keyEventCounter = String.fromCharCode(keyEventCounter.charCodeAt() + 1);
    }

    var graphWidth = graphObj.width();

    for (var k = 0; k < keyEvents.length; k++) {
        var bgColor = graphObj.getData()[k].color;

        if (!keyEvents[k]) {
            continue;
        }

        for (var l = 0; l < keyEvents[k].length; l++) {

            var o = graphObj.pointOffset({x:keyEvents[k][l]["data"][0], y:keyEvents[k][l]["data"][1]});

            if (o.left <= 15) {
                o.left = 15;
            }

            if (o.left >= (graphWidth - 15)) {
                o.left = (graphWidth - 15);
            }

            if (true) {
                var keyEventLabel = $('<div class="graph-key-event-label">').text(keyEvents[k][l]["code"]);

                keyEventLabel.attr({
                    "title":keyEvents[k][l]["desc"],
                    "data-points":"[" + keyEvents[k][l]["data"] + "]"
                }).css({
                    "position":'absolute',
                    "left":o.left,
                    "top":o.top - 33,
                    "display":'none',
                    "background-color":bgColor
                }).appendTo(graphObj.getPlaceholder()).show();

                $(".tipsy").remove();
                keyEventLabel.tipsy({gravity:$.fn.tipsy.autoWE, offset:3, html:true});
            }
        }
    }

    var previousPoint;

    $(container).bind("plothover", function (event, pos, item) {
        if (item) {
            if (previousPoint != item.dataIndex) {
                previousPoint = item.dataIndex;

                $("#graph-tooltip").remove();
                var x = item.datapoint[0].toFixed(1).replace(".0", ""),
                y = item.datapoint[1].toFixed(1).replace(".0", "");

                showTooltip(item.pageX, item.pageY - 40, y + " " + item.series.label);
            }
        } else {
            $("#graph-tooltip").remove();
            previousPoint = null;
        }
    });

    return keyEvents;
};


})(window.manaGraph = window.manaGraph || {});
