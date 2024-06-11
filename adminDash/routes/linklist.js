var linkmake = require('./linkgen');

function linkgenerator(string){
    var linkgen=linkmake(string);
    return linkgen;
}
//var dataz = linkgenerator("The hell of debug");
//// console.log(dataz);
module.exports = linkgenerator;




