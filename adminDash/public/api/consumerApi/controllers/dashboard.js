
function bindCustCount() { 
    $('.loaderContainer').css("display", 'block');
    $.ajax({
        "url": "/consumerList/getCustomerCounts", "method": "POST",success: function (a) {
          
            let res = a.body; 
                $('.loaderContainer').fadeOut('slow'); 
                if (a.status == 200) {
                    $("#direct").html(res.direct);
                    $("#entity").html(res.entity);
                    $("#admin").html(res.admin);
                    $("#assetmanager").html(res.assetmanager);
                    $("#total").html(res.total); 
                }
                else {
                    alertify.error(res.messege)
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
                // consumer
                let consumer = a.resource.consumer
                //buy
                $("#cbTransCount").html(consumer.Buy.count);
                $('#cbTransAmt').html(decimalChopper(consumer.Buy.totalAmount, 4))
                $("#cbg24kQty").html(decimalChopper(consumer.Buy.g24kQTY, 4), +" gms");
                
                
                $("#cbs99kQty").html(decimalChopper(consumer.Buy.s99pQTY, 4), +" gms");
                //redeemCash  
                $("#crTransCount").html(parseFloat(consumer.redeemCash.count))
                $('#crTransAmt').html(decimalChopper(consumer.redeemCash.totalAmount, 4))
                $("#crg24kQty").html(decimalChopper(consumer.redeemCash.g24kQTY, 4), +" gms")
                
                
                $("#crs99kQty").html(decimalChopper(consumer.redeemCash.s99pQTY, 4), +" gms")
               
                //transfer  
                $("#ctTransCount").html(consumer.transfer.count)
                $("#ctg24kQty").html(decimalChopper(consumer.transfer.g24kQTY, 4), +" gms")
                
                
                $("#cts99kQty").html(decimalChopper(consumer.transfer.s99pQTY, 4), +" gms")
                $('#ctTransAmt').html(decimalChopper(consumer.transfer.totalAmount, 4))
 
                let ccount = parseInt(consumer.transfer.count) +  parseInt(consumer.Buy.count);
                //let ecount = parseInt(entity.transfer.count) +  parseInt(entity.Buy.count) + parseInt(entity.BuyCash.count);


                let ctotalAmount = parseFloat(consumer.transfer.totalAmount)  + parseFloat(consumer.Buy.totalAmount);
               // let etotalAmount = parseFloat(entity.transfer.totalAmount) +  parseFloat(entity.Buy.totalAmount) + parseFloat(entity.BuyCash.totalAmount);

                $("#TotTrans").html(ccount);
                $("#TotTransAmt").html(decimalChopper(parseFloat(ctotalAmount), 4))
                // $("#TotTransBul").html(decimalChopper(a.resource.totalQTY, 4) + " gms")

            }
        }
    });
}
$(function () {
    bindCustCount(); 
    getConsumerDetails(); 
})
