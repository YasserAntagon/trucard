$(function () {
    /* $('#toMultiple').tagsInput({
        'unique': true,
        'minChars': 5,
        'maxChars': 100,
        'placeholder': "To",
        'limit': 50,
        'validationPattern': new RegExp('^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$')
    }); */
    $("#btnPreview").click(function () {
        if ($(".ceditor").is('.hidden')) {
            $(".ceditor").removeClass("hidden")
            $(".editorPreview").addClass("hidden")
            $("#btnPreview").html("<i class='fa fa-eye'></i> Preview Mail")
        }
        else {
            var markup = $('#compose-textarea').summernote('code');
            $(".msgtext").html(markup)
            $(".ceditor").addClass("hidden")
            $(".editorPreview").removeClass("hidden")
            $("#btnPreview").html("<i class='fa fa-pencil'></i> Draft")
        }
    });
})
let emailArray = new Array()
function pendingClick() {
    let action = $('input[name=bulk]:checked').val();
    $('#loader').css("display", 'block');
    $(".allFlag").addClass("hidden");
    $(".toMail").addClass("hidden");
    if (action === "entity") {
        $ctruid = $("#txteTruid").val();
        $txtisParent = $("#txtisParent").val();
        var json = {
            "parentID": $ctruid,
            "isParent": $txtisParent
        };
        $("a.emailsender").attr("href", "mailto:outlet.in@company.com");
        $("a.emailsender").html("outlet.in@company.com");

        $.ajax({
            "url": "/sendEmail/getAllEntitySMSEmail", "method": "POST", data: json, success: function (a) {
                $('#loader').fadeOut('slow');
                if (a.status == "200") {
                    $("#btnEntity").removeClass("hidden");

                    let data = a.body;
                    emailArray = [...new Set(data.map(it => it.email))];
                    $(".totalEntity").text(data.length)
                }
                else {
                    alertify.logPosition("bottom left");
                    alertify.error("no consumer found");
                }
            }
        })
    }
    else if (action === "compose") {
        $('#loader').fadeOut('slow');
        $(".toMail").removeClass("hidden");
        $("a.emailsender").attr("href", "mailto:outlet.in@company.com");
        $("a.emailsender").html("outlet.in@company.com");
    }
    else if (action === "consumer") {
        $("a.emailsender").attr("href", "mailto:info@company.com");
        $("a.emailsender").html("info@company.com");
        $ctruid = $("#txteTruid").val();
        $txtisParent = $("#txtisParent").val();

        var json = {
            "parentID": $ctruid,
            "isParent": $txtisParent
        };
        $.ajax({
            "url": "/sendEmail/getAllConsumerSMSEmail", "method": "POST", data: json, success: function (a) {
                $('#loader').fadeOut('slow');
                if (a.status == "200") {
                    $("#btnConsumer").removeClass("hidden");
                    let data = a.body;
                    emailArray = [...new Set(data.map(it => it.email))];
                    $(".totalConsumer").text(data.length)
                }
            }
        })
    }
}

function discards() {
    $(".toMail").removeClass("hidden");
    emailArray = new Array();
    $("#toMultiple").tagsInput('removeAll');
    $("#subject").val("");
    $("#compose-textarea").val("");
    $("#toMultiple_tag").val("");

    $(".tag").remove();
    $("#msgtext").empty();
    $('#compose-textarea').summernote('destroy');
    $('#compose-textarea').summernote();

    $(".ceditor").removeClass("hidden")
    $(".editorPreview").addClass("hidden")
    $("#btnPreview").html("<i class='fa fa-eye'></i> Preview Mail");
}
function getBase64(file) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        console.log(reader.result);
    };
    reader.onerror = function (error) {
        console.log('Error: ', error);
    };
}
/* const fileToBase64 = async (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = (e) => reject(e)
    }) */
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};
async function SendClick() {
    let bulk = $('input[name=bulk]:checked').val();
    var markup = $('#compose-textarea').summernote('code');
    $(".msgtext").html(markup);
    var json = "";
    let msg = $(".editorPreview").html();
    let action = $('input[name=bulk]:checked').val();
    var en = "aee";
    var files = $('#attachmentFile').prop('files');
    const filePathsPromises = [];
    for (var i = 0; i < files.length; i++) {
        filePathsPromises.push(this.toBase64(files[i]));
    }
    const filePaths = await Promise.all(filePathsPromises);
    const mappedFiles = filePaths.map((base64File) => ({ "path": base64File }));
    var to = $("#toSend").val();
    if (to.includes("fake.company.com")) {
        alertify.logPosition("bottom left");
        alertify.error("Partner email is not valid..!!");
        return false
    }
    if (action == "compose") {
        var ar = to.split(',')
        if (ar.length <= 0) {
            alertify.logPosition("bottom left");
            alertify.error("Please Enter Subject..!!");
            return false
        }
        if ($("#subject").val() == "") {
            alertify.logPosition("bottom left");
            alertify.error("Please Enter Subject..!!");
            return false
        }

        json = {
            "to": JSON.stringify(ar),
            "subject": $("#subject").val(),
            "body": msg,
            "flag": en,
            "type": "compose",
            "attach": JSON.stringify(mappedFiles)
        };
    }
    else {
        if (to == "") {
            alertify.logPosition("bottom left");
            alertify.error("Please enter recipient..!!");
            return false
        }
        if ($("#subject").val() == "") {
            alertify.logPosition("bottom left");
            alertify.error("Please enter subject..!!");
            return false
        }
        json = {
            "to": to,
            "subject": $("#subject").val(),
            "body": msg,
            "flag": en,
            "type": "all",
            "attach": JSON.stringify(mappedFiles)
        };
    }
    swal({
        title: 'Are you sure?',
        text: "You want to send this email..!!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, proceed it!',
        cancelButtonText: 'No, cancel!',
        confirmButtonClass: 'btn btn-sm btn-primary',
        cancelButtonClass: 'btn btn-sm btn-danger m-l-10'
    }).then(function () {
        SendMail(json)
    }, function (dismiss) {
        // dismiss can be 'cancel', 'overlay',
        // 'close', and 'timer'
        if (dismiss === 'cancel') {
            swal(
                'Cancelled',
                'you cancelled your conversion...',
                'error'
            )
            flag = false;
        }
    })
}
function SendMail(json) {
    $.ajax({
        "url": "/sendEmail/sendEmailToPerticular", "method": "POST",
        data: json,
        "Content-Type": "application/json",
        success: function (a) {
            if (a.status == "200") {
                alertify.logPosition("bottom left");
                alertify.success("Mail Sent Successfully..!!");
                discards()
                closeMailModal();
            }
        },
        error: function (errorMessage) { // error callback 
            console.log("errorMessage",)
        }
    })
}
function closeMailModal()
{
    $('#mailModal').modal('hide');
}
