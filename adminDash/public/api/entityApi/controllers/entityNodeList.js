/*!
 File: AssetManager List
 Edited : Nikhil Bharambe
 Dated : 22-04-2019
 */
/*
 File: Request stock from assetmanager
 Created : Nikhil Bharambe
 Dated : 04-10-2018
 */
var reqQueue = [];
var truid = $("#txteTruid").val();
var bindQueueTable = function (json) {
    reqQueue = new Array();
    $('#loader').css('display', 'block');
    $.ajax({
        "url": "/entityList/getEntityNodeList", "method": "POST", data: json, success: function (a) {
            let res = a.body;
            let url = a.page.entityDetails;
            $('#loader').fadeOut('slow');
            if (a.status == 200) {
                var buyArr = res;
                if (buyArr) {
                    for (var i = 0; i < buyArr.length; i++) {
                        let cdt = _formatDate(buyArr[i].createDate, "time");
                        let month = getSortOrder(buyArr[i].createDate, "yyyymmdd");
                        var address;
                        var city = "";
                        if (buyArr[i].KYCFlag == "pending") {
                            address = "";
                        }
                        else {
                            if (buyArr[i].address) {
                                city = buyArr[i].address.city;
                                address = buyArr[i].address.houseNumber + "," + buyArr[i].address.streetNumber + "," + buyArr[i].address.city + "," + buyArr[i].address.state + "," + buyArr[i].address.country + "-" + buyArr[i].address.pin
                            }
                            else {
                                address = "";
                            }
                        }
                        var rqueue =
                        {
                            'month': month,
                            'createDate': '<span style="display:none">' + month + '</span>' + cdt,
                            'dt': cdt,
                            'entityName': buyArr[i].companyName.replace('null', ''),
                            'truID': (buyArr[i].truID) ? buyArr[i].truID : "-",
                            'mobile': buyArr[i].mobile,
                            'email': buyArr[i].email,
                            'address': address,
                            "KYCFlag": buyArr[i].KYCFlag,
                            "city": city,
                            "users": '<a class="text-info btn" title="Consumer List" onclick="showconsumerlist(' + buyArr[i].truID + ');"><i class="fa fa-user-o" style="padding: 5px 7px;border: 1px #3c8dbc solid;"> ' + buyArr[i].consumerCount + '</i> </a>',
                            "view": "<a href='/" + url + "?id=" + buyArr[i].truID + "&node=true' data-truID=" + buyArr[i].truID + " title='view " + buyArr[i].companyName.replace('null', '') + " details' class='text text-primary fa fa-2x fa-file-text-o'></a>"
                        };
                        reqQueue.push(rqueue);
                    }
                    if ($.fn.dataTable.isDataTable('#rQueue')) {
                        reqQueuetable.clear();
                        reqQueuetable.rows.add(reqQueue);
                        reqQueuetable.draw();
                    }
                    else {
                        reqQueuetable = $('#rQueue').DataTable({
                            "processing": true,
                            "info": true,
                            "bLengthChange": false,
                            "order": [[5, "desc"]],
                            "pageLength": 10,
                            'scrollX': true,
                            data: reqQueue,                      // PASS ARRAY TO HERE
                            lengthChange: false,
                            buttons: [
                                {
                                    extend: 'excel',
                                    filename: truid,
                                    exportOptions: {
                                        columns: [0, 1, 2, 4, 6, 7]
                                    }
                                },
                                {
                                    extend: 'pdf',
                                    filename: truid,
                                    title: $('#txtname').html() + ' Node List',
                                    exportOptions: {
                                        columns: [0, 1, 2, 4, 6, 7]
                                    }
                                }],
                            "columns": [
                                {
                                    "data": null,
                                    "render": function (data) {
                                        return data.entityName + '<br>\n(' + data.truID + ')'
                                    }
                                },
                                // { "data": "truID" },
                                { "data": "mobile" },
                                { "data": "email" },
                                { "data": "city" },
                                { "data": "dt" },
                                { "data": "createDate" },
                                { "data": "users" },
                                { "data": "view" },
                                {
                                    "data": null,
                                    "render": function (data) {
                                        //Changed By Anisha    
                                        if (data.KYCFlag == "active") {
                                            return '<label class="label label-success">' + data.KYCFlag + ' </label>';
                                        }
                                        else if (data.KYCFlag == "pending") {
                                            return '<label class="label label-warning">' + data.KYCFlag + ' </label>';
                                        }
                                        else if (data.KYCFlag == "banned") {
                                            return '<label class="label label-danger">' + data.KYCFlag + ' </label>';
                                        }
                                        else if (data.KYCFlag == "stopTrading") {
                                            return '<label class="label label-warning">' + data.KYCFlag + ' </label>';
                                        }
                                        else if (data.KYCFlag == "holder") {
                                            return '<label class="label label-primary">' + data.KYCFlag + ' </label>';
                                        }
                                        return retData;
                                    }
                                }
                            ],
                            "columnDefs": [{
                                "targets": [3, 4],
                                "visible": false
                            }
                            ]
                        });
                    }
                    reqQueuetable.buttons().container()          // buttons excel,pdf,visiblility
                        .appendTo('#rQueue_wrapper .col-sm-6:eq(0)');
                    $('.dt-buttons').addClass("btn-group-sm")
                    $('#rQueue tbody').on('click', 'tr', function () {
                        var d = reqQueuetable.row(this).data();
                    });
                }
            }
        }
    });
}
function bindList() {
    var json = {
        "rTruID": truid
    };
    bindQueueTable(json);
}
$(function () {
    $('.radio-group label').on('click', function () {
        $(this).removeClass('not-active').siblings().addClass('not-active');
    });
})
bindList();
var showconsumerlist = function (truID) { 
    $('#nlist').addClass('hidden');
    $('#consumerlist').removeClass('hidden');
    var pval = $('input[name=pending]:checked').val();
    $('#txtenNodeTruid').val(truID);
    bindconsumerList(pval);
}
$(".shownodelist").on('click', function () {
    $('#consumerlist').addClass('hidden');
    $('#analysis').addClass('hidden');
    $('#nlist').removeClass('hidden');

})

function bindconsumerList(pending) {
    // var truid = store.get('etids');
    // var json = {
    //     // "truID": ctruid,
    //     "rTruID": truID
    // };
    // console.log("consumer",json)
    bindConsumerTable(pending);
}

function pendingClick() {
    var pval = $('input[name=pending]:checked').val();
    bindconsumerList(pval);

}

var bindConsumerTable = function (pval) {
    var json = {
        "rTruID": $('#txtenNodeTruid').val(),
        "KYCFlag": pval
    };
    reqQueue = new Array();
    $('#loader').css('display', 'block');
    $.ajax({
        "url": "/consumerList/getConsumerNodeList", "method": "POST", data: json, success: function (res) {
            let Arr = res.body;
            $('#loader').fadeOut('slow');

            if (res.status == 200) {
                // var Arr = a.resource.pending;

                // if (pval == "pending") {
                //     Arr = a.resource.pending;
                // }
                // else if (pval == "active") {
                //     Arr = a.resource.active;
                // }
                // else if (pval == "hold") {
                //     Arr = a.resource.hold;
                // }
                // else if (pval == "banned") {
                //     Arr = a.resource.banned;
                // }
                if (Arr) {
                    for (var i = 0; i < Arr.length; i++) {
                        var address;
                        var city = "";
                        if (Arr[i].KYCFlag == "pending") {
                            address = "";
                        }
                        else {
                            if (Arr[i].city) {
                                city = Arr[i].city;
                                //  address=Arr[i].contactAddress.houseNumber+","+Arr[i].contactAddress.streetNumber+","+Arr[i].contactAddress.city+","+Arr[i].contactAddress.state+","+Arr[i].contactAddress.country+"-"+Arr[i].contactAddress.pin
                            }
                            else {
                                address = "";
                            }
                        }
                        var rqueue =
                        {
                            'srno': i + 1,
                            'name': Arr[i].fName + " " + Arr[i].lName,
                            'truID': (Arr[i].truID) ? Arr[i].truID : "-",
                            'mobile': Arr[i].mobile,
                            'email': Arr[i].email,
                            "KYCFlag": Arr[i].KYCFlag,
                            "city": city
                        };
                        reqQueue.push(rqueue);
                    }
                    displayTable(reqQueue);

                }
                else {
                    displayTable(reqQueue);
                }
            }
        }
    });
}

function displayTable(accData) {
    if ($.fn.dataTable.isDataTable('#example')) {
        reqQueuetable.clear();
        reqQueuetable.rows.add(reqQueue);
        reqQueuetable.draw();
    }
    else {
        reqQueuetable = $('#example').DataTable({
            "processing": true,
            "info": true,
            "bLengthChange": false,
            "order": [[0, "asc"]],
            "pageLength": 10,
            data: reqQueue,                      // PASS ARRAY TO HERE
            lengthChange: false,
            buttons: ['excel', 'pdf'],
            "columns": [
                { "data": "srno" },
                { "data": "name" },
                { "data": "truID" },
                { "data": "mobile" },
                { "data": "email" },
                { "data": "city" },
                {
                    "data": null,
                    "render": function (data) {
                        //Changed By Anisha    
                        if (data.KYCFlag == "active") {
                            return '<label class="label label-success">' + data.KYCFlag + ' </label>';
                        }
                        else if (data.KYCFlag == "pending") {
                            return '<label class="label label-warning">' + data.KYCFlag + ' </label>';
                        }
                        else if (data.KYCFlag == "banned") {
                            return '<label class="label label-danger">' + data.KYCFlag + ' </label>';
                        }
                        else if (data.KYCFlag == "stopTrading") {
                            return '<label class="label label-warning">' + data.KYCFlag + ' </label>';
                        }
                        else if (data.KYCFlag == "holder") {
                            return '<label class="label label-primary">' + data.KYCFlag + ' </label>';
                        }
                        return retData;
                    }
                },
                // {
                //     "data": null,
                //     "render": function (data) {

                //         return "<a href='javascript:void(0)' data-truID=" + data.truID + " onclick='showDlr(this)' title='view assetmanager details' class='text text-primary fa fa-file-text-o'></a>";

                //     }
                // }
            ],
            "columnDefs": [{
                "targets": [5],
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
    $('.dt-buttons').addClass("btn-group-sm")
}

$(document).ready(function () {
    // var options = {
    //     startDate: moment().subtract(30, 'days'),
    //     opens: 'left'
    // };
    // options.ranges =
    // {
    //     'Today': [moment(), moment()],
    //     'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    //     'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    //     'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    //     'This Month': [moment().startOf('month'), moment().endOf('month')],
    //     'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    // };

    // // console.log("h")
    // // attach daterangepicker plugin
    // $('#config-date').daterangepicker(options, function (start, end, label) {
    //     myDateCallback(start, end);
    // });
});
var showanalysis = function (ctruid) {
    $('#nlist').addClass('hidden');
    $('#analysis').removeClass('hidden');
    var startDate = moment().subtract(30, 'days');
    var endDate = moment();
    $('#config-date span').html(startDate.format('MMMM D, YYYY') + ' - ' + endDate.format('MMMM D, YYYY'));
    startDate = moment().subtract(30, 'days').format('MM-DD-YYYY');
    endDate = moment().format('MM-DD-YYYY');
    commissionChart(ctruid, startDate, endDate);
}

var myDateCallback = function (start, end) {
    $('#config-date span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
    var start = start.format('MM-DD-YYYY');
    var end = end.format('MM-DD-YYYY');
    callChartDateWise(start, end);  // call get account statement
}

function callChartDateWise(start, end) {
    commissionChart($ctruid, start, end)
}
var myChart;
function commissionChart(ctruid, startDate, endDate) {
    // resetCanvas();

    var json = {
        "rTruID": truid,
        "startDate": startDate,
        "endDate": endDate
    };

    // Remove the old chart and all its event handles
    if (myChart) {
        myChart.destroy();
    }
    $('#loader').css('display', 'block');

    $.ajax({
        "url": "/eConsumer/getCommission", "method": "POST", data: json, success: function (res) {
            let a = res.body;
            $('#loader').fadeOut('slow');
            if (a.status == 200) {
                resource = a.resource;
                if (resource.remmitReport.length > 0) {
                    var labels;
                    if (status == "yearly") {
                        labels = resource.remmitReport.map(function (e) {
                            var date = new Date(Date.parse(e.month));
                            var fdate = formatMonthChart(date);
                            return fdate;

                        });
                    }
                    else if (status == "monthly") {
                        labels = resource.remmitReport.map(function (e) {
                            var date = new Date(Date.parse(e.date));
                            // var fdate = formatMonthChart(date);
                            var fdate = formatDtChart(date);
                            return fdate;
                        });
                    }
                    else {
                        labels = resource.remmitReport.map(function (e) {
                            var date = new Date(Date.parse(e.date));
                            var fdate = formatDtChart(date);
                            return fdate;
                        });
                    }
                    var data = resource.remmitReport.map(function (e) {
                        return e.averageSales;
                    });
                    var data1 = resource.remmitReport.map(function (e) {
                        return e.averageCommission;
                    });

                    var config = {
                        type: 'line',
                        data: {
                            labels: labels,
                            datasets: [
                                // {
                                //     type: 'line',
                                //     label: 'Commission',
                                //     fill: false,
                                //     backgroundColor: "#ef3f61",
                                //     borderColor: "#ef3f61",

                                //     data: data1
                                // },
                                {
                                    type: 'line',
                                    label: 'Sale Amount',
                                    backgroundColor: "#bee4d2",
                                    borderColor: "#bee4d2",
                                    data: data,
                                    fill: false,
                                }]
                        },
                        options: {
                            responsive: true,
                            title: {
                                display: true,
                                text: 'Entity Commission Chart'
                            },
                            tooltips: {
                                mode: 'index',
                                intersect: false,
                            },
                            hover: {
                                mode: 'nearest',
                                intersect: true
                            },
                            scales: {
                                xAxes: [{
                                    stacked: true,
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Date'
                                    }
                                }],
                                yAxes: [{
                                    stacked: true,
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Amount'
                                    }
                                }]
                            }

                        }
                    };
                    change('line');

                    function change(newType) { 
                        var ctx = document.getElementById("canvas").getContext("2d");

                        // Chart.js modifies the object you pass in. Pass a copy of the object so we can use the original object later
                        var temp = jQuery.extend(true, {}, config);
                        temp.type = newType;
                        myChart = new Chart(ctx, temp);
                    };

                }
                else {
                    // alertify.error("No record found..!!");
                }
            }
            else {
                alertify.error("No record found..!!");
            }
        }
    });
}