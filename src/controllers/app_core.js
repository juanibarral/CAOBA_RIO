/**
 * app_core.js
 * Controller of core application 
 * @author: Juan Camilo Ibarra
 * @Creation_Date: March 2016
 * @version: 0.1.0
 * @Update_Author : Juan Camilo Ibarra
 * @Date: March 2016
 */

var angular = require("angular");
require("angular-route");
require("angular-animate");
require("angular-aria");
require("angular-messages");
require("angular-material");

var my_app = angular.module("my_app", ['ngMaterial', "ngRoute"]);

my_app.config( function($mdThemingProvider, $routeProvider){
	$mdThemingProvider.theme('default')
		.primaryPalette('grey');
	
	$routeProvider
		.when('/login',
			{
				templateUrl : "templates/login_template.html",
				controller : "login_ctrl"
			}
		)
		.when('/home',
			{
				templateUrl : "templates/home_template.html",
				controller : 'home_ctrl'
			}
		)
		.otherwise('/login',
			{	
				templateUrl : "templates/login_template.html",
				controller : "login_ctrl"
			}
		);
});

my_app.run(['$rootScope', 'auth_srv', '$location', function($rootScope, auth_srv, $location){
	$rootScope.$on('$routeChangeStart', function(event){
		auth_srv.validateUser(function(response){
			console.log(response);
			if(response.type == 'error')
			{
				$location.path('/home');
			}
			else if(response.type == 'success')
			{
				
			}
		});
		
	});
}]);

module.exports = {
	my_app : my_app
};
