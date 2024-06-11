/*
 Template Name: Admiry - Bootstrap 4 Admin Dashboard
 Author: Themesdesign
 Website: www.themesdesign.in
 File: Alertify init js
 */

"use strict";

(function () {

    function $(selector) {
        return document.querySelector(selector);
    }

    function reset(ev) {
        ev.preventDefault();
        alertify.reset();
    }

    function logDemo(selector) {
        (ga || function () { })("send", "event", "button", "click", "demo", selector);
    }

    function demo(selector, cb) {
        var el = $(selector);
        if (el) {
            el.addEventListener("click", function (ev) {
                ev.preventDefault();
                logDemo(selector);
                cb();
            });
        }
    }

})();