$(document).ready(function () {
    //called when key is pressed in textbox
    $(".cashdisable").keypress(function (e) // only number & one Decimal allowed
    {
        // only number 
        if (e.which != 8 && (e.which != 46 || $(this).val().indexOf('.') != -1) && e.which != 0 && e.which != 13 && (e.which < 48 || e.which > 57)) {
            //display error message
            return false;
        }
    });




    // Buy/Redeem
    $(".numeric").keypress(function (e) {

        var charCode = (e.which) ? e.which : e.keyCode
        if (charCode != 8 && charCode != 0 && charCode != 13 &&
            (charCode != 46 || $(this).val().indexOf('.') != -1) &&      // “.” CHECK DOT, AND ONLY ONE.
            (charCode < 48 || charCode > 57))
            return false;

        return true;
    });

    // number with only 2 decimal point accepted.
    $('.numericwith2decimal').on('keypress', function (event) {
        if ((event.which != 46 || $(this).val().indexOf('.') != -1) && (event.which < 48 || event.which > 57)) {
            event.preventDefault();
        }
        var input = $(this).val();
        if ((input.indexOf('.') != -1) && (input.substring(input.indexOf('.')).length > 2)) {
            event.preventDefault();
        }
    });

    // Add in PinCode/
    $(".number").keypress(function (e) {  
        //if the letter is not digit then display error and don't type anything
        if (e.which != 8 && e.which != 0 && e.which != 13 && (e.which < 48 || e.which > 57) || (e.which == 127)) {
            //display error message
            return false;
        }
    });

    $(".numberdash").keypress(function (e) {  
        //if the letter is not digit then display error and don't type anything
        if (e.which != 8 && e.which != 0 && e.which != 13 && (e.which < 48 || e.which > 57) || (e.which == 127) || (e.which == 45)) {
            //display error message
            return false;
        }
    });

    //Add in CountryCode
    $(".ccode").keypress(function (e) {
        //if the letter is not digit then display error and don't type anything
        if (e.which != 8 && e.which != 0 && e.which != 13 && (e.which < 48 || e.which > 57) && (e.which != 43)) {
            //display error message
            return false;
        }
    });

    //Add in Mobile
    $(".mob").keypress(function (e) {  
        //if the letter is not digit then display error and don't type anything
        if (e.which != 8 && e.which != 0 && e.which != 13 && (e.which < 48 || e.which > 57)) {
            //display error message
            return false;
        }
    });

    //Add in City/State/Country
    $(".alpha").keypress(function (e) {  
        var keyCode = (e.which) ? e.which : e.keyCode
        if (((keyCode >= 65) && (keyCode <= 90)) || ((keyCode >= 97) && (keyCode <= 122)) || (keyCode == 8) || (keyCode == 32) || (keyCode == 11) || (keyCode == 09)) {
            return true;
        } else {
            return false;
        }
    });

    $(".alphanum").keypress(function (e) {  
        var keyCode = (e.which) ? e.which : e.keyCode
        //Capital,Small,Number,Dot,Underscore
        if (((keyCode >= 65) && (keyCode <= 90)) || ((keyCode >= 48) && (keyCode <= 57)) || ((keyCode >= 97) && (keyCode <= 122)) || (keyCode == 8) || (keyCode == 11) || (keyCode == 09) || (keyCode == 127) || (keyCode == 95) || (keyCode == 46)) {
            return true;
        } else {

            return false;
        }
    });

    //Add in IFSC code
    $(".alphasnum").keypress(function (e) {
        var keyCode = (e.which) ? e.which : e.keyCode
        //Capital,Number
        if (((keyCode >= 48) && (keyCode <= 57)) || ((keyCode >= 65) && (keyCode <= 90)) || (keyCode == 8) || (keyCode == 11) || (keyCode == 09) || (keyCode == 127) || (keyCode == 13)) {
            return true;
        } else {

            return false;
        }
    });

    $(".alphanume").keypress(function (e) {  
        var keyCode = (e.which) ? e.which : e.keyCode

        if (((keyCode >= 65) && (keyCode <= 90)) || ((keyCode >= 48) && (keyCode <= 57)) || ((keyCode >= 97) && (keyCode <= 122)) || (keyCode == 8) || (keyCode == 11) || (keyCode == 13) || (keyCode == 09) || (keyCode == 39)) {
            return true;
        } else {

            return false;
        }
    });

    //AssetManagerName/FirstName/Middle Name/LastName/Node/Branch
    $(".aplhanumspace").keypress(function (e) {  
        var keyCode = (e.which) ? e.which : e.keyCode
        //Capital,Small,Number,Space
        if (((keyCode >= 65) && (keyCode <= 90)) || ((keyCode >= 48) && (keyCode <= 57)) || ((keyCode >= 97) && (keyCode <= 122)) || (keyCode == 8) || (keyCode == 32) || (keyCode == 11) || (keyCode == 13) || (keyCode == 09) || (keyCode == 127)) {
            return true;
        }
        else {
            return false;
        }
    });
    $(".aplhanumspaceDot").keypress(function (e) {  
        var keyCode = (e.which) ? e.which : e.keyCode
        //Capital,Small,Number,Space
        if (((keyCode >= 65) && (keyCode <= 90)) || ((keyCode >= 48) && (keyCode <= 57)) || ((keyCode >= 97) && (keyCode <= 122)) || (keyCode == 8) || (keyCode == 32) || (keyCode == 11) || (keyCode == 13) || (keyCode == 09) || (keyCode == 127) || (keyCode == 46)) {
            return true;
        }
        else {
            return false;
        }
    });

    //Add in Password/Confirm Password
    $(".password").keypress(function (e) {
        var keyCode = (e.which) ? e.which : e.keyCode

        if (((keyCode >= 65) && (keyCode <= 90)) || ((keyCode >= 48) && (keyCode <= 57)) || ((keyCode >= 97) && (keyCode <= 122)) || ((keyCode >= 35) && (keyCode <= 38)) || ((keyCode >= 94) && (keyCode <= 96)) || (keyCode == 33) || (keyCode == 42) || (keyCode == 43) || (keyCode == 46) || (keyCode == 64) || (keyCode == 126) || (keyCode == 8) || (keyCode == 11) || (keyCode == 13) || (keyCode == 09) || (keyCode == 127)) {
            return true;
        }
        else {
            return false;
        }
    });

    $(".emailv").keypress(function (e) {  
        var keyCode = (e.which) ? e.which : e.keyCode

        if (((keyCode >= 65) && (keyCode <= 90)) || ((keyCode >= 48) && (keyCode <= 57)) || ((keyCode >= 97) && (keyCode <= 122)) || (keyCode == 8) || (keyCode == 11) || (keyCode == 09) || (keyCode == 50) || (keyCode == 190) || (keyCode == 173) || (keyCode == 39)) {
            return true;
        } else {

            return false;
        }
    });

    $('[data-type="adhaar-number"]').keypress(function () {
        var value = $(this).val();
        value = value.replace(/\D/g, "").split(/(?:([\d]{4}))/g).filter(s => s.length > 0).join("-");
        $(this).val(value);
    });

    $('[data-type="adhaar-number"]').on("change, blur", function () {
        var value = $(this).val();
        var maxLength = $(this).attr("maxLength");
        if (value.length != maxLength) {
            $(this).addClass("highlight-error");
        } else {
            $(this).removeClass("highlight-error");
        }
    });
});
function replaceWithX(str) {
    return str.replace(/.(?=.{4})/g, 'x');
}
function decimalChopper(num, fixed) {

    if (num && num != "NaN") {
        var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
        return num.toString().match(re)[0];
    }
    else {
        return 0
    }
}
function FormatDateToString(datef, format) {
    let date = new Date(datef);
    var day = date.getDate();
    var month = date.getMonth();

    var year = date.getFullYear();
    var monthNames = [
        "Jan", "Feb", "Mar",
        "Apr", "May", "Jun", "Jul",
        "Aug", "Sep", "Oct",
        "Nov", "Dec"
    ];
    if (format == 'mmm dd, yyyy') {
        return monthNames[month] + ' ' + ((day > 9) ? day : '0' + day) + ', ' + year;
    }
    if (format == 'ddmmyyyy') {
        month++;
        return ((day > 9) ? day : '0' + day) + '-' + ((month > 9) ? month : '0' + month) + '-' + year;
    }
    if (format == 'mmddyyyy') {
        month++;
        return ((month > 9) ? month : '0' + month) + '-' + ((day > 9) ? day : '0' + day) + '-' + year;
    }
    if (format == 'yyyy') {
        return year;
    }
    if (format == 'time') {
        var daysIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        var min = date.getMinutes();
        var sec = date.getSeconds();
        var hours = date.getHours();
        var days = date.getDay();
        return (daysIndex[days] + " " + monthNames[month] + ' ' + ((day > 9) ? day : '0' + day) + " " + ((hours > 9) ? hours : '0' + hours) + ":" + ((min > 9) ? min : '0' + min) + ":" + ((sec > 9) ? sec : '0' + sec) + " IST " + year);
    }
    if (format == 'newtime') {
        var daysIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        var min = date.getMinutes();
        var hours = date.getHours();
        var days = date.getDay();
        var hours12 = hours % 12;
        var hours = hours ? hours : 12; // the hour '0' should be '12'
        var ampm = hours >= 12 ? 'PM' : 'AM';


        return (monthNames[month] + ' ' + ((day > 9) ? day : '0' + day) + " "+year +" "+ ((hours > 9) ? hours12 : '0' + hours12) + ":" + ((min > 9) ? min : '0' + min)+ampm);
    }
}

//Add in Email
function validateEmail() {
    var email = $('txtmail').val(); //capture the value from the #id of email

    if (isEmail(email)) //Call the function to match the pattern
    {
        return true;
    }
    else {
        return false;
    }
}
function formatDOB(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var month = date.getMinutes();
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    /*    month = month < 12 ? '0'+month : month; */
    return month + 1 + "-" + date.getDate() + "-" + date.getFullYear();
}
function fMonth(date) {
    return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
}
function isEmail(email) {   //Define the pattern to validate the Email
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

function IsMobileNumber(txtMobId) {
    var mob = /^[1-9]{1}[0-9]{9}$/;
    if (mob.test(txtMobId) == false) {
        return false;
    }
    return true;
}
function allnumeric(inputtxt) {
    var numbers = /^[0-9]+$/;
    if (inputtxt.match(numbers)) {
        return true;
    }
    else {
        return false;
    }
}

function validatePhone(txtPhone) {
    var a = txtPhone;
    var filter = /^((\+[1-9]{1,4}[ \-]*)|(\([0-9]{2,3}\)[ \-]*)|([0-9]{2,4})[ \-]*)*?[0-9]{3,4}?[ \-]*[0-9]{3,4}?$/;
    if (filter.test(a)) {
        return true;
    }
    else {
        return false;
    }
}

function formatMonth(date) {
    var day = date.getDate();
    var year = date.getFullYear();
    var month = date.getMonth();
    return month + "-" + day + "-" + year;
}
function editDate(date) {
    var day = date.getDate();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    return day + "/" + month + "/" + year;
}
function getSortOrder(datef, format) {
    let date = new Date(datef);
    // var day = date.getDate();
    // var month = date.getMonth();
    // var year = date.getFullYear(); 
    // if (format == 'yyyymmdd') {
    //     month++;
    //     return year + ((month > 9) ? month : '0' + month) + ((day > 9) ? day : '0' + day);
    // }
    return Date.parse(date)
}
function _formatDate(datef, format) {
    let date = new Date(datef);
    var day = date.getDate();
    var month = date.getMonth();
    var year = date.getFullYear();
    var monthNames = [
        "Jan", "Feb", "Mar",
        "Apr", "May", "Jun", "Jul",
        "Aug", "Sep", "Oct",
        "Nov", "Dec"
    ];
    if (format == 'mmm dd, yyyy') {
        return monthNames[month] + ' ' + ((day > 9) ? day : '0' + day) + ', ' + year;
    }
    else if (format == 'ddmmyyyy') {
        month++;
        return ((day > 9) ? day : '0' + day) + '-' + ((month > 9) ? month : '0' + month) + '-' + year;
    }
    else if (format == 'mmddyyyy') {
        month++;
        return ((month > 9) ? month : '0' + month) + '-' + ((day > 9) ? day : '0' + day) + '-' + year;
    }
    else if (format == 'yyyy') {
        return year;
    }
    else if (format == 'time') {
        var daysIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        var min = date.getMinutes();
        var sec = date.getSeconds();
        var hours = date.getHours();
        var days = date.getDay();
        return (daysIndex[days] + " " + monthNames[month] + ' ' + ((day > 9) ? day : '0' + day) + " " + ((hours > 9) ? hours : '0' + hours) + ":" + ((min > 9) ? min : '0' + min) + ":" + ((sec > 9) ? sec : '0' + sec) + " IST " + year);
    }
    else if (format == 'timeshort') {
        var daysIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        var min = date.getMinutes();
        var sec = date.getSeconds();
        var hours = date.getHours();
        var days = date.getDay();
        return (((day > 9) ? day : '0' + day) + ' ' + monthNames[month] + " " + year + " " + hours + ":" + min + ":" + sec);
    }
    else if (format == 'timeshortAMPM') {
        var daysIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        var minutes = date.getMinutes();
        var sec = date.getSeconds();
        var hours = date.getHours();
        var days = date.getDay();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return (((day > 9) ? day : '0' + day) + ' ' + monthNames[month] + " " + year + " " + strTime);
    }
    else if (format == 'syncDate') {
        var daysIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        var min = datef.getMinutes();
        var sec = datef.getSeconds();
        var hours = datef.getHours();
        var days = datef.getDay();
        return (((day > 9) ? day : '0' + day) + ' ' + monthNames[month] + " " + year + " " + hours + ":" + min + ":" + sec);
    }
    else if (format == "format") {
        return date;
    }
}

function lbmaDate(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var month = date.getMonth() + 1;
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return date.getDate() + "/" + month + "/" + date.getFullYear() + "  " + strTime;
}

function formatMonthChart(date) {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var day = date.getDate();
    var year = date.getFullYear();
    var month = months[date.getMonth()];
    return month + "-" + year;
}

function formatDtChart(date) {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var day = date.getDate();
    var year = date.getFullYear();
    var month = months[date.getMonth()];
    return day + "-" + month + "-" + year;
}


function formatDt(date) {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var day = date.getDate();
    var year = date.getFullYear();
    var month = months[date.getMonth()];
    return day + "-" + month + "-" + year;
}



function checkIsEntity(num) {
    var res = num.substring(0, 4);
    if (res != "8000") {
        return false
    }
    return true
}

function Rs(amount) {
    var words = new Array();
    words[0] = 'Zero'; words[1] = 'One'; words[2] = 'Two'; words[3] = 'Three'; words[4] = 'Four'; words[5] = 'Five'; words[6] = 'Six'; words[7] = 'Seven'; words[8] = 'Eight'; words[9] = 'Nine'; words[10] = 'Ten'; words[11] = 'Eleven'; words[12] = 'Twelve'; words[13] = 'Thirteen'; words[14] = 'Fourteen'; words[15] = 'Fifteen'; words[16] = 'Sixteen'; words[17] = 'Seventeen'; words[18] = 'Eighteen'; words[19] = 'Nineteen'; words[20] = 'Twenty'; words[30] = 'Thirty'; words[40] = 'Forty'; words[50] = 'Fifty'; words[60] = 'Sixty'; words[70] = 'Seventy'; words[80] = 'Eighty'; words[90] = 'Ninety'; var op;
    amount = amount.toString();
    var atemp = amount.split('.');
    var number = atemp[0].split(',').join('');
    var n_length = number.length;
    var words_string = '';
    if (n_length <= 9) {
        var n_array = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
        var received_n_array = new Array();
        for (var i = 0; i < n_length; i++) {
            received_n_array[i] = number.substr(i, 1);
        }
        for (var i = 9 - n_length, j = 0; i < 9; i++, j++) {
            n_array[i] = received_n_array[j];
        }
        for (var i = 0, j = 1; i < 9; i++, j++) {
            if (i == 0 || i == 2 || i == 4 || i == 7) {
                if (n_array[i] == 1) {
                    n_array[j] = 10 + parseInt(n_array[j]);
                    n_array[i] = 0;
                }
            }
        }
        value = '';
        for (var i = 0; i < 9; i++) {
            if (i == 0 || i == 2 || i == 4 || i == 7) {
                value = n_array[i] * 10;
            } else {
                value = n_array[i];
            }
            if (value != 0) {
                words_string += words[value] + ' ';
            }
            if ((i == 1 && value != 0) || (i == 0 && value != 0 && n_array[i + 1] == 0)) {
                words_string += 'Crores ';
            }
            if ((i == 3 && value != 0) || (i == 2 && value != 0 && n_array[i + 1] == 0)) {
                words_string += 'Lakhs ';
            }
            if ((i == 5 && value != 0) || (i == 4 && value != 0 && n_array[i + 1] == 0)) {
                words_string += 'Thousand ';
            }
            if (i == 6 && value != 0 && (n_array[i + 1] != 0 && n_array[i + 2] != 0)) {
                words_string += 'Hundred and ';
            } else if (i == 6 && value != 0) {
                words_string += 'Hundred ';
            }
        }
        words_string = words_string.split(' ').join(' ');
    }
    return words_string;
}

function RsPaise(n,amt) {
    nums = n.toString().split('.')
    var whole = Rs(nums[0])
    if (nums[1] == null) nums[1] = 0;
    if (nums[1].length == 1) nums[1] = nums[1] + '0';
    if (nums[1].length > 2) { nums[1] = nums[1].substring(2, length - 1) }
    if (nums.length == 2) {
        if (nums[0] <= 9) { nums[0] = nums[0] * 10 } else { nums[0] = nums[0] };
        var fraction = Rs(nums[1])
        if (whole == '' && fraction == '') { op = 'Zero only'; }
        if (whole == '' && fraction != '') { op = 'paise ' + fraction + ' only'; }
        if (whole != '' && fraction == '') { op = 'Rupees ' + whole + ' only'; }
        if (whole != '' && fraction != '') { op = 'Rupees ' + whole + 'and paise ' + fraction + ' only'; } 
        if (amt > 999999999.99) { op = 'Oops!!! The amount is too big to convert'; }
        if (isNaN(amt) == true) { op = 'Error : Amount in number appears to be incorrect. Please Check.'; } 
        return op
    }
}
function inWords(input){
    return RsPaise(input,input)
}

function createFilename() {
    let date = new Date()
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    var minutes = date.getMinutes();
    var hours = date.getHours();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + '_' + minutes + ampm;
    return day + "_" + month + "_" + year + "_" + strTime;
}