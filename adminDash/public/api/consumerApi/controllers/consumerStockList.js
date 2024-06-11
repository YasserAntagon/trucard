function bindStocks(json) {
  $.ajax({
    "url": "/consumerListWF/bindConsumerList", "method": "POST", data: json, success: function (dataResult) {
      const data=JSON.parse(dataResult).data[0]
      if (data) {
        $("#cstock24k").text(data.stock24 + " gms");
        $("#cstock99p").text(data.stock99 + " gms");
        $("#walBal").text(decimalChopper(data.wallet, 2)); 
      }
      $(".spinnerRev").addClass("hidden")
      $(".spinnerVal").removeClass("hidden")
    }
  })
  $("#clear-label").addClass("hidden");
  $("#entityDetailsLoader").fadeOut('slow');
}

setTimeout(() => {
  let ctruid = $("#txtcTruid").val();
  var json = { to: ctruid };
  bindStocks(json)
}, 1000)