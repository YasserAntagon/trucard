
$(function () {
    let cdata = "";
    $('#consumerConfLoader').css('display', 'block');
    bindConfig("KYC");

})
$('.radio-group label').on('click', function () {
    $(this).removeClass('not-active').siblings().addClass('not-active');

});

function kycFlag(e) {
    var pval = $('input[name=kycFlag]:checked').val();
    bindConfig(pval);
}
function limitfor(e) {
    var pval = $('input[name=kycFlag]:checked').val();
    bindConfig(pval);
}
function revenueFor(e) {
    var pval = $('input[name=revenueFor]:checked').val();
    console.log("pval", pval)
    var stype = $('#paylist').val();
    loadCharges(stype, pval)
}

function bindConfig(pval) {
    json = {
        flag: pval,
        appliedOn: "entity"
    }
    var rtruID = $('#txteTruid').val();
    if (rtruID && rtruID !== "") {
        json.cTruID = rtruID;
        json.flag = $("#accountStatus").val() === "active" ? "KYC" : "KYC";
    }

    $('#consumerConfLoader').css('display', 'block');
    $.ajax({
        "url": "/configuration/getconsumerConfig", "method": "POST", data: json, success: function (a) {
            $('#consumerConfLoader').fadeOut('slow');
            let res = a.body;

            $('#consumerConfLoader').fadeOut('slow');
            if (res.status == "200") {
                cdata = res.resource;
                bindData(cdata)
            }
        }
    })
}
function converToMin(val) {
    return parseInt(val) / 60;
}
function bindData(data) {
    // let $dlrData = kycFlag == "pending" ? data.KYCConsumer.consumer : data.KYCConsumer.consumer;
    let $dlrData = data ? data.module : undefined;
    $("#buy").html($dlrData ? ($dlrData.buy && $dlrData.buy != "NA") ? $dlrData.buy == "comingsoon" ? "Coming Soon" : $dlrData.buy.charAt(0).toUpperCase() + $dlrData.buy.slice(1) : "Select" : "Select");
    $("#redeem").html($dlrData ? ($dlrData.redeemCash && $dlrData.redeemCash != "NA") ? $dlrData.redeemCash == "comingsoon" ? "Coming Soon" : $dlrData.redeemCash.charAt(0).toUpperCase() + $dlrData.redeemCash.slice(1) : "Select" : "Select");
    $("#transfer").html($dlrData ? ($dlrData.transfer && $dlrData.transfer != "NA") ? $dlrData.transfer == "comingsoon" ? "Coming Soon" : $dlrData.transfer.charAt(0).toUpperCase() + $dlrData.transfer.slice(1) : "Select" : "Select");
    $("#linkbank").html($dlrData ? ($dlrData.linkbank && $dlrData.linkbank != "NA") ? $dlrData.linkbank == "comingsoon" ? "Coming Soon" : $dlrData.linkbank.charAt(0).toUpperCase() + $dlrData.linkbank.slice(1) : "Select" : "Select");
    if ($dlrData) {
        if ($dlrData.redeemToBank) {
            $("#redeemtobank").html(($dlrData.redeemToBank && $dlrData.redeemToBank != "NA") ? $dlrData.redeemToBank == "comingsoon" ? "Coming Soon" : $dlrData.redeemToBank.charAt(0).toUpperCase() + $dlrData.redeemToBank.slice(1) : "Select");
        }
        else {
            $("#redeemtobank").html("Disable");
        }
    } else {
        $("#redeemtobank").html("Disable");
        $("#loyaltyPoint").html("Disable");
    }
   $("#redeemToWallet").html($dlrData ? ($dlrData.redeemToWallet && $dlrData.redeemToWallet != "NA") ? $dlrData.redeemToWallet == "comingsoon" ? "Coming Soon" : $dlrData.redeemToWallet.charAt(0).toUpperCase() + $dlrData.redeemToWallet.slice(1) : "Select" : 0);
    
    $("#updatedg").removeClass("hidden");

    let $moduleSelf = data ? data.moduleSelf : undefined;   
    $("#enbuy").html($moduleSelf ? ($moduleSelf.buy && $moduleSelf.buy != "NA") ? $moduleSelf.buy == "comingsoon" ? "Coming Soon" : $moduleSelf.buy.charAt(0).toUpperCase() + $moduleSelf.buy.slice(1) : "Select" : "Select");
    $("#enredeem").html($moduleSelf ? ($moduleSelf.redeemCash && $moduleSelf.redeemCash != "NA") ? $moduleSelf.redeemCash == "comingsoon" ? "Coming Soon" : $moduleSelf.redeemCash.charAt(0).toUpperCase() + $moduleSelf.redeemCash.slice(1) : "Select" : "Select");
    $("#login").html($moduleSelf ? ($moduleSelf.login && $moduleSelf.login != "NA") ? $moduleSelf.login == "comingsoon" ? "Coming Soon" : $moduleSelf.login.charAt(0).toUpperCase() + $moduleSelf.login.slice(1) : "Select" : "Select");
    $("#enlinkbank").html($moduleSelf ? ($moduleSelf.linkbank && $moduleSelf.linkbank != "NA") ? $moduleSelf.linkbank == "comingsoon" ? "Coming Soon" : $moduleSelf.linkbank.charAt(0).toUpperCase() + $moduleSelf.linkbank.slice(1) : "Select" : "Select");
    $("#enredeemtobank").html($moduleSelf ? ($moduleSelf.redeemToBank && $moduleSelf.redeemToBank != "NA") ? $moduleSelf.redeemToBank == "comingsoon" ? "Coming Soon" : $moduleSelf.redeemToBank.charAt(0).toUpperCase() + $moduleSelf.redeemToBank.slice(1) : "Select" : "Select");
    $("#walletAccess").html($moduleSelf ? ($moduleSelf.walletAccess && $moduleSelf.walletAccess != "NA") ? $moduleSelf.walletAccess == "comingsoon" ? "Coming Soon" : $moduleSelf.walletAccess.charAt(0).toUpperCase() + $moduleSelf.walletAccess.slice(1) : "Select" : 0);
    $("#enredeemToWallet").html($moduleSelf ? ($moduleSelf.redeemToWallet && $moduleSelf.redeemToWallet != "NA") ? $moduleSelf.redeemToWallet == "comingsoon" ? "Coming Soon" : $moduleSelf.redeemToWallet.charAt(0).toUpperCase() + $moduleSelf.redeemToWallet.slice(1) : "Select" : 0);    
    $("#consumerAccess").html($moduleSelf ? ($moduleSelf.consumerAccess && $moduleSelf.consumerAccess != "NA") ? $moduleSelf.consumerAccess == "comingsoon" ? "Coming Soon" : $moduleSelf.consumerAccess.charAt(0).toUpperCase() + $moduleSelf.consumerAccess.slice(1) : "Select" : "Select");
    $("#payByWallet").html($moduleSelf ? ($moduleSelf.payByWallet && $moduleSelf.payByWallet != "NA") ? $moduleSelf.payByWallet == "comingsoon" ? "Coming Soon" : $moduleSelf.payByWallet.charAt(0).toUpperCase() + $moduleSelf.payByWallet.slice(1) : "Select" : 0);
    $("#consumerAppaccess").prop("checked", $moduleSelf ? $moduleSelf.allConsumerAccess ? $moduleSelf.allConsumerAccess : false : false);

    if ($moduleSelf) {
        if ($moduleSelf.walletToBank) {
            $("#wallettobank").html($moduleSelf ? ($moduleSelf.walletToBank && $moduleSelf.walletToBank != "NA") ? $moduleSelf.walletToBank == "comingsoon" ? "Coming Soon" : $moduleSelf.walletToBank.charAt(0).toUpperCase() + $moduleSelf.walletToBank.slice(1) : "Select" : 0);
        }
        else {
            $("#wallettobank").html("Disable");
        }
    } else {
        $("#wallettobank").html("Disable");
    }
    let $moduleSelfReasons = data ? data.moduleSelfReasons : undefined;
    $("#lblreasonenbuy").html($moduleSelfReasons ? $moduleSelfReasons.buy !== "" ? $moduleSelfReasons.buy : "" : "");
    $("#lblreasonenredeem").html($moduleSelfReasons ? $moduleSelfReasons.redeemCash !== "" ? $moduleSelfReasons.redeemCash : "" : "");
    $("#lblreasonentransfer").html($moduleSelfReasons ? $moduleSelfReasons.transfer !== "" ? $moduleSelfReasons.transfer : "" : "");
    $("#lblreasonlogin").html($moduleSelfReasons ? $moduleSelfReasons.login !== "" ? $moduleSelfReasons.login : "" : "");
    $("#lblreasonenlinkbank").html($moduleSelfReasons ? $moduleSelfReasons.linkbank !== "" ? $moduleSelfReasons.linkbank : "" : "");
    $("#lblreasonenredeemtobank").html($moduleSelfReasons ? $moduleSelfReasons.redeemToBank !== "" ? $moduleSelfReasons.redeemToBank : "" : "");
    $("#lblreasonwalletAccess").html($moduleSelfReasons ? $moduleSelfReasons.walletAccess !== "" ? $moduleSelfReasons.walletAccess : "" : "");
    $("#lblreasonenredeemToWallet").html($moduleSelfReasons ? $moduleSelfReasons.redeemToWallet !== "" ? $moduleSelfReasons.redeemToWallet : "" : "");
    $("#lblreasonwallettobank").html($moduleSelfReasons ? $moduleSelfReasons.walletToBank !== "" ? $moduleSelfReasons.walletToBank : "" : "");
    $("#lblreasonconsumerAccess").html($moduleSelfReasons ? $moduleSelfReasons.consumerAccess !== "" ? $moduleSelfReasons.consumerAccess : "" : "");
    $("#lblreasonpayByWallet").html($moduleSelfReasons ? $moduleSelfReasons.payByWallet !== "" ? $moduleSelfReasons.payByWallet : "" : "");

    let $moduleReasons = data ? data.moduleReasons : undefined;
    $("#lblreasonbuy").html($moduleReasons ? $moduleReasons.buy !== "" ? $moduleReasons.buy : "" : "");
    $("#lblreasonredeem").html($moduleReasons ? $moduleReasons.redeemCash !== "" ? $moduleReasons.redeemCash : "" : "");
    $("#lblreasontransfer").html($moduleReasons ? $moduleReasons.transfer !== "" ? $moduleReasons.transfer : "" : "");
    $("#lblreasonlogin").html($moduleReasons ? $moduleReasons.login !== "" ? $moduleReasons.login : "" : "");
    $("#lblreasonlinkbank").html($moduleReasons ? $moduleReasons.linkbank !== "" ? $moduleReasons.linkbank : "" : "");
    $("#lblreasonredeemtobank").html($moduleReasons ? $moduleReasons.redeemToBank !== "" ? $moduleReasons.redeemToBank : "" : "");
    $("#lblreasonwalletAccess").html($moduleReasons ? $moduleReasons.walletAccess !== "" ? $moduleReasons.walletAccess : "" : "");
    $("#lblreasonredeemToWallet").html($moduleReasons ? $moduleReasons.redeemToWallet !== "" ? $moduleReasons.redeemToWallet : "" : "");
    $("#lblreasonwallettobank").html($moduleReasons ? $moduleReasons.walletToBank !== "" ? $moduleReasons.walletToBank : "" : "");
    $("#lblreasonconsumerAccess").html($moduleReasons ? $moduleReasons.consumerAccess !== "" ? $moduleReasons.consumerAccess : "" : "");

    var limitfor = $('input[name=limitfor]:checked').val();
    let $limit;
    if (limitfor === "consumer") {
        $limit = data ? data.limit : undefined;
    } else {
        $limit = data ? data.limitSelf : undefined;
    }

    // Buy 
    $("#buyMaxGold").html($limit ? ($limit.buyMax && $limit.buyMax != "NA") ? $limit.buyMax : 0 : 0);
    $("#buyMaxSilver").html($limit ? ($limit.buySilverMax && $limit.buySilverMax != "NA") ? $limit.buySilverMax : 0 : 0);
    $("#buyMinGold").html($limit ? ($limit.buyMin && $limit.buyMin != "NA") ? $limit.buyMin : 0 : 0);
    $("#buyMinSilver").html($limit ? ($limit.buySilverMin && $limit.buySilverMin != "NA") ? $limit.buySilverMin : 0 : 0);

    $("#buyMaxAmtOfTxnInDay").html($limit ? ($limit.buymaxAmtOfTxnInDay && $limit.buymaxAmtOfTxnInDay != "NA") ? $limit.buymaxAmtOfTxnInDay : 0 : 0);
    $("#buyMaxamtmonth").html($limit ? ($limit.buymaxAmtOfTxnInMonth && $limit.buymaxAmtOfTxnInMonth != "NA") ? $limit.buymaxAmtOfTxnInMonth : 0 : 0);
    $("#buyMaxamthour").html($limit ? ($limit.buymaxAmtOfTxnInHour && $limit.buymaxAmtOfTxnInHour != "NA") ? $limit.buymaxAmtOfTxnInHour : 0 : 0);
    $("#buytxnInterval").html($limit ? ($limit.buytxnInterval && $limit.buytxnInterval != "NA") ? converToMin($limit.buytxnInterval) : 0 : 0);
    $("#buynotxnInterval").html($limit ? ($limit.buynoOfTxnInInterval && $limit.buynoOfTxnInInterval != "NA") ? $limit.buynoOfTxnInInterval : 0 : 0);

    // Redeem Cash
    $("#redeemMinGold").html($limit ? ($limit.redeemCashMin && $limit.redeemCashMin != "NA") ? $limit.redeemCashMin : 0 : 0);
    $("#redeemMaxGold").html($limit ? ($limit.redeemCashMax && $limit.redeemCashMax != "NA") ? $limit.redeemCashMax : 0 : 0);
    $("#redeemMinSilver").html($limit ? ($limit.redeemCashSilverMin && $limit.redeemCashSilverMin != "NA") ? $limit.redeemCashSilverMin : 0 : 0);
    $("#redeemMaxSilver").html($limit ? ($limit.redeemCashSilverMax && $limit.redeemCashSilverMax != "NA") ? $limit.redeemCashSilverMax : 0 : 0);
    $("#redeemtobankMin").html($limit ? ($limit.redeemCashToBankMin && $limit.redeemCashToBankMin != "NA") ? $limit.redeemCashToBankMin : 0 : 0);
    $("#redeemtobankMax").html($limit ? ($limit.redeemCashToBankMax && $limit.redeemCashToBankMax != "NA") ? $limit.redeemCashToBankMax : 0 : 0);

    $("#redeemMaxAmtOfTxnInDay").html($limit ? ($limit.redeemCashmaxAmtOfTxnInDay && $limit.redeemCashmaxAmtOfTxnInDay != "NA") ? $limit.redeemCashmaxAmtOfTxnInDay : 0 : 0);
    $("#redeemMaxamtmonth").html($limit ? ($limit.redeemCashmaxAmtOfTxnInMonth && $limit.redeemCashmaxAmtOfTxnInMonth != "NA") ? $limit.redeemCashmaxAmtOfTxnInMonth : 0 : 0);
    $("#redeemMaxamthour").html($limit ? ($limit.redeemCashmaxAmtOfTxnInHour && $limit.redeemCashmaxAmtOfTxnInHour != "NA") ? $limit.redeemCashmaxAmtOfTxnInHour : 0 : 0);
    $("#redeemtxnInterval").html($limit ? ($limit.redeemCashtxnInterval && $limit.redeemCashtxnInterval != "NA") ? converToMin($limit.redeemCashtxnInterval) : 0 : 0);
    $("#redeemnotxnInterval").html($limit ? ($limit.redeemCashnoOfTxnInInterval && $limit.redeemCashnoOfTxnInInterval != "NA") ? $limit.redeemCashnoOfTxnInInterval : 0 : 0);

    // transfer
    $("#transferMinGold").html($limit ? ($limit.transferMin && $limit.transferMin != "NA") ? $limit.transferMin : 0 : 0);
    $("#transferMaxGold").html($limit ? ($limit.transferMax && $limit.transferMax != "NA") ? $limit.transferMax : 0 : 0);
    $("#transferMinSilver").html($limit ? ($limit.transferSilverMin && $limit.transferSilverMin != "NA") ? $limit.transferSilverMin : 0 : 0);
    $("#transferMaxSilver").html($limit ? ($limit.transferSilverMax && $limit.transferSilverMax != "NA") ? $limit.transferSilverMax : 0 : 0);

    $("#txnFreeLimit").html($limit ? ($limit.txnFreeLimit && $limit.txnFreeLimit != "NA") ? $limit.txnFreeLimit : 0 : 0);
    $("#transferMaxAmtOfTxnInDay").html($limit ? ($limit.transfermaxAmtOfTxnInDay && $limit.transfermaxAmtOfTxnInDay != "NA") ? $limit.transfermaxAmtOfTxnInDay : 0 : 0);
    $("#transferMaxamtmonth").html($limit ? ($limit.transfermaxAmtOfTxnInMonth && $limit.transfermaxAmtOfTxnInMonth != "NA") ? $limit.transfermaxAmtOfTxnInMonth : 0 : 0);
    $("#transferMaxamthour").html($limit ? ($limit.transfermaxAmtOfTxnInHour && $limit.transfermaxAmtOfTxnInHour != "NA") ? $limit.transfermaxAmtOfTxnInHour : 0 : 0);
    $("#transfertxnInterval").html($limit ? ($limit.transfertxnInterval && $limit.transfertxnInterval != "NA") ? converToMin($limit.transfertxnInterval) : 0 : 0);
    $("#transfernotxnInterval").html($limit ? ($limit.transfernoOfTxnInInterval && $limit.transfernoOfTxnInInterval != "NA") ? $limit.transfernoOfTxnInInterval : 0 : 0);
    
    // Wallet
    let $walletlimit = data ? data.limitSelf : undefined;
    $("#walletMinSilver").html($walletlimit ? ($walletlimit.addMoneyMin && $walletlimit.addMoneyMin != "NA") ? $walletlimit.addMoneyMin : 0 : 0);
    $("#walletMaxSilver").html($walletlimit ? ($walletlimit.addMoneyMax && $walletlimit.addMoneyMax != "NA") ? $walletlimit.addMoneyMax : 0 : 0);
    $("#totalWallet").html($walletlimit ? ($walletlimit.walletLimit && $walletlimit.walletLimit != "NA") ? $walletlimit.walletLimit : 0 : 0);
    $("#transLimit").html($walletlimit ? ($walletlimit.txnAmountLimit && $walletlimit.txnAmountLimit != "NA") ? $walletlimit.txnAmountLimit : 0 : 0);

    $("#walletMaxAmtOfTxnInDay").html($walletlimit ? ($walletlimit.addMoneymaxAmtOfTxnInDay && $walletlimit.addMoneymaxAmtOfTxnInDay != "NA") ? $walletlimit.addMoneymaxAmtOfTxnInDay : 0 : 0);
    $("#walletMaxamtmonth").html($walletlimit ? ($walletlimit.addMoneymaxAmtOfTxnInMonth && $walletlimit.addMoneymaxAmtOfTxnInMonth != "NA") ? $walletlimit.addMoneymaxAmtOfTxnInMonth : 0 : 0);
    $("#walletMaxamthour").html($walletlimit ? ($walletlimit.addMoneymaxAmtOfTxnInHour && $walletlimit.addMoneymaxAmtOfTxnInHour != "NA") ? $walletlimit.addMoneymaxAmtOfTxnInHour : 0 : 0);
    $("#wallettxnInterval").html($walletlimit ? ($walletlimit.addMoneytxnInterval && $walletlimit.addMoneytxnInterval != "NA") ? converToMin($walletlimit.addMoneytxnInterval) : 0 : 0);
    $("#walletnotxnInterval").html($walletlimit ? ($walletlimit.addMoneynoOfTxnInInterval && $walletlimit.addMoneynoOfTxnInInterval != "NA") ? $walletlimit.addMoneynoOfTxnInInterval : 0 : 0);

    $("#wallettobankMin").html($walletlimit ? ($walletlimit.walletToBankMin && $walletlimit.walletToBankMin != "NA") ? $walletlimit.walletToBankMin : 0 : 0);
    $("#wallettobankMax").html($walletlimit ? ($walletlimit.walletToBankMax && $walletlimit.walletToBankMax != "NA") ? $walletlimit.walletToBankMax : 0 : 0);
    $("#wallettobankMaxAmtOfTxnInDay").html($walletlimit ? ($walletlimit.walletToBankmaxAmtOfTxnInDay && $walletlimit.walletToBankmaxAmtOfTxnInDay != "NA") ? $walletlimit.walletToBankmaxAmtOfTxnInDay : 0 : 0);
    $("#wallettobankMaxamtmonth").html($walletlimit ? ($walletlimit.walletToBankmaxAmtOfTxnInMonth && $walletlimit.walletToBankmaxAmtOfTxnInMonth != "NA") ? $walletlimit.walletToBankmaxAmtOfTxnInMonth : 0 : 0);
    $("#wallettobankMaxamthour").html($walletlimit ? ($walletlimit.walletToBankmaxAmtOfTxnInHour && $walletlimit.walletToBankmaxAmtOfTxnInHour != "NA") ? $walletlimit.walletToBankmaxAmtOfTxnInHour : 0 : 0);
    $("#wallettobanktxnInterval").html($walletlimit ? ($walletlimit.walletToBanktxnInterval && $walletlimit.walletToBanktxnInterval != "NA") ? converToMin($walletlimit.walletToBanktxnInterval) : 0 : 0);
    $("#wallettobanknotxnInterval").html($walletlimit ? ($walletlimit.walletToBanknoOfTxnInInterval && $walletlimit.walletToBanknoOfTxnInInterval != "NA") ? $walletlimit.walletToBanknoOfTxnInInterval : 0 : 0);
 
    let $digitalPayment = data ? data.digitalPayment : undefined;
      if ($digitalPayment) {
       
        var $atomObj = $digitalPayment.payIn.filter(x => x.PGType === "atom");
        $("#apaymentGateway").html($atomObj.length ? ($atomObj[0].status && $atomObj[0].status != "NA") ? $atomObj[0].status == "comingsoon" ? "Coming Soon" : $atomObj[0].status.charAt(0).toUpperCase() + $atomObj[0].status.slice(1) : "Select" : "Select");
        $("#apgMinlimit").html($atomObj.length ? ($atomObj[0].min && $atomObj[0].min != "NA") ? $atomObj[0].min : 0 : 0);
        $("#apgMaxlimit").html($atomObj.length ? ($atomObj[0].max && $atomObj[0].max != "NA") ? $atomObj[0].max : 0 : 0);
        $("#lblreasonapaymentGateway").html($atomObj.length ? $atomObj[0].desc ? $atomObj[0].desc : "" : "");

        var $impsPayOut = $digitalPayment.impsPayOut.filter(x => x.PGType === "BANKPAYOUT");
        $("#bankpayoutimps").html($impsPayOut.length ? ($impsPayOut[0].status && $impsPayOut[0].status != "NA") ? $impsPayOut[0].status == "comingsoon" ? "Coming Soon" : $impsPayOut[0].status.charAt(0).toUpperCase() + $impsPayOut[0].status.slice(1) : "Select" : "Select");
        $("#bankimpsMinlimit").html($impsPayOut.length ? ($impsPayOut[0].min && $impsPayOut[0].min != "NA") ? $impsPayOut[0].min : 0 : 0);
        $("#bankimpsMaxlimit").html($impsPayOut.length ? ($impsPayOut[0].max && $impsPayOut[0].max != "NA") ? $impsPayOut[0].max : 0 : 0);
        $("#lblreasonbankpayoutimps").html($impsPayOut.length ? $impsPayOut[0].desc ? $impsPayOut[0].desc : "" : "");

        var $neftPayOut = $digitalPayment.neftPayOut.filter(x => x.PGType === "BANKPAYOUT");
        $("#bankpayoutneft").html($neftPayOut.length ? ($neftPayOut[0].status && $neftPayOut[0].status != "NA") ? $neftPayOut[0].status == "comingsoon" ? "Coming Soon" : $neftPayOut[0].status.charAt(0).toUpperCase() + $neftPayOut[0].status.slice(1) : "Select" : "Select");
        $("#bankneftMinlimit").html($neftPayOut.length ? ($neftPayOut[0].min && $neftPayOut[0].min != "NA") ? $neftPayOut[0].min : 0 : 0);
        $("#bankneftMaxlimit").html($neftPayOut.length ? ($neftPayOut[0].max && $neftPayOut[0].max != "NA") ? $neftPayOut[0].max : 0 : 0);
        $("#lblreasonbankpayoutneft").html($neftPayOut.length ? $neftPayOut[0].desc ? $neftPayOut[0].desc : "" : "");

    }

    loadlabelconf()
}

$("#svPermission").on('click', function () {
    if ($('#buy').html() != "Select" &&
        $('#redeem').html() != "Select" &&
        $('#transfer').html() != "Select" &&
        $("#linkbank").html() != "Select" &&
        $("#redeemToWallet").html() != "Select" &&
        $("#redeemtobank").html() != "Select") {

        let buy = getvalfrominputbyid("buy");
        let redeem = getvalfrominputbyid("redeem");
        let transfer = getvalfrominputbyid("transfer"); 
        let redeemtobank = getvalfrominputbyid("redeemtobank");
        let redeemToWallet = getvalfrominputbyid("redeemToWallet");
        let linkbank = getvalfrominputbyid("enlinkbank");
        let pval = $('input[name=kycFlag]:checked').val();
        let json = {
            "KYCFlag": pval ? pval : "KYC",
            "limitapplied": "common",
            "buy": { status: buy, message: $("#lblreasonbuy").text() },
            "redeemCash": { status: redeem, message: $("#lblreasonredeem").text() },
            "transfer": { status: transfer, message: $("#lblreasontransfer").text() }, 
            "redeemToWallet": { status: redeemToWallet, message: $("#lblreasonredeemToWallet").text() },
            "redeemToBank": { status: redeemtobank, message: $("#lblreasonredeemtobank").text() },
            "linkbank": { status: linkbank, message: $("#lblreasonlinkbank").text() },
            "appliedOn": "entity"
        }
        var rtruID = $('#txteTruid').val();
        if (rtruID && rtruID !== "") {
            json.rTruID = rtruID
            json.limitapplied = "entity";
            json.appliedOn = "consumer";
        }
        txnCheck(function (status) {
            if (status == true) {
                $('#consumerConfLoader').css('display', 'block');
                $.ajax({
                    "url": "/entityAccess/updateConsumerAccess", "method": "POST", contentType: "application/json",
                    dataType: "json", data: JSON.stringify(json), success: function (a) {
                        let data = a.body;
                        $('#consumerConfLoader').fadeOut('slow');
                        if (data.status == "200") {
                            editableSpecific("accesspermission", true);
                            $('#svPermission').attr('disabled', true);
                            $(".cnlbtn").addClass("hidden");
                            $(".cnlbtn").siblings().removeClass("hidden");
                            alertify.logPosition("bottom left");
                            alertify.success('Configuration successfully updated..!!');
                        }
                        else {
                            alertify.logPosition("bottom left");
                            alertify.error('Something went Wrong');
                        }

                    }
                })
            }
            else {
                alertify.error("Please Verify TPIN..!!")
            }
        })
    } else {
        alertify.error("Please Select Permission..!!");
    }

})

function getvalfrominputbyid(id) {
    var idtxt = $('#' + id).html();
    return ((idtxt == "Coming Soon") ? "comingsoon" : (idtxt == "Force Disable") ? "forceDisable" : idtxt.toLowerCase());
}

$("#svenPermission").on('click', function () {
    if ($('#enbuy').html() != "Select" &&
        $('#enredeem').html() != "Select" &&
        $('#entransfer').html() != "Select" &&
        $('#login').html() != "Select" &&
        $("#enlinkbank").html() != "Select" &&
        $("#consumerAccess").html() != "Select" &&
        $("#enredeemToWallet").html() != "Select" &&
        $("#enredeemtobank").html() != "Select") {

        let buy = getvalfrominputbyid("enbuy");
        let redeem = getvalfrominputbyid("enredeem");
        let transfer = getvalfrominputbyid("entransfer");
        let enredeemToWallet = getvalfrominputbyid("enredeemToWallet");
        let login = getvalfrominputbyid("login");
        let redeemtobank = getvalfrominputbyid("enredeemtobank");
        let consumerAccess = getvalfrominputbyid("consumerAccess");
        let allConsumerAccess = ($("#consumerAppaccess").prop("checked") == true) ? true : false;
        let linkbank = getvalfrominputbyid("enlinkbank");
        let pval = $('input[name=kycFlag]:checked').val();
        let json = {
            "KYCFlag": pval ? pval : "KYC",
            "limitapplied": "commonEntity",
            "buy": { status: buy, message: $("#lblreasonenbuy").text() },
            "redeemCash": { status: redeem, message: $("#lblreasonenredeem").text() },
            "transfer": { status: transfer, message: $("#lblreasonentransfer").text() },
            "redeemToWallet": { status: enredeemToWallet, message: $("#lblreasonenredeemToWallet").text() }, 
            "login": { status: login, message: $("#lblreasonlogin").text() },
            "redeemToBank": { status: redeemtobank, message: $("#lblreasonenredeemtobank").text() },
            "linkbank": { status: linkbank, message: $("#lblreasonenlinkbank").text() },
            "consumerAccess": { status: consumerAccess, message: $("#lblreasonconsumerAccess").text() },
            "allConsumerAccess": allConsumerAccess,
            "appliedOn": "entity"
        }
        var rtruID = $('#txteTruid').val();
        if (rtruID && rtruID !== "") {
            json.rTruID = rtruID
            json.limitapplied = "entity";
            json.appliedOn = "entity";
        }
        txnCheck(function (status) {
            if (status == true) {
                $('#consumerConfLoader').css('display', 'block');
                $.ajax({
                    "url": "/entityAccess/updateConsumerAccess", "method": "POST", contentType: "application/json",
                    dataType: "json", data: JSON.stringify(json), success: function (a) {
                        let data = a.body;
                        $('#consumerConfLoader').fadeOut('slow');
                        if (data.status == "200") {
                            editableSpecific("enaccesspermission", true);
                            $('#svenPermission').attr('disabled', true);
                            $(".cnlbtn").addClass("hidden");
                            $(".cnlbtn").siblings().removeClass("hidden");
                            alertify.logPosition("bottom left");
                            alertify.success('Configuration successfully updated..!!');
                        }
                        else {
                            alertify.logPosition("bottom left");
                            alertify.error('Something went Wrong');
                        }

                    }
                })
            }
            else {
                alertify.error("Please Verify TPIN..!!")
            }
        })
    } else {
        alertify.error("Please Select Permission..!!");
    }

})

$("#svWalAccess").on('click', function () {
    if ($('#walletAccess').html() != "Select" &&
        $('#wallettobank').html() != "Select" &&
        $('#redeemToWallet').html() != "Select") {
        let walletAccess = getvalfrominputbyid("walletAccess");
        let redeemToWallet = getvalfrominputbyid("redeemToWallet");
        let wallettobank = getvalfrominputbyid("wallettobank");
        let walletMin = $("#walletMinSilver").html();
        let walletMax = $("#walletMaxSilver").html();
        let transLimit = $("#transLimit").html();
        let totalWallet = $("#totalWallet").html();
        let wallettobankMin = $("#wallettobankMin").html();
        let wallettobankMax = $("#wallettobankMax").html();
        let pval = $('input[name=kycFlag]:checked').val();
        let json = {
            "KYCFlag": pval ? pval : "KYC",
            "addMoneyMin": walletMin,
            "addMoneyMax": walletMax,
            "walletLimit": totalWallet,
            "txnAmountLimit": transLimit, 
            "walletAccess": walletAccess,
            "redeemToWallet": redeemToWallet,
            "walletToBank": wallettobank,
            "walletToBankMin": wallettobankMin,
            "walletToBankMax": wallettobankMax,
            "appliedOn": "entity"
        }
        var rtruID = $('#txteTruid').val();
        if (rtruID && rtruID !== "") {
            json.rTruID = rtruID
            json.limitapplied = "entity";
            json.appliedOn = "entity";
        }
        txnCheck(function (status) {
            if (status == true) {
                $('#consumerConfLoader').css('display', 'block');
                $.ajax({
                    "url": "/entityAccess/updateWalLimit", "method": "POST", data: json, success: function (a) {
                        let data = a.body;
                        $('#consumerConfLoader').fadeOut('slow');
                        if (data.status == "200") {
                            editableSpecific("walletpermission", true);
                            $('#svWalAccess').attr('disabled', true);
                            $(".cnlbtnwal").addClass("hidden");
                            $(".cnlbtnwal").siblings().removeClass("hidden");
                            alertify.logPosition("bottom left");
                            alertify.success('Configuration successfully updated..!!');
                        }
                        else {
                            alertify.logPosition("bottom left");
                            alertify.error('Something went Wrong');
                        }

                    }
                })
            }
            else {
                alertify.error("Please Verify TPIN..!!")
            }
        })
    } else {
        alertify.error("Please Select Permission..!!");
    }
}); 
function updateLimitbuy(e) {
    var buyMaxGold = $("#buyMaxGold").html();
    var buyMaxSilver = $("#buyMaxSilver").html();
    var buyMinGold = $("#buyMinGold").html();
    var buyMinSilver = $("#buyMinSilver").html();
    var txnLimitInSeconds = $("#buytxnInterval").html();
    var noOfTxnInSeconds = $("#buynotxnInterval").html();
    var maxAmtOfTxnInSeconds = $("#buyMaxamthour").html();
    var maxAmtOfTxnInDay = $("#buyMaxAmtOfTxnInDay").html();
    var maxAmtOfTxnInMonth = $("#buyMaxamtmonth").html();
    var pval = $('input[name=kycFlag]:checked').val();
    var limitfor = $('input[name=limitfor]:checked').val();
    var json = {
        "KYCFlag": pval ? pval : "KYC",
        "tType": "buy",
        "appliedOn": "entity",
        "limitapplied": (limitfor === "consumer") ? "common" : "commonEntity",
        "goldMax": buyMaxGold,
        "goldMin": buyMinGold,
        "silverMax": buyMaxSilver,
        "silverMin": buyMinSilver,
        "txnLimitInSeconds": parseFloat(txnLimitInSeconds) * 60,
        "noOfTxnInSeconds": noOfTxnInSeconds,
        "maxAmtOfTxnInSeconds": maxAmtOfTxnInSeconds,
        "maxAmtOfTxnInDay": maxAmtOfTxnInDay,
        "maxAmtOfTxnInMonth": maxAmtOfTxnInMonth
    }
    submitConfig(json, e, "buy");
}
function submitConfig(json, e, type) {
    var rtruID = $('#txteTruid').val();
    if (rtruID && rtruID !== "") {
        json.rTruID = rtruID
        json.limitapplied = "entity";
        json.appliedOn = $('input[name=limitfor]:checked').val();
    }
    txnCheck(function (status) {
        if (status == true) {
            $('#consumerConfLoader').css('display', 'block');
            $.ajax({
                "url": "/entityAccess/updateConsumerLimit", "method": "POST", data: json, success: function (a) {
                    let data = a.body;
                    $('#consumerConfLoader').fadeOut('slow');
                    if (data.status == "200") {
                        editableSpecific(type, true);
                        $(e).addClass("hidden");
                        $(e).siblings().removeClass("hidden");
                        alertify.logPosition("bottom left");
                        alertify.success('Configuration successfully updated..!!');
                    }
                    else {
                        alertify.logPosition("bottom left");
                        alertify.error('Something went Wrong');
                    }

                }
            })
        }
        else {
            alertify.error("Please Verify TPIN..!!")
        }
    })
}
function submitWalletConfig(json, e, type, jsonaccess) {
    var rtruID = $('#txteTruid').val();
    if (rtruID && rtruID !== "") {
        json.rTruID = rtruID
        json.limitapplied = "entity";
        jsonaccess.rTruID = rtruID
        jsonaccess.limitapplied = "entity";
    }
    txnCheck(function (status) {
        if (status == true) {
            $('#consumerConfLoader').css('display', 'block');
            $.ajax({
                "url": "/entityAccess/updateConsumerAccess", "method": "POST", contentType: "application/json",
                dataType: "json", data: JSON.stringify(jsonaccess), success: function (a) {

                    let data = a.body;
                    if (data.status == "200") {
                        $.ajax({
                            "url": "/entityAccess/updateWalletLimits", "method": "POST", data: json, success: function (a) {
                                let data = a.body;
                                $('#consumerConfLoader').fadeOut('slow');
                                if (data.status == "200") {
                                    editableSpecific(type, true);
                                    $(e).addClass("hidden");
                                    $(e).siblings().removeClass("hidden");
                                    $(".updatebtn").addClass("hidden");
                                    $(".updatebtn").siblings().removeClass("hidden");
                                    alertify.logPosition("bottom left");
                                    alertify.success('Configuration successfully updated..!!');
                                }
                                else {
                                    alertify.logPosition("bottom left");
                                    alertify.error('Something went Wrong');
                                }

                            }
                        })
                    }
                    else {
                        $('#consumerConfLoader').fadeOut('slow');
                        alertify.logPosition("bottom left");
                        alertify.error('Something went Wrong');
                    }

                }
            })

        }
        else {
            alertify.error("Please Verify TPIN..!!")
        }
    })
}
function updateLimitRedeemCash(e) {
    var redeemMinGold = $("#redeemMinGold").html();
    var redeemMaxGold = $("#redeemMaxGold").html();
    var redeemMinSilver = $("#redeemMinSilver").html();
    var redeemMaxSilver = $("#redeemMaxSilver").html();
    var redeemCashToBankMax = $("#redeemtobankMax").html();
    var redeemCashToBankMin = $("#redeemtobankMin").html();
    var txnLimitInSeconds = $("#redeemtxnInterval").html();
    var noOfTxnInSeconds = $("#redeemnotxnInterval").html();
    var maxAmtOfTxnInSeconds = $("#redeemMaxamthour").html();
    var maxAmtOfTxnInDay = $("#redeemMaxAmtOfTxnInDay").html();
    var maxAmtOfTxnInMonth = $("#redeemMaxamtmonth").html();
    var pval = $('input[name=kycFlag]:checked').val();
    var limitfor = $('input[name=limitfor]:checked').val();
    var json = {
        "KYCFlag": pval ? pval : "KYC",
        "tType": "redeemCash",
        "appliedOn": "entity",
        "limitapplied": (limitfor === "consumer") ? "common" : "commonEntity",
        "goldMax": redeemMaxGold,
        "goldMin": redeemMinGold,
        "silverMax": redeemMaxSilver,
        "silverMin": redeemMinSilver,
        "txnLimitInSeconds": parseFloat(txnLimitInSeconds) * 60,
        "noOfTxnInSeconds": noOfTxnInSeconds,
        "maxAmtOfTxnInSeconds": maxAmtOfTxnInSeconds,
        "maxAmtOfTxnInDay": maxAmtOfTxnInDay,
        "maxAmtOfTxnInMonth": maxAmtOfTxnInMonth
    }
    submitConfig(json, e, "redeemCash");
}
function updateLimitTransfer(e) {
    var transferMinGold = $("#transferMinGold").html();
    var transferMaxGold = $("#transferMaxGold").html();
    var transferMinSilver = $("#transferMinSilver").html();
    var transferMaxSilver = $("#transferMaxSilver").html();
    var txnLimitInSeconds = $("#transfertxnInterval").html();
    var noOfTxnInSeconds = $("#transfernotxnInterval").html();
    var maxAmtOfTxnInSeconds = $("#transferMaxamthour").html();
    var maxAmtOfTxnInDay = $("#transferMaxAmtOfTxnInDay").html();
    var txnFreeLimit = $("#txnFreeLimit").html();
    var maxAmtOfTxnInMonth = $("#transferMaxamtmonth").html();
    var pval = $('input[name=kycFlag]:checked').val();
    var limitfor = $('input[name=limitfor]:checked').val();
    var json = {
        "KYCFlag": pval ? pval : "KYC",
        "tType": "transfer",
        "appliedOn": "entity",
        "limitapplied": (limitfor === "consumer") ? "common" : "commonEntity",
        "goldMax": transferMaxGold,
        "goldMin": transferMinGold,
        "silverMax": transferMaxSilver,
        "silverMin": transferMinSilver,
        "txnLimitInSeconds": parseFloat(txnLimitInSeconds) * 60,
        "noOfTxnInSeconds": noOfTxnInSeconds,
        "maxAmtOfTxnInSeconds": maxAmtOfTxnInSeconds,
        "maxAmtOfTxnInDay": maxAmtOfTxnInDay,
        "txnFreeLimit": txnFreeLimit,
        "maxAmtOfTxnInMonth": maxAmtOfTxnInMonth
    }
    submitConfig(json, e, "transfer");
}

function updatewalletlimit(e) {
    if ($('#walletAccess').html() != "Select") {

        let walletAccess = getvalfrominputbyid("walletAccess");
        let payByWallet = getvalfrominputbyid("payByWallet");
        let pval = $('input[name=kycFlag]:checked').val();
        let jsonWalletAcces = {
            "KYCFlag": pval ? pval : "KYC",
            "limitapplied": "commonEntity",
            "walletAccess": { status: walletAccess, message: $("#lblreasonwalletAccess").text() },
            "payByWallet": { status: payByWallet, message: $("#lblreasonpayByWallet").text() },
            "appliedOn": "entity"
        }
        var min = $("#walletMinSilver").html();
        var max = $("#walletMaxSilver").html();
        var walletLimit = $("#totalWallet").html();
        var bulContainLimit = $("#transLimit").html();

        var txnLimitInSeconds = $("#wallettxnInterval").html();
        var noOfTxnInSeconds = $("#walletnotxnInterval").html();
        var maxAmtOfTxnInSeconds = $("#walletMaxamthour").html();
        var maxAmtOfTxnInDay = $("#walletMaxAmtOfTxnInDay").html();
        var maxAmtOfTxnInMonth = $("#walletMaxamtmonth").html();
        var json = {
            "KYCFlag": pval ? pval : "KYC",
            "appliedOn": "entity",
            "tType": "wallet",
            "limitapplied": "commonEntity",
            "max": max,
            "min": min,
            "walletLimit": walletLimit,
            "bulContainLimit": bulContainLimit,
            "txnLimitInSeconds": parseFloat(txnLimitInSeconds) * 60,
            "noOfTxnInSeconds": noOfTxnInSeconds,
            "maxAmtOfTxnInSeconds": maxAmtOfTxnInSeconds,
            "maxAmtOfTxnInDay": maxAmtOfTxnInDay,
            "maxAmtOfTxnInMonth": maxAmtOfTxnInMonth
        }
        submitWalletConfig(json, e, "walletpermission", jsonWalletAcces);
    } else {
        alertify.error("Please Select Permission..!!");
    }
}
function updatewallettobanklimit(e) {

    if ($('#wallettobank').html() != "Select") {

        let walletToBank = getvalfrominputbyid("wallettobank");
        let pval = $('input[name=kycFlag]:checked').val();
        let jsonwalletToBank = {
            "KYCFlag": pval ? pval : "KYC",
            "limitapplied": "commonEntity",
            "walletToBank": { status: walletToBank, message: $("#lblreasonwallettobank").text() },
            "appliedOn": "entity"
        }

        var min = $("#wallettobankMin").html();
        var max = $("#wallettobankMax").html();

        var txnLimitInSeconds = $("#wallettobanktxnInterval").html();
        var noOfTxnInSeconds = $("#wallettobanknotxnInterval").html();
        var maxAmtOfTxnInSeconds = $("#wallettobankMaxamthour").html();
        var maxAmtOfTxnInDay = $("#wallettobankMaxAmtOfTxnInDay").html();
        var maxAmtOfTxnInMonth = $("#wallettobankMaxamtmonth").html();
        var json = {
            "KYCFlag": pval ? pval : "KYC",
            "appliedOn": "entity",
            "tType": "walletToBank",
            "limitapplied": "commonEntity",
            "max": max,
            "min": min,
            "txnLimitInSeconds": parseFloat(txnLimitInSeconds) * 60,
            "noOfTxnInSeconds": noOfTxnInSeconds,
            "maxAmtOfTxnInSeconds": maxAmtOfTxnInSeconds,
            "maxAmtOfTxnInDay": maxAmtOfTxnInDay,
            "maxAmtOfTxnInMonth": maxAmtOfTxnInMonth
        }
        submitWalletConfig(json, e, "wallettobank", jsonwalletToBank);

    } else {
        alertify.error("Please Select Permission..!!");
    }
}

function updateredeemtowalletlimit(e) {

    if ($('#redeemToWallet').html() != "Select") {

        let redeemToWallet = getvalfrominputbyid("redeemToWallet");
        let pval = $('input[name=kycFlag]:checked').val();
        let jsonredeemToWallet = {
            "KYCFlag": pval ? pval : "KYC",
            "limitapplied": "commonEntity",
            "redeemToWallet": { status: redeemToWallet, message: $("#lblreasonredeemToWallet").text() },
            "appliedOn": "entity"
        }
        var ctruID = $('#txtcTruid').val();
        if (ctruID && ctruID !== "") {
            jsonredeemToWallet.cTruID = ctruID;
            jsonredeemToWallet.limitapplied = "consumer";
            jsonredeemToWallet.KYCFlag = $("#accountStatus").val() === "active" ? "KYC" : "KYC";
        }
        txnCheck(function (status) {
            if (status == true) {
                $('#consumerConfLoader').css('display', 'block');
                $.ajax({
                    "url": "/entityAccess/updateConsumerAccess", "method": "POST", contentType: "application/json",
                    dataType: "json", data: JSON.stringify(jsonredeemToWallet), success: function (a) {
                        let data = a.body;
                        $('#consumerConfLoader').fadeOut('slow');
                        if (data.status == "200") {
                            editableSpecific("redeemtowallet", true);
                            $(".updatebtn").addClass("hidden");
                            $(".updatebtn").siblings().removeClass("hidden");
                            alertify.logPosition("bottom left");
                            alertify.success('Configuration successfully updated..!!');
                        }
                        else {
                            alertify.logPosition("bottom left");
                            alertify.error('Something went Wrong');
                        }

                    }
                })
            }
            else {
                alertify.error("Please Verify TPIN..!!")
            }
        })
    }
}

function updatePGatom(e) {

    if ($('#apaymentGateway').html() != "Select") {
        let paymentGateway = getvalfrominputbyid("apaymentGateway");
        let pgMinlimit = $("#apgMinlimit").html();
        let pgMaxlimit = $("#apgMaxlimit").html();
        let lblreasonlpaymentGateway = $("#lblreasonapaymentGateway").html();
        var pval = $('input[name=kycFlag]:checked').val();

        var json = {
            "appliedOn": "entity",
            "KYCFlag": pval ? pval : "KYC",
            "payIn": {
                "status": paymentGateway,
                "PGType": "atom",
                "min": pgMinlimit,
                "max": pgMaxlimit,
                "desc": lblreasonlpaymentGateway
            }
        }
        submitConfigPG(json, e, "pgpermissionAtom");
    } else {
        alertify.error("Please Select Permission..!!");
    }
} 
function updatePGIMPS(e) {

    if ($('#bankpayoutimps').html() != "Select") {
        let bankpayoutimps = getvalfrominputbyid("bankpayoutimps");
        let Minlimit = $("#bankimpsMinlimit").html();
        let Maxlimit = $("#bankimpsMaxlimit").html();
        let lblreasonlpaymentGateway = $("#lblreasonbankpayoutimps").html();
        var pval = $('input[name=kycFlag]:checked').val();

        var json = {
            "appliedOn": "entity",
            "KYCFlag": pval ? pval : "KYC",
            "impsPayOut": {
                "status": bankpayoutimps,
                "PGType": "BANKPAYOUT",
                "min": Minlimit,
                "max": Maxlimit,
                "desc": lblreasonlpaymentGateway
            }
        }
        submitConfigPG(json, e, "pgpermissionIMPS");
    } else {
        alertify.error("Please Select Permission..!!");
    }
}
function updatePGNEFT(e) {

    if ($('#bankpayoutneft').html() != "Select") {
        let bankpayoutneft = getvalfrominputbyid("bankpayoutneft");
        let Minlimit = $("#bankneftMinlimit").html();
        let Maxlimit = $("#bankneftMaxlimit").html();
        let lblreasonlpaymentGateway = $("#lblreasonbankpayoutneft").html();
        var pval = $('input[name=kycFlag]:checked').val();

        var json = {
            "appliedOn": "entity",
            "KYCFlag": pval ? pval : "KYC",
            "neftPayOut": {
                "status": bankpayoutneft,
                "PGType": "BANKPAYOUT",
                "min": Minlimit,
                "max": Maxlimit,
                "desc": lblreasonlpaymentGateway
            }
        }
        submitConfigPG(json, e, "pgpermissionNEFT");
    } else {
        alertify.error("Please Select Permission..!!");
    }
}

function submitConfigPG(json, e, type) {
    txnCheck(function (status) {
        if (status == true) {
            $('#consumerConfLoader').css('display', 'block');
            $.ajax({
                "url": "/configuration/updateConsumerPG",
                "method": "POST",
                data: JSON.stringify(json),
                contentType: "application/json",
                dataType: "json", success: function (a) {
                    let data = a.body;
                    $('#consumerConfLoader').fadeOut('slow');
                    if (data.status == "200") {
                        editableSpecific(type, true);
                        $(e).addClass("hidden");
                        $(e).siblings().removeClass("hidden");
                        alertify.logPosition("bottom left");
                        alertify.success('Configuration successfully updated..!!');
                    }
                    else {
                        alertify.logPosition("bottom left");
                        alertify.error('Something went Wrong');
                    }

                }
            })
        }
        else {
            alertify.error("Please Verify TPIN..!!")
        }
    })
}