function checkUsername(name) {
    $.ajax({
        url: "/checkUsername",
        type: "POST",
        cache: false,
        data: {name: name},
        success: function(data) {
            $("#submitUser").attr("disabled", !data.valid);
            $("#usernameHelper").text(data.help);
        }
    });
}

$(document).ready(function(){
    $("#name").on("input", function(){
        checkUsername($("#name").val());
    });
});