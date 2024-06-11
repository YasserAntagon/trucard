var saveEntity = function () {
    var dt = $('#txtDOB').val();
    var newdate = dt.split("-").reverse().join("-");
    var dob = new Date(Date.parse(newdate));
    var dob1 = moment(dob).format('MM-DD-YYYY');
    var json = {
        "email": $('#txtemail').val().trim(),
        "mobile": $('#txtmobileno').val().trim(),
        "countryCode": $('#txtCountryCode').val().trim(),
        "fName": $('#txtfname').val().trim(),
        "mName": $('#txtmname').val().trim(),
        "lName": $('#txtlname').val().trim(),
        "cName": $('#txtcname').val().trim(),
        "DOB": dob1,
        "gender": $("input[name=gender]:checked").val().trim(),
        "isParent": true,
        "MID": $('#addonmt').html().trim() + $('#txtmerchant').val().trim(),
        "category": $('#txtCat').val().trim() 
    };
    return new Promise(resolve => {
        txnCheck(function (status) {
            if (status == true) {
                $('#loader').css("display", 'block');
                $.ajax({
                    "url": "/eConsumer/savaEntitydetails", "method": "POST", data: json, success: function (a) {
                        let res = a.body;            // Call Model
                        $('#loader').fadeOut('slow');
                        if (res.status == 409) {
                            // alertify.logPosition("top right");
                            alertify.error(res.message);
                            resolve(false)
                            return false;
                        }
                        else if (res.status == 200) {
                            alertify.success(res.message);
                            $("#txteTruid").val(res.truID);
                            $("#txtrcrno").val(res.CRNNo);
                            resolve(true)
                            // clear();
                        }
                        else {
                            // alertify.logPosition("top right");
                            alertify.error(res.message);
                            resolve(false)
                            return false;
                        }
                    }
                });
            }
            else {
                alertify.error("Please Verify TPIN..!!")
            }
        })
    })
}
function updateAddr() {
    var latitude = "0";
    var longitude = "0";
    $amtruid = $("#txteTruid").val().trim();
    var kycjson = {
        "rTruID": $amtruid,
        "houseNumber": $("#txtappa").val().trim(),
        "streetNumber": $("#txtstreet").val().trim(),
        "landmark": $("#txtlandmark").val().trim(),
        "pin": $("#txtpincode").val().trim(),
        "city": $("#txtcity").val().trim(),
        "state": $("#txtstate").val().trim(),
        "country": $("#txtcountry").val().trim(),
        "isLending": ($("input[name=lender]:checked").val() == "true") ? true : false,
        "latitude": latitude,
        "longitude": longitude

    }
    return new Promise(resolve => {
        $('#loader').css("display", 'block');
        $.ajax({ "url": "/eConsumer/saveEntityAddr", "method": "POST", data: kycjson, success: function (a) {
                let res = a.body;
                $('#loader').fadeOut('slow');
                if (res.status == 200) {
                    alertify.logPosition("bottom left");
                    // alertify.success('Address updated successfully..!!');
                    submitfinalKYC(a.page)
                    resolve(true)
                }
                else {
                    WarnMsg("Company Consumer", "Please Enter the required fields");
                    resolve(false)
                    return false;
                }
            }
        });
    });

}
// loadlabel()
$('#sbuy').html("Select")
$('#sredeemCash').html("Select")
$('#sTransfer').html("Select")
$('#cbuy').html("Select")
$('#credeemCash').html("Select")
$('#cTransfer').html("Select")
$('#paymentGateway').html("Select")
function updateConfig() { 
    let sbuy = $('#sbuy').html() == "Coming Soon" ? "comingsoon" : $('#sbuy').html().toLowerCase();
    let sredeem = $('#sredeemCash').html() == "Coming Soon" ? "comingsoon" : $('#sredeemCash').html().toLowerCase();
    let stransfer = $('#sTransfer').html() == "Coming Soon" ? "comingsoon" : $('#sTransfer').html().toLowerCase();

    let cbuy = $('#cbuy').html() == "Coming Soon" ? "comingsoon" : $('#cbuy').html().toLowerCase();
    let credeem = $('#credeemCash').html() == "Coming Soon" ? "comingsoon" : $('#credeemCash').html().toLowerCase();
    let ctransfer = $('#cTransfer').html() == "Coming Soon" ? "comingsoon" : $('#cTransfer').html().toLowerCase();

    let enAddOn = $("#txtentityAddOn").html();
    let enrevC = $("#txtentityRevCharges").html();
    let pgway = $('#paymentGateway').html();

    if (sbuy != "select" &&
        sredeem != "select" &&
        stransfer != "select" &&
        cbuy != "select" &&
        credeem != "select" &&
        ctransfer != "select" &&
        pgway != "select" && 
        enAddOn != "" &&
        enrevC != "") {



        var accessjson = {
            "selfAccess": {
                "rTruID": $amtruid,
                "buy": sbuy,
                "redeemCash": sredeem,
                "transfer": stransfer
            },
            "consumerAccess": {
                "rTruID": $amtruid,
                "buy": cbuy,
                "redeemCash": credeem,
                "transfer": ctransfer
            },
            "walletAccess": {
                "rTruID": $amtruid,
                "walletAccess": ($("#wallet").prop("checked") == true) ? "allow" : "disable",
                "paymentModeAccess": ($("#pg").prop("checked") == true) ? "allow" : "disable",
                "paymentGateway": pgway,
                "redeemToWallet": ($("#rWallet").prop("checked") == true) ? "allow" : "disable"
            },
            "globalAccess": {
                "rTruID": $amtruid,
                "MID": $("#txtmerchant").val(),
                "category": $("#txtCat").val(),
                "allConsumerAccess": ($("#consumerAccess").prop("checked") == true) ? true : false
            },
            "revenue": {
                "eTruID": $amtruid,
                "revenuePercent": enrevC,
                "promotionQTY": enAddOn
            }
        }
        var json = {
            "rTruID": $amtruid,
            "txnAmountLimit": "0",
            "checkLimit": false
        }
        return new Promise(resolve => {
            $('#loader').css("display", 'block'); 
            $.ajax({
                "url": "/entityAccess/walletAccessConfig", "method": "POST", data: accessjson.walletAccess, success: function (a) {
                    let res = a.body;
                    if (res.status == 200) {
                        $.ajax({
                            "url": "/entityAccess/consumerTransConfig", "method": "POST", data: accessjson.consumerAccess, success: function (a) {
                                let res = a.body;
                                if (res.status == 200) {
                                    $.ajax({
                                        "url": "/entityAccess/enSelfTransConfig", "method": "POST", data: accessjson.selfAccess, success: function (a) {
                                            let res = a.body;
                                            if (res.status == 200) {
                                                $.ajax({
                                                    "url": "/entityAccess/globalPolicyConfig", "method": "POST", data: accessjson.globalAccess, success: function (a) {
                                                        let res = a.body;
                                                        if (res.status == 200) {
                                                            $.ajax({
                                                                "url": "/entityAccess/transactionLimit", "method": "POST", data: json, success: function (a) {
                                                                    let res = a.body;
                                                                    if (res.status == 200) {
                                                                        $('#loader').fadeOut('slow');
                                                                        resolve(true);
                                                                        alertify.success("Permission applied successfully");
                                                                    }
                                                                    else {
                                                                        $('#loader').fadeOut('slow');
                                                                        alertify.error(res.messege);
                                                                        resolve(false);
                                                                        return false;
                                                                    }
                                                                }
                                                            })
                                                        }
                                                        else {
                                                            $('#loader').fadeOut('slow');
                                                            alertify.error(res.messege);
                                                            resolve(false);
                                                            return false;
                                                        }
                                                    }
                                                });
                                            }
                                            else {
                                                $('#loader').fadeOut('slow');
                                                alertify.error(res.messege);
                                                resolve(false);
                                                return false;
                                            }
                                        }
                                    });
                                }
                                else {
                                    $('#loader').fadeOut('slow');
                                    alertify.error(res.messege);
                                    resolve(false);
                                    return false;
                                }
                            }
                        });
                    }
                    else {
                        $('#loader').fadeOut('slow');
                        alertify.error(res.messege);
                        resolve(false);
                        return false;
                    }
                }
            });


        })
    }
    else {
        alertify.error("Please Select Configuration..!!");
        return false;
    }
}