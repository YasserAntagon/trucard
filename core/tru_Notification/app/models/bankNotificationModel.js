const mongoose = require('mongoose');
const Schema = mongoose.Schema,

    sr = { type: String, required: true },
    sru = { type: String, required: true, unique: true },
    s = { type: String },
    d = { type: Schema.Types.Decimal128 },
    date = { type: Date }; //date values
    
var bankalertschema = new Schema({
    alertId:sru,
    truID:s,
    alertDate:date,
    messageType:sr,
    amount:sr,
    UTRNumber:sr,
    senderIFSC:sr,
    senderAccountNumber:sr,
    senderAccountType:sr,
    senderName:sr,
    beneficiaryAccountType:sr,
    beneficiaryAccountNumber:sr,
    creditDate:sr,
    creditAccountNumber:sr,
    corporateCode:sr,
    clientCodeMaster:sr,
    senderInformation:s,
});

module.exports = mongoose.model('bankalerts', bankalertschema);
