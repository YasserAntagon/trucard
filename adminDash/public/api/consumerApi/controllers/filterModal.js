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
    }
    var $ctruid = $("#txtcTruid").val();
    var filter = $('.status-dropdownBuy').val();
    var json = {};
    if (txtReceiptNo == "") {
        if (isDate) {
            var start = $('#config-demo').data('daterangepicker').startDate._d;
            var end = $('#config-demo').data('daterangepicker').endDate._d;
            json.startdate = start;
            json.enddate = end;
        }

        if ($ctruid) {
            json.to = $ctruid
        }
        var successSelected = $('input[name=success]:checked').val();
        var PGSelected = $('input[name=PGsuccess]:checked').val();

        json.isPartner = false;
        if (PGSelected != "all") {
            json.MOP = PGSelected
        }
        if (successSelected && successSelected != "all") {
            json.status = successSelected
        }
        if (filter && filter != "0") {
            json.type = filter
        }
    }
    else {
        json.invoice = txtReceiptNo
    }
    var wType = $('input[name=wallet]:checked').val();
    if (wType == "wallet") { 
        loadWalletInTable(json);
    }
    else {
        displayTable(json);
    }
    $("#exampleModal").modal("toggle");
}

function Clear() {
    $("#txtReceiptNo").tagsinput('removeAll');
    $('#searchbyinvoice').addClass("hidden");
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
    var $ctruid = $("#txtcTruid").val();

    isDate = false;
    var json = {};
    if ($ctruid) {
        json.to = $ctruid
    }
    displayTable(json);
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
    //   $('#txtReceiptNo').attr("disabled", "disabled");
    $("#exampleModal").modal("toggle");
    $('.pointerClick').removeClass("pointerReceipt");
    if ($("#isAdmin").val() == "false") {
        $('#part').addClass("hidden")
    }
    setTimeout(() => {
        loaddate();
    }, 200)
}

$(function () {
    /*  bindModalPartners();
     bindModalConsumers(); */

    $('#isReceipt').change(function () {
        if (this.checked) {
            Clear();
            isDate = false;
            //   $('#txtReceiptNo').removeAttr("disabled");
            $('.status-dropdownBuy').attr("disabled", "disabled");
            $('#cmbPartner').attr("disabled", "disabled");
            $('#cmbConsumer').attr("disabled", "disabled");
            $('.pointerClick').addClass("pointerReceipt");
            $('#searchbyinvoice').removeClass("hidden");
        }
        else {
            $('#searchbyinvoice').addClass("hidden");
            $('.pointerClick').removeClass("pointerReceipt");
            $('.status-dropdownBuy').removeAttr("disabled");
            $('#cmbPartner').removeAttr("disabled");
            $('#cmbConsumer').removeAttr("disabled");
            //  $('#txtReceiptNo').attr("disabled", "disabled");
        }

    });
})
