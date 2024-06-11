/*!
 File: Server list
 Edited : Nikhil Bharambe
 Dated : 08-05-2019
 Description : Server list
 */
function onView(event) {
  $empid = $(event).attr("data-id");
  window.location = "/empMaster?empid=" + $empid;
}
$(function () {
  $("#cmbBranch").change(function (e) {
    $branch = $(this).val();
    var query = {
      'truID': $branch
    };
    bindEmpList(query)
  });
  function bindBranchList() {
    $('.select2').select2();
    $.ajax({
      "url": "/employeeReg/getBranchList", "method": "POST", success: function (a) {
        var buyArr = a.body;
        if (buyArr) {
          $('#cmbBranch').empty();
          for (var i = 0; i < buyArr.length; i++) {
            $data = "";
            if (buyArr[i].contactAddress) {
              $data = buyArr[i].branchName + "-" + buyArr[i].contactAddress.city;
            }
            else {
              $data = buyArr[i].branchName;
            }
            $('#cmbBranch').append('<option value="' + buyArr[i].truID + '">' + $data + '</option>');

            if (i == 0) {
              bindEmpList("");
            }
          }
        }
      }
    });
  }

  bindBranchList();
  var reqQueuetable;
  function bindEmpList(query) {
    $('#empListLoader').css("display", 'block');
    $.ajax({
      "url": "/employeeReg/getEmpBranchWiseData", "method": "POST", success: function (a) { 
        let buyArr = a.body;
        $('#empListLoader').fadeOut('slow');
        if (buyArr) {
          var reqQueue = new Array();
          for (var i = 0; i < buyArr.length; i++) {
            var address = "";
            var city = "";
            if (buyArr[i].contactAddress) {
              city = buyArr[i].contactAddress.city;
              address = buyArr[i].contactAddress.houseNumber + "," + buyArr[i].contactAddress.streetNumber + "," + buyArr[i].contactAddress.city + "," + buyArr[i].contactAddress.state + "," + buyArr[i].contactAddress.country + "-" + buyArr[i].contactAddress.pin
            }
            var image = buyArr[i].image;
            var lastChar = image[image.length - 1];

            var img = "images/user.png";
            //   let rawdata = fs.readFileSync(__dirname+'/api/weburl.json');  
            //   let profPath = JSON.parse(rawdata);    
            if (lastChar != "0") {
              img = $("#imgpath").val() + buyArr[i].image;
            }
            var rqueue = {
              'SrNo': i + 1,
              'empName': buyArr[i].fName + " " + buyArr[i].mName + " " + buyArr[i].lName,
              'truID': buyArr[i].truID,
              'mobile': buyArr[i].mobile,
              'email': buyArr[i].email,
              'empCode': buyArr[i].empCode,
              'address': address,
              "status": buyArr[i].status,
              "image": img,
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
                "data": null,
                "render": function (data) {    //Changed By Nikhil    
                  var retData = '<img src=' + data.image + ' class="img img-circle" height="36px" width="36px" title=' + data.empName + ' />';
                  return retData;
                }
              },
              {
                "data": "empCode"
              },
              {
                "data": "empName"
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
                "render": function (data) { //Changed By Nikhil    
                  var retData = "";
                  if (data.status == "active") {
                    retData = '<span class="label label-success">' + data.status + '</span>';
                  } else {
                    retData = '<span class="label label-danger">' + data.status + '</span>';
                  }
                  return retData;
                }
              },
              {
                "data": null,
                "render": function (data) { //Changed By Nikhil    
                  var retData = '<a href="' + a.page + '?params=' + data.truID + '" class="text-info onview" data-id=' + data.truID + '><i class="fa fa-2x fa-file-text-o"></i> </a>'
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

});