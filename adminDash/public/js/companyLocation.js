
  
    $('#txtBranchRegDate').inputmask('dd/mm/yyyy', { 'placeholder': 'dd/mm/yyyy' })
    
    function branchClose() 
    { 
        $("#pageContainer").empty();  
        $("#pageContainer").load("pages/branchList.html");
    }
$(document).ready(function () 
{ 
    $("#txtBranchName").bind("change blur", function () 
    {
        if ($(this).val() == '') 
        {
            $(this).css("border-color", "#FF0000");
            $('#btnSubmit').attr('disabled', true);
            $("#error_comp_name").text("* Please Enter Branch Name!");
            return false;
        }
        else 
        {
            $(this).css("border-color", "#2eb82e");
            $('#btnSubmit').attr('disabled', false);
            $("#error_comp_name").text("");
        }
    });
    
    $("#txtrent").keyup(function()
    {
        $val=$(this).val();
        if($val!="")
        {
          $vtcharge=$("#txtmain").val();  // maintainence
          $tcharge=parseFloat($val)+parseFloat($vtcharge);
          $("#txttotal").val($tcharge);
        }
        else
        {
            $vtcharge=$("#txtmain").val();
            if($vtcharge=="")
            {
                $("#txttotal").val("0");
            }
            else
            {
                $("#txttotal").val($vtcharge);
            }
        } 
    });

    $("#txtmain").keyup(function()
    {
        $val=$(this).val(); // maintainence
        if($val!="")
        {
           $vtcharge=$("#txtrent").val();  // maintainence 
           $tcharge=parseFloat($val)+parseFloat($vtcharge);
           $("#txttotal").val($tcharge);
        }
        else
        {
            $vtcharge=$("#txtrent").val();
            if($vtcharge=="")
            {
                $("#txttotal").val("0");
            }
            else
            {
                $("#txttotal").val($vtcharge);
            } 
        }
    });
});

$(".editbranch").click(function () {  // edit acompany details form

$('#branchform').find('input, textarea, button, select').removeAttr('disabled'); 
var rented=$("#chkRented").attr("checked") ? 1 : 0; 
 
if(rented==1)
{  
    $("#txtownerName").attr("disabled",false);
    $("#txtrent").attr("disabled",false);
    $("#txtdeposit").attr("disabled",false);
    $("#txtomobile").attr("disabled",false);
    $("#txtownerAdd").attr("disabled",false);
    $("#filedoc").attr("disabled",false);
    $("#chkRented").attr("disabled",true);
}
else
{
    $("#txtownerName").attr("disabled",true);
    $("#txtrent").attr("disabled",true);
    $("#txtdeposit").attr("disabled",true);
    $("#txtomobile").attr("disabled",true);
    $("#txtownerAdd").attr("disabled",true);
    $("#filedoc").attr("disabled",true);
    $("#chkRented").attr("disabled",true);
}
$("#txttotal").attr("disabled",true);
});

$(function(){
    var checkboxs = $('input[type=checkbox]');  
    checkboxs.change(function(){
      if($(this).is(':checked')){
        $("#txtownerName").attr("disabled",false);
        $("#txtrent").attr("disabled",false);
        $("#txtdeposit").attr("disabled",false);
        $("#txtomobile").attr("disabled",false);
        $("#txtownerAdd").attr("disabled",false);
        $("#filedoc").attr("disabled",false);
      } else {
        $("#txtownerName").attr("disabled",true);
        $("#txtrent").attr("disabled",true);
        $("#txtdeposit").attr("disabled",true);
        $("#txtomobile").attr("disabled",true);
        $("#txtownerAdd").attr("disabled",true);
        $("#filedoc").attr("disabled",true);
      }
    });
  })

  // step 1 validation
function step1() {
    var valid = true;

    if ($("#txtBranchName").val() == '') {
        $("#txtBranchName").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_comp_name").text("* Enter Company Branch Name!");
        valid = false;
    }
    else {
        $("#txtBranchName").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_comp_name").text("");
    }

    if ($("#txtpurpose").val() == '') {
        $("#txtpurpose").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_cshort_name").text("* Enter what work actually done here!");
        valid = false;
    }
    else {
        $("#txtpurpose").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_cshort_name").text("");
    }

    if ($("#txttelno").val() == '') {
        $("#txttelno").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_txttelno").text("* Enter Telphone Number!");
        valid = false;
    }
    else {
        $(this).css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_txttelno").text("");
    }


    if ($("#txtemail").val() == '') {
        $("#txtemail").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_txtemail").text("*Enter Email Id!");
        valid = false;
    }
    else if (!isEmail($("#txtemail").val())) {
        $('#btn1').attr('disabled', true);
        $("#error_txtemail").text("*Enter Valid Email Id!");
        valid = false;

    }
    else {
        $("#txtemail").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_txtemail").text("");
    }

    if ($("#txtBranchRegDate").val() == '') {
        $("#txtBranchRegDate").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_txtcompregdate").text("* Enter Branch Reg. Date !");
        valid = false;
    }
    else {
        $("#txtBranchRegDate").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_txtcompregdate").text("");
    }

    return valid;
}
