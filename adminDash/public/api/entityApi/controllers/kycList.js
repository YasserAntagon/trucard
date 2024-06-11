
$entruid = $("#txteTruid").val()
$CRNNo=""
function callPan(e) {
    var $this = $(e);
    $this.button('loading'); 
    var json = {
        "rTruID": $entruid,
        "kycFlag": "active",
        "panStatus": "active"
    };
    Deactivate(json,$this,true);
}
var endetails = 0;
var enaddress = 0;
var endoc = 0;
var onSearch = function ($dlrText) {
    $entruid = $dlrText;
    $CRNNo = "";
    var json = {
        "rTruID": $dlrText,
    }
    $('.loaderContainer').css("display", 'block');
    $.ajax({
        "url": "/eEntity/searchEntity", "method": "POST", data: json, success: function (a) {
            let data = a.body;
            $('.loaderContainer').fadeOut('slow');
            if (data.status == 200) {
                $('#myModals').modal('toggle');
                $('.moreupload').empty();
                $(".aadhaar").removeClass("hidden")
                $(".pan").removeClass("hidden")
                /*     $(".dockychide").removeClass("hidden");
                    $(".pandockychide").removeClass("hidden");
                    $(".dockychide p").removeClass("hidden") */
                if (data.resource) {
                  
                    $CRNNo = data.resource.CRNNo;
                    if (data.resource.permanentAddress) {
                        enaddress = 1;
                        $('#txtaddress').html(
                            data.resource.permanentAddress.houseNumber + "," +
                            data.resource.permanentAddress.landmark + "," +
                            data.resource.permanentAddress.streetNumber + "," +
                            data.resource.permanentAddress.city + "," +
                            data.resource.permanentAddress.state + "," +
                            data.resource.permanentAddress.country + "," +
                            data.resource.permanentAddress.pin
                        )
                    }
                    //var dob1 = moment(data.resource.DOB).format('DD/MM/YYYY');
                    let cdt =data.resource.KYCTime?_formatDate(data.resource.KYCTime, "time"):"";
                    if(cdt)
                    {
                        $("#kycDate").text(cdt)
                    }
                    else
                    {
                        $("#kycDate").text("NA")
                    }
                    
                    var doc = data.resource.KYCDetails;
                    if (doc) {
                        var div = "";
                        if (doc.length != 0) {
                            endoc = 1;
                            for (var i = 0; i < doc.length; i++) {
                                $docNumber = doc[i].docNumber;
                                $box = doc[i].docTitle == "AadhaarCard" ? "Aadhaar Card" : doc[i].docTitle == "PANCard" ? "PAN Card" : doc[i].docTitle;
                                $file = doc[i].docFile;
                                var filename = doc[i].docFile.replace(/^.*[\\\/]/, '')
                                var ext = filename.split('.').pop();
                                // ext = "doc"
                                var cdnURL = $("#cdnURL").val();
                                if (ext == "jpg" || ext == "jpeg" || ext == "png") {
                                    $filename = '<a data-href="' + cdnURL + $file + '" data-type="image" class="edit_btn text text-info fa fa-picture-o fa-2x" title="view kyc consumer details" onclick="viewKYC(this);"> View</a>'
                                }
                                else if (ext == "pdf") {

                                    $filename = '<a data-href="' + cdnURL + $file + '" data-type="pdf" class="edit_btn text text-danger fa fa-file-pdf-o fa-2x" title="view kyc consumer details" onclick="viewKYC(this);"> View</a>'
                                }
                                else if (ext == "doc" || ext == "docx") {
                                    $filename = '<a data-href="' + cdnURL + $file + '" data-type="doc" class="edit_btn text text-info fa fa-file-word-o fa-2x" title="view kyc consumer details" onclick="viewKYC(this);"> View</a>'
                                }
                                var img = '<a class="xzoom-container" data-href="' + cdnURL + $file + '" data-src="' + cdnURL + $file + '" onclick="viewKYC(this);"><img class="img" width="100%" height="180px" src="' + cdnURL + $file + '" alt="document"></a>';
                                var panVerifield = '<div class="box-tools pull-right"><button data-loading-text="<i class=fa fa-circle-o-notch fa-spin></i> Processing Order" class="btn btn-sm btn-info action-btn" id="btnSubmitPAN" onclick="callAadhaar(this);">Verify</button><a href="javascript:void(0);" class="hidden adharactive"><img class="img" width="30px" height="30px" src="../images/check.png" />Verified</a></div>';
                                if (data.resource.aadharStatus && data.resource.aadharStatus == "active") {
                                    panVerifield='<div class="box-tools pull-right"><a href="javascript:void(0);" class="panactive"><img class="img" width="30px" height="30px" src="../images/check.png" />Verified</a></div>'
                                }
                                if ($box.toLowerCase().startsWith("pan")) {
                                    $(".pandockychide").addClass("hidden");
                                    if (doc.length == 1) {
                                        $(".dockychide").removeClass("hidden");
                                    }
                                    panVerifield = '<div class="box-tools pull-right"><button data-loading-text="<i class=fa fa-circle-o-notch fa-spin></i> Processing Order" class="btn btn-sm btn-info action-btn" id="btnSubmitAdhar" onclick="callPan(this);">Verify</button><a href="javascript:void(0);" class="hidden panactive"><img class="img" width="30px" height="30px" src="../images/check.png" />Verified</a></div>';
                                    if (data.resource.panStatus && data.resource.panStatus == "active") {
                                        panVerifield='<div class="box-tools pull-right"><a href="javascript:void(0);" class="panactive"><img class="img" width="30px" height="30px" src="../images/check.png" />Verified</a></div>'
                                    }
                                }
                                else {
                                    if (data.resource.aadharStatus && data.resource.aadharStatus == "active") {
                                        panVerifield='<div class="box-tools pull-right"><a href="javascript:void(0);" class="panactive"><img class="img" width="30px" height="30px" src="../images/check.png" />Verified</a></div>'
                                    }
                                    if (doc.length == 2) {
                                        $(".dockychide").addClass("hidden");
                                    }
                                    else if (doc.length == 1) {
                                        $(".pandockychide").removeClass("hidden");
                                        $(".dockychide").addClass("hidden");
                                    }
                                }

                                var xyz = '<div class="box box-widget box-widgets"><div class="box-body"><h5 class="profile-username">' + $box + panVerifield + '</h5></div><div class="box-footer no-padding">' + img + '<ul class="nav nav-stacked"><li><a href="#">Document No <span class="pull-right badge bg-aqua"> <span>' + $docNumber + '</span></span></a></li><li>' + $filename + '</li></ul> </div></div>';
                                div += "<div class='col-md-4'>" + xyz + "</div>";
                                if (doc[i].docBackUrl && doc[i].docBackUrl != "") {
                                    $fileback = doc[i].docBackUrl;
                                    var imgback = '<a class="xzoom-container" data-href="' + cdnURL + $fileback + '" data-src="' + cdnURL + $fileback + '" onclick="viewKYC(this);"><img class="img" width="100%" height="180px" src="' + cdnURL + $fileback + '" alt="document"></a>';
                                    var $box = $box + " Back Side"
                                    var xyz1 = '<div class="box box-widget box-widgets"><div class="box-body"><h5 class="profile-username">' + $box + '</h5></div><div class="box-footer no-padding">' + imgback + '<ul class="nav nav-stacked"></a></li><li><a href="#">Document No <span class="pull-right badge bg-aqua"> <span>' + $docNumber + '</span></span></a></li><li>' + $filename + '</li></ul> </div></div>';
                                    div += "<div class='col-md-4'>" + xyz1 + "</div>";
                                }
                            }
                            if (doc.length == 2) {
                                $(".dockychide").addClass("hidden");
                                $(".pandockychide").addClass("hidden");
                            }
                            $('.moreupload').empty();
                            $('.moreupload').append(div);
                            $('.moreupload').removeClass("hidden");
                        }
                        else {
                            $(".pandockychide").removeClass("hidden");
                            $(".dockychide").removeClass("hidden");
                        }
                    }
                    else {
                        $(".pandockychide").removeClass("hidden");
                        $(".dockychide").removeClass("hidden");
                    }

                    $("#lblstatus").removeAttr('class');
                    if (data.resource.KYCFlag == "active" && data.resource.docVerified) {
                        $("#lblstatus").addClass("label label-success pull-right");
                        $("#accountStatus").html(data.resource.KYCFlag)
                    }
                    else if (data.resource.KYCFlag == "active" && !data.resource.docVerified) {
                        $("#lblstatus").addClass("label label-warning pull-right");
                        $("#accountStatus").html("pending")
                        $("#assetmanagerlocking").html('<span class="fa-stack fa-lg"><span class="fa fa-clrcle-o fa-stack-2x text-success"></span><span class="fa fa-key fa-stack-1x"></span></span>' + "Activate Account");
                        $("#assetmanagerlocking").attr("data-id", "0")
                    }
                    else if (data.resource.KYCFlag == "pending") {
                        $("#lblstatus").addClass("label label-warning pull-right");
                        $("#accountStatus").html(data.resource.KYCFlag)
                        $("#assetmanagerlocking").html('<span class="fa-stack fa-lg"><span class="fa fa-clrcle-o fa-stack-2x text-success"></span><span class="fa fa-key fa-stack-1x"></span></span>' + "Activate Account");
                        $("#assetmanagerlocking").attr("data-id", "0")
                    } else if (data.resource.KYCFlag == "banned") {
                        $("#lblstatus").addClass("label label-danger pull-right");
                        $("#accountStatus").html(data.resource.KYCFlag)
                        $("#assetmanagerlocking").html('<span class="fa-stack fa-lg"><span class="fa fa-clrcle-o fa-stack-2x text-success"></span><span class="fa fa-key fa-stack-1x"></span></span>' + "Activate Account");
                        $("#assetmanagerlocking").attr("data-id", "0")
                    } else if (data.resource.KYCFlag == "holder") {
                        $("#lblstatus").addClass("label label-primary pull-right");
                        $("#accountStatus").html("Account On Hold")
                        $("#assetmanagerlocking").html('<span class="fa-stack fa-lg"><span class="fa fa-clrcle-o fa-stack-2x text-success"></span><span class="fa fa-key fa-stack-1x"></span></span>' + "Activate Account");
                        $("#assetmanagerlocking").attr("data-id", "0")
                    }
                }

            } else {
                alertify.error(data.message);
            }
        }
    });

}
$(document).ready(function () {
    $ctruid = $("#txteTruid").val()
    onSearch($ctruid)
})
function Deactivate(json, $thisG, pan) // call api
{
    txnCheck(function (status) {
        if (status == true) {
            $('#custActiveLoader').css("display", 'block');
            $.ajax({
                "url": "/eEntity/deactivatrAccount", "method": "POST", data: json, success: function (a) {
                    $('#custActiveLoader').fadeOut('slow');
                    let data = a.body;
                    setTimeout(function () {
                        $thisG.button('reset');
                        $thisG.addClass("hidden")
                        if (pan) {
                            $(".panactive").removeClass("hidden")
                        }
                        else {
                            $(".adharactive").removeClass("hidden")
                        }
                        bindList({ "KYCFlag": "pending" });
                    }, 500);

                }
            });
        }
        else {
            alertify.error("Please Verify TPIN..!!")
        }
    })
}

function viewKYC(evt) {
    $doctype = $(evt).attr("data-type");
    $doc = $(evt).attr("data-href");
    $('#docviewer').attr('src', $doc);
    $('#imagemodal').modal('show');
}
$(".viewClose").on("click", function (e) {
    $(".moreupload").removeClass("hidden");
    $(".docxviewer").addClass("hidden");
    $(".viewer").addClass("hidden");
});

//configuration  
var max_file_size = 1048576; //allowed file size. (1 MB = 1048576)
var allowed_file_types = ['image/png', 'image/gif', 'image/jpeg']; //allowed file types
var result_output = '#output'; //ID of an element for response output
var my_form_id = '#upload_form'; //ID of an element for response output
var progress_bar_id = '#progress-wrp'; //ID of an element for response output
var total_files_allowed = 3; //Number files allowed to upload
var uploadKYCPAN = function () {
    if ($("#cmbpanCard").val() == "0") {
        $("#cmbpanCard").css("border-color", "#FF0000");
        alertify.logPosition("bottom left");
        alertify.error("Please select document type...!!");
        return false;
    }
    else {
        $("#cmbpanCard").css("border-color", "#2eb82e");
    }
    if ($("#docNumber1").val() == '') {
        $("#docNumber1").css("border-color", "#FF0000");
        alertify.logPosition("bottom left");
        alertify.error("Enter Document number");
        return false;
    }
    else {
        $("#docNumber1").css("border-color", "#2eb82e");
    }
    if ($("#kycdocFile1").val() == "") {
        $("#kycdocFile1").css("border-color", "#FF0000");
        alertify.logPosition("bottom left");
        alertify.error("Please select pan card file...!!");
        $('#uploadKYCDoc').attr('disabled', true);
        return false;
    }
    else {
        $("#kycdocFile1").css("border-color", "#2eb82e");
        $('#uploadKYCDoc').attr('disabled', false);
    }
    kycUploadFile(2);
}
var uploadKYCDoc = function () {
    // front file
    if ($("#cmbBox").val() == "0") {
        $("#cmbBox").css("border-color", "#FF0000");
        alertify.logPosition("bottom left");
        alertify.error("Please select document type...!!");
        return false;
    }
    else {
        $("#cmbBox").css("border-color", "#2eb82e");
    }
    if ($("#docNumber").val() == '') {
        $("#docNumber").css("border-color", "#FF0000");
        alertify.logPosition("bottom left");
        alertify.error("Enter Document number");
        return false;
    }
    else {
        $("#docNumber").css("border-color", "#2eb82e");
    }
    kycUploadFile(1);
}
function kycUploadFile(status) {
    $(".btnup").show();
    var proceed = true; //set proceed flag
    var error = []; //errors 
    //reset progressbar
    $(progress_bar_id + " .progress-bar").css("width", "0%");
    $(progress_bar_id + " .status").text("0%");

    if (!window.File && window.FileReader && window.FileList && window.Blob) {
        //if browser doesn't supports File API
        error.push("Your browser does not support new File API! Please upgrade."); //push error text
    }
    else {
        //if everything looks good, proceed with jQuery Ajax
        if (proceed) {
            //submit_btn.val("Please Wait...").prop( "disabled", true); //disable submit button
            // $form = $("#kycForm");
            var form_data = new FormData(); //Creates new FormData object
            form_data.append('truID', $entruid);
            form_data.append('CRNNo', $CRNNo);
            if (status == 2) {
                form_data.append('kycDocNums[]', $('#docNumber1').val());
            }
            else {
                form_data.append('kycDocNums[]', $('#docNumber').val());
            }


            /* $('.kycdocnum').each(function (index, item) {
                var val = $(item).val();
                form_data.append('kycDocNums[]', val);
            }); */
            if (status == 2) {
                form_data.append('fileName[]', "PANCard");
            }
            else {
                $('.subdmitId').each(function (index, item) {
                    var val = $(item).val();
                    if (val == "AadhaarCard") {
                        form_data.append('fileName[]', "AadhaarCard");
                        form_data.append('fileName[]', "AadhaarCardBack");
                    }
                    else {
                        form_data.append('fileName[]', val);
                    }
                });
            }
            if (status == 2) {
                jQuery.each(jQuery('.kycdocpan')[0].files, function (j, file) {
                    form_data.append('files', file);
                });
            }
            else {
                $total = $('.kycdoc').length;
                var x = 0;
                for ($i = 0; $i < $total; $i++) {
                    var ss = $('.kycdoc').get($i).files.length;
                    if (ss == 0) {
                        x = 1;
                        break;
                    }
                    jQuery.each(jQuery('.kycdoc')[$i].files, function (j, file) {
                        form_data.append('files', file);
                    });
                }
                if (x == 1) {
                    WarnMsg("Consumer", "Please upload KYC Document..!!");
                    return false;
                }
            }
            // jQuery Ajax to Post form data
            $.ajax({
                url: "/adminFileupload/uploadPartnerDoc",
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
                res = JSON.parse(res);
                var arr = res.body;
                if (arr.status == 200) {
                    var docx = arr.resource;
                    if (docx.length > 0) {
                        dataBound(docx)
                    }
                    alertify.logPosition("bottom left");
                    alertify.success("KYC Document uploaded successfully...!!")
                }
                else {
                    alertify.logPosition("bottom left");
                    alertify.error("Please Try Again. Something get wrong..!!!")
                    return false;
                }
            });
        }
    }
}
function dataBound(doc) {
    var div = "";
    for (var i = 0; i < doc.length; i++) {
        $docNumber = doc[i].docNumber;
        $box = doc[i].docTitle == "AadhaarCard" ? "Aadhaar Card" : doc[i].docTitle == "PANCard" ? "PAN Card" : doc[i].docTitle;
        $file = doc[i].docFile;
        var filename = doc[i].docFile.replace(/^.*[\\\/]/, '')
        var ext = filename.split('.').pop();
        var cdnURL = $("#cdnURL").val();
        if (ext == "jpg" || ext == "jpeg" || ext == "png") {
            $filename = '<a data-href="' + cdnURL + $file + '" data-type="image" class="edit_btn text text-info fa fa-picture-o fa-2x" title="view kyc consumer details" onclick="viewKYC(this);"> View</a>'
        }
        else if (ext == "pdf") {

            $filename = '<a data-href="' + cdnURL + $file + '" data-type="pdf" class="edit_btn text text-danger fa fa-file-pdf-o fa-2x" title="view kyc consumer details" onclick="viewKYC(this);"> View</a>'
        }
        else if (ext == "doc" || ext == "docx") {
            $filename = '<a data-href="' + cdnURL + $file + '" data-type="doc" class="edit_btn text text-info fa fa-file-word-o fa-2x" title="view kyc consumer details" onclick="viewKYC(this);"> View</a>'
        }
        var img = '<a class="xzoom-container" data-href="' + cdnURL + $file + '" data-src="' + cdnURL + $file + '" onclick="viewKYC(this);"><img class="img" width="100%" height="180px" src="' + cdnURL + $file + '" alt="document"></a>';
        var panVerifield = '<div class="box-tools pull-right"><button data-loading-text="<i class=fa fa-circle-o-notch fa-spin></i> Processing Order" class="btn btn-sm btn-info action-btn" id="btnSubmitPAN" onclick="callAadhaar(this);">Verify</button><a href="javascript:void(0);" class="hidden adharactive"><img class="img" width="30px" height="30px" src="../images/check.png" />Verified</a></div>';
        if ($box.toLowerCase().startsWith("pan")) {
            $(".pandockychide").addClass("hidden");
            panVerifield = '<div class="box-tools pull-right"><button data-loading-text="<i class=fa fa-circle-o-notch fa-spin></i> Processing Order" class="btn btn-sm btn-info action-btn" id="btnSubmitAdhar" onclick="callPan(this);">Verify</button><a href="javascript:void(0);" class="hidden panactive"><img class="img" width="30px" height="30px" src="../images/check.png" />Verified</a></div>';
        }
        else {
            $(".dockychide").addClass("hidden");
        }
        var xyz = '<div class="box box-widget box-widgets"><div class="box-body"><h5 class="profile-username">' + $box + panVerifield + '</h5></div><div class="box-footer no-padding">' + img + '<ul class="nav nav-stacked"><li><a href="#">Document No <span class="pull-right badge bg-aqua"> <span>' + $docNumber + '</span></span></a></li><li>' + $filename + '</li></ul> </div></div>';
        div += "<div class='col-md-6'>" + xyz + "</div>";
        if (doc[i].docBackUrl && doc[i].docBackUrl != "") {
            var $box = $box + " Back Side"
            var xyz1 = '<div class="box box-widget box-widgets"><div class="box-body"><h5 class="profile-username">' + $box + '</h5></div><div class="box-footer no-padding">' + img + '<ul class="nav nav-stacked"></a></li><li><a href="#">Document No <span class="pull-right badge bg-aqua"> <span>' + $docNumber + '</span></span></a></li><li>' + $filename + '</li></ul> </div></div>';
            div += "<div class='col-md-6'>" + xyz1 + "</div>";
        }

    }
    $('.moreupload').append(div);
}
$('INPUT[type="file"]').change(function () {
    var ext = this.value.match(/\.(.+)$/)[1];
    switch (ext) {
        case 'jpg':
        case 'png':
        case 'jpeg':
        // case 'pdf':
        case 'PNG':
        case 'JPG':
        case 'JPEG':
            // case 'PDF':
            break;
        default:
            alertify.logPosition("bottom left");
            alertify.error("Please upload file having extensions .jpg/.jpeg/.pdf only...!!")
            this.value = '';
    }
    var f = this.files[0]
    //here I CHECK if the FILE SIZE is bigger than 8 MB (numbers below are in bytes)
    if (f.size > 1048576 || f.fileSize > 1048576) {
        //show an alert to the user
        //  alert("Allowed file size exceeded. (Max. 8 MB)")

        //reset file upload control
        this.value = null;
        this.value = '';
        alertify.logPosition("bottom left");
        alertify.error("File must be less than 1MB")
        return false;
    }
});

function submitfinalKYC() {
    swal({
        title: " Partner",
        text: "KYC Details Submitted Successfully...!!",
        type: 'success',
        showCancelButton: false,
        confirmButtonClass: 'btn btn-success',
        cancelButtonClass: 'btn btn-danger m-l-10'
    }).then(function () {
        localStorage.clear();
        window.location = "/";
    }, function (dismiss) { })
}