'use strict'
var request = require('request');
var conf = require("../config");
module.exports = {
    clientval : function (req, res, cb) {
        var clientID = req.body.clientID; 
        
        if (clientID && clientID.length == 8) {
            request.post({
                "headers": { "content-type": "application/json" },
                "url": conf.reqip + ":4121/api/checkClientExistOrNot",
                "body": JSON.stringify({ "crnno": clientID })
            }, (error, response, body) => {
                if (error) {
                    cb("Invalid Client Id..!!")
                }
                else if (response.statusCode === 200) {
                    var newclient = JSON.parse(body);
                    if (newclient.status == "1000") {
                        request.post({
                            "headers": { "content-type": "application/json" },
                            "url": conf.reqip + ":4112/api/checkconsumer",
                            "body": JSON.stringify({ "crnno": req.body.CRNNo })
                        }, (error, response, body) => {
                            if (error) {
                                cb("Invalid Consumer CRNNo")
                            }
                            else {
                                var consumernewjson = JSON.parse(body);
                                if (response.statusCode === 200) {
                                    if (consumernewjson.status == "1000") {
                                        cb("ok")
                                    } else {
                                        cb("Invalid Consumer CRNNo")
                                    }

                                }
                                else {
                                    cb("Invalid Consumer CRNNo")
                                }
                            }
                        })
                    }
                    else {
                        cb("Invalid Client Id..!!")
                    }
                }
                else {
                    cb("Invalid Client Id..!!")
                }
            })
        } else {
            cb("Invalid Client Id..!!")
        }
    }
}
