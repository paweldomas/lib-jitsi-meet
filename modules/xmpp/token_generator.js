//var jsjws = require('jsjws');

var KJUR = require('jsrsasign');

console.info("JWS: ", KJUR);

module.exports = {

    getXmppLogin: function (roomName, timeStamp) {
        return roomName + "_" + timeStamp;
    },
    generateToken: function (roomName, ts, appId, appSecret) {

        // Header
        var oHeader = {
            alg: 'HS256',
            typ: 'JWT'
        };

        // Payload
        var oPayload = {
            iss: 'app',
            room: 'room',
            nbf: KJUR.jws.IntDate.get('now'),
            exp: KJUR.jws.IntDate.get('now + 1day')
        };

        // Sign JWT, password=secret
        var sHeader = JSON.stringify(oHeader);
        var sPayload = JSON.stringify(oPayload);
        var sJWT = KJUR.jws.JWS.sign(null, sHeader, sPayload, "secret");

        console.info("Token: " + sJWT);

        return sJWT;
    }
};