// author : Suresh Patil
// date : 24-04-2019
// Description : Validations For Consumer

// author : Suresh Patil
// date : 24-04-2019
// Description : update KYC



$(document).ready(function () {
    //Initialize tooltips
    $('.nav-tabs > li a[title]').tooltip();

    //Wizard
    $('a[data-toggle="tab"]').on('show.bs.tab', function (e) {

        var $target = $(e.target);

        if ($target.parent().hasClass('disabled')) {
            return false;
        }
    });

    $(".next-step").click(function (e) {

        var $active = $('.wizard .nav-tabs li.active');
        //    $active.next().removeClass('disabled');

        nextTab($active, $(this).attr('id'));


    });
    $(".prev-step").click(function (e) {

        var $active = $('.wizard .nav-tabs li.active');
        prevTab($active);

    });
});
async function nextTab(elem, curstep) {
    if (curstep == "submit_step1") {
        if (consumerstep1() === true) {
            var stat = await createconsumer();
            if (stat == true) {
                $(elem).next().removeClass('disabled');

                $(elem).next().find('a[data-toggle="tab"]').click();
            }
        }
        // $(elem).next().removeClass('disabled');

        // $(elem).next().find('a[data-toggle="tab"]').click();
    }
    if (curstep == "submit_step2") {
        if (consumerstep2() === true) {
            var stat = await updateAddr();
            if (stat == true) {
                $(elem).next().removeClass('disabled')
                //initMap(); 
                $(elem).next().find('a[data-toggle="tab"]').click();
            }
        }
        // $(elem).next().removeClass('disabled');

        // $(elem).next().find('a[data-toggle="tab"]').click();
    }
}
function prevTab(elem) {
    $(elem).prev().find('a[data-toggle="tab"]').click();
}


$(document).ready(function () {
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
    $("#txtccode").bind("change blur", function () {
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




// same as registred office address
$("input[name='reg']").change(function () {
    var radioValue = $(this).val();
    if (radioValue == 'True') {
        $('#b_txtappa').val($('#txtappa').val());
        $('#b_txtstreet').val($('#txtstreet').val());
        $('#b_txtlandmark').val($('#txtlandmark').val());
        $('#b_txtpincode').val($('#txtpincode').val());
        $('#b_txtstate').val($('#txtstate').val());
        $('#b_txtcity').val($('#txtcity').val());
        $('#b_txtcountry').val($('#txtcountry').val());

        $('#b_txtappa').css("border-color", "#2eb82e");
        $('#b_txtstreet').css("border-color", "#2eb82e");
        $('#b_txtlandmark').css("border-color", "#2eb82e");
        $('#b_txtpincode').css("border-color", "#2eb82e");
        $('#b_txtcity').css("border-color", "#2eb82e");
        $('#b_txtstate').css("border-color", "#2eb82e");
        $('#b_txtcountry').css("border-color", "#2eb82e");

        $('#b_txtappa').attr("disabled", "disabled");
        $('#b_txtstreet').attr("disabled", "disabled");
        $('#b_txtlandmark').attr("disabled", "disabled");
        $('#b_txtpincode').attr("disabled", "disabled");
        $('#b_txtcity').attr("disabled", "disabled");
        $('#b_txtstate').attr("disabled", "disabled");
        $('#b_txtcountry').attr("disabled", "disabled");
    }
    else {
        $('#b_txtappa').val('');
        $('#b_txtstreet').val('');
        $('#b_txtlandmark').val('');
        $('#b_txtpincode').val('');
        $('#b_txtstate').val('');
        $('#b_txtcity').val('');
        $('#b_txtcountry').val('');

        $('#b_txtappa').css("border-color", "#d2d6de");
        $('#b_txtstreet').css("border-color", "#d2d6de");
        $('#b_txtlandmark').css("border-color", "#d2d6de");
        $('#b_txtpincode').css("border-color", "#d2d6de");
        $('#b_txtcity').css("border-color", "#d2d6de");
        $('#b_txtstate').css("border-color", "#d2d6de");
        $('#b_txtcountry').css("border-color", "#d2d6de");

        $('#b_txtappa').removeAttr("disabled");
        $('#b_txtstreet').removeAttr("disabled");
        $('#b_txtlandmark').removeAttr("disabled");
        $('#b_txtpincode').removeAttr("disabled");
        $('#b_txtcity').removeAttr("disabled");
        $('#b_txtstate').removeAttr("disabled");
        $('#b_txtcountry').removeAttr("disabled");
    }
    $("#error_b_appa").text("");
    $("#error_b_street").text("");
    $("#error_b_landmark").text("");
    $("#error_b_pin").text("");
    $("#error_b_city").text("");
    $("#error_b_state").text("");
    $("#error_b_country").text("");

});

function consumerstep1() {
    var valid = true;
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
    if ($('#txtemail').val() == '') {
        $('#txtemail').css("border-color", "#FF0000");
        $('#submit_step1').attr('disabled', true);
        $("#error_email").text("*Enter Email Id!");
    }
    else if (!isEmail($("#txtemail").val())) {
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
    if ($('#txtccode').val() == '') {
        $('#txtccode').css("border-color", "#FF0000");
        $('#submit_step1').attr('disabled', true);
        $("#error_ccode").text("*Enter Country Code!");
        valid = false;
    }
    else {
        $('#txtccode').css("border-color", "#2eb82e");
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
    if ($('#b_txtappa').val() == '') {
        $('#b_txtappa').css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_b_appa").text("*Enter Appartment / Building No.!");
        valid = false;
    }
    else {
        $('#b_txtappa').css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_b_appa").text("");
    }
    if ($('#b_txtlandmark').val() == '') {
        $('#b_txtlandmark').css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_b_landmark").text("*Enter Landmark!");
        valid = false;
    }
    else {
        $('#b_txtlandmark').css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_b_landmark").text("");
    }
    if ($('#b_txtstreet').val() == '') {
        $('#b_txtstreet').css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_b_street").text("*Enter Street / Area Name!");
        valid = false;
    }
    else {
        $('#b_txtstreet').css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_b_street").text("");
    }
    if ($('#b_txtpincode').val() == '') {
        $('#b_txtpincode').css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_b_pin").text("*Enter Pincode!");
        valid = false;
    }
    else {
        $('#b_txtpincode').css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_b_pin").text("");
    }
    if ($('#b_txtcity').val() == '') {
        $('#b_txtcity').css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_b_city").text("*Enter City!");
        valid = false;
    }
    else {
        $('#b_txtcity').css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_b_city").text("");
    }
    if ($('#b_txtstate').val() == '') {
        $('#b_txtstate').css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_b_state").text("*Enter State!");
        valid = false;
    }
    else {
        $('#b_txtstate').css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_b_state").text("");
    }
    if ($('#b_txtcountry').val() == '') {
        $('#b_txtcountry').css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_b_country").text("*Enter Country!");
        valid = false;
    }
    else {
        $('#b_txtcountry').css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_b_country").text("");
    }
    if ($('#o_txtappa').val() == '') {
        $('#o_txtappa').css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_o_appa").text("*Enter Appartment / Building No.!");
        valid = false;
    }
    else {
        $('#o_txtappa').css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_o_appa").text("");
    }

    if ($('#o_txtlandmark').val() == '') {
        $('#o_txtlandmark').css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_o_landmark").text("*Enter Landmark!");
        valid = false;
    }
    else {
        $('#o_txtlandmark').css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_o_landmark").text("");
    }
    if ($('#o_txtstreet').val() == '') {
        $('#o_txtstreet').css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_o_street").text("*Enter Street / Area Name!");
        valid = false;
    }
    else {
        $('#o_txtstreet').css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_o_street").text("");
    }
    if ($('#o_txtpincode').val() == '') {
        $('#o_txtpincode').css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_o_pin").text("*Enter Pincode!");
        valid = false;
    }
    else {
        $('#o_txtpincode').css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_o_pin").text("");
    }
    if ($('#o_txtcity').val() == '') {
        $('#o_txtcity').css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_o_city").text("*Enter City!");
        valid = false;
    }
    else {
        $('#o_txtcity').css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_o_city").text("");
    }
    if ($('#o_txtstate').val() == '') {
        $('#o_txtstate').css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_o_state").text("*Enter State!");
        valid = false;
    }
    else {
        $('#o_txtstate').css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_o_state").text("");
    }
    if ($('#o_txtcountry').val() == '') {
        $('#o_txtcountry').css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_o_country").text("*Enter Country!");
        valid = false;
    }
    else {
        $('#o_txtcountry').css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_o_country").text("");
    }

    // if (valid == true) {
    //     initMap();
    // }
    return valid;
};