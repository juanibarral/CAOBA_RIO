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
var d3 = require("d3");
var c3 = require("c3");
var colorbrewer = require("colorbrewer");

my_app.controller('other_ctrl', ['$scope', 'socket_srv', function($scope, socket_srv){
	$scope.title = "Route 725";
	
	var chart_vel_profile;
	var velocities = [];
	var max_vel = -1;
	var min_vel = -1;

	var numPoints = 5;
	var colorMap = colorbrewer.YlOrRd[numPoints];
	var colorScale;
	var thresholdDomain;

	
	var center = [-22.727, -43.151];
	var zoom = 9;

	var myMap = L.map('route_map', {
		center : center, 
		zoom : zoom, 
	}).setView(center, zoom);
	var layersControl = L.control.layers(); 
	var infoControl = L.control();

	var pointsMarker  = {
	    radius: 4,
	    fillColor: "#ff7800",
	    color: "#000",
	    weight: 1,
	    opacity: 1,
	    fillOpacity: 0.8
	};


	var legend = L.control({position: 'bottomright'});
	legend.onAdd = function (map) {
	    var div = L.DomUtil.create('div', 'info legend');

	    var f = d3.format(".2f");

	    var valuesForLegend = [];
	    valuesForLegend.push(min_vel + " - " + f(thresholdDomain[0]));
	    for(var i = 0; i < numPoints - 2; i++)
	    {
	    	valuesForLegend.push(f(thresholdDomain[i]) + " - " + f(thresholdDomain[i+1]));	
	    }
		valuesForLegend.push(f(thresholdDomain[numPoints - 2]) + " - " + f(max_vel));
	    
	    for (var i = 0; i < colorMap.length; i++) {
	        div.innerHTML +=
	            '<i style="background:' + colorMap[i] + '"></i> ' +
	           valuesForLegend[i] + '<br>';
	    }
	    return div;
	};
	

	
	tileGoogleRoadmap = new L.Google('ROADMAP');
	tileGoogleHybrid = new L.Google('HYBRID');
	tileOSM = new L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
	tileOSMBW = new L.tileLayer.provider('OpenStreetMap.BlackAndWhite');
	
	myMap.addLayer(tileOSMBW);
	layersControl.addBaseLayer(tileGoogleRoadmap, "Google maps (Roadmap)");
	layersControl.addBaseLayer(tileGoogleHybrid, "Google maps (Hybrid)");
	layersControl.addBaseLayer(tileOSM, "Open Street maps");
	layersControl.addBaseLayer(tileOSMBW, "Open Street maps (B/W)");
	layersControl.addTo(myMap);

	L.control.scale({
		position : 'bottomleft',
		imperial: false
	}).addTo(myMap);

		
	$scope.pointIndex = 0;
	var route_points = [];
	var renderedPoints = [];

	var numPoints = 5;

	$scope.$watch("pointIndex", function(newVal, oldVal){
		console.log(newVal);
		if(route_points.length != 0)
		{
			if(newVal > numPoints)
			{
				for(i in renderedPoints)
				{
					myMap.removeLayer(renderedPoints[i]);
				}
				var min = parseInt(newVal - (numPoints/2));
				var max = min + numPoints
				for(var i = min ; i < max; i++)
				{
					var point = route_points[i];
					var wkt = point.wkt;
					var vel = parseFloat(point.velocity);
					pointsMarker.fillColor = colorScale(vel);
					var latlng_raw = wkt.substring(6,wkt.length - 1).split(" ");	
					var marker = L.circleMarker(L.latLng(parseFloat(latlng_raw[1]), parseFloat(latlng_raw[0])), pointsMarker).addTo(myMap);	
					renderedPoints.push(marker);
				}
				//chart_vel_profile.xgrids.remove();	
				//chart_vel_profile.xgrids([{value: newVal, text: ""}]);	
			}
		}
	});

	var geojsons = {};

	var renderGeojsonPoints = function(geojson)
    {
    	var jsonLayer = L.geoJson(geojson,{
    		pointToLayer : function(feature, latlng) {
    			return L.circleMarker(latlng, pointsMarker);
    		}
    	}).addTo(myMap);
    };

    var renderGeojson = function(params)
    {

    	var styleSelected = {
			color : "#FFFF00",
			weight: 3,
		    opacity: 1
		}
		var styleUnselected = {
			color : params.type == 'base' ? "#000000" : "#0000FF",
			weight: 2,
		    opacity: 0.8
		}

    	var jsonLayer = L.geoJson(params.geojson,{
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
    	if(params.type == 'base')
    	{
    		myMap.fitBounds(jsonLayer.getBounds());
    		geojsons['base'] = jsonLayer
    	}
    	else if(params.type == 'gps')
    	{
			geojsons[params.name] = jsonLayer
    	}
    		

    }

    var highlightStructures = function(e)
	{
		var layer = e.target;
	    layer.setStyle(styleSelected);
		layer.bringToFront();
	};
	
	var resetHighlightStructures = function (e) {
	    var layer = e.target;
	    layer.setStyle(styleUnselected);	
	};

    socket_srv.subscribe_callback(
		socket_srv.services.GET_ROUTE,
		{
			params : {
				route : '17343692'
			},
			callback : function(_data)
			{
				//console.log(_data.data);
				//renderGeojsonPoints(_data.data);
				renderGeojson({geojson : _data.data, type : 'base'});
			}
		}
	);	

	// socket_srv.subscribe_callback(
	// 	socket_srv.services.GET_BUS_GPS_LINE,
	// 	{
	// 		params : {
	// 			route : '17343692'
	// 		},
	// 		callback : function(_data)
	// 		{
	// 			//console.log(_data.data);
	// 			//renderGeojsonPoints(_data.data);
	// 			renderGeojson({geojson : _data.data, type : 'gps', name :'B58703'});
	// 		}
	// 	}
	// );

	chart_vel_profile = c3.generate({
		bindto : "#chart_vel_profile",
		size : {
			height : 200
		},
	    data: {
	        columns: [
	        ]
	    },
	    point : {
	    	show : false
	    },
	    transition : {
			duration : 0
		}
	});

	var updateChartData = function()
	{
		var cols = [];
		var vels = velocities;
		vels.unshift("Velocity");
		cols.push(vels);
		chart_vel_profile.load({
			columns : cols
		});
	}
	

	socket_srv.subscribe_callback(
		socket_srv.services.GET_BUS_GPS_POINTS,
		{
			params : {
				route : '17343692'
			},
			callback : function(_data)
			{
				//console.log(_data.data);
				route_points = _data.data;
				$scope.route_points_counter = route_points.length;
				for(i in route_points)
				{
					velocities.push(parseFloat(route_points[i].velocity));
				}
				max_vel = d3.max(velocities);
				min_vel = d3.min(velocities);
				var vel_step = (max_vel - min_vel) / numPoints;
				thresholdDomain = [];
				for(var i = 1; i < numPoints; i++)
				{
					thresholdDomain.push(min_vel + (i * vel_step));
				}
				//renderGeojsonPoints(_data.data);
				//renderGeojson({geojson : _data.data, type : 'gps', name :'B58703'});
				colorScale = d3.scaleThreshold().domain(thresholdDomain).range(colorMap);
				legend.addTo(myMap);
				updateChartData();

			}
		}
	);	
}]);

