function getMembers() {
    $.ajax({
        url: "/organizations/" + id + "/getUsers",
        type: "get",
        cache: false,
        success: function(data) {
            setMembers(data);
        }
    });
}

function setMembers(data) {
    $("#admins, #members, #users").empty();
    $.each(data.users, function(i, user) {
        $("#"+ (user.role != null ? user.role.toLowerCase() + "s": "users")).append(
            "<option value='" + user.id + "'>" + user.name + "</option>"
        );
    });
}

$(document).ready(function() {

    getMembers();

    $("#addAdmin").bind("click", function(){updateUsers("#members option:selected", "addAdmin");});
    $("#removeMember").bind("click", function(){updateUsers("#members option:selected", "removeUser");});
    $("#removeAdmin").bind("click", function(){updateUsers("#admins option:selected", "removeAdmin");});
    $("#addMember").bind("click", function(){updateUsers("#users option:selected", "addUser");});

});

function updateUsers(whatToSelect, todo){
    $(whatToSelect).each(function(i, selected){
        var userID = $(selected).val();
        $.ajax({
            url: "/organizations/" + id + "/edit/" + todo,
            type: "post",
            data: {user_id: userID},
            cache: false,
            success: function() {
                getMembers();
            }
        });
    });
}