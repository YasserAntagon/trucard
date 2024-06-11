/*
 Template Name: Admiry - Bootstrap 4 Admin Dashboard
 Author: Themesdesign
 Website: www.themesdesign.in
 File: Sweet Alert init js
 */

!function ($) {
    "use strict";
    var SweetAlert = function () {
    };

    //examples
    SweetAlert.prototype.init = function () {
    },
        //init
        $.SweetAlert = new SweetAlert, $.SweetAlert.Constructor = SweetAlert
}(window.jQuery),
    //initializing
    function ($) {
        "use strict";
        $.SweetAlert.init()
    }(window.jQuery);

function confirmMsg(body) {
    var flag = false;
    swal({
        title: 'Are you sure?',
        text: body,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, proceed it!',
        cancelButtonText: 'No, cancel!',
        confirmButtonClass: 'btn btn-sm btn-primary',
        cancelButtonClass: 'btn btn-sm btn-danger m-l-10',
        buttonsStyling: false
    }).then(function () {
        flag = true;
    }, function (dismiss) {
        // dismiss can be 'cancel', 'overlay',
        // 'close', and 'timer'
        if (dismiss === 'cancel') {
            swal(
                'Cancelled',
                'you cancelled your request...',
                'error'
            )
            flag = false;
        }
    })
    return flag;
}

function SubmitMsg(title1, body) {
    swal(
        {
            title: "Company Admin",
            text: body,
            type: 'success',
            // showCancelButton: true,
            confirmButtonClass: 'btn btn-success',
            // cancelButtonClass: 'btn btn-danger m-l-10'
        }
    ).then(function () {
        flag = true;
    }, function (dismiss) {
        // dismiss can be 'cancel', 'overlay',
        // 'close', and 'timer'
        // if (dismiss === 'cancel') {
        //     swal(
        //             'Cancelled',
        //             'you cancelled your conversion...',
        //             'error'
        //             )
        // }
    })
}
function WarnMsg(title1, body) {
    swal(
        {
            title: "Company Admin",
            text: body,
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-primary',
            showCancelButton: false,
            cancelButtonClass: 'btn btn-danger m-l-10'
        }
    ).then(function () {
        flag = true;
    }, function (dismiss) {
        // dismiss can be 'cancel', 'overlay',
        // 'close', and 'timer'
        if (dismiss === 'cancel') {
            swal(
                'Cancelled',
                'you cancelled your request...',
                'error'
            )
        }
    })
}
function errMsg(title1, body) {
    swal(
        {
            title: "Company Admin",
            text: body,
            type: 'error',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-primary',
            showCancelButton: false,
            cancelButtonClass: 'btn btn-danger m-l-10'
        }
    ).then(function () {
        flag = true;
    }, function (dismiss) {
        // dismiss can be 'cancel', 'overlay',
        // 'close', and 'timer'
        if (dismiss === 'cancel') {
            swal(
                'Cancelled',
                'you cancelled your request...',
                'error'
            )
        }
    })
}