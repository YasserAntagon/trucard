/* 
 File :- Document/Forms Master
 Edited :- Nikhil Bharambe
 Dated :- 26-04-2019
 Description :- Document related all element events we write here ...
*/
require(__dirname+"/api/controllers/docMaster.js");
$(document).ready(function () 
{
    $(document).on("click","#btnAddDoc",function (e) 
    {
      e.preventDefault();
      $(".doclist").addClass("hidden");
      $(".doc").removeClass("hidden");
      $("#txtDocName").focus();    
    });

    $(document).on("click","#btnDClose",function (e) 
    {
     e.preventDefault();
     $(".doclist").removeClass("hidden");
     $(".doc").addClass("hidden");
    });

    $("#txtDocName").bind("change blur", function () 
    {
        if ($(this).val() == '') 
        {
            $(this).css("border-color", "#FF0000");
            $('#btnSubmit').attr('disabled', true);
            $("#error_comp_name").text("* Please Enter Document Name..!!");
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