module.exports = {
    isEmailValid: function (email, callback) {
        var emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
        if (!email) {
            callback(true);
        }
        else if (email.length > 254) {
            callback(false);
        }
        else {
            var valid = emailRegex.test(email);
            if (!valid) {
                callback(false);
            }
            else {
                callback(true);
            }
        }
    },
    isValidDate: function (subject,callback) {
        if (!subject) {
            callback(true);
        }
        else if (subject.match(/^(?:(0[1-9]|1[012])[\- \/.](0[1-9]|[12][0-9]|3[01])[\- \/.](19|20)[0-9]{2})$/)) {
            callback(true);
        } else {
            callback(false);
        }
    }
}

