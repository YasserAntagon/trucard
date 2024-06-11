
require(__dirname+"/api/controllers/setCharges");

$(document).on("click","#btnCharges",function (e) 
    {
     e.preventDefault();
   //  $(".chargesList").addClass("hidden");
     $(".charges").removeClass("hidden");
     
    });

    $(document).on("click","#btnChargesHide",function (e) 
    {
     e.preventDefault();
  //   $(".chargesList").removeClass("hidden");
     $(".charges").addClass("hidden");
    });