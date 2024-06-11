$("#myModal").modal("show")
$(document).keypress(function(e) 
{
    if(e.which == 13) {  
        var path=$("#btnOk").attr("href"); 
        window.location="/"+path; 
    }
});