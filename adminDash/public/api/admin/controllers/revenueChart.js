
var config, chart_type, transtype;
var isDateActive = false;
$('.radio-group label').on('click', function () {
    $(this).removeClass('not-active').siblings().addClass('not-active');
});
$('input[type=radio][name="chart_type"]').change(function () {
    chart_type = $(this).val();
    if (myChart) {
        change(chart_type);
    }
});
$('input[type=radio][name="trans_type"]').change(function () {
    transtype = $(this).val();
    var startDate = moment().subtract(30, 'days');
    var endDate = moment();
    $('#config-date span').html(startDate.format('MMMM D, YYYY') + ' - ' + endDate.format('MMMM D, YYYY'));
    startDate = moment().subtract(30, 'days').format('MM-DD-YYYY');
    endDate = moment().format('MM-DD-YYYY');
    getchart(myChart, transtype, startDate, endDate);
});
$('input[type=radio][name="chart"]').change(function () {
    getchart(myChart, transtype);
});
function loadDataOnPage() {
    chart_type = "line";
    transtype = "purchase";
    var startDate = moment().subtract(30, 'days');
    var endDate = moment();
    $('#config-date span').html(startDate.format('MMMM D, YYYY') + ' - ' + endDate.format('MMMM D, YYYY'));
    startDate = moment().subtract(30, 'days').format('MM-DD-YYYY');
    endDate = moment().format('MM-DD-YYYY');
    getchart(myChart, transtype, startDate, endDate);

    var options = {
        startDate: moment().subtract(30, 'days'),
        opens: 'right',
        maxDate: new Date()
    };
    options.ranges =
    {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    };
    $('#config-date').daterangepicker(options, function (start, end, label) {
        myDateCallback(start, end);
    });
}

var myDateCallback = function (start, end) {
    $('#config-date span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
    var start = start.format('MM-DD-YYYY');
    var end = end.format('MM-DD-YYYY');
    callChartDateWise(start, end);  // call get account statement
}

function callChartDateWise(start, end) {
    getchart(myChart, transtype, start, end);
}
function viewChart(data, data1, xaxes_lbl) {
    config = {
        type: 'line',
        data: {
            labels: xaxes_lbl,
            datasets: [{
                label: "Txn Amount",
                data: data,
                fill: false,
                borderColor: "#d99a29",
                backgroundColor: "#d99a29"
            }, {
                label: "Revenue",
                data: data1,
                fill: false,
                borderColor: "#013443",
                backgroundColor: "#013443"
            }]
        },
        options: {
            plugins: {
                datalabels: {
                    color: '#36A2EB'
                }
            },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Partner'

                    },
                    ticks: {
                        beginAtZero: true
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: '₹ (Value in Rupees)'
                    }
                }]

            },
            title: {
                display: true,
                text: 'Revenue Report'
            },
            responsive: true,
            tooltips: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    title: function (item, data) {
                        // Pick first xLabel for now
                        var title = '';

                        if (item.length > 0) {
                            if (item[0].yLabel) {
                                title = item[0].yLabel;
                            } else if (data.labels.length > 0 && item[0].index < data.labels.length) {
                                title = data.labels[item[0].index];
                            }
                        }

                        return title;
                    },

                    label: function (item, data) {
                        var datasetLabel = data.datasets[item.datasetIndex].label || '';
                        return datasetLabel + ': ₹ ' + item.xLabel;
                    }
                },
                mode: 'index',
                axis: 'y'
            },
            hover: {
                mode: 'nearest',
                intersect: true
            }
        }
    };
    $("#viewChart").fadeOut('slow');
    change("horizontalBar");
}
function viewChartconsumer(xaxes_lbl, dataset, xaxis, yaxis) {
    config = {
        type: 'line',
        data: {
            labels: xaxes_lbl,
            datasets: dataset
        },
        options: {
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: yaxis
                    },
                    ticks: {
                        beginAtZero: true
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: xaxis
                    }
                }]
            },
            title: {
                display: true,
                text: 'Top 5 Transactions'
            },
            responsive: true,
            tooltips: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    title: function (item, data) {
                        var title = '';
                        if (item.length > 0) {
                            if (item[0].yLabel) {
                                title = item[0].yLabel;
                            } else if (data.labels.length > 0 && item[0].index < data.labels.length) {
                                title = data.labels[item[0].index];
                            }
                        }
                        return title;
                    },
                    label: function (item, data) {
                        var datasetLabel = data.datasets[item.datasetIndex].label || '';
                        if (datasetLabel == "Amount") {
                            return datasetLabel + ': ₹ ' + item.xLabel;
                        } else {
                            return datasetLabel + ': ' + item.xLabel + ' gms';
                        }
                    }
                },
                axis: 'y'
            },
            hover: {
                mode: 'nearest',
                intersect: true
            }
        }
    };
    $("#viewChart").fadeOut('slow');
    changeconsumer("horizontalBar");
}
function loadActiveTxnFor(json) {
    $(".spinnerActiveVal").addClass("hidden");
    $(".spinnerActiveRev").removeClass("hidden");
    $(".loaderContainer").css("display", "block")
    $.ajax({
        "url": "/dash/getmostActiveTxn", "method": "POST", data: json,
        success: function (res) {
            $('.loaderContainer').fadeOut('slow');
            if (res.status == 200) {
                var higherTxnFor = $('#byActive').attr("selectedText");
                var top = res.resource.map((item) => {
                    item.isPartner = higherTxnFor == "consumer" ? false : true;
                    item.totalAmount = decimalChopper(item.totalAmount, 4);
                    item.revenue = decimalChopper(item.revenue, 4);
                    item.txnArr = item.txnArr.map(itemS => {
                        itemS.type = itemS.type == "buy" || itemS.type == "buyCash" ? "Buy" : itemS.type == "redeemCash" ? "Sell" : itemS.type == "transfer" ? "Transfer" : itemS.type;
                        itemS.total = decimalChopper(itemS.total, 4);
                        itemS.s99p = decimalChopper(itemS.s99p, 4);
                        itemS.g24k = decimalChopper(itemS.g24k, 4);
                        return itemS;
                    })
                    return item;
                });
                $(".top5ActiveTxn").empty();
                var list = $("#top5ActiveTxn").html();
                var html = Mustache.to_html(list, { "top5Txn": top });
                $(".top5ActiveTxn").html(html);
                $(".spinnerActiveVal").removeClass("hidden");
                $(".spinnerActiveRev").addClass("hidden");
                $('.loaderContainer').fadeOut('slow');
            }
            else {
                $(".top5ActiveTxn").empty();
                $(".spinnerActiveVal").removeClass("hidden");
                $(".spinnerActiveRev").addClass("hidden");
                $('.loaderContainer').fadeOut('slow');
            }
        }
    })
}

function loadTxnFor(txnon, higherTxnFor, resource) {
    $(".spinnerDVal").addClass("hidden");
    $(".spinnerDRev").removeClass("hidden");
    var topconsumer = resource.topfiveConsumers.map(e => {
        e.totalAmount = decimalChopper(e.totalAmount, 4);
        e.companyName = e.consumerName;
        var qty = parseFloat(e.g24qty) > 0 ? e.g24qty : e.s99qty;
        var truCoin = parseFloat(e.g24qty) > 0 ? "TruCoin Gold" : "TruCoin Silver";
        var title = e.type == "buy" ? "Buy" : e.type == "redeemCash" ? "Sell" : e.type == "transfer" ? "Transfer" : e.type;
        e.type = title;
        e.truCoin = truCoin;
        e.qty = decimalChopper(qty, 4);
        e.isGold = txnon == "amount" ? false : true;
        return e;
    });
    $(".top5Reportconsumer").empty();
    var list = $("#top5consumerReport").html();
    var html = Mustache.to_html(list, { "top5Txn": topconsumer });
    $(".top5Reportconsumer").html(html);
    $(".spinnerDVal").removeClass("hidden");
    $(".spinnerDRev").addClass("hidden");
    $('.loaderContainer').fadeOut('slow');
}
function onType(e) {
    $(".loaderContainer").css("display", "block")
    var higherTxnFor = $('#byTopTxn').attr("selectedText");
    var txnon = $(e).val();
    loadTxnFor(txnon, higherTxnFor, cdata)
}
function onTxnFor(higherTxnFor) {
    $(".loaderContainer").css("display", "block")
    var txnon = $('input[name="txnon"]:checked').val();
    loadTxnFor(txnon, higherTxnFor, cdata);
}
$("#cmbConsumerhighertxn").on("change", function () {
    $(".loaderContainer").css("display", "block")
    var start = $('#config-demoActive').data('daterangepicker').startDate._d;
    var end = $('#config-demoActive').data('daterangepicker').endDate._d;
    var higherTxnFor = $('#byActive').attr("selectedText");
    var byTop = $('#byTop').attr("selectedText");
    var ctruID = $('#cmbConsumerhighertxn').val();
    var json = {
        "flag": higherTxnFor,
        "top": byTop
    }
    if (ctruID != "0") {
        json.uTruID = ctruID;
    }
    if (isDateActive) {
        json.startDate = start;
        json.endDate = end;
    }
    loadActiveTxnFor(json);
})
function refreshActiveClick() {
    $('#byActive').attr("selectedText", "consumer")
    $("#byActive").text("Consumer");
    isDateActive = false;
    $('#byTimeActive').attr("selectedText", "all")
    $("#byTimeActive").text("All Time");

    $('#byTop').attr("selectedText", "5")
    $("#byTop").text("Top 5");


    demoActive();
    onActiveTxnFor("consumer")
}

function onActiveTxnFor(higherTxnFor) {
    $(".loaderContainer").css("display", "block")
    var start = $('#config-demoActive').data('daterangepicker').startDate._d;
    var end = $('#config-demoActive').data('daterangepicker').endDate._d;
    var higherTxnFor = $('#byActive').attr("selectedText");
    var byTop = $('#byTop').attr("selectedText");
    var json = {
        "flag": higherTxnFor,
        "top": byTop
    }
    if (isDateActive) {
        json.startDate = start;
        json.endDate = end;
    }
    loadActiveTxnFor(json);
    bindModalConsumerstohighertxnlist("all");
}

var myChart;
var myChartconsumer, cdata, cdata1, cdata2, clabels, partnerdata, partnerdata1, partnerdata2, partnerlabels,
    lblstrgram = 'Grams (Value in grams)',
    lblstr = '₹ (Value in Rupees)',
    yaxislabel = "Consumer";


function change(newType) {
    /* var ctx = document.getElementById("canvas").getContext("2d");
    if (myChart) {
        myChart.destroy();
    }

    // Chart.js modifies the object you pass in. Pass a copy of the object so we can use the original object later
    var temp = jQuery.extend(true, {}, config);
    temp.type = newType;
    myChart = new Chart(ctx, temp); */
};
function changeconsumer(newType) {
    /* var ctx1 = document.getElementById("consumercanvas").getContext("2d");
    if (myChartconsumer) {
        myChartconsumer.destroy();
    }
    // Chart.js modifies the object you pass in. Pass a copy of the object so we can use the original object later
    var temp = jQuery.extend(true, {}, config);
    temp.type = newType;
    myChartconsumer = new Chart(ctx1, temp); */


};


function getPayoutValues() {
    $(".spinnerPay").addClass("hidden")
    $(".spinnerDash").removeClass("hidden")
    $(".loaderContainer").css("display", "block")
    $.ajax({
        "url": "/dash/getPayoutValues", "method": "POST", success: function (a) {
            let res = a.body;
            $('.loaderContainer').fadeOut('slow');
            if (res.status == 200) {
                var resource = res.resource

                var totalPayout = resource.totalPayout ? parseFloat(resource.totalPayout) : 0;
                var todayPayout = resource.todayPayout ? parseFloat(resource.todayPayout) : 0;
                var yesterdayPayout = resource.yesterdayPayout ? parseFloat(resource.yesterdayPayout) : 0;
                var weekPayout = resource.weekPayout ? parseFloat(resource.weekPayout) : 0;
                var monthPayout = resource.monthPayout ? parseFloat(resource.monthPayout) : 0;
                /*  if (todayPayout <= 0) {
                     $(".todayPayout").parent().css('width', "0");
                     $(".vtodayPayout").parent().css('width', "100%");
                     $(".vtodayPayout").html(" ₹ " + decimalChopper(todayPayout, 2));
                 }
                 if (yesterdayPayout <= 0) {
                     $(".yesterdayPayout").parent().css('width', "0");
                     $(".vyesterdayPayout").parent().css('width', "100%");
                     $(".vyesterdayPayout").html(" ₹ " + decimalChopper(yesterdayPayout, 2));
                 }
                 if (todayPayout > yesterdayPayout) {
                     $(".todayPayout").parent().css('width', todayPayout == 0 ? "100%" : "40%");
                     $(".vtodayPayout").parent().css('width', todayPayout == 0 ? "100%" : "60%");
                     $(".yesterdayPayout").parent().css('width', yesterdayPayout == 0 ? "100%" : "20%");
                     $(".vyesterdayPayout").parent().css('width', yesterdayPayout == 0 ? "100%" : "80%");
                 }
                 else if (todayPayout < yesterdayPayout) {
                     $(".todayPayout").parent().css('width', todayPayout == 0 ? "100%" : "20%");
                     $(".vtodayPayout").parent().css('width', todayPayout == 0 ? "100%" : "80%");
                     $(".yesterdayPayout").parent().css('width', yesterdayPayout == 0 ? "100%" : "40%");
                     $(".vyesterdayPayout").parent().css('width', yesterdayPayout == 0 ? "100%" : "60%");
                 }
                 if (weekPayout <= 0) {
                     $(".weekPayout").parent().css('width', "0");
                     $(".vweekPayout").parent().css('width', "100%");
                     $(".vweekPayout").html(" ₹ " + decimalChopper(weekPayout, 2));
                 }
                 if (monthPayout <= 0) {
                     $(".monthPayout").parent().css('width', "0");
                     $(".vmonthPayout").parent().css('width', "100%");
                     $(".vmonthPayout").html(" ₹ " + decimalChopper(monthPayout, 2));
                 } */
                $(".todayPayout").html(" ₹ " + decimalChopper(todayPayout, 2));
                $(".yesterdayPayout").html(" ₹ " + decimalChopper(yesterdayPayout, 2));
                $(".weekPayout").html(" ₹ " + decimalChopper(weekPayout, 2));
                $(".monthPayout").html(" ₹ " + decimalChopper(monthPayout, 2));
                $(".totalPayout").html(" ₹ " + decimalChopper(totalPayout, 2));

                $(".spinnerPay").removeClass("hidden")
                $(".spinnerDash").addClass("hidden")

            }
        }
    });
}
function revenueSync(partnerFlag, truID) {
    $(".spinnerVal").addClass("hidden")
    $(".spinnerRev").removeClass("hidden")
    $(".loaderContainer").css("display", "block")
    var json = { flag: partnerFlag }
    if (truID) {
        json.rTruID = truID
    }
    $.ajax({
        "url": "/dash/getRevenueChart", "method": "POST", data: json,

        success: function (a) {
            let res = a.body;
            $('.loaderContainer').fadeOut('slow');
            if (res.status == 200) {
                var resource = res.resource
                //===============entity revenue Graph=======================
                /*   var edata = resource.partnerRevenue.map(function (e) {
                      return decimalChopper(e.totalAmount, 2);
                  });
                  var edata1 = resource.partnerRevenue.map(function (e) {
                      return decimalChopper(e.revenue, 2);
                  });
                  var elabels = resource.partnerRevenue.map(function (e) {
                      return e.companyName.replace("null", "")
                  }); */
                //  viewChart(edata, edata1, elabels);

                //===============Consumer Graph=======================
                /* cdata = resource.topfiveConsumers.map(function (e) {
                    return decimalChopper(e.totalAmount, 2);
                });
                cdata1 = resource.topfiveConsumers.map(function (e) {
                    return decimalChopper(e.g24qty, 2);
                });
                cdata2 = resource.topfiveConsumers.map(function (e) {
                    return decimalChopper(e.s99qty, 2);
                });
                clabels = resource.topfiveConsumers.map(function (e) {
                    // console.log("e.consumerName", e)
                    var title = e.type == "buy" ? "(Buy)" : e.type == "redeemCash" ? "(Sell)" : e.type == "transfer" ? "(Transfer)" : e.type;
                    return e.consumerName + "\n" + title;
                });  */

                //===============Partner Graph=================================
                var top = resource.partnerRevenue.map(item => {
                    item.totalAmount = decimalChopper(item.totalAmount, 4);
                    item.revenue = decimalChopper(item.revenue, 4);
                    return item;
                })
                $(".top5Report").empty();
                var list = $("#top5Report").html();
                var html = Mustache.to_html(list, { "partnerRevenue": top });
                $(".top5Report").html(html);
                cdata = resource;
                loadTxnFor("amount", "consumer", resource);



                /*  partnerdata = resource.topfivePartners.map(function (e) {
                     return decimalChopper(e.totalAmount, 2);
                 });
                 partnerdata1 = resource.topfivePartners.map(function (e) {
                     return decimalChopper(e.g24qty, 2);
                 });
                 partnerdata2 = resource.topfivePartners.map(function (e) {
                     return decimalChopper(e.s99qty, 2);
                 });
                 partnerlabels = resource.topfivePartners.map(function (e) {
                     var title = e.type == "buy" ? "(Buy)" : e.type == "redeemCash" ? "(Sell)" : e.type == "transfer" ? "(Transfer)" : e.type;
                     return e.companyName.replace("null", "") + "\n" + title;
                 });
 
                 var datasets = [{
                     label: "Amount",
                     data: cdata,
                     fill: false,
                     borderColor: "#d99a29",
                     backgroundColor: "#d99a29"
                 }] */
                // viewChartconsumer(clabels, datasets, lblstr, yaxislabel);

                var todayRevenue = resource.todayRevenue.length > 0 ? parseFloat(resource.todayRevenue[0].revenue) : 0;
                var yesterdayRevenue = resource.yesterdayRevenue.length > 0 ? parseFloat(resource.yesterdayRevenue[0].revenue) : 0;
                var weekRevenue = resource.weekRevenue.length > 0 ? parseFloat(resource.weekRevenue[0].revenue) : 0;
                var monthRevenue = resource.monthRevenue.length > 0 ? parseFloat(resource.monthRevenue[0].revenue) : 0;
                var totalRevenue = resource.totalRevenue.length > 0 ? parseFloat(resource.totalRevenue[0].revenue) : 0;
                /* if (todayRevenue <= 0) {
                    $(".todayRevenue").parent().css('width', "0");
                    $(".vtodayRevenue").parent().css('width', "100%");
                    $(".vtodayRevenue").html(" ₹ " + decimalChopper(todayRevenue, 2));
                }
                if (yesterdayRevenue <= 0) {
                    $(".yesterdayRevenue").parent().css('width', "0");
                    $(".vyesterdayRevenue").parent().css('width', "100%");
                    $(".vyesterdayRevenue").html(" ₹ " + decimalChopper(yesterdayRevenue, 2));
                }
                if (todayRevenue > yesterdayRevenue) {
                    $(".todayRevenue").parent().css('width', todayRevenue == 0 ? "0%" : "40%");
                    $(".vtodayRevenue").parent().css('width', todayRevenue == 0 ? "100%" : "60%");
                    $(".yesterdayRevenue").parent().css('width', yesterdayRevenue == 0 ? "0%" : "20%");
                    $(".vyesterdayRevenue").parent().css('width', yesterdayRevenue == 0 ? "100%" : "80%");
                }
                else if (todayRevenue < yesterdayRevenue) {
                    $(".todayRevenue").parent().css('width', todayRevenue == 0 ? "0%" : "20%");
                    $(".vtodayRevenue").parent().css('width', todayRevenue == 0 ? "100%" : "80%");
                    $(".yesterdayRevenue").parent().css('width', yesterdayRevenue == 0 ? "0%" : "40%");
                    $(".vyesterdayRevenue").parent().css('width', yesterdayRevenue == 0 ? "100%" : "60%");
                }
                if (weekRevenue <= 0) {
                    $(".weekRevenue").parent().css('width', "0");
                    $(".vweekRevenue").parent().css('width', "100%");
                    $(".vweekRevenue").html(" ₹ " + decimalChopper(weekRevenue, 2));
                }
                if (monthRevenue <= 0) {
                    $(".monthRevenue").parent().css('width', "0");
                    $(".vmonthRevenue").parent().css('width', "100%");
                    $(".vmonthRevenue").html(" ₹ " + decimalChopper(monthRevenue, 2));
                } */

                $(".todayRevenue").html(" ₹ " + decimalChopper(todayRevenue, 2));
                $(".yesterdayRevenue").html(" ₹ " + decimalChopper(yesterdayRevenue, 2));
                $(".weekRevenue").html(" ₹ " + decimalChopper(weekRevenue, 2));
                $(".monthRevenue").html(" ₹ " + decimalChopper(monthRevenue, 2));
                $(".totalRevenue").html(" ₹ " + decimalChopper(totalRevenue, 2));
                $(".spinnerVal").removeClass("hidden");
                $(".spinnerRev").addClass("hidden");
            }
        }
    });
}
function Top5TransactionsDateWaise(vjson, payout) {
    $(".loaderContainer").css("display", "block")
    $.ajax({
        "url": "/dash/getRevenueChart", "method": "POST", data: vjson, success: function (a) {
            let res = a.body;
            $('.loaderContainer').fadeOut('slow');
            if (res.status == 200) {
                var resource = res.resource;
                if (payout == "payout") {
                    cdata = resource;
                    var higherTxnFor = $('#byTopTxn').attr("selectedText");
                    var txnon = $('input[name="txnon"]:checked').val();
                    loadTxnFor(txnon, higherTxnFor, cdata)
                }
                else if (payout == "revenue") {
                    var top = resource.partnerRevenue.map(item => {
                        item.totalAmount = decimalChopper(item.totalAmount, 4);
                        item.revenue = decimalChopper(item.revenue, 4);
                        return item;
                    })
                    $(".top5Report").empty();
                    var list = $("#top5Report").html();
                    var html = Mustache.to_html(list, { "partnerRevenue": top });
                    $(".top5Report").html(html);
                    $(".spinnerVal").removeClass("hidden");
                    $(".spinnerRev").addClass("hidden");
                }
            }
        }
    });
}
var my5TransactionsCallback = function (start, end) {
    $('#config-demoTop .form-control').html(start.format('MMM DD, YYYY') + '-' + end.format('MMM DD, YYYY'));
    var start = $('#config-demoTop').data('daterangepicker').startDate._d;
    var end = $('#config-demoTop').data('daterangepicker').endDate._d;
    isDate = true;
    get5TransactionsDateWaise(start, end);  // call get account statement
}
function loaddate() {
    var options = {};
    options.ranges =
    {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    };
    // attach daterangepicker plugin
    $('#config-demoTop').daterangepicker(options, function (start, end, label) {
        my5TransactionsCallback(start, end);
    });
    var startDate = moment().subtract(30, 'days');
    var endDate = moment();
    $('#config-demoTop .form-control').html(startDate.format('MMM DD, YYYY') + '-' + endDate.format('MMM DD, YYYY'));
};
loaddate();

function demoActive() {
    var options = {};
    options.ranges =
    {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    };
    // attach daterangepicker plugin
    $('#config-demoActive').daterangepicker(options, function (start, end, label) {
        $('#config-demoActive .form-control').html(start.format('MMM DD, YYYY') + '-' + end.format('MMM DD, YYYY'));
        var start = $('#config-demoActive').data('daterangepicker').startDate._d;
        var end = $('#config-demoActive').data('daterangepicker').endDate._d;
        isDateActive = true;
        var higherTxnFor = $('#byActive').attr("selectedText");
        var json = {
            "startDate": start,
            "endDate": end,
            "flag": higherTxnFor
        }
        loadActiveTxnFor(json);
    });
    var startDate = moment().subtract(30, 'days');
    var endDate = moment();
    $('#config-demoActive .form-control').html(startDate.format('MMM DD, YYYY') + '-' + endDate.format('MMM DD, YYYY'));
};
demoActive();

function refreshClick() {
    loaddate();
    loaddateRevenue();
    revenueSync("partner");
}
var get5TransactionsDateWaise = function (start, end)                 // On Selected Date to bind Account Transaction
{
    var json = {
        "startDate": start,
        "endDate": end,
        "dateFlag": true
    }
    Top5TransactionsDateWaise(json, "payout");
}
var get5TransactionsDateWaise = function (start, end)                 // On Selected Date to bind Account Transaction
{
    var json = {
        "startDate": start,
        "endDate": end,
        "dateFlag": true
    }
    Top5TransactionsDateWaise(json, "payout");
}
function loaddateRevenue() {
    var options = {};
    options.ranges =
    {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    };
    $('#config-demo .form-control').daterangepicker(options, function (start, end) {
        my5RevenueCallback(start, end);
    });
    var startDate = moment().subtract(30, 'days');
    var endDate = moment();
    $('#config-demo .form-control').html(startDate.format('MMM DD, YYYY') + '-' + endDate.format('MMM DD, YYYY'));
};
loaddateRevenue();

var my5RevenueCallback = function (start, end) {
    $('#config-demo .form-control').html(start.format('MMM DD, YYYY') + '-' + end.format('MMM DD, YYYY'));
    var start = $('#config-demo').data('daterangepicker').startDate._d;
    var end = $('#config-demo').data('daterangepicker').endDate._d;
    isDate = true;
    get5RevenueDateWaise(start, end);  // call get account statement
}
/* function callTop5Revenue(istime){
    var start,end;
    if(istime=="1"){
        start=moment().subtract(1, 'h').format('MMM DD, YYYY HH:mm:ss');
        end=moment().format('MMM DD, YYYY HH:mm:ss');
    }
    else if(istime=="6"){
        start=moment().subtract(6, 'h').format('MMM DD, YYYY HH:mm:ss');
        end=moment().format('MMM DD, YYYY HH:mm:ss');
    }
    var myDateStart = new Date(start);
    var myDateEnd = new Date(end);
    get5RevenueDateWaise(myDateStart, myDateEnd);
}
function callHigh5Txn(istime){
    var start,end;
    if(istime=="1"){
        start=moment().subtract(1, 'h').format('MMM DD, YYYY HH:mm:ss');
        end=moment().format('MMM DD, YYYY HH:mm:ss');
    }
    else if(istime=="6"){
        start=moment().subtract(6, 'h').format('MMM DD, YYYY HH:mm:ss');
        end=moment().format('MMM DD, YYYY HH:mm:ss');
    }
    var myDateStart = new Date(start);
    var myDateEnd = new Date(end);
    get5TransactionsDateWaise(myDateStart, myDateEnd);
} */
var get5RevenueDateWaise = function (start, end)                 // On Selected Date to bind Account Transaction
{
    var json = {
        "startDate": start,
        "endDate": end,
        "dateFlag": true
    }
    Top5TransactionsDateWaise(json, "revenue");
}
/* function stockpichart(sG24K, sS99P) {
    data = {
        datasets: [{
            data: [sG24K, sS99P],
            backgroundColor: ["#d99a29", "#013443"],
            borderColor: ["#d99a29", "#013443"]
        }],

        // These labels appear in the legend and in the tooltips when hovering different arcs
        labels: [
            'TruGold',
            'TruSilver'
        ]
    };


    var ctx = document.getElementById('stockPie').getContext('2d');
    ctx.height = "100px";
    var myPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            legend: {
                display: false
            },
            tooltips: {
                callbacks: {
                    label: function (item, data) {
                        var datasetLabel = data.labels[item.index] || '';
                        return datasetLabel + ':' + data.datasets[item.datasetIndex].data[item.index] + ' gms';
                    }
                },
            },
        }
    });
} */
function consumerPiechart(sG24K, sS99P) {
    data = {
        datasets: [{
            data: [sG24K, sS99P],
            backgroundColor: ["#d99a29", "#013443"],
            borderColor: ["#d99a29", "#013443"]
        }],
        labels: [
            '',
            'Channel'
        ]
    };
    var ctx = document.getElementById('consumerPie').getContext('2d');
    ctx.height = "80px";
    var myPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            legend: {
                display: false
            }
        }
    });
}
function partnerPiechart(sG24K, sS99P) {
    data = {
        datasets: [{
            data: [sG24K, sS99P],
            backgroundColor: ["#d99a29", "#013443"],
            borderColor: ["#d99a29", "#013443"]
        }],
        labels: [
            'Partner',
            'Partners'
        ]
    };
    var ctx = document.getElementById('partnerPie').getContext('2d');
    ctx.height = "80px";
    var myPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            legend: {
                display: false
            },
        }
    });
}
function ratePiechart(sG24K, sS99P) {
    data = {
        datasets: [{
            data: [sG24K, sS99P],
            backgroundColor: ["#d99a29", "#013443"],
            borderColor: ["#d99a29", "#013443"]
        }],
        labels: [
            'eGold',
            'eSilver'
        ]
    };


    var ctx = document.getElementById('ratePie').getContext('2d');
    ctx.height = "80px";
    var myPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            legend: {
                display: false
            },
            tooltips: {
                callbacks: {
                    label: function (item, data) {
                        var datasetLabel = data.labels[item.index] || '';
                        return datasetLabel + ': ₹ ' + data.datasets[item.datasetIndex].data[item.index];
                    }
                },
            },
        }
    });
}
function revenueTxnFor(e) {
    var txnsof = $(e).val();
    if (txnsof == "partner") {
        $("#cmbPartnerDash").removeAttr("disabled");
    }
    else {
        $("#cmbPartnerDash").attr("disabled", "disabled");
    }
    $("#cmbPartnerDash").select2("val", "0");
    revenueSync(txnsof);
}
$(function () {
    $('#cmbPartnerDash').change(function () {
        var truID = $(this).val();
        var txnsof = ($('input[name="revenueTxnFor"]:checked').val());
        console.log("txnsof", txnsof)
        if (truID == 0) {
            revenueSync(txnsof, "");
        }
        else {
            revenueSync("partner", truID);
        }
    });
    loadActiveTxnFor({ flag: "consumer" })
})
revenueSync("partner");
getPayoutValues();