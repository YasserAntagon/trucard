const express = require('express'); 
const app = express();
const morgan = require('morgan');
const helmet = require('helmet'); 
const http = require('http'); 
const crypto = require('crypto');
const ipdenied = require('./app/ipdenied');
const { Server } = require('socket.io');

const { QR_addUser, QR_getUser, QR_removeUser, QR_Verify, QR_addUserBusiness, QR_getUserBusiness } = require('./app/QRCodes')
//app.use(ipdenied);

app.use(morgan('dev'));

app.use(helmet.hidePoweredBy({ setTo: 'TruAPI' }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


var port = process.env.PORT || 3111;

var router = express.Router();

router.use(function (req, res, next) {
  console.log('Route Activates and Activity Logged.');
  next();
});

var kycroutes = require('./app/routes/route');
kycroutes(app);

var server = http.createServer(app);
const io = new Server(server,{
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connect', (socket) => {
  socket.on('join', ({ QRCode, truID, etruID }, callback) => {
    var room = crypto.createHash('md5').update((etruID).toString()).digest("hex");
    const { error, user } = QR_addUser({ id: socket.id, QRCode: QRCode, truID: truID, room: room });
    console.log("user", user)
    console.log("error", error)
    if (error) return callback(error);

    socket.join(user.room);

    callback();
  });

  socket.on('verifyQR', (truID, code, hash, callback) => {
    let user;
    let verify;
    if (hash == "D23W") {
      user = QR_getUserBusiness(code);
      verify = QR_Verify(code)
    }
    /*     else if(hash == "ent"){}
        else if(hash == "dlr"){}
        else if(hash == "str"){}
        else if(hash == "ext"){} */
    else {
      user = QR_getUser(truID, code);
      verify = QR_Verify(code)
    }
    var response;
    if (verify) {
      response = ({ status: "200", message: "QRCode Verified Successfully", truID: truID })
      io.to(user.room).emit('QRverified', { response }); // entity
    } else {
      response = ({ status: "201", message: "Invalid QRCode" })
    }

    callback(response);
  });

  // from entity End
  socket.on('businessjoin', ({ QRCode, etruID }, callback) => {
    var room = crypto.createHash('md5').update((etruID).toString()).digest("hex");
    const { error, user } = QR_addUserBusiness({ id: socket.id, QRCode: QRCode, truID: etruID, room: room });

    if (error) return callback(error);

    socket.join(user.room);

    callback();
  });

  socket.on('verifyQRBusiness', (truID, code, callback) => {
    const user = QR_getUserBusiness(code);
    const verify = QR_Verify(code)
    var response;
    if (verify) {
      response = ({ status: "200", message: "QRCode Verified Successfully", truID: truID })
      try { io.to(user.room).emit('QRverified', { response }); }
      catch (e) {
        console.log(e)
      }
    } else {
      response = ({ status: "201", message: "Invalid QRCode" })
    }
    callback(response);
  });

  // socket.on('disconnect', () => {
  //   console.log("di", socket.id)
  //   const user = QR_removeUser(socket.id);
  // })
});
console.log('Consumer Port Active at : ' + port);

server.listen(port);