function onPieBind($Data) {

    if ($Data) {
        // actual stock

        var sG24K = decimalChopper($Data.G24K, 4);
        var sS99P = decimalChopper($Data.S99P, 4);
        var walletbal = decimalChopper($Data.balance, 4);
    }
    else{
        var sG24K = "0.00";
        var sS99P = "0.00";
        var walletbal = "0.00";
    }
    //bullion stock
    $("#g24k").html(sG24K + " gms");
    $("#s99p").html(sS99P + " gms");
    $('#walletbal').html(walletbal);



   var data = {
        datasets: [{
            data: [sG24K, sS99P],
            backgroundColor: ["#f39c12", "#999595"],
            borderColor: ["#f39c12", "#999595"]
        }],

        // These labels appear in the legend and in the tooltips when hovering different arcs
        labels: [
            'TruCoin Gold', 
            'TruCoin Silver'
        ]
    };


    var ctx = document.getElementById('canvass').getContext('2d');
    var myPieChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            responsive: true
        }
    });


}