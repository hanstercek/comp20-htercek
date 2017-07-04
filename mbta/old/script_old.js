function initMap() {
	var infowindow = new google.maps.InfoWindow();
	var nearestStation = '';
	var nearestPos;
	var nearestDistance = 999;
	var myPos;

	map = new google.maps.Map(document.getElementById('map-canvas'), {
		center: {lat: 42.352271, lng: -71.05524200000001},
		zoom: 13
	});
	drawMe();
	initStops();

	function initStops() {
		drawStops('redline.json');
		drawStops('redline2.json');
	}

	function drawStops(filename) {
		var request = new XMLHttpRequest();
		request.open("GET", filename, true);
		request.onreadystatechange = function() {
			if (request.readyState ==4 && request.status ==200) {
				var data = JSON.parse(request.responseText);
				for (var i = 1; i < data.length; i++) {
					placeMarker(data[i], data[i-1], data[0]);
				};
			};
		};
		request.send();
	}

	function placeMarker(station, oldStation, color) {
		var latLng = new google.maps.LatLng(station.lat, station.lng);
		//getDistance(station.lat, station.lng);
		var stop = new google.maps.Marker({
			name: station.name,
			position: latLng,
			icon: 'stop.png',
			map: map
		});
		google.maps.event.addListener(stop, 'click', function() {
			infowindow.close();
			infowindow.setContent(getStationData(this));
			infowindow.open(map, this);
		});
		if (oldStation != color) {
			oldLatLng = new google.maps.LatLng(oldStation.lat, oldStation.lng);
			var route = new google.maps.Polyline({
				path: [oldLatLng, latLng],
				geodesic: true,
				strokeColor: color.color,
				strokeOpacity: 1.0,
				strokeWeight: 8
			});
			route.setMap(map);
		};
	}

	// Sets global variables to find nearest station & distance, but fails to interpret inputs properly?
	function getDistance(lat, lng) {
		var latLng = new google.maps.LatLng(lat, lng);
		var testDistance = google.maps.geometry.spherical.computeDistanceBetween(latLng, myPos);
		testDistance = Math.floor(testDistance / 1.60934) / 1000;	// Convert to miles and 3 decimals
		testDistance.toFixed(3);
		if (testDistance < minDistance) {
			nearestPos = latLng;
			nearestStation = currStation.name;
			nearestDistance = testDistance;
		};
	}

	// Returns content for infowindows. Doesn't return properly (can't figure out asycnchronous loading), but outputs to console well
	function getStationData(station) {
		request = new XMLHttpRequest();
		request.open("GET", "https://defense-in-derpth.herokuapp.com/redline.json", true);
		request.onreadystatechange = function() {
			if (request.readyState == 4 && request.status == 200) {
				var data = JSON.parse(request.responseText);
				var content = findData(data, station);
				console.log(content);		// For some reason this isn't returning properly
				return content;
			};
		};
		request.send();
	}


	function findData(data, station) {
		var currMin = 999;
		var destination = "";
		for (var i = 0; i < data.TripList.Trips.length; i++) {
			for (var j = 0; j < data.TripList.Trips[i].Predictions.length; j++) {
				if (data.TripList.Trips[i].Predictions[j].Stop == station.name && data.TripList.Trips[i].Predictions[j].Seconds < currMin) {
					currMin = data.TripList.Trips[i].Predictions[j].Seconds;
					destination = data.TripList.Trips[i].Destination;
				};
			};
		};
		return '<p>Station: ' + station.name + '<br />Next Train In: ' + currMin + ' seconds <br />Destination: ' + destination + '</p>';
	}

	function drawMe() {
		if (navigator.geolocation) {
			console.log("Getting location...");
			navigator.geolocation.getCurrentPosition(function(position) {
				myPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				map.panTo(myPos);
				myMarker = new google.maps.Marker({
					position: myPos,
					map: map
				});

				google.maps.event.addListener(myMarker, 'click', function() {
					infowindow.close();
					infowindow.setContent(getClosestStation(myPos));
					infowindow.open(map, this);
				});
			});
		} else {
			alert("Geolocation is not supported by your web browser.");
		}
	}
}