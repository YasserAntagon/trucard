function applyLBMA() {
    swal({
        title: 'Are you sure?',
        text: "Do you want to apply live rate ?",
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, proceed it!',
        cancelButtonText: 'No, cancel!',
        confirmButtonClass: 'btn btn-primary',
        cancelButtonClass: 'btn btn-danger m-l-10',
        buttonsStyling: false
    }).then(function () {
        saveLBMARates();
    }, function (dismiss) {
        // dismiss can be 'cancel', 'overlay',
        // 'close', and 'timer'
        if (dismiss === 'cancel') {
            swal(
                'Cancelled',
                'you cancelled your request...',
                'error'
            )
        }
    })
}

function saveLBMARates() {

    $g24k = $("#txtg24k").html();
    $s99p = $("#txts99p").html();


    $rateCurrency = $("#txtCurrency").html();
    $rateImportDuty = $("#txtImportDuty").html();
    $rateDiscount = $("#txtDiscount").html();
    $rateTax = $("#txtTax").html();

    if ($.trim($g24k) == '') {
        alertify.logPosition("bottom left");
        alertify.error("Please Enter Gold 24k Rate");
        return false;
    }
    if ($.trim($s99p) == '') {
        alertify.logPosition("bottom left");
        alertify.error("Please Enter 99% Pure Silver Rate");
        return false;
    }

    if ($.trim($rateCurrency) == '') {
        alertify.logPosition("bottom left");
        alertify.error("Please Enter Currency Rate");
        return false;
    }
    if ($.trim($rateImportDuty) == '') {
        alertify.logPosition("bottom left");
        alertify.error("Please Enter Import Duty");
        return false;
    }
    if ($.trim($rateDiscount) == '') {
        alertify.logPosition("bottom left");
        alertify.error("Please Enter Discount Rate");
        return false;
    }
    if ($.trim($rateTax) == '') {
        alertify.logPosition("bottom left");
        alertify.error("Please Enter Tax Rate");
        return false;
    }

    $goldDate = $("#goldDate").val();
    $silverDate = $("#silverDate").val();

    $gdate = new Date($goldDate);
    $sdate = new Date($silverDate)

    $rateCurrency = $("#txtCurrency").html();
    $rateImportDuty = $("#txtImportDuty").html();
    $rateDiscount = $("#txtDiscount").html();
    $rateTax = $("#txtTax").html();

    var json = {
        "date1": $gdate,
        "G24KRate": $g24k,
        "date2": $sdate,
        "S99PRate": $s99p,
        "countryCode": "+91",
        "currencyRate": $rateCurrency,
        "importDuty": $rateImportDuty,
        "discount": $rateDiscount,
        "tax": $rateTax
    }

    txnCheck(function (status) {
        if (status == true) {
            $('#LBMARateLoader').css("display", 'block');
            $.ajax({
                "url": "/LBMA/setLBMARate", "method": "POST", data: json, success: function (a) {
                    let res = a.body;
                    $('#LBMARateLoader').fadeOut('slow');
                    if (res.status == 200) {
                        alertify.logPosition("bottom left");

                        alertify.success('LBMA Rate Successfully Updated..!!');
                        bindData();
                    } else {
                        alertify.logPosition("bottom left");
                        alertify.error(res.message);
                    }
                }
            });
        }
        else {
            alertify.error("Please Verify TPIN..!!")
        }
    })
}

var editable = function () {
    $('#txtg24k').editable({
        type: 'text',
        title: 'Enter Gold 24k Rate',
        validate: function (value) {
            if ($.trim(value) == '') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Only number & decimal value are allowed';
            }
            /*  if ($.trim(value).length > 8) {
                 return 'length is less than 8 charectors';
             } */
           
        }
    }); 
    $('#txts99p').editable({
        type: 'text',
        title: 'Enter 99% Pure Silver Rate',
        validate: function (value) {
            if ($.trim(value) == '') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Only number & decimal value are allowed';
            }
            /*   if ($.trim(value).length > 6) {
            return 'length is less than 6 charectors';
              } */
            
        }
    });

    $('#txtImportDuty').editable({
        type: 'text',
        title: 'Enter Import Duty',
        validate: function (value) {
            if ($.trim(value) == '') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Only number & decimal value are allowed';
            }
            /*   if ($.trim(value).length > 6) {
            return 'length is less than 6 charectors';
              } */
            if (parseFloat($.trim(value)) > 50) {
                return 'please enter valid import duty';
            }
        }
    });

    $('#txtDiscount').editable({
        type: 'text',
        title: 'Enter Discount',
        validate: function (value) {
            if ($.trim(value) == '') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Only number & decimal value are allowed';
            }
            /*   if ($.trim(value).length > 6) {
            return 'length is less than 6 charectors';
              } */
            if (parseFloat($.trim(value)) > 50) {
                return 'please enter valid discount';
            }
        }
    });

    $('#txtTax').editable({
        type: 'text',
        title: 'Enter Tax',
        validate: function (value) {
            if ($.trim(value) == '') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Only number & decimal value are allowed';
            }
            /* if ($.trim(value).length > 6) {
                 return 'length is less than 6 charectors';
              } */
            if (parseFloat($.trim(value)) > 50) {
                return 'please enter valid tax';
            }
        }
    });
    $('#txtCurrency').editable({
        type: 'text',
        title: 'Enter Currency Rate',
        validate: function (value) {
            if ($.trim(value) == '') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Only number & decimal value are allowed';
            }
            /*   if ($.trim(value).length > 6) {
                return 'length is less than 6 charectors';
              } */
            if (parseFloat($.trim(value)) > 100) {
                return 'please enter valid currency rate';
            }
        }
    });
}

function bindData() {
    $('#LBMARateLogLoader').css("display", 'block');
    $.ajax({
        "url": "/LBMA/getLiveRates", "method": "POST", success: function (a) {
            let res = a.body;
            $('#LBMARateLogLoader').fadeOut('slow');
            if (res !== null) {
                // Gold & Silver Date
                $("#goldDate").val(res.goldDate);
                $("#silverDate").val(res.silverDate);

                // LBMA Rate in USD
                $("#lg24krate").attr("data-id", res.g24kGold);
                $("#ls99prate").attr("data-id", res.s99PSilver);
                if (res.g24kGold) {
                    $("#lg24krate").html(decimalChopper(res.g24kGold, 4));
                }
                if (res.s99PSilver) {
                    $("#ls99prate").html(decimalChopper(res.s99PSilver, 4));
                }
            }
        }
    });
    topData(30);
}
var reqQueuetable;
var chartArray = new Array();


$('#topRecords').on('change', function () {

    if (chartArray.length > 29) {
        $limit = $(this).val();
        topData($limit);
    }
    else {
        alertify.logPosition("bottom left");
        alertify.error("Record not available..!!");
    }

});
function topData(limit) {
    var json = {
        "limit": limit
    }
    $('#LBMARateLoader').css("display", 'block');
    $.ajax({
        "url": "/LBMA/getLBMARate", "method": "POST", data: json, success: function (a) {
            let res = a.body;
            $('#LBMARateLoader').fadeOut('slow');
            if (res.status == 200) {
                $('#txtg24k').editable('setValue', res.resource[0].g24k_rate); 
                $('#txts99p').editable('setValue', res.resource[0].s99_rate);


                if (res.resource[0].currencyRate) {
                    // $("#txtCurrency").html(res.resource[0].currencyRate);
                    $('#txtCurrency').editable('setValue', res.resource[0].currencyRate);

                }
                if (res.resource[0].importDuty) {
                    //  $("#txtImportDuty").html(res.resource[0].importDuty);
                    $('#txtImportDuty').editable('setValue', res.resource[0].importDuty);
                }
                if (res.resource[0].discount) {
                    // $("#txtDiscount").html(res.resource[0].discount);
                    $('#txtDiscount').editable('setValue', res.resource[0].discount);
                }
                if (res.resource[0].tax) {
                    // $("#txtTax").html(res.resource[0].tax);
                    $('#txtTax').editable('setValue', res.resource[0].tax);
                }

                $("#btnCurrency").attr("disabled", false);
                bindRateList(res.resource);
            }
        }
    });
}


var bindRateList = function (buyArr) {
    var reqQueue = new Array();
    var desQueue = new Array();
    chartArray = new Array();
    for (var i = 0; i < buyArr.length; i++) {
        var date = new Date(Date.parse(buyArr[i].entryTimeStamp));
        var fdate = lbmaDate(date);

        var date1 = new Date(Date.parse(buyArr[i].date1));
        var gdate = lbmaDate(date1);

        var date2 = new Date(Date.parse(buyArr[i].date2));
        var sdate = lbmaDate(date2);
        $currencyRate = 0;
        $importDuty = 0;
        $discount = 0;
        $tax = 0;
        if (buyArr[i].currencyRate) {
            $currencyRate = buyArr[i].currencyRate;
        }
        if (buyArr[i].importDuty) {
            $importDuty = buyArr[i].importDuty;
        }
        if (buyArr[i].discount) {
            $discount = buyArr[i].discount;
        }
        if (buyArr[i].tax) {
            $tax = buyArr[i].tax;
        }



        var rqueue = {
            'SrNo': i + 1,
            'g24k_rate': buyArr[i].g24k_rate,
            's99p_rate': buyArr[i].s99_rate,
            'currencyRate': $currencyRate,
            'importDuty': $importDuty,
            'discount': $discount,
            'tax': $tax,
            'date': fdate,
            'sdate': sdate,
            'gdate': gdate
        };
        reqQueue.push(rqueue);
    }
    for (var i = buyArr.length - 1; i >= 0; i--) {
        var date = new Date(Date.parse(buyArr[i].entryTimeStamp));
        var fdate = lbmaDate(date);

        var date1 = new Date(Date.parse(buyArr[i].date1));
        var gdate = lbmaDate(date1);

        var date2 = new Date(Date.parse(buyArr[i].date2));
        var sdate = lbmaDate(date2);
        $currencyRate = 0;
        $importDuty = 0;
        $discount = 0;
        $tax = 0;
        if (buyArr[i].currencyRate) {
            $currencyRate = buyArr[i].currencyRate;
        }
        if (buyArr[i].importDuty) {
            $importDuty = buyArr[i].importDuty;
        }
        if (buyArr[i].discount) {
            $discount = buyArr[i].discount;
        }
        if (buyArr[i].tax) {
            $tax = buyArr[i].tax;
        }
        var rqueue = {
            'SrNo': i + 1,
            'g24k_rate': buyArr[i].g24k_rate,
            's99p_rate': buyArr[i].s99_rate,
            'currencyRate': $currencyRate,
            'importDuty': $importDuty,
            'discount': $discount,
            'tax': $tax,
            'date': fdate,
            'sdate': sdate,
            'gdate': gdate
        };
        desQueue.push(rqueue);
    }

    chartArray = desQueue;
    bindChart(chartArray);
    if ($.fn.dataTable.isDataTable('#tblRate')) {
        reqQueuetable.clear();
        reqQueuetable.rows.add(reqQueue);
        reqQueuetable.draw();
    } else {
        reqQueuetable = $('#tblRate').DataTable({
            "processing": true,
            "info": true,
            "bLengthChange": false,
            "pageLength": 10,
            data: reqQueue, // PASS ARRAY TO HERE
            lengthChange: false,
            "columns": [{
                "data": "SrNo"
            },
            {
                "data": "date"
            },
            {
                "data": "gdate"
            },
            {
                "data": "g24k_rate"
            },
            {
                "data": "s99p_rate"
            },
            {
                "data": "currencyRate"
            },
            {
                "data": "importDuty"
            },
            {
                "data": "discount"
            },
            {
                "data": "tax"
            },
            {
                "data": "sdate"
            }

            ], "columnDefs": [
                {
                    "targets": [2],
                    "visible": false
                }, {
                    "targets": [10],
                    "visible": false
                }]
        });
    }
}

bindData();

function converter() {

    $lg24krate = $("#lg24krate").attr("data-id");
    $ls99prate = $("#ls99prate").attr("data-id");

    $currency = $("#txtCurrency").text();
    if ($currency == "") {
        alertify.logPosition("bottom left");
        alertify.error("Please Enter Valid Currency..!!");
        return false;
    }
    $import = $("#txtImportDuty").text();
    if ($currency == "") {
        alertify.logPosition("bottom left");
        alertify.error("Please Enter Valid Import Duty..!!");
        return false;
    }
    $discount = $("#txtDiscount").text();
    if ($currency == "") {
        alertify.logPosition("bottom left");
        alertify.error("Please Enter Valid Discount..!!");
        return false;
    }
    $tax = $("#txtTax").text();
    if ($currency == "") {
        alertify.logPosition("bottom left");
        alertify.error("Please Enter Valid Tax..!!");
        return false;
    }



    // calculate currency 
    $plg24krate = parseFloat($lg24krate) * ($currency);
    $pls99prate = parseFloat($ls99prate) * ($currency);

    // calculate import duty     
    $importRate24 = $plg24krate * parseFloat($import) / 100;
    $importRate99 = $pls99prate * parseFloat($import) / 100;

    $importAmount24 = $plg24krate + $importRate24;
    $importAmount99 = $pls99prate + $importRate99;


    // calculate Discount    
    $disRate24 = $importAmount24 * parseFloat($discount) / 100;
    $disRate99 = $importAmount99 * parseFloat($discount) / 100;


    $disAmount24 = $importAmount24 - $disRate24;
    $disAmount99 = $importAmount99 - $disRate99;


    // calculate Tax
    $taxAmount24 = $disAmount24 * parseFloat($tax) / 100;
    $taxAmount99 = $disAmount99 * parseFloat($tax) / 100;


    $taxRate24 = $taxAmount24 + $disAmount24;
    $taxRate99 = $taxAmount99 + $disAmount99;

    $('#txtg24k').editable('setValue', $taxRate24);
    $('#txts99p').editable('setValue', $taxRate99);
}

var chart;
function bindChart(chartArr) {
    resetCanvas();
    if (chartArr) {
        var labels = "";
        var line24;
        var line22;
        var line18;
        /* var line99P; */
        labels = chartArr.map(function (e) {
            return e.date;
        });

        line24 = chartArr.map(function (e) {
            return decimalChopper(e.g24k_rate, 2);
        });

        /*   line99P = chartArr.map(function (e) {
              return decimalChopper(e.s99p_rate, 2);
          }); */
    }


    var bar24k = {
        type: 'line',
        label: '24K Gold',
        backgroundColor: "#ff0080",
        borderColor: "#ff0080",
        data: line24,
        fill: false,
        lineTension: 0
    };


    var config = {
        type: 'bar',

        data: {
            labels: labels,
            datasets: [bar24k]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'LBMA Rate'
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
                    stacked: false,
                    scaleLabel: {
                        display: true,
                        labelString: 'Date'
                    }
                }],
                yAxes: [{
                    stacked: false,
                    scaleLabel: {
                        display: true,
                        labelString: 'Unit'
                    }
                }]
            }
        }
    };
    var ctx = document.getElementById('canvas').getContext('2d');
    chart = new Chart(ctx, config);
    var type = $('input[name=dname]:checked').val();
    onTypeChange(type);


    /*  } 
     else 
     {
         alertify.error("No Record Found..!!");
         return false;
     } */
}
var resetCanvas = function () {
    $('#canvas').remove(); // this is my <canvas> element
    $('#graph-container').append('<canvas id="canvas"><canvas>');
};


function onTypeChange(type) {
    var types = $('input[name=transaction]:checked').val();
    if (types == "gold") {


        chart.config.data.datasets[0].type = type;
        chart.config.data.datasets[1].type = type;
        chart.config.data.datasets[2].type = type;
        //   chart.config.data.datasets[3].type = type;
    }
    else {
        chart.config.data.datasets[0].type = type;
    }
    chart.update();
}

function onType(item) {
    var type = $(item).val();
    var types = $('input[name=transaction]:checked').val();
    if (types == "gold") {
        chart.config.data.datasets[0].type = type;
        chart.config.data.datasets[1].type = type;
        chart.config.data.datasets[2].type = type;
        //  chart.config.data.datasets[3].type = type;
    }
    else {
        chart.config.data.datasets[0].type = type;
    }
    chart.update();
}


function onChart() {
    var type = $('input[name=transaction]:checked').val();
    if (type == "gold") {
        bindChart(chartArray);
    }
    else {
        resetCanvas();
        var labels = "";
        var line99P;
        if (chartArray) {
            labels = chartArray.map(function (e) {
                return e.date;
            });

            line99P = chartArray.map(function (e) {
                return decimalChopper(e.s99p_rate, 2);
            });
        }
        var bar99S = {
            type: 'line',
            label: '99% Silver',
            fill: origin,
            backgroundColor: "#f0b081",
            borderColor: "#f0b081",
            data: line99P,
            lineTension: 0
        };
        var config = {
            type: 'bar',

            data: {
                labels: labels,
                datasets: [bar99S]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: 'LBMA Rate'
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
                        stacked: false,
                        scaleLabel: {
                            display: true,
                            labelString: 'Date'
                        }
                    }],
                    yAxes: [{
                        stacked: false,
                        scaleLabel: {
                            display: true,
                            labelString: 'Unit'
                        }
                    }]
                }
            }
        };
        var ctx = document.getElementById('canvas').getContext('2d');
        chart = new Chart(ctx, config);
        var type = $('input[name=dname]:checked').val();
        onTypeChange(type);
    }
}
function chartVisible() {
    $(".lbmaRate").addClass("hidden");
    $(".lbmaChart").removeClass("hidden");
}
function chartHide() {
    $(".lbmaChart").addClass("hidden");
    $(".lbmaRate").removeClass("hidden");
}

$(document).ready(function () {
    $('.radio-group label').on('click', function () {
        $(this).removeClass('not-active').siblings().addClass('not-active');
    });
    $.fn.editable.defaults.mode = 'popup';
    editable();
});