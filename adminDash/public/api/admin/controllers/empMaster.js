/*!
 File: Employee  Master
 Edited : Nikhil Bharambe
 Dated : 04-05-2019
 Description : Company related all element events we write here.
 */
function bindBranchList() {
    $('.select2').select2();
    $.ajax({
        "url": "/employeeReg/bindBranchList", "method": "POST", success: function (a) {
            let buyArr = a.body;
            if (buyArr) {
                $('#cmbBranch').empty();
                for (var i = 0; i < buyArr.length; i++) {
                    $data = "";
                    if (buyArr[i].contactAddress) {
                        $data = buyArr[i].branchName + "-" + buyArr[i].contactAddress.city;
                    }
                    else {
                        $data = buyArr[i].branchName;
                    }
                    $('#cmbBranch').append('<option value="' + buyArr[i].truID + '">' + $data + '</option>');
                }
            }
        }
    });
}
$(function () {
    bindBranchList();
});
// step1 - submit Employee
function submitEmployee() {
    return new Promise(resolve => {
        $title = $("#cmbTitle").val();
        $fname = $("#txt_fname").val();
        $middleName = $("#txtMiddleName").val();
        $lName = $("#txtLName").val();
        $gender = $("input[name=male]:checked").val();
        $mobno = $("#txtmobno").val();
        $telno = $("#txttelno").val();
        $dob = $("#txtdob").val();
        $email = $("#txtemail").val();
        $skill = $("#txtskill").val();
        $joining = $("#txt_joining").val();
        $empcode = $("#txtempCode").val();
        $empid = $('#empId').val();
        $autoPass = $fname.substring(1, 4);
        $atruid = $("#atruid").val();     // get value from electron store
        $branchID = $("#cmbBranch").val();
        $montharr = $dob.split("/")
        $dobdate = new Date($montharr[1] + '/' + $montharr[0] + '/' + $montharr[2]);
        $jmontharr = $joining.split("/")
        $jdate = new Date($jmontharr[1] + '/' + $jmontharr[0] + '/' + $jmontharr[2]);
        var json = {
            "eTruID": $empid,
            "mobile": $mobno,
            "fName": $fname,
            "mName": $middleName,
            "lName": $lName,
            "type": "emp",
            "empCode": $empcode,
            "title": $title,
            "landLine": $telno,
            "gender": $gender,
            "DOB": $dobdate,
            "branchID": $branchID,
            "joiningDate": $jdate,
            "skillset": $skill,
            "email": $email
        }
        txnCheck(function (status) {
            if (status == true) {
                $('#empMasterLoader').css("display", 'block');
                $.ajax({
                    "url": "/employeeReg/updateEmployeeData", "method": "POST", data: json, success: function (a) {
                        let res = a.body;
                        $('#empMasterLoader').fadeOut('slow');
                        if (res.status == 200) {
                            resolve(true)
                            alertify.logPosition("bottom left");
                            alertify.success('Employee personal details updated..!!');
                        }
                        else {
                            resolve(false)
                            alertify.error(res.message)
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


// step2 submission - Employee Bank Details
function submitbank() {
    return new Promise(resolve => {
        $empid = $('#empId').val();
        $bankname = $("#txt_bankname").val();
        $ifsc = $("#txtifsc").val();
        $Acc = $("#txtAcc").val();
        // $cotruid = store.get('empTruID'); // get value from electron store

        // if ($cotruid) {
        //     if ($cotruid == "") {
        //         alertify.logPosition("bottom left");
        //         alertify.error("Something get wrong..!!");
        //         return;
        //     }
        // }
        // else {
        //     alertify.logPosition("bottom left");
        //     alertify.error("Something get wrong..!!");
        //     return;
        // }

        var json = {
            "eTruID": $empid,
            "bankName": $bankname,
            "IFSC": $ifsc,
            "accountNo": $Acc
        };
        $('#empMasterLoader').css("display", 'block');
        $.ajax({
            "url": "/employeeReg/employeeBankDetails", "method": "POST", data: json, success: function (a) {
                let res = a.body;
                $('#empMasterLoader').fadeOut('slow');

                if (res.status == 200) {
                    resolve(true);
                    alertify.logPosition("bottom left");
                    alertify.success('Step 3 completed..!!');
                }
                else {
                    resolve(false);
                    alertify.logPosition("bottom left");
                    alertify.error(res.message);
                }
            }
        });
    });
}

// step3 submission - Employee Address
function submitAddress() {
    return new Promise(resolve => {
        $empid = $('#empId').val();
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

        // $cotruid = store.get('empTruID'); // get value from electron store

        // if ($cotruid) {
        //     if ($cotruid == "") {
        //         alertify.logPosition("bottom left");
        //         alertify.error("Something get wrong..!!");
        //         return;
        //     }
        // }
        // else {
        //     alertify.logPosition("bottom left");
        //     alertify.error("Something get wrong..!!");
        //     return;
        // }
        var json = {
            "eTruID": $empid,
            "houseNumber": $appa,
            "streetNumber": $street,
            "landmark": $landmark,
            "pin": $pincode,
            "city": $city,
            "state": $state,
            "country": $country,
            "longitude": "0",
            "latitude": "0",
            "pHouseNumber": $bappa,
            "pStreetNumber": $bstreet,
            "pLandmark": $blandmark,
            "pPin": $bpincode,
            "pCity": $bcity,
            "pState": $bstate,
            "pCountry": $bcountry
        };
        $('#empMasterLoader').css("display", 'block');
        $.ajax({
            "url": "/employeeReg/employeeAddress", "method": "POST", data: json, success: function (a) {
                let res = a.body;
                $('#empMasterLoader').fadeOut('slow');
                if (res.status == 200) {
                    resolve(true);
                    alertify.logPosition("bottom left");
                    alertify.success('Step 2 Completed..!!');
                }
                else {
                    resolve(false);
                    alertify.logPosition("bottom left");
                    alertify.error(res.message);
                }
            }
        });
    });
}

function submitDocument() {
    var form_data = new FormData();
    $tid = $("#atruid").val();
    form_data.append('truID', $tid);
    $total = $('.kycdoc').length;
    var x = 0;
    var y = 0;
    $(".btnup").show();

    var proceed = true; //set proceed flag
    var error = [];	//errors
    var total_files_size = 0;

    var progress_bar_id = '#progress-wrp';
    //reset progressbar
    $(progress_bar_id + " .progress-bar").css("width", "0%");
    $(progress_bar_id + " .status").text("0%");
    for ($i = 0; $i < $total; $i++) {
        var ss = $('.kycdoc').get($i).files.length;
        if (ss == 0) {
            x = 1;
            break;
        }
        jQuery.each(jQuery('.kycdoc')[$i].files, function (j, file) {
            if (file.size > 2048576) {
                y = 1;
                //check file size (in bytes)
                //$("#dropBox").html("Sorry, your file is too large (>1 MB)");
            }
            form_data.append('files', file);
        });
    }
    if (x == 1) {
        alertify.logPosition("bottom left");
        alertify.error('Please upload KYC Document..!!');
        return false;
    }
    if (y == 1) {
        alertify.logPosition("bottom left");
        alertify.error('Sorry, your file is too large (>2 MB)..!!');
        return false;
    }

    $('.kycdocnum').each(function (index, item) {
        var val = $(item).val();
        form_data.append('kycDocNums[]', val);
    });

    $('.subdmitId').each(function (index, item) {
        var val = $(item).val();
        form_data.append('fileName[]', val);
    });

    // var post_url = config.docurl + "/5011";

    //Upload Document on server 
    $.ajax({
        url: '/adminFileupload/empuploadDoc',
        type: "POST",
        data: form_data,
        contentType: false,
        cache: false,
        processData: false,
        xhr: function () {
            //upload Progress
            var xhr = $.ajaxSettings.xhr();
            if (xhr.upload) {
                xhr.upload.addEventListener('progress', function (event) {
                    var percent = 0;
                    var position = event.loaded || event.position;
                    var total = event.total;
                    if (event.lengthComputable) {
                        percent = Math.ceil(position / total * 100);
                    }
                    //update progressbar
                    $(progress_bar_id + " .progress-bar").css("width", + percent + "%");
                    $(progress_bar_id + " .status").text(percent + "%");
                }, true);
            }
            return xhr;
        },
        mimeType: "multipart/form-data"
    }).done(function (res) { //
        uploadDoc(res);
    })
}

function uploadDoc(response) {
    var a = JSON.parse(response)
    var res = a.body;
    if (res.status == "200") {
        alertify.logPosition("bottom left");
        alertify.success('Employee Details Updated Successfully..!!');
        $('#empform').find('input, textarea, button, select').attr('disabled', true);
        $(".editemp").show();
        $(".btnup").hide();
    }
    else {
        $(".btnup").hide();
        alertify.logPosition("bottom left");
        alertify.error(res.message);
    }

} 