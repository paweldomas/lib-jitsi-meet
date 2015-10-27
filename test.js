



Strophe.log = function (level, msg) {
    switch (level) {
        case Strophe.LogLevel.WARN:
            console.warn("Strophe: " + msg);
            break;
        case Strophe.LogLevel.ERROR:
        case Strophe.LogLevel.FATAL:
            console.error("Strophe: " + msg);
            break;
    }
};


var options = {
    hosts: {
        domain: 'pawel.jitsi.net',
        //anonymousdomain: 'guest.example.com',
//        anonymousdomain: 'guest.hristo.jitsi.net',
        muc: 'conference.pawel.jitsi.net', // FIXME: use XEP-0030
        bridge: 'jitsi-videobridge.pawel.jitsi.net', // FIXME: use XEP-0030
        //jirecon: 'jirecon.jitsi-meet.example.com',
        //call_control: 'callcontrol.jitsi-meet.example.com',
        //focus: 'focus.jitsi-meet.example.com' - defaults to 'focus.jitsi-meet.example.com'
    },
    bosh: '//pawel.jitsi.net/http-bind', // FIXME: use xep-0156 for that
    clientNode: 'http://jitsi.org/jitsimeet', // The name of client node advertised in XEP-0115 'c' stanza
};
var options2 = {
    hosts: {
        domain: 'guest.jit.si',
        //anonymousdomain: 'guest.example.com',
//        anonymousdomain: 'guest.hristo.jitsi.net',
        muc: 'meet.jit.si', // FIXME: use XEP-0030
        bridge: 'jitsi-videobridge.lambada.jitsi.net', // FIXME: use XEP-0030
        //jirecon: 'jirecon.jitsi-meet.example.com',
        //call_control: 'callcontrol.jitsi-meet.example.com',
        //focus: 'focus.jitsi-meet.example.com' - defaults to 'focus.jitsi-meet.example.com'
    },
    bosh: '//meet.jit.si/http-bind', // FIXME: use xep-0156 for that
    clientNode: 'http://jitsi.org/jitsimeet', // The name of client node advertised in XEP-0115 'c' stanza
};

var APP_ID = "app";
var APP_SECRET = "secret";
var roomName = "testroom1234";
var ts = new Date().getTime();

var token = JitsiMeetJS.generateToken(roomName, ts, APP_ID, APP_SECRET);

var connection = new JitsiMeetJS.JitsiConnection(APP_ID, token, options);
//var connection2 = new JitsiMeetJS.JitsiConnection(null, null, options2);


var success = function(){
    console.log("success!");
    var room = connection.initJitsiConference(roomName);
    /*room.createLocalTracks().then(function(streams)
    {
        console.log(streams);
    });*/
    room.join();

};
var fail = function(){console.log("fail!")};
var disconnect = function(){
    console.log("disconnect!");
    connection.removeEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, success);
    connection.removeEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, fail);
    connection.removeEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, disconnect);
};
connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, success);
connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, fail);
connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, disconnect);

var connectOptions = {
};

connection.connect(connectOptions);

//connection2.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, success);
//connection2.addEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, fail);
//connection2.addEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, disconnect);
//
//connection2.connect();



