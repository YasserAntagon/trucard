/*!
 File: Employee  Registration
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

bindBranchList();

document.getElementById('btn1').addEventListener('click', function (e) {
    var valid = true;

    if ($("#cmbBranch").val() == '') {
        $("#cmbBranch").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_branch").text("*Please Select Company Branch..!!");
        valid = false;
    } else {
        $("#cmbBranch").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_branch").text("");
    }


    if ($("#txt_fname").val() == '') {
        $("#txt_fname").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_fname").text("*Please Enter First Name!");
        valid = false;
    } else {
        $("#txt_fname").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_fname").text("");
    }
    if ($("#txtLName").val() == '') {
        $("#txtLName").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_lname").text("*Please Enter Last Name!");
        valid = false;
    } else {
        $("#txtLName").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_lname").text("");
    }

    if ($("#txtdob").val() == '') {

        $("#txtdob").css("border-color", "#FF0000");
        $('#submit_step2').attr('disabled', true);
        $("#error_dob").text("* Enter Date Of Birth!");
        valid = false;
    } else {
        $("#txtdob").css("border-color", "#2eb82e");
        $('#submit_step2').attr('disabled', false);
        $("#error_dob").text("");
    }

    if ($("#txtmobno").val() == '') {
        $("#txtmobno").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_txttelno").text("*Enter Mobile Number!");
        valid = false;
    } else {
        $("#txttelno").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_txttelno").text("");
    }
    if ($("#txtemail").val() == '') {
        $("#txtemail").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_txtemail").text("*Enter Email Id!");
        valid = false;
    } else {
        $("#txtemail").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_txtemail").text("");
    }
    if ($("#txtempCode").val() == '') {
        $("#txtempCode").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_txtemail").text("*Please Enter Employee Code!");
        valid = false;
    } else {
        $("#txtempCode").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_txtempcode").text("");
    }
    if (valid === false) {
        return false;
    }
    $title = "Mr";
    $fname = $("#txt_fname").val();
    $middleName = $("#txtMiddleName").val();
    $lName = $("#txtLName").val();
    $gender = $("input[name=gender]:checked").val();
    $mobno = $("#txtmobno").val();
    $telno = $("#txttelno").val();
    $email = $("#txtemail").val();
    $empcode = $("#txtempCode").val();
    $autoPass = $fname.substring(0, 4);
    $branchID = $("#cmbBranch").val();
    $cmbDepartment = $("#cmbDepartment").val();
    console.log("$autoPass + $empcode",$autoPass + $empcode)
    var json = {
        "email": $email,
        "password": $autoPass + $empcode,
        "mobile": $mobno,
        "countryCode": "+91",
        "fName": $fname,
        "lName": $lName,
        "type": "emp",
        "empCode": $empcode,
        "department": $cmbDepartment,
        "title": $title,
        "landLine": $telno,
        "branchID": $branchID
    };
    if ($middleName) {
        json.mName = $middleName
    }
    txnCheck(function (status) {
        if (status == true) {
            $('#empRegLoader').css('display', 'block');
            try {


                $.ajax({
                    "url": "/employeeReg/saveEmployeeData", "method": "POST", data: json, success: function (a) {
                        let res = a.body;
                        $('#empRegLoader').fadeOut('slow');
                        if (res.status == "200") {
                            alertify.logPosition("bottom left");
                            alertify.success('Employee Registered Successfully..!!');
                            $("#empform")[0].reset()
                        } else {
                            alertify.logPosition("bottom left");
                            alertify.error(res.message);
                        }
                    }
                });
            }
            catch (ex) {
                console.log(ex)
            }

        }
        else {
            alertify.error("Please Verify TPIN..!!")
        }
    })

});