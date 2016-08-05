/**
 * app_map.js
 * Controller for the project map 
 * @author: Juan Camilo Ibarra
 * @Creation_Date: March 2016
 * @version: 0.1.0
 * @Update_Author : Juan Camilo Ibarra
 * @Date: March 2016
 */

require('leaflet');
require('../node_modules/leaflet-plugins/layer/tile/Google.js');
require('leaflet-providers');
require('angular-material-data-table');
var my_app = require("./app_core").my_app;

my_app.controller('map_ctrl', ['$rootScope', '$scope', 'socket_srv', function($rootScope, $scope, socket_srv){
	
	$scope.labels = {
		map : "My map",	
		routes_list : "Lista de rutas"
	}

	var center = [-22.727, -43.151];
	var zoom = 10;

	var pointsMarker  = {
	    radius: 4,
	    fillColor: "#ff7800",
	    color: "#000",
	    weight: 1,
	    opacity: 1,
	    fillOpacity: 0.8
	};
	
	var myMap = L.map('my_map', {
		center : center, 
		zoom : zoom, 
	}).setView(center, zoom);
	var layersControl = L.control.layers(); 
	var infoControl = L.control();
	
	tileGoogleRoadmap = new L.Google('ROADMAP');
	tileGoogleHybrid = new L.Google('HYBRID');
	tileOSM = new L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
	tileOSMBW = new L.tileLayer.provider('OpenStreetMap.BlackAndWhite');
	
	myMap.addLayer(tileGoogleRoadmap);
	layersControl.addBaseLayer(tileGoogleRoadmap, "Google maps (Roadmap)");
	layersControl.addBaseLayer(tileGoogleHybrid, "Google maps (Hybrid)");
	layersControl.addBaseLayer(tileOSM, "Open Street maps");
	layersControl.addBaseLayer(tileOSMBW, "Open Street maps (B/W)");
	layersControl.addTo(myMap);

	L.control.scale({
		position : 'bottomleft',
		imperial: false
	}).addTo(myMap);

  	var renderGeojsonPoints = function(geojson)
    {
    	var jsonLayer = L.geoJson(geojson,{
    		pointToLayer : function(feature, latlng) {
    			return L.circleMarker(latlng, pointsMarker);
    		}
    	}).addTo(myMap);
    };

    var renderGeojson = function(geojson)
    {
    	var jsonLayer = L.geoJson(geojson,{
    		
    	}).addTo(myMap);
    }

	$scope.currentRoute = [];

	$scope.$watch("currentRoute", function(newVal){
		if(newVal.length != 0)
		{
			var route = newVal;
			socket_srv.subscribe_callback(
				socket_srv.services.GET_ROUTE,
				{
					params : {
						route : route
					},
					callback : function(_data)
					{
						console.log(_data.data);
						renderGeojsonPoints(_data.data);
						//renderGeojson(_data.data);
					}
				}
			);
		}
	});

	$scope.routesList = [];
	
	socket_srv.subscribe_callback(
		socket_srv.services.GET_LIST_OF_ROUTES,
		{
			callback : function(_data)
			{
				var list = _data.data;
				$scope.routesList = list;
			}
		}
	);

    //infoControl.addTo(myMap);
}]);

