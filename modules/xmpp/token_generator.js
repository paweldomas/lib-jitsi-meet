var jssha = require('jssha');

module.exports = {

    getXmppLogin: function (roomName, timeStamp) {
        return roomName + "_" + timeStamp;
    },
    generateToken: function (roomName, ts, appId, appSecret) {

        var hashInput = roomName + ts + appId + appSecret;

        console.info("Generating token for: " + hashInput);
        var token = (new jssha(hashInput, 'TEXT')).getHash('SHA-256', 'HEX');
        token = token + "_" + roomName + "_" + ts;
        console.info("Token: " + token);
        return token;
    }
};