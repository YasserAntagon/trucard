$(function () {
    $('#toMultiple').tagsInput({
        'unique': true,
        'minChars': 5,
        'maxChars': 100,
        'placeholder': "To",
        'limit': 50,
        'validationPattern': new RegExp('^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$')
    });
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
$("#eChooseEmail").change(function () {
    let action = $(this).val();
    $("a.emailsender").attr("href", "mailto:" + action);
    $("a.emailsender").html(action);
});

let emailArray = new Array()
$("#eCompose").change(function () {
    let action = $(this).val();
    $('#loader').css("display", 'block');
    $(".allFlag").addClass("hidden");
    $(".toMail").addClass("hidden");
    if (action == "entity" || action == "partasso") {
        $("#PlayStore").attr("href", "https://play.google.com/store/apps/details?id=com.b2b&hl=en_IN");
        $("#eChooseEmail").val("outlet.in@company.com");
    }
    else if (action == "directconsumer" || action == "consumer") {
        $("#PlayStore").attr("href", "https://play.google.com/store/apps/details?id=com.consumer&hl=en_IN");
        $("#eChooseEmail").val("info@company.com");
    }
    else
    {
        $("#PlayStore").attr("href", "https://play.google.com/store/apps/details?id=com.b2b&hl=en_IN");
    }
    var email = $("#eChooseEmail").val()
    $("a.emailsender").attr("href", "mailto:" + email);
    $("a.emailsender").html(email);
    emailArray = new Array();
    if (action === "entity") {
        var json = {
            flag: "admin"
        }

        $(".entityLbl").html("All Partners");
        $.ajax({
            "url": "/sendEmail/getEntitySMSEmail", "method": "POST", data: json, success: function (a) {
                $('#loader').fadeOut('slow');
                if (a.status == "200") {
                    $("#btnEntity").removeClass("hidden");
                    let data = a.body;
                    syncPeople("entity", data)
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
    else if (action === "partasso") {
        var json = { flag: "all" }
        $(".entityLbl").html("All Direct + Consumer");
        $.ajax({
            "url": "/sendEmail/getEntitySMSEmail", "method": "POST", data: json, success: function (a) {
                $('#loader').fadeOut('slow');
                if (a.status == "200") {
                    $("#btnEntity").removeClass("hidden");
                    let data = a.body;
                    syncPeople("partasso", data)
                    emailArray = [...new Set(data.map(it => it.email))];
                    $(".totalEntity").text(data.length)
                }
            }
        })
    }
    else if (action === "compose") {
        $('#loader').fadeOut('slow');
        $(".toMail").removeClass("hidden");
    }
    else if (action === "directconsumer") {
        $(".consumerLbl").html("All Partners + Partners");
        var json = { flag: "direct" }
        $.ajax({
            "url": "/sendEmail/getConsumerSMSEmail", "method": "POST", data: json, success: function (a) {
                $('#loader').fadeOut('slow');
                if (a.status == "200") {
                    $("#btnConsumer").removeClass("hidden");
                    let data = a.body;
                    syncPeople("directconsumer", data)
                    emailArray = [...new Set(data.map(it => it.email))];
                    $(".totalConsumer").text(data.length)
                }
            }
        })
    }
    else if (action === "consumer") {
        var json = { flag: "all" };
        $(".consumerLbl").html("All Direct + Consumer");
        $.ajax({
            "url": "/sendEmail/getConsumerSMSEmail", "method": "POST", data: json, success: function (a) {
                $('#loader').fadeOut('slow');
                if (a.status == "200") {
                    $("#btnConsumer").removeClass("hidden");
                    let data = a.body;
                    syncPeople("consumer", data)
                    emailArray = [...new Set(data.map(it => it.email))];
                    $(".totalConsumer").text(data.length)
                }
            }
        })
    }
    /* 
    else if (action === "assetmanager") { 
        $.ajax({
            "url": "/sendEmail/getAssetManagerSMSEmail", "method": "POST", success: function (a) {
                $('#loader').fadeOut('slow');
                if (a.status == "200") {
                    $("#btnAssetManager").removeClass("hidden");
                    let data = a.body;
                    emailArray = [...new Set(data.map(it => it.email))];
                    $(".totalAssetManager").text(data.length)
                }
            }
        })
    } */
})
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
function SendClick() {
    var en = $("#eChooseEmail").val();
    var markup = $('#compose-textarea').summernote('code');
    $(".msgtext").html(markup);
    var json = "";
    let msg = $(".editorPreview").html();
    var action = $("#eCompose").val()
    if (action == "compose") {
        var to = $("#toMultiple").val();
        var ar = to.split(',');
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
            "type": "compose"
        };
    }
    else {
        if ($("#subject").val() == "") {
            alertify.logPosition("bottom left");
            alertify.error("Please Enter Subject..!!");
            return false
        }
        // do not send on devops
        json = {
            "to": JSON.stringify(emailArray),
            "subject": $("#subject").val(),
            "body": msg,
            "flag": en,
            "type": "all"
        };
    }
    console.log(json);
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
function syncPeople(type, buyArr) {
    $('.select2').select2();
    if (type == "entity" || type == "partasso") { 
        $('#cmbPartner').empty();
        $('#cmbPartner').append('<option value="0">Receipient</option>');
        for (var i = 0; i < buyArr.length; i++) {
            var companyName = buyArr[i].companyName.replace('null', '');
            var data = companyName + " - " + buyArr[i].truID + " - " + buyArr[i].mobile + " - " + buyArr[i].email;
            $('#cmbPartner').append('<option value="' + buyArr[i].truID + '">' + data + '</option>');
        }
    }
    else {
        var title = "All Consumer"
        $('#cmbConsumer').empty();
        $('#cmbConsumer').append('<option value="0">Receipient</option>');
        for (var i = 0; i < buyArr.length; i++) {
            var cName = buyArr[i].fName + " " + buyArr[i].lName;
            var mob = buyArr[i].mobile ? buyArr[i].mobile : buyArr[i].email;
            var data = cName + " - " + buyArr[i].truID + " - " + mob + " - " + buyArr[i].email;
            $('#cmbConsumer').append('<option value="' + buyArr[i].truID + '">' + data + '</option>');
        }
    }


}
function SendMail(json) {
    $.ajax({
        "url": "/sendEmail/sendBulkEmail", "method": "POST",
        "data": json,
        "Content-Type": "application/json",
        success: function (a) {
            if (a.status == "200") {
                alertify.logPosition("bottom left");
                alertify.success("Mail Sent Successfully..!!");
                discards()
            }
        }
    })
}
