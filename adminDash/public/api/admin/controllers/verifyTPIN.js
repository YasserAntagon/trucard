var countminus = 3;

function txnCheck(callback) {
    if (countminus < 1) { 
        callback(false);
    } 
    swal({
        title: 'Authentication Required',
        input: 'password',
        inputAttributes: {
            maxlength: 6,
            autocomplete:"off"
        },
        imageUrl: 'images/notifyicon/lock.png',
        showCancelButton: true,  
        showLoaderOnConfirm: true, 
        buttons: ["No, cancel!", "Verify"],
        inputPlaceholder: "Enter your Authentication PIN",
        inputValidator: function (text) {
            return new Promise(function (resolve, reject) {
                var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
                var numbers = /^[0-9]+$/;
                if (text === "") {
                    reject('Please enter pin..!!')
                } else if(format.test(text)){   
                    reject('Special characters are not allowed..!!')
                }else if (!numbers.test(text)){
                    reject('Only Numbers are allowed..!!')
                
                } else {
                    resolve();
                }
            });
        },
        preConfirm: function (text) {
            return new Promise(function (resolve, reject) {
                if (text === "") {
                    reject('Please enter Authentication PIN..!!')
                } else {
                    // console.log("countminus");
                    if (countminus < 2) {
                        resolve();
                        alertify.error("You have exceed Authentication PIN Verification Limit Please Try After Some Time..!!")
                        return false;
                    }

                    var json = {
                        "tPIN": text
                    };
                    $.ajax({
                        "url": "/login/verifyEmpTPIN",
                        "method": "POST",
                        data: json,
                        success: function (a) {
                            let res = a.body;
                            if (res.status == 200) {
                                $("#buyfProceedloader").css("display", "block")
                                callback(true);
                                resolve();
                            } else {
                                countminus = countminus - 1;
                                reject('The Authentication PIN is Invalid. ' + countminus + ' attempt left');
                            }
                        }
                    });
                }
            });
        },
        allowOutsideClick: false
    }).then(function () {
    },
    function (dismiss) {
        if (dismiss === 'cancel') {
            callback(false);
            swal(
                'Cancelled',
                'you cancelled the request...',
                'error'
            )
        }
    })
}