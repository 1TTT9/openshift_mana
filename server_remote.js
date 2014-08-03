#!/bin/env node
//  OpenShift sample Node application
var express = require('express'),
    fs      = require('fs'),

   //  user-added modules
    http    = require('http'),
    path    = require('path'),
    argv    = require('optimist').argv,    // py-argparse alike
    expose  = require('express-expose'), // pass local variables to clients
    request = require('request'),       // simple way to make http calls. support https and redirects by default.
    configs = require('./configs.js');

/**
 *  Define the Mana application.
 */
var Mana = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || configs.web.port;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };

    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }
        //  Local cache for static content.
        //self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...', Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

	// How we pass our websocket URL to the client.
	self.routes['/varSocketURI.js'] = function(req, res) {
	    var port = argv['websocket-port'];
	    // Modify the URI only if we pass an optional connection port in.
	    var socketURI = port ? ':'+port+'/' : '/';
	    res.set('Content-Type', 'text/javascript');
	    res.send('var socketURI="'+socketURI+'";');
	};

	//main page
	self.routes['/'] = function(req, res) {
	    res.redirect('/index');
	};

	// index.html
	self.routes['/index'] = function(req, res) {

	    /*
	    // unsure how to use module 'expose' correctly. need to check it later.
	    res.expose( {
		title: 'Mana',
		greeting: 'Konnichiwa~'
	    }, 'globals');
	    */

	    res.render('index', {
		server:{
		    title: 'mana',
		    greeting: 'Konnichiwa!'
		},
	    });
	};

	//dashboard.html
	self.routes['/dashboard'] = function(req, res) {

	    res.render('dashboard');
	};

    };

    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();

	self.app.set('views', __dirname + '/views');
	self.app.set('view engine', 'jade');
	self.app.use(express.logger('dev'));
	self.app.use( express.bodyParser() );
	self.app.use( express.methodOverride() );
	self.app.use( self.app.router );

	self.app.use( require('stylus').middleware(  __dirname + '/public') );
	self.app.use( express.static( path.join(__dirname, 'public') ) );


	// development only
	if ('development' == self.app.get('env')) {
	    self.app.use(express.errorHandler());
	}

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
	self.serv = http.createServer(self.app);
	self.sio = require('socket.io').listen(self.serv);
	console.log( "%s: *** ABOUT Socket.IO DEBUG MODE since *>=1.0:***\n" +
		     "\tThe best way to see what information is available is to use the command:" +
		     "'DEBUG=* node yourfile.js'", Date(Date.now()) );

	self.serv.listen( self.port, self.ipaddress, function() {
	    console.log( '%s: Server is listening on %s:%d ...', 
			 Date(Date.now() ), self.ipaddress, self.port );
	});
    };

};   /*   Mana Application.  */



/**
 *  main():  Main code.
 */
var mana = new Mana();
mana.initialize();
mana.start();
