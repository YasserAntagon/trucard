function encrypt(text) {
    var key = passwordDeriveBytes(password, '', 100, 32); // How it is
    var cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.from(iv));
    var part1 = cipher.update(text, 'utf8');
    var part2 = cipher.final();
    var encrypted = Buffer.concat([part1, part2]).toString('base64');
    return encrypted;
}
function decrypt(encrypted) {
    try {
        var key = passwordDeriveBytes(password, '', 100, 32); // How it is
        var decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv));
        var decrypted = decipher.update(encrypted, 'base64', 'utf8');
        decrypted += decipher.final();
        return isObject(JSON.parse(decrypted)) ? JSON.parse(decrypted) : JSON.parse(JSON.parse(decrypted));
    } catch (ex) {
        console.log(ex)
        return "";
    }

}