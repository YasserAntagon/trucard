function docView(event) {

    // Gets the video src from the data-src on each button
    var $imageSrc = $(event).attr('data-src');
        
    console.log($imageSrc);
    $("#image").attr('src', $imageSrc  ); 
    $('#myModal').modal('show');
    }
    
    
    