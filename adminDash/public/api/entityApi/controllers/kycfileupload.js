// var config = require(__dirname + '/api/config');
// var token = require(__dirname + '/api/bearerToken');
$(".btnkycAdd").on('click', function () {
    if (counter === nextMaxp) {
        WarnMsg("Company Admin", "only " + nextMaxp + " document uploded..!!");
        return false;
    }
    else {
        $("#kycdocnum" + counter).css("border-color", "#2eb82e");
        if ($("#kycdocnum" + counter).val() == "") {
            $("#kycdocnum" + counter).css("border-color", "#FF0000");
            $(".pdoc").text("* Please enter document number...!!");
            return false;
        }
        kycCopUpload();
    }
});


var counter = 1;
var nextMaxp = 10;
function kycCopUpload() {
    $box = $("#cmbBox").val();
    $docNumber = $("#docNumber").val();
    $kycdocFile = $("#kycdocFile").val();

    if ($box == "0") {
        $("#cmbBox").css("border-color", "#FF0000");
        $(".pdoc").text("* Please Select document...!!");
        return false;
    }
    $("#cmbBox").css("border-color", "#2eb82e");
    $("#docNumber").css("border-color", "#2eb82e");
    $(".pdoc").text("");
    if ($docNumber == "") {
        $("#docNumber").css("border-color", "#FF0000");
        $(".pdoc").text("* Please enter document number...!!");
        return false;
    }
    $("#kycdocFile" + counter).css("border-color", "#2eb82e");
    if ($kycdocFile == "") {
        $("#kycdocFile" + counter).css("border-color", "#FF0000");
        $(".pdoc").text("* Please select kyc document...!!");
        return false;
    }

    var div = "<div class='col-md-4 abc" + counter + "'><div class='box  shadow'><div class='box-body'><h5> <label id='subdmitId' class='subdmitId'>" + $box + "</label><a href='javascript:void(0);' class='fa fa-trash text text-danger btnkycRemove  pull-right' id=" + counter + " ></a></h5><label id='kycdocnum' class='kycdocnum'>" + $docNumber + "</label></div><div class='box-footer'><div class='fileclone" + counter + "'></div></div></div></div>";
    $('.moreupload').append(div);
    $("#kycdocFile" + counter).clone().appendTo(".fileclone" + counter);
    $("#cmbBox").val("0");
    $("#docNumber").val("");
    counter++;
    var append = "<div class='form-group'><div class='input-group'><span class='input-group-addon'><span class='fa fa-cloud-upload'></span></span><input type='file' id='kycdocFile" + counter + "' name='files' class='form-control kycdoc'  accept='.jpg, .jpeg, .pdf'/></div></div>";
    $(".filez").empty();
    $(".filez").append(append);
    $("#btnSubmit").attr("disabled", false);
}

$(document).on('click', '.btnkycRemove', function (e) {
    e.preventDefault();
    var count = $(this).attr("id");
    $(".abc" + count).remove();
    if (counter > 1) {
        counter = counter - 1;
    }
    var append = "<div class='form-group'><div class='input-group'><span class='input-group-addon'><span class='fa fa-cloud-upload'></span></span><input type='file' id='kycdocFile" + counter + "' name='files' class='form-control kycdoc' accept='.jpg, .jpeg, .pdf'/></div></div>";
    $(".filez").empty();
    $(".filez").append(append);
});


//configuration  
var result_output = '#output'; //ID of an element for response output
var my_form_id = '#kycForm'; //ID of an element for response output
var progress_bar_id = '#progress-wrp'; //ID of an element for response output
//on form submit
// $truid = store.get('adId')
$amtruid = $("#txteTruid").val().trim();
$rcrno = $("#txtrcrno").val().trim();
// $amtruid = "8000745250036484"
/* $(my_form_id).on("submit", function (event) {
    event.preventDefault();
    $(".btnup").show();
    var proceed = true; //set proceed flag
    var error = [];	//errors 
    //reset progressbar
    $(progress_bar_id + " .progress-bar").css("width", "0%");
    $(progress_bar_id + " .status").text("0%");

    if (!window.File && window.FileReader && window.FileList && window.Blob) { //if browser doesn't supports File API
        error.push("Your browser does not support new File API! Please upgrade."); //push error text
    }
    else {
        if (proceed) {
            var form_data = new FormData(); //Creates new FormData object 
            form_data.append('truID', $amtruid);
            form_data.append('CRNNo', $rcrno);
            form_data.append('flag', "entity");
            $total = $('.kycdoc').length;
            // form_data.append('files', null);
            var x1 = 0;
            for ($i = 0; $i < $total - 1; $i++) {
                var ss = $('.kycdoc').get($i).files.length;
                if (ss == 0) {
                    x1 = 1;
                    break;
                }
                jQuery.each(jQuery('.kycdoc')[$i].files, function (j, file) {

                    form_data.append('files', file);

                });
            }
            if (x1 == 1) {
                WarnMsg("AssetManager Admin", "Please upload kyc documents..!!");
                $(".btnup").hide();
                return false;
            }
            $('.kycdocnum').each(function (index, item) {
                var val = $(item).text();
                form_data.append('kycDocNums[]', val);
            });
            $('.subdmitId').each(function (index, item) {
                var val = $(item).text();
                form_data.append('fileName[]', val);
            });
             
            //jQuery Ajax to Post form data
            $('#loader').css("display", 'block');
            $.ajax({
                url: "/adminFileupload/uploadDoc",
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
                //reset form 
                var arr = JSON.parse(res);
                // Call Model
                $('#loader').fadeOut('slow');
                if (arr.body.status == 200) {
                    submitfinalKYC(arr.page);
                }
                else {
                    // alertify.logPosition("top right");
                    alertify.error(arr.body.message);
                    return false;
                }
            });
        }
    }

    $(result_output).html(""); //reset output 
    $(error).each(function (i) { //output any error to output element
        $(result_output).append('<div class="error">' + error[i] + "</div>");
    });
}); */

function submitfinalKYC(url) {
    swal({
        title: "Company Admin",
        text: "Partner Address Updated Successfully...!!",
        type: 'success',
        showCancelButton: false,
        confirmButtonClass: 'btn btn-success',
        cancelButtonClass: 'btn btn-danger m-l-10'
    }).then(function () {
        window.location = url
        // $("#pageContainer").empty();
        // $("#pageContainer").load("entityPages/Entityform.html");
    }, function (dismiss) {
        window.location = url
    })
}
$('INPUT[type="file"]').change(function () {
    var ext = this.value.match(/\.(.+)$/)[1];
    switch (ext) {
        case 'jpg':
        case 'jpeg':
        // case 'png':
        case 'pdf':
        case 'doc':
        case 'docx':
            break;
        default:
            WarnMsg("Entity Admin", "This File type is not allowed..!!");
            this.value = '';
    }
});