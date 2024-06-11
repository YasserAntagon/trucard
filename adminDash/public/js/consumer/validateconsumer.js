$(document).ready(function () {
    $("#txtfname").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btnsave').attr('disabled', true);
            $("#error_fname").text("* Please Enter First Name!");
            return false;
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btnsave').attr('disabled', false);
            $("#error_fname").text("");
        }
    });
    $("#txtmname").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btnsave').attr('disabled', true);
            $("#error_mname").text("* Please Enter Middle Name!");
            return false;
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btnsave').attr('disabled', false);
            $("#error_mname").text("");
        }
    });
    $("#txtlname").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btnsave').attr('disabled', true);
            $("#error_lname").text("* Please Enter Last Name!");
            return false;
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btnsave').attr('disabled', false);
            $("#error_lname").text("");
        }
    });
    $("#txtemail").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btnsave').attr('disabled', true);
            $("#error_email").text("*Enter Email Id!");
        }
        else if (!isEmail($("#txtemail").val())) {
            $(this).css("border-color", "#FF0000");
            $('#btnsave').attr('disabled', true);
            $("#error_email").text("*Enter Valid Email Id!");
            valid = false;
            return false;

        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btnsave').attr('disabled', false);
            $("#error_email").text("");
        }
    });
    $("#txtccode").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btnsave').attr('disabled', true);
            $("#error_ccode").text("*Enter Country Code!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btnsave').attr('disabled', false);
            $("#error_ccode").text("");
        }
    });
    $("#txtmobileno").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btnsave').attr('disabled', true);
            $("#error_mobileno").text("*Enter Mobile Number!");
        }/* 
        else if (!IsMobileNumber($("#txtmobileno").val())) {
            $(this).css("border-color", "#FF0000");
            $('#btnsave').attr('disabled', true);
            $("#error_mobileno").text("*Enter valid Mobile Number!");
            valid = false;
            return false;

        } */
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btnsave').attr('disabled', false);
            $("#error_mobileno").text("");
        }
    });
    $("#txtDOB").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btnsave').attr('disabled', true);
            $("#error_DOB").text("*Please Select Birth Date !");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btnsave').attr('disabled', false);
            $("#error_DOB").text("");
        }
    });
    $("#txtpass").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btnsave').attr('disabled', true);
            $("#error_pass").text("*Please Enter Password !");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btnsave').attr('disabled', false);
            $("#error_pass").text("");
        }
    });
    $("#txtconfirmpass").bind("change blur", function () {
        
        var pwd = $('#txtpass').val();
        var cpwd = $(this).val();
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btnsave').attr('disabled', true);
            $("#error_confirmpass").text("*Please Confirm Password !");
        }
        else if ( cpwd != pwd) {
            $(this).css("border-color", "#FF0000");
            $('#btnsave').attr('disabled', true);
            $("#error_confirmpass").text("*Password not match!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btnsave').attr('disabled', false);
            $("#error_confirmpass").text("");
        }
    });
});


function validateconsumerdetails() { 
    var valid = true;
    if ($('#txtfname').val() == '') {
        $('#txtfname').css("border-color", "#FF0000");
        $('#btnsave').attr('disabled', true);
        $("#error_fname").text("* Please Enter First Name!");
        valid = false;
    }
    else {
        $('#txtfname').css("border-color", "#2eb82e");
        $('#btnsave').attr('disabled', false);
        $("#error_fname").text("");
    }

    if ($('#txtmname').val() == '') {
        $('#txtmname').css("border-color", "#FF0000");
        $('#btnsave').attr('disabled', true);
        $("#error_mname").text("* Please Enter Middle Name!");
        valid = false;
    }
    else {
        $('#txtmname').css("border-color", "#2eb82e");
        $('#btnsave').attr('disabled', false);
        $("#error_mname").text("");
    }

    if ($('#txtlname').val() == '') {
        $('#txtlname').css("border-color", "#FF0000");
        $('#btnsave').attr('disabled', true);
        $("#error_lname").text("* Please Enter Last Name!");
        valid = false;
    }
    else {
        $('#txtlname').css("border-color", "#2eb82e");
        $('#btnsave').attr('disabled', false);
        $("#error_lname").text("");
    }
    if ($('#txtemail').val() == '') {
        $('#txtemail').css("border-color", "#FF0000");
        $('#btnsave').attr('disabled', true);
        $("#error_email").text("*Enter Email Id!");
    }
    else if (!isEmail($("#txtemail").val())) {
        $('#txtemail').css("border-color", "#FF0000");
        $('#btnsave').attr('disabled', true);
        $("#error_email").text("*Enter Valid Email Id!");
        valid = false;


    }
    else {
        $('#txtemail').css("border-color", "#2eb82e");
        $('#btnsave').attr('disabled', false);
        $("#error_email").text("");
    }
    if ($('#txtccode').val() == '') {
        $('#txtccode').css("border-color", "#FF0000");
        $('#btnsave').attr('disabled', true);
        $("#error_ccode").text("*Enter Country Code!");
        valid = false;
    }
    else {
        $('#txtccode').css("border-color", "#2eb82e");
        $('#btnsave').attr('disabled', false);
        $("#error_ccode").text("");
    }
    if ($('#txtmobileno').val() == '') {
        $('#txtmobileno').css("border-color", "#FF0000");
        $('#btnsave').attr('disabled', true);
        $("#error_mobileno").text("*Enter Mobile Number!");
        valid = false;
    }
    else if (!IsMobileNumber($("#txtmobileno").val())) {
        $('#txtmobileno').css("border-color", "#FF0000");
        $('#btnsave').attr('disabled', true);
        $("#error_mobileno").text("*Enter valid Mobile Number!");
        valid = false;


    }
    else {
        $('#txtmobileno').css("border-color", "#2eb82e");
        $('#btnsave').attr('disabled', false);
        $("#error_mobileno").text("");

    }
    if ($('#txtDOB').val() == '') {
        $('#txtDOB').css("border-color", "#FF0000");
        $('#btnsave').attr('disabled', true);
        $("#error_DOB").text("*Please Select Birth Date !");
        valid = false;
    }
    else {
        $('#txtDOB').css("border-color", "#2eb82e");
        $('#btnsave').attr('disabled', false);
        $("#error_DOB").text("");
    }
    if ($('#txtpass').val() == '') {
        $('#txtpass').css("border-color", "#FF0000");
        $('#btnsave').attr('disabled', true);
        $("#error_pass").text("*Please Enter Password!");
        valid = false;
    }
    else {
        $('#txtpass').css("border-color", "#2eb82e");
        $('#btnsave').attr('disabled', false);
        $("#error_pass").text("");
    }
    var pwd = $('#txtpass').val();
    var cpwd = $('#txtconfirmpass').val();
    if ($('#txtconfirmpass').val() == '') {
        $('#txtconfirmpass').css("border-color", "#FF0000");
        $('#btnsave').attr('disabled', true);
        $("#error_confirmpass").text("*Please Confirm Password !");
    }
    else if ( cpwd != pwd) {
        $('#txtconfirmpass').css("border-color", "#FF0000");
        $('#btnsave').attr('disabled', true);
        $("#error_confirmpass").text("*Password not match!");
    }
    else {
        $('#txtconfirmpass').css("border-color", "#2eb82e");
        $('#btnsave').attr('disabled', false);
        $("#error_confirmpass").text("");
    }
    return valid;

}