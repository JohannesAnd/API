var infowindow = new google.maps.InfoWindow({ maxWidth: 300, pixelOffset: new google.maps.Size(-2, 3)});;

$(document).ready(function(){
    var flightPlanCoordinates = [];

    var myLatLng = {lat: 63.41412, lng: 10.41232};
    var map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        maxZoom: 17,
        center: myLatLng,
        disableDefaultUI: false
    });

    var image = {
        url: "/images/mapdot.png",
        size: new google.maps.Size(10, 10),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(4, 4),
        scaledSize: new google.maps.Size(8, 8)
    };

    var bounds = new google.maps.LatLngBounds();

    points.forEach(function(point){
        var marker = new google.maps.Marker({
            map: map,
            position: {lat: point.latitude, lng: point.longitude},
            icon: image
        });

        flightPlanCoordinates.push(marker.position);
        bounds.extend(marker.position);

        var content = "<table>"+
            "<tr><th>Time</th><th>"+point.registration_time+"</th></tr>"+
            "<tr><th>Speed</th><th>"+point.speed+"</th></tr>"+
            "<tr><th>RPM</th><th>"+point.rpm+"</th></tr>"+
            "<tr><th>Coolant Temp</th><th>"+point.coolant_temp+"</th></tr>"+
            "<tr><th>Engine Load</th><th>"+point.engine_load+"</th></tr>"+
            "</table>";

        new google.maps.event.addListener(marker, "click", (function(marker,content){
            return function() {
                infowindow.setContent(content);
                infowindow.open(map,marker);
            };
        })(marker,content));
    });

    map.fitBounds(bounds);

    new google.maps.Polyline({
        path: flightPlanCoordinates,
        geodesic: true,
        strokeColor: "#0094ff",
        strokeOpacity: 0.5,
        strokeWeight: 5,
        map: map
    });

});
