function searchvalidation() {
    var valid = true;
    if ($('#txtsearch').val().trim() == '') {
        $('.roundedsearch').css("border-color", "#FF0000");
        $('#btnsearch').attr('disabled', true);
        $("#err_req").text("*Please Enter Company ID / Mobile Number / Email ID!");
    }
    else {
        if (IsMobileNumber($("#txtsearch").val().trim())) {
            valid = true;
            $('.roundedsearch').css("border-color", "#2eb82e");
            $('#btnsearch').attr('disabled', false);
            $("#err_req").text("");
        }
        else if (allnumeric($("#txtsearch").val().trim())) {
            if ($("#txtsearch").val().trim().length != 16) {
                $('.roundedsearch').css("border-color", "#FF0000");
                $('#btnsearch').attr('disabled', true);
                $("#err_req").text("*Please Enter Valid  Company ID / Mobile Number / Email ID!");
                valid = false;
            }
            else {
                $('.roundedsearch').css("border-color", "#2eb82e");
                $('#btnsearch').attr('disabled', false);
                $("#err_req").text("");
                valid = true;
            }
        }
        else if (isEmail($("#txtsearch").val().trim())) {
            // $('#txtsearch').css("border-color", "#FF0000");
            // $('#btnsearch').attr('disabled', true);
            // $("#err_req").text("*Enter Valid Email Id!");
            // return false;  
            $('.roundedsearch').css("border-color", "#2eb82e");
            $('#btnsearch').attr('disabled', false);
            $("#err_req").text("");
            valid = true;
        }
        else {
            $('.roundedsearch').css("border-color", "#FF0000");
            $('#btnsearch').attr('disabled', true);
            $("#err_req").text("*Please Enter Valid  Company ID / Mobile Number / Email ID!");
            valid = false;
        }
    }
    return valid;
}