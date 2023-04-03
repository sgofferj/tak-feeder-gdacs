const {cot, proto} = require('@vidterra/tak.js')
const uuid = require('uuid');

var myCallsign="GDACS";
var myType="a-f-G-U";
const myUID = (typeof process.env.UUID !== 'undefined') ? process.env.UUID : uuid.v4();

module.exports.heartbeatcot = (stale) => {
    const dt = Date.now();
    const dtD = new Date(dt).toISOString();
    const dtDs = new Date(dt + (3 * stale * 1000)).toISOString();

    let packet = {
        "event": {
            "_attributes": {
                "version": "2.0",
                "uid": myUID,
                "type": myType,
                "how": "h-g-i-g-o",
                "time": dtD,
                "start": dtD,
                "stale": dtDs,
            },
            "point": {
                "_attributes": {
                    "lat": "0.000000",
                    "lon": "0.000000",
                    "hae": "9999999.0",
                    "ce": "9999999.0",
                    "le": "9999999.0"
                }
            },
            "detail": {
                "takv": {
                    "_attributes":{
                        "os":"Docker",
                        "device":"Server",
                        "version":"1",
                        "platform":"NodeJS GDACS feeder"
                    }
                },
                "contact": {
                    "_attributes": {
                        "callsign": myCallsign,
                        "endpoint": "*:-1:stcp"
                    }
                },
                "uid": { "_attributes": { "Droid": myCallsign } },
                "precisionlocation": { "_attributes": { "altsrc": "GPS","geopointsrc":"GPS" } },
                "track": { "_attributes": { "course": "0","speed":"0" } },
                "__group": { "_attributes": { "role": "Server","name":"Blue" } },
            }
        }
    }
    return cot.js2xml(packet);
}


module.exports.gdacs2cot = (msg,stale) => {
    const dt = Date.now();
    const dtD = new Date(dt).toISOString();
    const dtDs = new Date(dt + (3 * stale * 1000)).toISOString();

    let latitude = msg['geo:point']['geo:lat']['#'];
    let longitude = msg['geo:point']['geo:long']['#'];
    let color = -1;
    let icon = "icon";
    let prodTime = msg['pubDate'].toISOString();
    let remarks = msg['pubDate']+"\n"+msg['description']+"\n"+msg['link']+"\n";
    remarks += "#GDACS";
    let area = msg['gdacs:severity']['@']['value'];
    let ce = Math.sqrt(area/Math.PI) * 1000;
    let alertlevel = msg['gdacs:alertlevel']['#'];
    let eventtype = msg['gdacs:eventtype']['#'];
    let uid = "gdacs-" + alertlevel + "-" + msg.guid;
    uid = uid.toLowerCase();
    let callsign = uid.toUpperCase();

    switch(alertlevel) {
        case 'Green':
            color = -16711936;
            break;
        case 'Orange':
            color = -35072;
            break;
        case 'Red':
            color = -65535;
            break;
        default:
            color = -1;
    }
    
    switch(eventtype) {
      case 'WF':
          icon = "ad78aafb-83a6-4c07-b2b9-a897a8b6a38f/Shapes/firedept.png"
        break;  
      case 'DR':
          icon = "ad78aafb-83a6-4c07-b2b9-a897a8b6a38f/Shapes/sunny.png"
        break;
      case 'EQ':
          icon = "ad78aafb-83a6-4c07-b2b9-a897a8b6a38f/Shapes/earthquake.png"
        break;
      case 'TC':
          icon = "ad78aafb-83a6-4c07-b2b9-a897a8b6a38f/Shapes/thunderstorm.png"
          break;
      case 'FL':
          icon = "ad78aafb-83a6-4c07-b2b9-a897a8b6a38f/Shapes/water.png"
          break;
      default:
          icon = "ad78aafb-83a6-4c07-b2b9-a897a8b6a38f/Shapes/caution.png"
    }

    let packet = {
        "event": {
            "_attributes": {
                "version": "2.0",
                "uid": uid,
                "type": "a-o-G",
                "how": "m-r",
                "time": dtD,
                "start": dtD,
                "stale": dtDs,
                "qos": "5-r-d"
            },
            "point": {
                "_attributes": {
                    "lat": latitude,
                    "lon": longitude,
                    "hae": 0.0,
                    "ce": ce,
                    "le": 0.0
                }
            },
            "detail": {
                "contact": {
                    "_attributes": {
                        "callsign": callsign
                    }
                },
                "precisionlocation": { "_attributes": { "altsrc": "DTED0" } },
                "color": { "_attributes": { "argb": color }},
                "link": { "_attributes": { "uid": myUID, "production_time": prodTime, "type": myType, "parent_callsign": myCallsign, "relation":"p-p" }},
                "usericon": { "_attributes": { "iconsetpath": icon }},
                "remarks": remarks,
            }
        }
    }
    return cot.js2xml(packet);
}