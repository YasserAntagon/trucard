$(document).ready(function () {
    // $.fn.editable.defaults.mode = 'inline'; 
    // $('#txtTXNamt').editable({
    //     type: 'text',
    //     title: 'Enter Transaction Limit',
    //     validate: function (value) {
    //         if ($.trim(value) == '') return 'This field is required';
    //         if ($.isNumeric(value) == '') {
    //             return 'Only number & decimal value are allowed';
    //         }
    //         /*   if ($.trim(value).length > 6) {
    //             return 'length is less than 6 charectors';
    //           } */
    //         // if (parseFloat($.trim(value)) > 100) {
    //         //     return 'please enter valid currency rate';
    //         // }
    //     }
    // });
    $("#txtcname").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#submit_step1').attr('disabled', true);
            $("#error_cname").text("* Please Enter Company Name!");
            return false;
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#submit_step1').attr('disabled', false);
            $("#error_cname").text("");
        }
    });
    $("#txtfname").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#submit_step1').attr('disabled', true);
            $("#error_fname").text("* Please Enter First Name!");
            return false;
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#submit_step1').attr('disabled', false);
            $("#error_fname").text("");
        }
    }); 
    $("#txtlname").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#submit_step1').attr('disabled', true);
            $("#error_lname").text("* Please Enter Last Name!");
            return false;
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#submit_step1').attr('disabled', false);
            $("#error_lname").text("");
        }
    });
    $("#txtemail").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#submit_step1').attr('disabled', true);
            $("#error_email").text("*Enter Email Id!");
        }
        else if (!isEmail($("#txtemail").val())) {
            $(this).css("border-color", "#FF0000");
            $('#submit_step1').attr('disabled', true);
            $("#error_email").text("*Enter Valid Email Id!");
            valid = false;
            return false;

        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#submit_step1').attr('disabled', false);
            $("#error_email").text("");
        }
    });
    $("#txtCountryCode").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#submit_step1').attr('disabled', true);
            $("#error_ccode").text("*Enter Country Code!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#submit_step1').attr('disabled', false);
            $("#error_ccode").text("");
        }
    });
    $("#txtmobileno").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#submit_step1').attr('disabled', true);
            $("#error_mobileno").text("*Enter Mobile Number!");
        }/* 
        else if (!IsMobileNumber($("#txtmobileno").val())) {
            $(this).css("border-color", "#FF0000");
            $('#submit_step1').attr('disabled', true);
            $("#error_mobileno").text("*Enter valid Mobile Number!");
            valid = false;
            return false;

        } */
        else {
            $(this).css("border-color", "#2eb82e");
            $('#submit_step1').attr('disabled', false);
            $("#error_mobileno").text("");
        }
    });
    $("#txtmerchant").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#submit_step1').attr('disabled', true);
            $("#error_merchant").text("*Enter Merchant ID!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#submit_step1').attr('disabled', false);
            $("#error_merchant").text("");
        }
    });
    $("#txtCat").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#submit_step1').attr('disabled', true);
            $("#error_Cat").text("*Enter Categary!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#submit_step1').attr('disabled', false);
            $("#error_Cat").text("");
        }
    });
    /* $("#txtpass").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#submit_step1').attr('disabled', true);
            $("#error_pass").text("*Please Enter Password !");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#submit_step1').attr('disabled', false);
            $("#error_pass").text("");
        }
    });
    $("#txtconfirmpass").bind("change blur", function () {
        
        var pwd = $('#txtpass').val();
        var cpwd = $(this).val();
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#submit_step1').attr('disabled', true);
            $("#error_confirmpass").text("*Please Confirm Password !");
        }
        else if ( cpwd != pwd) {
            $(this).css("border-color", "#FF0000");
            $('#submit_step1').attr('disabled', true);
            $("#error_confirmpass").text("*Password not match!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#submit_step1').attr('disabled', false);
            $("#error_confirmpass").text("");
        }
    }); */

    $("#txtDOB").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#submit_step1').attr('disabled', true);
            $("#error_DOB").text("*Please Select Birth Date !");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#submit_step1').attr('disabled', false);
            $("#error_DOB").text("");
        }
    });

    $("#txtappa").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#submit_step2').attr('disabled', true);
            $("#error_appa").text("*Enter Appartment / Building No.!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#submit_step2').attr('disabled', false);
            $("#error_appa").text("");
        }
    });
    $("#txtlandmark").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#submit_step2').attr('disabled', true);
            $("#error_landmark").text("*Enter Landmark!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#submit_step2').attr('disabled', false);
            $("#error_landmark").text("");
        }
    });
    $("#txtstreet").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#submit_step2').attr('disabled', true);
            $("#error_street").text("*Enter Street / Area Name!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#submit_step2').attr('disabled', false);
            $("#error_street").text("");
        }
    });
    $("#txtpincode").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#submit_step2').attr('disabled', true);
            $("#error_pin").text("*Enter Pincode!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#submit_step2').attr('disabled', false);
            $("#error_pin").text("");
        }
    });
    $("#txtcity").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#submit_step2').attr('disabled', true);
            $("#error_city").text("*Enter City!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#submit_step2').attr('disabled', false);
            $("#error_city").text("");
        }
    });
    $("#txtstate").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#submit_step2').attr('disabled', true);
            $("#error_state").text("*Enter State!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#submit_step2').attr('disabled', false);
            $("#error_state").text("");
        }
    });
    $("#txtcountry").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#submit_step2').attr('disabled', true);
            $("#error_country").text("*Enter Country!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#submit_step2').attr('disabled', false);
            $("#error_country").text("");
        }
    });
    $("#b_txtappa").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#submit_step2').attr('disabled', true);
            $("#error_b_appa").text("*Enter Appartment / Building No.!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#submit_step2').attr('disabled', false);
            $("#error_b_appa").text("");
        }
    });
    $("#b_txtlandmark").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#submit_step2').attr('disabled', true);
            $("#error_b_landmark").text("*Enter Landmark!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#submit_step2').attr('disabled', false);
            $("#error_b_landmark").text("");
        }
    });
    $("#b_txtstreet").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#submit_step2').attr('disabled', true);
            $("#error_b_street").text("*Enter Street / Area Name!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#submit_step2').attr('disabled', false);
            $("#error_b_street").text("");
        }
    });
    $("#b_txtpincode").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#submit_step2').attr('disabled', true);
            $("#error_b_pin").text("*Enter Pincode!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#submit_step2').attr('disabled', false);
            $("#error_b_pin").text("");
        }
    });
    $("#b_txtcity").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#submit_step2').attr('disabled', true);
            $("#error_b_city").text("*Enter City!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#submit_step2').attr('disabled', false);
            $("#error_b_city").text("");
        }
    });
    $("#b_txtstate").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#submit_step2').attr('disabled', true);
            $("#error_b_state").text("*Enter State!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#submit_step2').attr('disabled', false);
            $("#error_b_state").text("");
        }
    });
    $("#b_txtcountry").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#submit_step2').attr('disabled', true);
            $("#error_b_country").text("*Enter Country!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#submit_step2').attr('disabled', false);
            $("#error_b_country").text("");
        }
    });
});
function consumerstep1() { 
    var valid = true;
    if ($('#txtcname').val() == '') {
        $('#txtcname').css("border-color", "#FF0000");
        $('#submit_step1').attr('disabled', true);
        $("#error_cname").text("* Please Enter First Name!");
        valid = false;
    }
    else {
        $('#txtcname').css("border-color", "#2eb82e");
        $('#submit_step1').attr('disabled', false);
        $("#error_cname").text("");
    }
    if ($('#txtfname').val() == '') {
        $('#txtfname').css("border-color", "#FF0000");
        $('#submit_step1').attr('disabled', true);
        $("#error_fname").text("* Please Enter First Name!");
        valid = false;
    }
    else {
        $('#txtfname').css("border-color", "#2eb82e");
        $('#submit_step1').attr('disabled', false);
        $("#error_fname").text("");
    }

   
    if ($('#txtlname').val() == '') {
        $('#txtlname').css("border-color", "#FF0000");
        $('#submit_step1').attr('disabled', true);
        $("#error_lname").text("* Please Enter Last Name!");
        valid = false;
    }
    else {
        $('#txtlname').css("border-color", "#2eb82e");
        $('#submit_step1').attr('disabled', false);
        $("#error_lname").text("");
    }
    if (!isEmail($("#txtemail").val())) {
        $('#txtemail').css("border-color", "#FF0000");
        $('#submit_step1').attr('disabled', true);
        $("#error_email").text("*Enter Valid Email Id!");
        valid = false;  
    }
    else {
        $('#txtemail').css("border-color", "#2eb82e");
        $('#submit_step1').attr('disabled', false);
        $("#error_email").text("");
    }
    if ($('#txtCountryCode').val() == '') {
        $('#txtCountryCode').css("border-color", "#FF0000");
        $('#submit_step1').attr('disabled', true);
        $("#error_ccode").text("*Enter Country Code!");
        valid = false;
    }
    else {
        $('#txtCountryCode').css("border-color", "#2eb82e");
        $('#submit_step1').attr('disabled', false);
        $("#error_ccode").text("");
    }
    if ($('#txtmobileno').val() == '') {
        $('#txtmobileno').css("border-color", "#FF0000");
        $('#submit_step1').attr('disabled', true);
        $("#error_mobileno").text("*Enter Mobile Number!");
        valid = false;
    }
    else if (!IsMobileNumber($("#txtmobileno").val())) {
        $('#txtmobileno').css("border-color", "#FF0000");
        $('#submit_step1').attr('disabled', true);
        $("#error_mobileno").text("*Enter valid Mobile Number!");
        valid = false;


    }
    else {
        $('#txtmobileno').css("border-color", "#2eb82e");
        $('#submit_step1').attr('disabled', false);
        $("#error_mobileno").text("");

    }
    if ($('#txtDOB').val() == '') {
        $('#txtDOB').css("border-color", "#FF0000");
        $('#submit_step1').attr('disabled', true);
        $("#error_DOB").text("*Please Select Birth Date !");
        valid = false;
    }
    else {
        $('#txtDOB').css("border-color", "#2eb82e");
        $('#submit_step1').attr('disabled', false);
        $("#error_DOB").text("");
    }
    if ($('#txtmerchant').val() == '') {
        $('#txtmerchant').css("border-color", "#FF0000");
        $('#submit_step1').attr('disabled', true);
        $("#error_merchant").text("*Please Enter Merchant ID !");
        valid = false;
    }
    else {
        $('#txtmerchant').css("border-color", "#2eb82e");
        $('#submit_step1').attr('disabled', false);
        $("#error_merchant").text("");
    }
    if ($('#txtCat').val() == '') {
        $('#txtCat').css("border-color", "#FF0000");
        $('#submit_step1').attr('disabled', true);
        $("#error_Cat").text("*Please Enter Category !");
        valid = false;
    }
    else {
        $('#txtCat').css("border-color", "#2eb82e");
        $('#submit_step1').attr('disabled', false);
        $("#error_Cat").text("");
    }

    if ($('#txtpass').val() == '') {
        $('#txtpass').css("border-color", "#FF0000");
        $('#submit_step1').attr('disabled', true);
        $("#error_pass").text("*Please Enter Password!");
        valid = false;
    }
    else {
        $('#txtpass').css("border-color", "#2eb82e");
        $('#submit_step1').attr('disabled', false);
        $("#error_pass").text("");
    }
    if ($('#txtconfirmpass').val() == '') {
        $('#txtconfirmpass').css("border-color", "#FF0000");
        $('#submit_step1').attr('disabled', true);
        $("#error_confirmpass").text("*Please Confirm Password!");
        valid = false;
    }
    else if ($('#txtpass').val() != $('#txtconfirmpass').val()) {
        $('#txtconfirmpass').css("border-color", "#FF0000");
        $('#submit_step1').attr('disabled', true);
        $("#error_confirmpass").text("*Password not match!");
        valid = false;
    }
    else {
        $('#txtconfirmpass').css("border-color", "#2eb82e");
        $('#submit_step1').attr('disabled', false);
        $("#error_confirmpass").text("");
    }
    return valid;

}
function consumerstep2() { 
    var valid = true;
    if ($('#txtappa').val() == '') {
        $('#txtappa').css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_appa").text("*Enter Appartment / Building No.!");
        valid = false;
    }
    else {
        $('#txtappa').css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_appa").text("");
    }
    if ($('#txtlandmark').val() == '') {
        $('#txtlandmark').css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_landmark").text("*Enter Landmark!");
        valid = false;
    }
    else {
        $('#txtlandmark').css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_landmark").text("");
    }
    if ($('#txtstreet').val() == '') {
        $('#txtstreet').css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_street").text("*Enter Street / Area Name!");
        valid = false;
    }
    else {
        $('#txtstreet').css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_street").text("");
    }
    if ($('#txtpincode').val() == '') {
        $('#txtpincode').css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_pin").text("*Enter Pincode!");
        valid = false;
    }
    else {
        $('#txtpincode').css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_pin").text("");
    }
    if ($('#txtcity').val() == '') {
        $('#txtcity').css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_city").text("*Enter City!");
        valid = false;
    }
    else {
        $('#txtcity').css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_city").text("");
    }
    if ($('#txtstate').val() == '') {
        $('#txtstate').css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_state").text("*Enter State!");
        valid = false;
    }
    else {
        $('#txtstate').css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_state").text("");
    }
    if ($('#txtcountry').val() == '') {
        $('#txtcountry').css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_country").text("*Enter Country!");
        valid = false;
    }
    else {
        $('#txtcountry').css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_country").text("");
    }

    return valid;
};