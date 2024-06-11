
$(function () {

    BindProfile();
})
function BindProfile() {
    $ctruid = $("#txtcTruid").val();
    var json = {
        "truID": $ctruid
    };
    $.ajax({
        "url": "/consumerDB/getConsumerData", "method": "POST", data: json, success: function (a) { 
            $dlrData = a.body; 
            $("#txtfname").html($dlrData.fName);
            $("#sex").html($dlrData.gender);
            $("#txtmname").html($dlrData.mName);
            $("#txtlname").html($dlrData.lName);
            $("#ccode").html($dlrData.countryCode);

            $("#txtmobile").html($dlrData.mobile);
            $("#txtemail").html($dlrData.email);
            // DOB
            var dob = new Date(Date.parse($dlrData.DOB));
            // $date = editDate(dob);
            var $date = moment(dob).format('DD/MM/YYYY'); 
            $("#dob").html($date); 
            loadlabel();
        }
    });

    $.fn.editable.defaults.mode = 'inline'; //editables  
}