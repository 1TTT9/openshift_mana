

var manaView = Backbone.View.extend( {

    template: null,
    templateData: {},
    el: $('#content'),

    initialize: function (){
	this.template = $('#tempate-analytics-common');
    },

    dateChanged: function (){
	this.renderComon();
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

	this.renderCommon();
	this.afterRender();
	app.pageScript();

	return this;
    },
    
    renderCommon: function (){
	//pass
    },

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
/* fillKeyEvents funciton END */



window.DashboardView = manaView.extend({

    selectedView: '#draw-total-sessions',

    initialize: function (){
	this.template = Handlebars.compile( $('#dashboard-template').html() ) ;
    },

    beforeRender: function (){
	//initialize some prerequisites (sessions, locations, device, etc.) before render
	return $.when().then(function(){});
    },

    afterRender: function (){
	//pass
    },

    dateChanged: function (){

	this.renderCommon(false, true);
	switch (this.selectedView) {
	    //pass
	}
    },

    pageScript: function (){

	//$('.widget-content .inner').click(function(){});
    },

    /*  appChanged here */

    
    renderCommon: function (){
	
	var sessionData = {
	    "page-title": "hehe, I am here!",
	    "usage": [
		{
		    'title': 'a1',
		    'data': {'trend':'d', 'total':'1000K', 'change':'-100%'},
		    'id': '001',
		    'help': ''
		},
		{
		    'title': 'a2',
		    'data': {'trend':'u', 'total':'1000K', 'change':'100%'},
		    'id': '002',
		    'help': ''
		},
		{
		    'title': 'a3',
		    'data': {'trend':'d', 'total':'1000K', 'change':'-100%'},
		    'id': '003',
		    'help': ''
		},
		{
		    'title': 'a4',
		    'data': {'trend':'u', 'total':'1000K', 'change':'100%'},
		    'id': '004',
		    'help': ''
		},
		{
		    'title': 'a5',
		    'data': {'trend':'d', 'total':'1000K', 'change':'-100%'},
		    'id': '005',
		    'help': ''
		},
		{
		    'title': 'a6',
		    'data': {'trend':'u', 'total':'1000K', 'change':'100%'},
		    'id': '006',
		    'help': ''
		}
	    ],

	    'bars': [
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
	    ]
	};

	this.templateData = sessionData;
	$(this.el).html(this.template(this.templateData));
	$(this.selectedView).parents('.big-numbers').addClass('active');

	this.pageScript();
    },

    refresh: function (){
	var self = this;

	$.when(this.beforeRender()).then(function(){
	    if (app.activeView != self) {
		return false;
	    }
	    
	    self.renderCommon(true);

	    newPage = $('<div>'+self.template(self.templateData)+'</div>');
	    $('#big-number-container').replacewith(newPage.find('#big-number-container'));
	    $('.dashboard-summary').replacewith(newPage.find('.dashboard-summary'));
	    $('.widget-header .title').replacewith(newPage.find('.widget-header .title'));
	    $(self.selectedView).parents('.big-numbers').addClass('active');

	    switch(self.selectedView){
		//pass
	    }
	    
	    if(newPage.find('#map-list-right').length == 0){
		$('#map-list-right').remove();
	    }

	    if(newPage.find('#map-list-right').length){
		$('#map-list-right').replacewith(newPage.find('#map-list-right'));
	    } else {
		$('#map-list-right').prepend(newPage.find('#map-list-right'));
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

    renderWhenReady: function(viewName){
	
	if (this.activeView) {
	    this.activeView.destroy();
	}

	this.activeView = viewName;
	//clearInterval(this.refreshActiveView);

	viewName.render();


	/*
	var self = this;
	this.refreshActiveView = setInterval(function (){
	    self.activeView.refresh();
	}, 1000);
	*/
    },

    
    initialize: function() {

	// initialize the dashboard, register helpers etc.
	this.dashboardView = new DashboardView();
    },
    
    pageScript: function(){

	var self = this;

	$(document).ready(function() {

	});
    }
});


var app = new AppRouter();

/* Start Backbone history a necessary step for bookmarkable URL's */
Backbone.history.start();
