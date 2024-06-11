var prelogin = require('./preloginAdmin');
var linker = require('./linklist'); 
function linkiteration()
{
    var firstlink=prelogin.name;
    var i;
    var firstinstance=Array();
    var prelink=Array();
    var dictionary = {};
    for (i = 0; i < firstlink.length; i++) { 
        firstinstance = firstlink[i];   
        var key = firstinstance;
        //create new object
       dictionary[key] = linker(firstinstance);//set key1 
    }   
    return dictionary; 
}  
module.exports = linkiteration;  