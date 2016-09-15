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
var colorbrewer = require("colorbrewer");
var d3 = require("d3");
var my_app = require("./app_core").my_app;

my_app.controller('map_ctrl', ['$rootScope', '$scope', 'socket_srv',  function($rootScope, $scope, socket_srv){
	
	$scope.labels = {
		map : "My map",	
		routes_list : "Lista de rutas",
		loading : "Loading please wait...",
		rendering : "Rendering please wait...",
		load_button : "Load all routes"
	}

	$scope.lab_processing = $scope.labels.loading;

	$scope.processing = false;

	var center = [-22.727, -43.151];
	var zoom = 9;

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

	var neighborSelected = 'none';
	
	tileGoogleRoadmap = new L.Google('ROADMAP');
	tileGoogleHybrid = new L.Google('HYBRID');
	tileOSM = new L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
	tileOSMBW = new L.tileLayer.provider('OpenStreetMap.BlackAndWhite');
	tileESRIGray = new L.tileLayer.provider('Esri.WorldGrayCanvas');
	
	myMap.addLayer(tileESRIGray);
	layersControl.addBaseLayer(tileESRIGray, "ESRI World Gray Canvas");
	layersControl.addBaseLayer(tileGoogleRoadmap, "Google maps (Roadmap)");
	layersControl.addBaseLayer(tileGoogleHybrid, "Google maps (Hybrid)");
	layersControl.addBaseLayer(tileOSM, "Open Street maps");
	layersControl.addBaseLayer(tileOSMBW, "Open Street maps (B/W)");
	layersControl.addBaseLayer(tileOSMBW, "Open Street maps (B/W)");

	layersControl.addTo(myMap);

	L.control.scale({
		position : 'bottomleft',
		imperial: false
	}).addTo(myMap);

	var info = L.control();

	info.onAdd = function (map) {
	    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
	    this.update();
	    return this._div;
	};

	// method that we will use to update the control based on feature properties passed
	info.update = function (props) {
		if(props)
		{
			this._div.innerHTML = '<h4>Properties:</h4>';
		    for(each in props)
		    {
		    	this._div.innerHTML += "<b>" + each + ": </b>" + props[each] + "<br>"
		    } 	
		}
		else
		{
			this._div.innerHTML = null;
		}
	    
	};

	info.addTo(myMap);

	

	var colorScale;
	//var numPoints = 5; //Number of scales
	var colorMap;
	var thresholdDomain;
	var min;
	var max;

	var legend = L.control({position: 'bottomright'});
	legend.onAdd = function (map) {
	    var div = L.DomUtil.create('div', 'info legend');

	    //var f = d3.format(".2n");

	    var valuesForLegend = [];

	    //valuesForLegend.push(min + " - " + f(thresholdDomain[0]));
		valuesForLegend.push(min + " - " + thresholdDomain[0]);
	    for(var i = 0; i < thresholdDomain.length - 1; i++)
	    {
	    	//valuesForLegend.push(f(thresholdDomain[i]) + " - " + f(thresholdDomain[i+1]));	
	    	valuesForLegend.push(thresholdDomain[i] + " - " + thresholdDomain[i+1]);	
	    }
		//valuesForLegend.push(f(thresholdDomain[thresholdDomain.length - 1]) + " - " + f(max));
		valuesForLegend.push(thresholdDomain[thresholdDomain.length - 1] + " - " + max);
	    
	    div.innerHTML += '<h4>Connectivity</h4>';
	    for (var i = 0; i < colorMap.length; i++) {
	        div.innerHTML +=
	            '<i style="background:' + colorMap[i] + '"></i> ' +
	           valuesForLegend[i] + '<br>';
	    }
	    return div;
	};

	var styleSelected = {
		color : "#00FFFF",
		weight: 3,
	    opacity: 1
	}
	var styleUnselected = {
		color : "#756bb1",
		weight: 2,
	    opacity: 0.6
	}

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
    		onEachFeature : function(feature, layer){
    			layer.setStyle(styleUnselected);
    			layer.on({
    				mouseover : function(e){
    					var layer = e.target;
					    layer.setStyle(styleSelected);
						layer.bringToFront();
    				},
    				mouseout : function(e){
						var layer = e.target;
						layer.setStyle(styleUnselected);	
    				}
    			});
    		}
    	}).addTo(myMap);
    	console.log("End rendering");
    	$scope.processing = false;
    	jsonLayer.bringToFront();
    }

    var jsonLayerBase;
    var renderGeojsonBase = function(geojson)
    {
    	jsonLayerBase = L.geoJson(geojson,{
    		onEachFeature : function(feature, layer){
    			layer.setStyle({
    				color : "#000000",
					weight: 1,
				    opacity: 1,
				    fillColor : "#AAAAAA",
				    fillOpacity : 0.5
    			});
    			layer.on({
    				mouseover : highlightStructures,
    				mouseout : resetHighlightStructures,
    				click : selectNeighborhood,
    			});
    		}
    	}).addTo(myMap);

    	myMap.fitBounds(jsonLayerBase.getBounds());
    }

    var highlightStructures = function(e)
	{
		if(neighborSelected == 'none')
		{
			var layer = e.target;
		    layer.setStyle({
		    	weight : 3,
		    	fillOpacity : 1.0
		    });
			info.update(layer.feature.properties);	
		}
	};
	
	var resetHighlightStructures = function (e) {
	    if(neighborSelected == 'none')
	    {
		    var layer = e.target;
		    layer.setStyle({
		    	weight : 1,
		    	fillOpacity : 0.5
		    });	
		    info.update();	
	    }
	    
	};

	var selectNeighborhood = function(e){
		if(neighborSelected == 'none')
		{
			$scope.processing = true;
			var layer = e.target;
			var codBarrio = layer.feature.properties.codbairro;
			neighborSelected = codBarrio;

			socket_srv.subscribe_callback(
				socket_srv.services.GET_ROUTES_FROM_NEIGHBORHOODS,
				{
					params : {
						cod_barrio : codBarrio
					},
					callback : function(_data)
					{
						renderGeojson(_data.data);
						$scope.processing = false;
					}
				}
			);	
		}
	};

	var update_neighborhoods = function(data)
	{
		max = Number.MIN_VALUE;
		min = Number.MAX_VALUE;

		for(each in data)
		{
			var v = parseInt(data[each]);
			if(v > max)
				max = v;
			if(v < min)
				min = v;
		}

		thresholdDomain = d3.ticks(min, max, 5);
		colorMap = colorbrewer.YlOrBr[thresholdDomain.length + 1];

		// var v_step = (max - min) / numPoints;
		// thresholdDomain = [];
		// for(var i = 1; i < numPoints; i++)
		// {
		// 	thresholdDomain.push(min + (i * v_step));
		// }
		
		colorScale = d3.scaleThreshold().domain(thresholdDomain).range(colorMap);

		for(i in jsonLayerBase._layers)
		{
			var l = jsonLayerBase._layers[i];
			var codb = l.feature.properties.codbairro;
			var value = parseFloat(data[codb] == undefined ? min : data[codb]);
			var color = colorScale(value);
			l.feature.properties['routes'] = value;
			l.setStyle({
				fillColor : color
			});
		}	

		legend.addTo(myMap);
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
						//console.log(_data.data);
						//renderGeojsonPoints(_data.data);

						console.log('data of current Route by socket');
				     	console.log(_data);
					
						renderGeojson(_data);
					}
				}
			);
		}
	});

	$scope.routesList = [];

    $scope.loadAllRoutes = function()
    {
    	$scope.processing = true;
		socket_srv.subscribe_callback(
			socket_srv.services.GET_ALL_ROUTES,
			{
				params : {
					
				},
				callback : function(_data)
				{
					$scope.lab_processing = $scope.labels.rendering;
					//console.log("Received from server, rendering");

					//renderGeojsonPoints(_data.data);

					console.log('data of all routes by socket');
					console.log(_data);

					renderGeojson(_data.data);
				}
			}
		);
    }

	$scope.processing = true;
   	socket_srv.subscribe_callback(
		socket_srv.services.GET_NEIGHBORHOODS,
		{
			callback : function(_data)
			{
				renderGeojsonBase(_data.data);
				socket_srv.subscribe_callback(
					socket_srv.services.GET_NEIGHBORHOODS_DATA,
					{
						callback : function(_data)
						{
                         console.log('data of vecinos by socket');
					     console.log(_data);

							update_neighborhoods(_data.data);
							$scope.processing = false;
						}
					}
				);
			}
		}
	);

	

}]);

