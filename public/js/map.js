$(document).ready(function(){
    var bittersMap = (function () {
        var myLatlng = new google.maps.LatLng(59.342457, 18.057340);
        var myLatlng2 = new google.maps.LatLng(59.342347, 18.068240);
        var mapCenter = new google.maps.LatLng(59.340458, 18.057340);
        var mapCanvas = document.getElementById("map_canvas");
        var mapOptions = {
            center: mapCenter,
            zoom: 13,
            scrollwheel: false,
            draggable: true,
            disableDefaultUI: true,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(mapCanvas, mapOptions);
        var contentString =
            "<div id=\"content\">"+
            "<div id=\"siteNotice\">"+
            "</div>"+
            "<h1 id=\"firstHeading\" class=\"firstHeading\">thoughtbot</h1>"+
            "<div id=\"bodyContent\""+
            "<p>Sveavägen 98</p>"+
            "</div>"+
            "</div>";
        var infowindow = new google.maps.InfoWindow({
            content: contentString,
            maxWidth: 300
        });
        var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            title: "thoughtbot (Sweden)"
        });
        var marker2 = new google.maps.Marker({
            position: myLatlng2,
            map: map,
            title: "thoughtbot (Sweden)"
        });
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
                google.maps.event.addListener(marker, "click", function () {
                    marker.setPosition(myLatlng2);
                    infowindow.open(map,marker);
                });
                google.maps.event.addListener(marker2, "click", function () {
                    infowindow.open(map,marker2);
                });
            }
        };
    }());
    bittersMap.init();
});
