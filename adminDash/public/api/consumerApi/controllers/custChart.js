var $ctruid = $("#txtcTruid").val();
function getchart(myChart, transType, start, end) {
    if (myChart) {
        myChart.destroy();
        config = "";
    }  
    var kycjson = {
        "cTruID": $ctruid,
        "flag": "datewise",
        "startDate": start,
        "endDate": end,
    };
    $('#consumerChartLoader').css("display", 'block');
    if (transType == "purchase") {
        $.ajax({
            "url": "/chartData/getpurchasedata", "method": "POST", data: kycjson, success: function (a) {
                let resource = a.body;
                $('#consumerChartLoader').fadeOut('slow');
                if (resource.status == 200) {
                    if (resource.resource.buyReport.length > 0) {
                        var labels, buydata = resource.resource.buyReport;

                        labels = buydata.map(function (e) {
                            var date = new Date(Date.parse(e.date));
                            var fdate = formatDtChart(date);
                            return fdate;
                        });

                        var data = buydata.map(function (e) {
                            return decimalChopper(e.qtyG24, 2);
                        });
                        var data3 = buydata.map(function (e) {
                            return decimalChopper(e.qtyS99, 2);
                        });
                        viewChart(data, data3, labels)

                    }
                    else {
                        viewChart(data,data3, labels)
                        alertify.error("No record found..!!");
                    }
                }
                else {
                    alertify.error("No record found..!!");
                }
            }
        });
    }
    else if (transType == "sale") {
        $.ajax({
            "url": "/chartData/getsaledata", "method": "POST", data: kycjson, success: function (a) {
                let resource = a.body;
                $('#consumerChartLoader').fadeOut('slow');

                if (resource.status == 200) {
                    if (resource.redeemReport.length > 0) {
                        var labels;

                        labels = resource.redeemReport.map(function (e) {
                            var date = new Date(Date.parse(e.date));
                            var fdate = formatDtChart(date);
                            return fdate;
                        });

                        var data = resource.redeemReport.map(function (e) {
                            return decimalChopper(e.qtyG24, 2);
                        });
                        var data3 = resource.redeemReport.map(function (e) {
                            return decimalChopper(e.qtyS99, 2);
                        });
                        viewChart(data, data3, labels)

                    }
                    else {
                        viewChart(data, data1, data2, data3, labels)
                        alertify.error("No record found..!!");
                    }
                }
                else {
                    alertify.error("No record found..!!");
                }
            }
        });
    }}

