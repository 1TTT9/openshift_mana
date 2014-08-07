#!/bin/env node
//  OpenShift sample Node application
var express = require('express'),
    fs      = require('fs'),

   //  user-added modules
    http    = require('http'),
    path    = require('path'),
    argv    = require('optimist').argv,    // py-argparse alike
    request = require('request'),       // simple way to make http calls. support https and redirects by default.
    configs = require('./configs.js'),
    webauth = require('everyauth'),
    morgan  = require('morgan'),  //logger
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    methodOverride = require('method-override'),
    errorHandler = require('errorhandler'),
    timeout = require('connect-timeout');

webauth.debug = true;

var usersById = {};
var nextUserId = 0;
var usersByLogin = {
    anonymous: {login:'anonymous', pass:'1234'},
};	



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
	//GET
        self.routes = { };

	//POST
	self.proutes = { };

	// How we pass our websocket URL to the client.
	self.routes['/varSocketURI.js'] = function(req, res) {
	    var port = argv['websocket-port'];
	    // Modify the URI only if we pass an optional connection port in.
	    var socketURI = port ? ':'+port+'/' : '/';
	    res.set('Content-Type', 'text/javascript');
	    res.send('var socketURI="'+socketURI+'";');
	};

	//register post
	self.proutes['/register'] = function(req, res) {

	    //pass

	};

	//main page
	self.routes['/'] = function(req, res) {
	    //res.redirect('/dashboard');
	    res.redirect('/login');
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
	    ret = {
		server: {
		    title: 'who are you!',
		    greeting: 'you are no allowed if you see this message here!'
		}
	    };		
	    if ( req.session.auth ){
		if( req.session.auth.loggedIn ) {
		    ret.server = {
			title: 'mana',
			greeting: 'Konnichiwa!'
		    };
		}
	    }
	    res.render('index', ret);
	};

	//dashboard.html
	self.routes['/dashboard'] = function(req, res) {

	    var toredirect = false;
	    if (req.session.auth === undefined || req.session.auth == null) {
		toredirect = true;
	    } else if (req.session.auth.loggedIn === undefined || req.session.auth.loggedIn == null) {
		toredirect = true;
	    } else if (!req.session.auth.loggedIn){
		toredirect = true;
	    }

	    if (toredirect)
		res.redirect('/');

	    timeout(5000); 
	    bodyParser.urlencoded({ extended: false });

	    if (res._header) return; // someone already responded
	    var xtimedout = false;
	    req.on('timeout', function(){
		xtimedout = true;
	    });
	    // pretend setTimeout is something long, like uploading file to s3
	    setTimeout(function(){
		if (xtimedout) return; // timedout, do nothing
		req.logout();
		res.render('dashboard');
	    }, 3000); // adjust meee

	    /*
	    if ( req.session.auth ){
		if( req.session.auth.loggedIn ) {
		    res.render('dashboard');
		}
	    }
	    res.redirect('/');
	    */
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

	self.app.use( morgan('dev') );
	self.app.use( bodyParser.urlencoded({ extended: false }) );
	self.app.use( cookieParser() );


	self.app.use( session({secret:'aabbc',resave:false, saveUninitialized: false}) );
	self.app.use( webauth.middleware(self.app) );


	self.app.use( methodOverride() );

	self.app.use( require('stylus').middleware(  __dirname + '/public') );
	self.app.use( express.static( path.join(__dirname, 'public') ) );


	// development only
	if ('development' == self.app.get('env')) {
	    self.app.use( errorHandler() );
	}

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }

        for (var r in self.proutes) {
            //self.app.post(r, self.proutes[r]);
        }
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeAuth = function() {
	
	webauth.everymodule
	    .findUserById( function (id, callback) {
		callback(null, usersById[id]);
	    });

	webauth.everymodule
	    .performRedirect( function (res, location) {

		res.redirect(location, 303);
	    });

	webauth.password
	    .loginFormFieldName('user')
	    .passwordFormFieldName('pass')
	    .loginWith('login')
	    .getLoginPath('/login')
	    .postLoginPath('/login')
	    .loginView('login.jade')
	    .authenticate( function(login, pass) {

		//console.log( '###' + webauth.password.loginFormFieldName());
		//console.log( '###' + webauth.user );
		//console.log( '###' + webauth.loggedIn );

		var errors = [];
		if (!login) errors.push('Missing login');
		if (!pass) errors.push('Missing password');
		if (errors.length) return errors;

		var user = usersByLogin[login];
		if (!user) return ['Login failed'];
		if (user.pass !== pass) return ['Login failed'];
		return user;
	    })
	    .loginSuccessRedirect('/login')
	    /*
	    .respondToLoginSucceed( function (res, user, data) {
		if (user) {
		    this.redirect(res, '/dashboard');
		}
	    })
	    */
	    .getRegisterPath('/login')
	    .postRegisterPath('/login')
	    .registerUser( function (newUserAttributes) {
		
	    });

    };

    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

	self.initializeAuth();

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
