var loki = require('lokijs');
var db = require('./db').db;

// create collection
var user = db.addCollection('companyMaster');
exports.createUser = function(firstName, lastName, email, password) 
{ 
 user.insert({
  firstName: firstName,
  lastName: lastName,
  email: email,
  password: password
 });
 db.saveDatabase();

 var results = user.findOne({ firstName:'Nikhil' });
};
