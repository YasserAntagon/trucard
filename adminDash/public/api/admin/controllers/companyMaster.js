/*!
 File: Company Master
 Edited : Nikhil Bharambe
 Dated : 03-05-2019
 Description : company related all element events we write here.
 */
//var btn1 = document.getElementById('btn1');
function submitCompany() {
    return new Promise(resolve => {
        $companyName = $("#txtcomp_name").val();
        $cshort_name = $("#txtcshort_name").val();
        $telno = $("#txttelno").val();
        $telno2 = $("#txttelno2").val();
        $email = $("#txtemail").val();
        $faxno = $("#txtfaxno").val();
        $pan = $("#txtpan").val();
        $compRegno = $("#txtcompregno").val();
        $compRegdate = $("#txtcompregdatedatepicker").val();
        $GSTIN = $("#txtGSTIN").val();
        $desc = $("#txtDescription").val();
        var json = {
            // "truID": $cotruid,
            "email": $email,
            "mobile": $telno,
            "countryCode": "+91",
            "companyName": $companyName,
            "shortName": $cshort_name,
            "FAX": $faxno,
            "PAN": $pan,
            "GSTINNo": $GSTIN,
            "companyDesc": $desc,
            "landLine": $telno2,
            "companyRegNo": $compRegno,
            "regDate": $compRegdate
        };
        txnCheck(function (status) {
            if (status == true) {
                $('#compMasterLoader').css("display", 'block');
                $.ajax({
                    "url": "/companyData/saveCompanyData", "method": "POST", data: json, success: function (a) {
                        let res = a.body;
                        $('#compMasterLoader').fadeOut('slow');
                        if (res.status == 200) {
                            resolve(true)
                            alertify.logPosition("bottom left");
                            alertify.success('Step 1 completed..!!');
                        }
                        else {
                            resolve(false)
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
    })
}

// step3 submission - Company Bank Details
function submitBankDetail() {
    return new Promise(resolve => {
        $bankname = $("#txt_bankname").val();
        $ifsc = $("#txtifsc").val();
        $Acc = $("#txtAcc").val(); 
        var json = {
            //     "truID": $cotruid,
            "bankName": $bankname,
            "IFSC": $ifsc,
            "accountNo": $Acc
        };
        $('#compMasterLoader').css("display", 'block');
        $.ajax({
            "url": "/companyData/saveBankData", "method": "POST", data: json, success: function (a) {
                let res = a.body;
                $('#compMasterLoader').fadeOut('slow');
                if (res.status == 200) {
                    resolve(true)
                    alertify.logPosition("bottom left");
                    alertify.success('Step 2 completed..!!');
                }
                else {
                    resolve(false)
                    alertify.logPosition("bottom left");
                    alertify.error(res.messege);
                }
            }
        });
    });
}

// step3 submission - company Address
function cmpAddress() {

    $appa = $("#appa").val();
    $landmark = $("#txtlandmark").val();
    $street = $("#txtstreet").val();
    $pincode = $("#txtpincode").val();
    $city = $("#txtcity").val();
    $state = $("#txtstate").val();
    $country = $("#txtcountry").val();

    $bappa = $("#b_appa").val();
    $blandmark = $("#b_txtlandmark").val();
    $bstreet = $("#b_txtstreet").val();
    $bpincode = $("#b_txtpincode").val();
    $bcity = $("#b_txtcity").val();
    $bstate = $("#b_txtstate").val();
    $bcountry = $("#b_txtcountry").val();

    $lat = $("#lat").val();
    $lng = $("#lng").val();

    var json = {
        "houseNumber": $appa,
        "streetNumber": $street,
        "landmark": $landmark,
        "pin": $pincode,
        "city": $city,
        "state": $state,
        "country": $country,
        "longitude": $lng,
        "latitude": $lat,
        "pHouseNumber": $bappa,
        "pStreetNumber": $bstreet,
        "pLandmark": $blandmark,
        "pPin": $bpincode,
        "pCity": $bcity,
        "pState": $bstate,
        "pCountry": $bcountry
    }
    $('#compMasterLoader').css("display", 'block');
    $.ajax({
        "url": "/companyData/saveAddressCompanyData", "method": "POST", data: json, success: function (a) {
            $('#compMasterLoader').fadeOut('slow');
            let res = a.body;
            if (res.status == 200) { 
                alertify.logPosition("bottom left");
                alertify.success('Company Registered successfully..!!');
                $('#companyform').find('input, textarea, button, select').attr('disabled', 'disabled');
                $('#txtDescription').attr('disabled', 'disabled');
                $('#rdoYes').attr('disabled', 'disabled');
                $('#rdoNo').attr('disabled', 'disabled');
                setTimeout(()=>{
                    window.location.reload();
                },500)
            }
            else {
                alertify.logPosition("bottom left");
                alertify.error(res.message);
                return false;
            }
        }
    });
}

companyBind = function () // get Data From Remote Server
{
    $('#compMasterLoader').css("display", 'block');
    $.ajax({
        "url": "/companyData/getCompanyData", "method": "POST", success: function (a) {
            $('#compMasterLoader').fadeOut('slow');
            let res = a.body;
            if (res.length > 0) {
                $data = res[0];
                // Company details bind
                $("#txtcomp_name").val($data.companyName);
                $("#txtcshort_name").val($data.shortName);
                $("#txttelno").val($data.mobile);
                $("#txttelno2").val($data.landLine); //repeat
                $("#txtemail").val($data.email);
                $("#txtfaxno").val($data.FAX);
                $("#txtpan").val($data.PAN);
                $("#txtcompregno").val($data.companyRegNo);
                $("#txtcompregdatedatepicker").val($data.regDate);
                $("#txtGSTIN").val($data.GSTINNo);
                $("#txtDescription").html($data.companyDesc);

                // Address bind
                if ($data.contactAddress) {
                    $("#appa").val($data.contactAddress.houseNumber);
                    $("#txtlandmark").val($data.contactAddress.streetNumber);
                    $("#txtstreet").val($data.contactAddress.landmark);
                    $("#txtpincode").val($data.contactAddress.pin);
                    $("#txtcity").val($data.contactAddress.city);
                    $("#txtstate").val($data.contactAddress.state);
                    $("#txtcountry").val($data.contactAddress.country);
                    $("#lat").val($data.contactAddress.location.coordinates[0]);
                    $("#lng").val($data.contactAddress.location.coordinates[1]);
                }
                if ($data.companyOperationAddress) {
                    $("#b_appa").val($data.companyOperationAddress.houseNumber);
                    $("#b_txtlandmark").val($data.companyOperationAddress.streetNumber);
                    $("#b_txtstreet").val($data.companyOperationAddress.landmark);
                    $("#b_txtpincode").val($data.companyOperationAddress.pin);
                    $("#b_txtcity").val($data.companyOperationAddress.city);
                    $("#b_txtstate").val($data.companyOperationAddress.state);
                    $("#b_txtcountry").val($data.companyOperationAddress.country);
                }
                if ($data.bankDetails) {
                    // Bank bind
                    $("#txt_bankname").val($data.bankDetails.bankName);
                    $("#txtifsc").val($data.bankDetails.IFSC);
                    $("#txtAcc").val($data.bankDetails.accountNo);
                }
                // store.set('coTruID', $data.truID);
                $('#companyform').find('input, textarea, button, select').attr('disabled', 'disabled');
                // initMap(); 
            }
            else {
                $('.editcompany').hide();

            }
        }
    });
}

