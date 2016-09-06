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

var all_routes_cache = null;

var connect = function()
{
	geodb.setCredentials({
		type : 'postgis',
		host : 'localhost',
		//host : 'guitaca.uniandes.edu.co:5432',
		user : 'vafuser',
		password : '1234',
		database : 'CaobaRioDB',
	});
}

/**
 * Function to get geodata from geodatabse
 * @param {Object} params params for the query from client
 * @param {Object} callback function to return retrieved data 
 */
var getRoute = function(_params, callback)
{

	var params = _params.params;

	//Set credentials of geodatabase
	connect();

	var query = "SELECT ST_ASText(geom) as wkt FROM shapes WHERE shape_id='"+ params.route +"'"


	geodb.geoQuery({
			querystring : query,
			debug : true
		}, function(json)
		{
			callback(pointsToLine(json));	
			//callback(json);
		}
	);
	//callback("data from geodatabase");
};


var getBusGPSLine = function(_params, callback)
{

	var params = _params.params;

	params["bus_id"] = 'B58703';
	//Set credentials of geodatabase
	connect();

	var query = "SELECT ST_ASText(geom) as wkt FROM gps_725_2016_04_08_shape_id_17343692 WHERE bus_identi = '"+ params.bus_id+"' ORDER BY gps_dateti"


	geodb.geoQuery({
			querystring : query,
			debug : true
		}, function(json)
		{
			callback(pointsToLine(json));	
			//callback(json);
		}
	);
	//callback("data from geodatabase");
};


var getBusGPSPoints = function(_params, callback)
{

	var params = _params.params;

	params["bus_id"] = 'B58703';
	//Set credentials of geodatabase
	connect();

	var query = "SELECT *, ST_ASText(geom) as wkt FROM gps_725_2016_04_08_shape_id_17343692 WHERE bus_identi = '"+ params.bus_id+"' ORDER BY gps_dateti"


	geodb.query({
			querystring : query,
			debug : true
		}, function(data)
		{
			callback(data);	
			//callback(json);
		}
	);
	//callback("data from geodatabase");
};


var getAllRoutes = function(_params, callback)
{

	// if(all_routes_cache != null)
	// {
	// 	callback(all_routes_cache);
	// }
	// else
	// {
		connect();

		geodb.geoQuery({
				geometry : "route",
				tableName : "all_routes_ordered",
				properties : "all",
				debug : true
			}, function(json){
				all_routes_cache = json;
				callback(all_routes_cache);
			}
		);
	// }
}

var pointsToLine = function(json)
{
	var line = {
		type : "FeatureCollection",
		features : []
	}
	var points = [];
	var bbox = [
		200, 
		200, 
		-200, 
		-200, 
	];
	for(i in json.features)
	{
		var coords = json.features[i].geometry.coordinates 
		points.push(coords);
		if(coords[0] < bbox[0])
			bbox[0] = coords[0];
		if(coords[0] > bbox[2])
			bbox[2] = coords[0];

		if(coords[1] < bbox[1])
			bbox[1] = coords[1];
		if(coords[1] > bbox[3])
			bbox[3] = coords[1];
	}

	var geometry = {
		bbox : bbox,
		type : "MultiLineString",
		coordinates : [points]
	}


	var feature = {
		"type" : "Feature",
		"geometry" : geometry,
		"properties" : {}
	};

	line.features.push(feature);

	return line;
};

module.exports = {
	getRoute : getRoute,
	getAllRoutes : getAllRoutes,
	getBusGPSLine : getBusGPSLine,
	getBusGPSPoints : getBusGPSPoints,
};
