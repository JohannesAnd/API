var markers = {};
var infowindow = new google.maps.InfoWindow({ maxWidth: 300 , pixelOffset: new google.maps.Size(-7.5, 15)});

function createCarIcon(path)
{
    return {
        url: path,
        size: new google.maps.Size(40, 36),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(15, 15),
        scaledSize: new google.maps.Size(25, 25)
    };
}

$(document).ready(function() {
    var mapCenter = new google.maps.LatLng(59.340458, 18.057340);
    var mapCanvas = document.getElementById("map_canvas");
    var mapOptions = {
        center: mapCenter,
        zoom: 13,
        maxZoom: 17,
        scrollwheel: true,
        draggable: true,
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(mapCanvas, mapOptions);
    var onlineIcon = createCarIcon("/images/onlinecar.png");
    var offlineIcon = createCarIcon("/images/offlinecar.png");

    function updateCars(doneFunc){
        $.ajax({
            url: "/organizations/" + id + "/carOverview/data",
            type: "get",
            cache: false,
            data: {},
            success: function (data) {
                $("#active, #inactive").empty();
                $("#serverTime").html(data.serverTime);
                data.cars.map(function (car) {
                    var container = (car.active)? "active": "inactive";
                    var infowindowContent = "<h2>" + car.registration + "</h2>" +
                        "<table>"+
                        "<tr><th>Time</th><th>"+car.registration_time+"</th></tr>"+
                        "<tr><th>Speed</th><th>"+car.speed+"</th></tr>"+
                        "<tr><th>RPM</th><th>"+car.rpm+"</th></tr>"+
                        "<tr><th>Coolant Temp</th><th>"+car.coolant_temp+"</th></tr>"+
                        "<tr><th>Engine Load</th><th>"+car.engine_load+"</th></tr>"+
                        "</table>";

                    if (markers[car.registration]) {
                        markers[car.registration].setPosition(new google.maps.LatLng(car.latitude, car.longitude));
                        markers[car.registration].setIcon((car.active)? onlineIcon: offlineIcon);
                        if (markers[car.registration] == infowindow.getAnchor()){
                            infowindow.setContent(infowindowContent);
                        }

                    } else {
                        markers[car.registration] = new google.maps.Marker({
                            position: new google.maps.LatLng(car.latitude, car.longitude),
                            icon: (car.active)? onlineIcon: offlineIcon,
                            map: map
                        });
                        new google.maps.event.addListener(markers[car.registration], "click", (function(marker,content){
                            return function() {
                                infowindow.setContent(content);
                                infowindow.open(map,marker);
                            };
                        })(markers[car.registration],infowindowContent));
                    }

                    $("#"+container).append(
                        "<div class='carContainer'>" +
                            "<a href=\"/car/" + car.registration + "/trips\">" + 
                                "<h2>" + car.registration + "</h2>" +
                            "</a>" +
                            "Last response:<br>" + car.registration_time + "<br><br>" +
                            "Trip:" +
                            "<a href=\"/car/" + car.registration + "/" + car.id + "/trip\">" + 
                                "<h3>" + car.start_time + "</h3>" +
                            "</a>" +
                        "</div>"
                    );
                });
                if (doneFunc) {
                    doneFunc();
                }
            },
            error: doneFunc
        });
    }

    var bittersMap = (function () {
        return {
            init: function () {
                map.set("styles", [{
                    featureType: "landscape",
                    elementType: "geometry",
                    stylers: [
                        { hue: "#ffff00" },
                        { saturation: 30 },
                        { lightness: 10}
                    ]}
                ]);
            }
        };
    }());

    bittersMap.init();

    updateCars(function (){
        var bounds = new google.maps.LatLngBounds();
        for (var reg in markers)
            bounds.extend(markers[reg].position);

        map.fitBounds(bounds);
    });

    var onDone = function () {
        setTimeout(function(){
            updateCars(onDone);
        }, 1000);
    };

    onDone();
});
