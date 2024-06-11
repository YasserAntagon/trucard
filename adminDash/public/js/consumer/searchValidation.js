function searchvalidation() {
    if ($('#txtsearch').val().trim() == '') {
        $('.roundedsearch').css("border-color", "#FF0000");
        $('#btnsearch').attr('disabled', true);
        $("#err_req").text("*Please Enter Company ID / Mobile Number / Email ID!");
    }
    else {
        if (IsMobileNumber($("#txtsearch").val().trim())) {
            // console.log("mobileno")
            var json = JSON.stringify({
                "mobile": $("#txtsearch").val().trim()
            });
  
            return json;
        }
        else if (allnumeric($("#txtsearch").val().trim())) {
            if ($("#txtsearch").val().trim().length == 16) {
                var json = JSON.stringify({
                    "truID": $("#txtsearch").val().trim()
                });
  
                return json;
            }
            else {
                $('.roundedsearch').css("border-color", "#FF0000");
                $('#btnsearch').attr('disabled', true);
                $("#err_req").text("*Please Enter Valid  Company ID / Mobile Number / Email ID!");
                return false;
            }
        }
        else if (isEmail($("#txtsearch").val().trim())) {
            // $('#txtsearch').css("border-color", "#FF0000");
            // $('#btnsearch').attr('disabled', true);
            // $("#err_req").text("*Enter Valid Email Id!");
            // return false;
            var json = JSON.stringify({
                "email": $("#txtsearch").val().trim()
            });
  
            return json;
  
  
        }
        else {
            $('.roundedsearch').css("border-color", "#FF0000");
            $('#btnsearch').attr('disabled', true);
            $("#err_req").text("*Please Enter Valid  Company ID / Mobile Number / Email ID!");
            return false;
        }
    }
  }