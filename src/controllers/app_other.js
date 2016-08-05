/**
 * app_other.js
 * Controller for other view 
 * @author: Juan Camilo Ibarra
 * @Creation_Date: March 2016
 * @version: 0.1.0
 * @Update_Author : Juan Camilo Ibarra
 * @Date: March 2016
 */

var my_app = require("./app_core").my_app;

my_app.controller('other_ctrl', ['$scope', 'socket_srv', function($scope, socket_srv){
	$scope.title = "Nuevo mensaje";



}]);

