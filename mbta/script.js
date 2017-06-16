var map;
function initMap() {
	map = new google.maps.Map(document.getElementById('map-canvas'), {
		center: {lat: 42.352271, lng: -71.05524200000001},
		zoom: 13
	});
	//map.data.loadGeoJson('redline.json');

	// Manually Entering stops (couldn't figure out JSON parsing)
	var redline = [
		{
			position: new google.maps.LatLng(42.395428, -71.142483),
			name: "Alewife"
		}, {
			position: new google.maps.LatLng(42.39674, -71.121815),
			name: "Davis"
		}, {
			position: new google.maps.LatLng(42.3884, -71.11914899999999),
			name: "Porter Square"
		}, {
			position: new google.maps.LatLng(42.373362, -71.118956),
			name: "Harvard Square"
		}, {
			position: new google.maps.LatLng(42.365486, -71.103802),
			name: "Central Square"
		}, {
			position: new google.maps.LatLng(42.36249079, -71.08617653),
			name: "Kendall/MIT"
		}, {
			position: new google.maps.LatLng(42.361166, -71.070628),
			name: "Charles/MGH"
		}, {
			position: new google.maps.LatLng(42.35639457, -71.0624242),
			name: "Park Street"
		}, {
			position: new google.maps.LatLng(42.355518, -71.060225),
			name: "Downtown Crossing"
		}, {
			position: new google.maps.LatLng(42.352271, -71.05524200000001),
			name: "South Station"
		}, {
			position: new google.maps.LatLng(42.342622, -71.056967),
			name: "Broadway"
		}, {
			position: new google.maps.LatLng(42.330154, -71.057655),
			name: "Andrew"
		}, {
			position: new google.maps.LatLng(42.320685, -71.052391),
			name: "JFK/UMass"
		}, {
			position: new google.maps.LatLng(42.31129, -71.053331),
			name: "Savin Hill"
		}, {
			position: new google.maps.LatLng(42.300093, -71.061667),
			name: "Fields Corner"
		}, {
			position: new google.maps.LatLng(42.29312583, -71.06573796000001),
			name: "Shawmut"
		}, {
			position: new google.maps.LatLng(42.284652, -71.06448899999999),
			name: "Ashmont"
		}, {
			position: new google.maps.LatLng(42.275275, -71.029583),
			name: "North Quincy"
		}, {
			position: new google.maps.LatLng(42.2665139, -71.0203369),
			name: "Wollaston"
		}, {
			position: new google.maps.LatLng(42.251809, -71.005409),
			name: "Quincy Center"
		}, {
			position: new google.maps.LatLng(42.233391, -71.007153),
			name: "Quincy Adams"
		}, {
			position: new google.maps.LatLng(42.2078543, -71.0011385),
			name: "Braintree"
		}
	];

	for (var i = 0; i < 17; i++) {
		var station = new google.maps.Marker({
			position: redline[i].position,
			icon: 'stop.png',
			map:map
		});
		if (i != 0) {
			var redroute = new google.maps.Polyline({
				path: [redline[i-1].position, redline[i].position],
			    geodesic: true,
			    strokeColor: '#FF0000',
			    strokeOpacity: 1.0,
			    strokeWeight: 8
			});
			redroute.setMap(map);
		};
	};
	// Deal with branch @ JFK/UMass
	for (var i = 17; i < redline.length; i++) {
		var station = new google.maps.Marker({
			position: redline[i].position,
			icon: 'stop.png',
			map: map
		});
		if (i == 17) {
			console.log("in if");
			console.log(redline[17].name);
			var redroute = new google.maps.Polyline({
				path: [redline[12].position, redline[17].position],
				geodesic: true,
				strokeColor: '#FF0000',
				strokeOpacity: 1.0,
				strokeWeight: 8
			});
			redroute.setMap(map);
		} else {
			var redroute = new google.maps.Polyline({
				path: [redline[i-1].position, redline[i].position],
				geodesic: true,
				strokeColor: '#FF0000',
				strokeOpacity: 1.0,
				strokeWeight: 8
			});
			redroute.setMap(map);
		};
	};
}