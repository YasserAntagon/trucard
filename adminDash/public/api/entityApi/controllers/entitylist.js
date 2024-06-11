/*!
 File: Request stock from assetmanager
 Created : Nikhil Bharambe
 Dated : 04-10-2018
 */
var reqQueue = [];
function showDlr(event) {
    $tid = $(event).attr("data-truID");
    $enstatas = $(event).attr("data-enstatus");
    if ($enstatas == "pending") {
        onSearch($tid)
    }
}

var bindQueueTable = function (json, kycstatus) {
    reqQueue = new Array();
    $('#loader').css("display", 'block');
    let jsonInput = {
        "KYCFlag": kycstatus
    }
    $.ajax({
        "url": "/entityList/getEntityAllList", "method": "POST", data: jsonInput, success: function (a) {
            let res = a.body;
            let url = a.page;
            $('#loader').fadeOut('slow');
            if (a.status == 200) {
                var buyArr = res;
                if (buyArr) {
                    for (var i = 0; i < buyArr.length; i++) {
                        if (buyArr[i].isParent == true) {
                            var address = "-";
                            var city = "-";
                            let cdt = _formatDate(buyArr[i].createDate, "timeshortAMPM");
                            let month = getSortOrder(buyArr[i].createDate, "yyyymmdd");
                            if (buyArr[i].KYCFlag == kycstatus) {

                                if (buyArr[i].address) {
                                    city = (buyArr[i].address.city) ? buyArr[i].address.city : "-";
                                    address = buyArr[i].address.houseNumber + "," + buyArr[i].address.streetNumber + "," + buyArr[i].address.city + "," + buyArr[i].address.state + "," + buyArr[i].address.country + "-" + buyArr[i].address.pin
                                }
                                else {
                                    address = "-";
                                    city = "-";
                                }
                                let KYCTime = buyArr[i].KYCTime ? _formatDate(buyArr[i].KYCTime, "timeshortAMPM") : cdt;
                                var kycby = buyArr[i].KYCVerifyBy ? buyArr[i].KYCVerifyBy : "";
                                let KYCVerifyBy = KYCTime;
                                if (kycby) {
                                    KYCVerifyBy +="<br><i class='fa fa-user' title='Active By' />" + kycby
                                }
                                var rqueue =
                                {
                                    'month': month,
                                    'createDate': '<span style="display:none">' + month + '</span>' + cdt,
                                    'dt': cdt,
                                    'entityName': buyArr[i].companyName,
                                    'truID': (buyArr[i].truID) ? buyArr[i].truID : "-",
                                    'mobile': buyArr[i].mobile,
                                    'email': buyArr[i].email,
                                    'address': address,
                                    "KYCFlag": buyArr[i].KYCFlag,
                                    "nodecount": buyArr[i].nodecount ? buyArr[i].nodecount : 0,
                                    "city": city,
                                    "url": url.entityDetails,
                                    "eourl": url.enONodeList,
                                    "KYCVerifyBy":KYCVerifyBy,
                                    "users": '<a class="text-info btn" title="Consumer List"><i class="fa fa-user-o" style="padding: 5px 7px;border: 1px #3c8dbc solid;"> ' + buyArr[i].consumerCount + '</i> </a>',
                                    "info": '<td><a class="text-info viewdetails"><i class="fa fa-2x fa-pencil"></i> </a></td>'
                                };
                                reqQueue.push(rqueue);
                            }
                        }
                    }
                    if ($.fn.dataTable.isDataTable('#rQueue')) {
                        reqQueuetable.clear();
                        reqQueuetable.rows.add(reqQueue);
                        reqQueuetable.draw();
                        if (kycstatus == "pending") {
                            reqQueuetable.column(5).visible(false);
                            reqQueuetable.column(8).visible(false);
                            reqQueuetable.column(7).visible(false);
                        }
                        else {
                            reqQueuetable.column(5).visible(false);
                            reqQueuetable.column(8).visible(true);
                            reqQueuetable.column(7).visible(true);
                        }
                    }
                    else {
                        var visible = kycstatus == "pending" ? [5, 7, 8] : [5];
                        reqQueuetable = $('#rQueue').DataTable({
                            "processing": true,
                            "info": true,
                            "bLengthChange": false,
                            "order": [[6, "desc"]],
                            "pageLength": 10,
                            'scrollX': true,
                            data: reqQueue,                      // PASS ARRAY TO HERE
                            lengthChange: false,
                            buttons: [
                                {
                                    extend: 'excel',
                                    filename: "entityList",
                                    exportOptions: {
                                        columns: [1, 5, 2, 3, 4, 7, 8]
                                    }
                                },
                                {
                                    extend: 'pdf',
                                    filename: "entityList",
                                    orientation: 'landscape',
                                    title: 'Partner List',
                                    exportOptions: {
                                        columns: [1, 5, 2, 3, 4, 7, 8]
                                    }
                                }],
                            "columns": [
                                { "data": null },
                                {
                                    "data": null,
                                    "render": function (data) {
                                        return data.entityName + '<br/>\n (' + data.truID + ')';
                                    }
                                },
                                { "data": "mobile" },
                                { "data": "email" },
                                { "data": "city" },
                                { "data": "dt" },
                                { "data": "createDate" },
                                { "data": "users" },
                                {
                                    "data": null,
                                    "render": function (data) {
                                        if (data.KYCFlag == "pending") 
                                        {
                                            return "-";
                                        } 
                                        else 
                                        {
                                            if (data.nodecount == 0) {
                                                return "<a href='javascript:void(0)'  title='view " + data.entityName + " node list' class='text-info btn'><i class='fa fa-user-o' style='padding: 5px 7px;border: 1px #3c8dbc solid;'> " + data.nodecount + "</i></a>";
                                            }
                                            else {
                                                return "<a href='/" + data.eourl + "?id=" + data.truID + "' data-truID=" + data.truID + "  data-enstatus=" + data.KYCFlag + "  title='view " + data.entityName + " node list' class='text-info btn'><i class='fa fa-user-o' style='padding: 5px 7px;border: 1px #3c8dbc solid;'> " + data.nodecount + "</i></a>";
                                            }
                                        }
                                    }
                                }, 
                                {
                                    "data": null,
                                    "render": function (data) { 
                                            return "<a href='/" + data.url + "?id=" + data.truID + "' data-truID=" + data.truID + "  data-enstatus=" + data.KYCFlag + "  title='view " + data.entityName + " details' class='text text-primary fa fa-2x fa-file-text-o'></a>";
                                       
                                    }
                                },
                                {
                                    "data": null,
                                    "render": function (data) {
                                        var retData="";
                                        if (data.KYCFlag == "active") {
                                            retData='<label class="label label-success">' + data.KYCFlag + ' </label><br />';
                                        }
                                        else if (data.KYCFlag == "pending") {
                                            var ddata="<div style='text-align:center'><a href='javascript:void(0)' data-truID=" + data.truID + " data-enstatus=" + data.KYCFlag + " onclick='showDlr(this)'   title='Activate " + data.entityName + " account' class='text text-warning fa fa-2x fa-pencil'></a>";
                                            retData=ddata+'<br><label class="label label-warning">' + data.KYCFlag + ' </label></div>';
                                        }
                                        else if (data.KYCFlag == "banned") {
                                            retData='<label class="label label-danger">' + data.KYCFlag + ' </label><br />';
                                        }
                                        else if (data.KYCFlag == "stopTrading") {
                                            retData='<label class="label label-warning">' + data.KYCFlag + ' </label><br />';
                                        }
                                        else if (data.KYCFlag == "holder") {
                                            retData='<label class="label label-primary">' + data.KYCFlag + ' </label><br />';
                                        }
                                        return retData + data.KYCVerifyBy 
                                    }
                                },
                                {
                                    "data": null,
                                    "render": function (data) {
                                        return "<a href='avascript:;' data-email='" + data.email + "' data-title='" + data.entityName + "' onclick='showCompose(this)' class='text text-primary fa fa-2x fa-envelope'></a>";

                                    }
                                }
                            ],
                            "columnDefs": [
                                {
                                    "targets": visible,
                                    "visible": false

                                }
                            ]
                        });
                    }
                    reqQueuetable.buttons().container()          // buttons excel,pdf,visiblility
                        .appendTo('#rQueue_wrapper .col-sm-6:eq(0)');

                    reqQueuetable.on('order.dt search.dt', function () {
                        reqQueuetable.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
                            cell.innerHTML = i + 1;
                        });
                    }).draw();
                    $('#rQueue tbody').on('click', 'tr', function () {
                        var d = reqQueuetable.row(this).data();
                        // console.log(d);
                        // store.set("custtruID", d.truID);
                        // var truid = 
                        // $("#pageContainer").load("assetstorePages/assetstoreDetails.html");
                        // onSearch(d.truID)
                    });
                    $('.dt-buttons').addClass("btn-group-sm")
                }
            }
        }
    });
}
function showCompose(event) {
  let eventemail = $(event).attr("data-email"); 
    let title = $(event).attr("data-title"); 
    var d=$("#txEmailClient").val(); 
    $("#txEmailClient").val(eventemail);
    $("#enClientName").val(title);
    $("#compose-textarea").val("");
    $("#toSend").val(eventemail); 
    $('#mailModal').modal({ show: 'show' });
    if(eventemail!=d){
        discards();
    } 
}

function bindList(kycstatus) {
    let ctruid = $("#txteTruid").val()
    var json = {
        "truID": ctruid
    };
    bindQueueTable(json, kycstatus);
}
bindList("pending");
$(function () {
    $('.radio-group label').on('click', function () {
        $(this).removeClass('not-active').siblings().addClass('not-active');
    });
})

function pendingClick() {
    var pval = $('input[name=pending]:checked').val();
    bindList(pval);
}