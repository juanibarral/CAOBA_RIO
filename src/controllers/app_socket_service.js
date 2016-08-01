/**
 * app_socket_service.js
 * Service to control the communication to server via websockets 
 * @author: Juan Camilo Ibarra
 * @Creation_Date: March 2016
 * @version: 0.1.1
 * @Update_Author : Juan Camilo Ibarra
 * @Date: March 2016
 */

var io = require('socket.io-client');
var my_app = require("./app_core").my_app;

/**
 * Service to manage the socket connection with server  
 */
my_app.service('socket_srv', function(){
	var socket = io.connect();
	
	// List of services 
	// * emit: message send to server
	// * resp: response received from server
	// * subscribers: object for all the templates using this service
	var servicesList = {
		GET_DATA : {
			emit : 'get_data',
			resp : 'data',
			subscribers : {} 
		},
		GET_GEODATA : {
			emit : 'get_geodata',
			resp : 'geodata',
			subscribers : {} 
		},
	};
	/**
	 * Sets the listener for each service
 	 * @param {Object} service service to be set
	 */
	var setListener = function(service)
	{
		socket.on(service.resp, function(data){
			unsuscribeCallback(service, data);
		});	
	};
	
	for(serviceId in servicesList)
	{
		setListener(servicesList[serviceId]);
	}
	
	/**
	 * It subscribes a new callback to a service 
 	 * @param {Object} service service to be subscribed
 	 * @param {Object} params parameters for the service
	 */
	var subscribeCallback = function(service, params)
	{
		console.log("****************************");
		console.log("Subscribe callback");
		console.log("Service: ");
		console.log(service);
		console.log("Params:");
		console.log(params);
		console.log("****************************");
		params['caller'] = guid();
		service.subscribers[params.caller] = params.callback;
		socket.emit(service.emit, params);
	};
	
	/**
	 * When receiving a server response, the subscriber gets unsuscribed from the service 
 	 * @param {Object} service service to be setup
 	 * @param {Object} data data sent from the server
	 */
	var unsuscribeCallback = function(service, data)
	{
		console.log("****************************");
		console.log("Unsubscribe callback");
		console.log("Service: ");
		console.log(service);
		console.log("data:");
		console.log(data);
		console.log("****************************");
		if(service.subscribers[data.caller])
		{
			service.subscribers[data.caller](data);
			delete service.subscribers[data.caller];
		}
	};
	
	/**
	 * Creates a unique identifier 
	 */
	var guid = function() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	};
	
	return {
		services : servicesList,
		subscribe_callback : subscribeCallback
	};
});
