
(function ($) {
    "use strict";

    var Address = function (options) {
        this.init('address', options, Address.defaults);
    };
    // console.log(Address);

    //inherit from Abstract input
    $.fn.editableutils.inherit(Address, $.fn.editabletypes.abstractinput);
    $.fn.editable.defaults.mode = 'inline'; //editables  
    $.extend(Address.prototype, {
        /**
        Renders input from tpl
 
        @method render() 
        **/
        render: function () {
            this.$input = this.$tpl.find('input');
        },

        /**
        Default method to show value in element. Can be overwritten by display option.
        
        @method value2html(value, element) 
        **/
        value2html: function (value, element) {
            if (!value) {
                $(element).empty();
                return;
            }
            var html = $('<div>').text(value.houseNumber).html().trim() + ', ' + $('<div>').text(value.streetNumber).html().trim() + ', ' + $('<div>').text(value.landmark).html().trim() + ', ' + $('<div>').text(value.city).html().trim() + ', ' + $('<div>').text(value.state).html().trim() + ', ' + $('<div>').text(value.country).html().trim() + ' - ' + $('<div>').text(value.pin).html().trim();
            $(element).html(html);
        },

        /**
        Gets value from element's html
        
        @method html2value(html) 
        **/
        html2value: function (html) {
            /*
              you may write parsing method to get value by element's html
              e.g. "Moscow, st. Lenina, bld. 15" => {landmark: "Moscow", street: "Lenina", building: "15"}
              but for complex structures it's not recommended.
              Better set value directly via javascript, e.g. 
              editable({
                  value: {
                      landmark: "Moscow", 
                      street: "Lenina", 
                      building: "15"
                  }
              });
            */
            return null;
        },

        /**
         Converts value to string. 
         It is used in internal comparing (not for sending to server).
         
         @method value2str(value)  
        **/
        value2str: function (value) {
            var str = '';
            if (value) {
                for (var k in value) {
                    str = str + k + ':' + value[k] + ';';
                }
            }
            return str;
        },

        /*
         Converts string to value. Used for reading value from 'data-value' attribute.
         
         @method str2value(str)  
        */
        str2value: function (str) {
            /*
            this is mainly for parsing value defined in data-value attribute. 
            If you will always set value by javascript, no need to overwrite it
            */
            return str;
        },

        /**
         Sets value of input.
         
         @method value2input(value) 
         @param {mixed} value
        **/
        value2input: function (value) {
            if (!value) {
                return;
            }
            this.$input.filter('[name="landmark"]').val(value.landmark.trim());
            this.$input.filter('[name="street"]').val(value.streetNumber.trim());
            this.$input.filter('[name="building"]').val(value.houseNumber.trim());
            this.$input.filter('[name="city"]').val(value.city.trim());
            this.$input.filter('[name="state"]').val(value.state.trim());
            this.$input.filter('[name="country"]').val(value.country.trim());
            this.$input.filter('[name="pin"]').val(value.pin.trim());
        },

        /**
         Returns value of input.
         
         @method input2value() 
        **/
        input2value: function () {
            return {
                landmark: this.$input.filter('[name="landmark"]').val().trim(),
                streetNumber: this.$input.filter('[name="street"]').val().trim(),
                houseNumber: this.$input.filter('[name="building"]').val().trim(),
                city: this.$input.filter('[name="city"]').val().trim(),
                state: this.$input.filter('[name="state"]').val().trim(),
                country: this.$input.filter('[name="country"]').val().trim(),
                pin: this.$input.filter('[name="pin"]').val().trim()
            };
        },

        /**
        Activates input: sets focus on the first field.
        
        @method activate() 
       **/
        activate: function () {
            this.$input.filter('[name="landmark"]').focus();
        },

        /**
         Attaches handler to submit form in case of 'showbuttons=false' mode
         
         @method autosubmit() 
        **/
        autosubmit: function () {
            this.$input.keydown(function (e) {
                if (e.which === 13) {
                    $(this).closest('form').submit();
                }
            });
        }
    });

    Address.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        tpl: '<div class="editable-address"><label><span>Building: </span><input type="text" name="building"></label></div>' +
            '<div class="editable-address"><label><span>Street: </span><input type="text" name="street"></label></div>' +
            '<div class="editable-address"><label><span>Landmark: </span><input type="text" name="landmark"></label></div>' +
            '<div class="editable-address"><label><span>City: </span><input type="text" name="city"></label></div>' +
            '<div class="editable-address"><label><span>State: </span><input type="text" name="state"></label></div>' +
            '<div class="editable-address"><label><span>Country: </span><input type="text" name="country"></label></div>' +
            '<div class="editable-address"><label><span>Pin: </span><input type="text" name="pin"></label></div>',



        inputclass: ''
    });

    $.fn.editabletypes.address = Address;

}(window.jQuery));



$('#btnedit').click(function (e) {
    $('#txtaddress').editable('toggleDisabled');
    $('#b_txtaddress').editable('toggleDisabled');
    $('#o_txtaddress').editable('toggleDisabled');


    $('#updateProf').removeClass("hidden");
    $('#btnedit').addClass("hidden");
});

//console.log(searcharr)
