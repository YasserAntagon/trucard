
$(function () { 
    bindBanks();
    $("#txtWalletamt").bind("keyup blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btnAddLimit').attr('disabled', true);
            $("#error_txnAmt").text("* Please Enter Wallet Amount!");
            return false;
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btnAddLimit').attr('disabled', false);
            $("#error_txnAmt").text("");
            var inwords = inWords($(this).val());
            $("#inwords").text(inwords);
        }
    });
})
var totalBal = 0;
function BindAddr() {
    $etruid = $("#txteTruid").val().trim()
    var json = {
        "rTruID": $etruid
    };
    $('#loader').css("display", 'block');
    $.ajax({
        "url": "/entityWallet/getWalletBal", "method": "POST", data: json, success: function (a) {
            $('#loader').fadeOut('slow');
            let data = a.body;
            if (data.status == 200) {
                var wallet = data.walletBal !== 'NA' ? '<i class="mdi mdi-currency-inr"></i>' + decimalChopper(data.walletBal, 4) : '<i class="mdi mdi-currency-inr"></i>' + "0";
                $(".txnBalance").html(wallet);
                totalBal = data.floatBal;
            }
            else {
                totalBal = 0;
                alertify.error("Something went wrong..!!");
            }
        }
    });
}

$('#btnAddLimit').on('click', function () {
    if ($("#txtWalletamt").val() == "") {
        alertify.error("Please enter wallet amount..!!")
        return false;
    }
    if ($("#txtWalletamt").val().trim() && parseFloat($("#txtWalletamt").val().trim()) <= 0) {
        alertify.error("Please enter wallet amount");
        return false;
    }
    swal({
        title: 'Are you sure?',
        text: "It will irreversible update. Do you really want to add Wallet amount !",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Add Wallet!',
        cancelButtonText: 'No, cancel!',
        confirmButtonClass: 'btn btn-primary',
        cancelButtonClass: 'btn btn-secondary'

    }).then(function () {
        promptReject()
    }, function (dismiss) {
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
    $etruid = $("#txteTruid").val();
    $txtUTRNo = $("#txtUTRNo").val();
    $txtBank = $('#cmbBank').select2('data')[0].text
    if ($txtBank == "- Search Bank by Name -") {
        $txtBank = "";
    }
    $acorigin = $("#acorigin").val();
    $txtDestination = $("#txtDestination").val();
    $mode = $("#mode").val();
    $fundStatus = $("#fundStatus").val();
    var json = {
        "rTruID": $etruid,
        "amount": $("#txtWalletamt").val(),
        "UTRNo": $txtUTRNo,
        "bankName": $txtBank,
        "acOrigin": $acorigin,
        "destinationAC": $txtDestination,
        "mode": $mode,
        "fundStatus":$fundStatus
    };
    txnCheck(function (status) {
        if (status == true) {
            $('#loader').css("display", 'block');
            $.ajax({
                "url": "/entityWallet/addWalletBal", "method": "POST", data: json, success: function (a) {
                    let res = a.body;            // Call Model
                    $('#loader').fadeOut('slow');
                    if (res.status == 200) {

                        $('#entityAccessLoader').fadeOut('slow');
                        alertify.success("Wallet Balance Added Successfully..!!");
                        var WalletBal = parseFloat($('#txtWalletamt').val()) + parseFloat(totalBal);
                        $("#txtBalance").val(decimalChopper(WalletBal, 4));
                        var txtWalletamt = '<i class="mdi mdi-currency-inr"></i>' + decimalChopper(WalletBal, 4);
                        $(".txnBalance").html(txtWalletamt);
                        $("#txtWalletamt").val("");
                        $("#txtUTRNo").val("");
                        $("#cmbBank").val("-1");
                        $("#acorigin").val("");
                        $("#txtDestination").val("");
                        $("#mode").val("bankTransfer");
                        loadDataInTable({});
                    }
                    else {
                        $("#txtWalletamt").val("");
                        $('#entityAccessLoader').fadeOut('slow');
                        alertify.error(res.messege);
                        return false;
                    }
                }
            });
        }
        else {
            alertify.error("Please Verify TPIN..!!");
        }
    })
}
