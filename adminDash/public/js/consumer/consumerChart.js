var config, chart_type, transtype;
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
    /* if ($(this).val() == 'purchase') {
        purchase(myChart);
    } else if ($(this).val() == 'sale') {
        sale(myChart);
    } */
    var startDate = moment().subtract(30, 'days');
    var endDate = moment();
    $('#config-date span').html(startDate.format('MMMM D, YYYY') + ' - ' + endDate.format('MMMM D, YYYY'));
    startDate = moment().subtract(30, 'days').format('MM-DD-YYYY');
    endDate = moment().format('MM-DD-YYYY');
    getchart(myChart, transtype, startDate, endDate)
});
$('input[type=radio][name="chart"]').change(function () {
    getchart(myChart, transtype);

});
$(function () {
    chart_type = "line";
    transtype = "purchase";
    var startDate = moment().subtract(30, 'days');
    var endDate = moment();
    $('#config-date span').html(startDate.format('MMMM D, YYYY') + ' - ' + endDate.format('MMMM D, YYYY'));
    startDate = moment().subtract(30, 'days').format('MM-DD-YYYY');
    endDate = moment().format('MM-DD-YYYY');
    getchart(myChart, transtype, startDate, endDate)
})
$(document).ready(function () {
    var options = {
        startDate: moment().subtract(30, 'days'),
        opens: 'right'
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

    // console.log("h")
    // attach daterangepicker plugin
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
    getchart(myChart, transtype, start, end)
}

function viewChart(data, data3, xaxes_lbl) {
    config = {
        type: 'line',
        data: {
            labels: xaxes_lbl,
            datasets: [{
                label: "24K Gold",
                data: data,
                fill: false,
                borderColor: "#e64fd4",
                backgroundColor: "#e64fd4"
            }, {
                label: "99% Silver",
                data: data3,
                fill: false,
                borderColor: "#d17905",
                backgroundColor: "#d17905"
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Unit'

                    },
                    ticks: {
                        beginAtZero: true
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Date'
                    }
                }]

            },
            title: {
                display: true,
                text: 'Bullion Report'
            },
            responsive: true,
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
        }
    };
    change(chart_type);
}
var myChart;


function change(newType) {
    var ctx = document.getElementById("barChart").getContext("2d");
    if (myChart) {
        myChart.destroy();
    }
    // Chart.js modifies the object you pass in. Pass a copy of the object so we can use the original object later
    var temp = jQuery.extend(true, {}, config);
    temp.type = newType;
    myChart = new Chart(ctx, temp);
};