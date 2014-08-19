(function (manaSession) {

//Private Properties
var _periodObj = {},
    _sessionDb = {},
    _durations = [],
    _activeAppKey = 0,
    _initialized = false;

//Private Methods
function calcSparklineData() {

    var sparkLines = {"total":[], "nev":[], "unique":[], "returning":[], "total-time":[], "avg-time":[], "events":[], "avg-events":[]};

    if (!_periodObj.isSpecialPeriod) {
        for (var i = _periodObj.periodMin; i < (_periodObj.periodMax + 1); i++) {
            var tmp_x = manaCommon.getDescendantProp(_sessionDb, _periodObj.activePeriod + "." + i);
            tmp_x = manaSession.clearSessionObject(tmp_x);

            sparkLines["total"][sparkLines["total"].length] = tmp_x["t"];
            sparkLines["nev"][sparkLines["nev"].length] = tmp_x["n"];
            sparkLines["unique"][sparkLines["unique"].length] = tmp_x["u"];
            sparkLines["returning"][sparkLines["returning"].length] = (tmp_x["t"] - tmp_x["n"]);
            sparkLines["total-time"][sparkLines["total-time"].length] = tmp_x["d"];
            sparkLines["avg-time"][sparkLines["avg-time"].length] = (tmp_x["t"] == 0) ? 0 : (tmp_x["d"] / tmp_x["t"]);
            sparkLines["events"][sparkLines["events"].length] = tmp_x["e"];
            sparkLines["avg-events"][sparkLines["avg-events"].length] = (tmp_x["u"] == 0) ? 0 : (tmp_x["e"] / tmp_x["u"]);
        }
    } else {
        for (var i = 0; i < (_periodObj.currentPeriodArr.length); i++) {
            var tmp_x = manaCommon.getDescendantProp(_sessionDb, _periodObj.currentPeriodArr[i]);
            tmp_x = manaSession.clearSessionObject(tmp_x);

            sparkLines["total"][sparkLines["total"].length] = tmp_x["t"];
            sparkLines["nev"][sparkLines["nev"].length] = tmp_x["n"];
            sparkLines["unique"][sparkLines["unique"].length] = tmp_x["u"];
            sparkLines["returning"][sparkLines["returning"].length] = (tmp_x["t"] - tmp_x["n"]);
            sparkLines["total-time"][sparkLines["total-time"].length] = tmp_x["d"];
            sparkLines["avg-time"][sparkLines["avg-time"].length] = (tmp_x["t"] == 0) ? 0 : (tmp_x["d"] / tmp_x["t"]);
            sparkLines["events"][sparkLines["events"].length] = tmp_x["e"];
            sparkLines["avg-events"][sparkLines["avg-events"].length] = (tmp_x["u"] == 0) ? 0 : (tmp_x["e"] / tmp_x["u"]);
        }
    }

    for (var key in sparkLines) {
        sparkLines[key] = sparkLines[key].join(",");
    }

    return sparkLines;
}





//Public Methods
manaSession.initialize = function () {

    /*
      if (_initialized && _activeAppKey == manaCommon.ACTIVE_APP_KEY) {
      return manaSession.refresh();
      }

      if (!manaCommon.DEBUG) {
      _activeAppKey = manaCommon.ACTIVE_APP_KEY;
      _initialized = true;

      return $.ajax({
      type:"GET",
      url: manaCommon.API_PARTS.data.r,
      data:{
      "api_key": manaGlobal.member.api_key,
      "app_id":  manaCommon.ACTIVE_APP_ID,
      "method": "sessions"
      },
      dataType:"jsonp",
      success:function (json) {
      _sessionDb = json;
      setMeta();
      }
      });
      } else {
      _sessionDb = {"2012":{}};
      return true;
      }
    */

    _sessionDb = {"2012":{}};
    return true;
};


manaSession.reset = function () {

    _sessionDb = {};
    setMeta();
};


manaSession.clearSessionObject = function (obj) {

    if (obj) {
        if (!obj["t"]) obj["t"] = 0;
        if (!obj["n"]) obj["n"] = 0;
        if (!obj["u"]) obj["u"] = 0;
        if (!obj["d"]) obj["d"] = 0;
        if (!obj["e"]) obj["e"] = 0;
    }
    else {
        obj = {"t":0, "n":0, "u":0, "d":0, "e":0};
    }
    return obj;
};


manaSession.getSessionData = function () {

    //Update the current period object in case selected date is changed
    _periodObj = manaCommon.periodObj;

    var dataArr = {},
    tmp_x,
    tmp_y,
    currentTotal = 0,
    previousTotal = 0,
    currentNew = 0,
    previousNew = 0,
    currentUnique = 0,
    previousUnique = 0,
    currentDuration = 0,
    previousDuration = 0,
    currentEvents = 0,
    previousEvents = 0,
    isEstimate = false;

    if (_periodObj.isSpecialPeriod) {

        isEstimate = true;

        for (var i = 0; i < (_periodObj.uniquePeriodArr.length); i++) {
            tmp_x = manaCommon.getDescendantProp(_sessionDb, _periodObj.uniquePeriodArr[i]);
            tmp_x = manaSession.clearSessionObject(tmp_x);
            currentUnique += tmp_x["u"];
        }

        var tmpUniqObj,
        tmpCurrentUniq = 0;

        for (var i = 0; i < (_periodObj.uniquePeriodCheckArr.length); i++) {
            tmpUniqObj = manaCommon.getDescendantProp(_sessionDb, _periodObj.uniquePeriodCheckArr[i]);
            tmpUniqObj = manaSession.clearSessionObject(tmpUniqObj);
            tmpCurrentUniq += tmpUniqObj["u"];
        }

        if (currentUnique > tmpCurrentUniq) {
            currentUnique = tmpCurrentUniq;
        }

        for (var i = 0; i < (_periodObj.previousUniquePeriodArr.length); i++) {
            tmp_y = manaCommon.getDescendantProp(_sessionDb, _periodObj.previousUniquePeriodArr[i]);
            tmp_y = manaSession.clearSessionObject(tmp_y);
            previousUnique += tmp_y["u"];
        }

        var tmpUniqObj2,
        tmpPreviousUniq = 0;

        for (var i = 0; i < (_periodObj.previousUniquePeriodCheckArr.length); i++) {
            tmpUniqObj2 = manaCommon.getDescendantProp(_sessionDb, _periodObj.previousUniquePeriodCheckArr[i]);
            tmpUniqObj2 = manaSession.clearSessionObject(tmpUniqObj2);
            tmpPreviousUniq += tmpUniqObj2["u"];
        }

        if (previousUnique > tmpPreviousUniq) {
            previousUnique = tmpPreviousUniq;
        }

        for (var i = 0; i < (_periodObj.currentPeriodArr.length); i++) {
            tmp_x = manaCommon.getDescendantProp(_sessionDb, _periodObj.currentPeriodArr[i]);
            tmp_y = manaCommon.getDescendantProp(_sessionDb, _periodObj.previousPeriodArr[i]);
            tmp_x = manaSession.clearSessionObject(tmp_x);
            tmp_y = manaSession.clearSessionObject(tmp_y);

            currentTotal += tmp_x["t"];
            previousTotal += tmp_y["t"];
            currentNew += tmp_x["n"];
            previousNew += tmp_y["n"];
            currentDuration += tmp_x["d"];
            previousDuration += tmp_y["d"];
            currentEvents += tmp_x["e"];
            previousEvents += tmp_y["e"];
        }

    } else {
        tmp_x = manaCommon.getDescendantProp(_sessionDb, _periodObj.activePeriod);
        tmp_y = manaCommon.getDescendantProp(_sessionDb, _periodObj.previousPeriod);
        tmp_x = manaSession.clearSessionObject(tmp_x);
        tmp_y = manaSession.clearSessionObject(tmp_y);

        currentTotal = tmp_x["t"];
        previousTotal = tmp_y["t"];
        currentNew = tmp_x["n"];
        previousNew = tmp_y["n"];
        currentUnique = tmp_x["u"];
        previousUnique = tmp_y["u"];

        currentDuration = tmp_x["d"];
        previousDuration = tmp_y["d"];
        currentEvents = tmp_x["e"];
        previousEvents = tmp_y["e"];
    }
    
    var sessionDuration = (currentDuration / 60),
        previousSessionDuration = (previousDuration / 60),
        previousDurationPerUser = (previousTotal == 0) ? 0 : previousSessionDuration / previousTotal,
        durationPerUser       = (currentTotal == 0) ? 0 : (sessionDuration / currentTotal),
        previousEventsPerUser = (previousUnique == 0) ? 0 : previousEvents / previousUnique,
        eventsPerUser         = (currentUnique == 0) ? 0 : (currentEvents / currentUnique),
        changeTotal           = manaCommon.getPercentChange(previousTotal, currentTotal),
        changeDuration        = manaCommon.getPercentChange(previousDuration, currentDuration),
        changeDurationPerUser = manaCommon.getPercentChange(previousDurationPerUser, durationPerUser),
        changeNew             = manaCommon.getPercentChange(previousNew, currentNew),
        changeUnique          = manaCommon.getPercentChange(previousUnique, currentUnique),
        changeReturning       = manaCommon.getPercentChange((previousUnique - previousNew), (currentNew - currentNew)),
        changeEvents          = manaCommon.getPercentChange(previousEvents, currentEvents),
        changeEventsPerUser   = manaCommon.getPercentChange(previousEventsPerUser, eventsPerUser),
        sparkLines = calcSparklineData();


    var timeSpentString = (sessionDuration.toFixed(1)) + " ";

    if (sessionDuration >= 142560) {
        timeSpentString = (sessionDuration / 525600).toFixed(1) + " ";
    } else if (sessionDuration >= 1440) {
        timeSpentString = (sessionDuration / 1440).toFixed(1) + " ";
    } else if (sessionDuration >= 60) {
        timeSpentString = (sessionDuration / 60).toFixed(1) + " ";
    }

    dataArr = {

        usage:{
            "total-sessions":{
                "total":currentTotal,
                "change":changeTotal.percent,
                "trend":changeTotal.trend,
		"sparkline":sparkLines.total
                },
            "total-users":{
                "total":currentUnique,
                "change":changeUnique.percent,
                "trend":changeUnique.trend,
                "sparkline":sparkLines.unique,
                //"isEstimate":isEstimate
            },
            "new-users":{
                "total":currentNew,
                "change":changeNew.percent,
                "trend":changeNew.trend,
		"sparkline":sparkLines.nev
            },
            "returning-users":{
                "total":(currentUnique - currentNew),
                "change":changeReturning.percent,
                "trend":changeReturning.trend,
                "sparkline":sparkLines.returning
            },
            "total-duration":{
                "total":timeSpentString,
                "change":changeDuration.percent,
                "trend":changeDuration.trend,
		"sparkline":sparkLines["total-time"]
            },
            "avg-duration-per-session":{
		//"total":(durationPerUser.toFixed(1)) + " " + jQuery.i18n.map["common.minute.abrv"],
                "total":(durationPerUser.toFixed(1)),
                "change":changeDurationPerUser.percent,
                "trend":changeDurationPerUser.trend,
		"sparkline":sparkLines["avg-time"]
            },
            "events":{
                "total":currentEvents,
                "change":changeEvents.percent,
                "trend":changeEvents.trend,
		"sparkline":sparkLines["events"]
            },
            "avg-events":{
                "total":eventsPerUser.toFixed(1),
                "change":changeEventsPerUser.percent,
                "trend":changeEventsPerUser.trend,
		"sparkline":sparkLines["avg-events"]
            }
        }
    };
    return dataArr;
};


manaSession.getSessionDPTotal = function () {

    var chartData = [
        //{ data:[], label:jQuery.i18n.map["common.table.total-sessions"], color:'#DDDDDD', mode:"ghost" },
        //{ data:[], label:jQuery.i18n.map["common.table.total-sessions"], color:'#333933' }
        { data:[], label:"total-sessions", color:'#DDDDDD', mode:"ghost" },
        { data:[], label:"total-sessions", color:'#333933' }
    ],
    dataProps = [ 
	{
            name:"pt",
            func: function (dataObj) { return dataObj["t"] },
            period:"previous"
	},
	{ name:"t" }
    ];

    return manaCommon.extractChartData(_sessionDb, manaSession.clearSessionObject, chartData, dataProps);
};


manaSession.getUserDPNew = function () {

    var chartData = [
        //{ data:[], label:jQuery.i18n.map["common.table.new-users"], color:'#DDDDDD', mode:"ghost"},
        //{ data:[], label:jQuery.i18n.map["common.table.new-users"], color:'#333933' }
        { data:[], label:"new-users", color:'#DDDDDD', mode:"ghost" },
        { data:[], label:"new-users", color:'#333933' }
    ],
    dataProps = [
        {
            name:"pn",
            func:function (dataObj) { return dataObj["n"] },
            period:"previous"
        },
        { name:"n" }
    ];

    return manaCommon.extractChartData(_sessionDb, manaSession.clearSessionObject, chartData, dataProps);
};


manaSession.getUserDPActive = function () {

    var chartData = [
        //{ data:[], label:jQuery.i18n.map["common.table.total-users"], color:'#DDDDDD', mode:"ghost" },
        //{ data:[], label:jQuery.i18n.map["common.table.total-users"], color:'#333933' }
        { data:[], label:"total-users", color:'#DDDDDD', mode:"ghost" },
        { data:[], label:"total-users", color:'#333933' }
    ],
    dataProps = [
        {
            name:"pt",
            func:function (dataObj) {
                return dataObj["u"]
            },
            period:"previous"
        },
        {
            name:"t",
            func:function (dataObj) {  return dataObj["u"] }
        }
    ];

    return manaCommon.extractChartData(_sessionDb, manaSession.clearSessionObject, chartData, dataProps);
};


manaSession.getDurationDP = function () {

    var chartData = [
        //{ data:[], label:jQuery.i18n.map["common.graph.time-spent"], color:'#DDDDDD', mode:"ghost"},
        //{ data:[], label:jQuery.i18n.map["common.graph.time-spent"], color:'#333933' }
        { data:[], label:"time-spent", color:'#DDDDDD', mode:"ghost" },
        { data:[], label:"time-spent", color:'#333933' }
    ],
    dataProps = [
        {
            name:"previous_t",
            func:function (dataObj) {
                return ((dataObj["d"] / 60).toFixed(1));
            },
            period:"previous"
        },
        {
            name:"t",
            func:function (dataObj) {
                return ((dataObj["d"] / 60).toFixed(1));
            }
        }
    ];

    return manaCommon.extractChartData(_sessionDb, manaSession.clearSessionObject, chartData, dataProps);
};

manaSession.getDurationDPAvg = function () {

    var chartData = [
        //{ data:[], label:jQuery.i18n.map["common.graph.average-time"], color:'#DDDDDD', mode:"ghost"},
        //{ data:[], label:jQuery.i18n.map["common.graph.average-time"], color:'#333933' }
        { data:[], label:"average-time", color:'#DDDDDD', mode:"ghost" },
        { data:[], label:"average-time", color:'#333933' }
    ],
    dataProps = [
        {
            name:"previous_average",
            func:function (dataObj) {
                return ((dataObj["t"] == 0) ? 0 : ((dataObj["d"] / dataObj["t"]) / 60).toFixed(1));
            },
            period:"previous"
        },
        {
            name:"average",
            func:function (dataObj) {
                return ((dataObj["t"] == 0) ? 0 : ((dataObj["d"] / dataObj["t"]) / 60).toFixed(1));
            }
        }
    ];

    return manaCommon.extractChartData(_sessionDb, manaSession.clearSessionObject, chartData, dataProps);
};

manaSession.getEventsDPAvg = function () {

    var chartData = [
        //{ data:[], label:jQuery.i18n.map["common.graph.avg-reqs-received"], color:'#DDDDDD', mode:"ghost"},
        //{ data:[], label:jQuery.i18n.map["common.graph.avg-reqs-received"], color:'#333933' }
        { data:[], label:"avg-reqs", color:'#DDDDDD', mode:"ghost" },
        { data:[], label:"avg-reqs", color:'#333933' }
    ],
    dataProps = [
        {
            name:"previous_average",
            func:function (dataObj) {
                return ((dataObj["u"] == 0) ? 0 : ((dataObj["e"] / dataObj["u"]).toFixed(1)));
            },
            period:"previous"
        },
        {
            name:"average",
            func:function (dataObj) {
                return ((dataObj["u"] == 0) ? 0 : ((dataObj["e"] / dataObj["u"]).toFixed(1)));
            }
        }
    ];

    return manaCommon.extractChartData(_sessionDb, manaSession.clearSessionObject, chartData, dataProps);
};


})(window.manaSession = window.manaSession || {});
