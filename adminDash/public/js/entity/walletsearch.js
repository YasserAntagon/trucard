function onPieBind(res) {
    if (res.length>0) {
        $stock = res[0];
        var sG24K = "0.00";
        var sS99P = "0.00"; 
        if ($stock) {
            // actual stock 
            sG24K = ($stock.G24K) ? decimalChopper(parseFloat($stock.G24K), 4) : "0";
            sS99P = ($stock.S99P) ? decimalChopper(parseFloat($stock.S99P), 4) : "0"; 
        }
        //bullion stock
        $("#g24k").html(sG24K + " gm");
        $("#s99p").html(sS99P + " gm"); 
        var data = {
            datasets: [{
                data: [sG24K, sS99P],
                backgroundColor: ["#0073b7", "#dd4b39"],
                borderColor: ["#0073b7","#dd4b39"]
            }],

            // These labels appear in the legend and in the tooltips when hovering different arcs
            labels: [
                'Gold 24k',
                '99% Pure Silver'
            ]
        };


        //var ctx = document.getElementById('canvass').getContext('2d');
        try {
            var ctx = $('#canvass').get(0).getContext('2d');
            var myPieChart = new Chart(ctx, {
                type: 'pie',
                data: data,
                options: {
                    responsive: true
                }
            });
        } catch (e) {
            console.log('We have encountered an error: ' + e);
        }


    }
}