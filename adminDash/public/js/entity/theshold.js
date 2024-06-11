$('#btnCedit').click(function (e) {
    e.stopPropagation();
    clearAll();
});
function clearAll() {
    $('#snormal').editable('toggleDisabled');
    $('#scritical').editable('toggleDisabled');
    $('#svcritical').editable('toggleDisabled');  
}

function loadlabel() 
{
    $.fn.editable.defaults.mode = 'popup';
    $('#snormal').editable({ 
        validate: function (value) {
          var regex = /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/;
          if (!regex.test(value)) {
            return 'Please Enter valid Normal Theshold!';
          }
        }
      });
      $('#scritical').editable({ 
        validate: function (value) {
          var regex = /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/;
          if (!regex.test(value)) {
            return 'Please Enter valid Critical Theshold!';
          }
        }
      });
      $('#svcritical').editable({ 
        validate: function (value) {
          var regex = /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/;
          if (!regex.test(value)) {
            return 'Please Enter valid Very Critical Theshold!';
          }
        }
      });
       
}
