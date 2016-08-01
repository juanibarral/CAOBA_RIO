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
	$scope.titles = {
		map : "My map",	
	};
	
	var center = [4.6046, -74.0656];
	var zoom = 18;
	
	var myMap = L.map('my_map', {
		center : center, 
		zoom : zoom, 
		minZoom : 15,
		maxZoom : 20
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

    //infoControl.addTo(myMap);
}]);

