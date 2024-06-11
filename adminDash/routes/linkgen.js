var md5 = require('./crymatch');

function linker(string){
    var linkgen=md5(string);
    return linkgen;
}
module.exports = linker;