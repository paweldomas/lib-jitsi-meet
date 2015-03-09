# Overview
Jitsi Meet supports logging to an [InfluxDB](http://influxdb.com/) database.

# Configuration
The following needs to be done to enable this functionality.

## Install InfluxDB
The details are outside the scope of the document, see http://influxdb.com/download/ .

## Enable logging for Jitsi Videobridge
Add the following properties to <code>/usr/share/jitsi-videobridge/.sip-communicator/sip-communicator.properties</code>.

###org.jitsi.videobridge.log.INFLUX\_DB\_ENABLED=true
###org.jitsi.videobridge.log.INFLUX\_URL\_BASE=http://influxdb.example.com:8086
###org.jitsi.videobridge.log.INFLUX\_DATABASE=jitsi_database
###org.jitsi.videobridge.log.INFLUX\_USER=user
###org.jitsi.videobridge.log.INFLUX\_PASS=pass

## Enable logging for Jicofo
Add the same properties as above to <code>/usr/share/jitsi-videobridge/.sip-communicator/sip-communicator.properties</code>.

## Enable logging for Jitsi Meet itself
Change "logStats" to "true" in <code>/etc/jitsi/meet/you-domain.config.js</code> or the <code>config.js</code> file used in your installation.

# User interface
You can explore the database using the [Jiloin](https://github.com/jitsi/jiloin) web interface.