$(document).ready(function() {
    function updateTable() {
        $.ajax({
            url: "/car/" + registration + "/trip",
            type: "get",
            cache: false,
            data: {name},
            success: function (data) {
                var header =
                    "<tr>" +
                        "<th>Longitude</th>" +
                        "<th>Latitude</th>" +
                        "<th>Speed</th>" +
                        "<th>Time</th>" +
                    "</tr>";
                $("#carTable").html(header + data.data.map(function (entry) {
                    return (
                        "<tr>" +
                            "<td>" + entry.longitude + "</td>" +
                            "<td>" + entry.latitude + "</td>" +
                            "<td>" + entry.speed + "</td>" +
                            "<td>" + entry.registration_time + "</td>" +
                        "</tr>"
                    );
                }));
            }
        });
    }
    updateTable();
    var update = setInterval(updateTable, 1000);
});