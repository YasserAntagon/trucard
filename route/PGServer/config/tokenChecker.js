var config = require('./config');
module.exports = (req, res, next) => { 
   const tokens = req.headers['authorization']; 
   if (tokens) 
   {
      var token = tokens.replace(/^Bearer\s+/, "");
      if (token == config.txnQueueBearer) {
         next()
      }
      else {
         res.status(411).json({ status: "411", message: "Invalid Request..!!" });
      }
   }
   else {
      res.status(411).json({ status: "411", message: "Invalid Request..!!" });
   }
}
