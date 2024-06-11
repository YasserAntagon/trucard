const mongoose = require('mongoose');
const Schema = mongoose.Schema,

    sr = { type: String, required: true },
    sru = { type: String, required: true, unique: true },
    s = { type: String },
    d = { type: Schema.Types.Decimal128 },
    date = { type: Date }; //date values
const myDB       = require("../dbCon/truCustCon");

var bankLogschema = new Schema({
    truID: sr,
    CRNNo: sr,
    createDate: { type: Date },
    invoice: sr,
    TranID: sru,
    Corp_ID: s,
    Maker_ID: s,
    Checker_ID: s,
    Approver_ID: s,
    Status: sr,
    Resp_cde:s,
    Error_Cde: s,
    Error_Desc: s,
    RefNo: s,
    channelpartnerrefno:s,
    RRN:s,
    UTRNo: s,
    PONum: s,
    Ben_Acct_No: s,
    Amount: s,
    charges: s,
    BenIFSC: s,
    Txn_Time: s,
    Mode_of_Pay: s,
    tType: { type: String, required: true, enum: ["redeemCash", "walletToBank"] },
});

// module.exports = mongoose.model('bankLog', bankLogschema);
var banklog;
try{
    // const myDB = mongoose.connection.useDb('truCust');
    banklog = myDB.model('bankLog', bankLogschema);
}
catch(ex)
{
    console.log("ddd",ex)
}

module.exports = banklog;  
