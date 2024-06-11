
$(document).ready(function () {

    $('input[type=radio][name=demoBuy]').change(function () {
        bindTable();
    });
    $('input[type=radio][name=demoSell]').change(function () {
        bindTable();
    });
});



function bindTable() {
    var demoBuy = $('input[name=demoBuy]:checked').val();
    if (demoBuy == "G24K") {
        $txtRate = $("#txtGoldRate").html();// AssetManager Rate
    }
    else {
        $txtRate = $("#txtSilverRate").html();// AssetManager Rate
    }
    var demoSell = $('input[name=demoSell]:checked').val();
    if (demoSell == "G24K") {
        $txtSRate = $("#txtSGoldRate").html();// AssetManager Rate
    }
    else {
        $txtSRate = $("#txtSSilverRate").html();// AssetManager Rate
    }
    $assetmanager = $("#txtassetmanagerCharges").html(); // AssetManager Charges
    $txtNetworkFee = $("#txtNetworkFee").html(); // Revenue Charges
    $assetstorecharges = $("#txtassetstoreCharges").html(); // AssetStore Charges 
    $transactionFees = $("#txttransactionFees").html(); // Transaction Fees
    $ctax = $("#txtCTax").html(); // Tax Charges
    $stax = $("#txtSTax").html(); // Tax Charges
    $ttax = $("#txtTTax").html(); // Tax Charges
    $partnerCharges = $("#partnerCharges").html(); // Partner Revenue
    $txtCompanyShare = $("#txtCompanyShare").html(); // MePay Revenue 
    $txtPartnerCharges = $("#txtPartnerCharges").html(); // MePay Revenue   

    //Buy
    var dlrCharge = (parseFloat($txtRate) * parseFloat($assetmanager)) / 100;
    var dlrChargeStr = parseFloat($txtRate) + ` * ` + parseFloat($assetmanager) + `% = ` + decimalChopper(dlrCharge, 4);

    var custo = (parseFloat($txtRate) * parseFloat($assetstorecharges)) / 100;
    var custoStr = parseFloat($txtRate) + ` * ` + parseFloat($assetstorecharges) + `% = ` + decimalChopper(custo, 4);

    var baseRateC = parseFloat($txtRate) + custo + dlrCharge;
    var baseRateStr = parseFloat($txtRate) + ` + ` + custo + ` + ` + dlrCharge + ` = ` + decimalChopper(baseRateC, 4);

    var txnCharge = (baseRateC * parseFloat($transactionFees)) / 100;
    var txnChargeStr = baseRateC + ` * ` + parseFloat($transactionFees) + `% = ` + decimalChopper(txnCharge, 4);

    var nwFee = (baseRateC * parseFloat($txtNetworkFee)) / 100;
    var nwFeeStr = baseRateC + ` * ` + parseFloat($txtNetworkFee) + `% = ` + decimalChopper(nwFee, 4);

    var buyC = baseRateC + txnCharge + nwFee;
    var buyStr = baseRateC + ` + ` + txnCharge + ` + ` + nwFee;


    //Sell
    var sdlrCharge = (parseFloat($txtSRate) * parseFloat($assetmanager)) / 100;
    var sdlrChargeStr = parseFloat($txtSRate) + ` * ` + parseFloat($assetmanager) + `% = ` + decimalChopper(sdlrCharge, 4);

    var scusto = (parseFloat($txtSRate) * parseFloat($assetstorecharges)) / 100;
    var scustoStr = parseFloat($txtSRate) + ` * ` + parseFloat($assetstorecharges) + `% = ` + decimalChopper(scusto, 4);

    var sbaseRateC = parseFloat($txtSRate) + scusto + sdlrCharge;
    var sbaseRateStr = parseFloat($txtSRate) + ` + ` + scusto + ` + ` + sdlrCharge + ` = ` + decimalChopper(sbaseRateC, 4);

    var stxnCharge = (sbaseRateC * parseFloat($transactionFees)) / 100;
    var stxnChargeStr = sbaseRateC + ` * ` + parseFloat($transactionFees) + `% = ` + decimalChopper(stxnCharge, 4);

    var snwFee = (sbaseRateC * parseFloat($txtNetworkFee)) / 100;
    var snwFeeStr = sbaseRateC + ` * ` + parseFloat($txtNetworkFee) + `% = ` + decimalChopper(snwFee, 4);

    var sellGSTC = ((stxnCharge + snwFee) * parseFloat($stax)) / 100;
    var sellGSTStr = `( ` + stxnCharge + ` + ` + snwFee + ` ) * ` + parseFloat($stax) + `% = ` + decimalChopper(sellGSTC, 4);

    var sellC = sbaseRateC - (stxnCharge + snwFee + sellGSTC);
    var sellStr = sbaseRateC + ` - (` + stxnCharge + ` + ` + snwFee + ` + ` + sellGSTC + ` )`;


    $("#txnTable tbody").empty()
    var assetmanagerCharge = `<tr>
    <td width="40%">AssetManager Charges : (<a href="#" id="txtassetmanagerCharges" data-type="text" data-pk="1"
    data-title="Enter AssetManager Charges" class="editable editable-click editable-disabled"
    data-original-title="" title="">`+ $assetmanager + `</a> %) </td> 
        <td class="borderRight" width="30%">`+ dlrChargeStr + `</td>
        <td class="borderRight" width="30%">`+ sdlrChargeStr + `</td>
  </tr>`;
    var baseRate = `<tr>
  <td width="40%">Base Rate : </td> 
<td class="borderRight" width="30%">`+ baseRateStr + `</td>
<td class="borderRight" width="30%">`+ sbaseRateStr + `</td>
</tr>`;
    var txnTypeTable = `
   <tr>
     <td width="40%">AssetStore Charges :(
        <a href="#" id="txtassetstoreCharges" data-type="text" data-pk="1"
          data-title="Enter AssetStore Charges"
          class="editable editable-click editable-disabled" data-original-title=""
          onkeypress="isNumberKey(event)" title="">`+ $assetstorecharges + `</a> %)
     </td> 
     <td class="borderRight" width="30%">`+ custoStr + `</td>
     <td class="borderRight" width="30%">`+ scustoStr + `</td> 
   </tr>
   `+ assetmanagerCharge + baseRate + `
   <tr>
     <td width="40%">Transaction Charges :(<a href="#" id="txttransactionFees" data-type="text" data-pk="1"
     data-title="Enter Network fee"
     class="editable editable-click editable-disabled" data-original-title=""
     title="">`+ $transactionFees + `</a> %)<br><small class="text-warning">(Sharable with client)</small></td> 
     <td class="borderRight" width="30%">`+ txnChargeStr + `</td>
     <td class="borderRight" width="30%">`+ stxnChargeStr + `</td>
   </tr> 
   <tr>
     <td width="40%">Company / Client Loading (Network Fee) (<a href="#" id="txtNetworkFee" data-type="text" data-pk="1"
     data-title="Enter  Loading"
     class="editable editable-click editable-disabled" data-original-title="" title="">`+ $txtNetworkFee + `</a> %) :
       <br><small class="text-warning">(Sharable with client)</small></td> 
     <td class="borderRight" width="30%">`+ nwFeeStr + `</td>
     <td class="borderRight" width="30%">`+ snwFeeStr + `</td>
   </tr>
   <tr>
 <td width="40%">GST <small class="text-warning">(Including GST <a href="#" id="txtSTax" data-type="text" data-pk="1" data-title="Enter GST %"
 class="editable editable-click editable-disabled" data-original-title="" title="">`+ $stax + `</a> %)</small>
 </td> 
   <td class="borderRight" width="30%">-</td>
   <td class="borderRight" width="30%">`+ sellGSTStr + `</td>
</tr>
   <tr  style="border: 2pt solid black">
   <td width="40%"><h4  class='text-warning'>BroadCast Rate</h4></td> 
     <td class="borderRight" width="30%">`+ buyStr + ` <br/><span class='text-danger' style="font-Size:18px;font-weight:bold">= ` + decimalChopper(buyC, 4) + `</span></td>
     <td class="borderRight" width="30%">`+ sellStr + ` <br/><span class='text-danger' style="font-Size:18px;font-weight:bold">= ` + decimalChopper(sellC, 4) + `</span></td>
 </tr>
 `;
    $("#txnTable tbody").append(txnTypeTable);
    editable();
}


function decimalChopper(num, fixed) {

    if (num) {
        var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
        return num.toString().match(re)[0];
    }
    else {
        return 0
    }
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
                    $trans = res.resource[0].otherCharges ? parseFloat(res.resource[0].otherCharges) * 100 : 0;  // Transaction Charges

                    $assetstoreCharges = res.resource[0].assetstoreCharges ? parseFloat(res.resource[0].assetstoreCharges) * 100 : 0;  // Transaction Charges
                    $assetmanager = res.resource[0].assetmanagerCharges ? parseFloat(res.resource[0].assetmanagerCharges) * 100 : 0; // assetmanager Charges
                    $entity = res.resource[0].entitycharges ? parseFloat(res.resource[0].entitycharges) * 100 : 0;// Entity Charges
                    $partnerCharges = res.resource[0].partnerCharges ? parseFloat(res.resource[0].partnerCharges) * 100 : 0;// Entity Revenue Charges
                     $ctax = res.resource[0].tax ? parseFloat(res.resource[0].tax) * 100 : 3; // Tax Charges
                    $txtSTax = res.resource[0].sellTax ? parseFloat(res.resource[0].sellTax) * 100 : 0; // Tax Charges
                    $txtTTax = res.resource[0].gstOnTransferFee ? parseFloat(res.resource[0].gstOnTransferFee) * 100 : 0; // Tax Charges

                    $CompanyLoading = res.resource[0].txnCompanyLoading ? parseFloat(res.resource[0].txnCompanyLoading) * 100 : 0;
                    $transferFee = res.resource[0].transferFee ? parseFloat(res.resource[0].transferFee) * 100 : 0;

                    $("#txtassetstoreCharges").html($assetstoreCharges);
                    $("#txttransactionFees").html($trans);
                    $("#txtassetmanagerCharges").html($assetmanager);
                    $("#txtotherCharges").html($trans);
                    $("#partnerCharges").html($partnerCharges); 
                    $("#txtCTax").html($ctax);
                    $("#txtSTax").html($txtSTax);
                    $("#txtTTax").html($txtTTax);
                    $("#txtNetworkFee").html($CompanyLoading);
                    var charges = 100 - parseFloat($partnerCharges)
                    $("#txtCompanyShare").html(charges);
                    $("#txtTransferFee").html($transferFee);
                    setTimeout(function(){
                        bindTable("buy");
                    },500)
                }
                else {

                    editable();
                }
            } else {

                editable();
            }
        }
    });
}
bindTable("buy");
$(function () {
  
    bindchargesData()
});
