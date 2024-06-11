var md5 = require('md5');
module.exports = (req, res, next) => { 
  var hashid = req.body.clientID; 
  let hashKey = md5(hashid); 
  var sha = require("../../sha");
  let Hash = req.headers.signature;
    let data = req.body,
      valArray = new Array(),
      nameArray = new Array();
    Object.keys(data).forEach(key => {
      valArray.push(data[key]);
      nameArray.push(key);
    });
    nameArray.sort();
    let inputString = "";
    for (let j = 0; j < nameArray.length; j++) {
      var element = nameArray[j];
      inputString += '~';
      inputString += element;
      inputString += '=';
      inputString += data[element];
    }
  
    inputString = inputString.substr(1);
    inputString += hashKey;
    var signHash = sha.hash(inputString); 
    if (Hash === signHash) {
      next();
    } else {
      res.status(400).json({ status: "400", message: "Invalid Request..!!" });
    } 

}