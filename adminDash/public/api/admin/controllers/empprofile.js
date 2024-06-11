/*!
 File: Employee  Registration
 Edited : Suresh Patil
 Dated : 29-05-2019
 Description : controller for profile details
 */

// var empreq = require(__dirname + '/api/model/empprofile');

$(function () {
    loadprofile();
});

function loadprofile() {
    $.ajax({
        "url": "/profile/getEmpProfile", "method": "POST",  success: function (a) {
            let res = a.body;
            if (res.status == 200) {
                jsonBuilder(res.resource[0], a.page)
            }
        }
    });

}

function editEnabled() {
    // $empid = $("#empid").val();
    // store.set("eprofile", "y");
    store.set("empId", $empid); // get Data of emp 
    $("#pageContainer").empty();
    $("#pageContainer").load("pages/empMaster.html");
}
function jsonBuilder(a, page) {
    var dob = new Date();
    var dob1 = dob;
    var jdob = new Date();
    var jdob1 = dob;
    if (a.DOB) {
        dob = new Date(Date.parse(a.DOB))
        dob1 = moment(dob).format('DD/MM/YYYY');
    }
    if (a.joiningDate) {
        jdob = new Date(Date.parse(a.joiningDate))
        jdob1 = moment(jdob).format('DD/MM/YYYY');
    }
    var image = a.image;
    var lastChar = image[image.length - 1];
    var img = "images/user.png"
    if (lastChar != "0") {
        var img1 = $(".profile-user-img").attr("data-src");
        img = img1 + a.image;
        $(".profile-user-img").attr("src", img);
    }
    else{
        $(".profile-user-img").attr("src", img);
    }


    $(".profile-username").html(a.title + " " + a.fName + " " + a.mName + " " + a.lName);
    $("#inline-username").html(a.empCode);
    $("#inline-mobile").html(a.mobile);
    $("#inline-email").html(a.email);
    $("#empid").val(a.truID);
    $("#btnedit").attr('href', page + "?params=" + a.truID);

    $("#telephone").html(a.landLine);
    $("#skillset").html(a.skillset);
    $("#jDate").html(jdob1);



    $("#sex").html(a.gender);
    $("#dob").html(dob1);
    // $("#telephone").html(a.email);
    // $(".profile-user-img").attr("src", img);
    if (a.contactAddress) {
        $("#cAddress").html(a.contactAddress.houseNumber + ", " + a.contactAddress.streetNumber + ", " + a.contactAddress.landmark + ", " + a.contactAddress.city + ", " + a.contactAddress.state + ", " + a.contactAddress.country + " - " + a.contactAddress.pin);
        $("#rAddress").html(a.permanentAddress.houseNumber + ", " + a.permanentAddress.streetNumber + ", " + a.permanentAddress.landmark + ", " + a.permanentAddress.city + ", " + a.permanentAddress.state + ", " + a.permanentAddress.country + " - " + a.permanentAddress.pin);
    }
}
// file upload change to show preview image
$("#logo-id").change(function () {
    readURL(this);
});

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('.profile-user-img').attr('src', e.target.result);
        };
        reader.readAsDataURL(input.files[0]);
    }
}


