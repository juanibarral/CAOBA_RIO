/**
 * app_rest_service.js
 * Service to control the communication to server via REST
 * @author: Juan Camilo Ibarra
 * @Creation_Date: September 2016
 * @version: 0.1.0
 * @Update_Author : Juan Camilo Ibarra
 * @Date: September 2016
 */

var my_app = require("./app_core").my_app;

/**
 * Service to manage the socket connection with server  
 */
my_app.service('rest_srv', [ '$http', function($http){
	
	// // List of services 
	var postMessage = function(params, callback)
	{

		$http(params).then(
			function successCallback(response){
				callback({success : true, msg : response.data})
			},
			function errorCallback(error){
				console.log(error);
				callback({success : false, msg : error})
			}
		);
	}

	var getBuses = function(params, callback)
	{
		postMessage(
			{
				method : "GET",
				url : "http://172.24.99.172:8080/get_buses",
				params : {
					route_name : params.route_name,
					date : params.date
				}
			},
			callback
		);
	}

	var getBusData = function(params, callback){

		postMessage(
			{
				method : "GET",
				url : "http://172.24.99.172:8080/get_bus_points",
				params : {
					bus_identifier : params.bus_identifier,
					date : params.date
				}
			},
			callback
		);
	}

	//TODO: Crear los otros dos servicios que piden la informacion al servicio REST
	// Estos servicios retornan arreglos que hay que transformar en el controller
	
	var getDistrictData = function(params, callback){
		// Terminar el codigo para traer la data de los barrios
	}

	return {
		getBuses : getBuses, 
		postMessage : postMessage,
		getBusData : getBusData,
		getDistrictData : getDistrictData
	};
}]);
