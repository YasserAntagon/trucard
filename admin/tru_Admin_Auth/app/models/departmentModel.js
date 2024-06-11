var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

// var subdepartment = new Schema({ subDeptID :{type: String} });

var departmentschema   = new Schema({
 deptID :{type :String, required : true},
 deptName :{type :String, required : true},
 subDeptID : { type: [String]},
 deptDesc : {type :String}
});

var DepartmentSchema = mongoose.model('departments', departmentschema);

module.exports = DepartmentSchema;
