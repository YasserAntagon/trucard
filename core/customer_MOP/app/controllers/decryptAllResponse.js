const { decryption } = require('../models/cipher');
const arrFieldToDecrypt = ["bankName", "IFSC", "custName"]
const maskToDecrypt = ["accountNo","upiaddress"]
module.exports = {
    respDecrypt: async function (obj) {
        try {

            // console.log("newState", getArray(obj)); 
            return getArray(obj);
            /*   return obj; */
        } catch (error) {
            return {}
        }
        function getArray(obj) {
            return new Promise(async (resolve, reject) => {
                var xyz = []
                for (var i = 0; i < obj.length; i++) {
                    /*    console.log("obj[index]", obj[index])  */
                    
                    var fVar = obj[i];
                    /*      console.log(fVar) */
                    await Object.keys(fVar).forEach(async (key, indexT) => {

                        if (!fVar[key]._id) {
                            /* fVar[key] = fVar[key]+indexT; */
                            if (arrFieldToDecrypt.includes(key.toString())) {
                                var enc = await decryption(fVar[key].toString())
                                fVar[key] = enc;
                            }                            
                            else {
                                fVar[key] = fVar[key].toString()
                            }
                            if (maskToDecrypt.includes(key.toString())) {
                                var enc = await decryption(fVar[key].toString())
                                fVar[key.toString()+"masked"] = replaceWithX(enc);                                
                            }
                        }
                        else {
                            fVar[key] = fVar[key];
                        }
                    });
                    xyz.push(fVar)
                    //   console.log("fVar", xyz)
                }
                resolve(xyz);
            })
        }
        function replaceWithX(str) {
            return str.replace(/.(?=.{4})/g, 'x');
        }
    }
}