/**
 * app_login.js
 * Controller for login
 * @author: Juan Camilo Ibarra
 * @Creation_Date: March 2016
 * @version: 0.1.0
 * @Update_Author : Juan Camilo Ibarra
 * @Date: March 2016
 */

var my_app = require("./app_core").my_app;

my_app.controller('login_ctrl', ['$scope', '$http', '$location','$mdDialog', 'auth_srv',function($scope, $http, $location, $mdDialog, auth_srv){
	
	$scope.login = function()
    {
    	if($scope.user)
    	{
    		if(!$scope.user.login)
    			showDialog('Empty fields', 'please fill user field');
    		else if(!$scope.user.password)
    			showDialog('Empty fields', 'please fill password field');
    		else
    			$http({
					method : 'POST',
					url : '/api/authenticate',
					headers: {'Content-Type': 'application/x-www-form-urlencoded'},
					data : 'login=' + $scope.user.login + '&password=' + $scope.user.password
				}).then(
					function successCallback(response){
						if(response.data.success)
						{
							auth_srv.setToken(response.data.token);
							//auth_srv.callREST({method : 'get', url : '/#/home'});
							$location.path('/home');
						}
						else
						{
							//$scope.open();
						}
					},
					function errorCallback(response){
						console.log(response);
					}
				);
    	}
    	else
    	{
    		showDialog('Empty fields', 'please fill user and password fields');
    	}
    };
    
    var showDialog = function(title, message)
    {
    	alert = $mdDialog.alert()
    			.title(title)
    			.content(message)
    			.ok('Close');
    		$mdDialog
    			.show(alert)
    			.finally(function(){
    				alert = unefined;
    			});
    };
}]);


my_app.factory('auth_srv', [ '$http', function($http){
	var token = null;
	
	var setToken = function(tk)
	{
		token = tk;
	};
	
	var validateUser = function(callback)
	{
		if(token)
		{
			$http({
				method : 'POST',
				url : '/api/validate',
				headers: {'x-access-token': token}
			}).then(
				function successCallback(response){
					callback({type : 'success', response : response});
				},
				function errorCallback(response){
					callback({type : 'error', response : response});
				}
			);
		}
		else
		{
			callback({type : 'error', response : "No token"});
		}
		
	};
	
	return {
		setToken : setToken,
		validateUser : validateUser
	};
}]);