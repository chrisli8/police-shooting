//Christopher Li, INFO 343 C, 10/21/15

// Function to draw your map initially empty
var drawMap = function() {
	var map = L.map('container').setView([38, -92], 4);
	var layer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');
 	layer.addTo(map);
 	getData(map);
}

// Sends an asycronous ajax request to get data about police shootings
var getData = function(map) {
	$.ajax({
	    url:'data/response.json',
	    type: "get",
	    success:function(dat) {
	      customBuild(dat,map)
	    }, 
	   dataType:"json"
	}) 

}

// Loops through data and adds the appropriate layers and points and table
var customBuild = function(data, map) {
	var maleK = 0;
	var maleH = 0;
	var femK = 0;
	var femH = 0;

	var jsonArry = data;
	var layersObj = new Object();
	//loops through all objects and processes their data
	for(var i = 0; i < jsonArry.length; i++) {
		var race = "\"Unknown\"";
		if("Race" in jsonArry[i]) {
			race = JSON.stringify(jsonArry[i].Race);
		}
		if(!layersObj.hasOwnProperty(race)) {
			layersObj[race] = new L.LayerGroup([]);
		}
		//checks if latitude and logitude are defined
		if(("lat" in jsonArry[i]) && ("lng" in jsonArry[i])) {
			//pink = european american; brown = african american; yellow = asian american
			var clr = '#6B6B6B';
			if(race == '\"White\"') {
				clr = '#FFCCCC';
			} else if (race == '\"Black or African American\"') {
				clr = '#331F14';
			} else if (race == '\"Asian\"') {
			 	clr = '#FFFFCC';
			}

			//red borders signify female victim
			var genC = '#990033';
			if(jsonArry[i]['Victim\'s Gender'] == 'Male') {
				genC = clr;
			}
			var circle = new L.circleMarker([jsonArry[i].lat, jsonArry[i].lng], {color:genC, weight:'2', fillColor:clr, opacity:0.7, fillOpacity: 0.7}).setRadius(4);
			circle.bindPopup(jsonArry[i].Summary);
			circle.addTo(layersObj[race]);
		}

		//catalogs the data of male or female; killed or hit
		if(jsonArry[i]['Victim\'s Gender'] == 'Male') {
			if(jsonArry[i]['Hit or Killed?'] == 'Killed') {
				maleK ++;
			} else {
				maleH ++;
			}
		} else {
			if(jsonArry[i]['Hit or Killed?'] == 'Killed') {
				femK ++;
			} else {
				femH ++;
			}
		}
	}

	//puts layers on map and adds controls
	for(var key in layersObj) {
		layersObj[key].addTo(map);
	}
	L.control.layers(null,layersObj).addTo(map);

	//add a table above map about data cataloged
	var table = "<table><tr><th></th><th>Killed</th><th>Hit</th><th>Percent Killed</th>" + 
				"</tr><tr><th>Male</th><td>" + maleK + "</td><td>" + maleH + "</td><td>" + 
				Math.round(maleK * 100 / (maleK + maleH)) + "%" + "</td></tr><tr><th>Female</th><td>" + 
				femK + "</td><td>" + femH + "</td><td>" + 
				Math.round(femK * 100/ (femK + femH)) + "%" + "</td></tr></table>";
	$("#table").append(table);
}


