/**
 * app_home.js
 * Controller for home
 * @author: Juan Camilo Ibarra
 * @Creation_Date: March 2016
 * @version: 0.1.0
 * @Update_Author : Juan Camilo Ibarra
 * @Date: March 2016
 */

var my_app = require("./app_core").my_app;

my_app.controller('home_ctrl', ['$scope', '$location', function($scope, $location){
	$scope.tabs = {
		tab_1 : {
			label : "Tab_1",
			template : "../../templates/map_template.html"
		},
		tab_2 : {
			label : "Tab_2",
			template : "../../templates/other_template.html"
		},
	};
	
	$scope.logout = function()
	{
		$location.path('/login');
	};
}]);
