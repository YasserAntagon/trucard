
require(__dirname+"/api/controllers/subDeptMaster");

$(document).ready(function () 
{    
    $('.select2').select2();
    
    $(document).on("click","#btnAddDept",function (e) 
    {
     e.preventDefault();
     $(".deptlist").addClass("hidden");
     $(".dept").removeClass("hidden");
     $("#cmbDept").focus();    
    })

    $(document).on("click","#btnClose",function (e) 
    {
     e.preventDefault();
     $(".deptlist").removeClass("hidden");
     $(".dept").addClass("hidden");
    })
    $("#txtSubDeptName").bind("change blur", function () 
    {
        if ($(this).val() == '') 
        {
            $(this).css("border-color", "#FF0000");
            $('#btnSubmit').attr('disabled', true);
            $("#error_comp_name").text("* Please Enter Sub Department Name!");
            return false;
        }
        else 
        {
            $(this).css("border-color", "#2eb82e");
            $('#btnSubmit').attr('disabled', false);
            $("#error_comp_name").text("");
        }
    });
});