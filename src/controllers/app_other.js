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
require("datejs");

my_app.controller('other_ctrl', ['$scope', 'socket_srv', 'rest_srv', function($scope, socket_srv, rest_srv){
	
	$scope.labels = {
		select_bus : "Select bus",
		vel_profile : "Velocity profile. (Hover for interaction)",
		slider : "Use slider to move through time"
	};

	$scope.title = "Route";

	$scope.loading = false;

	$scope.buses = [];
	$scope.selectedBus = [];

	$scope.$watch("selectedBus", function(newVal){
		if(newVal.length != 0)
		{
			loadBus(newVal);
		}
	});
	
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
	    radius: 6,
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
	    
	    div.innerHTML += '<h4>Velocity</h4>';
	    for (var i = 0; i < colorMap.length; i++) {
	        div.innerHTML +=
	            '<i style="background:' + colorMap[i] + '"></i> ' +
	           valuesForLegend[i] + '<br>';
	    }
	    return div;
	};
	var legendLoaded = false;
	

	
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
	layersControl.addTo(myMap);

	L.control.scale({
		position : 'bottomleft',
		imperial: false
	}).addTo(myMap);

		
	$scope.pointIndex = 0;
	$scope.current_date = "";
	var route_points = [];
	var renderedPoints = [];

	var numPoints = 5;

	$scope.$watch("pointIndex", function(newVal, oldVal){
		
		if(route_points.length != 0)
		{
			if(newVal > numPoints)
			{
				$scope.current_date = route_points[newVal].gps_dateti;
				for(i in renderedPoints)
				{
					myMap.removeLayer(renderedPoints[i]);
				}
				var min = parseInt(newVal - numPoints);
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
				var f = d3.timeFormat('%a %d %m %Y %H:%M:%S');
				var d = Date.parse($scope.current_date, "yyyy-MM-dd HH:mm:ss");
				var v = f(d);
				//chart_vel_profile.xgrids([{value:d, text: ""}]);	
			}
		}
	});

	var updatePointsInMap = function(newVal)
	{
		if(newVal > numPoints)
		{
			$scope.current_date = route_points[newVal].gps_dateti;
			for(i in renderedPoints)
			{
				myMap.removeLayer(renderedPoints[i]);
			}
			var min = parseInt(newVal - numPoints);
			var max = min + numPoints
			for(var i = min ; i < max; i++)
			{
				var point = route_points[i];
				var wkt = point.wkt;
				var vel = parseFloat(point.velocity);
				pointsMarker.fillColor = colorScale(vel);
				if(i == max - 1)
					pointsMarker.weight = 3;
				else
					pointsMarker.weight = 1;
				var latlng_raw = wkt.substring(6,wkt.length - 1).split(" ");	
				var marker = L.circleMarker(L.latLng(parseFloat(latlng_raw[1]), parseFloat(latlng_raw[0])), pointsMarker).addTo(myMap);	
				renderedPoints.push(marker);
			}
			//chart_vel_profile.xgrids.remove();	
			var f = d3.timeFormat('%a %d %m %Y %H:%M:%S');
			var d = Date.parse($scope.current_date, "yyyy-MM-dd HH:mm:ss");
			var v = f(d);
			//chart_vel_profile.xgrids([{value:d, text: ""}]);	
		}
	}

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

    // socket_srv.subscribe_callback(
	// 	socket_srv.services.GET_ROUTE,
	// 	{
	// 		params : {
	// 			route : '17343692'
	// 		},
	// 		callback : function(_data)
	// 		{
	// 			console.log("draw lline route");
	// 			console.log(_data.data);
	// 			renderGeojson({geojson : _data.data, type : 'base'});
	// 		}
	// 	}
	// );

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
	    	x : 'x',
	        columns: [
	        ],
	        onmouseover : function(d)
	        {
	        	//console.log(d);
				updatePointsInMap(d.index);
	        }
	    },
	    point : {
	    	show : false
	    },
	    transition : {
			duration : 0
		},
		axis: {
	        x: {
	            type: 'timeseries',
	            tick: {
	                format: '%a %d %m %Y %H:%M:%S'
	            }
	        }
	    },
	    tooltip: {
	        format: {
	            value: function (value, ratio, id) {
	            	var f = d3.format(".2f");
	                return f(value);
	            }
	//            value: d3.format(',') // apply this format to both y and y2
	        }
	    }
	});

	var updateChartData = function()
	{
		var vels = velocities;
		vels.unshift("Velocity");
		

		var cats = ["x"];
		for(i in route_points)
		{
			var r = route_points[i];
			var d = Date.parse(r.date_time, "yyyy-MM-dd HH:mm:ss");

			cats.push(d);
		}

		chart_vel_profile.load({
			columns : [cats, vels]
		});
	}
	

	// socket_srv.subscribe_callback(
	// 	socket_srv.services.GET_BUSES_FROM_ROUTE,
	// 	{
	// 		callback : function(_data)
	// 		{
	// 			$scope.buses = _data.data;
	// 		}
	// 	}
	// );

   //var routeName = 725;

   	$scope.$on("route_select", function (event,args){


         routeName = args.properties.route_name;
		 $scope.title = "Route " + routeName;
	 	renderGeojson({geojson : args, type : 'base'});

		rest_srv.getBuses(
			{
				route_name : routeName,
				date : "2016-04-22"
			},
			function(data){
				var busesList = data.msg.buses;
				var reA = /[^a-zA-Z]/g;
				var reN = /[^0-9]/g;

				busesList.sort(function(a,b){
						var aA = a.replace(reA, "");
						var bA = b.replace(reA, "");
						if(aA === bA) {
							var aN = parseInt(a.replace(reN, ""), 10);
							var bN = parseInt(b.replace(reN, ""), 10);
							return aN === bN ? 0 : aN > bN ? 1 : -1;
						} else {
							return aA > bA ? 1 : -1;
						}
					}); 


				$scope.buses = busesList;
				console.log('Sort list buses');
				console.log($scope.buses);
			}
		)

	});



	var loadBus = function(bus_id)
	{
		$scope.title = "Route " + routeName + " - Bus " + bus_id;
		$scope.loading = true;

		rest_srv.getBusData(
			{
				bus_identifier : bus_id,
				date : "2016-04-22"
			},function(data){
		
				velocities = [];
				route_points = data.msg.points;

				route_points.sort(function(a,b){
					return new Date(a.date_time) - new Date(b.date_time);
				});

				console.log('Sort points');
				console.log(data);

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
				colorScale = d3.scaleThreshold().domain(thresholdDomain).range(colorMap);
				if(legendLoaded)
					myMap.removeControl(legend);
				legend.addTo(myMap);
				updateChartData();
				legendLoaded = true;
				$scope.loading = false;
				$scope.pointIndex = 0;
			})
	}

		
}]);

