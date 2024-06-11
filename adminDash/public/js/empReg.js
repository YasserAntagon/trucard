 
$(document).ready(function () 
{    
    $("#txt_fname").bind("change blur", function () 
    {
        if ($(this).val() == '') 
        {
            $(this).css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_fname").text("*Please Enter First Name!");
        }
        else 
        {
            $(this).css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_fname").text("");
        }
    });
    $("#txtMiddleName").bind("change blur", function () 
    {
        if ($(this).val() == '') 
        {
            $(this).css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_mname").text("*Please Enter Middle Name!");
        }
        else 
        {
            $(this).css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_mname").text("");
        }
    });
    $("#txtLName").bind("change blur", function () 
    {
        if ($(this).val() == '') 
        {
            $(this).css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_lname").text("*Please Enter Last Name!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_lname").text("");
        }
        
    });

    $("#txtmobno").bind("change blur", function () 
    {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_txttelno").text("*Please Enter Mobile Number!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_txttelno").text("");
        }
    }); 
    $("#txtemail").bind("change blur", function () 
    {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_txtemail").text("*Please Enter Email Id!");
        }
        else if (!isEmail($("#txtemail").val())) {
            $('#btn1').attr('disabled', true);
            $("#error_txtemail").text("*Please Enter Valid Email Id!");
            valid = false;
            return false;
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_txtemail").text("");
        }
    });
    $("#txtempCode").bind("change blur", function () 
    {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_txtemail").text("*Please Enter Employee Code!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_txtempcode").text("");
        }
    });
});
