/*!
 File: Dept Master
 Edited : Nikhil Bharambe
 Dated : 15-04-2019
 Description : Depatment related all element events we write here.
 */
$(function () 
{ 
    $('#example1').DataTable({
      'paging'      : true,
      'lengthChange': false,
      'searching'   : true,
      'ordering'    : true,
      'info'        : false,
      'autoWidth'   : false
    })
 

      const btnSubmit = document.getElementById('btnSubmit');
      btnSubmit.addEventListener('click', function (e) 
      {
      $deptname=$("#txtDeptName").val();
      if ($deptname == '') 
      {
          $(this).css("border-color", "#FF0000");
          $('#btnSubmit').attr('disabled', true);
          $("#error_comp_name").text("* Please Enter Department Name!");
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