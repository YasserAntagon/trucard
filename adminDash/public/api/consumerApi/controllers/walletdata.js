$(function () {
    BindDWalletdata(); 
    $('.radio-group label').on('click', function () {
        $(this).removeClass('not-active').siblings().addClass('not-active');
    });
}) 
function BindDWalletdata() {
    $ctruid = $("#txtcTruid").val()
    var json = {
        "cTruID": $ctruid
    };
    $(".spinnerRev").removeClass("hidden")
    $(".spinnerVal").addClass("hidden")
    $("#consumerDetailsLoader").css("display", "block");
    $.ajax({
        "url": "/consumerActive/searchConsumerdetails", "method": "POST", data: json, success: function (a) {
            $("#consumerDetailsLoader").fadeOut("slow");
            let res = a.body;
            if(res.status==200){ 
                $(".spinnerRev").addClass("hidden")
                $(".spinnerVal").removeClass("hidden")
            }else{
                $(".spinnerRev").addClass("hidden")
                $(".spinnerVal").removeClass("hidden")
                alertify.error("Somthing went wrong..!!");
            }
        }
    });


    $.fn.editable.defaults.mode = 'inline'; //editables  
}
 
function bindwalletSummary(type) {
    var $ctruid = $("#txtcTruid").val();
    var json = {
        "cTruID": $ctruid
    }; 
    $('#consumerWalLoader').css("display", 'block');
    $.ajax({
        "url": "/consumerList/getWalletTransdetails", "method": "POST", data: json, success: function (a) {
            let data = a.body;
            $('#consumerWalLoader').fadeOut('slow');
            if (data.status == 200) {
               loadWalTrans(type);
            } else {
                alertify.logPosition("bottom left");
                alertify.error(data.message);
            }
        }
    });
}
function loadWalTrans(type){
    var json = {
        "cTruID": $ctruid
    };
    $.ajax({
        "url": "/consumerDB/getConsumerWalletLog", "method": "POST", data: json, success: function (a) {
            let res = a.body;
            WbindDatatTable(res, type);
        }
    })
}
function pendingClick() {
    var pval = $('input[name=payment]:checked').val();
    loadWalTrans(pval);
}
var WbindDatatTable = function (res, type) {
    if (type == "atom") {
        walArr = res.atom;
        accData = new Array(); 
        if (walArr) {
            for (var i = 0; i < walArr.length; i++) {
                var srno = i + 1;
                var transID = walArr[i].atomID;
                // var dt = new Date(Date.parse(walArr[i].createDate));
                // var dt1 = moment(dt).format('DD/MM/YYYY hh:mm:ss A');
                let cdt = _formatDate(walArr[i].createDate, "time");
                let month = getSortOrder(walArr[i].createDate, "yyyymmdd");
                var mop;
                if (walArr[i].MOP == "NB") {
                    mop = "Net Banking";
                }
                else {
                    mop = "other";
                }
                var amount = '<i class="mdi mdi-currency-inr"></i>' + walArr[i].amount
                if (walArr[i].status == "Ok") {
                    var status = '<span class=" badge bg-green">Success</span>';
                }
                else {
                    var status = '<span class=" badge bg-red">Failed</span>';
                }
                // var accVar = [srno, transID, dt1, mop, amount, status];
                var accVar = {
                    'srno': srno,
                    'transID': transID,
                    // 'dt1': dt1,
                    'month': month,
                    'createDate': '<span style="display:none">' + month + '</span>' + cdt,
                    'mop': mop,
                    'amount': amount,
                    'status': status,
                }
                accData.push(accVar);

            }
            displayTable(accData);
        }
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
            columns: [
                { 'data': 'srno' },
                { 'data': 'transID' },
                { 'data': 'createDate' },
                { 'data': 'mop' },
                { 'data': 'amount' },
                { 'data': 'status' },
            ],
        });
    }
}