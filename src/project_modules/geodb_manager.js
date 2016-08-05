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
var getRoute = function(_params, callback)
{

	var params = _params.params;

	//Set credentials of geodatabase
	geodb.setCredentials({
		type : 'postgis',
		host : 'localhost',
		user : 'vafuser',
		password : '1234',
		database : 'CaobaRioDB',
	});

	var query = "SELECT ST_ASText(geom) as wkt FROM shapes WHERE shape_id='"+ params.route +"'"


	geodb.geoQuery({
			querystring : query,
			debug : true
		}, function(json)
		{
			//callback(pointsToLine(json));	
			callback(json);
		}
	);


	//callback("data from geodatabase");
};

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
		coordinates : points
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
};
