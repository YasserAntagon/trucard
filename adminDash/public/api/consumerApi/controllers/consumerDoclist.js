function bindList(kycstat) {
    $('.loaderContainer').css("display", 'block');
    $.ajax({
        "url": "/consumerList/getconsumerList", "method": "POST", success: function (a) {
            let data = a.body;
            let url = a.page.consumerDetails;
            $('.loaderContainer').fadeOut('slow');
            if (data.status == 200) {
                bindDatatTable(data, kycstat, url);
            }
            else {
                var xyz = new Array();
                bindDatatTable(xyz, kycstat, url);
            }
        }
    });
}
function showDlr(event) {
    $tid = $(event).attr("data-truID");
    $enstatas = $(event).attr("data-enstatus");
    if ($enstatas == "false") {
        onSearch($tid)
    }
}
bindList(false);
$(function () {
    $('.radio-group label').on('click', function () {
        $(this).removeClass('not-active').siblings().addClass('not-active');
    });
})

function pendingClick() {
    var pval = $('input[name=pending]:checked').val();
    bindList(pval);
}


function bindDatatTable(res, kycstatus, url) {
    var buyArr = res.resource;
    reqQueue = new Array();
    if (buyArr) {
        for (var i = 0; i < buyArr.length; i++) {
            var address = "";
            var city = "";

            let cdt = _formatDate(buyArr[i].createDate, "time");
            let month = getSortOrder(buyArr[i].createDate, "yyyymmdd");

            if (buyArr[i].docVerified == kycstatus) {
                if (buyArr[i].permanentAddress) {
                    city = buyArr[i].permanentAddress.city;
                    permanentAddress = buyArr[i].permanentAddress.houseNumber + "," + buyArr[i].permanentAddress.streetNumber + "," + buyArr[i].permanentAddress.city + "," + buyArr[i].permanentAddress.state + "," + buyArr[i].permanentAddress.country + "-" + buyArr[i].permanentAddress.pin
                }
                else {
                    address = "";
                }
                let referal = buyArr[i].refFlag == "consumer" || buyArr[i].refFlag == "admin" ? buyArr[i].refFName + " " + buyArr[i].refLName : buyArr[i].refFlag == "entity" || buyArr[i].refFlag == "assetstore" ? buyArr[i].companyName.replace("null", "") : buyArr[i].refFlag == "assetmanager" ? buyArr[i].assetmanagerName : buyArr[i].refFlag;
                let referalTruID = buyArr[i].refFlag == "consumer" || buyArr[i].refFlag == "admin" || buyArr[i].refFlag == "entity" || buyArr[i].refFlag == "assetstore" || buyArr[i].refFlag == "assetmanager" ? buyArr[i].referenceTruID : "";
                var rqueue =
                {
                    'month': month,
                    'createDate': '<span style="display:none">' + month + '</span>' + cdt,
                    'custoName': buyArr[i].fName + " " + buyArr[i].lName,
                    'truID': (buyArr[i].truID) ? buyArr[i].truID : "-",
                    'mobile': buyArr[i].mobile,
                    'email': buyArr[i].email,
                    'address': address,
                    'docVerified':buyArr[i].docVerified,
                    "KYCFlag": buyArr[i].KYCFlag,
                    "city": city,
                    "refFlag": buyArr[i].refFlag,
                    "referBy": referalTruID != "" ? referal + "\n (" + referalTruID + ")" : "",
                    "url": url,
                    "info": '<td><a class="text-info viewdetails"><i class="fa fa-2x fa-file-text-o"></i></a></td>'
                };
                reqQueue.push(rqueue);
            }
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
                        filename: 'consumerList',
                        exportOptions: {
                            columns: [0, 1, 2, 3, 4, 5]
                        }
                    },
                    {
                        extend: 'pdf',
                        filename: 'consumerList',
                        title: 'Consumer List',
                        exportOptions: {
                            columns: [0, 1, 2, 3, 4, 5]
                        }
                    }],
                "columns": [
                    { "data": "custoName" },
                    { "data": "truID" },
                    { "data": "mobile" },
                    { "data": "email" },
                    { "data": "city" },
                    { "data": "createDate" },
                    {
                        "data": null,
                        "render": function (data) {
                            //Changed By Anisha    
                            if (data.refFlag == "consumer") {
                                return '<label class="label label-success">' + data.refFlag + ' </label><p>' + data.referBy + '</p>';
                            }
                            else if (data.refFlag == "admin") {
                                return '<label class="label label-warning">' + data.refFlag + ' </label><p>' + data.referBy + '</p>';
                            }
                            else if (data.refFlag == "entity") {
                                return '<label class="label label-danger">' + data.refFlag + ' </label><p>' + data.referBy + '</p>';
                            }
                            else if (data.refFlag == "direct") {
                                return '<label class="label label-warning">' + data.refFlag + ' </label><p>' + data.referBy + '</p>';
                            }
                            else if (data.refFlag == "assetmanager") {
                                return '<label class="label label-primary">' + data.refFlag + ' </label><p>' + data.referBy + '</p>';
                            }
                            return retData;
                        }
                    },
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
                    {
                        "data": null,
                        "render": function (data) {
                            if (data.docVerified == false) {
                                return "<a href='javascript:void(0)' data-truID=" + data.truID + " onclick='showDlr(this)' data-enstatus=" + data.docVerified + "  title='view assetmanager details' class='text text-primary fa fa-2x fa-file-text-o'></a>";
                            } else {
                                return "<a href='/" + data.url + "?id=" + data.truID + "' data-truID=" + data.truID + " data-enstatus=" + data.KYCFlag + "  title='view assetmanager details' class='text text-primary fa fa-2x fa-file-text-o'></a>";
                            }
                        }
                    }
                ]
            });
            reqQueuetable.buttons().container()          // buttons excel,pdf,visiblility
                .appendTo('#rQueue_wrapper .col-sm-6:eq(0)');
            $('.dt-buttons').addClass("btn-group-sm")
        }
    }
}

function displaydatatable(Data) {
    if ($.fn.dataTable.isDataTable('#example')) {
        table.clear();
        table.rows.add(Data);
        table.draw();
    }
    else {
        table = $("#example").DataTable({
            'paging': true,
            'lengthChange': true,
            'searching': true,
            'ordering': true,
            'info': true,
            'scrollX': true,

            data: Data,

            columns: [
                { title: "Consumer Name" },
                { title: "Company Id" },
                { title: "Mobile" },
                { title: "EmailId" },
                { title: "KYC status" },
                { title: "View" }
            ]
        });
    }
    $('#example tbody').on('click', 'tr', function () {
        var d = table.row(this).data();
        // console.log(d[1]);
        localStorage.setItem('ctruid', d[1]);
    });
}
