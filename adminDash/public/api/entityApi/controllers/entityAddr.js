$(function () {
    BindAddr();
})
function BindAddr() {
    $ctruid = $("#txteTruid").val();
    var json = {
        "truID": $ctruid
    };
    $('#loader').css('display', 'block');
    $.ajax({
        "url": "/entityDB/getEntityData", "method": "POST", data: json, success: function (res) {
            let a = res.body;
            $consData = a[0];
            $('#loader').fadeOut('slow');
            if (a[0].address) {
                $('#isLend').val(a[0].isLending)
                loadaddr(a[0]);
            }
            else{
                loadaddr({});
            }
        }
    });
}

var addArr = new Array();
function loadaddr(cdata) {
    var b_addr = cdata.address;
    addArr.push(b_addr);
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


    // initMap(b_addr.houseNumber, b_addr.streetNumber, b_addr.landmark, b_addr.city, b_addr.state)
};

var onupdate = function ($dlrText) {
    var json = {
        "rTruID": $dlrText,
    };
    $('#loader').css("display", 'block');
    $.ajax({
        "url": "/eEntity/searchEntity", "method": "POST", data: json, success: function (a) {
            $('#loader').fadeOut('slow');
            let data = a.body;
            if (data.status == 200) {
                //eloki.insertEntityData(data, edb);
                var res = data.resource;
                var eaddress = res.address.houseNumber + ", " + res.address.streetNumber + ", " + res.address.landmark + ", <br>" + res.address.city + ", " + res.address.state + ", <br>" + res.address.country + " - " + res.address.pin;
                $('#eAddress').html(eaddress)

            } else {
                alertify.error(data.messege);
            }
        }
    });
}

function updateAddr() {
    var latitude = $("#lat").val().trim();
    var longitude = $("#lng").val().trim();
    $amtruid = $("#txteTruid").val().trim();
    var kycjson = {
        "rTruID": $amtruid,
        //Contact Address
        "houseNumber": addArr[0].houseNumber.trim(),
        "streetNumber": addArr[0].streetNumber.trim(),
        "landmark": addArr[0].landmark.trim(),
        "pin": addArr[0].pin.trim(),
        "city": addArr[0].city.trim(),
        "state": addArr[0].state.trim(),
        "country": addArr[0].country.trim(),
        "isLending": $('#isLend').val() == 'true' ? true : false,

        //Latitude and longitude
        "latitude": latitude,
        "longitude": longitude,

        //Company registered Address

    }
    txnCheck(function (status) {
        if (status == true) {
            $('#loader').css("display", 'block');
            $.ajax({
                "url": "/eConsumer/saveEntityAddr", "method": "POST", data: kycjson, success: function (a) {
                    let res = a.body;
                    $('#loader').fadeOut('slow');

                    if (res.status == 200) {
                        // onupdate($amtruid);
                        alertify.logPosition("bottom left");
                        alertify.success('Address updated successfully..!!');

                        $('#updateProf').addClass("hidden");
                        $('#btnedit').removeClass("hidden");
                        $('#txtaddress').editable('toggleDisabled');
                        $('#b_txtaddress').editable('toggleDisabled');
                        $('#o_txtaddress').editable('toggleDisabled');
                    
                    }
                    else {
                        WarnMsg("Company Consumer", "Please Enter the required fields");
                        return false;
                    }
                }
            });
        }
        else {
            alertify.error("Please Verify TPIN..!!")
        }
    })

    // $('#user .editable').editable({
    //     disabled: false
    // });

  
}




