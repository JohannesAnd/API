var markers = {};
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
    function updateCars(successFunc){
        $.ajax({
            url: "/organizations/" + id + "/carOverview/getData",
            type: "get",
            cache: false,
            data: {},
            success: function (data) {
                $("#active").html(data.cars.map(function (car) {
                    if (markers[car.registration]) {
                        markers[car.registration].setPosition(new google.maps.LatLng(car.latitude, car.longitude));
                    } else {
                        markers[car.registration] = new google.maps.Marker({
                            position: new google.maps.LatLng(car.latitude, car.longitude),
                            map: map
                        });
                    }
                    return (
                        "<div class='carContainer'>" +
                            "<h1>" + car.registration + "</h1>" +
                            "<h2>" + car.registration_time + "</h2>" +
                            "<h2>" + car.trip_id + "</h2>" +
                            "<h2>" + car.longitude + "</h2>" +
                            "<h2>" + car.latitude + "</h2>" +
                            "<h2>" + car.active + "</h2>" +
                        "</div>"
                    );
                }));
                if (successFunc)
                    successFunc();
            }
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

    updateCars(function (data){
        var bounds = new google.maps.LatLngBounds();
        for (var reg in markers)
            bounds.extend(markers[reg].position)

        map.fitBounds(bounds)
    });

    setInterval(updateCars(null), 1000);
});