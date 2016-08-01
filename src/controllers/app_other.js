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

my_app.controller('other_ctrl', ['$scope', function($scope){
	$scope.title = "My Other Template!!";
}]);

