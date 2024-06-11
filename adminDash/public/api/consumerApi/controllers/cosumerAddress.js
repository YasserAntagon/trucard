
$(function () {
    BindAddr();
})
function BindAddr() {
    $ctruid = $("#txtcTruid").val()
    var json = {
        "truID": $ctruid
    };
    $.ajax({
        "url": "/consumerDB/getConsumerData", "method": "POST", data: json, success: function (a) {
            let res = a.body;
            $consData = res;
            loadaddr($consData);
        }
    });
    $.fn.editable.defaults.mode = 'inline'; //editables  
}
var addArr = new Array();
var addArr1 = new Array();
function loadaddr(cdata) {
    var b_addr = cdata.billingAddress;
    addArr.push(b_addr);
    var p_addr = cdata.permanentAddress;
    addArr1.push(p_addr);
    $('#txtaddress').editable({
        title: 'Enter city, street and building',
        disabled: 'true',
        value: {

            houseNumber: b_addr ? b_addr.houseNumber : '',
            streetNumber: b_addr ? b_addr.streetNumber : '',
            landmark: b_addr ? b_addr.landmark : '',
            city: b_addr ? b_addr.city : '',
            state: b_addr ? b_addr.state : '',
            country: b_addr ? b_addr.country : '',
            pin: b_addr ? b_addr.pin : '',

        },
        disabled: 'true',
        validate: function (value) {
            var regex = /^[a-zA-z0-9,-_ ]+$/;
            if (!regex.test(value.houseNumber)) {
                return 'Please Enter Valid Building';
            }
            if (!regex.test(value.landmark)) {
                return 'Please Enter Valid Street';
            }
            if (!regex.test(value.streetNumber)) {
                return 'Please Enter Valid Landmark';
            }
            if (!regex.test(value.city)) {
                return 'Please Enter Valid City';
            }
            if (!regex.test(value.state)) {
                return 'Please Enter Valid State';
            }
            if (!regex.test(value.country)) {
                return 'Please Enter Valid Country';
            }
            var regex1 = /^[1-9]{1}[0-9]{5}$/;
            if (!regex1.test(value.pin)) {
                return 'Please Enter Valid Pincode';
            }
            addArr = new Array();
            addArr.push(value);
            //updateAddr("");
        }
    });
    $('#b_txtaddress').editable({
        title: 'Enter city, street and building',
        disabled: 'true',
        value: {

            houseNumber: p_addr ? p_addr.houseNumber : '',
            streetNumber: p_addr ? p_addr.streetNumber : '',
            landmark: p_addr ? p_addr.landmark : '',
            city: p_addr ? p_addr.city : '',
            state: p_addr ? p_addr.state : '',
            country: p_addr ? p_addr.country : '',
            pin: p_addr ? p_addr.pin : '',
        },
        disabled: 'true',
        validate: function (value) {
            var regex = /^[a-zA-z0-9,-_ ]+$/;
            if (!regex.test(value.houseNumber)) {
                return 'Please Enter Valid Building';
            }
            if (!regex.test(value.landmark)) {
                return 'Please Enter Valid Street';
            }
            if (!regex.test(value.streetNumber)) {
                return 'Please Enter Valid Landmark';
            }
            if (!regex.test(value.city)) {
                return 'Please Enter Valid City';
            }
            if (!regex.test(value.state)) {
                return 'Please Enter Valid State';
            }
            if (!regex.test(value.country)) {
                return 'Please Enter Valid Country';
            }
            var regex1 = /^[1-9]{1}[0-9]{5}$/;
            if (!regex1.test(value.pin)) {
                return 'Please Enter Valid Pincode';
            }
            addArr1 = new Array();
            addArr1.push(value);
            //updateAddr("C");

        }
    });

    // initMap(b_addr.houseNumber, b_addr.streetNumber, b_addr.landmark, b_addr.city, b_addr.state)
};
function updateAddr() { 
    var latitude = $("#lat").val().trim();
    var longitude = $("#lng").val().trim(); 
    $amtruid = $("#txtcTruid").val().trim();  
    var kycjson ={ 
        "cTruID": $amtruid,
        "houseNumber": addArr[0].houseNumber.trim(),
        "streetNumber": addArr[0].streetNumber.trim(),
        "landmark": addArr[0].landmark.trim(),
        "pin": addArr[0].pin.trim(),
        "city": addArr[0].city.trim(),
        "state": addArr[0].state.trim(),
        "country": addArr[0].country.trim(),

        // permanent Address
        "pHouseNumber": addArr1[0].houseNumber.trim(),
        "pStreetNumber": addArr1[0].streetNumber.trim(),
        "pLandmark": addArr1[0].landmark.trim(),
        "pPin": addArr1[0].pin.trim(),
        "pCity": addArr1[0].city.trim(),
        "pState": addArr1[0].state.trim(),
        "pCountry": addArr1[0].country.trim(),

        "latitude": latitude,
        "longitude": longitude
    };
    txnCheck(function(status){
        if (status == true){
            $('#ConsumerAddrLoader').css("display", 'block');
            $.ajax({
                "url": "/consumerList/updateConsumerAddress", "method": "POST", data: kycjson, success: function (a) {
                    let res = a.body;
                    $('#ConsumerAddrLoader').fadeOut('slow');
                    if (res.status == 1000) {
                        // onSearchUpdate($amtruid);
                        // $('#updateaddress').addClass("hidden");
                        // $('#infoaddress').removeClass("hidden");
                        $('#txtaddress').editable('toggleDisabled');
                        $('#b_txtaddress').editable('toggleDisabled');
                        $('#txtaddress').removeClass('editable-unsaved');
                        $('#b_txtaddress').removeClass('editable-unsaved');
                        $('#updateProf').addClass("hidden");
                        $('#btnedit').removeClass("hidden");
                        alertify.logPosition("bottom left");
                        alertify.success('Address updated successfully..!!');
                    }
                    else {
                        WarnMsg("Company Consumer", "Please Enter the required fields");
                        return false;
                    }
                }
            });
        } 
        else{
            alertify.error("Please Verify TPIN..!!")
        }
    })
}