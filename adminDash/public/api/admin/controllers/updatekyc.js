var kycpath = __dirname + '/api/model/updatekycdb';
var kyc = require(kycpath)


/*****************
Document url
 *****************/
var truID = "absc"; // here is a truid of assetmanager
//Personal Details
function Step2() {

    var fname = document.getElementById('fname').value.trim();
    var mname = document.getElementById('mname').value.trim();
    var lname = document.getElementById('lname').value.trim();
    var landLine = document.getElementById('txtLNo').value.trim();
    var txtDname = document.getElementById('txtDname').value.trim();
    var bullion = $("input[name=bullion]:checked").val();
    var countryCode = document.getElementById('txtCountryCode').value.trim();
    var dob = document.getElementById('dob').value.trim();
    var gender = $("input[name=gender]:checked").val();

    var json = JSON.stringify({
        "truID": truID,
        "fName": fname,
        "mName": mname,
        "lName": lname,
        "landLine": landLine,
        "assetmanagerName": txtDname,
        "bullionType": bullion,
        "countryCode": countryCode,
        "DOB": dob,
        "gender": gender
    })

    kyc.updateKycStep1(json, function (err, res) {
        if (err) throw err;

        if (json.status == 200) {

        }
    });  // call sign in */
}


//Company Details

function Step1() {


    var cname = document.getElementById('txtCoName').value.trim();
    var e = document.getElementById('cmbCType');
    var cmbCType = e.options[e.selectedIndex].value.trim();

    //const ntruID="456564546564";

    // Directors
    var kycArr = new Array();
    //$(".btnup").show();
    var proceed = true; //set proceed flag
    var error = [];	//errors
    var kycArr1 = new Array();

    var progress_bar_id = '#progress-wrp';
    //reset progressbar
    $(progress_bar_id + " .progress-bar").css("width", "0%");
    $(progress_bar_id + " .status").text("0%");

    if (!window.File && window.FileReader && window.FileList && window.Blob) { //if browser doesn't supports File API
        error.push("Your browser does not support new File API! Please upgrade."); //push error text
    }
    else {
        //if everything looks good, proceed with jQuery Ajax
        if (proceed) {
            //submit_btn.val("Please Wait...").prop( "disabled", true); //disable submit button
            var form_data = new FormData(); //Creates new FormData object
            var form_data1 = new FormData();

            let fileurl = fs.readFileSync(__dirname + '/api/config/fileURL.json');
            let docurls = JSON.parse(fileurl);
            const docURL = docurls.docURL;

            var post_url = docURL + "/assetmanagerAdminDirectors.php"; //get action URL of form
            var post_url2 = docURL + "/assetmanagerAdminPartners.php";

            form_data.append('truid', truID);
            form_data.append('ntruid', "");

            form_data1.append('truid', truID);
            form_data1.append('ntruid', "");

            $total = $('.cofile').length;
            $total1 = $('.copfile').length;
            var x = 0;
            var x1 = 0;

            var category = $('select[name=compType]').val();
            if (category == 'opc' || category == 'pvt') {
                for ($i = 0; $i < $total; $i++) {
                    var ss = $('.cofile').get($i).files.length;
                    if (ss == 0) {
                        x = 1;
                        break;
                    }
                    jQuery.each(jQuery('.cofile')[$i].files, function (j, file) {
                        form_data.append('cofile[]', file);
                    });
                }
                if (x == 1) {
                    WarnMsg("Company Admin", "Please upload documents..!!");
                    return false;
                }
            }
            else if (category == 'sole' || category == 'llp' || category == 'pl') {
                for ($i = 0; $i < $total; $i++) {
                    var ss = $('.cofile').get($i).files.length;
                    if (ss == 0) {
                        x = 1;
                        break;
                    }
                    jQuery.each(jQuery('.cofile')[$i].files, function (j, file) {
                        form_data.append('cofile[]', file);
                    });
                }
                if (x == 1) {
                    WarnMsg("Company Admin", "Please upload documents..!!");
                    return false;
                }

                for ($i = 0; $i < $total1; $i++) {
                    var ss = $('.copfile').get($i).files.length;
                    if (ss == 0) {
                        x1 = 1;
                        break;
                    }
                    jQuery.each(jQuery('.copfile')[$i].files, function (j, file) {
                        form_data1.append('copfile[]', file);
                    });
                }
                if (x1 == 1) {
                    WarnMsg("Company Admin", "Please upload documents..!!");
                    return false;
                }
            }
            else if (category == 'pship') {
                for ($i = 0; $i < $total1; $i++) {
                    var ss = $('.copfile').get($i).files.length;
                    if (ss == 0) {
                        x1 = 1;
                        break;
                    }
                    jQuery.each(jQuery('.copfile')[$i].files, function (j, file) {
                        form_data1.append('copfile[]', file);
                    });
                }
                if (x1 == 1) {
                    WarnMsg("Company Admin", "Please upload documents..!!");
                    return false;
                }
            }

            $('.docnum').each(function (index, item) {
                var val = $(item).val();
                form_data.append('docnum[]', val);
            });

            $('.txtCoDirectors').each(function (index, item) {
                var val = $(item).val();
                form_data.append('txtCoDirectors[]', val);
            });

            $('.pdocnum').each(function (index, item) {
                var val = $(item).val();
                form_data1.append('pdocnum[]', val);
            });
            $('.txtCopDirectors').each(function (index, item) {
                var val = $(item).val();
                form_data1.append('txtCopDirectors[]', val);
            });



            // Company Directors
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
                var arr = JSON.parse(res);
                if (arr.length > 0) {
                    for (var i = 0; i < arr.length; i++) {
                        var kycdata1 = {};
                        kycdata1["aadhar"] = arr[i].docnum;
                        kycdata1["directorName"] = arr[i].type;
                        kycdata1["aadharDoc"] = arr[i].path;
                        kycArr.push(kycdata1);
                    }
                }
            })
            $.ajax({
                url: post_url2,
                type: "POST",
                data: form_data1,
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
                var arr = JSON.parse(res);
                if (arr.length > 0) {
                    for (var i = 0; i < arr.length; i++) {
                        var kycdata1 = {};

                        kycdata1["aadhar"] = arr[i].docnum;
                        kycdata1["partnerName"] = arr[i].type;
                        kycdata1["aadharDoc"] = arr[i].path;
                        kycArr1.push(kycdata1);
                    }
                }

                var json = JSON.stringify({
                    "truID": truID,
                    "companyName": cname,
                    "companyType": cmbCType,
                    "directorsAadhar": kycArr,
                    "partnersAadhar": kycArr1,
                    "KYCFlag": "active"
                });
                SubmitKYC(json);
            })
            // Company Partners 
        }
    }

}
var SubmitKYC = function (json) {
    kyc.updateKycStep2(json, function (err, res) {
        if (err) throw err;

    });
}

//Address Details
function Step3() {

    //var truid = truID;
    var housenumber = document.getElementById('b_add1').value.trim();
    var landmark = document.getElementById('b_landamark').value.trim();
    var streetnumber = document.getElementById('b_street').value.trim();
    var pin = document.getElementById('bpincode').value.trim();
    var city = document.getElementById('bcity').value.trim();
    var state = document.getElementById('bstate').value.trim();
    var country = document.getElementById('bcountry').value.trim();

    var rhousenumber = document.getElementById('p_add1').value.trim();
    var rlandmark = document.getElementById('p_landamark').value.trim();
    var rstreetnumber = document.getElementById('p_street').value.trim();
    var rpin = document.getElementById('txtpincode').value.trim();
    var rcity = document.getElementById('city').value.trim();
    var rstate = document.getElementById('state').value.trim();
    var rcountry = document.getElementById('country').value.trim();

    var ohousenumber = document.getElementById('cp_add1').value.trim();
    var olandmark = document.getElementById('cp_landamark').value.trim();
    var ostreetnumber = document.getElementById('cp_street').value.trim();

    var opin = document.getElementById('txtcpincode').value.trim();
    var ocity = document.getElementById('ccity').value.trim();
    var ostate = document.getElementById('cstate').value.trim();
    var ocountry = document.getElementById('ccountry').value.trim();

    var latitude = $("#lat").val();
    var longitude = $("#lng").val();

    var kycjson = JSON.stringify({
        "truID": truID,
        //"address" : address,
        "houseNumber": housenumber,
        "streetNumber": streetnumber,
        "landmark": landmark,
        "pin": pin,
        "city": city,
        "state": state,
        "country": country,

        "latitude": latitude,
        "longitude": longitude,

        //"raddress" : raddress,
        "rHouseNumber": rhousenumber,
        "rStreetNumber": rstreetnumber,
        "rLandmark": rlandmark,
        "rPin": rpin,
        "rCity": rcity,
        "rState": rstate,
        "rCountry": rcountry,

        //"oaddress" : oaddress,
        "oHouseNumber": ohousenumber,
        "oStreetNumber": ostreetnumber,
        "oLandmark": olandmark,
        "oPin": opin,
        "oCity": ocity,
        "oState": ostate,
        "oCountry": ocountry,
        "isParent": true
    });

    kyc.updateKycStep3(kycjson, function (err, res) {
        if (err) throw err;
        if (res.status == 200) {
            /*  alert("Step3 Done") */
        }
        //Changed by Anisha added "else" for Required Error
        else {
            WarnMsg("Company Admin", "Please Enter the required fields");
            return false;
        }
    });

}

// KYC Details
const kycSubmit6 = document.getElementById('btnSubmit');
kycSubmit6.addEventListener('click', function (e) {
    var fname = document.getElementById('fname').value.trim();  //Change by Anisha(lname to fname)
    var lname = document.getElementById('lname').value.trim();
    //var landLine=document.getElementById('txtLNo').value.trim();
    var txtDname = document.getElementById('txtDname').value.trim();
    var email = $("#email").val();

    if (fname == "") {
        WarnMsg("Company Admin", "Please Enter First Name");
        return false;
    }
    if (lname == "") {
        WarnMsg("Company Admin", "Please Enter Last Name");
        return false;
    }
    if (txtDname == "") {
        WarnMsg("Company Admin", "Please Enter AssetManager Name");
        return false;
    }
    if ($("#dob").val() == '') {
        $("#dob").css("border-color", "#FF0000");
        $('#step1').attr('disabled', true);
        $("#error_dob").text("You are " + years + " years old ! You are not eligible");
        return false;
    }
    if ($("#dob").val() != '') {
        var d = $("#dob").val();
        var date = new Date(d)
        //var years=date.getFullYear();
        var years = moment().diff(date, 'years');

        if (years < 18) {
            $("#dob").css("border-color", "#FF0000");
            WarnMsg("Company Admin", "You are " + years + " years old ! You are not eligible");
            return false;
        }
    }

    //    var truid = truID;
    // partners
    var kycArr1 = new Array();
    $(".btnup").show();
    var proceed = true; //set proceed flag
    var error = [];	//errors
    var total_files_size = 0;
    var progress_bar_id = '#progress-wrp';
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
            var form_data = new FormData(); //Creates new FormData object
            let fileurl = fs.readFileSync(__dirname + '/api/config/fileURL.json');
            let docurlss = JSON.parse(fileurl);
            const docURLs = docurlss.docURL;

            var post_url = docURLs + "/uploadAssetManagerDoc.php"; //get action URL of form
            form_data.append('truid', truID);
            form_data.append('ntruid', "");
            $total = $('.kycdoc').length;
            var x = 0;
            for ($i = 0; $i < $total; $i++) {
                var ss = $('.kycdoc').get($i).files.length;
                if (ss == 0) {
                    x = 1;
                    break;
                }
                jQuery.each(jQuery('.kycdoc')[$i].files, function (j, file) {
                    form_data.append('files[]', file);
                });
            }
            if (x == 1) {
                WarnMsg("Company Admin", "Please upload KYC Document..!!");
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

            //jQuery Ajax to Post form data
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

                var arr = JSON.parse(res);
                if (arr.length > 0) {
                    for (var i = 0; i < arr.length; i++) {
                        var kycdata1 = {};
                        kycdata1["docNumber"] = arr[i].docnum;
                        kycdata1["docTitle"] = arr[i].type;
                        kycdata1["docFile"] = arr[i].path;
                        kycArr1.push(kycdata1);
                    }

                    var kycjson = JSON.stringify({
                        "truID": truID,
                        "KYCDetails": kycArr1,
                        "KYCFlag": "active"
                    });

                    kyc.updateKycStep4(kycjson, function (err, res) {

                        if (err) throw err;
                        if (res.status == 200) {
                            swal(
                                {
                                    title: "Company Admin",
                                    text: "KYC Details Submitted Successfully...!!",
                                    type: 'success',
                                    showCancelButton: false,
                                    confirmButtonClass: 'btn btn-success',
                                    cancelButtonClass: 'btn btn-danger m-l-10'
                                }
                            ).then(function () {
                                localStorage.clear();
                                window.location = "index.html";
                            }, function (dismiss) {
                                // dismiss can be 'cancel', 'overlay',
                                // 'close', and 'timer'
                            })
                        }
                    });  // call sign in */
                }
            });
        }
    }
});

var bindAllKycData = function () {
    var kycjson = JSON.stringify({
        "truID": truID
    }); 
    kyc.getKYCData(kycjson, function (err, res) { 
        if (err) throw err;

        if (res.status == 200) {
            if (res.resource[0].KYCFlag != "active") {
                if (res.resource[0].KYCFlag != "stopTrading") {
                    $(".menulist").empty();
                    $(".menu1").show(); // show sidebar status
                    localStorage.setItem('image', "images/users/user.png");
                    $('.profpic').attr('src', "images/users/user.png");
                }
            }

            // Personal Details
            document.getElementById('fname').value = res.resource[0].firstName;
            document.getElementById('lname').value = res.resource[0].lastName;
            document.getElementById('mname').value = res.resource[0].middleName;
            document.getElementById('email').value = res.resource[0].email;
            document.getElementById('mobile').value = res.resource[0].mobile;
            document.getElementById('dob').value = "";
            if (res.resource[0].landLine) {
                document.getElementById('txtLNo').value = res.resource[0].landLine;
            }
            else {
                document.getElementById('txtLNo').value = "";
            }
            document.getElementById('txtDname').value = res.resource[0].assetmanagerName;
            var btype = res.resource[0].bullionType;
            if (btype == "both") {
                $("#both").click()
            }
            else if (btype == "silver") {
                $("#silver").click()
            }
            else {
                $("#gold").click()
            }
            document.getElementById("cmbCType").selectedIndex = "0";
            document.getElementById('dob').value = res.resource[0].DOB;
            var gen = res.resource[0].gender;
            if (gen == "male") {
                $("#male").click()
            }
            else if (gen == "female") {
                $("#female").click()
            }
            else {
                $("#gother").click()
            }

            document.getElementById('txtCountryCode').value = res.resource[0].countryCode;
            document.getElementById('txtCoName').value = res.resource[0].companyName;

            if (res.resource[0].countryCode == "+91") {
                document.getElementById('bcountry').value = "India";
                document.getElementById('country').value = "India";
                document.getElementById('ccountry').value = "India";
            }
            else if (res.resource[0].countryCode == "+971") {
                document.getElementById('bcountry').value = "United Arab Emirates";
                document.getElementById('country').value = "United Arab Emirates";
                document.getElementById('ccountry').value = "United Arab Emirates";
            }
            else if (res.resource[0].countryCode == "+880") {
                document.getElementById('bcountry').value = "Bangladesh";
                document.getElementById('country').value = "Bangladesh";
                document.getElementById('ccountry').value = "Bangladesh";
            }
            else if (res.resource[0].countryCode == "+977") {
                document.getElementById('bcountry').value = "Nepal";
                document.getElementById('country').value = "Nepal";
                document.getElementById('ccountry').value = "Nepal";
            }
            else if (res.resource[0].countryCode == "+1") {
                document.getElementById('bcountry').value = "United States";
                document.getElementById('country').value = "United States";
                document.getElementById('ccountry').value = "United States";
            }

            //Contact Address Details
            if (res.resource[0].KYCFlag !== null) {
                if (res.resource[0].contactAddress) {
                    $('#cmbCType').val(res.resource[0].companyType);


                    document.getElementById('b_add1').value = res.resource[0].contactAddress.houseNumber;
                    document.getElementById('b_landamark').value = res.resource[0].contactAddress.landmark;
                    document.getElementById('b_street').value = res.resource[0].contactAddress.streetNumber;
                    document.getElementById('bpincode').value = res.resource[0].contactAddress.pin;
                    document.getElementById('bcity').value = res.resource[0].contactAddress.city;
                    document.getElementById('bstate').value = res.resource[0].contactAddress.state;
                    document.getElementById('bcountry').value = res.resource[0].contactAddress.country;

                    // Resgistered Address Details
                    document.getElementById('p_add1').value = res.resource[0].companyRegisteredAddress.houseNumber;
                    document.getElementById('p_landamark').value = res.resource[0].companyRegisteredAddress.landmark;
                    document.getElementById('p_street').value = res.resource[0].companyRegisteredAddress.streetNumber;
                    document.getElementById('txtpincode').value = res.resource[0].companyRegisteredAddress.pin;
                    document.getElementById('city').value = res.resource[0].companyRegisteredAddress.city;
                    document.getElementById('state').value = res.resource[0].companyRegisteredAddress.state;
                    document.getElementById('country').value = res.resource[0].companyRegisteredAddress.country;

                    // Operation Address Details
                    document.getElementById('cp_add1').value = res.resource[0].companyOperationAddress.houseNumber;
                    document.getElementById('cp_landamark').value = res.resource[0].companyOperationAddress.landmark;
                    document.getElementById('cp_street').value = res.resource[0].companyOperationAddress.streetNumber;
                    document.getElementById('txtcpincode').value = res.resource[0].companyOperationAddress.pin;
                    document.getElementById('ccity').value = res.resource[0].companyOperationAddress.city;
                    document.getElementById('cstate').value = res.resource[0].companyOperationAddress.state;
                    document.getElementById('ccountry').value = res.resource[0].companyOperationAddress.country;
                    //initMap();

                    var compType = res.resource[0].companyType;

                    var category = compType;
                    if (category == 'llp') {
                        $(".cop").show();
                        $(".cod").show();
                    }
                    else if (category == 'opc') {
                        $(".cop").hide();
                        $(".cod").show();
                    }
                    else if (category == 'sole') {
                        $(".cop").show();
                        $(".cod").show();
                    } else if (category == 'pvt') {
                        $(".cop").hide();
                        $(".cod").show();
                    } else if (category == 'pship') {
                        $(".cod").hide();
                        $(".cop").show();
                    }
                    else if (category == 'pl') {
                        $(".cop").show();
                        $(".cod").show();
                    }
                    else {
                        $(".cop").hide();
                        $(".cod").hide();
                    }

                    // directors
                    if (res.resource[0].directorsAadhar[0]) {
                        var txtCoDirectors = res.resource[0].directorsAadhar[0].directorName;
                        var aadhar = res.resource[0].directorsAadhar[0].aadharDoc;
                        var docnum = res.resource[0].directorsAadhar[0].aadhar;
                        document.getElementById('txtCoDirectors1').value = txtCoDirectors;
                        //document.getElementById('cofile').value=aadhar;
                        document.getElementById('docnum1').value = docnum
                    }

                    if (res.resource[0].partnersAadhar[0]) {
                        // Partners
                        var partners = res.resource[0].partnersAadhar[0].partnerName;
                        var copfile = res.resource[0].partnersAadhar[0].aadharDoc;
                        var pdocnum = res.resource[0].partnersAadhar[0].aadhar;

                        // Partners
                        document.getElementById('txtCopDirectors1').value = partners;
                        //document.getElementById('copfile').value=copfile;
                        document.getElementById('pdocnum1').value = pdocnum;
                    }

                    //KYC Doc
                    var kyc = res.resource[0].KYCDetails;
                    if (res.resource[0].KYCDetails[0]) {
                        if (kyc[0].docNumber) { 
                            document.getElementById('kycdocnum').value = kyc[0].docNumber;
                            // document.getElementById('kycdoc').value=kyc[0].docFile;
                            $('#subdmitId').val(kyc[0].docTitle);
                        }

                        var more;
                        for (var counter = 1; counter < kyc.length; counter++) {
                            var doctype = kyc[counter].docTitle;
                            var filedoc = kyc[counter].docFile;
                            var docnum = kyc[counter].docNumber;

                            $('.moreupload').append("<div class='col-xs-12 col-sm-6 col-md-4'><div class='form-group'> <div class='input-group'> <span class='input-group-addon'> <span class='mdi mdi-cards'></span> </span> <select type='text' class='form-control subditId' name='submitId[]' id='subdmitId'" + counter + "' placeholder=''><option selected>" + doctype + "</option></select></div></div></div><div class='col-xs-12 col-sm-6 col-md-4'><div class='form-group'><div class='input-group'> <span class='input-group-addon'> <span class='mdi mdi-file-document'></span> </span><input type='text' class='form-control kycdocnum' name='kycdocnum[]' value=" + docnum + " required id='kycdocnum" + counter + "' placeholder='Enter your document number'/></div></div></div><div class='col-xs-12 col-sm-6 col-md-3'><div class='form-group'><div class='input-group'> <input id='kycdoc" + counter + "' name='file[]" + counter + "' type='file' class='form-control kycdoc' /> </div></div></div></div></div>");

                            //document.getElementById('kycdocnum').value=res.resource[0].KYCDetails[0].docNumber;
                            // document.getElementById('kycdoc'+counter).value=filedoc;
                            // document.getElementById('subdmitId'+counter).value=doctype;
                            //  $("#subdmitId"+counter).val(doctype);
                        }

                        var dir = res.resource[0].directorsAadhar;
                        var part = res.resource[0].partnersAadhar;

                        for (var next = 1; next < dir.length; next++) {
                            var div = "<div class='col-xs-12 col-sm-6 col-md-12 CoD" + next + "' id='tmp" + (next + 1) + "'><div class='form-group'><label>Company Directors " + (next + 1) + " :</label><div class='input-group'><span class='input-group-addon' ></span><input type='text' name='txtCoDirectors[]' value=" + dir[next].directorName + " id='txtCoDirectors" + next + "' class='txtCoDirectors form-control' placeholder='Enter company directors' class='form-control'></div></div><div class='form-group'><div class='input-group'> <span class='input-group-addon'> <span class='mdi mdi-file-document'></span> </span><input type='text' class='form-control number' required name='docnum[]' id='docnum" + next + "' value=" + dir[next].aadhar + " placeholder='Enter your aadhar number'/></div></div><div class='form-group'><div class='input-group'> <input value=" + dir[next].aadharDoc + " id='file" + next + "' name='cofile[]' type='file' class='form-control' /> </div></div></div>";
                            $('.coDir').append(div);
                        }
                        for (var nextp = 1; nextp < part.length; nextp++) {
                            var div = "<div class='col-xs-12 col-sm-6 col-md-12 CopD" + nextp + "' id='tmp" + (nextp + 1) + "'><div class='form-group'><label>Company Partners " + (nextp + 1) + "  :</label><div class='input-group'><span class='input-group-addon' ></span><input type='text' name='txtCopDirectors[]' id='txtCopDirectors" + nextp + "' class='txtCopDirectors form-control' placeholder='Enter company partners' class='form-control'></div></div><div class='form-group'><div class='input-group'> <span class='input-group-addon'> <span class='mdi mdi-file-document'></span> </span><input type='text' class='form-control number' required name='pdocnum[]' id='pdocnum" + nextp + "' placeholder='Enter your aadhar number' value=" + part[nextp].aadhar + "/></div></div><div class='form-group'><div class='input-group'> <input id='filep" + nextp + "' value=" + part[nextp].aadharDoc + " name='copfile[]' type='file' class='form-control' /> </div></div></div>";
                            $('.copDir').append(div);
                            nextp++;
                        }

                        if (kyc.length > 0) {
                            /* $(".btnCopAdd").remove();
                            $(".btnCoAdd").remove();
                            $("#btnkycAdd").remove();
                            $("#btnSubmit").remove();
                            $("#kycForm :input").prop("disabled", true);
                            $("input[type=radio]").attr('disabled', true);
                             */
                        }
                    }
                    else {
                        WarnMsg("Company Admin", "Please Update KYC Documents..!!");
                        return false;
                    }
                }
            }
        }
    });
}
//getAllKycData();

bindAllKycData();

$('INPUT[type="file"]').change(function () {
    var ext = this.value.match(/\.(.+)$/)[1];
    switch (ext) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'pdf':
        case 'doc':
        case 'docx':
            break;
        default:
            WarnMsg("Company Admin", "This File type is not allowed..!!");
            this.value = '';
    }
});

/* $(document).ready(function () 
{
    $('#btnSubmit').attr('disabled', true);
}); */

$(function () {
    var type = "doc";
    $(".onpreview").click(function (e) {
        e.preventDefault();
        $pdfpath = $(this).attr("data-url");

        if (type != "image") {
            var src = "https://docs.google.com/viewer?url=" + $pdfpath + "&embedded=true";
            $("#framePreview").attr("src", src);
        }
        else {
            $("#framePreview").attr("src", $pdfpath);
        }
    });
});