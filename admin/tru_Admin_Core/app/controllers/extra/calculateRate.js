

'use strict';
module.exports.calculateRate = function (Gen, grossamount, transactiontype, clienttrasactionCharges) {

    var clientChargePer = clienttrasactionCharges ? parseFloat(clienttrasactionCharges) : 0;


    var assetmanagercharges = useToFixed(grossamount * Gen.assetmanagercharges);      //assetmanagersCharges applied on base rate amount.
    var assetstoreCharges = useToFixed(grossamount * Gen.assetstoreCharges);       //otherCharges applied on base rate amount.
    var baseAmt = useToFixed(parseFloat(grossamount) + assetmanagercharges + assetstoreCharges);
    var transctionCharges = useToFixed(baseAmt * Gen.transactionCharges);       //otherCharges applied on base rate amount.
    var txnLoading = clientChargePer === 0 ? useToFixed(baseAmt * Gen.txnLoading) : 0;       //otherCharges applied on base rate amount.
    var clientCharge = txnLoading == 0 ? useToFixed(parseFloat(baseAmt) * clientChargePer) : 0;

    if (transactiontype == "redeemCash" || transactiontype == "sellCash" || transactiontype == "sell") {
        var sellTax = useToFixed((transctionCharges + clientCharge + txnLoading) * Gen.sellTax);
        netrate = useToFixed(baseAmt - useToFixed(transctionCharges + clientCharge + txnLoading + sellTax));
    } else {
        var netrate = useToFixed(parseFloat(baseAmt) + (transctionCharges + clientCharge + txnLoading));
    }
    return {
        netrate: netrate,
        baseAmount: baseAmt
    };
}