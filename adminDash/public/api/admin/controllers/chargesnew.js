var editor, editorTransfer, editorSell;
function loadFormula() {

    var globalFormula = `dlrCharge=(rate * dPer)/100\nassetstoreCharge=(rate * cPer)/100\nBaseRate=(rate + assetstoreCharge + dlrCharge)\ntxnFee=(BaseRate * tPer)/100\nCLoading=(BaseRate * tnPer)/100\nbroacastRate=BaseRate+(txnFee+CLoading)`;
    globalFormula += `\nsubTotal=(brodcastRate * qty)\ntotalGST=(subTotal * gst) / 100\nfinalTotal=(subTotal + totalGST)`;
    editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
        mode: "javascript",
        theme: "dracula",
        readOnly: true,
        lineNumbers: true
    });

    editor.setValue(globalFormula);
    editor.save();

    var globalFormulaTransfer = `dlrCharge=(rate * dPer)/100\nassetstoreCharge=(rate * cPer)/100\nBaseRate=(rate + assetstoreCharge + dlrCharge)\ntxnFee=(BaseRate * tPer)/100\nCLoading=(BaseRate * tnPer)/100\nbroacastRate=BaseRate+(txnFee+CLoading)`;
    globalFormulaTransfer += `\ntransferCharges=(BaseRate * transferFee)/100\ngst=(transferCharges * transferGST)/100\nPayableAmount=(transferCharges + gst)`;
    editorTransfer = CodeMirror.fromTextArea(document.getElementById('editorTransfer'), {
        mode: "javascript",
        theme: "dracula",
        readOnly: true,
        lineNumbers: true
    });

    editorTransfer.setValue(globalFormulaTransfer);
    editorTransfer.save();

    var globalFormulaSell = `dlrCharge=(srate * dPer)/100\nassetstoreCharge=(srate * cPer)/100\nBaseRate=(srate + assetstoreCharge + dlrCharge)\ntxnFee=(BaseRate * tPer)/100\nCLoading=(BaseRate * tnPer)/100\ngst=((txnFee+CLoading)* sellgst)/100\nbroacastRate=BaseRate-(txnFee+CLoading+gst)`;
    globalFormulaSell += `\nTotal=(brodcastRate * qty)`;
    editorSell = CodeMirror.fromTextArea(document.getElementById('editorSell'), {
        mode: "javascript",
        theme: "dracula",
        readOnly: true,
        lineNumbers: true
    });

    editorSell.setValue(globalFormulaSell);
    editorSell.save();
}




function calculate() {
    $assetmanager = $("#txtassetmanagerCharges").html(); // AssetManager Charges
    $txtRate = $("#txtRate").html(); // AssetManager Rate
    $txtNetworkFee = $("#txtNetworkFee").html(); // Revenue Charges
    $assetstorecharges = $("#txtassetstoreCharges").html(); // AssetStore Charges 
    $transactionFees = $("#txttransactionFees").html(); // Transaction Fees
    $ctax = $("#txtCTax").html(); // Tax Charges
    $stax = $("#txtSTax").html(); // Tax Charges
    $ttax = $("#txtTTax").html(); // Tax Charges
    $partnerCharges = $("#partnerCharges").html(); // Partner Revenue
    $txtCompanyShare = $("#txtCompanyShare").html(); //  Revenue 
    var jsx = editor.getValue()
    var formula = jsx.trim().split('\n');
    var scope = {
        rate: parseFloat($txtRate),
        dPer: parseFloat($assetmanager),
        cPer: parseFloat($assetstorecharges),
        tPer: parseFloat($transactionFees),
        tnPer: parseFloat($txtNetworkFee),
        gst: parseFloat($ctax),
        qty: 1,
        pRevShare: parseFloat($partnerCharges),
        truRevShare: parseFloat($txtCompanyShare),
        BaseRate: 0,
        assetstoreCharge: 0,
        dlrCharge: 0
    }
    var bd = "";
    var forLable = "";
    $("#broadcastResult").empty();
    for (var i = 0; i < 9; i++) {
        var x1 = formula[i].trim().toString().split("=")[0];
        var x = "";
        if (i > 5) {
            x = formula[i].toString().replace('totalGST', scope.totalGST).replace('subTotal', scope.subTotal).replace('txnFee', scope.txnFee).replace('Fee', scope.Fee).replace('qty', scope.qty);
        }
        else {
            x = formula[i].toString().replace('dPer', scope.dPer).replace('cPer', scope.cPer).replace('tPer', scope.tPer).replace('tnPer', scope.tnPer).replace('rate', scope.rate).replace('dlrCharge', scope.dlrCharge).replace('assetstoreCharge', scope.assetstoreCharge).replace('BaseRate', scope.BaseRate);
        }
        if (x1 == "broacastRate") {
            var fd = x.split("=")[1];
            var arr = Object.keys(scope);
            if (arr.broacastRate) {
                delete arr.broacastRate
            }
            var y = [fd];
            var updated_str_list = y.map(str => arr.reduce((updated_str, key) => updated_str.replace(`${key}`, scope[key]), str.trim()));
            x = "brodcastRate=" + updated_str_list;
            bd = math.evaluate(x, scope);
        }
        else if (x1 == "BaseRate") {
            var fd = x.split("=")[1];
            var arr = Object.keys(scope);
            if (arr.BaseRate) {
                delete arr.BaseRate
            }
            var y = [fd];
            var updated_str_list = y.map(str => arr.reduce((updated_str, key) => updated_str.replace(`${key}`, scope[key]), str.trim()));
            x = "BaseRate=" + updated_str_list;
            bd = math.evaluate(x, scope);
        }
        else if (x1 == "dlrCharge") {
            var fd = x.split("=")[1];
            var arr = Object.keys(scope);
            if (arr.dlrCharge) {
                delete arr.dlrCharge
            }
            var y = [fd];
            var updated_str_list = y.map(str => arr.reduce((updated_str, key) => updated_str.replace(`${key}`, scope[key]), str.trim()));
            x = "dlrCharge=" + updated_str_list;
            bd = math.evaluate(x, scope);
        }
        else if (x1 == "assetstoreCharge") {
            var fd = x.split("=")[1];
            var arr = Object.keys(scope);
            if (arr.assetstoreCharge) {
                delete arr.assetstoreCharge
            }
            var y = [fd];
            var updated_str_list = y.map(str => arr.reduce((updated_str, key) => updated_str.replace(`${key}`, scope[key]), str.trim()));
            x = "assetstoreCharge=" + updated_str_list;
            bd = math.evaluate(x, scope);
        }
        else if (x1 == "subTotal") {
            var fd = x.split("=")[1];
            var arr = Object.keys(scope);
            if (arr.subTotal) {
                delete arr.subTotal
            }
            var y = [fd];
            var updated_str_list = y.map(str => arr.reduce((updated_str, key) => updated_str.replace(`${key}`, scope[key]), str.trim()));
            x = "subTotal=" + updated_str_list;
            bd = math.evaluate(x, scope);
        }
        else if (x1 == "totalGST") {
            var fd = x.split("=")[1];
            var arr = Object.keys(scope);
            if (arr.totalGST) {
                delete arr.totalGST
            }
            var y = [fd];
            var updated_str_list = y.map(str => arr.reduce((updated_str, key) => updated_str.replace(`${key}`, scope[key]), str.trim()));
            x = "totalGST=" + updated_str_list;
            bd = math.evaluate(x, scope);
        }

        else if (x1 == "assetstoreCharge") {
            var fd = x.split("=")[1];
            var arr = Object.keys(scope);
            if (arr.assetstoreCharge) {
                delete arr.assetstoreCharge
            }
            var y = [fd];
            var updated_str_list = y.map(str => arr.reduce((updated_str, key) => updated_str.replace(`${key}`, scope[key]), str.trim()));
            x = "assetstoreCharge=" + updated_str_list;
            bd = math.evaluate(x, scope);
        }
        else {
            bd = math.evaluate(x, scope);
        }
        var fg = x.replace('/', "<span class='cm_operator'> / </span>").replace('=', "<span class='cm_operator'> = </span>").replace('*', "<span class='cm_operator'> * </span>").replace('+', "<span class='cm_operator'> + </span>").replace('-', "<span class='cm_operator'> - </span>")
        forLable += '<p class="cm-value">' + fg + '<span class="cm_operator"> = </span><span class="cm_help">' + decimalChopper(bd, 4) + '</span></p>'

    }
    $("#broadcastResult").append(forLable);
}

function calculateTransfer() {
    $assetmanager = $("#txtassetmanagerCharges").html(); // AssetManager Charges
    $txtRate = $("#txtRate").html(); // AssetManager Rate
    $txtNetworkFee = $("#txtNetworkFee").html(); // Revenue Charges
    $assetstorecharges = $("#txtassetstoreCharges").html(); // AssetStore Charges 
    $transactionFees = $("#txttransactionFees").html(); // Transaction Fees
    $ctax = $("#txtCTax").html(); // Tax Charges
    $stax = $("#txtSTax").html(); // Tax Charges
    $ttax = $("#txtTTax").html(); // Tax Charges
    $partnerCharges = $("#partnerCharges").html(); // Partner Revenue
    $txtCompanyShare = $("#txtCompanyShare").html(); //  Revenue 
    $txtTransferFee = $("#txtTransferFee").html(); //  Revenue 
    $txtPartnerCharges = $("#txtPartnerCharges").html(); //  Revenue 
    var jsx = editorTransfer.getValue()
    var formula = jsx.trim().split('\n');
    var scope = {
        rate: parseFloat($txtRate),
        dPer: parseFloat($assetmanager),
        cPer: parseFloat($assetstorecharges),
        tPer: parseFloat($transactionFees),
        tnPer: parseFloat($txtNetworkFee),
        transferGST: parseFloat($ttax),
        qty: 1,
        pRevShare: parseFloat($partnerCharges),
        truRevShare: parseFloat($txtCompanyShare),
        BaseRate: 0,
        assetstoreCharge: 0,
        transferFee: parseFloat($txtTransferFee),
        dlrCharge: 0
    }
    var bd = "";
    var forLable = "";
    $("#broadcastTransferResult").empty();
    for (var i = 0; i < 9; i++) {
        var x1 = formula[i].trim().toString().split("=")[0];
        var x = "";
        if (i > 5) {
            x = formula[i].toString().replace('gst', scope.gst).replace('transferFee', scope.transferFee).replace('txnFee', scope.txnFee).replace('Fee', scope.Fee).replace('qty', scope.qty);
        }
        else {
            x = formula[i].toString().replace('dPer', scope.dPer).replace('cPer', scope.cPer).replace('tPer', scope.tPer).replace('tnPer', scope.tnPer).replace('rate', scope.rate).replace('dlrCharge', scope.dlrCharge).replace('assetstoreCharge', scope.assetstoreCharge).replace('BaseRate', scope.BaseRate);
        }
        if (x1 == "broacastRate") {
            var fd = x.split("=")[1];
            var arr = Object.keys(scope);
            if (arr.broacastRate) {
                delete arr.broacastRate
            }
            var y = [fd];
            var updated_str_list = y.map(str => arr.reduce((updated_str, key) => updated_str.replace(`${key}`, scope[key]), str.trim()));
            x = "brodcastRate=" + updated_str_list;
            bd = math.evaluate(x, scope);
        }
        else if (x1 == "BaseRate") {
            var fd = x.split("=")[1];
            var arr = Object.keys(scope);
            if (arr.BaseRate) {
                delete arr.BaseRate
            }
            var y = [fd];
            var updated_str_list = y.map(str => arr.reduce((updated_str, key) => updated_str.replace(`${key}`, scope[key]), str.trim()));
            x = "BaseRate=" + updated_str_list;
            bd = math.evaluate(x, scope);
        }
        else if (x1 == "dlrCharge") {
            var fd = x.split("=")[1];
            var arr = Object.keys(scope);
            if (arr.dlrCharge) {
                delete arr.dlrCharge
            }
            var y = [fd];
            var updated_str_list = y.map(str => arr.reduce((updated_str, key) => updated_str.replace(`${key}`, scope[key]), str.trim()));
            x = "dlrCharge=" + updated_str_list;
            bd = math.evaluate(x, scope);
        }
        else if (x1 == "assetstoreCharge") {
            var fd = x.split("=")[1];
            var arr = Object.keys(scope);
            if (arr.assetstoreCharge) {
                delete arr.assetstoreCharge
            }
            var y = [fd];
            var updated_str_list = y.map(str => arr.reduce((updated_str, key) => updated_str.replace(`${key}`, scope[key]), str.trim()));
            x = "assetstoreCharge=" + updated_str_list;
            bd = math.evaluate(x, scope);
        }
        else if (x1 == "PayableAmount") {
            var fd = x.split("=")[1];
            var arr = Object.keys(scope);
            if (arr.PayableAmount) {
                delete arr.PayableAmount
            }
            var y = [fd];
            var updated_str_list = y.map(str => arr.reduce((updated_str, key) => updated_str.replace(`${key}`, scope[key]), str.trim()));
            x = "PayableAmount=" + updated_str_list;
            bd = math.evaluate(x, scope);
        }
        else if (x1 == "gst") {
            var fd = x.split("=")[1];
            var arr = Object.keys(scope);
            if (arr.gst) {
                delete arr.gst
            }
            var y = [fd];
            var updated_str_list = y.map(str => arr.reduce((updated_str, key) => updated_str.replace(`${key}`, scope[key]), str.trim()));
            x = "gst=" + updated_str_list;
            bd = math.evaluate(x, scope);
        }
        else if (x1 == "transferCharges") {
            var fd = x.split("=")[1];
            var arr = Object.keys(scope);
            if (arr.transferCharges) {
                delete arr.transferCharges
            }
            var y = [fd];
            var updated_str_list = y.map(str => arr.reduce((updated_str, key) => updated_str.replace(`${key}`, scope[key]), str.trim()));
            x = "transferCharges=" + updated_str_list;
            bd = math.evaluate(x, scope);
        }


        else if (x1 == "assetstoreCharge") {
            var fd = x.split("=")[1];
            var arr = Object.keys(scope);
            if (arr.assetstoreCharge) {
                delete arr.assetstoreCharge
            }
            var y = [fd];
            var updated_str_list = y.map(str => arr.reduce((updated_str, key) => updated_str.replace(`${key}`, scope[key]), str.trim()));
            x = "assetstoreCharge=" + updated_str_list;
            bd = math.evaluate(x, scope);
        }
        else {
            bd = math.evaluate(x, scope);
        }
        var fg = x.replace('/', "<span class='cm_operator'> / </span>").replace('=', "<span class='cm_operator'> = </span>").replace('*', "<span class='cm_operator'> * </span>").replace('+', "<span class='cm_operator'> + </span>").replace('-', "<span class='cm_operator'> - </span>")
        forLable += '<p class="cm-value">' + fg + '<span class="cm_operator"> = </span><span class="cm_help">' + decimalChopper(bd, 4) + '</span></p>'

    }

    $("#broadcastTransferResult").append(forLable);
}
function calculateSell() {
    $assetmanager = $("#txtassetmanagerCharges").html(); // AssetManager Charges
    $txtRate = $("#txtSRate").html(); // AssetManager Rate
    $txtNetworkFee = $("#txtNetworkFee").html(); // Revenue Charges
    $assetstorecharges = $("#txtassetstoreCharges").html(); // AssetStore Charges 
    $transactionFees = $("#txttransactionFees").html(); // Transaction Fees
    $ctax = $("#txtCTax").html(); // Tax Charges
    $stax = $("#txtSTax").html(); // Tax Charges
    $ttax = $("#txtTTax").html(); // Tax Charges
    $partnerCharges = $("#partnerCharges").html(); // Partner Revenue
    $txtCompanyShare = $("#txtCompanyShare").html(); //  Revenue 
    $txtPartnerCharges = $("#txtPartnerCharges").html(); //  Revenue 
    var jsx = editorSell.getValue();
    var formulaSell = jsx.trim().split('\n');
    var scope = {
        rate: parseFloat($txtRate),
        dPer: parseFloat($assetmanager),
        cPer: parseFloat($assetstorecharges),
        tPer: parseFloat($transactionFees),
        tnPer: parseFloat($txtNetworkFee),
        sellgst: parseFloat($stax),
        qty: 1,
        pRevShare: parseFloat($partnerCharges),
        truRevShare: parseFloat($txtCompanyShare),
        BaseRate: 0,
        assetstoreCharge: 0,
        dlrCharge: 0
    }
    var bd = "";
    var forLable = "";
    $("#broadcastSellResult").empty();
    for (var i = 0; i < 8; i++) {
        var x1 = formulaSell[i].trim().toString().split("=")[0];
        var x = "";
        if (i > 5) {
            x = formulaSell[i].toString().replace('totalGST', scope.totalGST).replace('subTotal', scope.subTotal).replace('txnFee', scope.txnFee).replace('Fee', scope.Fee).replace('qty', scope.qty);;
        }
        else {
            x = formulaSell[i].toString().replace('dPer', scope.dPer).replace('cPer', scope.cPer).replace('tPer', scope.tPer).replace('tnPer', scope.tnPer).replace('srate', scope.rate).replace('dlrCharge', scope.dlrCharge).replace('assetstoreCharge', scope.assetstoreCharge).replace('BaseRate', scope.BaseRate);
        }
        if (x1 == "broacastRate") {
            var fd = x.split("=")[1];
            var arr = Object.keys(scope);
            if (arr.broacastRate) {
                delete arr.broacastRate
            }
            var y = [fd];
            var updated_str_list = y.map(str => arr.reduce((updated_str, key) => updated_str.replace(`${key}`, scope[key]), str.trim()));
            x = "brodcastRate=" + updated_str_list;
            bd = math.evaluate(x, scope);
        }
        else if (x1 == "BaseRate") {
            var fd = x.split("=")[1];
            var arr = Object.keys(scope);
            if (arr.BaseRate) {
                delete arr.BaseRate
            }
            var y = [fd];
            var updated_str_list = y.map(str => arr.reduce((updated_str, key) => updated_str.replace(`${key}`, scope[key]), str.trim()));
            x = "BaseRate=" + updated_str_list;
            bd = math.evaluate(x, scope);
        }
        else if (x1 == "dlrCharge") {
            var fd = x.split("=")[1];
            var arr = Object.keys(scope);
            if (arr.dlrCharge) {
                delete arr.dlrCharge
            }
            var y = [fd];
            var updated_str_list = y.map(str => arr.reduce((updated_str, key) => updated_str.replace(`${key}`, scope[key]), str.trim()));
            x = "dlrCharge=" + updated_str_list;
            bd = math.evaluate(x, scope);
        }
        else if (x1 == "assetstoreCharge") {
            var fd = x.split("=")[1];
            var arr = Object.keys(scope);
            if (arr.assetstoreCharge) {
                delete arr.assetstoreCharge
            }
            var y = [fd];
            var updated_str_list = y.map(str => arr.reduce((updated_str, key) => updated_str.replace(`${key}`, scope[key]), str.trim()));
            x = "assetstoreCharge=" + updated_str_list;
            bd = math.evaluate(x, scope);
        }
        else if (x1 == "gst") {
            var fd = x.split("=")[1];
            var arr = Object.keys(scope);
            if (arr.gst) {
                delete arr.gst
            }
            var y = [fd];
            var updated_str_list = y.map(str => arr.reduce((updated_str, key) => updated_str.replace(`${key}`, scope[key]), str.trim()));
            x = "gst=" + updated_str_list;
            bd = math.evaluate(x, scope);
        }
        else if (x1 == "Total") {
            var fd = x.split("=")[1];
            var arr = Object.keys(scope);
            if (arr.subTotal) {
                delete arr.subTotal
            }
            var y = [fd];
            var updated_str_list = y.map(str => arr.reduce((updated_str, key) => updated_str.replace(`${key}`, scope[key]), str.trim()));
            x = "Total=" + updated_str_list;
            bd = math.evaluate(x, scope);
        }
        else if (x1 == "assetstoreCharge") {
            var fd = x.split("=")[1];
            var arr = Object.keys(scope);
            if (arr.assetstoreCharge) {
                delete arr.assetstoreCharge
            }
            var y = [fd];
            var updated_str_list = y.map(str => arr.reduce((updated_str, key) => updated_str.replace(`${key}`, scope[key]), str.trim()));
            x = "assetstoreCharge=" + updated_str_list;
            bd = math.evaluate(x, scope);
        }
        else {
            bd = math.evaluate(x, scope);
        }
        var fg = x.replace('/', "<span class='cm_operator'> / </span>").replace('=', "<span class='cm_operator'> = </span>").replace('*', "<span class='cm_operator'> * </span>").replace('+', "<span class='cm_operator'> + </span>").replace('-', "<span class='cm_operator'> - </span>")
        forLable += '<p class="cm-value">' + fg + '<span class="cm_operator"> = </span><span class="cm_help">' + decimalChopper(bd, 4) + '</span></p>'

    }
    $("#broadcastSellResult").append(forLable);
}

setTimeout(function () {
    calculate();
}, 500)
setTimeout(function () {
    calculateTransfer();
}, 500)
setTimeout(function () {
    calculateSell();
}, 500)
function decimalChopper(num, fixed) {

    if (num) {
        var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
        return num.toString().match(re)[0];
    }
    else {
        return 0
    }
}


setTimeout(() => {
    loadFormula()
}, 100)

function confirmCharges()  // save Charges 
{
    $trans = $("#txttransactionFees").html();  // Transaction Charges
    $assetmanager = $("#txtassetmanagerCharges").html(); // assetmanager Charges  
    $entityrev = $("#partnerCharges").html(); // Entity Charges
    $assetstorecharges = $("#txtassetstoreCharges").html(); // AssetStore Charges 
    $ctax = $("#txtCTax").html(); // Tax Charges
    $stax = $("#txtSTax").html(); // Tax Charges
    $ttax = $("#txtTTax").html(); // Tax Charges
    $RateAmount = $("#txtRate").text();
    $NetworkFee = $("#txtNetworkFee").text();
    $TransferFee = $("#txtTransferFee").text();
    $CompanyShare = $("#txtCompanyShare").text();
    $txtPartnerCharges = $("#txtPartnerCharges").html(); //  Revenue  
    if ($.trim($assetstorecharges) == '') {
        alertify.logPosition("bottom left");
        alertify.error("Please enter Asset Store Charges");
        return false;
    }
    if ($.trim($assetmanager) == '') {
        alertify.logPosition("bottom left");
        alertify.error("Please enter Asset Manager Charges");
        return false;
    }
    if ($.trim($trans) == '') {
        alertify.logPosition("bottom left");
        alertify.error("Please enter Transaction Charges");
        return false;
    }
    if ($.trim($NetworkFee) == '') {
        alertify.logPosition("bottom left");
        alertify.error("Please enter  Loading");
        return false;
    }
    if ($.trim($ctax) == '') {
        alertify.logPosition("bottom left");
        alertify.error("Please enter GST on Buy ");
        return false;
    }
    if ($.trim($stax) == '') {
        alertify.logPosition("bottom left");
        alertify.error("Please enter GST on Sell ");
        return false;
    }
    if ($.trim($ttax) == '') {
        alertify.logPosition("bottom left");
        alertify.error("Please enter GST on Transfer ");
        return false;
    }
    if ($.trim($TransferFee) == '') {
        alertify.logPosition("bottom left");
        alertify.error("Please enter Transfer Fee");
        return false;
    }

    if ($.trim($entityrev) == '') {
        alertify.logPosition("bottom left");
        alertify.error("Please enter Partner/Client sharing Charges");
        return false;
    }
 

    var json = {
        "assetmanagerCharges": parseFloat($.trim($assetmanager)) / 100,
        "assetstoreCharges": parseFloat($.trim($assetstorecharges)) / 100,
        "tax": parseFloat($.trim($ctax)) / 100,
        "gstOnTransferFee": parseFloat($.trim($ttax)) / 100,
        "sellTax": parseFloat($.trim($stax)) / 100,
        "entityCharges": 0,
        "transactionFees": parseFloat($.trim($trans)) / 100,
        "otherCharges": parseFloat($.trim($trans)) / 100,
        "transferFee": parseFloat($.trim($TransferFee)) / 100, 
        "partnerCharges": parseFloat($.trim($entityrev)) / 100,
        "txnLoading": parseFloat($.trim($NetworkFee)) / 100
    };
    swal({
        title: 'Are you sure ?',
        text: "You want to update charges..!!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, proceed it!',
        cancelButtonText: 'No, cancel!',
        confirmButtonClass: 'btn btn-sm btn-primary',
        cancelButtonClass: 'btn btn-sm btn-danger m-l-10',
        buttonsStyling: false
    }).then(function () {
        saveCharges(json)
    }, function (dismiss) {
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
function saveCharges(json)  // save Charges 
{

    txnCheck(function () {
        $('.chargesLoader').css('display', 'block');
        $.ajax({
            "url": "/charges/setChargesRate", "method": "POST", data: json, success: function (a) {
                let res = a.body;

                $('.chargesLoader').fadeOut('slow');
                if (res.status == 200) {
                    $("#btnSubmit").attr("disabled", "disabled");
                    alertify.logPosition("bottom left");
                    alertify.success('Charges Successfully Updated..!!');
                }
                else {
                    alertify.logPosition("bottom left");
                    alertify.error(res.message);
                }
            }
        });
    })


}

