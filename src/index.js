/**
 * index.js
 * Main file for Application
 * @author: Juan Camilo Ibarra
 * @Creation_Date: March 2016
 * @version: 0.1.0
 * @Update_Author : Juan Camilo Ibarra
 * @Date: March 2016
 */

// Create express application
var CONFIG = require('./config.js'); //Config file for globals
var express = require('express');
var app = express();

// Serving static files (http://expressjs.com/starter/static-files.html)
app.use(express.static(__dirname + '/public'));

// Routing for express (http://expressjs.com/guide/routing.html)
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/views/main.html');
});

//*******************************************
// CUSTOM MODULES
var auth = require("./project_modules/authenticator.js");
var socket = require("./project_modules/socket_io.js");


//*******************************************
// Routing for authenticated users
//*******************************************
var apiRoutes = require("tabulalogin")();
apiRoutes.app = app;
apiRoutes.express = express;
apiRoutes.tokenkey = 'tokenkey';
apiRoutes.expiration = 3600;
apiRoutes.authenticator = function(body, callback)
{
	auth.authenticateUser(
		{
			login : body.login,
			password : body.password
		},
		function(res)
		{
			callback(res);
		}
	);
};
apiRoutes.setup();

apiRoutes.routes.post('/validate', function(req, res){
	res.json({ success : true});
});



// Start app and listen on port for connections
var server = app.listen(CONFIG.PORT, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('FeniciaViz app listening at http://%s:%s', host, port);
}); 

socket.setServer(server);
