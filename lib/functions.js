const {cot, proto} = require('@vidterra/tak.js')
const uuid = require('uuid');

var myCallsign="GDACS";
var myType="a-f-G-U";
const myUID = (typeof process.env.UUID !== 'undefined') ? process.env.UUID : uuid.v4();


module.exports.gdacs2cot = (msg) => {
    const dt = Date.now();
    const dtD = new Date(dt).toISOString();
    const dtDs = new Date(dt + 600 * 1000).toISOString();

    let uid = "GDACS-" + msg.guid;
    let callsign = "GDACS[" + msg.guid + "]";

    let latitude = msg['geo:point']['geo:lat']['#'];
    let longitude = msg['geo:point']['geo:long']['#'];
    let color = -1;
    let icon = "icon";
    let remarks = msg['pubDate']+"\n"+msg['description']+"\n"+msg['link']+"\n";
    remarks += "#GDACS";
    let area = msg['gdacs:severity']['@']['value'];
    let ce = Math.sqrt(area/Math.PI) * 1e6;
    let alertlevel = msg['gdacs:alertlevel']['#'];
    let eventtype = msg['gdacs:eventtype']['#'];
    console.log(eventtype);

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
                "type": "a-u-G",
                "how": "m-g",
                "time": dtD,
                "start": dtD,
                "stale": dtDs
            },
            "point": {
                "_attributes": {
                    "lat": latitude,
                    "lon": longitude,
                    "hae": 0,
                    "ce": ce,
                    "le": "9999999.0"
                }
            },
            "detail": {
                "status": { "_attributes": { "readiness": "true" } },
                "archive":"",
                "contact": {
                    "_attributes": {
                        "callsign": callsign
                    }
                },
                "uid": { "_attributes": { "Droid": uid } },
                "precisionlocation": { "_attributes": { "altsrc": "DTED0" } },
                "color": { "_attributes": { "argb": color }},
                "link": { "_attributes": { "uid": myUID, "production_time": dtD, "type": myType, "parent_callsign": myCallsign, "relation":"p-p" }},
                "usericon": { "_attributes": { "iconsetpath": icon }},
                "remarks": remarks,
            }
        }
    }
    return cot.js2xml(packet);
}