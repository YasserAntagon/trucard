
/*!
 File: Change Password Controller
 Edited : Nikhil Bharambe
 Dated : 03-05-2019
 Description : company related all element events we write here.
 */

// step1 submission - company details 
document.getElementById('btnChange').addEventListener('click', function (e) {
    $email = $("#txtemail").val();
    $password = $("#txtpassword").val();
    $cpassword = $("#txtcpassword").val();
    if ($email == '') {
        $("#txtemailid").css("border-color", "#FF0000");
        $('#btnChange').attr('disabled', true);
        $("#error_email").text("* Please Enter Email ID");
        return false;
    }
    else {
        $(this).css("border-color", "#2eb82e");
        $('#btnChange').attr('disabled', false);
        $("#error_email").text("");
    }

    if ($password == '') {
        $("#txtpassword").css("border-color", "#FF0000");
        $('#btnChange').attr('disabled', true);
        $("#error_pass").text("* Please Enter Password..!!");
        return false;
    }
    else {
        $("#txtpassword").css("border-color", "#2eb82e");
        $('#btnChange').attr('disabled', false);
        $("#error_pass").text("");
    }

    if ($password != $cpassword) {
        $("#txtcpassword").css("border-color", "#FF0000");
        $('#btnChange').attr('disabled', true);
        $("#error_cpass").text("* Password does not matched");
        alertify.logPosition("bottom left");
        alertify.error('Password does not matched..!!');
        return false;
    }
    else {
        $("#txtcpassword").css("border-color", "#2eb82e");
        $('#btnChange').attr('disabled', false);
        $("#error_cpass").text("");
    }

    var json = {
        "email": $("#txtemail").val(),
        "newPassword": $password
    } 
    $('#resetLoader').css("display", 'block');
    // changeDB.changeEmpPassword(json, function (err, res) {
    //     if (err) throw err;
    $.ajax({
        "url": "/login/changeEmpPassword", "method": "POST", data: json, success: function (a) {
            let res = a.body;
            $('#resetLoader').fadeOut('slow');
            if (res.status == 200) {
                // store.set('coTruID', res.truID);
                alertify.logPosition("bottom left");
                alertify.success('Password Change Successfully..!!');
                $("#txtpassword").val("");
                $("#txtcpassword").val("");
                window.location = "/"
            }
            else {
                alertify.logPosition("bottom left");
                alertify.error(res.message);
            }
        }
    });
}); 
$(document).ready(function () {
    /// On change validation     
    $("#txtemail").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btnChange').attr('disabled', true);
            $("#error_email").text("* Please Enter Email ID");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btnChange').attr('disabled', false);
            $("#error_email").text("");
        }
    });
    $("#txtpassword").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btnChange').attr('disabled', true);
            $("#error_pass").text("* Please Enter Password..!!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btnChange').attr('disabled', false);
            $("#error_pass").text("");
        }
    });
    $("#txtcpassword").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btnChange').attr('disabled', true);
            $("#error_cpass").text("*Please Enter Confirm Password..!!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btnChange').attr('disabled', false);
            $("#error_cpass").text("");
        }

    });
});