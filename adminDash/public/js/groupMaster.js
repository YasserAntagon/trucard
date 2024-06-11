
/*!
 File: Group Master js
 Edited : Nikhil Bharambe
 Dated : 26-04-2019
 Description : validate & some hide shows event here of Groups  
 */
 
    function openGroup()
    {  
    $("#txtDescription").val("");
    $("input[name=view]").attr('checked', false);
    $("input[name=create]").attr('checked', false);
    $("input[name=modify]").attr('checked', false);
    $("input[name=delete]").attr('checked',false); 

    $('input[type="checkbox"].flat-red').iCheck('update');
    
     $("#txtgroupName").val("");    

     $(".grouplist").addClass("hidden");
     $(".group").removeClass("hidden");
     $("#txtGroupName").focus();    
    }

    function closeGroup()
    { 
     $(".grouplist").removeClass("hidden");
     $(".group").addClass("hidden");
    }
$(document).ready(function () {
    
    
    $("#txtGroupName").bind("change blur", function () 
    {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btnSubmit').attr('disabled', true);
            $("#error_comp_name").text("* Please Enter Group Name!");
            return false;
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btnSubmit').attr('disabled', false);
            $("#error_comp_name").text("");
        }
    });
    $("#txtDescription").bind("change blur", function () 
    {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btnSubmit').attr('disabled', true);
            $("#error_des").text("* Please Enter  Description Name!");
            return false;
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btnSubmit').attr('disabled', false);
            $("#error_des").text("");
        }
    });
});