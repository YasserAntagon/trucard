$(function () {

    $.ajax({
        "url": "/consumerDB/getConsumerdetails", "method": "POST", success: function (a) {
            let res = a.body;
            // console.log(res);
            if (res.length != 0) { 
                // console.log(res);
                bindcdatatoform(res);
            }
            else {
                var xyz = new Array();
                //bindcdatatoform(xyz);
            }
        }
    });
})
$('#editform').on('click', function () {

    $('form input[type="text"]').prop("disabled", false);
    $('form input[type="email"]').prop("disabled", false);
    $('form select[type="text"]').prop("disabled", false);
    $('form input[type="file"]').prop("disabled", false);
})

function bindcdatatoform(jsonObj) {

    $('form input[type="text"]').prop("disabled", true);
    $('form input[type="email"]').prop("disabled", true);
    $('form select[type="text"]').prop("disabled", true);
    $('form input[type="file"]').prop("disabled", true);


    vals = jsonObj[0]; 
    $('#txtfname').val(vals.fName);
    $('#txtmname').val(vals.mName);
    $('#txtlname').val(vals.lName);
    $('#txtemail').val(vals.email);
    $('#txtmobileno').val(vals.mobile);
    var dob = new Date(Date.parse(vals.DOB));
    var dob1 = moment(dob).format('DD/MM/YYYY');
    $('#txtDOB').val(dob1);
    var gen = vals.gender;
    if (gen == 'male') {
        $('#male').addClass('active');
        $('#male').removeClass('not-active');

        $('#female').addClass('not-active');
        $('#female').removeClass('active');

    }
    else if (gen == 'Female') {
        $('#female').addClass('active');
        $('#female').removeClass('not-active');

        $('#male').addClass('not-active');
        $('#male').removeClass('active');
    }

    badd = vals.billingAddress;
    $('#appa').val(badd.houseNumber);
    $('#txtstreet').val(badd.streetNumber);
    $('#txtlandmark').val(badd.landmark);
    $('#txtpincode').val(badd.pin);
    $('#txtstate').val(badd.state);
    $('#txtcity').val(badd.city);
    $('#txtcountry').val(badd.country);

    padd = vals.permanentAddress;
    $('#b_appa').val(badd.houseNumber);
    $('#b_txtstreet').val(badd.streetNumber);
    $('#b_txtlandmark').val(badd.landmark);
    $('#b_txtpincode').val(badd.pin);
    $('#b_txtstate').val(badd.state);
    $('#b_txtcity').val(badd.city);
    $('#b_txtcountry').val(badd.country);

    $('#txtccode').val(vals.countryCode);
    var doctype = vals.KYCDetails[0].docTitle;
    $('#subdmitId').val(doctype);
    var docnum = vals.KYCDetails[0].docNumber;
    $('#kycdocnum').val(docnum);
 
}
