var redisClient = require('../../redisClient');
module.exports = (req, res, next) => {
  const tokens = req.headers['authorization']
  // decode token
  if (tokens) {
    var token = tokens.replace(/^Bearer\s+/, "");
    
    redisClient.client.get(req.body.CRNNo, (err, result) => {
      if (result == token) {
        next();
      }
      else { 
        res.status(403).send({ status: "411", message: "Invalid token..!!" });
      }
    })
  } else {
    return res.status(403).send({ "status": "403", "message": 'No token provided.' });
  }
}