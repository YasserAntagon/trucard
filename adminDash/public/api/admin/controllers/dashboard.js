
function bindCount(json) {
    $(".loaderContainer").css("display", "block") 
    $.ajax({ "url": "/summaryExc/countAllPeople", "method": "POST", success: function (apr) {
            let res = apr.resource;
            let consumer = res.consumer;
            let entity = res.entity;
            $('.loaderContainer').fadeOut('slow');
            $(".spinnerNodeDash").addClass("hidden")
            $(".spinnerNode").removeClass("hidden")
            if (apr.status == 200) { 
                $('#nodes').html(entity.nodes);
                $('#entityCount').html(parseInt(entity.parent));
                $('#totalEntity').html("Total : " + entity.total);
                $('#totalent').html(entity.total);
                partnerPiechart(entity.parent, entity.nodes);
                $('#consumerCount').html(consumer.direct);
                $('#conodes').html(consumer.entity);
                $('#coadmin').html(consumer.admin);
                $('#coassetmanager').html(consumer.assetmanager);
                $('#totalConsumer').html("Total : " + consumer.total);
                consumerPiechart(consumer.direct, consumer.entity);
            }
        }
    });
}

function getCustoCount() {
    $.ajax({
        "url": "/assetstore/getCustoCount", "method": "POST", success: function (a) {
            let res = a.body;
            $('.loaderContainer').fadeOut('slow');
            if (a.status == 200) {
                $('#cnodes').html(res.store)
                $('#custoCount').html(parseInt(res.nodes) + parseInt(res.parent))
                $('#totalCutodian').html(parseInt(res.nodes) + parseInt(res.parent) + parseInt(res.store))

            }
        }
    });
}
function getdlrCount() {
    $.ajax({
        "url": "/assetmanagerList/getassetmanagerCount", "method": "POST", success: function (a) {
            let res = a.body;
            $('.loaderContainer').fadeOut('slow');
            if (a.status == 200) {
                $('#assetmanagerCount').html(parseInt(res.parent))
                $('#dnodes').html(parseInt(res.nodes))
                $('#totalAssetManager').html(parseInt(res.nodes) + parseInt(res.parent));
            }
        }
    });
}
function getCustomerCount() {
    $.ajax({
        "url": "/consumerList/getCustomerCounts", "method": "POST", success: function (a) {
            let res = a.body;
            $('.loaderContainer').fadeOut('slow');
            if (a.status == 200) {
                $('#consumerCount').html(res.direct);
                $('#conodes').html(res.entity);
                $('#coadmin').html(res.admin);
                $('#coassetmanager').html(res.assetmanager);
                $('#totalConsumer').html("Total : " + res.total);
                consumerPiechart(res.direct, res.entity);
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

                let assetmanager = a.resource.assetmanager
                //consumer in assetmanager Details  
                let dlrcount = parseInt(assetmanager.Buy.count) + parseInt(assetmanager.BuyCash.count)
                let dlrAmount = parseFloat(assetmanager.Buy.totalAmount) + parseFloat(assetmanager.BuyCash.totalAmount);
                $("#cdecbTransCount").html(dlrcount);
                $('#cdecbTransAmt').html(decimalChopper((dlrAmount).toString(), 4))
                $("#cdecbg24kQty").html(decimalChopper((parseFloat(assetmanager.Buy.g24kQTY) + parseFloat(assetmanager.BuyCash.g24kQTY)), 4), +" gms");
                $("#cdecbs99kQty").html(decimalChopper((parseFloat(assetmanager.Buy.s99pQTY) + parseFloat(assetmanager.BuyCash.s99pQTY)), 4), +" gms");



                let ccount = parseInt(consumer.transfer.count) +  parseInt(consumer.Buy.count);
                let eccount = parseInt(entity.transfer.count) +  parseInt(entity.Buy.count) + parseInt(entity.BuyCash.count);



                let ctotalAmount = parseFloat(consumer.transfer.totalAmount)  + parseFloat(consumer.Buy.totalAmount);
                let ectotalAmount = parseFloat(entity.transfer.totalAmount) +  parseFloat(entity.Buy.totalAmount) + parseFloat(entity.BuyCash.totalAmount);

                $("#TotTrans").html(ccount);
                $("#TotTransAmt").html(decimalChopper(parseFloat(ctotalAmount), 4))

                $("#dcTotTrans").html(dlrcount);
                $("#dcTotTransAmt").html(decimalChopper(parseFloat(dlrAmount), 4))


                $("#ecTotTrans").html(eccount);
                $("#ecTotTransAmt").html(decimalChopper(parseFloat(ectotalAmount), 4))

                // $("#TotTransBul").html(decimalChopper(a.resource.totalQTY, 4) + " gms")

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
               
                let ecount = parseInt(entity.transfer.count) +  parseInt(entity.Buy.count) + parseInt(entity.BuyCash.count);
                let etotalAmount = parseFloat(entity.transfer.totalAmount) +  parseFloat(entity.Buy.totalAmount) + parseFloat(entity.BuyCash.totalAmount);

                $("#eTotTrans").html(ecount);
                $("#eTotTransAmt").html(decimalChopper(parseFloat(etotalAmount), 4))

            }
        }
    });
} 

$(function () {
    bindCount(); 
})
