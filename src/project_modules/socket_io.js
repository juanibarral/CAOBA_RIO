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
	GET_ALL_ROUTES : {
		emit : 'get_all_routes',
		resp : 'all_routes',
		method : geodb.getAllRoutes
	},
	GET_BUS_GPS_LINE : {
		emit : 'get_bus_gps_line',
		resp : 'bus_gps_line',
		method : geodb.getBusGPSLine
	},
	GET_BUS_GPS_POINTS : {
		emit : 'get_bus_gps_points',
		resp : 'bus_gps_points',
		method : geodb.getBusGPSPoints
	},
	GET_BUSES_FROM_ROUTE : {
		emit : 'get_buses_from_route',
		resp : 'buses_from_route',
		method : geodb.getBusesList
	},
	GET_NEIGHBORHOODS : {
		emit : 'get_neighborhoods',
		resp : 'neighborhoods',
		method : geodb.getNeighborhoods	
	},
	GET_NEIGHBORHOODS_DATA : {
		emit : 'get_neighborhoods_data',
		resp : 'neighborhoods_data',
		method : geodb.getNeighborhoodsData
	},
	GET_ROUTES_FROM_NEIGHBORHOODS : {
		emit : 'get_routes_from_neighborhoods',
		resp : 'routes_from_neighborhoods',
		method : geodb.getRoutesFromNeighborhood
	}
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
