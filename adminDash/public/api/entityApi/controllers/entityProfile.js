
$(function () {

  BindProfile();
})
function BindProfile() {
  // console.log("all");
  $ctruid = $("#txteTruid").val()
  var json = {
    "truID": $ctruid
  };
  $('#loader').css('display', 'block');
  $.ajax({
    "url": "/entityDB/getEntityData", "method": "POST", data: json, success: function (res) {
      $('#loader').fadeOut('slow');
      let data = res.body;
      $dlrData = data[0];
      $('#txtcname').html($dlrData.companyName);
      $('#txtfname').html($dlrData.contactFName);
      $('#txtmname').html($dlrData.contactMName);
      $('#txtlname').html($dlrData.contactLName);
      $('#txtemail').html($dlrData.email);
      $('#txtmobile').html($dlrData.mobile);
      // DOB
      var dob = new Date(Date.parse($dlrData.DOB));
      // $date = editDate(dob);
      var $date = moment(dob).format('DD/MM/YYYY');
      $("#dob").html($date);
      $("#sex").html($dlrData.gender);
      // $("#ccode").html($dlrData.countryCode);
      loadele();
    }
  });

  $.fn.editable.defaults.mode = 'inline'; //editables  

}

$('#btnedit').click(function (e) {
  // console.log("Here")
  $('#txtcname').editable('toggleDisabled');
  $('#txtemail').editable('toggleDisabled');
  $('#txtmobile').editable('toggleDisabled');
  // $('#txtaddress').editable('toggleDisabled');
  $('#txtfname').editable('toggleDisabled');
  $('#txtmname').editable('toggleDisabled');
  $('#txtlname').editable('toggleDisabled');
  $('#txttpa').editable('toggleDisabled');
  $('#dob').editable('toggleDisabled');
  $('#sex').editable('toggleDisabled');
  // $('#ccode').editable('toggleDisabled');


  $('#updateProf').removeClass("hidden");
  $('#btnedit').addClass("hidden");
})
function loadele() {
  $('#txtcname').editable({
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
  $('#txtemail').editable({
    disabled: 'true',
    validate: function (value) {
      var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      if (!regex.test(value)) {
        return 'Please Enter Valid Email ID';
      }
    }
  });
  var gval;
  if ($('#sex').html() == "female" || $('#sex').html() == "Female") {
    gval = 2;
  } else {
    gval = 1;
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
  $('#dob').editable({
    type: 'text',
    disabled: 'true',
    minYear: 1900,
    pk: 1,
    validate: function (value) {
      if ($.trim(value) == '') return 'This field is required';
    }
  });
}
$('#updateProf').on('click', function () {
  updateProfile($dlrData);
});

function updateProfile($prevdata) {
  $ctruid = $("#txteTruid").val().trim();
  var dt = $("#dob").html();
  var newdate = dt.split("/").reverse().join("/");
  var dob = new Date(Date.parse(newdate));
  var dob1 = moment(dob).format('MM/DD/YYYY');
  var entity_email = $("#txtemail").html().trim();
  var entity_mobile = $("#txtmobile").html().trim();
  var entity_cname = $("#txtcname").html().trim();
  txnCheck(function (status) {
    if (status == true) {
      $('#loader').css('display', 'block');
      if (entity_email != $prevdata.email) {
        var emailjson = {
          "rTruID": $ctruid,
          "email": entity_email
        };
        $.ajax({
          "url": "/eEntity/updateProfileData", "method": "POST", data: emailjson, success: function (a) {
            $('#loader').fadeOut('slow');
          }
        });
      }
      if (entity_mobile != $prevdata.mobile) {
        var mojson = JSON.stringify({
          // "truID": truid,
          "rTruID": $ctruid,
          "mobile": entity_mobile
        });
        $.ajax({
          "url": "/eEntity/updateProfileData", "method": "POST", data: mojson, success: function (a) {
            $('#loader').fadeOut('slow');
          }
        });
      }
      if (entity_cname != $prevdata.companyName) {
        $('#loader').css('display', 'block');
        var cjson = {
          // "truID": truid,
          "rTruID": $ctruid,
          "cName": entity_cname
        }
        $.ajax({
          "url": "/eEntity/updateProfileData", "method": "POST", data: cjson, success: function (a) {
            $('#loader').fadeOut('slow');
            $('#txtname').html(entity_cname);
          }
        });
      }

      var json = {
        "rTruID": $ctruid,
        "fName": $("#txtfname").html().trim(),
        "mName": $("#txtmname").html().trim(),
        "lName": $("#txtlname").html().trim(),
        "DOB": dob1,
        "gender": $("#sex").html().trim(),
        "email": entity_email,
        "mobile": entity_mobile
        // "countryCode": $("#ccode").html().trim(),
      };
      var tpajson = {
        "rTruID": $ctruid
      }
      var bool;
      $.ajax({
        "url": "/eEntity/updateProfileData", "method": "POST", data: json, success: function (a) {
          let res = a.body;
          $('#loader').fadeOut('slow');
          if (res.status == 200) {
            bool = true;
            alertify.logPosition("bottom left");
            alertify.success('Profile updated successfully');
          }
          else {

            alertify.logPosition("bottom left");
            alertify.error(res.messege)
          }
        }
      });
      $.ajax({
        "url": "/eEntity/updateTPA", "method": "POST", data: tpajson, success: function (a) {
          let res = a.body;
          $('#loader').fadeOut('slow');
          if (res.status == 200) {
            if (bool == false) {
              alertify.logPosition("bottom left");
              alertify.success('Profile updated successfully');

            }
          }
          else {
            if (bool == false) {
              alertify.logPosition("bottom left");
              alertify.error(res.message)
            }
          }
        }
      });
      // onupdate($ctruid);
      disable();
    }
    else {
      alertify.error("Please Verify TPIN..!!")
    }
  })
}

function disable() {
  $('#txtcname').editable('toggleDisabled');
  $('#txtemail').editable('toggleDisabled');
  $('#txtDOB').editable('toggleDisabled');
  $('#txtaddress').editable('toggleDisabled');
  $('#txtfname').editable('toggleDisabled');
  $('#txtmname').editable('toggleDisabled');
  $('#txtlname').editable('toggleDisabled');
  $('#dob').editable('toggleDisabled');
  $('#sex').editable('toggleDisabled');
  $('#txtmobile').editable('toggleDisabled');
  $('#txttpa').editable('toggleDisabled');
  $('#updateProf').addClass("hidden");
  $('#btnedit').removeClass("hidden");
}
var onupdate = function ($dlrText) {
  var json = {
    "rTruID": $dlrText,
  };
  $('#loader').css('display', 'block');
  $.ajax({
    "url": "/eEntity/searchEntity", "method": "POST", data: json, success: function (a) {
      let data = a.body;
      $('#loader').fadeOut('slow');
      if (data.status == 200) {

        var res = data.resource;
        var eaddress = res.address.houseNumber + ", " + res.address.streetNumber + ", " + res.address.landmark + ", <br>" + res.address.city + ", " + res.address.state + ", <br>" + res.address.country + " - " + res.address.pin;
        $('#eAddress').html(eaddress)

      } else {
        alertify.error(data.messege);
      }
    }
  });
}
$("#profileImage").click(function (e) {
  $("#imageUpload").click();
});

function fasterPreview(uploader) {
  if (uploader.files && uploader.files[0]) {
    $('#profileImage').attr('src', window.URL.createObjectURL(uploader.files[0]));
    if (!window.File && window.FileReader && window.FileList && window.Blob) { //if browser doesn't supports File API
      alertify.error("Your browser does not support new File API! Please upgrade."); //push error text
    }
    else {
      var rcrno = $("#txtcrnno").val().trim();
      var rtruid = $("#txteTruid").val().trim();
      var form_data = new FormData(); //Creates new FormData object 
      form_data.append('truID', rtruid);
      form_data.append('CRNNo', rcrno);
      form_data.append('photo', uploader.files[0]);
      $.ajax({
        url: "/eFileUpload/uploadBrandLogo",
        type: "POST",
        data: form_data,
        contentType: false,
        cache: false,
        processData: false,
        mimeType: "multipart/form-data"
      }).done(function (res) {
        alertify.success("Brand Logo uploaded Successfully..!!"); //push error text
      })
    }
  }
}

$("#imageUpload").change(function () {
  fasterPreview(this);
});