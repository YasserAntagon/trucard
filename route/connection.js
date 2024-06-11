const mongocon = "mongodb://127.0.0.1:27017"; 
const bindIp = "0.0.0.0";
const connection = {
    // useFindAndModify: false,
    // useCreateIndex: true,
    // useUnifiedTopology: true,
    // useNewUrlParser: true,
    //  replicaSet: "demo001",
    // ssl: true,
    // sslValidate: true,
    // sslKey:"../cert/mongodb.key",
    // sslCert:"../cert/mongodb.crt",
    // sslCA:"../cert/rootCA.pem",
}
module.exports = { connection, mongocon, bindIp }