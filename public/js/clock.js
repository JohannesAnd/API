function updateClock() {
    var date = new Date();
    var time = ("00" + date.getHours()).slice(-2) + ":" +
        ("00" + date.getMinutes()).slice(-2) + ":" +
        ("00" + date.getSeconds()).slice(-2);
    $("#clock").html(time);
}
$(document).ready(function(){
    setInterval('updateClock()', 200);
});