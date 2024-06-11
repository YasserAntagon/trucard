// author : Nikhil Bharambe
// date : 04-FEB-2022 
var isDate = false;
function filterClick() {
    var txtReceiptNo = $('#txtReceiptNo').val();
    if ($('#isReceipt').is(':checked')) {
        if (txtReceiptNo == "") {
            alertify.logPosition("bottom left");
            alertify.error('Please Enter Receipt Number');
            return false;
        }
        else {
            var json = {};
            allFilter(json, txtReceiptNo);
        }
    } else {
        var json = {};
        allFilter(json, "");
    }
    $("#exampleModal").modal('hide');
}
function allFilter(json, txtReceiptNo) {
    var selfentity = $('#byOptions').val();
    var bySort = $('#bySort').attr("selectedText");
    if (bySort && bySort != "all") {
        json.sortBy = bySort;
    }
    var byKyc = $('#byKyc').attr("selectedText")
    if (byKyc && byKyc != "all") {
        json.kycStatus = byKyc;
    }
    var cmbConsumer = $('#cmbConsumer').val();
    var cmbPartner = $('#cmbPartner').val();
    var wtype = $('#operations').val();
    var filter = $('.status-dropdownBuy').val();
    var filterQty = $('.status-dropdownQty').val();
    if (isDate) {
        var start = $('#config-demo').data('daterangepicker').startDate._d;
        var end = $('#config-demo').data('daterangepicker').endDate._d;
        json.startdate = start;
        json.enddate = end;
    }
    if (filter == "addMoney" || filter == "walletToBank" || wtype == "wallet") {
        $(".walletOps").removeClass("hidden");
        $(".consumerTrans").addClass("hidden");

        if (cmbConsumer && cmbConsumer != "0") {
            json.cTruID = cmbConsumer
        }
        else if (cmbPartner && cmbPartner != "0") {
            json.rTruID = cmbPartner
        }
        var flag = filter == "addMoney" || filter == "walletToBank" ? "wallet" : wtype;
        json.flag = flag;
        json.stype = "success";
        json.isPartner = selfentity == "consumer" ? false : true;
        if (filter && filter != "0") {
            json.type = filter
        }
        if ($('#isStockfilter').is(':checked')) {
            json.isfilterByQty = true; 
            json.filterBulType = filterQty; 
            json.QtyRangeMax = $("#qtyMax").val(); 
            json.QtyRangeMin = $("#qtyMin").val(); 
        }
        if (txtReceiptNo == "") {
            loadWalletInTable(json);
        }
        else {
            var json = { invoice: txtReceiptNo };
            loadWalletInTable(json);
        }
    }
    else {
        if (cmbConsumer && cmbConsumer != "0") {
            json.to = cmbConsumer
        }
        if (cmbPartner && cmbPartner != "0") {
            json.rTruID = cmbPartner
        }
        $(".walletOps").addClass("hidden")
        $(".consumerTrans").removeClass("hidden")
        var successSelected = $('input[name=success]:checked').val();
        var PGSelected = $('input[name=PGsuccess]:checked').val();

        json.isPartner = selfentity == "consumer" ? false : true;
        if (PGSelected != "all") {
            json.MOP = PGSelected
        }
        if (successSelected && successSelected != "all") {
            json.status = successSelected
        }
        if (filter && filter != "0") {
            json.type = filter
        }
        if ($('#isStockfilter').is(':checked')) {
            json.isfilterByQty = true; 
            json.filterBulType = filterQty; 
            json.QtyRangeMax = $("#qtyMax").val(); 
            json.QtyRangeMin = $("#qtyMin").val(); 
        }
        console.log("json", json)
        if (txtReceiptNo == "") {
            displayTable(json, selfentity);
        }
        else {
            var json = { invoice: txtReceiptNo };
            displayTable(json, selfentity);
        }
    }
}
function Clear() {
    $("#txtReceiptNo").tagsinput('removeAll');
    $('#searchbyinvoice').addClass("hidden");    
    $("#isStockfilter").prop('checked', false)
    $('#stockrange').addClass("hidden");
    $('#byKyc').attr("selectedText", "all")
    $("#byKyc").text("A/C Status");

    $('#bySort').attr("selectedText", "all")
    $("#bySort").text("desc");

    $('#byTime').attr("selectedText", "all")
    $("#byTime").text("All Time");
    $('#operations').removeAttr("disabled");
    $('#cmbConsumer').removeAttr("disabled");
    $('#byOptions').removeAttr("disabled");
    $("#success").prop("checked", true);
    $("#PGAll").prop("checked", true);
    $('.successch').removeClass("not-active");
    $('.failedchk').addClass("not-active");
    $('.PGch').addClass("not-active");
    $('.allch').removeClass("not-active").addClass("active");
    $(".consumerTrans").removeClass("hidden");
    $(".walletOps").addClass("hidden");
    $('#operations').children('option[value="wallet"]').removeAttr('disabled', "disabled")
    $('.status-dropdownBuy').val("");
    $('.status-dropdownQty').val("G24K");
    $('#byOptions').val("consumer");
    $('#operations').val("");
    $('.pointerClick').removeClass("pointerReceipt");
    $("#cmbConsumer").select2("val", "0");
    $("#cmbPartner").select2("val", "0");
    $('#txtReceiptNo').val("");
    $('.pointerClick').removeClass("pointerReceipt");
    $('#cmbPartner').removeAttr("disabled");
    $('#cmbConsumer').removeAttr("disabled");
}

function refreshClick() {
    loaddate();
    Clear();

    $("#isReceipt").prop('checked', false)
    isDate = false;
    var json = {};
    displayTable(json);
    $("#exampleModal").modal('hide');
}

function clearClick() {
    loaddate();
    Clear();

    $("#isReceipt").prop('checked', false)
    $('.status-dropdownBuy').removeAttr("disabled");
    isDate = false;
}
$('#operations').on('change', function (e) {
    var selfentity = $('#byOptions').val();
    if (selfentity == "self") {
        $("#cmbConsumer").select2("val", "0");
        $("#cmbConsumer").attr("disabled", "disabled")
    }
    else {
        $("#cmbConsumer").removeAttr("disabled")
    }
})
$('#byOptions').on('change', function (e) {
    var status = $(this).val();
    if (status == "self") {
        $("#cmbConsumer").select2("val", "0");
        $("#cmbConsumer").attr("disabled", "disabled")
        $('#operations').children('option[value="wallet"]').removeAttr('disabled', "disabled")
    }
    else {
        $('#operations').children('option[value="wallet"]').attr('disabled', "disabled")
        $("#cmbConsumer").removeAttr("disabled")
    }
})

function onModalShow() {
    $('.status-dropdownBuy').removeAttr("disabled");
    $('#cmbPartner').removeAttr("disabled");
    $('#cmbConsumer').removeAttr("disabled");
    $("#isReceipt").removeAttr("checked");
    //  $('#txtReceiptNo').attr("disabled", "disabled");
    $("#exampleModal").modal("toggle");
    $('.pointerClick').removeClass("pointerReceipt");
    if ($("#isAdmin").val() == "false") {
        $('#part').addClass("hidden");
    }
    setTimeout(() => {
        loaddate();
    }, 200);
}


$(function () {

    $('#isReceipt').change(function () {
        if (this.checked) {
            Clear();
            isDate = false;
         //   $('#txtReceiptNo').removeAttr("disabled");
            $('.status-dropdownBuy').attr("disabled", "disabled");
            $('#cmbPartner').attr("disabled", "disabled");
            $('#cmbConsumer').attr("disabled", "disabled");
            $('.pointerClick').addClass("pointerReceipt");
            $('#operations').attr("disabled", "disabled");
            $('#byOptions').attr("disabled", "disabled");
             $('#searchbyinvoice').removeClass("hidden");
        }
        else {
            $('#searchbyinvoice').addClass("hidden");
            $('#operations').removeAttr("disabled");
            $('.pointerClick').removeClass("pointerReceipt");
            $('.status-dropdownBuy').removeAttr("disabled");
            $('#cmbPartner').removeAttr("disabled");
            $('#cmbConsumer').removeAttr("disabled");
            $('#byOptions').removeAttr("disabled");
          //  $('#txtReceiptNo').attr("disabled", "disabled");
        }
    });
    $('#isStockfilter').change(function () {
        console.log("here")
        if (this.checked) {
            $('#stockrange').removeClass("hidden");
            $("#isReceipt").prop('checked', false);
            $("#txtReceiptNo").tagsinput('removeAll');
            $('#searchbyinvoice').addClass("hidden"); 
            $('#operations').removeAttr("disabled");
            $('.pointerClick').removeClass("pointerReceipt");
            $('.status-dropdownBuy').removeAttr("disabled");
            $('#cmbPartner').removeAttr("disabled");
            $('#cmbConsumer').removeAttr("disabled");
            $('#byOptions').removeAttr("disabled");
        } else {
            $('#stockrange').addClass("hidden");
        }
    })
})

