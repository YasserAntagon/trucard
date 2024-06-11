$etruid = $("#txteTruid").val().trim()
$(function () {
    BindAddr();
    $("#txtmerchant").bind("keyup blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btnsetpermission').attr('disabled', true);
            $("#error_merchant").text("* Please Enter Merchant Name!");
            return false;
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btnsetpermission').attr('disabled', false);
            $("#error_merchant").text("");
        }
    });
    $("#txtCat").bind("keyup blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btnsetpermission').attr('disabled', true);
            $("#error_Cat").text("* Please Enter Category!");
            return false;
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btnsetpermission').attr('disabled', false);
            $("#error_Cat").text("");
        }
    });
    $("#txtTXNamt").bind("keyup blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btnsetpermission').attr('disabled', true);
            $("#error_txnAmt").text("* Please Enter Transaction Amount!");
            return false;
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btnsetpermission').attr('disabled', false);
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
                loadconf(res.resource.self, res.resource.consumer, res.resource.wallet, res.resource.global, res.resource.TXN, true);
 

            }
            else {
                // alertify.logPosition("top right");
                alertify.error(res.messege);
                loadconf({}, {}, {}, {}, {}, false);
                return false;
            }
        }
    });
}
function loadconf(self, consumer, wallet, global, TXN, status) {
    $("#sbuy").html(self.buy ? self.buy.charAt(0).toUpperCase() + self.buy.slice(1) : "Select");
    $("#sredeemCash").html(self.redeemCash ? self.redeemCash.charAt(0).toUpperCase() + self.redeemCash.slice(1) : "Select");
    $("#sTransfer").html(self.transfer ? self.transfer.charAt(0).toUpperCase() + self.transfer.slice(1) : "Select");
  
    $("#cbuy").html(consumer.buy ? consumer.buy.charAt(0).toUpperCase() + consumer.buy.slice(1) : "Select");
    $("#credeemCash").html(consumer.redeemCash ? consumer.redeemCash.charAt(0).toUpperCase() + consumer.redeemCash.slice(1) : "Select");
   $("#cTransfer").html(consumer.transfer ? consumer.transfer.charAt(0).toUpperCase() + consumer.transfer.slice(1) : "Select");
  
    var wWalletlog=wallet.walletAccess == "allow" ? "Wallet":wallet.walletAccess == "parent" ? "Parent Wallet":"disabled";
$('#wallet').html(wWalletlog);

   /*  $("#wallet").prop("checked", (wallet.walletAccess == "allow") ? true : false) */
    $("#pg").prop("checked", (wallet.paymentModeAccess == "allow") ? true : false)
    $("#rWallet").prop("checked", (wallet.redeemToWallet == "allow") ? true : false)
    

    $("#txtmerchant").val(global.MID)
    $("#txtCat").val(global.category)
    $("#txtTXNamt").val(TXN.txnAmountLimit)
    $("#txtrTXNamt").val(TXN.remnantAmount)
    $("#consumerAccess").prop("checked", global.allConsumerAccess) 
    $("#txtmerchant").attr("disabled", status)
    $("#txtCat").attr("disabled", status)
    loadlabel();
}
$("#btnsetpermission").on('click', function () {
    if ($('#txtmerchant').val() == '') {
        $('#txtmerchant').css("border-color", "#FF0000");
        $('#btnsetpermission').attr('disabled', true);
        $("#error_merchant").text("* Please Enter Merchant Name!");
        return false;
    }
    else {
        $('#txtmerchant').css("border-color", "#2eb82e");
        $('#btnsetpermission').attr('disabled', false);
        $("#error_merchant").text("");
    }
    if ($('#txtCat').val() == '') {
        $('#txtCat').css("border-color", "#FF0000");
        $('#btnsetpermission').attr('disabled', true);
        $("#error_Cat").text("* Please Enter Category!");
        return false;
    }
    else {
        $('#txtCat').css("border-color", "#2eb82e");
        $('#btnsetpermission').attr('disabled', false);
        $("#error_Cat").text("");
    }
    if ($('#txtTXNamt').val() == '') {
        $('#txtTXNamt').css("border-color", "#FF0000");
        $('#btnsetpermission').attr('disabled', true);
        $("#error_txnAmt").text("* Please Enter Transaction Amount!");
        return false;
    }
    else {
        $('#txtTXNamt').css("border-color", "#2eb82e");
        $('#btnsetpermission').attr('disabled', false);
        $("#error_txnAmt").text("");
    }

    let sbuy = $('#sbuy').html() == "Coming Soon" ? "comingsoon" : $('#sbuy').html().toLowerCase();
    let sredeem = $('#sredeemCash').html() == "Coming Soon" ? "comingsoon" : $('#sredeemCash').html().toLowerCase();
    let stransfer = $('#sTransfer').html() == "Coming Soon" ? "comingsoon" : $('#sTransfer').html().toLowerCase();
    
    let cbuy = $('#cbuy').html() == "Coming Soon" ? "comingsoon" : $('#cbuy').html().toLowerCase();
    let credeem = $('#credeemCash').html() == "Coming Soon" ? "comingsoon" : $('#credeemCash').html().toLowerCase();
    let ctransfer = $('#cTransfer').html() == "Coming Soon" ? "comingsoon" : $('#cTransfer').html().toLowerCase();

    let wallet = $('#wallet').html()
    var wWalletlog=wallet == "Wallet" ? "allow":$('#wallet').html() == "Parent Wallet" ? "parent":"disabled";


    var accessjson = {
        "selfAccess": {
            "rTruID": $etruid,
            "buy": sbuy,
            "redeemCash": sredeem,
            "transfer": stransfer
        },
        "consumerAccess": {
            "rTruID": $etruid,
            "buy": cbuy,
            "redeemCash": credeem,
            "transfer": ctransfer
        },
        "walletAccess": {
            "rTruID": $etruid,
            "walletAccess": wWalletlog,
            "paymentModeAccess": ($("#pg").prop("checked") == true) ? "allow" : "disable",
            "paymentGateway": pgway,
            "redeemToWallet": ($("#rWallet").prop("checked") == true) ? "allow" : "disable"
        },
        "globalAccess": {
            "rTruID": $etruid,
            "MID": $("#txtmerchant").val(),
            "category": $("#txtCat").val(),
            "allConsumerAccess": ($("#consumerAccess").prop("checked") == true) ? true : false
        },
        "revenue": {
            "eTruID": $etruid,
            "revenuePercent": $("#txtentityRevCharges").html(),
            "promotionQTY": $("#txtentityAddOn").html()
        }
    }
    var count = 0;
    txnCheck(function (status) {
        if (status == true) {
            $('#loader').css("display", 'block');
            $.ajax({
                "url": "/entityAccess/walletAccessConfig", "method": "POST", data: accessjson.walletAccess, success: function (a) {
                    let res = a.body;
                    count++;
                    if (res.status == 200) {
                        if (count == 4) {
                            $('#loader').fadeOut('slow');
                            alertify.success("Permission applied successfully");
                            BindAddr();
                        }
                    }
                    else {
                        $('#loader').fadeOut('slow');
                        alertify.error(res.messege);
                        return false;
                    }
                }
            });
            $.ajax({
                "url": "/entityAccess/consumerTransConfig", "method": "POST", data: accessjson.consumerAccess, success: function (a) {
                    let res = a.body;
                    count++;

                    if (res.status == 200) {
                        if (count == 4) {
                            $('#loader').fadeOut('slow');
                            alertify.success("Permission applied successfully");
                            BindAddr();
                        }
                    }
                    else {
                        $('#loader').fadeOut('slow');
                        alertify.error(res.messege);
                        return false;
                    }
                }
            });
            $.ajax({
                "url": "/entityAccess/enSelfTransConfig", "method": "POST", data: accessjson.selfAccess, success: function (a) {
                    let res = a.body;
                    count++;
                    if (res.status == 200) {
                        if (count == 4) {
                            $('#loader').fadeOut('slow');
                            alertify.success("Permission applied successfully");
                            BindAddr();
                        }
                    }
                    else {
                        $('#loader').fadeOut('slow');
                        alertify.error(res.messege);
                        return false;
                    }
                }
            });
            $.ajax({
                "url": "/entityAccess/globalPolicyConfig", "method": "POST", data: accessjson.globalAccess, success: function (a) {
                    let res = a.body;
                    count++;
                    if (res.status == 200) {
                        if (count == 4) {
                            $('#loader').fadeOut('slow');
                            alertify.success("Permission applied successfully");
                            BindAddr();
                        }
                    }
                    else {
                        $('#loader').fadeOut('slow');
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
});