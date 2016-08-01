/**
 * geodb_manager.js
 * Module to manage the communication with the geodb
 * @author: Juan Camilo Ibarra
 * @Creation_Date: March 2016
 * @version: 0.1.0
 * @Update_Author : Juan Camilo Ibarra
 * @Date: March 2016
 */

var geodb = require('geotabuladb');

/**
 * Function to get geodata from geodatabse
 * @param {Object} params params for the query from client
 * @param {Object} callback function to return retrieved data 
 */
var getGeoData = function(params, callback)
{
	//Set credentials of geodatabase
	/*
	geodb.setCredentials({
		type : 'postgis',
		host : 'localhost',
		user : 'user',
		password : 'password',
		database : 'MyGDB',
	});
	
	//Geoqueries....
	geodb.geoQuery({
			geometry : 'geom',
			tableName : 'my_geometries',
			properties : 'all',
			debug : true
		}, function(json)
		{
			callback(json);		
		}
	);
	*/
	callback("data from geodatabase");
};

module.exports = {
	getGeoData : getGeoData,
};
