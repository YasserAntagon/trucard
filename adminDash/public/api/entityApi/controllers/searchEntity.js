$(document).ready(function () {
    var err = $("#errorMsg").val();
    if(err){
      alertify.error(err)
    }
})
var isParent;
$("#btnsearch").on('click', function () {
    var valid = searchvalidation();
    if (valid == true) {
        let vdata = $('#txtsearch').val().trim();
        let url = $('#formSys').val().trim(); 
        window.location = "/" + url + "?id=" + vdata;
    }
});

$('#txtsearch').keyup(function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') {
        var valid = searchvalidation();
        if (valid == true) {
            let vdata = $('#txtsearch').val().trim();
            let url = $('#formSys').val().trim();
            window.location = "/" + url + "?id=" + vdata;
        }
    }
});
/* 
var onSearch = function ($dlrText) 
{
    var json = {
        "rTruID": $dlrText,
    };
    $('.loaderContainer').css("display", 'block');
    ajax({
        "url": "/eEntity/searchEntity", "method": "POST", data: json, success: function (a) {
            let data = a.body;
            $('.loaderContainer').fadeOut('slow');
            if (data.status == 200) {
                var res = data.resource;
                $("#txteTruid").val(res.truID);
                $('#custdetails').removeClass('hidden');
                $('#custsearch').addClass('hidden');
                $("#txtname").html(res.companyName);  // Consumer Name
                $('#txttruid').html(res.truID)
                $("#lblstatus").removeClass("");
                $('#txtnodecount').html(res.nodes)

                getD.getenProfile(JSON.stringify({ "url": res.image }), function (err, data) {
                    if (err) {
                        $('#cutoImage').attr("src", "images/user.png");
                    }
                    var a = JSON.parse(data);
                    if (a.status == "200") {
                        $('#cutoImage').attr("src", 'data:image/png;base64,' + a.resource);
                    }
                    else {
                        $('#cutoImage').attr("src", "images/user.png");
                    }
                })

                isParent = res.isParent
                if (isParent == false) {
                    getD.getenProfile(JSON.stringify({ "url": res.parentImage }), function (err, data) {
                        if (err) {
                            $('#buyprof').attr("src", "images/user.png");
                        }
                        var a = JSON.parse(data);
                        if (a.status == "200") {
                            $('#buyprof').attr("src", 'data:image/png;base64,' + a.resource);
                        }
                        else {
                            $('#buyprof').attr("src", "images/user.png");
                        }
                    })
                    $('#nodelist').addClass('hidden')
                    $('#transRepo').addClass('hidden')
                    $('.nodeCount').addClass('hidden')
                    $('#aden').removeClass('hidden')
                    $('#etruID').html(res.parentTruID)
                    $('#eaddress').html(res.parentCity + ', ' + res.parentCountry)
                    $('#ecompanyName').html(res.parentCompanyName)

                }
                else {
                    $('#nodelist').removeClass('hidden')
                    $('#transRepo').removeClass('hidden')
                    $('.nodeCount').removeClass('hidden')
                    $('#aden').addClass('hidden')
                }
                if (res.isLending == true) {
                    $('#lnd').removeClass('hidden')
                } 
                var eaddress = ""
                if (res.address) {

                    eaddress = res.address.houseNumber + ", " + res.address.streetNumber + ", " + res.address.landmark + ", <br>" + res.address.city + ", " + res.address.state + ", <br>" + res.address.country + " - " + res.address.pin;
                }
                $('#eAddress').html(eaddress)
                $("#lblstatus").removeAttr('class');
                if (res.KYCFlag == "active") {
                    $("#lblstatus").addClass("label label-success");
                    $("#accountStatus").html(res.KYCFlag)
                } else if (res.KYCFlag == "pending") {
                    $("#lblstatus").addClass("label label-warning");
                    $("#accountStatus").html(res.KYCFlag)
                    $("#assetmanagerlocking").html('<span class="fa-stack fa-lg"><span class="fa fa-clrcle-o fa-stack-2x text-success"></span><span class="fa fa-key fa-stack-1x"></span></span>' + "Activate Account");
                    $("#assetmanagerlocking").attr("data-id", "0")
                } else if (res.KYCFlag == "banned") {
                    $("#lblstatus").addClass("label label-danger");
                    $("#accountStatus").html(res.KYCFlag)
                    $("#assetmanagerlocking").html('<span class="fa-stack fa-lg"><span class="fa fa-clrcle-o fa-stack-2x text-success"></span><span class="fa fa-key fa-stack-1x"></span></span>' + "Activate Account");
                    $("#assetmanagerlocking").attr("data-id", "0")
                } else if (res.KYCFlag == "holder") {
                    $("#lblstatus").addClass("label label-primary");
                    $("#accountStatus").html("Account On Hold")
                    $("#assetmanagerlocking").html('<span class="fa-stack fa-lg"><span class="fa fa-clrcle-o fa-stack-2x text-success"></span><span class="fa fa-key fa-stack-1x"></span></span>' + "Activate Account");
                    $("#assetmanagerlocking").attr("data-id", "0")
                }
                if (res.assetstore) {
                    var ccontactAddress;
                    if (res.assetstore.companyRegisteredAddress) {
                        ccontactAddress = res.assetstore.companyRegisteredAddress.houseNumber + ", " + res.assetstore.companyRegisteredAddress.streetNumber + ", " + res.assetstore.companyRegisteredAddress.city + ", " + res.assetstore.companyRegisteredAddress.state + ", " + res.assetstore.companyRegisteredAddress.country + "-" + res.assetstore.companyRegisteredAddress.pin;
                    }
                    var image = res.assetstore.image;
                    var fileNameIndex = image.lastIndexOf("/") + 1;
                    var lastChar = image.substr(fileNameIndex);
                    var img = "dist/img/avatar5.png"
                    if (lastChar != "0") {
                        img = image;
                    }
                    $(".cimgprofile").attr("src", img);
                    $("#ccompanyName").html(res.assetstore.companyName);
                    $("#ctruID").html(res.assetstore.truID);
                    $("#custaddress").html(ccontactAddress);
                }

                if (res.entity) {
                    var econtactAddress;
                    if (res.entity.companyRegisteredAddress) {
                        econtactAddress = res.entity.companyRegisteredAddress.houseNumber + ", " + res.entity.companyRegisteredAddress.streetNumber + ", " + res.assetstore.companyRegisteredAddress.city + ", " + res.assetstore.companyRegisteredAddress.state + ", " + res.assetstore.companyRegisteredAddress.country + "-" + res.assetstore.companyRegisteredAddress.pin;
                    }
                    var image = res.entity.image;
                    var fileNameIndex = image.lastIndexOf("/") + 1;
                    var lastChar = image.substr(fileNameIndex);
                    var img = "dist/img/avatar5.png"
                    if (lastChar != "0") {
                        img = image;
                    }

                    console.log(econtactAddress)

                    $(".eimgprofile").attr("src", img);
                    $("#ecompanyName").html(res.entity.companyName);
                    $("#etruID").html(res.entity.truID);
                    $("#eaddress").html(econtactAddress);
                }
                if (res.isParent) {
                    $("#entityContainer").load("entityPages/entityReport.html");
                } else {
                    $("#entityContainer").load("entityPages/entityWallet.html");
                }

            } else {
                alertify.error(data.message);
            }
        }
    });
}
var onupdate = function ($dlrText) {
    var json = {
        "rTruID": $dlrText,
    };
    ajax({
        "url": "/eEntity/searchEntity", "method": "POST", data: json, success: function (a) {
            let data = a.body;
            if (err) throw err;
            if (data.status == 200) {
                //eloki.insertEntityData(data, edb);
                var res = data.resource;
                var eaddress = res.address.houseNumber + ", " + res.address.streetNumber + ", " + res.address.landmark + ", <br>" + res.address.city + ", " + res.address.state + ", <br>" + res.address.country + " - " + res.address.pin;
                $('#eAddress').html(eaddress)

            } else {
                alertify.error(data.messege);
            }
        }
    });
} */

function onSearchClose() // hide assetmanager details
{
    $('#custdetails').addClass('hidden');
    $('#custsearch').removeClass('hidden');
    $('.roundedsearch').css("border-color", "#d2d6de");
    $('#btnsearch').attr('disabled', false);
    $("#txtsearch").val("");
    $("#err_req").text("* here you can search by TruID, Mobile No, Email Id...");
}

