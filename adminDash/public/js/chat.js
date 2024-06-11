
$(document).ready(function() {
  

function newMessage() {
	message = $("textarea#message-to-send").val();
	if($.trim(message) == '') {
		return false;
    }
	$('<li><div class="message-data"><span class="message-data-name"><i class="fa fa-circle online"></i>'
    +'Vincent</span><span class="message-data-time">10:31 AM, Today</span></div>'
   +'<div class="message my-message">'+message+'</div></li>').appendTo($('.chats-history ul'));

	$("textarea#message-to-send").val(null); 
	$(".chats-history").animate({ scrollTop: $(document).height() }, "fast");
};

$('.submit').click(function() {
  newMessage();
});

$("textarea#message-to-send").on('keydown', function(e) {
  if (e.which == 13) {
    newMessage();
    return false;
  }
});
$('#drawerExample').drawer({ toggle: false });
$('#other-toggle').click(function() {
    $('#drawerExample').drawer('toggle');
    return false;
});
$('.drawser-close').click(function() {
    $('#drawerExample').drawer('hide')
    return false;
});
});

(function(){
  
  var searchFilter = {
    options: { valueNames: ['name'] },
    init: function() {
      var userList = new List('people-list', this.options);
      var noItems = $('<li id="no-items-found">No items found</li>');
      
      userList.on('updated', function(list) {
        if (list.matchingItems.length === 0) {
          $(list.list).append(noItems);
        } else {
          noItems.detach();
        }
      });
    }
  };
  
  searchFilter.init();
  
})();
