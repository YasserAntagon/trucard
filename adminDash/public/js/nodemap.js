function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 13,
      center: {lat: 21.1458, lng: 79.0882}
    });
    var geocoder = new google.maps.Geocoder();
    geocodeAddress(geocoder, map);

    }
    document.getElementById('loadprop').addEventListener('click', function() {
      initMap();
  })
  function geocodeAddress(geocoder, resultsMap) 
  {
    var building = document.getElementById('b_add1').value;
    var locality = document.getElementById('b_landamark').value;
    var city = document.getElementById('bcity').value;
    var state = document.getElementById('bstate').value;
    var street= document.getElementById('b_street').value;

    var address = building+", "+locality+", "+city+", "+state;
    var wholeAddress = building+", "+locality+", "+street+", "+city+", "+state;

    geocoder.geocode({'address': address}, function(results, status) {
      if (status === 'OK') {
        resultsMap.setCenter(results[0].geometry.location);
        
var shape = {
coords: [1, 1, 1, 20, 18, 20, 18, 1],
type: 'poly'
};
var marker,i;
var image = 
{
url: 'images/loc32.png',
// This marker is 20 pixels wide by 32 pixels high.
size: new google.maps.Size(32, 38),
  // The origin for this image is (0, 0).
  origin: new google.maps.Point(0, 0),
  // The anchor for this image is the base of the flagpole at (0, 32).
  anchor: new google.maps.Point(0, 38)
};

marker = new google.maps.Marker({
position: {lat: parseFloat(lat), lng: parseFloat(lng)},
map: resultsMap,
position: results[0].geometry.location,
icon: image,
animation:google.maps.Animation.DROP,
shape: shape,
title: "AssetManager Location"
});

         $("#lat").val(results[0].geometry.location.lat());
         $("#lng").val(results[0].geometry.location.lng());
         setMarkers(marker,map,wholeAddress);
      }
      else 
      {
      //  WarnMsg("AssetManager System",'Geocode was not successful for the following reason: ' + status);
        return false;
       }
    });
  }

  
function setMarkers(marker,map,loc) 
{
var infowindow =  new google.maps.InfoWindow({
maxWidth: 350
});
var content = '<div id="iw-container">' +
'<div class="iw-title"><i class="fa fa-user"></i> Your Location</div>' +
'<div class="iw-content">' +
'<div class="iw-subTitle">Address</div>' +
'<p>'+loc+'</p>'+
'</div></div>';

infowindow.setContent(content);
infowindow.open(map, marker);
google.maps.event.addListener(marker, 'click', (function (marker, i) {
  return function () 
  {
    var content = '<div id="iw-container">' +
    '<div class="iw-title"><i class="fa fa-user"></i> Your Location</div>' +
    '<div class="iw-content">' +
    '<div class="iw-subTitle">Address</div>' +
    '<p>'+loc+'</p>'+
    '</div></div>';
    
    infowindow.setContent(content);
    infowindow.open(map, marker);
}       
})(marker));

google.maps.event.addListener(map, 'click', function() {
infowindow.close();
});
$(".fa-time").on("click",function(e){
infowindow.close();
})
google.maps.event.addListener(infowindow, 'domready', function() {

// Reference to the DIV that wraps the bottom of infowindow
var iwOuter = $('.gm-style-iw');

/* Since this div is in a position prior to .gm-div style-iw.
* We use jQuery and create a iwBackground variable,
* and took advantage of the existing reference .gm-style-iw for the previous div with .prev().
*/
var iwBackground = iwOuter.prev();

// Removes background shadow DIV
iwBackground.children(':nth-child(2)').css({'display' : 'none'});

// Removes white background DIV
iwBackground.children(':nth-child(4)').css({'display' : 'none'});


// Changes the desired tail shadow color.
iwBackground.children(':nth-child(3)').find('div').children().css({'box-shadow': 'rgba(72, 181, 233, 0.6) 0px 1px 6px', 'z-index' : '1'});

// Reference to the div that groups the close button elements.
var iwCloseBtn = iwOuter.next();

// Apply the desired effect to the close button
iwCloseBtn.css({opacity: '1', right: '37px', top: '3px', border: '1.5px solid #47a77e', 'border-radius': '13px', 'box-shadow': '0 0 5px #3990B9'});


// The API automatically applies 0.7 opacity to the button after the mouseout event. This function reverses this event to the desired value.
iwCloseBtn.mouseout(function(){
$(this).css({opacity: '1'});
});
});
}