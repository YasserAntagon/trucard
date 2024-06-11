
function saveEntityAddr() {
    $ctruid = $("#txteTruid").val()

    var json = {
        "rTruID": $ctruid,
        "houseNumber": $('#txtappa').val().trim(),
        "streetNumber": $('#txtstreet').val().trim(),
        "landmark": $('#txtlandmark').val().trim(),
        "pin": $('#txtpincode').val().trim(),
        "city": $('#txtcity').val().trim(),
        "state": $('#txtstate').val().trim(),
        "country": $('#txtcountry').val().trim(),
        "latitude": $('#lat').val().trim(),
        "longitude": $('#lng').val().trim()
    };
    $('#loader').css('display', 'block');
    $.ajax({
        "url": "/eConsumer/saveEntityAddr", "method": "POST", data: json, success: function (a) {
            let res = a.body;
            $('#loader').fadeOut('slow');
            if (res.status == 409) {
                // alertify.logPosition("top right");
                alertify.error(res.message);
                return false;
            }
            else if (res.status == 200) { 
                alertify.success("Entity Address Saved Successfully..!!");
                // clear();
            }
            else {
                // alertify.logPosition("top right");
                alertify.error('Invalid username or password..!!');
                return false;
            }
        }
    });
}



function submitDocument() { 
    var form_data = new FormData();
    $tid = $("#atruid").val();
    form_data.append('atruid', $tid);
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
            form_data.append('files[]', file);
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
        form_data.append('kycdocnums[]', val);
    });

    $('.subdmitId').each(function (index, item) {
        var val = $(item).val();
        form_data.append('subdmitIds[]', val);
    });
 
    //Upload Document on server 
    $.ajax({
        url: post_url,
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

function uploadDoc(res) {
    var kycArr1 = new Array();
    var arr = JSON.parse(res);
    if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {  
            $ctruid = $("#txteTruid").val()
            var kycjson = { 
                "rTruID": $ctruid,
                "docTitle": arr[i].type,
                "docNumber": arr[i].docnum,
                "docFile": arr[i].path,

            }; 
            svdata.updateEntityDocument(kycjson, function (err, res) {
                if (err) throw err;
                if (res.status == 200) {
                    alertify.logPosition("bottom left");
                    alertify.success('Entity Document Uploaded Successfully..!!');
                }
                else {
                    alertify.logPosition("bottom left");
                    alertify.error(res.message);
                }
            });
        }
    }
    onupdate();
}

function onSearchClose() // hide assetmanager details
{
    $('#custdetails').addClass('hidden');
    $('#custsearch').removeClass('hidden');
    $('.roundedsearch').css("border-color", "#d2d6de");
    $('#btnsearch').attr('disabled', false);
    $("#txtsearch").val("");
}