
/*!
 File: Change Password Controller
 Edited : Nikhil Bharambe
 Dated : 03-05-2019
 Description : company related all element events we write here.
 */
 
// step1 submission - company details 
document.getElementById('btnChange').addEventListener('click', function (e) {
    e.preventDefault();
    $password = $("#txttpin").val();
    $cpassword = $("#txtctpin").val();
 
    if ($password == '') {
        $("#txttpin").css("border-color", "#FF0000");
        $('#btnChange').attr('disabled', true);
        $("#error_pass").text("* Please Enter Password..!!");
        return false;
    }
    else {
        $("#txttpin").css("border-color", "#2eb82e");
        $('#btnChange').attr('disabled', false);
        $("#error_pass").text("");
    }

    if ($password != $cpassword) {
        $("#txtctpin").css("border-color", "#FF0000");
        $('#btnChange').attr('disabled', true);
        $("#error_cpass").text("* Password does not matched");
        alertify.logPosition("bottom left");
        alertify.error('Password does not matched..!!');
        return false;
    }
    else {
        $("#txtctpin").css("border-color", "#2eb82e");
        $('#btnChange').attr('disabled', false);
        $("#error_cpass").text("");
    }

    var json = {
        "tPIN": $password
    } 
    $('#changetPinLoader').css("display", 'block');
    $.ajax({
        "url": "/login/changeEmpTPIN", "method": "POST", data: json, success: function (a) {
            let res = a.body; 
        $('#changetPinLoader').fadeOut('slow'); 
        if (res.status == 200) {
            // store.set('coTruID', res.truID);
            alertify.logPosition("bottom left");
            alertify.success('Transaction PIN Updated Successfully..!!');
            $("#txttpin").val("");
            $("#txtctpin").val("");
        }
        else {
            alertify.logPosition("bottom left");
            alertify.error(res.message);
        }}
    });
}); 
$(document).ready(function () {  
    /// On change validation     
    $("#txttpin").bind("change blur", function () {
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
    $("#txtctpin").bind("change blur", function () {
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