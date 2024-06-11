
async function copyTargetText(e) {
    var vdata = $(e).attr("data-val");
    //alertify.success("Copied..!!",vdata);
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(vdata).then(() => {
            alertify.logPosition("top right");
            alertify.success("Copied..!!", vdata);
        }).catch(() => console.log('error'));
    }
    else {
        let textArea = document.createElement("textarea");
        textArea.value = vdata;
        textArea.style.position = "absolute";
        textArea.style.opacity = 0;
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        return new Promise((res, rej) => {
            document.execCommand('copy') ? res() : rej();
            textArea.remove();
            alertify.logPosition("top right");
            alertify.success("Copied..!!", vdata);
        })
    }
}

function sendAPIKey(item) {
    let eventemail = $(event).attr("data-email");
    let title = $(event).attr("data-title");
    var d = $("#txEmailClient").val();
    $("#txEmailClient").val(eventemail);
    $("#enClientName").val(title); 
    $("#compose-textarea").val("");
    $("#toSend").val(eventemail);
    $('#mailModalkey').modal({ show: 'show' });
    if (eventemail != d) {
        discards();
    }
}