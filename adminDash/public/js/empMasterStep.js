/*!
 File: Employee  Master
 Edited : Nikhil Bharambe
 Dated : 04-05-2019
 Description : Company related all element events we write here.
 */
// var emplData = require(__dirname + '/api/db/employeeData');
// var config = require(__dirname+'/api/config'); 
$(document).ready(function () {
    $('#txtdob').inputmask('dd/mm/yyyy', {
        'placeholder': 'dd/mm/yyyy'
    });

    $('#txt_joining').inputmask('dd/mm/yyyy', {
        'placeholder': 'dd/mm/yyyy'
    });

    var navListItems = $('div.setup-panel div a'),
        allWells = $('.setup-content'),
        allNextBtn = $('.nextBtn');

    allWells.hide();

    navListItems.click(function (e) {
        e.preventDefault();
        var $target = $($(this).attr('href')),
            $item = $(this);

        if (!$item.hasClass('disabled')) {
            navListItems.removeClass('btn-primary').addClass('btn-default');
            $item.addClass('btn-primary');
            allWells.hide();
            $target.show();
            $target.find('input:eq(0)').focus();
        }
    });

    allNextBtn.click(async function () {
        var curStep = $(this).closest(".setup-content"),
            curStepBtn = curStep.attr("id"),
            nextStepWizard = $('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().next().children("a"),
            // curInputs = curStep.find("input[type='text'],input[type='url']"),
            isValid = true;

        $(".form-group").removeClass("has-error"); 

        if (curStepBtn == "step-1") {
            if (step1()) {
                var stat = await submitEmployee();
                if (stat) {
                    nextStepWizard.removeAttr('disabled').trigger('click');
                }
            } else {
                isValid = false;
            }
        } else if (curStepBtn == "step-2") {
            if (step2()) {
                var stat = await submitAddress();
                if (stat) {
                    nextStepWizard.removeAttr('disabled').trigger('click');
                }
            } else {
                isValid = false;
            }
        } else if (curStepBtn == "step-3") {
            if (step3()) {
                var stat = await submitbank();
                if (stat) {
                    nextStepWizard.removeAttr('disabled').trigger('click');
                }
                $('#btnSubmit').attr('disabled', false);
            } else {
                isValid = false;
            }
        } else if (curStepBtn == "step-4") {
            submitDocument();
        }

        // if (isValid)
        //     nextStepWizard.removeAttr('disabled').trigger('click');
    });

    // Male female radio
    $('.radio-group label').on('click', function () {
        $(this).removeClass('not-active').siblings().addClass('not-active');
    });

    $('div.setup-panel div a.btn-primary').trigger('click');

    // Validation
    $("#appa").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn2').attr('disabled', true);
            $("#error_cp_add1").text("*Enter Appartment / Building No.!");
        } else {
            $(this).css("border-color", "#2eb82e");
            $('#btn2').attr('disabled', false);
            $("#error_cp_add1").text("");
        }
    });
    $("#txtlandmark").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn2').attr('disabled', true);
            $("#error_landmark").text("*Enter Landmark!");
        } else {
            $(this).css("border-color", "#2eb82e");
            $('#btn2').attr('disabled', false);
            $("#error_landmark").text("");
        }
    });




    $("#txtstreet").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn2').attr('disabled', true);
            $("#error_street").text("*Enter Street / Area Name!");
        } else {
            $(this).css("border-color", "#2eb82e");
            $('#btn2').attr('disabled', false);
            $("#error_street").text("");
        }
    });
    $("#txtpincode").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn2').attr('disabled', true);
            $("#error_pin").text("*Enter Pincode!");
        } else {
            $(this).css("border-color", "#2eb82e");
            $('#btn2').attr('disabled', false);
            $("#error_pin").text("");
        }
    });
    $("#txtcity").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn2').attr('disabled', true);
            $("#error_city").text("*Enter City!");
        } else {
            $(this).css("border-color", "#2eb82e");
            $('#btn2').attr('disabled', false);
            $("#error_city").text("");
        }
    });
    $("#txtstate").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn2').attr('disabled', true);
            $("#error_state").text("*Enter State!");
        } else {
            $(this).css("border-color", "#2eb82e");
            $('#btn2').attr('disabled', false);
            $("#error_state").text("");
        }
    });
    $("#txtcountry").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn2').attr('disabled', true);
            $("#error_country").text("*Enter Country!");
        } else {
            $(this).css("border-color", "#2eb82e");
            $('#btn2').attr('disabled', false);
            $("#error_country").text("");
        }
    });
    $("#b_appa").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn2').attr('disabled', true);
            $("#error_b_add1").text("* Enter Appartment / Building No.!");
        } else {
            $(this).css("border-color", "#2eb82e");
            $('#btn2').attr('disabled', false);
            $("#error_b_add1").text("");
        }
    });
    $("#b_txtlandmark").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn2').attr('disabled', true);
            $("#error_b_landmark").text("* Enter Landmark!");
        } else {
            $(this).css("border-color", "#2eb82e");
            $('#btn2').attr('disabled', false);
            $("#error_b_landmark").text("");
        }
    });
    $("#b_txtstreet").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn2').attr('disabled', true);
            $("#error_b_street").text("* Enter Street / Area Name!");
        } else {
            $(this).css("border-color", "#2eb82e");
            $('#btn2').attr('disabled', false);
            $("#error_b_street").text("");
        }
    });
    $("#b_txtpincode").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn2').attr('disabled', true);
            $("#error_b_pin").text("* Enter Pincode!");
        } else {
            $(this).css("border-color", "#2eb82e");
            $('#btn2').attr('disabled', false);
            $("#error_b_pin").text("");
        }
    });
    $("#b_txtcity").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn2').attr('disabled', true);
            $("#error_b_city").text("* Enter City!");
        } else {
            $(this).css("border-color", "#2eb82e");
            $('#btn2').attr('disabled', false);
            $("#error_b_city").text("");
        }
    });
    $("#b_txtstate").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn2').attr('disabled', true);
            $("#error_b_state").text("* Enter State!");
        } else {
            $(this).css("border-color", "#2eb82e");
            $('#btn2').attr('disabled', false);
            $("#error_b_state").text("");
        }
    });
    $("#b_txtcountry").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn2').attr('disabled', true);
            $("#error_b_country").text("* Enter Country!");
        } else {
            $(this).css("border-color", "#2eb82e");
            $('#btn2').attr('disabled', false);
            $("#error_b_country").text("");
        }
    });

    $("#txt_fname").bind("change blur", function () {
        if ($("#txt_fname").val() == '') {
            $("#txt_fname").css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_fname").text("*Please Enter First Name!");

        } else {
            $("#txt_fname").css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_fname").text("");
        }
    });
    $("#txtMiddleName").bind("change blur", function () {
        if ($("#txtMiddleName").val() == '') {
            $("#txtMiddleName").css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_mname").text("*Please Enter Middle Name!");

        } else {
            $("#txtMiddleName").css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_mname").text("");
        }
    });
    $("#txtLName").bind("change blur", function () {
        if ($("#txtLName").val() == '') {
            $("#txtLName").css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_lname").text("*Please Enter Last Name!");

        } else {
            $("#txtLName").css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_lname").text("");
        }

    });

    $("#txttelno").bind("change blur", function () {
        if ($("#txtmobno").val() == '') {
            $("#txtmobno").css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_txttelno2").text("* Enter Emergency Number!");
        } else {
            $("#txttelno").css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_txttelno2").text("");
        }
    });

    $("#txtmobno").bind("change blur", function () {
        if ($("#txtmobno").val() == '') {
            $("#txtmobno").css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_txttelno").text("*Enter Mobile Number!");

        } else {
            $("#txttelno").css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_txttelno").text("");
        }
    });
    $("#txtemail").bind("change blur", function () {
        if ($("#txtemail").val() == '') {
            $("#txtemail").css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_txtemail").text("*Enter Email Id!");

        } else {
            $("#txtemail").css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_txtemail").text("");
        }

    });
    $("#txtempCode").bind("change blur", function () {
        if ($("#txtempCode").val() == '') {
            $("#txtempCode").css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_txtempcode").text("*Enter Email Id!");

        } else {
            $("#txtempCode").css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_txtempcode").text("");
        }

    });
    $("#txtdob").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_txtdob").text("*Enter Date Of Birth!");
        } else {
            $(this).css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_txtdob").text("");
        }
    });

    $("#txt_joining").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_joining").text("*please enter joining date!");
        } else {
            $(this).css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_joining").text("");
        }
    });
    $("#txtskill").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_skills").text("*Enter employee skill set..!!");
        } else {
            $(this).css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_skills").text("");
        }
    });




    $("#txt_bankname").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn3').attr('disabled', true);
            $("#error_bankname").text("*Enter Bank Name !");

        } else {
            $(this).css("border-color", "#2eb82e");
            $('#btn3').attr('disabled', false);
            $("#error_bankname").text("");
        }

    });
    $("#txtifsc").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn3').attr('disabled', true);
            $("#error_ifsc").text("* Please Enter IFSC Code!");

        } else {
            $(this).css("border-color", "#2eb82e");
            $('#btn3').attr('disabled', false);
            $("#error_ifsc").text("");
        }

    });
    $("#txtAcc").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn3').attr('disabled', true);
            $("#error_acc").text("* Please Enter Account Number..!!");
        } else {
            $(this).css("border-color", "#2eb82e");
            $('#btn3').attr('disabled', false);
            $("#error_acc").text("");
        }
    });
    $("#b_appa").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn2').attr('disabled', true);
            $("#error_b_add1").text("* Enter Appartment / Building No.!");
        } else {
            $(this).css("border-color", "#2eb82e");
            $('#btn2').attr('disabled', false);
            $("#error_b_add1").text("");
        }
    });
    $("#b_txtlandmark").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn2').attr('disabled', true);
            $("#error_b_landmark").text("* Enter Landmark!");
        } else {
            $(this).css("border-color", "#2eb82e");
            $('#btn2').attr('disabled', false);
            $("#error_b_landmark").text("");
        }
    });
    $("#b_txtstreet").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn2').attr('disabled', true);
            $("#error_b_street").text("* Enter Street / Area Name!");
        } else {
            $(this).css("border-color", "#2eb82e");
            $('#btn2').attr('disabled', false);
            $("#error_b_street").text("");
        }
    });
    $("#b_txtpincode").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn2').attr('disabled', true);
            $("#error_b_pin").text("* Enter Pincode!");
        } else {
            $(this).css("border-color", "#2eb82e");
            $('#btn2').attr('disabled', false);
            $("#error_b_pin").text("");
        }
    });
    $("#b_txtcity").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn2').attr('disabled', true);
            $("#error_b_city").text("* Enter City!");
        } else {
            $(this).css("border-color", "#2eb82e");
            $('#btn2').attr('disabled', false);
            $("#error_b_city").text("");
        }
    });
    $("#b_txtstate").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn2').attr('disabled', true);
            $("#error_b_state").text("* Enter State!");
        } else {
            $(this).css("border-color", "#2eb82e");
            $('#btn2').attr('disabled', false);
            $("#error_b_state").text("");
        }
    });
    $("#b_txtcountry").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn2').attr('disabled', true);
            $("#error_b_country").text("* Enter Country!");
        } else {
            $(this).css("border-color", "#2eb82e");
            $('#btn2').attr('disabled', false);
            $("#error_b_country").text("");
        }
    });


});
 
function readURL(input) {
    var formData = new FormData();
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#imagePreview').css('background-image', 'url(' + e.target.result + ')');
            $('#imagePreview').hide();
            $('#imagePreview').fadeIn(650);
            var file = input.files[0];
            if (!file.type.match('image.*')) {
                //check file type
                // $("#dropBox").html("Please choose an images file.");
                alertify.logPosition("bottom left");
                alertify.error('Please choose an images file..!!');
            } else if (file.size > 1048576) {
                alertify.logPosition("bottom left");
                alertify.error('Sorry, your file is too large (>1 MB)..!!');
                //check file size (in bytes)
                //$("#dropBox").html("Sorry, your file is too large (>1 MB)");
            } else {
                //append the uploadable file to FormData object
                $tid = $("#atruid").val();
                formData.append('truID', $tid);
                formData.append('photo', file, file.name);

                txnCheck(function (status) {
                    if (status == true) {
                        $.ajax({
                            url: "/adminFileupload/empProfile",
                            data: formData,
                            processData: false,
                            type: 'POST',
                            contentType: false,
                            cache: false,
                            mimeType: 'multipart/form-data',
                            success: function (data) {
                                $da = JSON.parse(data);
                                if ($da.status == "200") {
                                    if ($tid == $da.aTruID) {
                                        imgpath = $('#imagePreview').attr('data-src')
                                        $('.profpic').attr('src', imgpath + $da.image)
                                    }
                                    alertify.logPosition("bottom left");
                                    alertify.success('Profile uploaded successfully..!!');
                                }
                                else {
                                    alertify.logPosition("bottom left");
                                    alertify.error($da.message);
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
        reader.readAsDataURL(input.files[0]);
    }
}



$("#imageUpload").change(function () {
    readURL(this);
});

function step1() {
    var valid = true;
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
    if ($("#txtMiddleName").val() == '') {
        $("#txtMiddleName").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_mname").text("*Please Enter Middle Name!");
        valid = false;
    } else {
        $("#txtMiddleName").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_mname").text("");
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

    $("#txtdob").bind("change blur", function () {
        if ($("#txtdob").val() == '') {
            $("#txtdob").css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_txtdob").text("*Enter Date Of Birth!");
        } else {
            $("#txtdob").css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_txtdob").text("");
        }
    });



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
    if ($("#txt_joining").val() == '') {
        $("#txt_joining").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_joining").text("* Enter employee joining date..!!");
        valid = false;
    } else {
        $("#txt_joining").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_joining").text("");
    }
    if ($("#txtskill").val() == '') {
        $("#txtskill").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_skills").text("* Enter employee skill set..!!");
        valid = false;
    } else {
        $("#txtskill").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_skills").text("");
    }
    $joining = $("#txt_joining").val();
    if (!moment($joining, 'DD/MM/YYYY', true).isValid()) {
        $("#txt_joining").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_joining").text("* Enter valid joining date..!!");
        valid = false;
    }
    else {
        $("#txt_joining").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_joining").text("");
    }



    $do = $("#txtdob").val();
    if (!moment($do, 'DD/MM/YYYY', true).isValid()) {
        $("#txtdob").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_txtdob").text("*Please enter valid date Of birth!");
        valid = false;
    }
    else {
        $("#txtdob").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_txtdob").text("");
    }


    $joining = $("#txt_joining").val();
    if (!moment($joining, 'DD/MM/YYYY', true).isValid()) {
        $("#txt_joining").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_joining").text("* Enter valid joining date..!!");
        valid = false;
    }
    else {
        $("#txt_joining").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_joining").text("");
    }
    return valid;
}

function step2() {
    var valid = true;
    if ($("#appa").val() == '') {

        $("#appa").css("border-color", "#FF0000");
        $('#btn2').attr('disabled', true);
        $("#error_cp_add1").text("*Enter Appartment / Buildding No!");
        valid = false;
    } else {
        $("#appa").css("border-color", "#2eb82e");
        $('#btn2').attr('disabled', false);
        $("#error_cp_add1").text("");
    }
    if ($("#txtlandmark").val() == '') {
        $("#txtlandmark").css("border-color", "#FF0000");
        $('#btn2').attr('disabled', true);
        $("#error_landmark").text("*Enter Landmark!");
        valid = false;
    } else {
        $("#txtlandmark").css("border-color", "#2eb82e");
        $('#btn2').attr('disabled', false);
        $("#error_landmark").text("");
    }
    if ($("#txtstreet").val() == '') {
        $("#txtstreet").css("border-color", "#FF0000");
        $('#btn2').attr('disabled', true);
        $("#error_street").text("*Enter Street / Area Name!");
        valid = false;
    } else {
        $("#txtstreet").css("border-color", "#2eb82e");
        $('#btn2').attr('disabled', false);
        $("#error_street").text("");
    }
    if ($("#txtpincode").val() == '') {

        $("#txtpincode").css("border-color", "#FF0000");
        $('#btn2').attr('disabled', true);
        $("#error_pin").text("*Enter Pincode!");
        valid = false;
    } else {
        $("#txtpincode").css("border-color", "#2eb82e");
        $('#btn2').attr('disabled', false);
        $("#error_pin").text("");
    }
    if ($("#txtcity").val() == '') {

        $("#txtcity").css("border-color", "#FF0000");
        $('#btn2').attr('disabled', true);
        $("#error_city").text("*Enter City!");
        valid = false;
    } else {
        $("#txtcity").css("border-color", "#2eb82e");
        $('#btn2').attr('disabled', false);
        $("#error_city").text("");
    }
    if ($("#txtstate").val() == '') {

        $("#txtstate").css("border-color", "#FF0000");
        $('#btn2').attr('disabled', true);
        $("#error_state").text("*Enter State!");
        valid = false;
    } else {
        $("#txtstate").css("border-color", "#2eb82e");
        $('#btn2').attr('disabled', false);
        $("#error_state").text("");
    }
    if ($("#txtcountry").val() == '') {

        $("#txtcountry").css("border-color", "#FF0000");
        $('#btn2').attr('disabled', true);
        $("#error_country").text("*Enter Country!");
        valid = false;
    } else {
        $("#txtcountry").css("border-color", "#2eb82e");
        $('#btn2').attr('disabled', false);
        $("#error_country").text("");
    }
    if ($("#b_appa").val() == '') {

        $("#b_appa").css("border-color", "#FF0000");
        $('#btn2').attr('disabled', true);
        $("#error_b_add1").text("*Enter Appartment / Buildding No!");
        valid = false;
    } else {
        $("#b_appa").css("border-color", "#2eb82e");
        $('#btn2').attr('disabled', false);
        $("#error_b_add1").text("");
    }
    if ($("#b_txtlandmark").val() == '') {

        $("#b_txtlandmark").css("border-color", "#FF0000");
        $('#btn2').attr('disabled', true);
        $("#error_b_landmark").text("*Enter Landmark!");
        valid = false;
    } else {
        $("#b_txtlandmark").css("border-color", "#2eb82e");
        $('#btn2').attr('disabled', false);
        $("#error_b_landmark").text("");
    }
    if ($("#b_txtstreet").val() == '') {

        $("#b_txtstreet").css("border-color", "#FF0000");
        $('#btn2').attr('disabled', true);
        $("#error_b_street").text("*Enter Street / Area Name!");
        valid = false;
    } else {
        $("#b_txtstreet").css("border-color", "#2eb82e");
        $('#btn2').attr('disabled', false);
        $("#error_b_street").text("");
    }
    if ($("#b_txtpincode").val() == '') {

        $("#b_txtpincode").css("border-color", "#FF0000");
        $('#btn2').attr('disabled', true);
        $("#error_b_pin").text("*Enter Pincode!");
        valid = false;
    } else {
        $("#b_txtpincode").css("border-color", "#2eb82e");
        $('#btn2').attr('disabled', false);
        $("#error_b_pin").text("");
    }
    if ($("#b_txtcity").val() == '') {

        $("#b_txtcity").css("border-color", "#FF0000");
        $('#btn2').attr('disabled', true);
        $("#error_b_city").text("*Enter City!");
        valid = false;
    } else {
        $("#b_txtcity").css("border-color", "#2eb82e");
        $('#btn2').attr('disabled', false);
        $("#error_b_city").text("");
    }
    if ($("#b_txtstate").val() == '') {

        $("#b_txtstate").css("border-color", "#FF0000");
        $('#btn2').attr('disabled', true);
        $("#error_b_state").text("*Enter State!");
        valid = false;
    } else {
        $("#b_txtstate").css("border-color", "#2eb82e");
        $('#btn2').attr('disabled', false);
        $("#error_b_state").text("");
    }
    if ($("#b_txtcountry").val() == '') {

        $("#b_txtcountry").css("border-color", "#FF0000");
        $('#btn2').attr('disabled', true);
        $("#error_b_country").text("*Enter Country!");
        valid = false;
    } else {
        $("#b_txtcountry").css("border-color", "#2eb82e");
        $('#btn2').attr('disabled', false);
        $("#error_b_country").text("");
    }
    return valid;
}

function step3() {
    var valid = true;
    if ($("#txt_bankname").val() == '') {

        $("#txt_bankname").css("border-color", "#FF0000");
        $('#btn3').attr('disabled', true);
        $("#error_bankname").text("* Please Enter Bank Name!");
        valid = false;
    } else {
        $("#txt_bankname").css("border-color", "#2eb82e");
        $('#btn3').attr('disabled', false);
        $("#error_bankname").text("");
    }
    if ($("#txtifsc").val() == '') {
        $("#txtifsc").css("border-color", "#FF0000");
        $('#btn3').attr('disabled', true);
        $("#error_ifsc").text("* Please Enter IFSC Code!");
        valid = false;
    } else {
        $("#txtifsc").css("border-color", "#2eb82e");
        $('#btn3').attr('disabled', false);
        $("#error_ifsc").text("");
    }
    if ($("#txtAcc").val() == '') {
        $("#txtAcc").css("border-color", "#FF0000");
        $('#btn3').attr('disabled', true);
        $("#error_acc").text("* Please Enter Account Number!");
        valid = false;
    } else {
        $("#txtAcc").css("border-color", "#2eb82e");
        $('#btn3').attr('disabled', false);
        $("#error_acc").text("");
    }
    return valid;
}



// same as registred office address
$("input[name='reg']").change(function () {
    var radioValue = $(this).val();
    if (radioValue == 'True') {
        $('#b_appa').val($('#appa').val());
        $('#b_txtstreet').val($('#txtstreet').val());
        $('#b_txtlandmark').val($('#txtlandmark').val());
        $('#b_txtpincode').val($('#txtpincode').val());
        $('#b_txtstate').val($('#txtstate').val());
        $('#b_txtcity').val($('#txtcity').val());
        $('#b_txtcountry').val($('#txtcountry').val());
    } else {
        $('#b_appa').val('');
        $('#b_txtstreet').val('');
        $('#b_txtlandmark').val('');
        $('#b_txtpincode').val('');
        $('#b_txtstate').val('');
        $('#b_txtcity').val('');
        $('#b_txtcountry').val('');
    }
});
$("#btnBranchClose").on("click", function (e) {
    e.preventDefault();
    $("#pageContainer").empty();
    $("#pageContainer").load("pages/employeeList.html");
});

empBind = function () { 
    $empids = $("#empId").val();
    if ($empids) {
        var query = {
            'truID': $empids
        }; // loki query
        // emplData.getEmpData(db, query, function (res) {
        $.ajax({
            "url": "/employeeReg/getEmpData", "method": "POST", data: query, success: function (a) {
                var res = a.body;
                if (res.length > 0) {
                    $data = res[0];
                    // Company details bind truID
                    $("#atruid").val($data.truID);
                    $("#cmbTitle").val($data.title);
                    $("#txt_fname").val($data.fName);
                    $("#txtMiddleName").val($data.mName);
                    $("#txtLName").val($data.lName);
                    $("#txtmobno").val($data.mobile);
                    $("#txttelno").val($data.landLine); //repeat

                    $("#txtemail").val($data.email);
                    $("#txtempCode").val($data.empCode);
                    $('#cmbBranch').val($data.branchID);

                    $("#txtdob").val($data.DOB);
                    $("#txtskill").val($data.skillset);
                    $("#txt_joining").val($data.joiningDate);
                    $("#txt_bankname").val($data.bankName);
                    $("#txtAcc").val($data.accountNo);
                    $("#txtifsc").val($data.IFSC);
                    //    $("#txtDescription").html($data.companyDesc);

                    var image = $data.image;
                    var lastChar = image[image.length - 1];
                    var img = "images/user.png"
                    if (lastChar != "0") {
                        img = $data.image;
                        imgpath = $('#imagePreview').attr('data-src')
                        $('#imagePreview').css('background-image', 'url(' + imgpath + img + ')');
                    } else {
                        $('#imagePreview').css('background-image', 'url(' + img + ')');
                    }

                    $('#imagePreview').hide();
                    $('#imagePreview').fadeIn(650);

                    // Address bind
                    if ($data.contactAddress) {
                        $("#appa").val($data.contactAddress.houseNumber);
                        $("#txtlandmark").val($data.contactAddress.streetNumber);
                        $("#txtstreet").val($data.contactAddress.landmark);
                        $("#txtpincode").val($data.contactAddress.pin);
                        $("#txtcity").val($data.contactAddress.city);
                        $("#txtstate").val($data.contactAddress.state);
                        $("#txtcountry").val($data.contactAddress.country);
                        //  $("#lat").val($data.contactAddress.location.coordinates[0]);
                        //  $("#lng").val($data.contactAddress.location.coordinates[1]);
                    }
                    if ($data.permanentAddress) {
                        $("#b_appa").val($data.permanentAddress.houseNumber);
                        $("#b_txtlandmark").val($data.permanentAddress.streetNumber);
                        $("#b_txtstreet").val($data.permanentAddress.landmark);
                        $("#b_txtpincode").val($data.permanentAddress.pin);
                        $("#b_txtcity").val($data.permanentAddress.city);
                        $("#b_txtstate").val($data.permanentAddress.state);
                        $("#b_txtcountry").val($data.permanentAddress.country);
                    }
                    if ($data.bankDetails) {
                        // Bank bind
                        $("#txt_bankname").val($data.bankDetails.bankName);
                        $("#txtifsc").val($data.bankDetails.IFSC);
                        $("#txtAcc").val($data.bankDetails.accountNo);
                    }
                    $('#empform').find('input, textarea, button, select').attr('disabled', 'disabled');
                    // store.set('empTruID', $data.truID);

                    // loadEmpmaster();
                    // store.delete("empId"); // remove after load 
                } else {
                    alertify.logPosition("bottom left");
                    alertify.error("Please Fill the forms..!!");
                }
            }
        });
    } else {
        $('#editemp').hide();

    }
}

// Company Operators
var counter = 1;
var nextMaxp = 5;

function kycCopUpload() {
    var div = "<div class='abc" + counter + "'><div class='col-xs-12 col-sm-6 col-md-4' id='tmp" + counter + "'><div class='form-group'> <div class='input-group'> <span class='input-group-addon'> <span class='fa fa-file'></span> </span> <select type='text' class='form-control subdmitId' name='subdmitId[]' required id='subdmitId'" + counter + "' placeholder=''><option>PAN Card</option><option>Adhar Number</option><option>Other</option></select></div></div></div><div class='col-xs-12 col-sm-6 col-md-4'><div class='form-group'><div class='input-group'> <span class='input-group-addon'> <span class='fa fa-file-text-o'></span> </span><input type='text' class='form-control kycdocnum' maxlength='20' name='kycdocnum[]' required id='kycdocnum" + counter + "' placeholder='Enter your document number'/></div></div></div><div class='col-xs-12 col-sm-6 col-md-3'><div class='form-group'><div class='input-group'> <span class='input-group-addon'><span class='fa fa-upload'></span></span> <input id='file" + counter + "' name='files[]' type='file' class='form-control kycdoc' /> </div></div></div><div class='col-xs-12 col-sm-6 col-md-1'> <div class='form-group' id='kycadd'" + counter + "><a href='javascript:void(0);' class='text text-danger fa fa-2x fa-trash btnkycRemove' onclick='removeDoc(this);'  id=" + counter + " ></a></div></div></div>";
    $('.moreupload').append(div);
    counter++;
}

function removeDoc(event) {
    var count = $(event).attr("id");
    $(".abc" + count).remove();
    counter = counter - 1;
}

function addDoc(event) {
    if (counter === nextMaxp) {
        WarnMsg("Company Admin", "only " + nextMaxp + " document uploded..!!");
        return false;
    } else {
        kycCopUpload();
    }
}


function loadEmpmaster() {
    $eprofile = store.get("eprofile"); // which get from employee profile not in list
    if ($eprofile) {
        if ($eprofile == "y") {
            $('#empform').find('input, textarea, button, select').removeAttr('disabled');
            $('#txtmobno').attr('disabled', "disabled");
            $('#txtemail').attr('disabled', "disabled");
            $('#txtempCode').attr('disabled', "disabled");
            $('#cmbBranch').attr('disabled', "disabled");
            store.delete("eprofile");
            $(".editemp").hide();
            $(".empTitle").html("Your Profile");
        }
        else {
            $('#empform').find('input, textarea, button, select').attr('disabled', 'disabled');
        }
    }
    else {
        $('#empform').find('input, textarea, button, select').attr('disabled', 'disabled');
    }
}

empBind();

$(".editemp").click(function () { // edit acompany details form

    $('#empform').find('input, textarea, button, select').removeAttr('disabled');
    $(".editemp").hide();
});

$('.radio-group label').on('click', function () {
    $(this).removeClass('not-active').siblings().addClass('not-active');
});

$("input[name='reg']").change(function () {
    var radioValue = $(this).val();
    if (radioValue == 'True') {
        $('#b_appa').val($('#appa').val());
        $('#b_txtlandmark').val($('#txtlandmark').val());
        $('#b_txtstreet').val($('#txtstreet').val());
        $('#b_txtpincode').val($('#txtpincode').val());
        $('#b_txtcity').val($('#txtcity').val());
        $('#b_txtstate').val($('#txtstate').val());
        $('#b_txtcountry').val($('#txtcountry').val());

    } else {
        $('#b_appa').val('');
        $('#b_txtlandmark').val("");
        $('#b_txtstreet').val('');
        $('#b_txtpincode').val("");
        $('#b_txtcity').val("");
        $('#b_txtstate').val("");
        $('#b_txtcountry').val("");
    }
});