var { machineId, machineIdSync } = require('node-machine-id');
let mHash = machineIdSync()
module.exports = {
mHash: "*"+mHash+"#" 
}
