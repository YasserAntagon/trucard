function promptReject(type,callback) {
    var options = "<option>Amount debited but stock not credited..!!</option>";
    if (type == "addMoney") {
        options = "<option>Amount debited but it is not credited in truWallet..!!</option>"
    } 
    var area = `<div class="form-group"> 
    <select name="reason" id="treason" class="form-control">
        <option value="0">Choose the reason ?</option>
        `+ options + `        
        <option>Fraud Transaction</option> 
        <option value="other">Other</option>
        </select>
</div>
<div class="form-group">
<label class="text text-danger" style:"font-size:20px">OR</label> 
</div>
<div class="form-group">
<label>If not found in above list :</label> 
<textarea id="swal-reason" class="form-control" style="resize:none" ></textarea>
</div>`;


    swal({
        title: 'Choose reason for refund ?',
        imageUrl: 'images/dashicon/dsummery.png',
        html: area,
        confirmButtonText: 'Submit',
        showLoaderOnConfirm: true,
        preConfirm: function () {
            return new Promise(function (resolve, reject) {
                if ($('#treason').val() == '0' && $('#swal-reason').val() == '') {
                    reject('Please select or enter reason of ' + title);
                }
                else if ($('#treason').val() == 'other' && $('#swal-reason').val() == '') {
                    reject('Please enter reason of ' + title);
                }
                else if ($('#treason').val() == 'other' && $('#swal-reason').val() != '' && $('#swal-reason').val().length < 10) {
                    reject('Your reason is too short. Please use no more than 10 characters.');
                }
                if ($('#treason').val() != '0' || $('#treason').val() == 'other') {
                    resolve($('#treason').val());
                }
                else {
                    setTimeout(function () {
                        resolve($('#swal-reason').val());
                    }, 1000);
                }
            });
        },
        allowOutsideClick: true,
        allowEscapeKey: true,
    }).then(function (text) {
        callback(text)
    })
}
function changeContent(invoice, failureReason) {
    let content = "<label class='label label-info'>Refund</label><p>" + failureReason + "</p>";
    $("#a" + invoice).html(content)
}
function btnRefund(event) {
    $val = $(event).attr("o-id");
    $pgref = $(event).attr("pg-ref");
    $TxnDate = $(event).attr("pg-TxnDate");
    $amount = $(event).attr("o-amt");
    $typeStatus = $(event).attr("o-typeStatus");
    $ctruid = $(event).attr("o-ctruid");
    $invoice = $(event).attr("o-invoice");
    $isPeople = $(event).attr("o-isPeople");
    $tType = $(event).attr("o-ttype");
    promptReject($tType,function (particulas) {
        var json = {
            "ORDER_ID": $val,
            "AMOUNT": $amount,
            "PG_REF_NUM": $pgref,
            "ctruid": $ctruid,
            "invoice": $invoice,
            "ttype": $tType,
            "particulas": particulas,
            "pgType": "atom",
            "createDate": $TxnDate,
            "isPeople": $isPeople
        };
        txnCheck(function (status) {
            if (status == true) {
                $('#loader').css("display", 'block');
                $.ajax({
                    "url": "/refundStatus/initialRefund", "method": "POST", data: json, success: function (a) {
                        $('#loader').fadeOut('slow');
                        if (a.status == "200") {
                            let data = a.response;
                            if (data.RESPONSE_CODE === "000" && data.RESPONSE_MESSAGE === 'SUCCESS' && data.STATUS === 'Captured') {
                                changeContent($invoice, particulas);
                                alertify.logPosition("bottom left");
                                alertify.success('Refund successfully initiated..!!');
                            }
                            else {
                                alertify.logPosition("bottom left");
                                alertify.error(data.RESPONSE_MESSAGE);
                            }
                            var status = data.STATUS == "Captured" && data.RESPONSE_CODE == "000" && data.RESPONSE_MESSAGE == "SUCCESS" ? true : false;
                            var json =
                            {
                                "typeStatus": $typeStatus,
                                "RESPONSE_DATE_TIME": data.RESPONSE_DATE_TIME ? data.RESPONSE_DATE_TIME : "",
                                "RESPONSE_CODE": data.RESPONSE_CODE ? data.RESPONSE_CODE : "",
                                "TXN_ID": data.TXN_ID,
                                "MOP_TYPE": data.MOP_TYPE,
                                "CARD_MASK": data.CARD_MASK,
                                "TXNTYPE": data.TXNTYPE,
                                "type": $tType,
                                "ctruid": $ctruid,
                                "PAYMENT_TYPE": data.PAYMENT_TYPE,
                                "PG_TXN_MESSAGE": data.PG_TXN_MESSAGE,
                                "STATUS": data.STATUS,
                                "PG_REF_NUM": data.PG_REF_NUM,
                                "ORDER_ID": data.ORDER_ID,
                                "AMOUNT": data.AMOUNT,
                                "INVAMOUNT": data.AMOUNT ? roundNumber(data.AMOUNT, 2) / 100 : "0",
                                "RESPONSE_MESSAGE": data.RESPONSE_MESSAGE ? data.RESPONSE_MESSAGE : "401",
                                "ORIG_TXN_ID": data.ORIG_TXN_ID ? data.ORIG_TXN_ID : data.TXN_ID,
                                "CUST_EMAIL": data.CUST_EMAIL,
                                "TOTAL_AMOUNT": data.TOTAL_AMOUNT,
                                "CUST_NAME": data.CUST_NAME,
                                "isStatus": false,
                                "success": data.TXNTYPE == "REFUND" ? false : status
                            }
                            paymentDetails(json);
                        }
                        else {
                            alertify.error(a.message)
                        }
                    }
                })
            }
            else {
                alertify.error("Please Verify TPIN..!!")
            }
        })
    })
}

function btnAtomRefund(event) {
    $atomtxnid = $(event).attr("atomtxnid");
    $TxnDate = $(event).attr("pg-TxnDate");
    $amount = $(event).attr("o-amt");
    $typeStatus = $(event).attr("o-typeStatus");
    $ctruid = $(event).attr("o-ctruid");
    $invoice = $(event).attr("o-invoice");
    $isPeople = $(event).attr("o-isPeople");
    $tType = $(event).attr("o-ttype");

    promptReject($tType,function (particulas) {
        var json = {
            "atomtxnid": $atomtxnid,
            "amount": $amount,
            "ctruid": $ctruid,
            "ttype": $tType,
            "invoice": $invoice,
            "particulas": particulas,
            "pgType": "atom",
            "txnDate": $TxnDate,
            "isPeople": $isPeople
        };
        txnCheck(function (status) {
            if (status == true) {
                $('#loader').css("display", 'block');
                $.ajax({
                    "url": "/refundStatus/initialAtomRefund", "method": "POST", data: json, success: function (a) {
                        $('#loader').fadeOut('slow');
                        if (a.status == 200) {
                            $(".atomRStatus").empty();
                            $(".atomRStatus").append(`<h4 class="text text-success">Amount refunded successfully..!! </h4>`);
                            alertify.logPosition("bottom left");
                            alertify.success('Refund successfully initiated..!!');
                        }
                        else {
                            alertify.logPosition("bottom left");
                            alertify.error(a.message);
                        }
                    }
                })
            }
            else {
                alertify.error("Please Verify TPIN..!!")
            }
        })
    })
}
function paymentDetails(data) {
    var invoice = {
        "payInvoice": [
            data
        ]
    };
    var list = $("#payStatus").html();
    var html = Mustache.to_html(list, invoice);
    $(".target-payment").html(html);
}