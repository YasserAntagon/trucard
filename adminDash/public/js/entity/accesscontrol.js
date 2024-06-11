$('#btnCedit').click(function (e) {
    e.stopPropagation();
    $('#sbuy').editable('toggleDisabled');
    $('#sredeemCash').editable('toggleDisabled');
    $('#sTransfer').editable('toggleDisabled');

    $('#cbuy').editable('toggleDisabled');
    $('#credeemCash').editable('toggleDisabled');
    $('#cTransfer').editable('toggleDisabled');
    $('#paymentGateway').editable('toggleDisabled');    
    $('#txtentityAddOn').editable('toggleDisabled');
    $("#txtentityRevCharges").editable('toggleDisabled');

    $("#wallet").editable('toggleDisabled');

});
function clearAll() {
    $('#sbuy').editable('toggleDisabled');
    $('#sredeemCash').editable('toggleDisabled');
    $('#sTransfer').editable('toggleDisabled');

    $('#cbuy').editable('toggleDisabled');
    $('#credeemCash').editable('toggleDisabled');
    $('#cTransfer').editable('toggleDisabled');
    
    $('#paymentGateway').editable('toggleDisabled');
    $('#txtentityAddOn').editable('toggleDisabled');
    $("#txtentityRevCharges").editable('toggleDisabled');
    $("#wallet").editable('toggleDisabled');
}

function loadlabel() 
{
    $.fn.editable.defaults.mode = 'inline';
    $('#sbuy').editable({
        type: 'select',
        title: 'Select Permission',
        // disabled: 'true',
        placement: 'right',
        value: $('#sbuy').html() == "Coming Soon" ? "comingsoon" : $('#sbuy').html().toLowerCase(),
        source: [
            { value: "allow", text: 'Allow' },
            { value: "disable", text: 'Disable' },
            { value: "maintenance", text: 'Maintenance' },
            { value: "comingsoon", text: 'Coming Soon' }
        ]
    });
    $('#sredeemCash').editable({
        type: 'select',
        title: 'Select Permission',
        // disabled: 'true',
        placement: 'right',
        value: $('#sredeemCash').html() == "Coming Soon" ? "comingsoon" : $('#sredeemCash').html().toLowerCase(),
        source: [
            { value: "allow", text: 'Allow' },
            { value: "disable", text: 'Disable' },
            { value: "maintenance", text: 'Maintenance' },
            { value: "comingsoon", text: 'Coming Soon' }
        ]
    });
    $('#sTransfer').editable({
        type: 'select',
        title: 'Select Permission',
        // disabled: 'true',
        placement: 'right',
        value: $('#sTransfer').html() == "Coming Soon" ? "comingsoon" : $('#sTransfer').html().toLowerCase(),
        source: [
            { value: "allow", text: 'Allow' },
            { value: "disabled", text: 'Disable' },
            { value: "maintenance", text: 'Maintenance' },
            { value: "comingsoon", text: 'Coming Soon' }
        ]
    });

    $('#cbuy').editable({
        type: 'select',
        title: 'Select Permission',
        // disabled: 'true',
        placement: 'right',
        value: $('#cbuy').html() == "Coming Soon" ? "comingsoon" : $('#cbuy').html().toLowerCase(),
        source: [
            { value: "allow", text: 'Allow' },
            { value: "disable", text: 'Disable' },
            { value: "maintenance", text: 'Maintenance' },
            { value: "comingsoon", text: 'Coming Soon' }
        ]
    });
    $('#credeemCash').editable({
        type: 'select',
        title: 'Select Permission',
        // disabled: 'true',
        placement: 'right',
        value: $('#credeemCash').html() == "Coming Soon" ? "comingsoon" : $('#credeemCash').html().toLowerCase(),
        source: [
            { value: "allow", text: 'Allow' },
            { value: "disable", text: 'Disable' },
            { value: "maintenance", text: 'Maintenance' },
            { value: "comingsoon", text: 'Coming Soon' }
        ]
    });
    $('#cTransfer').editable({
        type: 'select',
        title: 'Select Permission',
        // disabled: 'true',
        placement: 'right',
        value: $('#cTransfer').html() == "Coming Soon" ? "comingsoon" : $('#cTransfer').html().toLowerCase(),
        source: [
            { value: "allow", text: 'Allow' },
            { value: "disabled", text: 'Disable' },
            { value: "maintenance", text: 'Maintenance' },
            { value: "comingsoon", text: 'Coming Soon' }
        ]
    });
    $('#txtentityRevCharges').editable({
        type: 'text',
        title: 'Enter Entity Revenue Charges',
        placement: 'right',
        mode:'popup',
        validate: function (value) {
            if ($.trim(value) == '') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Only number & decimal value are allowed';
            }
            $("#txtentityRevCharges").html($.trim(value))
            
        }
    });
    $('#txtentityAddOn').editable({
        type: 'text',
        title: 'Enter Qty of 99% Silver',
        placement: 'right',
        mode:'popup',
        validate: function (value) {
            if ($.trim(value) == '') return 'This field is required';
            if ($.isNumeric(value) == '') {
                return 'Only number & decimal value are allowed';
            }
            $("#txtentityAddOn").html($.trim(value))
            
        }
    });

    $('#wallet').editable({
        type: 'select',
        title: 'Select Permission',
        // disabled: 'true',
        placement: 'right',
        value: $('#wallet').html() == "Coming Soon" ? "comingsoon" : $('#wallet').html().toLowerCase(),
        source: [
            { value: "allow", text: 'Wallet' },
            { value: "parent", text: 'Parent Wallet' },
            { value: "disable", text: 'Disable' }
        ]
    });
}
