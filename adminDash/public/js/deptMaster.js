
require(__dirname+"/api/controllers/deptMaster.js");

$(document).ready(function () {
    
    $(document).on("click","#btnAddDept",function (e) 
    {
     e.preventDefault();
     $(".deptlist").addClass("hidden");
     $(".dept").removeClass("hidden");
     $("#txtDeptName").focus();    
    })

    $(document).on("click","#btnClose",function (e) 
    {
     e.preventDefault();
     $(".deptlist").removeClass("hidden");
     $(".dept").addClass("hidden");
    })
    $("#txtDeptName").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btnSubmit').attr('disabled', true);
            $("#error_comp_name").text("* Please Enter Department Name!");
            return false;
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btnSubmit').attr('disabled', false);
            $("#error_comp_name").text("");
        }
    });
});