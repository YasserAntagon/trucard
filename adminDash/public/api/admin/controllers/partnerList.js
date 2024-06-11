function bindPartners(rtruID, isParent) {
    $("#cmbPartner").select2({
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
    $("#cmbPartnerDash").select2({
        ajax: {
            url: "/summaryExc/partnerSearch",
            type: "post",
            dataType: 'json',
            delay: 250,
            minimumInputLength: 3,
            data: function (params) {
                return {
                    searchTerm: params.term, // search term
                    rTruID: rtruID,
                    isParent: isParent
                };
            },
            processResults: function (data) {
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
function bindModalPartners(rtruID, isParent) {
    $("#cmbPartner").select2({
        dropdownParent: $('#exampleModal'),
        ajax: {
            url: "/summaryExc/partnerSearch",
            type: "post",
            dataType: 'json',
            delay: 250,
            minimumInputLength: 3,
            data: function (params) {
                return {
                    searchTerm: params.term, // search term
                    rTruID: rtruID,
                    isParent: isParent
                };
            },
            processResults: function (data) {
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