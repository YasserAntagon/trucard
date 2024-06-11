var request = require('request');
var conf = require("../config");
var reqip = conf.reqip;
var redisClient = require('../../redisClient');
function updateToken(req) {
  redisClient.client.del(req.body.CRNNo);
}
module.exports = updateToken;