// author : Nikhil Bharambe
// date : 23-07-2020
// Description : Editable labels for Consumer Configuration

$('#btnCedit').click(function (e) {
    e.stopPropagation();
    $('.editable').editable('toggleDisabled');
    $('#updateProf').removeClass("hidden");
    $('#btnCedit').addClass("hidden");
    $('#btnCancel').removeClass("hidden");
    $('.updatebtn').removeClass("hidden");
    // $('#svPermission').removeAttr('disabled')
    // $('#svWalAccess').removeAttr('disabled')

});
function clearAll() {
    $('.editable').editable('toggleDisabled');
    $('#updateProf').addClass("hidden");
    $('#btnCedit').removeClass("hidden");
    $('#btnCancel').addClass("hidden");
    $('.updatebtn').addClass("hidden");
    $('#svPermission').attr('disabled', true)
    $('#svWalAccess').attr('disabled', true)

}
function checkisAttrExist(elem) {
    var attr = $("#" + elem).attr('disabled');
    if (typeof attr !== 'undefined' && attr !== false) {
        return true;
    } else {
        return false;
    }
}

function onedit(e) {
    let type = $(e).attr("data-type");
    if (type === "buy") {
        editableSpecific(type);
        $(e).addClass("hidden");
        $(e).siblings().removeClass("hidden");
    }

    if (type === "redeemCash") {
        editableSpecific(type);
        $(e).addClass("hidden");
        $(e).siblings().removeClass("hidden");
    }
    if (type === "transfer") {
        editableSpecific(type);
        $(e).addClass("hidden");
        $(e).siblings().removeClass("hidden");
    }
    if (type === "accesspermission") {
        if (checkisAttrExist('svPermission')) {
            $('#svPermission').removeAttr('disabled');
        } else {
            $('#svPermission').attr('disabled', true)
        }
        editableSpecific(type);
        $(e).addClass("hidden");
        $(e).siblings().removeClass("hidden");
    }
    if (type === "enaccesspermission") {
        if (checkisAttrExist('svenPermission')) {
            $('#svenPermission').removeAttr('disabled');
            $('#consumerAppaccess').removeAttr('disabled');
        } else {
            $('#svenPermission').attr('disabled', true)
            $('#consumerAppaccess').attr('disabled', true)
        }
        editableSpecific(type);
        $(e).addClass("hidden");
        $(e).siblings().removeClass("hidden");
    }
    if (type === "walletpermission") {
        editableSpecific(type);
        $(e).addClass("hidden");
        $(e).siblings().removeClass("hidden");
    }
    if (type === "wallettobank") {
        editableSpecific(type);
        $(e).addClass("hidden");
        $(e).siblings().removeClass("hidden");
    }
    if (type === "pgpermissionAtom") {
        editableSpecific(type);
        $(e).addClass("hidden");
        $(e).siblings().removeClass("hidden");
    }
    if (type === "pgpermissionNEFT") {
        editableSpecific(type);
        $(e).addClass("hidden");
        $(e).siblings().removeClass("hidden");
    }
    if (type === "pgpermissionIMPS") {
        editableSpecific(type);
        $(e).addClass("hidden");
        $(e).siblings().removeClass("hidden");
    }
    if (type === "pgpermission") {
        editableSpecific(type);
        if (checkisAttrExist('svPGAccess')) {
            $('#svPGAccess').removeAttr('disabled');
        } else {
            $('#svPGAccess').attr('disabled', true)
        }

        $(e).addClass("hidden");
        $(e).siblings().removeClass("hidden");
    }
}


function editableSpecific(type, marked) {
    if (marked) {
        $('.editable').removeClass('editable-unsaved');
    }
    if (type === "buy") {
        $('#buyMaxGold').editable('toggleDisabled');
        $('#buyMaxSilver').editable('toggleDisabled');
        $('#buyMinGold').editable('toggleDisabled');
        $('#buyMinSilver').editable('toggleDisabled');
        $('#buytxnInterval').editable('toggleDisabled');
        $('#buynotxnInterval').editable('toggleDisabled');
        $('#buyMaxamtmonth').editable('toggleDisabled');
        $('#buyMaxamthour').editable('toggleDisabled');
        $('#buyMaxAmtOfTxnInDay').editable('toggleDisabled');
    }
    if (type === "redeemCash") {
        $('#redeemMinGold').editable('toggleDisabled');
        $('#redeemMaxGold').editable('toggleDisabled');
        $('#redeemMinSilver').editable('toggleDisabled');
        $('#redeemMaxSilver').editable('toggleDisabled');
        $('#redeemtobankMin').editable('toggleDisabled');
        $('#redeemtobankMax').editable('toggleDisabled');
        $('#redeemtxnInterval').editable('toggleDisabled');
        $('#redeemnotxnInterval').editable('toggleDisabled');
        $('#redeemMaxamtmonth').editable('toggleDisabled');
        $('#redeemMaxamthour').editable('toggleDisabled');
        $('#redeemMaxAmtOfTxnInDay').editable('toggleDisabled');
    }
    if (type === "transfer") {
        $('#transferMinGold').editable('toggleDisabled');
        $('#transferMaxGold').editable('toggleDisabled');
        $('#transferMinSilver').editable('toggleDisabled');
        $('#transferMaxSilver').editable('toggleDisabled');
        $('#transfertxnInterval').editable('toggleDisabled');
        $('#transfernotxnInterval').editable('toggleDisabled');
        $('#transferMaxamtmonth').editable('toggleDisabled');
        $('#transferMaxamthour').editable('toggleDisabled');
        $('#transferMaxAmtOfTxnInDay').editable('toggleDisabled');
        $('#txnFreeLimit').editable('toggleDisabled');
    }
    if (type === "accesspermission") {
        $('#buy').editable('toggleDisabled');
        $('#redeem').editable('toggleDisabled');
        $('#transfer').editable('toggleDisabled');
        $('#redeemtobank').editable('toggleDisabled');
        $('#linkbank').editable('toggleDisabled');
        $('#redeemToWallet').editable('toggleDisabled');
    }
    if (type === "enaccesspermission") {
        $('#enbuy').editable('toggleDisabled');
        $('#enredeem').editable('toggleDisabled');
        $('#entransfer').editable('toggleDisabled');
        $('#enredeemtobank').editable('toggleDisabled');
        $('#enlinkbank').editable('toggleDisabled');
        $('#login').editable('toggleDisabled');
        $('#partneraccess').editable('toggleDisabled');
        $('#lendingaccess').editable('toggleDisabled');
        $('#consumerAccess').editable('toggleDisabled');
        $('#enredeemToWallet').editable('toggleDisabled');
    }
    if (type === "walletpermission") {
        $('#walletAccess').editable('toggleDisabled');
        $('#payByWallet').editable('toggleDisabled');
        $('#walletMinSilver').editable('toggleDisabled');
        $('#walletMaxSilver').editable('toggleDisabled');
        $('#totalWallet').editable('toggleDisabled');
        $('#transLimit').editable('toggleDisabled');
        $('#walletMaxAmtOfTxnInDay').editable('toggleDisabled');
        $('#walletMaxamtmonth').editable('toggleDisabled');
        $('#walletMaxamthour').editable('toggleDisabled');
        $('#wallettxnInterval').editable('toggleDisabled');
        $('#walletnotxnInterval').editable('toggleDisabled');

    }
    if (type === "wallettobank") {
        $('#wallettobankMaxAmtOfTxnInDay').editable('toggleDisabled');
        $('#wallettobankMaxamtmonth').editable('toggleDisabled');
        $('#wallettobankMaxamthour').editable('toggleDisabled');
        $('#wallettobanktxnInterval').editable('toggleDisabled');
        $('#wallettobanknotxnInterval').editable('toggleDisabled');
        $('#wallettobank').editable('toggleDisabled');
        $('#wallettobankMin').editable('toggleDisabled');
        $('#wallettobankMax').editable('toggleDisabled');
    }
    
    if (type === "pgpermissionAtom") {
        $('#apaymentGateway').editable('toggleDisabled');
        $('#apgMinlimit').editable('toggleDisabled');
        $('#apgMaxlimit').editable('toggleDisabled');
    }
    if (type === "pgpermissionNEFT") {
        $('#bankpayoutneft').editable('toggleDisabled');
        $('#bankneftMinlimit').editable('toggleDisabled');
        $('#bankneftMaxlimit').editable('toggleDisabled');
    }
    if (type === "pgpermissionIMPS") {
        $('#bankpayoutimps').editable('toggleDisabled');
        $('#bankimpsMinlimit').editable('toggleDisabled');
        $('#bankimpsMaxlimit').editable('toggleDisabled');
    }
    if (type === "pgpermission") {
        
        $('#apaymentGateway').editable('toggleDisabled');
        
       
        $('#apgMinlimit').editable('toggleDisabled');
        $('#apgMaxlimit').editable('toggleDisabled');
        $('#bankpayoutimps').editable('toggleDisabled');
        $('#bankpayoutneft').editable('toggleDisabled');
        $('#bankimpsMinlimit').editable('toggleDisabled');
        $('#bankimpsMaxlimit').editable('toggleDisabled');
        $('#bankneftMinlimit').editable('toggleDisabled');
        $('#bankneftMaxlimit').editable('toggleDisabled');
    }


}

function enableeditable() {

    $('#redeem').editable('toggleDisabled');
    $('#transfer').editable('toggleDisabled');

    $('#partneraccess').editable('toggleDisabled');
    $('#consumerAccess').editable('toggleDisabled');
    $('#login').editable('toggleDisabled');
    $('#redeemtobank').editable('toggleDisabled');
    $('#linkbank').editable('toggleDisabled');

    $('#enbuy').editable('toggleDisabled');
    $('#enredeem').editable('toggleDisabled');
    $('#entransfer').editable('toggleDisabled');
    $('#enredeemtobank').editable('toggleDisabled');
    $('#enlinkbank').editable('toggleDisabled');

    $('#walletAccess').editable('toggleDisabled');
    $('#payByWallet').editable('toggleDisabled');
    $('#redeemToWallet').editable('toggleDisabled');
    $('#enredeemToWallet').editable('toggleDisabled');

    $('#buyMaxGold').editable('toggleDisabled');
    $('#buyMaxSilver').editable('toggleDisabled');
    $('#buyMinGold').editable('toggleDisabled');
    $('#buyMinSilver').editable('toggleDisabled');
    $('#buytxnInterval').editable('toggleDisabled');
    $('#buynotxnInterval').editable('toggleDisabled');
    $('#buyMaxamtmonth').editable('toggleDisabled');
    $('#buyMaxamthour').editable('toggleDisabled');
    $('#buyMaxAmtOfTxnInDay').editable('toggleDisabled');

    $('#redeemMinGold').editable('toggleDisabled');
    $('#redeemMaxGold').editable('toggleDisabled');
    $('#redeemMinSilver').editable('toggleDisabled');
    $('#redeemMaxSilver').editable('toggleDisabled');
    $('#redeemtobankMin').editable('toggleDisabled');
    $('#redeemtobankMax').editable('toggleDisabled');
    $('#redeemtxnInterval').editable('toggleDisabled');
    $('#redeemnotxnInterval').editable('toggleDisabled');
    $('#redeemMaxamtmonth').editable('toggleDisabled');
    $('#redeemMaxamthour').editable('toggleDisabled');
    $('#redeemMaxAmtOfTxnInDay').editable('toggleDisabled');

    $('#transferMinGold').editable('toggleDisabled');
    $('#transferMaxGold').editable('toggleDisabled');
    $('#transferMinSilver').editable('toggleDisabled');
    $('#transferMaxSilver').editable('toggleDisabled');
    $('#transfertxnInterval').editable('toggleDisabled');
    $('#transfernotxnInterval').editable('toggleDisabled');
    $('#transferMaxamtmonth').editable('toggleDisabled');
    $('#transferMaxamthour').editable('toggleDisabled');
    $('#transferMaxAmtOfTxnInDay').editable('toggleDisabled');
    $('#txnFreeLimit').editable('toggleDisabled');

    $('#walletMinSilver').editable('toggleDisabled');
    $('#walletMaxSilver').editable('toggleDisabled');
    $('#totalWallet').editable('toggleDisabled');
    $('#transLimit').editable('toggleDisabled');
    $('#wallettobank').editable('toggleDisabled');
    $('#wallettobankMin').editable('toggleDisabled');
    $('#wallettobankMax').editable('toggleDisabled');


    $('#walletMaxAmtOfTxnInDay').editable('toggleDisabled');
    $('#walletMaxamtmonth').editable('toggleDisabled');
    $('#walletMaxamthour').editable('toggleDisabled');
    $('#wallettxnInterval').editable('toggleDisabled');
    $('#walletnotxnInterval').editable('toggleDisabled');

    $('#wallettobankMaxAmtOfTxnInDay').editable('toggleDisabled');
    $('#wallettobankMaxamtmonth').editable('toggleDisabled');
    $('#wallettobankMaxamthour').editable('toggleDisabled');
    $('#wallettobanktxnInterval').editable('toggleDisabled');
    $('#wallettobanknotxnInterval').editable('toggleDisabled');

    
    $('#apaymentGateway').editable('toggleDisabled');
    
   
    $('#apgMinlimit').editable('toggleDisabled');
    $('#apgMaxlimit').editable('toggleDisabled');
    $('#bankpayoutimps').editable('toggleDisabled');
    $('#bankpayoutneft').editable('toggleDisabled');
    $('#bankimpsMinlimit').editable('toggleDisabled');
    $('#bankimpsMaxlimit').editable('toggleDisabled');
    $('#bankneftMinlimit').editable('toggleDisabled');
    $('#bankneftMaxlimit').editable('toggleDisabled');
}

function cmbEditableConf(type) {
    try {
        if ($('#' + type).length) {

            $('#' + type).editable({
                mode: 'popup',
                type: 'select',
                title: 'Select Permission',
                disabled: 'true',
                placement: 'right',
                value: $('#' + type).html() == "Coming Soon" ? "comingsoon" : $('#' + type + '').html().toLowerCase(),
                source: [
                    { value: "select", text: 'Select' },
                    { value: "allow", text: 'Allow' },
                    { value: "disable", text: 'Disable' },
                    { value: "hide", text: 'Hide' },
                    { value: "maintenance", text: 'Maintenance' },
                    { value: "comingsoon", text: 'Coming Soon' },
                    { value: "forceDisable", text: 'Force Disable' }
                ],
                validate: function (value) {
                    if ($.trim(value) !== "allow") {
                        promptRejectConf($(this).attr("id"), $.trim(value))
                    } else {
                        $("#lblreason" + $(this).attr("id")).text("");
                    }
                },
            });
            $('#' + type).editable('setValue', $('#' + type).html() == "Coming Soon" ? "comingsoon" : $('#' + type).html() == "ForceDisable" ? "forceDisable" : $('#' + type).html().toLowerCase());
        }
    }
    catch (ex) {
        console.error(ex)
    }
}
function cmbEditableConfAccessOnly(type) {
    if ($('#' + type).length) {
        $('#' + type).editable({
            mode: 'popup',
            type: 'select',
            title: 'Select Permission',
            disabled: 'true',
            placement: 'right',
            value: $('#' + type).html() == "Coming Soon" ? "comingsoon" : $('#' + type + '').html().toLowerCase(),
            source: [
                { value: "select", text: 'Select' },
                { value: "allow", text: 'Allow' },
                { value: "disable", text: 'Disable' },

            ],
            validate: function (value) {
                if ($.trim(value) !== "allow") {
                    promptRejectConf($(this).attr("id"), $.trim(value))
                } else {
                    $("#lblreason" + $(this).attr("id")).text("");
                }
            },
        });
        $('#' + type).editable('setValue', $('#' + type).html() == "Coming Soon" ? "comingsoon" : $('#' + type).html().toLowerCase());
    }
}
// $('#reasonModal').modal('toggle');
function txtEditableConf(type, disabled, mode) {
    if ($('#' + type).length) {
        $('#' + type).editable({
            mode: mode ? mode : 'popup',
            disabled: (disabled && disabled === "false") ? false : true,
            type: 'number',
            step: 'any',
            validate: function (value) {
                if ($.trim(value) == '') {
                    return 'This enter value';
                }
                else if ($.isNumeric(value) == '') {
                    return 'Only number & decimal value are allowed';
                }
            },
        });
    }
    // $('#' + type).editable('setValue', $('#' + type).html() == "Coming Soon" ? "comingsoon" : $('#' + type).html().toLowerCase());
}
function loadlabelconf() {
    //toggle `popup` / `inline` mode
    $.fn.editable.defaults.mode = 'inline';
    //make username editable
    //=====================Combobox Editable ========================================
    cmbEditableConf("buy");
    cmbEditableConf("redeem");
    cmbEditableConf("transfer");
    cmbEditableConf("consumerAccess");
    cmbEditableConf("walletAccess");
    cmbEditableConfAccessOnly("payByWallet");
    cmbEditableConf("redeemToWallet");
    cmbEditableConf("redeemtobank");
    cmbEditableConf("wallettobank");
    cmbEditableConf("linkbank");
    cmbEditableConf("login");

    cmbEditableConf("enredeemToWallet");
    cmbEditableConf("enbuy");
    cmbEditableConf("enredeem");
    cmbEditableConf("entransfer");
    cmbEditableConf("enredeemtobank");
    cmbEditableConf("enlinkbank");

    //=====================TextBox Editable =========================================
    txtEditableConf("buyMaxGold"); txtEditableConf("buyMaxSilver"); 
    txtEditableConf("buyMinGold"); txtEditableConf("buyMinSilver"); txtEditableConf("redeemMinGold");
     txtEditableConf("redeemMaxGold"); txtEditableConf("redeemMinSilver"); txtEditableConf("redeemMaxSilver"); 

    txtEditableConf("transferMinGold"); txtEditableConf("transferMaxGold"); txtEditableConf("transferMinSilver"); txtEditableConf("transferMaxSilver");

    txtEditableConf("walletMinSilver"); txtEditableConf("walletMaxSilver"); txtEditableConf("totalWallet");

    txtEditableConf("wallettobankMin"); txtEditableConf("wallettobankMax");


    txtEditableConf("buytxnInterval");
    txtEditableConf("buynotxnInterval");
    txtEditableConf("buyMaxamtmonth");
    txtEditableConf("buyMaxamthour");
    txtEditableConf("buyMaxAmtOfTxnInDay");

    txtEditableConf("redeemtxnInterval");
    txtEditableConf("redeemnotxnInterval");
    txtEditableConf("redeemMaxamtmonth");
    txtEditableConf("redeemMaxamthour");
    txtEditableConf("redeemMaxAmtOfTxnInDay");

    txtEditableConf("transfertxnInterval");
    txtEditableConf("transfernotxnInterval");
    txtEditableConf("transferMaxamtmonth");
    txtEditableConf("transferMaxamthour");
    txtEditableConf("transferMaxAmtOfTxnInDay");
    txtEditableConf("txnFreeLimit");


    txtEditableConf("walletMaxAmtOfTxnInDay");
    txtEditableConf("walletMaxamtmonth");
    txtEditableConf("walletMaxamthour");
    txtEditableConf("wallettxnInterval");
    txtEditableConf("walletnotxnInterval");

    txtEditableConf("wallettobankMaxAmtOfTxnInDay");
    txtEditableConf("wallettobankMaxamtmonth");
    txtEditableConf("wallettobankMaxamthour");
    txtEditableConf("wallettobanktxnInterval");
    txtEditableConf("wallettobanknotxnInterval");


    txtEditableConf("lpgMinlimit");
    txtEditableConf("lpgMaxlimit");
    txtEditableConf("apgMinlimit");
    txtEditableConf("apgMaxlimit");
    txtEditableConf("bankimpsMinlimit");
    txtEditableConf("bankimpsMaxlimit");
    txtEditableConf("bankneftMinlimit");
    txtEditableConf("bankneftMaxlimit");
}

function promptRejectConf(stat, permstat) {

    var title = (permstat === "disable") ? 'Disable' : (permstat === "maintenance") ? "Maintenance" : (permstat === "comingSoon") ? "Coming Soon" : permstat
    var reason = `<div class="form-group"> 
    <select name="reason" id="treason" class="form-control">
        <option value="0">Choose the reason ?</option>
        <option>Suspicious activity found in your account.</option>
        <option>This feature is coming soon.</option>
        <option>Your account might be misused</option>
        <option value="other">Other</option>
        </select>
</div>
<div class="form-group">
<label class="text text-danger" style:"font-size:20px">OR</label> 
</div>
<div class="form-group">
<label>If not found in above list :</label> 
<textarea id="swal-reason" class="form-control" style="resize:none" ></textarea>
</div>`;
    swal({
        title: "What is the reason of " + title + "?",
        imageUrl: 'images/dashicon/dsummery.png',
        html: reason,
        // showCancelButton: true,
        confirmButtonText: 'Submit',
        showLoaderOnConfirm: true,
        preConfirm: function () {
            return new Promise(function (resolve, reject) {
                if ($('#treason').val() == '0' && $('#swal-reason').val() == '') {
                    reject('Please select or enter reason of ' + title);
                }
                else if ($('#treason').val() == 'other' && $('#swal-reason').val() == '') {
                    reject('Please enter reason of ' + title);
                }
                else if ($('#treason').val() == 'other' && $('#swal-reason').val() != '' && $('#swal-reason').val().length < 10) {
                    reject('Your reason is too short. Please use no more than 10 characters.');
                }
                if ($('#treason').val() != '0' || $('#treason').val() == 'other') {
                    if ($('#treason').val() == 'other') {
                        resolve($('#swal-reason').val());
                    } else {
                        resolve($('#treason').val());
                    }
                }
                else {
                    setTimeout(function () {
                        resolve($('#swal-reason').val());
                    }, 1000);
                }
            });
        },
        allowOutsideClick: false,
        allowEscapeKey: false,
    }).then(function (text) {
        if (text) {
            $("#lblreason" + stat).text(text);
        }
        else {
            return false;
        }
    })
}