/* // author : Suresh Patil
// date : 24-04-2019
// Description : Consumer List 

var accData = []

accData = new Array()
dataSet = []

function displayTable(){
 table = $("#example").DataTable({
   'paging': true,
   'lengthChange': true,
   'searching': true,
   'ordering': true,
   'info': true,
   'scrollX': true,

   data: accData,

   columns:[
     {title: "Name"},
     {title: "TruId"},
     {title: "Date of birth"},
     {title: "Mobile"},
     {title: "EmailId"},
     {title: "Address"},
     {title: "Info"}
   ]
 }); 
}



for(var i = 0; i < jsonObj.resource.length; i++){
 var vals = jsonObj.resource[i]
 var name = vals.name;
 var truId = vals.truId;
 var dob = vals.dob;
 var mobile = vals.mobile;
 var email = vals.email;
 var address = vals.address;
 var info = '<td><a class="text-info viewConsumer"><i class="fa fa-2x fa-file-text-o"></i> </a></td>';
 var accVar = [name, truId, dob, mobile, email, address, info]
 accData.push(accVar)
}

displayTable();
 */