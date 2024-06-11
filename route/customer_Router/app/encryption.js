const cryptos = require("crypto");
module.exports = {
    encryption: function (data, key) {
        try {
            var clearEncoding = 'utf8';
            var cipherEncoding = 'base64';
            var cipherChunks = [];
            let enKey = cryptos.createHash('sha256').update(String(key)).digest('hex').substr(0, 32).toUpperCase();
            let iv = cryptos.createHash('sha256').update(String(key)).digest('hex').substr(0, 16).toUpperCase();
            var cipher = cryptos.createCipheriv('aes-256-cbc', enKey, iv);
            cipher.setAutoPadding(true);
            cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding));
            cipherChunks.push(cipher.final(cipherEncoding));
            return cipherChunks.join('');
        }
        catch (ex) {
            return "0";
        }
    },
}
