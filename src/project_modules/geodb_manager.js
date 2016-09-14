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

	
	//Set credentials of geodatabase
	connect();

	var query = "SELECT *, ST_ASText(geom) as wkt FROM gps_725_2016_04_08_shape_id_17343692 WHERE bus_identi = '"+ params.bus_id+"' ORDER BY gps_dateti"


	geodb.query({
			querystring : query,
			debug : true
		}, function(data)
		{
			callback(data);	
		}
	);
};

var getBusesList = function(_params, callback)
{

	var params = _params.params;

	
	//Set credentials of geodatabase
	connect();

	var query = "SELECT bus_identi FROM gps_725_2016_04_08_shape_id_17343692 GROUP BY bus_identi"


	geodb.query({
			querystring : query,
			debug : true
		}, function(rows)
		{
			var data = [];
			for(i in rows)
			{
				data.push(rows[i].bus_identi);
			}
			callback(data);	
		}
	);
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

var getNeighborhoods = function(_params, callback)
{
	connect();
	geodb.geoQuery({
			geometry : "geom",
			tableName : "limites_barrios_wgs84",
			properties : "all",
			debug : true
		}, function(json){
			callback(json);
		}
	);
}

var getNeighborhoodsData = function(_params, callback)
{
	connect();
	var query = "SELECT * FROM count_barrios_routes";
	geodb.query({
			querystring : query,
			debug : true
		}, function(rows){
			var data = {};
			for(i in rows)
			{
				var r = rows[i];
				data[r.codbairro] = r.count;
			}
			callback(data);
		}
	);
}

var getRoutesFromNeighborhood = function(_params, callback)
{
	connect();

	var params = _params.params;

	var query = "SELECT all_routes_ordered.route " +
				" FROM limites_barrios_wgs84, all_routes_ordered " +
				" WHERE limites_barrios_wgs84.codbairro = '" + params.cod_barrio +"' AND ST_Intersects(limites_barrios_wgs84.geom, ST_GeomFromText(all_routes_ordered.route))"

	// geodb.query({
	// 		querystring : query, 
	// 		debug : true
	// 	}, function(rows){
	// 		callback(rows);
	// 	}
	// );

	geodb.geoQuery({
		geometry : "route",
		properties : "all_routes_ordered.route",
		tableName : "limites_barrios_wgs84, all_routes_ordered",
		where : "limites_barrios_wgs84.codbairro = '" + params.cod_barrio +"' AND ST_Intersects(limites_barrios_wgs84.geom, ST_GeomFromText(all_routes_ordered.route))",
		debug : true,
		}, function(data){
			callback(data);
		}
	);
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
	getBusesList : getBusesList,
	getNeighborhoods : getNeighborhoods,
	getNeighborhoodsData : getNeighborhoodsData,
	getRoutesFromNeighborhood : getRoutesFromNeighborhood
};
