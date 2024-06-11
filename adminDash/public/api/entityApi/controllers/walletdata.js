var wcount = 0;
/* setTimeout(function () {
    bindwalletSummary();
}, 500)  */
function BindDWalletdata() {
    $ctruid = $("#txteTruid").val()
    var json = { "rTruID": $ctruid };
    $('#loader').css('display', 'block');
    $(".spinnerRev").removeClass("hidden")
    $(".spinnerVal").addClass("hidden")
    $.ajax({
        "url": "/eEntity/partnerPartnerStock", "method": "POST", data: json, success: function (a) {
            $('#loader').fadeOut('slow');
            let data = a.body;
            if (data.status == 200) { 
                $(".spinnerRev").addClass("hidden")
                $(".spinnerVal").removeClass("hidden")
            }
            else 
            {
                $(".spinnerRev").addClass("hidden")
                $(".spinnerVal").removeClass("hidden")
                alertify.error("Something went wrong..!!")
            }
        }
    }); 
} 
function bindwalletSummary() {
    var $ctruid = $("#txteTruid").val();
    var json = {
        "rTruID": $ctruid,
        "skip": wcount
    };
    $('#loader').css('display', 'block');
    $.ajax({
        "url": "/eEntity/getWalletTransdetails", "method": "POST", data: json, success: function (a) { 
            let data = a.body;
            if (data.status == 200) { 
                WbindDatatTable(data.resource);
            }
            else
            {
                $('#loader').fadeOut('slow');
                alertify.logPosition("bottom left");
                alertify.error(data.messege);
            }
        }
    });
}

var WbindDatatTable = function (walArr) {
    accData = new Array();
    if (walArr) {
        for (var i = 0; i < walArr.length; i++) {
            var srno = i + 1;
            var transID = walArr[i].invoice;
            // var dt = new Date(Date.parse(walArr[i].createDate));
            // var dt1 = moment(dt).format('DD/MM/YYYY hh:mm:ss A');
            let cdt = _formatDate(walArr[i].createDate, "time");
            let month = getSortOrder(walArr[i].createDate, "yyyymmdd");
            // var perticulars = walArr[i].particulars;
            var tType = walArr[i].tType;
            var status = '<span class=" badge bg-yellow">Success</span>';
            if (walArr[i].tType == "buy" || walArr[i].tType == "buyCash") {
                tType = "Buy";
            } 
            else if (walArr[i].tType == "revenue") {
                tType = "Revenue";
            } 
            else if (walArr[i].tType == "redeemCash") {
                tType = "Sell";
            }
            else if (walArr[i].tType == "transfer") {
                tType = "Transfer";
            }
            else if (walArr[i].tType == "addMoney") {
                tType = "Add Money";
                if (walArr[i].moneyAdded) {
                    status = '<span class=" badge bg-yellow">Success</span>';
                }
                else {
                    status = '<span class=" badge bg-yellow">Failed</span>';
                }
            }
            var txnType="-";
            if (walArr[i].txnType == "buy" || walArr[i].txnType == "buyCash") {
                txnType = "Buy";
            }
            else if (walArr[i].txnType == "revenue") {
                txnType = "Revenue";
            } 
            else if (walArr[i].txnType == "redeemCash") {
                txnType = "Sell";
            }
            else if (walArr[i].txnType == "transfer") {
                txnType = "Transfer";
            }
            else
            {
                txnType =walArr[i].txnType
            }
            var invInvoice=-walArr[i].againstInvoice?walArr[i].againstInvoice:transID;
            txnType+="<br>"+"Against Invoice : "+invInvoice;

            var amount="";
            if (walArr[i].Cr == "0") {
                var amt = walArr[i].Dr ? decimalChopper(walArr[i].Dr, 4) : '0'
                amount = '<span class="badge bg-red"><i class="mdi mdi-currency-inr"></i>' + amt + "</span>";
            }
            else {
                var amt = walArr[i].Cr ? decimalChopper(parseFloat(walArr[i].Cr).toString(), 4) : '0'
                amount = '<span class="badge bg-green"><i class="mdi mdi-currency-inr"></i>' + amt + "</span>";
            }
            var totalAmount = 0;
            if (walArr[i].totalAmount) {
                totalAmount = decimalChopper(walArr[i].totalAmount,4)
            }
            else {
                totalAmount = amt
            }

            // var accVar = [srno, transID, dt1, tType, amount, status];
            var accVar = {
                'srno': srno, 
                'transID': transID,
                // 'dt1': dt1,
                'month': month,
                'createDate': '<span style="display:none">' + month + '</span>' + cdt,
                'mop': tType,
                'txnType': txnType,
                'amount': amount,
                'totalAmount': totalAmount,
                'status': status,
            }
            accData.push(accVar);

        }
        displayTable(accData);
    }
    else
    {
        $('#loader').fadeOut('slow');
    }
}

function displayTable(accData) {

    ////console.log('Ans  = ' + $.fn.dataTable.isDataTable('#example'));
    if ($.fn.dataTable.isDataTable('#rQueue')) {
        ////console.log('table = ' + table.length);

        table.clear();
        table.rows.add(accData);
        ////console.log('accData =========' + accData);
        table.draw();
    }
    else {
        ////console.log('accData = ' + jQuery.type(accData))
        table = $('#rQueue').DataTable({

            'paging': true,
            'lengthChange': false,
            'searching': true,
            'ordering': true,
            'info': true,
            "order": [[2, "desc"]],
            'scrollX': true,
            "pageLength": 10,
            data: accData, // PASS ARRAY TO HERE

            // columns: [
            //     { title: "Sr No." },
            //     { title: "Transaction ID" },
            //     { title: "DateTime" },
            //     { title: "Paid Via" },
            //     { title: "Amount" },
            //     { title: "Txn Status" }

            // ],
            columns: [
                { 'data': 'srno' },
                { 'data': 'transID' },
                { 'data': 'createDate' },
                { 'data': 'txnType' },
                { 'data': 'mop' },
                { 'data': 'totalAmount' },
                { 'data': 'amount' },
                { 'data': 'status' },
            ],
            // rowCallback: function (row, data, index) {
            //     if (data[5] == "Success") {
            //         $(row).find('td:eq(5)').css('color', 'green');
            //     }
            //     else
            //     {
            //         $(row).find('td:eq(5)').css('color', 'red');
            //     }
            //     //   if(data[2].toUpperCase() == 'EE'){
            //     //       $(row).find('td:eq(2)').css('color', 'blue');
            //     //   }
            // }
        });
        //table.buttons().container().add('#example_wrapper .col-md-6:eq(0)');

    }
    $('#loader').fadeOut('slow');
    // $('#rQueue tbody').on('click', 'tr', function () {
    //     var d = table.row(this).data();
    //     //console.log(d);
    //     localStorage.setItem('cinvno', d[2]);
    // });

}