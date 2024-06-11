'use strict';
const crypto = require('crypto');
// Must be 256 bits (32 characters)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
// Must be 16 character for AES-256-CBC
const ivString = process.env.IV_STRING;

function encryption(data) {
    try {
        var clearEncoding = 'utf8';
        var cipherEncoding = 'base64';
        var cipherChunks = [];
        let enKey = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('hex').substr(0, 32).toUpperCase();
        let iv = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('hex').substr(0, 16).toUpperCase();
        var cipher = crypto.createCipheriv('aes-256-cbc', enKey, iv);
        cipher.setAutoPadding(true);
        cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding));
        cipherChunks.push(cipher.final(cipherEncoding));
        return cipherChunks.join('');
    }
    catch (ex) {
        return ex;
    }
}
function decryption(data) {
    let enKey = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('hex').substr(0, 32).toUpperCase();
    let iv = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('hex').substr(0, 16).toUpperCase();
    var decipher = crypto.createDecipheriv("aes-256-cbc", enKey, iv);
    var decrypted = decipher.update(data, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

function encrypt(text) {
    text = text.toString();
    let iv = Buffer.from(ivString);
    let cipher = crypto.createCipheriv(
        'aes-256-cbc',
        Buffer.from(ENCRYPTION_KEY),
        iv
    );
    let encrypted = cipher.update(text);

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    if (!text) return text;

    // Backward compatibilty
    // If a non-encrypted string is being decrypted, function throws an error
    // In that case, we simply want to return the string
    try {
        let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv(
            'aes-256-cbc',
            Buffer.from(ENCRYPTION_KEY),
            iv
        );
        let decrypted = decipher.update(encryptedText);

        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString();
    } catch (error) {
        return text;
    }
}

module.exports = { decrypt, encrypt, encryption, decryption };
