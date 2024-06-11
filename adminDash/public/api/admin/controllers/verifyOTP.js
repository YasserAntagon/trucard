function verifyOTP() {
    var otp = $("#digit-1").val() + $("#digit-2").val() + $("#digit-3").val() + $("#digit-4").val() + $("#digit-5").val() + $("#digit-6").val()
    var otps = {
        "OTP": otp
    };
    $('#loader').css("display", "block");
    $.ajax({
        "url": "/verifyOTP/verifyOTPs", "method": "POST", data: otps, success: function (a) {
            let res = a.body;
            let page = a.page;
            if (res.resource) {
                if (res.resource.status == 200)               /// check status result
                {
                    $("#error_otp").text("OTP Successfully Verified..!!");
                    alertify.success("OTP successfully verified..!!");
                    setTimeout(function () { $('#loader').fadeOut(); window.location = "/" + page }, 1000)
                }
                else 
                {
                    $('#loader').fadeOut();
                    alertify.error("Invalid OTP..!!");
                    $("#error_otp").text("Invalid OTP..!!");
                }
            }
            else 
            {
                $('#loader').fadeOut();
                if (res.status == 411 || res.status == 401) {
                    alertify.error("Something went wrong..!!");
                    return false;
                }
            }
        }
    });
}

function SendOTP() {
    $('#loader').css("display", "block");
    $.ajax({
        "url": "/verifyOTP/sendOTP", "method": "POST", success: function (a) {
            let res = a.body;
            $('#loader').fadeOut();
            if (res) {
                if (res.status == 201)               /// check status result
                {
                    enableResendOTP();
                    alertify.success("OTP Successfully Sent..!!");
                }
                else {
                    alertify.error("Something Went Wrong..!!");
                }
            }
            else {
                if (res.status == 411 || res.status == 401) {
                    alertify.error("Something went wrong..!!");
                    return false;
                }
            }
        }
    });
}
$(function () {

    $("#btnOtp").on("click", function () {
        if ($("#otp").val().length > 5) {
            verifyOTP();
        }
        else {
            alertify.error("Invalid OTP..!!");
            return;
        }
    });
    $("#otp").keyup(function () {
        if ($("#otp").val().length > 5) {
            verifyOTP();
        }
    });
});
function enableResendOTP()  // otp timer
{
    var count = 5, timer = setInterval(function () {
        $("#counter").html(count--);
        if (count === 0) {
            clearInterval(timer);
            $(".wait").addClass("hidden");
            $("#resendOTP").removeClass("hidden");
            $("#counter").html(0);
        }
    }, 1000);
}
enableResendOTP();
var resendcount = 1;
$('#resendLink').click(function () {
    if (resendcount != 3) {
        SendOTP()
        resendcount++;
        $(".wait").removeClass("hidden");
        $("#resendOTP").addClass("hidden");
        $("#limitex").addClass("hidden");
        if (resendcount == 3) {
            $("#limitex").removeClass("hidden");
            $("#resendOTP").addClass("hidden");
        }
    }
    else {
        $("#limitex").removeClass("hidden");
        $("#resendOTP").addClass("hidden");
    }
});

function validMobile(mob) {
    return (mob.length !== 10) ? false : true;
}

function data() {
    if ($("#digit-1").val() == "" && $("#digit-2").val() == "" && $("#digit-3").val() == "" && $("#digit-4").val() == "" && $("#digit-5").val() == "" && $("#digit-6").val()) {
        alertify.error("Please enter valid otp..!!");
        return false;
    }

    var otp = $("#digit-1").val() + $("#digit-2").val() + $("#digit-3").val() + $("#digit-4").val() + $("#digit-5").val() + $("#digit-6").val();
    if (otp == "") {
        alertify.error("Please enter valid otp..!!");
        return false;
    }
    var mob = $("#mobileHidden").val();
    var otps = JSON.stringify({
        "OTP": otp,
        "mobile": mob
    });
    verifyOTP(otps);
}
$('#form').find('input').each(function () {
    $(this).attr('maxlength', 1);
    $(this).on('keyup', function (e) {
        var parent = $($(this).parent());
        if (e.keyCode === 13) {
            data();
        }
        else if (e.keyCode === 8 || e.keyCode === 37) {
            var prev = parent.find('input#' + $(this).data('previous'));

            if (prev.length) {
                $(prev).select();
            }
        } else if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 65 && e.keyCode <= 90) || (e.keyCode >= 96 && e.keyCode <= 105) || e.keyCode === 39) {
            var next = parent.find('input#' + $(this).data('next'));

            if (next.length) {
                $(next).select();
            } else {
                if (parent.data('autosubmit')) {
                    parent.submit();
                }
            }
            if ($("#digit-1").val() != "" && $("#digit-2").val() != "" && $("#digit-3").val() != "" && $("#digit-4").val() != "" && $("#digit-5").val() != "" && $("#digit-6").val()) {
                data();
            }
        }

    });
});