// author : Suresh Patil
// date : 13-05-2019
// Description : Editable labels for Consumer


$('#btnedit').click(function (e) {
  e.stopPropagation(); 
  $('#txtmobile').editable('toggleDisabled');
  $('#txtgender').editable('toggleDisabled');
  $('#status').editable('toggleDisabled');
  $('#txtemail').editable('toggleDisabled');
  $('#txtDOB').editable('toggleDisabled');
  $('#txtaddress').editable('toggleDisabled');
  $('#txtfname').editable('toggleDisabled');
  $('#txtmname').editable('toggleDisabled');
  $('#txtlname').editable('toggleDisabled');
  $('#dob').editable('toggleDisabled');
  $('#sex').editable('toggleDisabled');
  $('#ccode').editable('toggleDisabled');
  $('#txttpa').editable('toggleDisabled');
  $('#txtcity').editable('toggleDisabled');
  $('#txtstate').editable('toggleDisabled');
  $('#txtcountry').editable('toggleDisabled');
  $('#txtpin').editable('toggleDisabled');
  $('#b_txtaddress').editable('toggleDisabled');
  $('#b_txtcity').editable('toggleDisabled');
  $('#b_txtstate').editable('toggleDisabled');
  $('#b_txtcountry').editable('toggleDisabled');
  $('#b_txtpin').editable('toggleDisabled');



  $('#updateProf').removeClass("hidden");
  $('#btnedit').addClass("hidden");
});


function loadlabel() {
  //toggle `popup` / `inline` mode
  $.fn.editable.defaults.mode = 'inline';
  //make username editable
  // $('#username').editable();
  $('#txtname').editable({
    disabled: 'true'
  });
  $('#txtfname').editable({
    disabled: 'true'
  });
  $('#txtmname').editable({
    disabled: 'true'
  });
  $('#txtlname').editable({
    disabled: 'true'
  });
  $('#txttruid').editable({
    disabled: 'true'
  });
  $('#txtmobile').editable({
    disabled: 'true',
    validate: function (value) {
      var regex = /^[1-9]{1}[0-9]{9}$/;
      if (!regex.test(value)) {
        return 'Please Enter valid Mobile number!';
      }
    }
  });
  $('#b_txtcity').editable({
    disabled: 'true',
    validate: function (value) {
      var regex = /^[a-zA-z0-9_ ]+$/;
      if (!regex.test(value)) {
        return 'Please Enter Valid City';
      }
    }
  });
  $('#b_txtstate').editable({
    disabled: 'true',
    validate: function (value) {
      var regex = /^[a-zA-z0-9_ ]+$/;
      if (!regex.test(value)) {
        return 'Please Enter Valid State';
      }
    }
  });
  $('#b_txtcountry').editable({
    disabled: 'true',
    validate: function (value) {
      var regex = /^[a-zA-z0-9_ ]+$/;
      if (!regex.test(value)) {
        return 'Please Enter Valid country';
      }
    }
  });
  $('#b_txtpin').editable({
    disabled: 'true',
    validate: function (value) {
      var regex = /^[0-9]+$/;
      if (!regex.test(value)) {
        return 'Pincode Should be Numeric';
      }
    }
  });

  $('#txtcity').editable({
    disabled: 'true',
    validate: function (value) {
      var regex = /^[a-zA-z0-9_ ]+$/;
      if (!regex.test(value)) {
        return 'Please Enter Valid City';
      }
    }
  });
  $('#txtstate').editable({
    disabled: 'true',
    validate: function (value) {
      var regex = /^[a-zA-z0-9_ ]+$/;
      if (!regex.test(value)) {
        return 'Please Enter Valid State';
      }
    }
  });
  $('#txtcountry').editable({
    disabled: 'true',
    validate: function (value) {
      var regex = /^[a-zA-z0-9_ ]+$/;
      if (!regex.test(value)) {
        return 'Please Enter Valid country';
      }
    }
  });
  $('#txtpin').editable({
    disabled: 'true',
    validate: function (value) {
      var regex = /^[0-9]+$/;
      if (!regex.test(value)) {
        return 'Pincode Should be Numeric';
      }
    }
  });
  $('#txtgender').editable({
    type: 'select',
    title: 'Select Gender',
    disabled: 'true',
    placement: 'right',
    value: 1,
    source: [
      { value: 1, text: 'Male' },
      { value: 2, text: 'Female' }
    ]
  });
  $('#dob').editable({
    type: 'text',
    disabled: 'true',
    pk: 1,
    validate: function (value) {
      if ($.trim(value) == '') return 'This field is required';
    }
  });
  var gval;
  if ($('#sex').html() == "male" || $('#sex').html() == "Male") {
    gval = 1;
  } else {
    gval = 2;
  }
  $('#sex').editable({
    value: gval,
    disabled: 'true',
    source: [{
      value: 1,
      text: 'Male'
    }, {
      value: 2,
      text: 'Female'
    }],
    display: function (value, sourceData) {
      var colors = {
        "": "#98a6ad",
        1: "#5fbeaa",
        2: "#5d9cec"
      },
        elem = $.grep(sourceData, function (o) {
          return o.value == value;
        });
      if (elem.length) {
        $(this).text(elem[0].text).css("color", colors[value]);
      } else {
        $(this).empty();
      }
    }
  });
  var ccodeval = parseInt($('#ccode').html());
  $('#ccode').editable({
    value: ccodeval,
    disabled: 'true',
    source: [
      { value: 91, text: '+91' },
      { value: 1, text: '+1' },
      { value: 971, text: '+971' },
      { value: 880, text: '+880' },
      { value: 977, text: '+977' }
    ]
  });
  $('#txtemail').editable({
    disabled: 'true',
    validate: function (value) {
      var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      if (!regex.test(value)) {
        return 'Please Enter Valid Email ID';
      }
    }
  });
  $('#txtDOB').editable({
    disabled: 'true'
  });
  // $('#txtDOB').on('shown', function () {
  //     $(this).data('editable').input.$input.mask('(999) 999-9999');
  // });
  //make status editable
  $('#txtgender').on("click", function () {
    $(this).next().addClass("pull-right")
  });
  // $('#txtmobile').on("click", function () {
  //   $(this).next().addClass("pull-right")
  //   // $(this).next().find(".editable-input input").addClass("number");
  // });
  // $('#txtemail').on("click", function () {
  //   $(this).next().addClass("pull-right")
  // });
  // $('#txttpa').on("click", function () {
  //   $(this).next().addClass("pull-right")
  //   $(this).next().find(".editable-input input").addClass("alphanum");
  // });
  $('#txtDOB').on("click", function () {
    $(this).next().addClass("pull-right");
    $(this).next().find(".editable-input input").attr("maxlength", "10");
  });
  // //console.log(searcharr)
  // var b_addr = searcharr.resource[0].billingAddress
  // var p_addr = searcharr.resource[0].permanentAddress
  // $('#txtaddress').editable({
  //   title: 'Enter city, street and building',
  //   disabled: 'true',
  //   value: {
  //     building: p_addr.houseNumber,
  //     street: p_addr.streetNumber,
  //     landmark: p_addr.landmark
  //   },
  //   disabled: 'true',
  //   validate: function (value) {
  //     var regex = /^[a-zA-z0-9,-_ ]+$/;
  //     if (!regex.test(value.building)) {
  //       return 'Please Enter Valid Building';
  //     }
  //     if (!regex.test(value.landmark)) {
  //       return 'Please Enter Valid Street';
  //     }
  //     if (!regex.test(value.street)) {
  //       return 'Please Enter Valid Landmark';
  //     }
  //   }
  // });
  // $('#b_txtaddress').editable({
  //   title: 'Enter city, street and building',
  //   disabled: 'true',
  //   value: {
  //     building: b_addr.houseNumber,
  //     street: b_addr.streetNumber,
  //     landmark: b_addr.landmark
  //   },
  //   disabled: 'true',
  //   validate: function (value) {
  //     var regex = /^[a-zA-z0-9,-_ ]+$/;
  //     if (!regex.test(value.building)) {
  //       return 'Please Enter Valid Building';
  //     }
  //     if (!regex.test(value.landmark)) {
  //       return 'Please Enter Valid Street';
  //     }
  //     if (!regex.test(value.street)) {
  //       return 'Please Enter Valid Landmark';
  //     }
  //   }
  // });
}
