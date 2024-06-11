'use strict';
var crypto = require('crypto');
function md5(string) {
    var d = new Date();
    var date = d.getDate();
    var month = d.getMonth() + 1; // Since getMonth() returns month from 0-11 not 1-12
    var year = d.getFullYear();
    var newstring=string+"*" + date + "/" + month + "/" + year+"#"+string; 
    //// console.log(newstring); 
    return crypto.createHash('md5').update(newstring).digest('hex');
}
module.exports = md5;