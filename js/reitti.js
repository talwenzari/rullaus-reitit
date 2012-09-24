$(document).ready(function(){
	var waypoints = [];
	var renderers = [];
	
	var directionsService = new google.maps.DirectionsService();

	var tampere = new google.maps.LatLng(61.498056, 23.760833);
	var mapOptions = {
			zoom:13,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			center: tampere
	};
	
	var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

	disableButtons();
	$('table').hide();
	
	$('#button').click(function(){
		if (waypoints.length > 1) {
			var last = waypoints.length - 1;
			calcRoute(waypoints[last - 1], waypoints[last]);
		}
	});

	$('#clear').click(function() {
		$.map(renderers, function(renderer){
			renderer.setMap(null);
		});
		waypoints = [];
		renderers = [];
		disableButtons();
	});
	
	$('#fill').click(function(){
		calcRoute(waypoints[waypoints.length - 1], waypoints[0]);
	});
//	$('#decode').click(function(){
//		var decoded = google.maps.geometry.encoding.decodePath($('#start').val());
//		var path = new google.maps.Polyline({path:decoded});
//		path.setMap(map);
//	});
	
	google.maps.event.addListener(map, 'click', function(event) {
		placeMarker(event.latLng);
		if (waypoints.length > 1) {
			setDisabled('button', false);
			setDisabled('clear', false);
		}
		if (waypoints.length > 2) {
			setDisabled('fill', false);
		}
	});

	function calcRoute(start, end) {
		var request = {
				origin:start,
				destination:end,
				travelMode: google.maps.TravelMode.BICYCLING
		};
		directionsService.route(request, function(result, status) {
			console.log(status);
			if (status == google.maps.DirectionsStatus.OK) {
				var i = renderers.length;
				var directionsDisplay = new google.maps.DirectionsRenderer({draggable:true, map: map, directions: result});
				renderers.push(directionsDisplay);

				google.maps.event.addListener(directionsDisplay, 'directions_changed', function() {
					var dist = directionsDisplay.getDirections().routes[0].legs[0].distance;
					var row = $('tr.leg').eq(i);
					row.data('distance', dist.value);
					row.children('td.dist').text(dist.text);
					calculateSumDistance();
				});
				$('table').show();
				var leg = result.routes[0].legs[0];
				console.log(result.routes[0].overview_polyline.points);
				$('#sumrow').before(newTableRow(leg.start_address, leg.end_address,leg.distance));
				
				calculateSumDistance();
			}
			
		});
	}

	function placeMarker(location) {
		new google.maps.Marker({
			position: location,
			map: map,
			draggable: true
		});
		waypoints.push(location);
	}
	
	function disableButtons() {
		$.each(['button','clear','fill'], function(i, val){
			setDisabled(val, true);
		});
	}
	
	function setDisabled(buttonid, disabled) {
		$('#' + buttonid).button({disabled:disabled});
	}

	function newTableRow(start_address, end_address, distance) {
		return $('<tr class="leg"><td>' + start_address + '</td><td>' + end_address + '</td><td class="dist">' + distance.text + '</td></tr>').data('distance', distance.value);
	}

	function calculateSumDistance() {
		var sum = 0;
		$('tr.leg').each(function(i){
			sum += $(this).data('distance');
		});
		$('#sum').text(sum);
	}
});

function logLeg(leg) {
	console.log(leg.start_address, '->', leg.end_address, '(', leg.duration.text, ')\n');

}

