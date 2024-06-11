/*!
 File: Company Master
 Edited : Nikhil Bharambe
 Dated : 03-05-2019
 Description : company related all element events we write here.
 */

// var companydb = require(__dirname + '/api/model/companyLocationDB');
// var companyData = require(__dirname + '/api/db/companyData');
// var branchLists = require(__dirname + '/api/db/branchList');

function bindDept() {
    $('#compLocationLoader').css("display", 'block');
    // companyData.getCompanyData(db, function (res)   // company data got from Lokijs
    // {
    $.ajax({
        "url": "/companyData/getCompanyData", "method": "POST", success: function (a) {
            let res = a.body;
            $('#compLocationLoader').fadeOut('slow');
            if (res.length > 0) {
                $data = res[0];
                $('#cmbCompany').empty();
                $('#cmbCompany').append('<option value="' + $data.truID + '">' + $data.companyName + '</option>')
            }
        }
    });
}
bindDept();
// step1 submission - company details 
function submitLocation() {
    $branchName = $("#txtBranchName").val();
    $purpose = $("#txtpurpose").val();
    $telno = $("#txttelno").val();
    $telno2 = $("#txttelno2").val();
    $email = $("#txtemail").val();
    $faxno = $("#txtfaxno").val();
    $desc = $("#txtDescription").val();
    $cmbCompany = $("#cmbCompany").val();
    $cotruid = $("#atruid").val();
    $compregdate = $("#txtBranchRegDate").val();
    $rstatus = "rented";

    if (!$cotruid)  // check truId if exists then save else update
    {
        var json = {
            "email": $email,
            "mobile": $telno,
            "countryCode": "+91",
            "branchName": $branchName,
            "FAX": $faxno,
            "regDate": $compregdate,
            "purpose": $purpose,
            "description": $desc,
            "propertyDetails": $rstatus,
            "landLine": $telno2,
            "companyTruID": $cmbCompany
        };
        txnCheck(function (status) {
            if (status == true) {
                $('#compLocationLoader').css("display", 'block');
                $.ajax({
                    "url": "/companyData/saveCompanyLocationData", data: json, "method": "POST", success: function (a) {
                        let res = a.body;
                        $('#compLocationLoader').fadeOut('slow');
                        if (res.status == 200) {
                            $("#atruid").val(res.truID)

                            alertify.logPosition("bottom left");
                            alertify.success('Branch Details submitted..!!');
                            $("#companyLocation")[0].click();
                        }
                        else {
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
    }
    else {
        var json = {
            "bTruID": $cotruid,
            "email": $email,
            "mobile": $telno,
            "branchName": $branchName,
            "FAX": $faxno,
            "regDate": $compregdate,
            "purpose": $purpose,
            "description": $desc,
            "propertyDetails": $rstatus,
            "landLine": $telno2,
            "companyTruID": $cmbCompany
        };
        txnCheck(function (status) {
            if (status == true) {
                $('#compLocationLoader').css("display", 'block');
                $.ajax({
                    "url": "/companyData/updateCompanyLocationData", data: json, "method": "POST", success: function (a) {
                        let res = a.body;
                        $('#compLocationLoader').fadeOut('slow');
                        if (res.status == 200) {
                            alertify.logPosition("bottom left");
                            alertify.success('Branch Details submitted..!!');
                            $("#companyLocation")[0].click();
                        }
                        else {
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
    }
}


companyLocationBind = function () {
    $empids = $('#branchId').val();
    // console.log($empids)
    if ($empids) {
        var query = { 'truID': $empids }; // loki query
        $('#compLocationLoader').css("display", 'block');
        $.ajax({
            "url": "/employeeReg/getBranchList", "method": "POST", data: query, success: function (a) {
                let res = a.body;
                $('#compLocationLoader').fadeOut('slow');
                if (res.length > 0) {
                    $data = res[0];
                    // Company details bind
                    $("#atruid").val($data.truID);
                    $("#txtBranchName").val($data.branchName);
                    $("#cmbCompany").val($data.companyTruID);
                    $("#txttelno").val($data.mobile);
                    //  $("#txttelno2").val($data.landline);  
                    $("#txtemail").val($data.email);
                    $("#txtpurpose").val($data.purpose);
                    $("#txtfaxno").val($data.FAX);
                    $("#txtcompregno").val($data.companyRegNo);
                    $("#txtBranchRegDate").val($data.regDate);
                    $("#txtGSTIN").val($data.GSTINNo);
                    $("#txtDescription").html($data.description);


                    $rented = $data.propertyDetails;
                    if ($rented === "rented") {
                        if ($data.rented) {
                            $("#txtownerName").val($data.rented.ownerName);
                            $("#txtrent").val($data.rented.rent);
                            $("#txtsqft").val($data.rented.area);
                            $("#txtmain").val($data.rented.maintainance);

                            $tot = parseFloat($data.rented.rent) + parseFloat($data.rented.maintainance);

                            $("#txttotal").val($tot);
                            $("#txtdeposit").val($data.rented.deposit);
                            $("#txtomobile").val($data.rented.ownerMobileNo);
                            $("#txtownerAdd").val($data.rented.ownerAddress);
                        }
                    }
                    else {

                        if ($data.owned) {
                            $("#txtsqft").val($data.owned.area);
                            $tot = parseFloat($data.owned.maintainance);
                            $("#txtmain").val($tot);
                            $("#txttotal").val($tot);
                        }
                    }


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
                    $('#branchform').find('input, textarea, button, select').attr('disabled', 'disabled');


                    //initMap(); 
                }
                else {
                    $('.editbranch').hide();
                    alertify.logPosition("bottom left");
                    alertify.error("Please Fill the forms..!!");
                }
            }
        });
    }
    else {
        $('.editbranch').hide();

    }
}
companyLocationBind();