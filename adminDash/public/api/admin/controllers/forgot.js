$(function () 
{ 
const btnSubmit = document.getElementById('btnSubmit');
btnSubmit.addEventListener('click', function (e) 
{
$email=$("#txtemail").val();
if ($email == '') 
{
    $(this).css("border-color", "#FF0000");
    $('#btnSubmit').attr('disabled', true);
    $("#error_comp_name").text("* Please Enter Email Id..!!");
    return false;
}
else 
{
    $(this).css("border-color", "#2eb82e");
    $('#btnSubmit').attr('disabled', false);
    $("#error_comp_name").text("");
}

});

$("#txtemail").bind("change blur", function () {
    if ($(this).val() == '') {
        $(this).css("border-color", "#FF0000");
        $('#btnSubmit').attr('disabled', true);
        $("#error_comp_name").text("* Please Enter Email Id..!!");
    }
    else {
        $(this).css("border-color", "#2eb82e");
        $('#btnSubmit').attr('disabled', false);
        $("#error_pass").text("");
    }
});
});