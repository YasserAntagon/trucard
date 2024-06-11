

$(document).ready(function () 
{
    $('#txtcompregdatedatepicker').inputmask('dd/mm/yyyy', { 'placeholder': 'dd/mm/yyyy' });

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

    allNextBtn.click(async function()
    {
        var curStep = $(this).closest(".setup-content"),
            curStepBtn = curStep.attr("id"),
            nextStepWizard = $('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().next().children("a"), 
            isValid = true;

        $(".form-group").removeClass("has-error"); 

        if(curStepBtn=="step-1")  // company details validation
        {
            if(step1())
            {
                var svstatus = await submitCompany();
                if(svstatus){
                    nextStepWizard.removeAttr('disabled').trigger('click');
                }
            }
            else
            {
                isValid = false; 
            }
        }  
        else if(curStepBtn=="step-2") // Bank Details validation
        {
            if(step2())
            {
                // submitBankDetail();
                var svstatus = await submitBankDetail();
                if(svstatus){
                    nextStepWizard.removeAttr('disabled').trigger('click');
                }
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
                cmpAddress();
            }
            else
            {
                isValid = false; 
            }
        }   
});

$('div.setup-panel div a.btn-primary').trigger('click');

    // Same as address radio click
$('.radio-group label').on('click', function()
{
    $(this).removeClass('not-active').siblings().addClass('not-active');
});

// company details validations
    $("#txtcomp_name").bind("change blur", function () 
    {
        if ($(this).val() == '') 
        {
            $(this).css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_comp_name").text("* Enter Company Name!");
        }
        else 
        {
            $(this).css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_comp_name").text("");
        }
    });
    $("#txtcshort_name").bind("change blur", function () 
    {
        if ($(this).val() == '') 
        {
            $(this).css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_cshort_name").text("* Enter Company Short Name!");
        }
        else 
        {
            $(this).css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_cshort_name").text("");
        }
    });
    $("#txttelno").bind("change blur", function () 
    {
        if ($(this).val() == '') 
        {
            $(this).css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_txttelno").text("* Enter Telphone Number!");
        }
        else 
        {
            $(this).css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_txttelno").text("");
        }
    });
    $("#txtemail").bind("change blur", function () 
    {
        if ($(this).val() == '') 
        {
            $(this).css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_txtemail").text("* Enter Email Id!");
        }
        else if (!isEmail($("#txtemail").val())) 
        {
            $('#btn1').attr('disabled', true);
            $("#error_txtemail").text("* Enter Valid Email Id!");
            valid = false;
            return false;

        }
        else 
        {
            $(this).css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_txtemail").text("");
        }
    });
    $("#txtcompregno").bind("change blur", function () 
    {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_txtcompregno").text("* Enter Company Register Number!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_txtcompregno").text("");
        }
    });
    $("#txtcompregdatedatepicker").bind("change blur", function () 
    {
        if ($(this).val() == '') 
        {
            $(this).css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_txtcompregdate").text("* Select Company Register Date!");
        }
        else 
        {
            $(this).css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_txtcompregdate").text("");
        }
    });
    $("#txtpan").bind("change blur", function () 
    { 
        if ($(this).val() == '') 
        {
            $(this).css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_txtpan").text("* Enter Company PAN!");
        }
        else 
        {
            $(this).css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_txtpan").text("");
        }
    });
    $("#txtGSTIN").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_txtGSTIN").text("* Enter Company GSTIN Number!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_txtGSTIN").text("");
        }
    });


//bank Details
$("#txt_bankname").bind("change blur", function () {
if ($("#txt_bankname").val() == '') 
{
    $("#txt_bankname").css("border-color", "#FF0000");
    $('#btn2').attr('disabled', true);
    $("#error_bankname").text("* Enter Bank Name..!!");
    valid = false;
} 
else 
{
    $("#txt_bankname").css("border-color", "#2eb82e");
    $('#btn2').attr('disabled', false);
    $("#error_bankname").text("");
}
});
$("#txtifsc").bind("change blur", function () {
if ($("#txtifsc").val() == '') 
{
    $("#txtifsc").css("border-color", "#FF0000");
    $('#btn2').attr('disabled', true);
    $("#error_ifsc").text("* Enter Bank IFSC Code !");
    valid = false;
} 
else
{
    $("#txtifsc").css("border-color", "#2eb82e");
    $('#btn2').attr('disabled', false);
    $("#error_ifsc").text("");
}
});
$("#txtAcc").bind("change blur", function () {
if ($("#txtAcc").val() == '') 
{
    $("#txtAcc").css("border-color", "#FF0000");
    $('#btn2').attr('disabled', true);
    $("#error_acc").text("* Enter Bank Account Number");
    valid = false;
} 
else 
{
    $("#txtAcc").css("border-color", "#2eb82e");
    $('#btn2').attr('disabled', false);
    $("#error_acc").text("");
}
});


    // address
    $("#appa").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn3').attr('disabled', true);
            $("#error_cp_add1").text("* Enter Appartment / Building No.!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn3').attr('disabled', false);
            $("#error_cp_add1").text("");
        }
    });
    $("#txtlandmark").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn3').attr('disabled', true);
            $("#error_landmark").text("* Enter Landmark!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn3').attr('disabled', false);
            $("#error_landmark").text("");
        }
    });
    $("#txtstreet").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn3').attr('disabled', true);
            $("#error_street").text("* Enter Street / Area Name!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn3').attr('disabled', false);
            $("#error_street").text("");
        }
    });
    $("#txtpincode").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn3').attr('disabled', true);
            $("#error_pin").text("* Enter Pincode!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn3').attr('disabled', false);
            $("#error_pin").text("");
        }
    });
    $("#txtcity").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn3').attr('disabled', true);
            $("#error_city").text("* Enter City!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn3').attr('disabled', false);
            $("#error_city").text("");
        }
    });
    $("#txtstate").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn3').attr('disabled', true);
            $("#error_state").text("* Enter State!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn3').attr('disabled', false);
            $("#error_state").text("");
        }
    });
    $("#txtcountry").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn3').attr('disabled', true);
            $("#error_country").text("* Enter Country!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn3').attr('disabled', false);
            $("#error_country").text("");
        }
    });
    $("#b_appa").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn3').attr('disabled', true);
            $("#error_b_add1").text("* Enter Appartment / Building No.!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn3').attr('disabled', false);
            $("#error_b_add1").text("");
        }
    });
    $("#b_txtlandmark").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn3').attr('disabled', true);
            $("#error_b_landmark").text("* Enter Landmark!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn3').attr('disabled', false);
            $("#error_b_landmark").text("");
        }
    });
    $("#b_txtstreet").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn3').attr('disabled', true);
            $("#error_b_street").text("* Enter Street / Area Name!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn3').attr('disabled', false);
            $("#error_b_street").text("");
        }
    });
    $("#b_txtpincode").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn3').attr('disabled', true);
            $("#error_b_pin").text("* Enter Pincode!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn3').attr('disabled', false);
            $("#error_b_pin").text("");
        }
    });
    $("#b_txtcity").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn3').attr('disabled', true);
            $("#error_b_city").text("* Enter City!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn3').attr('disabled', false);
            $("#error_b_city").text("");
        }
    });
    $("#b_txtstate").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn3').attr('disabled', true);
            $("#error_b_state").text("* Enter State!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn3').attr('disabled', false);
            $("#error_b_state").text("");
        }
    });
    $("#b_txtcountry").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn3').attr('disabled', true);
            $("#error_b_country").text("* Enter Country!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn3').attr('disabled', false);
            $("#error_b_country").text("");
        }
    });
    companyBind(); //
});

function step1() 
{
    var valid = true;
    if ($("#txtcomp_name").val() == '') {

        $("#txtcomp_name").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_comp_name").text("* Enter Company Name!");
        valid = false;
    } else {
        $("#txtcomp_name").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_comp_name").text("");
    }
    if ($("#txtcshort_name").val() == '') {
        $("#txtcshort_name").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_cshort_name").text("* Enter your Company Short Name!");
        valid = false;
    } else {
        $("#txtcshort_name").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_cshort_name").text("");
    }
    if ($("#txttelno").val() == '') {
        $("#txttelno").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_txttelno").text("* Enter Telphone Number!");
        valid = false;
    } else {
        $("#txttelno").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_txttelno").text("");
    }
    if ($("#txtemail").val() == '') {
        $("#txtemail").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_txtemail").text("* Enter Email Id!");
        valid = false;
    } else {
        $("#txtemail").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_txtemail").text("");
    }
    if ($("#txtcompregno").val() == '') {

        $("#txtcompregno").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_txtcompregno").text("* Enter Company Register Number!");
        valid = false;
    } else {
        $("#txtcompregno").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_txtcompregno").text("");
    }
    if ($("#txtcompregdatedatepicker").val() == '') 
    {
        $("#txtcompregdatedatepicker").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_txtcompregdate").text("* Enter Company Register Date!");
        valid = false;
    } else {
        $("#txtcompregdatedatepicker").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_txtcompregdate").text("");
    }
    if ($("#txtpan").val() == '') {

        $("#txtpan").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_txtpan").text("* Enter Company Pan!");
        valid = false;
    } else {
        $("#txtpan").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_txtpan").text("");
    }
    if ($("#txtGSTIN").val() == '') {

        $("#txtGSTIN").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_txtGSTIN").text("* Enter Company GSTIN Number!");
        valid = false;
    } else {
        $("#txtGSTIN").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_txtGSTIN").text("");
    }
    return valid;
}

function step2() 
{
    var valid = true;
    if ($("#txt_bankname").val() == '') 
    {
        $("#txt_bankname").css("border-color", "#FF0000");
        $('#btn2').attr('disabled', true);
        $("#error_bankname").text("* Enter Bank Name..!!");
        valid = false;
    } 
    else 
    {
        $("#txt_bankname").css("border-color", "#2eb82e");
        $('#btn2').attr('disabled', false);
        $("#error_bankname").text("");
    }
    if ($("#txtifsc").val() == '') 
    {
        $("#txtifsc").css("border-color", "#FF0000");
        $('#btn2').attr('disabled', true);
        $("#error_ifsc").text("* Enter Bank IFSC Code !");
        valid = false;
    } 
    else
    {
        $("#txtifsc").css("border-color", "#2eb82e");
        $('#btn2').attr('disabled', false);
        $("#error_ifsc").text("");
    }

    if ($("#txtAcc").val() == '') 
    {
        $("#txtAcc").css("border-color", "#FF0000");
        $('#btn2').attr('disabled', true);
        $("#error_acc").text("* Enter Bank Account Number");
        valid = false;
    } 
    else 
    {
        $("#txtAcc").css("border-color", "#2eb82e");
        $('#btn2').attr('disabled', false);
        $("#error_acc").text("");
    }
    return valid;
}

function step3() 
{
    var valid = true;
    
    if ($("#appa").val() == '') {

        $("#appa").css("border-color", "#FF0000");
        $('#btn3').attr('disabled', true);
        $("#error_cp_add1").text("* Enter Appartment / Buildding No!");
        valid = false;
    } else {
        $("#appa").css("border-color", "#2eb82e");
        $('#btn3').attr('disabled', false);
        $("#error_cp_add1").text("");
    }
    if ($("#txtlandmark").val() == '') {

        $("#txtlandmark").css("border-color", "#FF0000");
        $('#btn3').attr('disabled', true);
        $("#error_landmark").text("* Enter Landmark!");
        valid = false;
    } else {
        $("#txtlandmark").css("border-color", "#2eb82e");
        $('#btn3').attr('disabled', false);
        $("#error_landmark").text("");
    }
    if ($("#txtstreet").val() == '') {

        $("#txtstreet").css("border-color", "#FF0000");
        $('#btn3').attr('disabled', true);
        $("#error_street").text("* Enter Street / Area Name!");
        valid = false;
    } else {
        $("#txtstreet").css("border-color", "#2eb82e");
        $('#btn3').attr('disabled', false);
        $("#error_street").text("");
    }
    if ($("#txtpincode").val() == '') {

        $("#txtpincode").css("border-color", "#FF0000");
        $('#btn3').attr('disabled', true);
        $("#error_pin").text("* Enter Pincode!");
        valid = false;
    } else {
        $("#txtpincode").css("border-color", "#2eb82e");
        $('#btn3').attr('disabled', false);
        $("#error_pin").text("");
    }
    if ($("#txtcity").val() == '') {

        $("#txtcity").css("border-color", "#FF0000");
        $('#btn3').attr('disabled', true);
        $("#btn3").text("* Enter City!");
        valid = false;
    } else {
        $("#txtcity").css("border-color", "#2eb82e");
        $('#btn3').attr('disabled', false);
        $("#error_city").text("");
    }
    if ($("#txtstate").val() == '') {

        $("#txtstate").css("border-color", "#FF0000");
        $('#btn3').attr('disabled', true);
        $("#error_state").text("* Enter State!");
        valid = false;
    } else {
        $("#txtstate").css("border-color", "#2eb82e");
        $('#btn3').attr('disabled', false);
        $("#error_state").text("");
    }
    if ($("#txtcountry").val() == '') {

        $("#txtcountry").css("border-color", "#FF0000");
        $('#btn3').attr('disabled', true);
        $("#error_country").text("* Enter Country!");
        valid = false;
    } else {
        $("#txtcountry").css("border-color", "#2eb82e");
        $('#btn3').attr('disabled', false);
        $("#error_country").text("");
    }
    if ($("#b_appa").val() == '') {

        $("#b_appa").css("border-color", "#FF0000");
        $('#btn3').attr('disabled', true);
        $("#error_b_add1").text("* Enter Appartment / Buildding No!");
        valid = false;
    } else {
        $("#b_appa").css("border-color", "#2eb82e");
        $('#btn3').attr('disabled', false);
        $("#error_b_add1").text("");
    }
    if ($("#b_txtlandmark").val() == '') {

        $("#b_txtlandmark").css("border-color", "#FF0000");
        $('#btn3').attr('disabled', true);
        $("#error_b_landmark").text("* Enter Landmark!");
        valid = false;
    } else {
        $("#b_txtlandmark").css("border-color", "#2eb82e");
        $('#btn3').attr('disabled', false);
        $("#error_b_landmark").text("");
    }
    if ($("#b_txtstreet").val() == '') {

        $("#b_txtstreet").css("border-color", "#FF0000");
        $('#btn3').attr('disabled', true);
        $("#error_b_street").text("* Enter Street / Area Name!");
        valid = false;
    } else {
        $("#b_txtstreet").css("border-color", "#2eb82e");
        $('#btn3').attr('disabled', false);
        $("#error_b_street").text("");
    }
    if ($("#b_txtpincode").val() == '') {

        $("#b_txtpincode").css("border-color", "#FF0000");
        $('#btn3').attr('disabled', true);
        $("#error_b_pin").text("* Enter Pincode!");
        valid = false;
    } else {
        $("#b_txtpincode").css("border-color", "#2eb82e");
        $('#btn3').attr('disabled', false);
        $("#error_b_pin").text("");
    }
    if ($("#b_txtcity").val() == '') {

        $("#b_txtcity").css("border-color", "#FF0000");
        $('#btn3').attr('disabled', true);
        $("#error_b_city").text("* Enter City!");
        valid = false;
    } else {
        $("#b_txtcity").css("border-color", "#2eb82e");
        $('#btn3').attr('disabled', false);
        $("#error_b_city").text("");
    }
    if ($("#b_txtstate").val() == '') {

        $("#b_txtstate").css("border-color", "#FF0000");
        $('#btn3').attr('disabled', true);
        $("#error_b_state").text("* Enter State!");
        valid = false;
    } else {
        $("#b_txtstate").css("border-color", "#2eb82e");
        $('#btn3').attr('disabled', false);
        $("#error_b_state").text("");
    }
    if ($("#b_txtcountry").val() == '') {

        $("#b_txtcountry").css("border-color", "#FF0000");
        $('#btn3').attr('disabled', true);
        $("#error_b_country").text("* Enter Country!");
        valid = false;
    } else {
        $("#b_txtcountry").css("border-color", "#2eb82e");
        $('#btn3').attr('disabled', false);
        $("#error_b_country").text("");
    }
    return valid;
}


// same as registered office address
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
$(".editcompany").click(function () {  // edit acompany details form

    $('#companyform').find('input, textarea, button, select').removeAttr('disabled');
})
