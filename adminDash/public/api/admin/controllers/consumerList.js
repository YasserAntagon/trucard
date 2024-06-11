function bindConsumers(KYCFlag, rtruID, channel) {
    $("#cmbConsumer").select2({
        ajax: {
            url: "/summaryExc/consumerSearch",
            type: "post",
            dataType: 'json',
            delay: 250,
            minimumInputLength: 3,
            data: function (params) {
                return {
                    searchTerm: params.term, // search term
                    rTruID: rtruID ? rtruID : undefined,
                    channel: channel ? channel : undefined,
                    kycFlag: KYCFlag ? KYCFlag : undefined
                };
            },
            processResults: function (data) {
                return {
                    results: $.map(data, function (item) {
                        return {
                            text: item.text,
                            id: item.id,
                            color: item.color,
                            channel: item.channel
                        }
                    })
                };
            }
        },
        cache: true,
        templateResult: function (data) {
            var title = data.channel=="Direct" ? "Direct Consumer" : "Channel Consumer";
            if (data.color === undefined) return data.text;
            return '<span title="'+title+'" style="color:' + data.color + '"><i class="fa fa-user"></i></span> ' + data.text;
        },
        templateSelection: function (data) {
            var title = data.channel=="Direct" ? "Direct Consumer" : "Channel Consumer";
            if (data.color === undefined) return data.text;
            return '<span title="'+title+'" style="color:' + data.color + '"><i class="fa fa-user"></i></span> ' + data.text;
        },
        escapeMarkup: function (m) { return m; }
    });
}

function bindModalConsumers(KYCFlag, rtruID, channel) {
    $("#cmbConsumer").select2({
        dropdownParent: $('#exampleModal'),
        ajax: {
            url: "/summaryExc/consumerSearch",
            type: "post",
            dataType: 'json',
            delay: 250,
            minimumInputLength: 3,
            data: function (params) {
                return {
                    searchTerm: params.term, // search term
                    rTruID: rtruID,
                    channel: channel ? channel : undefined,
                    kycFlag: KYCFlag ? KYCFlag : undefined
                };
            },
            processResults: function (data) {
                return {
                    results: $.map(data, function (item) {
                        return {
                            text: item.text,
                            id: item.id,
                            color: item.color,
                            channel: item.channel
                        }
                    })
                };
            },
            cache: true
        },
        templateResult: function (data) {
            var title = data.channel=="Direct" ? "Direct Consumer" : "Channel Consumer";
            if (data.color === undefined) return data.text;
            return '<span title="'+title+'" style="color:' + data.color + '"><i class="fa fa-user"></i></span> ' + data.text;
        },
        templateSelection: function (data) {
            var title = data.channel=="Direct" ? "Direct Consumer" : "Channel Consumer";
            if (data.color === undefined) return data.text;
            return '<span title="'+title+'" style="color:' + data.color + '"><i class="fa fa-user"></i></span> ' + data.text;
        },
        escapeMarkup: function (m) { return m; }
    });
} 
function bindModalConsumerstohighertxnlist(KYCFlag, rtruID, channel) {
    var higherTxnFor = $('#byActive').attr("selectedText");
    $("#cmbConsumerhighertxn").empty();
    
    if(higherTxnFor === "consumer"){
        $('#cmbConsumerhighertxn').append(`<option value='0'>- Search Consumer -</option>`); 
        $("#cmbConsumerhighertxn").select2({
            ajax: {
                url: "/summaryExc/consumerSearch",
                type: "post",
                dataType: 'json',
                delay: 250,
                minimumInputLength: 3,
                data: function (params) {
                    return {
                        searchTerm: params.term, // search term
                        rTruID: rtruID ? rtruID : undefined,
                        channel: channel ? channel : undefined,
                        kycFlag: KYCFlag ? KYCFlag : undefined
                    };
                },
                processResults: function (data) {
                    return {
                        results: $.map(data, function (item) {
                            return {
                                text: item.text,
                                id: item.id,
                                color: item.color,
                                channel: item.channel
                            }
                        })
                    };
                }
            },
            cache: true,
            templateResult: function (data) {
                var title = data.channel=="Direct" ? "Direct Consumer" : "Channel Consumer";
                if (data.color === undefined) return data.text;
                return '<span title="'+title+'" style="color:' + data.color + '"><i class="fa fa-user"></i></span> ' + data.text;
            },
            templateSelection: function (data) {
                var title = data.channel=="Direct" ? "Direct Consumer" : "Channel Consumer";
                if (data.color === undefined) return data.text;
                return '<span title="'+title+'" style="color:' + data.color + '"><i class="fa fa-user"></i></span> ' + data.text;
            },
            escapeMarkup: function (m) { return m; }
        });
    }else{
        $('#cmbConsumerhighertxn').append(`<option value='0'>- Search Partner -</option>`); 
        $("#cmbConsumerhighertxn").select2({
            ajax: {
                url: "/summaryExc/partnerSearch",
                type: "post",
                dataType: 'json',
                delay: 250,
                minimumInputLength: 3,
                data: function (params) {
                    var isPar = {
                        searchTerm: params.term, // search term
                        rTruID: rtruID ? rtruID == "add" ? undefined : rtruID : undefined
                    }
                    /* if(isPar.isParent){
                        rtruID
                    } */
                    return isPar;
                },
                processResults: function (data) {
                    if (rtruID == "add") {
                        data.splice(1, 0, {
                            text: "Direct Channel",
                            id: "Direct"
                        });
    
                    }
                    return {
                        results: $.map(data, function (item) {
                            return {
                                text: item.text,
                                id: item.id,
                                color: item.color,
                                isParent: item.isParent
                            }
                        })
                    };
                },
                cache: true
            },
            templateResult: function (data) {
                var isparent = data.isParent ? "bank" : "users";
                var title = "Partner";
                if (data.color === undefined) return data.text;
                return '<span title="'+title+'" style="color:' + data.color + '"><i class="fa fa-' + isparent + '"></i></span> ' + data.text;
            },
            templateSelection: function (data) {
                var isparent = data.isParent ? "bank" : "users";
                var title = "Partner";
                if (data.color === undefined) return data.text;
                return '<span title="'+title+'" style="color:' + data.color + '"><i class="fa fa-fa-' + isparent + '"></i></span> ' + data.text;
            },
            escapeMarkup: function (m) { return m; }
        });
    }
    
}