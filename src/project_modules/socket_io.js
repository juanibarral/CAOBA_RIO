/**
 * socket_io.js
 * Module to manage web socket connections
 * @author: Juan Camilo Ibarra
 * @Creation_Date: March 2016
 * @version: 0.1.0
 * @Update_Author : Juan Camilo Ibarra
 * @Date: March 2016
 */

var io_lib = require('socket.io');
var geodb = require('./geodb_manager.js');
var db = require('./db_manager.js');
var io; 

// List of services that the socket module will handle
// * emit: message received from the client
// * resp: message send to client with response
// * method: function to be called when receiving a message from client 
var servicesList = {
	GET_LIST_OF_ROUTES : {
		emit : 'get_list_of_routes',
		resp : 'list_of_routes',
		method : db.getListOfRoutes 
	},
	GET_ROUTE : {
		emit : 'get_route',
		resp : 'route',
		method : geodb.getRoute
	},
};

/**
 * Delegator function to handle a client petition 
 * @param {Object} service service provided by the system (inside servicesList)
 * @param {Object} socket socket to respond to
 * @param {Object} params params for the service
 */
var socketDelegator = function(service, socket, params)
{
	service.method(params, function(rows) {
		console.log("emit: " + service.resp);
		socket.emit(service.resp, {
			caller : params.caller,
	 		data : rows
		});
	});
};

/**
 * Sets the socket listener
 * @param {object} socket socket to setup
 * @param {object} service service used to socket setup 
 */
var setListener = function(socket, service)
{
	socket.on(service.emit, function(params){
		try{
			socketDelegator(service, socket, params);		
		}catch(err)
		{
			console.log(err);
		}
	});	
};

/**
 * Setup for the socket.io module 
 */
var setup = function()
{
	io.on('connection', function(socket){
		//Setup for listeners
		for(serviceId in servicesList)
		{
			setListener(socket, servicesList[serviceId]);
		}
	});
};

/**
 * Sets the server connected to this socket.io service 
 * @param {Object} server
 */
var setServer = function(server)
{
	io = io_lib(server); 
	setup();
};

module.exports = {
	setServer : setServer
};
