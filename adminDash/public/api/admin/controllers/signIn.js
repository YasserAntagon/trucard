
 function logIn()
 {
    $email = $("#txtemail").val();
    if ($email == '') {
        $(this).css("border-color", "#FF0000");
        $('#btnSubmit').attr('disabled', true);
        $("#error_comp_name").text("* Please Enter Email Id..!!");
        return false;
    }
    else {
        $(this).css("border-color", "#2eb82e");
        $('#btnSubmit').attr('disabled', false);
        $("#error_comp_name").text("");
    }

    $pass = $("#txtpass").val();
    if ($pass == '') {
        $(this).css("border-color", "#FF0000");
        $('#btnSubmit').attr('disabled', true);
        $("#error_pass").text("* Please Enter Password..!!");
        return false;
    }
    else {
        $(this).css("border-color", "#2eb82e");
        $('#btnSubmit').attr('disabled', false);
        $("#error_pass").text("");
    }

    var json = {
        "email": $email,
        "password": $pass
    }
    $('#loader').css("display", 'block');
    $.ajax({
        "url": "/login/signInM", "method": "POST", data: json, success: function (a) { 
          
               
            let res = a.body;
            let page = a.page;
            $('#loader').fadeOut('slow');
            if (res.status == 401) {
                openConfirmation(page);
                return false;
            }
            else if (res.status == 206) {
                alertify.logPosition("top right");
                alertify.success(res.messege); 
                window.location = "/" + page;
                return false;
            }
            else if (res.status == 200) { 
                window.location = "/" + page
               // syncALL("1", page);

               /*  $("#processing-modal").modal({
                    show: true
                }) */

                return false;
            }
            else {
                alertify.logPosition("top right");
                alertify.error('Invalid username or password..!!');
                return false;
            }
        }
    });
}
function openConfirmation(page) {  
    swal({
        title: 'Are you sure?',
        text: "You want to verify this device. OTP will sent on your mobile no.",
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, proceed it!',
        cancelButtonText: 'No, cancel!',
        confirmButtonClass: 'btn btn-sm btn-primary',
        cancelButtonClass: 'btn btn-sm btn-danger m-l-10'
    }).then(function () {
        window.location = "/" + page
    }, function (dismiss) {
        // dismiss can be 'cancel', 'overlay',
        // 'close', and 'timer'
        if (dismiss === 'cancel') {
            swal(
                'Cancelled',
                'you cancelled your request...',
                'error'
            )
            flag = false;
        }
    })
}
$(function () {

    $("#txtemail").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btnSubmit').attr('disabled', true);
            $("#error_comp_name").text("* Please Enter Email Id..!!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btnSubmit').attr('disabled', false);
            $("#error_comp_name").text("");
        }
    });
    $("#txtpass").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btnSubmit').attr('disabled', true);
            $("#error_pass").text("* Please Enter Password..!!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btnSubmit').attr('disabled', false);
            $("#error_pass").text("");
        }
    });

    $("#btnShowpass").on('click', function (event) {
        event.preventDefault();
        if ($('#txtpass').attr("type") == "text") {
            $('#txtpass').attr('type', 'password');
            $('#btnShowpass i').addClass("fa-eye-slash");
            $('#btnShowpass i').removeClass("fa-eye");
        } else if ($('#txtpass').attr("type") == "password") {
            $('#txtpass').attr('type', 'text');
            $('#btnShowpass i').removeClass("fa-eye-slash");
            $('#btnShowpass i').addClass("fa-eye");
        }
    });
    $("#txtemail").keypress(function(event) {
        if (event.which == 13) {
            if ($(this).val() == '') {
                $(this).css("border-color", "#FF0000");
                $('#btnSubmit').attr('disabled', true);
                $("#error_comp_name").text("* Please Enter Email Id..!!");
            }
            else {
                logIn(); 
            } 
         }
    });
    $("#txtpass").keypress(function(event) {
        if (event.which == 13) {
            if ($(this).val() == '') {
                $(this).css("border-color", "#FF0000");
                $('#btnSubmit').attr('disabled', true);
                $("#error_pass").text("* Please Enter Password..!!");
            }
            else {
                logIn(); 
            }
            
         }
    });
});
