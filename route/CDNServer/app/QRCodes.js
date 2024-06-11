var users = []
var QRCodes = []

const QR_addUser = ({ id, QRCode, truID, room }) => {
    // name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();
    const existingUser = users.find((user) => user.room === room && user.truID === truID);
    if (!QRCode || !room || !truID) return { error: 'Username and room are required.' };
    if (existingUser) {
        var rmusers = users.find((user) => user.id === existingUser.id)
        const index = users.findIndex((user) => user.id === existingUser.id);
        const codeindex = QRCodes.findIndex(code => code.truID === rmusers.truID)
        if (codeindex >= 0) { QRCodes.splice(codeindex, 1) }
        if (index >= 0) { users.splice(index, 1) };
        console.log("afterDeleteusers", users)
        console.log("afterDeleteQRCodes", QRCodes)

    };
    const user = { id, room, truID, QRCode };
    // const index = QRCodes.findIndex(code => code.truID === truID)
    // if (index !== -1) {
    //     QRCodes.splice(index, 1)[0]
    // }
    const code = { QRCode, truID };
    users.push(user);
    QRCodes.push(code);
    console.log("users", users)
    console.log("QRCodes", QRCodes)
    return { user };
}
const QR_getUser = (id, code) => users.find((user) => user.truID === id && user.QRCode === code);
const QR_Verify = (qrcode) => {
    // console.log("QRCodes", qrcode)
    const index = QRCodes.findIndex(code => code.QRCode === qrcode)
    if (index !== -1) {
        QRCodes.splice(index, 1)[0]
        return true;
    }
    else {
        return false;
    }
};
const QR_removeUser = (id) => {
    var rmusers = users.find((user) => user.id === id)
    const index = users.findIndex((user) => user.id === id);
    const codeindex = QRCodes.findIndex(code => code.truID === rmusers.truID)
    if (codeindex !== -1) {
        QRCodes.splice(codeindex, 1)[0]
    }
    if (index !== -1) return users.splice(index, 1)[0];
}
module.exports = { QR_addUser, QR_getUser, QR_removeUser, QR_Verify };