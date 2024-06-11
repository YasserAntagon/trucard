// var config=require(__dirname+"/api/config"); 
$(document).ready(function () {
 
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
                var stat = await submitLocation();
                if (stat) {
                    nextStepWizard.removeAttr('disabled').trigger('click');
                }
            }
            else {
                isValid = false;
            }
        }
        else if (curStepBtn == "step-2") {
            if (step2()) {

                var stat = await uploadData();
                if (stat) {
                    nextStepWizard.removeAttr('disabled').trigger('click');
                }
            }
            else {
                isValid = false;
            }
        }
        // else if (curStepBtn == "step-3") {
        //     if (step3()) {
        //         $('#btnSubmit').attr('disabled', false);
        //         // initMap(); 
        //     }
        //     else {
        //         isValid = false;
        //     }
        // }
        else if (curStepBtn == "step-3") {
            var stat = await submitAddress();
            if (stat) {
                nextStepWizard.removeAttr('disabled').trigger('click');
            }
        }

        // if (isValid)
        //     nextStepWizard.removeAttr('disabled').trigger('click');
    });

    $('div.setup-panel div a.btn-primary').trigger('click');
});

function uploadData() {
    var rented = $("#chkRented").attr("checked") ? 1 : 0;

    if (rented == 1) {
        var form_data = new FormData();
        $ownerName = $("#txtownerName").val();
        $sqft = $("#txtsqft").val();
        $rent = $("#txtrent").val();
        $main = $("#txtmain").val();
        $deposit = $("#txtdeposit").val();
        $omobile = $("#txtomobile").val();
        $oAddress = $("#txtownerAdd").val();
        $tid = $("#atruid").val();

        form_data.append('truID', $tid);
        form_data.append('ownerName', $ownerName);
        form_data.append('ownerAddress', $oAddress);
        form_data.append('area', $sqft);
        form_data.append('rent', $rent);
        form_data.append('maintainance', $main);
        form_data.append('deposit', $deposit);
        form_data.append('ownerMobileNo', $omobile);

        $total = $('.filekycdoc').length;
        if ($total > 0) {
            var x = 0;
            var y = 0;
            for ($i = 0; $i < $total; $i++) {
                var ss = $('.filekycdoc').get($i).files.length;
                if (ss == 0) {
                    x = 1;
                    break;
                }
                jQuery.each(jQuery('.filekycdoc')[$i].files, function (j, file) {
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
             
            var post_url = config.docurl + "/5012";
            //Upload Document on server 
            $.ajax({
                url: post_url,
                type: "POST",
                data: form_data,
                contentType: false,
                cache: false,
                processData: false,
                mimeType: "multipart/form-data"
            }).done(function (res) {
                var arr = JSON.parse(res);
                if (arr.status == 200) {
                    alertify.logPosition("bottom left");
                    alertify.success("Rented data uploaded..!!");
                }
            })
        }
        else {
            //  OwnerDetails("");
        }
    }
    else {
        OwnerDetails("");
    }
}


$(document).ready(function () {
    $("#txtBranchName").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_comp_name").text("* Enter Company Branch Name!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_comp_name").text("");
        }
    });
    $("#txtpurpose").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_cshort_name").text("* Enter what work actually done here!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_cshort_name").text("");
        }
    });
    $("#txttelno").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_txttelno").text("* Enter Telphone Number!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_txttelno").text("");
        }
    });
    $("#txtemail").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn1').attr('disabled', true);
            $("#error_txtemail").text("*Enter Email Id!");
        }
        else if (!isEmail($("#txtemail").val())) {
            $('#btn1').attr('disabled', true);
            $("#error_txtemail").text("*Enter Valid Email Id!");
            valid = false;
            return false;

        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn1').attr('disabled', false);
            $("#error_txtemail").text("");
        }
    });


    $("#txtownerName").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn2').attr('disabled', true);
            $("#error_txtowner").text("* Enter Owner Name !");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn2').attr('disabled', false);
            $("#error_txtowner").text("");
        }
    });
    $("#txtomobile").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn2').attr('disabled', true);
            $("#error_txtomobile").text("* Enter Owner Mobile Number!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn2').attr('disabled', false);
            $("#error_txtomobile").text("");
        }
    });


    $("#appa").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn3').attr('disabled', true);
            $("#error_cp_add1").text("*Enter Appartment / Building No.!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn3').attr('disabled', false);
            $("#error_cp_add1").text("");
        }
    });
    $("#txtlandmark").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn3').attr('disabled', true);
            $("#error_landmark").text("*Enter Landmark!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn3').attr('disabled', false);
            $("#error_landmark").text("");
        }
    });



    $("#txtstreet").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn3').attr('disabled', true);
            $("#error_street").text("*Enter Street / Area Name!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn3').attr('disabled', false);
            $("#error_street").text("");
        }
    });
    $("#txtpincode").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn3').attr('disabled', true);
            $("#error_pin").text("*Enter Pincode!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn3').attr('disabled', false);
            $("#error_pin").text("");
        }
    });
    $("#txtcity").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn3').attr('disabled', true);
            $("#error_city").text("*Enter City!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn3').attr('disabled', false);
            $("#error_city").text("");
        }
    });
    $("#txtstate").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn3').attr('disabled', true);
            $("#error_state").text("*Enter State!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn3').attr('disabled', false);
            $("#error_state").text("");
        }
    });
    $("#txtcountry").bind("change blur", function () {
        if ($(this).val() == '') {
            $(this).css("border-color", "#FF0000");
            $('#btn3').attr('disabled', true);
            $("#error_country").text("*Enter Country!");
        }
        else {
            $(this).css("border-color", "#2eb82e");
            $('#btn3').attr('disabled', false);
            $("#error_country").text("");
        }
    });
});
// step 1 validation
function step1() {
    var valid = true;

    if ($("#txtBranchName").val() == '') {
        $("#txtBranchName").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_comp_name").text("* Enter Company Branch Name!");
        valid = false;
    }
    else {
        $("#txtBranchName").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_comp_name").text("");
    }

    if ($("#txtpurpose").val() == '') {
        $("#txtpurpose").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_cshort_name").text("* Enter what work actually done here!");
        valid = false;
    }
    else {
        $("#txtpurpose").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_cshort_name").text("");
    }

    if ($("#txttelno").val() == '') {
        $("#txttelno").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_txttelno").text("* Enter Telphone Number!");
        valid = false;
    }
    else {
        $(this).css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_txttelno").text("");
    }


    if ($("#txtemail").val() == '') {
        $("#txtemail").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_txtemail").text("*Enter Email Id!");
        valid = false;
    }
    else if (!isEmail($("#txtemail").val())) {
        $('#btn1').attr('disabled', true);
        $("#error_txtemail").text("*Enter Valid Email Id!");
        valid = false;

    }
    else {
        $("#txtemail").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_txtemail").text("");
    }

    if ($("#txtBranchRegDate").val() == '') {
        $("#txtBranchRegDate").css("border-color", "#FF0000");
        $('#btn1').attr('disabled', true);
        $("#error_txtcompregdate").text("* Enter Owner Name !");
        valid = false;
    }
    else {
        $("#txtBranchRegDate").css("border-color", "#2eb82e");
        $('#btn1').attr('disabled', false);
        $("#error_txtcompregdate").text("");
    }

    return valid;
}

// step 2 validation
function step2() {
    var valid = true;

    if ($("#txtownerName").val() == '') {
        $("#txtownerName").css("border-color", "#FF0000");
        $('#btn2').attr('disabled', true);
        $("#error_txtowner").text("* Enter Owner Name !");
        valid = false;
    }
    else {
        $("#txtownerName").css("border-color", "#2eb82e");
        $('#btn2').attr('disabled', false);
        $("#error_txtowner").text("");
    }


    if ($("#txtomobile").val() == '') {
        $("#txtomobile").css("border-color", "#FF0000");
        $('#btn2').attr('disabled', true);
        $("#error_txtomobile").text("* Enter Owner Mobile Number!");
        valid = false;
    }
    else {
        $("#txtomobile").css("border-color", "#2eb82e");
        $('#btn2').attr('disabled', false);
        $("#error_txtomobile").text("");
    }
    return valid;
}

// step 3 validation
function step3() {
    var valid = true;
    if ($("#appa").val() == '') {
        $("#appa").css("border-color", "#FF0000");
        $('#btn3').attr('disabled', true);
        $("#error_cp_add1").text("*Enter Appartment / Buildding No!");
        valid = false;
    }
    else {
        $("#appa").css("border-color", "#2eb82e");
        $('#btn3').attr('disabled', false);
        $("#error_cp_add1").text("");
    }
    if ($("#txtlandmark").val() == '') {
        $("#txtlandmark").css("border-color", "#FF0000");
        $('#btn3').attr('disabled', true);
        $("#error_landmark").text("* Enter Landmark!");
        valid = false;
    }
    else {
        $("#txtlandmark").css("border-color", "#2eb82e");
        $('#btn3').attr('disabled', false);
        $("#error_landmark").text("");
    }
    if ($("#txtstreet").val() == '') {
        $("#txtstreet").css("border-color", "#FF0000");
        $('#btn3').attr('disabled', true);
        $("#error_street").text("* Enter Street / Area Name!");
        valid = false;
    }
    else {
        $("#txtstreet").css("border-color", "#2eb82e");
        $('#btn3').attr('disabled', false);
        $("#error_street").text("");
    }
    if ($("#txtpincode").val() == '') {
        $("#txtpincode").css("border-color", "#FF0000");
        $('#btn3').attr('disabled', true);
        $("#error_pin").text("* Enter Pincode!");
        valid = false;
    }
    else {
        $("#txtpincode").css("border-color", "#2eb82e");
        $('#btn3').attr('disabled', false);
        $("#error_pin").text("");
    }
    if ($("#txtcity").val() == '') {

        $("#txtcity").css("border-color", "#FF0000");
        $('#btn3').attr('disabled', true);
        $("#error_city").text("* Enter City!");
        valid = false;
    } else {
        $("#txtcity").css("border-color", "#2eb82e");
        $('#btn3').attr('disabled', false);
        $("#error_city").text("");
    }
    if ($("#txtstate").val() == '') {

        $("#txtstate").css("border-color", "#FF0000");
        $('#btn3').attr('disabled', true);
        $("#error_state").text("*Enter State!");
        valid = false;
    } else {
        $("#txtstate").css("border-color", "#2eb82e");
        $('#btn3').attr('disabled', false);
        $("#error_state").text("");
    }
    if ($("#txtcountry").val() == '') {

        $("#txtcountry").css("border-color", "#FF0000");
        $('#btn3').attr('disabled', true);
        $("#error_country").text("*Enter Country!");
        valid = false;
    } else {
        $("#txtcountry").css("border-color", "#2eb82e");
        $('#btn3').attr('disabled', false);
        $("#error_country").text("");
    }
    return valid;
}