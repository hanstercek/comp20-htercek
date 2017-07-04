var myLat = 42.352271;
var myLng = -71.05524200000001;
var me = new google.maps.LatLng(myLat, myLng); // default to South Station
var myOptions = {
	zoom: 13, // The larger the zoom number, the bigger the zoom
	center: me,
	mapTypeId: google.maps.MapTypeId.ROADMAP
};
var map;
var infowindow = new google.maps.InfoWindow();
var stations = [
	{"station_name":"Alewife", "latitude":42.395428, "longitude":-71.142483},
	{"station_name":"Davis", "latitude":42.39674, "longitude":-71.121815},
	{"station_name":"Porter Square", "latitude":42.3884, "longitude":-71.11914899999999},
	{"station_name":"Harvard Square", "latitude":42.373362, "longitude":-71.118956,},
	{"station_name":"Central Square", "latitude":42.365486, "longitude":-71.103802},
	{"station_name":"Kendall/MIT", "latitude":42.36249079, "longitude":-71.08617653},
	{"station_name":"Charles/MGH", "latitude":42.361166, "longitude":-71.070628},
	{"station_name":"Park Street", "latitude":42.35639457, "longitude":-71.0624242},
	{"station_name":"Downtown Crossing", "latitude":42.355518, "longitude":-71.060225},
	{"station_name":"South Station", "latitude":42.352271, "longitude":-71.05524200000001},
	{"station_name":"Broadway", "latitude":42.342622, "longitude":-71.056967},
	{"station_name":"Andrew", "latitude":42.330154, "longitude":-71.057655},
	{"station_name":"JFK/UMass", "latitude":42.320685, "longitude":-71.052391},	// 12 [indexed @ 0]
	{"station_name":"Savin Hill", "latitude":42.31129, "longitude":-71.053331},
	{"station_name":"Fields Corner", "latitude":42.300093, "longitude":-71.061667},
	{"station_name":"Shawmut", "latitude":42.29312583, "longitude":-71.06573796000001},
	{"station_name":"Ashmont", "latitude":42.284652, "longitude":-71.06448899999999},
	{"station_name":"North Quincy", "latitude":42.275275, "longitude":-71.029583},	// 17 [indexed @ 0]
	{"station_name":"Wollaston", "latitude":42.2665139, "longitude":-71.0203369},
	{"station_name":"Quincy Center", "latitude":42.251809, "longitude":-71.005409},
	{"station_name":"Quincy Adams", "latitude":42.233391, "longitude":-71.007153},
	{"station_name":"Braintree", "latitude":42.2078543, "longitude":-71.0011385}
];
var stationMarkers = [];

function init() {
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	console.log("INIT");
	for (var count = 0; count < stations.length; count++) {
		var latLng = new google.maps.LatLng(stations[count].latitude,stations[count].longitude);
		marker = new google.maps.Marker({
			position: latLng,
			title: stations[count].station_name,
			icon: "t_icon.png" 
		});
		// Draw Route
		console.log("Drawing Route");
		if (count != 0) {
			if (count == 17) {
				var oldLatLng = new google.maps.LatLng(stations[12].latitude, stations[12].longitude);
			} else {
				var oldLatLng = new google.maps.LatLng(stations[count-1].latitude, stations[count-1].longitude);
			}
			var route = new google.maps.Polyline({
					path: [oldLatLng, latLng],
					geodesic: true,
					strokeColor: "#FF0000",
					strokeOpacity: 1.0,
					strokeWeight: 8
				});
			route.setMap(map);
		};

		// Clicking on marker will load real time schedule for station
		google.maps.event.addListener(marker, 'click', function() {
			var theMarker = this;
			var request = new XMLHttpRequest();
			request.open("GET", "https://hydro-chesterfield-96568.herokuapp.com/redline.json", true);
			request.onreadystatechange = function() {
				if (request.readyState == 4 && request.status == 200) {
					schedule = JSON.parse(request.responseText);
					var textForMarker = "<h1>" + theMarker.getTitle() + "</h1><ul>";
					var entries = []
					for (var trip = 0; trip < schedule.TripList.Trips.length; trip++) {
						destination = schedule.TripList.Trips[trip].Destination;
						for (var stop = 0; stop < schedule.TripList.Trips[trip].Predictions.length; stop++) {
							// We only care about the stations that was clicked on (i.e., theMarker)
							if (schedule.TripList.Trips[trip].Predictions[stop].Stop == theMarker.getTitle()) {
								entries.push({"destination":destination,"predicted_arrival":schedule.TripList.Trips[trip].Predictions[stop].Seconds});
							}
						}
					}

					// Sort the schedule for station; https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value-in-javascript
					function compare(a, b) {
						if (a.predicted_arrival < b.predicted_arrival) {
							return -1;
						}
						if (a.predicted_arrival > b.predicted_arrival) {
							return 1;
						}
						return 0;
					}
					entries.sort(compare);
					if (entries.length == 0) {
						textForMarker += "<li>No upcoming trains.</li>";
					}
					else {
						for (count = 0; count < entries.length; count++) {
							textForMarker += "<li>Next " + entries[count].destination + " bound train will arrive in approximately " + Math.trunc(entries[count].predicted_arrival / 60) + " min.</li>"; 
						}
					}
					textForMarker += "</ul>";
					infowindow.setContent(textForMarker);
					infowindow.open(map, theMarker);
				}
				else if (request.readyState == 4 && request.status == 500) {
					infowindow.setContent("Whoops, something went terribly wrong!");
					infowindow.open(map, marker);
				}
			}
			request.send();
		});
		stationMarkers.push(marker);
		marker.setMap(map);
	}
	getMyLocation();
}

function getMyLocation() {
	if (navigator.geolocation) { // the navigator.geolocation object is supported on your browser
		navigator.geolocation.getCurrentPosition(function(position) {
			myLat = position.coords.latitude;
			myLng = position.coords.longitude;
			updateMap();
		});
	}
	else {
		alert("Geolocation is not supported by your web browser.  What a shame!");
	}
}

function updateMap() {
	me = new google.maps.LatLng(myLat, myLng);
	
	// Update map to pan to my location
	map.panTo(me);
	
	// Create marker of where I am and calculate the closest Red Line station to where I am
	var closestStation = stationMarkers[0];
	var closestDistance = google.maps.geometry.spherical.computeDistanceBetween(me, closestStation.getPosition());
	for (count = 1; count < stationMarkers.length; count++) {
		var tempDistance = google.maps.geometry.spherical.computeDistanceBetween(me, stationMarkers[count].getPosition());
		if (closestDistance > tempDistance) {
			closestDistance = tempDistance;
			closestStation = stationMarkers[count];
		}
	}
	marker = new google.maps.Marker({
		position: me,
		title: "The closest MBTA Red Line station is " + closestStation.getTitle() + " which is " + closestDistance * 0.000621371 + " miles away"
	});
	marker.setMap(map);
	infowindow.setContent(marker.title);
	infowindow.open(map, marker);

	// Open info window on click of marker
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(marker.title);
		infowindow.open(map, marker);
	});

	// Draw polyline connecting where you are to closest station
	var closestPath = new google.maps.Polyline({
		path: [me, closestStation.getPosition()],
		geodesic: true,
		strokeColor: '#FF0000',
		strokeOpacity: 1.0,
		strokeWeight: 2
	});
	closestPath.setMap(map);
}