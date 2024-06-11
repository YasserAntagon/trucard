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
        WarnMsg("Consumer Admin","This File type is not allowed..!!");  
        this.value = '';
    }
});