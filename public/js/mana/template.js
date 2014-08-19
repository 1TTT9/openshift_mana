
//random string generator
function makeRandom() {
    var text = "", possible = "0123456789", len = Math.floor(Math.random() * 4)+1;
    for( var i=0; i < len; i++ ) text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

var manaView = Backbone.View.extend( {

    template: null,
    templateData: {},
    el: $('#content'),

    initialize: function (){
	this.template = $('#tempate-analytics-common');
    },

    dateChanged: function (){
	this.renderCommon();
    },

    /*  appChanged here */

    beforeRender: function (){
	return true;
    },

    afterRender: function (){
	//
    },

    render: function (){
	
	$('#content-top').html("");
	$(this.el).html('<div id="content-loader"></div>');

        var self = this;
        //$.when(this.beforeRender(), initializeEventsOnce()).then(function() {
        $.when(this.beforeRender()).then(function() {
            self.renderCommon();
            self.afterRender();
            app.pageScript();
        });

	return this;
    },
    
    renderCommon:function (isRefresh) {
    }, // common render function of the view

    refresh: function (){
	return true;
    },

    restart: function (){
	this.refresh();
    },

    destroy: function (){
	//pass
    }

});

/* initializeEventsOnce */
/* initializeEventsOnce END */

/* Template Object */
/* Template Object END */

/* Helper funciton */
/* Helper funciton END */

/* fillKeyEvents funciton */
function fillKeyEvents(keyEvents) {
    if (!keyEvents.length) {
        return true;
    }

    $("#key-events").html("");
    for (var k = 0; k < keyEvents.length; k++) {

        if (!keyEvents[k]) {
            continue;
        }

        for (var l = 0; l < keyEvents[k].length; l++) {
            $("#key-events").append("<tr>\
<td>\
<div class='graph-key-event-label' style='float:left; background-color:" + keyEvents[k][l].color + ";'>" + keyEvents[k][l].code + "</div>\
<div style='margin-left:40px; padding-top:3px;'>" + keyEvents[k][l].desc + "</div>\
</td>\
</tr>");
        }
    }
}


/* fillKeyEvents funciton END */

window.manageAppsView = manaView.extend({

    initialize: function (){
	this.template = Handlebars.compile( $('#template-management-applications').html() ) ;
    },

    renderCommon: function (){
	$(this.el).html(
	    this.template({addmin_app: manaGlobal['admin_apps']})
	);

	var appId = 'TEMP_APP_ID';
	$('#app-management-bar .app-container').removeClass('active');
	$('#app-management-bar .app-container[data-id="' + appId + '"]').addClass('active');


	function resetAdd() {
            $("#app-add-name").val("");
            $("#app-add-category").text('NOCATEGORY');
            $("#app-add-category").data("value", "");
            $("#app-add-timezone #selected").text("");
            $("#app-add-timezone #selected").hide();
            $("#app-add-timezone .text").html('NOTIMEZONE');
            $("#app-add-timezone .text").data("value", "");
            $("#app-add-timezone #app-timezone").val("");
            $("#app-add-timezone #app-country").val("");
            $("#app-add-timezone #timezone-select").hide();
            $(".required").hide();	    

	}

	function hideAdd() {
	    $('#app-container-new').remove();
	    $('#add-new-app').hide();
	    resetAdd();
	    $('#view-app').show();
	}


	function initAppManagement(appId) {
	    if (jQuery.isEmptyObject(manaGlobal['apps'])) {
		//showAdd();
		$('#no-app-warning').show();
		return false
	    } else if (jQuery.isEmptyObject(manaGlobal['admin_apps'])) {
		//showAdd();
		return false;
	    } else {
		hideAdd();
		if (manaGlobal['admin_apps'][appId]) {
		    $('#delete-app').show();
		} else {
		    $('#delete-app').hide();
		}
	    }

            $("#app-edit-id").val(appId);
            $("#view-app").find(".widget-header .title").text(manaGlobal['apps'][appId].name);
            $("#app-edit-name").find(".read").text(manaGlobal['apps'][appId].name);
            $("#app-edit-name").find(".edit input").val(manaGlobal['apps'][appId].name);
            $("#view-app-key").text(manaGlobal['apps'][appId].key);
            $("#view-app-id").text(appId);
	    /*
            $("#app-edit-category").find(".cly-select .text").text(appCategories[manaGlobal['apps'][appId].category]);
            $("#app-edit-category").find(".cly-select .text").data("value", manaGlobal['apps'][appId].category);
            $("#app-edit-timezone").find(".cly-select .text").data("value", countlyGlobal['apps'][appId].timezone);
            $("#app-edit-category").find(".read").text(appCategories[countlyGlobal['apps'][appId].category]);
            $("#app-edit-image").find(".read .logo").css({"background-image":'url("/appimages/' + appId + '.png")'});
            var appTimezone = timezones[countlyGlobal['apps'][appId].country];
            for (var i = 0; i < appTimezone.z.length; i++) {
                for (var tzone in appTimezone.z[i]) {
                    if (appTimezone.z[i][tzone] == countlyGlobal['apps'][appId].timezone) {
                        var appEditTimezone = $("#app-edit-timezone").find(".read"),
                            appCountryCode = countlyGlobal['apps'][appId].country;
                        appEditTimezone.find(".flag").css({"background-image":"url(/images/flags/" + appCountryCode.toLowerCase() + ".png)"});
                        appEditTimezone.find(".country").text(appTimezone.n);
                        appEditTimezone.find(".timezone").text(tzone);
                        initCountrySelect("#app-edit-timezone", appCountryCode, tzone, appTimezone.z[i][tzone]);
                        break;
                    }
                }
            }
	    */
	}

	initAppManagement(appId);	
    },

});




window.DashboardView = manaView.extend({

    selectedView: '#draw-total-sessions',

    initialize: function (){
	this.template = Handlebars.compile( $('#dashboard-template').html() ) ;
    },

    beforeRender: function (){
	//initialize some prerequisites (sessions, locations, device, etc.) before render
	return $.when( manaSession.initialize() ).then(function(){});
    },

    afterRender: function (){
	//pass
    },

    dateChanged: function (){

	this.renderCommon(false, true);
	
	switch (this.selectedView) {
            case "#draw-total-sessions":
	        /* defer: setTimeout similar function */
                _.defer(function () {
                    sessionDP = manaSession.getSessionDPTotal();
                    manaGraph.drawTimeGraph(sessionDP.chartDP, "#dashboard-graph");
		    //alert('lalala2');
		});
                break;
            case "#draw-new-users":
                _.defer(function () {
                    sessionDP = manaSession.getUserDPNew();
                    manaGraph.drawTimeGraph(sessionDP.chartDP, "#dashboard-graph");
                });
                break;
            case "#draw-total-users":
                _.defer(function () {
                    sessionDP = manaSession.getUserDPActive();
                    manaGraph.drawTimeGraph(sessionDP.chartDP, "#dashboard-graph");
                });
                break;
            case "#draw-time-spent":
                _.defer(function () {
                    sessionDP = manaSession.getDurationDPAvg();
                    manaGraph.drawTimeGraph(sessionDP.chartDP, "#dashboard-graph");
                });
                break;
            case "#draw-total-time-spent":
                _.defer(function () {
                    sessionDP = manaSession.getDurationDP();
                    manaGraph.drawTimeGraph(sessionDP.chartDP, "#dashboard-graph");
                });
                break;
            case "#draw-avg-events-served":
                _.defer(function () {
                    sessionDP = manaSession.getEventsDPAvg();
                    manaGraph.drawTimeGraph(sessionDP.chartDP, "#dashboard-graph");
                });
                break;

	}
    },

    pageScript: function (){

        $(".widget-content .inner").click( function () {
            $(".big-numbers").removeClass("active");
            $(".big-numbers .select").removeClass("selected");
            $(this).parent(".big-numbers").addClass("active");
            $(this).find('.select').addClass("selected");
        });

        var self = this;
        $(".big-numbers .inner").click(function () {
            var elID = $(this).find('.select').attr("id");

            if (self.selectedView == "#" + elID) {
                return true;
            }

            self.selectedView = "#" + elID;

            var keyEvents;

            switch (elID) {
                case "draw-total-users":
                    _.defer(function () {
                        sessionDP = manaSession.getUserDPActive();
                        keyEvents = manaGraph.drawTimeGraph(sessionDP.chartDP, "#dashboard-graph");
                        fillKeyEvents(keyEvents);
                    });
                    break;
                case "draw-new-users":
                    _.defer(function () {
                        sessionDP = manaSession.getUserDPNew();
                        keyEvents = manaGraph.drawTimeGraph(sessionDP.chartDP, "#dashboard-graph");
                        fillKeyEvents(keyEvents);
                    });
                    break;
                case "draw-total-sessions":
                    _.defer(function () {
                        sessionDP = manaSession.getSessionDPTotal();
                        keyEvents = manaGraph.drawTimeGraph(sessionDP.chartDP, "#dashboard-graph");
                        fillKeyEvents(keyEvents);
                    });
                    break;
                case "draw-time-spent":
                    _.defer(function () {
                        sessionDP = manaSession.getDurationDPAvg();
                        keyEvents = manaGraph.drawTimeGraph(sessionDP.chartDP, "#dashboard-graph");
                        fillKeyEvents(keyEvents);
                    });
                    break;
                case "draw-total-time-spent":
                    _.defer(function () {
                        sessionDP = manaSession.getDurationDP();
                        manaGraph.drawTimeGraph(sessionDP.chartDP, "#dashboard-graph");
                    });
                    break;
                case "draw-avg-events-served":
                    _.defer(function () {
                        sessionDP = manaSession.getEventsDPAvg();
                        manaGraph.drawTimeGraph(sessionDP.chartDP, "#dashboard-graph");
                    });
                    break;
            }
        });

    },

    /*  appChanged here */

    
    renderCommon: function (isRefresh, isDateChange){

        var sessionData = manaSession.getSessionData(),
            sessionDP = manaSession.getSessionDPTotal();
            //locationData = manaLocation.getLocationData({maxCountries:7}),

        //sessionData["country-data"] = locationData;
        //sessionData["page-title"] = manaCommon.getDateRange();

	/* Deprecation warning: moment.lang is deprecated. Use moment.locale instead. */
	moment.locale('ja');
        sessionData["page-title"] = moment().format('lll') + moment().format('ss秒 (dd)') ;

	sessionData["page-title"] += ' . . . ”' + (this.selectedView).substring(1) + '” is now selected.';

        sessionData["usage"] = [
            {
                //"title":jQuery.i18n.map["common.total-sessions"],
                "title":"total-sessions",
                "data":sessionData.usage['total-sessions'],
                "id":"draw-total-sessions",
                "help":"dashboard.total-sessions"
            },
            {
                //"title":jQuery.i18n.map["common.total-users"],
                "title":"total-users",
                "data":sessionData.usage['total-users'],
                "id":"draw-total-users",
                "help":"dashboard.total-users"
            },
            {
                //"title":jQuery.i18n.map["common.new-users"],
                "title":"new-users",
                "data":sessionData.usage['new-users'],
                "id":"draw-new-users",
                "help":"dashboard.new-users"
            },
            {
                //"title":jQuery.i18n.map["dashboard.time-spent"],
                "title":"time-spent",
                "data":sessionData.usage['total-duration'],
                "id":"draw-total-time-spent",
                "help":"dashboard.total-time-spent"
            },
            {
                //"title":jQuery.i18n.map["dashboard.avg-time-spent"],
                "title":"avg-time-spent",
                "data":sessionData.usage['avg-duration-per-session'],
                "id":"draw-time-spent",
                "help":"dashboard.avg-time-spent2"
            },
            {
                //"title":jQuery.i18n.map["dashboard.avg-reqs-received"],
                "title":"avg-reqs-received",
                "data":sessionData.usage['avg-events'],
                "id":"draw-avg-events-served",
                "help":"dashboard.avg-reqs-received"
            }
        ];
	
	sessionData['bars'] = 
	    [
		{
		    'title': 'bar01',
		    'data': {},
		    'help': ''
		},
		{
		    'title': 'bar02',
		    'data': {},
		    'help': ''
		},
		{
		    'title': 'bar03',
		    'data': {},
		    'help': ''
		},
		{
		    'title': 'bar04',
		    'data': {},
		    'help': ''
		}
	    ];


	this.templateData = sessionData;

	if (!isRefresh) {
	    $(this.el).html(this.template(this.templateData));
	    $(this.selectedView).parents(".big-numbers").addClass('active');
	    this.pageScript();

            if (!isDateChange) {
                var keyEvents = manaGraph.drawTimeGraph(sessionDP.chartDP, "#dashboard-graph");
                fillKeyEvents(keyEvents);
            }
	}
    },

    refresh: function (isFromIdle){

	var self = this;
	$.when(this.beforeRender()).then(function() {

	    if (app.activeView != self) {
		return false;
	    }	    
	    self.renderCommon(true);

            newPage = $("<div>" + self.template(self.templateData) + "</div>");
            $("#big-numbers-container").replaceWith(newPage.find("#big-numbers-container"));
            $(".dashboard-summary").replaceWith(newPage.find(".dashboard-summary"));
            $(".widget-header .title").replaceWith(newPage.find(".widget-header .title"));
            $(self.selectedView).parents(".big-numbers").addClass("active");

	    switch(self.selectedView){
                case "#draw-total-sessions":
                    sessionDP = manaSession.getSessionDPTotal();
                    manaGraph.drawTimeGraph(sessionDP.chartDP, "#dashboard-graph");
                    break;
                case "#draw-total-users":
                    sessionDP = manaSession.getUserDPActive();
                    manaGraph.drawTimeGraph(sessionDP.chartDP, "#dashboard-graph");
                    break;
                case "#draw-new-users":
                    sessionDP = manaSession.getUserDPNew();
                    manaGraph.drawTimeGraph(sessionDP.chartDP, "#dashboard-graph");
                    break;
                case "#draw-time-spent":
                    sessionDP = manaSession.getDurationDPAvg();
                    manaGraph.drawTimeGraph(sessionDP.chartDP, "#dashboard-graph");
                    break;
                case "#draw-total-time-spent":
                    sessionDP = manaSession.getDurationDP();
                    manaGraph.drawTimeGraph(sessionDP.chartDP, "#dashboard-graph");
                    break;
                case "#draw-avg-events-served":
                    sessionDP = manaSession.getEventsDPAvg();
                    manaGraph.drawTimeGraph(sessionDP.chartDP, "#dashboard-graph");
                    break;
	    }
	    
	    if(newPage.find('#map-list-right').length == 0){
		$('#map-list-right').remove();
	    }

	    if($('#map-list-right').length) {
		$('#map-list-right').replaceWith(newPage.find('#map-list-right'));
	    } else {
		$('.widget.map-list').prepend(newPage.find('#map-list-right'));
	    }
	   
	    self.pageScript();	 
	});
    },

    restart: function (){
	this.refresh(true);
    },

    destroy: function (){
	//pass
    }    

});



var AppRouter = Backbone.Router.extend({

    routes: {
	"dash/": "dashboard",
	"/manage/apps": "manageApps",

	"*path": "main"
    },

    activeView: null, // current view
    dateToselected: null, // date to selected from the date picker
    dateFromSelected: null, // date from selected from the date picker
    activeAppName: '',
    activeAppKey: '',
    
    main: function() { 

	this.navigate("dash/", true); 
    },

    dashboard: function() {

	this.renderWhenReady(this.dashboardView);
    },

    manageApps: function() {

	this.renderWhenReady(this.manageAppsView);
    },

    renderWhenReady: function(viewName){
	
	if (this.activeView) {
	    this.activeView.destroy();
	}

	this.activeView = viewName;
	clearInterval(this.refreshActiveView);

	/* if variable "manaGlobal" is empty, redirect to page /manage/apps straightly 
	if (_.isEmpty(manaGlobal['app'])) {
	    if (Backbone.history.fragment != '/manage/apps') {
		this.navigate('/manage/apps', true);
	    } else {
		viewName.render();
	    }
	    return false;
	}
	*/

	viewName.render();

	var self = this;
	this.refreshActiveView = setInterval(function (){
	    self.activeView.refresh();
	}, manaCommon.DASHBOARD_REFRESH_MS);
    },

    
    initialize: function() {

	// initialize the dashboard, register helpers etc.
	this.dashboardView = new DashboardView();

	Handlebars.registerPartial('date-selector', $('#template-date-selector').html());

    },
    
    pageScript: function() {

        $("#month").text(moment().format('YYYY'));
        $("#hour").text('Today');
        $("#7days").text('7 Days');
        $("#30days").text('30 Days');
        $("#60days").text('60 Days');

	var self = this;
	$(document).ready(function() {
	    
            var selectedDateID = manaCommon.getPeriod();

            if (Object.prototype.toString.call(selectedDateID) !== '[object Array]') {
                $("#" + selectedDateID).addClass("active");
            }

            $(".usparkline").peity("bar", { width:"100%", height:"30", colour:"#6BB96E", 
					    strokeColour:"#6BB96E", strokeWidth:2 });
            $(".dsparkline").peity("bar", { width:"100%", height:"30", colour:"#C94C4C", 
					    strokeColour:"#C94C4C", strokeWidth:2 });

	    /* this works when user clicks the date buttons  */
            $("#date-selector").find(">.button").click(function () {
                if ($(this).hasClass("selected")) {
                    return true;
                }
		
                self.dateFromSelected = null;
                self.dateToSelected = null;

                $(".date-selector").removeClass("selected").removeClass("active");
                $(this).addClass("selected");
                var selectedPeriod = $(this).attr("id");

                if (manaCommon.getPeriod() == selectedPeriod) {
                    return true;
                }

                manaCommon.setPeriod(selectedPeriod);

                self.activeView.dateChanged();
                $("#" + selectedPeriod).addClass("active");
                self.pageScript();
            });

	});
    }
});


var app = new AppRouter();

/* Start Backbone history a necessary step for bookmarkable URL's */
Backbone.history.start();
