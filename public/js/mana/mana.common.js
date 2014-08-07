(function (manaCommon) {

/* Private Properties */
var _period = store.get("mana_date") || "hour";

// Public Properties
manaCommon.ACTIVE_APP_KEY = 0;
manaCommon.ACTIVE_APP_ID = 0;
//manaCommon.BROWSER_LANG = jQuery.i18n.browserLang();
//manaCommon.BROWSER_LANG_SHORT = jQuery.i18n.browserLang().split("-")[0];
manaCommon.HELP_MAP = {};
manaCommon.periodObj = getPeriodObj();

/* Private Methods */
function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

function getDOY() {
    var onejan = new Date((new Date()).getFullYear(),0,1);
    return Math.ceil(((new Date()) - onejan) / 86400000);
}


/* Public Methods */
manaCommon.setPeriod = function (period) {
    _period = period;
    manaCommon.periodObj = getPeriodObj();
    store.set("mana_date", period);
};

manaCommon.getPeriod = function () {
    return _period;
};

/* Returns a period object used by all time related data calculation functions. */
function getPeriodObj() {
    /* moment: multiple date parse/display */
    var now = moment(), 
    year = now.year(),
    month = (now.month() + 1),
    day = now.date(),
    hour = (now.hours()),
    activePeriod,
    previousPeriod,
    periodMax,
    periodMin,
    periodObj = {},
    isSpecialPeriod = false,
    daysInPeriod = 0,
    numberOfDays = 0,
    rangeEndDay = null,
    dateString,
    uniquePeriodsCheck = [],
    previousUniquePeriodsCheck = [];

    switch (_period) {
    case "month":
        activePeriod = year;
        previousPeriod = year - 1;
        periodMax = month;
        periodMin = 1;
        dateString = "MMM";
        numberOfDays = getDOY();
        break;

    case "day":
        activePeriod = year + "." + month;
	/* Deprecation warning: moment().subtract(period, number) is deprecated. Please use moment().subtract(number, period). */
        var previousDate = moment().subtract(day, 'days'),
        previousYear = previousDate.year(),
        previousMonth = (previousDate.month() + 1),
        previousDay = previousDate.date();

        previousPeriod = previousYear + "." + previousMonth;
        periodMax = day;
        periodMin = 1;
        dateString = "D MMM";
        numberOfDays = moment().format("D");
        break;
    case "yesterday":
	/* Deprecation warning: moment().subtract(period, number) is deprecated. Please use moment().subtract(number, period). */
        var yesterday = moment().subtract(1, 'days'),
        year = yesterday.year(),
        month = (yesterday.month() + 1),
        day = yesterday.date();

        activePeriod = year + "." + month + "." + day;
	/* Deprecation warning: moment().subtract(period, number) is deprecated. Please use moment().subtract(number, period). */
        var previousDate = moment().subtract(2,'days'),
        previousYear = previousDate.year(),
        previousMonth = (previousDate.month() + 1),
        previousDay = previousDate.date();

        previousPeriod = previousYear + "." + previousMonth + "." + previousDay;
        periodMax = 23;
        periodMin = 0;
        dateString = "D MMM, HH:mm";
        numberOfDays = 1;
        break;
    case "hour":
        activePeriod = year + "." + month + "." + day;
        var previousDate = moment().subtract(1, 'days'),
        previousYear = previousDate.year(),
        previousMonth = (previousDate.month() + 1),
        previousDay = previousDate.date();

        previousPeriod = previousYear + "." + previousMonth + "." + previousDay;
        periodMax = hour;
        periodMin = 0;
        dateString = "HH:mm";
        numberOfDays = 1;
        break;
    case "7days":
        numberOfDays = daysInPeriod = 7;
        break;
    case "30days":
        numberOfDays = daysInPeriod = 30;
        break;
    case "60days":
        numberOfDays = daysInPeriod = 60;
        break;
    case "90days":
        numberOfDays = daysInPeriod = 90;
        break;
    default:
        break;
    }

    // Check whether period object is array
    if (Object.prototype.toString.call(_period) === '[object Array]' && _period.length == 2) {
        var tmpDate = new Date (_period[1]);
        tmpDate.setHours(0,0,0,0);
        _period[1]= tmpDate.getTime();
        // One day is selected from the datepicker
        if (_period[0] == _period[1]) {
            var selectedDate = moment(_period[0]),
            selectedYear = selectedDate.year(),
            selectedMonth = (selectedDate.month() + 1),
            selectedDay = selectedDate.date(),
            selectedHour = (selectedDate.hours());

            activePeriod = selectedYear + "." + selectedMonth + "." + selectedDay;
	    
	    /* Deprecation warning: moment().subtract(period, number) is deprecated. Please use moment().subtract(number, period). */
            var previousDate = selectedDate.subtract(1, 'days'),
            previousYear = previousDate.year(),
            previousMonth = (previousDate.month() + 1),
            previousDay = previousDate.date();

            previousPeriod = previousYear + "." + previousMonth + "." + previousDay;
            periodMax = 23;
            periodMin = 0;
            dateString = "D MMM, HH:mm";
            numberOfDays = 1;
        } else {
            var a = moment(_period[0]),
            b = moment(_period[1]);

            numberOfDays = daysInPeriod = b.diff(a, 'days') + 1;
            rangeEndDay = _period[1];
        }
    }

    if (daysInPeriod != 0) {
        var yearChanged = false,
        currentYear = 0,
        currWeeksArr = [],
        currWeekCounts = {},
        currMonthsArr = [],
        currMonthCounts = {},
        currPeriodArr = [],
        prevWeeksArr = [],
        prevWeekCounts = {},
        prevMonthsArr = [],
        prevMonthCounts = {},
        prevPeriodArr = [];

        for (var i = (daysInPeriod - 1); i > -1; i--) {
	    /* Deprecation warning: moment().subtract(period, number) is deprecated. Please use moment().subtract(number, period). */
            var currIndex = (!rangeEndDay) ? moment().subtract(i, 'days') : moment(rangeEndDay).subtract('days', i),
            currIndexYear = currIndex.year(),
            prevIndex = (!rangeEndDay) ? moment().subtract((daysInPeriod + i), 'days') : 
		moment(rangeEndDay).subtract((daysInPeriod + i), 'days'),
            prevYear = prevIndex.year();

            if (i != (daysInPeriod - 1) && currentYear != currIndexYear) {
                yearChanged = true;
            }
            currentYear = currIndexYear;
	    
            // Current period variables	    
            var currWeek = currentYear + "." + "w" + Math.ceil(currIndex.format("DDD") / 7);
            currWeeksArr[currWeeksArr.length] = currWeek;
            currWeekCounts[currWeek] = (currWeekCounts[currWeek]) ? (currWeekCounts[currWeek] + 1) : 1;

            var currMonth = currIndex.format("YYYY.M");
            currMonthsArr[currMonthsArr.length] = currMonth;
            currMonthCounts[currMonth] = (currMonthCounts[currMonth]) ? (currMonthCounts[currMonth] + 1) : 1;

            currPeriodArr[currPeriodArr.length] = currIndex.format("YYYY.M.D");

            // Previous period variables
            var prevWeek = prevYear + "." + "w" + Math.ceil(prevIndex.format("DDD") / 7);
            prevWeeksArr[prevWeeksArr.length] = prevWeek;
            prevWeekCounts[prevWeek] = (prevWeekCounts[prevWeek]) ? (prevWeekCounts[prevWeek] + 1) : 1;

            var prevMonth = prevIndex.format("YYYY.M");
            prevMonthsArr[prevMonthsArr.length] = prevMonth;
            prevMonthCounts[prevMonth] = (prevMonthCounts[prevMonth]) ? (prevMonthCounts[prevMonth] + 1) : 1;

            prevPeriodArr[prevPeriodArr.length] = prevIndex.format("YYYY.M.D");
        }

        dateString = (yearChanged) ? "D MMM, YYYY" : "D MMM";
        isSpecialPeriod = true;
    }

    periodObj = {
        "activePeriod":activePeriod,
        "periodMax":periodMax,
        "periodMin":periodMin,
        "previousPeriod":previousPeriod,
        "currentPeriodArr":currPeriodArr,
        "previousPeriodArr":prevPeriodArr,
        "isSpecialPeriod":isSpecialPeriod,
        "dateString":dateString,
        "daysInPeriod":daysInPeriod,
        "numberOfDays":numberOfDays,
        "uniquePeriodArr":getUniqArray(currWeeksArr, currWeekCounts, currMonthsArr, currMonthCounts, currPeriodArr),
        "uniquePeriodCheckArr":getUniqCheckArray(currWeeksArr, currWeekCounts, currMonthsArr, currMonthCounts),
        "previousUniquePeriodArr":getUniqArray(prevWeeksArr, prevWeekCounts, prevMonthsArr, prevMonthCounts, prevPeriodArr),
        "previousUniquePeriodCheckArr":getUniqCheckArray(prevWeeksArr, prevWeekCounts, prevMonthsArr, prevMonthCounts)
    };
    
    return periodObj;
}




// Shortens the given number by adding K (thousand) or M (million) postfix.
// K is added only if the number is bigger than 10000.
manaCommon.getShortNumber = function (number) {

    var tmpNumber = "";

    if (number >= 1000000 || number <= -1000000) {
        tmpNumber = ((number / 1000000).toFixed(1).replace(".0", "")) + "M";
    } else if (number >= 10000 || number <= -10000) {
        tmpNumber = ((number / 1000).toFixed(1).replace(".0", "")) + "K";
    } else {
        number += "";
        tmpNumber = number.replace(".0", "");
    }

    return tmpNumber;
};


// Function for getting the date range shown on the dashboard like 1 Aug - 30 Aug.
// manaCommon.periodObj holds a dateString property which holds the date format.
manaCommon.getDateRange = function () {

    manaCommon.periodObj = getPeriodObj();

    if (!manaCommon.periodObj.isSpecialPeriod) 
    {
        if (manaCommon.periodObj.dateString == "HH:mm") 
	{
            formattedDateStart = moment(manaCommon.periodObj.activePeriod + " " + 
					manaCommon.periodObj.periodMin + ":00", "YYYY.M.D HH:mm");
            formattedDateEnd = moment(manaCommon.periodObj.activePeriod + " " + 
				      manaCommon.periodObj.periodMax + ":00", "YYYY.M.D HH:mm");

            var nowMin = moment().format("mm");
            formattedDateEnd.add("minutes", nowMin);

        } else if (manaCommon.periodObj.dateString == "D MMM, HH:mm") {
            formattedDateStart = moment(manaCommon.periodObj.activePeriod, "YYYY.M.D");
            formattedDateEnd = moment(manaCommon.periodObj.activePeriod, "YYYY.M.D").add("hours", 23).add("minutes", 59);
        } else {
            formattedDateStart = moment(manaCommon.periodObj.activePeriod + "." + manaCommon.periodObj.periodMin, "YYYY.M.D");
            formattedDateEnd = moment(manaCommon.periodObj.activePeriod + "." + manaCommon.periodObj.periodMax, "YYYY.M.D");
        }
    } else {
        formattedDateStart = moment(manaCommon.periodObj.currentPeriodArr[0], "YYYY.M.D");
        formattedDateEnd = moment(manaCommon.periodObj.currentPeriodArr[(manaCommon.periodObj.currentPeriodArr.length - 1)], "YYYY.M.D");
    }

    return formattedDateStart.format(manaCommon.periodObj.dateString) + " - " + 
	formattedDateEnd.format(manaCommon.periodObj.dateString);
};


// Calculates the percent change between previous and current values.
// Returns an object in the following format {"percent": "20%", "trend": "u"}
manaCommon.getPercentChange = function (previous, current) {

    var pChange = 0,
    trend = "";

    if (previous == 0) {
        pChange = "NA";
        trend = "u"; //upward
    } else if (current == 0) {
        pChange = "∞";
        trend = "d"; //downward
    } else {
        var change = (((current - previous) / previous) * 100).toFixed(1);
        pChange = manaCommon.getShortNumber(change) + "%";

        if (change < 0) {
            trend = "d";
        } else {
            trend = "u";
        }
    }

    return {"percent":pChange, "trend":trend};
};


// Fetches nested property values from an obj.
manaCommon.getDescendantProp = function (obj, desc) {
    desc = String(desc);

    if (desc.indexOf(".") === -1) {
        return obj[desc];
    }

    var arr = desc.split(".");
    while (arr.length && (obj = obj[arr.shift()]));

    return obj;
};


manaCommon.extractChartData = function (db, clearFunction, chartData, dataProperties) {

    manaCommon.periodObj = getPeriodObj();

    var periodMin = manaCommon.periodObj.periodMin,
    periodMax = (manaCommon.periodObj.periodMax + 1),
    dataObj = {},
    formattedDate = "",
    tableData = [],
    /* underscore.pluck: extract a list of property value */
    propertyNames     = _.pluck(dataProperties, "name"),  
    propertyFunctions = _.pluck(dataProperties, "func"),
    currOrPrevious    = _.pluck(dataProperties, "period"),
    activeDate,
    activeDateArr;

    for (var j = 0; j < propertyNames.length; j++) {
        if (currOrPrevious[j] === "previous") {

            if (manaCommon.periodObj.isSpecialPeriod) {
                periodMin = 0;
                periodMax = manaCommon.periodObj.previousPeriodArr.length;
                activeDateArr = manaCommon.periodObj.previousPeriodArr;
            } else {
                activeDate = manaCommon.periodObj.previousPeriod;
            }
        } else {

            if (manaCommon.periodObj.isSpecialPeriod) {
                periodMin = 0;
                periodMax = manaCommon.periodObj.currentPeriodArr.length;
                activeDateArr = manaCommon.periodObj.currentPeriodArr;
            } else {
                activeDate = manaCommon.periodObj.activePeriod;
            }
        }

        for (var i = periodMin; i < periodMax; i++) {
            if (!manaCommon.periodObj.isSpecialPeriod) {

                if (manaCommon.periodObj.periodMin == 0) {
                    formattedDate = moment((activeDate + " " + i + ":00:00").replace(/\./g, "/"));
                } else if (("" + activeDate).indexOf(".") == -1) {
                    formattedDate = moment((activeDate + "/" + i + "/1").replace(/\./g, "/"));
                } else {
                    formattedDate = moment((activeDate + "/" + i).replace(/\./g, "/"));
                }

                dataObj = manaCommon.getDescendantProp(db, activeDate + "." + i);
            } else {

                formattedDate = moment((activeDateArr[i]).replace(/\./g, "/"));
                dataObj = manaCommon.getDescendantProp(db, activeDateArr[i]);
            }

            dataObj = clearFunction(dataObj);

            if (!tableData[i]) 
	    {
                tableData[i] = {};
            }

            tableData[i]["date"] = formattedDate.format(manaCommon.periodObj.dateString);

            if (propertyFunctions[j]) {
                propertyValue = propertyFunctions[j](dataObj);
            } else {
                propertyValue = dataObj[propertyNames[j]];
            }

            chartData[j]["data"][ chartData[j]["data"].length ] = [i, propertyValue];
            tableData[i][ propertyNames[j] ] = propertyValue;
        }
    }

    var keyEvents = [];
    for (var k = 0; k < chartData.length; k++) {

	/* _.flatten(array, [shallow]): flatten a nested array with any depth, 1 depth if shallow is true */
        var flatChartData = _.flatten(chartData[k]["data"]);
	/* _.reject(list, predicate, [context]): opposite of filter */
        var chartVals = _.reject(flatChartData, function (context, value, index, list) {
            return value % 2 == 0;
        });
        var chartIndexes = _.filter(flatChartData, function (context, value, index, list) {
            return value % 2 == 0;
        });
        keyEvents[k] = {};
        keyEvents[k].min = _.min(chartVals);
        keyEvents[k].max = _.max(chartVals);
    }

    /* _.compact(array): remove flasy value [false, null, 0, '', NaN, undefined] */
    return {"chartDP":chartData, "chartData":_.compact(tableData), "keyEvents":keyEvents};
};



function getUniqArray(weeksArray, weekCounts, monthsArray, monthCounts, periodArr) {

    if (_period == "month" || _period == "day" || _period == "yesterday" || _period == "hour") {
        return [];
    }

    if (Object.prototype.toString.call(_period) === '[object Array]' && _period.length == 2) {
        if (_period[0] == _period[1]) {
            return [];
        }
    }

    var weeksArray = clone(weeksArray),
    weekCounts = clone(weekCounts),
    monthsArray = clone(monthsArray),
    monthCounts = clone(monthCounts),
    periodArr = clone(periodArr);

    var uniquePeriods = [],
    tmpDaysInMonth = -1,
    tmpPrevKey = -1,
    rejectedWeeks = [],
    rejectedWeekDayCounts = {};

    for (var key in weekCounts) {

        // If this is the current week we can use it
        if (key === moment().format("YYYY.\\w w").replace(" ", "")) {
            continue;
        }

        if (weekCounts[key] < 7) {
            for (var i = 0; i < weeksArray.length; i++) {
                weeksArray[i] = weeksArray[i].replace(key, 0);
            }
        }
    }

    for (var key in monthCounts) {
        if (tmpPrevKey != key) {
            if (moment().format("YYYY.M") === key) {
                tmpDaysInMonth = moment().format("D");
            } else {
                tmpDaysInMonth = moment(key, "YYYY.M").daysInMonth();
            }

            tmpPrevKey = key;
        }

        if (monthCounts[key] < tmpDaysInMonth) {
            for (var i = 0; i < monthsArray.length; i++) {
                monthsArray[i] = monthsArray[i].replace(key, 0);
            }
        }
    }

    for (var i = 0; i < monthsArray.length; i++) {
        if (monthsArray[i] == 0) {
            if (weeksArray[i] == 0 || (rejectedWeeks.indexOf(weeksArray[i]) != -1)) {
                uniquePeriods[i] = periodArr[i];
            } else {
                uniquePeriods[i] = weeksArray[i];
            }
        } else {
            rejectedWeeks[rejectedWeeks.length] = weeksArray[i];
            uniquePeriods[i] = monthsArray[i];

            if (rejectedWeekDayCounts[weeksArray[i]]) {
                rejectedWeekDayCounts[weeksArray[i]].count++;
            } else {
                rejectedWeekDayCounts[weeksArray[i]] = {
                    count:1,
                    index:i
                };
            }
        }
    }

    var totalWeekCounts = _.countBy(weeksArray, function (per) {
        return per;
    });

    for (var weekDayCount in rejectedWeekDayCounts) {

        // If the whole week is rejected continue
        if (rejectedWeekDayCounts[weekDayCount].count == 7) {
            continue;
        }

        // If its the current week continue
        if (moment().format("YYYY.\\w w").replace(" ", "") == weekDayCount && 
	    totalWeekCounts[weekDayCount] == rejectedWeekDayCounts[weekDayCount].count) {
            continue;
        }

        // If only some part of the week is rejected we should add back daily buckets

        var startIndex = rejectedWeekDayCounts[weekDayCount].index - 
	    (totalWeekCounts[weekDayCount] - rejectedWeekDayCounts[weekDayCount].count),
        limit = startIndex + (totalWeekCounts[weekDayCount] - rejectedWeekDayCounts[weekDayCount].count);

        for (var i = startIndex; i < limit; i++) {
            // If there isn't already a monthly bucket for that day
            if (monthsArray[i] == 0) {
                uniquePeriods[i] = periodArr[i];
            }
        }
    }

    rejectedWeeks = _.uniq(rejectedWeeks);
    uniquePeriods = _.uniq(_.difference(uniquePeriods, rejectedWeeks));

    return uniquePeriods;
}


function getUniqCheckArray(weeksArray, weekCounts, monthsArray, monthCounts) {

    if (_period == "month" || _period == "day" || _period == "yesterday" || _period == "hour") {
        return [];
    }

    if (Object.prototype.toString.call(_period) === '[object Array]' && _period.length == 2) {
        if (_period[0] == _period[1]) {
            return [];
        }
    }

    var weeksArray = clone(weeksArray),
    weekCounts = clone(weekCounts),
    monthsArray = clone(monthsArray),
    monthCounts = clone(monthCounts);

    var uniquePeriods = [],
    tmpDaysInMonth = -1,
    tmpPrevKey = -1;

    for (var key in weekCounts) {
        if (key === moment().format("YYYY.\\w w").replace(" ", "")) {
            continue;
        }

        if (weekCounts[key] < 1) {
            for (var i = 0; i < weeksArray.length; i++) {
                weeksArray[i] = weeksArray[i].replace(key, 0);
            }
        }
    }

    for (var key in monthCounts) {
        if (tmpPrevKey != key) {
            if (moment().format("YYYY.M") === key) {
                tmpDaysInMonth = moment().format("D");
            } else {
                tmpDaysInMonth = moment(key, "YYYY.M").daysInMonth();
            }

            tmpPrevKey = key;
        }

        if (monthCounts[key] < (tmpDaysInMonth * 0.5)) {
            for (var i = 0; i < monthsArray.length; i++) {
                monthsArray[i] = monthsArray[i].replace(key, 0);
            }
        }
    }

    for (var i = 0; i < monthsArray.length; i++) {
        if (monthsArray[i] == 0) {
            if (weeksArray[i] == 0) {

            } else {
                uniquePeriods[i] = weeksArray[i];
            }
        } else {
            uniquePeriods[i] = monthsArray[i];
        }
    }

    uniquePeriods = _.uniq(uniquePeriods);

    return uniquePeriods;
}


function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;

    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; ++i) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }
}



manaCommon.getTickObj = function(bucket) {
    var days = parseInt(manaCommon.periodObj.numberOfDays, 10),
    ticks = [],
    tickTexts = [],
    skipReduction = false;

    if (days == 1) {
        for (var i = 0; i < 24; i++) {
            ticks.push([i, (i + ":00")]);
            tickTexts.push((i + ":00"));
        }

        skipReduction = true;
    } else {
        var start = moment().subtract(days, 'days');
        if (Object.prototype.toString.call(manaCommon.getPeriod()) === '[object Array]'){
            start = moment(manaCommon.periodObj.currentPeriodArr[manaCommon.periodObj.currentPeriodArr.length - 1])
		.subtract(days, 'days');
            }

        if (bucket == "monthly") {
            var allMonths = [];

            for (var i = 0; i < days; i++) {
                start.add('days', 1);
                allMonths.push(start.format("MMM"));
            }

            allMonths = _.uniq(allMonths);

            for (var i = 0; i < allMonths.length; i++) {
                ticks.push([i, allMonths[i]]);
                tickTexts[i] = allMonths[i];
            }
        } else if (bucket == "weekly") {
            var allWeeks = [];

            for (var i = 0; i < days; i++) {
                start.add('days', 1);
                allWeeks.push(start.isoweek());
            }

            allWeeks = _.uniq(allWeeks);

            for (var i = 0; i < allWeeks.length; i++) {
                ticks.push([i, "W" + allWeeks[i]]);

                var weekText = moment().isoweek(allWeeks[i]).isoday(1).format(", MMM D");
                tickTexts[i] = "W" + allWeeks[i] + weekText;
            }
        } else if (bucket == "hourly") {
            for (var i = 0; i < days; i++) {
                start.add('days', 1);

                for (var j = 0; j < 24; j++) {
                    if (j == 0) {
                        ticks.push([((24 * i) + j), start.format("D MMM") + " 0:00"]);
                    }

                    tickTexts.push(start.format("D MMM, ") + j + ":00");
                }
            }
        } else {
            for (var i = 0; i < days; i++) {
                start.add('days', 1);
                ticks.push([i, start.format("D MMM")]);
                tickTexts[i] = start.format("D MMM");
            }
        }

        ticks = _.compact(ticks);
        tickTexts = _.compact(tickTexts);
    }

    if (!skipReduction && ticks.length > 10) {
        var reducedTicks = [],
        step = (Math.floor(ticks.length / 10) < 1)? 1 : Math.floor(ticks.length / 10),
        pickStartIndex = (Math.floor(ticks.length / 30) < 1)? 1 : Math.floor(ticks.length / 30);

        for (var i = pickStartIndex; i < (ticks.length - 1); i = i + step) {
            reducedTicks.push(ticks[i]);
        }

        ticks = reducedTicks;
    } else {
        ticks[0] = null;

        // Hourly ticks already contain 23 empty slots at the end
        if (!(bucket == "hourly" && days != 1)) {
            ticks[ticks.length - 1] = null;
        }
    }

    return {
        min: 0,
        max: tickTexts.length - 1,
        tickTexts: tickTexts,
        ticks: _.compact(ticks)
    };
};


})(window.manaCommon = window.manaCommon || {});
