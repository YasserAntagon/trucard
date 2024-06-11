function printDiv(divName) {
    var printContents = document.getElementById(divName).innerHTML;
    $('.wrapper').addClass('hidden');
    $('#printcontent').removeClass('hidden');
    document.getElementById('printcontent').innerHTML = printContents;
    window.print();
    $('.wrapper').removeClass('hidden');
    $('#printcontent').addClass('hidden');
    document.getElementById('printcontent').innerHTML = "";
}