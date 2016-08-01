/**
 * db_manager.js
 * Module to manage the communication with the database
 * @author: Juan Camilo Ibarra
 * @Creation_Date: March 2016
 * @version: 0.1.0
 * @Update_Author : Juan Camilo Ibarra
 * @Date: March 2016
 */


/**
 * Function to get data from database 
 * @param {Object} params params for the query from client
 * @param {Object} callback function to return retrieved data
 */
var getData = function(params, callback)
{
	//Get something from your database
	callback("some data from database");
};


module.exports = {
	getData : getData
};
