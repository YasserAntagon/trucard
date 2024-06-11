$etruid = $("#txteTruid").val().trim()
$(function () {
    BindAddr();
    $("#txtTXNamt").bind("keyup blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btnAddLimit').attr('disabled', true);
            $("#error_txnAmt").text("* Please Enter Transaction Amount!");
            return false;
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btnAddLimit').attr('disabled', false);
            $("#error_txnAmt").text("");
        }
    });
})

function BindAddr() {
    var json = {
        "rTruID": $etruid
    };

    $('#loader').css("display", 'block');
    $.ajax({
        "url": "/entityAccess/getAccessList", "method": "POST", data: json, success: function (a) {

            let res = a.body;
            $('#loader').fadeOut('slow');

            if (res.status == "200") {

                $("#txtTXNamt").val(res.resource.TXN.txnAmountLimit !== 'NA' ? res.resource.TXN.txnAmountLimit : "0");
                $("#txtrTXNamt").val(res.resource.TXN.remnantAmount !== 'NA' ? res.resource.TXN.remnantAmount : '0');
                $("#chkenableLimit").prop("checked", (res.resource.TXN.checkLimit === true) ? true : false)

            }
            else {
                // alertify.logPosition("top right");
                alertify.error(res.messege);
                return false;
            }
        }
    });
}

$('#btnAddLimit').on('click', function () {
    swal({
        title: 'Are you sure?',
        text: "It will irreversible update. Do you really want to set this Transaction Limit !",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Set Limit!',
        cancelButtonText: 'No, cancel!',
        confirmButtonClass: 'btn btn-primary',
        cancelButtonClass: 'btn btn-secondary'

    }).then(function () {
        // if (isParent == true) {
        //     confirmation();
        // }
        // else {
        // Deactivate("holder", $status);
        promptReject()
        // }

    }, function (dismiss) {
        // dismiss can be 'cancel', 'overlay',
        // 'close', and 'timer'
        if (dismiss === 'cancel') {
            swal(
                'Cancelled',
                'Your cancel your request :)',
                'error'
            );
        }
    })
})

function promptReject() {
    var json = {
        "rTruID": $etruid,
        "txnAmountLimit": $("#txtTXNamt").val(),
        "checkLimit": ($("#chkenableLimit").prop("checked") == true) ? true : false,
    };
    txnCheck(function (status) {
        if (status == true) {
            $('#loader').css("display", 'block');
            $.ajax({
                "url": "/entityAccess/transactionLimit", "method": "POST", data: json, success: function (a) {

                    let res = a.body;            // Call Model
                    $('#loader').fadeOut('slow');
                    if (res.status == 200) {
                        $('#entityAccessLoader').fadeOut('slow');
                        alertify.success("Transaction Limit Set Successfully..!!");
                        $('#txtrTXNamt').val(parseFloat($('#txtTXNamt').val()) + parseFloat($('#txtrTXNamt').val()));
                    }
                    else {
                        $('#entityAccessLoader').fadeOut('slow');
                        alertify.error(res.messege);
                        return false;
                    }
                }
            });
        }
        else {
            alertify.error("Please Verify TPIN..!!")
        }
    })
}