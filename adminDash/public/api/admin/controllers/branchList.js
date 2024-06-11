/*!
 File: Employee List Verification
 Edited : Nikhil Bharambe
 Dated : 08-05-2019
 Description : Employee List list & documents preview for approve.
 */
// var branchList = require(__dirname+'/api/db/branchList');
function onBranchView(event) {
  $empid = $(event).attr("data-id");
  $("#pageContainer").empty();
  $("#pageContainer").load("pages/companyLocation.html");
}

function onOpen() {
  $("#pageContainer").empty();
  $("#pageContainer").load("pages/companyLocation.html");
  $("#txtBranchName").focus();
}

var reqQueuetable;
function bindBranchList() {
  var query = "";
  // branchList.getBranchList(function (res) 
  // {
  $.ajax({
    "url": "/employeeReg/bindBranchList", "method": "POST", success: function (a) {
      var buyArr = a.body;
      if (buyArr) {
        var reqQueue = new Array();
        for (var i = 0; i < buyArr.length; i++) {
          var address = "";
          var city = "";
          if (buyArr[i].contactAddress) {
            city = buyArr[i].contactAddress.city;
            address = buyArr[i].contactAddress.houseNumber + "," + buyArr[i].contactAddress.streetNumber + "," + buyArr[i].contactAddress.city + "," + buyArr[i].contactAddress.state + "," + buyArr[i].contactAddress.country + "-" + buyArr[i].contactAddress.pin
          }
          /*  var image=buyArr[i].image;
           var lastChar = image[image.length -1];
           var img="images/user.png";
 
           if(lastChar!="0")
           {
               img=buyArr[i].image;
           } */
          var rqueue =
          {
            'SrNo': i + 1,
            'branchName': buyArr[i].branchName,
            'truID': buyArr[i].truID,
            'mobile': buyArr[i].mobile,
            'email': buyArr[i].email,
            'purpose': buyArr[i].purpose,
            'address': address,
            "regDate": buyArr[i].regDate,
            "city": city
          };
          reqQueue.push(rqueue);
        }

        if ($.fn.dataTable.isDataTable('#example1')) {
          reqQueuetable.clear();
          reqQueuetable.rows.add(reqQueue);
          reqQueuetable.draw();
        } else {
          reqQueuetable = $('#example1').DataTable({
            "processing": true,
            "info": true,
            "bLengthChange": false,
            "order": [
              [0, "asc"]
            ],
            "pageLength": 10,
            data: reqQueue, // PASS ARRAY TO HERE
            lengthChange: false,
            "columns": [{
              "data": "SrNo"
            },
            {
              "data": "branchName"
            },
            {
              "data": "purpose"
            },
            {
              "data": "mobile"
            },
            {
              "data": "email"
            },
            {
              "data": "city"
            },
            {
              "data": "truID"
            },
            {
              "data": null,
              "render": function (data) {
                var retData = '<a href="' + a.page + '?url=' + data.truID + '" class="text-info onview" data-id=' + data.truID + '><i class="fa fa-2x fa-file-text-o"></i> </a>'
                return retData;
              }
            }
            ],
            "columnDefs": [
              {
                "targets": [6],
                "visible": false
              }
            ]
          });
        }
      }
    }
  });
}
bindBranchList();
