/*!
 File: Error Log List
 Edited : Nikhil Bharambe
 Dated : 23-07-2020
 Description : Consumer Errror Log List
 */
var reqQueuetable;
$(function () {
  $('#errorListLoader').css("display", 'block');
  $.ajax({
    "url": "/errorLogList/bindAllErrorLog", "method": "POST", success: function (a) {
      let res = a.body;
      $('#errorListLoader').fadeOut('slow');
      if (res.status != "200") {
        alertify.logPosition("bottom left");
        alertify.error('No Error log Found');

        return false;
      }
      let date = new Date()
      if ($.fn.dataTable.isDataTable('#errorLogList')) {
        reqQueuetable.clear();
        reqQueuetable.rows.add(res.resource);
        reqQueuetable.draw();
      } else {
        reqQueuetable = $('#errorLogList').DataTable({
          'paging': true,
          'searching': true,
          'ordering': true,
          'info': true,
          "scrollX": true,
          "order": [
            [1, "desc"]
          ],
          buttons: [
            {
              extend: 'excel',
              filename: 'errorLog_',
              exportOptions: {
                columns: [0, 1, 2, 3, 4]
              }
            },
            {
              extend: 'pdf',
              filename: 'errorLog_',
              title: 'Error Log',
              exportOptions: {
                columns: [0, 1, 2, 3, 4]
              }
            }],
          "pageLength": 20,
          data: res.resource, // PASS ARRAY TO HERE
          lengthChange: false,
          "columns": [
            {
              "data": "errorMessage"
            },
            {
              "data": null,
              "render": function (data) {
                return data.datetime ? new Date(data.datetime).toLocaleString() : new Date().toLocaleString();
              }
            },
            {
              "data": null,
              "render": function (data) {
                return data.user ? data.user : "no User";
              }
            },
            {
              "data": "errLocation"
            },
            {
              "data": "errFile"
            },
          ]
        });
        reqQueuetable.buttons().container()
          .appendTo('#errorLogList .col-sm-12:eq(0)');
        $('.dt-buttons').addClass("btn-group-sm")
      }
    }
  });
})
function deleteErr() {

  let count = reqQueuetable.rows().count();
  if (count <= 0) {
    alertify.logPosition("bottom left");
    alertify.error('No Error log Found');
    return false;
  }
  swal({
    title: 'Are you sure?',
    text: "Remove All Error Logs..!!",
    type: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, proceed it!',
    cancelButtonText: 'No, cancel!',
    confirmButtonClass: 'btn btn-sm btn-primary',
    cancelButtonClass: 'btn btn-sm btn-danger m-l-10',
    buttonsStyling: false
  }).then(function () {
    txnCheck(function (status) {
      if (status == true) {
        $('#errorListLoader').css("display", 'block');

        $.ajax({
          "url": "/errorLogList/deleteAllErrorLog", "method": "POST", success: function (a) {
            $('#errorListLoader').fadeOut('slow');
            let res = a.body;
            if (res.status == "200") {
              reqQueuetable.clear();
              reqQueuetable.rows.add([]);
              reqQueuetable.draw();
              alertify.logPosition("bottom left");
              alertify.success('Error log deleted successfully');

            }
          }
        })
      }
      else {
        alertify.error("Please Verify TPIN..!!")
      }
    })
  }, function (dismiss) {
    // dismiss can be 'cancel', 'overlay',
    // 'close', and 'timer'
    if (dismiss === 'cancel') {
      swal(
        'Cancelled',
        'you cancelled your conversion...',
        'error'
      )
      flag = false;
    }
  })

}