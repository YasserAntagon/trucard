$(document).ready(function () {
   // $(".queue").load("redeemQueue.html");
  
    // $(".summary").load("summary.html");
    $(window).scroll(function(){ 
        if ($(this).scrollTop() > 100) { 
            $('#scroll').fadeIn(); 
            $('#scroll1').fadeOut(); 
        } 
        if ($(this).scrollTop() < 100) { 
            $('#scroll1').fadeIn(); 
            $('#scroll').fadeOut(); 
        }
    }); 
    $('#scroll').click(function(){ 
        $("html, body").animate({ scrollTop: 0 }, 600); 
        return false; 
    }); 
    $('#scroll1').click(function(){ 
        $("html, body").animate({ scrollTop: 1500 }, 600); 
        return false; 
    }); 
});