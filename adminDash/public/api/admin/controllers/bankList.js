function bindBanks() { 
    $("#cmbBank").select2({
        ajax: {
            url: "/entityWallet/fetchBanks",
            type: "post",
            dataType: 'json',
            delay: 0,
            minimumInputLength: 3,
            data: function (params) {
                return {
                    searchTerm: params.term // search term 
                };
            },
            processResults: function (data) {
                return {
                    results: $.map(data, function (item) {
                        return {
                            text: item.text,
                            id: item.id
                        }
                    })
                };
            },
            cache: true
        }
    });
} 
