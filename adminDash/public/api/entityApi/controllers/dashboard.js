
function bindenCount() {
    $('#loader').css("display", 'block');
    $.ajax({
        "url": "/eConsumer/getEntityCount", "method": "POST", success: function (a) {
            let res = a.body;
            $('#loader').fadeOut('slow');
            if (a.status == 200) {
                $('#lender').html(parseInt(res.lender))
                $('#nodes').html(res.nodes)
                $('#parent').html(parseInt(res.admin))
                $('#total').html(res.total)
            }
        }
    });
}

function getConsumerDetails() {
    $.ajax({
        "url": "/dash/getConsumerDetails", "method": "POST", success: function (res) {
            let a = res.body;
            $(".loaderContainer").fadeOut("slow")
            if (a.status == 200) {
                let entity = a.resource.entity
                //Buy  
                $("#ecbTransCount").html(parseInt(entity.Buy.count) + parseInt(entity.BuyCash.count));
                $('#ecbTransAmt').html(decimalChopper((parseFloat(entity.Buy.totalAmount) + parseFloat(entity.BuyCash.totalAmount)).toString(), 4))
                $("#ecbg24kQty").html(decimalChopper((parseFloat(entity.Buy.g24kQTY) + parseFloat(entity.BuyCash.g24kQTY)), 4), +" gms");
                $("#ecbs99kQty").html(decimalChopper((parseFloat(entity.Buy.s99pQTY) + parseFloat(entity.BuyCash.s99pQTY)), 4), +" gms");
                //redeemCash  
                $("#ecrTransCount").html(entity.redeemCash.count)
                $('#ecrTransAmt').html(decimalChopper(entity.redeemCash.totalAmount, 4))
                $("#ecrg24kQty").html(decimalChopper(entity.redeemCash.g24kQTY, 4), +" gms")
                $("#ecrs99kQty").html(decimalChopper(entity.redeemCash.s99pQTY, 4), +" gms")
                //transfer  
                $("#ectTransCount").html(entity.transfer.count)
                $("#ectg24kQty").html(decimalChopper(entity.transfer.g24kQTY, 4), +" gms")
                $("#ects99kQty").html(decimalChopper(entity.transfer.s99pQTY, 4), +" gms")
                $('#ectTransAmt').html(decimalChopper(entity.transfer.totalAmount, 4))
                let eccount = parseInt(entity.transfer.count) +  parseInt(entity.Buy.count) + parseInt(entity.BuyCash.count);
                let ectotalAmount = parseFloat(entity.transfer.totalAmount) +  parseFloat(entity.Buy.totalAmount) + parseFloat(entity.BuyCash.totalAmount);
                $("#ecTotTrans").html(eccount);
                $("#ecTotTransAmt").html(decimalChopper(parseFloat(ectotalAmount), 4))
            }
        }
    });
}
function getEntitySelfDetails() {
    $.ajax({
        "url": "/dash/getEntityTxnDetails", "method": "POST", success: function (res) {
            let a = res.body;
            $(".loaderContainer").fadeOut("slow")
            if (a.status == 200) {
                let entity = a.resource
                //Buy  
                $("#secbTransCount").html(parseInt(entity.Buy.count) + parseInt(entity.BuyCash.count));
                $('#secbTransAmt').html(decimalChopper((parseFloat(entity.Buy.totalAmount) + parseFloat(entity.BuyCash.totalAmount)).toString(), 4))
                $("#secbg24kQty").html(decimalChopper((parseFloat(entity.Buy.g24kQTY) + parseFloat(entity.BuyCash.g24kQTY)), 4), +" gms");
                $("#secbs99kQty").html(decimalChopper((parseFloat(entity.Buy.s99pQTY) + parseFloat(entity.BuyCash.s99pQTY)), 4), +" gms");
                //resdeemCash  
                $("#secrTransCount").html(entity.redeemCash.count)
                $('#secrTransAmt').html(decimalChopper(entity.redeemCash.totalAmount, 4))
                $("#secrg24kQty").html(decimalChopper(entity.redeemCash.g24kQTY, 4), +" gms")
                $("#secrs99kQty").html(decimalChopper(entity.redeemCash.s99pQTY, 4), +" gms")
                
                let ecount = parseInt(entity.transfer.count) + parseInt(entity.Buy.count) + parseInt(entity.BuyCash.count);
                let etotalAmount = parseFloat(entity.transfer.totalAmount) + parseFloat(entity.Buy.totalAmount) + parseFloat(entity.BuyCash.totalAmount);

                $("#eTotTrans").html(ecount);
                $("#eTotTransAmt").html(decimalChopper(parseFloat(etotalAmount), 4))

            }
        }
    });
}
$(function () {
    bindenCount();
    
})


