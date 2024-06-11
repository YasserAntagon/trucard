let $Gen, editor; 
if ($("#ispgEnable").val() == "false") {
    editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
        mode: "javascript",
        theme: "dracula",
        readOnly: true,
        lineNumbers: true
    });
    editor.save();
}

$(document).ready(function () {
    if ($("#ispgEnable").val() === "false") {
        var globalFormula = `Client_Loading = (rate * clientPer) / 100\nCompany_Loading = (rate * truPer) / 100\nTxn_Charge = (rate * txnPer) / 100\nCompany_Brodcast_Rate = rate + Company_Loading + Txn_Charge\nClient_Brodcast_Rate = rate + Client_Loading + Txn_Charge\nTotal_Revenue_On_Txn = Client_Loading + Txn_Charge\nPartner_Commission = (Total_Revenue_On_Txn * pRevShare) / 100\nPartner_Commission = (Total_Revenue_On_Txn * aRevShare) / 100\nPartner_TDS_Deduction = (Partner_Commission * tdsPer) / 100\nPartner_TDS_Deduction = (Partner_Commission * tdsPer) / 100\nNet_Partner_Revenue = Partner_Commission - Partner_TDS_Deduction\nNet_Partner_Revenue = Partner_Commission - Partner_TDS_Deduction\nCompany_Revenue = (Total_Revenue_On_Txn * truRevShare) / 100`;
        editor.setValue(globalFormula);
        $('.hideAfterRendering').each(function () {
            $(this).removeClass('active')
        });
    }

    loadCharges("buy", "consumer")
});
function paymentClick() {    /// assetmanager to assetmanager transaction history
    var stype = $('#paylist').val();
    var pval = $('input[name=revenueFor]:checked').val();
    loadCharges(stype, pval);

}
function loadCharges(type, pval) {
    var rtruID = $('#txteTruid').val();
    $.ajax({
        "url": "/charges/getClientChargesRate", "method": "POST", data: {
            "rTruID": rtruID,
            "type": type,
            "appliedOn": pval
        }, success: function (a) {
            let res = a.body;
            $Gen = res.resource;
            $('.chargesLoader').fadeOut('slow');

            $("#txtRate").html(res.G24K ? res.G24K.baseAmount ? res.G24K.baseAmount : "0" : "0");
            $("#txtclientNetworkFee").html(res.resource ? res.resource.clientTrasactionCharges ? useToFixed(parseFloat(res.resource.clientTrasactionCharges) * 100) : useToFixed(parseFloat(res.resource.txnLoading) * 100) : "0");
            $("#txtNetworkFee").html(res.resource ? res.resource.txnLoading ? useToFixed(parseFloat(res.resource.txnLoading) * 100) : "0" : "0");
            $("#txttransactionFees").html(res.resource ? res.resource.transactionCharges ? useToFixed(parseFloat(res.resource.transactionCharges) * 100) : "0" : "0");
            $("#txtentityRevCharges").html(res.resource ? res.resource.partnerCharges ? useToFixed(parseFloat(res.resource.partnerCharges) * 100) : "0" : "0");
            $("#txttdscharges").html(res.resource ? res.resource.tdsPercentage ? useToFixed(parseFloat(res.resource.tdsPercentage) * 100) : "0" : "0");
            $("#txtRevenue").html(res.resource ? res.resource.partnerCharges ? useToFixed(100 - parseFloat(res.resource.partnerCharges) * 100) : "0" : "0");



            if ($("#txtclientNetworkFee").length > 0) {
                txtEditableConfCharges('txtclientNetworkFee', 'false', 'popup');
            }
            // txtEditableConfCharges('txtNetworkFee', 'true', 'popup');
            // txtEditableConfCharges('txttransactionFees', 'true', 'popup');
            if ($("#txtentityRevCharges").length > 0) {
                txtEditableConfCharges('txtentityRevCharges', 'false', 'popup');
            }
            if ($("#txttdscharges").length > 0) {
                txtEditableConfCharges('txttdscharges', 'false', 'popup');
            }
            if ($("#ispgEnable").val() === "false") {
                calculate();
            }
        }
    })
}

function txtEditableConfCharges(type, disabled, mode) {
    $('#' + type).editable({
        mode: mode ? mode : 'inline',
        disabled: (disabled && disabled === "false") ? false : true,
        type: 'number',
        step: 'any',
        validate: function (value) {
            if ($.trim(value) == '') {
                return 'This enter value';
            }
            else if ($.isNumeric(value) == '') {
                return 'Only number & decimal value are allowed';
            } else {
                setTimeout(() => {
                    calculate();
                }, 100);
            }
        },
    });
    $('#' + type).editable('setValue', $('#' + type).html().toLowerCase());
}
const useToFixed = function (value) {
    
    return parseFloat(value.toFixed(12));
}



function calculate() {
    var jsx = editor.getValue()
    var formula = jsx.trim().split('\n');
    $txtRate = $("#txtRate").html(); // AssetManager Rate
    $txtClientNetworkFee = $("#txtclientNetworkFee").html(); // Revenue Charges
    $txtNetworkFee = $("#txtNetworkFee").html(); // Revenue Charges
    $transactionFees = $("#txttransactionFees").html(); // Transaction Fees
    $ctax = $Gen.tax; // Tax Charges
    $txtentityRevCharges = $("#txtentityRevCharges").html(); // Partner Revenue
    $txttdscharges = $("#txttdscharges").html(); // Partner Revenue
    $txtRevenue = $("#txtRevenue").html(); //  Revenue
    var scope = { rate: $txtRate, txnPer: $transactionFees, truPer: $txtNetworkFee, clientPer: $txtClientNetworkFee, gst: $ctax, qty: 1, pRevShare: $txtentityRevCharges, truRevShare: $txtRevenue, tdsPer: $txttdscharges }
    var bd = "";
    var forLable = "";
    $("#broadcastResult").empty();
    for (var i = 0; i < formula.length; i++) {
        var x1 = formula[i].trim().toString().split("=")[0];
        var x = formula[i].toString().replace('rate', scope.rate).replace('txnPer', scope.txnPer).replace('truPer', scope.truPer).replace('clientPer', scope.clientPer).replace('gst', scope.gst).replace('pRevShare', scope.pRevShare).replace('aRevShare', scope.aRevShare).replace('truRevShare', scope.truRevShare).replace('tdsPer', scope.tdsPer);
        if (x1 == "broacastRate") {
            var fd = x.split("=")[1];
            var arr = Object.keys(scope);
            if (arr.broacastRate) {
                delete arr.broacastRate
            }
            var y = [fd];
            var updated_str_list = y.map(str => arr.reduce((updated_str, key) => updated_str.replace(`${key}`, scope[key]), str.trim()));
            x = "brodcastRate=" + updated_str_list;
            bd = (math.evaluate(x, scope));
        }
        else {
            bd = (math.evaluate(x, scope));
        }

        var fomulaArray = x.split("="); 
        var fg = '<span class="cm-value">' + fomulaArray[1].replace('/', "<span class='cm_operator'> / </span>")
            // .replace('=', "<span class='cm_operator'> = </span>")
            .replace('*', "<span class='cm_operator'> * </span>")
            .replace('(', "<span class='cm_operator'> ( </span>")
            .replace(')', "<span class='cm_operator'> ) </span>")
            .replace('+', "<span class='cm_operator'> + </span>")
            .replace('-', "<span class='cm_operator'> - </span>") + '</span>';

        forLable += '<p class="cm-value-Header">' + fomulaArray[0] + "<span class='cm_operator'> = </span>" + fg + '<span class="cm_operator"> = </span><span class="cm_help">' + decimalChopper(bd, 4) + '</span></p>';
    }
    $("#broadcastResult").append(forLable); 
}

function uploadRevenueLoading() {

    var rtruID = $('#txteTruid').val();
    var clientNetworkFee = $('#txtclientNetworkFee').html();
    var entityRevCharges = $('#txtentityRevCharges').html();
    var tdscharges = $('#txttdscharges').html();
    var appliedon = $('input[name=revenueFor]:checked').val();
    let isrevenueapplied = ($("#isrevenueapplied").prop("checked") == true) ? true : false;
    var json = {
        "eTruID": rtruID,
        "appliedOn": appliedon,
        "partnerCharges": parseFloat(entityRevCharges) / 100,
        "trasactionCharges": parseFloat(clientNetworkFee) / 100,
        "tdsPercentage": parseFloat(tdscharges) / 100,
        "isChargesSet": isrevenueapplied,
        "type": $('#paylist').val(),
        "promotionQTY": "0"
    }
    $('#consumerConfLoader').css("display", 'block');
    $.ajax({
        "url": "/entityAccess/updaterevenuepercent", "method": "POST", data: json, success: function (a) {
            $('#consumerConfLoader').fadeOut('slow');
            let res = a.body;
            $('#consumerConfLoader').fadeOut('slow');
            if (res.status == "200") {
                alertify.success("Revenue and Loading updated successfully");
            } else {
                alertify.success("Revenue and Loading not updated..!!");
            }
        }
    })
}