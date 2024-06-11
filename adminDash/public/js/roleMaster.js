
/*!
 File: Role Master js
 Edited : Nikhil Bharambe
 Dated : 26-04-2019
 Description : validate roles
 */

require(__dirname+"/api/controllers/roleMaster.js");

$(document).ready(function () {
    
    $(document).on("click","#btnAddRole",function (e) 
    {
     e.preventDefault();
     $(".rolelist").addClass("hidden");
     $(".role").removeClass("hidden");
     $("#txtRoleName").focus();    
    })

    $(document).on("click","#btnRoleClose",function (e) 
    {
     e.preventDefault();
     $(".rolelist").removeClass("hidden");
     $(".role").addClass("hidden");
    })
    $("#txtRoleName").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btnSubmit').attr('disabled', true);
            $("#error_comp_name").text("* Please Enter Role Name!");
            return false;
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btnSubmit').attr('disabled', false);
            $("#error_comp_name").text("");
        }
    });
});