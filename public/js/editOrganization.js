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
    $("#admins").html(data.users.admins.map(function(user){
        return "<option value='" + user.name + "'>" + user.name + "</option>";
    }));
    $("#members").html(data.users.members.map(function(user){
        return "<option value='" + user.name + "'>" + user.name + "</option>";
    }));
    $("#users").html(data.users.users.map(function(user){
        return "<option value='" + user.name + "'>" + user.name + "</option>";
    }));
}

$(document).ready(function() {
    getMembers();
});