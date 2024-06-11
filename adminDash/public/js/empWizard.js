

$(document).ready(function () 
{
    var navListItems = $('div.setup-panel div a'),
            allWells = $('.setup-content'),
            allNextBtn = $('.nextBtn');

    allWells.hide();
    navListItems.click(function (e) 
    {
        e.preventDefault();
        var $target = $($(this).attr('href')),
                $item = $(this);

        if (!$item.hasClass('disabled')) 
        {
            navListItems.removeClass('btn-primary').addClass('btn-default');
            $item.addClass('btn-primary');
            allWells.hide();
            $target.show();
            $target.find('input:eq(0)').focus();
        }
    });

    allNextBtn.click(function()
    {
        var curStep = $(this).closest(".setup-content"),
            curStepBtn = curStep.attr("id"),
            nextStepWizard = $('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().next().children("a"), 
            isValid = true;

        $(".form-group").removeClass("has-error"); 

        /* if(curStepBtn=="step-1")  // company details validation
        {
            if(step1())
            {
        
            }
            else
            {
                isValid = false; 
            }
        }  
        else if(curStepBtn=="step-2") // company address validation
        {
            if(step2())
            {
              
            }
            else
            {
                isValid = false; 
            }
        }  
        else if(curStepBtn=="step-3") // company address validation
        {
            if(step3())
            {
              $('#btnSubmit').attr('disabled', false);
             
            }
            else
            {
                isValid = false; 
            }
        }   */

        if (isValid)
            nextStepWizard.removeAttr('disabled').trigger('click');
});
});

function step1() 
{
    var valid = true;    
    if ($("#txt_fname").val() == '') 
    {
        $("#txt_fname").css("border-color", "#FF0000");
        $('#submit_step1').attr('disabled', true);
        $("#error_fname").text("*Please Enter First Name!");
    }
    else 
    {
        $("#txt_fname").css("border-color", "#2eb82e");
        $('#submit_step1').attr('disabled', false);
        $("#error_fname").text("");
    }
    if ($("#txtMiddleName").val() == '') 
    {
        $("#txtMiddleName").css("border-color", "#FF0000");
        $('#submit_step1').attr('disabled', true);
        $("#error_mname").text("*Please Enter Middle Name!");
    }
    else 
    {
        $("#txtMiddleName").css("border-color", "#2eb82e");
        $('#submit_step1').attr('disabled', false);
        $("#error_mname").text("");
    }
    if ($("#txtLName").val() == '') {
        $("#txtLName").css("border-color", "#FF0000");
        $('#submit_step1').attr('disabled', true);
        $("#error_lname").text("*Please Enter Last Name!");
    }
    else {
        $("#txtLName").css("border-color", "#2eb82e");
        $('#submit_step1').attr('disabled', false);
        $("#error_lname").text("");
    }
   
    if ($("#txtdob").val() == '') {

        $("#txtdob").css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_dob").text("* Enter Date Of Birth!");
        valid = false;
    } else {
        $("#txtdob").css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_dob").text("");
    }

    if ($("#txtmobno").val() == '') {
        $("#txtmobno").css("border-color", "#FF0000");
        $('#submit_step1').attr('disabled', true);
        $("#error_txttelno").text("*Enter Mobile Number!");
        valid = false;
    } else {
        $("#txttelno").css("border-color", "#2eb82e");
        $('#submit_step1').attr('disabled', false);
        $("#error_txttelno").text("");
    }
    
    if ($("#txtemail").val() == '') {
        $("#txtemail").css("border-color", "#FF0000");
        $('#submit_step1').attr('disabled', true);
        $("#error_txtemail").text("*Enter Email Id!");
        valid = false;
    } else {
        $("#txtemail").css("border-color", "#2eb82e");
        $('#submit_step1').attr('disabled', false);
        $("#error_txtemail").text("");
    }

    return valid;
}

function step2() 
{
    var valid = true;   
    if ($("#appa").val() == '') 
    {

        $("#appa").css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_cp_add1").text("*Enter Appartment / Buildding No!");
        valid = false;
    } 
    else 
    {
        $("#appa").css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_cp_add1").text("");
    }
    if ($("#txtlandmark").val() == '') 
    {
        $("#txtlandmark").css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_landmark").text("*Enter Landmark!");
        valid = false;
    } 
    else 
    {
        $("#txtlandmark").css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_landmark").text("");
    }
    if ($("#txtstreet").val() == '') 
    {
        $("#txtstreet").css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_street").text("*Enter Street / Area Name!");
        valid = false;
    } 
    else
    {
        $("#txtstreet").css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_street").text("");
    }
    if ($("#txtpincode").val() == '') {

        $("#txtpincode").css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_pin").text("*Enter Pincode!");
        valid = false;
    } else {
        $("#txtpincode").css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_pin").text("");
    }
    if ($("#txtcity").val() == '') {

        $("#txtcity").css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_city").text("*Enter City!");
        valid = false;
    } else {
        $("#txtcity").css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_city").text("");
    }
    if ($("#txtstate").val() == '') {

        $("#txtstate").css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_state").text("*Enter State!");
        valid = false;
    } else {
        $("#txtstate").css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_state").text("");
    }
    if ($("#txtcountry").val() == '') {

        $("#txtcountry").css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_country").text("*Enter Country!");
        valid = false;
    } else {
        $("#txtcountry").css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_country").text("");
    }
    if ($("#b_appa").val() == '') {

        $("#b_appa").css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_b_add1").text("*Enter Appartment / Buildding No!");
        valid = false;
    } else {
        $("#b_appa").css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_b_add1").text("");
    }
    if ($("#b_txtlandmark").val() == '') {

        $("#b_txtlandmark").css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_b_landmark").text("*Enter Landmark!");
        valid = false;
    } else {
        $("#b_txtlandmark").css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_b_landmark").text("");
    }
    if ($("#b_txtstreet").val() == '') {

        $("#b_txtstreet").css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_b_street").text("*Enter Street / Area Name!");
        valid = false;
    } else {
        $("#b_txtstreet").css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_b_street").text("");
    }
    if ($("#b_txtpincode").val() == '') {

        $("#b_txtpincode").css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_b_pin").text("*Enter Pincode!");
        valid = false;
    } else {
        $("#b_txtpincode").css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_b_pin").text("");
    }
    if ($("#b_txtcity").val() == '') {

        $("#b_txtcity").css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_b_city").text("*Enter City!");
        valid = false;
    } else {
        $("#b_txtcity").css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_b_city").text("");
    }
    if ($("#b_txtstate").val() == '') {

        $("#b_txtstate").css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_b_state").text("*Enter State!");
        valid = false;
    } else {
        $("#b_txtstate").css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_b_state").text("");
    }
    if ($("#b_txtcountry").val() == '') {

        $("#b_txtcountry").css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_b_country").text("*Enter Country!");
        valid = false;
    } else {
        $("#b_txtcountry").css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_b_country").text("");
    }
    return valid;
}

function step3() 
{
    var valid = true;   
    if ($("#txt_bankname").val() == '') 
    {

        $("#txt_bankname").css("border-color", "#FF0000");
        $('#submit_step3').attr('disabled', true);
        $("#error_bankname").text("* Please Enter Bank Name!");
        valid = false;
    } 
    else 
    {
        $("#txt_bankname").css("border-color", "#2eb82e");
        $('#submit_step3').attr('disabled', false);
        $("#error_bankname").text("");
    }
    if ($("#txtifsc").val() == '') 
    {
        $("#txtifsc").css("border-color", "#FF0000");
        $('#submit_step3').attr('disabled', true);
        $("#error_ifsc").text("* Please Enter IFSC Code!");
        valid = false;
    } 
    else 
    {
        $("#txtifsc").css("border-color", "#2eb82e");
        $('#submit_step3').attr('disabled', false);
        $("#error_ifsc").text("");
    }
    if ($("#txtAcc").val() == '') 
    {
        $("#txtAcc").css("border-color", "#FF0000");
        $('#submit_step3').attr('disabled', true);
        $("#error_acc").text("* Please Enter IFSC Code!");
        valid = false;
    } 
    else 
    {
        $("#txtAcc").css("border-color", "#2eb82e");
        $('#submit_step3').attr('disabled', false);
        $("#error_acc").text("");
    }
    return valid;
}

// same as registred office address
$("input[name='reg']").change(function () 
{    
    var radioValue = $(this).val();
    if(radioValue=='True')
    {        
        $('#b_appa').val($('#appa').val());
        $('#b_txtstreet').val($('#txtstreet').val());
        $('#b_txtlandmark').val($('#txtlandmark').val());
        $('#b_txtpincode').val($('#txtpincode').val());
        $('#b_txtstate').val($('#txtstate').val());
        $('#b_txtcity').val($('#txtcity').val());
        $('#b_txtcountry').val($('#txtcountry').val());
    } 
    else 
    {
        $('#b_appa').val('');
        $('#b_txtstreet').val('');
        $('#b_txtlandmark').val('');
        $('#b_txtpincode').val('');
        $('#b_txtstate').val('');
        $('#b_txtcity').val('');
        $('#b_txtcountry').val('');
    }
});
