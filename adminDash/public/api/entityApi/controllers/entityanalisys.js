$(function () {
    var $ctruid = $("#txteTruid").val();
    var startDate = moment().subtract(30, 'days');
    var endDate = moment();
    $('#config-date span').html(startDate.format('MMMM D, YYYY') + ' - ' + endDate.format('MMMM D, YYYY'));
    startDate = moment().subtract(30, 'days').format('MM-DD-YYYY');
    endDate = moment().format('MM-DD-YYYY');
    commissionChart($ctruid, startDate, endDate)
})
$(document).ready(function () {
    var options = {
        startDate: moment().subtract(30, 'days'),
        opens: 'left'
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
});

var myDateCallback = function (start, end) { 
    $('#config-date span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
    var start = start.format('MM-DD-YYYY');
    var end = end.format('MM-DD-YYYY');
    callChartDateWise(start, end);  // call get account statement
}

function callChartDateWise(start, end) {
    var $ctruid = $("#txteTruid").val();
    commissionChart($ctruid, start, end) 
}
var myChart;
function commissionChart(ctruid, startDate, endDate) { 
    var json = { 
        "rTruID": ctruid,
        "startDate": startDate,
        "endDate": endDate
    }

    // Remove the old chart and all its event handles
    if (myChart) {
        myChart.destroy();
    }
    $('#loader').css("display", 'block');
    $.ajax({
        "url": "/eConsumer/getCommission", "method": "POST", data: json, success: function (a) {
            let res = a.body;
            $('#loader').fadeOut('slow');
            // use value here
            if (res.status == 200) {
                resource = res.resource;
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
                        return decimalChopper(e.averageSales,2);
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

// var resetCanvas = function () {
//     $('#canvas').remove(); // this is my <canvas> element
//     $('.chart').append('<canvas id="canvas"><canvas>');
// };