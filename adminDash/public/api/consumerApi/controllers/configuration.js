var accesselementArr = ["buy", "redeem", "transfer", "login", "redeemtobank", "linkbank"];
var bullionelementArr = ["buy", "redeem", "transfer"];
var walletelementArr = ["wallet", "walletToBank", "redeemToWallet"];
$(function () {
    $.fn.editable.defaults.mode = 'popup';
    $('#consumerConfLoader').css('display', 'block');
    bindConfig("KYC");

})

function opsName(val) {
    return (val === "redeem") ? "Sell" :
        (val == "linkbank") ? "Link Bank" :
            (val == "redeemtobank") ? "Sell To Bank" :
                (val == "redeemToWallet") ? "Redeem To Wallet" :
                    val;
}

function loadAccessHtmlContent() {
    let htmlContext = "<tr>";
    let editableConf = [];

    accesselementArr.forEach((element, index) => {
        htmlContext += `
            <td width="20%" class="text-capitalize">${String(opsName(element))} :</td>
                <td><a href="javascript:;" id="${String(element)}" data-type="select" data-title="Select Permission"
                    data-title="${String(element)}" class="editable editable-click editable-disabled"
                    data-original-title="" title="">Select</a>
                <br />
                <small><label class="text-danger" id="lblreason${String(element)}"></label></small>
            </td>`;
        if ((index + 1) % 2 == 0) {
            htmlContext += `</tr><tr>`
        } else if (index === (accesselementArr.length - 1)) {
            htmlContext += `</tr>`

        }
        editableConf.push(element)
    });

    $("#accessContent").empty();
    $("#accessContent").append(htmlContext);
    editableConf.forEach(ele => {
        cmbEditableConf(ele)
    });

}


function loadBullionHtmlContent() {
    let htmlContext = "";
    let editableConf = [];
    let editableConfCmb = [];

    bullionelementArr.forEach(element => {
        htmlContext += `<tr><td width="20%" class="text-capitalize">${String(opsName(element))} :</td>
        <td>Min : <i class="fa fa-rupee"></i><a href="javascript:;" id="${String(element)}MinGold" data-type="text" data-title="Enter Gold Min " class="editable editable-click editable-disabled" data-original-title="" title="Enter Gold Min">0</a><br />
            Max : <i class="fa fa-rupee"></i><a href="javascript:;" id="${String(element)}MaxGold" data-type="text" data-title="Enter Gold Max " class="editable editable-click editable-disabled" data-original-title="" title="Enter Gold Max">0</a>
        </td>
        <td>Min : <i class="fa fa-rupee"></i><a href="javascript:;" id="${String(element)}MinSilver" data-type="text" data-title="Enter Min Silver " class="editable editable-click editable-disabled" data-original-title="" title="Enter Silver Min">0</a>           <br />
            Max : <i class="fa fa-rupee"></i><a href="javascript:;" id="${String(element)}MaxSilver" data-type="text" data-title="Enter Max Silver" class="editable editable-click editable-disabled" data-original-title="" title="Enter Silver Max">0</a>
        </td>
        <td>`;
        htmlContext += `
                Txn invervals : <a href="javascript:;" id="${String(element)}txnInterval" data-type="text" data-title="Enter Txn Time Interval " class="editable editable-click editable-disabled" data-original-title="" title="Enter Txn Time Interval">0</a> min<br />
                No. of Txn in invervals : <a href="javascript:;" id="${String(element)}notxnInterval" data-type="text" data-title="Enter no of txn in time interval " class="editable editable-click editable-disabled" data-original-title="" title="Enter no of txn in time interval">0</a><br />
                Maximum amount of txn in month : <i class="fa fa-rupee"></i> <a href="javascript:;" id="${String(element)}Maxamtmonth" data-type="text" data-title="Enter maximun amount of txn in month " class="editable editable-click editable-disabled" data-original-title="" title="Enter maximun amount of txn in month">0</a><br />
                Maximum amount of txn in hour : <i class="fa fa-rupee"></i> <a href="javascript:;" id="${String(element)}Maxamthour" data-type="text" data-title="Enter minimun amount of txn in hour " class="editable editable-click editable-disabled" data-original-title="" title="Enter minimun amount of txn in hour">0</a> <br />
                Maximum amount of txn in Day : <i class="fa fa-rupee"></i> <a href="javascript:;" id="${String(element)}MaxAmtOfTxnInDay" data-type="text" data-title="Enter minimun amount of txn in Day " class="editable editable-click editable-disabled" data-original-title="" title="Enter minimun amount of txn in Day">0</a>
            `
        if (element === "redeem") {
            htmlContext += `</br>Sell After Buy Interval : <a href="javascript:;" id="sellAfterBuyInterval" data-type="text" data-title="Enter minimun amount of txn in Day " class="editable editable-click editable-disabled" data-original-title="" title="Enter minimun amount of txn in Day">0</a> min<br />
                    Sell To Bank Interval : <a href="javascript:;" id="sellToBankInterval" data-type="text" data-title="Enter minimun amount of txn in Day " class="editable editable-click editable-disabled" data-original-title="" title="Enter minimun amount of txn in Day">0</a> min<br />
                    Min Purchase to Sell : <i class="fa fa-rupee"></i> <a href="javascript:;" id="minBuyToSell" data-type="text" data-title="Enter minimun amount of txn in Day " class="editable editable-click editable-disabled" data-original-title="" title="Enter minimun amount of txn in Day">0</a>`;
            editableConf.push("sellAfterBuyInterval");
            editableConf.push("sellToBankInterval");
            editableConf.push("minBuyToSell");
        }
        if (element === "payment") {
            htmlContext += `<br /> Txn charges Free below : <i class="fa fa-rupee"></i> <a href="javascript:;" id="txnFreeLimit" data-type="text" data-title="Enter minimun amount of txn in Day " class="editable editable-click editable-disabled" data-original-title="" title="Enter minimun amount of txn in Day">0</a>`;
            htmlContext += `<br /> Min stock Required : <a href="javascript:;" id="minStockRequired" data-type="select" data-title="Select" class="editable editable-click editable-disabled" data-original-title="" title="Enter minimun amount of txn in Day">Select</a>`;
            editableConf.push("txnFreeLimit");
            editableConfCmb.push("minStockRequired");
        }
        editableConf.push(element + "MinGold");
        editableConf.push(element + "MaxGold");
        editableConf.push(element + "MinSilver");
        editableConf.push(element + "MaxSilver");
        editableConf.push(element + "txnInterval");
        editableConf.push(element + "notxnInterval");
        editableConf.push(element + "Maxamtmonth");
        editableConf.push(element + "Maxamthour");
        editableConf.push(element + "MaxAmtOfTxnInDay");

        htmlContext += `</td> <td width="50px">
            <a type="button" class="btn text-info updatebtn hidden" data-type="${String(element)}" onclick="updateLimit(this)"><i class="fa fa-save fa-2x"></i></a>
            <a type="button" title="Change Configuration" data-type="${String(element)}" class="btn text-info" onclick="onedit(this)"><i class="fa fa fa-pencil"></i></a>
        </td></tr>`;

    });
    $("#bulLimitContent").empty();
    $("#bulLimitContent").append(htmlContext);
    editableConf.forEach(ele => {
        txtEditableConf(ele)
    });
    editableConfCmb.forEach(ele => {
        cmbEditableConf2x(ele)
    });

}

$('.radio-group label').on('click', function () {
    $(this).removeClass('not-active').siblings().addClass('not-active');

});

function kycFlag(e) {
    var pval = $('input[name=kycFlag]:checked').val();
    bindConfig(pval);
}
function bindConfig(pval) {
    json = {
        flag: pval,
        appliedOn: "consumer"
    }
    var ctruID = $('#txtcTruid').val();
    if (ctruID && ctruID !== "") {
        json.cTruID = ctruID;
        json.flag = "check";
    }

    $('#consumerConfLoader').css('display', 'block');
    $.ajax({
        "url": "/configuration/getconsumerConfig", "method": "POST", data: json, success: function (a) {
            $('#consumerConfLoader').fadeOut('slow');
            let res = a.body;

            $('#consumerConfLoader').fadeOut('slow');
            if (res.status == "200") {
                cdata = res.resource;
                loadAccessHtmlContent();
                loadBullionHtmlContent();
                bindData(cdata)
            }
        }
    })
}
function converToMin(val) {
    return parseInt(val) / 60;
}
function opskeys(val) {
    return (val === "redeem") ? "redeemCash" :
        (val === "redeemtobank") ? "redeemToBank" :
            val;
}
function loaddata(accessData, accessReason) {
    if (accessData) {
        accesselementArr.forEach(element => {
            let accval = opskeys(element);
            if (accessData[accval]) {
                $("#" + element).html(accessData ? (accessData[accval] && accessData[accval] != "NA") ? accessData[accval] == "comingsoon" ? "Coming Soon" : accessData[accval].charAt(0).toUpperCase() + accessData[accval].slice(1) : "Select" : "Select");
                $("#lblreason" + element).html(accessReason ? accessReason[accval] !== "" ? accessReason[accval] : "" : "");
            } else {
                $("#" + element).html("Select");
            }
        });
    }
}
function conversionGold(type, lvl) {
    let varabl = (type === "Conversion") ? "ConversionGold" : type;
    return varabl;

}






function loadbulliondata(dataobj) {
    bullionelementArr.forEach(ele => {
        let type = opskeys(ele);
        $('#' + ele + 'MaxGold').html(dataobj ? (dataobj[type + "Max"] && dataobj[type + "Max"] != "NA") ? dataobj[type + "Max"] : 0 : 0)
        $('#' + ele + 'MaxSilver').html(dataobj ? (dataobj[type + "SilverMax"] && dataobj[type + "SilverMax"] != "NA") ? dataobj[type + "SilverMax"] : 0 : 0)
        $('#' + ele + 'MinGold').html(dataobj ? (dataobj[type + "Min"] && dataobj[type + "Min"] != "NA") ? dataobj[type + "Min"] : 0 : 0)
        $('#' + ele + 'MinSilver').html(dataobj ? (dataobj[type + "SilverMin"] && dataobj[type + "SilverMin"] != "NA") ? dataobj[type + "SilverMin"] : 0 : 0)

        if (ele === "redeem") {
            $("#sellAfterBuyInterval").html(dataobj ? (dataobj.redeemCashsellAfterBuyInterval && dataobj.redeemCashsellAfterBuyInterval != "NA") ? converToMin(dataobj.redeemCashsellAfterBuyInterval) : 0 : 0);
            $("#sellToBankInterval").html(dataobj ? (dataobj.redeemCashsellToBankInterval && dataobj.redeemCashsellToBankInterval != "NA") ? converToMin(dataobj.redeemCashsellToBankInterval) : 0 : 0);
            $("#minBuyToSell").html(dataobj ? (dataobj.redeemCashminBuyToSell && dataobj.redeemCashminBuyToSell != "NA") ? dataobj.redeemCashminBuyToSell : 0 : 0);
        }
        $('#' + ele + 'MaxAmtOfTxnInDay').html(dataobj ? (dataobj[type + "maxAmtOfTxnInDay"] && dataobj[type + "maxAmtOfTxnInDay"] != "NA") ? dataobj[type + "maxAmtOfTxnInDay"] : 0 : 0)
        $('#' + ele + 'Maxamtmonth').html(dataobj ? (dataobj[type + "maxAmtOfTxnInMonth"] && dataobj[type + "maxAmtOfTxnInMonth"] != "NA") ? dataobj[type + "maxAmtOfTxnInMonth"] : 0 : 0)
        $('#' + ele + 'Maxamthour').html(dataobj ? (dataobj[type + "maxAmtOfTxnInHour"] && dataobj[type + "maxAmtOfTxnInHour"] != "NA") ? dataobj[type + "maxAmtOfTxnInHour"] : 0 : 0)
        $('#' + ele + 'txnInterval').html(dataobj ? (dataobj[type + "txnInterval"] && dataobj[type + "txnInterval"] != "NA") ? converToMin(dataobj[type + "txnInterval"]) : 0 : 0)
        $('#' + ele + 'notxnInterval').html(dataobj ? (dataobj[type + "noOfTxnInInterval"] && dataobj[type + "noOfTxnInInterval"] != "NA") ? dataobj[type + "noOfTxnInInterval"] : 0 : 0)

    })
}
function bindData(data) {
    // let $dlrData = kycFlag == "pending" ? data.NonKYCConsumer.consumer : data.KYCConsumer.consumer;
    let $dlrData = data ? data.module : undefined;
    let $moduleReasons = data ? data.moduleReasons : undefined;
    loaddata($dlrData, $moduleReasons);

    $("#walletAccess").html($dlrData ? ($dlrData.walletAccess && $dlrData.walletAccess != "NA") ? $dlrData.walletAccess == "comingsoon" ? "Coming Soon" : $dlrData.walletAccess.charAt(0).toUpperCase() + $dlrData.walletAccess.slice(1) : "Select" : 0);
    $("#payByWallet").html($dlrData ? ($dlrData.payByWallet && $dlrData.payByWallet != "NA") ? $dlrData.payByWallet == "comingsoon" ? "Coming Soon" : $dlrData.payByWallet.charAt(0).toUpperCase() + $dlrData.payByWallet.slice(1) : "Select" : 0);    
    $("#redeemToWallet").html($dlrData ? ($dlrData.redeemToWallet && $dlrData.redeemToWallet != "NA") ? $dlrData.redeemToWallet == "comingsoon" ? "Coming Soon" : $dlrData.redeemToWallet.charAt(0).toUpperCase() + $dlrData.redeemToWallet.slice(1) : "Select" : 0);
    if ($dlrData) {
        if ($dlrData.walletToBank) {
            $("#wallettobank").html($dlrData ? ($dlrData.walletToBank && $dlrData.walletToBank != "NA") ? $dlrData.walletToBank == "comingsoon" ? "Coming Soon" : $dlrData.walletToBank.charAt(0).toUpperCase() + $dlrData.walletToBank.slice(1) : "Select" : 0);
        }
        else {
            $("#wallettobank").html("Disable");
        }
    } else {
        $("#wallettobank").html("Disable");
    }

    $("#updatedg").removeClass("hidden");

    $("#lblreasonredeemtobank").html($moduleReasons ? $moduleReasons.redeemToBank !== "" ? $moduleReasons.redeemToBank : "" : "");
    $("#lblreasonwalletAccess").html($moduleReasons ? $moduleReasons.walletAccess !== "" ? $moduleReasons.walletAccess : "" : "");
    $("#lblreasonredeemToWallet").html($moduleReasons ? $moduleReasons.redeemToWallet !== "" ? $moduleReasons.redeemToWallet : "" : "");
    $("#lblreasonwallettobank").html($moduleReasons ? $moduleReasons.walletToBank !== "" ? $moduleReasons.walletToBank : "" : "");


    let $limit = data ? data.limit : undefined;

    loadbulliondata($limit)

    // Wallet
    $("#walletMinSilver").html($limit ? ($limit.addMoneyMin && $limit.addMoneyMin != "NA") ? $limit.addMoneyMin : 0 : 0);
    $("#walletMaxSilver").html($limit ? ($limit.addMoneyMax && $limit.addMoneyMax != "NA") ? $limit.addMoneyMax : 0 : 0);
    $("#totalWallet").html($limit ? ($limit.walletLimit && $limit.walletLimit != "NA") ? $limit.walletLimit : 0 : 0);
    $("#transLimit").html($limit ? ($limit.txnAmountLimit && $limit.txnAmountLimit != "NA") ? $limit.txnAmountLimit : 0 : 0);

    $("#walletMaxAmtOfTxnInDay").html($limit ? ($limit.addMoneymaxAmtOfTxnInDay && $limit.addMoneymaxAmtOfTxnInDay != "NA") ? $limit.addMoneymaxAmtOfTxnInDay : 0 : 0);
    $("#walletMaxamtmonth").html($limit ? ($limit.addMoneymaxAmtOfTxnInMonth && $limit.addMoneymaxAmtOfTxnInMonth != "NA") ? $limit.addMoneymaxAmtOfTxnInMonth : 0 : 0);
    $("#walletMaxamthour").html($limit ? ($limit.addMoneymaxAmtOfTxnInHour && $limit.addMoneymaxAmtOfTxnInHour != "NA") ? $limit.addMoneymaxAmtOfTxnInHour : 0 : 0);
    $("#wallettxnInterval").html($limit ? ($limit.addMoneytxnInterval && $limit.addMoneytxnInterval != "NA") ? converToMin($limit.addMoneytxnInterval) : 0 : 0);
    $("#walletnotxnInterval").html($limit ? ($limit.addMoneynoOfTxnInInterval && $limit.addMoneynoOfTxnInInterval != "NA") ? $limit.addMoneynoOfTxnInInterval : 0 : 0);

    $("#wallettobankMin").html($limit ? ($limit.walletToBankMin && $limit.walletToBankMin != "NA") ? $limit.walletToBankMin : 0 : 0);
    $("#wallettobankMax").html($limit ? ($limit.walletToBankMax && $limit.walletToBankMax != "NA") ? $limit.walletToBankMax : 0 : 0);

    $("#wallettobankMaxAmtOfTxnInDay").html($limit ? ($limit.walletToBankmaxAmtOfTxnInDay && $limit.walletToBankmaxAmtOfTxnInDay != "NA") ? $limit.walletToBankmaxAmtOfTxnInDay : 0 : 0);
    $("#wallettobankMaxamtmonth").html($limit ? ($limit.walletToBankmaxAmtOfTxnInMonth && $limit.walletToBankmaxAmtOfTxnInMonth != "NA") ? $limit.walletToBankmaxAmtOfTxnInMonth : 0 : 0);
    $("#wallettobankMaxamthour").html($limit ? ($limit.walletToBankmaxAmtOfTxnInHour && $limit.walletToBankmaxAmtOfTxnInHour != "NA") ? $limit.walletToBankmaxAmtOfTxnInHour : 0 : 0);
    $("#wallettobanktxnInterval").html($limit ? ($limit.walletToBanktxnInterval && $limit.walletToBanktxnInterval != "NA") ? converToMin($limit.walletToBanktxnInterval) : 0 : 0);
    $("#wallettobanknotxnInterval").html($limit ? ($limit.walletToBanknoOfTxnInInterval && $limit.walletToBanknoOfTxnInInterval != "NA") ? $limit.walletToBanknoOfTxnInInterval : 0 : 0);



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
        var $upiCollect = $digitalPayment.upiCollect.filter(x => x.PGType === "BANKPAYOUT");
        $("#bankupicollect").html($upiCollect.length ? ($upiCollect[0].status && $upiCollect[0].status != "NA") ? $upiCollect[0].status == "comingsoon" ? "Coming Soon" : $upiCollect[0].status.charAt(0).toUpperCase() + $upiCollect[0].status.slice(1) : "Select" : "Select");
        $("#upicollectLimitMin").html($upiCollect.length ? ($upiCollect[0].min && $upiCollect[0].min != "NA") ? $upiCollect[0].min : 0 : 0);
        $("#upicollectLimitMax").html($upiCollect.length ? ($upiCollect[0].max && $upiCollect[0].max != "NA") ? $upiCollect[0].max : 0 : 0);
        $("#lblreasonbankupicollect").html($upiCollect.length ? $upiCollect[0].desc ? $upiCollect[0].desc : "" : "");

        var $upiPayOut = $digitalPayment.upiPayOut.filter(x => x.PGType === "BANKPAYOUT");
        $("#bankupipayout").html($upiPayOut.length ? ($upiPayOut[0].status && $upiPayOut[0].status != "NA") ? $upiPayOut[0].status == "comingsoon" ? "Coming Soon" : $upiPayOut[0].status.charAt(0).toUpperCase() + $upiPayOut[0].status.slice(1) : "Select" : "Select");
        $("#upiLimitMin").html($upiPayOut.length ? ($upiPayOut[0].min && $upiPayOut[0].min != "NA") ? $upiPayOut[0].min : 0 : 0);
        $("#upiLimitMax").html($upiPayOut.length ? ($upiPayOut[0].max && $upiPayOut[0].max != "NA") ? $upiPayOut[0].max : 0 : 0);
        $("#lblreasonbankupipayout").html($upiPayOut.length ? $upiPayOut[0].desc ? $upiPayOut[0].desc : "" : "");
    }

    loadlabelconf()
}


function getvalfrominputbyid(id) {
    var idtxt = $('#' + id).html();
    return ((idtxt == "Coming Soon") ? "comingsoon" : (idtxt == "Force Disable") ? "forceDisable" : idtxt.toLowerCase());
}

$("#svPermission").on('click', function () {
    if ($('#buy').html() != "Select" &&
        $('#redeem').html() != "Select" &&
        $('#transfer').html() != "Select" &&
        $('#login').html() != "Select" &&
        $("#linkbank").html() != "Select" &&
        $("#redeemtobank").html() != "Select") {

        let buy = getvalfrominputbyid("buy");
        let redeem = getvalfrominputbyid("redeem");
        let transfer = getvalfrominputbyid("transfer");
        let login = getvalfrominputbyid("login");
        let redeemtobank = getvalfrominputbyid("redeemtobank");
        let linkbank = getvalfrominputbyid("linkbank");
        let pval = $('input[name=kycFlag]:checked').val();
        let json = {
            "KYCFlag": pval ? pval : "nonKYC",
            "limitapplied": "common",
            "buy": { status: buy, message: $("#lblreasonbuy").text() },
            "redeemCash": { status: redeem, message: $("#lblreasonredeem").text() },
            "transfer": { status: transfer, message: $("#lblreasontransfer").text() },
            "login": { status: login, message: $("#lblreasonlogin").text() },
            "redeemToBank": { status: redeemtobank, message: $("#lblreasonredeemtobank").text() },
            "linkbank": { status: linkbank, message: $("#lblreasonlinkbank").text() },
            "appliedOn": "consumer"
        }
        var ctruID = $('#txtcTruid').val();
        if (ctruID && ctruID !== "") {
            json.cTruID = ctruID
            json.limitapplied = "consumer";
            json.KYCFlag = "check";
        }
        txnCheck(function (status) {
            if (status == true) {
                $('#consumerConfLoader').css('display', 'block');
                $.ajax({
                    "url": "/configuration/updateConsumerAccess", "method": "POST", contentType: "application/json",
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

$("#svWalAccess").on('click', function () {
    if ($('#walletAccess').html() != "Select" &&
        // $('#paymentGateway').html() != "Select" &&
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
            "KYCFlag": pval ? pval : "nonKYC",
            "addMoneyMin": walletMin,
            "addMoneyMax": walletMax,
            "walletLimit": totalWallet,
            "txnAmountLimit": transLimit,
            // "paymentModeAccess": paymentGateway,
            "walletAccess": walletAccess,
            "redeemToWallet": redeemToWallet,
            "walletToBank": wallettobank,
            "walletToBankMin": wallettobankMin,
            "walletToBankMax": wallettobankMax,
            "appliedOn": "consumer"
        }
        var ctruID = $('#txtcTruid').val();
        if (ctruID && ctruID !== "") {
            json.cTruID = ctruID;
            json.limitapplied = "consumer";
            json.KYCFlag = "check";
        }
        txnCheck(function (status) {
            if (status == true) {
                $('#consumerConfLoader').css('display', 'block');
                $.ajax({
                    "url": "/configuration/updateWalLimit", "method": "POST", data: json, success: function (a) {
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

function updatePGatom(e) {

    if ($('#apaymentGateway').html() != "Select") {
        let paymentGateway = getvalfrominputbyid("apaymentGateway");
        let pgMinlimit = $("#apgMinlimit").html();
        let pgMaxlimit = $("#apgMaxlimit").html();
        let lblreasonlpaymentGateway = $("#lblreasonapaymentGateway").html();
        var pval = $('input[name=kycFlag]:checked').val();

        var json = {
            "appliedOn": "consumer",
            "KYCFlag": pval ? pval : "nonKYC",
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
            "appliedOn": "consumer",
            "KYCFlag": pval ? pval : "nonKYC",
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
            "appliedOn": "consumer",
            "KYCFlag": pval ? pval : "nonKYC",
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
function updateLimit(e) {
    let type = $(e).attr("data-type");
    let maxGold = $("#" + type + "MaxGold").html();
    let maxSilver = $("#" + type + "MaxSilver").html();
    let minGold = $("#" + type + "MinGold").html();
    let minSilver = $("#" + type + "MinSilver").html();
    let txnLimitInSeconds = $("#" + type + "txnInterval").html();
    let noOfTxnInSeconds = $("#" + type + "notxnInterval").html();
    let maxAmtOfTxnInSeconds = $("#" + type + "Maxamthour").html();
    let maxAmtOfTxnInDay = $("#" + type + "MaxAmtOfTxnInDay").html();
    let maxAmtOfTxnInMonth = $("#" + type + "Maxamtmonth").html();
    let pval = $('input[name=kycFlag]:checked').val();
    let ttype = (type === "redeem") ? "redeemCash"  : type;
    var json = {
        "KYCFlag": pval ? pval : "nonKYC",
        "tType": ttype,
        "appliedOn": "consumer",
        "limitapplied": "common",
        "goldMax": maxGold,
        "goldMin": minGold,
        "silverMax": maxSilver,
        "silverMin": minSilver,

    }
    if (type === "redeem") {
        json.sellAfterBuyInterval = parseFloat($("#sellAfterBuyInterval").html()) * 60;
        json.sellToBankInterval = parseFloat($("#sellToBankInterval").html()) * 60;
        json.minBuyToSell = $("#minBuyToSell").html();
    }
    json.txnLimitInSeconds = parseFloat(txnLimitInSeconds) * 60;
    json.noOfTxnInSeconds = noOfTxnInSeconds;
    json.maxAmtOfTxnInSeconds = maxAmtOfTxnInSeconds;
    json.maxAmtOfTxnInDay = maxAmtOfTxnInDay;
    json.maxAmtOfTxnInMonth = maxAmtOfTxnInMonth;

    submitConfig(json, e, type);
}
function submitConfig(json, e, type) {
    var ctruID = $('#txtcTruid').val();
    if (ctruID && ctruID !== "") {
        json.cTruID = ctruID;
        json.limitapplied = "consumer";
        json.KYCFlag = "check";
    }
    txnCheck(function (status) {
        if (status == true) {
            $('#consumerConfLoader').css('display', 'block');
            $.ajax({
                "url": "/configuration/updateConsumerLimit", "method": "POST", data: json, success: function (a) {
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
function submitWalletConfig(json, e, type, jsonaccess) {
    var ctruID = $('#txtcTruid').val();
    if (ctruID && ctruID !== "") {
        json.cTruID = ctruID;
        json.limitapplied = "consumer";
        json.KYCFlag = "check";
        jsonaccess.cTruID = ctruID;
        jsonaccess.limitapplied = "consumer";
        jsonaccess.KYCFlag = "check";
    }

    txnCheck(function (status) {
        if (status == true) {
            $('#consumerConfLoader').css('display', 'block');
            $.ajax({
                "url": "/configuration/updateConsumerAccess", "method": "POST", contentType: "application/json",
                dataType: "json", data: JSON.stringify(jsonaccess), success: function (a) {

                    let data = a.body;
                    if (data.status == "200") {
                        $.ajax({
                            "url": "/configuration/updateWalletLimits", "method": "POST", data: json, success: function (a) {
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
function updatewalletlimit(e) {
    if ($('#walletAccess').html() != "Select") {

        let walletAccess = getvalfrominputbyid("walletAccess");
        let payByWallet = getvalfrominputbyid("payByWallet");
        let pval = $('input[name=kycFlag]:checked').val();
        let jsonWalletAcces = {
            "KYCFlag": pval ? pval : "nonKYC",
            "limitapplied": "common",
            "walletAccess": { status: walletAccess, message: $("#lblreasonwalletAccess").text() },
            "payByWallet": { status: payByWallet, message: $("#lblreasonpayByWallet").text() },
            "appliedOn": "consumer"
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
            "KYCFlag": pval ? pval : "nonKYC",
            "appliedOn": "consumer",
            "tType": "wallet",
            "limitapplied": "common",
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
            "KYCFlag": pval ? pval : "nonKYC",
            "limitapplied": "common",
            "walletToBank": { status: walletToBank, message: $("#lblreasonwallettobank").text() },
            "appliedOn": "consumer"
        }

        var min = $("#wallettobankMin").html();
        var max = $("#wallettobankMax").html();

        var txnLimitInSeconds = $("#wallettobanktxnInterval").html();
        var noOfTxnInSeconds = $("#wallettobanknotxnInterval").html();
        var maxAmtOfTxnInSeconds = $("#wallettobankMaxamthour").html();
        var maxAmtOfTxnInDay = $("#wallettobankMaxAmtOfTxnInDay").html();
        var maxAmtOfTxnInMonth = $("#wallettobankMaxamtmonth").html();
        var json = {
            "KYCFlag": pval ? pval : "nonKYC",
            "appliedOn": "consumer",
            "tType": "walletToBank",
            "limitapplied": "common",
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
            "KYCFlag": pval ? pval : "nonKYC",
            "limitapplied": "common",
            "redeemToWallet": { status: redeemToWallet, message: $("#lblreasonredeemToWallet").text() },
            "appliedOn": "consumer"
        }
        var ctruID = $('#txtcTruid').val();
        if (ctruID && ctruID !== "") {
            jsonredeemToWallet.cTruID = ctruID;
            jsonredeemToWallet.limitapplied = "consumer";
            jsonredeemToWallet.KYCFlag = "check";
        }
        txnCheck(function (status) {
            if (status == true) {
                $('#consumerConfLoader').css('display', 'block');
                $.ajax({
                    "url": "/configuration/updateConsumerAccess", "method": "POST", contentType: "application/json",
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
