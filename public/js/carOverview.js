$(document).ready(function() {
    function updateCars(){
        $.ajax({
            url: "/organizations/" + id + "/carOverview/getData",
            type: "get",
            cache: false,
            data: {},
            success: function (data) {
                $("#active").html(data.cars.map(function (car) {
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
            }
        });
    }
    updateCars();
    setInterval(updateCars, 1000);
});