
function entityLoking(accStatus, etruID) // admin holds assetmanager Account For few days
{
    swal({
        title: 'Are you sure?',
        text: accStatus == "active" ? 'It will activate this account !' : accStatus == "holder" ? 'It will on hold this account !' : 'It will blocking this account !',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: accStatus == "active" ? 'Yes, activate it!' : accStatus == "holder" ? 'Yes, proceed !' : 'Yes, block it!',
        cancelButtonText: 'No, cancel!',
        confirmButtonClass: 'btn btn-primary',
        cancelButtonClass: 'btn btn-secondary'
    }).then(function () {
        promptEReject(accStatus, etruID);
    }, function (dismiss) {
        if (dismiss === 'cancel') {
            swal(
                'Cancelled',
                'Your cancel your request :)',
                'error'
            );
        }
    })
}

function promptEReject(kycFlag, etruID) {
    var activemsg = kycFlag == "active" ? `<option>Account Activation - Onboard new partner </option>
    <option>Account Activation</option>`: `<option>Suspicious activity found in this account.</option>
    <option>Did Fraud Transaction</option>
    <option>Account might be misused</option>`;

    var reason = `<div class="form-group"> 
    <select name="reason" id="treason" class="form-control">
        <option value="0">Choose the reason ?</option> 
       `+ activemsg + `
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
        title: kycFlag == "active" ? 'Write reason for activation !' : 'Write reason for account blocking ?',
        imageUrl: 'images/dashicon/dsummery.png',
        html: reason,
        showCancelButton: true,
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
                    reject('Your reason is too short. Please enter more than 10 characters.');
                }
                if ($('#treason').val() != '0' || $('#treason').val() == 'other') {
                    resolve($('#treason').val());
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
            DeactivateEKYC(kycFlag, text, etruID);
        }
        else {
            return false;
        }
    })
}

function DeactivateEKYC(statTest, reason, etruID) // call api
{
    $dlrText = etruID ? etruID : $("#txteTruid").val();
    var json = {
        rTruID: $dlrText,
        KYCFlag: statTest,
        reason: reason
    };
    txnCheck(function (status) {
        if (status == true) {
            $('#loader').css("display", 'block');
            $.ajax({
                "url": "/eEntity/deactivatRemmitAccount", "method": "POST", data: json, success: function (a) {
                    let res = a.body;
                    $('#loader').fadeOut('slow');
                    if (res.status == 200) {
                       
                        replaceTableRow(res.resource,$dlrText);
                        $('#accountStatus').val(res.resource.KYCFlag);
                        if (res.resource.KYCFlag == "active") {
                            $('#btndeactivate').html('<i class="fa fa-ban text-danger"></i> Deactivate Account');
                            alertify.success('Account activated successfully..!!');
                        }
                        else if (res.resource.KYCFlag == "holder") {
                            $('#btndeactivate').html('<i class="fa fa-ban"></i> Activate Account');
                            alertify.success('Account onhold successfully..!!');
                        }
                        else {
                            $('#btndeactivate').html('<i class="fa fa-check-circle-o"></i> Activate Account');
                            alertify.success('Account blocked successfully..!!');
                        }

                        $("#lblstatus").removeAttr('class');
                        $("#lblstatuss").removeAttr('class');

                        if (res.resource.KYCFlag == "active") {
                            $("#lblstatus").addClass("statusLabel label label-success");
                            $("#lblstatus").html("Active")
                            $("#lblstatuss").addClass("label label-success");
                            $("#lblstatuss").html("Active")
                        }
                        else if (res.resource.KYCFlag == "blocked") {
                            $("#lblstatus").addClass("statusLabel label label-danger");
                            $("#lblstatus").html("Blocked")
                            $("#lblstatuss").addClass("label label-danger");
                            $("#lblstatuss").html("Blocked")
                        }
                        else if (res.resource.KYCFlag == "pending") {
                            $("#lblstatus").addClass("statusLabel label label-warning");
                            $("#lblstatus").html("Pending")
                            $("#lblstatuss").addClass("label label-warning");
                            $("#lblstatuss").html("Pending")
                        } else if (res.resource.KYCFlag == "banned") {
                            $("#lblstatus").addClass("statusLabel label label-danger");
                            $("#lblstatus").html("Banned")
                            $("#lblstatuss").addClass("label label-danger");
                            $("#lblstatuss").html("Banned")
                        } else if (res.resource.KYCFlag == "stopTrading") {
                            $("#lblstatus").addClass("statusLabel label label-warning");
                            $("#lblstatus").html("Stop Trading")
                            $("#lblstatuss").addClass("label label-warning");
                            $("#lblstatuss").html("Stop Trading")
                        } else if (res.resource.KYCFlag == "holder") {
                            $("#lblstatus").addClass("statusLabel label label-primary");
                            $("#lblstatus").html("Account On Hold")
                            $("#lblstatuss").addClass("label label-primary");
                            $("#lblstatuss").html("Account On Hold")
                        }
                    }
                    else{
                        alertify.error(res.message)
                    }
                }
            });
        }
        else {
            alertify.error("Please Verify TPIN..!!")
        }
    })
}

function replaceTableRow(data,ID) {
    var statusActivation = ``;
    var status = "";
    if (data.KYCFlag == "active") {
        status = `<button class="btn btn-sm btn-success">Active</button>`
        statusActivation = `<li><a tabindex="-1" href="javascript:void(0);" onclick="entityLoking('blocked','` + ID + `')">Block account</a></li>
                        <li><a tabindex="-1" tabindex="-1" href="javascript:void(0);" onclick="entityLoking('holder','`+ ID + `')">OnHold account</a></li>`;
    }
    else if (data.KYCFlag == "pending") {
        status = `<button class="btn btn-sm btn-warning">Pending</button>`
    }
    else if (data.KYCFlag == "holder" || data.KYCFlag == "onhold") {
        status = `<button class="btn btn-sm btn-warning">OnHold</button>`
        statusActivation = `<li><a tabindex="-1" href="javascript:void(0);" onclick="entityLoking('active','` + ID + `')">Unlock account</a></li>`;
    }
    else if (data.KYCFlag == "blocked") {
        status = `<button class="btn btn-sm btn-danger">Blocked</button>`
        statusActivation = `<li><a tabindex="-1" href="javascript:void(0);" onclick="entityLoking('active','` + ID + `')">Unblock account</a></li>`;
    }
    else if (data.KYCFlag == "notactive") {
        status = `<button class="btn btn-sm btn-success">Not Activated</button>`
        statusActivation = `<li><a tabindex="-1" href="javascript:void(0);" onclick="entityLoking('active','` + ID + `')">Activate account</a></li>`;
    }
    else {
        status = `<button class="btn btn-sm btn-success">` + data.KYCFlag + `</button>`
        statusActivation = `<li><a tabindex="-1" href="javascript:void(0);" onclick="entityLoking('active','` + ID + `')">Activate account</a></li>`;
    }
    var txtActivation = status + `<button class="btn btn-sm dropdown-toggle" data-toggle="dropdown">
                        <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu">`+ statusActivation + `</ul>`
    $('#ID'+ID).empty();
    $('#ID'+ID).append(txtActivation);
}