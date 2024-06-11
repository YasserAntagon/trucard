/*!
 File: KYC Verification
 Edited : Nikhil Bharambe
 Dated : 17-04-2019
 Description : pending kyc list & kyc documents preview for approve.
 */
$(function() 
{ 
var type="doc";
  $(".onpreview").click(function (e) 
  {
  e.preventDefault();
  $pdfpath=$(this).attr("data-url");

if(type!="image")
{
  var src="https://docs.google.com/viewer?url="+$pdfpath+"&embedded=true";
  $("#framePreview").attr("src", src);
}
else
{  
  $("#framePreview").attr("src", $pdfpath);
}
});
 
$(".onview").click(function (e) 
{
  $("#pageContainer").empty();  
  $("#pageContainer").load("pages/assetmanagerKYC.html");

})

    $('#example1').DataTable({
      'paging'      : true,
      'lengthChange': false,
      'searching'   : true,
      'ordering'    : true,
      'info'        : false,
      'autoWidth'   : false
    })
    
  })