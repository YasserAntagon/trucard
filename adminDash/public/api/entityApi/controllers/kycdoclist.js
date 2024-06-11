


function kycList() {
    $amtruid = $("#txteTruid").val()
    var json = {
        "truID": $amtruid
    };
$('#loader').css('display', 'block'); 
    $.ajax({
        "url": "/entityDB/getEntityData", "method": "POST", data: json, success: function (res) {
             $('#loader').fadeOut('slow');
            let datas = res.body;
            var data = datas[0];
            if (data.KYCDetails) {
                if (Array.isArray(data.KYCDetails)) {
                    var div = "";
                    for (var i = 0; i < data.KYCDetails.length; i++) {
                        $docNumber = data.KYCDetails[i].docNumber;
                        $box = data.KYCDetails[i].docTitle;
                        $file = data.KYCDetails[i].docFile;
                        var ext = (/[.]/.exec($file)) ? /[^.]+$/.exec($file) : undefined;
                        if (ext == "jpg" || ext == "jpeg" || ext == "png") {
                            $filename = '<a data-href="' + data.KYCDetails[i].docFile + '" data-type="image" class="edit_btn text text-info fa fa-picture-o fa-2x" title="view kyc consumer details" onclick="viewKYC(this);"> View</a>'
                        }
                        else if (ext == "pdf") {

                            $filename = '<a data-href="' + data.KYCDetails[i].docFile + '" data-type="pdf" class="edit_btn text text-danger fa fa-file-pdf-o fa-2x" title="view kyc consumer details" onclick="viewKYC(this);"> View</a>'
                        }
                        else if (ext == "doc" || ext == "docx") {
                            $filename = '<a data-href="' + data.KYCDetails[i].docFile + '" data-type="doc" class="edit_btn text text-info fa fa-file-word-o fa-2x" title="view kyc consumer details" onclick="viewKYC(this);"> View</a>'
                        }
                        var xyz = '<div class="box box-widget box-widgets"><div class="box-body"><h3 class="profile-username">' + $box + '</h3><hr></div><div class="box-footer no-padding"> <ul class="nav nav-stacked"> <li><a href="#">Document Name <span class="pull-right badge bg-blue"> <span>' + $box + '</span> </span></a></li><li><a href="#">Document No <span class="pull-right badge bg-aqua"> <span>' + $docNumber + '</span></span></a></li><li>' + $filename + '</li></ul> </div></div>'
                        div += "<div class='col-md-6'>" + xyz + "</div>";
                    }
                    if (data.KYCDetails.length > 0) {
                        kyccheck = 1;
                        $('.moreupload').addClass("hidden")
                        $(".dockychide").addClass("hidden")
                        $(".kycupload").removeClass("hidden")
                    }
                    else {
                        $('.moreupload').removeClass("hidden")
                        $(".dockychide").removeClass("hidden")
                        $(".kycupload").addClass("hidden")
                    }
                    $('.kycupload').empty();
                    $('.kycupload').append(div);
                }
                else {
                    $(".kycupload").addClass("hidden")
                    $('.moreupload').removeClass("hidden");
                    $(".dockychide").removeClass("hidden");
                }
            }
        }
    });
}
kycList();


function viewKYC(evt) {
    $("#docxviewer").addClass("hidden");
    $doctype = $(evt).attr("data-type");
    $doc = $(evt).attr("data-href");
    opendoc($doctype, $doc)
}



var opendoc = function (ext, filepath) {
    
    switch (ext) {
        case 'image':
            {
               $('#loader').css('display', 'block'); 
                $.ajax({
                    "url": "/eEntity/getenDoc", "method": "POST", data: { "url": filepath }, success: function (res) {
                        $('#loader').fadeOut('slow');
                        let data = res.body; 
                        var a = JSON.parse(data)
                        if (a.status == 200) {
                            $(".viewClose").removeClass("hidden");
                            $('#docviewer').attr('src', 'data:image/png;base64,' + a.resource);
                            $(".kycupload").addClass("hidden");
                            $(".viewer").removeClass("hidden");
                            $(".docxviewer").addClass("hidden");
                        }
                        else {
                            alertify.error(a.message)
                        }
                    }
                })
                break;
            }
        // case 'pdf':
        //     {
        //         $(".kycupload").addClass("hidden")
        //         $(".viewer").addClass("hidden")
        //         var src = "https://docs.google.com/gview?url=" + filepath + "&embedded=true";
        //         $('#iframe').attr('src', src);
        //         $(".docxviewer").removeClass("hidden");
        //         break;
        //     }
        // case 'doc':
        //     {
        //         $(".kycupload").addClass("hidden")
        //         $(".viewer").addClass("hidden")
        //         //var src="https://view.officeapps.live.com/op/embed.aspx?src="+filepath+"&embedded=true";
        //         var src = "https://docs.google.com/gview?url=" + filepath + "&embedded=true";
        //         $('#iframe').attr('src', src);
        //         $(".docxviewer").removeClass("hidden");
        //         break;
        //     }
    }
}




$(".viewClose").on("click", function (e) {
    $(".viewClose").addClass("hidden");
    $(".kycupload").removeClass("hidden");
    $(".docxviewer").addClass("hidden");
    $(".viewer").addClass("hidden");
});
