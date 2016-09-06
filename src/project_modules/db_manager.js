/**
 * db_manager.js
 * Module to manage the communication with the database
 * @author: Juan Camilo Ibarra
 * @Creation_Date: March 2016
 * @version: 0.1.0
 * @Update_Author : Juan Camilo Ibarra
 * @Date: March 2016
 */
var db = require('geotabuladb');

/**
 * Function to get data from database 
 * @param {Object} params params for the query from client
 * @param {Object} callback function to return retrieved data
 */
var getListOfRoutes = function(params, callback)
{
	//Get something from your database
	db.setCredentials({
		type : 'postgis',
		//host : 'localhost',
		host : 'guitaca.uniandes.edu.co:5432',
		user : 'vafuser',
		password : '1234',
		database : 'CaobaRioDB',
	});


	var query = "SELECT shape_id FROM shapes GROUP By shape_id ORDER BY shape_id";
	db.query({
			querystring : query,
			debug : true
		}, function(_data)
		{
			var data = [];
			for(i in _data)
			{
				data.push(_data[i].shape_id);
			}
			callback(data);		
		}
	);
};


module.exports = {
	getListOfRoutes : getListOfRoutes,
};
