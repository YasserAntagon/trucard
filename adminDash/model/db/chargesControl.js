
var editable = function () { 
    $('#txttransactionFees').editable({
        type: 'text',
        title: 'Enter Transaction Fee',
        validate: function (value) {
            if ($.trim(value) == '') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Only number & decimal value are allowed';
            }
            if (parseFloat($.trim(value)) > 99) {
                return 'please enter valid charges';
            }
            $("#txttransactionFees").html($.trim(value));
            calculateCheck();
        }
    });
    $('#txtassetstoreCharges').editable({
        type: 'text',
        title: 'Enter AssetStore Charges',
        validate: function (value) {
            if ($.trim(value) == '') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Only number & decimal value are allowed';
            }
            if (parseFloat($.trim(value)) > 99) {
                return 'please enter valid charges';
            }
            $("#txtassetstoreCharges").html($.trim(value));
            calculateCheck();
        }
    });
    $('#txtassetmanagerCharges').editable({
        type: 'text',
        title: 'Enter AssetManager Charges',
        validate: function (value) {
            if ($.trim(value) == '') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Only number & decimal value are allowed';
            }
            if (parseFloat($.trim(value)) > 99) {
                return 'please enter valid charges';
            }
            $("#txtassetmanagerCharges").html($.trim(value))
            calculateCheck();
        }
    });
    $('#partnerCharges').editable({
        type: 'text',
        title: 'Enter Client Sharing Charges in  %',
        validate: function (value) {
            if ($.trim(value) == '') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Only number & decimal value are allowed';
            }
            if (parseFloat($.trim(value)) > 99) {
                return 'please enter valid charges';
            }
            $("#txtCompanyShare").html("0")
            var ptcharges = parseFloat($.trim(value)); 
            var fCTotal = 100 - ptcharges;
            if (fCTotal < 0) {
                $("#txtPartnerCharges").html("0")
            }
            else if ((ptcharges + fCTotal) == 100) {
                $("#partnerCharges").html($.trim(value))
                $("#txtCompanyShare").html(fCTotal)
                calculateCheck();
            }
            else {
                return 'please enter valid charges';
            }


        }
    }); 
    $('#txtCTax').editable({
        type: 'text',
        title: 'Enter Tax',
        validate: function (value) {
            if ($.trim(value) == '') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Only number & decimal value are allowed';
            }
            if (parseFloat($.trim(value)) > 99) {
                return 'please enter valid taxes';
            }
            $("#txtCTax").html($.trim(value))
            calculateCheck();
        }
    });
    $('#txtSTax').editable({
        type: 'text',
        title: 'Enter Tax',
        validate: function (value) {
            if ($.trim(value) == '') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Only number & decimal value are allowed';
            }
            if (parseFloat($.trim(value)) > 99) {
                return 'please enter valid taxes';
            }
            $("#txtSTax").html($.trim(value))
            calculateCheck();
        }
    });
    $('#txtTTax').editable({
        type: 'text',
        title: 'Enter Tax',
        validate: function (value) {
            if ($.trim(value) == '') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Only number & decimal value are allowed';
            }
            if (parseFloat($.trim(value)) > 99) {
                return 'please enter valid taxes';
            }
            $("#txtTTax").html($.trim(value))
            calculateCheck();
        }
    });
    $('#txtNetworkFee').editable({
        type: 'text',
        title: 'Enter Tax',
        validate: function (value) {
            if ($.trim(value) == '') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Only number & decimal value are allowed';
            }
            if (parseFloat($.trim(value)) > 99) {
                return 'please enter valid loading';
            }
            $("#txtNetworkFee").html($.trim(value))
            calculateCheck();
        }
    });
    $('#txtTransferFee').editable({
        type: 'text',
        title: 'Enter Tax',
        validate: function (value) {
            if ($.trim(value) == '') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Only number & decimal value are allowed';
            }
            if (parseFloat($.trim(value)) > 99) {
                return 'please enter valid Transfer Fee';
            }
            $("#txtTransferFee").html($.trim(value))
            calculateCheck();
        }
    });
    $('#txtTransferFee').editable({
        type: 'text',
        title: 'Enter Tax',
        validate: function (value) {
            if ($.trim(value) == '') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Only number & decimal value are allowed';
            }
            if (parseFloat($.trim(value)) > 99) {
                return 'please enter valid Transfer Fee';
            }
            $("#txtTransferFee").html($.trim(value)) 
            $("#btnSubmit").removeAttr("disabled");
        }
    }); 
}
function bindTable() {
    $("#txnTable tbody").empty()
    var assetmanagerCharge = `<tr>
        <td width="80%">AssetManager Charges :</td>
        <td width="80%"><a href="#" id="txtassetmanagerCharges" data-type="text" data-pk="1"
            data-title="Enter AssetManager Charges" class="editable editable-click editable-disabled"
            data-original-title="" title="">0.5</a> %</td>
            <td class="text text-success">dPer</td>
      </tr>`; 
    var txnTypeTable = `<tr>
         <td width="80%"> Buy Rate :
           <br><small class="text-warning">( buy base rate for calculation)</small></td>
         <td width="80%">₹ <a href="#" id="txtRate" data-type="text" data-pk="1"
             data-title="Base Rate"
             class="editable editable-click editable-disabled" data-original-title=""
             title="">0</a></td>
             <td class="text text-success">rate</td>
       </tr>
       <tr>
         <td width="80%"> Sell Rate :
           <br><small class="text-warning">( sell base rate for calculation)</small></td>
         <td width="80%">₹ <a href="#" id="txtSRate" data-type="text" data-pk="1"
             data-title="Base Rate"
             class="editable editable-click editable-disabled" data-original-title=""
             title="">0</a></td>
             <td class="text text-success">srate</td>
       </tr>
       <tr>
         <td width="80%">AssetStore Charges :
         </td>
         <td width="80%">
           <a href="#" id="txtassetstoreCharges" data-type="text" data-pk="1"
             data-title="Enter AssetStore Charges"
             class="editable editable-click editable-disabled" data-original-title=""
             onkeypress="isNumberKey(event)" title="">0.1</a> %</td>
         <td class="text text-success">cPer</td>
       </tr>
       `+ assetmanagerCharge + `
       <tr>
         <td width="80%">Transaction Charges :<br><small class="text-warning">(Sharable with client)</small></td>
         <td width="80%"><a href="#" id="txttransactionFees" data-type="text" data-pk="1"
             data-title="Enter Network fee"
             class="editable editable-click editable-disabled" data-original-title=""
             title="">0.5</a> %
         </td>
         <td class="text text-success">tPer</td>
       </tr> 
       <tr>
         <td width="80%"> Loading (Network Fee) :
           <br><small class="text-warning">(non sharable with client and not applicable on client)</small></td>
         <td width="80%"><a href="#" id="txtNetworkFee" data-type="text" data-pk="1"
             data-title="Enter  Loading"
             class="editable editable-click editable-disabled" data-original-title=""
             title="">1</a> %
         </td>
         <td class="text text-success">tnPer</td>
       </tr><tr>
       <td width="80%">Buy GST %</td>
       <td width="80%"><a href="#" id="txtCTax" data-type="text" data-pk="1" data-title="Enter GST"
           class="editable editable-click editable-disabled" data-original-title="" title="">3</a>
         %</td>
         <td class="text text-success">gst</td>
     </tr>  
     <tr>
       <td width="80%">Transfer Fee %
       <br><small class="text-warning">(applicable on transaction fee + Company / client Loading)</small>
       </td>
       <td width="80%"><a href="#" id="txtTransferFee" data-type="text" data-pk="1" data-title="Enter Transfer Fee %"
           class="editable editable-click editable-disabled" data-original-title="" title="">0.5</a>
         %</td>
         <td class="text text-success">transferfee</td>
     </tr><tr>
       <td width="80%">Transfer GST %
       <br><small class="text-warning">(applicable on transaction fee + Company / client Loading)</small>
       </td>
       <td width="80%"><a href="#" id="txtTTax" data-type="text" data-pk="1" data-title="Enter GST %"
           class="editable editable-click editable-disabled" data-original-title="" title="">18</a>
         %</td>
         <td class="text text-success">transferGST</td>
     </tr>`;

    $("#txnTable tbody").append(txnTypeTable)
    editable()
}


function bindchargesData() {
    var json = {
        "limit": "1",
        "type": "c2d"
    };
    $('.chargesLoader').css('display', 'block');
    $.ajax({
        "url": "/charges/getChargesRate", "method": "POST", data: json, success: function (a) {
            let res = a.body;
            $('.chargesLoader').fadeOut('slow');
            if (res.status == 200) {
                if (res.resource.length > 0) {
                    $assetstoreCharges = res.resource[0].assetstoreCharges ? parseFloat(res.resource[0].assetstoreCharges) * 100 : 0;  // Transaction Charges
                    $trans = res.resource[0].otherCharges ? parseFloat(res.resource[0].otherCharges) * 100 : 0;  // Transaction Charges
                    $assetmanager = res.resource[0].assetmanagerCharges ? parseFloat(res.resource[0].assetmanagerCharges) * 100 : 0; // assetmanager Charges
                    $entity = res.resource[0].entitycharges ? parseFloat(res.resource[0].entitycharges) * 100 : 0;// Entity Charges
                    $partnerCharges = res.resource[0].partnerCharges ? parseFloat(res.resource[0].partnerCharges) * 100 : 0;// Entity Revenue Charges
                    $ctax = res.resource[0].tax ? parseFloat(res.resource[0].tax) * 100 : 0; // Tax Charges
                    $txtSTax = res.resource[0].sellTax ? parseFloat(res.resource[0].sellTax) * 100 : 0; // Tax Charges
                    $txtTTax = res.resource[0].gstOnTransferFee ? parseFloat(res.resource[0].gstOnTransferFee) * 100 : 0; // Tax Charges
                    $serviceTax = res.resource[0].serviceTax ? parseFloat(res.resource[0].serviceTax) * 100 : 0;
                    $NEFTcharges = res.resource[0].NEFTcharges ? parseFloat(res.resource[0].NEFTcharges) : 0;
                    $IMPScharges = res.resource[0].IMPScharges ? parseFloat(res.resource[0].IMPScharges) : 0;
                    $RTGScharge = res.resource[0].RTGScharge ? parseFloat(res.resource[0].RTGScharge) : 0;

                    $slabAmt = res.resource[0].slabAmt ? parseFloat(res.resource[0].slabAmt) : 0;
                    $IMPScharges1 = res.resource[0].IMPScharges1 ? parseFloat(res.resource[0].IMPScharges1) : 0;

                    $CompanyLoading = res.resource[0].txnLoading ? parseFloat(res.resource[0].txnLoading) * 100 : 0;
                    $transferFee = res.resource[0].transferFee ? parseFloat(res.resource[0].transferFee) * 100 : 0;
                    

                    $("#txtassetstoreCharges").html($assetstoreCharges);
                    $("#txtassetmanagerCharges").html($assetmanager);
                    $("#txtotherCharges").html($trans);
                    $("#partnerCharges").html($partnerCharges); 
                    $("#txtCTax").html($ctax);
                    $("#txtSTax").html($txtSTax);
                    $("#txtTTax").html($txtTTax);
                    $("#txtserviceTax").html($serviceTax);
                    $("#txtimpscharge").html($IMPScharges);
                    $("#slabAmt").html($slabAmt);
                    $("#IMPSCharge1").html($IMPScharges1);
                    $("#txtneftcharge").html($NEFTcharges);
                    $("#txtrtgscharge").html($RTGScharge);
                    $("#txtNetworkFee").html($CompanyLoading);
                    var charges = 100 - parseFloat($partnerCharges)
                    $("#txtCompanyShare").html(charges);
                    $("#txtTransferFee").html($transferFee);
                }

                editable();
            }
        }
    });
}
bindTable("buy");

function bindRateData(amTruID) {
    var json = { "amTruID": amTruID };
    $('.chargesLoader').css('display', 'block');
    $.ajax({
        "url": "/LBMA/getLiveRateByAdmin", "method": "POST", data: json, success: function (a) {
            let res = a.body;
            $('.chargesLoader').fadeOut('slow');
            if (res.status == 200) {
                $txtGoldRate = res.resource.G24Kgross ? parseFloat(res.resource.G24Kgross) : 0;  // Transaction Charges
                $txtSilverRate = res.resource.S99Pgross ? parseFloat(res.resource.S99Pgross) : 0; // assetmanager Charges
                $txtSGoldRate = res.resource.G24KSalegross ? parseFloat(res.resource.G24KSalegross) : 0;  // Transaction Charges
                $txtSSilverRate = res.resource.S99PSalegross ? parseFloat(res.resource.S99PSalegross) : 0; // assetmanager Charges

                $("#txtRate").html($txtGoldRate);
                $("#txtSRate").html($txtSGoldRate);
                bindchargesData(); 
            }
        }
    });
}

function bindAssetManager() {
    let json = {
        "KYCFlag": "active"
    }
    $.ajax({
        "url": "/assetmanagerList/getassetmanagerList", "method": "POST", data: json, success: function (a) {
            var buyArr = a.body;
            if (buyArr) { 
                bindRateData(buyArr[0].truID)
            }
        }
    });
}
setTimeout(function () {
    bindAssetManager();
}, 100)

function calculateCheck() {
    $("#btnSubmit").removeAttr("disabled");
    setTimeout(function () {
        calculate();
    }, 100)
    setTimeout(function () {
        calculateTransfer();
    }, 100)
    setTimeout(function () {
        calculateSell();
    }, 100)
}