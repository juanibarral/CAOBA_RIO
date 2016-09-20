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

var dummyData = require('../images/count.js');
var dummyRoute = require('../images/route.js');

var colorbrewer = require("colorbrewer");
var d3 = require("d3");
var my_app = require("./app_core").my_app;

my_app.controller('map_ctrl', ['$rootScope', '$scope', 'socket_srv', 'rest_srv', function($rootScope, $scope,socket_srv, rest_srv){
	
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

   //legend of map
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

		//console.log("geo Points");
		//console.log(geojson);
    	var jsonLayer = L.geoJson(geojson,{
    		pointToLayer : function(feature, latlng) {
    			return L.circleMarker(latlng, pointsMarker);
    		}
    	}).addTo(myMap);
    };

    var renderGeojson = function(geojson)
    {
		//console.log("geo render");
		//console.log(geojson);

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
    				},
                   click : function (e){
					   var routesearch = e.target.feature.properties.route_name;
					      $rootScope.$broadcast("tab_select");
						  $rootScope.$broadcast("changeLabel",routesearch);
                          $rootScope.$broadcast("route_select",routesearch);
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
		//console.log('geojson Base');
		//console.log(geojson);

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
		$scope.processing = false;
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
   
   //show routes for barrio
	var selectNeighborhood = function(e){
		if(neighborSelected == 'none')
		{
			console.log("draw routes for barrio");
			$scope.processing = true;
			var layer = e.target;
			var codBarrio = layer.feature.properties.codbairro;
			neighborSelected = codBarrio;
         
            var raw_data_line = builderGeojsonLine({msg : dummyRoute.dummyRoute});
			renderGeojson(raw_data_line);

			/*
			rest_srv.getRoutes(
						{
							cod_barrio : codBarrio
						},function(data){
							renderGeojson(_data.data);
			// 				$scope.processing = false;
						})
			*/


			// socket_srv.subscribe_callback(
			// 	socket_srv.services.GET_ROUTES_FROM_NEIGHBORHOODS,
			// 	{
			// 		params : {
			// 			cod_barrio : codBarrio
			// 		},
			// 		callback : function(_data)
			// 		{
			// 			renderGeojson(_data.data);
			// 			$scope.processing = false;
			// 		}
			// 	}
			// );	
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
			var codb = l.feature.properties.id;
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
					renderGeojson(_data.data);
				}
			}
		);
    }

	$scope.processing = true;


	////draw map
  	// socket_srv.subscribe_callback(
	// 	socket_srv.services.GET_NEIGHBORHOODS,
	// 	{
	// 		callback : function(_data)
	// 		{
	// 			renderGeojsonBase(_data.data);
	// 			socket_srv.subscribe_callback(
	// 				socket_srv.services.GET_NEIGHBORHOODS_DATA,
	// 				{
	// 					callback : function(_data)
	// 					{
	// 						console.log("data load map shape");
    //                         console.log(_data.data);
	// 						update_neighborhoods(_data.data);
	// 						$scope.processing = false;
	// 					}
	// 				}
	// 			);
	// 		}
	// 	}
	// );


	// rest_srv.getRoutesCount(
	// {
		
	// },function(data){

	// 	var geojson = builderGeojson(data);
	// 	renderGeojsonBase(geojson);

	// });


var raw_data = builderGeojson({msg : dummyData.dummy});
renderGeojsonBase(raw_data.geojson);
update_neighborhoods(raw_data.data);


function builderGeojson(data){
    var response = {};
    var geoData = {};
	var dataResult = {};
	var feature = [];
    geoData.type ="FeatureCollection";

    //recursivity count 
   	for(var i = 0 ; i < data.msg.count.length;i++){
      if((data.msg.count[i].municipio != "Oceano") ) {
	    
		var objData = {};  
		objData.type = "Feature";
		var geometryProperties = {};
        
		dataResult[data.msg.count[i].barrio] = data.msg.count[i].count;

		geometryProperties.district_code = data.msg.count[i].cod_ibge;
		geometryProperties.name = data.msg.count[i].reggov;
		geometryProperties.district_name = data.msg.count[i].municipio;
		geometryProperties.routes = data.msg.count[i].count;
		geometryProperties.id = data.msg.count[i].barrio;

		var geometryObj = {};
		var coordinatesObj = [];

		geometryObj.coordinates = [];
		geometryObj.bbox = [];
		geometryObj.type = "Polygon";

		var maxX = null, minX = null;
		var maxY = null, minY = null; 
		
		for(var j = 0 ; j < data.msg.count[i].shape.coordinates[0].length;j++){
			
			var coordenate = [];
			coordenate = data.msg.count[i].shape.coordinates[0][j];
			
			if(maxX == null){
				maxX = coordenate[0]
			}  else if(maxX< coordenate[0]){
			maxX = coordenate[0]; 
			}

			if(maxY == null){
				maxY = coordenate[1]
			} else if(maxY< coordenate[1]) {
			maxY = coordenate[1]; 
			}
			
			if(minX == null){
				minX = coordenate[0]
			}  else if(minX>coordenate[0]){
				minX = coordenate[0]
			}

			if(minY == null){
				minY = coordenate[1]
			}  else if(minX>coordenate[1]){
				minY = coordenate[1]
			}
			coordinatesObj [j] =  coordenate;
		} 
		geometryObj.coordinates[0] = coordinatesObj;
		
		geometryObj.bbox[0] = minX;
		geometryObj.bbox[1] = minY;
		geometryObj.bbox[2] = maxX;
		geometryObj.bbox[3] = maxY;

		objData.properties = geometryProperties;
		objData.geometry = geometryObj;
		feature[i] = objData;
	 	
	  }
    } 
    
	geoData.features = feature;
	
	response.data = dataResult;
	console.log("result data");
	//console.log(response.data);

	response.geojson = geoData;
	//console.log("result builder");
	//console.log(response);
    
    return response;
}

function builderGeojsonLine(data){

	console.log("request builder Line");
	console.log(data);

    var geoData = {};
	var feature = [];
    geoData.type ="FeatureCollection";

    //recursivity count 
   	for(var i = 0 ; i < data.msg.rutas.length;i++){
	  var objData = {};  
	  objData.type = "Feature";
	  var geometryProperties = {};

	  geometryProperties.route_name = data.msg.rutas[i].route_name;

	  var geometryObj = {};
	  var coordinatesObj = [];

	  geometryObj.coordinates = [];
	  geometryObj.bbox = [];
      geometryObj.type = "LineString";

	  var maxX = null, minX = null;
	  var maxY = null, minY = null; 
     
	 for(var j = 0 ; j < data.msg.rutas[i].points.coordinates.length;j++){
		 
         var coordenate = [];
		 coordenate = data.msg.rutas[i].points.coordinates[j];
        
		if(maxX == null){
         	maxX = coordenate[0]
		}  else if(maxX< coordenate[0]){
		   maxX = coordenate[0]; 
	    }

		if(maxY == null){
         	maxY = coordenate[1]
		} else if(maxY< coordenate[1]) {
		   maxY = coordenate[1]; 
		}
          
		if(minX == null){
         	minX = coordenate[0]
		}  else if(minX>coordenate[0]){
		 	minX = coordenate[0]
		}

	    if(minY == null){
         	minY = coordenate[1]
		}  else if(minX>coordenate[1]){
		 	minY = coordenate[1]
		}
        geometryObj.coordinates[j] =  coordenate;

      } 
      //geometryObj.coordinates[0] = coordinatesObj;
	  
	  geometryObj.bbox[0] = minX;
	  geometryObj.bbox[1] = minY;
	  geometryObj.bbox[2] = maxX;
	  geometryObj.bbox[3] = maxY;

      objData.properties = geometryProperties;
      objData.geometry = geometryObj;
	  feature[i] = objData;
    } 
    
	geoData.features = feature;

	console.log("result builder Line");
	console.log(geoData);

    return geoData;
}

}]);

