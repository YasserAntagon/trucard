var isDate = false;
function allFilter() {
    var json = {}
    var cmbConsumer = $('#cmbConsumer').val();
    var cmbPartner = $('#cmbPartner').val();
    if (cmbConsumer && cmbConsumer != "0") {
        json.cTruID = cmbConsumer;
    }
    if (cmbPartner && cmbPartner != "0") {
        json.rTruID = cmbPartner;
    }
    if (isDate) {
        var start = $('#config-demo').data('daterangepicker').startDate._d;
        var end = $('#config-demo').data('daterangepicker').endDate._d;
        json.startDate = start;
        json.endDate = end;
    }
    loadData(json);
}
function returnTitle(title) {
    var str = title.replace("G24K", "").replace("S99P", "");
    var mystr = str.replace("_Dr", "").replace("_Cr", "");
    var drcr = title.includes("Cr") ? "(Cr)" : title.includes("Dr") ? "(Dr)" : ""; 
    return [mystr + " " + " " + drcr, title.includes("G24K")];
}
function loadData(json) {
    $.ajax({
        "url": "/dash/dailyStock", "method": "POST", data: json, success: function (result) {
            $("#dailystockid").empty();
            if (result.result && result.result.length > 0 && Array.isArray(result.result)) {
                var str = "";
                var debit = 0;
                var credit = 0;

                var debit99 = 0;
                var credit99 = 0;
                Object.entries(result.result[0]).map(entry => {
                    if (entry[1] == "0") {
                        return;
                    }
                    let key = returnTitle(entry[0])[0];
                    let url = returnTitle(entry[0])[1] ? "../images/new/gold.png" : "../images/new/silver.png";

                    let value = decimalChopper(entry[1], 4);
                    if(returnTitle(entry[0])[1])
                    {
                        if (parseFloat(entry[1]) > 0) {
                            credit = credit + parseFloat(entry[1]);
                        } else {
                            debit = debit + parseFloat(entry[1]);
                        }
                    }
                    else
                    { 
                        if (parseFloat(entry[1]) > 0) {
                            credit99 = credit99 + parseFloat(entry[1]);
                        } else {
                            debit99 = debit99 + parseFloat(entry[1]);
                        }
                    } 
                    str += `<div class="col-sm-2 col-xs-6">
                    <div class="box box-warning"> 
                        <div class="box-body">
                        <div class="pull-right">
                            <img src="`+ url + `" height="24" width="24" />      
                        </div>
                        <div class="inner">
                            <p style="color: #003443">
                                <span class="fa fa-circle-o-notch fa-spin spinnerRev text-info"></span>
                                <span style="font-size: 14px; font-weight: bold" class="spinnerVal hidden">`+ value + ` gms</span>
                            </p> 
                            <p style="color: gray;text-transform: capitalize">`+ key + `</p>
                        </div>
                        </div>                      
                    </div>
                    </div>`;
                });
                $("#g24kdebit").text(decimalChopper(debit,4)+" gms");
                $("#g24kcredit").text(decimalChopper(credit,4)+" gms");

                $("#s99pdebit").text(decimalChopper(debit99,4)+" gms");
                $("#s99pcredit").text(decimalChopper(credit99,4)+" gms");               

                

                $("#dailystockid").append(str);
                $(".spinnerRev").addClass("hidden")
                $(".spinnerVal").removeClass("hidden");
            }
            else if (result.message) {
                alertify.logPosition("bottom left");
                alertify.error(result.message);
                $("#cmbConsumer").select2("val", "0");
                $("#cmbPartner").select2("val", "0");
            }
            else {
                $("#dailystockid").append(`<div class="col-sm-4 col-sm-offset-4">
                    <div class="box box-warning"> 
                    <div class="box-body">
                    <div class="pull-right">
                        <img src="../images/group_3.png" height="24" width="24" />      
                    </div>
                    <div class="inner"> 
                        <p style="color: gray;text-transform: capitalize">No Record Found</p>
                    </div>
                    </div>                      
                </div>
                </div>`);
                alertify.logPosition("bottom left");
                alertify.error("No record found..!!");
            }
        }
    })
}
$('#cmbPartner').on('change', function (e) {
    allFilter();
})
$(function () {
    bindConsumers();
    bindPartners();
    today()
})
function today() {
    loaddate();
    var start = $('#config-demo').data('daterangepicker').startDate._d;
    var end = $('#config-demo').data('daterangepicker').endDate._d;
    var json = {
        "startDate": start,
        "endDate": end
    }
    loadData(json);
}
function onclear() {
    $("#cmbConsumer").select2("val", "0");
    $("#cmbPartner").select2("val", "0");
    isDate = false;
    today()
}


function loaddate() {
    var options = {
        autoUpdateInput: false,
        locale: {
            cancelLabel: 'Clear'
        }
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
    // attach daterangepicker plugin
    $('#config-demo').daterangepicker(options, function (start, end, label) {
        myCallback(start, end);
    });
    var startDate = moment().subtract(30, 'days');
    var endDate = moment();
    $('#config-demo .form-control').html(startDate.format('MMM DD, YYYY') + '-' + endDate.format('MMM DD, YYYY'));
};
$('#config-demo').on('cancel.daterangepicker', function (ev, picker) {
    isDate = false;
    loaddate();
    filterOnSearch();
});
$('.radio-group label').on('click', function () {
    $(this).removeClass('not-active').siblings().addClass('not-active');
});

const days = (date_1, date_2) => {
    let difference = date_1.getTime() - date_2.getTime();
    let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
    return TotalDays;
}
var myCallback = function (start, end) {
    isDate = true;
    $('#config-demo .form-control').html(start.format('MMM DD, YYYY') + '-' + end.format('MMM DD, YYYY'));
    allFilter();  // call get account statement
}
$('#cmbConsumer').on('change', function (e) {
    $("#cmbPartner").select2("val", "0");
    allFilter();
})