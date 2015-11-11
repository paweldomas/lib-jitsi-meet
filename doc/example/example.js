//var options = {
//    hosts: {
//        domain: "prod-us-east-1-app-xmpp1.internal.meet.hipchat.ninja",
//        focus: "focus.prod-us-east-1-app-xmpp1.internal.meet.hipchat.ninja",
//        muc: "conference.prod-us-east-1-app-xmpp1.internal.meet.hipchat.ninja", // FIXME: use XEP-0030
//    },
//    bosh: "https://xmpp1-meet.hipchat.me/http-bind", // FIXME: use xep-0156 for that
//    clientNode: "http://prod-us-east-1-app-xmpp1.internal.meet.hipchat.ninja/jitsimeet" // The name of client node advertised in XEP-0115 'c' stanza
//};

var options = {
    hosts: {
        domain: 'pawel.jitsi.net',
        muc: 'conference.pawel.jitsi.net', // FIXME: use XEP-0030
        bridge: 'jitsi-videobridge.pawel.jitsi.net', // FIXME: use XEP-0030
    },
    bosh: '//pawel.jitsi.net/http-bind', // FIXME: use xep-0156 for that
    clientNode: 'http://jitsi.org/jitsimeet', // The name of client node advertised in XEP-0115 'c' stanza
}

var confOptions = {
    openSctp: true
}

var APP_ID = "app";
var APP_SECRET = "secret";
var roomName = "testroom1234";
var ts = new Date().getTime();

var token = JitsiMeetJS.generateToken(roomName, ts, APP_ID, APP_SECRET);


var isJoined = false;

/**
 * Handles local tracks.
 * @param tracks Array with JitsiTrack objects
 */
function onLocalTracks(tracks)
{
    localTracks = tracks;
    for(var i = 0; i < localTracks.length; i++)
    {
        localTracks[i].addEventListener(JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
            function (audioLevel) {
                console.log("Audio Level local: " + audioLevel);
            });
        localTracks[i].addEventListener(JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
            function () {
                console.log("local track muted");
            });
        localTracks[i].addEventListener(JitsiMeetJS.events.track.TRACK_STOPPED,
            function () {
                console.log("local track stoped");
            });
        if(localTracks[i].getType() == "video") {
            $("body").append("<video autoplay='1' id='localVideo" + i + "' />");
            localTracks[i].attach($("#localVideo" + i ));
        } else {
            $("body").append("<audio autoplay='1' muted='true' id='localAudio" + i + "' />");
            localTracks[i].attach($("#localAudio" + i ));
        }
        if(isJoined)
            room.addTrack(localTracks[i]);
    }
}

/**
 * Handles remote tracks
 * @param track JitsiTrack object
 */
function onRemoteTrack(track) {
    if(track.isLocal())
        return;
    var participant = track.getParticipantId();
    if(!remoteTracks[participant])
        remoteTracks[participant] = [];
    var idx = remoteTracks[participant].push(track);
    track.addEventListener(JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
        function (audioLevel) {
            console.log("Audio Level remote: " + audioLevel);
        });
    track.addEventListener(JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
        function () {
            console.log("remote track muted");
        });
    track.addEventListener(JitsiMeetJS.events.track.TRACK_STOPPED,
        function () {
            console.log("remote track stoped");
        });
    var id = participant + track.getType() + idx;
    if(track.getType() == "video") {
        $("body").append("<video autoplay='1' id='" + participant + "video" + idx + "' />");
    } else {
        $("body").append("<audio autoplay='1' id='" + participant + "audio" + idx + "' />");
    }
    track.attach($("#" + id));
}

/**
 * That function is executed when the conference is joined
 */
function onConferenceJoined () {
    console.log("conference joined!");
    isJoined = true;
    for(var i = 0; i < localTracks.length; i++)
        room.addTrack(localTracks[i]);
}

function onUserLeft(id) {
    console.log("user left");
    if(!remoteTracks[id])
        return;
    var tracks = remoteTracks[id];
    for(var i = 0; i< tracks.length; i++)
        tracks[i].detach($("#" + id + tracks[i].getType()))
}

/**
 * That function is called when connection is established successfully
 */
function onConnectionSuccess(){
    room = connection.initJitsiConference(roomName, confOptions);
    room.on(JitsiMeetJS.events.conference.TRACK_ADDED, onRemoteTrack);
    room.on(JitsiMeetJS.events.conference.TRACK_REMOVED, function (track) {
        console.log("track removed!!!" + track);
    });
    room.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED, onConferenceJoined);
    room.on(JitsiMeetJS.events.conference.USER_JOINED, function(id){ console.log("user join");remoteTracks[id] = [];});
    room.on(JitsiMeetJS.events.conference.USER_LEFT, onUserLeft);
    room.on(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, function (track) {
        console.log(track.getType() + " - " + track.isMuted());
    });
    room.on(JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED, function (userID, displayName) {
        console.log(userID + " - " + displayName);
    });
    room.on(JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED,
      function(userID, audioLevel){
          console.log(userID + " - " + audioLevel);
      });
    room.on(JitsiMeetJS.events.conference.RECORDING_STATE_CHANGED, function () {
        console.log(room.isRecordingSupported() + " - " +
            room.getRecordingState() + " - " +
            room.getRecordingURL());
    });
    room.on(JitsiMeetJS.events.conference.PHONE_NUMBER_CHANGED, function () {
        console.log(
            room.getPhoneNumber() + " - " +
            room.getPhonePin());
    });
    room.join();
};

/**
 * This function is called when the connection fail.
 */
function onConnectionFailed(msg1, msg2){console.error("Connection Failed!", msg1, msg2)};

/**
 * This function is called when we disconnect.
 */
function disconnect(){
    console.log("disconnect!");
    connection.removeEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, onConnectionSuccess);
    connection.removeEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, onConnectionFailed);
    connection.removeEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, disconnect);
}

function unload() {
    for(var i = 0; i < localTracks.length; i++)
        localTracks[i].stop();
    room.leave();
    connection.disconnect();
}
var isVideo = true;
function switchVideo() {
    isVideo = !isVideo;
    if(localTracks[1]) {
        localTracks[1].stop();
        localTracks.pop();
    }
    JitsiMeetJS.createLocalTracks({devices: isVideo? ["video"] : ["desktop"]}).
        then(function (tracks) {
            localTracks.push(tracks[0]);
            localTracks[1].addEventListener(JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
                function () {
                    console.log("local track muted");
                });
            localTracks[1].addEventListener(JitsiMeetJS.events.track.TRACK_STOPPED,
                function () {
                    console.log("local track stoped");
                });
            localTracks[1].attach($("#localVideo1"));
            room.addTrack(localTracks[1]);
        }).catch(function (error) {
            console.log(error);
        });
}

$(window).bind('beforeunload', unload);
$(window).bind('unload', unload);



JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.TRACE);
var initOptions = {
    disableAudioLevels: true,
    // Desktop sharing method. Can be set to 'ext', 'webrtc' or false to disable.
    desktopSharingChromeMethod: 'ext',
    // The ID of the jidesha extension for Chrome.
    desktopSharingChromeExtId: 'mbocklcggfhnbahlnepmldehdhpjfcjp',
    // The media sources to use when using screen sharing with the Chrome
    // extension.
    desktopSharingChromeSources: ['screen', 'window'],
    // Required version of Chrome extension
    desktopSharingChromeMinExtVersion: '0.1',

    // The ID of the jidesha extension for Firefox. If null, we assume that no
    // extension is required.
    desktopSharingFirefoxExtId: null,
    // Whether desktop sharing should be disabled on Firefox.
    desktopSharingFirefoxDisabled: true,
    // The maximum version of Firefox which requires a jidesha extension.
    // Example: if set to 41, we will require the extension for Firefox versions
    // up to and including 41. On Firefox 42 and higher, we will run without the
    // extension.
    // If set to -1, an extension will be required for all versions of Firefox.
    desktopSharingFirefoxMaxVersionExtRequired: -1,
    // The URL to the Firefox extension for desktop sharing.
    desktopSharingFirefoxExtensionURL: null
}
JitsiMeetJS.init(initOptions).then(function(){
    connection = new JitsiMeetJS.JitsiConnection(APP_ID, token, options);

    connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, onConnectionSuccess);
    connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, onConnectionFailed);
    connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, disconnect);

    connection.connect();
    JitsiMeetJS.createLocalTracks({devices: ["audio", "video"]}).
        then(onLocalTracks).catch(function (error) {
            console.log(error);
        });
}).catch(function (error) {
    console.log(error);
});

var connection = null;
var room = null;
var localTracks = [];
var remoteTracks = {};
