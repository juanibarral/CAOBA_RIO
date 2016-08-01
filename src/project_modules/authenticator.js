/**
 * authenticator.js
 * Authentication module for application
 * @author: Juan Camilo Ibarra
 * @Creation_Date: March 2016
 * @version: 0.1.0
 * @Update_Author : Juan Camilo Ibarra
 * @Date: March 2016
 */

/**
 * Authenticates the user using custom process 
 * @param {Object} params map with login and password
 * @param {Object} callback function to return the object {success : true|false}
 */
var authenticateUser = function(params, callback)
{
	var login = params.login;
	var password = params.password;
	
	//Change to use your custom authentication procedures
	
	if(login == 'test' && password == 'test')
	{
		callback({success : true});
	}
	else
	{
		callback({success : false});
	}
};

module.exports = {
	authenticateUser : authenticateUser,
};
